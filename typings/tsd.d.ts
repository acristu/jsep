declare module 'jsep' {

    namespace jsep {
        export interface ExpressionBase {
            type: ExpressionType;
            returnType: any;
            startIndex: number;
            endIndex: number;
            origExpr: string;
        }

        export interface ArrayExpression extends ExpressionBase {
            readonly type: 'ArrayExpression';
            elements: Expression[];
        }

        export interface BinaryExpression extends ExpressionBase {
            readonly type: 'BinaryExpression';
            operator: string;
            left: Expression;
            right: Expression;
        }

        export interface CallExpression extends ExpressionBase {
            readonly type: 'CallExpression';
            arguments: Expression[];
            callee: Expression;
        }

        export interface Compound extends ExpressionBase {
            readonly type: 'Compound';
            body: Expression[];
        }

        export interface ConditionalExpression extends ExpressionBase {
            readonly type: 'ConditionalExpression';
            test: Expression;
            consequent: Expression;
            alternate: Expression;
        }

        export interface Identifier extends ExpressionBase {
            readonly type: 'Identifier';
            name: string;
        }

        export interface NumberLiteral extends ExpressionBase {
            readonly type: 'NumberLiteral';
            value: number;
            raw: string;
        }
        export interface StringLiteral extends ExpressionBase {
            readonly type: 'StringLiteral';
            value: string;
            raw: string;
        }
        export interface Literal extends ExpressionBase {
            readonly type: 'Literal';
            value: boolean;
            raw: string;
        }

        export interface LogicalExpression extends ExpressionBase {
            readonly type: 'LogicalExpression';
            operator: string;
            left: Expression;
            right: Expression;
        }

        export interface MemberExpression extends ExpressionBase {
            readonly type: 'MemberExpression';
            computed: boolean;
            object: Expression;
            property: Expression;
        }

        export interface ThisExpression extends ExpressionBase {
            readonly type: 'ThisExpression';
        }

        export interface UnaryExpression extends ExpressionBase {
            readonly type: 'UnaryExpression';
            operator: string;
            argument: Expression;
            prefix: boolean;
        }

        type ExpressionType =
            | 'Compound'
            | 'Identifier'
            | 'MemberExpression'
            | 'NumberLiteral'
            | 'StringLiteral'
            | 'Literal'
            | 'ThisExpression'
            | 'CallExpression'
            | 'UnaryExpression'
            | 'BinaryExpression'
            | 'LogicalExpression'
            | 'ConditionalExpression'
            | 'ArrayExpression';

        type Expression =
            | Compound
            | Identifier
            | MemberExpression
            | NumberLiteral
            | StringLiteral
            | Literal
            | ThisExpression
            | CallExpression
            | UnaryExpression
            | BinaryExpression
            | LogicalExpression
            | ConditionalExpression
            | ArrayExpression;

        export function isExpression                (param: any): param is Expression;
        export function isCompound					(param: any): param is Compound;
        export function isIdentifier				(param: any): param is Identifier;
        export function isMemberExpression			(param: any): param is MemberExpression;
        export function isNumberLiteral			    (param: any): param is NumberLiteral;
        export function isStringLiteral			    (param: any): param is StringLiteral;
        export function isLiteral       			(param: any): param is Literal;
        export function isThisExpression			(param: any): param is ThisExpression;
        export function isCallExpression			(param: any): param is CallExpression;
        export function isUnaryExpression			(param: any): param is UnaryExpression;
        export function isBinaryExpression			(param: any): param is BinaryExpression;
        export function isLogicalExpression		    (param: any): param is LogicalExpression;
        export function isConditionalExpression	    (param: any): param is ConditionalExpression;
        export function isArrayExpression			(param: any): param is ArrayExpression;

        function addBinaryOp(operatorName: string, precedence: number): void;

        function addUnaryOp(operatorName: string): void;

        function removeBinaryOp(operatorName: string): void;

        function removeUnaryOp(operatorName: string): void;

        function addLiteral(literal_name: string, literal_value: string);

        function removeLiteral(literal_name: string);

        const version: string;
    }

    function jsep(val: string | jsep.Expression, forceParseIncompleteExpr?: boolean): jsep.Expression;

    export = jsep;
}
