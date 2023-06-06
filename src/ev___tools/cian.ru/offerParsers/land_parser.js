import {generalOfferParse} from "./general_parser.js";
import _ from "lodash";

const fields = {
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
    distanceTo: {
        value: null,
        description: "Расстояние до (города/метро/жд/шоссе...)",
        set(offer) {
            if (offer.description.match(/\d.{1,15}(метров|метрах).*([аА]втодороги|[дД]ороги|[тТ]рассы|[кК]ольца|[мМ][кК][аА][дД])/ig)) {
                this.value = offer.description.match(/\d.{1,15}(метров|метрах).*([аА]втодороги|[дД]ороги|[тТ]рассы|[кК]ольца|[мМ][кК][аА][дД])/ig).toString();
            } else if (offer.description.match(/(\d+)\s+(км|м)\s+(до|от|в сторону)\s.{1,20}(города|центра|мкад|шоссе|села|поселка|развилки|развязки|метро|станции|ж\/д)/ig)) {
                this.value = offer.description.match(/(\d+)\s+(км|м)\s+(до|от|в сторону)\s.{1,20}(города|центра|мкад|шоссе|села|поселка|развилки|развязки|метро|станции|ж\/д)/ig).toString();
            } else if (offer.description.match(/\d+.{1,10}метрах.{1,10}(от.{1,20}трассы|от.{1,20}станции|от.{1,20}реки|от.{1,20}базы)/ig)) {
                this.value = offer.description.match(/\d+.{1,10}метрах.{1,10}(от.{1,20}трассы|от.{1,20}станции|от.{1,20}реки|от.{1,20}базы)/ig).toString();
            }
        }
    },
    description: {
        value: null,
        description: "Описание",
        set(offer) {
            this.value = generalOfferParse(offer).description;
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
    theCompositionOfTheTransferredRights: {
        value: null,
        description: "Состав передаваемых прав",
        set(offer) {
            let buff = offer.description.match(/(([вВ]ид|[тТ]ип)[а-яА-Я:\s=-]*([пП]рав[оа])[а-яА-Я:\s=-]*собственность)|(([вВ]ид|[тТ]ип)[а-яА-Я:\s=-]*([пП]рав[оа])[а-яА-Я:\s=-]*аренда)/ig);
            if (buff) {
                if (buff.toString().toLowerCase().indexOf("собственность")) {
                    this.value = "собственность";
                } else if (buff.toString().toLowerCase().indexOf("аренда")) {
                    this.value = "аренда";
                }
            }
        }
    },
    landArea: {
        value: null,
        description: "Площадь земли, кв. м",
        set(offer) {
            if (offer.land && offer.land.areaUnitType && offer.land.area) {
                let buff_area_value = parseFloat(offer.land.area);
                if (offer.land.areaUnitType.toLowerCase() === "hectare") {
                    this.value = buff_area_value * 10000;
                } else if (offer.land.areaUnitType.toLowerCase() === "sotka") {
                    this.value = buff_area_value * 100;
                }
            }
        }
    },
    landCategory: {
        value: null,
        description: "Категория земель",
        set(offer) {
            if (typeof offer.description === "string" && offer.description.length > 9) {
                if (offer.description.match(/[зЗ]емли населенных пунктов/ig)) {
                    this.value = "земли населенных пунктов";
                }
            }
        }
    },
    permittedUse: {
        value: null,
        description: "ВРИ",
        set(offer) {
            if (typeof offer.description === "string" && offer.description.length > 9) {
                if (offer.description.match(/ВРИ.*\n/ig)) {
                    this.value = offer.description.match(/ВРИ.*\n/ig).toString().replace(/(ВРИ|:)/ig, "");
                }
            }
        }
    },
    distanceToMotorway: {
        value: null,
        description: "Расположение относительно автомагистрали",
        set(offer) {
            this.value = "";
        }
    },
    availabilityOfFreeAccessToTheSite: {
        value: null,
        description: "Наличие свободного подъезда к участку",
        set(offer) {
            if (typeof offer.description === "string" && offer.description.length > 9) {
                if (
                    offer.description.match(/участие в.{1,50}\sподъезд[оаы,.\s-]/ig) &&
                    offer.description.match(/озможн.{1,50}\sподъезд[оаы,.\s-]/ig)
                ) {
                    this.value = "нет";
                } else if (
                    !offer.description.match(/участие в.{1,50}\sподъезд[оаы,.\s-]/ig) &&
                    !offer.description.match(/озможн.{1,50}\sподъезд[оаы,.\s-]/ig) &&
                    offer.description.match(/\sподъезд/ig)
                ) {
                    this.value = "да";
                }
            }
        }
    },
    totalBuildingArea: {
        value: null,
        description: "Площадь зданий на участке, м²",
        set(offer) {
            if (typeof offer.description === "string" && offer.description.length > 9) {
                let foundBuildings = offer.description.match(/(([сС]троения|[кК]омплекс зданий|[кК]омплекс|здани[яй]|Комплекс представляет собой|Комплекс состоит из).{0,80}(общей|суммарн(ая|ой)) площадью)[\s:=_-]*(\d+(\s?\d*)*([.,]\d+)?)\s*([кК][вВ]\.?\s?[мМ]\.?|[гГ][аА]\.?|[мМ]²)/ig);
                if (foundBuildings) {
                    let full_ga = foundBuildings.toString().match(/[\s:=_-]*(\d+(\s?\d*)*([.,]\d+)?)\s*([гГ][аА]\.?)/ig);
                    if (full_ga) {
                        let free_ga = full_ga.toString().match(/(\d+(\s?\d*)*([.,]\d+)?)/ig);
                        if (free_ga) {
                            this.value = parseFloat(free_ga[0].replace(/\s+/ig, "")) * 10000;
                        }
                    }
                    let full_kvm = foundBuildings.toString().match(/[\s:=_-]*(\d+(\s?\d*)*([.,]\d+)?)\s*([кК][вВ]\.?\s?[мМ]\.?|[мМ]²)/ig);
                    if (full_kvm) {
                        let free_ga = full_kvm.toString().match(/(\d+(\s?\d*)*([.,]\d+)?)/ig);
                        if (free_ga) {
                            this.value = parseFloat(free_ga[0].replace(/\s+/ig, ""));
                        }
                    }
                }
            }
        }
    },
    presenceOfBuildingsStructuresForDemolition: {
        value: null,
        description: "Наличие зданий/строений под снос",
        set(offer) {
            if (typeof offer.description === "string" && offer.description.length > 9) {
                if (offer.description.match(/(аварийное|состояние)\s(состояние|аварийное)/ig)) {
                    this.value = "да";
                }
            }
        }
    },
    haveTrainStation: {
        value: null,
        description: "Наличие ж/д на участке",
        set(offer) {
            if (typeof offer.description === "string" && offer.description.length > 9) {
                if (offer.description.match(/\s(железнодорожны(й|ми)|жд|ж\.д|ж\/д).{1,10}тупик/ig)) {
                    this.value = "да";
                }
            }
        }
    },
    availabilityOfGasSupply: {
        value: null,
        description: "Наличие газоснабжения",
        set(offer) {
            if (typeof offer.description === "string" && offer.description.length > 9) {
                if (
                    offer.description.match(/развитие газообеспечение|возможна газификация|работа.{1,10}по.{1,10}протягиванию.{1,25}газа/ig) ||
                    offer.description.match(/Газ.{1,35}с возможностью подключения|[тТ]очки подключения [гГ]азоснабжения/ig) ||
                    offer.description.match(/возможности присоединения.{1,100}газ|нет газа|отсутствует газ/ig)
                ) {
                    this.value = "нет";
                } else if (
                    offer.description.match(/[гГ]азоснабжение|[гГ]азовая котельная|[гГ]азовая подстанция/ig) ||
                    offer.description.match(/[гГ]аз (по|на) границе|[гГ]азопроводы?/ig) ||
                    offer.description.match(/[кК]оммуникаци(и|ями)[\s:=-]+.{1,150}газ[\s.,]|Межрегионгаз|Мосгаз|Газпром/ig) ||
                    offer.description.match(/[гГ]аз высокого давления|[мМ]агистральный газ/ig) ||
                    offer.description.match(/[еЕ]сть газ|[гГ]аз.{1,15}\d+(\s?\d*)*([.,]\d+)?метр/ig) ||
                    offer.description.match(/имеются коммуникации.{1,65}газ|все коммуникации:.{1,65}газ|заведено.{1,65}газ/ig)
                ) {
                    this.value = "да";
                }
            }
        }
    },
    availabilityOfPowerSupply: {
        value: null,
        description: "Наличие электроснабжения",
        set(offer) {
            if (typeof offer.description === "string" && offer.description.length > 9) {
                if (offer.description.match(/([вВ]озможно.{1,20}подключени[ея]|условие для|возможност[ьи] подключени[ея]).{1,60}(электросет(ям|и|ей)|электричеств[оау]|электроэнергии|эл-гии|эл-ии|эл-во|[эЭ]лектро сет(ям|и|ей))/ig)) {
                    this.value = "нет";
                } else if (
                    offer.description.match(/([эЭ]лектричество|сети|[эЭ]лектроэнергия).{1,10}\d+(\s?\d*)*([.,]\d+)?.{1,5}[кК][вВ][тТ]/ig) ||
                    offer.description.match(/([эЭ]лектричество|сети|[эЭ]лектроэнергия).{1,10}\d+(\s?\d*)*([.,]\d+)?.{1,5}[кК][вВ][тТ]/ig) ||
                    offer.description.match(/([пП]одведен[оы]|[зЗ]аведен[оы]|имеется) ([эЭ]лектричество|[эЭ]л-во)/ig) ||
                    offer.description.match(/есть доступ к электроэнергии/ig) ||
                    offer.description.match(/([эЭ]лектрическая мощность|[оО]бщая мощность|[мМ]ощность электричества|[зЗ]аведено электричество с мощностью|[эЭ]лектроэнергия|[вВ]ыделенная мощность|[вВ]ыделенная лектрическая мощность|[еЕ]диновременная мощность)[\s,]*(разрешенная мощность|\(РУ\)|электроснабжения)?([а-яА-Я)(]*)([\s:=-]*)(\d+(\s?\d*)*[.,]?\d*\s?[кКмМгГ][вВ][тТ])/ig) ||
                    offer.description.match(/[эЭ]лектроснабжени[ея].{1,10}\d*.{1,10}[кК][вВ][аА]/ig)
                ) {
                    this.value = "да";
                }
            }
        }
    },
    availabilityOfWaterSupplySewerage: {
        value: null,
        description: "Наличие водоснабжения, канализации",
        set(offer) {
            if (typeof offer.description === "string" && offer.description.length > 9) {
                if (offer.description.match(/([вВ]озможно.{1,25}провести|установить|подключить|подключени[ея]|условие для|возможност[ьи] подключени[ея]).{1,60}(вод[ае]|водоснабжени[еяю]|водопровод[ау]?)/ig)) {
                    this.value = "нет";
                } else if (
                    offer.description.match(/[кК]оммуникации:.{1,60}(вода|водоснабжение|водопровод)/ig) ||
                    offer.description.match(/\s(вода|водоснабжение|водопровод).{1,60}(подключен[ыао]?|есть|име[юе]тся)/ig) ||
                    offer.description.match(/([кК]оммуникаци[ия])[\s:]+((.{1,80}(вода|водоснабжение))|(централизованные))/ig) ||
                    offer.description.match(/[кК]оммуникации.{1,60}подключены/ig) ||
                    offer.description.match(/([хХ]олодная|[гГ]орячая).{1,10}вода/ig) ||
                    offer.description.match(/([цЦ]ентральн(ая|ое)|[цЦ]ентрализованн(ая|ое)).{1,15}(вода|водоснабжени[ея]|водопровод)/ig) ||
                    offer.description.match(/[сС]ет[ьи].{1,30}(вода|водоснабжени[ея]|водопровод)/ig)
                ) {
                    this.value = "да";
                }
            }
        }
    },
    buildingPermit: {
        value: null,
        description: "Наличие ИРД (разрешение на строительство)",
        set(offer) {
            if (typeof offer.description === "string" && offer.description.length > 9) {
                if (offer.description.match(/(ГПЗУ по запросу|ГПЗУ при подготовке)/ig)) {
                    this.value = "по запросу или при подготовке";
                } else if (
                    offer.description.match(/(под редевелопмент|под строительство|проект реновации|проект строительства|ГПЗУ|архитектурный проект)/ig) ||
                    offer.description.match(/(получен[ыо]?|выдан[ыо]?|есть|[иИ]меется|в наличии)[\s:=.,-]+ГПЗУ/ig) ||
                    offer.description.match(/с (получе|выда)нным[\s:=.,-]+ГПЗУ/ig) ||
                    offer.description.match(/ГПЗУ на строительство/ig) ||
                    offer.description.match(/расширенное ГПЗУ/ig) ||
                    offer.description.match(/выдан.{1,25}ГПЗУ/ig) ||
                    offer.description.match(/ГПЗУ.{1,25}получен[ыо]/ig) ||
                    offer.description.match(/ГПЗУ: /ig) ||
                    offer.description.match(/градостроительн(ый|ая)\s*(план|документация)[\s,.:\\\/]/ig)
                ) {
                    this.value = "да";
                }
            }
        }
    },
    buildingPermitComments: {
        value: null,
        description: "Комментарии (Наличие ИРД)",
        set(offer) {
            if (typeof offer.description === "string" && offer.description.length > 9) {
                if (offer.description.match(/не(попадает в)? КРТ/ig)) {
                    this.value = "не попадает в зону КРТ";
                } else if (offer.description.match(/попадает.{1,50}КРТ|[кК]омплексное развитие территорий/ig)) {
                    this.value = "попадает в зону КРТ";
                }
            }
        }
    },
    territoryPlanningProject: {
        value: null,
        description: "Проект планировки территории",
        set(offer) {
            if (typeof offer.description === "string" && offer.description.length > 9) {
                if (offer.description.match(/проект.*\s[пП]ланировк[иа]?/ig)) {
                    this.value = "да";
                }
            }
        }
    },
    initialPermitDocumentation: {
        value: null,
        description: "Исходно-разрешительная документация",
        set(offer) {
            if (typeof offer.description === "string" && offer.description.length > 9) {
                if (offer.description.match(/(Получена|есть|имеется|включая|включена|присутствует|в наруках|в наличии).*разрешительная.*документ/ig)) {
                    this.value = "да";
                }
            }
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
    parseDate: {
        value: null,
        description: "Дата парсинга",
        set(offer) {
            this.value = generalOfferParse(offer).parseDate;
        }
    },
}


//| Парсер для аналога: "Земля"
export const offerLandParse = offer => {

    let bufferFields = _.cloneDeep(fields);

    Object.keys(bufferFields).forEach(key => {
        bufferFields[key].set(offer);
        delete bufferFields[key].set;
    });

    return bufferFields;
};