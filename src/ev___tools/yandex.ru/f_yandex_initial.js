const fields = {
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
}


//| функция инициализации пустого объекта адресных параметров
//|
export const init_address_params = () => {
    let buff = {};
    Object.keys(fields).forEach(key => buff[key] = null);
    return buff;
};


//| наименования ключей
//|
export const yan_adr_keys_names = () => Object.keys(fields).map(key => {
    return {key: key}
})


//| шапка для наименований ключей
//|
export const yan_adr_keys_desc = () => Object.keys(fields).map(k => fields[k]);
