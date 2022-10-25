import fs from "fs";
import { Tokens } from "../typesDef";
import { VirtualMachine } from "./vm";

let ast = JSON.parse(fs.readFileSync("../../test-devlang/ast.json", "utf-8"));
const vm = new VirtualMachine();

ast.body.forEach((stat: any, idx: number) => {
    switch (stat.type) {
        case Tokens.variableDeclaration:
            variableDeclaration(stat, "global");
            break;
        case Tokens.expressionStatement:
            expressionStatement(stat, "global");
        default:
            break;
    }
});

function expressionEvaluator(expAst: any) {
    switch (expAst.type) {
        case Tokens.nullLiteral:
        case Tokens.number:
        case Tokens.string:
        case Tokens.boolean:
            return expAst.value;
        case Tokens.binaryExpression:
            return binaryExpressionEvaluator(expAst);
        default:
            return null;
            break;
    }
}

function binaryExpressionEvaluator(binExpAst: any):any {
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

            default:
                break;
        }
    else return binExpAst.value;
}

function variableDeclaration(subAst: any, scope: string) {
    let valueToUse: any = null;
    subAst.declarations.forEach((varDec: any) => {
        valueToUse = expressionEvaluator(varDec.init);
        vm.declareVar(scope, varDec.id.name, valueToUse);
    });
}
function expressionStatement(subAst: any, scope: string) {
    switch (subAst.expression.type) {
        case Tokens.callExpression:
            callExpression(subAst.expression, scope);
            break;
        case Tokens.assignmentExpression:
            assignmentExpression(subAst.expression, scope);
            break;

        default:
            break;
    }
}

function assignmentExpression(subAst: any, scope: string) {
    if (subAst.operator == "=") {
        vm.assignToVar(
            scope,
            subAst.left.name,
            expressionEvaluator(subAst.right)
        );
    }
}

function callExpression(subAst: any, scope: string) {
    if (subAst.callee.name == "print") {
        console.log(vm.getVar(scope, subAst.arguments[0].name));
    }
}
