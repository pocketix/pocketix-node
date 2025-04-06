# **Pocketix Node**
A backend module for interpreting and executing Pocketix V1 automation scripts — designed for smart devices and IoT integrations.

## **Overview**
**Pocketix Node** is an interpret for the Pocketix v1 ecosystem. It allows programs written in the Pocketix V1 visual programming language to be evaluated, interpreted, and transformed into actionable commands for downstream smart devices.

The module provides interfaces and abstract classes to connect automation logic with real-world device layers, without directly triggering hardware actions — making it ideal for simulation, testing, and safe validation.

## **Features**
✅ Evaluates Pocketix V1 programs into commands and device state updates  
✅ Does not directly interact with hardware — supports dry-run simulations  
✅ Plug-in architecture via interfaces: define your own commander and reference system  
✅ Easily extendable for custom gateways, validation logic, or IoT orchestration

## **Usage**

To get started, implement your own classes for the following:
- `ICommander`: Handles dispatching commands to smart devices
- `IReferenceManager`: Manages reference resolution and state tracking
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

The runner **does not** send commands or apply changes itself — this is left to your implementation. This allows for full control over validation, batching, and decision logic before executing device actions.

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
- 🔗 [vpl-for-things](https://github.com/pocketix/vpl-for-things) — WIP version of new editor built in Lit compatible with Pocketix v2 language
- 🔗 [pocketix-react](https://github.com/pocketix/pocketix-react) — React version of the editor
- 🔗 [pocketixng](https://github.com/pocketix/pocketixng) — Angular-based scripting editor for the same ecosystem
- 🔗 [Pocketix Node Core](https://github.com/pocketix/pocketix-node-core) — A simple environment for basic IoT management

## **Contributing**
We welcome contributions! To get involved:

1) Fork the repo and create a new branch for your feature/fix
2) Follow our code style (checked via ESLint in `.eslintrc.json`)
3) Test your changes to ensure everything works smoothly
4) Submit a pull request with a clear summary of your work

## **License**
This project is licensed under the MIT License.  
See the [LICENSE](LICENSE) file for more information.

## **Roadmap**
- 📦 Library distribution for embedding in other apps
