import { MatchResult } from "ohm-js";
import grammar, { ArithmeticActionDict, ArithmeticSemantics } from "./arith.ohm-bundle";

export const arithSemantics: ArithSemantics = grammar.createSemantics() as ArithSemantics;

const arithCalc = {
  // Exp = AddExp
  Exp(addExpNode: any) {
    const params = (this.args && this.args.params) ? this.args.params : {};
    return addExpNode.calculate(params);
  },

  // AddExp = MulExp (("+" | "-") MulExp)*
  AddExp(first: any, rest: any) {
    const params = (this.args && this.args.params) ? this.args.params : {};
    let acc = first.calculate(params);
    for (const it of rest.children) {
      const op = it.children[0].sourceString;
      const right = it.children[1].calculate(params);
      if (op === "+") 
        acc = acc + right;
      else 
        acc = acc - right;
    }
    return acc;
  },

  // MulExp = PriExp (("*" | "/") PriExp)*
  MulExp(first: any, rest: any) {
    const params = (this.args && this.args.params) ? this.args.params : {};
    let acc = first.calculate(params);
    for (const it of rest.children) {
      const op = it.children[0].sourceString;
      const right = it.children[1].calculate(params);
      if (op === "*") {
        acc = acc * right;
      } else {
        if (right === 0) 
            throw new Error("Division by zero");
        acc = acc / right;
      }
    }
    return acc;
  },


  PriExp_neg(_dash: any, expr: any) {
    const params = (this.args && this.args.params) ? this.args.params : {};
    return -expr.calculate(params);
  },

  PriExp_paren(_l: any, inner: any, _r: any) {
    const params = (this.args && this.args.params) ? this.args.params : {};
    return inner.calculate(params);
  },

  PriExp_num(numNode: any) {
    // numNode — узел лексического правила number (digit+)
    // берем исходную подстроку и парсим как целое
    return parseInt(numNode.sourceString, 10);
  },

  PriExp_var(varNode: any) {
    const params = (this.args && this.args.params) ? this.args.params : {};
    const name = varNode.sourceString;
    if (!(name in params)) {
      throw new Error(`Undefined variable: ${name}`);
    }
    return params[name];
  }
} as any; // приводим к any, чтобы не зависеть от точного auto-generated интерфейса

// Регистрируем операцию calculate(params)
arithSemantics.addOperation<number>("calculate(params)", arithCalc);


// Типы, чтобы удобнее было пользоваться семантикой в проекте
export interface ArithActions {
  calculate(params: { [name: string]: number }): number;
}
export interface ArithSemantics extends ArithmeticSemantics {
  (match: MatchResult): ArithActions;
}
