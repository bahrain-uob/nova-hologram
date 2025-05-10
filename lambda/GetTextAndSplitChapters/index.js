const { TextractClient, GetDocumentTextDetectionCommand } = require("@aws-sdk/client-textract");

const textractClient = new TextractClient();

exports.handler = async (event) => {
    const jobId = event.jobId;
    let params = { JobId: jobId };
    let fullText = '';
    let response;

    try {
        do {
            const command = new GetDocumentTextDetectionCommand(params);
            response = await textractClient.send(command);

            response.Blocks.forEach(block => {
                if (block.BlockType === 'LINE' && block.Text) {
                    fullText += block.Text + '\n';
                }
            });

            params.NextToken = response.NextToken;
        } while (response.NextToken);

        // Remove “Activities” section if present
        fullText = fullText.replace(/Activities[\s\S]*$/i, '').trim();

        // Remove standalone page numbers (lines with only numbers)
        fullText = fullText.replace(/^\d+\s*$/gm, '');

        // Regex to match numbered or titled chapters
        const chapterRegex = /(chapter\s+\d+|prologue|epilogue|preface)/gi;

        // Use matchAll to get titles and positions
        const matches = [...fullText.matchAll(chapterRegex)];
        const chapters = [];

        if (matches.length > 0) {
            for (let i = 0; i < matches.length; i++) {
                const title = matches[i][0];
                const start = matches[i].index + title.length;
                const end = (i + 1 < matches.length) ? matches[i + 1].index : fullText.length;
                const text = fullText.slice(start, end).trim();

                chapters.push({
                    chapterTitle: title,
                    chapterText: text
                });
            }
        } else {
            chapters.push({
                chapterTitle: 'Full Text',
                chapterText: fullText
            });
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Chapters extracted successfully',
                chapters: chapters
            }),
        };
    } catch (error) {
        console.error('Error getting document text:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
