const {executablePath} = require('puppeteer')
const puppeteer = require('puppeteer-extra');
const fs = require("fs");
const {indexesLevenshtejn} = require("../../src/algorithms/compare_index_levenshtejn");
const writerScript = require("../../src/ev___tools/excel/ExcelWriter.js");
const auto_card = require("./avtoru_card_structure")
puppeteer.use(require('puppeteer-extra-plugin-stealth')());


const get_browser_instance = async () => await puppeteer.launch({
    headless: false,
    isMobile: true,
    executablePath: executablePath(),
    // waitForInitialPage: true,
    slowMo: 30,
    args: ["--disable-setuid-sandbox"],
    'ignoreHTTPSErrors': true
});

const getTextElement = async (page, selector, plug) => await page.$eval(selector, link => link?.textContent).then(data => data).catch(() => plug);

const clear_EngineString = str => str.split("/")
    .map(el => el.replace(/[^\d,.]/g, ''))
    .filter(el => el.length > 0)
    .map(el => el.replace(/\.\./g, ""))
    .map(el => el.replace(/,,/g, ""));
//0-9 -> \d
const getNumberOfString = str => str.replace(/[^\d,.]/g, '');

const car_page_scrapper = async (page, url) => {

    const plug = "***";
    await page.goto(url);

    let buff_price = await getTextElement(page, ".OfferPriceCaption__price", plug);
    let buff_kmAge = await getTextElement(page, ".CardInfoRow_kmAge > span:last-child", plug);
    let buff_EngineString = await getTextElement(page, ".CardInfoRow_engine > span:last-child > div", plug);

    return {
        title: await getTextElement(page, ".CardHead__title", plug),
        price: buff_price === plug ? plug : getNumberOfString(buff_price),
        link: url,
        year: await getTextElement(page, ".CardInfoRow_year > span:last-child > a", plug),
        kmAge: buff_kmAge === plug ? "Новый" : getNumberOfString(buff_kmAge),
        bodytype: await getTextElement(page, ".CardInfoRow_bodytype > span:last-child > a", plug),
        transmission: await getTextElement(page, ".CardInfoRow_transmission > span:last-child", plug),
        state: await getTextElement(page, ".CardInfoRow_state > span:last-child", plug),
        capacityEngine: clear_EngineString(buff_EngineString)[0] || plug,
        enginePower: clear_EngineString(buff_EngineString)[1] || plug,
        engineType: await getTextElement(page, ".CardInfoRow_engine > span:last-child > div > a", plug)
    };
};

const paramsForTester = {
    // число, массив интервал или набор точных дат
    // если массив и одно число то дата
    // если массив и два числа - то интервал
    // если массив и более двух чисел - то набор точных дат
    year_interval: null, // интервал год: [2001, 2010], опредленная дата: [2021]
    body: null, // кузов: седан / лифтбек / ...
    engineType: null, // тип двигателя: бензин / дизель / ...
    kmAge: null, // пробег, км: [50 000, 100 000] / ...
    capacityEngine: null, // объем двигателя, л.: [3, 4.5] / ...
    enginePower: null, // мощность двигателя, л.с: [135.5, 145] / ...

}

const car_data_tester = (car, paramsForTester) => {
    return true;
}

const scrap_cars = (page, link, paramsForTester, byCount = 3) => new Promise(async resolve => {

    let currentPageLink = link;
    await page.goto(currentPageLink);
    let resultCars = []; // итоговое хранилище протестированных аналогов
    let counterCarsIsDone = 0;

    // заходим в группу | получаем номер последней страницы
    let maxPagesCount = await getTextElement(page, "div.ListingCarsPagination span.ControlGroup a:last-child", "1");

    for (let i = 1; i <= maxPagesCount; i++) { //  ~maxPagesCount
        try {

            if (maxPagesCount > i) {
                // ждем, пока загрузится кнопка перехода на слд страницу.
                await page.waitForSelector("div.ListingPagination__sequenceControls > a.ListingPagination__next");
            }

            currentPageLink = await page.url();

            // получаем ссылки на офферы текущей страницы
            let offers = await page.$$eval(
                ".ListingItem .ListingItemTitle__link",
                links => links.map(link => new Object({href: link.href, textContent: link.textContent}))
            );

            // пробегаемся по офферам | каждый загружаем, тестируем, добавляем.
            for (let j = 1; j < offers.length; j++) {
                try {
                    // let carData = ;
                    // const testIsDone = await car_data_tester(carData);
                    // if (testIsDone) {
                    resultCars.push(await car_page_scrapper(page, offers[j - 1].href));
                    counterCarsIsDone++;
                    // }
                    if (counterCarsIsDone >= byCount) break;
                } catch (err) {
                    console.log(`карточка [${offers[j].href}] пропущена`);
                    console.log(err);
                    continue;
                }
            }

            if (counterCarsIsDone >= byCount) break;

        } catch (err) {
            console.log(`Страница [${i}] пропущена`);
            console.log(err);
            // continue;
        } finally {
            await page.goto(currentPageLink);
            if (maxPagesCount > i) {
                // переходим на следующую страницу
                await page.waitForSelector("a.ListingPagination__next");
                await page.click("a.ListingPagination__next");
            }
        }
    }

    resolve(resultCars.length > 0 ? resultCars : null);
});

const scrap_model_from_brand_page = (page, brand, priorityCar) => new Promise(async resolve => {

    await page.goto(brand.link);

    if (await page.$(".ListingPopularMMM__expandLink")) {
        await page.click(".ListingPopularMMM__expandLink");
    }

    // получаем все модели для текущего бренда авто
    let models = await page.$$eval(".ListingPopularMMM  .ListingPopularMMM__column .ListingPopularMMM__item", blocks => {
        return blocks.map(block => {
            return {
                name: block.querySelector("a").textContent,
                count: block.querySelector("div").textContent,
                link: block.querySelector("a").href,
            }
        })
    });

    // объекденяем наименование бренда и модели
    models = models.map(model => {
        return {
            ...model,
            name: `${brand.name} ${model.name}`,
        }
    });

    // повторяем анализ совпадения наименований
    // получаем индексы (отсортированные по возрастанию)
    models = models.map(model => new Object({
        ...model,
        indexes: indexesLevenshtejn(priorityCar, model.name)
    }));

    // сортируем по возрастанию
    models = models.sort((a, b) => a.indexes.length > b.indexes.length ? 1 : -1);

    // уравниваем массивы по длинне
    if (models.length > 1) {

        for (let i = 0; i < models.length; i++) {
            models[i].indexes.length = models[0].indexes.length;
            models[i]["sumIndexes"] = 0;
        }

        for (let i = 0; i < models.length; i++) {
            models[i]["sumIndexes"] = models[i].indexes.reduce((acc, val) => val === 0 ? acc + 1 : acc + 0);
        }
    }

    // теперь сортируем по возрастанию сумм индексов
    models = models.sort((a, b) => a.sumIndexes > b.sumIndexes ? -1 : 1);

    // возвращаем первую модель в списке
    if (models.length < 1) resolve(null);
    resolve(models[0]);
});

const scrap_brand_from_main_page = (page, priorityCar) => new Promise(async resolve => {

    await page.goto("https://auto.ru/rossiya/");

    // разворащиваем список машин если большой
    if (await page.$(".IndexMarks__show-all")) {

        await page.click(".IndexMarks__show-all");
    }

    // получаем список всех бреендов
    let carBrands = await page.$$eval(
        ".IndexMarks__marks-with-counts a.IndexMarks__item",
        links => links.map(link => new Object({
            name: link.querySelector(".IndexMarks__item-name").textContent,
            count: link.querySelector(".IndexMarks__item-count").textContent,
            link: link.href,
        }))
    )

    // фильтруем марки автомобилей по ливенштейну |
    // текущий подход может быть не точен, однако дает возможность не заходить на другие страницы |
    // аналогичный подход с переходами по ссылкам, с последующим составлением полных имен и фильтров может быть более точен. |
    // сравниваем бренды на сайте с входящим брендом по Ливенштейну. | определим сумму элементов матрицы индексов для каждой пары
    // и добавим значение как параметр объекта
    // подход с составлением матрицы индексов позволяет сравнить сложные строки с множеством слов.
    // алгоритм следующий:
    // - определяем матрицы индексов
    // - укорачиваем матрицы по самому маленькому
    // - суммируем и получаем индекс для каждого, после чего фильтруем по возрастанию и забираем самый маленький индекс.

    // получаем индексы (отсортированные по возрастанию)
    carBrands = carBrands.map(brand => new Object({
        ...brand,
        indexes: indexesLevenshtejn(priorityCar, brand.name)
    }));

    // сортируем по возрастанию длины массивая индексов
    carBrands = carBrands.sort((a, b) => a.indexes.length > b.indexes.length ? 1 : -1);

    // уравниваем массивы по длинне
    if (carBrands.length > 1) {

        for (let i = 0; i < carBrands.length; i++) {
            carBrands[i].indexes.length = carBrands[0].indexes.length;
            carBrands[i]["sumIndexes"] = 0;
        }

        for (let i = 0; i < carBrands.length; i++) {
            carBrands[i]["sumIndexes"] = carBrands[i].indexes.reduce((acc, val) => val === 0 ? acc + 1 : acc + 0);
        }
    }

    // теперь сортируем по возрастанию сумм индексов
    carBrands = carBrands.sort((a, b) => a.sumIndexes > b.sumIndexes ? 1 : -1);

    // ИЗ ЗА ТОГО ЧТО СУММА ИНДЕКСОВ МОЖЕТ БЫТЬ ПОХОЖА ВОЗНИКАЮТ ОШИБКИ
    // ТРЕБУЕТСЯ СДЕЛАТЬ ОСОБУЮ ПРИВЯЗКУ, УЧЕСТЬ НУЛИ В СРАВНЕНИИ МАССИВОВ В ФИЛЬТРАХ И СОРТИРОВКАХ

    // теперь нужно взять первый бренд авто и по нему искать (он больше всех похож на наш)
    if (carBrands.length < 1) resolve(null);

    resolve(carBrands[0]);
});

const scraper_cars = async (page, priority_car = "Toyota camry") => {

    await page.setCookie(...JSON.parse(fs.readFileSync('cookie.json')));
    const brand = await scrap_brand_from_main_page(page, priority_car); // 1 ссылка
    const model = await scrap_model_from_brand_page(page, brand, priority_car); // 1 ссылка нас траницу с модельным рядом
    console.log(priority_car, "определилась как:\n", "бренд:\t", brand.name, "модель:\t", model.name);
    return await scrap_cars(page, model.link, {});

};

const consolidator_cars_data = async (analogArray) => {
    let threeCars = [];
    const browser = await get_browser_instance();
    const page = await browser.newPage();

    for (let i = 0; i < analogArray.length; i++) {
        let buff = await scraper_cars(page, analogArray[i].nameCar);
        buff = buff.map(car => new Object({analogueID: analogArray[i].excelID, ...car}));
        threeCars = threeCars.concat(...buff);
    }
    return threeCars;
}

const get_Hash = () => Math.floor(11111 + Math.random() * 81111);

const carsSave = async (keys, descriptions, values) => {
    await writerScript.ExcelWriter.writeInExcelX(
        [{columnsKeys: keys, columnsDesc: descriptions, rowsData: values}],
        `cars_analogues_${get_Hash()}.xlsx`
    );
}


(async function main() {
    const analogArray = [
        {excelID: "A19", nameCar: "Ford mustang"},
        {excelID: "A12", nameCar: "Lada vesta"},
        {excelID: "A3", nameCar: "Toyota corolla"},
        {excelID: "A3", nameCar: "Volkswagen Passat"},
    ];
    // loadExcel ...........
    const cars = (await consolidator_cars_data(analogArray)).map((car, i) => new Object({id: i + 1, ...car}));

    await carsSave(auto_card.keys, auto_card.descriptions, cars);
    console.log("");
    // saveExcel response ...........
})()


