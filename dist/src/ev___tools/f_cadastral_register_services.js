const { browserOpen } = require("./f_puppeteer_browser");
const _ = require("lodash");
const general_structure = {
    type: {
        value: null,
        desc: "вид",
        pattern: /Тип/,
    },
    cadastralNumber: {
        value: null,
        desc: "Кадастровый номер",
        pattern: /Кад\. номер/,
    },
    cadastralQuarter: {
        value: null,
        desc: "Кадастровый квартал",
        pattern: /Кад\. квартал/ig,
    },
    address: {
        value: null,
        desc: "Адрес",
        pattern: /Адрес/ig,
    },
    areaType: {
        value: "кв.м",
        desc: "Единица измерения площади",
        pattern: /Единица измерения площади/ig,
    },
    area: {
        value: null,
        set(v) {
            if (typeof v === "string") {
                let res = v.match(/(\d+\s?(\d*){0,5}[.,]?\d{0,3})\s?/);
                if (res) {
                    this.value = res[0];
                }
            }
        },
        desc: "Площадь",
        pattern: /Площадь/ig,
    },
    category: {
        value: null,
        desc: "Категория земель",
        pattern: /Категория земель/ig,
    },
    permittedUse: {
        value: null,
        desc: "Разрешенное использование",
        pattern: /Разрешенное использование/ig,
    },
    typeOfOwnership: {
        value: null,
        desc: "Форма собственности",
        pattern: /Форма собственности/ig,
    },
    cadastralPrice: {
        value: null,
        set(v) {
            if (typeof v === "string") {
                let b = v.replace(/,/g, "").match(/(\d+\s?(\d*){0,5}[.,]?\d{0,3})\s?/);
                if (b) {
                    this.value = b[0];
                }
            }
        },
        desc: "Кадастровая стоимость",
        pattern: /Кад. стоимость/ig,
    },
    dateOfDetermination: {
        value: null,
        desc: "Дата определения",
        pattern: /Обновление от/ig,
    },
    approvalDate: {
        value: null,
        desc: "дата утверждения",
        pattern: /дата утверждения/ig,
    },
    dateOfEntry: {
        value: null,
        desc: "дата внесения сведений",
        pattern: /дата внесения сведений/ig,
    },
    appliedDate: {
        value: null,
        desc: "Постановлен на учёт",
        pattern: /Постановлен на учёт/ig,
    },
    byDocuments: {
        value: null,
        desc: "По документам",
        pattern: /По документам\./ig,
    },
    arrestOrBail: {
        value: null,
        desc: "Арест, залог и т.д.",
        pattern: /Арест, залог и т\.д./ig,
    },
    status: {
        value: null,
        desc: "Статус",
        pattern: /Статус/ig,
    },
};
//| В качестве параметров принимает:
//|     - адрес | координаты | кадастровый номер
//| возвращает информацию об объекте.
//|
const search_by_cadastral_map = async (cadNumber) => {
    const structure = _.cloneDeep(general_structure);
    if (cadNumber &&
        typeof cadNumber === "string" &&
        cadNumber.match(/(\d{1,2}:\d{1,2}:\d{1,8}:)0*([1-9]+\d*)/)) {
        const baseUrl = "https://pkk.kartagov.net/karta/";
        const url = baseUrl + cadNumber.replace(/:/g, "-");
        let browser = await browserOpen(true);
        let page = await browser.newPage();
        try {
            await page.goto(url, { waitUntil: "load", timeout: 20000 });
            let hTest = await page.$("._info > .__table tr");
            if (hTest) {
                let elements = await page.$$eval("._info > .__table tr", rows => {
                    return rows.map(row => {
                        let columns = row.querySelectorAll("td");
                        if (columns && Object.keys(columns).length === 2) {
                            return {
                                description: columns[0].textContent,
                                value: columns[1].textContent,
                            };
                        }
                        return {};
                    });
                });
                if (elements && Array.isArray(elements) && elements.length > 0) {
                    Object.keys(structure).forEach(key => {
                        let pattern = structure[key].pattern;
                        elements.forEach(el => {
                            if (el.description.match(pattern)) {
                                if (structure[key].hasOwnProperty("set")) {
                                    structure[key].set(el.value);
                                }
                                else {
                                    structure[key].value = el.value;
                                }
                            }
                        });
                    });
                }
            }
            await page.close();
            await browser.close();
        }
        catch (err) {
            console.log("ошибка");
            await page.close();
            await browser.close();
            return structure;
        }
    }
    return structure;
};
// (async function test.json() {
//     let array = await search_by_cadastral_map_2("77:04:0004015:6830");
//     console.log("")
// })();
module.exports = {
    search_by_cadastral_map,
};
//# sourceMappingURL=f_cadastral_register_services.js.map