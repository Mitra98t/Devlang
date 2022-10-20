import { Parser } from "./Parser" 

import fs from "fs"

function main(argv:any){
  const [_node, _path, mode, exp, out, file] = argv
  
  let parser;
  let ast;

  if(mode === '-e'){
    parser = new Parser(exp)
    ast = parser.parse()
  }

  if(mode === '-f'){
    const src = fs.readFileSync(exp, 'utf-8')
    parser = new Parser(src)
    ast = parser.parse()
  }

  console.log(JSON.stringify(ast, null, 2))
  
  if(out == '-o'){
    fs.writeFileSync(file, JSON.stringify(ast, null, 2))
  }
}

main(process.argv)
