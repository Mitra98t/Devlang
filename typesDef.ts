export enum Tokens {
  // Literals
  number = "NUMBER",
  string = "STRING",
  boolean = "BOOLEAN",
  nullLiteral = "NULL_LITERAL",

  // Symbols
  rpar = "RPAR",
  lpar = "LPAR",
  rsqr = "RSQR",
  lsqr = "LSQR",
  rbra = "RBRA",
  lbra = "LBRA",
  comma = "COMMA",
  dot = "DOT",

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
  let = "let",
  if = "if",
  else = "else",
  true = "true",
  false = "false",
  null = "null",
  while = "while",
  do = "do",
  for = "for",
  fun = "fun",
  return = "return",
  class="class",
  extends="extends",
  super="super",
  new="new",
  this="this",
  import="import",
  run="run",

  program = "PROGRAM",
  // Statemens
  expressionStatement = "EXPRESSION_STATEMENT",
  blockStatement = "BLOCK_STATEMENT",
  emptyStatement = "EMPTY_STATEMENT",
  ifStatement = "IF_STATEMENT",
  whileStatement = "WHILE_STATEMENT",
  doWhileStatement = "DO_WHILE_STATEMENT",
  forStatement = "FOR_STATEMENT",
  returnStatement = "RETURN_STATEMENT",
  importStatement = "IMPORT_STATEMENT",
  runStatement = "RUN_STATEMENT",

  // Expressions
  binaryExpression = "BINARY_EXPRESSION",
  primaryExpression = "PRIMARY_EXPRESSION",
  memberExpression = "MEMBER_EXPRESSION",
  parenthesizedExpression = "PARENTHESIZED_EXPRESSION",
  assignmentExpression = "ASSIGNMENT_EXPRESSION",
  logicalExpression = "LOGICAL_EXPRESSION",
  unaryExpression = "UNARY_EXPRESSION",
  callExpression = "CALL_EXPRESSION",
  thisExpression = "THIS_EXPRESSION",
  newExpression = "NEW_EXPRESSION",
  
  //declarations
  variableDeclaration = "VARIABLE_DECLARATION",
  functionDeclaration = "FUNCTION_DECLARATION",
  classDeclaration = "CLASS_DECLARATION",

  // Operators
  additiveOperator = "ADDITIVE_OPERATOR",
  moduleOperator = "MODULE_OPERATOR",
  multiplicativeOperator = "MULTIPLICATIVE_OPERATOR",
  relationalOperator = "RELATIONAL_OPERATOR",
  equalityOperator = "EQUALITY_OPERATOR",
  logicAND = "LOGICAL_AND",
  logicOR = "LOGICAL_OR",
  logicalNOT = "LOGICAL_NOT",

  invalid = "INVALID",
}

export type TokRecognition = {
  id: Tokens;
  match: RegExp;
};

export type Tok = {
  word: string;
  type: Tokens;
  line: number,
  col: number,
};
