const { browser_open } = require("../../../ev___tools/f_puppeteer_browser");
const { save_complex_array } = require("../../../ev___tools/f_excel");
const { Workbook } = require("exceljs");
const _ = require("lodash");
const fs = require("fs");
const timeout = ms => new Promise(r => setTimeout(r, ms));
const URL = "https://morpher.ru/Demo.aspx";
const SEL_INPUT = "#ctl00_ctl00_ctl00_BodyPlaceHolder_ContentPlaceHolder1_ContentPlaceHolder1_TextBox1";
const SEL_SUBMIT = "#ctl00_ctl00_ctl00_BodyPlaceHolder_ContentPlaceHolder1_ContentPlaceHolder1_btDecline";
const SEL_QUESTIONS = ".question";
const SEL_ANSWER = ".answer";
//| интервал между перезапусками в случае ошибки загрузки страницы
const RELOAD_DURATION = 120000;
//| время ожидания загрузки страницы
const WAIT_FOR_TIMEOUT = 10000;
const get_response = async (page) => {
    let list_questions = await page.$$eval(SEL_QUESTIONS, list => list.map(el => el.textContent.replace(/\s{2,10}/gi, "")));
    list_questions = list_questions.slice(1, list_questions.length - 1);
    let list_answers = await page.$$eval(SEL_ANSWER, list => list.map(el => el.textContent.replace(/\s{2,10}/gi, "")).filter(el => el.length > 0));
    return list_questions.map((el, i) => {
        return {
            question: el ? el : "",
            answer: list_answers[i] ? list_answers[i] : ""
        };
    });
};
const define_human_name = async (page, input_text) => {
    let flag = true;
    while (flag) {
        try {
            //| заходим на страницу и делаем запрос по имени
            await page.goto(URL, { waitUntil: "domcontentloaded", timeout: WAIT_FOR_TIMEOUT });
            // await page.waitForNetworkIdle({timeout: WAIT_FOR_TIMEOUT});
            let handle = await page.$(SEL_INPUT);
            if (!handle)
                return [];
            await page.evaluate((selector, value) => selector.value = value, handle, input_text);
            await page.click(SEL_SUBMIT);
            await page.waitForNetworkIdle({ timeout: WAIT_FOR_TIMEOUT });
            flag = false;
        }
        catch (err) {
            console.log("\nОшибка ожидания ответа сервера!", "-\tперезапускаю...\n");
            flag = true;
            await timeout(RELOAD_DURATION);
        }
    }
    //| парсим результат
    let res = await get_response(page);
    return res;
};
const get_columns = async (path, sheet, column) => {
    const workbook = new Workbook();
    await workbook.xlsx.readFile(path);
    return workbook.getWorksheet(sheet).columns[column].values;
};
const fill_empty = (value, count) => {
    let counter = count;
    let array = [];
    while ((counter--) > 0) {
        array.push(value);
    }
    return array;
};
const DURATION = 50;
const arrayIsNotEmpty = array => Array.isArray(array) ? Boolean(array.toString().replace(/,/ig, "")) : false;
(async function test() {
    console.log("start test.json.....");
    let browser = await browser_open(true);
    let page = await browser.newPage();
    let path = "all_clear.xlsx";
    let column_buffer_path = "buffer.json";
    let sheet = "Лист1";
    let column;
    if (fs.existsSync(column_buffer_path)) {
        column = JSON.parse(String(fs.readFileSync(column_buffer_path)));
    }
    else {
        column = await get_columns(path, sheet, 5);
    }
    // await save_complex_array("asasasas.xlsx", "data", column)
    let time = performance.now();
    let counter = 2;
    let saveCounter = 0;
    let size = column.length;
    let header = null;
    while (counter < size) {
        let value = column[counter];
        if (value && !Array.isArray(value)) {
            if (!value) {
                column[counter] = fill_empty(null, 7);
            }
            else {
                let response;
                let localTime = performance.now();
                response = await define_human_name(page, value);
                if (!header && response) {
                    header = ["-", ...response.map(el => el.question)];
                    await timeout(DURATION);
                }
                if (response) {
                    column[counter] = [value, ...response.map(el => el.answer)];
                    await timeout(DURATION);
                }
                console.log("локальное время выполнения:", Math.floor(performance.now() - localTime));
            }
            if (++saveCounter >= 10) {
                fs.writeFileSync(column_buffer_path, JSON.stringify(column));
                console.log("data saving...");
                saveCounter = 0;
            }
        }
        console.log("progress:", (++counter) - 2, "/", size - 1, "[" + column[counter - 1].toString().slice(0, 50) + "...]");
    }
    if (header && Array.isArray(header)) {
        column.unshift(header);
    }
    let nullCount = 0;
    let notArrayCount = 0;
    let lowSizeArray = 0;
    let bigSizeArray = 0;
    let norMalSize = 0;
    column.forEach(el => {
        if (!el)
            nullCount++;
        if (el && !Array.isArray(el))
            notArrayCount++;
        if (el && Array.isArray(el) && el.length < 7)
            lowSizeArray++;
        if (el && Array.isArray(el) && el.length > 7)
            bigSizeArray++;
        if (el && Array.isArray(el) && el.length === 7)
            norMalSize++;
    });
    console.log("null элементы:\t", nullCount, "элементы не массивы:\t", notArrayCount, "Массивы < 7:\t", lowSizeArray, "Массивы > 7:\t", bigSizeArray, "Массивы = 7:\t", norMalSize, "Сумма текущих:\t", nullCount + notArrayCount + lowSizeArray + bigSizeArray + norMalSize);
    await save_complex_array("result_excel.xlsx", "sheet", column);
    console.log("lead time (время выполнения):", Math.floor(performance.now() - time));
    await page.close();
    await browser.close();
})();
//# sourceMappingURL=morpher.js.map