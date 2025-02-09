import { MatchResponse, TextASTNode } from ".";
import { Token } from "../tokenizer";
import { createTextNodes } from "../utils";

export function matchAny(
    i: number,
    tokens: Token[]
): MatchResponse<TextASTNode> {
    switch (tokens[i].type) {
        case "asterix": {
            return {
                accepted: true,
                nodes: createTextNodes("*"),
                endCursor: i + 1,
            };
        }
        case "underline": {
            return {
                accepted: true,
                nodes: createTextNodes("_"),
                endCursor: i + 1,
            };
        }
        case "tilde": {
            return {
                accepted: true,
                nodes: createTextNodes("~"),
                endCursor: i + 1,
            };
        }
        case "tick": {
            return {
                accepted: true,
                nodes: createTextNodes("`"),
                endCursor: i + 1,
            };
        }
        case "lbracket": {
            return {
                accepted: true,
                nodes: createTextNodes("["),
                endCursor: i + 1,
            };
        }
        case "rbracket": {
            return {
                accepted: true,
                nodes: createTextNodes("]"),
                endCursor: i + 1,
            };
        }
        case "lparen": {
            return {
                accepted: true,
                nodes: createTextNodes("("),
                endCursor: i + 1,
            };
        }
        case "rparen": {
            return {
                accepted: true,
                nodes: createTextNodes(")"),
                endCursor: i + 1,
            };
        }
        case "char": {
            return {
                accepted: true,
                nodes: createTextNodes(tokens[i].data),
                endCursor: i + 1,
            };
        }
    }

    return {
        accepted: false,
    };
}
