const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const tableName = process.env.CASES_TABLE_NAME; // Access table name from environment variables
    
    // Mock data to insert into the database
    const cases = [
        {
            caseID: 'case001',
            level: 'critical',
            govEntityName: 'Ministry of Health',
            complaintText: 'Urgent issue with healthcare facilities.'
        },
        {
            caseID: 'case002',
            level: 'non-critical',
            govEntityName: 'Ministry of Education',
            complaintText: 'Issues with school infrastructure.'
        },
        {
            caseID: 'case003',
            level: 'critical',
            govEntityName: 'Ministry of Interior',
            complaintText: 'Security concerns in a local neighborhood.'
        },
    ];

    const putPromises = cases.map(async (caseData) => {
        const params = {
            TableName: tableName,
            Item: caseData,
        };
        await dynamoDB.put(params).promise();
    });

    try {
        // Insert mock data into the DynamoDB table
        await Promise.all(putPromises);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Mock data inserted successfully into DynamoDB!',
            }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Failed to insert mock data into DynamoDB',
                error: error.message,
            }),
        };
    }
};
