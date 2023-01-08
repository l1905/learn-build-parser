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
     *     | VariableStatement
     *     | IfStatment
     *     | IterationStatement
     *     ;
     * @constructor
     */
    Statement() {
        switch (this._lookahead.type) {
            case ";":
                return this.EmptyStatement();
            case "if":
                return this.IfStatement();
            case "{":
                return this.BlockStatement();
            case "let":
                return this.VariableStatement();
            case "while":
            case "do":    
            case "for": 
                return this.IterationStatement();
            default:
                return this.ExpressionStatement();
        }
    }

    /**
     *  IterationStatement
     *     : whileStatement
     *     | DoWhileStatement
     *     | ForStatement
     *     ;
     */
    IterationStatement() {
        switch(this._lookahead.type) {
            case "while":
                return this.WhileStatement();
            case "do":
                return this.DoWhileStatement();
            case "for":
                return this.ForStatement();
        }
    }

    /**
     * WhileStatement
     *   : "while" '(' Expression ')' Statement
     */
    WhileStatement() {
        this._eat("while");

        this._eat("(");
        const test = this.Expression();
        this._eat(")");

        const body = this.Statement();
        return {
            type: "WhileStatement",
            test, 
            body,
        };
    }

    /**
     * DoWhileStatement
     *   : 'do' Statement 'while' '(' Expression ')' ';'
     */
    DoWhileStatement() {
        this._eat("do");

        const body = this.Statement();
        
        this._eat("while");

        this._eat("(");
        const test = this.Expression();
        this._eat(")");
        this._eat(";");

        return {
            type: "DoWhileStatement",
            test, 
            body,
        };
    }

    /**
     * ForStatement
     *     : 'for' '(' OptForStatement ';'OptExpression '; 'OptExpression' ')' Statement
     *     ;
     */
    ForStatement() {
        this._eat("for");
        this._eat("(");
        const init = this._lookahead.type !== ';' ? this.ForStatementInit() : null;
        this._eat(";");
        
        const test = this._lookahead.type !== ';' ? this.Expression() : null;
        this._eat(";");

        const update = this._lookahead.type !== ')' ? this.Expression(): null;
        this._eat(')');

        const body = this.Statement();

        return {
            type: "ForStatement",
            init,
            test,
            update,
            body,
        };

    }

    /**
     * ForStatementInit
     *     : VariableStatementInit
     *     | Expression
     *     ;
     */
    ForStatementInit() {
        if(this._lookahead.type === "let") {
            return this.VariableStatementInit();
        }
        return this.Expression();
    }


    /**
     *   IfStatement
     *     : 'if' '(' Expression ')' Statement
     *     | 'if' '(' Expression ')' Statement 'else' Statement
     *     ;
     */
    IfStatement() {
        this._eat("if");

        this._eat("(");
        const test = this.Expression();
        this._eat(")");

        const consequent = this.Statement();

        const alternate = 
          this._lookahead != null && this._lookahead.type === 'else'
          ? this._eat("else") && this.Statement()
          : null;

        return  {
            type: "IfStatement",
            test,
            consequent,
            alternate
        };

    }

    /**
     * VariableStatementInit
     *     : 'let' VariableDeclarationList
     *     ;
     */
    VariableStatementInit() {
        this._eat("let");
        const declarations = this.VariableDeclarationList();
        return {
            type: "VariableStatement",
            declarations,
        }
    }

    /**
     * VariableStatement
     *     : 'let' VariableDeclarationList ';'
     *     ;
     */
    VariableStatement() {
        const variableStatement = this.VariableStatementInit();
        this._eat(';');
        return variableStatement;
    }

    /**
     * VariableDeclarationList
     *     : VariableDeclaration
     *     | VariableDeclarationList ',' VariableDeclaration
     *     ;
     */
    VariableDeclarationList() {
        const declarations = [];
        do {
            declarations.push(this.VariableDeclaration());
        } while (this._lookahead.type === ',' && this._eat(","));

        return declarations;
    }

    /**
     * VariableDeclaration
     *     : Identifier OptVariableInitializer
     */
    VariableDeclaration() {
        const id = this.Identifier();

        // OptVariableInitializer
        const init = 
          this._lookahead.type !== ';' && this._lookahead.type !== ','
            ? this.VariableInitializer()
            : null;
        return {
            type: "VariableDeclaration",
            id,
            init,

        }
    }

    /**
     *  VariableInitializer
     *     : SIMPLE_ASSIGN AssignmentExpression
     *     ;
     */
    VariableInitializer() {
        this._eat("SIMPLE_ASSIGN");
        return this.AssignmentExpression();
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
     *     : LogicalORExpression
     *     | LeftHandSideExpression AssignmentOperator LeftHandSideExpression
     *     ;
     */
    AssignmentExpression() {
        const left = this.LogicalORExpression()
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
     *     : PrimaryExpression
     *     ;
     */
    LeftHandSideExpression() {
        // return this.Identifier();
        return this.PrimaryExpression();
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
     * Logic AND expression
     *   x && y
     * LogicalANDExpression 
     *   : EqualityExpression LOGICAL_AND LogicalANDExpression
     *   | EqualityExpression 
     */
    LogicalANDExpression() {
        return this._LogicalExpression("EqualityExpression", "LOGICAL_AND");
    }

    /**
     * Logic OR expression
     *   x || y
     * LogicalORExpression 
     *   : LogicalANDExpression LOGICAL_OR LogicalORExpression
     *   | LogicalANDExpression 
     */
    LogicalORExpression() {
        return this._LogicalExpression("LogicalANDExpression", "LOGICAL_OR");
    }

    _LogicalExpression(buildName, operatorToken) {
        let left = this[buildName]();
        // 这里从左到右， 递归操作
        while(this._lookahead != null && this._lookahead.type === operatorToken) {
            // * /
            const operator = this._eat(operatorToken).value;
            const right = this[buildName]();
            left = {
                type: "LogicalExpression",
                operator,
                left,
                right,
            };
        }
        return left;
    }

    
    /** 
     * EQUALITY_OPERATOR: ==, !=
     *    x == y
     *    x != y
     * EqualityExpression
     *     : RelationalExpression
     *     | RelationalExpression EQUALITY_OPERATOR EqualityExpression 
    */
   EqualityExpression() {
      return this._BinaryExpression("RelationalExpression", "EQUALITY_OPERATOR")
   }


    /**
     *  RELATIONAL_OPERATOR: >, >=, <, <=
     *   x > y
     *   x >= y
     *   x <y
     *   x <= y
     * RelationExpression
     *   : AdditiveExpression
     *   | AdditveExpression RELATIONAL_OPERATOR AdditveExpression
     */
    RelationalExpression() {
        return this._BinaryExpression(
            "AdditiveExpression",
            "RELATIONAL_OPERATOR",
        );
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
     *     : UnaryExpression
     *     | MultiplicativeExpression MULTIPLICATIVE_OPERATOR  UnaryExpression -> MultiplicativeExpression MULTIPLICATIVE_OPERATOR  PrimaryExpression MULTIPLICATIVE_OPERATOR  PrimaryExpression
     *     ;
     */
    // 1+2+3
    MultiplicativeExpression() {
        return this._BinaryExpression(
            "UnaryExpression",
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
     *  UnaryExpression
     *     : LeftHandSideExpression
     *     | ADDITIVE_OPERATOR UnaryExpression
     *     | LOGICAL_NOT UnaryExpression
     */
    UnaryExpression() {
        let operator;
        switch (this._lookahead.type) {
            case "ADDITIVE_OPERATOR":
                operator = this._eat("ADDITIVE_OPERATOR").value;
                break;
            case 'LOGICAL_NOT':
                operator = this._eat("LOGICAL_NOT").value;
                break;
        }
        if(operator != null) {
            return {
                type: "UnaryExpression",
                operator,
                argument: this.UnaryExpression(),
            };
        }
        return this.LeftHandSideExpression();
    }



    /**
     * PrimaryExpression
     *     : Literal
     *     | ParenthesizedExpression 分组括号
     *     | Identifier
     *     ;
     */
    PrimaryExpression() {
        if(this._isLiteral(this._lookahead.type)) {
            return this.Literal();
        }
        switch (this._lookahead.type) {
            case "(":
                return this.ParenthesizedExpression();
            case "IDENTIFIER":
                return this.Identifier();
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
        return tokenType === "NUMBER" || 
        tokenType === "STRING" ||
        tokenType === "true" ||
        tokenType === "false" ||
        tokenType === "null" 
        ;
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
     *     | BooleanLiteral
     *     | NullLiteral
     * @constructor
     */
    Literal() {
        switch (this._lookahead.type) {
            case "NUMBER":return this.Numericliteral();
            case "STRING": return this.Stringliteral();
            case "true": return this.BooleanLiteral(true);
            case "false": return this.BooleanLiteral(false);
            case "null": return this.NullLiteral();
        }

        throw new SyntaxError(`Literal: unexpected literal production`);
    }

    /**
     * BooleanLiteral
     *   : "true"
     *   | "false"
     *   ;
     * @returns   
     */
    BooleanLiteral(value) {
        this._eat(value ? "true": "false");
        return {
            type: "BooleanLiteral",
            value,
        }
    }

    /**
     * NullLiteral
     *   : "null"
     *   ;
     * @returns N
     */
    NullLiteral() {
        this._eat("null");
        return {
            type: "NullLiteral",
            value: null,
        }
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