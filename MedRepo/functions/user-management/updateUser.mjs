import AWS from 'aws-sdk';
import DynamoDB from 'aws-sdk/clients/dynamodb.js';

const docClient = new DynamoDB.DocumentClient();

const headers = {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT"
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

        // Update email notification preference
        if (emailNotification !== undefined && emailNotification !== user.emailNotification) {
            updateExpression.push('#emailNotification = :emailNotification');
            expressionAttributeValues[':emailNotification'] = emailNotification;
            expressionAttributeNames['#emailNotification'] = 'emailNotification';
        }

        // Update SMS notification preference
        if (smsNotification !== undefined && smsNotification !== user.smsNotification) {
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
