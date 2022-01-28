const fs = require('fs');
const path = require('path');
const util = require('../util');

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
    return getInput('./input/input-day-11.txt');
}

test();
day11A();
day11B();

function test() {

}

function day11A() {

}

function day11B() {
    
}