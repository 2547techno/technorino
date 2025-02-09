import { ASTNode, MatchResponse } from ".";
import { Token } from "../tokenizer";
import { matchSegment } from "./segment";

export function matchMarkdown(i: number, tokens: Token[]): MatchResponse {
    const innerNodes: ASTNode[] = [];
    const segment = matchSegment(i, tokens);
    if (!segment.accepted) {
        return {
            accepted: false,
        };
    }
    innerNodes.push(...segment.nodes);
    i = segment.endCursor;

    while (true) {
        const segment = matchSegment(i, tokens);
        if (segment.accepted) {
            innerNodes.push(...segment.nodes);
            i = segment.endCursor;
        } else {
            break;
        }
    }

    if (tokens[i].type === "end") {
        return {
            accepted: true,
            nodes: innerNodes,
            endCursor: i + 1,
        };
    } else {
        return {
            accepted: false,
        };
    }
}
