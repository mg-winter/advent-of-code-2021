
import { default as util } from './util-v2.js';

export class CalculationState {
    constructor(value, descriptionData, level=0) {
        this.Value = value ?? null;
        this.Level = level ?? 0;
        this.DescriptionData = descriptionData;
    }
}

export class CalculationModel {

    constructor() {
        this.StateHistory = [];
    }
    
    getState() {
        return [];
    }

    pushState(descriptionData, level=0) {
        this.StateHistory.push(new CalculationState(this.getState(), descriptionData, level));
    }
    
    getHistory() {
        return this.StateHistory.map(s => {return {...s}});
    }


}

export class CalculationController {
    constructor(model, parentElement, visualParams) {
        this.Model = model;
        this.States = [];
        this.ParentElement = parentElement;
        this.DefaultTimeout = visualParams?.timeout ?? 3000;
        this.Index = -1;
        this.CurTimeout = null;
        this.DescriptionContainer = null;
        this.MaxState = visualParams?.maxstate ?? -1;
    }

    triggerNext(updateFunc, level) {
        this.pause();

        this.CurTimeout = window.setTimeout(updateFunc, this.DefaultTimeout);
    }

    isPlaying() {
        return util.isNullOrUndefined(this.CurTimeout);
    }

    pause() {
        if (this.CurTimeout) {
            window.clearTimeout(this.CurTimeout);
        }
    }

    transitionIn(parentElement, newElement) {

    }

    static async transitionOut(el, transitionClass='fade-out') {
        await CalculationController.completeTransition(el, transitionClass);
        el.remove(); 
        return el;   
    }

    async renderState(state) {

    }

    getInitialHtml(state, index) {

    }

    setUpDom() {

    }

     renderInitialState() {
        this.ParentElement.innerHTML = this.getInitialHtml(this.States[this.Index], this.Index);
        this.setUpDom();
    }

    async renderCurrentIndex() {
        await this.renderState(this.States[this.Index]);
    }

    getStateDescription(state) {
        return `State ${this.Index}`;
    }

    setDescriptionContainer(el) {
        el.setAttribute('aria-live', 'polite');
        this.DescriptionContainer = el;
    }
    getDescriptionContainer() {
        return this.DescriptionContainer;
    }

    updateDescription(descriptionHtml) {
        this.getDescriptionContainer().innerHTML = descriptionHtml;
    }

    async playCurrentIndex() {
        await this.renderCurrentIndex();
        this.updateDescription(this.getStateDescription(this.States[this.Index]));
        this.cueNextIndex();
    }

    cueNextIndex() {
        if (this.Index < this.States.length - 1) {
            this.Index++;
            this.triggerNext(() => this.playCurrentIndex(), this.States[this.Index].level);
        }
    }

     play() {
         if (this.Index != 0) {
            this.initFirstState();
         }
        this.cueNextIndex();
    }


    initFirstState() {
        const states = this.MaxState < 0 ? this.Model.getHistory() : this.Model.getHistory().filter(state => state.Level <= this.MaxState);
        this.States = states;
        this.Index = 0;
        this.renderInitialState();
    }

    resume() {
        this.cueNextIndex();
    }

    goToState(index) {
        if (index >= 0 && index < this.States.length) {
            this.pause();
            this.Index = index;
            this.renderInitialState();
        }
    }

    addStateHtml(index, parentEl, statusEl) {
        if (index >= this.States.length) {
            statusEl.innerHTML = "Loaded static state list";
        } else {
            const html = this.getInitialHtml(this.States[index], index);
            parentEl.insertAdjacentHTML('beforeend',`<li>${html}</li>`);
            window.setTimeout(() => {this.addStateHtml(index + 1, parentEl, statusEl)}, 10);
        }
    }

    updateStaticStateHtml(staticStatesParentEl, parentHeadingEl, statusEl) {
        staticStatesParentEl.innerHTML = `<ol aria-labelledby="${parentHeadingEl.id}" aria-describedby="${statusEl.id}" class="static-state-list"></ol>`;
        statusEl.innerHTML = 'Loading static state list...';
        this.addStateHtml(0, staticStatesParentEl.querySelector('ol'), statusEl);
    }

    static getChangeFraction(t) {
        return t * t * (3 - (2 * t));
    }

    static getAnimationSteps(from, to, numSteps) {
        const diff = to - from;
        const step = 1 / numSteps;
        const timeSteps = util.rangeArr({start: step, end: step * (numSteps - 1), step: step});
        return [from, ...timeSteps.map(t => from + (CalculationController.getChangeFraction(t) * diff)), to];
    }


    static async *animateValues(fromToPairs, numSteps) {
        const pairStepLists = fromToPairs.map(([from, to]) => CalculationController.getAnimationSteps(from, to, numSteps));
        const byTimeStep = pairStepLists[0].map((val, i) => pairStepLists.map(list => list[i]));
        for (const stepValues of byTimeStep) {
            await util.waitForAnimationFrame();
            yield stepValues;
        }
    }

    static async waitForTransition(el) {
        return await util.waitForEvent(el, 'transitionend');
    }

    static startTransition(el, transitionClass) {
        setTimeout(() => el.classList.add(transitionClass), 1);
    }

    static async completeTransition(el, transitionClass) {
        CalculationController.startTransition(el, transitionClass);
        return await CalculationController.waitForTransition(el);
    }
    


}