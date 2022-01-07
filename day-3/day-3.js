const fs = require('fs');


function getInput(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf-8').toString().split('\n');
    } catch (ex) {
        console.log(ex);
    }
}

function getMainInput() {
    return getInput('./input/input-day-3.txt');
}

test();
day3A();
day3B();

function test() {
    const testInput = getInput('./tests/test-1.txt');
    const testTallies = getTallies(testInput);
    console.log(testTallies);
    console.log(testTallies[0] == 7);

    const measuremenArrs = getMeasurementArrays(testTallies, testInput.length);
    const gammaArr = measuremenArrs.gamma;
    console.log(gammaArr);
    console.log(gammaArr.join('') == '10110');

    const epsilonArr = measuremenArrs.epsilon;
    console.log(epsilonArr);
    console.log(epsilonArr.join('') == '01001');

    const measuremenArrsFromReport = getMeasurementArraysFromReport(testInput);
    const gammaArr2 = measuremenArrsFromReport.gamma;
    console.log(gammaArr2);
    console.log(gammaArr2.join('') == '10110');

    const epsilonArr2 = measuremenArrsFromReport.epsilon;
    console.log(epsilonArr2);
    console.log(epsilonArr2.join('') == '01001');



    const binArrTests = [[[1], 1], [[0], 0], [[0, 1], 1], [[1, 0], 2], [[1, 0, 1], 5], [[1, 0, 1, 1, 0], 22], [[0, 1, 0, 0, 1], 9]];
    console.log('');
    binArrTests.forEach(test => {
        const res = binArrToDecimal(test[0]);
        console.log(test);
        console.log(res);
        console.log(res == test[1]);
        console.log('');
    });

    const power = calculatePower(testInput);
    console.log(power);
    console.log(power == 198);

    const oxygen = filterReportLines(testInput, 'gamma');
    console.log(oxygen);
    console.log(oxygen == '10111');

    const co = filterReportLines(testInput, 'epsilon');
    console.log(co);
    console.log(co == '01010');

    console.log(toBinaryArr(oxygen));
    console.log(toBinaryArr(oxygen).join('') == oxygen);
    console.log(toBinaryArr(co));
    console.log(toBinaryArr(co).join('') == co);


    const ls = calculateLifeSupport(testInput);
    console.log(ls);
    console.log(ls == 230);

}

function day3A() {
    console.log(calculatePower(getMainInput()));
}
 

function day3B() {
    console.log(calculateLifeSupport(getMainInput()));
}

function calculatePower(reportLines) {
    const measuremenArrs = getMeasurementArraysFromReport(reportLines);
    const gammaNum =  binArrToDecimal(measuremenArrs.gamma);
    const epsilonNum = binArrToDecimal(measuremenArrs.epsilon);

    return gammaNum * epsilonNum;
}

function getMeasurementArraysFromReport(reportLines) {
    const tallies = getTallies(reportLines);
    const measuremenArrs = getMeasurementArrays(tallies, reportLines.length);
    return measuremenArrs;
}

function calculateLifeSupport(reportLines) {
    const tallies = getTallies(reportLines);

    const oxygenGenRatingArr = filterReportLines(reportLines, "gamma");
    const co2ScrubberRatingArr = filterReportLines(reportLines, "epsilon");

    return binArrToDecimal(toBinaryArr(oxygenGenRatingArr)) * binArrToDecimal(toBinaryArr(co2ScrubberRatingArr));
}

function toBinaryArr(str) {
    return str.split('').map(strDigit => parseInt(strDigit));
}

function filterReportLines(reportLines, filterField) {
    let res = reportLines;
    let i = 0;
    let measurementArrs = getMeasurementArraysFromReport(res);
    while (res.length > 1 && i < reportLines[0].length) {
        res = res.filter(l => l[i] == measurementArrs[filterField][i]);
        measurementArrs = getMeasurementArraysFromReport(res);
        i++;
    }

    return res[0];
}

function getTallies(reportLines) {
    return reportLines.reduce(tallyPowerLine, null);;
}

function getMeasurementArrays(tallies, numEntries) {
    const threshold =  Math.ceil(numEntries / 2); 
    return {
        gamma: tallies.map(t => t >= threshold ? 1 : 0),
        epsilon: tallies.map(t => t >= threshold ? 0 : 1)
    };
}


function binArrToDecimal(arr) {
    return arr.reduce((decimalNum, binDigit, i) => (decimalNum << 1)+ binDigit);
}

function tallyPowerLine(tallySoFar, line) {
    const binCharArr = line.split('');
    const safeTally = tallySoFar ? tallySoFar : binCharArr.map((str, i) => 0);
    return binCharArr.map((strDigit, i) => safeTally[i] + parseInt(strDigit));
}