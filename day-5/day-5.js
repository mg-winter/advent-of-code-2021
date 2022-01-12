const fs = require('fs');
const OVERLAP_STRATEGY = {
    BRUTE: 0,
    REGION: 1
}

function getInput(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf-8').toString().split('\n');
    } catch (ex) {
        console.log(ex);
    }
}

function getMainInput() {
    return getInput('./input/input-day-5.txt');
}

class Slope {
    constructor(point1, point2) {
        const rawDeltaX = point2.x - point1.x;
        const rawDeltaY = point2.y - point1.y;

        this.deltaX = rawDeltaY == 0 ? oneWithSign(rawDeltaX) : rawDeltaX;
        this.deltaY = rawDeltaX == 0 ? oneWithSign(rawDeltaY) : rawDeltaY;
        this.decimalSlope = rawDeltaX == 0 ? Math.NaN : rawDeltaY / rawDeltaX;
    }

    isDiagonal() {
        return this.deltaX != 0 && this.deltaY != 0;
    }

    isVertical() {
        return this.deltaX == 0;
    }

    getDecimalSlope() {
        return this.decimalSlope;
    }

    isParallel(otherSlope) {
        return this.isVertical() ? otherSlope.isVertical() : !otherSlope.isVertical() && otherSlope.getDecimalSlope() == this.getDecimalSlope();
    }

    getXStep() {
        return this.deltaX;
    }

    calculateYOffset(xOffset) {
        return this.isVertical() ? Math.NaN : xOffset * this.getDecimalSlope();
    }

    toString() {
        return `${this.deltaY} / ${this.deltaX} (${this.getDecimalSlope()})`;
    }

}

class Point {
    constructor({coordsStr = '', coords = []} = {}) {
        const coordsArr = coords.length > 0 ? coords : coordsStr.trim().split(',').map(strCoord => parseInt(strCoord));
        [this.x, this.y] = coordsArr;
    }

    getCoordsObj () {
        return{x: this.x, y: this.y
        };
    }

    toString() {
        return `${this.x},${this.y}`;
    }

    equals(otherPoint) {
        return otherPoint != null && otherPoint.x == this.x && otherPoint.y == this.y;
    }

    getOffsetPoint(newX, slope) {
        return this.y + slope.calculateYOffset(newX - this.x);
    }
}
class Line {
    constructor({lineStr, points=[]} = {}) {
        const pointsArr = points.length > 0 ? points : lineStr.split(' -> ').map(coordsStr => new Point({ coordsStr: coordsStr }));
        [this.from, this.to] = pointsArr;
        if (!this.to) {
            this.to = this.from;
        }
        this.slope = new Slope(this.from, this.to);
    }

    getXRange() {
        return [this.from.x, this.to.x].sort((a, b) => a - b);
    }

    getYRange() {
        return [this.from.y, this.to.y].sort((a, b) => a - b);
    }

    getPointsLTR() {
        return [this.from, this.to].sort((p1, p2) => p1.x - p2.x);
    }

    isOnInfiniteLine(point) {
        if (this.isVertical()) {
            return point.x == this.from.x;
        } else {
            return point.y == this.extendToX(point.x);
        }
    }


    isInRect(point) {
        const xRange = this.getXRange();
        const yRange = this.getYRange();

        return point.x >= xRange[0] && point.x <= xRange[1] && point.y >= yRange[0] && point.y <= yRange[1];
    }

    contains(point) {
        return this.isZeroLength() ? this.from.equals(point) :  this.isOnInfiniteLine(point) && this.isInRect(point);
    }

    isParallel(otherLine) {
        return !this.isDiagonal() &&  this.slope.isParallel(otherLine.slope);
    }

    isDiagonal() {
        return this.slope.isDiagonal();
    }

    isVertical() {
        return this.slope.isVertical();
    }

    hasOverlap(otherLine) {
        return this.isParallel(otherLine) &&  (this.contains(otherLine.from) || this.contains(otherLine.to) || otherLine.contains(this.from));
    }

    extendToX(newX) {
        return this.from.getOffsetPoint(newX, this.slope)
    }
    getOverlap(otherLine) {
        if (this.hasOverlap(otherLine)) {
             const [rangeFunc, stepSize, rangeValToPointFunc] = this.isVertical() ? 
                                                    [l => l.getYRange(), 1, y => new Point({coords: [this.from.x, y]})] : 
                                                    [l => l.getXRange(), this.slope.getXStep(), x => new Point({coords: [x, this.extendToX(x)]})];
            
            const [rangeStart, rangeEnd] = getOverlapRange(rangeFunc(this), rangeFunc(otherLine));
            const rangeValArr = rangeArr({ start: rangeStart, end: rangeEnd, step: stepSize });
            return rangeValArr.map(rangeValToPointFunc);
         } else {
            return [];
        }
    }

    isZeroLength() {
        return this.from.equals(this.to);
    }

    getIntersectionX(otherLine) {
        if (this.isParallel(otherLine)) {
            return Math.NaN;
        } else if (this.isVertical() || otherLine.isVertical()) {
            return (this.isVertical() ? this : otherLine).from.x;
        } else {
            const thisSlope = this.slope.getDecimalSlope();
            const otherSlope = otherLine.slope.getDecimalSlope();

            const thisLeft = this.getPointsLTR()[0];
            const otherLeft = otherLine.getPointsLTR()[0];
            return (thisLeft.y - otherLeft.y - (thisSlope * thisLeft.x) + (otherSlope * otherLeft.x)) / (otherSlope - thisSlope);
        }
    }

    getIntersection(otherLine) {
        if (this.isZeroLength()) {
            return otherLine.contains(this.from) ? this.from : null;
        } else if (otherLine.isZeroLength()) {
            return this.contains(otherLine.from) ? otherLine.from : null;
        } else {
            const intersectionX = this.getIntersectionX(otherLine);
            if (intersectionX == Math.NaN) {
                return null;
            } else {

                const lineToExtend = this.isVertical() ? otherLine : this;
                const intersectionY = lineToExtend.extendToX(intersectionX);
                const intersectionPoint = new Point({coords:[intersectionX, intersectionY]});

                return this.isInRect(intersectionPoint) && otherLine.contains(intersectionPoint) ? intersectionPoint : null;
            }
        }
    }

    getIntersectionAsArray(otherLine) {
        const intersection = this.getIntersection(otherLine);
        return intersection ? [intersection] : [];
    }

    getAllOverlapPoints(otherLine) {
        const overlaps = this.getOverlap(otherLine)
        return  overlaps.length > 0 ? overlaps : this.getIntersectionAsArray(otherLine);
    }

    /**
     * 
xxxxxbbbbb
xxxxxb.2.b
xxxxxb11/b
xxxxxb./.b
xxxxxb/bbb
xxxxx/xxxx
xxxxxxxxxx
xxxxxxxxxx
xxxxxxxxxx
xxxxxxxxxx
     */
    clipToRegion(region) {
        const containedPoints = [this.from, this.to].filter(p => region.contains(p));

        const requiredLength = region.isAtomic() ? 1 : 2;
        if (containedPoints.length >= requiredLength) {
            return this;
        } else {
            const intersections = region.boundLines.map(l => this.getIntersection(l));
            const uniqueIntersections = distinctByStringNoNull(intersections); 

            const newPoints = uniqueIntersections.concat(containedPoints);
            
            return newPoints.length >= 1 ? new Line({points: newPoints}) : null;
        }
    }

    toString() {
        return `${this.from.toString()} -> ${this.to.toString()} [Slope ${this.slope.toString()}]`;
    }
}

class Region {
    constructor(point1, point2) {
        this.topLeft = new Point({coords: [Math.min(point1.x, point2.x), Math.min(point1.y, point2.y)]});
        this.bottomRight = new Point({ coords: [Math.max(point1.x, point2.x), Math.max(point1.y, point2.y)] });
        this.bottomLeft = new Point({ coords: [this.topLeft.x, this.bottomRight.y] });
        this.topRight = new Point({ coords: [this.bottomRight.x, this.topLeft.y] });

        this.height = this.bottomRight.y - this.topLeft.y;
        this.width = this.bottomRight.x - this.topLeft.x;

        this.boundLines = [new Line({points: [this.topLeft, this.bottomLeft]}),
                            new Line({points: [this.topLeft, this.topRight]}),
                            new Line({points: [this.bottomRight, this.bottomLeft]}),
                            new Line({points: [this.bottomRight, this.topRight]})];
    }

    contains(point) {
        return     point.x >= this.topLeft.x && point.y >= this.topLeft.y 
                && point.x <= this.bottomRight.x && point.y <= this.bottomRight.y;
    }

    split() {
        const xSplits = Region.splitCoord(this.topLeft.x, this.width);
        const ySplits = Region.splitCoord(this.topLeft.y, this.height);

        const splitPairs = cartesianArr(xSplits, ySplits);

        return splitPairs.map(p => new Region(new Point({coords: [p[0].from, p[1].from]}), new Point({coords:[p[0].to, p[1].to]})));
    }

    isAtomic() {
        return this.height < 1 && this.width < 1;
    }

    getContainedPoints(clippables, minObjects) {
        const clipped = this.clipAll(clippables);
        if (clipped.length < minObjects) {
            return [];
        } else if (this.isAtomic()) {
            return [this.topLeft];
        } else {
            const subRegions = this.split();
            const pointSets = subRegions.map(reg => reg.getContainedPoints(clipped, minObjects));
            return arrayFlat(pointSets);
        }
    }

    clipAll(clippables) {
        return arrayFlat(clippables.map(c => c.clipToRegion(this)).filter(clipped => clipped != null));
    }

    static splitCoord(coord, size) {
        if (size < 1) {
            return [{
                from: coord,
                to: coord
            }]
        } else {
           
            const splitSize = Math.floor(size / 2);

            return [{from: coord, to: coord + splitSize}, {from: coord + splitSize + 1, to: coord + size}];
        }
    }

    toString() {
        return [this.topLeft, this.topRight, this.bottomRight, this.bottomLeft].map(p => p.toString()).join('; ');
    }
}

test();
day5A();
day5B();

function test() {
    const lines = getInput('./tests/test-1.txt');
    const lineObjs = lines.map(l => new Line({lineStr: l}));
    lineObjs.forEach(l => console.log(l.toString()));

    const fullRegion = new Region(new Point({ coords: [0, 0] }), new Point({ coords: [9, 9] }));

    const overlapTest = lineObjs[0].getOverlap(lineObjs[6]);
    console.log(overlapTest.map(p => p.toString()).join(';') =='0,9;1,9;2,9');

    

    const intersectionTest = lineObjs[4].getIntersection(lineObjs[2]);
    console.log(intersectionTest.toString() == '7,4');


    const diagonalIntersectionTest = lineObjs[8].getIntersection(lineObjs[3]);
    console.log(diagonalIntersectionTest);
    console.log(diagonalIntersectionTest.toString() == '2,2');


    const diagonalIntersectionTest2 = lineObjs[8].getIntersection(lineObjs[9]);
    console.log(diagonalIntersectionTest2);
    console.log(diagonalIntersectionTest2.toString() == '5,5');


    const numOverlaps = getNonDiagonalOverlaps(lines);
    console.log(numOverlaps);
    console.log(numOverlaps == 5);

    
    let regions = [fullRegion];
    let prevLength = -1;

    while(regions.length != prevLength) {
        prevLength = regions.length;
        regions = arrayFlat(regions.map(r => r.split()));
    }

    console.log(regions.map(r => r.toString()).join('\n'));
    console.log(regions.length == 100);
    console.log(regions.filter(r => r.isAtomic()).length == regions.length);


    const horLine = lineObjs[2];

    const intersectClip = horLine.clipToRegion(new Region(new Point({ coords: [7, 1] }), new Point({ coords: [5, 6] })))
    console.log(intersectClip);

    const fromInClip = horLine.clipToRegion(new Region(new Point({ coords: [9, 1] }), new Point({ coords: [5, 6] })))
    console.log(fromInClip);

    const toInClip = horLine.clipToRegion(new Region(new Point({ coords: [7, 1] }), new Point({ coords: [1, 6] })))
    console.log(toInClip);


    const atomicRegion = horLine.clipToRegion(new Region(new Point({ coords: [7, 4] }), new Point({ coords: [7,4] })))
    console.log(atomicRegion);

    const diagonalLine3 = lineObjs[8];
    const diagonalPointsTest = fullRegion.getContainedPoints([diagonalLine3], 1);
    console.log(diagonalPointsTest);
    console.log(diagonalPointsTest.length == 9);

    const diagonalLine4 = lineObjs[9];
    const diagonalPointsTest2 = fullRegion.getContainedPoints([diagonalLine4], 1);
    console.log(diagonalPointsTest2);
    console.log(diagonalPointsTest2.length == 4);


    const numOverlapsOrthog= getNonDiagonalOverlaps(lines);
    console.log(numOverlapsOrthog);
    console.log(numOverlapsOrthog == 5);

    const numOverlapsRegion = getNonDiagonalOverlaps(lines, OVERLAP_STRATEGY.REGION);
    console.log(numOverlapsRegion);
    console.log(numOverlapsRegion == 5);

    const numAllOverlaps = getAllOverlaps(lines);
    console.log(numAllOverlaps);
    console.log(numAllOverlaps == 12);

    const numAllOverlapsRegion = getAllOverlaps(lines, OVERLAP_STRATEGY.REGION);
    console.log(numAllOverlapsRegion);
    console.log(numAllOverlapsRegion == 12);


}

function day5A() {
    console.log(getNonDiagonalOverlaps(getMainInput(), OVERLAP_STRATEGY.REGION));
}
function day5B() {
    console.log(getAllOverlaps(getMainInput(), OVERLAP_STRATEGY.REGION));
}

function getNonDiagonalOverlaps(inputLines, strategy) {
   return getOverlaps(inputLines, l => !l.isDiagonal(), strategy)
}

function getAllOverlaps(inputLines, strategy) {
    return getOverlaps(inputLines, null, strategy);
}

function getOverlaps(inputLines, lineFilterFunc, strategy) {
    const safeFilterFunc = lineFilterFunc ? lineFilterFunc : (l => true);

    const lineObjects = inputLines.map(lineStr => new Line({ lineStr: lineStr })).filter(safeFilterFunc);


    const allPoints = strategy == OVERLAP_STRATEGY.REGION ? getOverlapsRegion(lineObjects) :  getOverlapsBruteForcePairs(lineObjects);

  
    return allPoints.length;

}

function getOverlapsBruteForcePairs(lineObjects) {
    const pointSets = unorderedPairsArr(lineObjects).map(pair => pair[0].getAllOverlapPoints(pair[1]));
    const allPoints = distinctByStringNoNull(arrayFlat(pointSets)); 
    return allPoints;
}

function getOverlapsRegion(lineObjects) {
    const allPoints = arrayFlat(lineObjects.map(lo => [lo.from, lo.to]));
    const sortedByX = allPoints.map(p => p.x).sort((a, b) => a - b);
    const sortedByY = allPoints.map(p => p.y).sort((a, b) => a - b);

    const lastIndex = allPoints.length - 1;

    const topLeft = new Point({ coords: [sortedByX[0], sortedByY[0]] });
    const bottomRight = new Point({coords: [sortedByX[lastIndex], sortedByY[lastIndex]]});

    const region = new Region(topLeft, bottomRight);

    return region.getContainedPoints(lineObjects, 2);
}

function oneWithSign(number) {
    return number / Math.abs(number);
}

function getOverlapRange(thisRange, otherRange) {
    return [Math.max(thisRange[0], otherRange[0]), Math.min(thisRange[1], otherRange[1])];
}

function* range({start = 0, end = 0, step = 1}) {
    for (let i = start; i <= end; i++) {
        yield i;
    }
}

function rangeArr({start = 0, end = 0, step = 1}) {
    return [...range({start: start, end: end, step: step})];
}

function* unorderedPairs(arr) {
    const secondLast = arr.length - 1;
    for (i = 0; i < secondLast; i++) {
        for (j = i + 1; j < arr.length; j++) {
           
            yield [arr[i], arr[j]];
        }
    }
}

function unorderedPairsArr(arr) {
    return [...unorderedPairs(arr)];
}

function* cartesian(arr1, arr2) {
    for (const x1 of arr1) {
        for (const x2 of arr2) {
            yield [x1, x2];
        }
    }
}

function cartesianArr(arr1, arr2) {
    return [...cartesian(arr1, arr2)];
}

function arrayFlat(arr) {
    return arr.reduce((acc, arr) => acc.concat(arr), []);
}

function distinctByStringNoNull(arr) {
    return arr.reduce(distinctByStringNoNullReducer, { objMap: {}, list: [] }).list;
}

function distinctByStringNoNullReducer(acc, newVal) {
    if (newVal == null) {
        return acc;
    } else {
        const key = newVal.toString();
        if (acc.objMap[key]) {
            return acc;
        } else {
            const newMap = {};
            newMap[key] = newVal;
            return {
                objMap: Object.assign(newMap, acc.objMap),
                list: acc.list.concat([newVal])
            }
        }
    }
}

