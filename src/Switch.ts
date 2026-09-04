import {IEvaluable} from './IEvaluable';
import {IRepresentable} from './IRepresentable';
import {If} from './If';
import type {ReferenceRegistry} from './ReferenceRegistry';

/**
 * The `switch` node from both editors' language models - structurally
 * identical to `fork` (see Fork.ts), just labeled differently: a top-level
 * container for a case/.../default chain, delegating entirely to
 * If.evaluate() (first truthy branch only). Both editors model `case`/
 * `default` as `parents: ["switch"]` compound statements, exactly mirroring
 * how `elseif`/`else` are modeled under `fork`.
 */
class Switch implements IEvaluable, IRepresentable {
    public static NAME = 'switch';
    private readonly block: If;

    constructor(raw: any, registry: ReferenceRegistry) {
        this.block = new If(raw.block, registry);
    }

    evaluate(): any {
        return this.block.evaluate();
    }

    represent(): any {
        return {
            name: Switch.NAME,
            block: this.block ? this.block.represent() : [],
            condition: ''
        };
    }
}

export {Switch};
