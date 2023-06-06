const { landDescParse } = require("../cian__description_parsers/landDescriptionParser");
const { unboxStructure, whatIsLocation, getPriceWithVat } = require("./common__parser__methods");
//
//| каркас общий (старый для земли с лишними полями)
//
const default_analogue_structure_sale_rent = {
    cianId: "ID предложения",
    phoneNumber: "Номер телефона",
    cadastralNumber: "Кадастровый номер",
    offerCategory: "Категория объявления",
    lotCategory: "Категория земель",
    fullUrl: "Источник",
    publicationDate: "Дата публикации",
    offerType: "Тип предложения",
    coordinatesLat: "Широта",
    coordinatesLng: "Долгота",
    address: "Полный адрес",
    subject: "Субъект Федерации",
    subjectRaion: "Район в регионе",
    city: "Город",
    okrug: "Округ",
    raion: "Район в городе",
    mikroraion: "Микрорайон",
    metro: "Метро",
    description: "Описание",
    landArea: "Площадь земли м2",
    totalArea: "Площадь помещения м2",
    floorNumber: "Этаж",
    buildingType: "Тип здания",
    buildingFloorsCount: "Этажность здания",
    buildingClassType: "Класс недвижимости",
    buildingBuildYear: "Год постройки",
    buildingMaterialType: "Строительный материал",
    buildingCargoLiftsCount: "Грузовых лифтов, шт.",
    buildingPassengerLiftsCount: "Пассажирских лифтов, шт.",
    buildingHeatingType: "Тип отопления",
    buildingParkingType: "Тип парковки",
    buildingPermit: "Наличие ИРД (разрешение на строительство)",
    buildingPermitComments: "Комментарии",
    permittedUse: "ВРИ",
    territoryPlanningProject: "Проект планировки территории",
    initialPermitDocumentation: "Исходно-разрешительная документация",
    theCompositionOfTheTransferredRights: "Состав передаваемых прав",
    totalBuildingArea: "Площадь зданий на участке, кв.м",
    buildingDensity: "Плотность застройки, кв.м",
    presenceOfBuildingsStructuresForDemolition: "Наличие зданий/строений под снос",
    areaOfBuildingsForDemolition: "Площадь строений под снос, кв.м",
    availabilityOfFreeAccessToTheSite: "Наличие свободного подъезда к участку",
    distanceToCity: "Расстояние до (города/метро/жд/шоссе...)",
    availabilityOfGasSupply: "Наличие газоснабжения",
    availabilityOfPowerSupply: "Наличие электроснабжения",
    availabilityOfWaterSupplySewerage: "Наличие водоснабжения, канализации",
    dealType: "Тип сделки",
    dealComments: "Коментарии к сделке",
    currency: "Валюта",
    priceRentWithVat: "Цена аренды (руб/мес. с НДС)",
    priceSaleWithVat: "Цена продажи (руб, с НДС)",
};
//
//| парсер общий (старый для земли с лишними полями)
//
const offerDefaultParser = offer => {
    let structure = unboxStructure(default_analogue_structure_sale_rent);
    if (offer) {
        let descParse = null;
        //| парсинг описания
        if (typeof offer.description === "string" && offer.description.length > 9) {
            //| парсинг описание
            descParse = landDescParse(offer.description);
            //| категория земель (парсинг описания)
            structure.lotCategory.value = descParse._lotCategory.value;
            //| Наличие ИРД (разрешение на строительство)
            structure.buildingPermit.value = descParse._buildingPermit.value;
            //| Комментарии
            structure.buildingPermitComments.value = descParse._buildingPermitComments.value;
            //| ВРИ
            structure.permittedUse.value = descParse._permittedUse.value;
            //| Состав передаваемых прав
            structure.theCompositionOfTheTransferredRights.value = descParse._theCompositionOfTheTransferredRights.value;
            //| Площадь зданий на участке, кв.м
            structure.totalBuildingArea.value = descParse._totalBuildingArea.value;
            //| Плотность застройки, кв.м
            structure.buildingDensity.value = descParse._buildingDensity.value;
            //| Наличие зданий/строений под снос
            structure.presenceOfBuildingsStructuresForDemolition.value = descParse._presenceOfBuildingsStructuresForDemolition.value;
            //| Наличие свободного подъезда к участку
            structure.availabilityOfFreeAccessToTheSite.value = descParse._availabilityOfFreeAccessToTheSite.value;
            //| Расстояние до (города/метро/жд/шоссе...)
            structure.distanceToCity.value = descParse._distanceToCity.value;
            //| Наличие газоснабжения
            structure.availabilityOfGasSupply.value = descParse._availabilityOfGasSupply.value;
            //| Наличие электроснабжения
            structure.availabilityOfPowerSupply.value = descParse._availabilityOfPowerSupply.value;
            //| Наличие водоснабжения, канализации
            structure.availabilityOfWaterSupplySewerage.value = descParse._availabilityOfWaterSupplySewerage.value;
            //| Площадь строений под снос, кв.м
            structure.areaOfBuildingsForDemolition.value = descParse._areaOfBuildingsForDemolition.value;
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
        structure.floorNumber.value = offer.floorNumber || null;
        structure.offerCategory.value = offer.category || null;
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
            ].join(".");
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
                if (location && location.key)
                    structure[location.key].value = location.value || null;
            });
        }
        //| получаем площадь земли
        if (offer["land"] && offer["land"]["areaUnitType"] && offer["land"].area) {
            let buff_area_value = parseFloat(offer["land"].area);
            //| Ед. изм. площади земли
            if (offer["land"]["areaUnitType"].toLowerCase() === "hectare") {
                //| Переводим площадь земли из гектаров в кв.м.
                structure.landArea.value = buff_area_value * 10000;
            }
            else if (offer["land"]["areaUnitType"].toLowerCase() === "sotka") {
                //| Переводим площадь земли из соток в кв.м.
                structure.landArea.value = buff_area_value * 100;
            }
        }
        //| получаем общую площадь помещения
        if (typeof offer.totalArea === "string") {
            structure.totalArea.value = offer.totalArea.replace(/\./, ',');
        }
        //| получаем номер телефона
        if (offer["phones"] && offer["phones"].length > 0 &&
            offer["phones"][0]["countryCode"] && offer["phones"][0]["number"]) {
            structure.phoneNumber.value = `${offer["phones"][0]["countryCode"]} ${offer["phones"][0]["number"]}`;
        }
        //| получаем координаты
        if (offer["geo"] && offer["geo"]["coordinates"] &&
            offer["geo"]["coordinates"]["lat"] && offer["geo"]["coordinates"]["lng"]) {
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
            if (!structure.cadastralNumber.value && descParse && typeof descParse._cadNumbers.value === "string") {
                let found = descParse._cadNumbers.value.match(/\d{2}:\d{2}:\d{5,7}:\d{1,7}/g);
                structure.cadastralNumber.value = found.toString().replace(repPat, "$1$2");
            }
        }
        //| Этажность здания, Год постройки, Тип здания, Строительный материал
        //| Грузовых лифтов, шт, Пассажирских лифтов, шт, Тип отопления
        if (offer.building) {
            structure.buildingFloorsCount.value = offer.building["floorsCount"] || null;
            structure.buildingClassType.value = offer.building["classType"] || null;
            structure.buildingBuildYear.value = offer.building["buildYear"] || null;
            structure.buildingType.value = offer.building["type"] || null;
            structure.buildingCargoLiftsCount.value = offer.building["cargoLiftsCount"] || null;
            structure.buildingPassengerLiftsCount.value = offer.building["passengerLiftsCount"] || null;
            structure.buildingHeatingType.value = offer.building["heatingType"] || null;
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
        if (offer.dealType &&
            offer.bargainTerms &&
            offer.bargainTerms.priceType &&
            offer.bargainTerms.price &&
            offer.bargainTerms.vatType) {
            let area_kvm = 0;
            if (structure.totalArea.value) {
                area_kvm = structure.totalArea.value;
            }
            else {
                area_kvm = structure.landArea.value;
            }
            if (offer.dealType === "rent") {
                structure.priceRentWithVat.value = getPriceWithVat(offer["bargainTerms"]["priceType"], offer["bargainTerms"].price, offer["bargainTerms"]["vatType"], offer["bargainTerms"]["paymentPeriod"], area_kvm);
            }
            else if (offer.dealType === "sale") {
                structure.priceSaleWithVat.value = getPriceWithVat(offer["bargainTerms"]["priceType"], offer["bargainTerms"].price, offer["bargainTerms"]["vatType"], offer["bargainTerms"]["paymentPeriod"], area_kvm);
            }
        }
    }
    return structure;
};
module.exports = {
    offerDefaultParser,
    landAnaloguesTitles: Object.values(default_analogue_structure_sale_rent),
};
//# sourceMappingURL=default__parser.js.map