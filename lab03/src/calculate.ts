import { MatchResult } from "ohm-js";
import grammar, { ArithmeticActionDict, ArithmeticSemantics } from "./arith.ohm-bundle";

export const arithSemantics: ArithSemantics = grammar.createSemantics() as ArithSemantics;

const arithCalc = {
  Exp(addExp: any) {
    return addExp.calculate(this.args.params);
  },

  AddExp(first: any, ops: any, rest: any) {
    let res = first.calculate(this.args.params);
    const n = ops.children.length;
    for (let i = 0; i < n; i++) {
      const op = ops.child(i).sourceString;
      const r = rest.child(i).calculate(this.args.params);
      if (op === "+")
        res += r
      else 
        res -= r
    }
    return res;
  },

  MulExp(first: any, ops: any, rest: any) {
    let res = first.calculate(this.args.params);
    const n = ops.children.length;
    for (let i = 0; i < n; i++) {
      const op = ops.child(i).sourceString;
      const r = rest.child(i).calculate(this.args.params);
      if (op === "*") 
        res *= r;
      else {
        if (r === 0) 
            throw new Error("Division by zero");
        res /= r;
      }
    }
    return res;
  },

  PriExp_neg(_minus: any, e: any) {
    return -e.calculate(this.args.params);
  },

  PriExp_paren(_open: any, e: any, _close: any) {
    return e.calculate(this.args.params);
  },

  PriExp_num(n: any) {
    return parseInt(n.sourceString, 10);
  },

  PriExp_var(v: any) {
    const params = (this.args && this.args.params) ? this.args.params : {};
    const name = v.sourceString;
    return (name in params) ? params[name] : NaN;
  }
} as any;

arithSemantics.addOperation<number>("calculate(params)", arithCalc);

export interface ArithActions {
  calculate(params: { [name: string]: number }): number;
}
export interface ArithSemantics extends ArithmeticSemantics {
  (match: MatchResult): ArithActions;
}
