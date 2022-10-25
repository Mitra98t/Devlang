import { Tok, Tokens } from "./typesDef";

import { Lexer } from "./Lexer";

export class Parser {
  lex: Lexer;
  string: string;
  lookahead: Tok | null;
  constructor(string: string) {
    this.string = string;
    this.lex = new Lexer(this.string);
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
*   | IterationStatement
*   | FunctionDeclaration
*   | ReturnStatement
*   | ClassDeclaration
*   | ImportStatement
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
      case Tokens.import:
        return this.ImportStatement()
      case Tokens.run:
        return this.RunStatement()
      case Tokens.fun:
        return this.FunctionDeclaration()
      case Tokens.class:
        return this.ClassDeclaration()
      case Tokens.return:
        return this.ReturnStatement()
      case Tokens.while:
      case Tokens.do:
      case Tokens.for:
        return this.IterationStatement()
      default:
        return this.ExpressionStatement();
    }
  }

  /**
* RunStatement
*   : 'run' '(' Expression ')' ';'
*   ;
*/
  RunStatement(){
    this.eat(Tokens.run)

    this.eat(Tokens.lpar)
    let command = this.Expression()
    this.eat(Tokens.rpar)
    this.eat(Tokens.lineDelimiter)

    return{
      type: Tokens.runStatement,
      command,
    }
  }

  /**
* ImportStatement
*   : 'import' '(' StringLit ')' ';'
*   ;
*/
  ImportStatement(){
    this.eat(Tokens.import)

    this.eat(Tokens.lpar)
    let library = this.StringLit()
    this.eat(Tokens.rpar)
    this.eat(Tokens.lineDelimiter)
    return {
      type: Tokens.importStatement,
      library
    }
  }

  /**
* ClassDeclaration
*   : 'class' Identifier OPT_ClassExtends BlockStatement
*   ;
*/
  ClassDeclaration(){
    this.eat(Tokens.class)

    const id = this.Identifier()

    const superClass = this.lookahead?.type === Tokens.extends ? this.ClassExtends() : null

    const body = this.BlockStatement()

    return {
      type:Tokens.classDeclaration,
      id,
      superClass,
      body,
    }
  }

  /**
* ClassExtends
*   : 'extends' Identifier
*   ;
*/
  ClassExtends(){
    this.eat(Tokens.extends)
    return this.Identifier()
  }

  /**
* FunctionDeclaration
*   : 'fun' Identifier '(' OPT_FormalParameterList ')' BlockStatement
*   ;
*/
  FunctionDeclaration(){
    this.eat(Tokens.fun)
    const name = this.Identifier()

    this.eat(Tokens.lpar)
    const params = this.lookahead?.type !== Tokens.rpar ? this.FormalParameterList() : []
    this.eat(Tokens.rpar)

    const body = this.BlockStatement()

    return{
      type: Tokens.functionDeclaration,
      name,
      params,
      body,
    }
  }

  /**
* FormalParameterList
*   : Identifier
*   | FormalParameterList ',' Identifier
*   ;
*/
  FormalParameterList(){
    const params = []

    do {
      params.push(this.Identifier())
    } while (this.lookahead?.type === Tokens.comma && this.eat(Tokens.comma));

    return params
  }

  /**
* ReturnStatement
*   : 'return' OPT_Expression ';'
*   ;
*/
  ReturnStatement(){
    this.eat(Tokens.return)

    const argument = this.lookahead?.type !== Tokens.lineDelimiter ? this.Expression() : null;

    this.eat(Tokens.lineDelimiter)

    return{
      type: Tokens.returnStatement,
      argument,
    } 
  }

  /**
* IterationStatement
*   : WhileStatement
*   | DoWhileStatement
*   | ForStatement
*   ;
*/
  IterationStatement() {
    switch (this.lookahead?.type) {
      case Tokens.while:
        return this.WhileStatement()
      case Tokens.do:
        return this.DoWhileStatement()
      case Tokens.for:
        return this.ForStatement()
    }
  }

  /**
* WhileStatement
*   : 'while' '(' Expression ')' Statement
*   ;
*/
  WhileStatement(): any {
    this.eat(Tokens.while)

    this.eat(Tokens.lpar)
    const condition = this.Expression()
    this.eat(Tokens.rpar)

    const body = this.Statement()

    return {
      type: Tokens.whileStatement,
      condition,
      body,
    }
  }

  /**
* DoWhileStatement
*   : 'do' Statement 'while' '(' Expression ')';
*   ;
*/
  DoWhileStatement(): any {
    this.eat(Tokens.do)

    const body = this.Statement()

    this.eat(Tokens.while)

    this.eat(Tokens.lpar)
    const condition = this.Expression()
    this.eat(Tokens.rpar)

    this.eat(Tokens.lineDelimiter)

    return {
      type: Tokens.doWhileStatement,
      body,
      condition,
    }
  }


  /**
* ForStatement
*   : 'for' '(' OPT_ForStatementInit ';' OPT_Expression ';' OPT_Expression ')' Statement
*   ;
*/
  ForStatement(): any {
    this.eat(Tokens.for)
    this.eat(Tokens.lpar)

    const init = this.lookahead?.type !== Tokens.lineDelimiter ? this.ForStatementInit() : null
    this.eat(Tokens.lineDelimiter)
    const condition = this.lookahead?.type !== Tokens.lineDelimiter ? this.Expression() : null
    this.eat(Tokens.lineDelimiter)
    const update = this.lookahead?.type !== Tokens.rpar ? this.Expression() : null
    this.eat(Tokens.rpar)

    const body = this.Statement()

    return {
      type: Tokens.forStatement,
      init,
      condition,
      update,
      body,
    }
  }

  /**
* ForStatementInit
*   : VariableStatementInit
*   | Expression
*   ;
*/
  ForStatementInit() {
    if (this.lookahead?.type === Tokens.let) {
      return this.VariableStatementInit();
    }
    return this.Expression()
  }

  /**
* IfStatement
*   : 'if' '(' Expression ')' Statement
*   | 'if' '(' Expression ')' Statement 'else' Statement
*   ;
*/
  IfStatement(): any {
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
* VariableStatementInit
*   : 'let' VariableDeclarationList
*   ;
*/
  VariableStatementInit() {
    this.eat(Tokens.let)
    const declarations = this.VariableDeclarationList()

    return {
      type: Tokens.variableDeclaration,
      declarations,
    }
  }

  /**
* VariableStatement
*   : 'let' VariableDeclarationList ';'
*   ;
*/
  VariableStatement() {
    const variableStatement = this.VariableStatementInit()
    this.eat(Tokens.lineDelimiter)

    return variableStatement
  }

  /**
* VariableDeclarationList
*   : VariableDeclaration
*   | VariableDeclarationList ',' VariableDeclaration
*/
  VariableDeclarationList() {
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
  VariableDeclaration() {
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
  VariableInitializer() {
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
*   : LogicalORExpression
*   | LeftHandSideExpression ASSIGNMENT_OPERATOR AssignmentExpression
*   ;
*/
  AssignmentExpression(): any {
    const left = this.LogicalORExpression()

    if (!this._isAssignmentOperator(this.lookahead?.type))
      return left

    return {
      type: Tokens.assignmentExpression,
      operator: this.AssignmentOperator().word,
      left: this._checkValidAssignmentTarget(left),
      right: this.AssignmentExpression()
    }
  }

  /**
* LeftHandSideExpression
*   : CallMemberExpression
*   ;
*/
  LeftHandSideExpression(): any {
    return this.CallMemberExpression()
  }

  /**
* CallMemberExpression
*   : MemberExpression
*   | CallExpression
*   ;
*/
  CallMemberExpression(){

    if(this.lookahead?.type === Tokens.super){
      return this._CallExpression(this.Super())
    }

    const member = this.MemberExpression()

    if(this.lookahead?.type === Tokens.lpar){
      return this._CallExpression(member)
    }
    return member
  }

  /**
* Generic call expression helper
*
* CallExpression
*   : Callee arguments
*   ;
* 
* Callee
*   : MemberExpression
*   | CallExpression
*   ;
*/
  _CallExpression(callee:any):any{
    let callExpression = {
      type: Tokens.callExpression,
      callee,
      arguments: this.Arguments()
    }
    
    if(this.lookahead?.type === Tokens.lpar){
      callExpression = this._CallExpression(callExpression)
    }

    return callExpression
  }

  /**
* Arguments
*   : '(' OPT_ArgumentList ')'
*/
  Arguments(){
    this.eat(Tokens.lpar)

    const argumentList = this.lookahead?.type !== Tokens.rpar ? this.ArgumentList() : []

    this.eat(Tokens.rpar)

    return argumentList
  }

  /**
* ArgumentList
*   : AssignmentExpression
*   | ArgumentList ',' AssignmentExpression
*   ;
*/
  ArgumentList(){
    const argumentList = []

    do{
    argumentList.push(this.AssignmentExpression())
    }while(this.lookahead?.type === Tokens.comma && this.eat(Tokens.comma))

    return argumentList
  }

  /**
* MemberExpression
*   : PrimaryExpression
*   | MemberExpression '.' Identifier
*   | MemberExpression '.' '[' Expression ']'
*   ;
*/
  MemberExpression(){
    let object = this.PrimaryExpression()

    while (this.lookahead?.type === Tokens.dot || this.lookahead?.type === Tokens.lsqr) {
      if(this.lookahead.type === Tokens.dot){
        this.eat(Tokens.dot)
        const property = this.Identifier()
        object = {
          type: Tokens.memberExpression,
          computed:false,
          object,
          property,
        }
      }

      if(this.lookahead.type === Tokens.lsqr){
        this.eat(Tokens.lsqr)
        const property = this.Expression()
        this.eat(Tokens.rsqr)
        object = {
          type: Tokens.memberExpression,
          computed:true,
          object,
          property,
        }
      }
    }
    return object
  }

  /**
* Identifier
*   : IDENTIFIER
*   ;
*/
  Identifier() {
    const name = this.eat(Tokens.identifier).word
    return {
      type: Tokens.identifier,
      name,
    }
  }

  _checkValidAssignmentTarget(node: any) {
    if (node.type === Tokens.identifier || node.type === Tokens.memberExpression)
      return node
    throw new SyntaxError('Invalid left-had side in ssignment expression')
  }

  /**
* Whether the token is an assignment operator
*/
  _isAssignmentOperator(tokenType: any) {
    return tokenType === Tokens.assign || tokenType === Tokens.complexAssign
  }

  /**
* AssignmentOperator:
*   : ASSIGNMENT
*   | COMPLEX_ASSIGNMENT
*   ;
*/
  AssignmentOperator() {
    if (this.lookahead?.type === Tokens.assign)
      return this.eat(Tokens.assign)
    return this.eat(Tokens.complexAssign)
  }

  /**
* LogicalORExpression
*  : LogicalANDExpression LOGICAL_OR LogicalORExpression
*  | LogicalORExpression
*  ;
*/
  LogicalORExpression() {
    return this._LogicalExpression("LogicalANDExpression", Tokens.logicOR)
  }

  /**
* LogicalANDExpression
*   : EqualityExpression LOGICAL_AND LogicalANDExpression
*   | EqualityExpression
*   ;
*/
  LogicalANDExpression() {
    return this._LogicalExpression("EqualityExpression", Tokens.logicAND)
  }

  /**
* EQUALITY_OPERATOR: ==, !=
* EqualityExpression
*   : RelationalExpression EQUALITY_OPERATOR EqualityExpression
*   | RelationalExpression
*/
  EqualityExpression() {
    return this._BinaryExpression("RelationalExpression", Tokens.equalityOperator)
  }

  /**
* RELATIONAL_OPERATOR: >, >=, <, <=
* -----
* RelationalExpression
*   : AdditiveExpression
*   | AdditiveExpression RELATIONAL_OPERATOR RelationalExpression
*   ;
*/
  RelationalExpression() {
    return this._BinaryExpression(
      "ModuleExpression",
      Tokens.relationalOperator
    )
  }

  ModuleExpression(){
    return this._BinaryExpression(
      "AdditiveExpression",
      Tokens.moduleOperator
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
    return this._BinaryExpression("UnaryExpression", Tokens.multiplicativeOperator)
  }


  _LogicalExpression(builderName: "LogicalANDExpression" | "EqualityExpression", operatorToken: any) {
    let left: any = this[builderName]();
    while (this.lookahead?.type === operatorToken) {
      const operator = this.eat(operatorToken).word;

      const right = this[builderName]();

      left = {
        type: Tokens.logicalExpression,
        operator,
        left,
        right,
      };
    }
    return left;
  }

  /**
  * Generic binary expression
  */
  _BinaryExpression(builderName: "PrimaryExpression" | "MultiplicativeExpression" | "AdditiveExpression" | "RelationalExpression" | "ModuleExpression" | "UnaryExpression", operatorToken: any) {
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
* UnaryExpression
*   : LeftHandSideExpression
*   | ADDITIVE_OPERATOR UnaryExpression
*   | LOGICAL_NOT UnaryExpression
*   ;
*/
  UnaryExpression(): any {
    let operator

    switch (this.lookahead?.type) {
      case Tokens.additiveOperator:
        operator = this.eat(Tokens.additiveOperator).word
        break;
      case Tokens.logicalNOT:
        operator = this.eat(Tokens.logicalNOT).word
        break;
    }

    if (operator != null) {
      return {
        type: Tokens.unaryExpression,
        operator,
        arguments: this.UnaryExpression()
      }
    }
    return this.LeftHandSideExpression()
  }


  /**
* PrimaryExpression
*   : Literal
*   | ParenthesizedExpression
*   | Identifier
*   | ThisExpression
*   | NewExpression
*   ;
*/
  PrimaryExpression() {
    if (this._isLiteral(this.lookahead?.type))
      return this.Literal();
    switch (this.lookahead?.type) {
      case Tokens.lpar:
        return this.ParenthesizedExpression();
      case Tokens.identifier:
        return this.Identifier();
      case Tokens.this:
        return this.ThisExpression()
      case Tokens.new:
        return this.NewExpression()
      default:
        return this.LeftHandSideExpression()
    }
  }

  /**
* NewExpression
*   : 'new' MemberExpression Arguments
*   ;
*/
  NewExpression():any{
    this.eat(Tokens.new)

    return {
      type: Tokens.newExpression,
      calle: this.MemberExpression(),
      arguments: this.Arguments(),
    } 
  }

  /**
* ThisExpression
*   : 'this'
*   ;
*/
  ThisExpression(){
    this.eat(Tokens.this)
    return{
      type:Tokens.thisExpression,
    }
  }

  /**
* Super
*   : 'super'
*   ;
*/
  Super(){
    this.eat(Tokens.super)
    return {
      type:Tokens.super
    }
  }

  /**
* Check if is literal
*/
  _isLiteral(tokenType: any) {
    return tokenType === Tokens.number || tokenType === Tokens.string || tokenType === Tokens.true || tokenType === Tokens.false || tokenType === Tokens.null
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
*   | BooleanLit
*   | NullLit
*   ;
*/
  Literal() {
    switch (this.lookahead?.type) {
      case Tokens.number:
        return this.NumberLit();
      case Tokens.string:
        return this.StringLit();
      case Tokens.true:
        return this.BooleanLit(true)
      case Tokens.false:
        return this.BooleanLit(false)
      case Tokens.null:
        return this.NullLit()
    }
    throw new SyntaxError("Literal: unexpected literal production");
  }

  /**
* BooleanLit
*   : 'true'
*   | 'false'
*   ;
*/
  BooleanLit(value: boolean) {
    this.eat(value ? Tokens.true : Tokens.false)
    return {
      type: Tokens.boolean,
      value,
    }
  }

  /**
* NullLit
*   : 'null'
*   ;
*/
  NullLit() {
    this.eat(Tokens.null)
    return {
      type: Tokens.nullLiteral,
      value: null,
    }
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
        `Unexpected end of input, expected: ${tokenType}\nat line: ${this.lookahead?.line}`
      );

    // Wrong token type
    if (token.type != tokenType)
      throw new SyntaxError(
        `Unexpected token: ${token.type}, expected: ${tokenType}\nat line: ${this.lookahead?.line}`
      );

    this.lookahead = this.lex.nextToken();
    return token;
  }
}
