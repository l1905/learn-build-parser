module.exports = test => {
    // NumericLiteral
    test(`
        {
            "hello";
            42;

        }
        `, {
        type: "Program",
        body: [
            {
                type: "BlockStatement",
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
            },
        ]
    });


    test(`
        {
        }
        `, {
        type: "Program",
        body: [
            {
                type: "BlockStatement",
                body: [
                ]
            },
        ]
    });

    test(`
        {
            42;
            {
                "hello";
            }
    
        }
        `, {
        type: "Program",
        body: [
            {
                type: "BlockStatement",
                body: [
                    {
                        type: "ExpressionStatement",
                        expression: {
                            type: "Numericliteral",
                            value: 42,
                        }
                    },
                    {
                        type: "BlockStatement",
                        body: [
                            {
                                type: "ExpressionStatement",
                                expression: {
                                    type: "Stringliteral",
                                    value: "hello",
                                }
                            },
                        ],
                    }
                ]
            },
        ]
    });


}