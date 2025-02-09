import { MatchResponse, TextASTNode } from ".";
import { Token } from "../tokenizer";

export function matchChar(
    i: number,
    tokens: Token[]
): MatchResponse<TextASTNode> {
    if (tokens[i].type === "char") {
        return {
            accepted: true,
            nodes: [
                {
                    type: "text",
                    data: tokens[i].data,
                },
            ],
            endCursor: i + 1,
        };
    } else {
        return {
            accepted: false,
        };
    }
}
