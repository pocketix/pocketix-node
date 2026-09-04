import {describe} from 'mocha';
import {deepStrictEqual, strictEqual, throws} from 'assert';
import {Command} from '../src/Command';


describe('Test command', () => {
    it('Tests command represent', () => {
        const rawCommand = {
            name: '5451.56.close',
            params: []
        };

        const command = new Command(rawCommand);

        deepStrictEqual(command.represent(), rawCommand);
    });

    it('Tests command evaluate', () => {
        const rawCommand = {
            name: '5451.56.close',
            params: []
        };

        const command = new Command(rawCommand);

        deepStrictEqual(command.evaluate(), command);
    });

    it('Tests name correctly parsed', () => {
        const rawCommand = {
            name: '5451.56.close',
            params: []
        };

        const command = new Command(rawCommand);

        strictEqual(command.deviceId, 5451);
        strictEqual(command.commandId, 56);
        strictEqual(command.commandValue, 'close');
    });

    it('Throws on a name with the wrong number of segments', () => {
        throws(() => new Command({name: '5451.56', params: []}), /Malformed command name/);
        throws(() => new Command({name: '5451.56.close.extra', params: []}), /Malformed command name/);
    });

    it('Throws on a non-numeric deviceId or commandId', () => {
        throws(() => new Command({name: 'abc.56.close', params: []}), /Malformed command name/);
        throws(() => new Command({name: '5451.abc.close', params: []}), /Malformed command name/);
    });
});
