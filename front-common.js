import { CalculationController } from './front-superclasses.js';
import { default as util } from './util-v2.js';

//not comprehensive, good enough for now.
function getValue(el) {
    return el.value;
}

function getInputDict(containerId) {
    const inputsMapped = Array.from(document.getElementById(containerId).querySelectorAll('input, textarea, select')).map(el => { return { key: el.id, value: getValue(el) } });
    return util.toDict(inputsMapped, val => val.key, val => val.value) ;
}

(() => {
    function addEvents() {
        if (!window.solution) {
            return;
        }

        if (!window.solution.hasVisual) {
            document.body.classList.add('no-visuals');
        }

        const defaultFunc = (param) => param;

        const mainInput = document.getElementById('main-input');
        const [modelCreator, calcParamsReader, visualParamsReader] = ['createModel', 'readCalcParams', 'readVisualParams'].map(funcName => solution[funcName] ?? defaultFunc);

        const controllerCreator = solution.createController ?? ((model, parentEl) => new CalculationController(model, parentEl));
        function readInput() {

            
            const calcParamInputsDict = getInputDict('calc-params');
         
            return {
                model: modelCreator(mainInput.value),
                calcParams: calcParamsReader(calcParamInputsDict),
            }
        }

        const buttons = [{ id: "calculate-a", handler: solution.partA, resId: 'result-a' }, { id: "calculate-b", handler: solution.partB, resId: 'result-b' }];

        let curModel = null;
        let curController = null;

        function updateController() {
            if (!curModel) {
                return;
            }

            const visualParamInputsDict = getInputDict('visual-params');
            const visualParams = visualParamsReader(visualParamInputsDict);
            curController = controllerCreator(curModel, document.getElementById('visuals-cont'), visualParams);
            curController.initFirstState();

            const maxState = curController.States.length - 1;
            document.getElementById('state-selector-label').innerHTML = `State (total ${maxState})`;
            document.getElementById('state-selector').setAttribute('max', maxState);        
        }

        for (const btn of buttons) {
            const clickHandler = btn.handler ?? defaultFunc;
            
            document.getElementById(btn.id).addEventListener('click', async (e) => {
                e.preventDefault();
                const params = readInput();
                const timeBefore = new Date();
                const res = clickHandler(params);
                const timeAfter = new Date();
                const runTime = timeAfter - timeBefore;
                document.getElementById(btn.resId).innerHTML = `${res} (${runTime} ms)`;
                curModel = params.model;
                document.getElementById('calc-summary').innerHTML = `Will play ${e.target.innerText}; click another calculation button to reload calculation`;

                updateController();

            });
        }

        document.getElementById('play-start').addEventListener('click', e => {

            if (!curModel) {
                return;
            }
            updateController();
            if (curController) {
                curController.play();
            }
            
        });

        document.getElementById('pause').addEventListener('click', e => {
            if (!curController) {
                return;
            }
            curController.pause();
        });

        document.getElementById('resume').addEventListener('click', e => {
            if (!curController) {
                return;
            }
            curController.resume();
        });

        document.getElementById('go-to-state').addEventListener('click', e => {
            if (!curController) {
                return;
            }
            curController.goToState(getValue(document.getElementById('state-selector')));
        });

        document.getElementById('btn-static-states').addEventListener('click', e => {
            if (!curController) {
                return;
            }

            curController.updateStaticStateHtml(document.getElementById('static-states-cont'), document.getElementById('hd-static-states'), document.getElementById('static-states-status'), );

        })

        


    }

    if (document.readyState == 'complete') {
        addEvents();
    } else {
        window.addEventListener('load', addEvents);
    }
})();