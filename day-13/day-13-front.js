import { CalculationModel, CalculationController } from '../front-superclasses.js';
import { default as util } from '../util-v2.js';

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

    static willMoveAfterFold(coord, foldCoord) {
        return coord > foldCoord;
    }

    static getCoordAfterFold(coord, foldCoord) {
        return FoldInstruction.willMoveAfterFold(coord, foldCoord) ? (foldCoord * 2) - coord : coord;
    }

    pointWillMoveAfterFold([x, y]) {
        return FoldInstruction.willMoveAfterFold(x, this.FoldLineX) || FoldInstruction.willMoveAfterFold(y, this.FoldLineY);
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
        
        this.pushState({nextFold: this.Folds[this.FoldIndex]});
    }

    fold() {
        const curFold = this.getNextFold();
        this.Points = util.distinct(this.Points.map(p => curFold.getFoldedPoint(p)));
       
        this.FoldIndex++;
        this.pushState({ fold: curFold, nextFold: this.getNextFold()})

        return this.Points;
    }

    getState() {

        const nextFold = this.getNextFold();

        if (!nextFold) {
            return {points: this.Points};
        } else {
            return {
                points: this.Points,
                pointsThatWillMove: this.Points.filter(p => nextFold.pointWillMoveAfterFold(p))
                                .map(p => {return {oldPoint: p, newPoint: nextFold.getFoldedPoint(p)}}),
                staticPoints: this.Points.filter(p => !nextFold.pointWillMoveAfterFold(p))
            }
        }
    }

    getNextFold() {
        return this.FoldIndex < this.Folds.length ? this.Folds[this.FoldIndex] : null;
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
        this.BorderAllowance = 0.125;
        this.Radius = this.DotSize / 2 - this.BorderAllowance; //account for stroke
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
                    class="fold-line" vector-effect="non-scaling-stroke" />`
    }

    getBorderSvg(fold, topLeft, maxX, maxY) {
        
        if (fold) {

            const valueCenter = this.getDotCenter(fold.Value);
            return {beforeFold: `<line x1="${topLeft}" 
                        y1="${topLeft}"
                        x2="${fold.Axis == 'x' ? topLeft : maxX}" 
                        y2="${fold.Axis == 'y' ? topLeft : maxY}" 
                        class="border-line" vector-effect="non-scaling-stroke" />
                        
                        <line x1="${topLeft}" 
                        y1="${topLeft}"
                        x2="${fold.Axis == 'y' ? topLeft : valueCenter}" 
                        y2="${fold.Axis == 'x' ? topLeft : valueCenter}" 
                        class="border-line" vector-effect="non-scaling-stroke" />
                        
                    <line x1="${fold.Axis == 'x' ? topLeft : maxX}" 
                        y1="${fold.Axis == 'y' ? topLeft : maxY}"
                        x2="${fold.Axis == 'x' ? valueCenter : maxX}" 
                        y2="${fold.Axis == 'y' ? valueCenter : maxY}" 
                        class="border-line" vector-effect="non-scaling-stroke" />`,
                afterFold: `<line x1="${fold.Axis == 'x' ? maxX : topLeft }" 
                        y1="${fold.Axis == 'y' ? maxY : topLeft }"
                        x2="${maxX}" 
                        y2="${maxY}" 
                        class="border-line" vector-effect="non-scaling-stroke" />

                        <line x1="${fold.Axis == 'y' ? maxX : valueCenter}" 
                              y1="${fold.Axis == 'x' ? maxY : valueCenter}" 
                        
                            x2="${maxX}" 
                            y2="${maxY}"
                        
                        class="border-line" vector-effect="non-scaling-stroke" />

                         <line x1="${fold.Axis == 'x' ? valueCenter : topLeft}" 
                        y1="${fold.Axis == 'y' ? valueCenter : topLeft}"
                        x2="${fold.Axis == 'x' ? maxX : topLeft}" 
                        y2="${fold.Axis == 'y' ? maxY : topLeft}" 
                        class="border-line" vector-effect="non-scaling-stroke" />`

                }
            } else {
                return {
                    beforeFold: `<rect x="${topLeft}" y="${topLeft}" height="${maxY}" width="${maxX}"  
                                    class="border-line" vector-effect="non-scaling-stroke" />`
                }   
            }
    }

    getStateDescription(state) {
        return (state.DescriptionData.fold ? 'Folded along ' + state.DescriptionData.fold : 'Initial state') + 
                                            (state.DescriptionData.nextFold ? `; next fold: ${state.DescriptionData.nextFold}` : '; final fold');
    }

    getPointSvg(point, pointClass) {
        const pointClassVal = pointClass ?? 'origami-dot';
        const [cx, cy] = point.map(c => this.getDotCenter(c));
        return `<circle cx="${cx}" data-point="${point}" cy="${cy}" r="${this.Radius}" class="${pointClassVal}" vector-effect="non-scaling-stroke" />`;
    }

    getPointsSvg(points, pointClass) {
        return points.map(p => this.getPointSvg(p, pointClass)).join('')
    }

    getAllPointsSVG(state, topLeft, maxX, maxY) {
        const staticPoinsSvg = this.getPointsSvg(state.Value.staticPoints ?? state.Value.points);
        const foldLineSvg = state.DescriptionData.nextFold ? this.getFoldSvg(state.DescriptionData.nextFold, topLeft, maxX, maxY) : '';
        const bordersSvg = this.getBorderSvg(state.DescriptionData.nextFold, topLeft, maxX, maxY);
        const axisClass = state.DescriptionData.nextFold ? `axis-${state.DescriptionData.nextFold.Axis}` : '';
        const movingPointsSvg = state.Value.pointsThatWillMove ? `<g class="moving-points-group ${axisClass}">${foldLineSvg}${bordersSvg.afterFold}${this.getPointsSvg(state.Value.pointsThatWillMove.map(p => p.oldPoint), 'future-move-dot')}</g>` : '';
        return  `<g class="state-drawing-inner">
                            <rect x="${topLeft}" y="${topLeft}" width="${maxX}" height="${maxY}" class="paper-background" />` 
                            +  bordersSvg.beforeFold 
                            + staticPoinsSvg 
                            + movingPointsSvg 
                        + "</g>";
    }

    getLongStateDescription(state) {
        return state.Value.pointsThatWillMove ? 'Points that will move after next fold: ' + state.Value.pointsThatWillMove.map(p => ` ${p.oldPoint} to ${p.newPoint}`).join('; ') : 'No more folds';
    }

    setUpDom() {
        this.SVGContainer = this.ParentElement.querySelector('svg');
        this.SVGTitle = this.SVGContainer.querySelector('title');
        this.AllDotsContainer = this.SVGContainer.querySelector('.dots-container');
        this.LongDescContainer = this.SVGContainer.querySelector('svg desc');

        this.StartingViewboxWidth = this.SVGContainer.viewBox.baseVal.width;
        this.StartingViewboxHeight = this.SVGContainer.viewBox.baseVal.height;
    }

    getMaxCoords(state) {
        return  [0, 1].map(i => state.Value.points
                                            .map(p => p[i]).reduce((a, b) => Math.max(a, b)))
                      .map(c => (c + 1) * this.DotSize);
  
    }

    getViewboxMaxVals(maxVals) {
        return maxVals.map(val => val  + this.BorderAllowance + this.DotSize);
    }

    getViewboxMin(topLeft) {
        return topLeft  - (this.BorderAllowance / 2);
    }


    getFieldCoords(state) {
        const [maxX, maxY] = this.getMaxCoords(state);
        const [viewboxMaxX, viewboxMaxY] = this.getViewboxMaxVals([maxX, maxY]);

        const topLeft = -1 * this.DotSize;

        const viewboxTopLeft = this.getViewboxMin(topLeft);
        
        return {
            maxX: maxX,
            maxY: maxY,
            viewboxMaxX: viewboxMaxX,
            viewboxMaxY: viewboxMaxY,
            topLeft: topLeft,
            viewboxTopLeft: viewboxTopLeft
        }
    }

    async renderState(state) {

        const movingDotsGroup = this.AllDotsContainer.querySelector('.moving-points-group');
        await CalculationController.completeTransition(movingDotsGroup, 'moving-points-animate'); setTimeout(()=>movingDotsGroup.classList.add('moving-points-animate'), 1);
     
        const desc = this.getLongStateDescription(state);
        this.LongDescContainer.innerHTML = desc;

        this.SVGTitle.innerHTML = this.getStateDescription(state);

        const { maxX, maxY, viewboxMaxX, viewboxMaxY, topLeft, viewboxTopLeft } = this.getFieldCoords(state);
        
        const pointsSvg = this.getAllPointsSVG(state, topLeft, maxX, maxY);
        const elToFadeOut = this.AllDotsContainer.querySelector('.state-drawing-inner');
        
        const stepPairs = [[this.SVGContainer.viewBox.baseVal.width, viewboxMaxX], [this.SVGContainer.viewBox.baseVal.height, viewboxMaxY]];

        const viewboxSteps = CalculationController.animateValues(stepPairs, 50);
        for await (const stepPair of viewboxSteps) {
            this.SVGContainer.setAttribute('viewBox', `${viewboxTopLeft} ${viewboxTopLeft} ${stepPair[0]} ${stepPair[1]}`);
        }

        this.AllDotsContainer.insertAdjacentHTML('afterbegin', pointsSvg);
        await CalculationController.transitionOut(elToFadeOut);
       
        
    }

    getInitialHtml(state) {

       

        const {maxX, maxY, viewboxMaxX, viewboxMaxY, topLeft, viewboxTopLeft} = this.getFieldCoords(state);

        const pointsSvg = this.getAllPointsSVG(state, topLeft, maxX, maxY); //points.map(p => p.map(c => this.getDotCenter(c))).map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="${this.Radius}" style="fill:#DD0000" />`).join('');
        

        

        const title = this.getStateDescription(state);
        const desc = this.getLongStateDescription(state);

        const labelledById = `img-label-${Date.now()}`;
        const describedById = `img-desc-${Date.now()}`;
        return `<h4 class="paper-description" aria-live="polite">${title}</h4>`
                +`<svg  role="image" aria-labelledby="${labelledById}" aria-describedby="${describedById}" viewBox="${viewboxTopLeft} ${viewboxTopLeft} ${viewboxMaxX} ${viewboxMaxY}">
                <title id=${labelledById} aria-live="polite">${title}</title>
                <desc id="${describedById}">${desc}</desc>
                <g class="dots-container">${pointsSvg}</g></svg>`;
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