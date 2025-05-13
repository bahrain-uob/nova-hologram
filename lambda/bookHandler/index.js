const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    const bookId = body.book_id ;
    const timestamp = new Date().toISOString();

    const item = {
      book_id: bookId,
      user_id: body.user_id,
      book_title: body.book_title,
      type: body.type,
      genre: body.genre || [],
      collection_id: body.collection ? Number(body.collection) : undefined,
      isbn: body.isbn,
      authors: body.authors || [],
      language: body.language,
      publisher: body.publisher || {},
      publication_year: body.publication_year,
      reading_level: body.reading_level,
      book_cover: body.book_cover || "", // Already uploaded to S3
      book_file: body.book_file || "",   // Already uploaded to S3
      book_summary: "",
      book_trailer: "",
      prompt: body.prompt || "",
      created_at: timestamp,
      updated_at: timestamp,
    };

    if (body.objectives) {
      item.objectives = body.objectives;
    }

    await dynamo.put({
      TableName: TABLE_NAME,
      Item: item
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Book metadata saved successfully", book_id: bookId })
    };

  } catch (err) {
    console.error("Error saving book metadata:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to save book metadata" })
    };
  }
};
