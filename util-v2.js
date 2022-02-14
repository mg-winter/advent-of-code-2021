const MAX_TIMEOUT = 2147483647;
const util = {
    isNullOrUndefined: isNullOrUndefined,
    oneWithSign: oneWithSign,
    getOverlapRange: getOverlapRange,
    escapeRegex: escapeRegex,
    getNumOccurrences: getNumOccurrences,
    range: range,
    rangeArr: rangeArr,
    unorderedPairs: unorderedPairs,
    unorderedPairsArr: unorderedPairsArr,
    cartesian: cartesian,
    cartesianArr: cartesianArr,
    distinctByStringNoNull: distinctByStringNoNull,
    toKeyValuePairs: toKeyValuePairs,
    reverseDict: reverseDict,
    toDict: toDict,
    mergeDicts: mergeDicts,
    reduceToAggregateDict: reduceToAggregateDict,
    getCountsDict: getCountsDict,
    gettArraysDict: getArraysDict,
    distinct: distinct,
    waitForEvent: waitForEvent,
    waitForTimeout: waitForTimeout,
    waitForPoll: waitForPoll,
    waitForAnimationFrame: waitForAnimationFrame
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

/** https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript */
function escapeRegex(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}


/*https://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string*/
function getNumOccurrences(str, substr) {
    if (!str || !substr) {
        return 0;
    }

    const re = new RegExp(escapeRegex(substr), 'g');;
    const matches = str.match(re);

    return (matches || []).length;
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
function toKeyValuePairs(dict) {
    return Object.keys(dict).map(k => {return {key: k, value: dict[k]}});
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

/** unlike JS spread operator, does something to values instead of just
 * using the last one
 */
function mergeDicts(dicts, valueMerger, initialValue=[], keySelector) {
    const valueMergerFunc = valueMerger ? ((values, pair) => valueMerger(values, pair.value)) : ((values, pair) => [...values, pair.value]);
    const keySelectorFunc = keySelector ? pair => keySelector(pair.key) : pair => pair.key;
    
    const kvPairs = dicts.map(dict => toKeyValuePairs(dict)).flat(1);
    return reduceToAggregateDict(kvPairs, valueMergerFunc,  initialValue, keySelectorFunc);

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

function waitForEvent(target, eventName, maxWaitMs=2147483647) {
    return new Promise((resolve, reject) => {
        let isResolved = false;

        const eventHandler = e => {
            
            isResolved = true;
            if (rejectTimeout) {
                clearTimeout(rejectTimeout);
            }
            target.removeEventListener(eventName, eventHandler);

            resolve({ event: e });
        };

        const rejectTimeout = setTimeout(() => {
            if (!isResolved) {
                target.removeEventListener(eventName, eventHandler);

                resolve({event: null});
            }
        }, maxWaitMs);

        target.addEventListener(eventName, eventHandler);
        
    });
}
    
function waitForTimeout(timeoutMS) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), timeoutMS);
    });
}

function waitForAnimationFrame(timeoutMS) {
    return new Promise((resolve, reject) => {
        requestAnimationFrame(() => resolve());
    });
}


function getResolvedCheckerFunc(resolvedChecker, maxPolls) {
    if (maxPolls < 0) {
        return (i) => {
            const isResolved = resolvedChecker();
            return {
                isFinished: isResolved,
                isResolved: isResolved
            }
        };
    } else {
        return (i) => {
            const isResolved = resolvedChecker();
            return {
                isResolved: isResolved,
                isFinished: isResolved || i > maxPolls,
            }
        }
    }
}
async function waitForPoll(resolvedChecker, timeoutMS = 250, maxPolls = -1) {
    const resolvedCheckerFunc = getResolvedCheckerFunc(resolvedChecker, maxPolls);
    
        let i = 0;
        let finishedCheck = resolvedCheckerFunc(i);
        while(!finishedCheck.isFinished) {
            await waitForTimeout(timeoutMS);
            i++;
            finishedCheck = resolvedCheckerFunc(i);
        }
        if (finishedCheck.isResolved) {
            return true;
        } else {
            return false;
        }
}

export default util;