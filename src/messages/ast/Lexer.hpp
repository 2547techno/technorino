#pragma once

#include <boost/variant.hpp>
#include <boost/variant/detail/apply_visitor_binary.hpp>
#include <QString>
#include <QVector>

namespace chatterino::ast {

struct AsterixToken {
};
struct UnderlineToken {
};
struct TildeToken {
};
struct TickToken {
};
struct CharToken {
    QString data;
};
struct EndToken {
};
struct LeftBracketToken {
};
struct RightBracketToken {
};
struct LeftParenToken {
};
struct RightParenToken {
};

typedef std::variant<struct AsterixToken, struct UnderlineToken,
                     struct TildeToken, struct TickToken, struct CharToken,
                     struct EndToken, struct LeftBracketToken,
                     struct RightBracketToken, struct LeftParenToken,
                     struct RightParenToken>
    Token;

typedef std::variant<struct AsterixToken, struct UnderlineToken,
                     struct TildeToken>
    BoundryStyleToken;

QVector<Token> lex(QString input);
QString stringifyToken(Token token);

}  // namespace chatterino::ast
