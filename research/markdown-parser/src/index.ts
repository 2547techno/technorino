import { tokenize } from "./tokenizer";

import { describe, it } from "node:test";
import assert from "node:assert";
import {
    matchBoldAsterix,
    matchBoldUnderline,
    matchBold,
} from "./parser/bold_italic_strikethrough/bold";
import {
    matchItalicAsterix,
    matchItalicUnderline,
    matchItalic,
} from "./parser/bold_italic_strikethrough/italic";
import { matchBoundryChar } from "./parser/boundry_char";
import { matchChar } from "./parser/char";
import { matchStrikethrough } from "./parser/bold_italic_strikethrough/strikethrough";
import { matchCode } from "./parser/code";
import { matchStyle } from "./parser/style";
import { matchSegment } from "./parser/segment";
import { matchMarkdown } from "./parser/markdown";
import { ASTNode } from "./parser";
import { assertAst, createTextNodes } from "./utils";
import { matchLink } from "./parser/link";

describe("lexer", () => {
    it(() => {
        const input = "**foobar* awdawd***dawd**";
        const tokenizedInput = tokenize(input);
        assert.strictEqual(
            JSON.stringify(tokenizedInput),
            JSON.stringify([
                { type: "asterix" },
                { type: "asterix" },
                { type: "char", data: "f" },
                { type: "char", data: "o" },
                { type: "char", data: "o" },
                { type: "char", data: "b" },
                { type: "char", data: "a" },
                { type: "char", data: "r" },
                { type: "asterix" },
                { type: "char", data: " " },
                { type: "char", data: "a" },
                { type: "char", data: "w" },
                { type: "char", data: "d" },
                { type: "char", data: "a" },
                { type: "char", data: "w" },
                { type: "char", data: "d" },
                { type: "asterix" },
                { type: "asterix" },
                { type: "asterix" },
                { type: "char", data: "d" },
                { type: "char", data: "a" },
                { type: "char", data: "w" },
                { type: "char", data: "d" },
                { type: "asterix" },
                { type: "asterix" },
                { type: "end" },
            ])
        );
    });
    it(() => {
        const input = "skldj\\*asd";
        const tokenizedInput = tokenize(input);
        assert.strictEqual(
            JSON.stringify(tokenizedInput),
            JSON.stringify([
                { type: "char", data: "s" },
                { type: "char", data: "k" },
                { type: "char", data: "l" },
                { type: "char", data: "d" },
                { type: "char", data: "j" },
                { type: "char", data: "*" },
                { type: "char", data: "a" },
                { type: "char", data: "s" },
                { type: "char", data: "d" },
                { type: "end" },
            ])
        );
    });
});

type AcceptTest = {
    input: string;
    nodes: ASTNode[];
};

describe("grammar parser", () => {
    const TEST_STRINGS: {
        bold: {
            asterix: {
                accept: AcceptTest[];
                reject: string[];
            };
            underline: {
                accept: AcceptTest[];
                reject: string[];
            };
        };
        italic: {
            asterix: {
                accept: AcceptTest[];
                reject: string[];
            };
            underline: {
                accept: AcceptTest[];
                reject: string[];
            };
        };
        strikethrough: {
            accept: AcceptTest[];
            reject: string[];
        };
        code: {
            accept: AcceptTest[];
            reject: string[];
        };
        link: {
            accept: AcceptTest[];
            reject: string[];
        };
        style: {
            accept: AcceptTest[];
            reject: string[];
        };
        segment: {
            accept: AcceptTest[];
            reject: string[];
        };
        markdown: {
            accept: AcceptTest[];
            reject: string[];
        };
    } = {
        bold: {
            asterix: {
                accept: [
                    {
                        input: "**foo**",
                        nodes: [
                            {
                                type: "bold",
                                data: createTextNodes("foo"),
                            },
                        ],
                    },
                    {
                        input: "**f**",
                        nodes: [
                            {
                                type: "bold",
                                data: createTextNodes("f"),
                            },
                        ],
                    },
                    {
                        input: "**fo**",
                        nodes: [
                            {
                                type: "bold",
                                data: createTextNodes("fo"),
                            },
                        ],
                    },
                ],
                reject: [
                    "** foo**",
                    "**foo **",
                    "** **",
                    "****",
                    "**a",
                    "**",
                    "*a*",
                    "*a",
                ],
            },
            underline: {
                accept: [
                    {
                        input: "__foo__",
                        nodes: [
                            {
                                type: "bold",
                                data: createTextNodes("foo"),
                            },
                        ],
                    },
                    {
                        input: "__f__",
                        nodes: [
                            {
                                type: "bold",
                                data: createTextNodes("f"),
                            },
                        ],
                    },
                    {
                        input: "__fo__",
                        nodes: [
                            {
                                type: "bold",
                                data: createTextNodes("fo"),
                            },
                        ],
                    },
                ],
                reject: [
                    "__ foo__",
                    "__foo __",
                    "__ __",
                    "____",
                    "__a",
                    "__",
                    "_a_",
                    "_a",
                ],
            },
        },
        italic: {
            asterix: {
                accept: [
                    {
                        input: "*foo*",
                        nodes: [
                            {
                                type: "italic",
                                data: createTextNodes("foo"),
                            },
                        ],
                    },
                    {
                        input: "*f*",
                        nodes: [
                            {
                                type: "italic",
                                data: createTextNodes("f"),
                            },
                        ],
                    },
                    {
                        input: "*fo*",
                        nodes: [
                            {
                                type: "italic",
                                data: createTextNodes("fo"),
                            },
                        ],
                    },
                ],
                reject: [
                    "* foo*",
                    "*foo *",
                    "* *",
                    "**",
                    "*a",
                    "*",
                    "**a**",
                    "**a",
                ],
            },
            underline: {
                accept: [
                    {
                        input: "_foo_",
                        nodes: [
                            {
                                type: "italic",
                                data: createTextNodes("foo"),
                            },
                        ],
                    },
                    {
                        input: "_f_",
                        nodes: [
                            {
                                type: "italic",
                                data: createTextNodes("f"),
                            },
                        ],
                    },
                    {
                        input: "_fo_",
                        nodes: [
                            {
                                type: "italic",
                                data: createTextNodes("fo"),
                            },
                        ],
                    },
                ],
                reject: [
                    "_ foo_",
                    "_foo _",
                    "_ _",
                    "__",
                    "_a",
                    "_",
                    "__a__",
                    "__a",
                ],
            },
        },
        strikethrough: {
            accept: [
                {
                    input: "~foo~",
                    nodes: [
                        {
                            type: "strikethrough",
                            data: createTextNodes("foo"),
                        },
                    ],
                },
                {
                    input: "~f~",
                    nodes: [
                        {
                            type: "strikethrough",
                            data: createTextNodes("f"),
                        },
                    ],
                },
                {
                    input: "~fo~",
                    nodes: [
                        {
                            type: "strikethrough",
                            data: createTextNodes("fo"),
                        },
                    ],
                },
            ],
            reject: ["~ foo~", "~foo ~", "~ ~", "~", "~a", "~", "~~a~~", "~~a"],
        },
        code: {
            accept: [
                {
                    input: "`foobar`",
                    nodes: [
                        {
                            type: "code",
                            data: createTextNodes("foobar"),
                        },
                    ],
                },
                {
                    input: "`foo bar`",
                    nodes: [
                        {
                            type: "code",
                            data: createTextNodes("foo bar"),
                        },
                    ],
                },
                {
                    input: "` foobar`",
                    nodes: [
                        {
                            type: "code",
                            data: createTextNodes(" foobar"),
                        },
                    ],
                },
                {
                    input: "` foobar `",
                    nodes: [
                        {
                            type: "code",
                            data: createTextNodes(" foobar "),
                        },
                    ],
                },
                {
                    input: "` `",
                    nodes: [{ type: "code", data: createTextNodes(" ") }],
                },
            ],
            reject: ["``"],
        },
        link: {
            accept: [
                {
                    input: "[foo](bar)",
                    nodes: [
                        {
                            type: "link",
                            data: {
                                text: createTextNodes("foo"),
                                url: createTextNodes("bar"),
                            },
                        },
                    ],
                },
                {
                    input: "[foo bar](fizz buzz)",
                    nodes: [
                        {
                            type: "link",
                            data: {
                                text: createTextNodes("foo bar"),
                                url: createTextNodes("fizz buzz"),
                            },
                        },
                    ],
                },
            ],
            reject: ["[]()", "[foo]()", "[](bar)"],
        },
        style: {
            accept: [
                {
                    input: "**foo**",
                    nodes: [{ type: "bold", data: createTextNodes("foo") }],
                },
                {
                    input: "**f**",
                    nodes: [{ type: "bold", data: createTextNodes("f") }],
                },
                {
                    input: "*a*",
                    nodes: [{ type: "italic", data: createTextNodes("a") }],
                },
                {
                    input: "__foo__",
                    nodes: [{ type: "bold", data: createTextNodes("foo") }],
                },
                {
                    input: "__f__",
                    nodes: [{ type: "bold", data: createTextNodes("f") }],
                },
                {
                    input: "_a_",
                    nodes: [{ type: "italic", data: createTextNodes("a") }],
                },
                {
                    input: "*foo*",
                    nodes: [
                        {
                            type: "italic",
                            data: createTextNodes("foo"),
                        },
                    ],
                },
                {
                    input: "*f*",
                    nodes: [{ type: "italic", data: createTextNodes("f") }],
                },
                {
                    input: "**a**",
                    nodes: [{ type: "bold", data: createTextNodes("a") }],
                },
                {
                    input: "_foo_",
                    nodes: [
                        {
                            type: "italic",
                            data: createTextNodes("foo"),
                        },
                    ],
                },
                {
                    input: "_f_",
                    nodes: [{ type: "italic", data: createTextNodes("f") }],
                },
                {
                    input: "__a__",
                    nodes: [{ type: "bold", data: createTextNodes("a") }],
                },
                {
                    input: "~foo~",
                    nodes: [
                        {
                            type: "strikethrough",
                            data: createTextNodes("foo"),
                        },
                    ],
                },
                {
                    input: "~f~",
                    nodes: [
                        {
                            type: "strikethrough",
                            data: createTextNodes("f"),
                        },
                    ],
                },
                {
                    input: "`foobar`",
                    nodes: [
                        {
                            type: "code",
                            data: createTextNodes("foobar"),
                        },
                    ],
                },
                {
                    input: "`foo bar`",
                    nodes: [
                        {
                            type: "code",
                            data: createTextNodes("foo bar"),
                        },
                    ],
                },
                {
                    input: "` foobar`",
                    nodes: [
                        {
                            type: "code",
                            data: createTextNodes(" foobar"),
                        },
                    ],
                },
                {
                    input: "` foobar `",
                    nodes: [
                        {
                            type: "code",
                            data: createTextNodes(" foobar "),
                        },
                    ],
                },
                {
                    input: "` `",
                    nodes: [{ type: "code", data: createTextNodes(" ") }],
                },
            ],
            reject: [
                "** foo**",
                "**foo **",
                "** **",
                "****",
                "**a",
                "**",
                "*a",
                "__ foo__",
                "__foo __",
                "__ __",
                "____",
                "__a",
                "__",
                "_a",
                "* foo*",
                "*foo *",
                "* *",
                "**",
                "*a",
                "*",
                "**a",
                "_ foo_",
                "_foo _",
                "_ _",
                "__",
                "_a",
                "_",
                "__a",
                "~ foo~",
                "~foo ~",
                "~ ~",
                "~",
                "~a",
                "~",
                "~~a~~",
                "~~a",
                "``",
            ],
        },
        segment: {
            accept: [],
            reject: [""],
        },
        markdown: {
            accept: [
                {
                    input: "foo bar *foo bar* foo bar ",
                    nodes: [
                        ...createTextNodes("foo bar "),
                        {
                            type: "italic",
                            data: createTextNodes("foo bar"),
                        },
                        ...createTextNodes(" foo bar "),
                    ],
                },
                {
                    input: "foo **bar ba** *fo* oobar `ba`",
                    nodes: [
                        ...createTextNodes("foo "),
                        {
                            type: "bold",
                            data: createTextNodes("bar ba"),
                        },
                        ...createTextNodes(" "),
                        {
                            type: "italic",
                            data: createTextNodes("fo"),
                        },
                        ...createTextNodes(" oobar "),
                        {
                            type: "code",
                            data: createTextNodes("ba"),
                        },
                    ],
                },
                {
                    input: "lk sdkljfsld kafl ksdf l kasdf",
                    nodes: createTextNodes("lk sdkljfsld kafl ksdf l kasdf"),
                },
                { input: "foobar", nodes: createTextNodes("foobar") },
                { input: " ", nodes: createTextNodes(" ") },
                {
                    input: "skdfjl  ",
                    nodes: createTextNodes("skdfjl  "),
                },
                {
                    input: "  aslkdf",
                    nodes: createTextNodes("  aslkdf"),
                },
                {
                    input: "** foo**",
                    nodes: createTextNodes("** foo**"),
                },
                {
                    input: "**foo **",
                    nodes: createTextNodes("**foo **"),
                },
                {
                    input: "** **",
                    nodes: createTextNodes("** **"),
                },
                {
                    input: "****",
                    nodes: createTextNodes("****"),
                },
                {
                    input: "**a",
                    nodes: createTextNodes("**a"),
                },
                {
                    input: "**",
                    nodes: createTextNodes("**"),
                },
                {
                    input: "*a",
                    nodes: createTextNodes("*a"),
                },
                {
                    input: "__ foo__",
                    nodes: createTextNodes("__ foo__"),
                },
                {
                    input: "__foo __",
                    nodes: createTextNodes("__foo __"),
                },
                {
                    input: "__ __",
                    nodes: createTextNodes("__ __"),
                },
                {
                    input: "____",
                    nodes: createTextNodes("____"),
                },
                {
                    input: "__a",
                    nodes: createTextNodes("__a"),
                },
                {
                    input: "__",
                    nodes: createTextNodes("__"),
                },
                {
                    input: "_a",
                    nodes: createTextNodes("_a"),
                },
                {
                    input: "* foo*",
                    nodes: createTextNodes("* foo*"),
                },
                {
                    input: "*foo *",
                    nodes: createTextNodes("*foo *"),
                },
                {
                    input: "* *",
                    nodes: createTextNodes("* *"),
                },
                {
                    input: "**",
                    nodes: createTextNodes("**"),
                },
                {
                    input: "*a",
                    nodes: createTextNodes("*a"),
                },
                {
                    input: "*",
                    nodes: createTextNodes("*"),
                },
                {
                    input: "**a",
                    nodes: createTextNodes("**a"),
                },
                {
                    input: "_ foo_",
                    nodes: createTextNodes("_ foo_"),
                },
                {
                    input: "_foo _",
                    nodes: createTextNodes("_foo _"),
                },
                {
                    input: "_ _",
                    nodes: createTextNodes("_ _"),
                },
                {
                    input: "__",
                    nodes: createTextNodes("__"),
                },
                {
                    input: "_a",
                    nodes: createTextNodes("_a"),
                },
                {
                    input: "_",
                    nodes: createTextNodes("_"),
                },
                {
                    input: "__a",
                    nodes: createTextNodes("__a"),
                },
                {
                    input: "~ foo~",
                    nodes: createTextNodes("~ foo~"),
                },
                {
                    input: "~foo ~",
                    nodes: createTextNodes("~foo ~"),
                },
                {
                    input: "~ ~",
                    nodes: createTextNodes("~ ~"),
                },
                {
                    input: "~",
                    nodes: createTextNodes("~"),
                },
                {
                    input: "~a",
                    nodes: createTextNodes("~a"),
                },
                {
                    input: "~",
                    nodes: createTextNodes("~"),
                },
                {
                    input: "~~a",
                    nodes: createTextNodes("~~a"),
                },
                {
                    input: "``",
                    nodes: createTextNodes("``"),
                },
                {
                    input: "~~a~~",
                    nodes: [
                        ...createTextNodes("~"),
                        {
                            type: "strikethrough",
                            data: createTextNodes("a"),
                        },
                        ...createTextNodes("~"),
                    ],
                },
                {
                    input: "foobar __foo *bar* baz__ baz",
                    nodes: [
                        ...createTextNodes("foobar __foo "),
                        {
                            type: "italic",
                            data: createTextNodes("bar"),
                        },
                        ...createTextNodes(" baz__ baz"),
                    ],
                },
            ],
            reject: [""],
        },
    };

    describe("char", () => {
        it("d", () => {
            assertAst(matchChar, "d", [{ type: "text", data: "d" }]);
        });
        it(" ", () => {
            assertAst(matchChar, " ", [{ type: "text", data: " " }]);
        });
        it("*", () => {
            assert.strictEqual(matchChar(0, tokenize("*")).accepted, false);
        });
        it("\\*", () => {
            assertAst(matchChar, "\\*", [{ type: "text", data: "*" }]);
        });
        it("_", () => {
            assert.strictEqual(matchChar(0, tokenize("_")).accepted, false);
        });
        it("~", () => {
            assert.strictEqual(matchChar(0, tokenize("~")).accepted, false);
        });
        it("`", () => {
            assert.strictEqual(matchChar(0, tokenize("`")).accepted, false);
        });
    });
    describe("boundry_char", () => {
        it(" ", () => {
            assert.strictEqual(
                matchBoundryChar(0, tokenize(" ")).accepted,
                false
            );
        });
        it("\\ ", () => {
            assert.strictEqual(
                matchBoundryChar(0, tokenize("\\ ")).accepted,
                false
            );
        });
        it("d", () => {
            assertAst(matchBoundryChar, "d", [{ type: "text", data: "d" }]);
        });
        it("*", () => {
            assert.strictEqual(
                matchBoundryChar(0, tokenize("*")).accepted,
                false
            );
        });
        it("\\*", () => {
            assertAst(matchBoundryChar, "\\*", [{ type: "text", data: "*" }]);
        });
    });

    describe("style", () => {
        describe("bold", () => {
            describe("bold_asterix", () => {
                describe("accept", () => {
                    TEST_STRINGS.bold.asterix.accept.forEach(
                        ({ input, nodes }) => {
                            it(input, () => {
                                assertAst(matchBoldAsterix, input, nodes);
                            });
                        }
                    );
                });

                describe("reject", () => {
                    TEST_STRINGS.bold.asterix.reject.forEach((s) => {
                        it(s, () => {
                            assert.strictEqual(
                                matchBoldAsterix(0, tokenize(s)).accepted,
                                false
                            );
                        });
                    });
                });
            });
            describe("bold_underline", () => {
                describe("accept", () => {
                    TEST_STRINGS.bold.underline.accept.forEach(
                        ({ input, nodes }) => {
                            it(input, () => {
                                assertAst(matchBoldUnderline, input, nodes);
                            });
                        }
                    );
                });

                describe("reject", () => {
                    TEST_STRINGS.bold.underline.reject.forEach((s) => {
                        it(s, () => {
                            assert.strictEqual(
                                matchBoldUnderline(0, tokenize(s)).accepted,
                                false
                            );
                        });
                    });
                });
            });
            describe("bold", () => {
                describe("accept", () => {
                    [
                        ...TEST_STRINGS.bold.asterix.accept,
                        ...TEST_STRINGS.bold.underline.accept,
                    ].forEach(({ input, nodes }) => {
                        it(input, () => {
                            assertAst(matchBold, input, nodes);
                        });
                    });
                });

                describe("reject", () => {
                    [
                        ...TEST_STRINGS.bold.asterix.reject,
                        ...TEST_STRINGS.bold.underline.reject,
                    ].forEach((s) => {
                        it(s, () => {
                            assert.strictEqual(
                                matchBold(0, tokenize(s)).accepted,
                                false
                            );
                        });
                    });
                });
            });
        });

        describe("italic", () => {
            describe("italic_asterix", () => {
                describe("accept", () => {
                    TEST_STRINGS.italic.asterix.accept.forEach(
                        ({ input, nodes }) => {
                            it(input, () => {
                                assertAst(matchItalicAsterix, input, nodes);
                            });
                        }
                    );
                });

                describe("reject", () => {
                    TEST_STRINGS.italic.asterix.reject.forEach((s) => {
                        it(s, () => {
                            assert.strictEqual(
                                matchItalicAsterix(0, tokenize(s)).accepted,
                                false
                            );
                        });
                    });
                });
            });
            describe("italic_underline", () => {
                describe("accept", () => {
                    TEST_STRINGS.italic.underline.accept.forEach(
                        ({ input, nodes }) => {
                            it(input, () => {
                                assertAst(matchItalicUnderline, input, nodes);
                            });
                        }
                    );
                });

                describe("reject", () => {
                    TEST_STRINGS.italic.underline.reject.forEach((s) => {
                        it(s, () => {
                            assert.strictEqual(
                                matchItalicUnderline(0, tokenize(s)).accepted,
                                false
                            );
                        });
                    });
                });
            });
            describe("italic", () => {
                describe("accept", () => {
                    [
                        ...TEST_STRINGS.italic.asterix.accept,
                        ...TEST_STRINGS.italic.underline.accept,
                    ].forEach(({ input, nodes }) => {
                        it(input, () => {
                            assertAst(matchItalic, input, nodes);
                        });
                    });
                });

                describe("reject", () => {
                    [
                        ...TEST_STRINGS.italic.asterix.reject,
                        ...TEST_STRINGS.italic.underline.reject,
                    ].forEach((s) => {
                        it(s, () => {
                            assert.strictEqual(
                                matchItalic(0, tokenize(s)).accepted,
                                false
                            );
                        });
                    });
                });
            });
        });

        describe("strikethrough", () => {
            describe("accept", () => {
                TEST_STRINGS.strikethrough.accept.forEach(
                    ({ input, nodes }) => {
                        it(input, () => {
                            assertAst(matchStrikethrough, input, nodes);
                        });
                    }
                );
            });

            describe("reject", () => {
                TEST_STRINGS.strikethrough.reject.forEach((s) => {
                    it(s, () => {
                        assert.strictEqual(
                            matchStrikethrough(0, tokenize(s)).accepted,
                            false
                        );
                    });
                });
            });
        });

        describe("code", () => {
            describe("accept", () => {
                TEST_STRINGS.code.accept.forEach(({ input, nodes }) => {
                    it(input, () => {
                        assertAst(matchCode, input, nodes);
                    });
                });
            });

            describe("reject", () => {
                TEST_STRINGS.code.reject.forEach((s) => {
                    it(s, () => {
                        assert.strictEqual(
                            matchCode(0, tokenize(s)).accepted,
                            false
                        );
                    });
                });
            });
        });

        describe("link", () => {
            describe("accept", () => {
                TEST_STRINGS.link.accept.forEach(({ input, nodes }) => {
                    it(input, () => {
                        assertAst(matchLink, input, nodes);
                    });
                });
            });

            describe("reject", () => {
                TEST_STRINGS.link.reject.forEach((s) => {
                    it(s, () => {
                        assert.strictEqual(
                            matchLink(0, tokenize(s)).accepted,
                            false
                        );
                    });
                });
            });
        });

        describe("style", () => {
            describe("accept", () => {
                [
                    ...TEST_STRINGS.style.accept,
                    ...TEST_STRINGS.link.accept,
                ].forEach(({ input, nodes }) => {
                    it(input, () => {
                        assertAst(matchStyle, input, nodes);
                    });
                });
            });

            describe("reject", () => {
                [
                    ...TEST_STRINGS.style.reject,
                    ...TEST_STRINGS.link.reject,
                ].forEach((s) => {
                    it(s, () => {
                        assert.strictEqual(
                            matchStyle(0, tokenize(s)).accepted,
                            false
                        );
                    });
                });
            });
        });
    });

    describe("segment", () => {
        describe("accept", () => {
            [
                ...TEST_STRINGS.style.accept,
                ...TEST_STRINGS.style.accept,
                ...TEST_STRINGS.segment.accept,
            ].forEach(({ input, nodes }) => {
                it(input, () => {
                    assertAst(matchSegment, input, nodes);
                });
            });

            [...TEST_STRINGS.style.reject, ...TEST_STRINGS.link.reject].forEach(
                (s) => {
                    it(s, () => {
                        assertAst(matchSegment, s, createTextNodes(s[0]));
                    });
                }
            );
        });

        describe("reject", () => {
            [...TEST_STRINGS.segment.reject].forEach((s) => {
                it(s === "" ? "(empty string)" : s, () => {
                    assert.strictEqual(
                        matchSegment(0, tokenize(s)).accepted,
                        false
                    );
                });
            });
        });
    });

    describe("markdown", () => {
        describe("accept", () => {
            [
                ...TEST_STRINGS.style.accept,
                ...TEST_STRINGS.link.accept,
                ...TEST_STRINGS.segment.accept,
                ...TEST_STRINGS.markdown.accept,
            ].forEach(({ input, nodes }) => {
                it(input, () => {
                    assertAst(matchMarkdown, input, nodes);
                });
            });
        });

        describe("reject", () => {
            [
                ...TEST_STRINGS.segment.reject,
                ...TEST_STRINGS.markdown.reject,
            ].forEach((s) => {
                it(s === "" ? "(empty string)" : s, () => {
                    assert.strictEqual(
                        matchMarkdown(0, tokenize(s)).accepted,
                        false
                    );
                });
            });
        });
    });
});

describe("normalize", () => {
    const markdown: AcceptTest[] = [
        {
            input: "foo bar *foo bar* foo bar ",
            nodes: [
                ...createTextNodes("foo bar ", true),
                {
                    type: "italic",
                    data: createTextNodes("foo bar", true),
                },
                ...createTextNodes(" foo bar ", true),
            ],
        },
        {
            input: "foo **bar ba** *fo* oobar `ba`",
            nodes: [
                ...createTextNodes("foo ", true),
                {
                    type: "bold",
                    data: createTextNodes("bar ba", true),
                },
                ...createTextNodes(" ", true),
                {
                    type: "italic",
                    data: createTextNodes("fo", true),
                },
                ...createTextNodes(" oobar ", true),
                {
                    type: "code",
                    data: createTextNodes("ba", true),
                },
            ],
        },
        {
            input: "lk sdkljfsld kafl ksdf l kasdf",
            nodes: createTextNodes("lk sdkljfsld kafl ksdf l kasdf", true),
        },
        { input: "foobar", nodes: createTextNodes("foobar", true) },
        { input: " ", nodes: createTextNodes(" ", true) },
        {
            input: "skdfjl  ",
            nodes: createTextNodes("skdfjl  ", true),
        },
        {
            input: "  aslkdf",
            nodes: createTextNodes("  aslkdf", true),
        },
        {
            input: "** foo**",
            nodes: createTextNodes("** foo**", true),
        },
        {
            input: "**foo **",
            nodes: createTextNodes("**foo **", true),
        },
        {
            input: "** **",
            nodes: createTextNodes("** **", true),
        },
        {
            input: "****",
            nodes: createTextNodes("****", true),
        },
        {
            input: "**a",
            nodes: createTextNodes("**a", true),
        },
        {
            input: "**",
            nodes: createTextNodes("**", true),
        },
        {
            input: "*a",
            nodes: createTextNodes("*a", true),
        },
        {
            input: "__ foo__",
            nodes: createTextNodes("__ foo__", true),
        },
        {
            input: "__foo __",
            nodes: createTextNodes("__foo __", true),
        },
        {
            input: "__ __",
            nodes: createTextNodes("__ __", true),
        },
        {
            input: "____",
            nodes: createTextNodes("____", true),
        },
        {
            input: "__a",
            nodes: createTextNodes("__a", true),
        },
        {
            input: "__",
            nodes: createTextNodes("__", true),
        },
        {
            input: "_a",
            nodes: createTextNodes("_a", true),
        },
        {
            input: "* foo*",
            nodes: createTextNodes("* foo*", true),
        },
        {
            input: "*foo *",
            nodes: createTextNodes("*foo *", true),
        },
        {
            input: "* *",
            nodes: createTextNodes("* *", true),
        },
        {
            input: "**",
            nodes: createTextNodes("**", true),
        },
        {
            input: "*a",
            nodes: createTextNodes("*a", true),
        },
        {
            input: "*",
            nodes: createTextNodes("*", true),
        },
        {
            input: "**a",
            nodes: createTextNodes("**a", true),
        },
        {
            input: "_ foo_",
            nodes: createTextNodes("_ foo_", true),
        },
        {
            input: "_foo _",
            nodes: createTextNodes("_foo _", true),
        },
        {
            input: "_ _",
            nodes: createTextNodes("_ _", true),
        },
        {
            input: "__",
            nodes: createTextNodes("__", true),
        },
        {
            input: "_a",
            nodes: createTextNodes("_a", true),
        },
        {
            input: "_",
            nodes: createTextNodes("_", true),
        },
        {
            input: "__a",
            nodes: createTextNodes("__a", true),
        },
        {
            input: "~ foo~",
            nodes: createTextNodes("~ foo~", true),
        },
        {
            input: "~foo ~",
            nodes: createTextNodes("~foo ~", true),
        },
        {
            input: "~ ~",
            nodes: createTextNodes("~ ~", true),
        },
        {
            input: "~",
            nodes: createTextNodes("~", true),
        },
        {
            input: "~a",
            nodes: createTextNodes("~a", true),
        },
        {
            input: "~",
            nodes: createTextNodes("~", true),
        },
        {
            input: "~~a",
            nodes: createTextNodes("~~a", true),
        },
        {
            input: "``",
            nodes: createTextNodes("``", true),
        },
        {
            input: "~~a~~",
            nodes: [
                ...createTextNodes("~", true),
                {
                    type: "strikethrough",
                    data: createTextNodes("a", true),
                },
                ...createTextNodes("~", true),
            ],
        },
        {
            input: "foobar __foo *bar* baz__ baz",
            nodes: [
                ...createTextNodes("foobar __foo ", true),
                {
                    type: "italic",
                    data: createTextNodes("bar", true),
                },
                ...createTextNodes(" baz__ baz", true),
            ],
        },
    ];

    markdown.forEach(({ input, nodes }) => {
        it(input, () => {
            assertAst(matchMarkdown, input, nodes, true);
        });
    });
});

// import util from "node:util";

// const match = matchMarkdown(0, tokenize("foo1 bar *foo2 bar* foo3 bar"));
// console.log(match.accepted);
// if (match.accepted) {
//     console.log(
//         util.inspect(normalizeTextNodes(match.nodes), {
//             depth: null,
//         })
//     );
// }
