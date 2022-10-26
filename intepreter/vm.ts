export class VirtualMachine {
  varMem: any;
  funMem: any

  constructor() {
    this.varMem = {};
    this.funMem = {};
  }

  declareFun(id:string, params:any, body:any){
    if (this.funMem.hasOwnProperty(id)) {
      throw new Error(
        `Function ${id} already declared`
      );
    }
    this.funMem[id] = {}
    this.funMem[id].arguments= []
    params.forEach((p:any) => {
      this.funMem[id].arguments.push(p.name)
    });
    this.funMem[id].body = body
  }

  getFun(id:string){
    if (!this.funMem.hasOwnProperty(id)) {
      throw new Error(
        `Missing function ${id}`
      );
    }
    return this.funMem[id]
  }

  //TODO: remove this function
  printFuns(){
    console.log(this.funMem)
  }

  /**
   *
   * @param id name of var
   * @param value value of var
   */
  declareVar(id: string, value: any) {
    if (this.varMem.hasOwnProperty(id)) {
      throw new Error(
        `Variable ${id} already declared`
      );
    }
    this.varMem[id] = value;
  }
  /**
  * @param id name of var
  * @param value value to put in var
  */
  assignToVar(id: string, value: any) {
    if (!this.varMem.hasOwnProperty(id)) {
      throw new Error(
        `Missing variable ${id}`
      );
    }
    this.varMem[id] = value;
  }

  /**
  * @param id name of var
  */
  getVar(id: string) {
    if (!this.varMem.hasOwnProperty(id)) {
      throw new Error(
        `Missing variable ${id}`
      );
    }
    return this.varMem[id];
  }
}
