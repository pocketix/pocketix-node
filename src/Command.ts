import {IEvaluable} from './IEvaluable';
import {IRepresentable} from './IRepresentable';

class Command implements IEvaluable, IRepresentable {
    get params(): any[] {
        return this._params;
    }

    set params(value: any[]) {
        this._params = value;
    }
    get commandValue(): any {
        return this._commandValue;
    }
    get deviceId(): number {
        return this._deviceId;
    }
    get commandId(): number {
        return this._commandId;
    }
    private name: string;
    private _params: any[];
    private _commandValue: any;
    private _deviceId: number;
    private _commandId: number;

    constructor(raw: any) {
        this.name = raw.name;
        this._params = raw.params;

        const parts = this.name.split('.');

        if (parts.length !== 3) {
            throw new Error(`Malformed command name "${this.name}" - expected "deviceId.commandId.commandValue"`);
        }

        const [deviceId, commandId, commandValue] = parts;
        this._deviceId = +deviceId;
        this._commandId = +commandId;

        if (Number.isNaN(this._deviceId) || Number.isNaN(this._commandId)) {
            throw new Error(`Malformed command name "${this.name}" - deviceId and commandId must be numeric`);
        }

        this._commandValue = commandValue;
    }

    public represent(): any {
        return {
            name: this.name,
            params: this.params
        };
    }

    // Intentional: params are pre-resolved literal values, not expressions -
    // neither editor's language schema offers expression syntax for command
    // params (only plain string/array values), so there is nothing here to
    // evaluate. Confirmed intent; do not change this to evaluate params as
    // expressions without also adding editor support for it.
    evaluate(): any {
        return this;
    }
}

export {
    Command
};
