// https://www.avito.ru/moskva/garazhi_i_mashinomesta/garazh_23_m_1780663054
const moment = require('moment');


const f = str => str.replace(/\s[^\d\n\s\:A-zА-яЁё><]\s/g, "").replace(/\s\D\s\b[0-2]?[0-9]:[0-5][0-9]\b/, "");
const getDateFromString = str => {
    const keyWords = {
        ["сегодня"]: moment().format("DD/MM/YYYY"),
        ["вчера"]: moment().subtract(1, 'd').format("DD/MM/YYYY"),
        ["Января"]: "01/" + moment().format("YYYY"),
        ["Февраля"]: "02/" + moment().format("YYYY"),
        ["Марта"]: "03/" + moment().format("YYYY"),
        ["Апреля"]: "04/" + moment().format("YYYY"),
        ["Мая"]: "05/" + moment().format("YYYY"),
        ["Июня"]: "06/" + moment().format("YYYY"),
        ["Июля"]: "07/" + moment().format("YYYY"),
        ["Августа"]: "08/" + moment().format("YYYY"),
        ["Сентября"]: "09/" + moment().format("YYYY"),
        ["Октября"]: "10/" + moment().format("YYYY"),
        ["Ноября"]: "11/" + moment().format("YYYY"),
        ["Декабря"]: "12/" + moment().format("YYYY"),
    }

    return str.replace(/\s[^\d\n\s\:A-zА-яЁё><]\s/g, "")
        .replace(/\s\D\s\b[0-2]?[0-9]:[0-5][0-9]\b/, "")
        .split(" ")
        .map(
            word => {
                for (let key in keyWords) {
                    if (key.toLowerCase().indexOf(word.toLowerCase()) !== -1) return keyWords[key];
                }
                return word;
            }
        ).join(".")
        .replace(/^0+/, '')
        .replace(/\//g, '.');
}

console.log("Результат:", "\n", "\n",
    "2 февраля в 24:27", "\t->\t", getDateFromString("2 февраля в 24:27"), "\n",
    "вчера в 13:12", "\t\t->\t", getDateFromString("вчера в 13:12"), "\n",
    "сегодня в 00:00", "\t->\t", getDateFromString("сегодня в 00:00"), "\n",
    "30 марта", "\t\t->\t", getDateFromString("30 марта"),
    "\n", "7 апреля", "\t\t->\t", getDateFromString("7 апреля"),
    "\n", "8 июня", "\t\t->\t", getDateFromString("8 июня"), "\n"
);

console.log()


console.log("")
// const puppeteerBrowser = require("puppeteerBrowser-extra");
// const path = require("node:path");
// const AdblockerPlugin = require('puppeteerBrowser-extra-plugin-adblocker')
// const adblocker = AdblockerPlugin({
//     blockTrackers: true // default: false
// })
// puppeteerBrowser.use(adblocker)
// const get_browser_instance = async (headless) => await puppeteerBrowser.launch({
//     headless: headless,
//     devtools: true,
//     // isMobile: true,
//     // executablePath: executablePath(),
//     executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
//     // waitForInitialPage: true,
//     slowMo: 50,
//     args: ["--disable-setuid-sandbox"],
//     'ignoreHTTPSErrors': true
// });
//
// (async function start(){
//     const browser = await get_browser_instance(false);
//     let page = await browser.newPage();
//     await page.setViewport({width: 1920, height: 1080});
//     await page.goto("https://www.avito.ru/moskva/garazhi_i_mashinomesta/garazh_2263013184");
//
//
//
//     await page.screenshot({fullPage: true, path: `${path.resolve(__dirname)}/Test.jpeg`});
// })()