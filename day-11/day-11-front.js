import { CalculationModel, CalculationController } from '../front-superclasses.js';
import {default as util} from '../util-v2.js';

class OctopusMap extends CalculationModel {
    constructor(strMap) {
        super();

        this.NumFlashes = 0;
        this.mapArr = strMap.split('\n').map(ln => ln.split('').map(strDigit => parseInt(strDigit)));
        this.Height = this.mapArr.length;
        this.Width = this.mapArr[0].length;
        this.NumOctopi = this.Height * this.Width;
        this.flashing = new Set();
        this.IsSynced = false;
    }

    isWithinBounds([x, y]) {
        return x >= 0 && y >= 0 && x < this.Width && y < this.Height;
    }

    static getPotentialAdjacent([x, y]) {
        return [[x + 1, y],
                [x + 1, y + 1],
                [x + 1, y - 1],
                [x, y + 1],
                [x, y - 1],
                [x - 1, y],
                [x - 1, y + 1],
                [x - 1, y - 1]]
    }

    getAdjacent(point) {
        return OctopusMap.getPotentialAdjacent(point).filter(p => this.isWithinBounds(p));
    }

    getEnergy([x, y]) {
        return this.mapArr[y][x];
    }

    static isFlashVal(val) {
        return val > 9;
    }

    static isCompleteFlashVal(val) {
        return val == 0;
    }

    isFlashing(point) {
        return OctopusMap.isFlashVal(this.getEnergy(point));
    }

    updateEnergy([x, y], newLevel) {
        this.mapArr[y][x] = newLevel;
    }

    resetPoint(point) {
        if (this.isFlashing(point)) {
            this.updateEnergy(point, 0)
        }
    }

    updateAllPoints(updateFunc) {
        const points= util.cartesianArr(util.range({start: 0, end: this.Width - 1, step: 1}), util.range({start: 0, end: this.Height - 1, step: 1}));
        for (const point of points) {
            updateFunc(point);
        }
    }

    resetAll() {
        this.updateAllPoints(p => this.resetPoint(p));
    }

    increaseEnergy(point) {
        this.updateEnergy(point, this.getEnergy(point) + 1);
    }

    checkFlashing(point) {
        const pointKey = OctopusMap.pointKey(point);
        if (this.isFlashing(point) && !this.flashing.has(pointKey)) {
            this.flashing.add(pointKey);

            const adjacent = this.getAdjacent(point).filter(p => !this.isFlashing(p));
            for (const p of adjacent) {
                this.increaseEnergy(p);
            }
            for (const p of adjacent) {
                this.checkFlashing(p);
            }
        }
    }

    checkAllFlashing() {
        this.updateAllPoints(p => this.checkFlashing(p));
    }

    step() {
        this.flashing = new Set();
        this.updateAllPoints(p => this.increaseEnergy(p));
        this.checkAllFlashing();
        this.resetAll();



        this.NumFlashes += this.flashing.size;

        this.IsSynced = this.flashing.size == this.NumOctopi;

        this.pushState();

    }

  
    getState() {
        return this.mapArr.map(row => row.map(value => {return {value: value, isFlashing: OctopusMap.isCompleteFlashVal(value)}}))
    }


    static pointKey(point) {
        return point.join(',')
    }
}

class OctopusMapController extends CalculationController {
    
    static getOctopusId(rowNum, colNum) {
        return `octopus-${rowNum}-${colNum}`;
    }

    static getRowHtml(row, rowNum) {
        const octopusCells = row.map((cell, colNum) => `<td id="${OctopusMapController.getOctopusId(rowNum, colNum)}" class="${cell.isFlashing ? 'flashing' : 'not-flashing'}">${cell.value}</td>`).join('');
        return `<tr><th scope="row" id="hd-row-${rowNum}">${rowNum}</th>${octopusCells}</tr>`;
    }

    getInitialHtml(state) {
        const colHeadings = util.rangeArr({end: this.Model.Width - 1}).map(i => `<th scope="col">${i}</th>`).join('');
    
        const rows = state.Value.map(OctopusMapController.getRowHtml).join('');

        return `<table id="octopus-grid" summary="Octopi positions displayed in a ${this.Model.Width} by ${this.Model.Height} grid">`
                 + `<caption>Octopus grid</caption>`
                 + `<thead><tr><th scope="col"></th>${colHeadings}</tr></thead>`
               + `<tbody>${rows}</tbody>`
                + `</table>`
    }

    renderState(state) {
        console.log(state)
        const points = util.cartesian(util.range({end: state.Value[0].length - 1}),util.range({end: state.Value.length - 1}));
        for (const point of points) {
            this.Cells[point[1]][point[0]].innerHTML = state.Value[point[1]][point[0]].value;
            this.Cells[point[1]][point[0]].className = state.Value[point[1]][point[0]].isFlashing ? 'flashing' : 'not-flashing';
        }
    }

    setUpDom() {
        this.Cells = Array.from(this.ParentElement.querySelectorAll('#octopus-grid tbody tr')).map(row => Array.from(row.querySelectorAll('td')));
    }
}
window.solution = {
    partA: function({model, calcParams}) {
        for (let i = 0; i < calcParams.numSteps; i++) {
            model.step();
        }
        return model.NumFlashes;
    },
    partB: function({model, calcParams}) {
        let i = 0;
        while (!model.IsSynced && i < 10000) {
            model.step();
            i++;
        }
        return i;
    },
    createModel: function(str) {
        return new OctopusMap(str);
    },
    createController: function(model, parentElement, visualParams) {
        return new OctopusMapController(model, parentElement, visualParams);
    },
    readCalcParams: function(inputs) {
        return {
            numSteps: parseInt(inputs['num-steps'])
        };
    },
    hasVisual: true
}