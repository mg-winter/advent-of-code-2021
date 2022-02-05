
const util = {
    isNullOrUndefined: isNullOrUndefined,
    oneWithSign: oneWithSign,
    getOverlapRange: getOverlapRange,
    range: range,
    rangeArr: rangeArr,
    unorderedPairs: unorderedPairs,
    unorderedPairsArr: unorderedPairsArr,
    cartesian: cartesian,
    cartesianArr: cartesianArr,
    distinctByStringNoNull: distinctByStringNoNull,
    reverseDict: reverseDict,
    toDict: toDict,
    reduceToAggregateDict: reduceToAggregateDict,
    getCountsDict: getCountsDict,
    gettArraysDict: getArraysDict,
    distinct: distinct
}

function oneWithSign(number) {
    return number / Math.abs(number);
}

function isNullOrUndefined(obj) {
    return obj !== null && typeof(obj) != 'undefined';
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

function* cartesian(iter1, iter2) {
    const iter2Arr = [...iter2];
    for (const x1 of iter1) {
        for (const x2 of iter2Arr) {
            yield [x1, x2];
        }
    }
}

function cartesianArr(iter1, iter2) {
    return [...cartesian(iter1, iter2)];
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
    const keySelectorFunc = keySelector ? keySelector : x => x ? x.toString() : '';
    const valueSelectorFunc = valueSelector ? valueSelector : x => x;

    const res = {};
    for (const item of arr) {
        res[keySelectorFunc(item)] = valueSelectorFunc(item);
    }
    return res;
}

function reduceToAggregateDict(arr, valueAggregator, initialValue, keySelector) {
    const keySelectorFunc = keySelector ?? (k => k);
    const res = {};
    for (const item of arr) {
        const key = keySelectorFunc(item);
        if (!res[key]) {
            res[key] = initialValue;
        }
        res[key] = valueAggregator(res[key], item);
    }
    return res;
}

function getCountsDict(arr, keySelector) {
    return reduceToAggregateDict(arr, (val, item) => val + 1, 0, keySelector);
}

function getArraysDict(arr, keySelector) {
    return reduceToAggregateDict(arr, (items, item) => [...items, item], [], keySelector);
} 

function distinct(arr, primitiveConverter, valuePicker) {
    const primitiveConverterFunc = primitiveConverter ?? (x => x ? x.toString() : '');
    const valuePickerFunc = valuePicker ?? (values => values[0]);

    const arraysDict = getArraysDict(arr, primitiveConverterFunc);

    return Object.keys(arraysDict).map(k => valuePickerFunc(arraysDict[k]));

}

export default util;