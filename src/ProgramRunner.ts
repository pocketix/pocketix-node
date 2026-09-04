import {Program} from './Program';
import {IRepresentable} from './IRepresentable';
import {Command} from './Command';
import {ICommander} from './ICommander';
import {IReferenceManager} from './IReferenceManager';
import {ReferencedValue} from './ReferencedValue';
import {ProgramRunnerError} from './ProgramRunnerError';

class ProgramRunner implements IRepresentable {
    get referenceManager(): IReferenceManager {
        if (!this._referenceManager) {
            throw new Error("No reference manager")
        }

        return this._referenceManager;
    }

    set referenceManager(value: IReferenceManager) {
        this._referenceManager = value;
    }
    get commander(): ICommander {
        if (!this._commander) {
            throw new Error("No commander")
        }

        return this._commander;
    }

    set commander(value: ICommander) {
        this._commander = value;
    }
    private program: Program = {} as Program;
    private _commander: ICommander | undefined;
    private _referenceManager: IReferenceManager | undefined;

    constructor() {
    }

    async run(dry: boolean = false): Promise<{ toUpdate: ReferencedValue[]; commands: Command[] }> {
        if (!this._referenceManager || !this._commander) {
            throw new Error("No reference manager or commander")
        }

        let references: ReferencedValue[];

        try {
            references = await this._referenceManager
                .load(this.program.getReferencesToLoad().map(item => ReferencedValue.fromReference(item)));

            this.program.setReferencesTargets(references);
        } catch (e) {
            throw new ProgramRunnerError('load', e);
        }

        let commands: Command[];

        try {
            commands = this.program.evaluate();
        } catch (e) {
            throw new ProgramRunnerError('evaluate', e);
        }

        try {
            await this._commander.sendCommands(dry, commands);
        } catch (e) {
            throw new ProgramRunnerError('sendCommands', e);
        }

        let toUpdate: ReferencedValue[];

        try {
            toUpdate = this.program.getReferencesToUpdate();
            await this._referenceManager.store(toUpdate);
        } catch (e) {
            throw new ProgramRunnerError('store', e);
        }

        return {commands, toUpdate};
    }

    represent(): any {
        return this.program.represent();
    }

    public setReferenceManager(referenceManager: IReferenceManager): this {
        this.referenceManager = referenceManager;
        return this;
    }

    public setCommander(commander: ICommander): this {
        this.commander = commander;
        return this;
    }

    public parseProgram(rawProgram: object): this {
        try {
            this.program = new Program(rawProgram);
        } catch (e) {
            throw new ProgramRunnerError('parse', e);
        }

        return this;
    }
}

export {ProgramRunner};
