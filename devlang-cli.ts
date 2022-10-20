#!/usr/bin/env node

import { Parser } from "./Parser" 
import fs from "fs"

import chalk from "chalk";
import clear from "clear"
import figlet from "figlet"
import {Command} from "commander"
import { exit } from "process";

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
  .option('-e, --expression <exp>', 'Expression to Parse')
  .option('-f, --file <file>', 'File to Parse')
  .option('-o, --out <out file>', 'Output file to write ast to')
  .option('-h, --help', 'Prints help command')
  .parse(process.argv);

//program.help()
let opts = program.opts()

let parser;
let ast;

if(opts.hasOwnProperty("help") || Object.keys(opts).length === 0 ){
  program.help()
  exit(0)
}

if(!opts.hasOwnProperty("expression") && !opts.hasOwnProperty("file")){
  console.log("Missing argument, use at least -e or -f")
  exit(0);
}

if(opts.hasOwnProperty("expression")){
  parser = new Parser(opts.expression)
  ast = parser.parse()
  console.log(JSON.stringify(ast, null, 2))
}
if(opts.hasOwnProperty("file")){
  parser = new Parser(fs.readFileSync(opts.file, "utf-8"))
  ast = parser.parse()
  console.log(JSON.stringify(ast, null, 2))
}
if(opts.hasOwnProperty("out")){
  fs.writeFileSync(opts.out, JSON.stringify(ast, null, 2))
}
