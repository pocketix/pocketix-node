import jsep from 'jsep';
import {
    Add,
    Day,
    Divide,
    Equal,
    GreaterOrEqualThan,
    GreaterThan,
    Hours,
    LessOrEqualThan,
    LessThan,
    Minutes,
    Month,
    Multiply,
    NotEqual,
    Operator,
    Reference,
    Subtract,
    Year
} from './Operators';
import type {ReferenceRegistry} from './ReferenceRegistry';

type ParsedNode =
    | { kind: 'literal'; value: string | number | boolean | null }
    | { kind: 'reference'; ref: Reference }
    | { kind: 'dateCall'; op: Operator }
    | { kind: 'negate'; operand: ParsedNode }
    | { kind: 'logical'; operator: '&&' | '||'; left: ParsedNode; right: ParsedNode }
    | { kind: 'binary'; op: Operator; left: ParsedNode; right: ParsedNode };

class BasicConditionParseError extends Error {}

const DATE_FUNCTIONS: { [name: string]: () => Operator } = {
    hours: () => new Hours(),
    minutes: () => new Minutes(),
    day: () => new Day(),
    month: () => new Month(),
    year: () => new Year()
};

// Whitelist of the only binary operators an evaluated condition may use.
// === / !== are accepted as aliases of == / != since Equal/NotEqual already
// perform strict JS equality internally.
const BINARY_OPERATORS: { [op: string]: () => Operator } = {
    '+': () => new Add(),
    '-': () => new Subtract(),
    '*': () => new Multiply(),
    '/': () => new Divide(),
    '<': () => new LessThan(),
    '<=': () => new LessOrEqualThan(),
    '>': () => new GreaterThan(),
    '>=': () => new GreaterOrEqualThan(),
    '==': () => new Equal(),
    '===': () => new Equal(),
    '!=': () => new NotEqual(),
    '!==': () => new NotEqual()
};

// Reference targets are shaped `deviceId.parameterName` (e.g. "5451.Relay1"),
// where deviceId is typically numeric - so the first segment is any \w+, but
// the second segment must start with a letter/underscore. That second
// constraint is what tells a reference ("1.stringOpen") apart from a decimal
// number literal ("3.14"), whose second segment is purely digits.
const REFERENCE_REGEX = /(\w+)\.([A-Za-z_]\w*)/g;
const REFERENCE_PLACEHOLDER_PREFIX = '__pxRef';

/**
 * Rewrites every reference-shaped token in `raw` into a synthetic identifier
 * jsep can tokenize on its own (jsep can't parse a MemberExpression whose
 * object starts with a digit), and constructs one Reference per distinct
 * token found. Uses index-based slicing rather than string search/replace,
 * so one reference target being a substring of another can't corrupt the
 * result.
 */
function extractReferences(
    raw: string,
    registry: ReferenceRegistry
): { rewritten: string; references: Map<string, Reference> } {
    const references = new Map<string, Reference>();
    let rewritten = '';
    let cursor = 0;
    let count = 0;
    let match: RegExpExecArray | null;

    REFERENCE_REGEX.lastIndex = 0;

    while ((match = REFERENCE_REGEX.exec(raw)) !== null) {
        const target = match[0];
        const placeholder = `${REFERENCE_PLACEHOLDER_PREFIX}${count++}`;
        const ref = new Reference(registry);
        ref.initializeOperands([target]);
        references.set(placeholder, ref);

        rewritten += raw.slice(cursor, match.index) + placeholder;
        cursor = match.index + target.length;
    }

    rewritten += raw.slice(cursor);

    return {rewritten, references};
}

/**
 * Parses a "basic condition" string into a ParsedNode tree without ever
 * evaluating arbitrary code. jsep only tokenizes/parses into a plain AST -
 * this class then walks that AST and rejects anything outside the explicit
 * whitelist below (mirrors the whitelist the structured condition form
 * already enforces via OperatorFactory).
 */
class BasicConditionParser {
    private references: Map<string, Reference> = new Map();

    public parse(raw: string, registry: ReferenceRegistry): { ast: ParsedNode; references: Reference[] } {
        const {rewritten, references} = extractReferences(raw, registry);
        this.references = references;

        let tree: jsep.Expression;

        try {
            tree = jsep(rewritten);
        } catch (e: any) {
            throw new BasicConditionParseError(`Could not parse condition "${raw}": ${e.message}`);
        }

        const ast = this.build(tree);

        return {ast, references: [...references.values()]};
    }

    private build(node: jsep.Expression): ParsedNode {
        switch (node.type) {
            case 'Literal':
                return this.buildLiteral(node as jsep.Literal);
            case 'Identifier':
                return this.buildReference(node as jsep.Identifier);
            case 'CallExpression':
                return this.buildDateCall(node as jsep.CallExpression);
            case 'UnaryExpression':
                return this.buildUnary(node as jsep.UnaryExpression);
            case 'BinaryExpression':
                return this.buildBinary(node as jsep.BinaryExpression);
            default:
                throw new BasicConditionParseError(`Unsupported syntax in condition: "${node.type}"`);
        }
    }

    private buildLiteral(node: jsep.Literal): ParsedNode {
        if (typeof node.value === 'object' && node.value !== null) {
            throw new BasicConditionParseError('Unsupported literal in condition');
        }

        return {kind: 'literal', value: node.value};
    }

    private buildReference(node: jsep.Identifier): ParsedNode {
        const ref = this.references.get(node.name);

        if (!ref) {
            throw new BasicConditionParseError(
                `Unrecognized identifier "${node.name}" - references must be shaped "device.parameter"`
            );
        }

        return {kind: 'reference', ref};
    }

    private buildDateCall(node: jsep.CallExpression): ParsedNode {
        if (node.callee.type !== 'Identifier') {
            throw new BasicConditionParseError('Unsupported function call in condition');
        }

        const name = (node.callee as jsep.Identifier).name;
        const factory = DATE_FUNCTIONS[name];

        if (!factory) {
            throw new BasicConditionParseError(`Unsupported function "${name}" in condition`);
        }

        const [arg] = node.arguments;
        const isNowArgument = node.arguments.length === 1 && arg !== undefined && (
            (arg.type === 'Identifier' && (arg as jsep.Identifier).name === 'now') ||
            (arg.type === 'Literal' && (arg as jsep.Literal).value === 'now')
        );

        if (!isNowArgument) {
            throw new BasicConditionParseError(`"${name}(...)" only supports "now" as its argument`);
        }

        return {kind: 'dateCall', op: factory()};
    }

    private buildUnary(node: jsep.UnaryExpression): ParsedNode {
        if (node.operator !== '-') {
            throw new BasicConditionParseError(`Unsupported unary operator "${node.operator}"`);
        }

        return {kind: 'negate', operand: this.build(node.argument)};
    }

    private buildBinary(node: jsep.BinaryExpression): ParsedNode {
        if (node.operator === '&&' || node.operator === '||') {
            return {
                kind: 'logical',
                operator: node.operator,
                left: this.build(node.left),
                right: this.build(node.right)
            };
        }

        const factory = BINARY_OPERATORS[node.operator];

        if (!factory) {
            throw new BasicConditionParseError(`Unsupported operator "${node.operator}" in condition`);
        }

        return {kind: 'binary', op: factory(), left: this.build(node.left), right: this.build(node.right)};
    }
}

function evaluateBasicCondition(node: ParsedNode): any {
    switch (node.kind) {
        case 'literal':
            return node.value;
        case 'reference':
            return node.ref.value;
        case 'dateCall':
            return node.op.evaluate(['now']);
        case 'negate':
            return -evaluateBasicCondition(node.operand);
        case 'logical': {
            const left = evaluateBasicCondition(node.left);

            if (node.operator === '&&') {
                return left ? evaluateBasicCondition(node.right) : left;
            }

            return left ? left : evaluateBasicCondition(node.right);
        }
        case 'binary':
            return node.op.evaluate([evaluateBasicCondition(node.left), evaluateBasicCondition(node.right)]);
    }
}

export {BasicConditionParser, BasicConditionParseError, ParsedNode, evaluateBasicCondition};
