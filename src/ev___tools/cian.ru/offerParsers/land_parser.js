import {unboxStructure, whatIsLocation, getPriceWithVat} from "./common_functions.js";
import {landDescriptionParse} from "../cian__descriptionParsers/landDescriptionParser.js";

//
//| каркас аналога "Участок земли" (продажа, аренда)
//
const fields = {
    cianId: "ID предложения",
    phoneNumber: "Номер телефона",
    cadastralNumber: "Кадастровый номер",
    fullUrl: "Источник",
    publicationDate: "Дата публикации",
    offerType: "Тип предложения",
    address: "Полный адрес",
    coordinatesLat: "Широта",
    coordinatesLng: "Долгота",
    subject: "Субъект Федерации",
    subjectRaion: "Район в регионе",
    city: "Населенный пункт",
    okrug: "Округ",
    raion: "Район в городе",
    mikroraion: "Микрорайон",
    metro: "Метро",
    distanceTo: "Расстояние до (города/метро/жд/шоссе...)",
    description: "Описание",
    dealType: "Тип сделки",
    dealComments: "Коментарии к сделке",
    currency: "Валюта",
    priceRentWithVat: "Цена аренды (руб/мес. с НДС)",   //| Разбить оффер на две части чтобы убрать лишнее поле
    priceSaleWithVat: "Цена продажи (руб, с НДС)",      //| Либо поставить условие, определяющее тип сделки (продажа/аренда)

    theCompositionOfTheTransferredRights: "Состав передаваемых прав",
    landArea: "Площадь земли, м²",
    landCategory: "Категория земель",
    permittedUse: "ВРИ",
    distanceToMotorway: "Расположение относительно автомагистрали",
    availabilityOfFreeAccessToTheSite: "Наличие свободного подъезда к участку",
    totalBuildingArea: "Площадь зданий на участке, м²",
    presenceOfBuildingsStructuresForDemolition: "Наличие зданий/строений под снос",
    haveTrainStation: "Наличие ж/д на участке",
    availabilityOfGasSupply: "Наличие газоснабжения",
    availabilityOfPowerSupply: "Наличие электроснабжения",
    availabilityOfWaterSupplySewerage: "Наличие водоснабжения, канализации",
    buildingPermit: "Наличие ИРД (разрешение на строительство)",
    buildingPermitComments: "Комментарии (Наличие ИРД)",
    territoryPlanningProject: "Проект планировки территории",
    initialPermitDocumentation: "Исходно-разрешительная документация",
    buildingParkingType: "Тип парковки",
    // buildingHeatingType: "Тип отопления",
    // offerCategory: "Категория объявления",
    // totalArea: "Площадь помещения м²",
}


//
//| titles, fields for headers
//
export const landAnaloguesTitles = Object.values(fields);


//
//| Парсер для аналога: "Земля"
//
export const offerLandParse = offer => {

    let structure = unboxStructure(fields);

    if (offer) {

        let descParse = null;

        //| парсинг описания
        if (typeof offer.description === "string" && offer.description.length > 9) {
            //| парсинг описание
            descParse = landDescriptionParse(offer.description);
            //| Категория земель
            structure.landCategory.value = descParse._landCategory.value;
            //| Наличие ИРД (разрешение на строительство)
            structure.buildingPermit.value = descParse._buildingPermit.value;
            //| Комментарии
            structure.buildingPermitComments.value = descParse._buildingPermitComments.value;
            //| Наличие ж/д ветки
            structure.haveTrainStation.value = descParse._haveTrainStation.value;
            //| ВРИ
            structure.permittedUse.value = descParse._permittedUse.value;
            //| Состав передаваемых прав
            structure.theCompositionOfTheTransferredRights.value = descParse._theCompositionOfTheTransferredRights.value;
            //| Площадь зданий на участке, м²
            structure.totalBuildingArea.value = descParse._totalBuildingArea.value;
            //| Наличие зданий/строений под снос
            structure.presenceOfBuildingsStructuresForDemolition.value = descParse._presenceOfBuildingsStructuresForDemolition.value;
            //| Наличие свободного подъезда к участку
            structure.availabilityOfFreeAccessToTheSite.value = descParse._availabilityOfFreeAccessToTheSite.value;
            //| Расстояние до (города/метро/жд/шоссе...)
            structure.distanceTo.value = descParse._distanceTo.value;
            //| Расстояние до автомагистарли или расположение относительно автомагистрали
            structure.distanceToMotorway.value = descParse._distanceToMotorway.value;
            //| Наличие газоснабжения
            structure.availabilityOfGasSupply.value = descParse._availabilityOfGasSupply.value;
            //| Наличие электроснабжения
            structure.availabilityOfPowerSupply.value = descParse._availabilityOfPowerSupply.value;
            //| Наличие водоснабжения, канализации
            structure.availabilityOfWaterSupplySewerage.value = descParse._availabilityOfWaterSupplySewerage.value;
            //| Проект планировки территории
            structure.territoryPlanningProject.value = descParse._territoryPlanningProject.value;
            //| Исходно-разрешительная документация
            structure.initialPermitDocumentation.value = descParse._initialPermitDocumentation.value;
            //| комментарии к сделке. (аукцион и пр.)
            structure.dealComments.value = descParse._dealComments.value;
        }

        //| кол-во комнат, Описание объявления, тип предложения,
        //| Тип сделки, url адрес, cian id, категория
        structure.description.value = offer.description || null;
        // structure.offerCategory.value = offer.category || null;
        structure.offerType.value = offer.offerType || null;
        structure.dealType.value = offer.dealType || null;
        structure.fullUrl.value = offer.fullUrl || null;
        structure.cianId.value = offer.cianId || null;

        //| Определение даты публикации
        if (offer["addedTimestamp"]) {
            structure.publicationDate.value = [
                new Date(offer["addedTimestamp"] * 1000).getDate(),
                new Date(offer["addedTimestamp"] * 1000).getMonth() || 12,
                new Date(offer["addedTimestamp"] * 1000).getFullYear(),
            ].join(".")
        }

        //| получаем адресные хар-ки:
        //|     - адрес, район, метро, округ, микрорайон
        if (offer["geo"] && offer["geo"].address) {
            let b_addr = offer["geo"].address;
            structure.address.value = offer["geo"].userInput;
            structure.raion.value = b_addr.filter(e => e["geoType"] === "district" && e.type === "raion").map(e => e.name).toString();
            structure.metro.value = b_addr.filter(e => e["geoType"] === "underground" && e.type === "metro").map(e => e.name).toString();
            structure.okrug.value = b_addr.filter(e => e["geoType"] === "district" && e.type === "okrug").map(e => e.name).toString();
            structure.mikroraion.value = b_addr.filter(e => e.type === "mikroraion").map(e => e.name).toString();
            b_addr.filter(item => item["geoType"] === "location" && item.type === "location").forEach(el => {
                let location = whatIsLocation(el);
                if (location && location.key) structure[location.key].value = location.value || null;
            });
        }

        //| получаем площадь земли
        if (offer["land"] && offer["land"]["areaUnitType"] && offer["land"].area) {
            let buff_area_value = parseFloat(offer["land"].area);
            //| Ед. изм. площади земли
            if (offer["land"]["areaUnitType"].toLowerCase() === "hectare") {
                //| Переводим площадь земли из гектаров в м².
                structure.landArea.value = buff_area_value * 10000;
            } else if (offer["land"]["areaUnitType"].toLowerCase() === "sotka") {
                //| Переводим площадь земли из соток в м².
                structure.landArea.value = buff_area_value * 100;
            }
        }

        //| получаем общую площадь помещения
        // if (typeof offer.totalArea === "string") {
        //     structure.totalArea.value = offer.totalArea.replace(/\./, ',');
        // }

        //| получаем номер телефона
        if (
            offer["phones"] && offer["phones"].length > 0 &&
            offer["phones"][0]["countryCode"] && offer["phones"][0]["number"]
        ) {
            structure.phoneNumber.value = `${offer["phones"][0]["countryCode"]} ${offer["phones"][0]["number"]}`;
        }

        //| получаем координаты
        if (
            offer["geo"] && offer["geo"]["coordinates"] &&
            offer["geo"]["coordinates"]["lat"] && offer["geo"]["coordinates"]["lng"]
        ) {
            structure.coordinatesLat.value = offer["geo"]["coordinates"]["lat"].toString().slice(0, 8);
            structure.coordinatesLng.value = offer["geo"]["coordinates"]["lng"].toString().slice(0, 8);
        }

        //| кадастровый номер
        if (typeof offer.cadastralNumber === "string") {

            //| получание кадастрового номера из объекта offer from_cian.ru
            let repPat = /(\d{1,2}:\d{1,2}:\d{1,8}:)0*([1-9]+\d*)/;
            let sPat = /\d{2}:\d{2}:\d{5,7}:\d{1,7}/;
            let found = offer.cadastralNumber.match(sPat);
            if (found) {
                structure.cadastralNumber.value = found.toString().replace(repPat, "$1$2");
            }

            //| парсинг кадастрового номера по описанию объявления
            if (!structure.cadastralNumber.value && descParse && typeof descParse._cadastralNumbers.value === "string") {
                let found = descParse._cadastralNumbers.value.match(/\d{2}:\d{2}:\d{5,7}:\d{1,7}/g);
                structure.cadastralNumber.value = found.toString().replace(repPat, "$1$2");
            }
        }

        //| параметры здания
        if (offer.building) {
            // //| Тип отопления
            // structure.buildingHeatingType.value = offer.building["heatingType"] || null;
            //| Тип парковки
            if (offer.building["parking"]) {
                structure.buildingParkingType.value = offer.building["parking"]["type"] || null;
            }
        }

        //| Валюта
        if (offer["bargainTerms"]) {
            structure.currency.value = offer["bargainTerms"]["currency"] || null;
        }

        //| определение цены с НДС
        //|     -аренды, если предложение по аренде;
        //|     -продажи, если предложение по продаже.
        if (
            offer.dealType &&
            offer.bargainTerms &&
            offer.bargainTerms.priceType &&
            offer.bargainTerms.price &&
            offer.bargainTerms.vatType
        ) {

            let area_kvm = 0;
            if (structure.totalArea && structure.totalArea.value) {
                area_kvm = structure.totalArea.value
            } else {
                area_kvm = structure.landArea.value
            }

            if (offer.dealType === "rent") {
                structure.priceRentWithVat.value = getPriceWithVat(
                    offer["bargainTerms"]["priceType"],
                    offer["bargainTerms"].price,
                    offer["bargainTerms"]["vatType"],
                    offer["bargainTerms"]["paymentPeriod"],
                    area_kvm
                );
            } else if (offer.dealType === "sale") {
                structure.priceSaleWithVat.value = getPriceWithVat(
                    offer["bargainTerms"]["priceType"],
                    offer["bargainTerms"].price,
                    offer["bargainTerms"]["vatType"],
                    offer["bargainTerms"]["paymentPeriod"],
                    area_kvm
                );
            }
        }
    }

    return structure;
};