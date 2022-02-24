import { default as ParametrizedTest } from '../util-test.js';
import {default as util} from '../util-v2.js';

ParametrizedTest.runAllFuncs(
    [[util.sumFromSameSignMin,
        [{ args: [0], expected: 0 },
        { args: [1], expected: 1 },
        { args: [-1], expected: -1 },
        { args: [4], expected: 10 },
        { args: [15], expected: 120 },
        { args: [-4], expected: -10 },
        { args: [-15], expected: -120 }],
        ['n']]]
);