import AWS from 'aws-sdk';

const sns = new AWS.SNS();

export const sendSmsNotification = async (event) => {
    try {
        // Parse the SNS message to get the necessary information
        const snsMessage = event.Records[0].Sns.Message;
        const { phoneNumber, reportId, reportUrl } = JSON.parse(snsMessage);

        // Define SMS parameters
        const params = {
            Message: `Your report (ID: ${reportId}) has been created. Report URL: ${reportUrl}`,
            PhoneNumber: phoneNumber,
        };

        // Send SMS using SNS
        await sns.publish(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'SMS sent successfully' }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to send SMS', error: error.message }),
        };
    }
};
