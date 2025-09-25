
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({});
const { SENDER_EMAIL, RECIPIENT_EMAILS } = process.env;

if (!SENDER_EMAIL || !RECIPIENT_EMAILS) {
    throw new Error("Faltan variables de entorno (SENDER_EMAIL, RECIPIENT_EMAILS).");
}

const recipients = RECIPIENT_EMAILS.split(',');

export const sendReportEmail = async (htmlBody) => {
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
    return emailResult;
};
