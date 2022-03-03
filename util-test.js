
import assert from 'assert/strict';
import 'mocha';

export default class ParametrizedTest {
    static TestType = {
        EQUAL: 0,
        RANGE: 1
    }
    constructor(func, argsAndResults, argNames, testType, thisVal, descGenerator) {
        this.Function = func;
        this.FunctionName = this.Function.name;
        this.ThisVal = thisVal ?? null;
        this.ArgsAndResults = argsAndResults;
        this.ArgNames = argNames;
        this.generateDescription = descGenerator ?? ((args, expected) => this.generateBasicDescription(args, expected));
        this.TestType = testType ?? ParametrizedTest.TestType.EQUAL;
    }

    runTests() {
        describe(this.getFunctionDescription(), () => this.runAllTests());
    }

    runAllTests() {
        for (const {args, expected} of this.ArgsAndResults) {
            this.runTest(args, expected);
        }
    }

    getFunctionDescription() {
        return this.FunctionName;
    }

    getArgsDescription(args) {
        return args.map((arg, i) => `${this.ArgNames[i]}: ${arg}`).join(', ')
    }

    getResultDescription(result) {
        return JSON.stringify(result);
    }

    getThisValDescription() {
        return this.ThisVal ? this.ThisVal.toString() : '';
    }

    getOperatorStr() {
        return this.TestType == ParametrizedTest.TestType.RANGE ? 'be between' : 'equal';
    }

    generateBasicDescription(args, expected) {
        const thisDesc = this.ThisVal == null ? '' : ` on ${thisVal.toString()}`;
        return `${this.FunctionName}${thisDesc} with args (${this.getArgsDescription(args)}) should ${this.getOperatorStr()} ${expected}`
    }

    runTest(args, expected) {
        const funcDesc = this.generateDescription(args, expected);
        it(funcDesc, () => this.runSingleTest(args, expected));
    
    }

    runSingleTest(args, expected) {
       
        const actual = this.Function.apply(this.ThisVal, args);

        switch (this.TestType) {
            case ParametrizedTest.TestType.RANGE:
                this.assertRange(actual, expected)
                break;
            default:
                this.assertEquals(actual, expected);

        }
        
    }

    assertEquals(actual, expected) {
        const msg = `${this.getResultDescription(actual)} does not equal ${this.getResultDescription(expected)}`
        if (ParametrizedTest.isPrimitive(actual)) {
            assert.strictEqual(actual, expected, msg);
        }
        else {
            assert.deepStrictEqual(actual, expected, msg);
        }
    }

    assertRange(actual, expectedRange) {
        const [expectedMin, expectedMax] = [...expectedRange].sort((a, b) => a - b);
        assert.ok(actual >= expectedMin && actual <= expectedMax, `${actual} is not between ${expectedMin} and ${expectedMax}.`)
    }

    static isPrimitive(objectOrPrimitive) {
        return Object(objectOrPrimitive) !== objectOrPrimitive;
    }

    static runAllFuncs(argArrays) {
        for (const argArr of argArrays) {
            const test = new ParametrizedTest(...argArr);
            test.runTests()
        }
    }

}

