let arr = [
    "Площадь: 22 м²",
    "Тип гаража: Железобетонный",
    "Охрана: Да²"
]

arr = arr.map(
    el => el.toLowerCase()
        .replace(/[^\d\n\s\:A-zА-яЁё]/g, "")
        .replace(/[²\sм]/g, "")
);

console.log("")

arr = arr.map(el => {
    if ((el.indexOf("площадь") !== -1)) {
        return {type: "площадь гаража", value: el.slice(el.indexOf(":") + 1)};
    } else if ((el.indexOf("тип") !== -1) && (el.indexOf("гараж") !== -1)) {
        return {type: "тип гаража", value: el.slice(el.indexOf(":") + 1)};
    } else if ((el.indexOf("охран") !== -1)) {
        return {type: "наличие охраны", value: el.slice(el.indexOf(":") + 1)};
    }
})


console.log("")