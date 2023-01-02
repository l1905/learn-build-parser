module.exports = test => {
    test(`
    "hello";
    42;
        
    `, {
        type: "Program",
        body: [
            {
                type: "ExpressionStatement",
                expression: {
                    type: "Stringliteral",
                    value: "hello",
                }
            },
            {
                type: "ExpressionStatement",
                expression: {
                    type: "Numericliteral",
                    value: 42,
                }
            }
        ]
    })
}