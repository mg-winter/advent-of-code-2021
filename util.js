const util = {
    oneWithSign: oneWithSign,
    getOverlapRange: getOverlapRange,
    range: range,
    rangeArr: rangeArr,
    unorderedPairs: unorderedPairs,
    unorderedPairsArr: unorderedPairsArr,
    cartesian: cartesian,
    cartesianArr: cartesianArr,
    arrayFlat: arrayFlat,
    distinctByStringNoNull: distinctByStringNoNull,
    reverseDict: reverseDict,
    toDict: toDict
}

function oneWithSign(number) {
    return number / Math.abs(number);
}

function getOverlapRange(thisRange, otherRange) {
    return [Math.max(thisRange[0], otherRange[0]), Math.min(thisRange[1], otherRange[1])];
}

function* range({ start = 0, end = 0, step = 1 }) {
    const doneFunc = step > 0 ? i => i > end : i => i < end;
    for (let i = start; !doneFunc(i); i += step) {
        yield i;
    }
}

function rangeArr({ start = 0, end = 0, step = 1 }) {
    return [...range({ start: start, end: end, step: step })];
}

function* unorderedPairs(arr) {
    const secondLast = arr.length - 1;
    for (i = 0; i < secondLast; i++) {
        for (j = i + 1; j < arr.length; j++) {

            yield [arr[i], arr[j]];
        }
    }
}

function unorderedPairsArr(arr) {
    return [...unorderedPairs(arr)];
}

function* cartesian(arr1, arr2) {
    for (const x1 of arr1) {
        for (const x2 of arr2) {
            yield [x1, x2];
        }
    }
}

function cartesianArr(arr1, arr2) {
    return [...cartesian(arr1, arr2)];
}

function arrayFlat(arr) {
    return arr.reduce((acc, arr) => acc.concat(arr), []);
}

function distinctByStringNoNull(arr) {
    return arr.reduce(distinctByStringNoNullReducer, { objMap: {}, list: [] }).list;
}

function distinctByStringNoNullReducer(acc, newVal) {
    if (newVal == null) {
        return acc;
    } else {
        const key = newVal.toString();
        if (acc.objMap[key]) {
            return acc;
        } else {
            const newMap = {};
            newMap[key] = newVal;
            return {
                objMap: Object.assign(newMap, acc.objMap),
                list: acc.list.concat([newVal])
            }
        }
    }
}

function reverseDict(dict, keyTransformer, valueTransformer) {
    const defaultFunc = x => x;
    const keyTransformerFunc = keyTransformer ? keyTransformer : defaultFunc;
    const valueTransformerFunc = valueTransformer ? valueTransformer : defaultFunc;

    const res = {};

    const keys = Object.keys(dict);
    for (const key of keys) {
        res[valueTransformerFunc(dict[key])] = keyTransformerFunc(key);
    }

    return res;
}

function toDict(arr, keySelector, valueSelector) {
    const keySelectorFunc = keySelector ? keySelector : x => x;
    const valueSelectorFunc = valueSelector ? valueSelector : x => x;

    const res = {};
    for (const item of arr) {
        res[keySelectorFunc(item)] = valueSelectorFunc(item);
    }
    return res;
}

export default util;