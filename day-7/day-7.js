const fs = require('fs');
const util = require('../util');

function getInput(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf-8').toString().split(',').map(strNum => parseInt(strNum));
    } catch (ex) {
        console.log(ex);
    }
}

function getMainInput() {
    return getInput('./input/input-day-7.txt');
}

test();
day7A();
day7B();

function test() {

    //outputScratch(getMainInput());

    const testPositions = [16, 1, 2, 0, 4, 2, 7, 1, 2, 14];
    const res = getOptimalMiddleA(testPositions);
    console.log(res == 37); 



    const testsSumBetween = [
        [1,11, 66],
        [1, 4, 10],
        [1, 3, 6],
        [1, 5, 15],
        [1, 1, 1],
        [1, 2, 3],
        [1, 9, 45]
    ]

    for (const test of testsSumBetween) {
        const res = sumNumbersBetween(test[0], test[1]);
        const  isPass = res == test[2];
        console.log(`${test[0]} to ${test[1]} = ${res}, expected ${test[2]}, ${isPass}`);
    }

    const testSteps = [
        [16, 5, 66],
        [1, 5, 10],
        [2, 5, 6],
        [0, 5, 15],
        [4, 5, 1],
        [2, 5, 6],
        [7, 5, 3],
        [1, 5, 10],
        [2, 5, 6],
        [14, 5, 45]
    ]

    console.log('');

    for (const test of testSteps) {
        const res = sumDiffSteps(test[0], test[1]);
        const isPass = res == test[2];
        console.log(`${test[0]} to ${test[1]} = ${res}, expected ${test[2]}, ${isPass}`);
    }

    const resB = getOptimalMiddleB(testPositions);
    console.log(resB);
    console.log(resB == 168); 
}

function day7A() {
    console.log(getOptimalMiddleA(getMainInput()));
}

function day7B() {
    console.log(getOptimalMiddleB(getMainInput()));
}


function getMedian(positionsSorted) {
    return positionsSorted[Math.floor(positionsSorted.length / 2)];
    
}

function getMean(positions) {
    return Math.round(positions.reduce((a, b) => a + b) / positions.length);
}

function getOptimalMiddleA(positions) {
    return getOptimalMiddle(positions, calculateFuelA, getMedian);
}

function getOptimalMiddleB(positions) {
    //because the part B calculation is more affected by outlying values, use mean
    //instead of median as starting point.
    return getOptimalMiddle(positions, calculateFuelB, getMean);
}



function getOptimalMiddle(positions, fuelCalculator, pivotSelector) {
    const positionsSorted = positions.map(p => p).sort((a, b) => a - b);
    const min = positionsSorted[0];
    const max = positionsSorted[positionsSorted.length - 1];

    const pivot = pivotSelector(positionsSorted);

    const initFuel = fuelCalculator(positions, pivot);

    const leftOfPivot = pivot - 1;
    const rightOfPivot = pivot + 1;
    const leftFuel = leftOfPivot >= min ? fuelCalculator(positions, leftOfPivot) : Number.MAX_VALUE;
    const rightFuel = rightOfPivot <= max ? fuelCalculator(positions, rightOfPivot) : Number.MAX_VALUE;

    if (initFuel <= leftFuel && initFuel <= rightFuel) {
        return initFuel;
    } else {
        let curFuel = initFuel;
        let [nextFuel, step, pos] = leftFuel < rightFuel ? [leftFuel, -1, leftOfPivot - 1] : [rightFuel, 1, rightOfPivot + 1];
        while (nextFuel < curFuel && pos >= min && pos <= max) {
            curFuel = nextFuel;
            nextFuel = fuelCalculator(positions, pos);
            pos += step;
        }
        return curFuel;
    }
}

function calculateFuel(positions, align, positionFuelCalculator) {
    return positions.map(p => positionFuelCalculator(p, align)).reduce((a, b) => a + b);
}

function calculateFuelA(positions, align) {
    return calculateFuel(positions, align, absoluteDiff);
}

function calculateFuelB(positions,  align) {
    return calculateFuel(positions, align, sumDiffSteps);
}

function absoluteDiff(a, b) {
    return Math.abs(a - b);
}


function sumNumbersBetween(a, b) {

    const [from, to] = [Math.min(a, b), Math.max(a, b)];
    const diff = to - from;
    const isDiffEven = diff % 2 == 0;

    const repeatingSum = to + from;

    const sumMultiplier = Math.ceil(diff / 2);
    const middleNumber = isDiffEven ? from + sumMultiplier : 0;

    return repeatingSum * sumMultiplier + middleNumber;
}

function sumDiffSteps(a, b) {
    return sumNumbersBetween(1, absoluteDiff(a, b));
}

function outputScratch(positions) {
    const sortedPositions = positions.map(p => p);
    sortedPositions.sort((a, b) => a - b);

    console.log(sortedPositions.join(', '));

    const fuels = sortedPositions.map((pos, i) => calculateFuelA(sortedPositions, i));
    console.log(fuels.join(','));

    const diffs = fuels.slice(1).map((f, i) => f - fuels[i]);

    console.log('');
    console.log(diffs.join(','));
}