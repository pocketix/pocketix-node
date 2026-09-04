import {describe} from 'mocha';
import {deepStrictEqual, strictEqual, throws} from 'assert';
import {While} from '../src/While';
import {CommandFactory} from '../src/CommandFactory';
import {ReferenceRegistry} from '../src/ReferenceRegistry';
import {Command} from '../src/Command';
import {MockReferencedValue} from './MockReferencedValue';
import {ValueType} from '../src/ValueType';

describe('Test While', () => {
    it('is dispatched by CommandFactory for a "while"-named node', () => {
        const commandFactory = new CommandFactory();
        const raw = {name: 'while', condition: '1 === 2', block: [{name: '1.56.close', params: []}]};

        const result = commandFactory.create(raw, new ReferenceRegistry());

        strictEqual(result instanceof While, true);
    });

    it('never runs the body when the condition starts false', () => {
        const raw = {condition: '1 === 2', block: [{name: '1.56.close', params: []}]};
        const w = new While(raw, new ReferenceRegistry());

        deepStrictEqual(w.evaluate(), []);
    });

    it('re-checks the condition after every iteration, not just once', () => {
        // A real loop must keep iterating (and eventually hit the iteration
        // cap) for an always-true condition; the old buggy `if`-based
        // evaluate() would just run the body once and return silently,
        // never throwing regardless of how long the condition stays true.
        const raw = {condition: '1 === 1', block: [{name: '1.56.close', params: []}]};
        const w = new While(raw, new ReferenceRegistry());

        throws(() => w.evaluate(), /exceeded 10000 iterations/);
    });

    it('runs the body while a reference-backed condition holds, then stops', () => {
        const registry = new ReferenceRegistry();
        const raw = {condition: '1.flag === 0', block: [{reference: '1.flag', value: 1}]};
        const w = new While(raw, registry);

        registry.referenceTable['1.flag'] = Object.assign(new MockReferencedValue(), {
            _value: 0,
            _type: ValueType.Number,
            _dirty: false,
            _deviceId: 1,
            _parameterName: 'flag'
        });

        const result = w.evaluate();

        // Exactly one iteration: the Write in the body flips 1.flag from 0
        // to 1, which the condition re-checks and now finds false.
        strictEqual(result.length, 1);
        strictEqual(registry.referenceTable['1.flag'].value, 1);
    });

    it('collects commands produced by the loop body', () => {
        const registry = new ReferenceRegistry();
        const raw = {
            condition: '1.flag === 0',
            block: [
                {name: '1.56.close', params: []},
                {reference: '1.flag', value: 1}
            ]
        };
        const w = new While(raw, registry);

        registry.referenceTable['1.flag'] = Object.assign(new MockReferencedValue(), {
            _value: 0,
            _type: ValueType.Number,
            _dirty: false,
            _deviceId: 1,
            _parameterName: 'flag'
        });

        const result = w.evaluate().flat(Infinity);
        const commands = result.filter((item: any) => item instanceof Command);

        strictEqual(commands.length, 1);
    });

    it('round-trips represent() including the "while" name', () => {
        const raw = {name: 'while', condition: '1 === 2', block: [{name: '1.56.close', params: []}]};
        const w = new While(raw, new ReferenceRegistry());

        deepStrictEqual(w.represent(), raw);
    });
});
