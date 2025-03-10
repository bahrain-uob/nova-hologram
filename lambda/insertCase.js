const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.insertCase = async (event) => {
  const caseID = event.caseID;
  const submissionDate = event.submissionDate;
  const complaintLevel = event.complaintLevel;
  const govEntityName = event.govEntityName;
  const complaintText = event.complaintText;

  const params = {
    TableName: '[ChallengeName]CaseHistory',
    Item: {
      caseID: caseID,
      submissionDate: submissionDate,
      complaintLevel: complaintLevel,
      govEntityName: govEntityName,
      complaintText: complaintText,
    },
  };

  try {
    await dynamoDb.put(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Case inserted successfully!' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Unable to insert case' }),
    };
  }
};
