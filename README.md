# **IoTiX Node**
A backend module for interpreting and executing IoTiX V1 automation scripts — designed for smart devices and IoT integrations.

## **Overview**
**IoTiX Node** is an interpret for the IoTiX v1 ecosystem. It allows programs written in the IoTiX V1 visual programming language to be evaluated, interpreted, and transformed into actionable commands for downstream smart devices.

The interpreter works only with a digital twin of the devices: it reads parameter values, evaluates the program, and hands the resulting commands and parameter changes to the system above it, which is what actually talks to the devices. IoTiX therefore needs no knowledge of devices, protocols or gateways, which also makes it suitable for simulation, testing and safe validation.

## **Features**
✅ Evaluates IoTiX V1 programs into commands and device state updates  
✅ Knows only the digital twin; the embedding system sends commands to devices — supports dry-run simulations  
✅ Plug-in architecture via interfaces: define your own commander and reference system  
✅ Easily extendable for custom gateways, validation logic, or IoT orchestration

## **Usage**

To get started, implement your own classes for the following:
- `ICommander`: Receives the commands produced by a run and passes them to the system that sends them to the devices
- `IReferenceManager`: Loads parameter values from the digital twin and stores the ones the program changed
- `ReferencedValue`: Extend this abstract class to define reference behavior

Then run the program using:
```ts
const runner = new ProgramRunner()  
.setCommander(commander)  
.setReferenceManager(referenceManager)  
.parseProgram(program);

const {commands, toUpdate} = await runner.run();
```
- `commands` contains the actions to be sent to the devices
- `toUpdate` contains the device states or parameters that changed as a result of the evaluation

The runner **does not** communicate with devices. `run(dry)` passes the commands, together with the `dry` flag, to your `ICommander.sendCommands` and the changed parameters to your `IReferenceManager.store`; delivering commands to the devices and persisting state is the job of the system above IoTiX. Your implementations therefore keep full control over validation, batching and whether a command is executed at all — ignoring commands when `dry` is `true` gives a safe simulation.

✅ Use it for:
- Safe program simulations (dry-runs)
- Validation of automations
- Command previewing or auditing

## **Tests**
Unit tests are located in the `/tests` directory.

To run the test suite:
```bash
npm run test
```

## **Related Projects**
- 🔗 [vpl-for-things](https://github.com/pocketix/vpl-for-things) — WIP version of new editor built in Lit compatible with IoTiX v2 language
- 🔗 [iotix-react](https://github.com/pocketix/iotix-react) — React-based scripting editor for the same ecosystem
- 🔗 [iotixng](https://github.com/pocketix/iotixng) — Angular-based scripting editor for the same ecosystem
- 🔗 [Pocketix Node Core](https://github.com/pocketix/pocketix-node-core) — A simple environment for basic IoT management (unrelated project, not part of this rename)

## **Contributing**
We welcome contributions! To get involved:

1) Fork the repo and create a new branch for your feature/fix
2) Follow our code style (checked via TSLint in `tslint.json`)
3) Test your changes to ensure everything works smoothly
4) Submit a pull request with a clear summary of your work

## **License**
This project is licensed under the MIT License.  
See the [LICENSE](LICENSE) file for more information.
