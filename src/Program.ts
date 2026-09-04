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
                const target = targets.find(target =>
                  target.referenceTarget === reference.referenceTarget
                );

                if (target) {
                    // Copy rather than store the caller's object directly -
                    // evaluating the program mutates .value/.dirty on
                    // whatever ends up in referenceTable, and that must
                    // never be the caller's own object (they may hold onto
                    // it elsewhere, e.g. a shared device-state cache).
                    const TargetConstructor = target.constructor as new () => ReferencedValue;
                    this.registry.referenceTable[reference.referenceTarget] = Object.assign(new TargetConstructor(), target);
                }
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
