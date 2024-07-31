# pocketix-node
A backend programming module prepared for processing the Pocketix V1 visual programming language aimed primarily at smart devices.

## Usage
Firstly implement concrete classes for `ICommander` and `IReferenceManager` and extend the abstract class `ReferencedValue`.
These classes are used to send commands / messages downstream to each device, manage references and represent each reference and 
it's current state respectively.

A program then can be evaluated by running:
```ts
const runner = new ProgramRunner()
    .setCommander(commander)
    .setReferenceManager(referenceManager)
    .parseProgram(program);

const {commands, toUpdate} = await runner.run();
```
The variables `commands` and `toUpdate` then contain the commands, that should be triggered and sent to the smart device and the changed
parameters / state of these devices, if edited by the evaluation. The runner does not update these references directly, nor does it trigger
a command / reaction on the end devices.

This can be used to perform a dry run of the program, without influencing the real world and allows you the option to perform additional checks / validations
or restriction before sending the command (i.e. bunding for gateways).

## Tests
Tests are located in the `tests` directory and can be run using `npm run test`.
