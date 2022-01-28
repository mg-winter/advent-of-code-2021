class OctopusMap {
    constructor(strMap) {
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

    isFlashing(point) {
        return this.getEnergy(point) > 9;
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
        for (let x = 0; x < this.Width; x++) {
            for (let y = 0; y < this.Height; y++) {
                updateFunc([x, y]);
            }
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

        window.dispatchStepEvent(this);
    }

  


    static pointKey(point) {
        return point.join(',')
    }
}


window.solution = {
    partA: async function({input, calcParams, visualParams}) {
        for (let i = 0; i < calcParams.numSteps; i++) {
            await input.step();
        }
        return input.NumFlashes;
    },
    partB: async function({input, calcParams, visualParams}) {
        let i = 0;
        while (!input.IsSynced) {
            await input.step();
            i++;
        }
        return i;
    },
    parseInput: function(str) {
        return new OctopusMap(str);
    },
    readCalcParams: function() {
        return {
            numSteps: parseInt(document.getElementById('num-steps').value)
        };
    },

    initVisual: function({input, calcParams, visualParams}) {

    },

    stepVisual: function(e) {
        const octopusMap = e.detail;
    }
}