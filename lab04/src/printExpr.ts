import {Expr} from "./ast";

function getPriority(operator: string): number {
    switch (operator) {
        case '*':
        case '/':
            return 2;
        case '+':
        case '-':
            return 1;
        default:
            return 0;
    }
}

export function printExpr(e: Expr, parentPriority: number = 0): string {
    switch (e.type) {
        case 'num':
            return e.value.toString();
        case 'var':
            return e.name;
        case 'neg':
            const operandStr = printExpr(e.arg, 2);
            if (e.arg.type === 'bin' || e.arg.type === 'neg') {
                return "-(" + operandStr + ")";
            } else {
                return "-" + operandStr;
            }
        case 'bin':
            const currentPriority = getPriority(e.operator);
            const isParensNeeded = currentPriority < parentPriority;
            const leftStr = printExpr(e.left, currentPriority);
            let rightStr = printExpr(e.right, currentPriority);
            if ((e.operator === '-' || e.operator === '/') && e.right.type === 'bin') {
                rightStr = "(" + rightStr + ")";
            }
            const result = leftStr + " " + e.operator + " " + rightStr;
            return isParensNeeded ? "(" + result + ")" : result;
    }
}