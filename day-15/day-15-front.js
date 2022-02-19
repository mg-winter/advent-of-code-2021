import { CalculationModel, CalculationController } from '../front-superclasses.js';
import { default as util } from '../util-v2.js';



class ChitonCaveTraverser extends CalculationModel {
    constructor(strMap) {
        super();
        this.MapArr = strMap.split('\n').map(ln => ln.split('').map(strDigit => parseInt(strDigit)));
        this.Height = this.MapArr.length;
        this.Width = this.MapArr[0].length;
        this.Dimensions = [this.Width, this.Height];
        this.updateNumRepeats(1);
    }

    updateNumRepeats(numRepeats) {
        this.NumRepeats = numRepeats;
        this.TotalWidth = this.NumRepeats * this.Width;
        this.TotalHeight = this.NumRepeats * this.Height;
        this.PointRisks = {};
        
        const repeatsMap = [];

        for (let y = 0; y < this.TotalHeight; y++) {
            repeatsMap[y] = [];
            for (let x = 0; x < this.TotalWidth; x++) {
                const srcX = x % this.Width;
                const srcY = y % this.Height;
                const srcVal = this.MapArr[srcY][srcX];
                const totalAddition = Math.floor(x / this.Width) + Math.floor(y / this.Height);
                const moddedVal = (srcVal + totalAddition) % 9;
                const wrappedVal = moddedVal || 9;

                repeatsMap[y][x] = wrappedVal;

            }
        }
        this.RepeatsMap = repeatsMap;
    }

    isWithinBounds([x, y]) {
        return x >= 0 && y >= 0 && x < this.TotalWidth && y < this.TotalHeight;
    }
    
    static getPointKey(point) {
        return point.join(',');
    }

     getRiskLevel(point) {
        const [x, y] = point;
        return this.RepeatsMap[y][x];
    }

    getLowestRiskPoint(riskPoints) {
        const sortedPoints = [...riskPoints].sort((a, b) => a.risk - b.risk);
        return sortedPoints[0];
    }

    getLowestRiskBreadthFirstStartToEnd(numRepeats) {
        this.updateNumRepeats(numRepeats);
        return this.getLowestRiskPointBreadthFirst([0,0], [this.TotalWidth - 1, this.TotalHeight - 1]).risk;
    }

    getLowestRiskDepthFirstStartToEnd(numRepeats) {
        this.updateNumRepeats(numRepeats);
        return this.getLowestRiskPointDepthFirst([0, 0], [this.TotalWidth - 1, this.TotalHeight - 1]).risk;
    }

    doesNotHaveShorter({ key, risk })  {
        return !this.PointRisks[key] || this.PointRisks[key].risk > risk;
    }

    getNeighbours([x,y]) {
        const candidates = [
            [x + 1, y],
            [x, y + 1],
            [x - 1, y],
            [x, y - 1]
        ];
        return candidates.filter(p => this.isWithinBounds(p));
    }

    getNextStepVal(point, prevPoint) {
        return {
            point: point,
            key: ChitonCaveTraverser.getPointKey(point),
            risk: this.getRiskLevel(point) + (prevPoint?.risk ?? 0),
            prevPoint: prevPoint
        }
    }

    getNextStepVals(pointVal) {
        const nextSteps = this.getNeighbours(pointVal.point).filter(p => ChitonCaveTraverser.getPointKey(p) !== pointVal?.prevPoint?.key);
        return nextSteps.map(p => this.getNextStepVal(p, pointVal))
    }

    getLowestRiskPointBreadthFirst(startPoint, targetPoint) {
    
        
        const startingStep = { point: startPoint, key: ChitonCaveTraverser.getPointKey(startPoint), risk: 0, prevPoint: null };
        this.PointRisks[startingStep.key] = startingStep;
        let pointsToExpand = [startingStep];

        
        const targetPointKey = ChitonCaveTraverser.getPointKey(targetPoint);

        while (pointsToExpand.length > 0 ) {
            const allNextSteps = pointsToExpand.map(p => this.getNextStepVals(p).filter(step => this.doesNotHaveShorter(step))).flat();
            const lowestKnown = allNextSteps;
            const uniqueByPoint = util.distinct(lowestKnown, step => step.key, points => this.getLowestRiskPoint(points));
            for (const step of uniqueByPoint) {
                this.PointRisks[step.key] = step;
            }
            pointsToExpand = uniqueByPoint.filter(p => p.key != targetPointKey);
        }
        
        return this.PointRisks[targetPointKey];
    }
}

class ChitonCaveController extends CalculationController {

}

window.solution = {
    partA: function ({ model, calcParams }) {
        return model.getLowestRiskBreadthFirstStartToEnd(1);
    },
    partB: function ({ model, calcParams }) {
        return model.getLowestRiskBreadthFirstStartToEnd(calcParams['num-repeats']);
    },
    createModel: function (str) {
        return new ChitonCaveTraverser(str);
    },
    createController: function (model, parentElement, visualParams) {
        return new ChitonCaveController(model, parentElement, visualParams);
    },
    hasVisual: false
}