const fs = require('fs');


function getInput(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf-8').toString().split('\n\n');
    } catch (ex) {
        console.log(ex);
    }
}

function getMainInput() {
    return getInput('./input/input-day-4.txt');
}

class Line {

    constructor(lineArr, numberMap, board) {
        this.numberMap = numberMap;
        this.board = board;
        this.numbers = lineArr.map(n => parseInt(n));
        this.unmarkedNumbers = new Set(this.numbers);

        this.numbers.forEach(number => {
            if (!this.numberMap[number]) {
                this.numberMap[number] = [];
            }
            this.numberMap[number].push(this);
        });
    }

    getScore() {
        return Array.from(this.unmarkedNumbers).reduce((a, b) => a + b, 0);
    }



    isComplete() {
        return this.unmarkedNumbers.size == 0;
    }

    mark(number) {
        this.unmarkedNumbers.delete(parseInt(number));
        return this.isComplete() ? this.board : null;
    }

    toString() {
        return this.numbers.map(n => this.unmarkedNumbers.has(n) ? ` ${n} ` : `-${n}-`).join('\t');
    }
}

class Board {

    constructor(boardStr, numberMap, boardId) {
        this.numberMap = numberMap;

        const rowArrs = boardStr.split('\n').map(strRow => strRow.trim().split(' ').filter(n => n));
 
        this.rows = rowArrs.map(rowArr => new Line(rowArr, numberMap, this));

        this.columns = rowArrs[0].map((n, i) => new Line(rowArrs.map(arr => arr[i]), numberMap, this));

        this.boardId = boardId;
    }

    getScore() {
        return this.rows.map(row => row.getScore()).reduce((a, b) => a + b);
    }

    toString() {
        return this.boardId + '\n---------------------------------------\n' + this.rows.map(r => r.toString()).join('\n') + '\n---------------------------------------\n' + this.getScore();
    }
}

class Win {
    constructor(board, number) {
        this.board = board;
        this.number = parseInt(number);
    }

    getScore() {
        return this.board.getScore() * this.number;
    }

    toString() {
        return `${this.board.boardId} at ${this.number} - ${this.getScore()}`
    }
}



class Game {
    constructor(inputStrings) {
        this.numbers = inputStrings[0].split(',');
        this.lastIndex = this.numbers.length - 1;
        
        this.numberMap = {};
        this.boards = inputStrings.slice(1).map((boardStr, i) => new Board(boardStr, this.numberMap, i+1));

        this.currentIndex = 0;

        this.wins = [];

        this.unwonBoardIds = new Set(this.boards.map(board => board.boardId));
    }

    playTillFirstWin() {
        while (this.wins.length == 0) {
            this.turn();
        }
        return this.getWinningScore()
    }

    playAllWins() {
        while (this.wins.length < this.boards.length) {
            this.turn();
        }
        return this.getWinningScore()
    }

    draw() {
        if (this.currentIndex < this.lastIndex) {
            this.currentNumber = this.numbers[this.currentIndex];
            this.currentIndex++;
            return this.currentNumber;
        } else {
            return -1;
        }
    }

    markCurrentNumber() {
        if (this.numberMap[this.currentNumber]) {
            const affectedLines = this.numberMap[this.currentNumber];
            for (let i = 0; i < affectedLines.length; i++) {
                const res  = affectedLines[i].mark(this.currentNumber);
                if (res && this.unwonBoardIds.has(res.boardId)) {
                    this.wins.push(new Win(res, this.currentNumber));
                    this.unwonBoardIds.delete(res.boardId);
                }
            }
        }
    }

    turn() {
        if (this.draw() != -1)  {
            this.markCurrentNumber();
            return this.currentNumber;
        } else {
            return -1;
        }

    }

    getWinningScore() {
        return this.wins.length > 0 ? this.wins[this.wins.length - 1].getScore() : -1;
    }

    toString() {
        return `${this.currentNumber}\n\n${this.boards.map(b => b.toString()).join('\n\n')}`;
    }
}


test();
day4A();
day4B();

function test() {
    const game = new Game(getInput('./tests/test-1.txt'));

    game.turn();
    console.log(game.toString());
    const winningScore = game.playTillFirstWin();
    console.log(winningScore);
    console.log(winningScore == 4512);

    const finalScore = game.playAllWins();
    console.log(game.toString());
    console.log(finalScore);
    console.log(finalScore == 1924);

}

function day4A() {
    console.log(playBingoTillFirstWin(getMainInput()));
}


function day4B() {
    console.log(playAllWins(getMainInput()));
}

function playBingoTillFirstWin(inputStrings) {
    return new Game(inputStrings).playTillFirstWin();
}

function playAllWins(inputStrings) {
    return new Game(inputStrings).playAllWins();
}
