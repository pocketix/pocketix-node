import {IEvaluable} from './IEvaluable';
import {IRepresentable} from './IRepresentable';
import {If} from './If';
import type {ReferenceRegistry} from './ReferenceRegistry';

/**
 * Despite the name, this is not a parallel/concurrent branch construct - it's
 * the top-level container for an if/elseif/.../else chain, exactly mirroring
 * how a `switch` node contains a case/default chain. Delegating entirely to
 * `If.evaluate()` (which runs only the first truthy branch) is intentional,
 * not a bug: both editors render/model `fork` purely as an If-chain wrapper
 * (see language definitions' `parents: ["fork"]` on `elseif`/`else`), and no
 * evidence anywhere (either editor's UI, either editor's language model, or
 * this repo's own history/tests) ever treated multiple branches as running.
 */
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
