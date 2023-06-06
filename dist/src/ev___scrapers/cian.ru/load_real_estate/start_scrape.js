const { browserOpen } = require("../../../ev___tools/f_puppeteer_browser");
const { get_cian_regions, get_cian_cities, get_cian_districts, cian_page_links_generator, load_offers_from_page, search_district_id, moskow_okrug_short } = require("../../../ev___tools/cian.ru/f__cian__api.js");
const { yan_api_req_by_params } = require("../../../ev___tools/f_yandex_api");
const { concat_values_right } = require("../../../ev___tools/f_objects_helper");
const { load_column, save_array } = require("../../../ev___tools/f_excel");
const { configuration } = require("../../../ev___tools/cian.ru/f__cian__configuration");
const _ = require("lodash");
const fs = require("fs");
const { init_address_params } = require("../../../ev___tools/f_yandex_initial");
// const {search_by_cadastral_map} = require("../../../ev___tools/f_cadastral_register_services");
//
const timeout = ms => new Promise(r => setTimeout(r, ms));
//| Токен
//
const API_TOKEN = "apikey=bd9aa639-828c-4fd1-96ce-fc519d09f7d2";
//| проверяет, достаточно ли информации для поиска аналогов.
//
const have_info = (data) => {
    return Boolean(data.city) || Boolean(data.district_city_okrug) || Boolean(data.district_raion);
};
//| определяет разницу между двумя числами в %
//
const diff_numbers = (n1, n2) => {
    let b1 = 1, b2 = 1;
    if (n1 && n2) {
        if (typeof n1 === "string") {
            b1 = parseFloat(n1.replace(/,/, "."));
        }
        else
            b1 = n1;
        if (typeof n2 === "string") {
            b2 = parseFloat(n2.replace(/,/, "."));
        }
        else
            b2 = n2;
        if (b1 && b2) {
            return Math.abs(((b1 - b2) / ((b1 + b2) / 2)) * 100);
        }
    }
    return null;
};
//| структура хранилища:
//
const data_init = (_address) => {
    return {
        ...init_address_params(),
        input_address: _address,
        r_cian_region_id: null,
        r_cian_city_id: null,
        district_city_okrug_m_short: null,
        district_city_okrug_cian_id: null,
        district_raion_cian_id: null,
        pages: null,
        generate_pages_is_done: null, //| статус готовности по текущей позиции
    };
};
//| стартовая функция
//
(async function main() {
    //| браузер
    const browser = await browserOpen(true);
    let page = await browser.newPage();
    //| тестовые адреса для поиска
    let input_locations = [];
    //| конфигурация
    const params_request = configuration.land_sale.params_request;
    const offerParser = configuration.land_sale.offerParser;
    //| данные
    let file_data = [];
    //| маршруты
    const folder_images = "output/images/"; //| папка сохранения скриншотов
    const buffer_file_path = "buffer.json"; //| папка сохранения буффера
    const folder_output = "output/"; //| папка сохранения результата
    const folder_input = "input/"; //| папка загрузки входных данных
    //| загружаем структуру, если она существует
    if (fs.existsSync(buffer_file_path)) {
        file_data = JSON.parse(String(fs.readFileSync(buffer_file_path)));
    }
    else {
        //| создаем и заполняем структуру если файла нет
        const limit_address_length = 6; //| ограничение на чтение (только x.length > 6)
        const skip_rows_count = 1; //| кол-во строк, которые нужно пропустить перед чтением
        if (fs.existsSync(folder_input + "work_path.xlsx")) {
            //| Загружаем адреса из 9 столбца excel таблицы
            let buff_el = await load_column(folder_input + "work_path.xlsx", "ФПК ИН на 31.12.2022", 1);
            //| Отсеиваем и Получаем столбец (массив адресов)
            input_locations = _.cloneDeep(buff_el.slice(skip_rows_count + 1, buff_el.length) //| Отсеиваем
                .filter(el => el.length > limit_address_length)
                .map(el => el.replace(/\d{6},|\n|\t/gi, " "))
                .map(el => el.replace(/\s+/ig, " ").trim().toLowerCase()));
        }
        else
            console.log("Входной файл ms_excel не обнаружен. Будут использованы тестовые адреса.");
        input_locations.forEach(el => file_data.push(data_init(el)));
    }
    //| сохраняем файл с данными
    fs.writeFileSync(buffer_file_path, JSON.stringify(file_data));
    //| запускаем цикл по всем данным
    for (let i = 0; i < file_data.length; i++) {
        console.log("Обрабатываю:", `(${file_data[i].input_address})`); //| лог статуса обработки адресов
        //| ЭТАП 1. Загружаем основные хар-ки по адресу. Если ранее адрес был получен -> пропускаем его получение
        //| иначе запускаем алгоритм поиска корректного адреса для текущей позиции "i"
        if (file_data[i].correct_address === null) {
            console.log("\t-загрузка параметров yandex_api api.....");
            //| поиск параметров по адресу с yandex_api.api
            console.log("\ttoken:\t", API_TOKEN);
            file_data[i] = concat_values_right(file_data[i], await yan_api_req_by_params(API_TOKEN, file_data[i].input_address));
            //| промежуточно сокращаем округ для Москвы
            file_data[i].district_city_okrug_m_short = moskow_okrug_short(file_data[i].district_city_okrug);
            //| если совсем нет данных, устанавливаем флаг на пропуск позиции
            if (!have_info(file_data[i])) {
                console.log("\tне информации\t", `(${file_data[i].input_address})`);
                continue;
            }
            //| сохраняемся
            fs.writeFileSync(buffer_file_path, JSON.stringify(file_data));
        }
        //| ЭТАП 2. Определяем cian id региона.
        //| проверим наличие id региона и параметров для его получения
        //|
        if (!file_data[i].r_cian_region_id && file_data[i].region) {
            let pattern = new RegExp(file_data[i].region, "ig");
            let regions_found = (await get_cian_regions()).filter(region => {
                return Boolean(pattern.test(region.displayName));
            });
            if (regions_found) {
                file_data[i].r_cian_region_id = regions_found[0].id;
            }
            fs.writeFileSync(buffer_file_path, JSON.stringify(file_data));
        }
        //| ЭТАП 3. Если город федеральный.
        //|
        if (file_data[i].region && file_data[i].city && file_data[i].region === file_data[i].city) {
            file_data[i].r_cian_city_id = file_data[i].r_cian_region_id;
        }
        //| ЭТАП 4. Определяем id города.
        //| Проверим наличие id города и параметров для его получения
        //|
        if (!file_data[i].r_cian_city_id && file_data[i].r_cian_region_id && file_data[i].city) {
            let pattern = new RegExp(file_data[i].city, "ig");
            let cities_found = (await get_cian_cities(page, file_data[i].r_cian_region_id)).filter(city => {
                return Boolean(pattern.test(city.displayName));
            });
            if (cities_found) {
                file_data[i].r_cian_city_id = cities_found[0].id;
            }
            fs.writeFileSync(buffer_file_path, JSON.stringify(file_data));
        }
        //| ЭТАП 5. Определяем id районов, городских округов.
        //| проверим наличие id района и параметров для его получения
        //|
        if (file_data[i].r_cian_city_id) {
            //| грузим все дистрикты
            let b_cian_districts = await get_cian_districts(page, file_data[i].r_cian_region_id, file_data[i].r_cian_city_id);
            if (!file_data[i].district_city_okrug_cian_id && file_data[i].district_city_okrug) {
                //| Ищем id округа в городе
                let buff_okrug = file_data[i].district_city_okrug_m_short || file_data[i].district_city_okrug;
                file_data[i].district_city_okrug_cian_id = search_district_id({ name: ".", id: ".", childs: _.cloneDeep(b_cian_districts) }, buff_okrug, "childs");
            }
            if (!file_data[i].district_raion_cian_id && file_data[i].district_raion) {
                //| Ищем id района в городе
                file_data[i].district_raion_cian_id = search_district_id({ name: ".", id: ".", childs: _.cloneDeep(b_cian_districts) }, file_data[i].district_raion, "childs");
            }
            fs.writeFileSync(buffer_file_path, JSON.stringify(file_data));
        }
        //| ЭТАП 6. Составляем запрос | Генерируем ссылки
        //| проверяем наличие всех хар-к -> запускаем алгоритм
        //|
        if (!file_data[i].generate_pages_is_done) {
            //| всегда чистим массив.
            file_data[i].pages = [];
            let buff_subjects_id_array = [];
            //| получаем параметры запроса из конфигуратора
            let params_aggregation = params_request;
            //| закидываем id объектов города.
            //| Далее будем бежать по ним и добавлять ссылки
            if (file_data[i].district_raion_cian_id) {
                buff_subjects_id_array.push({
                    subject_type: "городской район",
                    subject_name: file_data[i].district_raion,
                    request_param: "&district=" + file_data[i].district_raion_cian_id
                });
            }
            if (file_data[i].district_city_okrug_cian_id) {
                buff_subjects_id_array.push({
                    subject_type: "городской округ",
                    subject_name: file_data[i].district_city_okrug,
                    request_param: "&district=" + file_data[i].district_city_okrug_cian_id
                });
            }
            if (file_data[i].r_cian_city_id) {
                buff_subjects_id_array.push({
                    subject_type: "город",
                    subject_name: file_data[i].city,
                    request_param: "&location=" + file_data[i].r_cian_city_id
                });
            }
            if (file_data[i].r_cian_region_id && file_data[i].r_cian_region_id !== file_data[i].r_cian_city_id) {
                buff_subjects_id_array.push({
                    subject_type: "регион",
                    subject_name: file_data[i].region,
                    request_param: "&location=" + file_data[i].r_cian_region_id
                });
            }
            //| пробегаем по массиву id (начиная с мкр. районов) генерируем ссылки на страницы
            for (let location of buff_subjects_id_array) {
                let b_req = params_aggregation + location.request_param;
                let generate_response = (await cian_page_links_generator(page, b_req));
                generate_response.links.splice(1, 5).forEach(url => {
                    file_data[i].pages.push({
                        url: url,
                        subject_type: location.subject_type,
                        subject_name: location.subject_name,
                        offers: [],
                        isLoaded: false
                    });
                });
            }
            //| успешно, сохраняемся
            file_data[i].generate_pages_is_done = true;
            fs.writeFileSync(buffer_file_path, JSON.stringify(file_data));
        }
        //| TEST | ЭТАП 7. Загрузка и фильтрация данных
        //| тест функции, которая загружает и фильтрует предложения по набору ссылок
        //|
        if (file_data[i].pages) {
            let max = file_data[i].pages.length;
            let counterOffers = 0;
            for (let j = 0; j < max; j++) {
                console.log("\t-загрузка предложений.....", j + 1, "/", max, "/", file_data[i].pages[j].url);
                if (file_data[i].pages[j].isLoaded)
                    continue;
                let response_offers = await load_offers_from_page(page, file_data[i].pages[j].url);
                counterOffers += response_offers.length;
                if (response_offers) {
                    //| парсим оффер, передаем парсеру полный оффер и парсер описания для земли
                    //| функция парсера привязана к группе выгружаемых объектов и записана в конфигураторе
                    file_data[i].pages[j].offers = response_offers.map(offer => offerParser(offer));
                    file_data[i].pages[j].isLoaded = true;
                    fs.writeFileSync(buffer_file_path, JSON.stringify(file_data));
                }
            }
        }
        //| сохраняемся
        fs.writeFileSync(buffer_file_path, JSON.stringify(file_data));
    }
    //| создаем массив объектов (аналогов)
    let analoguesObjectsBox = [];
    file_data.forEach((el, i) => {
        el.pages.forEach(page => {
            page.offers.forEach(offer => {
                analoguesObjectsBox.push({
                    input_id: {
                        description: "№",
                        value: i + 1
                    },
                    inputAddress: {
                        description: "Адрес оцениваемой позиции",
                        value: el.input_address
                    },
                    //| для расчета данные хар-ки не нужны
                    // correctAddress: el.correct_address,
                    lat_lon: {
                        description: "Ш/Д",
                        value: el.geo_lat + "," + el.geo_lon,
                    },
                    // lat: el.geo_lat,
                    // lon: {
                    //     description: "Долгота",
                    //     value: el.geo_lon,
                    // },
                    subject_type: {
                        description: "Тип субъекта",
                        value: page.subject_type
                    },
                    subject_name: {
                        description: "Субъекта",
                        value: page.subject_name
                    },
                    ...offer,
                });
            });
        });
    });
    //| удаляем дубликаты
    //|
    let analoguesObjectsBoxWithoutDuplicates = [];
    if (fs.existsSync("analoguesBoxWithoutDuplicates.json")) {
        analoguesObjectsBoxWithoutDuplicates = JSON.parse(String(fs.readFileSync("analoguesBoxWithoutDuplicates.json")));
    }
    else {
        if (Array.isArray(analoguesObjectsBox) && analoguesObjectsBox.length > 0) {
            let descriptionsBuffer = {}, idsBuffer = {};
            analoguesObjectsBoxWithoutDuplicates = analoguesObjectsBox.filter(obj => {
                let descKey = obj.description.value.replace(/[\n\\n\\t\t\s+,.=+:;_""''!?()-\/\\]+/ig).toLowerCase();
                let cianIdKey = obj.cianId.value;
                if ((cianIdKey in idsBuffer) || (descKey in descriptionsBuffer)) {
                    idsBuffer[cianIdKey] += 1;
                    descriptionsBuffer[descKey] += 1;
                    return false;
                }
                else {
                    if (!(cianIdKey in idsBuffer) && !(descKey in descriptionsBuffer)) {
                        idsBuffer[cianIdKey] = 1;
                        descriptionsBuffer[descKey] = 1;
                        return true;
                    }
                }
                return false;
            });
        }
        fs.writeFileSync("analoguesBoxWithoutDuplicates.json", JSON.stringify(analoguesObjectsBoxWithoutDuplicates));
    }
    //
    //| определение данных по кадастровому номеру
    //
    // let max = analoguesObjectsBoxWithoutDuplicates.length;
    // for (let j = 0; j < max; j++) {
    //     //| проверяем наличие кадастрового номера
    //     let el = analoguesObjectsBoxWithoutDuplicates[j];
    //     let buffer = {
    //         _lotCategory: {description: "Категория земель", value: null},
    //         _type: {description: "вид", value: null},
    //         _permittedUse: {description: "Разрешенное использование", value: null},
    //         _typeOfOwnership: {description: "Форма собственности", value: null},
    //         _cadastralPrice: {description: "Кадастровая стоимость", value: null},
    //         _dateOfDetermination: {description: "Дата определения", value: null},
    //         _approvalDate: {description: "дата утверждения", value: null},
    //         _dateOfEntry: {description: "дата внесения сведений", value: null},
    //         _appliedDate: {description: "Постановлен на учёт", value: null},
    //         _byDocuments: {description: "По документам", value: null},
    //         _arrestOrBail: {description: "Арест, залог и т.д.", value: null},
    //         _status: {description: "Статус", value: null}
    //     };
    //     if (
    //         !el._permittedUse &&
    //         !el._typeOfOwnership &&
    //         !el._dateOfDetermination &&
    //         !el._cadastralPrice &&
    //         typeof el.cadastralNumber.value === "string" &&
    //         el.cadastralNumber.value.match(/\d+(:\d+)+/ig)
    //     ) {
    //         console.log("определение параметров по кадастровому номеру:", el.cadastralNumber.value, ":", j, "/", max);
    //         //| получаем данные с карты росреестра
    //         let cadNumber = el.cadastralNumber.value.match(/\d+(:\d+)+/ig)[0];
    //         let response = await search_by_cadastral_map(cadNumber);
    //         console.log("получаем данные с реестра");
    //         //| проверяем наличие параметров (полученных ранее), заносим при отсутствии.
    //         if (response) {
    //             if (!analoguesObjectsBoxWithoutDuplicates[j]._lotCategory && response.category.value) {
    //                 buffer._lotCategory.value = response.category.value
    //             }
    //             if (!analoguesObjectsBoxWithoutDuplicates[j].category && response.type.value) {
    //                 buffer._type.value = response.type.value;
    //             }
    //             if (!analoguesObjectsBoxWithoutDuplicates[j]._permittedUse && response.permittedUse) {
    //                 buffer._permittedUse.value = response.permittedUse.value;
    //             }
    //             //| новый параметр Форма собственности
    //             if (!analoguesObjectsBoxWithoutDuplicates[j]._typeOfOwnership && response.typeOfOwnership) {
    //                 buffer._typeOfOwnership.value = response.typeOfOwnership.value;
    //             }
    //             //| новый параметр Кадастровая стоимость
    //             if (!analoguesObjectsBoxWithoutDuplicates[j]._cadastralPrice && response.cadastralPrice) {
    //                 buffer._cadastralPrice.value = response.cadastralPrice.value;
    //             }
    //             //| новый параметр Дата определения
    //             if (!analoguesObjectsBoxWithoutDuplicates[j]._dateOfDetermination && response.dateOfDetermination) {
    //                 buffer._dateOfDetermination.value = response.dateOfDetermination.value;
    //             }
    //             //| новый параметр дата утверждения
    //             if (!analoguesObjectsBoxWithoutDuplicates[j]._approvalDate && response.approvalDate) {
    //                 buffer._approvalDate.value = response.approvalDate.value;
    //             }
    //             //| новый параметр дата внесения сведений
    //             if (!analoguesObjectsBoxWithoutDuplicates[j]._dateOfEntry && response.dateOfEntry) {
    //                 buffer._dateOfEntry.value = response.dateOfEntry.value;
    //             }
    //             //| новый параметр дата постановки на учет
    //             if (!analoguesObjectsBoxWithoutDuplicates[j]._appliedDate && response.appliedDate) {
    //                 buffer._appliedDate.value = response.appliedDate.value;
    //             }
    //             //| по документам
    //             if (!analoguesObjectsBoxWithoutDuplicates[j]._byDocuments && response.byDocuments) {
    //                 buffer._byDocuments.value = response.byDocuments.value;
    //             }
    //             //| наличие проблем, арестов
    //             if (!analoguesObjectsBoxWithoutDuplicates[j]._arrestOrBail && response.arrestOrBail) {
    //                 buffer._arrestOrBail.value = response.arrestOrBail.value;
    //             }
    //             //| наличие проблем, арестов
    //             if (!analoguesObjectsBoxWithoutDuplicates[j]._status && response.status) {
    //                 buffer._status.value = response.status.value;
    //             }
    //         }
    //         await timeout(2500);
    //     }
    //     analoguesObjectsBoxWithoutDuplicates[j] = {...analoguesObjectsBoxWithoutDuplicates[j], ...buffer}
    //     fs.writeFileSync("analoguesBoxWithoutDuplicates.json", JSON.stringify(analoguesObjectsBoxWithoutDuplicates));
    // }
    //
    //| создаем шапку
    //
    let header = Object.values(analoguesObjectsBoxWithoutDuplicates[0]).map(el => el.description);
    //
    //| создаем массив для сохранения
    //
    let analoguesBoxForSave = analoguesObjectsBoxWithoutDuplicates.map(obj => [...Object.values(obj).map(obj => obj.value || null)]);
    //
    //| Добавляем шапку
    //
    analoguesBoxForSave.unshift(header);
    //
    //| Сохраняем в excel
    //
    await save_array(folder_output + "analogues.xlsx", "sheet", analoguesBoxForSave);
    //
    await page.close();
    await browser.close();
    console.log("процесс завершен");
})();
//# sourceMappingURL=start_scrape.js.map