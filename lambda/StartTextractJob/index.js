const { TextractClient, StartDocumentTextDetectionCommand } = require("@aws-sdk/client-textract");

const textractClient = new TextractClient();

exports.handler = async (event) => {
    const params = {
        DocumentLocation: {
            S3Object: {
                Bucket: 'storagestack-readingmaterialse72d08c8-spmbixoyxput',
                Name: 'level_1_-_The_Adventures_of_Tom_Sawyer_-_Penguin_Readers-min.pdf'
            }
        }
    };

    try {
        const command = new StartDocumentTextDetectionCommand(params);
        const response = await textractClient.send(command);
        console.log('Textract job started:', response.JobId);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Textract job started', jobId: response.JobId })
        };
    } catch (err) {
        console.error('Error starting Textract:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
};
