export class VirtualMachine {
    varMem: any;

    constructor() {
        this.varMem = {};
    }

    /**
     *
     * @param scope scope of var
     * @param id name of var
     * @param value value of var
     */
    declareVar(scope: string, id: string, value: any) {
        let useId = this._genVarId(scope, id);
        if (this.varMem.hasOwnProperty(useId)) {
            throw new Error(
                `Boa deh ${id} c'è già dentro ${scope} Ma svegliati... Coglione.`
            );
        }
        this.varMem[useId] = value;
    }

    assignToVar(scope: string, id: string, value: any) {
        let useId = this._genVarId(scope, id);
        if (!this.varMem.hasOwnProperty(useId)) {
            throw new Error(
                `Ga0 deh ${id} un c'è dentro ${scope} Ma svegliati... Coglione.`
            );
        }
        this.varMem[useId] = value;
    }

    getVar(scope: string, id: string) {
        let useId = this._genVarId(scope, id);
        return this.varMem[useId];
    }

    _genVarId(scope: string, id: string) {
        return scope + "-" + id;
    }
}
