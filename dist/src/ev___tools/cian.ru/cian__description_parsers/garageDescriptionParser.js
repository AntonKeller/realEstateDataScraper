const _ = require("lodash");
//
//| структура полей, определяемых из описания (Гараж)
//
const fields = {
    _cadNumbers: {
        description: "*Кадастровые номера",
        set(txt) {
            let test = /\d{2}:\d{2}:\d{5,7}:\d{1,7}/ig;
            if (txt.match(test)) {
                this.value = txt.match(test).join(", ");
            }
        },
    },
    _dealType: {
        description: "*Тип сделки",
        set(txt) {
            let reg_1 = new RegExp("\\sаренда\\s", "ig"); //| - аренда
            let reg_2 = new RegExp("\\sпродажа\\s", "ig"); //| - продажа
            if (reg_1.test(txt) &&
                !reg_2.test(txt)) {
                this.value = "аренда";
            }
            else if (!reg_1.test(txt) &&
                reg_2.test(txt)) {
                this.value = "продажа";
            }
        }
    },
    _isGarageBox: {
        description: "*гаражный бокс",
        set(txt) {
            let reg = new RegExp("аражный бокс", "ig"); //| - гаражный бокс
            if (reg.test(txt)) {
                this.value = "да";
            }
        }
    },
    _garageLevel: {
        description: "*уровень гаража",
        set(txt) {
            let test = /(\d+)[а-яА-Я,.:=\s]{1,10} уровневый/ig;
            if (txt.match(test)) {
                this.value = parseInt(txt.match(/(\d+)/ig).toString());
            }
        }
    },
    _garageType: {
        description: "*тип гаража",
        set(txt) {
            let test_1 = /[гГ]араж.{1,60}металлический|[мМ]еталлический.{1,30}гараж/ig;
            let test_2 = /[гГ]араж.{1,60}кирпичный|[кК]ирпичный.{1,30}гараж|гараж.{1,20}из.{1,20}кирпича/ig;
            let test_3 = /железобетонный|в железобетонном исполнении|из железобетона/ig;
            if (txt.match(test_1) && !txt.match(test_2)) {
                this.value = "металлический";
            }
            else if (!txt.match(test_1) && txt.match(test_2)) {
                this.value = "кирпичный";
            }
            else if (!txt.match(test_1) && !txt.match(test_2) && txt.match(test_3)) {
                this.value = "железобетонный";
            }
        }
    },
    _viewingHole: {
        description: "*наличие смотровой ямы",
        set(txt) {
            let _test_1 = /Смотровой ямы нет|Ямы нет/ig;
            let test_1 = /\s[яЯ]м[ыа]/ig;
            if (txt.match(_test_1)) {
                this.value = "нет";
            }
            else if (!txt.match(_test_1) && txt.match(test_1)) {
                this.value = "да";
            }
        }
    },
    _centralHeating: {
        description: "*Наличие центрального отопления",
        set(txt) {
            let test_1 = / /ig;
            let test_2 = / /ig;
        }
    },
    _basement: {
        description: "*наличие подвала",
        set(txt) {
            let _test_1 = /без подвала/ig;
            let test_1 = /[сС] подвалом|,.{1,15}подвал.{1,15},|[еЕ]?сть подвал/ig;
            let test_2 = /и подвал|[сС]ухой подвал|иИмеется подвал/ig;
            let test_3 = /,.{1,10}подвал.{1,10}\.|подвальное помещение/ig;
            let test_4 = /(.{1,15}[пП]одвал.{1,15})|[иИ]меется.{1,30}подвал/ig;
            let test_5 = /подвал.{1,10}\d.{1,6}кв|\+подвал|[пП]одвал в.{1,10}\d.{1,6}этажа/ig;
            let test_6 = /[пП]одвал в.{1,10}\d.{1,6}метров|[пП]одвал в.{1,10}\d.{1,6}кв\.м|[пП]одвал[.,+]/ig;
            if (txt.match(_test_1)) {
                this.value = "нет";
            }
            else if (txt.match(test_1) || txt.match(test_2) || txt.match(test_3) ||
                txt.match(test_4) || txt.match(test_5) || txt.match(test_6)) {
                this.value = "да";
            }
        }
    },
    _garageProperties: {
        description: "*свойства гаража",
        set(txt) {
            let test_1 = /гараж.{1,20}утепленный/ig; //| гараж утепленный
            if (txt.match(test_1)) {
                this.value = "утепленный";
            }
        }
    },
    _presenceOfSecurity: {
        description: "*наличие охраны",
        set(txt) {
            let test_1 = /охрана/ig;
            let test_2 = /круглосуточная охрана/ig;
            if (txt.match(test_1) || txt.match(test_2)) {
                this.value = "да";
            }
        }
    },
    _availabilityOfElectricity: {
        description: "*наличие электричества",
        set(txt) {
            let test_1 = /электричество|электроснабжение|электропроводка|электросчетчик/ig;
            if (txt.match(test_1)) {
                this.value = "да";
            }
        }
    },
    _availabilityOfWaterSupplySewerage: {
        description: "*наличие водоснабжения",
        set(txt) {
            let test_1 = /([вВ] гараже есть|[еЕ]сть все коммуникации|[цЦ]ентральное отопление|[пП]роведено).{1,30}вода/ig;
            if (txt.match(test_1)) {
                this.value = "да";
            }
        }
    },
    _presenceOfVideoSurveillance: {
        description: "*наличие видеонаблюдения",
        set(txt) {
            let test_1 = /видеонаблюдение/ig;
            if (txt.match(test_1)) {
                this.value = "да";
            }
        }
    },
    _price: {
        description: "*цена, руб.",
        set(txt) {
            let test_1 = /([цЦ]ена|[сС]тоимость).{1,10}(\d+(\s?\d*)*([.,]\d+)?).{1,10}(тысяч)? руб/ig;
            let test_2 = /\d+(\s?\d*)*([.,]\d+)?/ig;
            if (txt.match(test_1)) {
                this.value = parseFloat(txt.match(test_2).toString());
            }
        }
    },
    _dealComments: {
        description: "*Комментарии к сделке",
        set(txt) {
        }
    },
    _distanceTo: {
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
        }
    },
};
//
//| гаражи
//
const garageDescriptionParse = (text) => {
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
    garageDescriptionParse,
    garageDescriptionFields: Object.values(fields),
};
//# sourceMappingURL=garageDescriptionParser.js.map