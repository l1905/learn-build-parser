/**
 * Tokenizer spec
 */
const Spec = [

    //WhiteSpace:
    [/^\s+/, null],

    // Skip string-line comments
    [/^\/\/.*/, null],

    // skip multi-line comments
    [/^\/\*[\s\S]*?\*\//, null],

    // Symbols, delimiters
    [/^;/, ";"],

    // Block
    [/^\{/, "{"],
    [/^\}/, "}"],
    [/^\(/, "("],
    [/^\)/, ")"],
    [/^,/, ","], // 声明语句中， 多个变量 let a,b = 10
    [/^\./, "."],
    [/^\[/, "["],
    [/^\]/, "]"],


    // keywords
    [/^\blet\b/, 'let'],
    [/^\bif\b/, 'if'],
    [/^\belse\b/, 'else'],
    [/^\btrue\b/, 'true'],
    [/^\bfalse\b/, 'false'],
    [/^\bnull\b/, 'null'],
    [/^\bwhile\b/, 'while'],
    [/^\bdo\b/, 'do'],
    [/^\bfor\b/, 'for'],
    [/^\bdef\b/, 'def'],
    [/^\breturn\b/, 'return'],

    [/^\bclass\b/, 'class'],
    [/^\bextends\b/, 'extends'],
    [/^\bsuper\b/, 'super'],
    [/^\bnew\b/, 'new'],
    [/^\bthis\b/, 'this'],


    // numbers:
    [/^\d+/, "NUMBER"],

    [/^\w+/, "IDENTIFIER"],

    // Equality operators ==, !=
    [/^[=!]=/, "EQUALITY_OPERATOR"],

    // Assignment operators: =, *=, /=, +=, -=,
    [/^=/, "SIMPLE_ASSIGN"],
    [/^[\*\/\+\-]=/, "COMPLEX_ASSIGN"],
    

    // Math operators: +, -, *, /
    [/^[+\-]/, "ADDITIVE_OPERATOR"],
    [/^[*\/]/, "MULTIPLICATIVE_OPERATOR"],

    // Relational operators: >, >=, <, <=
    [/^[><]=?/, "RELATIONAL_OPERATOR"],

    // Logic operators: &&, ||
    [/^&&/, "LOGICAL_AND"],
    [/^\|\|/, "LOGICAL_OR"],
    [/^!/, "LOGICAL_NOT"],




    // Strings:
    [/^"[^"]*"/, "STRING"],
    [/^'[^']*'/, "STRING"],


];

class Tokenizer {
    init(string) {
        this._string = string;
        this._curor = 0;
    }

    isEOF() {
        return this._curor === this._string.length;
    }

    /**
     * Obtains next token
     */
    getNextToken() {
        if(!this.hasMoreTokens()) {
            return null;
        }
        // Numbers;
        const string = this._string.slice(this._curor);

        for (const [regexp, tokenType] of Spec) {
            const tokenValue = this._match(regexp, string);
            //Coun't match this rule, continuce
            if(tokenValue == null) {
                continue;
            }
            if(tokenType == null) {
                return this.getNextToken();
            }

            return {
                type: tokenType,
                value: tokenValue,
            }
        }

        throw new SyntaxError(`UnExpected token: "${string[0]}"`);
    }

    _match(regexp, string) {
        const matched = regexp.exec(string);
        if(matched == null) {
            return null;
        }

        this._curor += matched[0].length;
        return matched[0];
    }

    hasMoreTokens() {
        return this._curor < this._string.length;
    }
}

module.exports = {
    Tokenizer,
}