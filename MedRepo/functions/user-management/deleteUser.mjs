import DynamoDB from 'aws-sdk/clients/dynamodb.js';

const docClient = new DynamoDB.DocumentClient();

const headers = {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Methods": "OPTIONS,DELETE",
};

export const deleteUser = async (event) => {
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

        // Delete the user
        await docClient.delete({
            TableName: 'Users',
            Key: {
                id: userId, // The primary key for the user in the DynamoDB table
            },
        }).promise();

        // Since the delete operation doesn't return the deleted item, we assume success if no error is thrown.
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: 'User deleted successfully',
                id: userId,
            }),
        };
    } catch (error) {
        console.error('Error deleting user:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                message: 'Error deleting user. Please try again later.',
            }),
        };
    }
};
