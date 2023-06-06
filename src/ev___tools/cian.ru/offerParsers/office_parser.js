import {unboxStructure} from "./common_functions.js";
import {generalOfferParse} from "./general_parser.js";
import _ from "lodash";
import {arrIsNotEmpty} from "ev___tools/commonTools.js";


//| каркас аналога: "Оффис" (продажа, аренда)
//
const fields = {
    id: {
        value: null,
        description: "Уникальный id аналога",
        set(offer) {
            this.value = "";
        }
    },
    cianId: {
        value: null,
        description: "ID предложения",
        set(offer) {
            this.value = generalOfferParse(offer).cianId;
        }
    },
    phoneNumber: {
        value: null,
        description: "Номер телефона",
        set(offer) {
            this.value = generalOfferParse(offer).phoneNumber;
        }
    },
    cadastralNumber: {
        value: null,
        description: "Кадастровый номер",
        set(offer) {
            this.value = generalOfferParse(offer).cadastralNumber;
        }
    },
    fullUrl: {
        value: null,
        description: "Источник",
        set(offer) {
            this.value = generalOfferParse(offer).fullUrl;
        }
    },
    publicationDate: {
        value: null,
        description: "Дата публикации",
        set(offer) {
            this.value = generalOfferParse(offer).publicationDate;
        }
    },
    address: {
        value: null,
        description: "Полный адрес",
        set(offer) {
            this.value = generalOfferParse(offer).address;
        }
    },
    subject: {
        value: null,
        description: "Субъект Федерации",
        set(offer) {
            this.value = generalOfferParse(offer).subject;
        }
    },
    subjectRaion: {
        value: null,
        description: "Район в регионе",
        set(offer) {
            this.value = generalOfferParse(offer).subjectRaion;
        }
    },
    cityType: {
        value: null,
        description: "Тип населенного пункта",
        set(offer) {
            this.value = generalOfferParse(offer).cityType;
        }
    },
    city: {
        value: null,
        description: "Населенный пункт",
        set(offer) {
            this.value = generalOfferParse(offer).city;
        }
    },
    okrug: {
        value: null,
        description: "Административный округ",
        set(offer) {
            this.value = generalOfferParse(offer).okrug;
        }
    },
    raion: {
        value: null,
        description: "Административный район",
        set(offer) {
            this.value = generalOfferParse(offer).raion;
        }
    },
    mikroraion: {
        value: null,
        description: "Микрорайон",
        set(offer) {
            this.value = generalOfferParse(offer).mikroraion;
        }
    },
    section: {
        value: null,
        description: "Квартал",
        set(offer) {
            this.value = generalOfferParse(offer).section;
        }
    },
    coordinatesLat: {
        value: null,
        description: "Координаты - Широта",
        set(offer) {
            this.value = generalOfferParse(offer).coordinatesLat;
        }
    },
    coordinatesLng: {
        value: null,
        description: "Координаты - Долгота",
        set(offer) {
            this.value = generalOfferParse(offer).coordinatesLng;
        }
    },
    functionalPurpose: {
        value: null,
        description: "Функциональное назначение",
        set(offer) {
            this.value = generalOfferParse(offer).functionalPurpose;
        }
    },
    metroNameWalk: {
        value: null,
        description: "Ближайшая станция метро (пешком)",
        set(offer) {
            this.value = generalOfferParse(offer).metroNameWalk;
        }
    },
    metroWalkDistance: {
        value: null,
        description: "Удаленность от метро (мин. пешком)",
        set(offer) {
            this.value = generalOfferParse(offer).metroWalkDistance;
        }
    },
    metroNameTransport: {
        value: null,
        description: "Ближайшая станция метро (транспорт)",
        set(offer) {
            this.value = generalOfferParse(offer).metroNameTransport;
        }
    },
    metroTransportDistance: {
        value: null,
        description: "Удаленность от метро (мин. авто)",
        set(offer) {
            this.value = generalOfferParse(offer).metroTransportDistance;
        }
    },
    specialty: {
        value: null,
        description: "Варианты использования",
        set(offer) {
            this.value = generalOfferParse(offer).specialty;
        }
    },
    description: {
        value: null,
        description: "Описание",
        set(offer) {
            this.value = generalOfferParse(offer).description;
        }
    },
    totalArea: {
        value: null,
        description: "Площадь помещения, кв. м",
        set(offer) {
            if (typeof offer.totalArea === "string") {
                this.value = offer.totalArea.replace(/\./, ',');
            }
        }
    },
    dealType: {
        value: null,
        description: "Тип сделки",
        set(offer) {
            this.value = generalOfferParse(offer).dealType;
        }
    },
    dealComments: {
        value: null,
        description: "Коментарии к сделке",
        set(offer) {
            this.value = generalOfferParse(offer).dealComments;
        }
    },

    objectType: {
        value: null,
        description: "Тип объекта",
        set(offer) {
            if (offer.building) {
                if (offer.building.type) {
                    this.value = offer.building.type;
                }
            }
        }
    },
    theCompositionOfTheTransferredRights: {
        value: null,
        description: "Состав передаваемых прав",
        set(offer) {
            if (typeof offer.description === "string" && offer.description.length > 9) {
                let buff = offer.description.match(/(([вВ]ид|[тТ]ип)[а-яА-Я:\s=-]*([пП]рав[оа])[а-яА-Я:\s=-]*собственность)|(([вВ]ид|[тТ]ип)[а-яА-Я:\s=-]*([пП]рав[оа])[а-яА-Я:\s=-]*аренда)/ig);
                if (buff) {
                    if (buff.toString().toLowerCase().indexOf("собственность")) {
                        this.value = "Собственность";
                    } else if (buff.toString().toLowerCase().indexOf("аренда")) {
                        this.value = "Аренда";
                    }
                }
            }
        }
    },
    floorsCount: {
        value: null,
        description: "Этаж / общая этажность",
        set(offer) {
            if (offer.building) {
                this.value = offer.floorNumber + "/" + offer.building.floorsCount || null;
            }
        }
    },
    basementArea: {
        value: null,
        description: "Площадь подвала, кв. м",
        set(offer) {

        }
    },
    areaGroundFloor: {
        value: null,
        description: "Площадь цоколя, кв. м",
        set(offer) {

        }
    },
    areaPremisesHigherFirstFloor: {
        value: null,
        description: "Площадь помещений выше первого этажа, кв. м",
        set(offer) {

        }
    },
    areaFirstFloor: {
        value: null,
        description: "Площадь первого этажа, кв. м",
        set(offer) {

        }
    },
    parkingType: {
        value: null,
        description: "Тип парковки",
        set(offer) {
            if (offer.building && offer.building.parking && offer.building.parking.type) {
                this.value = offer.building.parking.type;
            }
        }
    },
    vatType: {
        value: null,
        description: "НДС",
        set(offer) {
            this.value = generalOfferParse(offer).vatType;
        }
    },
    price: {
        value: null,
        description: "Цена",
        set(offer) {
            this.value = generalOfferParse(offer).price;
        }
    },

    communalPayments: {
        value: null,
        description: "Коммунальные платежи включены",
        set(offer) {
            if (typeof offer.description === "string" && offer.description.length > 9) {
                if (offer.description.match(/коммунальные.{1,20}включены/ig)) {
                    this.value = "Да";
                } else if (offer.description.match(/коммунальные.{1,20}платежи/ig)) {
                    this.value = "Нет";
                }
            }
        }
    },
    landArea: {
        value: null,
        description: "Площадь земли, кв. м",
        set(offer) {
            if (offer.land && offer.land.areaUnitType && offer.land.area) {
                let buff_area_value = parseFloat(offer.land.area.replace(/,/, "."));
                if (offer.land.areaUnitType.toLowerCase() === "hectare") {
                    this.value = buff_area_value * 10000;
                } else if (offer.land.areaUnitType.toLowerCase() === "sotka") {
                    this.value = buff_area_value * 100;
                }
            }
        }
    },
    prkingArea: {
        value: null,
        description: "Площадь паркинга, кв. м",
        set(offer) {

        }
    },
    parkingElementArea: {
        value: null,
        description: "Площадь машиноместа, кв.м",
        set(offer) {

        }
    },
    havingSeparateEntranceType: {
        value: null,
        description: "Тип входа",
        set(offer) {

        }
    },
    havingSeparateEntrance: {
        value: null,
        description: "Наличие отдельного входа",
        set(offer) {
            if (typeof offer.description === "string" && offer.description.length > 9) {
                if (offer.description.match(/без отдельного входа/ig)) {
                    this.value = "Нет";
                } else if (offer.description.match(/независимых входа|вход.{1,10}отдельных|отдельный вход|отдельных входа|Собственный вход/ig)) {
                    this.value = "Да";
                }
            }
        }
    },
    ObjectLocationLine: {
        value: null,
        description: "Линия расположения объекта",
        set(offer) {

        }
    },
    buildingClassType: {
        value: null,
        description: "Класс здания",
        set(offer) {
            if (offer.building && offer.building.classType) {
                this.value = offer.building.classType;
            }
        }
    },
    buildType: {
        value: null,
        description: "Тип здания",
        set(offer) {
            if (typeof offer.description === "string" && offer.description.length > 9) {
                let testVP = /([пП]рода([её]тся|м|ю|[её]м|дим)|предлагается на продажу).{1,50}(встроенное помещение|в отдельно|весь этаж|в подвале|на цокольном этаже|на (первом|\d{1,2})(-ом|-м)? этаже|в бизнес[-\s]?центре|в бц|в тц|в торговом центре|в жилом доме|квартира|нежилое помещение|офисное помещение|торговое помещение|нежилые помещения|в деловом центре|част[ьи] здания|в многоквартирном доме)/ig;
                let testOSZ = /([пП]рода([её]тся|м|ю|[её]м|дим)|предлагается на продажу).{1,50}(отдельно[-\s]?стоящ(ее|ий)|площадь зу|офисный блок|здание торгового центра|торговый центр|(ми|но|ух|[её]х|ти|\dх|\d-х)этажное здание|земельный участок|соток)/ig;
                let testVPFound = offer.description.match(testVP);
                let testOSZFound2 = offer.description.match(testOSZ);

                if (arrIsNotEmpty(testOSZFound2)) {
                    this.value = "ОСЗ";
                } else if (arrIsNotEmpty(testVPFound)) {
                    this.value = "ВП";
                }
            }
        }
    },
    ceilingHeight: {
        value: null,
        description: "Высота потолков, м",
        set(offer) {

        }
    },
    StateOfRepair: {
        value: null,
        description: "Состояние помещения",
        set(offer) {

        }
    },
    layout: {
        value: null,
        description: "Планировка",
        set(offer) {

        }
    },
    stateBuild: {
        value: null,
        description: "Состояние здания",
        set(offer) {

        }
    },
    finishLevel: {
        value: null,
        description: "Уровень отделки",
        set(offer) {

        }
    },
    entranceFromTheYard: {
        value: null,
        description: "Вход со двора",
        set(offer) {
            if (typeof offer.description === "string" && offer.description.length > 9) {
                if (offer.description.match(/вход.{1,10}со.{1,10}двора/ig)) {
                    this.value = "Да";
                }
            }
        }
    },
    entranceFromTheStreet: {
        value: null,
        description: "Вход с улицы",
        set(offer) {
            if (typeof offer.description === "string" && offer.description.length > 9) {
                if (offer.description.match(/вход.{1,10}с.{1,10}улицы/ig)) {
                    this.value = "Да";
                }
            }
        }
    },
    buildYearsOld: {
        value: null,
        description: "Дата постройки",
        set(offer) {
            if (offer.building && offer.building.buildYear) {
                this.value = offer.building.buildYear;
            }
        }
    },
    numberOfParkingSpaces: {
        value: null,
        description: "Количество парковочных мест, шт.",
        set(offer) {
            if (offer.building && offer.building.parking && offer.building.parking.placesCount) {
                this.value = offer.building.parking.placesCount;
            }
        }
    },

    parseDate: {
        value: null,
        description: "Дата парсинга",
        set(offer) {
            this.value = generalOfferParse(offer).parseDate;
        }
    },
}


//| Парсер для аналога: "Офис"
export const offerOfficeParse = offer => {

    let bufferFields = _.cloneDeep(fields);

    Object.keys(bufferFields).forEach(key => {
        bufferFields[key].set(offer);
        delete bufferFields[key].set;
    });

    return bufferFields;
};