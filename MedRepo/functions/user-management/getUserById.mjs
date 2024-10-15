import DynamoDB from 'aws-sdk/clients/dynamodb.js';

const docClient = new DynamoDB.DocumentClient();

const headers = {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Methods": "OPTIONS,GET"
};

export const getUserById = async (event) => {
    try {
        const userId = event.pathParameters.id; // Extract user ID from the path parameters

        if (!userId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    message: 'User ID is required',
                }),
            };
        }

        // Fetch user from the DynamoDB table
        const result = await docClient.get({
            TableName: 'Users',
            Key: {
                id: userId, // The primary key for the user in the DynamoDB table
            },
        }).promise();

        if (!result.Item) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({
                    message: 'User not found',
                }),
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: 'User retrieved successfully',
                user: result.Item,
            }),
        };
    } catch (error) {
        console.error('Error retrieving user:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                message: 'Error retrieving user. Please try again later.',
            }),
        };
    }
};
