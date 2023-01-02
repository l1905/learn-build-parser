module.exports = test => {
    // NumericLiteral
    test(`42;`, {
        type: "Program",
        body: [
            {
                type: "ExpressionStatement",
                expression: {
                    type: "Numericliteral",
                    value: 42,
                }
            }
        ]
    });

    // StringLiteral "
    test(`"hello";`, {
        type: "Program",
        body: [
            {
                type: "ExpressionStatement",
                expression: {
                    type: "Stringliteral",
                    value: "hello",
                }
            }
        ]
    })

    // StringLiteral '
    test(`'hello';`, {
        type: "Program",
        body: [
            {
                type: "ExpressionStatement",
                expression: {
                    type: "Stringliteral",
                    value: "hello",
                },
            }
        ]
    })
}