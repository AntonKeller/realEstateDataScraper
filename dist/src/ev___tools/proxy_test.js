const puppeteer = require("puppeteer-extra");
const extraPluginStealth = require('puppeteer-extra-plugin-stealth')();
const { executablePath } = require("puppeteer");
puppeteer.use(extraPluginStealth);
const browser_open = async (headless = false, proxy) => await puppeteer.launch({
    headless: headless,
    isMobile: true,
    executablePath: executablePath(),
    // executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    // waitForInitialPage: true,
    // slowMo: 10,
    args: [
        "--disable-setuid-sandbox",
        "--proxy-server=https=" + proxy
    ],
    // 'ignoreHTTPSErrors': true
});
(async function test_browser() {
    let list = [
        "35.247.245.218:3129",
        "35.247.245.218:3129",
        "35.247.245.218:3129",
    ];
    for (let proxy of list) {
        const browser = await browser_open(undefined, proxy);
        const page = await browser.newPage();
        await page.goto("https://2ip.ru/");
    }
    console.log("");
})();
module.exports = {
    browser_open
};
//# sourceMappingURL=proxy_test.js.map