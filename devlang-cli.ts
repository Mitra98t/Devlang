#!/usr/bin/env node

import { Parser } from "./Parser"
import fs from "fs"

import chalk from "chalk";
import clear from "clear"
import figlet from "figlet"
import { Command, Option } from "commander"
import { exit } from "process";
import { main } from "./intepreter/interpreter";

clear();
console.log(
  chalk.green(
    figlet.textSync('DevLang', { horizontalLayout: 'full' })
  )
);

const program = new Command()

program
  .version('0.0.1')
  .description("DevLang-CLI")
  .usage("[-e <exp> | -f <file>] ?-o <output file>")
  .addOption(new Option('-e, --expression <exp>', 'Expression to Parse').conflicts(['file']))
  .addOption(new Option('-f, --file <file>', 'File to Parse').conflicts(['expression']))
  .option('-o, --out <output file>', 'Output file to write ast to (JSON format is used, so a json file is strongly raccomanded)')
  .option('-h, --help', 'Prints help command')
  .parse(process.argv);

//program.help()
let opts = program.opts()

let parser;
let ast;

if (opts.hasOwnProperty("help") || Object.keys(opts).length === 0) {
  program.help()
  exit(0)
}

/*
if (!opts.hasOwnProperty("expression") && !opts.hasOwnProperty("file")) {
  console.log("Missing argument, use at least -e or -f")
  exit(0);
}
*/

console.log("")

if (opts.hasOwnProperty("expression")) {
  parser = new Parser(opts.expression)
  ast = parser.parse()
  console.log(`Parsed expression: ${chalk.green(opts.expression)} into the following ${chalk.yellow("Abstract Syntax Tree")}\n`)
}
if (opts.hasOwnProperty("file")) {
  parser = new Parser(fs.readFileSync(opts.file, "utf-8"))
  ast = parser.parse()
  console.log(`Parsed content of file: ${chalk.green(opts.file)} into the following ${chalk.yellow("Abstract Syntax Tree")}\n`)
}

console.log(JSON.stringify(ast, null, 2))

if (opts.hasOwnProperty("out")) {
  fs.writeFileSync(opts.out, JSON.stringify(ast, null, 2))
  console.log(`Saved the AST into ${chalk.green(opts.out)}`)
}

console.log(chalk.green("\n---Execution---\n"))

main(ast)

