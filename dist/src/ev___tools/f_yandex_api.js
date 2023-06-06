const _ = require("lodash");
const fetch = require("node-fetch");
const { init_address_params } = require("./f_yandex_initial");
const BASE_URL = "https://geocode-maps.yandex.ru/1.x/?"; //| базовый адрес
const SCO = {
    long_lat: "longlat",
    lat_long: "latlong" //| — широта, долгота.
};
const KIND = {
    district: "district",
    metro: "metro",
    house: "house",
    street: "street",
    locality: "locality" //| населенный пункт (город/поселок/деревня/село/...).
};
const FORMAT = {
    xml: "xml",
    json: "json"
};
// const LANG = {
//     ru_RU: "&lang=ru_RU", //| русский;
//     uk_UA: "&lang=uk_UA", //| украинский;
//     be_BY: "&lang=be_BY", //| белорусский;
//     en_RU: "&lang=en_RU", //| ответ на английском, российские особенности карты;
//     en_US: "&lang=en_US", //| ответ на английском, американские особенности карты;
// }
//| функция получает основные данные по адресу или данные по координатам
const request_yandex = async (api_token, geocode, kind) => {
    let req = BASE_URL +
        api_token +
        "&geocode=" + geocode +
        "&format=" + FORMAT.json +
        "&sco=" + SCO.lat_long +
        "&kind=" + kind;
    let resp = await fetch(req);
    return await resp.json();
};
//| Разбирает массив географических элементов
const parse_params = (data_array = []) => {
    if (data_array.length <= 0)
        return [];
    const location_data = init_address_params();
    //| снижаем регистр у всех значений ключей
    let b_data_array = data_array.map(el => {
        return {
            kind: el.kind.toLowerCase(),
            name: el.name.toLowerCase(),
        };
    });
    //| парсинг страны
    let country = b_data_array.filter(el => el.kind.indexOf("country") !== -1);
    if (country.length > 0) {
        location_data.country = country[0].name;
    }
    //| парсинг федерального округа
    let federal_okrug = b_data_array.filter(el => {
        return (el.kind.indexOf("province") !== -1)
            && (el.name.indexOf("федерал") !== -1)
            && (el.name.indexOf("округ") !== -1);
    });
    if (federal_okrug.length > 0) {
        location_data.federal_okrug = federal_okrug[0].name;
    }
    //| парсинг региона
    let region = b_data_array.filter(el => {
        return (el.kind.indexOf("province") !== -1)
            && !(el.name.indexOf("федерал") !== -1)
            && !(el.name.indexOf("округ") !== -1);
    });
    if (region.length > 0) {
        location_data.region = region[0].name;
    }
    //| парсинг муниципального округа
    let municipal_okrug = b_data_array.filter(el => {
        return (el.kind.indexOf("area") !== -1)
            && (el.name.indexOf("округ") !== -1);
    });
    if (municipal_okrug.length > 0) {
        location_data.municipal_okrug = municipal_okrug[0].name;
    }
    //| парсинг муниципального района
    let municipal_raion = b_data_array.filter(el => {
        return (el.kind.indexOf("area") !== -1)
            && (el.name.indexOf("район") !== -1);
    });
    if (municipal_raion.length > 0) {
        location_data.municipal_raion = municipal_raion[0].name;
    }
    //| парсинг города
    let city = b_data_array.filter(el => (el.kind.indexOf("locality") !== -1));
    if (city.length > 0) {
        location_data.city = city[0].name;
    }
    //| парсинг статуса федерального города
    if (location_data.region &&
        location_data.city &&
        location_data.region === location_data.city) {
        location_data.isFederalCity = true;
    }
    //| парсинг городского округа
    let district_city_okrug = b_data_array.filter(el => {
        return (el.kind.indexOf("district") !== -1)
            && (el.name.indexOf("округ") !== -1);
    });
    if (district_city_okrug.length > 0) {
        let buff = district_city_okrug[0].name.split(" ")
            .filter(el => el.indexOf("округ") === -1 && el.indexOf("административ") === -1);
        if (buff.length > 0)
            location_data.district_city_okrug = buff[0];
    }
    //| парсинг городского района
    let district_city_raion = b_data_array.filter(el => {
        return (el.kind.indexOf("district") !== -1)
            && (el.name.indexOf("район") !== -1);
    });
    if (district_city_raion.length > 0) {
        let buff = district_city_raion[0].name.split(" ").filter(el => el.indexOf("район") === -1);
        if (buff.length > 0)
            location_data.district_raion = buff[0];
    }
    //| парсинг микрорайона
    let district_city_mikroraion = b_data_array.filter(el => {
        return (el.kind.indexOf("district") !== -1)
            && (el.name.indexOf("микрорайон") !== -1);
    });
    if (district_city_mikroraion.length > 0) {
        location_data.district_mikroraion = district_city_mikroraion[0].name;
    }
    //| парсинг квартал
    let district_section = b_data_array.filter(el => {
        return (el.kind.indexOf("district") !== -1)
            && (el.name.indexOf("квартал") !== -1);
    });
    if (district_section.length > 0) {
        location_data.district_section = district_section[0].name;
    }
    //| парсинг улицы
    let street = b_data_array.filter(el => el.kind.indexOf("street") !== -1);
    if (street.length > 0) {
        location_data.street = street[0].name;
    }
    //| парсинг дом
    let house = b_data_array.filter(el => el.kind.indexOf("house") !== -1);
    if (house.length > 0) {
        location_data.house = house[0].name;
    }
    return _.cloneDeep(location_data);
};
//| объеденяет значения в двух объектах
//| если ключа нет => создает его. Исходные объекты не модифицируются.
//| возвращает новый объект с объедененными ключами и значениями
const concatenate_values = (obj_1, obj_2) => {
    let result_object = {};
    for (let key in obj_1) {
        let v_1 = key in obj_1 ? obj_1[key] : null;
        let v_2 = key in obj_2 ? obj_2[key] : null;
        result_object[key] = v_1 || v_2;
    }
    return result_object;
};
//| проверяет маршрут к данными в объекте
//| пришедшем с ответом от yandex_api api
//| возвращает true || false.
const route_test_featureMember = yandex_response => {
    if (Boolean(yandex_response) &&
        Boolean(yandex_response.response) &&
        Boolean(yandex_response.response.GeoObjectCollection) &&
        Boolean(yandex_response.response.GeoObjectCollection.featureMember) &&
        Boolean(yandex_response.response.GeoObjectCollection.featureMember.length > 0)) {
        return true;
    }
    return false;
};
//| проверяет маршрут к данными в объекте
//| пришедшем с ответом от yandex_api api
//| возвращает true || false.
const route_test_AddressComponents = featureMember => {
    if (Boolean(featureMember) &&
        Boolean(featureMember.GeoObject) &&
        Boolean(featureMember.GeoObject.metaDataProperty) &&
        Boolean(featureMember.GeoObject.metaDataProperty.GeocoderMetaData) &&
        Boolean(featureMember.GeoObject.metaDataProperty.GeocoderMetaData.Address) &&
        Boolean(featureMember.GeoObject.metaDataProperty.GeocoderMetaData.Address.Components) &&
        Boolean(featureMember.GeoObject.metaDataProperty.GeocoderMetaData.Address.Components.length > 0)) {
        return true;
    }
    return false;
};
//| проверяет маршрут к данными в объекте
//| пришедшем с ответом от yandex_api api
//| возвращает true || false.
const route_test_pointPos = featureMember => {
    if (Boolean(featureMember) &&
        Boolean(featureMember.GeoObject) &&
        Boolean(featureMember.GeoObject.Point) &&
        Boolean(featureMember.GeoObject.Point.pos) &&
        Boolean(featureMember.GeoObject.Point.pos.split(" ").length > 1)) {
        return true;
    }
    return false;
};
//| запрос параметров адреса по адресу или координатам.
//| (геокод: адрес | координаты, параметры запроса) => Объект с параметрами адреса или параметрами координат.
const yan_api_req_by_params = async (api_token, geocode, kind = KIND.district) => {
    let location_data = init_address_params();
    //| запрос в yandex_api по адресу
    const request_response = await request_yandex(api_token, geocode, kind);
    //| проверяем наличие маршрута в объекте
    if (route_test_featureMember(request_response)) {
        let featureMember = request_response.response.GeoObjectCollection.featureMember[0];
        //| проверяем наличие маршрута в объекте
        if (route_test_AddressComponents(featureMember)) {
            //| заносим скорректированный адрес
            location_data.correct_address = featureMember.GeoObject.metaDataProperty.GeocoderMetaData.text;
            let data = featureMember.GeoObject.metaDataProperty.GeocoderMetaData.Address.Components;
            //| парсим данные с пришедшего объекта
            let parse = parse_params(data);
            //| заносим значения в наш объект
            location_data = concatenate_values(location_data, parse);
        }
        //| записываем координаты.....
        if (route_test_pointPos(featureMember)) {
            location_data.geo_lat = featureMember.GeoObject.Point.pos.split(" ")[1];
            location_data.geo_lon = featureMember.GeoObject.Point.pos.split(" ")[0];
        }
    }
    //| запрос в yandex_api по координатам с параметром "KIND.street"
    const request_response_2 = await request_yandex(api_token, location_data.geo_lat + "," + location_data.geo_lon, KIND.street);
    if (route_test_featureMember(request_response_2)) {
        let featureMember = request_response_2.response.GeoObjectCollection.featureMember[0];
        if (route_test_AddressComponents(featureMember)) {
            let data = featureMember.GeoObject.metaDataProperty.GeocoderMetaData.Address.Components;
            //| парсим данные с пришедшего объекта
            let parse = parse_params(data);
            //| добавляем значения в наш объект
            location_data = concatenate_values(location_data, parse);
        }
    }
    //| запрос в yandex_api по координатам с параметром "KIND.locality"
    const request_response_3 = await request_yandex(api_token, location_data.geo_lat + "," + location_data.geo_lon, KIND.district);
    if (route_test_featureMember(request_response_3)) {
        let featureMember = request_response_3.response.GeoObjectCollection.featureMember[0];
        if (route_test_AddressComponents(featureMember)) {
            let data = featureMember.GeoObject.metaDataProperty.GeocoderMetaData.Address.Components;
            //| парсим данные с пришедшего объекта
            let parse = parse_params(data);
            //| добавляем значения в наш объект
            location_data = concatenate_values(location_data, parse);
        }
    }
    return location_data;
};
const route_test_pointPos_2 = (obj, fields) => {
    if (fields.length > 0) {
        let a = Boolean(Object.keys(obj).filter(el => el === fields[0]).length > 0);
        let b = Boolean(route_test_pointPos_2(obj[fields[0]], fields.slice(1, fields.length)));
        return a && b;
    }
    else {
        return true;
    }
};
// (async function test.json() {
//
//     console.log("")
//     let input_address = "москва, мжд, ярославское, 4-й км, стр. 6";
//     let input_address_2 = "Россия, Куйбышевская железная дорога, станция Звезда";
//     let resp = await yan_api_req_by_params("apikey=bd9aa639-828c-4fd1-96ce-fc519d09f7d2", input_address);
//     let resp_2 = await yan_api_req_by_params("apikey=bd9aa639-828c-4fd1-96ce-fc519d09f7d2", input_address_2);
//     console.log("")
// })()
module.exports = {
    yan_api_req_by_params
};
//# sourceMappingURL=f_yandex_api.js.map