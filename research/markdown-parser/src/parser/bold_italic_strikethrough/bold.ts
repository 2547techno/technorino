import { _matchBoldItalic } from ".";
import { BoldASTNode, MatchResponse } from "..";
import { Token } from "../../tokenizer";

export function matchBoldAsterix(
    i: number,
    tokens: Token[]
): MatchResponse<BoldASTNode> {
    return _matchBoldItalic(
        "asterix",
        2,
        i,
        tokens
    ) as MatchResponse<BoldASTNode>;
}

export function matchBoldUnderline(
    i: number,
    tokens: Token[]
): MatchResponse<BoldASTNode> {
    return _matchBoldItalic(
        "underline",
        2,
        i,
        tokens
    ) as MatchResponse<BoldASTNode>;
}

export function matchBold(
    i: number,
    tokens: Token[]
): MatchResponse<BoldASTNode> {
    const boldAsterix = matchBoldAsterix(i, tokens);
    if (boldAsterix.accepted) {
        return boldAsterix;
    }

    const boldUnderline = matchBoldUnderline(i, tokens);
    if (boldUnderline.accepted) {
        return boldUnderline;
    }

    return {
        accepted: false,
    };
}
