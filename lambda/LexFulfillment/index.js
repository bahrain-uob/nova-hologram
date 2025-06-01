const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const bedrock = new AWS.Bedrock();
const bedrockRuntime = new AWS.BedrockRuntime();

// Table names from environment variables
const CHAPTERS_TABLE = process.env.CHAPTERS_TABLE || 'Chapters';
const BOOKS_TABLE = process.env.BOOKS_TABLE || 'Books';
const USERS_TABLE = process.env.USERS_TABLE || 'Users';
const NOTIFICATIONS_TABLE = process.env.NOTIFICATIONS_TABLE || 'Notifications';
const CLASSROOM_TABLE = process.env.CLASSROOM_TABLE || 'Classrooms';
const CLASSROOM_STUDENT_TABLE = process.env.CLASSROOM_STUDENT_TABLE || 'ClassroomStudents';
const CLASSROOM_BOOK_TABLE = process.env.CLASSROOM_BOOK_TABLE || 'ClassroomBooks';
const USER_POOL_ID = process.env.USER_POOL_ID || 'me-south-1_X7adr285t';

/**
 * Lex Fulfillment Lambda function
 * 
 * This function handles:
 * 1. Lex intent fulfillment for the chatbot
 * 2. SNS notifications processing from the notification system
 */
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Determine if this is an SNS notification or a Lex intent
    if (event.Records && event.Records.length > 0 && event.Records[0].Sns) {
      // This is an SNS notification
      return await handleSnsNotification(event);
    } else if (event.sessionState && event.interpretations) {
      // This is a Lex intent
      return await handleLexIntent(event);
    } else {
      console.error('Unsupported event type:', event);
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Unsupported event type' })
      };
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error', error: error.message })
    };
  }
};

/**
 * Handle SNS notifications from the notification system
 */
async function handleSnsNotification(event) {
  try {
    const snsRecord = event.Records[0].Sns;
    const notificationMessage = JSON.parse(snsRecord.Message);
    const notificationType = snsRecord.MessageAttributes.notificationType.Value;
    const recipientId = snsRecord.MessageAttributes.recipientId.Value;
    
    console.log('Processing notification:', notificationMessage);
    console.log('Notification type:', notificationType);
    console.log('Recipient ID:', recipientId);
    
    // Here you could implement logic to:
    // 1. Store the notification for later reference by the chatbot
    // 2. Process the notification based on its type
    // 3. Prepare responses for when users ask about notifications
    
    // For important notifications, we could store additional context
    if (notificationType === 'important' || notificationType === 'alert') {
      await storeNotificationContext(notificationMessage);
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Notification processed successfully' })
    };
  } catch (error) {
    console.error('Error processing SNS notification:', error);
    throw error;
  }
}

/**
 * Store additional context for important notifications
 */
async function storeNotificationContext(notification) {
  // This is a placeholder for storing additional context
  // You could store this in a separate DynamoDB table or another storage mechanism
  console.log('Storing additional context for notification:', notification.notification_id);
  
  // For example, if this is a book-related notification, you might want to
  // fetch additional information about the book to provide context
  if (notification.related_resource && notification.related_resource.startsWith('book-')) {
    const bookId = notification.related_resource;
    
    try {
      const bookInfo = await getBookInfo(bookId);
      console.log('Retrieved book info for notification context:', bookInfo);
      
      // Store this context somewhere for the chatbot to use
      // This is just a placeholder
    } catch (error) {
      console.error('Error retrieving book info for notification context:', error);
    }
  }
}

/**
 * Get book information from DynamoDB
 */
async function getBookInfo(bookId) {
  const params = {
    TableName: BOOKS_TABLE,
    Key: { book_id: bookId }
  };
  
  const result = await dynamoDB.get(params).promise();
  return result.Item;
}

/**
 * Handle Lex intent fulfillment
 */
async function handleLexIntent(event) {
  const intent = event.sessionState.intent.name;
  console.log('Processing Lex intent:', intent);
  
  // Extract session attributes and slot values
  const sessionAttributes = event.sessionState.sessionAttributes || {};
  const slots = event.sessionState.intent.slots || {};
  
  // Process based on intent
  switch (intent) {
    case 'HelpIntent':
      return handleHelpIntent(event);
      
    case 'SearchBookIntent':
      return handleSearchBookIntent(event, slots);
      
    case 'GenerateHologramIntent':
      return handleGenerateHologramIntent(event, slots);
      
    case 'CheckNotificationsIntent':
      return handleCheckNotificationsIntent(event, sessionAttributes);
      
    case 'ClassroomInfoIntent':
      return handleClassroomInfoIntent(event, slots, sessionAttributes);
      
    case 'FallbackIntent':
    default:
      return handleFallbackIntent(event);
  }
}

/**
 * Handle the Help intent
 */
async function handleHelpIntent(event) {
  const response = {
    sessionState: {
      dialogAction: {
        type: 'Close',
        fulfillmentState: 'Fulfilled'
      },
      intent: event.sessionState.intent
    },
    messages: [
      {
        contentType: 'PlainText',
        content: 'I can help you with the following:\n' +
                 '- Search for books by title, author, or genre\n' +
                 '- Generate holograms for books or chapters\n' +
                 '- Check your notifications\n' +
                 '- Get information about your classrooms\n' +
                 'How can I assist you today?'
      }
    ]
  };
  
  return response;
}

/**
 * Handle the SearchBook intent
 */
async function handleSearchBookIntent(event, slots) {
  const bookTitle = slots.BookTitle?.value?.interpretedValue;
  const authorName = slots.AuthorName?.value?.interpretedValue;
  const genre = slots.Genre?.value?.interpretedValue;
  
  let searchParams = {};
  let filterExpression = [];
  let expressionAttributeValues = {};
  
  // Build the search query based on provided slots
  if (bookTitle) {
    filterExpression.push('contains(title, :title)');
    expressionAttributeValues[':title'] = bookTitle.toLowerCase();
  }
  
  if (authorName) {
    filterExpression.push('contains(author, :author)');
    expressionAttributeValues[':author'] = authorName.toLowerCase();
  }
  
  if (genre) {
    filterExpression.push('contains(genre, :genre)');
    expressionAttributeValues[':genre'] = genre.toLowerCase();
  }
  
  // If no search criteria provided, return a prompt
  if (Object.keys(expressionAttributeValues).length === 0) {
    return {
      sessionState: {
        dialogAction: {
          type: 'ElicitSlot',
          slotToElicit: 'BookTitle'
        },
        intent: event.sessionState.intent
      },
      messages: [
        {
          contentType: 'PlainText',
          content: 'What book are you looking for? You can provide a title, author, or genre.'
        }
      ]
    };
  }
  
  // Search for books
  try {
    const params = {
      TableName: BOOKS_TABLE,
      FilterExpression: filterExpression.join(' AND '),
      ExpressionAttributeValues: expressionAttributeValues
    };
    
    const result = await dynamoDB.scan(params).promise();
    
    if (result.Items && result.Items.length > 0) {
      // Format the book results
      const bookResults = result.Items.map(book => 
        `"${book.title}" by ${book.author}${book.genre ? ' (Genre: ' + book.genre + ')' : ''}`
      ).join('\n');
      
      return {
        sessionState: {
          dialogAction: {
            type: 'Close',
            fulfillmentState: 'Fulfilled'
          },
          intent: event.sessionState.intent
        },
        messages: [
          {
            contentType: 'PlainText',
            content: `I found ${result.Items.length} book(s) matching your search:\n${bookResults}`
          }
        ]
      };
    } else {
      return {
        sessionState: {
          dialogAction: {
            type: 'Close',
            fulfillmentState: 'Fulfilled'
          },
          intent: event.sessionState.intent
        },
        messages: [
          {
            contentType: 'PlainText',
            content: 'I couldn\'t find any books matching your search criteria. Please try again with different terms.'
          }
        ]
      };
    }
  } catch (error) {
    console.error('Error searching for books:', error);
    return {
      sessionState: {
        dialogAction: {
          type: 'Close',
          fulfillmentState: 'Failed'
        },
        intent: event.sessionState.intent
      },
      messages: [
        {
          contentType: 'PlainText',
          content: 'Sorry, I encountered an error while searching for books. Please try again later.'
        }
      ]
    };
  }
}

/**
 * Handle the GenerateHologram intent
 */
async function handleGenerateHologramIntent(event, slots) {
  const bookTitle = slots.BookTitle?.value?.interpretedValue;
  const chapterNumber = slots.ChapterNumber?.value?.interpretedValue;
  
  if (!bookTitle) {
    return {
      sessionState: {
        dialogAction: {
          type: 'ElicitSlot',
          slotToElicit: 'BookTitle'
        },
        intent: event.sessionState.intent
      },
      messages: [
        {
          contentType: 'PlainText',
          content: 'For which book would you like to generate a hologram?'
        }
      ]
    };
  }
  
  // Search for the book
  try {
    const bookParams = {
      TableName: BOOKS_TABLE,
      FilterExpression: 'contains(title, :title)',
      ExpressionAttributeValues: {
        ':title': bookTitle.toLowerCase()
      }
    };
    
    const bookResult = await dynamoDB.scan(bookParams).promise();
    
    if (!bookResult.Items || bookResult.Items.length === 0) {
      return {
        sessionState: {
          dialogAction: {
            type: 'Close',
            fulfillmentState: 'Fulfilled'
          },
          intent: event.sessionState.intent
        },
        messages: [
          {
            contentType: 'PlainText',
            content: `I couldn't find a book titled "${bookTitle}". Please check the title and try again.`
          }
        ]
      };
    }
    
    const book = bookResult.Items[0];
    
    // If chapter number is provided, generate hologram for that chapter
    if (chapterNumber) {
      const chapterParams = {
        TableName: CHAPTERS_TABLE,
        FilterExpression: 'book_id = :bookId AND chapter_number = :chapterNumber',
        ExpressionAttributeValues: {
          ':bookId': book.book_id,
          ':chapterNumber': parseInt(chapterNumber, 10)
        }
      };
      
      const chapterResult = await dynamoDB.scan(chapterParams).promise();
      
      if (!chapterResult.Items || chapterResult.Items.length === 0) {
        return {
          sessionState: {
            dialogAction: {
              type: 'Close',
              fulfillmentState: 'Fulfilled'
            },
            intent: event.sessionState.intent
          },
          messages: [
            {
              contentType: 'PlainText',
              content: `I couldn't find chapter ${chapterNumber} for "${book.title}". Please check the chapter number and try again.`
            }
          ]
        };
      }
      
      // Simulate hologram generation (in a real implementation, this would call Bedrock)
      return {
        sessionState: {
          dialogAction: {
            type: 'Close',
            fulfillmentState: 'Fulfilled'
          },
          intent: event.sessionState.intent
        },
        messages: [
          {
            contentType: 'PlainText',
            content: `I've started generating a hologram for Chapter ${chapterNumber} of "${book.title}". This may take a few moments. You'll receive a notification when it's ready.`
          }
        ]
      };
    } else {
      // Generate hologram for the entire book
      return {
        sessionState: {
          dialogAction: {
            type: 'Close',
            fulfillmentState: 'Fulfilled'
          },
          intent: event.sessionState.intent
        },
        messages: [
          {
            contentType: 'PlainText',
            content: `I've started generating a hologram for "${book.title}". This may take a few moments. You'll receive a notification when it's ready.`
          }
        ]
      };
    }
  } catch (error) {
    console.error('Error generating hologram:', error);
    return {
      sessionState: {
        dialogAction: {
          type: 'Close',
          fulfillmentState: 'Failed'
        },
        intent: event.sessionState.intent
      },
      messages: [
        {
          contentType: 'PlainText',
          content: 'Sorry, I encountered an error while generating the hologram. Please try again later.'
        }
      ]
    };
  }
}

/**
 * Handle the CheckNotifications intent
 */
async function handleCheckNotificationsIntent(event, sessionAttributes) {
  // In a real implementation, you would extract the user ID from the session
  // For now, we'll use a placeholder
  const userId = sessionAttributes.userId || 'user-123';
  
  try {
    // Query notifications for the user
    const params = {
      TableName: NOTIFICATIONS_TABLE,
      IndexName: 'RecipientIndex',
      KeyConditionExpression: 'recipient_id = :recipientId',
      ExpressionAttributeValues: {
        ':recipientId': userId
      },
      Limit: 5,
      ScanIndexForward: false // Sort by most recent first
    };
    
    const result = await dynamoDB.query(params).promise();
    
    if (result.Items && result.Items.length > 0) {
      // Format the notifications
      const notificationResults = result.Items.map(notification => 
        `${notification.is_read ? '✓' : '!'} ${notification.title}: ${notification.message}`
      ).join('\n');
      
      return {
        sessionState: {
          dialogAction: {
            type: 'Close',
            fulfillmentState: 'Fulfilled'
          },
          intent: event.sessionState.intent
        },
        messages: [
          {
            contentType: 'PlainText',
            content: `You have ${result.Items.length} recent notification(s):\n${notificationResults}`
          }
        ]
      };
    } else {
      return {
        sessionState: {
          dialogAction: {
            type: 'Close',
            fulfillmentState: 'Fulfilled'
          },
          intent: event.sessionState.intent
        },
        messages: [
          {
            contentType: 'PlainText',
            content: 'You don\'t have any recent notifications.'
          }
        ]
      };
    }
  } catch (error) {
    console.error('Error checking notifications:', error);
    return {
      sessionState: {
        dialogAction: {
          type: 'Close',
          fulfillmentState: 'Failed'
        },
        intent: event.sessionState.intent
      },
      messages: [
        {
          contentType: 'PlainText',
          content: 'Sorry, I encountered an error while checking your notifications. Please try again later.'
        }
      ]
    };
  }
}

/**
 * Handle the ClassroomInfo intent
 */
async function handleClassroomInfoIntent(event, slots, sessionAttributes) {
  const classroomName = slots.ClassroomName?.value?.interpretedValue;
  // In a real implementation, you would extract the user ID from the session
  const userId = sessionAttributes.userId || 'user-123';
  
  try {
    // If no classroom name provided, list all classrooms for the user
    if (!classroomName) {
      // Query classrooms for the user (as a student)
      const studentParams = {
        TableName: CLASSROOM_STUDENT_TABLE,
        KeyConditionExpression: 'student_id = :studentId',
        ExpressionAttributeValues: {
          ':studentId': userId
        }
      };
      
      const studentResult = await dynamoDB.query(studentParams).promise();
      
      if (studentResult.Items && studentResult.Items.length > 0) {
        // Get classroom details
        const classroomPromises = studentResult.Items.map(item => {
          const params = {
            TableName: CLASSROOM_TABLE,
            Key: { classroom_id: item.classroom_id }
          };
          return dynamoDB.get(params).promise();
        });
        
        const classroomResults = await Promise.all(classroomPromises);
        const classrooms = classroomResults
          .filter(result => result.Item)
          .map(result => result.Item);
        
        const classroomList = classrooms.map(classroom => 
          `${classroom.name} (Grade: ${classroom.grade_level})`
        ).join('\n');
        
        return {
          sessionState: {
            dialogAction: {
              type: 'Close',
              fulfillmentState: 'Fulfilled'
            },
            intent: event.sessionState.intent
          },
          messages: [
            {
              contentType: 'PlainText',
              content: `You are a member of ${classrooms.length} classroom(s):\n${classroomList}`
            }
          ]
        };
      } else {
        return {
          sessionState: {
            dialogAction: {
              type: 'Close',
              fulfillmentState: 'Fulfilled'
            },
            intent: event.sessionState.intent
          },
          messages: [
            {
              contentType: 'PlainText',
              content: 'You are not a member of any classrooms.'
            }
          ]
        };
      }
    } else {
      // Search for the specific classroom
      const classroomParams = {
        TableName: CLASSROOM_TABLE,
        FilterExpression: 'contains(name, :name)',
        ExpressionAttributeValues: {
          ':name': classroomName.toLowerCase()
        }
      };
      
      const classroomResult = await dynamoDB.scan(classroomParams).promise();
      
      if (!classroomResult.Items || classroomResult.Items.length === 0) {
        return {
          sessionState: {
            dialogAction: {
              type: 'Close',
              fulfillmentState: 'Fulfilled'
            },
            intent: event.sessionState.intent
          },
          messages: [
            {
              contentType: 'PlainText',
              content: `I couldn't find a classroom named "${classroomName}". Please check the name and try again.`
            }
          ]
        };
      }
      
      const classroom = classroomResult.Items[0];
      
      // Check if user is a member of this classroom
      const memberParams = {
        TableName: CLASSROOM_STUDENT_TABLE,
        Key: {
          classroom_id: classroom.classroom_id,
          student_id: userId
        }
      };
      
      const memberResult = await dynamoDB.get(memberParams).promise();
      
      if (!memberResult.Item && classroom.creator_id !== userId) {
        return {
          sessionState: {
            dialogAction: {
              type: 'Close',
              fulfillmentState: 'Fulfilled'
            },
            intent: event.sessionState.intent
          },
          messages: [
            {
              contentType: 'PlainText',
              content: `You are not a member of the classroom "${classroom.name}".`
            }
          ]
        };
      }
      
      // Get books assigned to the classroom
      const booksParams = {
        TableName: CLASSROOM_BOOK_TABLE,
        KeyConditionExpression: 'classroom_id = :classroomId',
        ExpressionAttributeValues: {
          ':classroomId': classroom.classroom_id
        }
      };
      
      const booksResult = await dynamoDB.query(booksParams).promise();
      
      let booksInfo = 'No books have been assigned to this classroom.';
      if (booksResult.Items && booksResult.Items.length > 0) {
        // Get book details
        const bookPromises = booksResult.Items.map(item => {
          const params = {
            TableName: BOOKS_TABLE,
            Key: { book_id: item.book_id }
          };
          return dynamoDB.get(params).promise();
        });
        
        const bookResults = await Promise.all(bookPromises);
        const books = bookResults
          .filter(result => result.Item)
          .map(result => result.Item);
        
        booksInfo = `Books assigned to this classroom:\n${books.map(book => 
          `- ${book.title} by ${book.author}`
        ).join('\n')}`;
      }
      
      return {
        sessionState: {
          dialogAction: {
            type: 'Close',
            fulfillmentState: 'Fulfilled'
          },
          intent: event.sessionState.intent
        },
        messages: [
          {
            contentType: 'PlainText',
            content: `Classroom: ${classroom.name}\nGrade Level: ${classroom.grade_level}\nDescription: ${classroom.description || 'No description'}\nStudents: ${classroom.student_count || 0}\n\n${booksInfo}`
          }
        ]
      };
    }
  } catch (error) {
    console.error('Error retrieving classroom info:', error);
    return {
      sessionState: {
        dialogAction: {
          type: 'Close',
          fulfillmentState: 'Failed'
        },
        intent: event.sessionState.intent
      },
      messages: [
        {
          contentType: 'PlainText',
          content: 'Sorry, I encountered an error while retrieving classroom information. Please try again later.'
        }
      ]
    };
  }
}

/**
 * Handle the Fallback intent
 */
async function handleFallbackIntent(event) {
  return {
    sessionState: {
      dialogAction: {
        type: 'Close',
        fulfillmentState: 'Fulfilled'
      },
      intent: event.sessionState.intent
    },
    messages: [
      {
        contentType: 'PlainText',
        content: 'I\'m not sure I understand what you\'re asking. You can ask me to help search for books, generate holograms, check notifications, or get classroom information.'
      }
    ]
  };
}
