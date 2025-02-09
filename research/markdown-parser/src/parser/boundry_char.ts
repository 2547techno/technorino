import { MatchResponse, TextASTNode } from ".";
import { Token } from "../tokenizer";

const BOUNDRY_CHAR_REGEX = /[^\s]/;

export function matchBoundryChar(
    i: number,
    tokens: Token[]
): MatchResponse<TextASTNode> {
    const token = tokens[i];

    if (!tokens[i]) {
        return {
            accepted: false,
        };
    }

    if (token.type !== "char")
        return {
            accepted: false,
        };

    const result = BOUNDRY_CHAR_REGEX.test(token.data);

    if (result) {
        return {
            accepted: true,
            nodes: [
                {
                    type: "text",
                    data: token.data,
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
