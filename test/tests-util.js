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
        ['n']],

        [util.choose,
            [{ args: [[], -1], expected: [] },
            { args: [[], 0], expected: [] },
            { args: [[], 1], expected: [] },
            { args: [[], 5], expected: [] },
            { args: [[1], -1], expected: [] },
            { args: [[1], 0], expected: [] },
            { args: [[1], 1], expected: [[1]] },
            { args: [[1], 5], expected: [] },
            { args: [[1, 2, 3], 1], expected: [[1], [2], [3]] },
            { args: [[1, 2, 3], 2], expected: [[1, 2], [1, 3], [2, 3]] },
            { args: [[1, 2, 3], 3], expected: [[1, 2, 3]] },
            { args: [[[1, 2, 3], 5]], expected: [] },
            {
                args: [[1, 2, 3, 4, 5, 6], 3], expected: [[1, 2, 3], [1, 2, 4], [1, 2, 5],
                [1, 2, 6], [1, 3, 4], [1, 3, 5], [1, 3, 6],
                [1, 4, 5], [1, 4, 6], [1, 5, 6],
                [2, 3, 4], [2, 3, 5],  [2, 3, 6], [2, 4, 5], [2, 4, 6], [2, 5, 6],
                [3, 4, 5], [3, 4, 6], [3, 5, 6],
                [4, 5, 6]]
            }], ['arr', "numItems"]],

        [util.cartesianNDimensions,
            [{ args: [], expected: [] },
                { args: [[]], expected: [] },
                { args: [[1, 2, 3]], expected: [[1], [2], [3]] },
                { args: [[1, 2, 3], [1]], expected: [[1,1], [2,1], [3,1]] },
                { args: [[1, 2, 3], [5, 6], [7, 8, 9]], expected: [
                    [1, 5, 7], [1, 5, 8], [1, 5, 9],
                    [1, 6, 7], [1, 6, 8], [1, 6, 9],
                    [2, 5, 7], [2, 5, 8], [2, 5, 9],
                    [2, 6, 7], [2, 6, 8], [2, 6, 9],
                    [3, 5, 7], [3, 5, 8], [3, 5, 9],
                    [3, 6, 7], [3, 6, 8], [3, 6, 9]
                ] }

                
                            
            ], ['iters']]
    ]
);