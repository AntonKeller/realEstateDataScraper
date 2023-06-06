const { save_complex_array, column_load } = require("../../../ev___tools/f_excel");
const { browser_open } = require("../../../ev___tools/f_puppeteer_browser");
const fs = require("fs");
const URL = "https://tamali.net/instrument/text/sklonenie-fio/";
const LOADED_CONFIG = { waitUntil: "domcontentloaded", timeout: 30000 };
const S_TITLES = "#result table tr td:nth-child(1)"; //| Падеж (список)
const S_VALUES = "#result table tr td:nth-child(3)"; //| Значение (список)
const S_SUBMIT = ".block-service button"; //| Кнопка результата
const S_INPUT = "input[name=val]"; //| Поле ввода ФИО
const start_search = async (path) => {
    let jsonData; //| json array box
    if (fs.existsSync(path)) {
        jsonData = JSON.parse(String(fs.readFileSync(path)));
    }
    else {
        jsonData = await column_load("all_clear.xlsx", "Лист1", 6);
        jsonData = jsonData.map(FIO => {
            return { FIO: FIO, sub: {}, isLoad: false };
        });
    }
    const browser = await browser_open(true);
    const page = await browser.newPage();
    await page.goto(URL, LOADED_CONFIG);
    let inputHandle = await page.$(S_INPUT);
    let saveCounter = 0;
    let arrayTimes = [];
    //| ........
    for (let i = 0; i < jsonData.length; i++) {
        if (!jsonData[i] ||
            !jsonData[i].FIO ||
            jsonData[i].FIO.length <= 0 ||
            jsonData[i].FIO.split(" ").length !== 3 ||
            jsonData[i].isLoad)
            continue;
        let time = performance.now();
        try {
            //| заходим, поулчаем данные
            await page.evaluate((selector, value) => selector.value = value, inputHandle, jsonData[i].FIO);
            await page.click(S_SUBMIT);
            await page.waitForSelector("#result");
            let titlesBox = await page.$$eval(S_TITLES, titles => titles.map(title => title.textContent));
            let valuesBox = await page.$$eval(S_VALUES, titles => titles.map(title => title.textContent));
            //| обрезаем массивы, уравниваем по ширине
            if (titlesBox.length > valuesBox.length)
                titlesBox.length = valuesBox.length;
            if (titlesBox.length < valuesBox.length)
                valuesBox.length = titlesBox.length;
            //| записываем данные
            jsonData[i].sub["titles"] = titlesBox;
            jsonData[i].sub["names"] = valuesBox;
            jsonData[i].isLoad = true;
            //| увеличиваем счетчик загруженных данных, сохраняем буффер по необходимости.
            saveCounter++;
            if (saveCounter > 500) {
                fs.writeFileSync(path, JSON.stringify(jsonData));
            }
            arrayTimes.push(Math.floor(performance.now() - time));
            if (arrayTimes.length >= 50) {
                //| выводим дополнительно среднее время
                let overageTime = Math.floor(arrayTimes.reduce((first, second) => (first + second)) / arrayTimes.length);
                arrayTimes = [];
                console.log("loading.....", i + 1, "/", jsonData.length, "time:\t", Math.floor(performance.now() - time), "overage time:\t", overageTime);
            }
            else {
                //| выводим обычное время
                console.log("loading.....", i + 1, "/", jsonData.length, "time:\t", Math.floor(performance.now() - time));
            }
        }
        catch (err) {
            //| произошла ошибка, уведомляем, пропускаем запись.
            console.log("В текщуей записи произошла ошибка. Входной параметр:", jsonData[i].FIO, "\nОшибка:", err);
        }
    }
    //| всегда сохраняем буффер в конце.
    fs.writeFileSync(path, JSON.stringify(jsonData));
    console.log("load is done!");
    let subData = [];
    let flag = false;
    jsonData.forEach((el, i) => {
        if (el && el.sub && el.sub.titles) {
            if (!flag) {
                subData.push(el.sub.titles);
                flag = true;
            }
            else
                subData.push(el.sub.names || []);
        }
        else
            subData.push([]);
    });
    await save_complex_array("excel_result.xlsx", "sheet", subData);
    console.log("save is done!");
    await page.close();
    await browser.close();
};
//| Склоняет ФИО
//|
(async function start() {
    await start_search("buffer.json");
})();
//# sourceMappingURL=morpher.js.map