import {IEvaluable} from "./IEvaluable";
import {IRepresentable} from "./IRepresentable";
import { Reference } from "./Operators";
import type {ReferenceRegistry} from './ReferenceRegistry';

class Write implements IEvaluable, IRepresentable {
    private reference: Reference;
    private readonly value: any;
    constructor(raw: any, registry: ReferenceRegistry) {
        this.reference = new Reference(registry);
        this.reference.initializeOperands([raw.reference]);
        this.value = raw.value;
    }
    evaluate(): any {
        this.reference.value = this.value;
    }

    represent(): any {
        return {
            value: this.value,
            reference: this.reference.referenceTarget
        };
    }
}

export {Write};
