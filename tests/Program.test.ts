import {Program} from '../src/Program';
import {deepStrictEqual} from 'assert';
import {ValueType} from '../src/ValueType';
import {MockReferencedValue} from './MockReferencedValue';
import {Command} from '../src/Command';

const programs: {[key: string]: any} = {
    noReferences: undefined,
    singleReferenceInCondition: undefined,
    twoReferences: undefined,
    twoReferencesWithWrite: undefined
};

let isBetweenHours = false;
let referencedValues: MockReferencedValue[] = [];

describe('Test program', () => {
    beforeEach(() => {
        referencedValues = [
            Object.assign(new MockReferencedValue(), {
                _value: 50,
                _type: ValueType.Number,
                _dirty: false,
                _deviceId: 5439,
                _parameterName: 'lvl_measurement_percent_full'
            }),
            Object.assign(new MockReferencedValue(), {
                _value: 'open',
                _type: ValueType.String,
                _dirty: false,
                _deviceId: 5451,
                _parameterName: 'Relay1'
            }),
            Object.assign(new MockReferencedValue(), {
                _value: 10,
                _type: ValueType.Number,
                _dirty: false,
                _deviceId: 5451,
                _parameterName: 'number'
            })
        ];

        programs.noReferences = [
            {
                name: 'fork',
                block: [
                    {
                        name: 'if',
                        block: [
                            {
                                name: '5451.56.close',
                                params: []
                            }
                        ],
                        condition: 'hours(now) > 14 && hours(now) < 23'
                    },
                    {
                        name: 'else',
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
            }
        ];

        programs.singleReferenceInCondition = [
            {
                name: 'fork',
                block: [
                    {
                        name: 'if',
                        block: [
                            {
                                name: 'if',
                                block: [
                                    {
                                        name: '5451.56.close',
                                        params: []
                                    }
                                ],
                                condition: '5451.Relay1 === \'open\''
                            }
                        ],
                        condition: 'hours(now) > 14 && hours(now) < 23'
                    },
                    {
                        name: 'else',
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
            }
        ];

        programs.twoReferences = [
            {
                name: 'fork',
                block: [
                    {
                        name: 'if',
                        block: [
                            {
                                name: 'if',
                                block: [
                                    {
                                        name: '5451.56.close',
                                        params: []
                                    }
                                ],
                                condition: '5451.Relay1 === \'open\''
                            }
                        ],
                        condition: 'hours(now) > 14 && hours(now) < 23 && 5439.lvl_measurement_percent_full > 50'
                    },
                    {
                        name: 'else',
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
            }
        ];

        programs.twoReferencesWithWrite = [
            {
                name: 'fork',
                block: [
                    {
                        name: 'if',
                        block: [
                            {
                                name: 'if',
                                block: [
                                    {
                                        name: '5451.56.close',
                                        params: []
                                    },
                                    {
                                        reference: '5451.number',
                                        value: 1
                                    }
                                ],
                                condition: '5451.Relay1 === \'open\''
                            }
                        ],
                        condition: 'hours(now) > 14 && hours(now) < 23 && 5439.lvl_measurement_percent_full > 50'
                    },
                    {
                        name: 'else',
                        block: [
                            {
                                name: '5451.56.open',
                                params: []
                            },
                            {
                                reference: '5451.number',
                                value: 0
                            }
                        ],
                        condition: ''
                    }
                ],
                condition: ''
            }
        ];

        const hours = (new Date()).getHours();
        isBetweenHours = hours > 14 && hours < 23;
    });

    describe('Test represent', () => {
        it('No references', () => {
            const program = new Program({block: programs.noReferences});

            deepStrictEqual(program.represent(), programs.noReferences);
        });

        it('Single reference', () => {
            const program = new Program({block: programs.singleReferenceInCondition});

            deepStrictEqual(program.represent(), programs.singleReferenceInCondition);
        });

        it('Two references', () => {
            const program = new Program({block: programs.twoReferences});

            deepStrictEqual(program.represent(), programs.twoReferences);
        });

        it('Two references with write', () => {
            const program = new Program({block: programs.twoReferencesWithWrite});

            deepStrictEqual(program.represent(), programs.twoReferencesWithWrite);
        });
    });

    describe('Test references loading', () => {
        it('No references', () => {
            const program = new Program({block: programs.noReferences});

            const referencesToLoad = program.getReferencesToLoad().map(item => item.referenceTarget);

            deepStrictEqual(referencesToLoad, []);
        });

        it('Single reference', () => {
            const program = new Program({block: programs.singleReferenceInCondition});

            const referencesToLoad = program.getReferencesToLoad().map(item => item.referenceTarget);

            deepStrictEqual(referencesToLoad, [
                '5451.Relay1'
            ]);
        });

        it('Two references', () => {
            const program = new Program({block: programs.twoReferences});

            const referencesToLoad = program.getReferencesToLoad().map(item => item.referenceTarget);

            deepStrictEqual(referencesToLoad, [
                '5439.lvl_measurement_percent_full',
                '5451.Relay1'
            ]);
        });

        it('Three references', () => {
            const program = new Program({block: programs.twoReferencesWithWrite});

            const referencesToLoad = program.getReferencesToLoad().map(item => item.referenceTarget);

            deepStrictEqual(referencesToLoad, [
                '5439.lvl_measurement_percent_full',
                '5451.Relay1',
                '5451.number'
            ]);
        });
    });

    describe('Test evaluate', () => {
        it('No references', () => {
            const program = new Program({block: programs.noReferences});
            program.setReferencesTargets(referencedValues);

            const command = Object.assign(new Command({name: ''}), {
                _commandId: 56,
                _commandValue: isBetweenHours ? 'close' : 'open',
                _deviceId: 5451,
                _params: [],
                name: `5451.56.${isBetweenHours ? 'close' : 'open'}`
            });

            deepStrictEqual(program.evaluate(), [command]);
            deepStrictEqual(program.getReferencesToUpdate(), []);
        });

        it('Single reference', () => {
            const program = new Program({block: programs.singleReferenceInCondition});
            program.setReferencesTargets(referencedValues);

            // The fork's outer if/else always produces exactly one command:
            // "close" when between hours (the nested if's Relay1 === 'open'
            // is satisfied by the mock data) and "open" from the outer else
            // otherwise - never zero commands.
            const command = Object.assign(new Command({name: ''}), {
                _commandId: 56,
                _commandValue: isBetweenHours ? 'close' : 'open',
                _deviceId: 5451,
                _params: [],
                name: `5451.56.${isBetweenHours ? 'close' : 'open'}`
            });

            deepStrictEqual(program.evaluate(), [command]);
            deepStrictEqual(program.getReferencesToUpdate(), []);
        });

        it('Two references', () => {
            const program = new Program({block: programs.twoReferences});
            program.setReferencesTargets(referencedValues);

            const command = Object.assign(new Command({name: ''}), {
                _commandId: 56,
                _commandValue: 'open',
                _deviceId: 5451,
                _params: [],
                name: `5451.56.open`
            });

            deepStrictEqual(program.evaluate(), [command]);
            deepStrictEqual(program.getReferencesToUpdate(), []);
        });

        it('Two references with write', () => {
            const program = new Program({block: programs.twoReferencesWithWrite});
            program.setReferencesTargets(referencedValues);

            const command = Object.assign(new Command({name: ''}), {
                _commandId: 56,
                _commandValue: 'open',
                _deviceId: 5451,
                _params: [],
                name: `5451.56.open`
            });

            const numberReference = referencedValues.find(value => value.referenceTarget === '5451.number');
            const reference = Object.assign(new MockReferencedValue(), {
                ...numberReference,
                _value: 0,
                _dirty: true
            });

            deepStrictEqual(program.evaluate(), [command]);
            deepStrictEqual(program.getReferencesToUpdate(), [reference]);
        });

        it('Does not mutate the caller-supplied ReferencedValue objects', () => {
            const program = new Program({block: programs.twoReferencesWithWrite});
            program.setReferencesTargets(referencedValues);

            const originalNumberReference = referencedValues.find(value => value.referenceTarget === '5451.number') as MockReferencedValue;
            const snapshotBeforeEvaluate = Object.assign(new MockReferencedValue(), originalNumberReference);

            program.evaluate();

            // The write inside the program must land on Program's own copy,
            // never on the exact object the caller passed into
            // setReferencesTargets().
            deepStrictEqual(originalNumberReference, snapshotBeforeEvaluate);
        });

    });
});
