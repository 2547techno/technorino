#include "messages/ast/Parser.hpp"

#include "util/Variant.hpp"

#include <optional>
#include <variant>

namespace chatterino::ast {

QVector<ASTNode> createTextNodes(QString str, bool normalize)
{
    if (normalize)
    {
        QVector<ASTNode> nodes;
        nodes.append(TextASTNode{str});
        return nodes;
    }

    QVector<ASTNode> out;
    for (auto character : str)
    {
        out.append(TextASTNode{QString(character)});
    }

    return out;
}

MatchResponse matchAny(int i, QVector<Token> tokens)
{
    Token token = tokens.at(i);

    MatchResponse response = std::visit(
        variant::Overloaded{
            [&i](AsterixToken) -> MatchResponse {
                return MatchResponse({true, createTextNodes("*"), i + 1});
            },
            [&i](UnderlineToken) -> MatchResponse {
                return MatchResponse({true, createTextNodes("_"), i + 1});
            },
            [&i](TildeToken) -> MatchResponse {
                return MatchResponse({true, createTextNodes("~"), i + 1});
            },
            [&i](TickToken) -> MatchResponse {
                return MatchResponse({true, createTextNodes("`"), i + 1});
            },
            [&i](LeftBracketToken) -> MatchResponse {
                return MatchResponse({true, createTextNodes("["), i + 1});
            },
            [&i](RightBracketToken) -> MatchResponse {
                return MatchResponse({true, createTextNodes("]"), i + 1});
            },
            [&i](LeftParenToken) -> MatchResponse {
                return MatchResponse({true, createTextNodes("("), i + 1});
            },
            [&i](RightParenToken) -> MatchResponse {
                return MatchResponse({true, createTextNodes(")"), i + 1});
            },
            [&i](CharToken token) -> MatchResponse {
                return MatchResponse(
                    {true, createTextNodes(token.data), i + 1});
            },
            [](auto) -> MatchResponse {
                return MatchResponse({false});
            },
        },
        token);

    return response;
}

MatchResponse matchChar(int i, QVector<Token> tokens)
{
    return std::visit(variant::Overloaded{
                          [&i](CharToken token) -> MatchResponse {
                              return MatchResponse{
                                  true, createTextNodes(token.data), i + 1};
                          },
                          [](auto) -> MatchResponse {
                              return MatchResponse{false};
                          },
                      },
                      tokens.value(i, EndToken{}));
}

MatchResponse matchBoundryChar(int i, QVector<Token> tokens)
{
    Token token = tokens.value(i, EndToken{});

    bool rejected = std::visit(variant::Overloaded{
                                   [](EndToken) -> bool {
                                       return true;
                                   },
                                   [](CharToken) -> bool {
                                       return false;
                                   },
                                   [](auto) -> bool {
                                       return true;
                                   },
                               },
                               token);

    if (rejected)
    {
        return MatchResponse{false};
    }

    CharToken charToken = std::get<CharToken>(token);

    int matched = BOUNDRY_CHAR_REGEX.indexIn(charToken.data);
    if (matched >= 0)
    {
        return MatchResponse({true, createTextNodes(charToken.data), i + 1});
    }
    else
    {
        return MatchResponse({false});
    }
}

QVector<ASTNode> getBoundryStyleAstNode(BoundryStyleToken tokenType,
                                        int numTokens,
                                        QVector<ASTNode> innerNodes)
{
    switch (numTokens)
    {
        case 1: {
            return std::visit(
                variant::Overloaded{
                    [&innerNodes](TildeToken) -> QVector<ASTNode> {
                        QVector<ASTNode> out;
                        out.append(StrikethroughASTNode{innerNodes});
                        return out;
                    },
                    [&innerNodes](auto) -> QVector<ASTNode> {
                        QVector<ASTNode> out;
                        out.append(ItalicASTNode{innerNodes});
                        return out;
                    },
                },
                tokenType);
        }
        case 2:
            return std::visit(variant::Overloaded{
                                  [](TildeToken) -> QVector<ASTNode> {
                                      throw std::runtime_error(
                                          "TildeToken cannot be numTokens=2");
                                  },
                                  [&innerNodes](auto) -> QVector<ASTNode> {
                                      QVector<ASTNode> out;
                                      out.append(BoldASTNode{innerNodes});
                                      return out;
                                  },
                              },
                              tokenType);
        default: {
            throw std::runtime_error("numTokens must be 1 or 2");
        }
    }
}

/**
// TODO: Possible generic version?
template <typename TokenT, typename BoundryStyleTokenT>
constexpr bool boundryStyleTypeEq(const TokenT& token, const BoundryStyleTokenT& boundryToken) {
    return std::holds_alternative<TokenT>(boundryToken);
}
*/
bool boundryStyleTypeEq(Token token, BoundryStyleToken boundryToken)
{
    return std::visit(
        variant::Overloaded{
            [&token](AsterixToken) -> bool {
                return std::holds_alternative<AsterixToken>(token);
            },
            [&token](UnderlineToken) -> bool {
                return std::holds_alternative<UnderlineToken>(token);
            },
            [&token](TildeToken) -> bool {
                return std::holds_alternative<TildeToken>(token);
            },
        },
        boundryToken);
}

MatchResponse matchBoundryStyle(BoundryStyleToken tokenType, int numToken,
                                int i, QVector<Token> tokens)
{
    QVector<ASTNode> innerNodes;

    if (numToken == 2)
    {
        if (boundryStyleTypeEq(tokens.at(i), tokenType))
        {
            i++;
        }
        else
        {
            return MatchResponse{false};
        }
    }

    MatchResponse boundryChar = matchBoundryChar(i + 1, tokens);
    if (boundryStyleTypeEq(tokens.at(i), tokenType) && boundryChar.accepted)
    {
        innerNodes.append(boundryChar.nodes);
        i += 2;

        if (boundryStyleTypeEq(tokens.at(i), tokenType))
        {
            if (numToken == 1)
            {
                return MatchResponse{
                    true,
                    getBoundryStyleAstNode(tokenType, numToken, innerNodes),
                    i + 1};
            }

            if (boundryStyleTypeEq(tokens.at(i + 1), tokenType))
            {
                return MatchResponse{
                    true,
                    getBoundryStyleAstNode(tokenType, numToken, innerNodes),
                    i + 2};
            }
            else
            {
                return MatchResponse{false};
            }
        }
        else if (std::holds_alternative<CharToken>(tokens.at(i)))
        {
            while (true)
            {
                MatchResponse boundryChar = matchBoundryChar(i, tokens);
                if (boundryChar.accepted)
                {
                    if (boundryStyleTypeEq(tokens.at(i + 1), tokenType) &&
                        (numToken == 2
                             ? boundryStyleTypeEq(tokens.at(i + 2), tokenType)
                             : true))
                    {
                        innerNodes.append(boundryChar.nodes);
                        return MatchResponse{
                            true,
                            getBoundryStyleAstNode(tokenType, numToken,
                                                   innerNodes),
                            i + numToken + 1};
                    }
                }

                MatchResponse character = matchChar(i, tokens);
                if (!character.accepted)
                {
                    return MatchResponse{false};
                }

                innerNodes.append(character.nodes);
                i++;
            }
        }
        else
        {
            return MatchResponse{false};
        }
    }
    else
    {
        return MatchResponse{false};
    }
}

MatchResponse matchBoldAsterix(int i, QVector<Token> tokens)
{
    return matchBoundryStyle(AsterixToken{}, 2, i, tokens);
}

MatchResponse matchBoldUnderline(int i, QVector<Token> tokens)
{
    return matchBoundryStyle(UnderlineToken{}, 2, i, tokens);
}

MatchResponse matchBold(int i, QVector<Token> tokens)
{
    MatchResponse boldAsterix = matchBoldAsterix(i, tokens);
    if (boldAsterix.accepted)
    {
        return boldAsterix;
    }

    MatchResponse boldUnderline = matchBoldUnderline(i, tokens);
    if (boldUnderline.accepted)
    {
        return boldUnderline;
    }

    return MatchResponse{false};
}

MatchResponse matchItalicAsterix(int i, QVector<Token> tokens)
{
    return matchBoundryStyle(AsterixToken{}, 1, i, tokens);
}

MatchResponse matchItalicUnderline(int i, QVector<Token> tokens)
{
    return matchBoundryStyle(UnderlineToken{}, 1, i, tokens);
}

MatchResponse matchItalic(int i, QVector<Token> tokens)
{
    MatchResponse italicAsterix = matchItalicAsterix(i, tokens);
    if (italicAsterix.accepted)
    {
        return italicAsterix;
    }

    MatchResponse italicUnderline = matchItalicUnderline(i, tokens);
    if (italicUnderline.accepted)
    {
        return italicUnderline;
    }

    return MatchResponse{false};
}

MatchResponse matchStrikethrough(int i, QVector<Token> tokens)
{
    return matchBoundryStyle(TildeToken{}, 1, i, tokens);
}

MatchResponse matchCode(int i, QVector<Token> tokens)
{
    QVector<ASTNode> innerNodes;
    if (std::holds_alternative<TickToken>(tokens.at(i)))
    {
        i++;

        MatchResponse character = matchChar(i, tokens);
        if (!character.accepted)
        {
            return MatchResponse{false};
        }

        while (true)
        {
            MatchResponse character = matchChar(i, tokens);
            if (!character.accepted)
            {
                break;
            }

            innerNodes.append(character.nodes);
            i++;
        }

        if (std::holds_alternative<TickToken>(tokens.at(i)))
        {
            QVector<ASTNode> nodes;
            nodes.append(CodeASTNode{innerNodes});
            return MatchResponse{true, nodes, i + 1};
        }
    }
    return MatchResponse{false};
}

MatchResponse matchLink(int i, QVector<Token> tokens)
{
    QVector<ASTNode> textNodes;
    QVector<ASTNode> urlNodes;

    if (std::holds_alternative<LeftBracketToken>(tokens.at(i)))
    {
        i++;

        MatchResponse character = matchChar(i, tokens);
        if (!character.accepted)
        {
            return MatchResponse{false};
        }

        while (true)
        {
            MatchResponse character = matchChar(i, tokens);
            if (character.accepted)
            {
                textNodes.append(character.nodes);
                i = character.endCursor;
            }
            else
            {
                break;
            }
        }

        if (!std::holds_alternative<RightBracketToken>(tokens.at(i)))
        {
            return MatchResponse{false};
        }
        i++;

        if (!std::holds_alternative<LeftParenToken>(tokens.at(i)))
        {
            return MatchResponse{false};
        }
        i++;

        character = matchChar(i, tokens);
        if (!character.accepted)
        {
            return MatchResponse{false};
        }

        while (true)
        {
            MatchResponse character = matchChar(i, tokens);
            if (character.accepted)
            {
                urlNodes.append(character.nodes);
                i = character.endCursor;
            }
            else
            {
                break;
            }
        }

        if (!std::holds_alternative<RightParenToken>(tokens.at(i)))
        {
            return MatchResponse{false};
        }
        i++;

        QVector<ASTNode> out;
        out.append(LinkASTNode{textNodes, urlNodes});
        return MatchResponse{true, out, i};
    }

    return MatchResponse{false};
}
MatchResponse matchStyle(int i, QVector<Token> tokens)
{
    MatchResponse bold = matchBold(i, tokens);
    if (bold.accepted)
    {
        return bold;
    }

    MatchResponse italic = matchItalic(i, tokens);
    if (italic.accepted)
    {
        return italic;
    }

    MatchResponse strikethrough = matchStrikethrough(i, tokens);
    if (strikethrough.accepted)
    {
        return strikethrough;
    }

    MatchResponse code = matchCode(i, tokens);
    if (code.accepted)
    {
        return code;
    }

    MatchResponse link = matchLink(i, tokens);
    if (link.accepted)
    {
        return link;
    }

    return MatchResponse{false};
}

MatchResponse matchSegment(int i, QVector<Token> tokens)
{
    MatchResponse style = matchStyle(i, tokens);
    if (style.accepted)
    {
        return style;
    }

    MatchResponse any = matchAny(i, tokens);
    if (any.accepted)
    {
        return any;
    }

    return MatchResponse{false};
}

MatchResponse matchMarkdown(int i, QVector<Token> tokens)
{
    QVector<ASTNode> innerNodes;

    MatchResponse segment = matchSegment(i, tokens);
    if (!segment.accepted)
    {
        return MatchResponse{false};
    }
    innerNodes.append(segment.nodes);
    i = segment.endCursor;

    while (true)
    {
        MatchResponse segment = matchSegment(i, tokens);
        if (segment.accepted)
        {
            innerNodes.append(segment.nodes);
            i = segment.endCursor;
        }
        else
        {
            break;
        }
    }

    if (std::holds_alternative<EndToken>(tokens.at(i)))
    {
        return MatchResponse{true, innerNodes, i + 1};
    }
    else
    {
        return MatchResponse{false};
    }
}

QVector<ASTNode> normalizeTextNodes(QVector<ASTNode> nodes)
{
    TextASTNode currentTextNode;

    auto combineTextNode = [&currentTextNode](TextASTNode node) {
        currentTextNode.data.append(node.data);
    };

    QVector<ASTNode> out;

    for (auto node : nodes)
    {
        if (std::holds_alternative<TextASTNode>(node))
        {
            TextASTNode textNode = std::get<TextASTNode>(node);
            combineTextNode(textNode);
        }
        else
        {
            if (!currentTextNode.data.isEmpty())
            {
                out.append(currentTextNode);
                currentTextNode = TextASTNode{};
            }

            ASTNode normalizedNode = std::visit(
                variant::Overloaded{
                    [](LinkASTNode node) -> ASTNode {
                        return LinkASTNode{normalizeTextNodes(node.text),
                                           normalizeTextNodes(node.url)};
                    },
                    // TODO: generic?
                    [](BoldASTNode node) -> ASTNode {
                        qDebug() << node.data.length();
                        return BoldASTNode{normalizeTextNodes(node.data)};
                    },
                    [](ItalicASTNode node) -> ASTNode {
                        return ItalicASTNode{normalizeTextNodes(node.data)};
                    },
                    [](StrikethroughASTNode node) -> ASTNode {
                        return StrikethroughASTNode{
                            normalizeTextNodes(node.data)};
                    },
                    [](CodeASTNode node) -> ASTNode {
                        return CodeASTNode{normalizeTextNodes(node.data)};
                    },
                    [](TextASTNode node) -> ASTNode {
                        return node;
                    },
                },
                node);

            out.append(normalizedNode);
        }
    }

    if (!currentTextNode.data.isEmpty())
    {
        out.append(currentTextNode);
    }

    return out;
}

QString stringifyNode(ASTNode node)
{
    return std::visit(
        variant::Overloaded{[](BoldASTNode node) -> QString {
                                QString out = "BoldASTNode([";
                                for (auto node : node.data)
                                {
                                    out.append(stringifyNode(node));
                                    out.append(", ");
                                }
                                out.append("])");
                                return out;
                            },
                            [](ItalicASTNode node) -> QString {
                                QString out = "ItalicASTNode([";
                                for (auto node : node.data)
                                {
                                    out.append(stringifyNode(node));
                                    out.append(", ");
                                }
                                out.append("])");
                                return out;
                            },
                            [](StrikethroughASTNode node) -> QString {
                                QString out = "StrikethroughASTNode([";
                                for (auto node : node.data)
                                {
                                    out.append(stringifyNode(node));
                                    out.append(", ");
                                }
                                out.append("])");
                                return out;
                            },
                            [](CodeASTNode node) -> QString {
                                QString out = "CodeASTNode([";
                                for (auto node : node.data)
                                {
                                    out.append(stringifyNode(node));
                                    out.append(", ");
                                }
                                out.append("])");
                                return out;
                            },
                            [](LinkASTNode node) -> QString {
                                QString out = "LinkASTNode(text=[";
                                for (auto node : node.text)
                                {
                                    out.append(stringifyNode(node));
                                    out.append(", ");
                                }
                                out.append("], url=[");
                                for (auto node : node.url)
                                {
                                    out.append(stringifyNode(node));
                                    out.append(", ");
                                }
                                out.append("])");
                                return out;
                            },
                            [](TextASTNode node) -> QString {
                                // i have no idea why spaces are null characters, but they are...
                                if (node.data == QChar(0))
                                {
                                    return "TextASTNode(<space>)";
                                }

                                return std::format("TextASTNode({})",
                                                   node.data.toStdString())
                                    .data();
                            }},
        node);
}

}  // namespace chatterino::ast
