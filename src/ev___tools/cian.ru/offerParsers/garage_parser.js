import {generalOfferParse} from "./general_parser.js";
import _ from "lodash";

//| каркас полей для гаража (старый для земли с лишними полями)
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
        description: "Округ",
        set(offer) {
            this.value = generalOfferParse(offer).okrug;
        }
    },
    raion: {
        value: null,
        description: "Район в городе",
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
    isGarageBox: {
        value: null,
        description: "Гаражный бокс",
        set(offer) {
            if (typeof offer.description === "string" && offer.description.length > 9) {
                this.value = offer.description.match(/гаражный бокс/ig) ? "да" : null;
            }
        }
    },
    garageLevel: {
        value: null,
        description: "Уровень гаража",
        set(offer) {
            if (typeof offer.description === "string" && offer.description.length > 9) {
                if (offer.description.match(/(\d+)[а-яА-Я,.:=\s]{1,10} уровневый/ig)) {
                    this.value = parseInt(offer.description.match(/(\d+)/ig).toString());
                }
            }
        }
    },
    garageType: {
        value: null,
        description: "Тип гаража",
        set(offer) {
            if (
                offer.description.match(/[гГ]араж.{1,60}металлический|[мМ]еталлический.{1,30}гараж/ig) &&
                !offer.description.match(/[гГ]араж.{1,60}кирпичный|[кК]ирпичный.{1,30}гараж|гараж.{1,20}из.{1,20}кирпича/ig)
            ) {
                this.value = "металлический"
            } else if (
                !offer.description.match(/[гГ]араж.{1,60}металлический|[мМ]еталлический.{1,30}гараж/ig) &&
                offer.description.match(/[гГ]араж.{1,60}кирпичный|[кК]ирпичный.{1,30}гараж|гараж.{1,20}из.{1,20}кирпича/ig)
            ) {
                this.value = "кирпичный"
            } else if (
                !offer.description.match(/[гГ]араж.{1,60}металлический|[мМ]еталлический.{1,30}гараж/ig) &&
                !offer.description.match(/[гГ]араж.{1,60}кирпичный|[кК]ирпичный.{1,30}гараж|гараж.{1,20}из.{1,20}кирпича/ig) &&
                offer.description.match(/железобетонный|в железобетонном исполнении|из железобетона/ig)
            ) {
                this.value = "железобетонный"
            } else if (offer.garage && offer.garage.type) {
                this.value = offer.garage.type;
            }
        }
    },
    garageMaterial: {
        value: null,
        description: "Материал гаража",
        set(offer) {
            if (offer.garage && offer.garage.material) {
                this.value = offer.garage.material;
            }
        }
    },
    garageStatus: {
        value: null,
        description: "Статус гаража",
        set(offer) {
            if (offer.garage) {
                this.value = offer.garage.status;
            }
        }
    },
    gateHeight: {
        value: null,
        description: "Высота ворот, м.",
        set(offer) {
            if (typeof offer.description === "string" && offer.description.length > 9) {
                if (offer.description.match(/ворота.{1,40}(высота.{1,40}\d+(\s?\d*)*([.,]\d+)?м)/ig)) {
                    let buff = offer.description.match(/ворота.{1,40}(высота.{1,40}\d+(\s?\d*)*([.,]\d+)?м)/ig).toString();
                    this.value = buff.match(/\d+(\s?\d*)*([.,]\d+)?/ig).toString();
                }
            }
        }
    },
    garageHeight: {
        value: null,
        description: "Высота гаража, м.",
        set(offer) {

        }
    },
    availabilityOfElectricity: {
        value: null,
        description: "наличие электричества",
        set(offer) {
            if (typeof offer.description === "string" && offer.description.length > 9) {
                if (offer.description.match(/электричество|электроснабжение|электропроводка|электросчетчик/ig)) {
                    this.value = "да";
                }
            }
        }
    },
    centralHeating: {
        value: null,
        description: "наличие центрального отопления",
        set(offer) {
            if (offer.building && offer.building.heatingType) {
                this.value = offer.building.heatingType;
            }
        }
    },
    viewingHole: {
        value: null,
        description: "наличие смотровой ямой",
        set(offer) {
            if (typeof offer.description === "string" && offer.description.length > 9) {
                if (offer.description.match(/Смотровой ямы нет|Ямы нет/ig)) {
                    this.value = "нет";
                } else if (offer.description.match(/\s[яЯ]м[ыа]/ig)) {
                    this.value = "да";
                }
            }
        }
    },
    twoParkingLots: {
        value: null,
        description: "наличие двух парковочных мест",
        set(offer) {
            if (
                offer.building &&
                offer.building.parking &&
                offer.building.parking.placesCount &&
                offer.building.parking.placesCount > 2
            ) {
                this.value = "Да";
            }
        }
    },
    basement: {
        value: null,
        description: "Наличие подвала",
        set(offer) {
            if (typeof offer.description === "string" && offer.description.length > 9) {
                if (offer.description.match(/без подвала/ig)) {
                    this.value = "нет";
                } else if (
                    offer.description.match(/[сС] подвалом|,.{1,15}подвал.{1,15},|[еЕ]?сть подвал/ig) ||
                    offer.description.match(/и подвал|[сС]ухой подвал|иИмеется подвал/ig) ||
                    offer.description.match(/,.{1,10}подвал.{1,10}\.|подвальное помещение/ig) ||
                    offer.description.match(/(.{1,15}[пП]одвал.{1,15})|[иИ]меется.{1,30}подвал/ig) ||
                    offer.description.match(/подвал.{1,10}\d.{1,6}кв|\+подвал|[пП]одвал в.{1,10}\d.{1,6}этажа/ig) ||
                    offer.description.match(/[пП]одвал в.{1,10}\d.{1,6}метров|[пП]одвал в.{1,10}\d.{1,6}кв\.м|[пП]одвал[.,+]/ig)
                ) {
                    this.value = "да";
                }
            }
        }
    },
    presenceOfSecurity: {
        value: null,
        description: "Наличие охраны",
        set(offer) {
            if (typeof offer.description === "string" && offer.description.length > 9) {
                if (offer.description.match(/охрана/ig) || offer.description.match(/круглосуточная охрана/ig)) {
                    this.value = "да";
                }
            }
        }
    },
    availabilityOfWaterSupplySewerage: {
        value: null,
        description: "Наличие водоснабжения",
        set(offer) {
            if (typeof offer.description === "string" && offer.description.length > 9) {
                if (offer.description.match(/([вВ] гараже есть|[еЕ]сть все коммуникации|[цЦ]ентральное отопление|[пП]роведено).{1,30}вода/ig)) {
                    this.value = "да";
                }
            }
        }
    },
    presenceOfVideoSurveillance: {
        value: null,
        description: "Наличие видеонаблюдения",
        set(offer) {
            if (typeof offer.description === "string" && offer.description.length > 9) {
                if (offer.description.match(/видеонаблюдение/ig)) {
                    this.value = "да";
                }
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


//
//| парсер общий (старый для земли с лишними полями)
//
export const offerGarageParse = offer => {

    let bufferFields = _.cloneDeep(fields);

    Object.keys(bufferFields).forEach(key => {
        bufferFields[key].set(offer);
        delete bufferFields[key].set;
    });

    return bufferFields;
};