import { _matchBoldItalic } from ".";
import { MatchResponse, StrikethroughASTNode } from "..";
import { Token } from "../../tokenizer";

export function matchStrikethrough(
    i: number,
    tokens: Token[]
): MatchResponse<StrikethroughASTNode> {
    return _matchBoldItalic(
        "tilde",
        1,
        i,
        tokens
    ) as MatchResponse<StrikethroughASTNode>;
}
