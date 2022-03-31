const MAX_TIMEOUT = 2147483647;
const util = {
    isNullOrUndefined: isNullOrUndefined,
    oneWithSign: oneWithSign,
    sumFromSameSignMin: sumFromSameSignMin,
    sumNumbersBetween: sumNumbersBetween,
    getOverlapRange: getOverlapRange,
    rangesOverlap: rangesOverlap,
    isInRange: isInRange,
    escapeRegex: escapeRegex,
    getNumOccurrences: getNumOccurrences,
    getFirst: getFirst,
    range: range,
    rangeArr: rangeArr,
    choose: choose,
    unorderedPairs: unorderedPairs,
    unorderedPairsArr: unorderedPairsArr,
    cartesian: cartesian,
    cartesianNDimensions: cartesianNDimensions,
    cartesianArr: cartesianArr,
    distinctByStringNoNull: distinctByStringNoNull,
    toKeyValuePairs: toKeyValuePairs,
    reverseDict: reverseDict,
    toDict: toDict,
    mergeDicts: mergeDicts,
    reduceToAggregateDict: reduceToAggregateDict,
    getCountsDict: getCountsDict,
    gettArraysDict: getArraysDict,
    groupBy: groupBy,
    distinct: distinct,
    getIntersection: getIntersection,
    isPrimitive: isPrimitive,
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

function rangesOverlap(range1, range2) {
   const [overlapStart, overlapEnd] = getOverlapRange(range1, range2);
   return overlapStart <= overlapEnd;

}

function getOverlapRange(thisRange, otherRange) {
    return [Math.max(thisRange[0], otherRange[0]), Math.min(thisRange[1], otherRange[1])];
}

function isInRange(num, [min, max]) {
    return num >= min && num <= max;
}

/**
 * For positive numbers, returns sum(1...n)
 * For negative numbers, returns sum(-1...n)
 * For 0, returns 0.
 * @param {int} n number to which to sum up.
 */
function sumFromSameSignMin(n) {
    if (n == 0) {
        return 0;
    } else if (n > 0) {
        return (n + 1) * n / 2;
    } else {
        return -1 * sumFromSameSignMin(n * -1);
    }
}

function sumNumbersBetween(a, b) {
    const [from, to] = [Math.min(a, b), Math.max(a, b)];

    if (from <= 0 && to >= 0) {
        return sumFromSameSignMin(to) - sumFromSameSignMin(from);
    } else if (from >= 0) { // if from >= 0, to >= 0 as well
        return sumFromSameSignMin(to) - sumFromSameSignMin(from - 1);
    } else { //from and to are both below 0, and from is the one with the larger abs value
        return sumFromSameSignMin(from) - sumFromSameSignMin(to + 1);
    }
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

function getFirst(iter, condition) {
    const conditionFunc = condition ?? (n => true);
    for (const item of iter) {
        if (conditionFunc(item)) {
            return item;
        }
    }
    return null;
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

function choose(arr, numItems) {
   if (numItems < 1 || numItems > arr.length) {
       return [];
   } else if (numItems === 1) {
       return arr.map(item => [item]);
   } else {
       return arr.map((item, i) => {
           const chooseOneFewer = choose(arr.slice(i +1), numItems - 1);
           return chooseOneFewer.map(items => [item, ...items]);
       }).flat(1);
   }
}

function* unorderedPairs(arr) {
    const secondLast = arr.length - 1;
    for (let i = 0; i < secondLast; i++) {
        for (let j = i + 1; j < arr.length; j++) {

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

function cartesianNDimensions(...iters) {
    if (iters.length === 0) {
        return [];
    } else if (iters.length === 1) {
        return iters[0].map(item => [item]);
    } else {
        const otherIters = iters.slice(1);
        const cartesianOtherIters = cartesianNDimensions(...otherIters);
        return iters[0].map(item => cartesianOtherIters.map(items => [item, ...items])).flat(1);
    }
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

function groupBy(arr, keySelector) {
    const dict = getArraysDict(arr, keySelector);
    return toKeyValuePairs(dict);
}

function distinct(arr, primitiveConverter, valuePicker) {
    const primitiveConverterFunc = primitiveConverter ?? (x => x ? x.toString() : '');
    const valuePickerFunc = valuePicker ?? (values => values[0]);

    const arraysDict = getArraysDict(arr, primitiveConverterFunc);

    return Object.keys(arraysDict).map(k => valuePickerFunc(arraysDict[k]));

}

function getIntersection(arr1, arr2) {
    return arr1.filter(o => arr2.includes(o));
}

function isPrimitive(objectOrPrimitive) {
    return Object(objectOrPrimitive) !== objectOrPrimitive;
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