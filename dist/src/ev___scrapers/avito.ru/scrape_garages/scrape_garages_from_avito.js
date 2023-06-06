const { browser_open } = require("../../../ev___tools/f_puppeteer_browser");
const { ExcelWriter } = require("../../../ev___tools/ExcelWriter");
//| возвращает шаблон для ms_excel функции сохранения
const get_excel_template = () => {
    return {
        columnsKeys: [
            { key: "id" },
            { key: "id_avito" },
            { key: "date_publication" },
            { key: "url" },
            { key: "price" },
            { key: "address" },
            { key: "area" },
            { key: "security" },
            { key: "description" }
        ],
        columnsDesc: [
            "id",
            "id авито",
            "дата публикации",
            "источник",
            "цена",
            "адрес",
            "площадь, м2",
            "наличие охраны",
            "описание"
        ],
        rowsData: [],
    };
};
//| парсинг гаражей по конфигурации
(async function scrape_garages_from_avito() {
    const domain = "https://www.avito.ru/moskva/";
    const output_path = "output/";
    let parse_configs = [
        {
            description: "Железобетонные",
            url: domain + "garazhi_i_mashinomesta/sdam/garazh/zhelezobetonnyy-ASgBAQICAkSYA~YQ5gj2WgFAoAwU4KsB",
            dir: output_path + "garages_fer_metal/",
        },
        {
            description: "Металлические",
            url: domain + "garazhi_i_mashinomesta/sdam/garazh/metallicheskiy-ASgBAQICAkSYA~YQ5gj2WgFAoAwU6KsB",
            dir: output_path + "garages_metal/",
        },
        {
            description: "Кирпичные",
            url: domain + "garazhi_i_mashinomesta/sdam/garazh/kirpichnyy_dom-ASgBAQICAkSYA~YQ5gj2WgFAoAwU5KsB",
            dir: output_path + "garages_brick/",
        },
    ];
    //| запускаем браузер
    let browser = await browser_open(false);
    let page = await browser.newPage();
    //| собираем данные по конфигураторам
    for (let config of parse_configs) {
        console.log("Парсинг (" + config.description + ") - старт");
        //| запрашиваем данные по url
        let response = await parse_cards_by_first_page(page, config.url, config.dir);
        //| создаем template для ms_excel
        let b_template = get_excel_template();
        //| заполняем template данными
        response.pages.forEach(page => {
            page.cards.forEach(card => {
                b_template.rowsData.push(card.parse);
            });
        });
        console.log("Парсинг (", config.description, ") - завершено / сохранение");
        //| сохраняем в ms_excel
        await ExcelWriter.writeInExcelX(b_template, config.dir + "ms_excel.xlsx");
    }
    //| закрываем браузер
    await page.close();
    await browser.close();
})();
//# sourceMappingURL=scrape_garages_from_avito.js.map