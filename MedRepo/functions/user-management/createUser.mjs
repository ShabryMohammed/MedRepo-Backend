import { nanoid } from 'nanoid';
import DynamoDB from 'aws-sdk/clients/dynamodb.js';

const docClient = new DynamoDB.DocumentClient();

const headers = {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
};

// Regex patterns for validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+94\d{9}$/;  // +94 followed by 9 digits
  // Adjust according to your needs (1-3 for country code)


export const createUser = async (event) => {
    try {
        const { firstName, lastName, email, contactnumber, password } = JSON.parse(event.body);

        // Validate required fields
        if (!firstName || !lastName || !email || !contactnumber || !password) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    message: 'Missing required fields: firstName, lastName, email, contactnumber, and password are required',
                }),
            };
        }

        // Validate email format
        if (!emailRegex.test(email)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    message: 'Invalid email format',
                }),
            };
        }

        // Validate phone number format (should contain 10 digits)
        if (!phoneRegex.test(contactnumber)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    message: 'Invalid contact number. It should contain exactly 10 digits.',
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
                // Default settings
                smsNotification: false,
                emailNotification: false,
                lightMode: false,
                darkMode: false,
                textSize: 100, // Default to 100%, representing normal size
                highContrast: false,
                lowContrast: false,
                screenReader: false,
            },
        }).promise();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: 'User created successfully',
                id: userId,
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
