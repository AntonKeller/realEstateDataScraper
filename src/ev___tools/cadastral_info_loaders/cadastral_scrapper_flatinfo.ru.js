import {browserOpen} from "../puppeteerBrowser/f_puppeteer_browser.js";

const timeout = ms => new Promise(r => setTimeout(r, ms));
const INPUT_SELECTOR = ".search-home_show .form-control";


export const scrapInfoByAddressFromFlatinfo = async (page, address) => {

    let objectBox = {
        cadNumber: {value: null, description: "Кадастровый номер"},
        commonArea: {value: null, description: "Общая площадь"},
        fiasCode: {value: null, description: "Код ФИАС"},
        kladrCode: {value: null, description: "Код адреса КЛАДР"},
        unomCode: {value: null, description: "Код адреса UNOM"},
        seriesType: {value: null, description: "Типовая серия"},
        appointment: {value: null, description: "Назначение"},
    }

    try {
        const url = "https://flatinfo.ru/";
        await page.goto(url, {waitUntil: "load", timeout: 15000});
        await page.setViewport({width: 2000, height: 2000, deviceScaleFactor: 4});

        //| поле поиска
        let inputHandle = await page.$(INPUT_SELECTOR);
        if (!inputHandle) return {};

        await page.evaluate((selector, value) => {
            selector.value = value;
            // let element = document.querySelector(".search-home_show .form-control")
            // element.value = value
        }, inputHandle, address);

        await page.type(INPUT_SELECTOR, " ");
        await timeout(400);

        await page.evaluate(() => {
            const button = document.querySelector(".search-home_show button");
            const event = new MouseEvent("click", {
                bubbles: true,
                cancelable: true,
                view: window
            });
            button.dispatchEvent(event);
        });

        //| ожидание
        await page.waitForNetworkIdle({idleTime: 100, timeout: 15000});

        //| парсинг характеристик
        let response = await page.$$eval(".row_house .fi-surface ul li", list_li => {
            return list_li.map(li => {
                let title = li.querySelector("span:first-child").textContent.replace(/[\t\n\s]+/ig, " ").trim();
                let value = li.querySelector("span:last-child").textContent.replace(/[\t\n\s]+/ig, " ").trim();
                return {
                    title: title,
                    value: value,
                };
            });
        });

        //| определяем кадатсровый номер
        let cadNumber = response.filter(el => el.title.match(/кадастровый номер/ig));
        if (Array.isArray(cadNumber) && cadNumber.length > 0) {
            objectBox.cadNumber.value = cadNumber[0].value;
        }


        //| определяем общую площадь
        let commonArea = response.filter(el => el.title.match(/общая площадь/ig));
        if (Array.isArray(commonArea) && commonArea.length > 0) {
            objectBox.commonArea.value = commonArea[0].value;
        }

        //| определяем фиас код
        let fiasCode = response.filter(el => el.title.match(/фиас/ig));
        if (Array.isArray(fiasCode) && fiasCode.length > 0) {
            objectBox.fiasCode.value = fiasCode[0].value;
        }

        //| определяем Код адреса КЛАДР
        let kladrCode = response.filter(el => el.title.match(/КЛАДР/ig));
        if (Array.isArray(kladrCode) && kladrCode.length > 0) {
            objectBox.kladrCode.value = kladrCode[0].value;
        }

        //| определяем Код адреса UNOM
        let unomCode = response.filter(el => el.title.match(/UNOM/ig));
        if (Array.isArray(unomCode) && unomCode.length > 0) {
            objectBox.unomCode.value = unomCode[0].value;
        }

        //| определяем Типовая серия
        let seriesType = response.filter(el => el.title.match(/типовая серия/ig));
        if (Array.isArray(seriesType) && seriesType.length > 0) {
            objectBox.seriesType.value = seriesType[0].value;
        }

        //| Назначение
        let appointment = response.filter(el => el.title.match(/назначение/ig));
        if (Array.isArray(appointment) && appointment.length > 0) {
            objectBox.appointment.value = appointment[0].value;
        }

    } catch (err) {
        console.log(err, "Ошибка");
    }
    return objectBox;
}


(async function test() {
    let browser = await browserOpen(true);
    let page = await browser.newPage();
    let data = await scrapInfoByAddressFromFlatinfo(page, "Россия, Москва, улица Вешних Вод, 14С3");
    console.log("")
})()