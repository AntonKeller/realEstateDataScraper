import {unboxStructure} from "./common_functions.js";
import {generalOfferParse} from "./general_parser.js";
import _ from "lodash";


//| каркас аналога: "Оффис" (продажа, аренда)
//
const fields = {
    id: "ID позиции",
    cianId: "Уникальный идентификатор",     //| general field
    phoneNumber: "Номер телефона",          //| general field
    cadastralNumber: "Кадастровый номер",   //| general field
    fullUrl: "Источник информации",         //| general field
    publicationDate: "Дата публикации",     //| general field
    address: "Адрес",                       //| general field
    coordinatesLat: "Координаты - Широта",  //| general field
    coordinatesLng: "Координаты - Долгота", //| general field
    subject: "Субъект Федерации",           //| general field
    subjectRaion: "Район в регионе",        //| general field
    city: "Город",                    //| general field
    okrug: "Административный округ",  //| general field
    raion: "Административный район",  //| general field
    mikroraion: "Микрорайон",   //| general field
    section: "Квартал",         //| general field
    metroName: "Ближайшая станция метро",
    metroNameWalk: "Ближайшая станция метро (пешком)",           //| general field
    metroWalkDistance: "Удаленность от метро (мин. пешком)",     //| general field
    metroNameTransport: "Ближайшая станция метро (транспорт)",   //| general field
    metroTransportDistance: "Удаленность от метро (мин. авто)",  //| general field
    description: "Описание",   //| general field
    dealType: "Тип сделки",    //| general field
    dealComments: "Коментарии к сделке",    //| general field
    functionalPurpose: "Функциональное назначение", //| general field
    specialty: "Варианты использования",    //| general field
    vatType: "НДС",                         //| general field
    price: "Цена",                          //| general field
    communalPayments: "Коммунальные платежи включены",
    theCompositionOfTheTransferredRights: "Состав передаваемых прав",
    landArea: "Площадь земли, кв. м",
    totalArea: "Общая площадь, кв. м",
    floorsCount: "Этаж / общая этажность",
    prkingArea: "Площадь паркинга, кв. м",
    parkingElementArea: "Площадь машиноместа, кв.м",
    havingSeparateEntranceType: "Тип входа",
    ObjectLocationLine: "Линия расположения объекта",
    buildingClassType: "Класс здания",
    objectType: "Тип объекта",
    buildType: "Тип здания", //| ОСЗ, ВП ...
    ceilingHeight: "Высота потолков, м",
    StateOfRepair: "Состояние помещения",
    layout: "Планировка",
    stateBuild: "Состояние здания",
    finishLevel: "Уровень отделки",
    havingSeparateEntrance: "Наличие отдельного входа",
    entranceFromTheYard: "Вход со двора",
    entranceFromTheStreet: "Вход с улицы",
    buildYearsOld: "Дата постройки",
    buildingParkingType: "Тип парковки",
    numberOfParkingSpaces: "Количество парковочных мест, шт.",
    parseDate: "Дата парсинга",
}


//| Парсер для аналога: "Офис"
//
export const offerOfficeParse = offer => {

    let objectBox = unboxStructure(fields);
    let generalFields = generalOfferParse(offer);
    Object.keys(objectBox).forEach(key => {
        if (key in generalFields) {
            objectBox[key] = _.cloneDeep(generalFields[key]);
        }
    });

    if (offer) {

        let currDesc = offer.description;

        //| парсинг описания
        if (typeof offer.description === "string" && offer.description.length > 9) {

            //| Тип здания: ОСЗ, ВП ...
            let testVP = /([пП]рода([её]тся|м|ю|[её]м|дим)|предлагается на продажу).{1,50}(встроенное помещение|в отдельно|весь этаж|в подвале|на цокольном этаже|на (первом|\d{1,2})(-ом|-м)? этаже|в бизнес[-\s]?центре|в бц|в тц|в торговом центре|в жилом доме|квартира|нежилое помещение|офисное помещение|торговое помещение|нежилые помещения|в деловом центре|част[ьи] здания|в многоквартирном доме)/ig;
            let testOSZ = /([пП]рода([её]тся|м|ю|[её]м|дим)|предлагается на продажу).{1,50}(отдельно[-\s]?стоящ(ее|ий)|площадь зу|офисный блок|здание торгового центра|торговый центр|(ми|но|ух|[её]х|ти|\dх|\d-х)этажное здание|земельный участок|соток)/ig;

            let testVPFound = offer.description.match(testVP);
            let testOSZFound2 = offer.description.match(testOSZ);

            if (Array.isArray(testOSZFound2) && testOSZFound2.length > 0) {
                objectBox.buildType.value = "ОСЗ";
            } else if (Array.isArray(testVPFound) && testVPFound.length > 0) {
                objectBox.buildType.value = "ВП";
            }

            //| коммунальные платежи включены
            let communalPaymentsIncludeTest = /коммунальные.{1,20}включены/ig;
            let communalPaymentsNotIncludeTest = /коммунальные.{1,20}платежи/ig;
            let communalPaymentsIncludeTestFound = offer.description.match(communalPaymentsIncludeTest);
            let communalPaymentsNotIncludeTestFound = offer.description.match(communalPaymentsNotIncludeTest);
            if (
                Array.isArray(communalPaymentsIncludeTestFound) && communalPaymentsIncludeTestFound.length > 0
            ) {
                objectBox.communalPayments.value = "Да";
            } else if (
                Array.isArray(communalPaymentsNotIncludeTestFound) && communalPaymentsNotIncludeTestFound.length > 0
            ) {
                objectBox.communalPayments.value = "Нет";
            }


            //| наличие входа со двора
            let testEntranceFromTheYard = /вход.{1,10}со.{1,10}двора/ig;
            let testEntranceFromTheYardFound = offer.description.match(testEntranceFromTheYard);
            if (Array.isArray(testEntranceFromTheYardFound) && testEntranceFromTheYardFound.length > 0) {
                objectBox.entranceFromTheYard.value = "Да";
            }

            //| наличие входа с улицы
            let testEntranceFromTheStreet = /вход.{1,10}с.{1,10}улицы/ig;
            let testEntranceFromTheStreetFound = offer.description.match(testEntranceFromTheStreet);
            if (Array.isArray(testEntranceFromTheStreetFound) && testEntranceFromTheStreetFound.length > 0) {
                objectBox.entranceFromTheStreet.value = "Да";
            }

            //| Наличие отдельного входа
            let foundEntry = currDesc.match(/независимых входа|вход.{1,10}отдельных|отдельный вход|отдельных входа|Собственный вход/ig);
            let foundWithoutEntry = currDesc.match(/без отдельного входа/ig);
            if (foundWithoutEntry) {
                objectBox.havingSeparateEntrance.value = "Нет";
            } else if (foundEntry) {
                objectBox.havingSeparateEntrance.value = "Да";
            }

            //| Тип входа
            objectBox.havingSeparateEntranceType.value = "";

            //| Линия расположения объекта
            objectBox.ObjectLocationLine.value = "";

            //| Состав передаваемых прав
            let buff = currDesc.match(/(([вВ]ид|[тТ]ип)[а-яА-Я:\s=-]*([пП]рав[оа])[а-яА-Я:\s=-]*собственность)|(([вВ]ид|[тТ]ип)[а-яА-Я:\s=-]*([пП]рав[оа])[а-яА-Я:\s=-]*аренда)/ig);

            if (buff) {
                if (buff.toString().toLowerCase().indexOf("собственность")) {
                    objectBox.theCompositionOfTheTransferredRights.value = "Собственность";
                } else if (buff.toString().toLowerCase().indexOf("аренда")) {
                    objectBox.theCompositionOfTheTransferredRights.value = "Аренда";
                }
            }
        }

        //| получаем площадь земли
        if (offer.land && offer.land.areaUnitType && offer.land.area) {
            let buff_area_value = parseFloat(offer.land.area.replace(/,/, "."));
            //| Ед. изм. площади земли
            if (offer.land.areaUnitType.toLowerCase() === "hectare") {
                //| Переводим площадь земли из гектаров в м².
                objectBox.landArea.value = buff_area_value * 10000;
            } else if (offer.land.areaUnitType.toLowerCase() === "sotka") {
                //| Переводим площадь земли из соток в м².
                objectBox.landArea.value = buff_area_value * 100;
            }
        }

        // | получаем общую площадь помещения
        if (typeof offer.totalArea === "string") {
            objectBox.totalArea.value = parseFloat(offer.totalArea.replace(/,/, '.'));
        }

        if (offer.building && offer.building.parking && offer.building.parking.placesCount) {
            objectBox.numberOfParkingSpaces.value = offer.building.parking.placesCount;
        }

        if (offer.building && offer.building.parking && offer.building.parking.type) {

            objectBox.buildingParkingType.value = offer.building.parking.type;

            if (offer.building.classType) {
                objectBox.buildingClassType.value = offer.building.classType;
            }
        }

        //| параметры здания
        if (offer.building) {

            objectBox.floorsCount.value = offer.floorNumber + "/" + offer.building.floorsCount || null;

            //| Тип Объекта (строения)
            if (offer.building.type) {
                objectBox.objectType.value = offer.building.type;
            }

            //| возраст здания
            if (offer.building.buildYear) {
                objectBox.buildYearsOld.value = offer.building.buildYear;
            }
        }
    }

    return objectBox;
};