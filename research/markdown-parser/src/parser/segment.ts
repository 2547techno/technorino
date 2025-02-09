import {
    ASTNode,
    BoldASTNode,
    CodeASTNode,
    ItalicASTNode,
    LinkASTNode,
    MatchResponse,
    StrikethroughASTNode,
    TextASTNode,
} from ".";
import { Token } from "../tokenizer";
import { matchAny } from "./any";
import { matchStyle } from "./style";

export function matchSegment(
    i: number,
    tokens: Token[]
): MatchResponse<
    | BoldASTNode
    | ItalicASTNode
    | StrikethroughASTNode
    | CodeASTNode
    | LinkASTNode
    | TextASTNode
> {
    const style = matchStyle(i, tokens);
    if (style.accepted) {
        return style;
    }

    const any = matchAny(i, tokens);
    if (any.accepted) {
        return any;
    }

    return {
        accepted: false,
    };
}
