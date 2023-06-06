const _ = require("lodash");
//| хранилище функций парсинга описаний объявлений недвижимого имущества разного типа:
//
//| структура полей, определяемых из описания (Участок земли)
//
const fields = {
    _dealComments: {
        description: "*Тип сделки",
        set(txt) {
            let test_1 = /продажа.{1,15}торги|аукцион/ig;
            if (txt.match(test_1)) {
                this.value = "аукцион";
            }
        },
    },
    _lotCategory: {
        description: "*Категория земель",
        set(txt) {
            if (txt.match(/[зЗ]емли населенных пунктов/ig)) {
                this.value = "земли населенных пунктов";
            }
        },
    },
    _totalLandArea: {
        description: "*Площадь участка, кв.м",
        set(txt) {
            let pattern_ga = /([пП]родается земельный участок|земельных участках площадью) (площадью)?.{1,30}\d+(\s?\d*)*([.,]\d+)?га/ig;
            let pattern_kvm = /([пП]родается земельный участок|земельных участках площадью) (площадью)?.{1,30}\d+(\s?\d*)*([.,]\d+)?\s?(кв\.?м\.?|м²|квм)/ig;
            if (txt.match(pattern_ga)) {
                let found = txt.match(pattern_ga).toString().match(/\d+(\s?\d*)*([.,]\d+)?/ig);
                if (found) {
                    let number = found.toString().replace(/\s+/ig, "").replace(/,/ig, ".");
                    this.value = parseFloat(number) * 10000;
                }
            }
            else if (txt.match(pattern_kvm)) {
                let found = txt.match(pattern_kvm).toString().match(/\d+(\s?\d*)*([.,]\d+)?/ig);
                if (found) {
                    let number = found.toString().replace(/\s+/ig, "").replace(/,/ig, ".");
                    this.value = parseFloat(number);
                }
            }
        },
    },
    _buildingPermit: {
        description: "*Наличие ИРД (разрешение на строительство)",
        set(txt) {
            let dontHave = new RegExp(/(ГПЗУ по запросу|ГПЗУ при подготовке)/, "ig");
            let have = [
                /(под редевелопмент|под строительство|проект реновации|проект строительства|ГПЗУ|архитектурный проект)/,
                /([пП]олучен[ыо]?|[вВ]ыдан[ыо]?|[еЕ]сть|[иИ]меется|в наличии)[\s:=.,-]+ГПЗУ/,
                /[сС] (получе|выда)нным[\s:=.,-]+ГПЗУ/,
                /ГПЗУ на строительство/,
                /[рР]асширенное ГПЗУ/,
                /[вВ]ыдан.{1,25}ГПЗУ/,
                /ГПЗУ.{1,25}получен[ыо]/,
                /ГПЗУ: /,
                /[гГ]радостроительн(ый|ая)\s*(план|документация)[\s,.:\\\/]/,
            ];
            //| проверяем отсутствие документации
            if (dontHave.test(txt)) {
                this.value = "по запросу или при подготовке";
            }
            else { //| проверяем наличие документации
                have = have.map(el => new RegExp(el, "ig"));
                for (let i = 0; i < have.length; i++) {
                    let reg = have[i];
                    if (reg.test(txt)) {
                        this.value = "да";
                    }
                }
            }
        }
    },
    _buildingPermitComments: {
        //| *КРТ, или комплексное развитие территорий
        description: "*Комментарии",
        set(txt) {
            let test_1 = /не(попадает в)? КРТ/ig;
            let test_2 = /попадает.{1,50}КРТ|[кК]омплексное развитие территорий/ig;
            if (txt.match(test_1)) {
                this.value = "не попадает в зону КРТ";
            }
            else if (txt.match(test_2)) {
                this.value = "попадает в зону КРТ";
            }
        },
    },
    _permittedUse: {
        description: "*ВРИ",
        set(txt) {
            //| Провести вторичную обработку ВРИ
            let test_x = /ВРИ.*\n/ig;
            if (txt.match(test_x)) {
                this.value = txt.match(test_x).toString().replace(/(ВРИ|:)/ig, "");
            }
            // let test_1 = /ВРИ[\s;:=-]+(\d([.,]?\d{1,2}){1,4}[\s,]{0,2})+/ig;
            // let test_2 = /вид(ов)? разрешенного использования[\s;:=-]+.{1,20}(\d([.,]?\d{1,2}){1,4}[\s,]{0,2})+/ig;
            // let match_1 = txt.match(test_1) ? txt.match(test_1).join(", ") : "";
            // let match_2 = txt.match(test_2) ? txt.match(test_2).join(", ") : "";
            // let match = match_1 + match_2;
            // this.value = match.replace(/[а-я:=]+/ig, "").replace(/\s+/ig, " ").trim();
        },
    },
    _theCompositionOfTheTransferredRights: {
        //
        description: "*Состав передаваемых прав",
        set(txt) {
            let buff = txt.match(/(([вВ]ид|[тТ]ип)[а-яА-Я:\s=-]*([пП]рав[оа])[а-яА-Я:\s=-]*собственность)|(([вВ]ид|[тТ]ип)[а-яА-Я:\s=-]*([пП]рав[оа])[а-яА-Я:\s=-]*аренда)/ig);
            if (buff) {
                if (buff.toString().toLowerCase().indexOf("собственность")) {
                    this.value = "собственность";
                }
                else if (buff.toString().toLowerCase().indexOf("аренда")) {
                    this.value = "аренда";
                }
            }
        },
    },
    _totalBuildingArea: {
        description: "*Площадь зданий на участке, кв.м",
        set(txt) {
            let pattern_1 = /(([сС]троения|[кК]омплекс зданий|[кК]омплекс|здани[яй]|Комплекс представляет собой|Комплекс состоит из).{0,80}(общей|суммарн(ая|ой)) площадью)[\s:=_-]*(\d+(\s?\d*)*([.,]\d+)?)\s*([кК][вВ]\.?\s?[мМ]\.?|[гГ][аА]\.?|[мМ]²)/ig;
            let found = txt.match(pattern_1);
            if (found) {
                let value_ga;
                let full_ga = found.toString().match(/[\s:=_-]*(\d+(\s?\d*)*([.,]\d+)?)\s*([гГ][аА]\.?)/ig);
                if (full_ga) {
                    let free_ga = full_ga.toString().match(/(\d+(\s?\d*)*([.,]\d+)?)/ig);
                    if (free_ga) {
                        value_ga = parseFloat(free_ga[0].replace(/\s+/ig, "")) * 10000;
                    }
                }
                let value_kvm;
                let full_kvm = found.toString().match(/[\s:=_-]*(\d+(\s?\d*)*([.,]\d+)?)\s*([кК][вВ]\.?\s?[мМ]\.?|[мМ]²)/ig);
                if (full_kvm) {
                    let free_ga = full_kvm.toString().match(/(\d+(\s?\d*)*([.,]\d+)?)/ig);
                    if (free_ga) {
                        value_kvm = parseFloat(free_ga[0].replace(/\s+/ig, ""));
                    }
                }
                if (value_ga && !value_kvm) {
                    this.value = value_ga;
                }
                else if (!value_ga && value_kvm) {
                    this.value = value_kvm;
                }
                else if (value_ga && value_kvm) {
                    this.value = value_kvm;
                }
            }
        },
    },
    _buildingDensity: {
        description: "*Плотность застройки, кв.м",
        set(txt) {
            let found = txt.match(/(плотность)\s([а-яА-Я]+[\s,:-]+){0,5}\d+(\s?\d*)*([.,]\d+)?(м[\/.]м[\/.]?|кв\.м\.|м²)/ig);
            if (found) {
                let matchNumbers = found.toString().match(/\d+(\s?\d*)*([.,]\d+)?/ig);
                if (matchNumbers) {
                    let number = matchNumbers.toString()
                        .replace(/\s+/, "")
                        .replace(/,/, ".");
                    this.value = parseFloat(number);
                }
            }
        },
    },
    _cadNumbers: {
        description: "*Кадастровые номера",
        set(txt) {
            let test = /\d{2}:\d{2}:\d{5,7}:\d{1,7}/ig;
            if (txt.match(test)) {
                this.value = txt.match(test).join(", ");
            }
        },
    },
    _presenceOfBuildingsStructuresForDemolition: {
        description: "*Наличие зданий/строений под снос",
        set(txt) {
            let pattern = /(аварийное|состояние)\s(состояние|аварийное)/ig;
            if (txt.match(pattern)) {
                this.value = "да";
            }
        },
    },
    _availabilityOfFreeAccessToTheSite: {
        description: "*Наличие свободного подъезда к участку",
        set(txt) {
            let test_1 = /участие в.{1,50}\sподъезд[оаы,.\s-]/ig;
            let test_2 = /озможн.{1,50}\sподъезд[оаы,.\s-]/ig;
            let test_3 = /\sподъезд/ig;
            if (txt.match(test_1) && txt.match(test_2)) {
                this.value = "нет";
            }
            else if (!txt.match(test_1) && !txt.match(test_2) && txt.match(test_3)) {
                this.value = "да";
            }
        },
    },
    _distanceToCity: {
        description: "*Расстояние до (города/метро/жд/шоссе...)",
        set(txt) {
            let test_1 = /(\d+)\s+(км|м)\s+(до|от|в сторону)\s.{1,20}(города|центра|мкад|шоссе|села|поселка|развилки|развязки|метро|станции|ж\/д)/ig;
            let test_2 = /\d+.{1,10}метрах.{1,10}(от.{1,20}трассы|от.{1,20}станции|от.{1,20}реки|от.{1,20}базы)/ig;
            if (txt.match(test_1)) {
                this.value = txt.match(test_1).toString();
            }
            else if (txt.match(test_2)) {
                this.value = txt.match(test_2).toString();
            }
        },
    },
    _availabilityOfGasSupply: {
        description: "*Наличие газоснабжения",
        set(txt) {
            let _test_1 = /развитие газообеспечение|возможна газификация|работа.{1,10}по.{1,10}протягиванию.{1,25}газа|Газ.{1,35}с возможностью подключения|[тТ]очки подключения [гГ]азоснабжения|возможности присоединения.{1,100}газ|нет газа|отсутствует газ/ig;
            let test_1 = /[гГ]азоснабжение|[гГ]азовая котельная|[гГ]азовая подстанция|[гГ]аз (по|на) границе|[гГ]азопроводы?|[кК]оммуникаци(и|ями)[\s:=-]+.{1,150}газ[\s.,]|Межрегионгаз|Мосгаз|Газпром/ig;
            let test_2 = /[гГ]аз высокого давления|[мМ]агистральный газ|[еЕ]сть газ|[гГ]аз.{1,15}\d+(\s?\d*)*([.,]\d+)?метр|имеются коммуникации.{1,65}газ|все коммуникации:.{1,65}газ|заведено.{1,65}газ/ig;
            if (txt.match(_test_1)) {
                this.value = "нет";
            }
            else if (txt.match(test_1) && txt.match(test_2)) {
                this.value = "да";
            }
        },
    },
    _availabilityOfPowerSupply: {
        description: "*Наличие электроснабжения",
        set(txt) {
            let _test_1 = /([вВ]озможно.{1,20}подключени[ея]|условие для|возможност[ьи] подключени[ея]).{1,60}(электросет(ям|и|ей)|электричеств[оау]|электроэнергии|эл-гии|эл-ии|эл-во|[эЭ]лектро сет(ям|и|ей))/ig;
            let test_2 = /([эЭ]лектричество|сети|[эЭ]лектроэнергия).{1,10}\d+(\s?\d*)*([.,]\d+)?.{1,5}[кК][вВ][тТ]/ig;
            let test_3 = /([эЭ]лектричество|сети|[эЭ]лектроэнергия).{1,10}\d+(\s?\d*)*([.,]\d+)?.{1,5}[кК][вВ][тТ]/ig;
            let test_4 = /([пП]одведен[оы]|[зЗ]аведен[оы]|имеется) ([эЭ]лектричество|[эЭ]л-во)/ig;
            let test_5 = /есть доступ к электроэнергии/ig;
            let test_6 = /([эЭ]лектрическая мощность|[оО]бщая мощность|[мМ]ощность электричества|[зЗ]аведено электричество с мощностью|[эЭ]лектроэнергия|[вВ]ыделенная мощность|[вВ]ыделенная лектрическая мощность|[еЕ]диновременная мощность)[\s,]*(разрешенная мощность|\(РУ\)|электроснабжения)?([а-яА-Я)(]*)([\s:=-]*)(\d+(\s?\d*)*[.,]?\d*\s?[кКмМгГ][вВ][тТ])/ig;
            if (txt.match(_test_1)) {
                this.value = "нет";
            }
            else if (txt.match(test_2) || txt.match(test_3) ||
                txt.match(test_4) || txt.match(test_5) ||
                txt.match(test_6)) {
                this.value = "да";
            }
        },
    },
    _availabilityOfWaterSupplySewerage: {
        description: "*Наличие водоснабжения, канализации",
        set(txt) {
            let _test_1 = /([вВ]озможно.{1,25}провести|установить|подключить|подключени[ея]|условие для|возможност[ьи] подключени[ея]).{1,60}(вод[ае]|водоснабжени[еяю]|водопровод(а|у)?)/ig;
            let test_1 = /[кК]оммуникации:.{1,60}(вода|водоснабжение|водопровод)/ig;
            let test_2 = /\s(вода|водоснабжение|водопровод).{1,60}(подключен[ыао]?|есть|име[юе]тся)/ig;
            let test_3 = /([кК]оммуникаци[ия])[\s:]+((.{1,80}(вода|водоснабжение))|(централизованные))/ig;
            let test_4 = /[кК]оммуникации.{1,60}подключены/ig;
            let test_5 = /([хХ]олодная|[гГ]орячая).{1,10}вода/ig;
            let test_6 = /([цЦ]ентральн(ая|ое)|[цЦ]ентрализованн(ая|ое)).{1,15}(вода|водоснабжени[ея]|водопровод)/ig;
            let test_7 = /[сС]ет[ьи].{1,30}(вода|водоснабжени[ея]|водопровод)/ig;
            if (txt.match(_test_1)) {
                this.value = "нет";
            }
            else if (txt.match(test_1) || txt.match(test_2) || txt.match(test_3) ||
                txt.match(test_4) || txt.match(test_5) || txt.match(test_6) ||
                txt.match(test_7)) {
                this.value = "да";
            }
        },
    },
    _numberOfElevators: {
        description: "*Кол-во лифтов",
        set(txt) {
            let buff = txt.match(/[лЛ]ифты[:\s]+\d+[\s=:-]*(груз|шт\.)?([\s+,и]+\d\s?пасс)?/ig);
            if (buff) {
                if (buff.toString().match(/\d+(\s?\d*)*([.,]\d+)?/ig)) {
                    this.value = buff.toString().match(/\d+(\s?\d*)*([.,]\d+)?/ig).reduce((prev, curr) => String(parseInt(prev) + parseInt(curr)));
                }
            }
        },
    },
    _territoryPlanningProject: {
        description: "*Проект планировки территории",
        set(txt) {
            // let test.json = /утвержд.{1,45}планировк/ig;
            // if (txt.match(test.json)) {
            //     this.value = "да"
            // }
        },
    },
    _initialPermitDocumentation: {
        description: "*Исходно-разрешительная документация",
        set(txt) {
        },
    },
    _areaOfBuildingsForDemolition: {
        description: "*Площадь строений под снос, кв.м",
        set(txt) {
        },
    },
};
const landDescriptionParse = (text) => {
    const buffer = _.cloneDeep(fields);
    Object.keys(buffer).forEach(key => {
        try {
            buffer[key].set(text);
        }
        catch (err) {
            console.log("key error:", key, err);
        }
    });
    return buffer;
};
module.exports = {
    landDescriptionParse,
    landDescriptionFields: Object.values(fields),
};
//# sourceMappingURL=landDescriptionParser.js.map