const { column_load } = require("../../../ev___tools/f_excel");
const { ExcelWriter } = require("../../../ev___tools/ExcelWriter");
const { yan_api_req_by_params } = require("../../../ev___tools/f_yandex_api");
// const API_TOKEN_1 = "apikey=bd9aa639-828c-4fd1-96ce-fc519d09f7d2";
// const API_TOKEN_2 = "apikey=3f355b88-81e9-4bbf-a0a4-eb687fdea256";
const translate = word => {
    const obj = {
        input_address: "Входной адрес",
        correct_address: "Скорректированный адрес",
        federal_okrug: "Федеральный округ",
        region: "Регион",
        isFederalCity: "Город федерального значения",
        municipal_okrug: "Муниципальный округ",
        city: "Город",
        district_city_okrug: "Городской округ",
        district_raion: "Район",
        district_mikroraion: "Микрорайон",
        district_section: "Районная секция",
        street: "Улица",
        house: "Дом",
        geo_lat: "Широта",
        geo_lon: "Долгота",
    };
    return word in obj ? obj[word] : word;
};
//| определяем характеристики по адресу.
//|
(async function coordinator() {
    let consolidate = [];
    let column_number = 6;
    let addresses = await column_load("work_path/input_coordinates.xlsx", "sheet1", column_number);
    addresses = addresses.slice(3, 10);
    let count = 0;
    for (let address of addresses) {
        consolidate.push({
            input_address: address,
            ...(await yan_api_req_by_params("apikey=bd9aa639-828c-4fd1-96ce-fc519d09f7d2", address))
        });
        console.log("loading.....", ++count, "/", addresses.length);
    }
    if (consolidate.length > 0) {
        let template = {
            columnsKeys: Object.keys(consolidate[0]).map(key => {
                return { key: key };
            }),
            columnsDesc: Object.keys(consolidate[0]).map(key => translate(key)),
            rowsData: consolidate,
        };
        await ExcelWriter.writeInExcelX(template, "output/test_excel_file_result.xlsx");
    }
})();
//# sourceMappingURL=coordinator.js.map