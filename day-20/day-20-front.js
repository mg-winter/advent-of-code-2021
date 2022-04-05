import { CalculationModel, CalculationController } from '../front-superclasses.js';
import { default as util } from '../util-v2.js';

const CHAR_MAP = {
    '.' : 0,
    '#': 1
}

const PRINT_MAP = [
    '.', '#'
]
function convertChar(character) {
    return CHAR_MAP[character];
}

function convertLine(line) {
    return line.split('').map(convertChar);
}

export class MapImage {
    constructor({str, values, infiniteVal=0}) {
        this.Values = values ?? str.split('\n').map(convertLine);
        this.InfiniteValue = infiniteVal; 
    }

    getHeight() {
        return this.Values.length;
    }

    getWidth() {
        return this.Values[0].length;
    }

    isInRange([x, y]) {
        return x >= 0 && x < this.getWidth() && y >= 0 && y < this.getHeight();
    }

    getNumLightPixels() {
        return this.Values.flat().reduce((a, b) => a + b);
    }

    getValue([x, y]) {
        if (this.isInRange([x, y])) {
            return this.Values[y][x]
        } else {
            return this.InfiniteValue;
        }
    }

    toString() {
        return this.Values.map(row => row.map(n => PRINT_MAP[n]).join('')).join('\n');
    }
}
export class MapEnhancer extends CalculationModel {
    constructor(str) {
        super();
        this.SurroundRadius = 1;
        this.Images = [];

        const [algStr, imageStr] = str.split('\n\n');
        const initImage = new MapImage({str: imageStr, infiniteVal: 0});
        this.addImage(initImage);
        this.EnhancementAlgorithm = convertLine(algStr);
    }
    getLatestImage() {
        return this.Images[this.Images.length - 1]
    }

    addImage(image) {
        this.Images.push(image);
    }

    enhance() {
        const newImage = this.enhanceImage(this.getLatestImage());
        this.addImage(newImage);
        return newImage;
    }

    enhanceImage(image) {
        const topLeft = this.SurroundRadius * -1;
        const bottom = image.getHeight() + this.SurroundRadius - 1;
        const right = image.getWidth() + this.SurroundRadius - 1;
        const coordRanges = [right, bottom].map(n => util.rangeArr({start: topLeft, end: n}));
        const coordPairs = util.cartesianNDimensions(...coordRanges);
        const allPixels = coordPairs.map(pair => this.enhancePixel(image, pair));
        const pixelRows = util.groupBy(allPixels, p => p.y).sort((a, b) => parseInt(a.key) - parseInt(b.key)).map(row => row.value.map(o => o.value));
        return new MapImage({values: pixelRows, infiniteVal: this.EnhancementAlgorithm[parseInt(`${image.InfiniteValue}`.repeat(9),2)]}); 
    }

    enhancePixel(image, coords) {
        const [xRange, yRange] = coords.map(c => util.rangeArr({start: c - this.SurroundRadius, end: c + this.SurroundRadius}));
        const coordsYFirst = util.cartesianNDimensions(yRange, xRange);
        const values = coordsYFirst.map(([y, x]) => image.getValue([x, y]));
        const index = util.getBinary(values);
        const pixelVal = this.EnhancementAlgorithm[index];
        return {
            x: coords[0],
            y: coords[1],
            value: pixelVal
        };
    }

    getNumLightPixels() {
        return this.getLatestImage().getNumLightPixels();
    }

    enhanceN(n) {
        for (let i = 0; i < n; i++) {
            this.enhance();
        }
        return this.getNumLightPixels();
    }



   
}

export class MapEnhancerController extends CalculationController {

}

const container = (typeof window == 'undefined' ? {} : window);
container.solution = {
    partA: function ({ model, calcParams }) {
        return model.enhanceN(2);
    },
    partB: function ({ model, calcParams }) {
        return model.enhanceN(50);
    },
    createModel: function (str) {
        return new MapEnhancer(str);
    },
    createController: function (model, parentElement, visualParams) {
        return new MapEnhancerController(model, parentElement, visualParams);
    },
    hasVisual: false
}