export class VirtualMachine {
  varMem: any;
  funMem: any

  constructor() {
    this.varMem = {};
    this.funMem = {};
  }

  declareFun(scope:string, id: string, params: any, body: any, position:any) {
    if (this.funMem.hasOwnProperty(id+"_"+scope)) {
      throw new Error(
        `Function ${id} already declared`
      );
    }
    let idScope = id+"_"+scope;
    this.funMem[idScope] = {}
    this.funMem[idScope].arguments = []
    params.forEach((p: any) => {
      this.funMem[idScope].arguments.push(p.name)
    });
    this.funMem[idScope].position = position;
    this.funMem[idScope].body = body
  }

  getFun(scopeIn:string,id: string) {
    let scope = scopeIn
    while (!this.funMem.hasOwnProperty(id + "_" + scope)) {
      scope = this._removeScope(scope)
      if (scope == "")
        throw new Error(
        `Missing function ${id}`
        );
    }
    return this.funMem[id+"_"+scope]
  }

  //TODO: remove this function
  printFuns() {
    console.log(this.funMem)
  }

  /**
   *
   * @param id name of var
   * @param value value of var
   */
  declareVar(scope: string, id: string, value: any) {
    if (this.varMem.hasOwnProperty(id + "_" + scope)) {
      throw new Error(
        `Variable ${id} already declared`
      );
    }
    this.varMem[(id + "_" + scope)] = value;
  }
  /**
  * @param id name of var
  * @param value value to put in var
  */
  assignToVar(scopeIn: string, id: string, value: any) {
    let scope = scopeIn
    while (!this.varMem.hasOwnProperty(id + "_" + scope)) {
      scope = this._removeScope(scope)
      if (scope == "")
        throw new Error(
          `Missing variable ${id}`
        );
    }
    this.varMem[(id + "_" + scope)] = value;
  }

  /**
  * @param id name of var
  */
  getVar(scopeIn: string, id: string) {
    let scope = scopeIn
    while (!this.varMem.hasOwnProperty(id + "_" + scope)) {
      scope = this._removeScope(scope)
      if (scope == "")
        throw new Error(
          `Missing variable ${id}`
        );
    }
    return this.varMem[(id +"_"+scope)];
  }

  _removeScope(scope: string) {
    let scopeArr = scope.split("_")
    scopeArr.pop()
    return scopeArr.join("_")
  }
}
