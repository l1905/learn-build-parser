/**
 * Letter parser: recursive descent implemention
 */
class Parser {
    parse(string) {
        this._string = string;

        return this.Program();
    }

    /**
     * Main entry point
     * Program:
     *     : Numericliteral
     */
    Program() {
        return this.Numericliteral();
    }

    Numericliteral() {
        return {
            type: "Numericliteral",
            value: Number(this._string),
        }
    }



}

module.exports = {
    Parser,
}