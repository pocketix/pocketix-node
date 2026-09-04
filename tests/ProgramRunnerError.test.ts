import {describe} from 'mocha';
import {strictEqual} from 'assert';
import {ProgramRunner} from '../src/ProgramRunner';
import {ProgramRunnerError} from '../src/ProgramRunnerError';
import {IReferenceManager} from '../src/IReferenceManager';
import {ICommander} from '../src/ICommander';
import {ReferencedValue, ReferencedValueItemsAsObject} from '../src/ReferencedValue';
import {Command} from '../src/Command';

class StubManager implements IReferenceManager, ICommander {
    constructor(
        private opts: {
            load?: (refs: ReferencedValueItemsAsObject[]) => Promise<ReferencedValue[]>;
            store?: (refs: ReferencedValue[]) => Promise<void>;
            sendCommands?: (dry: boolean, commands: Command[]) => Promise<void>;
        } = {}
    ) {}

    load(references: ReferencedValueItemsAsObject[]): Promise<ReferencedValue[]> {
        return this.opts.load ? this.opts.load(references) : Promise.resolve([]);
    }

    store(references: ReferencedValue[]): Promise<void> {
        return this.opts.store ? this.opts.store(references) : Promise.resolve();
    }

    sendCommands(dry: boolean, commands: Command[]): Promise<void> {
        return this.opts.sendCommands ? this.opts.sendCommands(dry, commands) : Promise.resolve();
    }
}

describe('Test ProgramRunnerError', () => {
    it('Wraps a malformed program as a "parse" phase error', () => {
        const runner = new ProgramRunner();

        let caught: any;

        try {
            runner.parseProgram({block: [{foo: 'bar'}]});
        } catch (e) {
            caught = e;
        }

        strictEqual(caught instanceof ProgramRunnerError, true);
        strictEqual(caught.phase, 'parse');
    });

    it('Wraps a failing reference load as a "load" phase error', async () => {
        const runner = new ProgramRunner();
        const stub = new StubManager({load: () => Promise.reject(new Error('load failed'))});

        runner.referenceManager = stub;
        runner.commander = stub;
        runner.parseProgram({block: [{name: '1.56.close', params: []}]});

        let caught: any;

        try {
            await runner.run();
        } catch (e) {
            caught = e;
        }

        strictEqual(caught instanceof ProgramRunnerError, true);
        strictEqual(caught.phase, 'load');
    });

    it('Wraps an unloaded reference dereference as an "evaluate" phase error', async () => {
        const runner = new ProgramRunner();
        const stub = new StubManager();

        runner.referenceManager = stub;
        runner.commander = stub;
        runner.parseProgram({
            block: [{
                name: 'fork',
                block: [
                    {name: 'if', block: [{name: '1.56.close', params: []}], condition: '1.missing === 1'},
                    {name: 'else', block: [{name: '1.56.open', params: []}], condition: ''}
                ],
                condition: ''
            }]
        });

        let caught: any;

        try {
            await runner.run();
        } catch (e) {
            caught = e;
        }

        strictEqual(caught instanceof ProgramRunnerError, true);
        strictEqual(caught.phase, 'evaluate');
    });

    it('Wraps a failing commander as a "sendCommands" phase error', async () => {
        const runner = new ProgramRunner();
        const stub = new StubManager({sendCommands: () => Promise.reject(new Error('send failed'))});

        runner.referenceManager = stub;
        runner.commander = stub;
        runner.parseProgram({block: [{name: '1.56.close', params: []}]});

        let caught: any;

        try {
            await runner.run();
        } catch (e) {
            caught = e;
        }

        strictEqual(caught instanceof ProgramRunnerError, true);
        strictEqual(caught.phase, 'sendCommands');
    });

    it('Wraps a failing store as a "store" phase error', async () => {
        const runner = new ProgramRunner();
        const stub = new StubManager({store: () => Promise.reject(new Error('store failed'))});

        runner.referenceManager = stub;
        runner.commander = stub;
        runner.parseProgram({block: [{name: '1.56.close', params: []}]});

        let caught: any;

        try {
            await runner.run();
        } catch (e) {
            caught = e;
        }

        strictEqual(caught instanceof ProgramRunnerError, true);
        strictEqual(caught.phase, 'store');
    });
});
