import { CalculationModel, CalculationController } from '../front-superclasses.js';
import { default as util } from '../util-v2.js';


// class Point {
//     constructor({coords, pointStr}) {
//         [this.x, this.y] = coords ?? pointStr.split(',');
//     }

//     toString() {
//         return `${this.x},${this.y}`;
//     }

//     equals(otherPoint) {
//         return this.x == otherPoint.x && this.y == otherPoint.y;
//     }
// }

class FoldInstruction {
    constructor(foldStr) {
        const splitVal = foldStr.split('=');
        this.Value = parseInt(splitVal[1]);
        this.Axis = splitVal[0].split(' ')[2]; 
        if (this.Axis == 'x') {
            this.FoldLineX = this.Value;
            this.FoldLineY = Number.MAX_SAFE_INTEGER;
        } else {
            this.FoldLineY = this.Value;
            this.FoldLineX = Number.MAX_SAFE_INTEGER;
        }
    }

    static getCoordAfterFold(coord, foldCoord) {
        return coord <= foldCoord ? coord : (foldCoord * 2) - coord;
    }

    getFoldedPoint([x, y]) {
        return [FoldInstruction.getCoordAfterFold(x, this.FoldLineX), 
                                    FoldInstruction.getCoordAfterFold(y, this.FoldLineY)];
    }

    toString() {
        return `${this.Axis}=${this.Value}`;
    }
}

class OrigamiPage extends CalculationModel {
    constructor(strPage) {
        super();

        const [pointsStr, instrStr] = strPage.split('\n\n');

        this.Points = pointsStr.split('\n').map(ln => ln.split(',').map(strVal => parseInt(strVal)));
        this.Folds = instrStr.split('\n').map(ln => new FoldInstruction(ln));
        this.FoldIndex = 0;
        
        this.pushState({});
    }

    fold() {
        const curFold = this.Folds[this.FoldIndex];
        this.Points = util.distinct(this.Points.map(p => curFold.getFoldedPoint(p)));
        this.pushState({fold: curFold})
        this.FoldIndex++;

        return this.Points;
    }

    getState() {
        return this.Points;
    }

    foldAll() {
        //this can be done functionally like this, but by using a loop and this.fold, we make it easier to
        //create a visual later.
        //const res = this.Folds.reduce((prevPoints, fold) => util.distinct(prevPoints.map(p => fold.getFoldedPoint(p))), {points: this.Points});
        for (let i = 0; i < this.Folds.length; i++) {
            this.fold();
        }
        return this.Points;
    }

  
}

class OrigamiPageController extends CalculationController {

    constructor(model, parentElement, visualParams) {
        super(model, parentElement, visualParams);
        this.DotSize = parseInt(visualParams.dotsize);
        this.Radius = this.DotSize / 2;
    }

    getDescriptionContainer() {
        return this.ParentElement.querySelector('.paper-description');
    }

    getDotCenter(coord) {
        return this.DotSize * (coord - 0.5)
    };

    getFoldSvg(fold, topLeft, maxX, maxY) {
        const valueCenter = this.getDotCenter(fold.Value);
        return `<line x1="${fold.Axis == 'x' ? valueCenter : topLeft}" 
                    y1="${fold.Axis == 'y' ? valueCenter : topLeft}"
                    x2="${fold.Axis == 'x' ? valueCenter : maxX}" 
                    y2="${fold.Axis == 'y' ? valueCenter : maxY}" 
                    stroke="#CCCCCC" stroke-width="1"/>`
    }

    getInitialHtml(state, index) {
        const points = state.Value;

        const maxCoords = [0,1].map(i => points.map(p => p[i]).reduce((a, b) => Math.max(a, b)));
        const [maxX, maxY] = maxCoords.map(c => (c + 1) * this.DotSize );
        const pointsSvg = points.map(p => p.map(c => this.getDotCenter(c))).map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="${this.Radius}" style="fill:#DD0000" />`).join('');
        const topLeft = -1 * this.DotSize;

        return `<p class="paper-description">${state.DescriptionData.fold ?? 'Initial state'}</p>`
                + `<svg preserveAspectRatio="" viewBox="${topLeft} ${topLeft} ${maxX} ${maxY}">${pointsSvg}</svg>`;
    }
  
}
window.solution = {
    partA: function ({ model, calcParams }) {
        return model.fold().length;
    },
    partB: function ({ model, calcParams }) {
        return 'see visualisation; points: ' + model.foldAll().join('; ');
    },
    createModel: function (str) {
        return new OrigamiPage(str);
    },
    createController: function (model, parentElement, visualParams) {
        return new OrigamiPageController(model, parentElement, visualParams);
    },
    hasVisual: true
}