import { ALIAS, COLUMN, EXPRESSION_TYPE, LITERAL, Query, Schema } from "./expression"
import { Expression as SubstraitExpression } from "./proto-generated/substrait/algebra"
import { Plan } from "./proto-generated/substrait/plan"

function main() {
    const userSchema: Schema = {
        fields: [
            {
                ordinal: 0,
                name: "id",
                type: "i64",
                nullable: false,
            },
            {
                ordinal: 1,
                name: "name",
                type: "string",
                nullable: false,
            },
        ],
    }

    const userWhereNameEqJohn: Query = {
        from: "user",
        select: [
            {
                type: EXPRESSION_TYPE.COLUMN,
                name: "id",
            },
            {
                type: EXPRESSION_TYPE.COLUMN,
                name: "name",
            },
        ],
        where: [
            {
                type: EXPRESSION_TYPE.EQUAL,
                left: {
                    type: EXPRESSION_TYPE.COLUMN,
                    name: "name",
                },
                right: {
                    type: EXPRESSION_TYPE.LITERAL,
                    value: "John",
                },
            },
        ],
    }

    const substraitPlan = queryToSubstraitPlan(userWhereNameEqJohn, userSchema)
    console.log(JSON.stringify(substraitPlan, null, 2))
}

main()

///////////////////////////////////////////////////////////////////////////////////

function queryToSubstraitPlan(query: Query, schema: Schema): Plan {
    const plan: Plan = {
        expectedTypeUrls: [],
        extensions: [],
        extensionUris: [],
        relations: [
            {
                relType: {
                    oneofKind: "root",
                    root: {
                        names: query.select
                            .filter((e): e is COLUMN => e.type === EXPRESSION_TYPE.COLUMN)
                            .map((e) => e.name),
                        input: {
                            relType: {
                                oneofKind: "project",
                                project: {
                                    expressions: query.select.map((e) => {
                                        switch (e.type) {
                                            case EXPRESSION_TYPE.COLUMN:
                                                return buildSelect(e, schema)
                                            case EXPRESSION_TYPE.LITERAL:
                                                return buildLiteralSelect(e)
                                            case EXPRESSION_TYPE.ALIAS:
                                                return buildAliasedSelect(e, schema)
                                            default:
                                                throw new Error("Unsupported expression type")
                                        }
                                    }),
                                },
                            },
                        },
                    },
                },
            },
        ],
    }
    return plan
}

function buildSelect(column: COLUMN, schema: Schema): SubstraitExpression {
    return {
        rexType: {
            oneofKind: "selection",
            selection: {
                referenceType: {
                    oneofKind: "directReference",
                    directReference: {
                        referenceType: {
                            oneofKind: "structField",
                            structField: {
                                field: getOrdinalForFieldInSchema(column, schema),
                            },
                        },
                    },
                },
                rootType: {
                    oneofKind: "rootReference",
                    rootReference: {},
                },
            },
        },
    }
}

function buildLiteralSelect(e: LITERAL): SubstraitExpression {
    const jsLiteralType = typeof e.value
    const type = jsTypeToSubstraitType(jsLiteralType)

    return {
        rexType: {
            oneofKind: "literal",
            literal: {
                nullable: false,
                literalType: {
                    oneofKind: type as any,
                    [type]: e.value,
                },
            },
        },
    }

    function jsTypeToSubstraitType(_type: string): string {
        switch (_type) {
            case "string":
                return "string"
            case "number":
                if (Number.isInteger(e.value)) {
                    return "i64"
                } else {
                    return "f64"
                }
            case "boolean":
                return "boolean"
            case "array":
                return "list"
            case "object":
                if (e === null) {
                    return "null"
                } else {
                    return "struct"
                }
            default:
                throw new Error("Unsupported literal type:" + _type)
        }
    }
}

function buildAliasedSelect(e: ALIAS, schema: Schema): SubstraitExpression {
    throw new Error("Support for aliased expressions is not implemented yet")
}

function getOrdinalForFieldInSchema(column: COLUMN, schema: Schema): number {
    const field = schema.fields.find((f) => f.name === column.name)
    if (!field) {
        throw new Error(`Field ${column.name} not found in schema`)
    }
    return field.ordinal
}
