const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const lambda = new AWS.Lambda();
const sqs = new AWS.SQS();
const { v4: uuidv4 } = require('uuid');

const BOOK_TABLE = process.env.BOOK_TABLE;
const CHAPTER_TABLE = process.env.CHAPTER_TABLE;  // ✅ Add this env var in Lambda config!
const VIDEO_QUEUE_URL = process.env.VIDEO_QUEUE_URL;

exports.handler = async (event) => {
    try {
        const bookId = event.bookId || uuidv4();  // generate UUID if not provided
        const jobId = event.textractJobId;

        // 1. Extract text and split chapters
        const extractResp = await lambda.invoke({
            FunctionName: 'GetTextAndSplitChaptersLambda',
            Payload: JSON.stringify({ jobId })
        }).promise();
        const extractData = JSON.parse(extractResp.Payload);
        const { fullText, chapters } = extractData;

        // 2. Generate book summary
        const bookSummaryResp = await lambda.invoke({
            FunctionName: 'GenerateSummaryLambda',
            Payload: JSON.stringify({ prompt: fullText })
        }).promise();
        const bookSummary = JSON.parse(bookSummaryResp.Payload).summary;

        // 3. Generate chapter summaries
        for (const chapter of chapters) {
            const chapterSummaryResp = await lambda.invoke({
                FunctionName: 'GenerateSummaryLambda',
                Payload: JSON.stringify({ prompt: chapter.chapterText })
            }).promise();
            chapter.summary = JSON.parse(chapterSummaryResp.Payload).summary;
        }

        // 4. Generate book script
        const bookScriptResp = await lambda.invoke({
            FunctionName: 'GenerateScriptLambda',
            Payload: JSON.stringify({ prompt: bookSummary })
        }).promise();
        const bookScript = JSON.parse(bookScriptResp.Payload).script;

        // 5. Generate chapter scripts
        for (const chapter of chapters) {
            const chapterScriptResp = await lambda.invoke({
                FunctionName: 'GenerateScriptLambda',
                Payload: JSON.stringify({ prompt: chapter.summary })
            }).promise();
            chapter.script = JSON.parse(chapterScriptResp.Payload).script;
        }

        // ✅ 6a. Save BOOK to DynamoDB
        await dynamodb.put({
            TableName: BOOK_TABLE,
            Item: {
                book_id: bookId,
                title: event.title,
                author: event.author,
                publisher: event.publisher,
                published_date: event.publishedDate,
                genre: event.genre,
                type: event.type,
                summary: bookSummary,
                script: bookScript,
                book_video_status: 'PENDING',
                created_at: new Date().toISOString()
            }
        }).promise();

        // ✅ 6b. Save each CHAPTER to the chapter table
        for (const chapter of chapters) {
            const chapterId = uuidv4();
            await dynamodb.put({
                TableName: CHAPTER_TABLE,
                Item: {
                    chapter_id: chapterId,
                    book_id: bookId,
                    chapter_title: chapter.chapterTitle,
                    chapter_summary: chapter.summary,
                    chapter_script: chapter.script,
                    video_status: 'PENDING',
                    created_at: new Date().toISOString()
                }
            }).promise();
        }

        // ✅ 7. Send SQS messages for videos
        await sqs.sendMessage({
            QueueUrl: VIDEO_QUEUE_URL,
            MessageBody: JSON.stringify({
                bookId,
                type: 'book',
                script: bookScript
            })
        }).promise();

        for (const chapter of chapters) {
            await sqs.sendMessage({
                QueueUrl: VIDEO_QUEUE_URL,
                MessageBody: JSON.stringify({
                    bookId,
                    type: 'chapter',
                    chapterTitle: chapter.chapterTitle,
                    script: chapter.script
                })
            }).promise();
        }

        return { status: 'DONE', bookId };
    } catch (error) {
        console.error('Error in orchestration:', error);
        throw error;
    }
};
