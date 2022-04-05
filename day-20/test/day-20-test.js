
import { default as ParametrizedTest } from '../../util-test.js';
import { MapEnhancer } from '../day-20-front.js';
import { default as utilBack } from '../../util-back.js';
import { default as util } from '../../util-v2.js';

ParametrizedTest.runAllFuncs(
   [
        [functionName,
            [{args: [0], expected: 0}],
            ['arg-name'], ParametrizedTest.TestType.EQUAL, thisVal]
   ]
);

