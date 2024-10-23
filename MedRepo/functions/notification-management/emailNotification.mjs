import AWS from 'aws-sdk';

const ses = new AWS.SES();

export const sendEmailNotification = async (event) => {
    try {
        // Parse the SNS message to get the necessary information
        const snsMessage = event.Records[0].Sns.Message;
        const { email, reportId, reportUrl } = JSON.parse(snsMessage);

        // Define email parameters
        const params = {
            Source: 'shabry967@gmail.com',
            Destination: {
                ToAddresses: [email],
            },
            Message: {
                Subject: {
                    Data: `Your Report (ID: ${reportId}) has been created`,
                },
                Body: {
                    Text: {
                        Data: `Dear User,\n\nYour report has been successfully created.\n\nReport URL: ${reportUrl}\n\nThank you, MedRepo Team`,
                    },
                },
            },
        };

        // Send email using SES
        const result = await ses.sendEmail(params).promise();
        console.log('Email sent successfully:', result);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Email sent successfully' }),
        };
    } catch (error) {
        console.error('Error sending email:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to send email', error: error.message }),
        };
    }
};
