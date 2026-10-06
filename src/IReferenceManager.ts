import {ReferencedValue, ReferencedValueItemsAsObject} from './ReferencedValue';

interface IReferenceManager {
    /**
     * Resolves each requested reference to its current value. If a
     * requested reference cannot be resolved (unknown device/parameter),
     * omit it from the returned array rather than throwing - Program will
     * reject the run with an UnresolvedReferenceError listing every target
     * that came back missing.
     */
    load(references: ReferencedValueItemsAsObject[]): Promise<ReferencedValue[]>;
    store(references: ReferencedValue[]): Promise<void>;
}

export {IReferenceManager};
