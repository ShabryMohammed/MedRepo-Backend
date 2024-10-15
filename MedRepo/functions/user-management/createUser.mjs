import { nanoid } from 'nanoid';
import DynamoDB from 'aws-sdk/clients/dynamodb.js';

const docClient = new DynamoDB.DocumentClient();

const headers = {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
};

export const createUser = async (event) => {
    try {
        const { firstName, lastName, email, contactnumber, password } = JSON.parse(event.body);

        if (!firstName || !lastName || !email || !contactnumber || !password) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    message: 'Missing required fields: firstName, lastName, email, contactnumber, and password are required',
                }),
            };
        }

        const userId = nanoid(8);
        const now = new Date().toISOString();

        await docClient.put({
            TableName: 'Users',
            Item: {
                id: userId,
                firstName,
                lastName,
                email,
                contactnumber,
                password,
                createdAt: now,
            },
        }).promise();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: 'User created successfully',
                id: userId, // Return the generated ID
            }),
        };
    } catch (error) {
        console.error('Error creating user:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                message: 'Error creating user. Please try again later.',
            }),
        };
    }
};
