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
  public readonly user: dynamodb.Table;
  public readonly user_settings: dynamodb.Table;
  public readonly narrator: dynamodb.Table;
  public readonly typography: dynamodb.Table;
  public readonly languages: dynamodb.Table;
  public readonly reading_level: dynamodb.Table;
  public readonly reading_page: dynamodb.Table;
  public readonly page_report: dynamodb.Table;
  public readonly reading_progress: dynamodb.Table;
  public readonly highlights: dynamodb.Table;
  public readonly mark: dynamodb.Table;
  public readonly book_chatbot: dynamodb.Table;
  public readonly character_chatbot: dynamodb.Table;
  public readonly ai_chapter_summary: dynamodb.Table;
  public readonly chapter_summary: dynamodb.Table;
  public readonly ai_content_image: dynamodb.Table;
  public readonly book_listeners: dynamodb.Table;
  public readonly pronunciation_practice: dynamodb.Table;
  public readonly reading_session: dynamodb.Table;
  public readonly genre: dynamodb.Table;


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

    // table for users with PK: user_id
    this.user = new dynamodb.Table(this, 'user', {
      partitionKey: { name: 'user_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // table for user settings with PK: user_settings_id, SK: user_id
    this.user_settings = new dynamodb.Table(this, 'user_settings', {
      partitionKey: { name: 'user_settings_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'user_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // table for narrators with PK: narrator_id
    this.narrator = new dynamodb.Table(this, 'narrator', {
      partitionKey: { name: 'narrator_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // table for typography with PK: typo_id, SK: user_id
    this.typography = new dynamodb.Table(this, 'typography', {
      partitionKey: { name: 'typo_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'user_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // table for languages with PK: language_id
    this.languages = new dynamodb.Table(this, 'languages', {
      partitionKey: { name: 'language_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // table for reading levels with PK: reading_level_id
    this.reading_level = new dynamodb.Table(this, 'reading_level', {
      partitionKey: { name: 'reading_level_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // table for reading pages with PK: page_id, SK: book_id
    this.reading_page = new dynamodb.Table(this, 'reading_page', {
      partitionKey: { name: 'page_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'book_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // table for page reports with PK: report_id, SK: page_id
    this.page_report = new dynamodb.Table(this, 'page_report', {
      partitionKey: { name: 'report_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'page_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    // added to page report table, global index with PK:user_id
    this.page_report.addGlobalSecondaryIndex({
      indexName: 'Global_page_report',
      partitionKey: { name: 'user_id', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // table for reading progress with PK: progress_id, SK: user_id
    this.reading_progress = new dynamodb.Table(this, 'reading_progress', {
      partitionKey: { name: 'progress_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'user_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    // added to reading progress table, global index with PK:book_id
    this.reading_progress.addGlobalSecondaryIndex({
      indexName: 'Global_reading_progress',
      partitionKey: { name: 'book_id', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // table for highlights with PK: highlight_id, SK: user_id
    this.highlights = new dynamodb.Table(this, 'highlights', {
      partitionKey: { name: 'highlight_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'user_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    // added to highlights table, global index with PK:page_id
    this.highlights.addGlobalSecondaryIndex({
      indexName: 'Global_highlights',
      partitionKey: { name: 'page_id', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // table for marks with PK: mark_id, SK: user_id
    this.mark = new dynamodb.Table(this, 'mark', {
      partitionKey: { name: 'mark_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'user_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    // added to mark table, global index with PK:book_id
    this.mark.addGlobalSecondaryIndex({
      indexName: 'Global_mark',
      partitionKey: { name: 'book_id', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // table for book chatbot with PK: book_chat_id, SK: user_id
    this.book_chatbot = new dynamodb.Table(this, 'book_chatbot', {
      partitionKey: { name: 'book_chat_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'user_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    // added to book chatbot table, global index with PK:book_id
    this.book_chatbot.addGlobalSecondaryIndex({
      indexName: 'Global_book_chatbot',
      partitionKey: { name: 'book_id', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // table for character chatbot with PK: char_chat_id, SK: user_id
    this.character_chatbot = new dynamodb.Table(this, 'character_chatbot', {
      partitionKey: { name: 'char_chat_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'user_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    // added to character chatbot table, global index with PK:book_id
    this.character_chatbot.addGlobalSecondaryIndex({
      indexName: 'Global_character_chatbot',
      partitionKey: { name: 'book_id', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // table for AI chapter summary with PK: ai_chapter_id, SK: chapter_id
    this.ai_chapter_summary = new dynamodb.Table(this, 'ai_chapter_summary', {
      partitionKey: { name: 'ai_chapter_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'chapter_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // table for chapter summary with PK: summary_id, SK: chapter_id
    this.chapter_summary = new dynamodb.Table(this, 'chapter_summary', {
      partitionKey: { name: 'summary_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'chapter_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // table for AI content image with PK: image_id, SK: book_id
    this.ai_content_image = new dynamodb.Table(this, 'ai_content_image', {
      partitionKey: { name: 'image_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'book_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // table for book listeners with PK: listener_id, SK: book_id
    this.book_listeners = new dynamodb.Table(this, 'book_listeners', {
      partitionKey: { name: 'listener_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'book_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // table for pronunciation practice with PK: pronunciation_practice_id, SK: user_id
    this.pronunciation_practice = new dynamodb.Table(this, 'pronunciation_practice', {
      partitionKey: { name: 'pronunciation_practice_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'user_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    // added to pronunciation practice table, global index with PK:language_id
    this.pronunciation_practice.addGlobalSecondaryIndex({
      indexName: 'Global_pronunciation_practice',
      partitionKey: { name: 'language_id', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // table for reading session with PK: reading_session_id, SK: user_id
    this.reading_session = new dynamodb.Table(this, 'reading_session', {
      partitionKey: { name: 'reading_session_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'user_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    // added to reading session table, global index with PK:book_id
    this.reading_session.addGlobalSecondaryIndex({
      indexName: 'Global_reading_session',
      partitionKey: { name: 'book_id', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // table for genre with PK: genre_id
    this.genre = new dynamodb.Table(this, 'genre', {
      partitionKey: { name: 'genre_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
