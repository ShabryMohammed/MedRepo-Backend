import AWS from 'aws-sdk';
import DynamoDB from 'aws-sdk/clients/dynamodb.js';

const sns = new AWS.SNS();
const docClient = new DynamoDB.DocumentClient();

const EMAIL_TOPIC_ARN = 'arn:aws:sns:us-east-1:724772054324:EmailTopic'; // Replace with your topic ARN

export const handler = async (event) => {
    const { userId, reportId } = JSON.parse(event.body);

    try {
        console.log('Received event:', event);  // Log the entire event for debugging

        // Fetch user details for notification
        const userResult = await docClient.get({
            TableName: 'Users',
            Key: { id: userId },
        }).promise();

        const user = userResult.Item;
        console.log('Fetched user:', user);  // Log user details

        if (!user) {
            console.error(`User not found for userId: ${userId}`);
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'User not found' }),
            };
        }

        // Notify the user if email notifications are enabled
        if (user.emailNotification) {
            console.log('Sending email notification to:', user.email);
            await sns.publish({
                TopicArn: EMAIL_TOPIC_ARN,
                Message: `Your report is ready. Report ID: ${reportId}`,
                Subject: 'Report Ready Notification',
                MessageAttributes: {
                    'userEmail': {
                        DataType: 'String',
                        StringValue: user.email,
                    },
                },
            }).promise();
            console.log('Email notification sent successfully.');
        } else {
            console.log('Email notification not enabled for user:', userId);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Email notification sent successfully.' }),
        };
    } catch (error) {
        console.error('Error sending email notification:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error sending email notification.',
                error: error.message,  // Log the error message for debugging
            }),
        };
    }
};
