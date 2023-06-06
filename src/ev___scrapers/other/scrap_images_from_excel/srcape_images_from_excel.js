const {loadImagesFromExcelFile} = require("../../../ev___tools/excel/f_excel_images_loader.js");

(async function scrape_images() {
    await loadImagesFromExcelFile("Аналоги_ОС_ТЭЦ-30.xlsx", "images");
})()