const {save_array, load_rows} = require("../../ev___tools/excel/f_excel.js");
const {descriptions_parse} = require("../../ev___tools/f_description_parse_regular");
const fs = require("fs");

(async function test() {

    //| загружаем массив данных
    let data_loaded = await load_rows(
        "base_from_avito.xlsx",
        "sheet1"
    );

    //| Добавим id
    for (let i = 0; i < data_loaded.length; i++) {
        data_loaded[i] = [...data_loaded[i]];
        if (i === 0) {
            data_loaded[i] = ["id", ...data_loaded[i]];
        } else {
            data_loaded[i] = [i, ...data_loaded[i]];
        }
    }

    const descriptionIndex = 9;

    let workingArray = data_loaded;
    // //| убираем дубли, создаем рабочий массив
    // let buffer_object = {};
    // for (let i = 0; i < data_loaded.length; i++) {
    //     let description = data_loaded[i][descriptionIndex]; //| под 8 номером
    //     if (description && typeof description === "string") {
    //         let key = description.toLowerCase().replace(/[\n\\n\\t\t\s+,.=+:;_""''!?()-\/\\]+/ig);
    //         if (!(key in buffer_object)) {
    //             buffer_object[key] = "";
    //             workingArray.push(data_loaded[i]);
    //         }
    //     }
    // }

    let consolidate = [];
    for (let i = 0; i < workingArray.length; i++) {
        consolidate.push(
            "----------------------------------------------------------------------------------------------------------------" +
            workingArray[i][9] +
            "----------------------------------------------------------------------------------------------------------------\n\n");
    }

    fs.writeFileSync("text.txt", JSON.stringify(consolidate));


    //| получаем данные по описанию
    for (let i = 0; i < workingArray.length; i++) {
        console.log("parse:", i, "/", workingArray.length);
        let description = workingArray[i][descriptionIndex];
        if (description) {
            let response = descriptions_parse(description);
            if (i === 0) {
                let header = Object.keys(response).map(key => response[key].description);
                workingArray[i] = [...workingArray[i], ...header];
            } else {
                let array = Object.keys(response).map(key => response[key].value);
                workingArray[i] = [...workingArray[i], ...array];
            }
        }
    }

    //| сохраняем результат
    await save_array("output_avito.xlsx", "sheet", workingArray);
})()