/**
 * Thrown by Program.setReferencesTargets() when the host's IReferenceManager
 * did not return a value for one or more references a program requested.
 * Surfaces as a ProgramRunnerError with phase "load".
 */
class UnresolvedReferenceError extends Error {
    public readonly referenceTargets: string[];

    constructor(referenceTargets: string[]) {
        super(`Could not resolve reference target(s): ${referenceTargets.join(', ')}`);
        this.name = 'UnresolvedReferenceError';
        this.referenceTargets = referenceTargets;
    }
}

export {UnresolvedReferenceError};
