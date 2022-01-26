const fs = require('fs');
const path = require('path');
const util = require('../util');

class Basin {
    constructor(points) {
        this.points = points;
    }

    add(point) {
        this.points.push(point);
    }

    merge(otherBasin) {
        const allPoints = Array.from(new Set(this.points.concat(otherBasin.points)));
        return new Basin(allPoints);
    }

    getPoints() {
        return this.points.map(p => p);
    }

    size() {
        return this.points.length;
    }
}
class HeightMap {
    constructor(strMap) {
        this.Heights = strMap.split('\n').map(line => line.split('').map(digit => parseInt(digit)));
        this.width = this.Heights[0].length;
        this.length = this.Heights.length;
        this.notLowest = new Set();
        this.lowPoints = [];
    }

    isValidCoord([x, y]) {
        return x >= 0 && y >= 0 && x < this.width && y < this.length;
    }

    isKnownNotLowest(point) {
        const key = HeightMap.getPointKey(point);
        return this.notLowest.has(key);
    }

    recordNotLowest(point) {
        const key = HeightMap.getPointKey(point);
        this.notLowest.add(key);
    }

    isRidge(point) {
        return this.getHeight(point) == 9;
    }

    findBasins() {
       const basins = new Set();
       //scan line by line, starting a basin at each ridge
       //if any coordinate in the basin connects to a basin above,
       //merge the basins
       let prevLineBasins = {};
       for (let y = 0; y < this.length; y++) {
           const curLineBasins = {};
           let curBasin = new Basin([]);
           for (let x = 0; x < this.width; x++) {
               const point = [x, y];
                if (this.isRidge(point)) {
                    curBasin = new Basin([]);
                } else {
                    if (curBasin.size() == 0) {
                        basins.add(curBasin);
                    }
                    curBasin.add(point);
                    //check if we should join to a basin above
                    const pointAbove = `${x},${y-1}`;
                    curLineBasins[HeightMap.getPointKey(point)] = curBasin;
                    
                    if (prevLineBasins[pointAbove]) {
                        const otherBasin = prevLineBasins[pointAbove];
                        const mergedBasin = curBasin.merge(otherBasin);
                        const mergedPoints = mergedBasin.getPoints();

                        basins.delete(curBasin);
                        basins.delete(otherBasin);
                        basins.add(mergedBasin);

                        for (const mergedPoint of mergedPoints) {
                            const pointKey = HeightMap.getPointKey(mergedPoint);
                            if (prevLineBasins[pointKey] == otherBasin || prevLineBasins[pointKey] == curBasin) {
                                prevLineBasins[pointKey] = mergedBasin;
                            }
                            if (curLineBasins[pointKey] == otherBasin || curLineBasins[pointKey] == curBasin) {
                                curLineBasins[pointKey] = mergedBasin;
                            }
                        }
                        curBasin = mergedBasin;

                    }
                }
           }
           prevLineBasins = curLineBasins;
       }

       return Array.from(basins);
    }

    getBasinResult() {
        const basinSizes = this.findBasins().map(b => b.size()).sort((a, b) => b - a);
        return basinSizes.slice(0,3).reduce((a, b) => a * b);
    }
    findLowHeights() {
        const xCoords = util.rangeArr({start: 0, end: this.width - 1});
        const yCoords = util.rangeArr({start: 0, end: this.length - 1});

        const pairs = util.cartesianArr(xCoords, yCoords)

        const lowHeights = pairs.map(p => this.checkLowPoint(p)).filter(p => p != null);

        return lowHeights.map(p => p.height);;


    }

    findRiskLevel() {
        return this.findLowHeights().map(HeightMap.getRiskLevelOfHeight).reduce((a, b) => a + b);
    }

    checkLowPoint(point) {
        if (this.isValidCoord(point) && !this.isKnownNotLowest(point)) {
            const height = this.getHeight(point);
            const neigbours = this.getNeighbours(point);
            const lowerNeighbourHeights = neigbours.map(c => this.getHeight(c)).filter(h => h <= height);
            if (lowerNeighbourHeights.length > 0) {
                return null;
            }  else {
                const retVal = {coords: point, height: height};
                this.lowPoints.push(HeightMap.getPointKey(point));
                for (const neighbour of neigbours) {
                   this.recordNotLowest(neighbour);
                }
                return  retVal;
            }
            
        } else {
            return null;
        }
    }

    getHeight([x, y]) {
        return this.Heights[y][x];
    }

    getNeighbours(point) {
        return HeightMap.getPotentialNeigbours(point).filter(c => this.isValidCoord(c));
    }

    static getPotentialNeigbours([x, y]) {
        return [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
    }

    static getPointKey([x, y]) {
        return `${x},${y}`;
    }

    static getRiskLevelOfHeight(height) {
        return height + 1;
    }

    getRiskLevel(point) {
        return HeightMap.getRiskLevelOfHeight(this.getHeight(point));
    }
}


function getInput(filePath) {
    try {
        const curFile = process.mainModule.filename;
        const fullPath = path.resolve(curFile, '..', filePath);
        return new HeightMap(fs.readFileSync(fullPath, 'utf-8').toString());
    } catch (ex) {
        console.log(ex);
    }
}

function getMainInput() {
    return getInput('./input/input-day-9.txt');
}

test();
day9A();
day9B();

function test() {
    const testMap = getInput('./tests/test-1.txt');
    const res = testMap.findRiskLevel();
    console.log(res == 15);

    console.log(testMap.getBasinResult() == 1134);
}

function day9A() {
    console.log(getMainInput().findRiskLevel());
}

function day9B() {
    console.log(getMainInput().getBasinResult());
}