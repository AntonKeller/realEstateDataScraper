const fs = require("fs");
const { browser_open } = require("../../../ev___tools/f_puppeteer_browser_without_advertising");
const { save_complex_array } = require("../../../ev___tools/f_excel");
//| Определяет род Списка слов.
//|
(async function define() {
    let url = "https://tamali.net/instrument/text/rod-slova/";
    const path = "buffer.json";
    let data;
    if (fs.existsSync(path)) {
        data = JSON.parse(String(fs.readFileSync(path)));
        const browser = await browser_open();
        const page = await browser.newPage();
        let counter = 0;
        let saveCounter = 0;
        try {
            await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
        }
        catch (err) {
            console.log("не дождавшись зашел на главную", err);
        }
        for (let i = 0; i < data.length; i++) {
            let element = data[i];
            let localTime = performance.now();
            if (element &&
                Array.isArray(element) &&
                element.toString().length > 12 &&
                element.length < 8 &&
                element[0]) {
                let word = element[0];
                let inputHandle = await page.$("input[name=val]");
                if (inputHandle) {
                    await page.evaluate((selector, value) => selector.value = value, inputHandle, word);
                    let buttonHandle = await page.$(".block-service button");
                    await buttonHandle.click();
                    try {
                        await page.waitForNetworkIdle({ idleTime: 10, timeout: 1500 });
                    }
                    catch (err) {
                        console.log("не дождавшись, парсим", err);
                    }
                    let resultHandle = await page.$("#result");
                    let textFromPage = await page.evaluate(el => el.textContent, resultHandle);
                    console.log(textFromPage);
                    let haveWordMan = (textFromPage.toLowerCase().indexOf("мужского") !== -1 || textFromPage.toLowerCase().indexOf("мужско") !== -1);
                    let haveWordWoman = (textFromPage.toLowerCase().indexOf("женского") !== -1 || textFromPage.toLowerCase().indexOf("женск") !== -1);
                    let itsMan = haveWordMan && !haveWordWoman;
                    let itsWoman = !haveWordMan && haveWordWoman;
                    let its = (!haveWordMan && !haveWordWoman) || (haveWordMan && haveWordWoman);
                    console.log("определился как мужского рода:\t", itsMan, "\n", "определился как женского рода:\t", itsWoman, "\n", "неопределенный род:\t", its, "\n");
                    let genus = itsMan ? "мужской род" : itsWoman ? "женский" : "неопределенный род";
                    data[i] = [...data[i], genus];
                    //| saving ....
                    if (++saveCounter > 500) {
                        fs.writeFileSync(path, JSON.stringify(data));
                        console.log("saving .....");
                    }
                }
                else {
                    console.log("Не нашел поле для ввода.");
                }
            }
            console.log("progress....", ++counter, "/", data.length, "\ttime:", Math.floor(performance.now() - localTime));
        }
        await page.close();
        await browser.close();
        await save_complex_array("result.xlsx", "sheet", data);
    }
    else {
        console.log("Обрабатываемый фалй пуст.");
    }
})();
//# sourceMappingURL=define_genus.js.map