const fs = require('fs');
const process = require("process");
const path = require("node:path");
const puppeteer = require('puppeteer-extra');

const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
const adblocker = AdblockerPlugin({
    blockTrackers: true // default: false
})
puppeteer.use(adblocker)

puppeteer.use(require('puppeteer-extra-plugin-stealth')());
const {ExcelWriter} = require("../../src/ev___tools/excel/ExcelWriter.js");
const moment = require("moment");

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

const getDateFromString = str => {
    const keyWords = {
        ["сегодня"]: moment().format("DD/MM/YYYY"),
        ["вчера"]: moment().subtract(1, 'd').format("DD/MM/YYYY"),
        ["Января"]: "01/" + moment().format("YYYY"),
        ["Февраля"]: "02/" + moment().format("YYYY"),
        ["Марта"]: "03/" + moment().format("YYYY"),
        ["Апреля"]: "04/" + moment().format("YYYY"),
        ["Мая"]: "05/" + moment().format("YYYY"),
        ["Июня"]: "06/" + moment().format("YYYY"),
        ["Июля"]: "07/" + moment().format("YYYY"),
        ["Августа"]: "08/" + moment().format("YYYY"),
        ["Сентября"]: "09/" + moment().format("YYYY"),
        ["Октября"]: "10/" + moment().format("YYYY"),
        ["Ноября"]: "11/" + moment().format("YYYY"),
        ["Декабря"]: "12/" + moment().format("YYYY"),
    }

    return str.replace(/\s[^\d\n\s\:A-zА-яЁё><]\s/g, "")
        .replace(/\s\D\s\b[0-2]?[0-9]:[0-5][0-9]\b/, "")
        .split(" ")
        .map(
            word => {
                for (let key in keyWords) {
                    if (key.toLowerCase().indexOf(word.toLowerCase()) !== -1) return keyWords[key];
                }
                return word;
            }
        ).join(".")
        .replace(/^0+/, '')
        .replace(/\//g, '.');
}

const load_links_from_website = async (page) => {
    const mainLinks = [
        {
            name: "Железобетонные",
            url: "https://www.avito.ru/moskva/garazhi_i_mashinomesta/prodam/garazh/zhelezobetonnyy-ASgBAQICAkSYA~QQqAjsVQFAngwU3qsB?localPriority=0",
        },
        {
            name: "Кирпичные",
            url: "https://www.avito.ru/moskva/garazhi_i_mashinomesta/prodam/garazh/kirpichnyy_dom-ASgBAQICAkSYA~QQqAjsVQFAngwU4qsB?localPriority=0",
        },
        {
            name: "Металлические",
            url: "https://www.avito.ru/moskva/garazhi_i_mashinomesta/prodam/garazh/metallicheskiy-ASgBAQICAkSYA~QQqAjsVQFAngwU5qsB?localPriority=0",
        },
    ];
    let garageCardLinks = [];
    for (let link of mainLinks) {

        try {
            await page.goto(link.url);
        } catch (err) {
            console.log("Пропущен", link.name, err);
            continue;
        }

        let maxPages;
        try {
            maxPages = await page.$eval(".pagination-item-JJq_j:nth-last-child(2)", link => link.textContent);
        } catch (err) {
            console.log("Пропущен", link.name, err);
            continue;
        }

        // скрапим ссылки на карточки со всех страниц текущей категории
        for (let i = 1; i < maxPages; i++) {
            console.log(`Скрапинг страничек гаражей (${link.name})....${i}/${maxPages}`);
            let buff;
            try {
                // скрапим
                buff = await page.$$eval(".iva-item-content-rejJg .link-link-MbQDP", links => {
                    return links.map(link => {
                        return {
                            name: link.querySelector("h3").textContent,
                            url: link.href,
                        }
                    })
                });
            } catch (err) {
                console.log("Пропущена страница", i + 1, err);
                continue;
            }

            // добавляем тип гаража
            buff = buff.map(el => {
                return {
                    ...el,
                    type: link.name,
                    price: "",
                    area: "",
                    security: "",
                    description: "",
                    isLoaded: false,
                }
            });

            // консолидируем
            garageCardLinks.push(...buff);

            let flag = true;
            do {
                try {
                    flag = true;
                    await page.goto(`${link.url}&p=${i + 1}`, {waitUntil: 'domcontentloaded'});
                } catch (err) {
                    flag = false;
                    await page.close();
                    page = await browser.newPage();
                    console.log(`Перезагружаю (${link.name})....${i}/${maxPages}`);
                    await timeout(6000);
                }
            } while (!flag)
        }
    }
    return garageCardLinks;
}

const json_to_excel = async (path_json, path_excel) => {
    let buffer = fs.readFileSync(path_json);  // 'student.json'
    let json_data = JSON.parse(buffer);
    let template = {
        columnsKeys: [
            {key: "id"},
            {key: "name"},
            {key: "url"},
            {key: "type"},
            {key: "price"},
            {key: "area"},
            {key: "security"},
            {key: "description"},
            {key: "isLoaded"},
            {key: "id_avito"},
            {key: "date_publication"},
            {key: "address"}
        ],
        columnsDesc: [
            "id",
            "Заголовок",
            "Источник",
            "Тип гаража",
            "Цена, руб.",
            "Площадь, м2",
            "Наличие охраны",
            "Описание",
            "Статус загрузки",
            "id Авито",
            "Дата публикации",
            "Адрес",
        ],
        rowsData: json_data.data
    }
    await ExcelWriter.writeInExcelX(
        [template],
        path_excel,
    );
}

const load_cards = async (page, index, url) => {
    // page.setJavaScriptEnabled(false);
    // собираем данные
    let handle = await page.$(".params-paramsList-zLpAu > li");
    let properties = {
        id: null, id_avito: null, date_publication: null, url: null, price: null,
        address: null, area: null, security: null, description: null
    };
    if (handle) {

        let props;
        // получение параметров объекта
        try {

            props = await page.$$eval(".params-paramsList-zLpAu > li", blocks => blocks.map(el => el.textContent));
            props = props.map(
                el => el.toLowerCase().replace(/[^\d\n\s\:A-zА-яЁё><]/g, "")
                    .replace(/[²\sм]/g, "")
            );

            for (let prop of props) {
                let buff = prop.slice(prop.indexOf(":") + 1);
                if (prop.indexOf("площадь") !== -1) properties.area = buff;
                if ((prop.indexOf("охран") !== -1)) properties.security = buff;
            }

            properties.id_avito = await page.$eval("span[data_source-marker='item-view/item-id']", el => el.textContent);
            properties.date_publication = getDateFromString(await page.$eval("span[data_source-marker='item-view/item-date']", el => el.textContent));
            properties.address = await page.$eval(".style-item-address__string-wt61A", el => el.textContent);

        } catch (err) {
            console.log("Ошибка получения параметров:", url);
            console.log(err);
            return null;
        }


        let price;
        // получение цены объекта
        try {
            price = await page.$eval(".js-item-price", el => el.textContent);
            price = price.replace(/[^\d\n\s\:A-zА-яЁё]/g, "").replace(/\s/g, "");
            properties.price = price;
        } catch (err) {
            console.log("Ошибка получения цены:", url);
            console.log(err);
            return null;
        }

        let description;
        // получение описания объекта
        try {
            description = await page.$eval("div[itemprop=description]", el => el.textContent);
            description = description.replace(/[^\d\n\s\:A-zА-яЁё,.:;]/g, "");
            properties.description = description;
        } catch (err) {
            console.log("Ошибка получения описания:", url);
            console.log(err);
            return null;
        }

        properties.url = url;
        properties.id = null;
        await page.screenshot({fullPage: true, path: `${path.resolve(__dirname)}/images_data/${index}.jpeg`});
        return properties;
    }
}

const get_browser_instance = async (headless) => await puppeteer.launch({
    headless: headless,
    devtools: true,
    // isMobile: true,
    // executablePath: executablePath(),
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    // waitForInitialPage: true,
    slowMo: 35,
    args: ["--disable-setuid-sandbox"],
    'ignoreHTTPSErrors': true
});

(async function get_garage() {

    const data_path = "data_source.json";
    const images_path = "/images_data";
    const excel_path = "/excel_data/file.xlsx";
    const new_load = false;

    // проверяем наличие уже загруженных и определенных ссылок
    if (fs.existsSync(data_path)) {

        let buffer = fs.readFileSync(data_path);
        let json_file = JSON.parse(buffer);
        let all = json_file.data.length;
        if (all <= 0) {
            console.log("Файл с данными пустой! Завершаю процесс.");
            process.exit();
        }
        let all_areLoaded = json_file.data.filter(el => el.isLoaded).length;
        let all_areNotLoaded = all - all_areLoaded;
        console.log("\nОбнаружен файл с данными:");
        console.log("\n\tВсего ссылок:\t", all, "\n\tЗагружено:\t", all_areLoaded, "\n\tОсталось:\t", all_areNotLoaded, "\n");

        // все загружено - завершаем процесс
        if (!all_areNotLoaded) {
            console.log("Файл не требует загрузки/дозагрузки, завершаю процесс.");
            process.exit();
        }
        console.log("\nЗапускаю загрузку остатка.....\n");
        const browser = await get_browser_instance(true);
        let page = await browser.newPage();
        await page.setViewport({width: 1920, height: 1080});

        let counter = 0;

        for (let i = 0; i < all; i++) {
            console.log("\tЗагрузка:", i + 1, "/", all);
            let element = json_file.data[i];

            if (element.isLoaded) continue;

            try {
                //{ waitUntil: 'domcontentloaded' }
                await page.goto(element.url);
            } catch (err) {
                console.log("\tПропущено:", i + 1, "/", all);
                console.log(err);
                continue;
            }

            let card_data = await load_cards(page, element.id, element.url);

            if (card_data === null) {
                console.log("\tПропущено:", i + 1, "/", all);
                continue;
            }
            try {
                json_file.data[i].id = i + 1;
                json_file.data[i]["id_avito"] = card_data.id_avito;
                json_file.data[i]["date_publication"] = card_data.date_publication;
                json_file.data[i]["url"] = card_data.url;
                json_file.data[i]["price"] = card_data.price;
                json_file.data[i]["address"] = card_data.address;
                json_file.data[i]["area"] = card_data.area;
                json_file.data[i]["security"] = card_data.security;
                json_file.data[i]["description"] = card_data.description;
                json_file.data[i]["isLoaded"] = true;
            } catch (err) {
                console.log("какие то проблемы с определением свойств");
                continue;
            }

            counter++;
            if (counter >= 10) {
                console.log("получено 10 записей. Произвожу сохранение....");
                fs.writeFileSync(data_path, JSON.stringify(json_file));
                counter = 0;
                console.log("файл успешно сохранен, продолжаю загрузку");
            }
        }
        await page.close();
        // .... save json file
        fs.writeFileSync(data_path, JSON.stringify(json_file));
        // .... log
        console.log("\nЗагрузка завершена, файл сохранен!");
        all = json_file.data.length;
        all_areLoaded = json_file.data.filter(el => el.isLoaded).length;
        all_areNotLoaded = all - all_areLoaded;
        console.log("\n\tВсего ссылок:\t", all, "\n\tЗагружено:\t", all_areLoaded, "\n\tОсталось:\t", all_areNotLoaded, "\n");
        console.log("Создаю ms_excel файл из json.....")
        await json_to_excel(data_path, "base_from_avito.xlsx");
        process.exit();
    } else {
        console.log("Запускаю загрузку данных\n");
        const browser = await get_browser_instance(false);
        let page = await browser.newPage();
        await page.setViewport({width: 1920, height: 1080});
        let links = await load_links_from_website(page);
        await page.close();
        links = links.map((el, index) => {
            return {
                id: index + 1,
                ...el
            }
        });
        let json_file = {
            data: links,
        }
        console.log("Сохраняю файл.....");
        fs.writeFileSync(data_path, JSON.stringify(json_file));
    }

    console.log("Завершаю процесс.....");
    process.exit();
}())