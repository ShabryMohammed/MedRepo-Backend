import { nanoid } from 'nanoid';
import DynamoDB from 'aws-sdk/clients/dynamodb.js';
import AWS from 'aws-sdk';

const docClient = new DynamoDB.DocumentClient();
const lambda = new AWS.Lambda();

const headers = {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
};

export const createReport = async (event) => {
    try {
        console.log('Received event:', event);  // Log the entire event for debugging

        const { refNum, userId, nic, name, status, age, reportUrl } = JSON.parse(event.body);

        // Validate input fields
        if (!refNum || !userId || !nic || !name || !status || !age || !reportUrl) {
            console.warn('Validation failed. Missing required fields:', { refNum, userId, nic, name, status, age, reportUrl });
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    message: 'Missing required fields: userId, nic, name, status, age, and reportUrl are required',
                }),
            };
        }

        const reportId = nanoid(8);
        const createdAt = new Date().toISOString();

        // Store the report in DynamoDB
        await docClient.put({
            TableName: 'Reports',
            Item: {
                id: reportId, 
                refNum,
                userId,
                nic,
                name,
                status,
                age,
                reportUrl,
                createdAt,
            },
        }).promise();

        console.log('Report created successfully:', { reportId, refNum, userId });  // Log successful creation

        // Invoke the notification Lambda function for email
        const emailResult = await lambda.invoke({
            FunctionName: 'MedRepo-sendEmailNotification-m4ybPqS2cSYh', // Replace with your function name
            Payload: JSON.stringify({ body: JSON.stringify({ userId, reportId }) }),
        }).promise();
        console.log('Email function response:', emailResult); // Log response from email function

        // Invoke the notification Lambda function for SMS
        const smsResult = await lambda.invoke({
            FunctionName: 'MedRepo-sendSmsNotification-e5iiIGsUEP4F', // Replace with your function name
            Payload: JSON.stringify({ body: JSON.stringify({ userId, reportId }) }),
        }).promise();
        console.log('SMS function response:', smsResult); // Log response from SMS function

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: 'Report created successfully',
                reportId,
            }),
        };
    } catch (error) {
        console.error('Error creating report:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                message: 'Error creating report. Please try again later.',
                error: error.message,  // Log the error message for debugging
            }),
        };
    }
};
