export const findByLabelOrFirst = (arr, label) =>
    arr.find(el => el.label === label) || arr[0];

export const copyObject = obj =>
    JSON.parse(JSON.stringify(obj, undefined, 2));