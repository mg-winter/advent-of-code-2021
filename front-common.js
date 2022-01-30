import { CalculationController } from './front-superclasses.js';
import { default as util } from './util-v2.js';

//not comprehensive, good enough for now.
function getValue(el) {
    return el.value;
}

(() => {
    function addEvents() {
        if (!window.solution) {
            return;
        }

        const defaultFunc = (param) => param;

        const mainInput = document.getElementById('main-input');
        const [modelCreator, calcParamsReader, visualParamsReader] = ['createModel', 'readCalcParams', 'readVisualParams'].map(funcName => solution[funcName] ?? defaultFunc);

        const controllerCreator = solution.createController ?? ((model, parentEl) => new CalculationController(model, parentEl));
        function readInput() {

            const calcParamInputs = Array.from(document.getElementById('calc-params').querySelectorAll('input, textarea, select')).map(el => {return {key: el.id, value: getValue(el)}});
            const calcParamInputsDict = util.toDict(calcParamInputs, val => val.key, val => val.value);
            return {
                model: modelCreator(mainInput.value),
                calcParams: calcParamsReader(calcParamInputsDict),
                visualParams: visualParamsReader()
            }
        }

        const buttons = [{ id: "calculate-a", handler: solution.partA, resId: 'result-a' }, { id: "calculate-b", handler: solution.partB, resId: 'result-b' }];

        for (const btn of buttons) {
            const clickHandler = btn.handler ?? defaultFunc;
            
            document.getElementById(btn.id).addEventListener('click', async (e) => {
                e.preventDefault();
                const params = readInput();
                const res = clickHandler(params);
                document.getElementById(btn.resId).innerHTML = res + '';

                if (document.getElementById('show-visual').checked) {
                    const controller = controllerCreator(params.model, document.getElementById('visuals-cont'));
                    controller.play();
                }
               
            });
        }


    }

    if (document.readyState == 'complete') {
        addEvents();
    } else {
        window.addEventListener('load', addEvents);
    }
})();