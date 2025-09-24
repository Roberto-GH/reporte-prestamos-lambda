
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const sesClient = new SESClient({});
const dynamoDbClient = new DynamoDBClient({});

const { DYNAMODB_TABLE_NAME, SENDER_EMAIL, RECIPIENT_EMAILS } = process.env;

if (!DYNAMODB_TABLE_NAME || !SENDER_EMAIL || !RECIPIENT_EMAILS) {
    throw new Error("Faltan variables de entorno (DYNAMODB_TABLE_NAME, SENDER_EMAIL, RECIPIENT_EMAILS).");
}

const recipients = RECIPIENT_EMAILS.split(',');

export const lambda_handler = async (event, context) => {
    try {        
        const scanParams = {
            TableName: DYNAMODB_TABLE_NAME,
            Limit: 1
        };
        const scanResult = await dynamoDbClient.send(new ScanCommand(scanParams));

        if (!scanResult.Items || scanResult.Items.length === 0) {
            console.log(`No se encontraron registros en la tabla ${DYNAMODB_TABLE_NAME}.`);
            return { statusCode: 404, body: JSON.stringify('No hay datos para reportar.') };
        }
        
        const loan_report_data = unmarshall(scanResult.Items[0]);
        
        let htmlBody = `
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; color: #333; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #dddddd; text-align: left; padding: 8px; }
                th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <h2>Reporte de Préstamos Aprobados</h2>
            <p>A continuación se muestra el resumen del último reporte de préstamos:</p>
            <table>
                <tr>
                    <th>Campo</th>
                    <th>Valor</th>
                </tr>`;

        for (const [key, value] of Object.entries(loan_report_data)) {
            htmlBody += `<tr><td><strong>${key}</strong></td><td>${value}</td></tr>`;
        }

        htmlBody += `
            </table>
            <p>Este es un correo generado automáticamente.</p>
        </body>
        </html>`;
        
        const emailSubject = "Reporte Diario de Préstamos Aprobados";
        const emailParams = {
            Source: SENDER_EMAIL,
            Destination: {
                ToAddresses: recipients
            },
            Message: {
                Subject: {
                    Data: emailSubject,
                    Charset: 'UTF-8'
                },
                Body: {
                    Html: {
                        Data: htmlBody,
                        Charset: 'UTF-8'
                    }
                }
            }
        };

        const emailResult = await sesClient.send(new SendEmailCommand(emailParams));
        console.log(`Correo enviado exitosamente. Message ID: ${emailResult.MessageId}`);
        
        return {
            statusCode: 200,
            body: JSON.stringify('Correo enviado exitosamente.')
        };

    } catch (error) {
        console.error(`Error inesperado: ${error.message}`, error);
        return {
            statusCode: 500,
            body: JSON.stringify(`Error al procesar la solicitud: ${error.message}`)
        };
    }
};
