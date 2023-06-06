import puppeteer from "puppeteer-extra"
import {executablePath} from "puppeteer"
import extraPluginStealth from "puppeteer-extra-plugin-stealth";

puppeteer.use(extraPluginStealth());

export const openBrowser = async (headless = false) => await puppeteer.launch({
    headless: headless,
    isMobile: true,
    executablePath: executablePath(),
    args: ["--disable-setuid-sandbox"],
    "ignoreHTTPSErrors": true
    // executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});