import { assert } from "console";
import { Parser } from "./Parser";
import { tests } from "./literals-test";
import fs from "fs";

var deepEqual = function (x: any, y: any) {
    if (x === y) {
        return true;
    } else if (
        typeof x == "object" &&
        x != null &&
        typeof y == "object" &&
        y != null
    ) {
        if (Object.keys(x).length != Object.keys(y).length) return false;

        for (var prop in x) {
            if (y.hasOwnProperty(prop)) {
                if (!deepEqual(x[prop], y[prop])) return false;
            } else return false;
        }

        return true;
    } else return false;
};

let codeTest = fs.readFileSync("test.devl").toString();

let parser = new Parser(codeTest);
let ast = parser.parse();
console.log(ast);

fs.writeFileSync("ast.json", JSON.stringify(ast));

// function test(program: string, expected: any) {
//     let p = new Parser(program);
//     const ast = p.parse();
//     assert(deepEqual(ast, expected));
// }

// tests(test);

// console.log("All Test Passed");
