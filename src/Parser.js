/**
 * Letter parser: recursive descent implemention
 */
const {Tokenizer} = require('./Tokenizer');
class Parser {

    constructor() {
        this._string = '';
        this._tokenizer = new Tokenizer();
    }

    parse(string) {
        this._string = string;
        this._tokenizer.init(this._string);

        this._lookahead = this._tokenizer.getNextToken();

        return this.Program();
    }

    /**
     * Main entry point
     * Program:
     *     : StatementList
     *     ;
     */
    Program() {
        return {
            type: "Program",
            body:  this.StatementList(),
        }
    }

    /**
     *  StatementList
     *      : Statement
     *      | StatementList Statement => Statement Statement Statement Statement Statement
     *      ;
     */
    StatementList() {
        const statementList = [this.Statement()];
        while(this._lookahead != null) {
            statementList.push(this.Statement());
        }
        return statementList;
    }

    /**
     * Statement:
     *     : ExpressionStatement
     *     ;
     * @constructor
     */
    Statement() {
        return this.ExpressionStatement();
    }

    /**
     * ExpressionStatement
     *     : Expression ';'
     *     ;
     * @constructor
     */
    ExpressionStatement() {
        const expression = this.Expression();
        this._eat(";");
        return {
            type: "ExpressionStatement",
            expression,
        }
    }

    Expression() {
        return this.Literal();
    }


    /**
     * Literal
     *     : Numericliteral
     *     | StringLiteral
     * @constructor
     */
    Literal() {
        switch (this._lookahead.type) {
            case "NUMBER":return this.Numericliteral();
            case "STRING": return this.Stringliteral();
        }

        throw new SyntaxError(`Literal: unexpected literal production`);

    }


    Numericliteral() {
        const token = this._eat("NUMBER");

        return {
            type: "Numericliteral",
            value: Number(token.value),
        }
    }

    Stringliteral() {
        const token = this._eat("STRING");

        return {
            type: "Stringliteral",
            value: token.value.slice(1, -1),
        }
    }

    _eat(tokenType) {
        const token = this._lookahead;

        if(token == null) {
            throw new SyntaxError(
              `Unexpected end of input, expected: "${tokenType}"`,
            );
        }
        if(token.type !== tokenType) {
            throw new SyntaxError(
                `Unexpected token: "${token.value}", expected: "${tokenType}"`,
            );
        };
        this._lookahead = this._tokenizer.getNextToken();

        return token;
    }



}

module.exports = {
    Parser,
}