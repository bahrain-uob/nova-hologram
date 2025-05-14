const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

const BOOK_TABLE = process.env.BOOKS_TABLE;
const CHAPTER_TABLE = process.env.CHAPTERS_TABLE;

function getSignedUrl(s3Path) {
  if (!s3Path || !s3Path.startsWith("s3://")) return null;

  const parts = s3Path.replace("s3://", "").split("/");
  const bucket = parts.shift();
  const key = parts.join("/");

  return s3.getSignedUrl("getObject", {
    Bucket: bucket,
    Key: key,
    Expires: 60 * 60, // 1 hour
  });
}

exports.handler = async (event) => {
  try {
    const bookId = event.pathParameters?.bookId;

    if (!bookId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing bookId in path parameters' }),
      };
    }

    // 1. Get book data using GSI_by_book_id
    const bookQuery = await dynamodb.query({
      TableName: BOOK_TABLE,
      IndexName: 'GSI_by_book_id',
      KeyConditionExpression: 'book_id = :bookId',
      ExpressionAttributeValues: {
        ':bookId': bookId,
      },
    }).promise();

    if (!bookQuery.Items || bookQuery.Items.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Book not found' }),
      };
    }

    const book = bookQuery.Items[0];
    const bookTrailerSignedUrl = getSignedUrl(book.book_trailer);

    // 2. Get chapter summaries
    const chapterQuery = await dynamodb.query({
      TableName: CHAPTER_TABLE,
      IndexName: 'Global_chapter_summary',
      KeyConditionExpression: 'book_id = :bookId',
      ExpressionAttributeValues: {
        ':bookId': bookId,
      },
    }).promise();

    const chapters = chapterQuery.Items.map(ch => ({
      chapter_id: ch.chapter_id,
      chapter_no: ch.chapter_no,
      summary: ch.summary,
      script: ch.script,
      trailer_status: ch.trailer_status,
      trailer: getSignedUrl(ch.trailer),
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({
        book: {
          summary: book.summary,
          script: book.script,
          trailer_status: book.trailer_status,
          trailer: bookTrailerSignedUrl, // Signed URL here!
        },
        chapters,
      }),
    };

  } catch (error) {
    console.error('Error in getBook Lambda:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
