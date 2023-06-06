const browserObject = require("../browser");
const {ExcelWriter} = require("../../src/ev___tools/excel/ExcelWriter.js");
const process = require("process");
const path = require("node:path");

(async function a() {

    let URL = "https://zavodkranov.ru/kran-mostovoj/opornyj-dvuhbalochnyj-10t/";
    let browserInstance = await browserObject.startBrowser();
    let browser = await browserInstance;

    let page = await browser.newPage();
    await page.goto(URL);
    await page.waitForSelector("body");

    let loadCapacity = await page.$$eval("ul > li > span.price > span", links => {
        return links.map(link => {

            let price = link.querySelector("span");

            return {
                wei: `${link.className.trim().split("x")[0]} тн.`,
                wid: `${link.className.trim().split("x")[1]} м.`,
                price: price.textContent.replace(/[^0-9]/g, "").trim() || "по запросу",
            }
        })
    });

    let offersTemplateForExcel = {
        sheetName: "Выгрузка",
        columnsKeys: [{key: "wei"}, {key: "wid"}, {key: "price"}],
        columnsDesc: ["Грузоподъемность", "Пролет", "Цена"],
        rowsData: loadCapacity,
    }

    await ExcelWriter.writeInExcelX([offersTemplateForExcel], `ZavodCranovData.xlsx`);

    //------------------------------------------------------------------------------------------------------------------
    // скришоты всех вариантов
    //------------------------------------------------------------------------------------------------------------------


    let weightElemenets = await page.$$eval("div.properties_table > ul > li.gryz_id", links => links.map(link => link.getAttribute("data_source-toggler")));
    let widthElements = await page.$$eval("div.properties_table > ul > li.prolet_id", links => links.map(link => link.getAttribute("data_source-toggler")));

    let count = 1;

    await page.setViewport({
        width: 1100,
        height: 1000,
        deviceScaleFactor: 1
    });

    for (let i = 1; i <= weightElemenets.length; i++) {

        await page.waitForSelector("div.properties_table > ul > li.gryz_id");
        await page.click(`div.properties_table > ul > li.gryz_id:nth-child(${i})`);

        for (let j = 1; j <= widthElements.length; j++) {

            await page.waitForSelector("div.properties_table > ul > li.prolet_id");
            await page.click(`div.properties_table > ul > li.prolet_id:nth-child(${j})`);

            await page.screenshot({
                // quality: 100, //Качество изображения
                // fullPage: true,
                clip: {
                    'x': 0,
                    'y': 0,
                    'width': 1150,
                    'height': 950,
                },
                path: `${path.resolve(__dirname)}/images/img_${count}.jpeg`,
            });

            console.log(`загружено ${count}/${weightElemenets.length * widthElements.length}`);
            count++;

        }
    }


    // for (let togglerNum of screenElements) {
    //
    //     let nodes = await page.$$eval("div.properties_table > ul > li.gryz_id", links => {
    //         links.map()
    //     })
    //
    //
    // }

    // screenElements.map(el => {
    //     el.click();
    // });


    // {
    //     return links.map(link => {
    //
    //         let price = link.querySelector("span");
    //
    //         return {
    //             wei: `${link.className.trim().split("x")[0]} тн.`,
    //             wid: `${link.className.trim().split("x")[1]} м.`,
    //             price: price.textContent.replace(/[^0-9]/g, "").trim() || "по запросу",
    //         }
    //     })
    // });

    await page.close();

    process.exit();
}())
