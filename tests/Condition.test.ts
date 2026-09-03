import {describe} from 'mocha';
import {deepStrictEqual, strictEqual, throws} from 'assert';
import {Condition} from '../src/Condition';
import {referenceTable} from '../src/Program';
import {ValueType} from '../src/ValueType';
import {MockReferencedValue} from './MockReferencedValue';

describe('Test conditions', () => {
    describe('Test basic condition', () => {
        beforeEach('Fill reference values', () => {
            const stringOpen = {
                _value: 'open',
                _type: ValueType.String,
                _dirty: false,
                _deviceId: 1,
                _parameterName: 'stringOpen'
            };

            const number1 = {
                _value: 1,
                _type: ValueType.Number,
                _dirty: false,
                _deviceId: 1,
                _parameterName: 'number1'
            };

            const stringFalse = {
                _value: 'false',
                _type: ValueType.String,
                _dirty: false,
                _deviceId: 1,
                _parameterName: 'stringFalse'
            };

            const number0 = {
                _value: 0,
                _type: ValueType.Number,
                _dirty: false,
                _deviceId: 1,
                _parameterName: 'number0'
            };

            referenceTable['1.stringOpen'] = Object.assign(new MockReferencedValue(), stringOpen);

            referenceTable['1.number1'] = Object.assign(new MockReferencedValue(), number1);

            referenceTable['1.stringFalse'] = Object.assign(new MockReferencedValue(), stringFalse);

            referenceTable['1.number0'] = Object.assign(new MockReferencedValue(), number0);
        });


        it('Tests basic condition represent', () => {
            const condition = '1.stringOpen === \'open\'';
            const basicCondition = new Condition(condition);

            strictEqual(basicCondition.represent(), condition);
        });

        it('Tests true string', () => {
            const condition = '\'open\' === \'open\'';
            const basicCondition = new Condition(condition);

            strictEqual(basicCondition.evaluate(), true);
        });

        it('Tests true number', () => {
            const condition = '1 === 1';
            const basicCondition = new Condition(condition);

            strictEqual(basicCondition.evaluate(), true);
        });

        it('Tests false string', () => {
            const condition = '\'false\' === \'open\'';
            const basicCondition = new Condition(condition);

            strictEqual(basicCondition.evaluate(), false);
        });

        it('Tests false number', () => {
            const condition = '0 === 1';
            const basicCondition = new Condition(condition);

            strictEqual(basicCondition.evaluate(), false);
        });

        it('Tests true string reference', () => {
            const condition = '1.stringOpen === \'open\'';

            const basicCondition = new Condition(condition);

            strictEqual(basicCondition.evaluate(), true);
        });

        it('Tests true number', () => {
            const condition = '1.number1 === 1';

            const basicCondition = new Condition(condition);

            strictEqual(basicCondition.evaluate(), true);
        });

        it('Tests false string', () => {
            const condition = '1.stringFalse === \'open\'';

            const basicCondition = new Condition(condition);

            strictEqual(basicCondition.evaluate(), false);
        });

        it('Tests false number', () => {
            const condition = '1.number0 === 1';
            const basicCondition = new Condition(condition);

            strictEqual(basicCondition.evaluate(), false);
        });
    });

    describe('Test basic condition security', () => {
        it('Does not execute arbitrary code via Function()/eval', () => {
            const payload = "(function(){var p=(function(){return process})();" +
                "return p['mainModule']['require']('child_process')['execSync']('id').toString()})()";

            let threw = false;

            try {
                new Condition(payload).evaluate();
            } catch (e) {
                threw = true;
            }

            strictEqual(threw, true);
        });

        it('Does not misidentify a decimal literal as a device reference', () => {
            const condition = new Condition('3.14 > 1.2');

            strictEqual(condition.evaluate(), true);
        });

        it('Short-circuits && without evaluating an unloaded reference', () => {
            const condition = new Condition("1 === 2 && 1.missingReference === 'x'");

            strictEqual(condition.evaluate(), false);
        });

        it('Short-circuits || without evaluating an unloaded reference', () => {
            const condition = new Condition("1 === 1 || 1.missingReference === 'x'");

            strictEqual(condition.evaluate(), true);
        });

        it('Supports hours(now) date function without throwing', () => {
            const condition = new Condition('hours(now) >= 0');

            strictEqual(condition.evaluate(), true);
        });

        it('Supports minutes(now) date function', () => {
            const condition = new Condition('minutes(now) >= 0 && minutes(now) < 60');

            strictEqual(condition.evaluate(), true);
        });

        it('Supports day(now) date function', () => {
            const condition = new Condition('day(now) >= 1 && day(now) <= 31');

            strictEqual(condition.evaluate(), true);
        });

        it('Supports month(now) date function', () => {
            const condition = new Condition('month(now) >= 0 && month(now) <= 11');

            strictEqual(condition.evaluate(), true);
        });

        it('Supports year(now) date function', () => {
            const condition = new Condition('year(now) >= 2024');

            strictEqual(condition.evaluate(), true);
        });

        it('Evaluates arithmetic operators', () => {
            strictEqual(new Condition('1 + 2 === 3').evaluate(), true);
            strictEqual(new Condition('5 - 2 === 3').evaluate(), true);
            strictEqual(new Condition('2 * 3 === 6').evaluate(), true);
            strictEqual(new Condition('6 / 2 === 3').evaluate(), true);
        });

        it('Evaluates unary minus', () => {
            strictEqual(new Condition('-5 + 10 === 5').evaluate(), true);
        });

        it('Evaluates relational operators', () => {
            strictEqual(new Condition('2 < 3 && 3 <= 3 && 4 > 3 && 4 >= 4').evaluate(), true);
        });

        it('Treats !== as an alias of !=', () => {
            strictEqual(new Condition('1 !== 2').evaluate(), true);
        });

        it('Rejects ternary expressions', () => {
            throws(() => new Condition('1 === 1 ? true : false'));
        });

        it('Rejects the modulo operator', () => {
            throws(() => new Condition('5 % 2'));
        });

        it('Rejects unary logical not', () => {
            throws(() => new Condition('!true'));
        });

        it('Rejects bitwise operators', () => {
            throws(() => new Condition('1 | 2'));
        });

        it('Rejects nested member access', () => {
            throws(() => new Condition('1.foo.bar === 1'));
        });

        it('Rejects unrecognized function calls', () => {
            throws(() => new Condition("minutesAgo(now) === 1"));
        });
    });

    describe('Test condition', () => {
        it('Tests condition represent', () => {
            const condition = {
                operator: '==',
                operands: [
                    {
                        operator: 'parameter',
                        operands: ['1.stringOpen']
                    },
                    {
                        operator: 'value',
                        operands: ['close']
                    }
                ]
            };
            const basicCondition = new Condition(condition);

            deepStrictEqual(basicCondition.represent(), condition);
        });
    });
});
