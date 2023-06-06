const {browser_open} = require("../puppeteerBrowser/f_puppeteer_browser.js");

const MAX_SIZE = 2020;

const send_message = async text => {
    const browser = await browser_open(true);
    const page = await browser.newPage();
    const URL = "https://chatgptproxy.me/#/";
    await page.goto(URL, {waitUntil: "networkidle0"});
    let handle = await page.$(".el-textarea__inner");
    console.log("Запрос chat gpt.");
    if (handle) {
        await handle.focus();
        await page.evaluate((selector, value) => selector.value = value, handle, text.slice(0, MAX_SIZE))
        await page.keyboard.type(" ");
        let btn_handle = await page.$(".el-icon-s-promotion");
        await page.evaluate(b => b.click(), btn_handle);
        await page.waitForNetworkIdle({idleTime: 2500, timeout: 120000});
    }

    let answers = await page.$$eval(".chatList > .chatLi:last-child .v-show-content li", answers => {
        return answers.map(answer => answer.textContent);
    });

    if (!answers || answers.length <= 0) {
        answers = await page.$$eval(".chatList > .chatLi:last-child .v-show-content p", answers => {
            return answers.map(answer => answer.textContent);
        });
    }

    await page.close();
    await browser.close();
    return answers;
}

// (async function test.json() {
//     let text = "расскажи сказку";
//     console.log("Жду ответа...\n");
//     let answers = await send_message(text.slice(0, MAX_SIZE));
//     console.log(answers);
// })()

module.exports = {
    send_message,
}

