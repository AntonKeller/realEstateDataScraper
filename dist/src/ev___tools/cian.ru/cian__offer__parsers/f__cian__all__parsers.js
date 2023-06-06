const { landDescParse } = require("../cian__description_parsers/f_description_parser");
//
//
//
//
//
//| сжатые структуры
//| описывают поля для аналога
//
//
//| каркас аналога: "Оффис" (продажа, аренда)
//
const offices_analogue_structure_sale_rent = {};
//
//| каркас аналога: "Торговая Площадь" (продажа, аренда)
//
const trade_area_analogue_structure_sale_rent = {};
//
//| каркас аналога: "Склад" (продажа, аренда)
//
const warehouses_analogue_structure_sale_rent = {};
//
//| каркас аналога: "Производственное помещение" (продажа, аренда)
//
const industrial_premises_analogue_structure_sale_rent = {};
//
//| каркас аналога: "Здание" (продажа, аренда)
//
const buildings_analogue_structure_sale_rent = {};
//
//| каркас аналога: "Помещение свободного назначения" (псн.) (продажа, аренда)
//
const vacant_premises_analogue_structure_sale_rent = {};
//
//| каркас аналога: "Готовый бизнес" (продажа)
//
const ready_business_analogue_structure_sale = {};
//
//| каркас аналога: "Гараж" (продажа, аренда)
//
const garages_analogue_structure_sale_rent = {};
//
//| каркас аналога: "Комната" (продажа, аренда)
//
const room_analogue_structure_sale = {};
//
//| каркас аналога: "Квартира" (продажа, аренда)
//
const apartment_structure_sale = {};
//
//| каркас аналога: "Дом" (продажа, аренда)
//
const house_structure_sale = {};
//
//
//
//
//
//| парсеры данных с объекта Offer (cian)
//
//
//
//| Парсер для аналога: "Офис"
//
const parseOfficesAnalogue = offer => {
    return offer;
};
//
//| Парсер для аналога: "Торговая площадь"
//
const parseTradeAreaAnalogue = offer => {
    return offer;
};
//
//| Парсер для аналога: "Склад"
//
const parseWarehousesAnalogue = offer => {
    return offer;
};
//
//| Парсер для аналога: "Производственное помещение"
//
const parseIndustrialPremisesAnalogue = offer => {
    return offer;
};
//
//| Парсер для аналога: "Здание"
//
const parseBuildingsAnalogue = offer => {
    return offer;
};
//
//| Парсер для аналога: "Помещение свободного назначения" (псн.)
//
const parseVacantPremisesAnalogue = offer => {
    return offer;
};
//
//| Парсер для аналога: "Готовый бизнес"
//
const parseReadyBusinessAnalogue = offer => {
    return offer;
};
//
//| Парсер для аналога: "Гараж"
//
const parseGaragesAnalogue = offer => {
    return offer;
};
//
//| Парсер для аналога: "Комната"
//
const parseRoomAnalogue = offer => {
    return offer;
};
//
//| Парсер для аналога: "Квартира"
//
const parseApartmentAnalogue = offer => {
    return offer;
};
//
//| Парсер для аналога: "Дом"
//
const parseHouseAnalogue = offer => {
    return offer;
};
module.exports = {
    parseOfficesAnalogue,
    offices_analogue_structure_sale_rent_titles: Object.values(offices_analogue_structure_sale_rent),
    parseTradeAreaAnalogue,
    trade_area_analogue_structure_sale_rent_titles: Object.values(trade_area_analogue_structure_sale_rent),
    parseWarehousesAnalogue,
    warehouses_analogue_structure_sale_rent_titles: Object.values(warehouses_analogue_structure_sale_rent),
    parseIndustrialPremisesAnalogue,
    industrial_premises_analogue_structure_sale_rent_titles: Object.values(industrial_premises_analogue_structure_sale_rent),
    parseBuildingsAnalogue,
    buildings_analogue_structure_sale_rent_titles: Object.values(buildings_analogue_structure_sale_rent),
    parseVacantPremisesAnalogue,
    vacant_premises_analogue_structure_sale_rent_titles: Object.values(vacant_premises_analogue_structure_sale_rent),
    parseReadyBusinessAnalogue,
    ready_business_analogue_structure_sale_titles: Object.values(ready_business_analogue_structure_sale),
    parseGaragesAnalogue,
    garages_analogue_structure_sale_rent_titles: Object.values(garages_analogue_structure_sale_rent),
    parseRoomAnalogue,
    room_analogue_structure_sale_titles: Object.values(room_analogue_structure_sale),
    parseApartmentAnalogue,
    apartment_structure_sale_titles: Object.values(apartment_structure_sale),
    parseHouseAnalogue,
    house_structure_sale_titles: Object.values(house_structure_sale),
};
//# sourceMappingURL=f__cian__all__parsers.js.map