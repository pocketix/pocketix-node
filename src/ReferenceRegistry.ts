import type {Reference} from './Operators';
import type {ReferencedValue} from './ReferencedValue';

/**
 * Owns the reference bookkeeping for a single Program: every Reference
 * constructed while parsing that Program's conditions/writes registers
 * itself here, and loaded values are looked up here at evaluation time.
 * One instance per Program - never shared across unrelated programs or runs.
 */
class ReferenceRegistry {
    public readonly references: Reference[] = [];
    public readonly referenceTable: { [key: string]: ReferencedValue } = {};
}

export {ReferenceRegistry};
