
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);
};

const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
};

const fieldDisplayNames = {
    lastUpdated: "Última Actualización",
    numberOfLoans: "Número de Préstamos",
    totalAmount: "Monto Total"    
};

export const generateHtmlReport = (loan_report_data) => {
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
        if (key === 'reportId') {
            continue;
        }
        const displayName = fieldDisplayNames[key] || key;
        let formattedValue = value;
        if (key === 'totalAmount') {
            formattedValue = formatCurrency(value);
        } else if (key === 'lastUpdated') {
            formattedValue = formatDate(value);
        }
        htmlBody += `<tr><td><strong>${displayName}</strong></td><td>${formattedValue}</td></tr>`;
    }

    htmlBody += `
        </table>
        <p>Este es un correo generado automáticamente.</p>
    </body>
    </html>`;

    return htmlBody;
};
