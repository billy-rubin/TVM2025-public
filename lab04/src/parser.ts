import { MatchResult } from 'ohm-js';
import { arithGrammar, ArithmeticActionDict, ArithmeticSemantics, SyntaxError } from '../../lab03';
import { Expr } from './ast';

export const getExprAst: ArithmeticActionDict<Expr> = {
    Exp(exp) {
        return exp.parse();
    },

    AddExp(first, ops, rest) {
        let node = first.parse();
        const count = ops.children.length;
        for (let i = 0; i < count; i++) {
            const op = ops.child(i).sourceString as '+' | '-';
            const right = rest.child(i).parse();
            node = { type: 'bin', left: node, operator: op, right };
        }
        return node;
    },

    MulExp(first, ops, rest) {
        let node = first.parse();
        const count = ops.children.length;
        for (let i = 0; i < count; i++) {
            const op = ops.child(i).sourceString as '*' | '/';
            const right = rest.child(i).parse();
            node = { type: 'bin', left: node, operator: op, right };
        }
        return node;
    },

    PriExp_neg(_minus, expr) {
        return { type: 'neg', arg: expr.parse() };
    },

    PriExp_paren(_open, expr, _close) {
        return expr.parse();
    },

    PriExp_num(num) {
        return { type: 'num', value: parseInt(num.sourceString, 10) };
    },

    PriExp_var(v) {
        return { type: 'var', name: v.sourceString };
    }
};

export const semantics = arithGrammar.createSemantics();
semantics.addOperation("parse()", getExprAst);

export interface ArithSemanticsExt extends ArithmeticSemantics {
    (match: MatchResult): ArithActionsExt;
}

export interface ArithActionsExt {
    parse(): Expr;
}

export function parseExpr(source: string): Expr {
    const match = arithGrammar.match(source, "Exp");
    if (!match.succeeded()) {
        throw new SyntaxError(match.message || "Syntax error");
    }
    return (semantics(match) as ArithActionsExt).parse();
}
