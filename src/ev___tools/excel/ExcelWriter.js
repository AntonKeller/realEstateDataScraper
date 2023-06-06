const Excel = require('@nbelyh/exceljs');

const F_XLSX = "xlsx";
const F_CSV = "csv";

let defaultTemplate = {
    columnsKeys: [{key: "title_1"}, {key: "title_2"}],
    columnsDesc: ["Заголовок 1", "Заголовок 2"],
    rowsData: [
        {
            title_1: "data_source first title",
            title_2: "data_source second title",
        },
    ],
}

const ExcelWriter = {

    writeInExcel: async (
        complex_array = [["default"]["default"]],
        file_name = "defaultFileName",
        params = {properties: {defaultColWidth: 18}},
    ) => {



        const workbook = new Excel.Workbook();
        workbook.addWorksheet('data', params).addRows(complex_array);
        workbook.xlsx.writeFile(file_name).catch(err => {
            console.log(err.message);
        });

    },

    writeInExcelX: async (
        template = defaultTemplate,
        fileName = "default.xlsx",
        params = {properties: {defaultColWidth: 18, tabColor: {argb: 'FF00FF00'}}},
    ) => {

        const workbook = new Excel.Workbook();
        workbook.company = 'everest consulting';

        const worksheet = await workbook.addWorksheet(template.sheetName, params);
        worksheet.columns = template.columnsKeys;
        worksheet.addRow(template.columnsDesc);
        worksheet.addRows(template.rowsData);

        if (worksheet.rowCount > 0) {
            worksheet.getRow(1).font = {
                name: 'Calibri',
                color: {argb: '00000000'},
                family: 2,
                size: 12,
                bold: true
            };

            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern:'solid',
                fgColor:{argb:'E1FEFF'},
            };

            worksheet.getRow(1).border = {
                // top: {style: 'thin', color: {argb: '00000000'}},
                // left: {style: 'thin', color: {argb: '00000000'}},
                bottom: {style: 'thin', color: {argb: '00000000'}},
                // right: {style: 'thin', color: {argb: '00000000'}}
            };
        }



        await workbook.xlsx.writeFile(fileName).catch(err => {
            console.log(err.message);
        });

    }
}


module.exports = {
    ExcelWriter,
    F_XLSX,
    F_CSV,
};