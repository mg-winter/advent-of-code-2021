
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
        this.DefaultTimeout = visualParams?.timeout ?? 1024;
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

     renderState(state) {

    }

    getInitialHtml(state, index) {

    }

    setUpDom() {

    }

     renderInitialState() {
        this.ParentElement.innerHTML = this.getInitialHtml(this.States[this.Index], this.Index);
        this.setUpDom();
    }

    renderCurrentIndex() {
        this.renderState(this.States[this.Index]);
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

    playCurrentIndex() {
        this.renderCurrentIndex();
        this.updateDescription(this.getStateDescription(this.States[this.Index]));

        if (this.Index < this.States.length - 1) {
            this.Index++;
            this.triggerNext(() => this.playCurrentIndex(), this.States[this.Index].level);
        }
        
    }

     play() {
        this.initFirstState();
        this.playCurrentIndex();
    }


    initFirstState() {
        const states = this.MaxState < 0 ? this.Model.getHistory() : this.Model.getHistory().filter(state => state.Level <= this.MaxState);
        this.States = states;
        this.Index = 0;
        this.renderInitialState();
    }

    resume() {
        this.playCurrentIndex();
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

    


}