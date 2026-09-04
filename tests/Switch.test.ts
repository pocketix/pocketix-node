import {deepStrictEqual} from 'assert';
import {Switch} from '../src/Switch';
import {Command} from '../src/Command';
import {ReferenceRegistry} from '../src/ReferenceRegistry';

describe('Test switch', () => {
    it('Tests condition represent', () => {
        const rawSwitch = {
            name: 'switch',
            block: [
                {
                    name: 'case',
                    block: [
                        {
                            name: '5451.56.close',
                            params: []
                        }
                    ],
                    condition: '5451.Relay1 === \'open\''
                },
                {
                    name: 'default',
                    block: [
                        {
                            name: '5451.56.open',
                            params: []
                        }
                    ],
                    condition: ''
                }
            ],
            condition: ''
        };
        const pxSwitch = new Switch(rawSwitch, new ReferenceRegistry());

        deepStrictEqual(pxSwitch.represent(), rawSwitch);
    });

    it('Tests evaluate runs the matching case', () => {
        const rawSwitch = {
            name: 'switch',
            block: [
                {
                    name: 'case',
                    block: [
                        {
                            name: '5451.56.close',
                            params: []
                        }
                    ],
                    condition: '1 === 1'
                },
                {
                    name: 'default',
                    block: [
                        {
                            name: '5451.56.open',
                            params: []
                        }
                    ],
                    condition: ''
                }
            ],
            condition: ''
        };
        const pxSwitch = new Switch(rawSwitch, new ReferenceRegistry());

        deepStrictEqual(pxSwitch.evaluate(), [new Command({name: '5451.56.close', params: []})]);
    });

    it('Tests evaluate falls back to default', () => {
        const rawSwitch = {
            name: 'switch',
            block: [
                {
                    name: 'case',
                    block: [
                        {
                            name: '5451.56.close',
                            params: []
                        }
                    ],
                    condition: '1 === 2'
                },
                {
                    name: 'default',
                    block: [
                        {
                            name: '5451.56.open',
                            params: []
                        }
                    ],
                    condition: ''
                }
            ],
            condition: ''
        };
        const pxSwitch = new Switch(rawSwitch, new ReferenceRegistry());

        deepStrictEqual(pxSwitch.evaluate(), [new Command({name: '5451.56.open', params: []})]);
    });
});
