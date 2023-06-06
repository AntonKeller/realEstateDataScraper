const KEYS = {
    correct_address: "скорректированный адрес",
    country: "страна",
    federal_okrug: "федеральный округ",
    region: "регион",
    isFederalCity: "является федеральным городом",
    municipal_okrug: "муниципальный округ",
    municipal_raion: "муниципальный район",
    city: "город",
    district_city_okrug: "городской округ",
    district_raion: "район",
    district_mikroraion: "микрорайон",
    district_section: "квартал",
    street: "улица",
    house: "дом",
    geo_lat: "широта",
    geo_lon: "долгота"
};
//| функция инициализации пустого объекта адресных параметров
//|
const init_address_params = () => {
    let buff = {};
    Object.keys(KEYS).forEach(key => buff[key] = null);
    return buff;
};
//| наименования ключей
//|
const yan_adr_keys_names = () => Object.keys(KEYS).map(key => {
    return { key: key };
});
//| шапка для наименований ключей
//|
const yan_adr_keys_desc = () => Object.keys(KEYS).map(k => KEYS[k]);
module.exports = {
    init_address_params,
    yan_adr_keys_names,
    yan_adr_keys_desc,
};
//# sourceMappingURL=f_yandex_initial.js.map