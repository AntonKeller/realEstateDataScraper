//| импорт парсеров
//
const { offerLandParse } = require("./cian__offer__parsers/land__parser");
const { offerGarageParse } = require("./cian__offer__parsers/garage__parser");
const { offerDefaultParser } = require("./cian__offer__parsers/default__parser");
//| константы
//
const BASE_URL_AREA_SALE = "https://www.cian.ru/cat.php?cats%5B0%5D=commercialLandSale";
const BASE_URL_AREA_RENT = "https://www.cian.ru/cat.php?cats%5B0%5D=commercialLandRent";
const BASE_URL = "https://www.cian.ru/cat.php?";
const OFFER_TYPE_SUBURBAN = "&offer_type=suburban";
const OFFER_TYPE_OFFICES = "&offer_type=offices";
const OFFER_TYPE_FLAT = "&offer_type=flat";
const ENGINE = "&engine_version=2";
const DEAL_SALE = "&deal_type=sale";
const DEAL_RENT = "&deal_type=rent";
//| набор и конфигов для парсинга недвижимости.
//| различного типа: начиная от кварти и офисов заканчивая долями домов, гаражами и землей.
//| для каждой составлена "Базовая Ссылка" Без локации и номера страницы.
//
const configuration = {
    offices_sale: {
        params_request: BASE_URL + ENGINE + DEAL_SALE + OFFER_TYPE_OFFICES + "&office_type=1",
        description: "продажа офисов",
        offerParser: offerDefaultParser,
    },
    offices_rent: {
        params_request: BASE_URL + ENGINE + DEAL_RENT + OFFER_TYPE_OFFICES + "&office_type=1",
        description: "аренда офисов",
        offerParser: offerDefaultParser
    },
    trade_area_sale: {
        params_request: BASE_URL + ENGINE + DEAL_SALE + OFFER_TYPE_OFFICES + "&office_type=2",
        description: "продажа торговых площадей",
        offerParser: offerDefaultParser
    },
    trade_area_rent: {
        params_request: BASE_URL + ENGINE + DEAL_RENT + OFFER_TYPE_OFFICES + "&office_type=2",
        description: "аренда торговых площадей",
        offerParser: offerDefaultParser
    },
    warehouses_sale: {
        params_request: BASE_URL + ENGINE + DEAL_SALE + OFFER_TYPE_OFFICES + "&office_type=3",
        description: "продажа складов",
        offerParser: offerDefaultParser
    },
    warehouses_rent: {
        params_request: BASE_URL + ENGINE + DEAL_RENT + OFFER_TYPE_OFFICES + "&office_type=3",
        description: "аренда складов",
        offerParser: offerDefaultParser
    },
    industrial_premises_sale: {
        params_request: BASE_URL + ENGINE + DEAL_SALE + OFFER_TYPE_OFFICES + "&office_type=7",
        description: "продажа производственных помещений",
        offerParser: offerDefaultParser
    },
    industrial_premises_rent: {
        params_request: BASE_URL + ENGINE + DEAL_RENT + OFFER_TYPE_OFFICES + "&office_type=7",
        description: "аренда производственных помещений",
        offerParser: offerDefaultParser
    },
    buildings_sale: {
        params_request: BASE_URL + ENGINE + DEAL_SALE + OFFER_TYPE_OFFICES + "&office_type%5B0%5D=11",
        description: "продажа зданий",
        offerParser: offerDefaultParser
    },
    buildings_rent: {
        params_request: BASE_URL + ENGINE + DEAL_RENT + OFFER_TYPE_OFFICES + "&office_type=11",
        description: "аренда зданий",
        offerParser: offerDefaultParser
    },
    vacant_premises_sale: {
        params_request: BASE_URL + ENGINE + DEAL_SALE + OFFER_TYPE_OFFICES + "&office_type=5",
        description: "продажа псн.",
        offerParser: offerDefaultParser
    },
    vacant_premises_rent: {
        params_request: BASE_URL + ENGINE + DEAL_RENT + OFFER_TYPE_OFFICES + "&office_type=5",
        description: "аренда псн.",
        offerParser: offerDefaultParser
    },
    ready_business_sale: {
        params_request: BASE_URL + ENGINE + DEAL_SALE + OFFER_TYPE_OFFICES + "&office_type=10",
        description: "продажа готового бизнеса",
        offerParser: offerDefaultParser
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
        offerParser: offerDefaultParser
    },
    room_share_sale: {
        params_request: BASE_URL + ENGINE + DEAL_SALE + OFFER_TYPE_FLAT + "&room8=1",
        description: "продажа долей комнат",
        offerParser: offerDefaultParser
    },
    apartment_new_sale: {
        params_request: BASE_URL + ENGINE + DEAL_SALE + OFFER_TYPE_FLAT + "&object_type%5B0%5D=2",
        description: "продажа новых квартир",
        offerParser: offerDefaultParser
    },
    apartment_old_sale: {
        params_request: BASE_URL + ENGINE + DEAL_SALE + OFFER_TYPE_FLAT + "&object_type%5B0%5D=1",
        description: "продажа квартир на вторичке",
        offerParser: offerDefaultParser
    },
    house_sale: {
        params_request: BASE_URL + ENGINE + DEAL_SALE + OFFER_TYPE_SUBURBAN + "&object_type%5B0%5D=1",
        description: "продажа домов",
        offerParser: offerDefaultParser
    },
    house_share_sale: {
        params_request: BASE_URL + ENGINE + DEAL_SALE + OFFER_TYPE_SUBURBAN + "&object_type%5B0%5D=2",
        description: "продажа долей домов",
        offerParser: offerDefaultParser
    },
    townhouse_sale: {
        params_request: BASE_URL + ENGINE + DEAL_SALE + OFFER_TYPE_SUBURBAN + "&object_type%5B0%5D=4",
        description: "продажа таунхаусов",
        offerParser: offerDefaultParser
    },
    apartment_old_rent: {
        params_request: BASE_URL + ENGINE + DEAL_RENT + OFFER_TYPE_FLAT,
        description: "аренда квартир",
        offerParser: offerDefaultParser
    },
    room_rent: {
        params_request: BASE_URL + ENGINE + DEAL_RENT + OFFER_TYPE_FLAT + "&room0=1",
        description: "аренда комнат",
        offerParser: offerDefaultParser
    },
    room_bed_rent: {
        params_request: BASE_URL + ENGINE + DEAL_RENT + OFFER_TYPE_FLAT + "&room10=1",
        description: "аренда койко-мест",
        offerParser: offerDefaultParser
    },
    house_rent: {
        params_request: BASE_URL + ENGINE + DEAL_RENT + OFFER_TYPE_SUBURBAN + "&object_type%5B0%5D=1",
        description: "аренда домов",
        offerParser: offerDefaultParser
    },
    townhouse_rent: {
        params_request: BASE_URL + ENGINE + DEAL_RENT + OFFER_TYPE_SUBURBAN + "&object_type%5B0%5D=1",
        description: "аренда таунхаусов",
        offerParser: offerDefaultParser
    },
};
// (function test.json() {
//     console.log("\n\nБазовые Ссылки на недвижимость:");
//     for (let key of Object.keys(configuration)) {
//         console.log("\t-", configuration[key].description, configuration[key].params_request);
//     }
// })()
module.exports = {
    configuration
};
//# sourceMappingURL=configurator.js.map