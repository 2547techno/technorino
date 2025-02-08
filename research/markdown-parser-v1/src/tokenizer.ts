export type AsterixToken = {
    type: "asterix";
};

export type UnderlineToken = {
    type: "underline";
};

export type TildeToken = {
    type: "tilde";
};

export type TickToken = {
    type: "tick";
};

export type CharToken = {
    type: "char";
    data: string;
};

export type EndToken = {
    type: "end";
};

export type LeftBracketToken = {
    type: "lbracket";
};

export type RightBracketToken = {
    type: "rbracket";
};

export type LeftParenToken = {
    type: "lparen";
};
export type RightParenToken = {
    type: "rparen";
};

export type Token =
    | AsterixToken
    | UnderlineToken
    | TildeToken
    | TickToken
    | CharToken
    | EndToken
    | LeftBracketToken
    | RightBracketToken
    | LeftParenToken
    | RightParenToken;

export function tokenize(input: string): Token[] {
    const out: Token[] = [];

    let i = 0;
    while (i < input.length) {
        switch (input[i]) {
            case "\\": {
                if (input[i + 1]) {
                    out.push({
                        type: "char",
                        data: input[i + 1],
                    });
                    i++;
                } else {
                    out.push({
                        type: "char",
                        data: "\\",
                    });
                }
                break;
            }
            case "*": {
                out.push({
                    type: "asterix",
                });
                break;
            }
            case "_": {
                out.push({
                    type: "underline",
                });
                break;
            }
            case "~": {
                out.push({
                    type: "tilde",
                });
                break;
            }
            case "`": {
                out.push({
                    type: "tick",
                });
                break;
            }
            case "[": {
                out.push({
                    type: "lbracket",
                });
                break;
            }
            case "]": {
                out.push({
                    type: "rbracket",
                });
                break;
            }
            case "(": {
                out.push({
                    type: "lparen",
                });
                break;
            }
            case ")": {
                out.push({
                    type: "rparen",
                });
                break;
            }
            default: {
                out.push({
                    type: "char",
                    data: input[i],
                });
                break;
            }
        }
        i++;
    }
    out.push({
        type: "end",
    });

    return out;
}
