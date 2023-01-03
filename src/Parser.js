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
    StatementList(stopLookahead) {
        const statementList = [this.Statement()];
        while(this._lookahead != null && this._lookahead.type !== stopLookahead) {
            statementList.push(this.Statement());
        }
        return statementList;
    }

    /**
     * Statement:
     *     : ExpressionStatement
     *     | BlockStatement
     *     | emptyStatement
     *     ;
     * @constructor
     */
    Statement() {
        switch (this._lookahead.type) {
            case ";":
                return this.EmptyStatement();
            case "{":
                return this.BlockStatement();
            default:
                return this.ExpressionStatement();
        }
    }

    /**
     * EmptyStatement
     *     : ";"
     *     ;
     * @constructor
     */
    EmptyStatement() {
        this._eat(";");
        return {
            type: "EmptyStatement",
        }
    }

    /**
     * BlockStatement
     *     : '{' OptStatementList  '}'
     *     ;
     * @constructor
     */
    BlockStatement() {
        this._eat("{");
        const body = this._lookahead.type !== '}' ? this.StatementList("}") : [];
        this._eat("}");

        return {
            type: "BlockStatement",
            body,
        }

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
        return this.AdditiveExpression();
    }

    /**
     * AdditiveExpression
     *     : MultiplicativeExpression
     *     | AdditiveExpression ADDITIVE_OPERATOR  Literal -> AdditiveExpression ADDITIVE_OPERATOR  Literal ADDITIVE_OPERATOR  Literal
     *     ;
     */
    // 1+2+3
    AdditiveExpression() {
        return this._BinaryExpression(
            "MultiplicativeExpression",
            "ADDITIVE_OPERATOR");
        /*let left = this.MultiplicativeExpression();
        // 这里从左到右， 递归操作
        while(this._lookahead != null && this._lookahead.type === "ADDITIVE_OPERATOR") {
            const operator = this._eat("ADDITIVE_OPERATOR").value;
            const right = this.MultiplicativeExpression();
            left = {
                type: "BinaryExpression",
                operator,
                left,
                right,
            };
        }
        return left;
*/
    }

    /**
     * AdditiveExpression
     *     : PrimaryExpression
     *     | MultiplicativeExpression MULTIPLICATIVE_OPERATOR  PrimaryExpression -> MultiplicativeExpression MULTIPLICATIVE_OPERATOR  PrimaryExpression MULTIPLICATIVE_OPERATOR  PrimaryExpression
     *     ;
     */
    // 1+2+3
    MultiplicativeExpression() {
        return this._BinaryExpression(
            "PrimaryExpression",
            "MULTIPLICATIVE_OPERATOR");
        /*let left = this.PrimaryExpression();
        // 这里从左到右， 递归操作
        while(this._lookahead != null && this._lookahead.type === "MULTIPLICATIVE_OPERATOR") {
            // * /
            const operator = this._eat("MULTIPLICATIVE_OPERATOR").value;
            const right = this.PrimaryExpression();
            left = {
                type: "BinaryExpression",
                operator,
                left,
                right,
            };
        }
        return left;*/
    }

    // 重复代码合并
    _BinaryExpression(buildName, operatorToken) {
        let left = this[buildName]();
        // 这里从左到右， 递归操作
        while(this._lookahead != null && this._lookahead.type === operatorToken) {
            // * /
            const operator = this._eat(operatorToken).value;
            const right = this[buildName]();
            left = {
                type: "BinaryExpression",
                operator,
                left,
                right,
            };
        }
        return left;
    }

    /**
     * PrimaryExpression
     *     : Literal
     *     | ParenthesizedExpression 分组括号
     *     ;
     */
    PrimaryExpression() {
        switch (this._lookahead.type) {
            case "(":
                return this.ParenthesizedExpression();
            default:
                return this.Literal();
        }
    }

    /**
     * ParenthesizedExpression
     *     : '(' Expression ')'
     * @constructor
     */
    ParenthesizedExpression() {
        this._eat("(")
        const expression = this.Expression();
        this._eat(")")
        return expression;
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