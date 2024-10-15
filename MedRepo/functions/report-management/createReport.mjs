import { nanoid } from 'nanoid';
import DynamoDB from 'aws-sdk/clients/dynamodb.js';

const docClient = new DynamoDB.DocumentClient();

const headers = {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
};

export const createReport = async (event) => {
    try {
        const { refNum , userId, nic, name, status, age, reportUrl } = JSON.parse(event.body);

        if (!refNum||!userId || !nic || !name || !status || !age || !reportUrl) {
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
            }),
        };
    }
};
