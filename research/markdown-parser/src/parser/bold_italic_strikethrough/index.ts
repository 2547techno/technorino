import {
    ASTNode,
    BoldASTNode,
    ItalicASTNode,
    MatchResponse,
    StrikethroughASTNode,
    TextASTNode,
} from "..";
import { Token } from "../../tokenizer";
import { matchBoundryChar } from "../boundry_char";
import { matchChar } from "../char";

function getAstNode(
    tokenType: "asterix" | "underline" | "tilde",
    numToken: 1 | 2,
    innerNodes: TextASTNode[]
): (StrikethroughASTNode | ItalicASTNode | BoldASTNode)[] {
    switch (numToken) {
        case 1: {
            if (tokenType === "tilde") {
                return [
                    {
                        type: "strikethrough",
                        data: innerNodes,
                    },
                ];
            }
            return [
                {
                    type: "italic",
                    data: innerNodes,
                },
            ];
        }
        case 2: {
            if (tokenType === "tilde") {
                throw new Error();
            }
            return [
                {
                    type: "bold",
                    data: innerNodes,
                },
            ];
        }
    }
}

export function _matchBoldItalic(
    tokenType: "asterix" | "underline" | "tilde",
    numToken: 1 | 2,
    i: number,
    tokens: Token[]
): MatchResponse<BoldASTNode | ItalicASTNode | StrikethroughASTNode> {
    const innerNodes: TextASTNode[] = [];
    if (numToken === 2) {
        if (tokens[i].type === tokenType) {
            i++;
        } else {
            return {
                accepted: false,
            };
        }
    }

    const boundryChar = matchBoundryChar(i + 1, tokens);
    if (tokens[i].type === tokenType && boundryChar.accepted) {
        innerNodes.push(...boundryChar.nodes);
        i += 2;

        switch (tokens[i].type) {
            case "char": {
                while (true) {
                    const boundryChar = matchBoundryChar(i, tokens);
                    if (boundryChar.accepted) {
                        if (
                            tokens[i + 1].type === tokenType &&
                            (numToken === 2
                                ? tokens[i + 2].type === tokenType
                                : true)
                        ) {
                            innerNodes.push(...boundryChar.nodes);
                            return {
                                accepted: true,
                                nodes: getAstNode(
                                    tokenType,
                                    numToken,
                                    innerNodes
                                ),
                                endCursor: i + numToken + 1,
                            };
                        }
                    }

                    const char = matchChar(i, tokens);
                    if (!char.accepted) {
                        return {
                            accepted: false,
                        };
                    }
                    innerNodes.push(...char.nodes);
                    i++;
                }
                break;
            }
            case tokenType: {
                if (numToken === 1) {
                    return {
                        accepted: true,
                        nodes: getAstNode(tokenType, numToken, innerNodes),
                        endCursor: i + 1,
                    };
                }

                if (tokens[i + 1].type === tokenType) {
                    return {
                        accepted: true,
                        nodes: getAstNode(tokenType, numToken, innerNodes),
                        endCursor: i + 2,
                    };
                } else {
                    return {
                        accepted: false,
                    };
                }
                break;
            }
            default: {
                return {
                    accepted: false,
                };
            }
        }
    } else {
        return {
            accepted: false,
        };
    }
}
