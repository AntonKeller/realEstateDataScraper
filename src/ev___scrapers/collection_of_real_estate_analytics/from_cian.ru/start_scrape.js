import fs from "fs";
import _ from "lodash";
import {
    get_cian_regions, get_cian_cities, get_cian_districts, cian_page_links_generator,
    load_offers_from_page, search_district_id, moskow_okrug_short
} from "../../../ev___tools/cian.ru/base_api.js";
import {yan_api_req_by_params} from "../../../ev___tools/yandex.ru/f_yandex_api.js";
import {load_column, save_array} from "../../../ev___tools/excel/excel_base_api.js";
import {configuration} from "../../../ev___tools/cian.ru/configurator.js";
import {openBrowser} from "../../../ev___tools/puppeteerBrowser/f_puppeteer_browser.js";
import {arrIsNotEmpty} from "../../../ev___tools/commonTools.js";
// import {search_by_cadastral_map} from "../../../ev___tools/other/f_cadastral_register_services.js";
// import {scrapInfoByAddressFromFlatinfo} from "ev___tools/other/cadastral_scrapper_flatinfo.ru.js";

//| Мемоизирует функцию. Кеширует значение через ключ = аргументам
const memoizeManager = f => {
    let cash = {};
    return async (...args) => {
        let str = String((new Array(args)).toString().replace(/,/, "_"));
        // console.log("str", str)
        if (str in cash) {
            console.log("from cash");
            return cash[str];
        } else {
            console.log("calculate");
            let res = await f(...args);
            cash[str] = res;
            return res;
        }
    }
}


const getCollectionByAnalogues = (dataObjects) => {
    const collection = [];
    for (let i = 0; i < dataObjects.length; i++) {
        for (let j = 0; j < dataObjects[i].analogues.length; j++) {
            collection.push({
                inputAddress: {value: dataObjects[i].inputAddress, description: "Входной адрес"},
                latLng: {value: dataObjects[i].lat + dataObjects[i].lon, description: "Координаты"},
                inputId: {value: dataObjects[i].id, description: "Ключ"},
                ...dataObjects[i].analogues[j]
            });
        }
    }
    return collection;
}


const getAdditionalInfoCard = async (page, url) => {

    let result = {
        ceilingHeight: {
            value: null,
            description: "Высота потолков",
            set(value) {
                if (typeof value === "string") {
                    this.value = value.replace(/[^0-9.,]/ig, "").trim()
                }
            }
        },
        StateOfRepair: {
            value: null,
            description: "Состояние",
        },
        layout: {
            value: null,
            description: "Планировка",
        },
    };

    await page.goto(url, {waitUntil: "domcontentloaded"});
    const handle = await page.evaluateHandle(() => window._cianConfig);
    if (handle) {
        const cianObject = await page.evaluateHandle(results => results, handle);
        if (cianObject) {
            const _cianConfig = await cianObject.jsonValue();
            if (_cianConfig && "frontend-offer-card" in _cianConfig) {
                const defaultState = _cianConfig['frontend-offer-card'].find(el => el.key === "defaultState");
                let commercial = null;
                if (defaultState && defaultState.value && defaultState.value.offerData) {
                    commercial = defaultState.value.offerData.features.find(el => el.id === "commercial");
                    if (commercial) {
                        Object.keys(result).map(key => {
                            let found = commercial.features.find(el => el.label === result[key].description);
                            if (found && found.value) {

                                if ("set" in result[key]) {
                                    result[key].set(found.value)
                                } else {
                                    result[key].value = found.value;
                                }

                            }
                        });
                    }
                }
            }
        }
    }

    return result;
}


//| Задержка
//
const timeout = ms => new Promise(r => setTimeout(r, ms));


//| Токен
//
const API_TOKEN = "apikey=bd9aa639-828c-4fd1-96ce-fc519d09f7d2";


//| проверяет, достаточно ли информации для поиска аналогов.
//
const have_info = (data) => {
    return Boolean(data.city) || Boolean(data.cityOkrug) || Boolean(data.cityRaion);
}


//| структура хранилища:
//
const getFields = (address, status) => {
    return {
        id: null,
        inputAddress: address,
        correctAddress: null,
        country: null,
        federalOkrug: null,
        region: null,
        isFederalCity: null,
        municipalOkrug: null,
        municipalRaion: null,
        city: null,
        citySettlement: null,
        cityOkrug: null,
        cityRaion: null,
        cityMikroraion: null,
        section: null,
        street: null,
        house: null,
        lat: null,
        lon: null,
        cianRegionId: null,
        cianCityId: null,
        citySettlementId: null,
        cianCityOkrugShort: null,
        cianCityOkrugId: null,
        cianCityRaionId: null,
        cianCityMikroRaionId: null,
        status: status,
        pageGenerationStatus: null,
        offersLoadedCount: 0,
        pages: [],
        analogues: [],
    };
}


//| Статусы загрузки.
const STATUS_LOADED = "loaded";
const STATUS_WAITING = "Waiting";
const STATUS_ERROR = "Error";


const DataBox = {
    countAddresses: 0,
    addresses: [],
};


//| стартовая функция
//
(async function main() {

    let withoutRegion = false;        //| без поиска по региону
    let withoutCity = false;          //| без поиска по городу
    let withoutCityOkrug = true;      //| без поиска по округу
    let withoutCitySettlement = true; //| без поиска по поселению в городе
    let withoutCityRaion = true;      //| без поиска по району
    let withoutCityMikroRaion = true; //| без поиска по микрорайону

    //| price limit
    let priceLimit = {min: 0, max: 9999999999999}

    //| area limit
    let areaLimit = {min: 0, max: 9999999999999}

    //| браузер
    const browser = await openBrowser(true);
    let page = await browser.newPage();

    //| тестовые адреса для поиска
    let inputLocations = [];

    //| ПРИВЯЗАТЬ список конфигураций к загрузке
    let arrConfigParams = [
        configuration.buildings_sale.params_request,
        configuration.vacant_premises_sale.params_request,
        configuration.trade_area_sale.params_request
    ];

    //| при наличие предложений к кэше, дублирует их оттуда для новой позиции
    let takeOffOffersFromTheCache = true;

    //| конфигурация
    const currConfig = configuration.offices_rent;

    let boxPath = "buffer/box.json";
    let bufferDir = "buffer/data/";
    let excelPath = "input/work_path.xlsx";
    let excelSheet = "Лист1";
    let dataBox = null;
    let boxExists = fs.existsSync(boxPath);

    //| Загружаем Банк Адресов
    if (boxExists) {
        dataBox = JSON.parse(String(fs.readFileSync(boxPath)));
    }

    //| Создаем Банк Адресов
    if (!boxExists) {

        let column = await load_column(excelPath, excelSheet, 1);

        column = column.slice(2, column.length)
            .filter(el => el.length > 10)
            .map(el => el.replace(/\d{6},|\n|\t/gi, " ")).map(el => el.replace(/\s+/ig, " ").trim().toLowerCase());

        dataBox = column.map((address, i) => {
            return {
                id: i + 1,
                address: address,
                key: address.replace(/[^а-яА-Я\d]/ig, ""),
                status: STATUS_WAITING,
            }
        });

        fs.writeFileSync(boxPath, JSON.stringify(dataBox));
    }

    //| создаем объекты по адресу
    dataBox.forEach(objectAddress => {
        if (!fs.existsSync(bufferDir + objectAddress.key + ".json")) {
            let obj = getFields(objectAddress.address, STATUS_WAITING);
            fs.writeFileSync(bufferDir + objectAddress.key + ".json", JSON.stringify(obj));
        }
    });

    //| запускаем цикл по всем данным
    for (let i = 0; i < dataBox.length; i++) {

        //| Если данные по текущему адресу загружены -> переходим к следующему
        if (dataBox[i].status === STATUS_LOADED) continue;

        //| Определяем путь хранения объекта данных
        let dataObjectPath = bufferDir + dataBox[i].key + ".json";

        let dataBoxAddress = dataBox[i].address;
        let dataBoxLength = dataBox.length;
        let dataBoxKey = dataBox[i].key;
        let dataObject = null;

        //| Если объект есть, загружаем
        if (fs.existsSync(dataObjectPath)) {
            dataObject = JSON.parse(String(fs.readFileSync(dataObjectPath)));
        }

        //| Если объекта нет -> создаем
        if (!fs.existsSync(dataObjectPath)) {
            dataObject = getFields(dataBoxAddress, STATUS_WAITING);
            fs.writeFileSync(bufferDir + dataBoxKey + ".json", JSON.stringify(dataObject));
        }

        //| Лог обработки текущей позиции
        console.log("\nОбрабатываю: (", i + 1, "/", dataBoxLength, ")", `(${dataObject.inputAddress})`);   //| лог статуса обработки адресов

        //| ЭТАП 1. Загружаем основные хар-ки по адресу.
        if (!dataObject.correctAddress) {

            //| поиск параметров по адресу с yandex_api.api
            let yandexResponse = await yan_api_req_by_params(API_TOKEN, dataObject.inputAddress);

            Object.keys(dataObject).forEach(key => {
                if (key in yandexResponse) {
                    dataObject[key] = yandexResponse[key].value;
                }
            });

            //| промежуточно сокращаем округ для Москвы
            dataObject.cianCityOkrugShort = moskow_okrug_short(dataObject.cityOkrug);

            //| если совсем нет данных, устанавливаем флаг на пропуск позиции
            if (!have_info(dataObject)) {
                console.log("\tне информации\t", `(${dataObject.inputAddress})`);
                continue;
            }

        }

        //| ЭТАП 2. Определяем cian id региона.
        if (!dataObject.cianRegionId && dataObject.region) {
            let pattern = new RegExp(dataObject.region, "ig");
            let regions = await get_cian_regions();
            let regions_found = regions.find(region => pattern.test(region.fullName));
            if (regions_found) dataObject.cianRegionId = regions_found.id;
        }

        //| ЭТАП 3. Если город федеральный.
        //|
        if (dataObject.region && dataObject.city && dataObject.region === dataObject.city) {
            dataObject.cianCityId = dataObject.cianRegionId;
        }

        //| ЭТАП 4. Определяем id города.
        //| Проверим наличие id города и параметров для его получения
        //|
        if (!dataObject.cianCityId && dataObject.cianRegionId && dataObject.city) {
            let response = await get_cian_cities(page, dataObject.cianRegionId);
            let pattern = new RegExp(dataObject.city, "ig");
            let found = response.find(city => pattern.test(city.displayName));
            if (found) dataObject.cianCityId = found.id;
        }

        //| ЭТАП 5. Определяем id районов, городских округов
        //| разделить на части.
        //| чтобы лишний раз не загружать и не искать
        //| либо создать флаг готовности
        if (dataObject.cianCityId && !dataObject.districtsFoundStatus) {

            //| грузим городские дистрикты
            let b_cian_districts = await get_cian_districts(page, dataObject.cianCityId);

            //| Ищем id городского округа по городским районам/округам
            if (!dataObject.cianCityOkrugId && dataObject.cityOkrug) {
                let buff_okrug = dataObject.cianCityOkrugShort || dataObject.cityOkrug;
                dataObject.cianCityOkrugId = search_district_id(
                    {name: ".", id: ".", childs: _.cloneDeep(b_cian_districts)},
                    buff_okrug,
                    "okrug", //| указываем тип искомого образования
                );
            }

            //| Ищем id района в городе
            if (!dataObject.cianCityRaionId && dataObject.cityRaion) {
                dataObject.cianCityRaionId = search_district_id(
                    {name: ".", id: ".", childs: _.cloneDeep(b_cian_districts)},
                    dataObject.cityRaion,
                    "raion",  //| указываем тип искомого образования
                );
            }

            if (!dataObject.cianCityMikroRaionId && dataObject.cityMikroraion) {

                //| поиск по районами города
                dataObject.cianCityMikroRaionId = search_district_id(
                    {name: ".", id: ".", childs: _.cloneDeep(b_cian_districts)},
                    dataObject.cityMikroraion,
                    "mikroRaion",  //| указываем тип искомого образования
                );

                if (dataObject.isFederalCity && dataObject.citySettlement && dataObject.cianRegionId) {

                    //| грузим города в Федеральном городе
                    //| чтобы определить, если ли город в федеральном городе и получить его id
                    //| для получения микрорайонов в этом городе
                    let bCities = await get_cian_cities(page, dataObject.cianRegionId);

                    if (arrIsNotEmpty(bCities)) {

                        let test = new RegExp(dataObject.citySettlement, "ig");
                        let cityFound = bCities.find(e => test.test(e.fullName));

                        if (cityFound) {

                            //| ставим id для поселения (города) в городе ФЗ
                            dataObject.citySettlementId = cityFound.id

                            //| определяем микрорайоны в поселении, находящееся в городе ФЗ
                            let cityMikroDistricts = await get_cian_districts(page, dataObject.citySettlementId);

                            if (arrIsNotEmpty(cityMikroDistricts)) {

                                //| поиск по районами округа
                                dataObject.cianCityMikroRaionId = search_district_id(
                                    {name: ".", id: ".", childs: _.cloneDeep(cityMikroDistricts)},
                                    dataObject.cityMikroraion,
                                    "mikroRaion",  //| указываем тип искомого образования
                                );
                            }
                        }
                    }
                }
            }
            dataObject.districtsFoundStatus = true;
        }

        //| ЭТАП 6. Составляем запрос | Генерируем ссылки
        //| проверяем наличие всех хар-к -> запускаем алгоритм
        //|
        if (!dataObject.pageGenerationStatus) {

            //| всегда чистим массив.
            dataObject.pages = [];
            let buff_subjects_id_array = [];

            //| добавляем городской микрорайон в поиск
            if (!withoutCityMikroRaion && dataObject.cianCityMikroRaionId) {
                buff_subjects_id_array.push({
                    subject_type: "городской микрорайон",
                    subject_name: dataObject.cityMikroraion,
                    request_param: "&district=" + dataObject.cianCityMikroRaionId
                });
            }

            //| добавляем городской район в поиск
            if (!withoutCityRaion && dataObject.cianCityRaionId) {
                buff_subjects_id_array.push({
                    subject_type: "городской район",
                    subject_name: dataObject.cityRaion,
                    request_param: "&district=" + dataObject.cianCityRaionId
                });
            }

            //| добавляем поселение в городе в поиск
            if (!withoutCitySettlement && dataObject.citySettlementId) {
                buff_subjects_id_array.push({
                    subject_type: "Поселение в городе ФЗ",
                    subject_name: dataObject.citySettlement,
                    request_param: "&region=" + dataObject.citySettlementId
                });
            }

            //| добавляем административный округ в поиск
            if (!withoutCityOkrug && dataObject.cianCityOkrugId) {
                buff_subjects_id_array.push({
                    subject_type: "административный округ",
                    subject_name: dataObject.cityOkrug,
                    request_param: "&district=" + dataObject.cianCityOkrugId
                });
            }

            //| добавляем город в поиск
            if (!withoutCity && dataObject.cianCityId) {
                buff_subjects_id_array.push({
                    subject_type: dataObject.isFederalCity ? "город ФЗ" : "город",
                    subject_name: dataObject.city,
                    request_param: "&location=" + dataObject.cianCityId
                });
            }

            //| добавляем регион в поиск
            if (!withoutRegion && dataObject.cianRegionId && !dataObject.isFederalCity) {
                buff_subjects_id_array.push({
                    subject_type: "регион",
                    subject_name: dataObject.region,
                    request_param: "&location=" + dataObject.cianRegionId
                });
            }

            let generatePageCache = {};
            let generatePageCachePath = "cache/generatePageCache.json";

            //| грузим кэш геренарции страниц
            if (fs.existsSync(generatePageCachePath)) {
                generatePageCache = JSON.parse(String(fs.readFileSync(generatePageCachePath)));
            }

            //| генерация ссылок
            for (let location of buff_subjects_id_array) {
                for (let params of arrConfigParams) {

                    //| получаем параметры запроса из конфигуратора
                    let b_req = params + location.request_param;
                    let generate_response = null;
                    let b_reqKey = b_req.replace(/[^\d\w]/ig, "");

                    if (b_reqKey in generatePageCache) {
                        generate_response = generatePageCache[b_reqKey];
                    } else {
                        generate_response = await cian_page_links_generator(page, b_req);
                        generatePageCache[b_reqKey] = _.cloneDeep(generate_response);
                    }

                    generate_response.links.forEach(url => {
                        dataObject.pages.push({
                            subject_type: location.subject_type,
                            subject_name: location.subject_name,
                            url: url,
                            offerCount: generate_response.offers_count,
                            status: STATUS_WAITING,
                        });
                    });
                }
            }

            //| сохраняем кэш
            fs.writeFileSync(generatePageCachePath, JSON.stringify(generatePageCache));
            generatePageCache = undefined;

            //| успешно, сохраняемся
            dataObject.pageGenerationStatus = true;
        }

        //| ЭТАП 7. Загрузка данных
        if (dataObject.pages.length > 0) {

            try {

                let pagesCache = {};
                let pageCachePath = "cache/pagesHash.json";
                let max = dataObject.pages.length; //| .slice(0, 3)
                let counter = 0;

                //| загружаем кэш страниц
                if (fs.existsSync(pageCachePath)) {
                    pagesCache = JSON.parse(String(fs.readFileSync(pageCachePath)));
                }

                for (let j = 0; j < max; j++) {

                    let currPage = dataObject.pages[j];

                    if (currPage.status === STATUS_LOADED) continue;

                    console.log(
                        "\t-loading.../", j + 1, "/", max, "/", currPage.subject_type, "/",
                        currPage.subject_name, "/", currPage.url
                    );

                    let urlKey = currPage.url.replace(/[^\d\w]/ig, "");
                    let analogues = null;

                    if (!(urlKey in pagesCache)) {
                        //| загружаем offers со страницы
                        let offers = await load_offers_from_page(page, currPage.url);
                        analogues = offers.map(e => currConfig.offerParser(e));
                        //| копируем в кэш
                        pagesCache[urlKey] = _.cloneDeep(analogues);
                    } else if (urlKey in pagesCache && takeOffOffersFromTheCache) {
                        //| загружаем offers из кэша
                        analogues = _.cloneDeep(pagesCache[urlKey]);
                    }

                    if (analogues.length > 0) {

                        //| запишем для информации
                        dataObject.offersLoadedCount += analogues.length;

                        //| парсим offer -> analogue
                        //| удаляем дубли (поиск дублей происходит внутри позици)
                        analogues.forEach(analogue => {
                            let props1 = analogue.coordinatesLat.value + analogue.coordinatesLat.value + analogue.floorsCount.value;
                            let price1 = analogue.price.value ? analogue.price.value : null;
                            let area1 = analogue.totalArea.value ? analogue.totalArea.value : null;
                            let date1 = new Date(analogue.publicationDate.value.split(".").reverse().join("."));
                            let flag = false;

                            for (let j = 0; j < dataObject.analogues.length; j++) {

                                let e = dataObject.analogues[j];
                                let props2 = e.coordinatesLat.value + e.coordinatesLat.value + e.floorsCount.value;
                                let price2 = e.price.value ? e.price.value : null;
                                let area2 = e.totalArea.value ? e.totalArea.value : null;
                                let date2 = new Date(e.publicationDate.value.split(".").reverse().join("."));

                                let priceDif = null;
                                if (area1 && area2) {
                                    priceDif = Math.abs((price1 - price2) / (price1 + price2)) * 100;

                                }

                                let areaDif = null;
                                if (area1 && area2) {
                                    areaDif = Math.abs((area1 - area2) / (area1 + area2)) * 100;
                                }

                                if ( //| нашелся дубль по id или по другим хар-м
                                    analogue.cianId.value === e.cianId.value ||
                                    (props1 === props2 &&
                                        (!(typeof areaDif === "number") || areaDif < 5) &&
                                        (!(typeof priceDif === "number") || priceDif < 5))
                                ) {
                                    Object.keys(analogue).forEach(key => {
                                        if (
                                            key in dataObject.analogues[j] && analogue[key].value
                                        ) {
                                            if (date1 > date2) {
                                                dataObject.analogues[j][key].value = analogue[key].value;
                                            } else if (date1 <= date2 && !dataObject.analogues[j][key].value) {
                                                dataObject.analogues[j][key].value = analogue[key].value;
                                            }
                                        }
                                    });
                                    flag = true;
                                    break;
                                }
                            }

                            //| в базу еще не вносился
                            if (!flag) {
                                dataObject.analogues.push(analogue);
                            }
                        });
                        counter++;
                    }

                    dataObject.pages[j].status = STATUS_LOADED;

                    if ((j + 1) === max || counter === 10) {
                        //| сохраняем кэш
                        fs.writeFileSync(pageCachePath, JSON.stringify(pagesCache));
                        counter = 0;
                    }

                }

                pagesCache = undefined;
                dataBox[i].status = STATUS_LOADED;
                fs.writeFileSync(dataObjectPath, JSON.stringify(dataObject));
                fs.writeFileSync(boxPath, JSON.stringify(dataBox));
            } catch (err) {
                dataBox[i].status = STATUS_ERROR;
                fs.writeFileSync(dataObjectPath, JSON.stringify(dataObject));
                fs.writeFileSync(boxPath, JSON.stringify(dataBox));
            }
        }
    }


    //| Загружаем предложения из буффера
    let dataObjects = [];
    for (let i = 0; i < dataBox.length; i++) {
        let dataObjectPath = bufferDir + dataBox[i].key + ".json";
        if (fs.existsSync(dataObjectPath)) {
            let dataObject = JSON.parse(String(fs.readFileSync(dataObjectPath)));
            dataObjects.push(dataObject);
        }
        console.log("saving data...", i + 1, "/", dataBox.length);
    }

    dataBox = undefined;

    //| СТОИТ ДОБАВИТЬ СЮДА ЗАГРУЗКУ СКИНШОТОВ
    //| сбор дополнительных данных напрямую из карточки
    //| поскольку информация есть только там
    // let time = performance.now();
    // for (let j = 0; j < collectionForSave.length; j++) {
    //
    //     let el = collectionForSave[j];
    //     if (el.AdditionalInfoFlag) continue;
    //     console.log("\t\tСбор доп. информации.", j + 1, "/", collectionForSave.length);
    //     let response = await getAdditionalInfoCard(page, el.fullUrl.value);
    //
    //     Object.keys(response).forEach(key => {
    //         if (key in el) {
    //             collectionForSave[j][key].value = response[key].value;
    //         }
    //     });
    //
    //     collectionForSave[j]["AdditionalInfoFlag"] = true;
    //     fs.writeFileSync("buffer/analoguesWithoutDoubles.json", JSON.stringify(collectionForSave));
    // }
    // time = performance.now() - time;
    // console.log("time:", time);


    //| определение кадастрового номера по адресу
    // for (let i = 0; i < analoguesBoxWithoutDuplicates.length; i++) {
    //     if (
    //         !analoguesBoxWithoutDuplicates[i].cadastralNumber.value &&
    //         analoguesBoxWithoutDuplicates[i].address.value
    //     ) {
    //         let flatResponse = await scrapInfoByAddressFromFlatinfo(page, analoguesBoxWithoutDuplicates[i].address.value);
    //         if (flatResponse.cadNumber.value) {
    //             if ("cadNumber" in analoguesBoxWithoutDuplicates[i]) {
    //                 analoguesBoxWithoutDuplicates[i].cadNumber.value = flatResponse.cadNumber.value;
    //             } else {
    //                 analoguesBoxWithoutDuplicates[i]["cadNumber"] = {
    //                     value: flatResponse.cadNumber.value, description: "Кадастровый номер"
    //                 };
    //             }
    //         }
    //     }
    //
    // }

    // | определение данных по кадастровому номеру
    // console.log("max cadastral numbers:", maxCadastral);
    //
    // for (let j = 0; j < collectionForSave.length; j++) {
    //     let el = collectionForSave[j];
    //     let cadNumber = el.cadastralNumber.value.match(/\d+(:\d+)+/ig)[0];
    //     let response = await search_by_cadastral_map(cadNumber);
    //     Object.keys(el).forEach(key => {
    //         if (key in response) {
    //             collectionForSave[j][key].value = response[key].value;
    //         }
    //     });
    // }

    let time = performance.now();

    //| функция собирает все analogues в один массив
    let collection = getCollectionByAnalogues(dataObjects);

    dataObjects = undefined;
    console.log("collection generate diff time:", performance.now() - time);
    time = performance.now();

    let analoguesBoxForSave = collection.map(
        obj => [...Object.values(obj).map(obj => obj.value || null)]
    );

    console.log("for save box generate diff time:", performance.now() - time);
    time = performance.now();

    console.log("")
    //| Добавляем шапку
    analoguesBoxForSave.unshift(Object.values(collection[0]).map(el => el.description));

    collection = undefined;

    //| Сохраняем в excel
    await save_array("output/analogues.xlsx", "sheet", analoguesBoxForSave);
    await page.close();
    await browser.close();
    console.log("процесс завершен");
})()