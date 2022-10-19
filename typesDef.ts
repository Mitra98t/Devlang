export enum Tokens {
    identifier = "IDENTIFIER",
    number = "NUMBER",
    string = "STRING",
    rpar = "RPAR",
    lpar = "LPAR",
    rbra = "RBRA",
    lbra = "LBRA",
    typeDef = "TYPE_DEF",
    keyword = "KEYWORD",
    fatArrow = "FAT_ARROW",
    assign = "ASSIGN",
    whiteSpace = "WS",
    newLine = "NL",
    lineDelimiter = "LINE_DELIMITER",
    endOfFile = "EOF",
    comment = "COMMENT",

    program = "PROGRAM",
    expressionStatement = "EXPRESSION_STATEMENT",
    blockStatement = "BLOCK_STATEMENT",
    emptyStatement = "EMPTY_STATEMENT",

    binaryExpression = "BINARY_EXPRESSION",
    primaryExpression = "PRIMARY_EXPRESSION",
    parenthesizedExpression = "PARENTHESIZED_EXPRESSION",

    additiveOperator = "ADDITIVE_OPERATOR",
    multiplicativeOperator = "MULTIPLICATIVE_OPERATOR",

    invalid = "INVALID",
}

export type TokRecognition = {
    id: Tokens;
    match: RegExp;
};

export type Tok = {
    word: string;
    type: Tokens;
};
