const cian_regions = require("./data_source/cian_regions.json");
const cian_cities = require("./data_source/cian_cities.json");
const cian_districts = require("./data_source/cian_districts.json");
const CIAN_REGIONS_API_URL = "https://www.cian.ru/cian-api/site/v1/get-regions/";
const CIAN_CITIES_API_URL = "https://www.cian.ru/cian-api/site/v1/get-region-cities/?regionId=";
const CIAN_DISTRICTS_API_URL = "https://www.cian.ru/api/geo/get-districts-tree/?locationId=";
const PAGE_OPTIONS = { waitUntil: "domcontentloaded" };
//| Выгружает регионы с удаленного сервера from_cian.ru.ru api.
//| Возвращает:
//|     1. массив json.
//|
const get_cian_regions = async (page) => {
    //| проверяем наличие локального файла с регионами
    if (cian_regions.length > 0)
        return cian_regions;
    //| грузим регионы с from_cian.ru.ru api
    let regions_response = await page.goto(CIAN_REGIONS_API_URL);
    let regions_response_json = await regions_response.json();
    if (!("data" in regions_response_json))
        return null;
    if (!("items" in regions_response_json.data))
        return null;
    if (regions_response_json.data.items.length <= 0)
        return null;
    if (regions_response_json
        && regions_response_json.data
        && regions_response_json.data.items
        && regions_response_json.data.items.length > 0)
        return regions_response_json.data.items;
    return [];
};
//| Выгружает города с from_cian.ru.ru api. (id региона) => json массив городов
//|
const get_cian_cities = async (page, region_id) => {
    //| проверяем наличие локального файла с городами
    if (cian_cities && cian_cities.length > 0) {
        let buffer_cities = cian_cities.filter(city => {
            return city.region_id == region_id;
        });
        if (buffer_cities.length > 0)
            return buffer_cities;
    }
    //| грузим города с from_cian.ru.ru api
    let cities_response = await page.goto(CIAN_CITIES_API_URL + region_id);
    let cities_response_json = await cities_response.json();
    if (!("data" in cities_response_json))
        return null;
    if (!("items" in cities_response_json.data))
        return null;
    if (cities_response_json.data.items.length <= 0)
        return null;
    return cities_response_json.data.items;
};
//| Загружает дистрикты from_cian.ru.ru.
//| (id города) => json массив дистриктов.
//|
const get_cian_districts = async (page, city_id) => {
    //| проверяем наличие локального файла с дистриктами
    if (cian_districts && cian_districts.length > 0) {
        let buffer_districts = cian_districts.filter(district => {
            return district.city_id == city_id;
        });
        if (buffer_districts.length > 0)
            return buffer_districts;
    }
    //| грузим дистрикты с from_cian.ru.ru api
    let districts_response = await page.goto(CIAN_DISTRICTS_API_URL + city_id);
    let districts_response_json = await districts_response.json();
    if (districts_response_json.length <= 0)
        return [];
    return districts_response_json;
};
//| Генерирует массив ссылок на страницы
//| (ссылка на первую страницу) => массив ссылок на страницы, кол-во страниц, кол-во предложений.
//|
const cian_page_links_generator = async (page, url = null) => {
    if (!page || !url)
        return [];
    await page.goto(url + "&p=1", PAGE_OPTIONS);
    const handle = await page.evaluateHandle(() => window._cianConfig);
    const response = await page.evaluateHandle(results => results, handle);
    const _cianConfig = await response.jsonValue();
    const initialState = _cianConfig["legacy-commercial-serp-frontend"].find(item => item.key === 'initialState');
    const max_offers = initialState.value.results.totalOffers;
    let max_pages = Math.ceil(max_offers / 28) > 54 ? 54 : Math.ceil(max_offers / 28);
    let url_list = [];
    for (let i = 1; i <= max_pages; i++)
        url_list.push(`${url}&p=${i}`);
    return { offers_count: max_offers, pages_count: max_pages, links: url_list };
};
//| Загружает пакет предложений со страницы
//| (url страницы) => json массив предложений
//|
const load_offers_from_page = async (page, url = null) => {
    try {
        if (!url)
            return [];
        await page.goto(url, PAGE_OPTIONS);
        const handle = await page.evaluateHandle(() => window._cianConfig);
        // console.log("load_offers_from_page:", "typeof handle", typeof handle);
        const response = await page.evaluateHandle(results => results, handle);
        // console.log("load_offers_from_page:", "typeof response", typeof response);
        const _cianConfig = await response.jsonValue();
        // console.log("load_offers_from_page:", "typeof _cianConfig", typeof _cianConfig);
        if ("frontend-serp" in _cianConfig) {
            let initialState = _cianConfig["frontend-serp"].find(item => item.key === 'initialState');
            return initialState.value.results.offers;
        }
        else if ("legacy-commercial-serp-frontend" in _cianConfig) {
            let initialState = _cianConfig["legacy-commercial-serp-frontend"].find(item => item.key === 'initialState');
            return initialState.value.results.offers;
        }
        else {
            return [];
        }
    }
    catch (err) {
        console.log(err);
    }
};
//| Ищет id района в сложной вложенной структуре массивов.
//| Принимает:
//|     1. объект в котором будет производиться поиск.
//|     2. слово для поиска (наименование дистрикта)
//|     3. поле с дочерними объектами того же типа.
//| => id дистрикта || null.
//|
const search_district_id = (obj, name, children_feld) => {
    let b_have_name_1 = obj.name.toLowerCase().indexOf(name) !== -1;
    let b_have_name_2 = obj.name.toLowerCase().indexOf(name) !== -1;
    if (b_have_name_1 || b_have_name_2)
        return obj.id;
    let children = obj[children_feld];
    if (children && children.length > 0) {
        for (let child of children) {
            let res = search_district_id(child, name, children_feld);
            if (res)
                return res;
        }
    }
    return null;
};
//| Сокращает административные округа для Москвы
//| (наименование округа) => сокращенное наименование округа || наименование округа
//|
const moskow_okrug_short = word => {
    const abbreviation = {
        ["Восточный".toLowerCase()]: "ВАО".toLowerCase(),
        ["Западный".toLowerCase()]: "ЗАО".toLowerCase(),
        ["Зеленоградский".toLowerCase()]: "ЗелАО".toLowerCase(),
        ["Северный".toLowerCase()]: "САО".toLowerCase(),
        ["Северо-Восточный".toLowerCase()]: "СВАО".toLowerCase(),
        ["Северо-Западный".toLowerCase()]: "СЗАО".toLowerCase(),
        ["Центральный".toLowerCase()]: "ЦАО".toLowerCase(),
        ["Юго-Восточный".toLowerCase()]: "ЮВАО".toLowerCase(),
        ["Юго-Западный".toLowerCase()]: "ЮЗАО".toLowerCase(),
        ["Южный".toLowerCase()]: "ЮАО".toLowerCase(),
    };
    if (word && word.toLowerCase() in abbreviation) {
        return abbreviation[word];
    }
    else {
        return null;
    }
};
module.exports = {
    get_cian_regions,
    get_cian_cities,
    get_cian_districts,
    cian_page_links_generator,
    load_offers_from_page,
    search_district_id,
    moskow_okrug_short,
};
// (async function test.json() {
//     let browser = await browserOpen();
//     let links = [
//         {id: 1, url: "https://www.cian.ru/"},
//         {id: 2, url: "https://www.cian.ru/zagorod/?top_menu=suburban_landing"},
//         {id: 3, url: "https://www.cian.ru/kalkulator-nedvizhimosti/"},
//         {id: 4, url: "https://www.cian.ru/snyat-garazh/"},
//         {id: 5, url: "https://www.cian.ru/snyat-sklad/"},
//         {id: 6, url: "https://www.cian.ru/kottedzhnyj-poselok-evropejskaya-dolina-2-2178/"},
//         {id: 7, url: "https://www.cian.ru/sale/suburban/285313949/"},
//     ];
//     let time = performance.now();
//     let size = 3;
//     let max = Math.ceil(links.length / size);
//     for (let i = 0; i < max; i++) {
//         let pack = links.slice(i * size, size);
//         console.log("")
//         // await cian_go_screens(browser, pack);
//         // console.log("time:", performance.now() - time);
//     }
//     console.log("time:", performance.now() - time);
// })()
//# sourceMappingURL=base_api.js.map