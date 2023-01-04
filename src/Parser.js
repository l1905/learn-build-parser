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
        return this.AssignmentExpression();
    }

    /**
     * AssignmentExpression
     *     : AdditiveExpression
     *     | LeftHandSideExpression AssignmentOperator LeftHandSideExpression
     *     ;
     */
    AssignmentExpression() {
        const left = this.AdditiveExpression()
        if(!this._isAssignmentOperator(this._lookahead.type)) {
            return left;
        }
        return {
            type: 'AssignmentExpression',
            operator: this.AssignmentOperator().value,
            left: this._checkValidAssignmentTarget(left),
            right: this.AssignmentExpression(),
        }
    }


    /**
     * LeftHandSideExpression
     *     : Identifier
     *     ;
     */
    LeftHandSideExpression() {
        return this.Identifier();
    }

    /**
     * Identifier
     *     : IDENTIFIER
     *     ;
     */
    Identifier() {
        const name = this._eat("IDENTIFIER").value;
        return {
            type: "Identifier",
            name,
        }
    }

    /**
     * Extra check whether It's valid assignment target
     */
    _checkValidAssignmentTarget(node) {
        if(node.type === "Identifier") {
            return node;
        }
        throw new SyntaxError("Invalid left-hand side in assignment expression");
    }


    /**
     * Whether the token is an assignment operator
     */
    _isAssignmentOperator(tokenType) {
        return tokenType === "SIMPLE_ASSIGN" || tokenType === "COMPLEX_ASSIGN";
    }

    /**
     * AssignmentOperator
     *     : SIMPLE_ASSIGN
     *     | COMPLEX_ASSIGN
     *     ;
     */
    AssignmentOperator() {
        if(this._lookahead.type === "SIMPLE_ASSIGN") {
            return this._eat("SIMPLE_ASSIGN");
        }
        return this._eat("COMPLEX_ASSIGN");
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
     *     | LeftHandSideExpression
     *     ;
     */
    PrimaryExpression() {
        if(this._isLiteral(this._lookahead.type)) {
            return this.Literal();
        }
        switch (this._lookahead.type) {
            case "(":
                return this.ParenthesizedExpression();
            default:
                return this.LeftHandSideExpression();
        }

        /*switch (this._lookahead.type) {
            case "(":
                return this.ParenthesizedExpression();
            default:
                return this.Literal();
        }*/
    }

    /**
     * Whether the token is a literal
     */
    _isLiteral(tokenType) {
        return tokenType === "NUMBER" || tokenType === "STRING";
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