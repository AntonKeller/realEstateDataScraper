// playwright-extra is a drop-in replacement for playwright,
// it augments the installed playwright with plugin functionality
const {chromium} = require('playwright-extra')

// Load the stealth plugin and use defaults (all tricks to hide playwright usage)
// Note: playwright-extra is compatible with most puppeteerBrowser-extra plugins
const stealth = require('puppeteer-extra-plugin-stealth')()

// Add the plugin to playwright (any number of plugins can be added)
chromium.use(stealth)

// That's it, the rest is playwright usage as normal 😊
chromium.launch({headless: false})
    .then(async browser => {
        const page = await browser.newPage()

        console.log('Testing the stealth plugin..')
        await page.goto('https://bot.sannysoft.com', {waitUntil: 'networkidle'})
        await page.screenshot({path: 'stealth.png', fullPage: true})

        console.log('All done, check the screenshot. ✨');
        // await browser.close()
    })


// https://bot.sannysoft.com/