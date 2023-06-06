const {Workbook} = require("exceljs");
const fs = require("fs");

const loadImagesFromExcelFile = async (file, imagesFolder) => {
    let folder = imagesFolder[imagesFolder.length-1] === "/" ? imagesFolder : imagesFolder + "/";
    const workbook = new Workbook();
    await workbook.xlsx.readFile(file);
    for (let i = 0; i < workbook.worksheets.length; i++) {
        const worksheet = workbook.worksheets[i];
        for (const image of worksheet.getImages()) {
            console.log('processing image row', image.range.tl.nativeRow, 'col', image.range.tl.nativeCol, 'imageId', image.imageId);
            const img = workbook.model.media.find(m => m.index === image.imageId);
            fs.writeFileSync(`${folder}${image.range.tl.nativeRow}.${image.range.tl.nativeCol}.${img.name}.${img.extension}`, img.buffer);
        }
    }
}

module.exports = {
    loadImagesFromExcelFile
};