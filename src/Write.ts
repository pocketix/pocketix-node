import {IEvaluable} from "./IEvaluable";
import {IRepresentable} from "./IRepresentable";
import { Reference } from "./Operators";
import type {ReferenceRegistry} from './ReferenceRegistry';

class Write implements IEvaluable, IRepresentable {
    public static NAME = 'write';

    private reference: Reference;
    private readonly value: any;
    constructor(raw: any, registry: ReferenceRegistry) {
        // Same shape the editors save a write as: an ordinary statement named
        // "write" whose params are [reference, value].
        if (!Array.isArray(raw.params) || raw.params.length !== 2) {
            throw new Error(`Malformed write - expected params [reference, value], got ${JSON.stringify(raw.params)}`);
        }

        const [reference, value] = raw.params;
        this.reference = new Reference(registry);
        this.reference.initializeOperands([reference]);
        this.value = value;
    }
    evaluate(): any {
        this.reference.value = this.value;
    }

    represent(): any {
        return {
            name: Write.NAME,
            params: [this.reference.referenceTarget, this.value]
        };
    }
}

export {Write};
