import AWS from 'aws-sdk';
import DynamoDB from 'aws-sdk/clients/dynamodb.js';

const sns = new AWS.SNS();
const docClient = new DynamoDB.DocumentClient();

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

        // Log user details to ensure correct data is being fetched
        console.log('User details:', user);

        // Notify the user if SMS notifications are enabled
        if (user.smsNotification) {
            console.log('Sending SMS to:', user.contactnumber);
            const result = await sns.publish({
                PhoneNumber: user.contactnumber,  // Send SMS directly to the user's phone number
                Message: `Your report is ready. Report ID: ${reportId}`,
            }).promise();

            // Log the result from SNS
            console.log('SNS publish result:', result);
        } else {
            console.log('SMS notification not enabled for user:', userId);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'SMS notification sent successfully.' }),
        };
    } catch (error) {
        console.error('Error sending SMS notification:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error sending SMS notification.',
                error: error.message,  // Log the error message for debugging
            }),
        };
    }
};
