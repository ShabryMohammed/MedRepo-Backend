import AWS from 'aws-sdk';
import DynamoDB from 'aws-sdk/clients/dynamodb.js';

const sns = new AWS.SNS();
const docClient = new DynamoDB.DocumentClient();

const headers = {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT"
};

// Topic ARNs for SNS
const emailTopicArn = 'arn:aws:sns:us-east-1:724772054324:EmailTopic';
const smsTopicArn = 'arn:aws:sns:us-east-1:724772054324:SMSTopic';

// Function to list and unsubscribe from SNS
const unsubscribeFromSNS = async (topicArn, endpoint) => {
    try {
        const subscriptions = await sns.listSubscriptionsByTopic({ TopicArn: topicArn }).promise();
        console.log('Subscriptions:', subscriptions); // Log the subscriptions
        
        // Find the subscription with the matching endpoint (email or phone)
        const subscription = subscriptions.Subscriptions.find(sub =>
            sub.Endpoint === endpoint && sub.SubscriptionArn !== 'PendingConfirmation'
        );

        if (subscription) {
            // Unsubscribe the user
            await sns.unsubscribe({ SubscriptionArn: subscription.SubscriptionArn }).promise();
            console.log(`Successfully unsubscribed from ${topicArn} with endpoint ${endpoint}`);
        } else {
            console.log(`No active subscription found for ${endpoint} on ${topicArn}`);
        }
    } catch (error) {
        console.error('Error unsubscribing from SNS:', error);
    }
};

export const updateUser = async (event) => {
    const userId = event.pathParameters.id;
    const {
        firstName,
        lastName,
        email,
        contactnumber,
        password,
        smsNotification,
        emailNotification,
        lightMode,
        darkMode,
        textSize,
        highContrast,
        lowContrast,
        screenReader
    } = JSON.parse(event.body);

    const updateExpression = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};
    
    // Current timestamp for updatedAt
    const now = new Date().toISOString();
    updateExpression.push('#updatedAt = :updatedAt');
    expressionAttributeValues[':updatedAt'] = now;
    expressionAttributeNames['#updatedAt'] = 'updatedAt';

    try {
        // Retrieve current user data from DynamoDB
        const { Item: user } = await docClient.get({
            TableName: 'Users',
            Key: { id: userId },
        }).promise();

        // Email subscription handling
        if (emailNotification !== undefined && emailNotification !== user.emailNotification) {
            if (emailNotification) {
                // Subscribe the user to the email topic
                await sns.subscribe({
                    TopicArn: emailTopicArn,
                    Protocol: 'email',
                    Endpoint: user.email // Use the existing email in the database
                }).promise();
                console.log('User subscribed to email notifications.');
            } else {
                // Unsubscribe the user directly from SNS without storing the ARN
                await unsubscribeFromSNS(emailTopicArn, user.email);
            }
            updateExpression.push('#emailNotification = :emailNotification');
            expressionAttributeValues[':emailNotification'] = emailNotification;
            expressionAttributeNames['#emailNotification'] = 'emailNotification';
        }

        // SMS subscription handling
        if (smsNotification !== undefined && smsNotification !== user.smsNotification) {
            if (smsNotification) {
                // Subscribe the user to the SMS topic
                await sns.subscribe({
                    TopicArn: smsTopicArn,
                    Protocol: 'sms',
                    Endpoint: user.contactnumber // Use the existing contact number in the database
                }).promise();
                console.log('User subscribed to SMS notifications.');
            } else {
                // Unsubscribe the user directly from SNS without storing the ARN
                await unsubscribeFromSNS(smsTopicArn, user.contactnumber);
            }
            updateExpression.push('#smsNotification = :smsNotification');
            expressionAttributeValues[':smsNotification'] = smsNotification;
            expressionAttributeNames['#smsNotification'] = 'smsNotification';
        }

        // Add other fields to be updated
        if (firstName) {
            updateExpression.push('#firstName = :firstName');
            expressionAttributeValues[':firstName'] = firstName;
            expressionAttributeNames['#firstName'] = 'firstName';
        }
        if (lastName) {
            updateExpression.push('#lastName = :lastName');
            expressionAttributeValues[':lastName'] = lastName;
            expressionAttributeNames['#lastName'] = 'lastName';
        }
        if (email) {
            updateExpression.push('#email = :email');
            expressionAttributeValues[':email'] = email;
            expressionAttributeNames['#email'] = 'email';
        }
        if (contactnumber) {
            updateExpression.push('#contactnumber = :contactnumber');
            expressionAttributeValues[':contactnumber'] = contactnumber;
            expressionAttributeNames['#contactnumber'] = 'contactnumber';
        }
        if (password) {
            updateExpression.push('#password = :password');
            expressionAttributeValues[':password'] = password;
            expressionAttributeNames['#password'] = 'password';
        }
        if (lightMode !== undefined) {
            updateExpression.push('#lightMode = :lightMode');
            expressionAttributeValues[':lightMode'] = lightMode;
            expressionAttributeNames['#lightMode'] = 'lightMode';
        }
        if (darkMode !== undefined) {
            updateExpression.push('#darkMode = :darkMode');
            expressionAttributeValues[':darkMode'] = darkMode;
            expressionAttributeNames['#darkMode'] = 'darkMode';
        }
        if (textSize !== undefined) {
            updateExpression.push('#textSize = :textSize');
            expressionAttributeValues[':textSize'] = textSize;
            expressionAttributeNames['#textSize'] = 'textSize';
        }
        if (highContrast !== undefined) {
            updateExpression.push('#highContrast = :highContrast');
            expressionAttributeValues[':highContrast'] = highContrast;
            expressionAttributeNames['#highContrast'] = 'highContrast';
        }
        if (lowContrast !== undefined) {
            updateExpression.push('#lowContrast = :lowContrast');
            expressionAttributeValues[':lowContrast'] = lowContrast;
            expressionAttributeNames['#lowContrast'] = 'lowContrast';
        }
        if (screenReader !== undefined) {
            updateExpression.push('#screenReader = :screenReader');
            expressionAttributeValues[':screenReader'] = screenReader;
            expressionAttributeNames['#screenReader'] = 'screenReader';
        }

        // Update the user record in DynamoDB
        await docClient.update({
            TableName: 'Users',
            Key: { id: userId },
            UpdateExpression: `SET ${updateExpression.join(', ')}`,
            ExpressionAttributeValues: expressionAttributeValues,
            ExpressionAttributeNames: expressionAttributeNames,
            ReturnValues: 'ALL_NEW'
        }).promise();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'User updated successfully' }),
        };
    } catch (error) {
        console.error('Error updating user:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                message: 'Error updating user. Please try again later.',
            }),
        };
    }
};
