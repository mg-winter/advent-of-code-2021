
import { default as ParametrizedTest } from '../../util-test.js';
import { DayCalculatorRenameMe } from '../day-|DAY|-front.js'



ParametrizedTest.runAllFuncs(
   [
        [functionName,
            [{args: [0], expected: 0}],
            ['arg-name'], ParametrizedTest.TestType.EQUAL, thisVal]
   ]
);

