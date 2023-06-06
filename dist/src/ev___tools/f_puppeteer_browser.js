const puppeteer = require("puppeteer-extra");
const { executablePath } = require("puppeteer");
const extraPluginStealth = require('puppeteer-extra-plugin-stealth')();
puppeteer.use(extraPluginStealth);
const browserOpen = async (headless = false) => await puppeteer.launch({
    headless: headless,
    isMobile: true,
    executablePath: executablePath(),
    // executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    // waitForInitialPage: true,
    // slowMo: 10,
    args: ["--disable-setuid-sandbox"],
    'ignoreHTTPSErrors': true
});
module.exports = {
    browserOpen
};
//# sourceMappingURL=f_puppeteer_browser.js.map