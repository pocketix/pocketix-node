import {Condition} from "./Condition";
import {Reference} from "./Operators";
import type {ReferenceRegistry} from './ReferenceRegistry';
type Primitive = string | number | boolean;
type Operand = Condition | Reference | Primitive;

const isPrimitive = (value: any) => typeof value !== 'object' && typeof value !== 'function';

class OperandFactory {
    public create(raw: any, registry: ReferenceRegistry): Operand {
        if (isPrimitive(raw)) {
            return raw as Primitive;
        }

        if (raw.hasOwnProperty('operands') && raw.hasOwnProperty('operator')) {
            return new Condition(raw, registry);
        }

        throw new Error('Unknown Operand');
    }
}

export {isPrimitive, OperandFactory, Operand};
