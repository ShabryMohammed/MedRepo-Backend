import DynamoDB from 'aws-sdk/clients/dynamodb.js';

const docClient = new DynamoDB.DocumentClient();

const headers = {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Methods": "OPTIONS,DELETE"
};

export const deleteReport = async (event) => {
    try {
        const reportId = event.pathParameters.id; // Extract report ID from the path parameters

        if (!reportId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    message: 'Report ID is required',
                }),
            };
        }

        const params = {
            TableName: 'Reports',
            Key: {
                id: reportId, // The primary key for the report in the DynamoDB table
            },
            ConditionExpression: 'attribute_exists(id)', // Ensure the item exists before deleting
        };

        await docClient.delete(params).promise();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: 'Report deleted successfully',
                id: reportId,
            }),
        };
    } catch (error) {
        console.error('Error deleting report:', error);

        if (error.code === 'ConditionalCheckFailedException') {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({
                    message: 'Report not found',
                }),
            };
        }

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                message: 'Error deleting report. Please try again later.',
            }),
        };
    }
};
