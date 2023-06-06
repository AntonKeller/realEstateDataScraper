const puppeteer = require("puppeteer-extra");
const extraPluginStealth = require('puppeteer-extra-plugin-stealth')();
const { DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } = require('puppeteer');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
const adblocker = AdblockerPlugin({
    blockTrackers: true // default: false
});
puppeteer.use(extraPluginStealth);
puppeteer.use(adblocker);
const browser_open = async (headless = false) => await puppeteer.launch({
    headless: headless,
    isMobile: true,
    // executablePath: executablePath(),
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    // waitForInitialPage: true,
    // slowMo: 10,
    args: ["--disable-setuid-sandbox"],
    'ignoreHTTPSErrors': true
});
module.exports = {
    browser_open
};
//# sourceMappingURL=f_puppeteer_browser_without_advertising.js.map