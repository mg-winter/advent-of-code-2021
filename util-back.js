import {default as fs} from 'fs';
import { default as path } from 'path';

const util =  {
    getInput: getInput,
    getMainInput: getMainInput,
    getTestInput: getTestInput
};

function getInput(filePath) {
    try {
        const curFile = new URL(import.meta.url).pathname;     
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
    const fileName = `${getDir(day)}/tests/test-${test}.txt`;
    console.log(fileName);
    return getInput(fileName);
}

export default util;