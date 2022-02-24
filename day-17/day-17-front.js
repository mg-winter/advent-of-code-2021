import { CalculationModel, CalculationController } from '../front-superclasses.js';
import { default as util } from '../util-v2.js';



export class ProbeVelocityCalculator extends CalculationModel {
    constructor(areaDesc) {
        super();

        const coordsStr = areaDesc.split(':')[1].trim();
        const coordsStrArr = coordsStr.split(',').map(str => str.trim());
        const coordsRanges = coordsStrArr.map(str => str.split('=')[1].trim());
        const parsedCoords = coordsRanges.map(range => range.split('..').map(coord => parseInt(coord)));
        [this.StartX, this.EndX] = parsedCoords[0];
        [this.StartY, this.EndY] = parsedCoords[1];

    }
    
    getMaxY() {
        
        
        const maxVelocity = this.getMaxYVelocity();
        const maxY = util.sumNumbersBetween(1, maxVelocity);
        return maxY;
    }

    getMaxYVelocity() {
    /**
     * Calculation:
     * for any given Y velocity v, velocity decreases by 1 with each step.
     * That means the probe will reach sum(1..v), spend one step at velocity 0,
     * will go back down to 0, and then step down by (v+1) to -(v+1). Target area is known to
     * be below 0. We want to maximize v, so maximum v will be the bottom of target area (this.StartY).
     *
     * Therefore, this.StartY = -(v+1).
     *
     */
        return Math.abs(1 + this.StartY);
    }

    getMinYVelocity() {
        /*smallest available velocity is when first step is just inside the area,
        and any smaller will overshoot*/
        return this.StartY;
    }

    /**The biggest available velocity will be when the first step is just inside the area */
    getMaxXVelocity() {
       return this.EndX;
    }

    /**The smallest available velocity will be when the probe stalls to 0 just inside the area,
     * so sum(1...v) as small as possible while >= startX. */
    getMinXVelocity() {
        return ProbeVelocityCalculator.getMinVelocityToX(this.StartX);
    }

    getMinXStep(xVelocity) {
       if (xVelocity >= this.StartX) {
           return 1;
       } else {
           return Math.ceil(ProbeVelocityCalculator.getXStepsToPosition(xVelocity, this.StartX));
       }
    }

    getMaxXStep(xVelocity) {
        if (util.sumFromSameSignMin(xVelocity) <= this.EndX) {
            return Number.POSITIVE_INFINITY;
        } else {
            return Math.floor(ProbeVelocityCalculator.getXStepsToPosition(xVelocity, this.EndX));
        }
    }


    getMinYStep(yVelocity) {
        if (yVelocity <= this.StartY) {
            return 1;
        } else {
            return Math.ceil(ProbeVelocityCalculator.getYStepsToPosition(yVelocity, this.EndY));
        }
        /** */
    }

    getMaxYStep(yVelocity) {
       return Math.floor(ProbeVelocityCalculator.getYStepsToPosition(yVelocity, this.StartY));
    }

    getValidVelocitiesCount() {
        const xVelocities = util.rangeArr({start: this.getMinXVelocity(), end: this.getMaxXVelocity()})
                                .map(v => {return {velocity: v, stepRange: [this.getMinXStep(v), this.getMaxXStep(v)]}});
        const yVelocities = util.rangeArr({ start: this.getMinYVelocity(), end: this.getMaxYVelocity() })
                                 .map(v => { return { velocity: v, stepRange: [this.getMinYStep(v), this.getMaxYStep(v)] } });
                                

        const allPairs = util.cartesianArr(xVelocities, yVelocities);

        const validPairs = allPairs.filter(pair =>ProbeVelocityCalculator.stepsOverlap(pair[0], pair[1]));

        return validPairs.length;

    }

    static getXStepsToPosition(xVelocity, xPosition) {

        /**last velocity
         * 
         * sum(1..xVelocity) = sum(1...lastVelocity - 1) + sum(lastVelocity...xVelocity)
         * = sum(1...lastVelocity - 1) + xPosition;
         * 
         * sum(1..lastVelocity - 1) = sum(1..xVelocity) - xPosition;
         * 
         * 
         * 6 to 20:
         * sum(1...6) = 21
         * sum up to first velocity after: 1
         * summed value: 1
         * return: 5
         */

        const maxDistance = util.sumFromSameSignMin(xVelocity);
        const sumUpToFirstVelocityAfter = maxDistance - xPosition;

        const firstVelocityAfter = ProbeVelocityCalculator.getSummedFrom1(sumUpToFirstVelocityAfter);

        return xVelocity - firstVelocityAfter;
    }

    static getYStepsToPosition(yVelocity, yPosition) {
        const stepsTo0 = ProbeVelocityCalculator.getStepsTo0(yVelocity);
        const firstVelocityAfter0 = ProbeVelocityCalculator.getFirstVelocityAfter0(yVelocity);

        /** convert everything to positives, clunky but less potential for error */

        const positiveVelocity = Math.abs(firstVelocityAfter0);
        const positivePosition = Math.abs(yPosition);

        /** yPosition = sum(positiveVelocity...finalVelocity);
         * sum(1...finalVelocity) = sum(1...positiveVelocity - 1) + yPosition;
         */

        const sum1ToFinalVelocity = positivePosition + util.sumFromSameSignMin(positiveVelocity - 1);
        const finalVelocity = ProbeVelocityCalculator.getSummedFrom1(sum1ToFinalVelocity);
        const velocityDiff = finalVelocity - positiveVelocity;


        return stepsTo0 + velocityDiff + 1;

    }


    static getStepsTo0(yVelocity) {
        return yVelocity < 0 ? 0 : yVelocity * 2 + 1;
    }

    static getFirstVelocityAfter0(yVelocity) {
        return yVelocity >= 0 ? (yVelocity * -1) - 1 : yVelocity;
    }

    static stepsOverlap(xVelocityData, yVelocityData) {
        return util.rangesOverlap(xVelocityData.stepRange, yVelocityData.stepRange);
    }

    static getMinVelocityToX(xPosition) {
        return Math.ceil(ProbeVelocityCalculator.getSummedFrom1(xPosition));
    }

    static getSummedFrom1(n) {

        /**
         * 
         * 
            s = (n + 1)(n - 1) / 2
           
            2s = n^2 + n = (n + 1/2)^2 - 1/4;
            2s + 1/4 = (n + 1/2)^2;
            sqrt(2s + 1/4) - 1/2 = n (from Math stack overflow);

            for values that are not exact sums, calling function can decide how to round.

        */

        if (n == 0) {
            return 0;
        } else {
            const positiveN = Math.abs(n);
            return (Math.sqrt(2 * positiveN + 0.25) - 0.5) * util.oneWithSign(n);
        }
        
    }
}

class DayCalculatorControllerRenameMe extends CalculationController {

}
const container = (typeof window == 'undefined' ? {} : window);
container.solution = {
    partA: function ({ model, calcParams }) {
        return model.getMaxY();
    },
    partB: function ({ model, calcParams }) {
        return model.getValidVelocitiesCount();
    },
    createModel: function (str) {
        return new ProbeVelocityCalculator(str);
    },
    createController: function (model, parentElement, visualParams) {
        return new DayCalculatorControllerRenameMe(model, parentElement, visualParams);
    },
    hasVisual: false
}