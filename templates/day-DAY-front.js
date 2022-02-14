import { CalculationModel, CalculationController } from '../front-superclasses.js';
import { default as util } from '../util-v2.js';



class DayCalculatorRenameMe extends CalculationModel {
    constructor(str) {

    }
    
    calculateARenameMe() {

    }

    calculateBRenameMe() {

    }
}

class DayCalculatorControllerRenameMe extends CalculationController {

}

window.solution = {
    partA: function ({ model, calcParams }) {
        return model.calculateARenameMe();
    },
    partB: function ({ model, calcParams }) {
        return model.calculateBRenameMe();
    },
    createModel: function (str) {
        return new DayCalculatorRenameMe(str);
    },
    createController: function (model, parentElement, visualParams) {
        return new DayCalculatorControllerRenameMe(model, parentElement, visualParams);
    },
    hasVisual: false
}