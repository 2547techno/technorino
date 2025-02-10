#include "messages/ast/Lexer.hpp"

#include <qobject.h>
#include <util/Variant.hpp>

namespace chatterino::ast {

QVector<Token> lex(const QString &input)
{
    QVector<Token> out;

    int i = 0;
    while (i < input.length())
    {
        switch (input.at(i).unicode())
        {
            case QChar('\\').unicode():
                if (i + 1 < input.length())
                {
                    out.append(CharToken{QString(input.at(i + 1))});
                }
                else
                {
                    out.append(CharToken{QString("\\")});
                }
                break;
            case QChar('*').unicode():
                out.append(AsterixToken{});
                break;
            case QChar('_').unicode():
                out.append(UnderlineToken{});
                break;
            case QChar('~').unicode():
                out.append(TildeToken{});
                break;
            case QChar('`').unicode():
                out.append(TickToken{});
                break;
            case QChar('[').unicode():
                out.append(LeftBracketToken{});
                break;
            case QChar(']').unicode():
                out.append(RightBracketToken{});
                break;
            case QChar('(').unicode():
                out.append(LeftParenToken{});
                break;
            case QChar(')').unicode():
                out.append(RightParenToken{});
                break;
            default:
                out.append(CharToken{QString(input.at(i))});
                break;
        }
        i++;
    }

    out.append(EndToken{});

    return out;
}

QString stringifyToken(Token token)
{
    return std::visit(variant::Overloaded{
                          [](AsterixToken) -> QString {
                              return "AsterixToken";
                          },
                          [](UnderlineToken) -> QString {
                              return "UnderlineToken";
                          },
                          [](TildeToken) -> QString {
                              return "TildeToken";
                          },
                          [](TickToken) -> QString {
                              return "TickToken";
                          },
                          [](const CharToken &token) -> QString {
                              // i have no idea why spaces are null characters, but they are...
                              if (token.data == QChar(0))
                              {
                                  return "CharToken(<space>)";
                              }

                              return std::format("CharToken({})",
                                                 token.data.toStdString())
                                  .data();
                              ;
                          },
                          [](EndToken) -> QString {
                              return "EndToken";
                          },
                          [](LeftBracketToken) -> QString {
                              return "LeftBracketToken";
                          },
                          [](RightBracketToken) -> QString {
                              return "RightBracketToken";
                          },
                          [](LeftParenToken) -> QString {
                              return "LeftParenToken";
                          },
                          [](RightParenToken) -> QString {
                              return "RightParenToken";
                          },
                      },
                      token);
}

}  // namespace chatterino::ast
