export enum Tokens {
  // Literals
  number = "NUMBER",
  string = "STRING",
  // Symbols
  rpar = "RPAR",
  lpar = "LPAR",
  rbra = "RBRA",
  lbra = "LBRA",
  comma= "COMMA",

  typeDef = "TYPE_DEF",
  keyword = "KEYWORD",
  fatArrow = "FAT_ARROW",
  assign = "ASSIGN",
  complexAssign = "COMPLEX_ASSIGN",
  whiteSpace = "WS",
  newLine = "NL",
  lineDelimiter = "LINE_DELIMITER",
  endOfFile = "EOF",
  comment = "COMMENT",
  identifier = "IDENTIFIER",

  // Keywords
  let="let",
  if="if",
  else="else",

  program = "PROGRAM",
  // Statemens
  expressionStatement = "EXPRESSION_STATEMENT",
  blockStatement = "BLOCK_STATEMENT",
  emptyStatement = "EMPTY_STATEMENT",
  ifStatement = "IF_STATEMENT",

  // Expressions
  binaryExpression = "BINARY_EXPRESSION",
  primaryExpression = "PRIMARY_EXPRESSION",
  parenthesizedExpression = "PARENTHESIZED_EXPRESSION",
  assignmentExpression = "ASSIGNMENT_EXPRESSION",

  variableDeclaration = "VARIABLE_DECLARATION",

  // Operators
  additiveOperator = "ADDITIVE_OPERATOR",
  multiplicativeOperator = "MULTIPLICATIVE_OPERATOR",
  relationalOperator = "RELATIONAL_OPERATOR",

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
