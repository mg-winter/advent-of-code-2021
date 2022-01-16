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
    return getInput('./input/input-day-6.txt');
}

test();
day6A();
day6B();

function test() {

    const dayTests1 = [
        [0, 0],
        [1, 0],
        [2, 1],
        [3, 1],
        [4, 1],
        [5, 1],
        [6, 1],
        [7, 1],
        [8, 1],
        [9, 2],
        [10, 2],
        [11, 3],
        [12, 3],
        [13, 3],
        [14, 3],
        [15, 3],
        [16, 4],
        [17, 4],
        [18, 6]
    ]

    for (const test of dayTests1) {
        const res = getRecursiveSpawnCount(1, 7, 2, test[0]);
        const isPass = res == test[1] ? "TRUE" : "FALSE";
        console.log(`${test[0]} days: ${res} (${isPass} - expected  ${test[1]}) `);
    }
    const initialTimesRemaining = [3, 4, 3, 1, 2];
    const newFish = initialTimesRemaining.map(t => getRecursiveSpawnCountWithOriginal(t, 7, 2, 18)).reduce((a, b) => a + b);
    const newFishPattern = initialTimesRemaining.map(t => getSpawnCountPattern(t, 7, 2, 18)).reduce((a, b) => a + b);


    console.log(newFish == 26);
    console.log(newFishPattern == 26);

    const newFish80 = initialTimesRemaining.map(t => getRecursiveSpawnCountWithOriginal(t, 7, 2, 80)).reduce((a, b) => a + b);
    console.log(newFish80 == 5934);

    const newFishPattern80 = initialTimesRemaining.map(t => getSpawnCountPattern(t, 7, 2, 80)).reduce((a, b) => a + b);
    console.log(newFishPattern80 == 5934);

 
    const spawnTime = 7;
    const rampUpTime = 2;
    const maxDays = 100;

    const daysTillSpawn = 0;
    for (let i = 0; i <= maxDays; i++) {
        const totalFish = getRecursiveSpawnCountWithOriginal(daysTillSpawn, spawnTime, rampUpTime, i);
    
        const formulaRes =  getSpawnCountPattern(daysTillSpawn, spawnTime, rampUpTime, i);
        const isFormulaSame = formulaRes == totalFish ? "PASS" : "FAIL";
      
        console.log(`${i} days: ${totalFish} ${formulaRes} ${isFormulaSame}`);
    }

    const newFishPattern256 = initialTimesRemaining.map(t => getSpawnCountPattern(t, 7, 2, 256)).reduce((a, b) => a + b);
    console.log(newFishPattern256 == 26984457539);


}

function day6A() {
    const startTimes = getMainInput();
    const res = startTimes.map(t => getRecursiveSpawnCountWithOriginal(t, 7, 2, 80)).reduce((a, b) => a + b);
    console.log(res);
}

function day6B() {
    const startTimes = getMainInput();
    const res = startTimes.map(t => getSpawnCountPattern(t, 7, 2, 256)).reduce((a, b) => a + b);
    console.log(res);
}

/**output and summarize spawn times in order to figure out pattern or formula. */
function outputSpawnTimes(spawnTime, rampUpTime) {
    const colors = [
        '\x1b[40m',
        '\x1b[32m',
        '\x1b[33m',
        '\x1b[34m',
        '\x1b[35m',
        '\x1b[36m',
        '\x1b[31m',
        '\x1b[40m',
        '\x1b[32m',
        '\x1b[33m',
        '\x1b[34m',
        '\x1b[35m',
        '\x1b[36m',
        '\x1b[31m',
        '\x1b[37m',
    ];
    const initialTimes = [0];
    const timesOverTime = getSeveralDays(initialTimes, spawnTime, rampUpTime, 32);
    console.log(timesOverTime.map((arr, i) => `${i}:\t\t` + arr.map((t) => `${colors[t.gen]}${t.time}|${t.gen}\x1b[0m`).join('\t')).join('\n'));

    const genCounts = timesOverTime.map(row => row.reduce((acc, fishCount) => {
        const newAcc = {};
        Object.assign(newAcc, acc);
        if (!newAcc[fishCount.gen]) {
            newAcc[fishCount.gen] = 0;
        }
        newAcc[fishCount.gen] = newAcc[fishCount.gen] + 1;
        return newAcc;
    }, {}));
    console.log(genCounts.map((count, i) => `${i}:\t${Object.keys(count).map(k => colors[k] + k + '|' + count[k] + '\x1b[0m').join('\t')}`).join('\n'));

    const genIncreases = genCounts.reduce((acc, countRow) => {


        const gens = Object.keys(countRow);
        const res = {};

        for (const gen of gens) {
            const lastCount = acc.lastRow[gen] ? acc.lastRow[gen] : 0;
            res[gen] = countRow[gen] - lastCount;
        }

        return { lastRow: countRow, increases: acc.increases.concat([res]) };


    }, { lastRow: {}, increases: [] }).increases;
    console.log('');

    console.log(genIncreases.map((increaseRow, i) => `${i}:\t${Object.keys(increaseRow).map(k => (increaseRow[k] > 0 ? colors[k] : '\x1b[2m') + k + '|' + increaseRow[k] + '\x1b[0m').join('\t')}`).join('\n'));

    const lastIncreaseRow = genIncreases[genIncreases.length - 1];
    const increasePatterns = Object.keys(lastIncreaseRow).map(gen => {
        const genRows = genIncreases.map((incr, i) => {
            return {
                index: i,
                increase: incr[gen]
            }
        })
        return { gen: gen, pattern: genRows.filter(row => row.increase > 0) };
    });


    const lenRange = util.rangeArr({ start: 1, end: increasePatterns[1].pattern.length });
    console.log(`\n\t\x1b[4m${lenRange.join('\t')}` + '\x1b[0m');
    console.log(increasePatterns.map(ptn => `${ptn.gen}:\t${ptn.pattern.map(incr => incr.increase).join(',\t')}`).join('\n'));



}

function getIncreaseMatrix(daysRemainingAtSpawn, spawnTime) {
    if (daysRemainingAtSpawn < 0) {
        return [1];
    } else {
        const firstGenSpawns = 1 + Math.floor(daysRemainingAtSpawn / spawnTime);

        const spawnsRange = util.rangeArr({ start: 1, end: firstGenSpawns });

        const initIncreases = spawnsRange.map(i => 1);
        const increaseMatrix = spawnsRange.reduce((matrix, gen) => {
            const newRow = Array(initIncreases.length);
            const lastRow = matrix[matrix.length - 1];
            newRow[0] = 1;
            for (let i = 1; i < newRow.length; i++) {
                newRow[i] = newRow[i - 1] + lastRow[i];
            }
            return matrix.concat([newRow]);
        }, [initIncreases]);

        return increaseMatrix;
} }

function getSpawnCountPattern(daysTillSpawn, spawnTime, rampUpTime, daysRemaining) {

    const timeTillFirst = spawnTime + rampUpTime;
    const daysRemainingAtSpawn = daysRemaining - daysTillSpawn - 1;
    if (daysRemainingAtSpawn < 0) {
        return 1;
    } else {
        const increaseMatrix = getIncreaseMatrix(daysRemainingAtSpawn, spawnTime);
        const numGenerations = 1 + Math.floor(daysRemainingAtSpawn / timeTillFirst);
       

        const gensRange = util.rangeArr({start: 1, end: numGenerations});
        const spawnsPerGeneration = gensRange.map(gen => getTotalSpawnsInGeneration(daysRemainingAtSpawn, spawnTime, timeTillFirst, gen));

        return spawnsPerGeneration.map((numSpawns, i) => {
            const increaseRow = increaseMatrix[i];
            const increases = increaseRow.slice(0, numSpawns);
            return increases.reduce((a,b) => a + b, 0);
        }).reduce((a, b) => a + b, 1);
      
    }
}



    function getTotalSpawnsInGeneration(daysRemainingAtSpawn, spawnTime, timeTillFirst, generation) {
        const timeTillFirstInGen = timeTillFirst * (generation - 1);
        const daysRemainingAtFirstInGen = daysRemainingAtSpawn - timeTillFirstInGen;
        if (daysRemainingAtFirstInGen < 0 || generation < 1) {
            return 0;
        } else {
            const numberSpawns = 1 + Math.floor(daysRemainingAtFirstInGen / spawnTime);
            return numberSpawns;
        }
    }

    function getRecursiveSpawnCountWithOriginal(daysTillSpawn, spawnTime, rampUpTime, daysRemaining) {
        return 1 + getRecursiveSpawnCount(daysTillSpawn, spawnTime, rampUpTime, daysRemaining);
    }

    function getRecursiveSpawnCount(daysTillSpawn, spawnTime, rampUpTime, daysRemaining) {
        const daysRemainingAtSpawn = daysRemaining - daysTillSpawn - 1;

        if (daysRemainingAtSpawn < 0) {
            return 0;
        } else {
            const remainingSpawns = util.rangeArr({end: 0, start: daysRemainingAtSpawn, step: spawnTime * -1});
            const daysTillFirstSpawn = spawnTime + rampUpTime - 1;
            return remainingSpawns.length + remainingSpawns.map(s => getRecursiveSpawnCount(daysTillFirstSpawn, spawnTime, rampUpTime, s)).reduce((a, b) => a + b, 0);
        }
    }

    function getNextDay(timesAndGensArr, spawnTime, rampUpTime) {
        const resetVal = spawnTime - 1;
        const initVal = spawnTime + rampUpTime - 1;
        const increasedTimes = timesAndGensArr.map(t => { return { gen: t.gen, time: t.time <= 0 ? resetVal : t.time - 1}});
        const newTimes = timesAndGensArr.filter(t => t.time <= 0).map(t => {return {gen: t.gen + 1, time: initVal}});
        return increasedTimes.concat(newTimes);
    }

    function getSeveralDays(initialTimes, spawnTime, rampUpTime, numDays) {
        
        let curTimes = initialTimes.map(t => {return {time: t, gen: 0}});
        const res = [curTimes];
        for (let i = 0; i <= numDays; i++) {
            curTimes = getNextDay(curTimes, spawnTime, rampUpTime);
            res.push(curTimes);
        }
        return res;
    }



