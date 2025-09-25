import { getLatestLoanReport } from './src/services/dynamoDBService.mjs';
import { generateHtmlReport } from './src/utils/reportGenerator.mjs';
import { sendReportEmail } from './src/services/emailService.mjs';

export const lambda_handler = async (event, context) => {
    try {
        const loan_report_data = await getLatestLoanReport();

        if (!loan_report_data) {
            return { statusCode: 404, body: JSON.stringify('No hay datos para reportar.') };
        }
        
        const htmlBody = generateHtmlReport(loan_report_data);
        
        await sendReportEmail(htmlBody);
        
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