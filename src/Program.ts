import {IEvaluable} from './IEvaluable';
import {IRepresentable} from './IRepresentable';
import {Block} from './Block';
import {ReferencedValue} from './ReferencedValue';
import {Reference} from './Operators';
import {Command} from './Command';
import {ReferenceRegistry} from './ReferenceRegistry';

class Program implements IEvaluable, IRepresentable {
    private block: Block;
    private readonly registry: ReferenceRegistry;

    constructor(program: object) {
        this.registry = new ReferenceRegistry();
        // @ts-ignore
        this.block = new Block(program.block, this.registry);
    }

    public getReferencesToLoad(): Reference[] {
        return this.registry.references.filter(
            (value, index, theRestOfReferences) =>
                theRestOfReferences.findIndex(
                    v2 => (v2.referenceTarget === value.referenceTarget)
                ) === index);
    }

    public setReferencesTargets(targets: ReferencedValue[]): void {
        this.registry.references.forEach(reference => {
            if (reference.referenceTarget) {
                this.registry.referenceTable[reference.referenceTarget] = targets.find(target =>
                  target.referenceTarget === reference.referenceTarget
                ) as ReferencedValue;
            }
        });
    }

    public getReferencesToUpdate(): ReferencedValue[] {
        return Object.values(this.registry.referenceTable).filter(reference => reference.dirty);
    }

    evaluate(): Command[] {
        return this.block.evaluate().flat(Infinity);
    }

    represent(): any {
        return this.block.represent();
    }
}

export {Program};
