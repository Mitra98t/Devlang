export class VirtualMachine {
  varMem: any;
  funMem: any

  constructor() {
    this.varMem = {};
    this.funMem = {};
  }

  declareFun(id:string, params:any, body:any){
    this.funMem[id] = {}
    this.funMem[id].ambient = {}
      params.forEach((p:any) => {
      this.funMem[id].ambient[p.name] = {value:null}
    });
    this.funMem[id].body = body
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
        `Boa deh ${id} c'è già. Ma svegliati... Coglione.`
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
        `Ga0 deh ${id} un c'è. Ma svegliati... Coglione.`
      );
    }
    this.varMem[id] = value;
  }

  /**
  * @param id name of var
  */
  getVar(id: string) {
    return this.varMem[id];
  }
}
