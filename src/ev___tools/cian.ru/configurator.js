//| парсеры
import {offerLandParse} from "./offerParsers/land_parser.js";
import {offerGarageParse} from "./offerParsers/garage_parser.js";
import {offerOfficeParse} from "./offerParsers/office_parser.js";
import _ from "lodash";


//| константы
const BASE_URL_AREA_SALE = "https://www.cian.ru/cat.php?cats%5B0%5D=commercialLandSale";
const BASE_URL_AREA_RENT = "https://www.cian.ru/cat.php?cats%5B0%5D=commercialLandRent";
const BASE_URL = "https://www.cian.ru/cat.php?";
const OFFER_TYPE_SUBURBAN = "&offer_type=suburban";
const OFFER_TYPE_OFFICES = "&offer_type=offices";
const OFFER_TYPE_FLAT = "&offer_type=flat";
const ENGINE = "&engine_version=2";
const DEAL_SALE = "&deal_type=sale";
const DEAL_RENT = "&deal_type=rent";
const OFFICE_MIN_AREA = "&minarea="; //| в квадратных метрах
const OFFICE_MAX_AREA = "&maxarea="; //| в квадратных метрах
const LAND_MIN_AREA = "&minsite=45"; //| параметр принимает единицы только в сотках
const LAND_MAX_AREA = "&maxsite=50"; //| параметр принимает единицы только в сотках

const buildClasses = [
    {param: "&building_class_type%5B0%5D=1", description: "А"},
    {param: "&building_class_type%5B0%5D=2", description: "А+"},
    {param: "&building_class_type%5B0%5D=3", description: "B"},
    {param: "&building_class_type%5B0%5D=4", description: "B+"},
    {param: "&building_class_type%5B0%5D=5", description: "C"},
    {param: "&building_class_type%5B0%5D=8", description: "B-"},
    {param: "", description: "Без класса"}
];

//| конфигурации для загрузки данных
export const configuration = {
    offices_sale: {
        params_request: BASE_URL + ENGINE + DEAL_SALE + OFFER_TYPE_OFFICES + "&office_type=1", //| набор основы параметров
        minArea: "", //| в квадратных метрах для всех объектов\категорий недвижимости
        maxArea: "", //| в квадратных метрах для всех объектов\категорий недвижимости
        buildClasses: _.cloneDeep(buildClasses),
        description: "продажа офисов",
        getBaseLink() {
            if (this.minArea && !this.maxArea) {
                return this.params_request + OFFICE_MIN_AREA + this.minArea;
            } else if (!this.minArea && this.maxArea) {
                return this.params_request + OFFICE_MAX_AREA + this.maxArea;
            } else if (this.minArea && this.maxArea) {
                return this.params_request + OFFICE_MIN_AREA + this.minArea + OFFICE_MAX_AREA + this.maxArea;
            } else if (!this.minArea && !this.maxArea) {
                return this.params_request;
            }
        },
        offerParser: offerOfficeParse,
    },
    offices_rent: {
        params_request: BASE_URL + ENGINE + DEAL_RENT + OFFER_TYPE_OFFICES + "&office_type=1",
        buildClasses: _.cloneDeep(buildClasses),
        description: "аренда офисов",
        offerParser: offerOfficeParse
    },
    trade_area_sale: {
        params_request: BASE_URL + ENGINE + DEAL_SALE + OFFER_TYPE_OFFICES + "&office_type=2",
        description: "продажа торговых площадей",
        offerParser: offerOfficeParse
    },
    trade_area_rent: {
        params_request: BASE_URL + ENGINE + DEAL_RENT + OFFER_TYPE_OFFICES + "&office_type=2",
        description: "аренда торговых площадей",
        offerParser: offerOfficeParse
    },
    warehouses_sale: {
        params_request: BASE_URL + ENGINE + DEAL_SALE + OFFER_TYPE_OFFICES + "&office_type=3",
        description: "продажа складов",
        offerParser: offerLandParse
    },
    warehouses_rent: {
        params_request: BASE_URL + ENGINE + DEAL_RENT + OFFER_TYPE_OFFICES + "&office_type=3",
        description: "аренда складов",
        offerParser: offerLandParse
    },
    industrial_premises_sale: {
        params_request: BASE_URL + ENGINE + DEAL_SALE + OFFER_TYPE_OFFICES + "&office_type=7",
        description: "продажа производственных помещений",
        offerParser: offerOfficeParse
    },
    industrial_premises_rent: {
        params_request: BASE_URL + ENGINE + DEAL_RENT + OFFER_TYPE_OFFICES + "&office_type=7",
        description: "аренда производственных помещений",
        offerParser: offerOfficeParse
    },
    buildings_sale: {
        params_request: BASE_URL + ENGINE + DEAL_SALE + OFFER_TYPE_OFFICES + "&office_type%5B0%5D=11",
        description: "продажа зданий",
        offerParser: offerOfficeParse
    },
    buildings_rent: {
        params_request: BASE_URL + ENGINE + DEAL_RENT + OFFER_TYPE_OFFICES + "&office_type=11",
        description: "аренда зданий",
        offerParser: offerOfficeParse
    },
    vacant_premises_sale: {
        params_request: BASE_URL + ENGINE + DEAL_SALE + OFFER_TYPE_OFFICES + "&office_type=5",
        description: "продажа псн.",
        offerParser: offerOfficeParse
    },
    vacant_premises_rent: {
        params_request: BASE_URL + ENGINE + DEAL_RENT + OFFER_TYPE_OFFICES + "&office_type=5",
        description: "аренда псн.",
        offerParser: offerOfficeParse
    },
    ready_business_sale: {
        params_request: BASE_URL + ENGINE + DEAL_SALE + OFFER_TYPE_OFFICES + "&office_type=10",
        description: "продажа готового бизнеса",
        offerParser: offerLandParse
    },
    land_sale: {
        params_request: BASE_URL_AREA_SALE + ENGINE + DEAL_SALE + OFFER_TYPE_OFFICES,
        description: "продажа комм. земли/участка",
        offerParser: offerLandParse
    },
    land_rent: {
        params_request: BASE_URL_AREA_RENT + ENGINE + DEAL_RENT + OFFER_TYPE_OFFICES,
        description: "аренда комм. земли/участка",
        offerParser: offerLandParse
    },
    garages_sale: {
        params_request: BASE_URL + ENGINE + DEAL_SALE + OFFER_TYPE_OFFICES + "&office_type=6",
        description: "продажа гаражей",
        offerParser: offerGarageParse
    },
    garages_rent: {
        params_request: BASE_URL + ENGINE + DEAL_RENT + OFFER_TYPE_OFFICES + "&office_type=6",
        description: "аренда гаражей",
        offerParser: offerGarageParse
    },
    room_sale: {
        params_request: BASE_URL + ENGINE + DEAL_SALE + OFFER_TYPE_FLAT + "&room0=1",
        description: "продажа комнат",
        offerParser: offerLandParse
    },
    room_share_sale: {
        params_request: BASE_URL + ENGINE + DEAL_SALE + OFFER_TYPE_FLAT + "&room8=1",
        description: "продажа долей комнат",
        offerParser: offerLandParse
    },
    apartment_new_sale: {
        params_request: BASE_URL + ENGINE + DEAL_SALE + OFFER_TYPE_FLAT + "&object_type%5B0%5D=2",
        description: "продажа новых квартир",
        offerParser: offerLandParse
    },
    apartment_old_sale: {
        params_request: BASE_URL + ENGINE + DEAL_SALE + OFFER_TYPE_FLAT + "&object_type%5B0%5D=1",
        description: "продажа квартир на вторичке",
        offerParser: offerLandParse
    },
    house_sale: {
        params_request: BASE_URL + ENGINE + DEAL_SALE + OFFER_TYPE_SUBURBAN + "&object_type%5B0%5D=1",
        description: "продажа домов",
        offerParser: offerLandParse
    },
    house_share_sale: {
        params_request: BASE_URL + ENGINE + DEAL_SALE + OFFER_TYPE_SUBURBAN + "&object_type%5B0%5D=2",
        description: "продажа долей домов",
        offerParser: offerLandParse
    },
    townhouse_sale: {
        params_request: BASE_URL + ENGINE + DEAL_SALE + OFFER_TYPE_SUBURBAN + "&object_type%5B0%5D=4",
        description: "продажа таунхаусов",
        offerParser: offerLandParse
    },
    apartment_old_rent: {
        params_request: BASE_URL + ENGINE + DEAL_RENT + OFFER_TYPE_FLAT,
        description: "аренда квартир",
        offerParser: offerLandParse
    },
    room_rent: {
        params_request: BASE_URL + ENGINE + DEAL_RENT + OFFER_TYPE_FLAT + "&room0=1",
        description: "аренда комнат",
        offerParser: offerLandParse
    },
    room_bed_rent: {
        params_request: BASE_URL + ENGINE + DEAL_RENT + OFFER_TYPE_FLAT + "&room10=1",
        description: "аренда койко-мест",
        offerParser: offerLandParse
    },
    house_rent: {
        params_request: BASE_URL + ENGINE + DEAL_RENT + OFFER_TYPE_SUBURBAN + "&object_type%5B0%5D=1",
        description: "аренда домов",
        offerParser: offerLandParse
    },
    townhouse_rent: {
        params_request: BASE_URL + ENGINE + DEAL_RENT + OFFER_TYPE_SUBURBAN + "&object_type%5B0%5D=1",
        description: "аренда таунхаусов",
        offerParser: offerLandParse
    },
}


//| функция тестирования конфигурации
// (function test.json() {
//     console.log("\n\nБазовые Ссылки на недвижимость:");
//     for (let key of Object.keys(configuration)) {
//         console.log("\t-", configuration[key].description, configuration[key].params_request);
//     }
// })()