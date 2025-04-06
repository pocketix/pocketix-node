import {Program} from './Program';
import {IRepresentable} from './IRepresentable';
import {Command} from './Command';
import {ICommander} from './ICommander';
import {IReferenceManager} from './IReferenceManager';
import {ReferencedValue} from './ReferencedValue';

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

        const references = await this._referenceManager
            .load(this.program.getReferencesToLoad().map(item => ReferencedValue.fromReference(item)));

        this.program.setReferencesTargets(references);

        const commands = this.program.evaluate();

        await this._commander.sendCommands(dry, commands);

        const toUpdate = this.program.getReferencesToUpdate();
        await this._referenceManager.store(toUpdate);


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
        this.program = new Program(rawProgram);
        return this;
    }
}

export {ProgramRunner};
