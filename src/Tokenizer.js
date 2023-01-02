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
        if(!Number.isNaN(Number(string[0]))) {
            let number = '';

            while(!Number.isNaN(Number(string[this._curor]))) {
                number += string[this._curor++];
            }
            return {
                type: "NUMBER",
                value: number,
            }
        }

        if(string[0] === '"') {
            let s = '';
            do {
                s += string[this._curor++];
            } while (string[this._curor] !== '"' && !this.isEOF());
            s += string[this._curor++]; // skip "
            return {
                type: "STRING",
                value: s,
            }
        }
        if(string[0] === "'") {
            let s = '';
            do {
                s += string[this._curor++];
            } while (string[this._curor] !== "'" && !this.isEOF());
            s += string[this._curor++]; // skip "
            return {
                type: "STRING",
                value: s,
            }
        }


        return null;
    }

    hasMoreTokens() {
        return this._curor < this._string.length;
    }
}

module.exports = {
    Tokenizer,
}