#pragma once

#include "messages/ast/Lexer.hpp"

#include <QRegExp>
#include <QString>

#include <variant>

namespace chatterino::ast {

struct BoldASTNode;
struct ItalicASTNode;
struct StrikethroughASTNode;
struct CodeASTNode;
struct LinkASTNode;
struct TextASTNode;

typedef std::variant<struct BoldASTNode, struct ItalicASTNode,
                     struct StrikethroughASTNode, struct CodeASTNode,
                     struct LinkASTNode, struct TextASTNode>
    ASTNode;

struct BoldASTNode {
    QVector<ASTNode> data;
};
struct ItalicASTNode {
    QVector<ASTNode> data;
};
struct StrikethroughASTNode {
    QVector<ASTNode> data;
};
struct CodeASTNode {
    QVector<ASTNode> data;
};
struct LinkASTNode {
    QVector<ASTNode> text;
    QVector<ASTNode> url;
};
struct TextASTNode {
    QString data;
};

struct MatchResponse {
    bool accepted;
    QVector<ASTNode> nodes;
    int endCursor;
};

QVector<ASTNode> createTextNodes(QString str, bool normalize = false);

MatchResponse matchAny(int i, QVector<Token> tokens);
MatchResponse matchChar(int i, QVector<Token> tokens);
const QRegExp BOUNDRY_CHAR_REGEX("[^\\s]");
MatchResponse matchBoundryChar(int i, QVector<Token> tokens);

QVector<ASTNode> getBoundryStyleAstNode(BoundryStyleToken tokenType,
                                        int numTokens,
                                        QVector<ASTNode> innerNodes);
bool boundryStyleTypeEq(Token token, BoundryStyleToken boundryToken);
MatchResponse matchBoundryStyle(BoundryStyleToken tokenType, int numToken,
                                int i, QVector<Token> tokens);
MatchResponse matchBoldAsterix(int i, QVector<Token> tokens);
MatchResponse matchBoldUnderline(int i, QVector<Token> tokens);
MatchResponse matchBold(int i, QVector<Token> tokens);
MatchResponse matchItalicAsterix(int i, QVector<Token> tokens);
MatchResponse matchItalicUnderline(int i, QVector<Token> tokens);
MatchResponse matchItalic(int i, QVector<Token> tokens);
MatchResponse matchStrikethrough(int i, QVector<Token> tokens);
MatchResponse matchCode(int i, QVector<Token> tokens);
MatchResponse matchLink(int i, QVector<Token> tokens);
MatchResponse matchStyle(int i, QVector<Token> tokens);

MatchResponse matchSegment(int i, QVector<Token> tokens);
MatchResponse matchMarkdown(int i, QVector<Token> tokens);

QVector<ASTNode> normalizeTextNodes(QVector<ASTNode> nodes);
QString stringifyNode(ASTNode node);

}  // namespace chatterino::ast
