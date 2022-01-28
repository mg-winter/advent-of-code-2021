

(() => {
    function addEvents() {
        if (!window.solution) {
            return;
        }

        const defaultFunc = (param) => param;

        if (solution.stepVisual) {
            window.addEventListener('step', solution.stepVisual);
        }

        const mainInput = document.getElementById('main-input');
        const [inputParser, calcParamsReader, visualParamsReader] = ['parseInput', 'readCalcParams', 'readVisualParams'].map(funcName => solution[funcName] ?? defaultFunc);

        function readInput() {
            return {
                input: inputParser(mainInput.value),
                calcParams: calcParamsReader(),
                visualParams: visualParamsReader()
            }
        }

        const buttons = [{ id: "calculate-a", handler: solution.partA, resId: 'result-a' }, { id: "calculate-b", handler: solution.partB, resId: 'result-b' }];

        for (const btn of buttons) {
            const clickHandler = btn.handler ?? defaultFunc;
            
            document.getElementById(btn.id).addEventListener('click', async (e) => {
                e.preventDefault();
                const params = readInput();

                if (solution.initVisual) {
                    document.getElementById('visuals-cont').innerHTML = solution.initVisual(params);
                }
                const res = await clickHandler(params);
                document.getElementById(btn.resId).innerHTML = res + '';
               
            });
        }


    }

    if (document.readyState == 'complete') {
        addEvents();
    } else {
        window.addEventListener('load', addEvents);
    }
})();

function dispatchStepEvent(detail) {
    const event = new CustomEvent('step', {detail: detail});
    window.dispatchEvent(event);
}