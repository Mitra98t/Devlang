import { Tok, Tokens, TokRecognition } from "./typesDef";

const matches: TokRecognition[] = [
    { id: Tokens.newLine, match: /^\n/ },
    { id: Tokens.lineDelimiter, match: /^;/ },
    { id: Tokens.whiteSpace, match: /^[ \t]+/ },
    { id: Tokens.comment, match: /^\/\/.*/ }, // Single line comments
    { id: Tokens.comment, match: /^\/\*[\s\S]*?\*\// }, // Multi line comments
    { id: Tokens.lpar, match: /^\(/ },
    { id: Tokens.rpar, match: /^\)/ },
    { id: Tokens.lbra, match: /^\{/ },
    { id: Tokens.rbra, match: /^\}/ },
    { id: Tokens.typeDef, match: /^\:[ \t]*[a-zA-Z][a-zA-Z_0-9]*/ },
    { id: Tokens.fatArrow, match: /^\=\>/ },
    { id: Tokens.assign, match: /^\=/ },

    {id: Tokens.additiveOperator, match: /^[+\-]/},
    {id: Tokens.multiplicativeOperator, match: /^[*\/]/},

    { id: Tokens.string, match: /^"(?:\\["\\]|[^\n"\\])*"/ }, // String using "
    { id: Tokens.string, match: /^'(?:\\['\\]|[^\n'\\])*'/ }, // String using '
    { id: Tokens.identifier, match: /^[a-zA-Z][a-zA-Z_0-9]*/ },
    { id: Tokens.number, match: /^0|[1-9][0-9]*/ },
];

// const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class Lexer {
    code: string;
    tokens: Tok[];
    idx: number = -1;

    constructor(code: string) {
        this.code = code;
        this.tokens = [];
        this.tokenize();
    }

    nextToken(): Tok | null {
        this.idx += 1;
        if (this.idx >= this.tokens.length) {
            this.idx = this.tokens.length - 1;
            return null;
        }
        return this.tokens[this.idx];
    }
    prevToken(): Tok | null {
        this.idx -= 1;
        if (this.idx < 0) {
            this.idx = 0;
            return null;
        }
        return this.tokens[this.idx];
    }
    getToken(): Tok | null {
        if (this.idx > 0 && this.idx < this.tokens.length)
            return this.tokens[this.idx];
        return null;
    }

    tokenize(): Tok[] {
        let line: number = 0;
        let char: number = 0;
        let pos: number = 0;
        let code = this.code;
        let error = false;

        while (code.length > 0 && !error) {
            let tok: Tokens = Tokens.invalid;
            let string: string = "";
            let found: boolean = false;

            for (let i = 0; i < matches.length; i++) {
                const m = matches[i];
                let match = code.match(m.match);
                if (match?.[0] != null && !found) {
                    found = true;
                    tok = m.id;
                    string = match[0];
                    code = code.substring(match[0].length);
                    pos += match[0].length;
                    char += match[0].length;
                }
            }
            if (tok == Tokens.newLine) {
                line++;
                char = 0;
            }

            if (tok == Tokens.invalid) {
                string = "error at line " + line + " char " + (char + 1);
                error = true;
            }

            // Check for tokens to skyp
            if (
                [
                    Tokens.whiteSpace,
                    Tokens.comment,
                    Tokens.newLine,
                    Tokens.endOfFile,
                ].indexOf(tok) == -1
            )
                this.tokens.push({ word: string, type: tok });
        }
        // UNCOMMENT to include EOF
        // if (!error)
        //     this.tokens.push({ word: "end of file", type: Tokens.endOfFile });

        return this.tokens;
    }
}
