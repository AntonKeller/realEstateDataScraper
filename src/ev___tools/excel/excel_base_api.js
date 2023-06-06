import Workbook from "exceljs";

//| параметр по умолчанию двумерный массив
//|
const DEFAULT_COMPLEX_ARRAY = [
    ["1_1", "1_2", "1_3"],
    ["2_1", "2_2", "2_3"],
    ["3_1", "3_2", "3_3"]
]


//| параметр по умолчанию входной адрес файла
//|
const DEFAULT_INPUT_PATH = "default_input.xlsx";


//| параметр по умолчанию выходной адрес файла
//|
const DEFAULT_OUTPUT_PATH = "default_output.xlsx";

//| параметр по умолчанию двумерный массив
//|
const DEFAULT_SHEET_NAME = "default";


//| параметр по умолчанию двумерный массив
//|
const DEFAULT_ROW_OR_COLUMN_NUMBER = 1;


//| открывает и читает файл | возвращает объект excel вкладку
//|
export const open_sheet = async (
    byFilePath = DEFAULT_INPUT_PATH,
    byExcelSheet = DEFAULT_SHEET_NAME
) => {
    const workbook = new Workbook.Workbook();
    await workbook.xlsx.readFile(byFilePath);
    return workbook.getWorksheet(byExcelSheet);
}


//| получает столбец в виде массива по его номеру начиная с 1.
//|
export const array_load = async (
    inputPath = DEFAULT_INPUT_PATH,
    sheetName = DEFAULT_SHEET_NAME
) => {
    const array = [];
    const sheet = await open_sheet(inputPath, sheetName);
    sheet.eachRow(
        {includeEmpty: true},
        async (row, rowNumber) => {
            array.push({
                rowNumber: rowNumber,
                row: row.values,
            })
        })
    return array;
}


//| получает столбец в виде массива по его номеру начиная с 1.
//|
export const load_column = async (
    inputPath,
    sheetName,
    columnNumber
) => {
    let sheet = await open_sheet(inputPath, sheetName);
    return sheet.columns[columnNumber - 1].values;
}

export const load_columns = async (
    inputPath,
    sheetName,
    colStart,
    colEnd
) => {
    let result = [];
    let sheet = await open_sheet(inputPath, sheetName);
    let counter = colStart;
    if (counter > 0) {
        while (counter <= colEnd) {
            if (
                sheet.columns[counter - 1] &&
                "values" in sheet.columns[counter - 1]
            ) {
                result.push(sheet.columns[counter - 1].values);
            }
            counter++;
        }
        return result;
    } else {
        return [];
    }
}


//| получает строку в виде массива по её номеру начиная с 1.
//|
export const load_row = async (
    inputPath = DEFAULT_INPUT_PATH,
    sheetName = DEFAULT_SHEET_NAME,
    rowNumber = 1
) => {
    const complex_array = await array_load(inputPath, sheetName);
    return complex_array[rowNumber - 1] ? complex_array[rowNumber - 1].row.filter(el => el).map(el => el) : [];
}

//| получает столбец в виде массива по его номеру начиная с 1.
//|
export const load_rows = async (
    inputPath = DEFAULT_INPUT_PATH,
    sheetName = DEFAULT_SHEET_NAME,
    rowNumber = 1
) => {
    const complex_array = await array_load(inputPath, sheetName);
    let result = complex_array.map(el => el.row);
    return result ? result : [];
}

//| стандартный font для строк
//|
const defaultFont = {
    name: "PT Sans",
    family: 4,
    size: 9,
}

const defaultAlignment = {vertical: 'middle', horizontal: 'left'};


//| сохраняет двумерный массив в файл excel
//|
export const save_array = async (
    outputPath = DEFAULT_OUTPUT_PATH,
    sheetName = DEFAULT_SHEET_NAME,
    array = DEFAULT_COMPLEX_ARRAY,
    rowsFontHandler = row => row.font = defaultFont
) => {
    // const workbook = new Workbook();
    const workbook = new Workbook.Workbook();
    const params = {properties: {defaultColWidth: 18}};
    workbook.addWorksheet(sheetName, params).addRows(array);
    let workSheet = workbook.getWorksheet(sheetName);
    //| ... styling
    let firstLineFlag = true;
    for (let i = 0; i <= workSheet.rowCount; i++) {
        let bRow = workSheet.getRow(i);
        if (i === 1) {
            bRow.font = {...defaultFont, bold: true};
            bRow.alignment = {vertical: 'middle', horizontal: 'left', wrapText: true}
        } else {
            bRow.alignment = defaultAlignment;
            if (bRow && bRow.hasValues) {
                rowsFontHandler(bRow, firstLineFlag);
                // if (firstLineFlag) firstLineFlag = false;
            }
        }
    }

    let formatNumber = "_-* # ##0\\ _₽_-;-* # ##0\\ _₽_-;_-* \"-\" _₽_-;_-@_-";
    let formatNumbers = [23, 30, 33, 34, 43, 51, 53]
    formatNumbers.forEach(el => {
        workSheet.getColumn(el).numFmt = formatNumber;
    })

    //|.........................................................
    workbook.xlsx.writeFile(outputPath).catch(err => {
        console.log(err.message);
    });
}


//| установка стилей
//|
export const setStyles = async (
    path,
    sheetName = "sheet",
    rowsFontHandler = row => row.font = defaultFont
) => {
    const workbook = new Workbook.Workbook();
    await workbook.xlsx.readFile(path);
    let workSheet = workbook.getWorksheet(sheetName);
    let firstLineFlag = true;
    //| remove empty columns

    //| set styles
    for (let i = 0; i <= workSheet.rowCount; i++) {
        let bRow = workSheet.getRow(i);
        bRow.alignment = defaultAlignment;
        if (bRow && bRow.hasValues) {
            rowsFontHandler(bRow, firstLineFlag);
            if (firstLineFlag) firstLineFlag = false;
        }
    }
    await workbook.xlsx.writeFile(path);
}

// (async function test_modifyFile() {
//     const path = "Шаблон недвига.xlsx";
//     const workbook = new Workbook();
//     await workbook.xlsx.readFile(path);
//     let sheet = workbook.getWorksheet("аналоги");
//     sheet.addRow([
//         "111111111111111111111111111111111111111",
//         "222222222222222222222222222222222222222",
//         "333333333333333333333333333333333333333",
//         "444444444444444444444444444444444444444",
//         "555555555555555555555555555555555555555",
//     ]);
//
//     // let rows = sheet.getRows(1, sheet.rowCount);
//     // rows = rows.map(row => row.values);
//     // rows
//
//
//     await workbook.xlsx.writeFile(path);
//
//     // const array = [];
//     // const sheet = await open_sheet(inputPath, sheetName);
//     // sheet.eachRow(
//     //     {includeEmpty: true},
//     //     async (row, rowNumber) => {
//     //         array.push({
//     //             rowNumber: rowNumber,
//     //             row: row.values,
//     //         })
//     //     })
//     // return array;
//
//
//     console.log("");
// })()

// (async function test_1() {
//     let result = await load_columns("","", 1, 10);
//     console.log("");
// })()


// (async function test_2() {
//     await save_complex_array(
//         path.join(__dirname, "/tests/text_save_array.xlsx"), "sheet1");
//     console.log("");
// })()


// (async function test_3() {
//     await setStyles("output.xlsx", "sheet");
//     console.log("");
// })()