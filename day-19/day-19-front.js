import { CalculationModel, CalculationController } from '../front-superclasses.js';
import { default as util } from '../util-v2.js';

function hornerHashCode(unorderedNumbers) {
    const orderedNumbers = [...unorderedNumbers].sort((a, b) => a - b);
    return orderedNumbers.reduce((a, n) => a * 31 + n, 0)
}

export class Rotation {
        constructor(order, multipliers) {
        this.Order = order ?? [0,1,2];
        this.Multipliers = multipliers ?? [1,1,1];
    }

    rotate(coords) {
        const reorderedCoords = Rotation.reorderCoords(this.Order, coords);
        const flippedCoords = Rotation.flipCoords(reorderedCoords, this.Multipliers);
        return flippedCoords;
    }

    combine(otherRotation) {
        const newOrder = otherRotation.Order.map(c => this.Order[c]); //Rotation.reorderCoords(this.Order, otherRotation.Order);
        const rotatedMultipliers = Rotation.reorderCoords(otherRotation.Order, this.Multipliers)
        const newMultipliers = Rotation.flipCoords(rotatedMultipliers, otherRotation.Multipliers);
        return new Rotation(newOrder, newMultipliers);
    }

    flip() {
        return new Rotation(this.Order, this.Multipliers.map(m => m * -1));
    }

    reverse() {
        const newOrder = this.Order.map((n, i) => [n, i]).sort((a, b) => a[0] - b[0]).map(arr => arr[1]);
        const newMultipliers = Rotation.reorderCoords(newOrder, this.Multipliers);
        return new Rotation(newOrder, newMultipliers);
    }

    static reorderCoords(newOrder, originalCoords)  {
        return newOrder.map((ord) => originalCoords[ord]);
    }

    static flipCoords(multipliers, originalCoords) {
        return originalCoords.map((coord, i) => coord * multipliers[i]);
    }

   static getPossibleMultipliers(coordsA, coordsB) {
        return coordsA.map((c, i) => Rotation.getFlipDivisors(c, coordsB[i]));
    }

    static getPossibleRotations(order, coordsA, coordsB) {
        const reorderedCoords = Rotation.reorderCoords(order, coordsB);
        const divisorPossibilities = reorderedCoords.map((c, i) => Rotation.getFlipDivisors(c, coordsA[i]));
        const possibleMultipliers = util.distinct(util.cartesianNDimensions(...divisorPossibilities).map(m => [m, m.map(n => n * -1)]).flat(1));
        return possibleMultipliers.map(m => new Rotation(order, m));
    }

    static getFlipDivisors(a, b) {
        if (b === 0) {
            return [1, -1];
        } else {
            return [a / b];
        }
    }

    toString() {
        return this.Order.join(',') + '|' + this.Multipliers.join(',')
    }
}
export class Edge {
    constructor(p1, p2) {
        const [closePoint, farPoint] = [p1, p2]; 
        this.Points = [closePoint, farPoint];
        this.Distances = farPoint.getDistance(closePoint).Distances;
        this.OrderedAbsoluteDistances = this.Distances.map(d => Math.abs(d));
        this.AbsoluteDistances = this.OrderedAbsoluteDistances.map((d, i) => [d, i]).sort((a, b) => a[0] - b[0]);
        this.AbsoluteDistancesOnly = this.AbsoluteDistances.map(d => d[0]);
        this.LengthHash = hornerHashCode(this.AbsoluteDistancesOnly);
        this.UniqueDistances = util.gettArraysDict(this.AbsoluteDistances, pair => pair[0]);
        this.UniqueDistancesOnly = Object.keys(this.UniqueDistances).map(k => parseInt(k)).sort((a, b) => a - b);
    }

    reverse() {
        return new Edge(...[...this.Points].reverse());
    }

    
    getHashCode() {
        return this.LengthHash;
    }

    getAbsoluteDistanceStr() {
       return  Edge.getDistanceKey(this.AbsoluteDistancesOnly);
    }

    static getDistanceKey(distanceArr) {
        return distanceArr.join(',');
    }

    getDistanceStr() {
        return Edge.getDistanceKey(this.Distances);
    }

    getOrderedAbsoluteDistanceStr() {
        return Edge.getDistanceKey(this.OrderedAbsoluteDistances);
    }

    couldMatch(otherEdge) {
        return otherEdge.getAbsoluteDistanceStr() === this.getAbsoluteDistanceStr();
    }

    getReferencePoint() {
        return  this.Points[0];
    }

    getReferenceCoords() {
        return this.getReferencePoint().Coordinates;
    }

    getTranslation(point, rotation) {
        return point.transform(new Transform(new Translation(), rotation)).getDistance(this.getReferencePoint());
    }

    getTransform(point, rotation) {
        return new Transform(this.getTranslation(point, rotation), rotation);
    }


    getTransforms(otherEdge, rotation) {
        return [
            this.getTransform(otherEdge.Points[0], rotation),
            this.getTransform(otherEdge.Points[1], rotation.flip())
        ]
    }

    rotate(rotation) {
        return rotation.rotate(this.Distances);
    }

    getPossibleTransforms(otherEdge) {
        if (this.couldMatch(otherEdge)) { 

            const thisIndices = this.OrderedAbsoluteDistances.map(d => otherEdge.UniqueDistances[d].map(arr => arr[1]));
            const possibleOrders = util.cartesianNDimensions(...thisIndices).filter(coords => coords.length === new Set(coords).size);
            const uniqueOrders = util.distinct(possibleOrders);

            return uniqueOrders.map(o => Rotation.getPossibleRotations(o, this.Distances, otherEdge.Distances)
                                            .map(r => this.getTransforms(otherEdge, r)
                                        
                                            )  
                                        )         
                                .flat(2)
        } else {
            return [];
        }
    }

}


export class Point3D {
    constructor({str, coords}) {
        this.Coordinates = coords ?? str.split(',').map(strDigit => parseInt(strDigit));
        this.SquareOfDistance = this.Coordinates.map(c => c ** 2).reduce((a, b) => a + b);
    }

    toString() {
        return this.Coordinates.join(',');
    }

    equals(otherPoint) {
        return this.toString() === otherPoint.toString();
    }

    getHashCode() {
        return hornerHashCode(this.Coordinates);
    }

    getSquareOfDistance() {
        return this.SquareOfDistance;
    }

    getDistance(otherPoint) {
        return new Translation(this.Coordinates.map((c, i) => otherPoint.Coordinates[i] - c));
    }

     
    transform(transform) {
        return new Point3D({coords: transform.transform(this.Coordinates)});
    } 
}

export class Translation {
    constructor(distances) {
        this.Distances = distances ?? [0,0,0];
    }

    translate(coords) {
        return this.Distances.map((c, i) => c + coords[i]);
    }

    combine(otherTranslation) {
        return new Translation(this.translate(otherTranslation.Distances));
    }

    reverse() {
        return new Translation(this.Distances.map(d => d * -1));
    }

    getManhattanDistance() {
        return this.Distances.map(d => Math.abs(d)).reduce((a, b) => a + b);
    }

    toString() {
        return this.Distances.join(',')
    }
}
export class Transform {

    constructor(translation, rotation) {
        this.Translation = translation ?? new Translation();
        this.Rotation = rotation ?? new Rotation();
    }

    reverse() {
        const reversedTranslation = this.Translation.reverse();
        const reversedRotation = this.Rotation.reverse();
        const rotatedTranslation = new Translation(reversedRotation.rotate(reversedTranslation.Distances));
        return new Transform(rotatedTranslation, reversedRotation);
    }

    combine(otherTransform) {
        const newRotation = this.Rotation.combine(otherTransform.Rotation);
        const rotatedTranslation = new Translation(otherTransform.Rotation.rotate(this.Translation.Distances));
        return new Transform(rotatedTranslation.combine(otherTransform.Translation), newRotation);
    }

    transform(coords) {
        return this.Translation.translate(this.Rotation.rotate(coords));
    }

    toString() {
        return `r:${this.Rotation.toString()};t:${this.Translation.toString()}`;
    }
}

export class Scanner {
    static ID_SEARCH = /\d+/;
    constructor(str, range) {
        const lines = str.split('\n');
        this.Beacons = lines.slice(1).map(ptStr => new Point3D({str: ptStr}));
        this.Id = parseInt(lines[0].match(Scanner.ID_SEARCH)[0]);
        this.Transforms = {};
        this.Edges = null;
        this.Range = range;
        this.BeaconsSet = new Set(this.Beacons.map(b => b.toString()));
    }

    getEdges() {
        if (!this.Edges) {
            this.Edges = util.gettArraysDict(util.choose(this.Beacons, 2).map(pair => new Edge(...pair)), e => e.getAbsoluteDistanceStr());
        }
        return this.Edges;
    }

    getTransform(otherScanner, minOverlaps) {
        const thisEdges = this.getEdges();
        const otherEdges = otherScanner.getEdges();

        const sharedHashCodes = util.distinct(Object.keys(thisEdges)).filter(k => otherEdges[k]).sort((a, b) => Scanner.getEdgeSortingOrder(thisEdges[b][0]) - Scanner.getEdgeSortingOrder(thisEdges[a][0]));


        const sharedHashCodeSets = sharedHashCodes.map(k => [thisEdges[k], otherEdges[k]]);
        const transforms = Scanner.matchAllEdges(sharedHashCodeSets);
       
        for (const transform of transforms) {
            const transformRes = this.tryTransform(transform, otherScanner, minOverlaps);
            if (transformRes) {
                return transform;
            }
        }

        return null;
    }

    checkTransform(otherScanner, minOverlaps) {
        if (otherScanner == this) {
            return new Transform();
        } if (this.Transforms[otherScanner.Id]) {
            return this.Transforms[otherScanner.Id].Transform;
        }  else {
            const transform = this.getTransform(otherScanner, minOverlaps);
            if (transform) {
                this.addTransform(otherScanner, transform);
            }
            return transform;
        }
    }

    static getEdgeSortingOrder(edge) {
        return hornerHashCode([edge.UniqueDistancesOnly.length, edge.UniqueDistancesOnly[0]]);
    }


    tryTransform(transform, otherScanner, minOverlaps) {
        const transformedBeacons = otherScanner.Beacons.map(b => b.transform(transform));
        const beaconsInRange = transformedBeacons.filter(b => b.Coordinates.filter((c, i) => util.isInRange(c, this.Range[i])).length === 3);
        if (beaconsInRange.length >= minOverlaps) {
            const overlaps = beaconsInRange.filter(b => this.BeaconsSet.has(b.toString()));
            return overlaps.length === beaconsInRange.length ? overlaps : null;
        } else {
            return null;
        }
    }

    static matchAllEdges(edgeSets) {
        const allTransforms = edgeSets.map(pair => Scanner.matchEdges(...pair)).flat();
        const transformDict = util.gettArraysDict(allTransforms, t => t.toString());
        const sortedKeys = Object.keys(transformDict).sort((k1, k2) => transformDict[k2].length - transformDict[k1].length);

        return sortedKeys.map(k => transformDict[k][0]);
    }

    static matchEdges(edges1, edges2) {
        const edgePairs = util.cartesianArr(edges1, edges2);
        return edgePairs.map(([edge1, edge2]) => edge1.getPossibleTransforms(edge2)).flat();
    }   

    addTransform(scanner, transform) {
        if (scanner == this) {
            return;
        }

        const otherWayTransform = transform.reverse();
        this.Transforms[scanner.Id] = new ScannerTransform(scanner, transform);
        scanner.Transforms[this.Id] = new ScannerTransform(this, otherWayTransform);


        this.addKnownTransforms(scanner, transform);
        scanner.addKnownTransforms(this, otherWayTransform);
    }

    addKnownTransforms(scanner, transform) {
        const newScanners = scanner.getTransformedScanners().filter(ts => !this.Transforms[ts.Scanner.Id]);
        for (const ts of newScanners) {
            const newTransform = ts.Transform.combine(transform);
            this.addTransform(ts.Scanner, newTransform);
        }
    }

    getTransformedScanners() {
        return Object.values(this.Transforms);
    }

    getTransformedBeacons(transform) {
        return this.Beacons.map(b => b.transform(transform));
    }

    getAllBeacons() {
        return util.distinct([...this.Beacons, ...this.getTransformedScanners().map(s => s.getTransformedBeacons()).flat()]);
    }

    getEdges() {
        if (!this.Edges) {
            this.Edges = util.gettArraysDict(util.choose(this.Beacons, 2).map(pair => new Edge(...pair)), e => e.getAbsoluteDistanceStr());
        }
        return this.Edges;
    }


}

export class ScannerTransform {
    constructor(scanner, transform) {
        this.Scanner = scanner;
        this.Transform = transform;
    }

    getTransformedBeacons() {   
        return this.Scanner.getTransformedBeacons(this.Transform);
    }

   
}


export class TrenchMapper extends CalculationModel {
    constructor(str) {
        super();

        this.Scanners = str.split('\n\n').map(scnrStr => new Scanner(scnrStr, [[-1000, 1000], [-1000, 1000], [-1000, 1000]]));

    }
    
    getNumBeacons(minOverlaps) {

        this.findScannerPositions(minOverlaps);

        const allTransformedBeacons = this.Scanners[0].getAllBeacons();
        return allTransformedBeacons.length;
   
    }

    findScannerPositions(minOverlaps) {
        const pairs = util.choose(this.Scanners, 2);
        for (const [scanner1, scanner2] of pairs) {
            scanner1.checkTransform(scanner2, minOverlaps);
        }
    }

    calculateLargestDistance(minOverlaps) {
        this.findScannerPositions(minOverlaps);

        const pairs = util.choose(this.Scanners, 2);
        const translations = pairs.map(([s1, s2]) => s1.Transforms[s2.Id].Transform.Translation);
        const distances = translations.map(t => t.getManhattanDistance());
        return Math.max(...distances);
    }
}

export class TrenchMapperControler extends CalculationController {

}

const container = (typeof window == 'undefined' ? {} : window);
container.solution = {
    partA: function ({ model, calcParams }) {
        return model.getNumBeacons(parseInt(calcParams['min-overlaps']));
    },
    partB: function ({ model, calcParams }) {
        return model.calculateLargestDistance(parseInt(calcParams['min-overlaps']));
    },
    createModel: function (str) {
        return new TrenchMapper(str);
    },
    createController: function (model, parentElement, visualParams) {
        return new TrenchMapperControler(model, parentElement, visualParams);
    },
    hasVisual: false
}