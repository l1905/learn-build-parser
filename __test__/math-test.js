module.exports = test => {
    test(`
        2 + 2;
        `, {
        type: "Program",
        body: [
            {
                type: "ExpressionStatement",
                expression :{
                    type: "BinaryExpression",
                    operator: "+",
                    left: {
                        type: "Numericliteral",
                        value: 2,
                    },
                    right: {
                        type: "Numericliteral",
                        value: 2,
                    }
                }
            },
        ]
    });

    // Nested binary expression
    // left: 3+2
    // right: 2
    test(`
        3 + 2 - 2;
        `, {
        type: "Program",
        body: [
            {
                type: "ExpressionStatement",
                expression :{
                    type: "BinaryExpression",
                    operator: "-",
                    left: {
                        type: "BinaryExpression",
                        operator: "+",
                        left: {
                            type: "Numericliteral",
                            value: 3,
                        },
                        right: {
                            type: "Numericliteral",
                            value: 2,
                        }
                    },
                    right: {
                        type: "Numericliteral",
                        value: 2,
                    }
                }
            },
        ]
    });

    test(`
        2 * 2;
        `, {
        type: "Program",
        body: [
            {
                type: "ExpressionStatement",
                expression :{
                    type: "BinaryExpression",
                    operator: "*",
                    left: {
                        type: "Numericliteral",
                        value: 2,
                    },
                    right: {
                        type: "Numericliteral",
                        value: 2,
                    }
                }
            },
        ]
    });

    test(`
        2 * 2 * 2;
        `, {
        type: "Program",
        body: [
            {
                type: "ExpressionStatement",
                expression :{
                    type: "BinaryExpression",
                    operator: "*",
                    left: {
                        type: "BinaryExpression",
                        operator: "*",
                        left: {
                            type: "Numericliteral",
                            value: 2,
                        },
                        right: {
                            type: "Numericliteral",
                            value: 2,
                        }
                    },
                    right: {
                        type: "Numericliteral",
                        value: 2,
                    }
                }
            },
        ]
    });

    test(`
        2 + 2 * 2;
        `, {
        type: "Program",
        body: [
            {
                type: "ExpressionStatement",
                expression :{
                    type: "BinaryExpression",
                    operator: "+",
                    left: {
                        type: "Numericliteral",
                        value: 2,
                    },
                    right: {
                        type: "BinaryExpression",
                        operator: "*",
                        left: {
                            type: "Numericliteral",
                            value: 2,
                        },
                        right: {
                            type: "Numericliteral",
                            value: 2,
                        }
                    }
                }
            },
        ]
    });

    test(`
        (2 + 2) * 2;
        `, {
        type: "Program",
        body: [
            {
                type: "ExpressionStatement",
                expression :{
                    type: "BinaryExpression",
                    operator: "*",
                    left: {
                        type: "BinaryExpression",
                        operator: "+",
                        left: {
                            type: "Numericliteral",
                            value: 2,
                        },
                        right: {
                            type: "Numericliteral",
                            value: 2,
                        }
                    },
                    right: {
                        type: "Numericliteral",
                        value: 2,
                    }
                }
            },
        ]
    });

}