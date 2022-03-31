
import { default as ParametrizedTest } from '../../util-test.js';
import { Rotation, Translation, Transform } from '../day-19-front.js';
import { default as utilBack } from '../../util-back.js';
import { default as util } from '../../util-v2.js';

import assert from 'assert/strict';
import 'mocha';

ParametrizedTest.runAllFuncs(
   [
        [Rotation.reorderCoords,
            [{args: [[0,1,2], ['a', 'b', 'c']], expected: ['a', 'b', 'c']},
               { args: [[2, 1, 0], ['c', 'b', 'a']], expected: ['a', 'b', 'c'] },
               { args: [[1, 2, 0], ['c','a','b']], expected: ['a', 'b', 'c'] }
         ],
            ['newOrder', 'originalCoords'], ParametrizedTest.TestType.EQUAL, null]
   ]
);

function getPairsForCombine(arr) {
   return [...util.choose(arr, 2), ...arr.map(item => [item, item.reverse()])]
}

describe('Day 19', function () {
   const orders = [[0,1,2], [2,0,1], [2,1,0]];
   const multiplierSets = [[1,1,1], [-1,-1,-1], [1,-1,1]];
   const rotations = util.cartesianNDimensions(multiplierSets, orders);

   const translations = [[0, 0, 0], [1, 2, 3], [-5, 4, 15]];
   const initCoords = [[0, 0, 0], [1, 2, 3], [5, -4, 15]];

   const transforms = util.cartesianNDimensions(translations, multiplierSets, orders);

   const [rotationPairs, translationPairs, transformPairs] = [rotations, translations, transforms].map(getPairsForCombine);
    

   describe('Rotation.reverse()', function () {
   
      const tests = util.cartesianNDimensions(rotations, initCoords);
  
      for(let i = 0; i < tests.length; i++) {
         const [rotation, coords] = tests[i];
         const [order, multipliers] = rotation;
         it(`Rotation.reverse #${i} Reversing rotating ${coords} by ${order} / ${multipliers} should return the same coords`, function () {
            
            const rotationObj = new Rotation(order, multipliers);
            const rotated = rotationObj.rotate(coords);
            const reversed = rotationObj.reverse().rotate(rotated);
            assert.deepEqual(reversed, coords);
         })
      };
   });

   describe('Rotation.combine()', function () {

      const tests = util.cartesianNDimensions(rotationPairs, initCoords);

      for (let i = 0; i < tests.length; i++) {
         const [rotationPair, coords] = tests[i];
         it(`Rotation.combine ${i} Combining ${rotationPair[0]} and ${rotationPair[1]} on ${coords}  should return the same coords as rotating by ${rotationPair[0]} then ${rotationPair[1]}`, function () {
            const x = i;
            const [rot1, rot2] = rotationPair.map(r => new Rotation(...r));
            const expected = rot2.rotate(rot1.rotate(coords));
            const combined = rot1.combine(rot2);
            const actual = combined.rotate(coords);
            assert.deepEqual(actual, expected);
         })
      };
   });

   describe('Translation.reverse()', function () {
     
      const tests = util.cartesianNDimensions(translations, initCoords);
      for (const [translation, coords] of tests) {
         it(`Reversing translating ${coords} by ${translation} should return the same coords`, function () {
            const translationObj = new Translation(translation);
            const translated = translationObj.translate(coords);
            const reversed = translationObj.reverse().translate(translated);
            assert.deepEqual(reversed, coords);
         })
      };
   });

   describe('Translation.combine()', function () {

      const tests = util.cartesianNDimensions(translationPairs, initCoords);

      for (const [translationPair, coords] of tests) {
         it(`Combining ${translationPair[0]} and ${translationPair[1]} on ${coords}  should return the same coords as translating by ${translationPair[0]} then ${translationPair[1]}`, function() {
            const [trans1, trans2] = translationPair.map(t => new Translation(t));
            const expected = trans2.translate(trans1.translate(coords));
            const combined = trans1.combine(trans2);
            const actual = combined.translate(coords);
            assert.deepEqual(actual, expected);
         })
      };
   });

   describe('Transform.reverse()', function () {
      
      const tests = util.cartesianNDimensions(transforms, initCoords);

     
      for (const [transform, coords] of tests) {
         const [order, multipliers, translation] = transform;
         it(`Reversing translating ${coords} by ${translation} and rotating by ${order} / ${multipliers} should return the same coords`, function () {
            const transformObj = new Transform(new Translation(translation), new Rotation(order, multipliers));
            const transformed = transformObj.transform(coords);
            const reversed = transformObj.reverse().transform(transformed);
            assert.deepEqual(reversed, coords);
         })
      };
   });

   describe('Transform.combine()', function () {

      const tests = util.cartesianNDimensions(transformPairs, initCoords);

      for (const [transformPair, coords] of tests) {
         it(`Combining ${transformPair[0]} and ${transformPair[1]} on ${coords}  should return the same coords as transforming by ${transformPair[0]} then ${transformPair[1]}`, function () {
            const [t1, t2] = transformPair.map( ([o, m, t])=> new Transform(new Translation(t), new Rotation(o, m)));
            const expected = t2.transform(t1.transform(coords));
            const combined = t1.combine(t2);
            const actual = combined.transform(coords);
            assert.deepEqual(actual, expected);
         })
      };
   });
});

