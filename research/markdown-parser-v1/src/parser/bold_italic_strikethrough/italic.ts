import { _matchBoldItalic } from ".";
import { ItalicASTNode, MatchResponse } from "..";
import { Token } from "../../tokenizer";

export function matchItalicAsterix(
    i: number,
    tokens: Token[]
): MatchResponse<ItalicASTNode> {
    return _matchBoldItalic(
        "asterix",
        1,
        i,
        tokens
    ) as MatchResponse<ItalicASTNode>;
}

export function matchItalicUnderline(
    i: number,
    tokens: Token[]
): MatchResponse<ItalicASTNode> {
    return _matchBoldItalic(
        "underline",
        1,
        i,
        tokens
    ) as MatchResponse<ItalicASTNode>;
}

export function matchItalic(
    i: number,
    tokens: Token[]
): MatchResponse<ItalicASTNode> {
    const italicAsterix = matchItalicAsterix(i, tokens);
    if (italicAsterix.accepted) {
        return italicAsterix;
    }

    const italicUnderline = matchItalicUnderline(i, tokens);
    if (italicUnderline.accepted) {
        return italicUnderline;
    }

    return {
        accepted: false,
    };
}
