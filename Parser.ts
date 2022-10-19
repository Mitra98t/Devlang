import { Tok, Tokens } from "./typesDef";

import { Lexer } from "./Lexer";

export class Parser {
    lex: Lexer;
    string: string;
    lookahead: Tok | null;
    constructor(string: string) {
        this.string = string;
        this.lex = new Lexer(this.string);
        console.log(this.lex.tokens);
        this.lookahead = this.lex.nextToken();
    }

    parse() {
        return this.Program();
    }

    /**
     * Program
     *   : StatementList
     *   ;
     */
    Program() {
        return {
            type: Tokens.program,
            body: this.StatementList(),
        };
    }

    /**
     * StatementList
     *   : Statement
     *   | StatementList Statement
     *   ;
     */
    StatementList(stopLookAhead: Tokens | null = null) {
        const statementList = [this.Statement()];

        // Stop look ahead serve a evitare che vada avanti quando trova un tipo specifico
        // passo il tipo per parametro a statement list
        while (
            this.lookahead != null &&
            this.lookahead.type !== stopLookAhead
        ) {
            statementList.push(this.Statement());
        }

        return statementList;
    }

    /**
     * Statement
     *   : ExpressionStatement
     *   | BlockStatement
     *   | EmptyStatement
     *   ;
     */
    Statement() {
        switch (this.lookahead?.type) {
            case Tokens.lineDelimiter:
                return this.EmptyStatement();
            case Tokens.lbra:
                return this.BlockStatement();
            default:
                return this.ExpressionStatement();
        }
    }

    /**
     * EmptyStatement
     *   : ';'
     *   ;
     */
    EmptyStatement() {
        this.eat(Tokens.lineDelimiter);
        return {
            type: Tokens.emptyStatement,
        };
    }

    /**
     * ExpressionStatement
     *   : Expression ';'
     *   ;
     */
    ExpressionStatement() {
        const expression = this.Expression();
        this.eat(Tokens.lineDelimiter);
        return {
            type: Tokens.expressionStatement,
            expression,
        };
    }

    /**
     * BlockStatement
     *   : '{' OPT_StatementList '}'
     *   ;
     */
    BlockStatement() {
        this.eat(Tokens.lbra);

        const body: any =
            this.lookahead?.type !== Tokens.rbra
                ? this.StatementList(Tokens.rbra)
                : [];

        this.eat(Tokens.rbra);

        return {
            type: Tokens.blockStatement,
            body,
        };
    }

    /**
     * Expression
     *   : AdditiveExpression
     *   ;
     */
    Expression() {
        return this.AdditiveExpression();
    }

    /**
     * AdditiveExpression
     *   : MultiplicativeExpression
     *   | AdditiveExpression ADDITIVE_OPERATOR Literal
     *   ;
     */
    AdditiveExpression() {
        let left: any = this.MultiplicativeExpression();
        while (this.lookahead?.type === Tokens.additiveOperator) {
            const operator = this.eat(Tokens.additiveOperator).word;

            const right = this.MultiplicativeExpression();

            left = {
                type: Tokens.binaryExpression,
                operator,
                left,
                right,
            };
        }
        return left;
    }

    /**
     * MultiplicativeExpression
     *   : PrimaryExpression
     *   | MultiplicativeExpression MULTIPLICATIVE_OPERATOR PrimaryExpression
     *   ;
     */
    MultiplicativeExpression() {
        let left: any = this.PrimaryExpression();
        while (this.lookahead?.type === Tokens.multiplicativeOperator) {
            const operator = this.eat(Tokens.multiplicativeOperator).word;

            const right = this.PrimaryExpression();

            left = {
                type: Tokens.binaryExpression,
                operator,
                left,
                right,
            };
        }
        return left;
    }

    /**
     * PrimaryExpression
     *   : Literal
     *   | ParenthesizedExpression
     *   ;
     */
    PrimaryExpression() {
        switch (this.lookahead?.type) {
            case Tokens.lpar:
                return this.ParenthesizedExpression();
            default:
                return this.Literal();
        }
    }

    /**
     * ParenthesizedExpression
     *   : '(' Expression ')'
     */
    ParenthesizedExpression() {
        this.eat(Tokens.lpar);
        const expression = this.Expression();
        this.eat(Tokens.rpar);
        return expression;
    }

    /**
     * Literal
     *   : NumberLit
     *   | StringLit
     *   ;
     */
    Literal() {
        switch (this.lookahead?.type) {
            case Tokens.number:
                return this.NumberLit();
            case Tokens.string:
                return this.StringLit();
        }
        throw new SyntaxError("Literal: unexpected literal production");
    }

    /**
     * NumberLit
     *   : NUMBER
     *   ;
     */
    NumberLit() {
        const tok: Tok | null = this.eat(Tokens.number);
        return { type: Tokens.number, value: Number(tok?.word) };
    }

    /**
     * StringLit
     *   : String
     *   ;
     */
    StringLit() {
        const tok: Tok | null = this.eat(Tokens.string);
        return {
            type: Tokens.string,
            value: tok?.word.slice(1, -1),
        };
    }

    /**
     * Expects token of a given type
     */
    private eat(tokenType: Tokens): any {
        const token = this.lookahead;

        //Missing token
        if (token == null)
            throw new SyntaxError(
                "Unexpected end of input, expected: " + tokenType
            );

        // Wrong token type
        if (token.type != tokenType)
            throw new SyntaxError(
                "Unexpected token: " + token.type + ", expected: " + tokenType
            );

        this.lookahead = this.lex.nextToken();
        return token;
    }
}
