import {describe} from 'mocha';
import {ProgramRunner} from '../src/ProgramRunner';
import {MockCommanderAndReferenceManager} from './MockCommanderAndReferenceManager';
import {deepStrictEqual} from 'assert';
import {Command} from '../src/Command';


const programs: {[key: string]: any} = {
    noReferences: undefined,
    singleReferenceInCondition: undefined,
    twoReferences: undefined,
    twoReferencesWithWrite: undefined
};

const commandOpen = Object.assign(Object.create(Command.prototype), {
    _commandId: 56,
    _commandValue: 'open',
    _deviceId: 5451,
    _params: [],
    name: `5451.56.open`
});

const commandClose = Object.assign(Object.create(Command.prototype), {
    _commandId: 56,
    _commandValue: 'close',
    _deviceId: 5451,
    _params: [],
    name: `5451.56.close`
});

let isBetweenHours = false;

describe('Test ProgramRunner', () => {
    beforeEach(() => {
        const hours = (new Date()).getHours();
        isBetweenHours = hours > 14 && hours < 23;

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
                                        name: 'write',
                                        params: ['5451.number', 1]
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
                                name: 'write',
                                params: ['5451.number', 0]
                            }
                        ],
                        condition: ''
                    }
                ],
                condition: ''
            }
        ];
    });


    it('Tests represent', () => {
        const programRunner = new ProgramRunner();
        const mockCommanderAndReferenceManager = new MockCommanderAndReferenceManager();
        programRunner.commander = mockCommanderAndReferenceManager;
        programRunner.referenceManager = mockCommanderAndReferenceManager;

        programRunner.parseProgram({block: programs.noReferences});

        deepStrictEqual(programRunner.represent(), programs.noReferences);
    });

    it('Tests run no references', async () => {
        const programRunner = new ProgramRunner();
        const mockCommanderAndReferenceManager = new MockCommanderAndReferenceManager();

        programRunner.commander = mockCommanderAndReferenceManager;
        programRunner.referenceManager = mockCommanderAndReferenceManager;
        programRunner.parseProgram({block: programs.noReferences});

        await programRunner.run(false);

        deepStrictEqual(mockCommanderAndReferenceManager.dry, false);
        deepStrictEqual(mockCommanderAndReferenceManager.sendCommandsCalledWithCommands, [isBetweenHours ? commandClose : commandOpen]);
        deepStrictEqual(mockCommanderAndReferenceManager.referencesLoaded, [
        ]);
    });

    it('Tests run single reference', async () => {
        const programRunner = new ProgramRunner();
        const mockCommanderAndReferenceManager = new MockCommanderAndReferenceManager();

        programRunner.commander = mockCommanderAndReferenceManager;
        programRunner.referenceManager = mockCommanderAndReferenceManager;
        programRunner.parseProgram({block: programs.singleReferenceInCondition});

        await programRunner.run(false);

        deepStrictEqual(mockCommanderAndReferenceManager.dry, false);
        deepStrictEqual(mockCommanderAndReferenceManager.sendCommandsCalledWithCommands, [isBetweenHours ? commandClose : commandOpen]);
        deepStrictEqual(mockCommanderAndReferenceManager.referencesLoaded, [
            '5451.Relay1'
        ]);
    });

    it('Tests run two references', async () => {
        const programRunner = new ProgramRunner();
        const mockCommanderAndReferenceManager = new MockCommanderAndReferenceManager();

        programRunner.commander = mockCommanderAndReferenceManager;
        programRunner.referenceManager = mockCommanderAndReferenceManager;
        programRunner.parseProgram({block: programs.twoReferences});

        await programRunner.run(false);

        deepStrictEqual(mockCommanderAndReferenceManager.dry, false);
        deepStrictEqual(mockCommanderAndReferenceManager.sendCommandsCalledWithCommands, [commandOpen]);
        deepStrictEqual(mockCommanderAndReferenceManager.referencesLoaded, [
            '5439.lvl_measurement_percent_full',
            '5451.Relay1',
        ]);
    });

    it('Tests run two references with write', async () => {
        const programRunner = new ProgramRunner();
        const mockCommanderAndReferenceManager = new MockCommanderAndReferenceManager();

        programRunner.commander = mockCommanderAndReferenceManager;
        programRunner.referenceManager = mockCommanderAndReferenceManager;
        programRunner.parseProgram({block: programs.twoReferencesWithWrite});

        await programRunner.run(false);

        deepStrictEqual(mockCommanderAndReferenceManager.dry, false);
        deepStrictEqual(mockCommanderAndReferenceManager.sendCommandsCalledWithCommands, [commandOpen]);
        deepStrictEqual(mockCommanderAndReferenceManager.referencesLoaded, [
            '5439.lvl_measurement_percent_full',
            '5451.Relay1',
            '5451.number',
        ]);
    });

    it('Tests run dry two references with write', async () => {
        const programRunner = new ProgramRunner();
        const mockCommanderAndReferenceManager = new MockCommanderAndReferenceManager();

        programRunner.commander = mockCommanderAndReferenceManager;
        programRunner.referenceManager = mockCommanderAndReferenceManager;
        programRunner.parseProgram({block: programs.twoReferencesWithWrite});

        await programRunner.run(true);

        deepStrictEqual(mockCommanderAndReferenceManager.dry, true);
        deepStrictEqual(mockCommanderAndReferenceManager.sendCommandsCalledWithCommands, [commandOpen]);
        deepStrictEqual(mockCommanderAndReferenceManager.referencesLoaded, [
            '5439.lvl_measurement_percent_full',
            '5451.Relay1',
            '5451.number',
        ]);
    });

    it('Tests run write saved by the editors', async () => {
        const programRunner = new ProgramRunner();
        const mockCommanderAndReferenceManager = new MockCommanderAndReferenceManager();

        programRunner.commander = mockCommanderAndReferenceManager;
        programRunner.referenceManager = mockCommanderAndReferenceManager;
        // Shape both editors save a write as (iotix-shared-tests fixtures/programs/write.json),
        // after the host has replaced names with ids.
        programRunner.parseProgram({block: [{name: 'write', params: ['5451.number', '21']}]});

        const {commands, toUpdate} = await programRunner.run(false);

        deepStrictEqual(commands, []);
        deepStrictEqual(toUpdate.map(reference => [reference.referenceTarget, reference.value]), [['5451.number', '21']]);
        deepStrictEqual(mockCommanderAndReferenceManager.referencedValuesStored, ['5451.number']);
    });
});

// Realistic sample programs combining multiple constructs in one full
// load -> evaluate -> sendCommands -> store pipeline, rather than exercising
// each construct (fork/if/switch/while) in isolation as the tests above and
// each construct's own dedicated test file do. Conditions are reference- or
// literal-based (never `hours(now)`) so these stay deterministic regardless
// of when the suite runs.
describe('Test ProgramRunner realistic sample programs', () => {
    it('runs a switch statement nested inside a fork/if, matched by a loaded reference', async () => {
        const program = [
            {
                name: 'fork',
                block: [
                    {
                        name: 'if',
                        block: [
                            {
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
                            }
                        ],
                        condition: '5439.lvl_measurement_percent_full > 10'
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

        const programRunner = new ProgramRunner();
        const mockCommanderAndReferenceManager = new MockCommanderAndReferenceManager();

        programRunner.commander = mockCommanderAndReferenceManager;
        programRunner.referenceManager = mockCommanderAndReferenceManager;
        programRunner.parseProgram({block: program});

        await programRunner.run(false);

        // 5439.lvl_measurement_percent_full is 50 (> 10) so the `if` runs the
        // switch; 5451.Relay1 is 'open' so the switch's `case` (not `default`)
        // fires.
        deepStrictEqual(mockCommanderAndReferenceManager.sendCommandsCalledWithCommands, [commandClose]);
        deepStrictEqual(mockCommanderAndReferenceManager.referencesLoaded, [
            '5439.lvl_measurement_percent_full',
            '5451.Relay1',
        ]);
    });

    it('runs a while loop that writes its own exit condition, through the full store pipeline', async () => {
        const program = [
            {
                name: 'while',
                condition: '1.flag === 0',
                block: [
                    {
                        name: '5451.56.close',
                        params: []
                    },
                    {
                        name: 'write',
                        params: ['1.flag', 1]
                    }
                ]
            }
        ];

        const programRunner = new ProgramRunner();
        const mockCommanderAndReferenceManager = new MockCommanderAndReferenceManager();

        programRunner.commander = mockCommanderAndReferenceManager;
        programRunner.referenceManager = mockCommanderAndReferenceManager;
        programRunner.parseProgram({block: program});

        await programRunner.run(false);

        // 1.flag starts at 0, so the loop body runs once; the in-loop Write
        // flips it to 1, so the re-checked condition is false on the second
        // pass and the loop stops - exactly one command sent, and the flipped
        // value persisted back via store().
        deepStrictEqual(mockCommanderAndReferenceManager.sendCommandsCalledWithCommands, [commandClose]);
        deepStrictEqual(mockCommanderAndReferenceManager.referencesLoaded, ['1.flag']);
        deepStrictEqual(mockCommanderAndReferenceManager.referencedValuesStored, ['1.flag']);
    });
});
