const fs = require('fs');
const path = require('path');

module.exports = {
    getInput: getInput,
    getMainInput: getMainInput,
    getTestInput: getTestInput
};

function getInput(filePath) {
    try {
        const curFile = process.mainModule.filename;
        const fullPath = path.resolve(curFile, '..', filePath);
        return fs.readFileSync(fullPath, 'utf-8').toString();
    } catch (ex) {
        console.log(ex);
    }
}

function getDir(day) {
    return `./day-${day}`
}

function getMainInput(day) {
    return getInput(`${getDir(day)}/input/input-day-${day}.txt`);
}

function getTestInput(day, test) {
    return getInput(`${getDir(day)}/tests/test-${test}.txt`);
}