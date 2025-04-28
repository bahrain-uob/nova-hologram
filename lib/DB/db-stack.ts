import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class DBStack extends cdk.Stack {
  public readonly extractedTextTable: dynamodb.Table;
  public readonly qaTable: dynamodb.Table;
  public readonly collection: dynamodb.Table;
  public readonly book_file_description: dynamodb.Table;
  public readonly book: dynamodb.Table;
  public readonly chapter: dynamodb.Table;
  public readonly book_trailer: dynamodb.Table;
  public readonly chapter_trailer: dynamodb.Table;
  public readonly character: dynamodb.Table;
  public readonly reviews: dynamodb.Table;
  public readonly reader_books: dynamodb.Table;
  public readonly book_mark: dynamodb.Table;


  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.extractedTextTable = new dynamodb.Table(this, "ExtractedTextTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Table for storing Q&A data
    this.qaTable = new dynamodb.Table(this, 'QATable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // table for collections with PK:collection_id, attributes:col_name, created_at
    this.collection = new dynamodb.Table(this, 'collection', {
      partitionKey: { name: 'collection_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // table for the describtion of each book file with PK:book_file_id, SK:book_id
    // eg attributes:file size, file_pages,uploaded_at
    this.book_file_description = new dynamodb.Table(this, 'book_file_description', {
      partitionKey: { name: 'book_file_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'book_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // table for the books with PK:book_id, SK:user_id 
    this.book = new dynamodb.Table(this, 'book', {
      partitionKey: { name: 'book_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'user_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    // added to book table, global index with PK:collection_id
    this.book.addGlobalSecondaryIndex({
      indexName: 'Global_book1',
      partitionKey: { name: 'collection_id', type: dynamodb.AttributeType.NUMBER },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // table for the chapters with PK: chapter_id, SK: book_id 
    this.chapter = new dynamodb.Table(this, 'chapter', {
      partitionKey: { name: 'chapter_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'book_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // table for the books trailers with PK: trailer_id, SK: book_id 
    this.book_trailer = new dynamodb.Table(this, 'book_trailer', {
      partitionKey: { name: 'trailer_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'book_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // table for the chapters trailer with PK: trailer_id, SK: chapter_id 
    this.chapter_trailer = new dynamodb.Table(this, 'chapter_trailer', {
      partitionKey: { name: 'trailer_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'chapter_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // table for the characters with PK: character_id, SK: book_id 
    this.character = new dynamodb.Table(this, 'character', {
      partitionKey: { name: 'character_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'book_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // table for the book reviews with PK: reviews_id, SK: book_id 
    this.reviews = new dynamodb.Table(this, 'reviews', {
      partitionKey: { name: 'reviews_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'book_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    // added to reviews table, global index with PK:user_id
    this.reviews.addGlobalSecondaryIndex({
      indexName: 'Global_reviews',
      partitionKey: { name: 'user_id', type: dynamodb.AttributeType.NUMBER },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // table for the readers books with PK: reader_books_id, SK: user_id 
    this.reader_books = new dynamodb.Table(this, 'reader_books', {
      partitionKey: { name: 'reader_books_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'user_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    // added to reader books table, global index with PK:book_id
    this.reader_books.addGlobalSecondaryIndex({
      indexName: 'Global_reader_books',
      partitionKey: { name: 'book_id', type: dynamodb.AttributeType.NUMBER },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // table for the book marks with PK:book_mark_id, SK:book_id 
    this.book_mark = new dynamodb.Table(this, 'book_mark', {
      partitionKey: { name: 'book_mark_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'book_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    // added to book mark table, global index with PK:user_id
    this.book_mark.addGlobalSecondaryIndex({
      indexName: 'Global_book_mark',
      partitionKey: { name: 'user_id', type: dynamodb.AttributeType.NUMBER },
      projectionType: dynamodb.ProjectionType.ALL,
    });

  }
}
