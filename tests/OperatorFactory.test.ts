import {strictEqual} from 'assert';
import {OperatorFactory} from '../src/OperatorFactory';
import {
    Add,
    And,
    Day,
    Divide,
    Equal,
    GreaterOrEqualThan,
    GreaterThan,
    Hours,
    LessOrEqualThan,
    LessThan,
    Minutes,
    Month,
    Multiply,
    NotEqual,
    Operators,
    Or,
    Reference,
    Subtract,
    Value,
    Year
} from '../src/Operators';
import {ReferenceRegistry} from '../src/ReferenceRegistry';

describe('Test OperatorFactory', () => {
    it('Test Operators.GreaterThan', () => {
        const operandFactory = new OperatorFactory();

        const operator = operandFactory.create(Operators.GreaterThan, new ReferenceRegistry());

        strictEqual(operator instanceof GreaterThan, true);
    });

    it('Test Operators.GreaterOrEqualThan', () => {
        const operandFactory = new OperatorFactory();

        const operator = operandFactory.create(Operators.GreaterOrEqualThan, new ReferenceRegistry());

        strictEqual(operator instanceof GreaterOrEqualThan, true);
    });

    it('Test Operators.LessThan', () => {
        const operandFactory = new OperatorFactory();

        const operator = operandFactory.create(Operators.LessThan, new ReferenceRegistry());

        strictEqual(operator instanceof LessThan, true);
    });

    it('Test Operators.LessOrEqualThan', () => {
        const operandFactory = new OperatorFactory();

        const operator = operandFactory.create(Operators.LessOrEqualThan, new ReferenceRegistry());

        strictEqual(operator instanceof LessOrEqualThan, true);
    });


    it('Test Operators.Equal', () => {
        const operandFactory = new OperatorFactory();

        const operator = operandFactory.create(Operators.Equal, new ReferenceRegistry());

        strictEqual(operator instanceof Equal, true);
    });

    it('Test Operators.NotEqual', () => {
        const operandFactory = new OperatorFactory();

        const operator = operandFactory.create(Operators.NotEqual, new ReferenceRegistry());

        strictEqual(operator instanceof NotEqual, true);
    });

    it('Test Operators.Add', () => {
        const operandFactory = new OperatorFactory();

        const operator = operandFactory.create(Operators.Add, new ReferenceRegistry());

        strictEqual(operator instanceof Add, true);
    });

    it('Test Operators.Subtract', () => {
        const operandFactory = new OperatorFactory();

        const operator = operandFactory.create(Operators.Subtract, new ReferenceRegistry());

        strictEqual(operator instanceof Subtract, true);
    });

    it('Test Operators.Multiply', () => {
        const operandFactory = new OperatorFactory();

        const operator = operandFactory.create(Operators.Multiply, new ReferenceRegistry());

        strictEqual(operator instanceof Multiply, true);
    });

    it('Test Operators.Divide', () => {
        const operandFactory = new OperatorFactory();

        const operator = operandFactory.create(Operators.Divide, new ReferenceRegistry());

        strictEqual(operator instanceof Divide, true);
    });

    it('Test Operators.Value', () => {
        const operandFactory = new OperatorFactory();

        const operator = operandFactory.create(Operators.Value, new ReferenceRegistry());

        strictEqual(operator instanceof Value, true);
    });

    it('Test Operators.Parameter', () => {
        const operandFactory = new OperatorFactory();

        const operator = operandFactory.create(Operators.Parameter, new ReferenceRegistry());

        strictEqual(operator instanceof Reference, true);
    });

    it('Test Operators.Minutes', () => {
        const operandFactory = new OperatorFactory();

        const operator = operandFactory.create(Operators.Minutes, new ReferenceRegistry());

        strictEqual(operator instanceof Minutes, true);
    });

    it('Test Operators.Hours', () => {
        const operandFactory = new OperatorFactory();

        const operator = operandFactory.create(Operators.Hours, new ReferenceRegistry());

        strictEqual(operator instanceof Hours, true);
    });

    it('Test Operators.Day', () => {
        const operandFactory = new OperatorFactory();

        const operator = operandFactory.create(Operators.Day, new ReferenceRegistry());

        strictEqual(operator instanceof Day, true);
    });

    it('Test Operators.Month', () => {
        const operandFactory = new OperatorFactory();

        const operator = operandFactory.create(Operators.Month, new ReferenceRegistry());

        strictEqual(operator instanceof Month, true);
    });

    it('Test Operators.Year', () => {
        const operandFactory = new OperatorFactory();

        const operator = operandFactory.create(Operators.Year, new ReferenceRegistry());

        strictEqual(operator instanceof Year, true);
    });

    it('Test Operators.And', () => {
        const operandFactory = new OperatorFactory();

        const operator = operandFactory.create(Operators.And, new ReferenceRegistry());

        strictEqual(operator instanceof And, true);
    });

    it('Test Operators.Or', () => {
        const operandFactory = new OperatorFactory();

        const operator = operandFactory.create(Operators.Or, new ReferenceRegistry());

        strictEqual(operator instanceof Or, true);
    });
});
