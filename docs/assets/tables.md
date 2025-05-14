table name = list_book

list_book_id (PK)
book_id (FK, SK) - references book.book_id
list_id (FK, SK) - references lists.list_id
added_date
isRead
table name = lists

list_id (PK)
list_name
user_id (FK) - references user.user_id
table name = typography

typo_id (PK)
user_id (FK) - references user.user_id
font_size
font_weight
font_color
font_family
table name = book_mark

book_mark_id (PK)
book_mark_fnd
book_id (FK, SK) - references book.book_id
user_id (FK, SK) - references user.user_id
table name = character_chatbot

char_chat_id (PK)
user_id (FK, GSI: SK) - references user.user_id
character_id (FK, GSI: PK) - references character.character_id
question_option
question
response
timestamp
table name = collection

collection_id (PK)
collection_name
created_at
table name = character

character_id (PK)
book_id (FK) - references book.book_id
name
greeting_message
visual_accent_url
movement_url
interaction_type
table name = languages

language_id (PK)
language_code
table name = book_file_description

book_file_id (PK)
book_id (FK) - references book.book_id
book_file_path
file_version
file_size
file_pages
file_words
uploaded_at
table name = book

book_id (PK, SK)
user_id (FK) - references user.user_id
book_title
type
genre (JSON)
collection_id (FK, GSI) - references collection.collection_id
icon
author (JSON)
language
publisher (JSON)
publication_year
reading_level
book_cover
book_summary
book_trailer
created_at
updated_at
table name = ai_cover_image

image_id (PK)
book_id (FK) - references book.book_id
prompt_text
image_path
ai_model
resolution
created_at
table name = book_trailers

trailer_id (PK)
book_id (FK) - references book.book_id
prompt_text
video_path
duration
created_at
table name = chatbot_general

chat_id (PK)
user_id (FK) - references user.user_id
question
response
timestamp
table name = user

user_id (PK)
full_name
email
password
role (SK)
isActive
table name = reviews

review_id (PK)
book_id (FK, SK) - references book.book_id
user_id (FK, SK) - references user.user_id
rating
review
created_at
table name = chapter

chapter_id (PK)
book_id (FK, SK) - references book.book_id
chapter_no
chapter_title
start_page
end_page
table name = book_summary

summary_id (PK)
book_id (FK) - references book.book_id
prompt_text
generated_summary
created_at
table name = page_layout

layout_id (PK)
user_id (FK) - references user.user_id
layout_type (ENUM: single, double)
scroll_direction (ENUM: vertical, horizontal)
theme (ENUM: white, gray, ...)
table name = reading_goal

goal_id (PK)
user_id (FK) - references user.user_id
target_books
target_words
target_pages
start_date
end_date
table name = reader_books

user_book_id (PK)
book_id (FK, SK, GSI) - references book.book_id
user_id (FK, SK) - references user.user_id
status
pages_read
words_read
reading_minutes
last_updated
table name = chapter_chatbot

chat_id (PK)
user_id (FK) - references user.user_id
chapter_id (FK, SK) - references chapter.chapter_id
question
response
timestamp
table name = chapter_summary

chapter_summary_id (PK)
chapter_id (FK, GSI: PK) - references chapter.chapter_id
book_id (FK, GSI: OSK) - references book.book_id
prompt_text
generated_summary
created_at
table name = chapter_trailer

trailer_id (PK)
chapter_id (FK) - references chapter.chapter_id
prompt_text
video_path
duration
created_at
table name = pronunciation_practice

practice_id (PK)
user_id (FK) - references user.user_id
page_id (FK) - references pages.page_id
language (GSI: PK)
practice_text
audio_reference
accuracy_score
feedback
timestamp
table name = user_settings

user_settings_id (PK)
user_id (FK) - references user.user_id
narrator_id (FK) - references narrators.narrator_id
speed_id
highlight_text
auto_scroll
loop_section
table name = narrators

narrator_id (PK)
name
gender
voice_sample_path
table name = reading_progress

progress_id (PK)
user_id (FK) - references user.user_id
book_id (FK, GSI) - references book.book_id
current_page_id (FK, GSI) - references pages.page_id
last_position (timestamp or similar)
last_updated
table name = pages

page_id (PK)
chapter_id (FK) - references chapter.chapter_id
page_number
content
audio_file_path
table name = highlights

highlight_id (PK)
user_id (FK, GSI) - references user.user_id
page_id (FK, GSI) - references pages.page_id
text_segment
start_position
end_position
created_at
table name = book_chatbot

book_chat_id (PK)
user_id (FK, GSI: PK) - references user.user_id
book_id (FK, GSI: SK) - references book.book_id
question
response
timestamp
