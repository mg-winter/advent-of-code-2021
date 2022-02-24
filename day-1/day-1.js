import { default as fs } from 'fs';

day1A();
day1B();

function day1A() {
    try {
        console.log(findSlidingIncreases(fs.readFileSync('./input/input-day-1.txt', 'utf-8').toString().split('\n'), 1));
    } catch (ex) {
        console.log(ex)
    }
}

function day1B() {
    try {
        console.log(findSlidingIncreases(fs.readFileSync('./input/input-day-1.txt', 'utf-8').toString().split('\n'), 3));
    } catch (ex) {
        console.log(ex)
    }
}

function findIncreases(lines) {
    return lines.map(l => parseInt(l))
                .reduce(reduceIncrease, {prev: 0, count: 0})
                .count;
}

function findSlidingIncreases(lines, windowSize) {
    return lines.map(l => parseInt(l))
        .reduce((acc, curr) => reduceSlidingIncrease(acc, curr, windowSize), { prevSum: 0, prevNumbers: [], count: 0 })
        .count;
}

function reduceIncrease(acc, curr) {
    return {
        prev: curr,
        count: acc.count + (acc.prev > 0 && acc.prev < curr ? 1 : 0)
    }
}

function reduceSlidingIncrease(acc, curr, windowSize) {


    const newNumbers = acc.prevNumbers.slice((acc.prevNumbers.length >= windowSize ? 1 : 0)).concat([curr]);
    const newSum = newNumbers.length >= windowSize ? newNumbers.reduce((a, b) => a + b) : 0;

    return {
        prevNumbers: newNumbers,
        prevSum: newSum,
        count: acc.count + (acc.prevSum > 0 && acc.prevSum < newSum ? 1 : 0)
    }
}