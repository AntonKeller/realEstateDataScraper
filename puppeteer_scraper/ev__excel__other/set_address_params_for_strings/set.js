const {array_load} = require("../../../src/ev___tools/ms_excel/excel_tools");
const {ExcelWriter} = require("../../../src/ev___tools/excel/ExcelWriter.js")
const {address_params_keys_desc} = require("../../../src/ev___tools/yandex.ru.ru/initial_functions")
const {request_by_params} = require("../../../src/ev___tools/yandex.ru.ru/request_by_params")
const {DEFAULT_YN_REQ_PARAMS} = require("../../../src/ev___tools/yandex.ru.ru/constants");
const {get_city_and_street} = require("../../../src/ev___tools/dadata.ru/requests");

// const API_TOKEN = "apikey=bd9aa639-828c-4fd1-96ce-fc519d09f7d2"; //| - возможно бан
const API_TOKEN = "apikey=3f355b88-81e9-4bbf-a0a4-eb687fdea256";

(async function start() {

    const input_column = 6;
    const input = "work_path/" + "перечень.xlsx";
    const output = "work_path/_" + "перечень.xlsx";
    const sheet = "sheet1";

    let array = await array_load(input, sheet);

    array[0].row.push(...address_params_keys_desc());

    //| старт со второй
    for (let i = 1; i < array.length; i++) {
        if (
            Boolean(array[i]) &&
            Boolean("row" in array[i]) &&
            Boolean(array[i].row[input_column])
        ) {
            console.log("loading...", i, "/", array.length, "\tЗагрузка");
            let response = await request_by_params(API_TOKEN, array[i].row[input_column]);
            array[i].row.push(
                response?.correct_address || null,
                response?.country || null,
                response?.federal_okrug || null,
                response?.region || null,
                response?.isFederalCity || null,
                response?.municipal_okrug || null,
                response?.municipal_raion || null,
                response?.city || null,
                response?.district_city_okrug || null,
                response?.district_raion || null,
                response?.district_mikroraion || null,
                response?.district_section || null,
                response?.street || null,
                response?.house || null,
                response?.geo_lat || null,
                response?.geo_lon || null,
            );
        } else {
            console.log("loading...", i, "/", array.length, "\tПустой -> пропущен");
        }
    }

    //| старт со второй
    for (let i = 1; i < array.length; i++) {
        for (let j = 0; j < array[i].row.length; j++) {
            if (typeof array[i].row[j] == "object" && array[i].row[j]) {
                try {
                    array[i].row[j] = String(array[i].row[j].result);
                } catch {
                    console.log("")
                }
            }
        }
    }


    let result_array = [];

    array.forEach((el, i) => {
        if (el.row.length > 0) {
            try {
                result_array.push(el.row);
            } catch {
                console.log("")
            }
        } else {
            try {
                result_array.push([""]);
            } catch {
                console.log("")
            }

        }
    });

    await ExcelWriter.writeInExcel(result_array, output);
})()