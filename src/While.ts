import {IEvaluable} from "./IEvaluable";
import {IRepresentable} from "./IRepresentable";
import {Block} from "./Block";
import {Condition} from "./Condition";
import type {ReferenceRegistry} from './ReferenceRegistry';

class While implements IEvaluable, IRepresentable {
    private condition: Condition;
    private block: Block;

    constructor(raw: any, registry: ReferenceRegistry) {
        this.condition = new Condition(raw.condition, registry);
        this.block = new Block(raw.block, registry);
    }

    public represent(): any {
        return {
            condition: this.condition.represent(),
            block: this.block.represent()
        }
    }

    evaluate(): any {
        if (this.condition.evaluate()) {
            this.block.evaluate();
        }
    }
}

export {While};
