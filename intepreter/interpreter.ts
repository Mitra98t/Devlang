import { exec } from "child_process";
import { Tokens } from "../typesDef";
import { VirtualMachine } from "./vm";

const vm = new VirtualMachine();
let scope = "global_"
export function main(astIn: any) {

  // let ast = JSON.parse(fs.readFileSync("../test-devlang/ast.json", "utf-8"));
  let ast = astIn
  bodyEvaluation(ast.body)
}

function bodyEvaluation(body: any) {
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
        returnStatement(stat)
        break;
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

}

function functionDeclaration(subAst: any) {
  vm.declareFun(subAst.name.name, subAst.params, subAst.body)
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
  bodyEvaluation([subAst.init])

  let condition = expressionEvaluator(subAst.condition)
  while (condition) {
    let body = subAst.body.type == Tokens.blockStatement ? subAst.body.body : [subAst.body]
    bodyEvaluation(body)
    bodyEvaluation([subAst.update])
    condition = expressionEvaluator(subAst.condition)
  }
}

function doWhileStatement(subAst: any) {
  let condition = expressionEvaluator(subAst.condition)
  do {
    bodyEvaluation(subAst.body.type == Tokens.blockStatement ? subAst.body.body : [subAst.body])
    condition = expressionEvaluator(subAst.condition)
  } while (condition)
}

function whileStatement(subAst: any) {
  let condition = expressionEvaluator(subAst.condition)
  while (condition) {
    bodyEvaluation(subAst.body.type == Tokens.blockStatement ? subAst.body.body : [subAst.body])
    condition = expressionEvaluator(subAst.condition)
  }
}

function ifStatement(subAst: any) {
  let condition = expressionEvaluator(subAst.condition)
  let branch = null
  if (condition)
    branch = subAst.then.type == Tokens.blockStatement ? subAst.then.body : [subAst.then]
  else
    branch = subAst.alternate.type == Tokens.blockStatement ? subAst.alternate.body : [subAst.alternate]

  bodyEvaluation(branch)
}

function importStatement(subAst: any) {

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
    case Tokens.identifier:
      return vm.getVar(expAst.name)
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
  if (binExpAst.type == Tokens.identifier)
    return vm.getVar(binExpAst.name)
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
    valueToUse = varDec.init.type == Tokens.callExpression ? callExpression(varDec.init) : expressionEvaluator(varDec.init);
    vm.declareVar(varDec.id.name, valueToUse);
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
      subAst.left.name,
      expressionEvaluator(subAst.right)
    );
  }
}

/**
  * Function call 
  */
function callExpression(subAst: any,) {
  //TODO: remove -> reimplementare in libreria stdio
  if (subAst.callee.name == "print") {
    let toPrint = "";
    subAst.arguments.forEach((arg: any) => {
      toPrint += expressionEvaluator(arg)
    });
    console.log(toPrint)
    return
  }

  let func = vm.getFun(subAst.callee.name)

  if (func.arguments.length != subAst.arguments.length)
    throw new Error(`Wrong arguments to pass to function ${subAst.callee.name}`);

  for (let idx = 0; idx < func.arguments.length; idx++) {
    const p = func.arguments[idx];
    vm.declareVar(p, subAst.arguments[idx].value)
  }

  return bodyEvaluation(func.body.body)
}

function returnStatement(subAst:any){
  
  return (expressionEvaluator(subAst.argument))
}
