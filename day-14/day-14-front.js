import { CalculationModel, CalculationController } from '../front-superclasses.js';
import { default as util } from '../util-v2.js';



class PolymerFormulaCalculator extends CalculationModel {
    constructor(strInstructions) {
        super();

        const [templateStr, insertionStr] = strInstructions.split('\n\n');

        this.OriginalTemplate = templateStr;
        this.Template = templateStr;


        const pairRules = insertionStr.split('\n').map(ln => ln.split(' -> '));
        this.InsertionRules = util.toDict(pairRules, arr => arr[0], arr => arr[1]);

        this.InsertionValueCounts = util.getCountsDict(pairRules.map(p => p[1]));

        this.KnownCounts = {};

    }

    getNewSequence([prevInd, nextInd]) {
        const prevLetter = this.Template[prevInd];
        const nextLetter = this.Template[nextInd];

        const insertionKey = `${prevLetter}${nextLetter}`;
        const insertedSequence = this.InsertionRules[insertionKey] ?? '';

        return `${prevLetter}${insertedSequence}`;
    }

    applyStep() {
        const pairIndices = util.rangeArr({start: 0, end: this.Template.length - 2}).map(i => [i, i+1]);
        
        const newTemplate = [...pairIndices.map(pair => this.getNewSequence(pair)), this.Template[this.Template.length - 1]].join('');
        this.Template = newTemplate;

        return newTemplate;
    }

    applyRules(numSteps) {
        for (let i = 0; i < numSteps; i++) {
            this.applyStep();
        }
        return this.getChecksum();
    }

    getChecksum() {
        const counts = util.toKeyValuePairs(util.getCountsDict(this.Template)).sort((a, b) => a.value - b.value);
        console.log(`${counts[0].key}-${counts[0].value} ${counts[counts.length - 1].key}-${counts[counts.length - 1].value}`)
        return counts[counts.length - 1].value - counts[0].value;
    }

    getChecksumFromCounts(numSteps) {
        const counts = this.getAllCounts(numSteps);
        const values = util.toKeyValuePairs(counts).map(p => p.value).sort((a, b) => a - b);
        return values[values.length - 1] - values[0];
    }

    getAllCounts(numSteps) {
        const pairIndices = util.rangeArr({ start: 0, end: this.Template.length - 2 }).map(i => [i, i + 1]);
        const pairs = pairIndices.map(pair => pair.map(i => this.OriginalTemplate[i]).join(''));
        const counts = pairs.map(p => this.getCountForMerge(p, numSteps));
        return PolymerFormulaCalculator.mergeOverlappingPairCounts(counts);
    }

    getCounts(pair, numSteps) {
        if (this.KnownCounts[pair]?.[numSteps]) {
            return this.KnownCounts[pair][numSteps];
        } else {
            const res = this.getUnknownStepCounts(pair, numSteps);
            if (!this.KnownCounts[pair]) {
                this.KnownCounts[pair] = {};
            }
            this.KnownCounts[pair][numSteps] = res;
            return res;
        }

    }

    getUnknownStepCounts(pair, numSteps) {
        if (numSteps == 0) {
            return util.getCountsDict(pair);
        } else {
            const middle = this.InsertionRules[pair];
            const newPairs = [`${pair[0]}${middle}`,`${middle}${pair[1]}`];
            const pairResults = newPairs.map(p => this.getCountForMerge(p, numSteps - 1));
            return PolymerFormulaCalculator.mergeOverlappingPairCounts(pairResults);

        }
    }

    getCountForMerge(pair, numSteps) {
        return {
            sourcePair: pair,
            countDict: this.getCounts(pair, numSteps)
        }
    }

    static mergeOverlappingPairCounts(pairsWithCounts) {
        const overlaps = pairsWithCounts.slice(1).map(pair => pair.sourcePair[0]);
        const overlapSubtractions = util.reduceToAggregateDict(overlaps, (val, item) => val - 1, 0);
        const pairCounts = pairsWithCounts.map(pair => pair.countDict);

        const res = util.mergeDicts([...pairCounts, overlapSubtractions], (count, next) => count + next, 0);


        return res;
    }
}

class PolymerFormulaController extends CalculationController {

}

window.solution = {
    partA: function ({ model, calcParams }) {
        return model.applyRules(calcParams['num-steps']);
    },
    partB: function ({ model, calcParams }) {
        return model.getChecksumFromCounts(calcParams['num-steps-b']);
    },
    createModel: function (str) {
        return new PolymerFormulaCalculator(str);
    },
    createController: function (model, parentElement, visualParams) {
        return new PolymerFormulaController(model, parentElement, visualParams);
    },
    hasVisual: false
}