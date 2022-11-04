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
  .version('1.1.91')
  .description("Proto-Language to try and create a parser and and interpreter in TypeScript")
  .usage("[OPTIONS]")
  .addOption(new Option('-e, --expression <exp>', 'Expression to Parse and Execute').conflicts(['file', 'simulate']))
  .addOption(new Option('-f, --file <file.devl>', 'File to Parse and Execute').conflicts(['expression', 'sumulate']))
  .addOption(new Option('-s, --simulate', 'Start simulate Devlang').conflicts(['expression', 'file', 'print', 'out']))
  .option('-p, --print', 'Prints to console the resulting AST of the devlang code.')
  .option('-o, --out <output file for the AST>', 'Output file to write AST to (JSON format is used, so a .json file is strongly raccomanded)')
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

if (opts.hasOwnProperty("expression")) {
  parser = new Parser(opts.expression)
  ast = parser.parse()
}
if (opts.hasOwnProperty("file")) {
  let fileArr = opts.file.split(".")
  if (fileArr[fileArr.length - 1] != "devl") {
    console.log(`Wrong file type. File must be ${chalk.yellow(".devl")}`)
    exit(1)
  }
  parser = new Parser(fs.readFileSync(opts.file, "utf-8"))
  ast = parser.parse()
}
if (opts.hasOwnProperty("simulate")) {
  console.log("simulation not implemented")
  exit(0)
}

if (opts.hasOwnProperty("print")) {
  console.log(chalk.green(`\n---Parsed AST from code---\n`))
  console.log(JSON.stringify(ast, null, 2))
}

if (opts.hasOwnProperty("out")) {
  fs.writeFileSync(opts.out, JSON.stringify(ast, null, 2))
  console.log(`\nSaved the AST into ${chalk.green(opts.out)}`)
}

console.log(chalk.green("\n---Execution---\n"))

// Runner taking AST in input
main(ast)

