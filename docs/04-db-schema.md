# Database Schema

## Overview

The Nova Hologram platform uses Amazon DynamoDB as its primary database. DynamoDB is a NoSQL database service that provides fast and predictable performance with seamless scalability. This document outlines the database schema used in the application.

## Database Diagram

The following diagram illustrates the database schema for the Nova Hologram platform:

![Nova Hologram Database Schema](./assets/db-schema-diagram.jpeg)

This comprehensive schema shows the relationships between various entities including:

- **User Tables**: Stores user information, authentication details, and preferences
- **Book-related Tables**: Including book, book_mark, book_chapter, etc. to store reading material information
- **Content Tables**: Such as character, collection, typography to manage content presentation
- **Reading-related Tables**: Including reading_goal, page_export to track reading activities
- **Progress Tracking Tables**: Such as user_progress, highlights to monitor user engagement

The diagram illustrates the complex relationships between entities with primary keys (PK) and foreign keys (FK) clearly marked. Each table is designed to store specific data related to its domain, creating a normalized database structure that efficiently supports the application's functionality.

### Key Database Relationships

1. **User to Books**: Users can access multiple books, and books can be accessed by multiple users
2. **Books to Chapters**: Books contain multiple chapters in a hierarchical structure
3. **Books to Content**: Books are associated with various content elements like characters and typography settings
4. **User Progress Tracking**: User activity is tracked across books, chapters, and reading sessions
5. **Content Generation**: Generated content is linked to source materials and user interactions

## Tables

Based on the database schema diagram, the system includes the following key tables:

### User Tables

#### User Table

**Table Name**: `user`

**Primary Key**: `user_id` (PK)

**Attributes**:

| Attribute | Type | Description |
|-----------|------|-------------|
| user_id | String | Primary key, unique identifier for the user |
| full_name | String | User's full name |
| email | String | User's email address |
| password | String | Hashed password |
| role | String | User role (e.g., reader, librarian) |
| created_at | Timestamp | When the user account was created |

#### User Settings Table

**Table Name**: `user_settings`

**Primary Key**: `user_settings_id` (PK)

**Foreign Keys**: `user_id` (FK)

**Attributes**:

| Attribute | Type | Description |
|-----------|------|-------------|
| user_settings_id | String | Primary key |
| user_id | String | Foreign key to user table |
| narrator_id | String | Preferred narrator |
| speed_of_reading | Float | Reading speed preference |
| highlight_text | Boolean | Whether to highlight text |
| font_section | String | Font preference |

### Book-related Tables

#### Book Table

**Table Name**: `book`

**Primary Key**: `book_id` (PK)

**Attributes**:

| Attribute | Type | Description |
|-----------|------|-------------|
| book_id | String | Primary key |
| book_title | String | Title of the book |
| type | String | Type of book |
| genre_id | String | Genre identifier |
| cover_image_id | String | Reference to cover image |
| isbn | String | ISBN number |
| author | String | Author name |
| language_id | String | Language identifier |
| publisher | String | Publisher name |
| publication_year | Integer | Year of publication |
| reading_level | String | Reading level |
| keywords | Array | Keywords for search |
| learning_objective | String | Learning objectives |

#### Book Chapter Table

**Table Name**: `book_chapter`

**Primary Key**: `chapter_id` (PK)

**Foreign Keys**: `book_id` (FK)

**Attributes**:

| Attribute | Type | Description |
|-----------|------|-------------|
| chapter_id | String | Primary key |
| book_id | String | Foreign key to book table |
| chapter_no | Integer | Chapter number |
| chapter_title | String | Chapter title |
| start_page | Integer | Starting page number |
| end_page | Integer | Ending page number |

#### Book Mark Table

**Table Name**: `book_mark`

**Primary Key**: `book_mark_id` (PK)

**Foreign Keys**: `user_id` (FK), `book_id` (FK)

**Attributes**:

| Attribute | Type | Description |
|-----------|------|-------------|
| book_mark_id | String | Primary key |
| user_id | String | Foreign key to user table |
| book_id | String | Foreign key to book table |
| mark_page | Integer | Page number of the bookmark |

### Content Tables

#### Character Table

**Table Name**: `character`

**Primary Key**: `character_id` (PK)

**Foreign Keys**: `book_id` (FK)

**Attributes**:

| Attribute | Type | Description |
|-----------|------|-------------|
| character_id | String | Primary key |
| book_id | String | Foreign key to book table |
| name | String | Character name |
| description | String | Character description |
| response | String | Character response patterns |
| appearance | String | Character appearance details |

#### Typography Table

**Table Name**: `typography`

**Primary Key**: `typo_id` (PK)

**Foreign Keys**: `user_id` (FK)

**Attributes**:

| Attribute | Type | Description |
|-----------|------|-------------|
| typo_id | String | Primary key |
| user_id | String | Foreign key to user table |
| font_size | String | Font size preference |
| font_weight | String | Font weight preference |
| text_color | String | Text color preference |
| text_family | String | Font family preference |

### Reading and Progress Tables

#### Reading Goal Table

**Table Name**: `reading_goal`

**Primary Key**: `goal_id` (PK)

**Foreign Keys**: `user_id` (FK)

**Attributes**:

| Attribute | Type | Description |
|-----------|------|-------------|
| goal_id | String | Primary key |
| user_id | String | Foreign key to user table |
| target_books | Integer | Number of books to read |
| target_words | Integer | Number of words to read |
| target_pages | Integer | Number of pages to read |
| start_date | Date | Goal start date |
| end_date | Date | Goal end date |

#### User Progress Table

**Table Name**: `user_progress`

**Primary Key**: `progress_id` (PK)

**Foreign Keys**: `user_id` (FK), `book_id` (FK)

**Attributes**:

| Attribute | Type | Description |
|-----------|------|-------------|
| progress_id | String | Primary key |
| user_id | String | Foreign key to user table |
| book_id | String | Foreign key to book table |
| pages_read | Integer | Number of pages read |
| status | String | Reading status |
| last_accessed | Timestamp | Last access timestamp |

### AI Content Generation Tables

#### AI Cover Image Table

**Table Name**: `ai_cover_image`

**Primary Key**: `cover_id` (PK)

**Foreign Keys**: `book_id` (FK)

**Attributes**:

| Attribute | Type | Description |
|-----------|------|-------------|
| cover_id | String | Primary key |
| book_id | String | Foreign key to book table |
| prompt_text | String | Prompt used for generation |
| cover_path | String | Path to the generated cover image |
| ai_model | String | AI model used for generation |
| resolution | String | Image resolution |
| created_at | Timestamp | Creation timestamp |

#### Book Trailers Table

**Table Name**: `book_trailers`

**Primary Key**: `trailer_id` (PK)

**Foreign Keys**: `book_id` (FK)

**Attributes**:

| Attribute | Type | Description |
|-----------|------|-------------|
| trailer_id | String | Primary key |
| book_id | String | Foreign key to book table |
| prompt_text | String | Prompt used for generation |
| video_path | String | Path to the generated video |
| duration | Integer | Video duration in seconds |
| created_at | Timestamp | Creation timestamp |

## Data Access Patterns

### Common Queries

1. **Get user profile**:
   ```
   GetItem on Users table with userId
   ```

2. **List all reading materials**:
   ```
   Scan on ReadingMaterials table with filter for status = 'active'
   ```

3. **Get reading material details**:
   ```
   GetItem on ReadingMaterials table with materialId
   ```

4. **List materials uploaded by a specific user**:
   ```
   Query on ReadingMaterials table using uploaderIndex with uploaderId
   ```

5. **List generated content for a specific material**:
   ```
   Query on GeneratedContent table using materialIndex with sourceMaterialId
   ```

6. **Get user activity history**:
   ```
   Query on UserActivity table with userId and optional date range on timestamp
   ```

### Data Consistency

The application uses DynamoDB's strong consistency for critical operations and eventual consistency for read-heavy operations to optimize performance and cost.

## Data Migration and Backup

DynamoDB tables are backed up using AWS Backup with point-in-time recovery enabled. Data migration between environments is handled using AWS Database Migration Service (DMS) or custom scripts that export/import data using DynamoDB streams.