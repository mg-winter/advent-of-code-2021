import { CalculationModel, CalculationController } from '../front-superclasses.js';
import { default as util } from '../util-v2.js';


export class SnailfishNumber {

    constructor({str, value}, parent) {
        this.Parent = parent ?? null;
        this.Depth = this.Parent ? this.Parent.Depth + 1 : 0;
        this.setValueAndChildren(value ?? JSON.parse(str));
    }
    
    setValueAndChildren(value) {
        if (util.isPrimitive(value)) {
            this.Value = value;
            this.Left = null;
            this.Right = null;
        } else if (value instanceof SnailfishNumber) {
            this.Value = value.Value;
            this.Left = value.Left ? new SnailfishNumber({value: value.Left}, this) : null;
            this.Right = value.Right ? new SnailfishNumber({value: value.Right}, this) : null;
        } else  {
            this.Value = null;
            [this.Left, this.Right] = value.map(child => new SnailfishNumber({value: child}, this));
        } 
    }

    add(otherSnailfishNumber) {
        const res = new SnailfishNumber({ value: [this, otherSnailfishNumber] })
        return res.reduce();
    }

    reduce() {
        const explodables = this.getExplodableDescendants();
        for (const explodable of explodables) {
            explodable.explode();
        }

        let splittable = util.getFirst(this.getSplittableDescendants());
        while (splittable) {
            splittable.split();
            splittable = util.getFirst(this.getSplittableDescendants());
        }
        return this;
    }

    getExplodableDescendants() {
        return this.leftToRight(n => n.canExplode());
    }

    getSplittableDescendants() {
        return this.leftToRight(n => n.canSplit());
    }

    explode() {
        const leftAdd = this?.Left?.Value ?? 0;
        const rightAdd = this?.Right?.Value ?? 0;
        this.Value = 0;
        this.Left = null;
        this.Right = null;

        const leftNeighbour = this.getLeftRegularNeigbour();
        if (leftNeighbour) {
            leftNeighbour.increaseValue(leftAdd);
        }

        const rightNeighbour = this.getRightRegularNeigbour();
        if (rightNeighbour) {
            rightNeighbour.increaseValue(rightAdd);
        }
    }

    canExplode() {
        return this.Left !== null && this.Right !== null
            && this.Left.isRegularNumber() && this.Right.isRegularNumber()
            && this.isExplodableDepth();
    }

    isExplodableDepth() {
        return this.Depth >= 4;
    }

    split() {
        if (this.canSplit()) {
            const half = this.Value / 2;
            this.Left = new SnailfishNumber({ value: Math.floor(half) }, this);
            this.Right = new SnailfishNumber({ value: Math.ceil(half) }, this);
            this.Value = null;

            if (this.canExplode()) {
                this.explode();
            }
        }
    }

    canSplit() {
        return this.isRegularNumber() && this.Value >= 10;
    }

    getLeftmostRegularNumber() {
        return this.getLeftmost(n => n.isRegularNumber())
    }

    getRightmostRegularNumber() {
        return this.getRightmost(n => n.isRegularNumber());
    }

    getRegularNeighbour(neigbourTreeSelector, subTreeSelector, canSelectChecker) {
        const subTree = neigbourTreeSelector(this);
        if (subTree) {
            return subTreeSelector(subTree);
        } else {
            let curNumber = this;
            while (curNumber && !canSelectChecker(curNumber)) {
                curNumber = curNumber.Parent;
            }
            if (curNumber && curNumber.Parent) {
                return curNumber.Parent.getRegularNeighbour(neigbourTreeSelector, subTreeSelector, canSelectChecker);
            } else {
                return null;
            }
        }
    }

    getLeftmost(yieldCondition, selectCondition) {
        return util.getFirst(this.leftToRight(yieldCondition), selectCondition);
    }

    getRightmost(yieldCondition, selectCondition) {
        return util.getFirst(this.rightToLeft(yieldCondition), selectCondition);
    }

    getLeftRegularNeigbour() {
       return this.getRegularNeighbour(n => n.Left, n => n.getRightmostRegularNumber(), n => !n.isLeft());
    }

    getRightRegularNeigbour() {
        return this.getRegularNeighbour(n => n.Right, n => n.getLeftmostRegularNumber(), n => !n.isRight());
    }

    leftToRight(yieldCondition) {
        return this.inorder(tree => tree.Left, tree => tree.Right, yieldCondition);
    }

    rightToLeft(yieldCondition) {
        return this.inorder(tree => tree.Right, tree => tree.Left, yieldCondition);
    }

    *inorder(firstSideSelector, secondSideSelector, yieldCondition) {
        if (yieldCondition(this)) {
            yield this;
        } else if (this) {
            const firstSide = firstSideSelector(this);
            if (firstSide) {
                yield* firstSide.inorder(firstSideSelector, secondSideSelector, yieldCondition);
            }
            const secondSide = secondSideSelector(this);
            if (secondSide) {
                yield* secondSide.inorder(firstSideSelector, secondSideSelector, yieldCondition);
            }
        }
    }

    increaseValue(incr) {
        this.updateValue(this.Value + incr);
    }

    updateValue(newValue) {
        this.Value = newValue;
    }

    getValue() {
        return this.Value ?? 0;
    }

    getMagnitude() {
        return this.getValue()
                    + (this.Left ? (this.Left.getMagnitude() * 3) : 0) 
                    + (this.Right ? this.Right.getMagnitude() * 2 : 0);
    }

    isRegularNumber() {
        return this.Value !== null;
    }

    isLeft() {
        return this.Parent && this.Parent.Left === this;
    }

    isRight() {
        return this.Parent && this.Parent.Right === this;
    }

    toString() {
        return this.isRegularNumber() ? `${this.getValue()}` : `[${this.Left.toString()},${this.Right.toString()}]`
    }
}

export class SnailfishHomeworkSolver extends CalculationModel {
    constructor(str) {
        super();
        this.SourceNumbers = str.split('\n').map(ln => new SnailfishNumber({str: ln}));
    }
    
    getSum() {
        const additionResult = this.SourceNumbers.reduce((a, b) => a.add(b));
        return additionResult;
    }
    getMagnitudeOfSum() {
        const sum = this.getSum();
        return this.getSum().getMagnitude();
    }

    getLargestMagnitude() {
        const pairs = util.unorderedPairsArr(this.SourceNumbers);
        const magnitudes = pairs.map(SnailfishHomeworkSolver.getLargerMagnitude);
        return Math.max(...magnitudes);
    }

    static getLargerMagnitude([n1, n2]) {
        return Math.max(n1.add(n2).getMagnitude(), n2.add(n1).getMagnitude());
    }
}

class SnailfishHomeworkSolverController extends CalculationController {

}

const container = (typeof window == 'undefined' ? {} : window);
container.solution = {
    partA: function ({ model, calcParams }) {
        return model.getMagnitudeOfSum();
    },
    partB: function ({ model, calcParams }) {
        return model.getLargestMagnitude();
    },
    createModel: function (str) {
        return new SnailfishHomeworkSolver(str);
    },
    createController: function (model, parentElement, visualParams) {
        return new SnailfishHomeworkSolverController(model, parentElement, visualParams);
    },
    hasVisual: false
}