const { browser_open } = require("../ev___tools/f_puppeteer_browser_without_advertising");
const startScreener = async (path, links) => {
    let browser = await browser_open();
    let page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 2,
    });
    for (let el of links) {
        console.log("screening...", el.id, "/", links.length);
        await page.goto(el.url, { waitUntil: "networkidle2" });
        let bannerHandle = await page.$("#adfox-stretch-banner");
        if (bannerHandle) {
            await page.evaluate(selector => selector.style.display = "none", bannerHandle);
        }
        let listRemove = [
            "div[data-name=HintQuestions]",
            "div[data-name=ContactsMain]",
            "div.a10a3f92e9--root--LC3rJ",
            "div[data-name=AsideBanners]",
            "div[data-name=AsideBanners]",
            "div[data-name=AgencyBrandingAsideCardComponent]",
            "div[data-name=MortgageCalculator]",
            "div[data-name=OfferValuationContainerLoader]",
            "div[data-name=OfferHistory]",
            "div.a10a3f92e9--offer_card_page-footer--OEhmX",
            "#adfox-stretch-banner",
            "div[data-name=CardSectionNew]",
            // "div[data-name=CardSection]",
        ];
        for (let el of listRemove) {
            let elHandles = await page.$$(el);
            if (elHandles && Array.isArray(elHandles)) {
                for (let handle of elHandles) {
                    await page.evaluate(sel => {
                        sel.style.display = "none";
                    }, handle);
                }
            }
        }
        await page.screenshot({
            path: path + el.id + "_s1_.jpeg",
            clip: {
                x: 200,
                y: 0,
                width: 1720,
                height: 1200
            },
            // captureBeyondViewport: true,
            // omitBackground: true,
            quality: 100,
        });
        let sectionMapSelector = "section[data-name=NewbuildingMapWrapper]";
        let handleSectionMapSelector = await page.$(sectionMapSelector);
        if (handleSectionMapSelector) {
            let coordinateX = await page.evaluate(sel => sel.offsetTop, handleSectionMapSelector);
            await page.screenshot({
                path: path + el.id + "_s2_.jpeg",
                clip: {
                    x: 200,
                    y: coordinateX - 20,
                    width: 1720,
                    height: 1200
                },
                // captureBeyondViewport: true,
                // omitBackground: true,
                quality: 100,
            });
        }
    }
    await page.close();
    await browser.close();
};
module.exports = {
    startScreener,
};
//# sourceMappingURL=screenshot_manager.js.map