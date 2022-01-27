const fs = require('fs');
const path = require('path');
const util = require('../util');

const CHUNK_PAIRS = ['()', '[]', '{}', '<>'];
const OPEN_TO_CLOSE = util.toDict(CHUNK_PAIRS, str => str[0], str => str[1]);
const CLOSE_TO_OPEN = util.toDict(CHUNK_PAIRS, str => str[1], str => str[0]);

const ILLEGAL_CLOSE_SCORES = {
    ')': 3,
    ']': 57,
    '}': 1197,
    '>': 25137
};

const AUTOCOMPLETE_SCORES = {
    ')': 1,
    ']': 2,
    '}': 3,
    '>': 4
};

function getInput(filePath) {
    try {
        const curFile = process.mainModule.filename;
        const fullPath = path.resolve(curFile, '..', filePath);
        return fs.readFileSync(fullPath, 'utf-8').toString().split('\n');
    } catch (ex) {
        console.log(ex);
    }
}

function getMainInput() {
    return getInput('./input/input-day-10.txt');
}

test();
day10A();
day10B();

function test() {
    const testScore = getTotalCorruptScore(getInput('./tests/test-1.txt'));
    console.log(testScore == 26397);

    const completeTestScore = getAutocompleteWinner(getInput('./tests/test-1.txt'));
    console.log(completeTestScore == 288957);
}

function day10A() {
    console.log(getTotalCorruptScore(getMainInput()));
}

function day10B() {
    console.log(getAutocompleteWinner(getMainInput()));
}

function getAutocompleteWinner(lines) {
    const scores = lines.map(getAutocompleteScore).filter(score => score).sort((a, b) => a - b);
    return scores[Math.floor(scores.length / 2)];
}
function getAutocompleteScore(line) {
    const checkRes = checkLine(line);
    return checkRes.closers && checkRes.closers.length > 0 ? checkRes.closers.map(c => AUTOCOMPLETE_SCORES[c])
        .filter(c => c)
        .reduce((prev, curr) => prev * 5 + curr, 0) : 0;
}

function getTotalCorruptScore(lines) {
    return lines.map(getCorruptScore).reduce((a, b) => a + b);
}

function getCorruptScore(line) {
    const checkRes = checkLine(line);
    return ILLEGAL_CLOSE_SCORES[checkRes.wrongChar] ? ILLEGAL_CLOSE_SCORES[checkRes.wrongChar] : 0;
}

function checkLine(line) {
    const charStack = [];
    for (const c of line) {
        if (OPEN_TO_CLOSE[c]) {
            charStack.push(c);
        } else if (CLOSE_TO_OPEN[c]) {
            const lastOpen = charStack.pop();
            if (lastOpen != CLOSE_TO_OPEN[c]) {
                return {
                    isCorrupt: true,
                    wrongChar: c,
                    closers: null
                }
            }
        }
    }

    const closers = charStack.reverse().map(c => OPEN_TO_CLOSE[c]).filter(c => c);

    return {
        isCorrupt: false,
        wrongChar: null,
        closers: closers
    };
}