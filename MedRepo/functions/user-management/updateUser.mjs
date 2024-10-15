import DynamoDB from 'aws-sdk/clients/dynamodb.js';

const docClient = new DynamoDB.DocumentClient();

const headers = {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT"
};

export const updateUser = async (event) => {
    const userId = event.pathParameters.id;
    const { firstName, lastName, email, contactnumber, password } = JSON.parse(event.body);

    const updateExpression = [];
    const expressionAttributeValues = {};
    
    // Current timestamp for updatedAt
    const now = new Date().toISOString();
    updateExpression.push('updatedAt = :updatedAt');
    expressionAttributeValues[':updatedAt'] = now;

    if (firstName) {
        updateExpression.push('firstName = :firstName');
        expressionAttributeValues[':firstName'] = firstName;
    }
    if (lastName) {
        updateExpression.push('lastName = :lastName');
        expressionAttributeValues[':lastName'] = lastName;
    }
    if (email) {
        updateExpression.push('email = :email');
        expressionAttributeValues[':email'] = email;
    }
    if (contactnumber) {
        updateExpression.push('contactnumber = :contactnumber');
        expressionAttributeValues[':contactnumber'] = contactnumber;
    }
    if (password) {
        updateExpression.push('password = :password');
        expressionAttributeValues[':password'] = password;
    }

    if (updateExpression.length === 0) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ message: 'No fields to update' }),
        };
    }

    try {
        await docClient.update({
            TableName: 'Users',
            Key: { id: userId },
            UpdateExpression: `SET ${updateExpression.join(', ')}`,
            ExpressionAttributeValues: expressionAttributeValues,
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
            body: JSON.stringify({ message: 'Error updating user. Please try again later.' }),
        };
    }
};
