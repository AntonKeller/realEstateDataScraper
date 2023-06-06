import fetch from "node-fetch";


//| запрос корректного адреса из DaDataRu по любому адресу
//| дает подсказки к адресу (более корректные, но не всегда)
export const request = async address => {
    const TOKEN = "e8e5282e003f9876d9a66e625d4b7cec5bbf9274";
    let options = {
        method: "POST", mode: "cors", headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": "Token " + TOKEN
        }, body: JSON.stringify({query: address})
    }
    let resp = await fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address", options)
    return await resp.json();
}

//| принимает:
//|     1. адрес
//| возвращает 3 параметра:
//|     1. город
//|     2. улицу
//|     3. ключ в виде объединения города и улицы
export const get_city_and_street = async address => {
    let output = await request(address);
    if (
        Boolean(output) &&
        Boolean(output.suggestions) &&
        Boolean(output.suggestions.length > 0) &&
        Boolean(output.suggestions[0].data) &&
        Boolean(output.suggestions[0].data.city) &&
        Boolean(output.suggestions[0].data.street)
    ) {
        return {
            city: output.suggestions[0].data.city.toLowerCase(),
            street: output.suggestions[0].data.street.toLowerCase(),
            key_unit: output.suggestions[0].data.city.toLowerCase() + output.suggestions[0].data.street.toLowerCase()
        }
    } else {
        return null
    }
}

(async function start() {
    let work_path = "Москва, Московский, ";
    let output = await request(work_path);

    console.log("")
})()