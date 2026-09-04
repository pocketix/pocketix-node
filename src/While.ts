import {IEvaluable} from "./IEvaluable";
import {IRepresentable} from "./IRepresentable";
import {Block} from "./Block";
import {Condition} from "./Condition";
import type {ReferenceRegistry} from './ReferenceRegistry';

class While implements IEvaluable, IRepresentable {
    private static readonly MAX_ITERATIONS = 10000;

    private condition: Condition;
    private block: Block;

    constructor(raw: any, registry: ReferenceRegistry) {
        this.condition = new Condition(raw.condition, registry);
        this.block = new Block(raw.block, registry);
    }

    public represent(): any {
        return {
            name: 'while',
            condition: this.condition.represent(),
            block: this.block.represent()
        }
    }

    evaluate(): any {
        const results = [];
        let iterations = 0;

        while (this.condition.evaluate()) {
            if (++iterations > While.MAX_ITERATIONS) {
                throw new Error(`While loop exceeded ${While.MAX_ITERATIONS} iterations`);
            }

            results.push(this.block.evaluate());
        }

        return results;
    }
}

export {While};
