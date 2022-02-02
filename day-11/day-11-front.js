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
        this.IsSynced = false;
        this.Step = 0;
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

    hasFlashed(point) {
        return OctopusMap.isCompleteFlashVal(this.getEnergy(point));
    }

    updateEnergy([x, y], newLevel) {
        this.mapArr[y][x] = newLevel;
    }

    resetPoint(point) {
        if (this.isFlashing(point)) {
            this.updateEnergy(point, 0)
        }
    }

    getAllPoints() {
        return util.cartesianArr(util.range({ start: 0, end: this.Width - 1, step: 1 }), util.range({ start: 0, end: this.Height - 1, step: 1 }));
    }

    updateAllPoints(updateFunc) {
        const points= this.getAllPoints();
        for (const point of points) {
            updateFunc(point);
        }
    }

    resetAll() {
        this.updateAllPoints(p => this.resetPoint(p));
    }

    increaseEnergy(point) {
        this.updateEnergy(point, Math.min(this.getEnergy(point) + 1, 10));
    }

    checkFlashing(point) {
        if (this.isFlashing(point) && !this.hasFlashed(point)) {

            const adjacent = this.getAdjacent(point).filter(p => !this.isFlashing(p) && !this.hasFlashed(p));
            for (const p of adjacent) {
                this.increaseEnergy(p);
            }
            this.resetPoint(point);
            this.NumFlashes++;

            this.pushState({step: this.Step,point: point, flashedTo: adjacent.map(point => {return {point: point, value: this.getEnergy(point)}})}, 1);
            for (const p of adjacent) {
                this.checkFlashing(p);
            }
        }
    }

    checkAllFlashing() {
        this.updateAllPoints(p => this.checkFlashing(p));
    }

    stepAll(numSteps) {
        this.pushState({step: this.Step});
        for (let i = 0; i < numSteps; i++) {
            this.step();
        }
        return this.NumFlashes;
    }

    stepTillSynced(limit=10000) {
        this.pushState({step: this.Step});
        let i = 0;
        while (!this.IsSynced && i < limit) {
            this.step();
            i++;
        }
        return i;
    }

    step() {
 
        this.updateAllPoints(p => this.increaseEnergy(p));
        this.Step++;
        this.pushState({step: this.Step});
        this.checkAllFlashing();
        





        const allEnergies = this.getAllPoints().map(p => this.getEnergy(p));

        this.IsSynced = new Set(allEnergies).size == 1;

        

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

    static getCellClasses(octopusState) {
        return `${octopusState.isFlashing ? 'flashing' : ''} energy-${octopusState.value} octopus`;
    }
    static getRowHtml(row, rowNum) {
        const octopusCells = row.map((cell, colNum) => `<td id="${OctopusMapController.getOctopusId(rowNum, colNum)}" class="${OctopusMapController.getCellClasses(cell)}">${cell.value}</td>`).join('');
        return `<tr><th scope="row"  id="hd-row-${rowNum}">${rowNum}</th><td></td>${octopusCells}</tr>`;
    }

    getStateDescription(state, index) {
        switch(state.Level) {
            case 0:
                const actionDesc = state.DescriptionData.step > 0 ? 'Increment all octopi' : 'Initial map';
                return `Step ${state.DescriptionData.step}. ${actionDesc}.`;
            case 1:
                const flashedToStr = state.DescriptionData.flashedTo.map(pointObj => `${pointObj.point} to ${pointObj.value}`).join('; ') || 'no other points'
                return `Step ${state.DescriptionData.step}. ${state.DescriptionData.point} flashed, incremented ${flashedToStr}`;
            default:
                return `State ${index}`;
        }
    }

    getInitialHtml(state, index) {
        const colHeadings = util.rangeArr({end: this.Model.Width - 1}).map(i => `<th scope="col" >${i}</th>`).join('');
    
        const rows = state.Value.map(OctopusMapController.getRowHtml).join('');

        return `<table cellpadding="0" cellspacing="0" border="0" id="octopus-grid">`
                 + `<caption aria-live="assertive">${this.getStateDescription(state, index)}</caption>`
            + `<thead><tr><td></td><th scope="row" >x</th>${colHeadings}</tr><tr><th scope="col" >y</th></tr></thead>`
               + `<tbody>${rows}</tbody>`
                + `</table>`
    }

    renderState(state) {
        const points = util.cartesian(util.range({end: state.Value[0].length - 1}),util.range({end: state.Value.length - 1}));
        for (const [x, y] of points) {
            this.Cells[y][x].innerHTML = state.Value[y][x].value;
            this.Cells[y][x].className = OctopusMapController.getCellClasses(state.Value[y][x]);
        }
    }

    setUpDom() {
        this.Cells = Array.from(this.ParentElement.querySelectorAll('#octopus-grid tbody tr')).map(row => Array.from(row.querySelectorAll('td.octopus')));
        this.setDescriptionContainer(this.ParentElement.querySelector('table caption'));
    }
}
window.solution = {
    partA: function({model, calcParams}) {
        return model.stepAll(calcParams.numSteps);
    },
    partB: function({model, calcParams}) {
       return model.stepTillSynced();
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