import {
    BoldASTNode,
    CodeASTNode,
    ItalicASTNode,
    LinkASTNode,
    MatchResponse,
    StrikethroughASTNode,
} from ".";
import { Token } from "../tokenizer";
import { matchBold } from "./bold_italic_strikethrough/bold";
import { matchItalic } from "./bold_italic_strikethrough/italic";
import { matchStrikethrough } from "./bold_italic_strikethrough/strikethrough";
import { matchCode } from "./code";
import { matchLink } from "./link";

export function matchStyle(
    i: number,
    tokens: Token[]
): MatchResponse<
    | BoldASTNode
    | ItalicASTNode
    | StrikethroughASTNode
    | CodeASTNode
    | LinkASTNode
> {
    const bold = matchBold(i, tokens);
    if (bold.accepted) {
        return bold;
    }

    const italic = matchItalic(i, tokens);
    if (italic.accepted) {
        return italic;
    }

    const strikethrough = matchStrikethrough(i, tokens);
    if (strikethrough.accepted) {
        return strikethrough;
    }

    const code = matchCode(i, tokens);
    if (code.accepted) {
        return code;
    }

    const link = matchLink(i, tokens);
    if (link.accepted) {
        return link;
    }

    return {
        accepted: false,
    };
}
