import {openBrowser} from "../../src/ev___tools/puppeteerBrowser/f_puppeteer_browser.js";
import fs from "fs";
import _ from "lodash";


const existInArray = (array, value) => {
    for (let element of array) if (element === value) return true;
    return false;
}

const clear_EngineString = str => str.split("/")
    .map(el => el.replace(/[^0-9,.]/g, ''))
    .filter(el => el.length > 0)
    .map(el => el.replace(/\.\./g, ""))
    .map(el => el.replace(/,,/g, ""));

const getNumberOfString = str => str.replace(/[^0-9,.]/g, '');

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

const getTextElement = async (page, selector, plug) => await page.$eval(selector, link => link?.textContent).then(data => data).catch(() => plug);

const loadLinksToOffers = async (page) => {
    // "Легковые"
    let priorityGroups = ["Коммерческие"];
    let linksToOffers = [];

    // заходим на главную | получаем все ссылки из header | фильтруем по требования priorityGroups
    await page.goto("https://auto.ru/", {waitUntil: "domcontentloaded"});
    await page.screenshot({path: "test_bot_image.png", fullPage: true});
    let linksToGroupCars = await page.$$eval("div.Header__secondLine a", links => {
        return links.map(link => new Object({href: link.href, textContent: link.textContent}));
    })
    linksToGroupCars = linksToGroupCars.filter(link => existInArray(priorityGroups, link.textContent));

    // обходим группы
    for (let group of linksToGroupCars) {
        // заходим в группу | получаем номер последней страницы | листаем страницы
        await page.goto(group.href, {waitUntil: "domcontentloaded"});
        await page.screenshot({path: "offers_menu.png", fullPage: true});
        let maxPagesCount = await page.$eval("div.ListingCarsPagination span.ControlGroup a:last-child", link => Number(link.textContent));

        for (let i = 1; i < 4; i++) { //  ~maxPagesCount
            try {
                await timeout(500);
                console.log(`loading..... ${group.textContent}: ${i}/${maxPagesCount}`);
                await page.waitForSelector("div.ListingPagination__sequenceControls > a.ListingPagination__next");
                // получаем ссылки на офферы
                let result = await page.$$eval(".ListingItem .ListingItemTitle__link", links => links.map(link => new Object(
                    {href: link.href, textContent: link.textContent}
                )));
                linksToOffers = linksToOffers.concat(result);
                // переходим на следующую страницу
                await page.click("div.ListingPagination div.ListingPagination__sequenceControls > a.ListingPagination__next");
            } catch (err) {
                console.log(`Страница [${i}] пропущена`);
                console.log(err);
                continue;
            }
        }
    }

    return linksToOffers;
}


//| поля карточки
const cardFields = {
    title: {ru: "Наименование", value: null},
    price: {ru: "Цена, руб.", value: null},
    link: {ru: "Источник", value: null},
    year: {ru: "Год выпуска", value: null},
    kmAge: {ru: "Пробег, км.", value: null},
    bodytype: {ru: "Кузов", value: null},
    transmission: {ru: "Тип коробки", value: null},
    state: {ru: "Состояние", value: null},
    capacityEngine: {ru: "Объем двигателя л.", value: null},
    enginePower: {ru: "Мощность двигателя? л.с.", value: null},
    engineType: {ru: "Тип двигателя", value: null}
}


const scrapOffers = async page => {


    const cards = [];
    const plug = "***";

    const linksToOffers = await loadLinksToOffers(page); // загружаем все ссылки на предложения

    for (let i = 0; i < 10; i++) { // бежим по карточкам

        try {
            console.log(`open card [${i + 1}/${linksToOffers.length}]:`, linksToOffers[i].href);
            await page.goto(linksToOffers[i].href, {waitUntil: "domcontentloaded"}); // заходим в карточку
            const card = _.cloneDeep(cardFields);

            //| парсинг цены
            let buff_price = await getTextElement(page, ".OfferPriceCaption__price", plug);
            if (typeof buff_price === "string" && buff_price.length > 0) {
                let buff = buff_price.replace(/[^\d.,]/ig, "");
                if (buff.length > 0) {
                    card.price.value = parseFloat(buff);
                }
            }

            //| парсинг пробега
            let buff_kmAge = await getTextElement(page, ".CardInfoRow_kmAge > span:last-child", plug);
            if (typeof buff_kmAge === "string" && buff_kmAge.length > 0) {
                let buff = buff_kmAge.replace(/[^\d.,]/ig, "");
                if (buff.length > 0) {
                    card.kmAge.value = parseFloat(buff);
                } else {
                    card.kmAge.value = "новый";
                }
            }

            //| определение хар-к двигателя
            let buff_EngineString = await getTextElement(page, ".CardInfoRow_engine > span:last-child > div", plug);
            card.capacityEngine.value = clear_EngineString(buff_EngineString)[0] || plug;
            card.enginePower.value = clear_EngineString(buff_EngineString)[1] || plug;

            //| Заголовок объявления
            card.title.value = await getTextElement(page, ".CardHead__title", plug);

            //| парсинг ссылки
            card.link.value = linksToOffers[i].href;

            //| парсинг года выпуска
            let buffYearsOld = await getTextElement(page, ".CardInfoRow_year > span:last-child > a", plug);
            if (typeof buffYearsOld === "string" && buffYearsOld.length > 0) {
                let buff = buffYearsOld.replace(/[^\d.,]/ig, "");
                if (buff.length > 0) {
                    card.year.value = parseFloat(buff);
                }
            }

            //| кузов
            card.bodytype.value = await getTextElement(page, ".CardInfoRow_bodytype > span:last-child > a", plug);

            //| Тип коробки
            card.transmission.value = await getTextElement(page, ".CardInfoRow_transmission > span:last-child", plug);

            //| состояние автомобиля
            card.state.value = await getTextElement(page, ".CardInfoRow_state > span:last-child", plug);

            //| Тип топлива двигателя
            card.engineType.value = await getTextElement(page, ".CardInfoRow_engine > span:last-child > div > a", plug);

            cards.push(card);

            //| год выпуска
            // card.year.value = await getTextElement(page, ".CardInfoRow_year > span:last-child > a", plug);
            // card.kmAge.value = buff_kmAge === plug ? "Новый" : getNumberOfString(buff_kmAge);

        } catch (err) {
            console.log(`карточка [${linksToOffers[i].href}] пропущена`);
            console.log(err);
            continue;
        }

    }

    // Получаем значения с ключами
    let values = cards.map(bCard => {
        let resultObject = {};
        Object.keys(bCard).map(key => {
            resultObject[key] = bCard[key].value;
        })
        return resultObject;
    });

    //сохраняем данные
    const writerScript = require("../../src/ev___tools/excel/ExcelWriter.js");
    await writerScript.ExcelWriter.writeInExcelX([{
        columnsKeys: Object.keys(cardKeys).map(key => new Object({key: key})),
        columnsDesc: Object.keys(cardKeys).map(key => cardKeys[key].ru),
        rowsData: values,
    }], `data_cars_${Math.floor(11111 + Math.random() * 81111)}.xlsx`);
}

// use mode WithDebug
const getCookie = async (page) => {
    await page.goto("https://auto.ru/", {waitUntil: "networkidle0"});
    let cookie = await page.cookies("https://auto.ru/");
    fs.writeFileSync('cookie.json', JSON.stringify(cookie));
}

(async function a() {

    const w = 1920, h = 1080;
    let browser = await openBrowser(false);
    let page = await browser.newPage();
    await page.setViewport({width: w, height: h, deviceScaleFactor: 0});
    // await getCookie(page) // сохраняем cookie
    let cookie = JSON.parse(fs.readFileSync('cookie.json'));
    await page.setCookie(...cookie);
    await scrapOffers(page);
    await page.close();
    await browser.close();
}())
