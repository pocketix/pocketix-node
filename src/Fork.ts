import {IEvaluable} from './IEvaluable';
import {IRepresentable} from './IRepresentable';
import {If} from './If';
import type {ReferenceRegistry} from './ReferenceRegistry';

class Fork implements IEvaluable, IRepresentable {
    public static NAME = 'fork';
    private readonly block: If;

    constructor(raw: any, registry: ReferenceRegistry) {
        this.block = new If(raw.block, registry);
    }

    evaluate(): any {
        return this.block.evaluate();
    }

    represent(): any {
        return {
            name: Fork.NAME,
            block: this.block ? this.block.represent() : [],
            condition: ''
        };
    }
}

export {Fork};
