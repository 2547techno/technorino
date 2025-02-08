import { ASTNode, MatchResponse, TextASTNode } from "./parser";
import { Token, tokenize } from "./tokenizer";

export function assertAst(
    fn: (i: number, tokens: Token[]) => MatchResponse,
    str: string,
    nodes: ASTNode[]
) {
    const match = fn(0, tokenize(str));
    if (!match.accepted) {
        throw new Error(`${str} |> no match`);
    }

    if (JSON.stringify(match.nodes) !== JSON.stringify(nodes)) {
        throw new Error(
            `${str} |> AST mismatch\nexpected: ${JSON.stringify(
                nodes
            )}\nfound: ${JSON.stringify(match.nodes)}`
        );
    }
}

export function createTextNodes(str: string): TextASTNode[] {
    const out: TextASTNode[] = [];
    for (const char of str) {
        out.push({
            type: "text",
            data: char,
        });
    }
    return out;
}
