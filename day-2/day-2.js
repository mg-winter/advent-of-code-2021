const fs = require('fs');

day2A();
day2B();

function day2A() {
    try {
        const finalPosition =  calculatePosition(fs.readFileSync('./input/input-day-2.txt', 'utf-8').toString().split('\n'), 1);
        console.log(finalPosition);
        console.log(finalPosition.depth * finalPosition.horizontal);
    } catch (ex) {
        console.log(ex)
    }
}

function day2B() {
    try {
        const finalPosition = calculatePositionWithAim(fs.readFileSync('./input/input-day-2.txt', 'utf-8').toString().split('\n'), 1);
        console.log(finalPosition);
        console.log(finalPosition.depth * finalPosition.horizontal);
    } catch (ex) {
        console.log(ex)
    }
}

function calculatePosition(instructionStrings) {
    return instructionStrings.map(parseInstruction).reduce(applyInstruction, {depth: 0, horizontal: 0});
}

function calculatePositionWithAim(instructionStrings) {
    return instructionStrings.map(parseInstruction).reduce(applyInstructionWithAim, { aim: 0, horizontal: 0, depth: 0 });
}

function parseInstruction(instructionStr) {
    const split = instructionStr.split(' ');
    return {
        direction: split[0],
        value: parseInt(split[1])
    };
}

function applyInstruction(position, instruction) {
    switch(instruction.direction) {
        case 'forward':
            return { 
                depth: position.depth, 
                horizontal: position.horizontal + instruction.value
            };
        case 'up':
            return {
                depth: position.depth - instruction.value,
                horizontal: position.horizontal
            };
        case 'down':
            return {
                depth: position.depth + instruction.value,
                horizontal: position.horizontal
            };
        default: 
            return position;
    }
}

function applyInstructionWithAim(position, instruction) {
    switch (instruction.direction) {
        case 'forward':
            return {
                aim: position.aim,
                horizontal: position.horizontal + instruction.value,
                depth: position.depth + (position.aim * instruction.value)
            };
        case 'up':
            return {
                aim: position.aim - instruction.value,
                horizontal: position.horizontal,
                depth: position.depth
            };
        case 'down':
            return {
                aim: position.aim + instruction.value,
                horizontal: position.horizontal,
                depth: position.depth
            };
        default:
            return position;
    }
}

