
import { default as ParametrizedTest } from '../../util-test.js';
import { SnailfishNumber, SnailfishHomeworkSolver } from '../day-18-front.js'
import { default as utilBack } from '../../util-back.js';


function checkSingleExplode(src) {
   const n = new SnailfishNumber({ value: src });
   const explodables = n.getExplodableDescendants();
   const firstExplodable = explodables.next().value ?? null;
   if (firstExplodable) {
      firstExplodable.explode();
   }
   return n.toString();
}

function checkReduce(src) {
   const n = new SnailfishNumber({value: src});
   return n.reduce().toString();
}

function checkMagnitude(src) {
   const n = new SnailfishNumber({value: src});
   return n.getMagnitude();
}

function checkSumResult(testNum) {
   const str = utilBack.getTestInput(18, testNum);
   const solver = new SnailfishHomeworkSolver(str);
   return solver.getSum().toString();
}

ParametrizedTest.runAllFuncs(
   [
         [checkSingleExplode,
         [{ args: [[[[[8, 7], [7, 0]], [[7, 8], [[7, 7], 15]]], [[[0, 4], 6], [8, 7]]]], expected: '[[[[8,7],[7,0]],[[7,15],[0,22]]],[[[0,4],6],[8,7]]]'},
         { args: [[[[[[9, 8], 1], 2], 3], 4]], expected: '[[[[0,9],2],3],4]'},
            { args: [[7, [6, [5, [4, [3, 2]]]]]], expected: '[7,[6,[5,[7,0]]]]' },
            { args: [[[6, [5, [4, [3, 2]]]], 1]], expected: '[[6,[5,[7,0]]],3]' },
            { args: [[[3, [2, [1, [7, 3]]]], [6, [5, [4, [3, 2]]]]]], expected: '[[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]]' },
            { args: [[[3, [2, [8, 0]]], [9, [5, [4, [3, 2]]]]]], expected: '[[3,[2,[8,0]]],[9,[5,[7,0]]]]' }
            
            
            
         
       ], ['src'], ParametrizedTest.TestType.EQUAL, null],
      

      [checkReduce,
         [{ args: [[[[[[4, 3], 4], 4], [7, [[8, 4], 9]]], [1, 1]]], expected: '[[[[0,7],4],[[7,8],[6,0]]],[8,1]]'}], 
         ['src'], ParametrizedTest.TestType.EQUAL, null
      ],

      [checkMagnitude,
         [{ args: [[9, 1]], expected: 29 },
            { args: [[1, 9]], expected: 21 },
            { args: [[[9, 1], [1, 9]]], expected: 129},
            { args: [[[1, 2], [[3, 4], 5]]], expected: 143 },
      
         ],
         ['src'], ParametrizedTest.TestType.EQUAL, null
      ],

       [checkSumResult,
          [
          {args: [1], expected: '[[[[1,1],[2,2]],[3,3]],[4,4]]' },
            { args: [2], expected: '[[[[3,0],[5,3]],[4,4]],[5,5]]' },
            { args: [3], expected: '[[[[5,0],[7,4]],[5,5]],[6,6]]' },
            { args: ['4a'], expected: '[[[[4,0],[5,4]],[[7,7],[6,0]]],[[8,[7,7]],[[7,9],[5,0]]]]' },
            { args: ['4b'], expected: '[[[[6,7],[6,7]],[[7,7],[0,7]]],[[[8,7],[7,7]],[[8,8],[8,0]]]]' },
            { args: ['4c'], expected: '[[[[7,0],[7,7]],[[7,7],[7,8]]],[[[7,7],[8,8]],[[7,7],[8,7]]]]' },
            { args: ['4d'], expected: '[[[[7,7],[7,8]],[[9,5],[8,7]]],[[[6,8],[0,8]],[[9,9],[9,0]]]]' },
            { args: ['4e'], expected: '[[[[6,6],[6,6]],[[6,0],[6,7]]],[[[7,7],[8,9]],[8,[8,1]]]]' },
            { args: ['4f'], expected: '[[[[6,6],[7,7]],[[0,7],[7,7]]],[[[5,5],[5,6]],9]]'},
            { args: ['4g'], expected: '[[[[7,8],[6,7]],[[6,8],[0,8]]],[[[7,7],[5,0]],[[5,5],[5,6]]]]'},
             { args: ['4h'], expected: '[[[[7,7],[7,7]],[[8,7],[8,7]]],[[[7,0],[7,7]],9]]'},
             { args: ['4i'], expected: '[[[[8,7],[7,7]],[[8,6],[7,7]]],[[[0,7],[6,6]],[8,7]]]'},
            { args: [4], expected: '[[[[8,7],[7,7]],[[8,6],[7,7]]],[[[0,7],[6,6]],[8,7]]]' }

         ],
         ['testNum'], ParametrizedTest.TestType.EQUAL, null
      ],
   ]
);