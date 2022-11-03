import { exec } from "child_process";
import { defaults } from "figlet";
import { Parser } from "../Parser";
import { Tokens } from "../typesDef";
import { VirtualMachine } from "./vm";
import fs from "fs"

const vm = new VirtualMachine();
let scope = "global"
export function main(astIn: any) {

  // let ast = JSON.parse(fs.readFileSync("../test-devlang/ast.json", "utf-8"));
  let ast = astIn
  bodyEvaluation(ast.body)
}

function bodyEvaluation(body: any) {
  let res = null
  body.forEach((stat: any, idx: number) => {
    switch (stat.type) {
      case Tokens.variableDeclaration:
        variableDeclaration(stat);
        break;
      case Tokens.ifStatement:
        ifStatement(stat)
        break;
      case Tokens.whileStatement:
        whileStatement(stat)
        break;
      case Tokens.doWhileStatement:
        doWhileStatement(stat)
        break;
      case Tokens.forStatement:
        forStatement(stat)
        break;
      case Tokens.runStatement:
        runStatement(stat)
        break;
      case Tokens.importStatement:
        importStatement(stat)
        break;
      case Tokens.functionDeclaration:
        functionDeclaration(stat);
        break;
      case Tokens.returnStatement:
        res = returnStatement(stat)
        break
      case Tokens.expressionStatement:
        expressionStatement(stat);
        break;
      case Tokens.assignmentExpression:
        assignmentExpression(stat)
        break;
      default:
        break;
    }
  });
  return res
}

function functionDeclaration(subAst: any) {
  vm.declareFun(scope, subAst.name.name, subAst.params, subAst.body, subAst.position)
}


function runStatement(subAst: any) {
  let command = expressionEvaluator(subAst.command)

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(stdout);
  });

}

function forStatement(subAst: any) {
  addScope(_genScopeName(subAst.type, subAst.position))
  bodyEvaluation([subAst.init])

  let condition = expressionEvaluator(subAst.condition)
  while (condition) {
    let body = subAst.body.type == Tokens.blockStatement ? subAst.body.body : [subAst.body]
    bodyEvaluation(body)
    bodyEvaluation([subAst.update])
    condition = expressionEvaluator(subAst.condition)
  }
  removeScope()
}

function doWhileStatement(subAst: any) {
  addScope(_genScopeName(subAst.type, subAst.position))
  let condition = expressionEvaluator(subAst.condition)
  do {
    bodyEvaluation(subAst.body.type == Tokens.blockStatement ? subAst.body.body : [subAst.body])
    condition = expressionEvaluator(subAst.condition)
  } while (condition)
  removeScope()
}

function whileStatement(subAst: any) {
  addScope(_genScopeName(subAst.type, subAst.position))
  let condition = expressionEvaluator(subAst.condition)
  while (condition) {
    bodyEvaluation(subAst.body.type == Tokens.blockStatement ? subAst.body.body : [subAst.body])
    condition = expressionEvaluator(subAst.condition)
  }
  removeScope()
}

function ifStatement(subAst: any) {
  addScope(_genScopeName(subAst.type, subAst.position))
  let condition = expressionEvaluator(subAst.condition)
  let branch = null
  if (condition)
    branch = subAst.then.type == Tokens.blockStatement ? subAst.then.body : [subAst.then]
  else
    branch = subAst.alternate.type == Tokens.blockStatement ? subAst.alternate.body : [subAst.alternate]

  bodyEvaluation(branch)
  removeScope()
}

// TODO: trovare un modo intelligente di gestire gli scoping delle funzioni e variabili delle librerie, per ora vengono instanziate in global
function importStatement(subAst: any) {
  if(subAst.library.value != "StdIO.devl") {
    throw new Error("Missing Library")
  }
  let libPar = new Parser(fs.readFileSync("./stdLibraries/"+subAst.library.value, "utf-8"))
  let libAst = libPar.parse()
  bodyEvaluation(libAst.body)
}

/**
  * Everithing that is an expression starts here
  */
function expressionEvaluator(expAst: any) {
  switch (expAst.type) {
    case Tokens.nullLiteral:
    case Tokens.number:
    case Tokens.string:
    case Tokens.boolean:
      return expAst.value;
    case Tokens.callExpression:
      return callExpression(expAst)
    case Tokens.identifier:
      return vm.getVar(scope, expAst.name)
    case Tokens.binaryExpression:
      return binaryExpressionEvaluator(expAst);
    default:
      return null;
  }
}

/**
  * Binary Expression Evaluator
  */
function binaryExpressionEvaluator(binExpAst: any): any {
  // TODO: probabilmente questo if non serve, il congtrollo sta in expressionEvaluator
  if (binExpAst.type == Tokens.identifier)
    return vm.getVar(scope, binExpAst.name)
  if(binExpAst.type == Tokens.callExpression)
    return callExpression(binExpAst)
  if (binExpAst.hasOwnProperty("operator"))
    switch (binExpAst.operator) {
      case ">":
        return (
          binaryExpressionEvaluator(binExpAst.left) >
          binaryExpressionEvaluator(binExpAst.right)
        );
      case "<":
        return (
          binaryExpressionEvaluator(binExpAst.left) <
          binaryExpressionEvaluator(binExpAst.right)
        );
      case ">=":
        return (
          binaryExpressionEvaluator(binExpAst.left) <=
          binaryExpressionEvaluator(binExpAst.right)
        );
      case "<=":
        return (
          binaryExpressionEvaluator(binExpAst.left) <=
          binaryExpressionEvaluator(binExpAst.right)
        );
      case "+":
        return (
          binaryExpressionEvaluator(binExpAst.left) +
          binaryExpressionEvaluator(binExpAst.right)
        );
      case "*":
        return (
          binaryExpressionEvaluator(binExpAst.left) *
          binaryExpressionEvaluator(binExpAst.right)
        );
      case "-":
        return (
          binaryExpressionEvaluator(binExpAst.left) -
          binaryExpressionEvaluator(binExpAst.right)
        );
      case "/":
        return (
          binaryExpressionEvaluator(binExpAst.left) /
          binaryExpressionEvaluator(binExpAst.right)
        );
      case "==":
        return (
          binaryExpressionEvaluator(binExpAst.left) ==
          binaryExpressionEvaluator(binExpAst.right)
        );
      case "!=":
        return (
          binaryExpressionEvaluator(binExpAst.left) !=
          binaryExpressionEvaluator(binExpAst.right)
        );
      case "%":
        return (
          binaryExpressionEvaluator(binExpAst.left) %
          binaryExpressionEvaluator(binExpAst.right)
        );

      default:
        break;
    }
  else return binExpAst.value;
}

/**
  * Variable declarations
  */
function variableDeclaration(subAst: any,) {
  let valueToUse: any = null;
  subAst.declarations.forEach((varDec: any) => {
    valueToUse = expressionEvaluator(varDec.init);
    vm.declareVar(scope, varDec.id.name, valueToUse);
  });
}

/**
  * Expression Statement
  */
function expressionStatement(subAst: any,) {
  switch (subAst.expression.type) {
    case Tokens.callExpression:
      callExpression(subAst.expression);
      break;
    case Tokens.assignmentExpression:
      assignmentExpression(subAst.expression);
      break;
    default:
      break;
  }
}

/**
  * Assignment
  */
function assignmentExpression(subAst: any,) {
  if (subAst.operator == "=") {
    vm.assignToVar(
      scope,
      subAst.left.name,
      expressionEvaluator(subAst.right)
    );
  }
}

/**
  * Function call 
  */
function callExpression(subAst: any,) {
  // TODO: rimuovere, solo per debug
  if (subAst.callee.name == "showmem") {
    Object.keys(vm.varMem).forEach((varKey:string) => {
      console.log(varKey + " -> " + vm.varMem[varKey])
    });
    return
  }

  let func = vm.getFun(scope, subAst.callee.name)
  addScope(_genScopeName(subAst.callee.name, func.position))

  if (func.arguments.length != subAst.arguments.length)
    throw new Error(`Wrong arguments to pass to function ${subAst.callee.name}`);

  for (let idx = 0; idx < subAst.arguments.length; idx++) {
    const p = func.arguments[idx];
    vm.declareVar(scope, p, expressionEvaluator(subAst.arguments[idx]))
  }

  let returnVal = bodyEvaluation(func.body.body)
  removeScope()
  return returnVal
}

function returnStatement(subAst: any) {
  return expressionEvaluator(subAst.argument)
}


function addScope(scopeIn: string) {
  scope = scope + "_" + scopeIn
}

function removeScope() {
  let scopeArr = scope.split("_")
  scopeArr.pop()
  scope = scopeArr.join("_")
}

function _genScopeName(tok: Tokens | string, position: any) {
  let resScope = position.line.toString() + "-" + position.column.toString()
  switch (tok) {
    case Tokens.ifStatement:
      resScope = "if" + resScope;
      break;
      case Tokens.forStatement:
      resScope = "for" + resScope;

    default:
      resScope = tok + resScope;
      break;
  }
  return resScope
}
