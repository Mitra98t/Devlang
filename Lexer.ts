import { Tok, Tokens, TokRecognition } from "./typesDef";

const matches: TokRecognition[] = [
  // Ignorables
  { id: Tokens.newLine, match: /^\n/ },
  { id: Tokens.whiteSpace, match: /^[ \t]+/ },

  // Line Delimiter
  { id: Tokens.lineDelimiter, match: /^;/ },

  // Cmments
  { id: Tokens.comment, match: /^\/\/.*/ }, // Single line comments
  { id: Tokens.comment, match: /^\/\*[\s\S]*?\*\// }, // Multi line comments

  // Symbols
  { id: Tokens.lpar, match: /^\(/ },
  { id: Tokens.rpar, match: /^\)/ },
  { id: Tokens.lsqr, match: /^\[/ },
  { id: Tokens.rsqr, match: /^\]/ },
  { id: Tokens.lbra, match: /^\{/ },
  { id: Tokens.rbra, match: /^\}/ },
  { id: Tokens.comma, match: /^,/ },
  { id: Tokens.dot, match: /^\./ },

  // Equality Operators
  { id: Tokens.equalityOperator, match: /^[=!]=/ },


  // Arrow
  { id: Tokens.fatArrow, match: /^\=\>/ },
  //
  // Assignments
  { id: Tokens.complexAssign, match: /^[*\/+\-]=/ },
  { id: Tokens.assign, match: /^\=/ },

  // Type Definition
  { id: Tokens.typeDef, match: /^\:[ \t]*[a-zA-Z][a-zA-Z_0-9]*/ },

  // Keywords
  { id: Tokens.let, match: /^\blet\b/ },
  { id: Tokens.while, match: /^\bwhile\b/ },
  { id: Tokens.do, match: /^\bdo\b/ },
  { id: Tokens.for, match: /^\bfor\b/ },
  { id: Tokens.fun, match: /^\bfun\b/ },
  { id: Tokens.return, match: /^\breturn\b/ },
  { id: Tokens.if, match: /^\bif\b/ },
  { id: Tokens.else, match: /^\belse\b/ },
  { id: Tokens.true, match: /^\btrue\b/ },
  { id: Tokens.false, match: /^\bfalse\b/ },
  { id: Tokens.null, match: /^\bnull\b/ },
  { id: Tokens.class, match: /^\bclass\b/ },
  { id: Tokens.extends, match: /^\bextends\b/ },
  { id: Tokens.super, match: /^\bsuper\b/ },
  { id: Tokens.new, match: /^\bnew\b/ },
  { id: Tokens.this, match: /^\bthis\b/ },

  // Identifier
  { id: Tokens.identifier, match: /^[a-zA-Z][a-zA-Z_0-9]*/ },

  // Operators
  // Matematical Operator
  { id: Tokens.additiveOperator, match: /^[+\-]/ },
  { id: Tokens.multiplicativeOperator, match: /^[*\/]/ },
  // Relational Operators
  { id: Tokens.relationalOperator, match: /^[><]=?/ },
  // Logical Operators
  { id: Tokens.logicOR, match: /^\|\|/ },
  { id: Tokens.logicAND, match: /^&&/ },
  { id: Tokens.logicalNOT, match: /^!/ },


  // Literals
  // String
  { id: Tokens.string, match: /^"(?:\\["\\]|[^\n"\\])*"/ }, // String using "
  { id: Tokens.string, match: /^'(?:\\['\\]|[^\n'\\])*'/ }, // String using '
  // Number
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

  /**
  * return next token inside the token list
  */
  nextToken(): Tok | null {
    this.idx += 1;
    if (this.idx >= this.tokens.length) {
      this.idx = this.tokens.length - 1;
      return null;
    }
    return this.tokens[this.idx];
  }
  /**
  * return previous token inside the token list
  */
  prevToken(): Tok | null {
    this.idx -= 1;
    if (this.idx < 0) {
      this.idx = 0;
      return null;
    }
    return this.tokens[this.idx];
  }
  /**
  * Get current token inside the token list
  */
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
        this.tokens.push({ word: string, type: tok, line: line, col: char + 1 });
    }
    // UNCOMMENT to include EOF
    // if (!error)
    //     this.tokens.push({ word: "end of file", type: Tokens.endOfFile });

    return this.tokens;
  }
}
