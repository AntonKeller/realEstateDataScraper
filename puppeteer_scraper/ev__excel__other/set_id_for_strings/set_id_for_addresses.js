const {get_city_and_street} = require("../../../src/ev___tools/dadata.ru/requests.js");
const {column_load} = require("../../../src/ev___tools/ms_excel/excel_tools.js");
const {ExcelWriter} = require("../../../src/ev___tools/excel/ExcelWriter.js")

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));


let a = {
    header_num: 1,

    col_nums: [1, 3, 16, 17, 18, 19, 20]

    //     {col_num: "1", description: ""},
    //     {col_num: "3", description: ""},
    //     {col_num: "16", description: ""},
    //     {col_num: "17", description: ""},
    //     {col_num: "18", description: ""},
    //     {col_num: "19", description: ""},
    //     {col_num: "20", description: ""},
    // ]
};


//| расставляет id адресам с одинаковыми улицами
(async function id_setter_by_address() {

    const file_path = __dirname + "/Выборка.xlsx";
    const work_sheet = "Выборка";

    let columns_2 = {
        ["id"]: 1,
        ["address"]: 3,
        ["height"]: 16,
        ["technical_condition"]: 17,
        ["electricity"]: 18,
        ["central_heating"]: 19,
        ["viewing_hole"]: 20
    }

    //| читаем столбцы из ms_excel

    for (let key in columns_2) {
        let b_col_num = columns_2[key];
        let b_rows = await column_load(file_path, work_sheet, b_col_num);
        columns_2[key] = {
            col_num: b_col_num,
            // rows: b_rows.slice(1, b_rows.length),
            title: b_rows.slice(0, 1).toString(),
            rows: b_rows.slice(1, 5),
        }
    }

    //| определяем равенство длинны всех столбцов для дальнейшей обработки.
    //| все столбцы должны быть одинаковой длинны
    //| сделаем хранилище ключей размеров

    let object_keys_sizes = {};

    for (let key in columns_2) {
        object_keys_sizes[columns_2[key].rows.length] = null;
    }

    if (Object.keys(object_keys_sizes).length === 1) {

        //| делаем запросы на корректировку ареса

        for (let i = 0; i < columns_2["address"].rows.length; i++) {

            let b_param = columns_2["address"].rows[i];
            let b_response = await get_city_and_street(b_param);
            //| добавляем ключи и массив rows к ним.
            Object.keys(b_response).forEach(key => {
                if (Boolean(key in columns_2)) {
                    columns_2[key].rows.push(b_response[key]);
                } else {
                    columns_2[key] = {rows: []};
                    columns_2[key].rows.push(b_response[key]);
                }
            });
            console.log("progress:", i + 1, "/", columns_2["address"].rows.length);
            await timeout(30);
        }

    } else throw "загруженные столбцы разных размеров!"


    //| вытаскиваем значения

    let data = [];

    for (let key of columns_2) {

        data.push({})
    }


    //| создаем темплейт
    let template = {
        columnsKeys: Object.keys(columns_2).map(el => new Object({key: el})),
        columnsDesc: Object.keys(columns_2).map(el => {
            if ("title" in columns_2[el]) return columns_2[el].title
            else return el
        }),
        rowsData: [],
    }


    // //| доабвляем id для записей
    // let count = 1;
    // for (let key in key_box) {
    //
    //     for (let i = 0; i < key_box[key].length; i++) {
    //         key_box[key][i].unit = count;
    //         template.rowsData.push(key_box[key][i]);
    //     }
    //     count++;
    // }

    //| превращаем названия в ключи.
    await ExcelWriter.writeInExcelX(template, "output.xlsx");


    console.log("")
})()