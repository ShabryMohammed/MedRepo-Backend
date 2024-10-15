import DynamoDB from 'aws-sdk/clients/dynamodb.js';

const docClient = new DynamoDB.DocumentClient();

const headers = {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "http://localhost:3000",
    "Access-Control-Allow-Methods": "OPTIONS,GET",
};

export const getUserReport = async (event) => {
    try {
        const { refNum, nic, name, age } = JSON.parse(event.body);

        if (!refNum || !nic || !name || !age) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    message: 'Missing required fields: refNum, nic, name, and age are required',
                }),
            };
        }

        const params = {
            TableName: 'Reports',
            FilterExpression: '#refNum = :refNum and #nic = :nic and #name = :name and #age = :age',
            ExpressionAttributeNames: {
                '#refNum': 'refNum',
                '#nic': 'nic',
                '#name': 'name',
                '#age': 'age',
            },
            ExpressionAttributeValues: {
                ':refNum': refNum,
                ':nic': nic,
                ':name': name,
                ':age': age,
            },
        };

        const data = await docClient.scan(params).promise();

        if (data.Items.length === 0) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({
                    message: 'No report found with the provided information',
                }),
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: 'Report retrieved successfully',
                report: data.Items[0], // Returning the first match
            }),
        };
    } catch (error) {
        console.error('Error retrieving report:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                message: 'Error retrieving report. Please try again later.',
            }),
        };
    }
};
