import DynamoDB from 'aws-sdk/clients/dynamodb.js';

const docClient = new DynamoDB.DocumentClient();

const headers = {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Methods": "OPTIONS,GET,POST",
};

export const getReportsById = async (event) => {
    try {
        const userId = event.pathParameters.id;

        if (!userId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    message: 'User ID is required',
                }),
            };
        }

        const params = {
            TableName: 'Reports',
            FilterExpression: '#userId = :userId',
            ExpressionAttributeNames: {
                '#userId': 'userId', // Using userId from the table attributes
            },
            ExpressionAttributeValues: {
                ':userId': userId, // The userId we are searching for
            },
        };

        const data = await docClient.scan(params).promise();

        if (data.Items.length === 0) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({
                    message: 'No reports found for the provided user ID',
                }),
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                reports: data.Items,
            }),
        };
    } catch (error) {
        console.error('Error retrieving reports:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                message: 'Error retrieving reports. Please try again later.',
            }),
        };
    }
};
