

//
//
//
//
//
//| функции обработки сжатых структур, вспомогательный функционал
//


//
//| распаковывает объект структуры
//
export const unboxStructure = box => {
    let newObj = {};
    Object.keys(box).forEach(key => {
        newObj[key] = {
            value: null,
            description: box[key]
        }
    });
    return newObj;
}


//
//| Определяет тип локации (город, округ и т.д.)
//
export const whatIsLocation = addressObject => {
    let searchStr = addressObject["fullName"].toLowerCase();
    let bArr = ["республика", "край", "область", "обл.", "ненецкий", "еврейская", "югра", "чукотский"];
    let count = bArr.map(el => searchStr.indexOf(el)).filter(el => el !== -1).length
    if (count > 0) {
        return {
            key: "subject",
            value: addressObject["fullName"]
        };
    }
}


//
//| Определение цены предложения с НДС на сайте from_cian.ru
//
export const getPriceWithVat = (priceType, price, vatType, paymentPeriod, area) => {
    let resultPrice = price;
    //| платежный период указан за 1 год -> переводим на 1 месяц
    resultPrice = (paymentPeriod === "annual") ? resultPrice / 12 : resultPrice;
    //| если цена указана за 1 м. -> переводим в стоимость за всю площадь
    resultPrice = (priceType === "squareMeter") ? resultPrice * area : resultPrice;
    //| если НДС не включен -> включаем
    resultPrice = (vatType === "notIncluded") ? resultPrice * 1.2 : resultPrice;
    //| итого: месячная стоимость аренды всей площади с НДС.
    return Math.ceil(resultPrice);
}