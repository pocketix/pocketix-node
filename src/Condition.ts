import {IEvaluable} from './IEvaluable';
import {IRepresentable} from './IRepresentable';
import {Operator, Operators} from "./Operators";
import {isPrimitive, Operand, OperandFactory} from './OperandFactory';
import {OperatorFactory} from './OperatorFactory';
import {BasicConditionParser, evaluateBasicCondition, ParsedNode} from './BasicConditionParser';
import type {ReferenceRegistry} from './ReferenceRegistry';

class Condition implements IEvaluable, IRepresentable {
    private _operator: Operator | undefined;
    private _operands: Operand[] = [];
    private operatorFactory: OperatorFactory = new OperatorFactory();
    private operandFactory: OperandFactory = new OperandFactory();
    private parsedCondition?: ParsedNode;
    private readonly isBasicCondition: boolean;
    private raw?: string;

    constructor(raw: any, registry: ReferenceRegistry) {
        this.isBasicCondition = typeof raw === 'string';

        if (this.isBasicCondition) {
            this.raw = raw as string;
            this.handleBasicConditions(registry);
            return;
        }

        this._operands = (raw.operands as Operand[]).map(operand => this.operandFactory.create(operand, registry));
        this._operator = this.operatorFactory.create(raw.operator, registry);

        if (this._operator) {
          this._operator.initializeOperands(this._operands);
        }

        if ((!this.operator && this.operands?.length) || (this.operator && !this.operands?.length)) {
            throw new Error('No operands or unrecognized operator');
        }

        if (this.operands?.length && !this.operator.isCorrectNumberOfOperands(this.operands.length)) {
            throw new Error('Incorrect number of operands');
        }
    }

    private handleBasicConditions(registry: ReferenceRegistry): void {
        if (!this.raw) {
            return
        }

        this.parsedCondition = new BasicConditionParser().parse(this.raw, registry).ast;
    }

    get operands(): any[] {
        return this._operands;
    }

    set operands(value: Operand[]) {
        this._operands = value;
    }

    get operator(): Operator {
        return <Operator>this._operator;
    }

    set operator(value: Operator) {
        this._operator = value;
    }

    evaluate(): any {
        if (this.isBasicCondition) {
            if (!this.parsedCondition) {
                return undefined;
            }

            return evaluateBasicCondition(this.parsedCondition);
        }

        return this.operator.evaluate(this.operands.map(operand => isPrimitive(operand) ? operand : operand.evaluate()));
    }

    represent(): any {
        if (this.isBasicCondition) {
            return this.raw;
        }

        return {
            operator: this.operator.represent(),
            operands: this.operands.map(operand => isPrimitive(operand) ? operand : operand.represent())
        };
    }
}

export {Condition};
