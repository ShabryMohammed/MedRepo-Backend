import DynamoDB from 'aws-sdk/clients/dynamodb.js';

const docClient = new DynamoDB.DocumentClient();

export const getALLUsers = async (event) => {
    try {
        const data = await docClient.scan({
            TableName: 'Users'
        }).promise();

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
            },
            body: JSON.stringify({
                message: 'Fetched users successfully',
                data: data.Items, 
            }),
        };
    } catch (error) {
        console.error('Error fetching users:', error);

        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
            },
            body: JSON.stringify({
                message: 'Error fetching users. Please try again later.',
            }),
        };
    }
};
