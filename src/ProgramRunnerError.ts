type ProgramRunnerErrorPhase = 'parse' | 'load' | 'evaluate' | 'sendCommands' | 'store';

/**
 * The one error type ProgramRunner.parseProgram()/run() ever throw. Wraps
 * whatever the interpreter internals threw (malformed program shape, an
 * unloaded reference, a failing commander/reference manager, ...) so callers
 * get a single stable, catchable type instead of an arbitrary Error/TypeError
 * from deep inside the interpreter, plus which phase failed.
 */
class ProgramRunnerError extends Error {
    public readonly phase: ProgramRunnerErrorPhase;
    public readonly cause: unknown;

    constructor(phase: ProgramRunnerErrorPhase, cause: unknown) {
        super(`ProgramRunner failed during "${phase}": ${cause instanceof Error ? cause.message : String(cause)}`);
        this.name = 'ProgramRunnerError';
        this.phase = phase;
        this.cause = cause;
    }
}

export {ProgramRunnerError, ProgramRunnerErrorPhase};
