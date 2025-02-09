import {
    ASTNode,
    MatchResponse,
    normalizeTextNodes,
    TextASTNode,
} from "./parser";
import { Token, tokenize } from "./tokenizer";

export function assertAst(
    fn: (i: number, tokens: Token[]) => MatchResponse,
    str: string,
    nodes: ASTNode[],
    normalize: boolean = false
) {
    const match = fn(0, tokenize(str));
    if (!match.accepted) {
        throw new Error(`${str} |> no match`);
    }

    let matchedNodes = match.nodes;
    if (normalize) {
        matchedNodes = normalizeTextNodes(matchedNodes);
    }

    if (JSON.stringify(matchedNodes) !== JSON.stringify(nodes)) {
        throw new Error(
            `${str} |> AST mismatch\nexpected: ${JSON.stringify(
                nodes
            )}\nfound: ${JSON.stringify(matchedNodes)}`
        );
    }
}

export function createTextNodes(
    str: string,
    normalize: boolean = false
): TextASTNode[] {
    if (normalize) {
        return [
            {
                type: "text",
                data: str,
            },
        ];
    }

    const out: TextASTNode[] = [];
    for (const char of str) {
        out.push({
            type: "text",
            data: char,
        });
    }
    return out;
}
