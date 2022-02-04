import { CalculationModel } from '../front-superclasses.js';

class Cave {
    constructor(name) {
        this.Name = name;
        this.IsBig = name[0].toUpperCase() == name[0];
        this.IsStart = name == 'start';
        this.IsEnd = name == 'end';
        this.ConnectedCaves = new Set();
    }

    getConnectedCaves() {
       return Array.from(this.ConnectedCaves);
    }

    getValidCaves(pathSoFar, prohibitedLoopSelector) {
        if (pathSoFar.length == 0) {
            return this.getConnectedCaves();
        } else {
            const invalidCaves = new Set(prohibitedLoopSelector(pathSoFar));
            return this.getConnectedCaves().filter(cave => !invalidCaves.has(cave));
        }
    }

    getPathsTo(targetName, pathSoFar, prohibitedLoopSelector) {
        const newPath = [...pathSoFar, this];
        if (this.Name == targetName) {
            return [newPath];
        } else {
            return this.getValidCaves(newPath, prohibitedLoopSelector).map(cave => cave.getPathsTo(targetName, newPath, prohibitedLoopSelector)).flat(1);
        } 
    }

    addConnected(otherCave) {
        this.ConnectedCaves.add(otherCave);
        otherCave.ConnectedCaves.add(this);
    }
}

class CaveTraversal extends CalculationModel {
    constructor(str) {
        super();
        this.Caves = {};
        const mapLines = str.split('\n');
        for (const line of mapLines) {
            this.addConnection(line.split('-'));
        }

    }

    addConnection(names) {
        const [cave1, cave2] = names.map(name => this.ensureAdded(name));
        cave1.addConnected(cave2);
    }

    ensureAdded(name) {
        if (!this.Caves[name]) {
            this.Caves[name] = new Cave(name);
        }
        return this.Caves[name];
    }

    getAllPaths(allowedLoopSelector) {
        return this.Caves['start'].getPathsTo('end', [], allowedLoopSelector);
    }
}

function prohibitedLoopsPartA(path) {
    return path.filter(cave => !cave.IsBig);
}

function prohibitedLoopsPartB(path) {
    const smallOnly = prohibitedLoopsPartA(path);
    const hasLoop = smallOnly.length > new Set(smallOnly).size;
    return hasLoop ? smallOnly : smallOnly.filter(c => (c.IsStart || c.IsEnd));
}

window.solution = {
    partA: function ({ model, calcParams }) {
        return model.getAllPaths(prohibitedLoopsPartA).length;
    },
    partB: function ({ model, calcParams }) {
        return model.getAllPaths(prohibitedLoopsPartB).length;
    },
    createModel: function (str) {
        return new CaveTraversal(str);
    },
    hasVisual: false
}