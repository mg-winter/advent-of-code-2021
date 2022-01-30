export class CalculationState {
    constructor(value, level=0) {
        this.Value = value ?? null;
        this.Level = level ?? 0;
    }
}

export class CalculationModel {

    constructor() {
        this.StateHistory = [];
    }
    
    getState() {
        return [];
    }

    pushState(level=0) {
        this.StateHistory.push(new CalculationState(this.getState(), level));
    }
    
    getHistory() {
        return this.StateHistory.map(s => {return {...s}});
    }


}

export class CalculationController {
    constructor(model, parentElement, defaultTimeout=1024) {
        this.Model = model;
        this.States = [];
        this.ParentElement = parentElement;
        this.DefaultTimeout = defaultTimeout;
    }

    triggerNext(updateFunc, level) {
        window.setTimeout(updateFunc, this.DefaultTimeout >> level);
    }

     renderState(state) {

    }

    getInitialHtml() {

    }

    setUpDom() {

    }

     renderInitialState() {
        this.ParentElement.innerHTML = this.getInitialHtml(this.States[0]);
        this.setUpDom();
    }

    playState(stateIndex) {
        
         this.renderState(this.States[stateIndex]);

        const nextIndex = stateIndex + 1;

        if (nextIndex < this.States.length) {
            this.triggerNext(() => this.playState(nextIndex), this.States[nextIndex].level);
        }
        
    }

     play() {
        this.States = this.Model.getHistory();
        this.renderInitialState();
        this.playState(0);
    }
}