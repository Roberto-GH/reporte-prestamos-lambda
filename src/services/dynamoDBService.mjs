
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const dynamoDbClient = new DynamoDBClient({});
const { DYNAMODB_TABLE_NAME } = process.env;

if (!DYNAMODB_TABLE_NAME) {
    throw new Error("Falta la variable de entorno DYNAMODB_TABLE_NAME.");
}

export const getLatestLoanReport = async () => {
    const scanParams = {
        TableName: DYNAMODB_TABLE_NAME,
        Limit: 1
    };
    const scanResult = await dynamoDbClient.send(new ScanCommand(scanParams));

    if (!scanResult.Items || scanResult.Items.length === 0) {
        console.log(`No se encontraron registros en la tabla ${DYNAMODB_TABLE_NAME}.`);
        return null;
    }
    
    return unmarshall(scanResult.Items[0]);
};
