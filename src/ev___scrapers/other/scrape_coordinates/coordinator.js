import {yan_api_req_by_params} from "../../../ev___tools/yandex.ru/f_yandex_api.js";
import {load_column} from "../../../ev___tools/excel/excel_base_api.js";
import {save_array} from "../../../ev___tools/excel/excel_base_api.js";
import _ from "lodash";
import fs from "fs";

// const API_TOKEN_1 = "apikey=bd9aa639-828c-4fd1-96ce-fc519d09f7d2";
// const API_TOKEN_2 = "apikey=3f355b88-81e9-4bbf-a0a4-eb687fdea256";

// correctAddress: {value: null, description: "Полный скорректированный адрес"},
// country: {value: null, description: "Страна"},
// federalOkrug: {value: null, description: "Федеральный округ"},
// region: {value: null, description: "Регион"},
// isFederalCity: {value: null, description: "Является федеральным городом"},
// municipalOkrug: {value: null, description: "Муниципальный округ"},
// municipalRaion: {value: null, description: "Муниципальный район"},
// city: {value: null, description: "Город"},
// citySettlement: {value: null, description: "Городское поселение"},
// cityOkrug: {value: null, description: "Административный округ"},
// cityRaion: {value: null, description: "Административный район"},
// cityMikroraion: {value: null, description: "Микрорайон"},
// section: {value: null, description: "Квартал"},
// street: {value: null, description: "Улица"},
// house: {value: null, description: "Дом"},
// lat: {value: null, description: "Широта"},
// lon: {value: null, description: "Долгота"},


//| определяем характеристики по адресу.
//|
(async function coordinator() {

    let sheetName = "Лист1";
    let fileInput = "input/work_path.xlsx";
    let fileOutput = "output/result.xlsx";
    let api = "apikey=bd9aa639-828c-4fd1-96ce-fc519d09f7d2";
    let box = [];

    if (fs.existsSync(fileInput)) {

        let columns = await load_column(fileInput, sheetName, 1);
        columns = columns.slice(2, columns.length);
        let max = columns.length;
        for (let i = 0; i < max; i++) {
            console.log("loading...", i, "/", max);
            let el = columns[i];
            let response = await yan_api_req_by_params(api, el);
            if (i <= 0) {
                box.unshift(Object.values(response).map(el => el.description))
            }
            box.push(Object.values(response).map(el => el.value))
        }

        await save_array(fileOutput, sheetName, box);
    }
})()