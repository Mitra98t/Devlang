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
*   | VariableStatement
*   | IfStatement
*   ;
*/
  Statement() {
    switch (this.lookahead?.type) {
      case Tokens.lineDelimiter:
        return this.EmptyStatement();
      case Tokens.if:
        return this.IfStatement();
      case Tokens.lbra:
        return this.BlockStatement();
      case Tokens.let:
        return this.VariableStatement()
      default:
        return this.ExpressionStatement();
    }
  }

  /**
* IfStatement
*   : 'if' '(' Expression ')' Statement
*   | 'if' '(' Expression ')' Statement 'else' Statement
*   ;
*/
  IfStatement():any{
    this.eat(Tokens.if)

    this.eat(Tokens.lpar)
    const condition = this.Expression()
    this.eat(Tokens.rpar)

    const then = this.Statement()
  
    const alternate = this.lookahead != null && this.lookahead.type === Tokens.else 
      ? this.eat(Tokens.else) && this.Statement()
      : null

    return {
      type: Tokens.ifStatement,
      condition,
      then,
      alternate,
    }
  }

  /**
* VariableStatement
*   : 'let' VariableDeclarationList ';'
*   ;
*/
  VariableStatement(){
    this.eat(Tokens.let)
    const declarations = this.VariableDeclarationList()
    this.eat(Tokens.lineDelimiter)

    return {
      type: Tokens.variableDeclaration,
      declarations,
    }
  }

  /**
* VariableDeclarationList
*   : VariableDeclaration
*   | VariableDeclarationList ',' VariableDeclaration
*/
  VariableDeclarationList(){
    const declarations = [];

    do {
      declarations.push(this.VariableDeclaration())
    } while (this.lookahead?.type === Tokens.comma && this.eat(Tokens.comma));

    return declarations
  }

  /**
* VariableDeclaration
*   : Identifier OPT_VariableIdentifier
*   ;
*/
  VariableDeclaration(){
    const id = this.Identifier()

    const init = this.lookahead?.type !== Tokens.lineDelimiter && this.lookahead?.type !== Tokens.comma
      ? this.VariableInitializer()
      : null

    return {
      type: Tokens.variableDeclaration,
      id,
      init,
    }
  }

  /**
* VariableInitializer
*   : ASSIGNMENT AssignmentExpression
*   ;
*/
  VariableInitializer(){
    this.eat(Tokens.assign)

    return this.AssignmentExpression()
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
   *   : Literal
   *   ;
   */
  Expression() {
    return this.AssignmentExpression();
  }

  /**
  * AssignmentExpression
  *   : RelationalExpression
  *   | LeftHandSideExpression ASSIGNMENT_OPERATOR AssignmentExpression
  *   ;
  */
  AssignmentExpression():any {
    const left = this.RelationalExpression()

    if(!this._isAssignmentOperator(this.lookahead?.type))
      return left

    return {
      type: Tokens.assignmentExpression,
      operator:this.AssignmentOperator().word,
      left: this._checkValidAssignmentTarget(left),
      right: this.AssignmentExpression()
    }
  }

  /**
* LeftHandSideExpression
*   : Identifier
*   ;
*/
  LeftHandSideExpression(){
    return this.Identifier()
  }

  /**
* Identifier
*   : IDENTIFIER
*   ;
*/
  Identifier(){
    const name = this.eat(Tokens.identifier).word
    return {
      type: Tokens.identifier,
      name,
    }
  }

  _checkValidAssignmentTarget(node:any){
    if(node.type === Tokens.identifier)
      return node
    throw new SyntaxError('Invalid left-had side in ssignment expression')
  }

  /**
* Whether the token is an assignment operator
*/
  _isAssignmentOperator(tokenType:any){
    return tokenType === Tokens.assign || tokenType === Tokens.complexAssign
  }

  /**
  * AssignmentOperator:
  *   : ASSIGNMENT
*   | COMPLEX_ASSIGNMENT
*   ;
*/
  AssignmentOperator(){
    if(this.lookahead?.type === Tokens.assign)
      return this.eat(Tokens.assign)
    return this.eat(Tokens.complexAssign)
  }

  /**
* RELATIONAL_OPERATOR: >, >=, <, <=
* -----
* RelationalExpression
*   : AdditiveExpression
*   | AdditiveExpression RELATIONAL_OPERATOR RelationalExpression
*   ;
*/
  RelationalExpression(){
    return this._BinaryExpression(
      "AdditiveExpression",
      Tokens.relationalOperator
    )
  }

  /**
   * AdditiveExpression
   *   : MultiplicativeExpression
   *   | AdditiveExpression ADDITIVE_OPERATOR Literal
   *   ;
   */
  AdditiveExpression() {
    return this._BinaryExpression("MultiplicativeExpression", Tokens.additiveOperator)
  }

  /**
   * MultiplicativeExpression
   *   : PrimaryExpression
   *   | MultiplicativeExpression MULTIPLICATIVE_OPERATOR PrimaryExpression
   *   ;
   */
  MultiplicativeExpression() {
    return this._BinaryExpression("PrimaryExpression", Tokens.multiplicativeOperator)
  }

  /**
  * Generic binary expression
  */
  _BinaryExpression(builderName: "PrimaryExpression" | "MultiplicativeExpression" | "AdditiveExpression", operatorToken: any) {
    let left: any = this[builderName]();
    while (this.lookahead?.type === operatorToken) {
      const operator = this.eat(operatorToken).word;

      const right = this[builderName]();

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
   *   | LeftHandSideExpression
   *   ;
   */
  PrimaryExpression() {
    if(this._isLiteral(this.lookahead?.type))
      return this.Literal();
    switch (this.lookahead?.type) {
      case Tokens.lpar:
        return this.ParenthesizedExpression();
      default:
        return this.LeftHandSideExpression();
    }
  }

  /**
* Check if is literal
*/
  _isLiteral(tokenType:any){
    return tokenType === Tokens.number || tokenType === Tokens.string
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
