const {
    browserOpen,
    get_cian_districts,
    get_cian_cities,
    get_cian_regions
} = require("./cian_tools");

const fs = require("fs");


(async function load_all() {

    let browser = await browserOpen(true);
    let page = await browser.newPage();

    let regions = [];
    let cities = [];
    let districts = [];
    let counter = 0;

    //| получаем регионы (в.т.ч федеральные города: МСК, СПБ...)
    regions = await get_cian_regions(page);

    if (regions && regions.length > 0) {

        //| получаем дистрикты в федеральных городах

        for (let region of regions) {
            console.log("Загрузка дистриктов для федеральных городов:", ++counter, "/", regions.length);
            if (region.hasDistricts) {
                let buff = await get_cian_districts(page, region.id);
                buff = buff.map(district => {
                    return {
                        region_id: region.id,
                        city_id: region.id,
                        ...district
                    }
                });
                districts.push(...buff);
            }
        }

        counter = 0;

        //| получаем города
        for (let region of regions) {
            console.log("Загрузка городов:", ++counter, "/", regions.length);
            let buff = await get_cian_cities(page, region.id);
            if (buff && buff.length > 0) {
                buff = buff.map(city => {
                    return {
                        region_id: region.id,
                        ...city
                    }
                });
                cities.push(...buff);
            }
        }

        counter = 0;

        //| получаем городские дистрикты
        for (let city of cities) {
            console.log("Загрузка дистриктов:", ++counter, "/", cities.length);
            let districts_buff = await get_cian_districts(page, city.id);
            if (districts_buff && districts_buff.length > 0) {
                districts_buff = districts_buff.map(district => {
                    return {
                        region_id: city.region_id,
                        city_id: city.id,
                        ...district,
                    }
                })
                districts.push(...districts_buff);
            }
        }

        fs.writeFileSync("cian_regions.json", JSON.stringify(regions));
        fs.writeFileSync("cian_cities.json", JSON.stringify(cities));
        fs.writeFileSync("cian_districts.json", JSON.stringify(districts));
    }

    await page.close();
    await browser.close();
})()