const fs = require("fs");
const puppeteer = require("puppeteer-extra");
const extraPluginStealth = require('puppeteer-extra-plugin-stealth')();
const {ExcelWriter} = require("../../src/legacy_excel_module/ExcelWriter");
const moment = require("moment");

puppeteer.use(extraPluginStealth);

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

const NAVIGATE_CONFIG = {waitUntil: "domcontentloaded"}
// export type PuppeteerLifeCycleEvent =
// | 'load'
// | 'domcontentloaded'
// | 'networkidle0'
// | 'networkidle2';


//| Принимает:
//|     1. параметр скрытого режима.
//| Запускает браузер в скрытом режиме.
const browserOpen = async (headless = false) => await puppeteer.launch({
    headless: headless,
    isMobile: true,
    // executablePath: executablePath(),
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    //| waitForInitialPage: true,
    //| slowMo: 10,
    args: ["--disable-setuid-sandbox"],
    'ignoreHTTPSErrors': true
});


const parse_date_from_string = str => {
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
        .split(" ").map(
            word => {
                for (let key in keyWords) {
                    if (key.toLowerCase().indexOf(word.toLowerCase()) !== -1) return keyWords[key];
                }
                return word;
            }
        ).join(".").replace(/^0+/, '').replace(/\//g, '.');
}


const initial_card = (
    _id = null,
    _url = null,
    _id_avito = null,
    _date_publication = null,
    _price = null,
    _address = null,
    _area = null,
    _security = null,
    _description = null,
) => {
    return {
        id: _id,
        url: _url,
        id_avito: _id_avito,
        date_publication: _date_publication,
        price: _price,
        address: _address,
        area: _area,
        security: _security,
        description: _description
    }
}


//| парсит карточку
//|     1. id - id записи
//|     2. page - объект "страница" puppeteerBrowser
//|     3. url - адрес карточки
//|
//|

const parse_card = async (id, page, url, dir) => {

    let card = initial_card(id, url);

    await page.goto(url, NAVIGATE_CONFIG);

    let handle = await page.$(".params-paramsList-zLpAu");

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
                if (prop.indexOf("площадь") !== -1) card.area = buff;
                if ((prop.indexOf("охран") !== -1)) card.security = buff;
            }

            card.id_avito = await page.$eval(
                "span[data_source-marker='item-view/item-id']",
                el => el.textContent.replace(/\D/gi, "")
            );

            card.date_publication = parse_date_from_string(
                await page.$eval("span[data_source-marker='item-view/item-date']",
                    el => el.textContent)
            );

            card.address = await page.$eval(".style-item-address__string-wt61A", el => el.textContent);

        } catch (err) {
            console.log("Ошибка получения параметров:", url);
            console.log(err);
            return null;
        }


        try {
            // получение цены объекта
            card.price = await page.$eval(".js-item-price", el => el.getAttribute("content"))
        } catch (err) {
            console.log("Ошибка получения цены:", url);
            console.log(err);
            return null;
        }

        // получение описания объекта
        try {
            card.description = await page.$eval(
                "div[itemprop=description]",
                el => el.textContent.replace(/[^\d\n\s\:A-zА-яЁё,.:;]/g, "")
            );
        } catch (err) {
            console.log("Ошибка получения описания:", url);
            console.log(err);
            return null;
        }

        const screen_params = {
            fullPage: true,
            path: dir + "images/" + card.id + "_" + card.id_avito + ".jpeg"
        }

        if (!fs.existsSync(dir + "images/")) {
            //| создаем директорию для сейва
            fs.mkdirSync(dir + "images/");
        }

        try {
            await page.screenshot(screen_params);
        } catch (err) {
            console.log("Ошибка создания скриншота\n");
            console.log(err);
            return null;
        }

        return card;
    }

    return null;
}


//| определяет кол-во страниц с предложениями и кол-во предложений
//| принимает:
//|     1. открытую страницу "page" от библиотеки puppeteerBrowser.
//|     2. Ссылку на первую страницу с предложениями.

const get_pages_count = async (page, first_url) => {

    //| лимит предложений на 1 стр.
    const MAX_OFFERS_ON_PAGE = 50;

    //| security
    const security_response = ".firewall-container"

    //| селектор найденых предложений.
    const OFFERS_COUNT_TAG = "span[data_source-marker='page-title/count']";

    //| заходим на страницу.
    await page.goto(first_url, NAVIGATE_CONFIG);

    let security_handle = await page.$(security_response);
    if (security_handle) {
        await page.reload()
    }

    //| селектор не найден на странице -> выходим с null.
    if (!Boolean(await page.$(OFFERS_COUNT_TAG))) return null;

    //| получаем кол-во предложений.
    let o_count = parseInt(await page.$eval(
        OFFERS_COUNT_TAG,
        selector => selector.textContent.replace(/\D/, "")
    ));

    //| возвращаем объект.
    return {
        //| получаем кол-во страниц.
        pages_count: Math.ceil(o_count / MAX_OFFERS_ON_PAGE),
        offers_count: o_count,
    }

}


//| Генерирует ссылки на страницы.
//| принимает:
//|     1. "base_url" - базовую ссылку без параметра страницы.
//|     2. "pages_count" - общее кол-во страниц.

const page_links_generator = (base_url, pages_count) => {
    const MAX_PAGES = 100; //| максимальное кол-во страниц на авито
    const max = pages_count > MAX_PAGES ? MAX_PAGES : pages_count;
    const array = [];
    for (let i = 1; i <= max; i++) {
        if (base_url.indexOf("?") !== -1 && base_url[base_url.length] !== "?") {
            array.push(base_url + "&p=" + i);
        } else if (base_url.indexOf("?") !== -1 && base_url[base_url.length] === "?") {
            array.push(base_url + "p=" + i);
        } else {
            array.push(base_url + "?p=" + i);
        }
    }
    return array;
}


//| сборщик ссылок на карточки со страницы предложений.
//| входные параметры:
//|     1. "page" открытую страницу из библиотеки puppeteerBrowser
//|     2. "страницу" с которой требуется собрать.

const scrape_card_links = async page => {

    const CARD_LINK_SELECTOR = ".items-items-kAJAg[data_source-marker='catalog-serp'] " +
        ".iva-item-content-rejJg .iva-item-titleStep-pdebR a";

    //| получаем массив ссылок.
    let array = await page.$$eval(
        CARD_LINK_SELECTOR,
        links => links.map(a => a.href)
    );

    //| возвращаем
    return array || [];
}


//| инициализирует хранилище данных
//| принимает:
//|     start_url - стартовый url
//|     p_buffer_path - буффер для промежуточного сохранения данных

const init_box_data = (p_start_url = null, p_buffer_path = "buffer.json") => {
    return {
        start_url: p_start_url,     //| стартовый url.
        pages: [],                  //| массив страничек с данными.
        buffer_path: p_buffer_path, //| буффер для промежуточного сохранения.
        isDone: null                //| загружен полностью
    }
};


//| инициализирует объект страницу (хранит: ссылки на карточки)

const init_page = (p_url = null) => {
    return {
        url: p_url,
        cards: [],
        isLoad: null
    }
}


//| инициализирует объект "карточка"

const init_card = (p_url = null) => {
    return {
        url: p_url,
        parse: null,
        isParse: null,
    }
}


//| парсит карточки гаражей с авито.ру в виде,
//| массива json объектов необработанных карточек.
//| принимает:
//|     1. Browser от библиотеки Puppeteer.
//|     2. Ссылку на первую страницу с предложениями.
//| возвращает:
//|     1. json массив необработанных карточек.

const parse_cards_by_first_page = async (page, first_url, dir = "default/") => {


    if (!fs.existsSync(dir)) {
        //| создаем директорию для сейва
        fs.mkdirSync(dir);
    }

    //| определяем директорию буффера
    const buffer_path = dir + "buffer.json";

    let box_data;
    let response;
    let pages_count;

    if (fs.existsSync(buffer_path)) {
        //| загружаем буффер
        box_data = JSON.parse(String(fs.readFileSync(buffer_path)));
    } else {

        //| инициализация хранилища
        box_data = init_box_data(first_url, buffer_path);

        //| определяем кол-во страниц
        response = await get_pages_count(page, first_url);

        if (!response) return [];

        //| записываем кол-во страниц.
        pages_count = response.pages_count;
    }

    //| получаем текущий url.
    let cur_url = page.url();

    if (!box_data.pages || box_data.pages.length <= 0) {

        //| генерируем ссылки на страницы, если их нет
        let buff_pages = page_links_generator(cur_url, pages_count);
        box_data.pages = buff_pages.map(page => init_page(page));
        fs.writeFileSync(buffer_path, JSON.stringify(box_data));

    }


    for (let i = 0; i < box_data.pages.length; i++) {

        if (box_data.pages[i].isLoad) continue;

        //| заносим url в переменную
        let url = box_data.pages[i].url;

        console.log("loading page:", i + 1, "/", box_data.pages.length, "- загрузка.....");

        try {

            if (!box_data.pages[i].cards || box_data.pages[i].cards.length <= 0) {

                //| переходим на первую страницу
                if (i !== 0) {
                    await page.goto(url, NAVIGATE_CONFIG);
                }

                //| получаем список ссылок на карточки
                let buff_card_links = await scrape_card_links(page);

                //| формируем из них хранилища карточек
                box_data.pages[i].cards = buff_card_links.map(card_link => init_card(card_link));

                //| сохраняем
                fs.writeFileSync(buffer_path, JSON.stringify(box_data));

            }

            for (let j = 0; j < box_data.pages[i].cards.length; j++) {

                if (box_data.pages[i].cards[j] && !box_data.pages[i].cards[j].isParse) {

                    console.log("\t\tparse... card:", j + 1, "/", box_data.pages[i].cards.length);

                    try {
                        //| парсим
                        box_data.pages[i].cards[j].parse = await parse_card(
                            `page${i + 1}_offer${j + 1}`,
                            page, box_data.pages[i].cards[j].url,
                            dir
                        );
                    } catch (err) {
                        console.log("\t\tparse... card:", j + 1, "/", box_data.pages[i].cards.length, '- пропущен');
                        continue;
                    }

                    await timeout(1200 + 10 * Math.random());

                    //| устанавливаем статус полной загрузки карточки
                    box_data.pages[i].cards[j].isParse = true;

                    //| сохраняем
                    fs.writeFileSync(buffer_path, JSON.stringify(box_data));

                    console.log("\t\tparse... card:", j + 1, "/", box_data.pages[i].cards.length, '- успешно');
                }
            }

            //| устанавливаем статус полной загрузки страницы с карточками
            box_data.pages[i].isLoad = true;

            //| сохраняем
            fs.writeFileSync(buffer_path, JSON.stringify(box_data));

            console.log("load... page:", i + 1, "/", box_data.pages.length, "- завершено");
        } catch (err) {
            console.log("load... page:", i + 1, "/", box_data.pages.length, "- завершено с ошибкой");
            console.log("err\n", err);
        }

    }

    return box_data || [];
}

(async function test() {

})()
