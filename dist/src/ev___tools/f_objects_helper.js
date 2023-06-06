const _ = require("lodash");
//| сливает значения двух объектов
//| значения левого объекта в преимуществе
//| слияние работает только для первого уровня вложенности.
const concat_values_left = (obj_1, obj_2) => {
    let b_1 = _.cloneDeep(obj_1);
    let b_2 = _.cloneDeep(obj_2);
    for (let key in b_1) {
        if ((key in b_1) && (key in b_2)) {
            b_1[key] = b_1[key] || b_2[key];
        }
    }
    return b_1;
};
//| сливает значения двух объектов
//| значения правого объекта в преимуществе
//| слияние работает только для первого уровня вложенности.
const concat_values_right = (obj_1, obj_2) => {
    let b_1 = _.cloneDeep(obj_1);
    let b_2 = _.cloneDeep(obj_2);
    for (let key in b_1) {
        if ((key in b_1) && (key in b_2)) {
            b_1[key] = b_2[key] || b_1[key];
        }
    }
    return b_1;
};
module.exports = {
    concat_values_left,
    concat_values_right,
};
//# sourceMappingURL=f_objects_helper.js.map