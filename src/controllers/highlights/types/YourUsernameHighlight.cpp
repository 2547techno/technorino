// SPDX-FileCopyrightText: 2026 Contributors to Chatterino <https://chatterino.com>
//
// SPDX-License-Identifier: MIT

#include "controllers/highlights/types/YourUsernameHighlight.hpp"

#include "Application.hpp"
#include "controllers/accounts/AccountController.hpp"
#include "controllers/highlights/HighlightCheck.hpp"
#include "controllers/highlights/HighlightResult.hpp"
#include "providers/kick/KickAccount.hpp"
#include "providers/twitch/TwitchAccount.hpp"  // IWYU pragma: keep

namespace chatterino::highlights {

HighlightCheck YourUsernameHighlight::buildCheck() const
{
    using H = std::remove_pointer_t<decltype(this)>;
    using Params = HighlightCheckParams;

    auto twitchRe = [&] -> std::optional<QRegularExpression> {
        auto user = getApp()->getAccounts()->twitch.getCurrent();
        auto name = user->getUserName();
        if (user->isAnon() || name.isEmpty())
        {
            return std::nullopt;
        }

        return QRegularExpression{
            REGEX_START_BOUNDARY % QRegularExpression::escape(name) %
                REGEX_END_BOUNDARY,
            QRegularExpression::UseUnicodePropertiesOption |
                QRegularExpression::CaseInsensitiveOption,
        };
    }();
    auto kickRe = [&] -> std::optional<QRegularExpression> {
        auto user = getApp()->getAccounts()->kick.current();
        auto name = user->username();
        if (user->isAnonymous() || name.isEmpty())
        {
            return std::nullopt;
        }

        return QRegularExpression{
            REGEX_START_BOUNDARY % QRegularExpression::escape(name) %
                REGEX_END_BOUNDARY,
            QRegularExpression::UseUnicodePropertiesOption |
                QRegularExpression::CaseInsensitiveOption,
        };
    }();

    if (!twitchRe && !kickRe)
    {
        return {};
    }

    return {
        [highlight = *this, twitchRe,
         kickRe](const Params &p) -> std::optional<HighlightResult> {
            if (p.self)
            {
                return std::nullopt;
            }

            switch (p.platform)
            {
                case MessagePlatform::AnyOrTwitch: {
                    if (!twitchRe ||
                        !twitchRe->match(p.originalMessage).hasMatch())
                    {
                        return std::nullopt;
                    }
                }
                break;
                case MessagePlatform::Kick: {
                    if (!kickRe || !kickRe->match(p.originalMessage).hasMatch())
                    {
                        return std::nullopt;
                    }
                }
                break;
            }

            return highlight.outcome.makeSimpleResult<H>();
        },
    };
}

QDebug operator<<(QDebug dbg, const YourUsernameHighlight &v)
{
    dbg.nospace() << "YourUsernameHighlight("        //
                  << "name:" << v.name               //
                  << ',' << "enabled:" << v.enabled  //
                  << ',' << "outcome:" << v.outcome  //
                  << ')';

    return dbg;
}

}  // namespace chatterino::highlights
