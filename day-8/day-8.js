const fs = require('fs');
const path = require('path');
const util = require('../util');

class Reference {
    constructor(digitSegments) {
        this.DIGIT_SEGMENTS = digitSegments;
        this.POSSIBLE_SEGMENTS = Array.from(new Set(Object.keys(this.DIGIT_SEGMENTS)
                                                                    .map(k => this.DIGIT_SEGMENTS[k])
                                                                    .reduce((a, b) => a.concat(b), [])));
        this.POSSIBLE_SEGMENTS_PATTERN = this.POSSIBLE_SEGMENTS.map(Reference.normalizePatternSegment);
        this.SEGMENTS_TO_DIGITS = util.reverseDict(this.DIGIT_SEGMENTS, null, Reference.getSegmentKey);

        this.DIGIT_COUNTS = Reference.getCounts(this.DIGIT_SEGMENTS);
        this.UNIQUE_COUNTS = Reference.getUniqueCounts(this.DIGIT_COUNTS);
    }

    static getCounts(segments) {
        const keys = Object.keys(segments);
        const res = {};
        for (const key of keys) {
            const count = segments[key].length;
            if (!res[count]) {
                res[count] = [];
            }
            res[count].push(key);
        }
        return res;
    }

    static getUniqueCounts(countMap) {
        return new Set(Object.keys(countMap).filter(k => countMap[k].length == 1).map(k => parseInt(k)));
    }


    static getSegmentKey(segmentSet) {
        return segmentSet.join('');
    }

    static normalizePatternSegment(segment) {
        return segment.toUpperCase();
    }

    static normalizeReferenceSegment(segment) {
        return segment.toLowerCase();
    }
}

const DIGIT_REFERENCE = new Reference({
    '0': ['a', 'b', 'c', 'e', 'f', 'g'],
    '1': ['c', 'f'],
    '2': ['a', 'c', 'd', 'e', 'g'],
    '3': ['a', 'c', 'd', 'f', 'g'],
    '4': ['b', 'c', 'd', 'f'],
    '5': ['a', 'b', 'd', 'f', 'g'],
    '6': ['a', 'b', 'd', 'e', 'f', 'g'],
    '7': ['a', 'c', 'f'],
    '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    '9': ['a', 'b', 'c', 'd', 'f', 'g']
});


class Display {
    constructor(ln, reference) {
        [this.pattern, this.output] = ln.split('|').map(str => Reference.normalizePatternSegment(str).trim().split(' ').map(str => str.split('').sort()));
        this.knownDigits = {};
        this.knownSegments = {};
        this.realToPatternSegments = {};
        this.segmentCandidates = {};
        this.realSegmentCandidates = {};

        this.remainingPattern = new Set(this.pattern);
        this.remainingOutput = new Set(this.output);

        this.reference = reference;

       
        for (const segment of this.reference.POSSIBLE_SEGMENTS_PATTERN) {
            this.segmentCandidates[segment] = new Set(this.reference.POSSIBLE_SEGMENTS);
        }

        for (const segment of this.reference.POSSIBLE_SEGMENTS) {
            this.realSegmentCandidates[segment] = new Set(this.reference.POSSIBLE_SEGMENTS_PATTERN);
        }

    }

    isUniqueCount(digit) {
        return this.reference.UNIQUE_COUNTS.has(digit.length);
    }

    getUniqueOutputCount() {
        return this.output.filter(d => this.isUniqueCount(d)).length;
    }

    decode() {
        let prevSnapshot = '';
        let curSnapshot = this.getStateString();

        while (!this.runDecodePass() && prevSnapshot != curSnapshot) {
            prevSnapshot = curSnapshot;
            curSnapshot = this.getStateString();
        }

        return this.getOutputValue();
    }

    runDecodePass() {
        for (const segmentSet of this.remainingOutput) {
            this.applyRules(segmentSet);
        }

        if (!this.isDecoded()) {
            for (const segmentSet of this.remainingPattern) {
                this.applyRules(segmentSet);
            }
            return this.isDecoded();
        } else {
            return true;
        }
    }

    isDecoded() {
        return this.remainingOutput.size == 0;
    }

    getRules() {
        return [
            s => this.getDigit(s),
            s => this.decodeBySegment(s),
            s => this.checkUnique(s),
            s => this.checkCrossover(s)
        ];
    }

    applyRules(segmentSet) {
        const rules = this.getRules();
        for (const rule of rules) {
            const res = rule(segmentSet);
            if (res != null) {
                return res;
            }
        }
        return null;
    }

    checkUnique(segmentSet) {
        if (this.isUniqueCount(segmentSet)) {
            const digit = this.getSameCount(segmentSet)[0];
            this.recordDigit(segmentSet, digit);
            return digit;
        } else {
            return null;
        }
    }

    decodeBySegment(segmentSet) {
        const knownSegments = segmentSet.map(segment => this.getRealSegment(segment)).filter(segment => segment != null).sort();
        if (knownSegments.length == segmentSet.length) {
            const digit = this.reference.SEGMENTS_TO_DIGITS[Reference.getSegmentKey(knownSegments)];
            this.recordDigit(segmentSet, digit);
            return digit;
        } else {
            return null;
        }
    }

    checkCrossover(segmentSet) {
        const candidateDigits = this.getSameCount(segmentSet);
        const notMissingSegments = candidateDigits.filter(d => !this.isMissingAnySegment(segmentSet, d));
        const res = notMissingSegments.length == 1 ? notMissingSegments[0] : null;

        if (res != null) {
            this.recordDigit(segmentSet, res);
        }

        return res;

    }

    isMissingAnySegment(patternSegmentSet, digit) {

        const remainingSegments = new Set(patternSegmentSet);
        for (const realSegment of this.reference.DIGIT_SEGMENTS[digit]) {
            const patternSegment = this.getMatchingSegment(Array.from(remainingSegments), realSegment);
            if (patternSegment == null) {
                return true;
            } else {
                remainingSegments.delete(patternSegment);
            }
        }
        return false;

    }

    getMatchingSegment(patternSegmentSet, realSegment) {
        const patternSegmentCandidates = this.realSegmentCandidates[realSegment];
        const matchingPatternSegments = patternSegmentSet.filter(s => patternSegmentCandidates.has(s));
        return matchingPatternSegments.length > 0 ? matchingPatternSegments[0] : null;
    }

    isMissingSegment(patternSegmentSet, realSegment) {
        return this.getMatchingSegment(patternSegmentSet, realSegment) == null;
    }

    excludeCandidates(segment, notItSegments) {
        const segmentKey = Reference.normalizePatternSegment(segment);

        for (const notIt of notItSegments) {
            const realSegmentKey = Reference.normalizeReferenceSegment(notIt);
            this.segmentCandidates[segmentKey].delete(realSegmentKey);
            this.realSegmentCandidates[realSegmentKey].delete(segmentKey);
            if (!this.getPatternSegment(realSegmentKey) && this.realSegmentCandidates[realSegmentKey].size == 1) {
                this.recordSegment(Array.from(this.realSegmentCandidates[realSegmentKey])[0], realSegmentKey);
            }
        }

        if (!this.getRealSegment(segmentKey) && this.segmentCandidates[segmentKey].size == 1) {
            this.recordSegment(segmentKey, Array.from(this.segmentCandidates[segmentKey])[0]);
        }
    }

    recordSegment(segment, realSegment) {
        const segmentKey = Reference.normalizePatternSegment(segment);
        const realSegmentValue = Reference.normalizeReferenceSegment(realSegment);
        this.knownSegments[segmentKey] = realSegmentValue;
        this.realToPatternSegments[realSegmentValue] = segmentKey;

        if (this.segmentCandidates[segmentKey].size > 1) {
            this.excludeCandidates(segmentKey, this.getOtherSegments([realSegmentValue]));
        }

        const otherSegments = this.getOtherSegments([segmentKey]);
        for (const otherSegment of otherSegments) {
            this.excludeCandidates(otherSegment, [realSegment]);
        }
    }


    recordDigit(segmentSet, digit) {
        this.remainingPattern.delete(segmentSet);
        this.remainingOutput.delete(segmentSet);
        
        this.knownDigits[Reference.getSegmentKey(segmentSet)] = digit;

        const realSegments = this.reference.DIGIT_SEGMENTS[digit];
        const notInDigit = this.getOtherSegments(realSegments);

        for (const segment of segmentSet) {
            this.excludeCandidates(segment, notInDigit);
        }

        const notInSegmentSet = this.getOtherSegments(segmentSet);

        for (const segment of notInSegmentSet) {
            this.excludeCandidates(segment, this.reference.DIGIT_SEGMENTS[digit]);
        }


    }

    getRealSegment(segment) {
        const segmentKey = Reference.normalizePatternSegment(segment);
        return this.knownSegments[segmentKey] ? this.knownSegments[segmentKey] : null;
    }

    getPatternSegment(segment) {
        const segmentKey = Reference.normalizeReferenceSegment(segment);
        return this.realToPatternSegments[segmentKey] ? this.realToPatternSegments[segmentKey] : null;
    }

    getDigit(segmentSet) {
        const segmentsKey = Reference.normalizePatternSegment(Reference.getSegmentKey(segmentSet));
        return this.knownDigits[segmentsKey] ? this.knownDigits[segmentsKey] : null;
    }

    getOtherSegments(segments) {
        const segmentCheck = new Set(Array.from(segments).map(s => Reference.normalizeReferenceSegment(s)));
        return this.reference.POSSIBLE_SEGMENTS.filter(s => !segmentCheck.has(s));
    }

    getSameCount(segmentSet) {
        return this.reference.DIGIT_COUNTS[segmentSet.length + ''];
    }

    getOutputValue() {
        const knownOutput = this.output.map(segmentSet => this.getDigit(segmentSet)).filter(digit => digit != null);
        return knownOutput.length == this.output.length ? parseInt(knownOutput.join('')) : -1;
    }
    

    static getSetsByKey(dict) {
        return Object.keys(dict).map(k => `${k}:${Array.from(dict[k]).sort().join('')}`).join(', ');
    }
    
    getStateString() {
        return [this.knownDigits, this.knownSegments].map(obj => JSON.stringify(obj)).join('\n')  + '\n' 
            + Display.getSetsByKey(this.segmentCandidates)
            + '\n'
            + Display.getSetsByKey(this.realSegmentCandidates);
    }

    getDigitString() {
        const reversed = util.reverseDict(this.knownSegments);

        const missingKeys = this.getOtherSegments(Object.keys(reversed));
        for (const key of missingKeys) {
            reversed[key] = '?';
        }
        return ` ${reversed['a'].repeat(4)} \n`
                + `${reversed['b']}    ${reversed['c']} \n`
                + `${reversed['b']}    ${reversed['c']} \n`
                + ` ${reversed['d'].repeat(4)} \n`
            + `${reversed['e']}    ${reversed['f']} \n`
            + `${reversed['e']}    ${reversed['f']} \n`
            + ` ${reversed['g'].repeat(4)} `
    }

    getSegmentAndOutputString() {
        return `${this.pattern.map(arr => arr.join('')).join(' ')} | ${this.output.map(arr => arr.join('')).join(' ')} = ${this.getOutputValue()}`;
    }
    toString() {
        return `${this.getSegmentAndOutputString()}\n${this.getStateString()}\n${this.getDigitString()}`;
    }
}


function getInput(filePath) {
    try {
        const curFile = process.mainModule.filename;
        const fullPath = path.resolve(curFile, '..', filePath);
        return fs.readFileSync(fullPath, 'utf-8').toString().split('\n').map(ln => new Display(ln, DIGIT_REFERENCE));
    } catch (ex) {
        console.log(ex);
    }
}

function getMainInput() {
    return getInput('./input/input-day-8.txt');
}

test();
day8A();
day8B();

function test() {

   const firstTest = getInput('./tests/test-1.txt');
   console.log(firstTest[0].toString());
   console.log(firstTest[0].decode());
   console.log(firstTest[0].toString());


    const secondTest =  getInput('./tests/test-2.txt');
    console.log(getSumOutputs(secondTest));
    console.log(secondTest.map(l => l.getSegmentAndOutputString()).join('\n'));
}

function day8A() {
    console.log(getAllUniquePatterns(getMainInput()));
}

function day8B() {
    console.log(getSumOutputs(getMainInput()));
}

function getAllUniquePatterns(outputLines) {
    return outputLines.map(l => l.getUniqueOutputCount()).reduce((a, b) => a + b);
}

function getSumOutputs(outputLines) {
    return outputLines.map(line => line.decode()).reduce((a, b) => a + b);
}

