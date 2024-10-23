import { nanoid } from 'nanoid';
import DynamoDB from 'aws-sdk/clients/dynamodb.js';
import AWS from 'aws-sdk';

const docClient = new DynamoDB.DocumentClient();
const sns = new AWS.SNS();

const headers = {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
};

export const createReport = async (event) => {
    try {
        const { refNum, userId, nic, name, status, age, reportUrl } = JSON.parse(event.body);

        // Validate input fields
        if (!refNum || !userId || !nic || !name || !status || !age || !reportUrl) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ message: 'Missing required fields' }),
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

        // Get the user's notification preferences
        const { Item: user } = await docClient.get({
            TableName: 'Users',
            Key: { id: userId },
        }).promise();

        // If email notification is enabled, publish a message to SNS
        if (user?.emailNotification) {
            await sns.publish({
                TopicArn: 'arn:aws:sns:us-east-1:724772054324:UploadReportNotificationTopic',
                Message: JSON.stringify({
                    email: user.email,
                    reportId,
                    reportUrl,
                }),
            }).promise();
        }

        // If SMS notification is enabled, send SMS
        if (user?.smsNotification && user.contactnumber) {
            await sns.publish({
                TopicArn: 'arn:aws:sns:us-east-1:724772054324:UploadReportNotificationTopic',
                Message: JSON.stringify({
                    phoneNumber: user.contactnumber,
                    reportId,
                    reportUrl,
                }),
                MessageAttributes: {
                    'AWS.SNS.SMS.SMSType': {
                        DataType: 'String',
                        StringValue: 'Transactional'
                    }
                }
            }).promise();
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: 'Report created successfully',
                reportId,
            }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                message: 'Error creating report',
                error: error.message,
            }),
        };
    }
};
