import {IEvaluable} from './IEvaluable';
import {IRepresentable} from './IRepresentable';
import {Commandable, CommandFactory} from './CommandFactory';
import type {ReferenceRegistry} from './ReferenceRegistry';

class Block implements IEvaluable, IRepresentable {
    private commands: Commandable[];
    private commandFactory = new CommandFactory();

    constructor(rawBlock: any, registry: ReferenceRegistry) {
        const raw = Array.from(rawBlock) as any[];

        if (!raw.length) {
            throw new Error('Empty block');
        }

        this.commands = raw.map(item => this.commandFactory.create(item, registry));
    }

    represent(): any {
        return this.commands.map(command => command.represent());
    }

    evaluate(): any {
        return this.commands.map(command => command?.evaluate()).filter(item => item !== undefined);
    }
}

export {Block};
