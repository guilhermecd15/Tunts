const { google } = require('googleapis');

async function getAuthSheets() {
    const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json',
        scopes: 'https://www.googleapis.com/auth/spreadsheets'
    });

    const client = await auth.getClient();

    const googleSheets = google.sheets({
        version: 'v4',
        auth: client
    });

    const spreadsheetId = '1t7ypwkJOlT2w5XtaqM8NKniweS_yN7BkP9vSu-9AaPU';

    return {
        auth,
        client,
        googleSheets,
        spreadsheetId
    };
};

async function updateSituation() {
    const { googleSheets, auth, spreadsheetId } = await getAuthSheets();

    const { data: { values } } = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: 'engenharia_de_software',
        valueRenderOption: 'UNFORMATTED_VALUE'
    });

    const situantion = [];

    for (var i = 3; i < values.length; i += 1) {
        if (values[i][2] > 15) {
            situantion.push(["Reprovado por Falta", 0]);
        } else {
            const average = (values[i][3] + values[i][4] + values[i][5]) / 3;
            if (average < 50) {
                situantion.push(["Reprovado por Nota", 0]);
            }
            else if (average < 70) {
                const recuperation = 100 - average;
                situantion.push(["Exame Final", recuperation.toFixed(0)]);
            }
            else {
                situantion.push(["Aprovado", 0]);
            };
        };
    };

    googleSheets.spreadsheets.values.update({
        auth,
        spreadsheetId,
        range: 'engenharia_de_software!G4',
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: situantion,
        },
    });
};

updateSituation();
