import {Command} from './Command';
import {If, IfBranch} from './If';
import {While} from './While';
import {Write} from './Write';
import {Fork} from './Fork';
import {Switch} from './Switch';
import type {ReferenceRegistry} from './ReferenceRegistry';

type Commandable = (If | IfBranch | Fork | Switch | While | Command | Write);
class CommandFactory {
    create(json: object | Array<any>, registry: ReferenceRegistry): Commandable {
        if (Array.isArray(json)) {
            return new If(json, registry);
        }

        if (json.hasOwnProperty('name') && (json as any).name === Fork.NAME) {
            return new Fork(json, registry);
        }

        if (json.hasOwnProperty('name') && (json as any).name === Switch.NAME) {
            return new Switch(json, registry);
        }

        if (json.hasOwnProperty('name') && (json as any).name === 'if') {
            return new IfBranch(json, registry);
        }

        if (json.hasOwnProperty('name') && (json as any).name === 'while') {
            return new While(json, registry);
        }

        if (json.hasOwnProperty('name') && json.hasOwnProperty('params')) {
            return new Command(json);
        }

        if (json.hasOwnProperty('reference') && json.hasOwnProperty('value')) {
            return new Write(json, registry);
        }

        throw new Error('No fitting commendable');
    }
}

export {
    CommandFactory,
    Commandable
};
