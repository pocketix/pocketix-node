import {deepStrictEqual} from 'assert';
import {OperandFactory} from '../src/OperandFactory';
import {Condition} from '../src/Condition';
import {ReferenceRegistry} from '../src/ReferenceRegistry';

describe('Test OperandFactory', () => {
    describe('Test Primitive case', () => {
        it('Test bool true', () => {
            const operandFactory = new OperandFactory();

            const boolTrue = operandFactory.create(true, new ReferenceRegistry());

            deepStrictEqual(boolTrue, true);
        });

        it('Test bool true', () => {
            const operandFactory = new OperandFactory();

            const boolFalse = operandFactory.create(false, new ReferenceRegistry());

            deepStrictEqual(boolFalse, false);
        });

        it('Test number', () => {
            const operandFactory = new OperandFactory();

            const primitiveNumber = operandFactory.create(10, new ReferenceRegistry());

            deepStrictEqual(primitiveNumber, 10);
        });

        it('Test string', () => {
            const operandFactory = new OperandFactory();

            const primitiveString = operandFactory.create('string', new ReferenceRegistry());

            deepStrictEqual(primitiveString, 'string');
        });
    });

    it('Test primitive bool true', () => {
        const operandFactory = new OperandFactory();

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

        const registry = new ReferenceRegistry();
        const simpleCondition = operandFactory.create(condition, registry);

        deepStrictEqual(simpleCondition, new Condition(condition, registry));
    });
});
