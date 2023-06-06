import _ from "lodash";


const fields = {

    cianId: {
        value: null,
        description: "Уникальный идентификатор", //| ID предложения
        set(offer) {
            this.value = offer.cianId || null;
        }
    },

    phoneNumber: {
        value: null,
        description: "Номер телефона",
        set(offer) {
            if (
                offer.phones &&
                offer.phones.length > 0 &&
                offer.phones[0].countryCode &&
                offer.phones[0].number
            ) {
                this.value = `${offer.phones[0].countryCode} ${offer.phones[0].number}`;
            }
        }
    },

    cadastralNumber: {
        value: null,
        description: "Кадастровый номер",
        set(offer) {
            if (typeof offer.cadastralNumber === "string") {
                let found = offer.cadastralNumber.match(/\d{2}:\d{2}:\d{5,7}:\d{1,7}/);
                let corrector = /(\d{1,2}:\d{1,2}:\d{1,8}:)0*([1-9]+\d*)/;
                if (found) {
                    //| получание кадастрового номера из объекта cian
                    this.value = found.toString().replace(corrector, "$1$2");
                } else {
                    //| парсинг кадастрового номера из описанию
                    let currDesc = offer.description;
                    if (typeof currDesc === "string" && currDesc.length > 10) {
                        let foundArray = currDesc.match(/\d{2}:\d{2}:\d{5,7}:\d{1,7}/ig);
                        if (Array.isArray(foundArray) && foundArray.length > 0) {
                            this.value = foundArray[0].replace(corrector, "$1$2");
                        }
                    }
                }
            }
        }
    },

    fullUrl: {
        value: null,
        description: "Источник информации",
        set(offer) {
            this.value = offer.fullUrl || null;
        }
    },

    publicationDate: {
        value: null,
        description: "Дата публикации",
        set(offer) {
            if (offer.addedTimestamp) {
                this.value = [
                    new Date(offer.addedTimestamp * 1000).getDate(),
                    new Date(offer.addedTimestamp * 1000).getMonth() || 12,
                    new Date(offer.addedTimestamp * 1000).getFullYear(),
                ].join(".")
            }
        }
    },

    address: {
        value: null,
        description: "Полный адрес",
        set(offer) {
            if (offer.geo && offer.geo.userInput) {
                this.value = offer.geo.userInput.replace(/Россия,?\s?/ig, "");
            }
        }
    },

    coordinatesLat: {
        value: null,
        description: "Координаты - Широта",
        set(offer) {
            if (offer.geo && offer.geo.coordinates && offer.geo.coordinates.lat) {
                this.value = offer.geo.coordinates.lat.toString().slice(0, 8);
            }
        }
    },

    coordinatesLng: {
        value: null,
        description: "Координаты - Долгота",
        set(offer) {
            if (offer.geo && offer.geo.coordinates && offer.geo.coordinates.lng) {
                this.value = offer.geo.coordinates.lng.toString().slice(0, 8);
            }
        }
    },

    subject: {
        value: null,
        description: "Субъект Федерации",
        set(offer) {
            if (offer.geo && offer.geo.address) {

                let found = offer.geo.address.filter(el => {
                    return el.geoType === "location" && el.type === "location";
                });

                if (Array.isArray(found) && found.length > 0) {

                    found = found[0];

                    let subjectCianTypes = [
                        {name: "Республика", typeId: 140},
                        {name: "Край", typeId: 138},
                        {name: "Область", typeId: 2},
                        {name: "Автономный округ", typeId: 135},
                        {name: "Автономная область", typeId: 136},
                        {name: "Город федерального значения", typeId: 1},
                    ];

                    subjectCianTypes.forEach(subEl => {
                        if (subEl.typeId === found.locationTypeId) {
                            this.value = found.title;
                        }
                    });

                }
            }
        }
    },

    subjectRaion: {
        value: null,
        description: "Район в регионе",
        set(offer) {
            this.value = "";
        }
    },

    cityType: {

        cityTypeVariants: [
            {test: /г[\s.]/ig, description: "Город"},
            {test: /пгт[\s.]/ig, description: "Поселок городского типа"},
            {test: /рп[\s.]/ig, description: "рабочий посёлок"},
            {test: /кп[\s.]/ig, description: "курортный поселок"},
            {test: /к[\s.]/ig, description: "Кишлак"},
            {test: /дп[\s.]/ig, description: "Дачный поселок"},
            {
                test: /пос[\s.]/ig,
                description: "Поселок"
            },
            {
                test: /sndjnvmsdkvmdsvd/ig,
                description: ""
            },
            {
                test: /sndjnvmsdkvmdsvd/ig,
                description: ""
            }
        ],

        value: null,
        description: "Тип населенного пункта",
        set(offer) {
            if (offer.geo && offer.geo.address) {
                let locationFound = offer.geo.address.filter(e => {
                    return e.type === "location" && e.locationTypeId === 1;
                });
                let locationFoundNames = locationFound.map(e => e.name);
                if (Array.isArray(locationFoundNames) && locationFoundNames.length > 0) {
                    this.value = locationFoundNames[locationFoundNames.length - 1];
                }
            }
        },
    },

    city: {
        value: null,
        description: "Населенный пункт",
        set(offer) {
            if (offer.geo && offer.geo.address) {
                let found = offer.geo.address.filter(e => {
                    return e.type === "location" && e.locationTypeId === 1;
                }).map(e => e.name);
                if (Array.isArray(found) && found.length > 0) {
                    this.value = found[found.length - 1];
                }
            }
        }
    },

    okrug: {
        value: null,
        description: "Округ",
        set(offer) {
            if (offer.geo && offer.geo.address) {
                this.value = offer.geo.address.filter(e => {
                    return e.geoType === "district" && e.type === "okrug";
                }).map(e => e.name).toString();
            }
        }
    },

    raion: {
        value: null,
        description: "Район в городе",
        set(offer) {
            if (offer.geo && offer.geo.address) {
                this.value = offer.geo.address.filter(e => {
                    return e.geoType === "district" && e.type === "raion";
                }).map(e => e.name).toString();
            }
        }
    },

    mikroraion: {
        value: null,
        description: "Микрорайон",
        set(offer) {
            if (offer.geo && offer.geo.address) {
                this.value = offer.geo.address.filter(e => {
                    return e.type === "mikroraion";
                }).map(e => e.name).toString();
            }
        }
    },

    section: {
        value: null,
        description: "Квартал",
        set(offer) {
            if (offer.geo && offer.geo.address) {
                this.value = offer.geo.address.filter(e => {
                    let test1 = Boolean(e.type === "location");
                    let test2 = Boolean(e.shortName.match(/кв-л/ig));
                    let test3 = Boolean(e.shortName.match(/квартал/ig));
                    let test4 = Boolean(e.fullName.match(/кв-л/ig));
                    let test5 = Boolean(e.fullName.match(/квартал/ig));
                    return test1 && (test2 || test3 || test4 || test5);
                }).map(e => e.name).toString();
            }
        }
    },

    metroNameWalk: {
        value: null,
        description: "Ближайшая станция метро (пешком)",
        set(offer) {
            if (
                offer.geo &&
                Array.isArray(offer.geo.undergrounds) &&
                offer.geo.undergrounds.length > 0
            ) {

                let arrayWalkDistances = offer.geo.undergrounds.filter(el => {
                    return el.transportType === "walk";
                }).sort((el1, el2) => {
                    return el1.time < el2.time ? -1 : 1;
                });

                if (arrayWalkDistances.length > 0) {
                    this.value = arrayWalkDistances[0].name;
                }

            }
        }
    },

    metroWalkDistance: {
        value: null,
        description: "Удаленность от метро (мин. пешком)",
        set(offer) {
            if (
                offer.geo &&
                Array.isArray(offer.geo.undergrounds) &&
                offer.geo.undergrounds.length > 0
            ) {
                let arrayWalkDistances = offer.geo.undergrounds.filter(el => {
                    return el.transportType === "walk";
                }).sort((el1, el2) => {
                    return el1.time < el2.time ? -1 : 1;
                });

                if (arrayWalkDistances.length > 0) {
                    this.value = arrayWalkDistances[0].time;
                }
            }
        }
    },

    metroNameTransport: {
        value: null,
        description: "Ближайшая станция метро (транспорт)",
        set(offer) {
            if (
                offer.geo &&
                Array.isArray(offer.geo.undergrounds) &&
                offer.geo.undergrounds.length > 0
            ) {

                let arrayWalkDistances = offer.geo.undergrounds.filter(el => {
                    return el.transportType === "transport";
                }).sort((el1, el2) => {
                    return el1.time < el2.time ? -1 : 1;
                });

                if (arrayWalkDistances.length > 0) {
                    this.value = arrayWalkDistances[0].name;
                }

            }
        }
    },

    metroTransportDistance: {
        value: null,
        description: "Удаленность от метро (мин. транспорт)",
        set(offer) {
            if (
                offer.geo &&
                Array.isArray(offer.geo.undergrounds) &&
                offer.geo.undergrounds.length > 0
            ) {
                let arrayTransportDistances = offer.geo.undergrounds.filter(el => {
                    return el.transportType === "transport";
                }).sort((el1, el2) => {
                    return el1.time < el2.time ? -1 : 1;
                });

                if (arrayTransportDistances.length > 0) {
                    this.value = arrayTransportDistances[0].time;
                }
            }
        }
    },

    description: {
        value: null,
        description: "Описание",
        set(offer) {
            if (
                typeof offer.description === "string" &&
                offer.description.length > 10
            ) {
                this.value = offer.description;
            }
        }
    },

    dealType: {
        value: null,
        description: "Тип сделки",
        set(offer) {
            const variants = {
                sale: "Продажа",
                rent: "Аренда",
            }
            if (offer.dealType) {
                if (offer.dealType in variants) {
                    this.value = variants[offer.dealType];
                } else {
                    this.value = offer.dealType;
                }
            }
        }
    },

    functionalPurpose: {
        value: null,
        description: "Функциональное назначение",
        set(offer) {
            if (offer.officeType) {
                this.value = offer.officeType;
            } else if (offer.category) {
                this.value = offer.category;
            }
        }
    },

    specialty: {
        value: null,
        description: "Варианты использования",
        set(offer) {
            if (
                offer.specialty &&
                Array.isArray(offer.specialty.specialties) &&
                offer.specialty.specialties.length > 0
            ) {
                this.value = offer.specialty.specialties.map(el => el.rusName).toString();
            }
        }
    },

    dealComments: {
        value: null,
        description: "Коментарии к сделке",
        set(offer) {
            if (
                typeof offer.description === "string" &&
                offer.description.length > 10
            ) {
                if (offer.description.match(/продажа.{1,15}торги|аукцион/ig)) {
                    this.value = "Аукцион";
                }
            }
        }
    },


    //| разобраться с ценой НДС, найти поле стоимости.
    vatType: {
        value: null,
        description: "НДС",
        set(offer) {
            if (offer.bargainTerms && offer.bargainTerms.vatType) {
                // const variants = {
                //     usn: "УСН",
                //     included: "Включен",
                //     notIncluded: "Не включен"
                // };
                // if (offer.bargainTerms.vatType in variants) {
                //     this.value = variants[offer.bargainTerms.vatType];
                // } else {
                //
                // }
                this.value = offer.bargainTerms.vatType;
            }
        }
    },

    price: {
        value: null,
        description: "Цена",
        set(offer) {

            if (offer.dealType) {

                let descriptionVariants = {
                    sale: "Цена продажи, руб",
                    rent: "Цена аренды, руб/мес."
                }

                if (offer.dealType in descriptionVariants) {
                    this.description = descriptionVariants[offer.dealType]
                } else {
                    this.description = offer.dealType;
                }
            }

            if (offer.bargainTerms && offer.bargainTerms.price) {

                let buffFloatNumber = parseFloat(offer.bargainTerms.price);

                if (
                    typeof offer.bargainTerms.priceType === "string" &&
                    offer.bargainTerms.priceType.match(/squareMeter/ig)
                ) {
                    buffFloatNumber *= offer.totalArea;
                }

                if (
                    typeof offer.bargainTerms.paymentPeriod === "string" &&
                    offer.bargainTerms.paymentPeriod.match(/annual/ig)
                ) {
                    buffFloatNumber /= 12;
                }

                this.value = buffFloatNumber;
            }

            // //| определяем площадь земли
            // let landAreaBuff = null;
            // if (
            //     offer.land &&
            //     offer.land.areaUnitType &&
            //     offer.land.area
            // ) {
            //     landAreaBuff = parseFloat(offer.land.area.replace(/,/, "."));
            //     //| Ед. изм. площади земли
            //     if (offer.land.areaUnitType.toLowerCase() === "hectare") {
            //         //| Переводим площадь земли из гектаров в м².
            //         landAreaBuff = landAreaBuff * 10000;
            //     } else if (offer.land.areaUnitType.toLowerCase() === "sotka") {
            //         //| Переводим площадь земли из соток в м².
            //         landAreaBuff = landAreaBuff * 100;
            //     }
            // }
            //
            // //| определяем площадь помещения
            // let totalAreaBuff = null;
            // if (typeof offer.totalArea === "string") {
            //     totalAreaBuff = parseFloat(offer.totalArea.replace(/,/, '.'));
            // }
            //
            //
            // //| определяем цену с учетом НДС
            // this.value = getPriceWithVat(
            //     offer.bargainTerms.priceType,
            //     parseFloat(offer.bargainTerms.price),
            //     offer.bargainTerms.vatType,
            //     offer.bargainTerms.paymentPeriod,
            //     Boolean(totalAreaBuff) ? totalAreaBuff : landAreaBuff,
            // );

        }
    },

    parseDate: {
        value: null,
        description: "Дата парсинга",
        set(offer) {
            this.value = (new Date()).toLocaleDateString();
        }
    },

    heatingType: {
        value: null,
        description: "Тип отопления",
        set(offer) {
            if (offer.building && offer.building.heatingType) {
                this.value = offer.building.heatingType;
            }
        }
    }



    // landArea: {
    //     value: null,
    //     description: "Площадь земли, м²",
    //     set(offer) {
    //         if (
    //             offer.land &&
    //             offer.land.areaUnitType
    //             && offer.land.area
    //         ) {
    //             let buff_area_value = parseFloat(offer.land.area.replace(/,/, "."));
    //             //| Ед. изм. площади земли
    //             if (offer.land.areaUnitType.toLowerCase() === "hectare") {
    //                 //| Переводим площадь земли из гектаров в м².
    //                 objectBox.landArea.value = buff_area_value * 10000;
    //             } else if (offer.land.areaUnitType.toLowerCase() === "sotka") {
    //                 //| Переводим площадь земли из соток в м².
    //                 objectBox.landArea.value = buff_area_value * 100;
    //             }
    //         }
    //     },
    // }
    // landArea: "Площадь земли, м²",

    // theCompositionOfTheTransferredRights: "Состав передаваемых прав",

    // totalArea: "Общая площадь помещения, м²",
    // floorsCount: "Этаж/общая этажность",
    // UndergroundParkingArea: "Площадь подземного паркинга, м²",
    // HavingSeparateEntrance: "Наличие отдельного входа",
    // HavingSeparateEntranceType: "Тип входа",
    // ObjectLocationLine: "Линия расположения объекта",
    // buildType: "Тип здания",
    // buildYearsOld: "Возраст здания, лет",
    // buildingParkingType: "Тип парковки",
    // NumberOfParkingSpaces: "Количество парковочных мест, ед.",
    //| Поле "Тип отопления" - offer.building.heatingType

    //| offer.garage ??? Распарсить по полям для гаражей
    // "garage": {
    //     "status": "ownership",
    //     "type": "parkingPlace",
    //     "garageType": null,
    //     "material": null
    // },

    //| ЗЕмля во владении
    // "land": {
    //     "possibleToChangeStatus": null,
    //     "areaUnitType": "hectare",
    //     "type": "owned", ----------------------
    //     "status": null,
    //     "area": null
    // },

    //| Поле "coworking":
    //| содержит доп информацию, например  ремонте и мебелировании
    //|

    //| "specialty":
    //| определяет, под что может быть использован (Автомойка,Автосервис,Цех,Шиномонтаж,Сауна,Сервис,Арендный бизнес)
    //| offers.map(el => el.specialty.specialties.map(el => el.rusName).toString())
}

export const generalOfferParse = offer => {
    let bufferFields = _.cloneDeep(fields);
    Object.keys(bufferFields).forEach(key => {
        bufferFields[key].set(offer);
        delete bufferFields[key].set;
    });
    return bufferFields;
}