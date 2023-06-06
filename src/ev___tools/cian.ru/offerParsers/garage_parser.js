import {garageDescriptionParse} from "../cian__descriptionParsers/garageDescriptionParser.js";
import {unboxStructure} from "./common_functions.js";
import {generalOfferParse} from "./general_parser.js";

//
//| каркас полей для гаража (старый для земли с лишними полями)
//
const fields = {
    id: "Уникальный id аналога",
    cianId: "ID предложения",               //| general field
    phoneNumber: "Номер телефона",          //| general field
    cadastralNumber: "Кадастровый номер",   //| general field
    fullUrl: "Источник",                    //| general field
    publicationDate: "Дата публикации",     //| general field
    offerType: "Тип предложения",           //| general field
    coordinatesLat: "Широта",               //| general field
    coordinatesLng: "Долгота",              //| general field
    address: "Полный адрес",                //| general field
    subject: "Субъект Федерации",           //| general field
    subjectRaion: "Район в регионе",        //| general field
    city: "Город",              //| general field
    okrug: "Округ",             //| general field
    raion: "Район в городе",    //| general field
    mikroraion: "Микрорайон",   //| general field
    section: "Квартал",         //| general field
    metroWalkDistance: "Расстояние до метро, пешком, мин.",         //| general field
    metroTransportDistance: "Расстояние до метро, авто., мин.",     //| general field
    description: "Описание",                //| general field
    totalArea: "Площадь помещения, м²",
    buildingParkingType: "Тип парковки",
    dealType: "Тип сделки",                 //| general field
    dealComments: "Комментарии к сделке",   //| general field
    priceWithVat: "цена",                   //| general field
    isGarageBox: "гаражный бокс",
    garageLevel: "уровень гаража",
    garageType: "тип гаража - материал стен",
    gateHeight: "Высота ворот, м",
    garageHeight: "Высота гаража, м.",
    availabilityOfElectricity: "наличие электричества",
    centralHeating: "наличие центрального отопления",
    viewingHole: "наличие смотровой ямой",
    twoParkingLots: "наличие двух парковочных мест",
    basement: "Наличие подвала",
    presenceOfSecurity: "наличие охраны",
    availabilityOfWaterSupplySewerage: "наличие водоснабжения",
    presenceOfVideoSurveillance: "наличие видеонаблюдения"
}


//
//| парсер общий (старый для земли с лишними полями)
//
export const offerGarageParse = offer => {

    let structure = unboxStructure(fields);
    let generalFields = generalOfferParse(offer);
    structure.cianId.value = generalFields.cianId.value;
    structure.phoneNumber.value = generalFields.phoneNumber.value;
    structure.cadastralNumber.value = generalFields.cadastralNumber.value;
    structure.fullUrl.value = generalFields.fullUrl.value;
    structure.publicationDate.value = generalFields.publicationDate.value;
    structure.offerType.value = generalFields.offerType.value;
    structure.coordinatesLat.value = generalFields.coordinatesLat.value;
    structure.coordinatesLng.value = generalFields.coordinatesLng.value;
    structure.address.value = generalFields.address.value;
    structure.subject.value = generalFields.subject.value;
    structure.subjectRaion.value = generalFields.subjectRaion.value;
    structure.city.value = generalFields.city.value;
    structure.okrug.value = generalFields.okrug.value;
    structure.raion.value = generalFields.raion.value;
    structure.mikroraion.value = generalFields.mikroraion.value;
    structure.section.value = generalFields.section.value;
    structure.metroWalkDistance.value = generalFields.metroWalkDistance.value;
    structure.metroTransportDistance.value = generalFields.metroTransportDistance.value;
    structure.description.value = generalFields.description.value;
    structure.dealType.value = generalFields.dealType.value;
    structure.dealComments.value = generalFields.dealComments.value;
    structure.priceWithVat.value = generalFields.priceWithVat.value;


    if (!offer) return structure;

    let descParse = null;

    //| парсинг описания
    if (typeof offer.description === "string" && offer.description.length > 9) {
        descParse = garageDescriptionParse(offer.description);
        structure.isGarageBox.value = descParse._isGarageBox.value;
        structure.garageLevel.value = descParse._garageLevel.value;
        structure.garageType.value = descParse._garageType.value;
        structure.presenceOfSecurity.value = descParse._presenceOfSecurity.value;
        structure.availabilityOfElectricity.value = descParse._availabilityOfElectricity.value;
        structure.availabilityOfWaterSupplySewerage.value = descParse._availabilityOfWaterSupplySewerage.value;
        structure.presenceOfVideoSurveillance.value = descParse._presenceOfVideoSurveillance.value;
        structure.basement.value = descParse._basement.value;
        structure.centralHeating.value = descParse._centralHeating.value;
        structure.viewingHole.value = descParse._viewingHole.value;
        structure.gateHeight.value = descParse._gateHeight.value;
        structure.garageHeight.value = descParse._garageHeight.value;
        structure.twoParkingLots.value = descParse._twoParkingLots.value;
    }

    //| получаем общую площадь помещения
    if (typeof offer.totalArea === "string") {
        structure.totalArea.value = offer.totalArea.replace(/\./, ',');
    }

    //| Тип парковки
    if (offer.building && offer.building.parking && offer.building.parking.type) {
        structure.buildingParkingType.value = offer.building.parking.type;
    }

    return structure;
};