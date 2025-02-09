import { CodeASTNode, MatchResponse, TextASTNode } from ".";
import { Token } from "../tokenizer";
import { matchChar } from "./char";

export function matchCode(
    i: number,
    tokens: Token[]
): MatchResponse<CodeASTNode> {
    const innerNodes: TextASTNode[] = [];
    if (tokens[i].type === "tick") {
        i++;

        if (!matchChar(i, tokens).accepted) {
            return {
                accepted: false,
            };
        }

        while (true) {
            const char = matchChar(i, tokens);
            if (!char.accepted) break;

            innerNodes.push(...char.nodes);
            i++;
        }

        if (tokens[i].type === "tick") {
            return {
                accepted: true,
                nodes: [
                    {
                        type: "code",
                        data: innerNodes,
                    },
                ],
                endCursor: i + 1,
            };
        }
    }

    return {
        accepted: false,
    };
}
