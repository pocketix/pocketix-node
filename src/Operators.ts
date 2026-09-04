import {IRepresentable} from './IRepresentable';
import {ReferencedValue} from './ReferencedValue';
import type {ReferenceRegistry} from './ReferenceRegistry';


enum Operators {
    GreaterThan = '>',
    GreaterOrEqualThan = '>=',
    LessThan = '<',
    LessOrEqualThan = '<=',
    Equal = '==',
    NotEqual = '!=',
    Add = '+',
    Subtract = '-',
    Multiply = '*',
    Divide = '/',
    Value = 'value',
    Parameter = 'parameter',
    Minutes = 'minutes',
    Hours = 'hours',
    Day = 'day',
    Month = 'month',
    Year = 'year',
    And = '&&',
    Or = '||'
}

abstract class Operator implements IRepresentable {
    protected _operandCount = 0;
    protected _operator: Operators = Operators.And;

    get operandCount(): number {
        return this._operandCount;
    }
    get operator(): Operators {
        return this._operator;
    }

    isCorrectNumberOfOperands(operandCount: number): boolean {
        return this._operandCount === operandCount;
    }

    abstract evaluate(operands: any[]): any;

    /**
     * Fire any check, that should be done before runtime (references)
     * @param _ operands to check
     */
    initializeOperands(_: any[]): void {}

    public represent(): Operators {
        return this._operator;
    }

    protected toNumber(value: any): number {
        const num = +value;

        if (Number.isNaN(num)) {
            throw new Error(`Cannot use non-numeric value "${value}" in an arithmetic operation`);
        }

        return num;
    }
}

class LessThan extends Operator {
    constructor() {
        super();
        this._operandCount = 2;
        this._operator = Operators.LessThan;
    }

    evaluate(operands: any[]): any {
        return operands[0] < operands[1];
    }
}


class LessOrEqualThan extends Operator {
    constructor() {
        super();
        this._operandCount = 2;
        this._operator = Operators.LessOrEqualThan;
    }

    evaluate(operands: any[]): any {
        return operands[0] <= operands[1];
    }
}

class GreaterThan extends Operator {
    constructor() {
        super();
        this._operandCount = 2;
        this._operator = Operators.GreaterThan;
    }

    evaluate(operands: any[]): any {
        return operands[0] > operands[1];
    }
}

class GreaterOrEqualThan extends Operator {
    constructor() {
        super();
        this._operandCount = 2;
        this._operator = Operators.GreaterOrEqualThan;
    }

    evaluate(operands: any[]): any {
        return operands[0] >= operands[1];
    }
}

class Equal extends Operator {
    constructor() {
        super();
        this._operandCount = 2;
        this._operator = Operators.Equal;
    }

    evaluate(operands: any[]): any {
        return operands[0] === operands[1];
    }
}

class NotEqual extends Operator {
    constructor() {
        super();
        this._operandCount = 2;
        this._operator = Operators.NotEqual;
    }

    evaluate(operands: any[]): any {
        return operands[0] !== operands[1];
    }
}

class Add extends Operator {
    constructor() {
        super();
        this._operandCount = 2;
        this._operator = Operators.Add;
    }

    evaluate(operands: any[]): any {
        const operand1 = this.toNumber(operands[0]);
        const operand2 = this.toNumber(operands[1]);

        return operand1 + operand2;
    }
}

class Subtract extends Operator {
    constructor() {
        super();
        this._operandCount = 2;
        this._operator = Operators.Subtract;
    }

    evaluate(operands: any[]): any {
        const operand1 = this.toNumber(operands[0]);
        const operand2 = this.toNumber(operands[1]);

        return operand1 - operand2;
    }
}

class Multiply extends Operator {
    constructor() {
        super();
        this._operandCount = 2;
        this._operator = Operators.Multiply;
    }

    evaluate(operands: any[]): any {
        const operand1 = this.toNumber(operands[0]);
        const operand2 = this.toNumber(operands[1]);

        return operand1 * operand2;
    }
}

class Divide extends Operator {
    constructor() {
        super();
        this._operandCount = 2;
        this._operator = Operators.Divide;
    }

    evaluate(operands: any[]): any {
        const operand1 = this.toNumber(operands[0]);
        const operand2 = this.toNumber(operands[1]);

        if (operand2 === 0) {
            throw new Error('Division by zero');
        }

        return operand1 / operand2;
    }
}

class Value extends Operator {
    constructor() {
        super();
        this._operandCount = 1;
        this._operator = Operators.Value;
    }

    evaluate(operands: any[]): any {
        return operands[0];
    }
}

class Reference extends Operator {
    get value(): any {
        const value = this.referenceFromReferenceTable.value;
        return typeof value === 'object' ? value.value : value;
    }

    set value(value: any) {
        const target = this.referenceFromReferenceTable;
        target.value = value;
        target.dirty = true;
    }
    get referenceTarget(): string {
        return this._referenceTarget;
    }

    private get referenceFromReferenceTable(): ReferencedValue {
        return this.registry.referenceTable[this._referenceTarget];
    }
    private _referenceTarget: string;
    private readonly registry: ReferenceRegistry;

    constructor(registry: ReferenceRegistry) {
        super();
        this._operandCount = 1;
        this._operator = Operators.Parameter;
        this._referenceTarget = "";
        this.registry = registry;
        this.registry.references.push(this);
    }

    public initializeOperands(operands: any[]): void {
        this._referenceTarget = operands[0];
    }

    public evaluate(_: any[]): any {
        return this.value;
    }
}

class Minutes extends Operator {
    constructor() {
        super();
        this._operandCount = 2;
        this._operator = Operators.Minutes;
    }

    evaluate(operands: any[]): any {
        const date = operands[0] === 'now' ? new Date() : new Date(operands[0]);

        return date.getMinutes();
    }
}

class Hours extends Operator {
    constructor() {
        super();
        this._operandCount = 2;
        this._operator = Operators.Hours;
    }

    evaluate(operands: any[]): any {
        const date = operands[0] === 'now' ? new Date() : new Date(operands[0]);

        return date.getHours();
    }
}

class Day extends Operator {
    constructor() {
        super();
        this._operandCount = 2;
        this._operator = Operators.Day;
    }

    evaluate(operands: any[]): any {
        const date = operands[0] === 'now' ? new Date() : new Date(operands[0]);

        return date.getDate();
    }
}

class Month extends Operator {
    constructor() {
        super();
        this._operandCount = 2;
        this._operator = Operators.Month;
    }

    evaluate(operands: any[]): any {
        const date = operands[0] === 'now' ? new Date() : new Date(operands[0]);

        return date.getMonth();
    }
}

class Year extends Operator {
    constructor() {
        super();
        this._operandCount = 2;
        this._operator = Operators.Year;
    }

    evaluate(operands: any[]): any {
        const date = operands[0] === 'now' ? new Date() : new Date(operands[0]);

        return date.getFullYear();
    }
}

class And extends Operator {
    constructor() {
        super();
        this._operandCount = 2;
        this._operator = Operators.And;
    }

    evaluate(operands: any[]): any {
        return operands[0] && operands[1];
    }
}

class Or extends Operator {
    constructor() {
        super();
        this._operandCount = 2;
        this._operator = Operators.Or;
    }

    evaluate(operands: any[]): any {
        return operands[0] || operands[1];
    }
}

export {
    Operators,
    Operator,
    LessThan,
    LessOrEqualThan,
    GreaterThan,
    GreaterOrEqualThan,
    Equal,
    NotEqual,
    Add,
    Subtract,
    Multiply,
    Divide,
    Value,
    Reference,
    Minutes,
    Hours,
    Day,
    Month,
    Year,
    And,
    Or
};
