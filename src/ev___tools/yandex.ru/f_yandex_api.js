import _ from "lodash";
import fetch from "node-fetch";
import {arrIsNotEmpty} from "../../ev___tools/commonTools.js";


const BASE_URL = "https://geocode-maps.yandex.ru/1.x/?";     //| базовый адрес


const SCO = {
    long_lat: "longlat", //| — долгота, широта;
    lat_long: "latlong"  //| — широта, долгота.
}


const KIND = {
    district: "district", //| район города;
    metro: "metro",       //| станция метро;
    house: "house",       //| дом;
    street: "street",     //| улица;
    locality: "locality"  //| населенный пункт (город/поселок/деревня/село/...).
};


const FORMAT = {
    xml: "xml",
    json: "json"
}


//| функция получает основные данные по адресу или данные по координатам
const request_yandex = async (api_token, geocode, kind) => {

    let req = BASE_URL + api_token + "&geocode=" + geocode +
        "&format=" + FORMAT.json + "&sco=" + SCO.lat_long + "&kind=" + kind;

    let resp = await fetch(req);
    return await resp.json();
}


//| Поля определяемого объекта
const fields = {
    inputAddress: {value: null, description: "Входной адрес"},
    correctAddress: {value: null, description: "Полный скорректированный адрес"},
    country: {value: null, description: "Страна"},
    federalOkrug: {value: null, description: "Федеральный округ"},
    region: {value: null, description: "Регион"},
    isFederalCity: {value: null, description: "Является федеральным городом"},
    municipalOkrug: {value: null, description: "Муниципальный округ"},
    municipalRaion: {value: null, description: "Муниципальный район"},
    city: {value: null, description: "Город"},
    citySettlement: {value: null, description: "Городское поселение"},
    cityOkrug: {value: null, description: "Административный округ"},
    cityRaion: {value: null, description: "Административный район"},
    cityMikroraion: {value: null, description: "Микрорайон"},
    section: {value: null, description: "Квартал"},
    street: {value: null, description: "Улица"},
    house: {value: null, description: "Дом"},
    lat: {value: null, description: "Широта"},
    lon: {value: null, description: "Долгота"},
}


//| Разбирает массив географических элементов
const parseParams = (data_array = []) => {

    if (data_array.length <= 0) return [];

    let geo = _.cloneDeep(fields);

    //| снижаем регистр у всех значений ключей
    let b_data_array = data_array.map(el => {
        return {
            kind: el.kind.toLowerCase(),
            name: el.name.toLowerCase(),
        }
    });

    //| парсинг страны
    let country = b_data_array.filter(el => el.kind.match(/country/ig));
    if (country.length > 0) {
        geo.country.value = country[0].name;
    }

    //| парсинг федерального округа
    let federalOkrug = b_data_array.filter(el => {
        return (el.kind.match(/province/ig)) && (el.name.match(/федерал/ig)) && (el.name.match(/округ/ig))
    });
    if (arrIsNotEmpty(federalOkrug)) {
        geo.federalOkrug.value = federalOkrug[0].name;
    }

    //| Определяем: федеральный город (Приоритет 1)
    let federalCity = b_data_array.filter(el => {
        return el.kind.match(/province/ig) && !el.name.match(/федеральный|округ|область|край|республика/ig);
    });

    //| Определяем: автономные округа или автономные области (Приоритет 2)
    let regionAutonomic = b_data_array.filter(el => {
        return el.kind.match(/province/ig) && el.name.match(/(автономный|автономная)\s?(округ|область)/ig);
    });

    //| Определяем: республику, край, область (Приоритет 3)
    let regionOther = b_data_array.filter(el => {
        return el.kind.match(/province/ig) && el.name.match(/республика|край|область/ig);
    });


    if (arrIsNotEmpty(federalCity)) {

        //| Установим федеральный город как регион
        federalCity = federalCity[0].name;
        geo.region.value = federalCity;
        geo.city.value = federalCity;
        geo.isFederalCity.value = "да";

    } else if (arrIsNotEmpty(regionAutonomic)) {

        //| Установим автономные округа и области регионы
        regionAutonomic = regionAutonomic[0].name.replace(/\sавтономная|автономный|область|округ/ig, "").trim();
        geo.region.value = regionAutonomic

    } else if (arrIsNotEmpty(regionOther)) {

        //| И только потом идут республики, края, области и т.д.
        regionOther = regionOther[0].name;
        geo.region.value = regionOther;

    }

    //| Определяем: муниципальный округ
    let municipalOkrug = b_data_array.filter(el => {
        return el.kind.match(/area/ig) && el.name.match(/муниципальный/ig) && el.name.match(/округ/ig)
    });
    if (arrIsNotEmpty(municipalOkrug)) {
        geo.municipalOkrug.value = municipalOkrug[0].name.replace(/муниципальный|округ|муниципальный округ/ig, "").trim();
    }

    //| Определяем: муниципальный район
    let municipalRaion = b_data_array.filter(el => {
        return el.kind.match(/area/ig) && el.name.match(/муниципальный/ig) && el.name.match(/район/ig)
    });
    if (arrIsNotEmpty(municipalRaion)) {
        geo.municipalRaion.value = municipalRaion[0].name.replace(/муниципальный|округ|муниципальный округ/ig, "").trim();
    }

    //| Определяем: город, поселение внутри города (Москва/Питер), пгт, рп, село поселок,
    let city1 = b_data_array.filter(el => {
        return el.kind.match(/locality/ig);
    });
    if (arrIsNotEmpty(city1)) {
        if (geo.city.value) {
            geo.citySettlement.value = city1[0].name;
        } else {
            geo.city.value = city1[0].name;
        }
    }

    //| парсинг статуса федерального города
    if (geo.region.value && geo.city.value && geo.region.value === geo.city.value) {
        geo.isFederalCity.value = "да";
    }

    //| Определяем: административный округ, городской округ.
    let adminOkrug = b_data_array.filter(el => {
        return el.kind.match(/district|area/ig) && el.name.match(/административный|городской/ig) && el.name.match(/округ/ig)
    });
    if (arrIsNotEmpty(adminOkrug)) {
        geo.cityOkrug.value = adminOkrug[0].name.replace(/административный|округ|городской/ig, "").trim();
    }

    //| парсинг административного района
    let adminRaion = b_data_array.filter(el => {
        return el.kind.match(/district/ig) &&                       //| Дистрикт
            !el.name.match(/квартал|кв-л/ig) &&                     //| без ключевых слов квартала
            !el.name.match(/мкр-н|мкр\.|микрорайон/ig) &&           //| без ключевых слов микрорайона
            !el.name.match(/жилой|комплекс|жилой комплекс/ig) &&    //| без ключевых слов ЖК, Жилой
            !el.name.match(/административный|округ|административный округ/ig) &&    //| без ключевых админ. округа
            !el.name.match(/муниципальный|округ|муниципальный округ/ig)     //| без ключевых муницип. округа
    });
    if (arrIsNotEmpty(adminRaion)) {
        geo.cityRaion.value = adminRaion[0].name.replace(/р-н|рн\.|район|село|поселение|поселок/ig, "").trim();
    }

    if (geo.city.value === geo.cityRaion.value) {
        geo.city.value = geo.region.value;
    }

    //| парсинг микрорайона
    let cityMikroraion = b_data_array.filter(el => {
        return (el.kind.match(/district/ig)) && (el.name.match(/микрорайон/ig));
    });
    if (arrIsNotEmpty(cityMikroraion)) {
        geo.cityMikroraion.value = cityMikroraion[0].name.replace(/мкр-н|мкр\.|микрорайон/ig, "").trim();
    }

    //| парсинг квартал
    let section = b_data_array.filter(el => {
        return (el.kind.match(/district/ig)) && (el.name.match(/квартал/ig));
    });
    if (arrIsNotEmpty(section)) {
        geo.section.value = section[0].name;
    }

    //| парсинг улицы
    let street = b_data_array.filter(el => el.kind.match(/street/ig));
    if (arrIsNotEmpty(street)) {
        geo.street.value = street[0].name;
    }

    //| парсинг дом
    let house = b_data_array.filter(el => el.kind.match(/house/ig));
    if (arrIsNotEmpty(house)) {
        geo.house.value = house[0].name;
    }

    return geo;
}


//| объеденяет значения в двух объектах
//| если ключа нет => создает его. Исходные объекты не модифицируются.
//| возвращает новый объект с объедененными ключами и значениями
const concatObjectValues = (obj_1, obj_2) => {
    let result_object = _.cloneDeep(fields);
    for (let key in result_object) {
        if (key in obj_1 && obj_1[key].value) {
            result_object[key].value = obj_1[key].value;
        } else if (key in obj_2 && obj_2[key].value) {
            result_object[key].value = obj_2[key].value;
        }
    }
    return result_object;
};


//| проверяет маршрут к данными в объекте
//| пришедшем с ответом от yandex_api api
//| возвращает true || false.
const routeTestFeatureMember = yandex_response => {
    if (
        Boolean(yandex_response) &&
        Boolean(yandex_response.response) &&
        Boolean(yandex_response.response.GeoObjectCollection) &&
        Boolean(yandex_response.response.GeoObjectCollection.featureMember) &&
        Boolean(yandex_response.response.GeoObjectCollection.featureMember.length > 0)
    ) {
        return true;
    }
    return false;
};


//| проверяет маршрут к данными в объекте
//| пришедшем с ответом от yandex_api api
//| возвращает true || false.
const routeTestAddressComponents = featureMember => {
    if (
        Boolean(featureMember) &&
        Boolean(featureMember.GeoObject) &&
        Boolean(featureMember.GeoObject.metaDataProperty) &&
        Boolean(featureMember.GeoObject.metaDataProperty.GeocoderMetaData) &&
        Boolean(featureMember.GeoObject.metaDataProperty.GeocoderMetaData.Address) &&
        Boolean(featureMember.GeoObject.metaDataProperty.GeocoderMetaData.Address.Components) &&
        Boolean(featureMember.GeoObject.metaDataProperty.GeocoderMetaData.Address.Components.length > 0)
    ) {
        return true;
    }
    return false;
};


//| проверяет маршрут к данными в объекте
//| пришедшем с ответом от yandex_api api
//| возвращает true || false.
const routeTestPointPos = featureMember => {
    if (
        Boolean(featureMember) &&
        Boolean(featureMember.GeoObject) &&
        Boolean(featureMember.GeoObject.Point) &&
        Boolean(featureMember.GeoObject.Point.pos) &&
        Boolean(featureMember.GeoObject.Point.pos.split(" ").length > 1)
    ) {
        return true;
    }
    return false;
}


//| запрос параметров адреса по адресу или координатам.
//| (геокод: адрес | координаты, параметры запроса) => Объект с параметрами адреса или параметрами координат.
export const yan_api_req_by_params = async (
    api_token,
    geocode,
    kind = KIND.district,
) => {

    let geo = _.cloneDeep(fields);
    geo.inputAddress.value = geocode;
    //| запрос в yandex_api по адресу
    const yandexResponse = await request_yandex(api_token, geocode, kind);

    //| проверяем наличие маршрута в объекте
    if (routeTestFeatureMember(yandexResponse)) {

        let featureMember = yandexResponse.response.GeoObjectCollection.featureMember[0];

        //| проверяем наличие маршрута в объекте
        if (routeTestAddressComponents(featureMember)) {

            //| заносим скорректированный адрес
            geo.correctAddress = {
                value: featureMember.GeoObject.metaDataProperty.GeocoderMetaData.text,
                description: "Корректный адрес",
            }
            let data = featureMember.GeoObject.metaDataProperty.GeocoderMetaData.Address.Components;
            //| парсим данные с пришедшего объекта
            //| заносим значения в наш объект
            geo = concatObjectValues(geo, parseParams(data));
        }

        //| записываем координаты.....
        if (routeTestPointPos(featureMember)) {
            geo.lat.value = featureMember.GeoObject.Point.pos.split(" ")[1];
            geo.lon.value = featureMember.GeoObject.Point.pos.split(" ")[0];
        }

    }


    //| запрос в yandex_api по координатам с параметром "KIND.street"
    const yandexResponse2 = await request_yandex(
        api_token,
        geo.lat.value + "," + geo.lon.value,
        KIND.district
    );

    if (routeTestFeatureMember(yandexResponse2)) {

        let featureMember = yandexResponse2.response.GeoObjectCollection.featureMember[0];

        if (routeTestAddressComponents(featureMember)) {
            let data = featureMember.GeoObject.metaDataProperty.GeocoderMetaData.Address.Components;
            //| парсим данные с пришедшего объекта
            let parse = parseParams(data);
            //| добавляем значения в наш объект
            geo = concatObjectValues(geo, parse);
        }
    }

    //| запрос в yandex_api по координатам с параметром "KIND.locality"
    const yandexResponse3 = await request_yandex(
        api_token,
        geo.lat.value + "," + geo.lon.value,
        KIND.district
    );

    if (routeTestFeatureMember(yandexResponse3)) {

        let featureMember = yandexResponse3.response.GeoObjectCollection.featureMember[0];

        if (routeTestAddressComponents(featureMember)) {
            let data = featureMember.GeoObject.metaDataProperty.GeocoderMetaData.Address.Components;
            //| парсим данные с пришедшего объекта
            let parse = parseParams(data);
            //| добавляем значения в наш объект
            geo = concatObjectValues(geo, parse);
        }
    }

    return geo;
}


// const routeTestPointPos2 = (obj, fields) => {
//     if (fields.length > 0) {
//         let a = Boolean(Object.keys(obj).filter(el => el === fields[0]).length > 0);
//         let b = Boolean(routeTestPointPos2(obj[fields[0]], fields.slice(1, fields.length)));
//         return a && b;
//     } else {
//         return true;
//     }
// };


// (async function qualityTest() {
//     console.log("")
//     let testAddress1 = "Москва, Московский, улица Бианки, 8к2";
//     let testAddress2 = "Москва, улица Малое Понизовье, 6"; // +
//     let testAddress3 = "Кемеровская область, Гурьевск, Есенина 10";
//     let testAddress4 = "Московская область, село Ям, Пахринский квартал, 12А";
//     let testAddress5 = "Чеченская Республика, село Гехи, улица имени Тулты Танкаева, 7"; //| под вопросом определения админ. округа
//     let testAddress6 = "посёлок Зима Южная, Центральная улица, 8";
//     let testAddress7 = "г. Рязань, район советский";
//     let testAddress8 = "г. Сургут";
//     let testAddress9 = "Кемеровская область, Гурьевск";
//     let resp = await yan_api_req_by_params("apikey=bd9aa639-828c-4fd1-96ce-fc519d09f7d2", testAddress8);
//     console.log("")
// })()
