// Расстояние Левенштейна
const indexLevenshtejn = (word_1 = "Лабрадор", word_2 = "Лаборант") => {
    let finalArray = [];
    let firstWord = word_1.toLowerCase();
    let secondWord = word_2.toLowerCase();
    let firstMax = firstWord.length;
    let secondMax = secondWord.length;
    let fM = (a, b) => a === b ? 0 : 1;
    //set size
    finalArray.length = firstMax + 2;
    for (let i = 0; i < finalArray.length; i++) {
        finalArray[i] = [];
        finalArray[i].length = secondMax + 2;
        finalArray[i].fill(0);
    }
    //set titles horizontal
    for (let i = 0; i < secondWord.length; i++) {
        finalArray[0][i + 2] = secondWord[i];
        finalArray[1][i + 2] = i + 1;
    }
    //set titles vertical
    for (let i = 0; i < firstWord.length; i++) {
        finalArray[i + 2][0] = firstWord[i];
        finalArray[i + 2][1] = i + 1;
    }
    for (let i = 2; i < finalArray.length; i++) {
        for (let j = 2; j < finalArray[i].length; j++) {
            let buff = [
                finalArray[i - 1][j] + 1,
                finalArray[i][j - 1] + 1,
                finalArray[i - 1][j - 1] + fM(finalArray[0][j], finalArray[i][0]),
            ];
            finalArray[i][j] = Math.min(...buff);
        }
    }
    finalArray = finalArray.flat(1);
    // console.log("Итог:", finalArray[finalArray.length - 1]);
    return finalArray[finalArray.length - 1];
};
// Массив расстояний Левенштейна
const indexesLevenshtejn = (str_1, str_2) => {
    let b_str_1 = str_1.replace(/[,.]/g, '').trim().toLowerCase().split(" ").filter(e => e.length > 0);
    let b_str_2 = str_2.replace(/[,.]/g, '').trim().toLowerCase().split(" ").filter(e => e.length > 0);
    let indexes = [];
    for (let word_1 of b_str_1) {
        for (let word_2 of b_str_2) {
            indexes.push(indexLevenshtejn(word_1, word_2));
        }
    }
    return indexes.sort();
};
// (function s() {
//     console.log(indexLevenshtejn())
//     console.log("")
// })()
module.exports = {
    indexLevenshtejn,
    indexesLevenshtejn
};
//# sourceMappingURL=f_levenshtein.js.map