export enum EXPRESSION_TYPE {
    COLUMN = "COLUMN",
    LITERAL = "LITERAL",
    ALIAS = "ALIAS",
    AND = "AND",
    OR = "OR",
    NOT = "NOT",
    EQUAL = "EQ",
    NOT_EQUAL = "NEQ",
    LESS_THAN = "LT",
    LESS_THAN_OR_EQUAL = "LTE",
    GREATER_THAN = "GT",
    GREATER_THAN_OR_EQUAL = "GTE",
}
type ExpressionUnion = COLUMN | LITERAL | ALIAS | AND | OR | NOT | EQ | NEQ | GT | LT | GTE | LTE
interface Expression {
    type: EXPRESSION_TYPE
}
interface UnaryExpression extends Expression {
    operand: ExpressionUnion
}
interface BinaryExpression extends Expression {
    left: ExpressionUnion
    right: ExpressionUnion
}
interface AND extends BinaryExpression {
    type: EXPRESSION_TYPE.AND
}
interface OR extends BinaryExpression {
    type: EXPRESSION_TYPE.OR
}
interface NOT extends UnaryExpression {
    type: EXPRESSION_TYPE.NOT
}
interface EQ extends BinaryExpression {
    type: EXPRESSION_TYPE.EQUAL
}
interface NEQ extends BinaryExpression {
    type: EXPRESSION_TYPE.NOT_EQUAL
}
interface GT extends BinaryExpression {
    type: EXPRESSION_TYPE.GREATER_THAN
}
interface LT extends BinaryExpression {
    type: EXPRESSION_TYPE.LESS_THAN
}
interface GTE extends BinaryExpression {
    type: EXPRESSION_TYPE.GREATER_THAN_OR_EQUAL
}
interface LTE extends BinaryExpression {
    type: EXPRESSION_TYPE.LESS_THAN_OR_EQUAL
}
export interface COLUMN extends Expression {
    type: EXPRESSION_TYPE.COLUMN
    name: string
}
export interface LITERAL extends Expression {
    type: EXPRESSION_TYPE.LITERAL
    value: unknown
}
export interface ALIAS extends Expression {
    type: EXPRESSION_TYPE.ALIAS
    name: string
    expression: Expression
}
export interface Query {
    select: ExpressionUnion[]
    from: string
    where?: ExpressionUnion[]
    groupBy?: ExpressionUnion[]
    orderBy?: ExpressionUnion[]
    limit?: number
    offset?: number
}
export interface Schema {
    fields: Column[]
}
interface Column {
    name: string
    type: string
    nullable: boolean
    ordinal: number
}
