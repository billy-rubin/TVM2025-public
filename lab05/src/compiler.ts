import { c as C, Op, I32 } from "../../wasm";
import { Expr } from "../../lab04";
import { buildOneFunctionModule, Fn } from "./emitHelper";
const { i32, get_local } = C;

export function getVariables(e: Expr): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    const stack: Expr[] = [e];
    while (stack.length > 0) {
        const node = stack.pop()!;
        switch (node.type) {
            case "num":
                break;
            case "var":
                if (!seen.has(node.name)) {
                    seen.add(node.name);
                    out.push(node.name);
                }
                break;
            case "neg":
                stack.push(node.arg);
                break;
            case "bin":
                stack.push(node.right);
                stack.push(node.left);
                break;
            default:
                const _exhaustive: never = node;
                return _exhaustive;
        }
    }
    return out;
}

export async function buildFunction(e: Expr, variables: string[]): Promise<Fn<number>>
{
    let expr = wasm(e, variables)
    return await buildOneFunctionModule("test", variables.length, [expr]);
}

function wasm(e: Expr, args: string[]): Op<I32> {

    const indexOfVar = (name: string): number => {
        const idx = args.indexOf(name);
        if (idx === -1) {
            throw new WebAssembly.RuntimeError(`Undefined variable: ${name}`);
        }
        return idx;
    };

    const build = (node: Expr): Op<I32> => {
        switch (node.type) {
            case "num":
                return i32.const(node.value);
            case "var": {
                const idx = indexOfVar(node.name);
                return get_local(i32, idx);
            }
            case "neg": {
                const a = build(node.arg);
                return i32.mul(a, i32.const(-1));
            }
            case "bin": {
                const L = build(node.left);
                const R = build(node.right);
                switch (node.operator) {
                    case "+":
                        return i32.add(L, R);
                    case "-":
                        return i32.sub(L, R);
                    case "*":
                        return i32.mul(L, R);
                    case "/":
                        return i32.div_s(L, R);
                    default:
                        throw new Error(`Unsupported operator: ${node.operator}`);
                }
            }
            default:
                const _exhaustive: never = node;
                return _exhaustive;
        }
    };

    return build(e);
}
