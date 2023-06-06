const {Workbook} = require("exceljs");
const {ExcelWriter} = require("../../../src/ev___tools/excel/ExcelWriter.js");
const fs = require("fs");
const path = require("path");
const Excel = require("@nbelyh/exceljs");

const merge_sheets = async (path) => {

    let workbook = new Workbook();
    await workbook.xlsx.readFile(path);
    let data = [];

    for (let work_sheet of workbook.worksheets) {

        let sheet_id = work_sheet.id;
        let buff_sheet = workbook.getWorksheet(sheet_id);
        buff_sheet.eachRow({includeEmpty: false}, async row => {
            data.push(row.values)
        })

    }

    workbook = null;


    let buff_size = Math.ceil(data.length / 8);
    let start = 0, end = buff_size;
    let flag;
    while (!flag) {
        let buff_data = data.slice(start, end);
        if (buff_data.length <= 0) break;
        start = end + 1;
        end += buff_size + 1;
        const work_book_result = new Workbook();
        work_book_result.company = 'everest consulting';
        work_book_result.addWorksheet("consolidate").addRows(buff_data);
        work_book_result.xlsx.writeFile(`all_merge_${start}_${end}.xlsx`).catch(err => {
            console.log(err.message);
        });
    }

    return true;
}


(async function merge() {
    await merge_sheets("/all.xlsx");
})()