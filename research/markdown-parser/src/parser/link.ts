import { LinkASTNode, MatchResponse, TextASTNode } from ".";
import { Token } from "../tokenizer";
import { matchChar } from "./char";

export function matchLink(
    i: number,
    tokens: Token[]
): MatchResponse<LinkASTNode> {
    const textNodes: TextASTNode[] = [];
    const urlNodes: TextASTNode[] = [];

    if (tokens[i].type === "lbracket") {
        i++;
        let char;

        char = matchChar(i, tokens);
        if (!char.accepted) {
            return {
                accepted: false,
            };
        }

        while (true) {
            const char = matchChar(i, tokens);
            if (char.accepted) {
                textNodes.push(...char.nodes);
                i = char.endCursor;
            } else {
                break;
            }
        }

        if (tokens[i].type !== "rbracket") {
            return {
                accepted: false,
            };
        }
        i++;

        if (tokens[i].type !== "lparen") {
            return {
                accepted: false,
            };
        }
        i++;

        char = matchChar(i, tokens);
        if (!char.accepted) {
            return {
                accepted: false,
            };
        }

        while (true) {
            const char = matchChar(i, tokens);
            if (char.accepted) {
                urlNodes.push(...char.nodes);
                i = char.endCursor;
            } else {
                break;
            }
        }

        if (tokens[i].type !== "rparen") {
            return {
                accepted: false,
            };
        }
        i++;

        return {
            accepted: true,
            nodes: [
                {
                    type: "link",
                    data: {
                        text: textNodes,
                        url: urlNodes,
                    },
                },
            ],
            endCursor: i,
        };
    }

    return {
        accepted: false,
    };
}
