#include "controllers/commands/builtin/twitch/GetVIPs.hpp"

#include "Application.hpp"
#include "controllers/accounts/AccountController.hpp"
#include "controllers/commands/CommandContext.hpp"
#include "messages/MessageBuilder.hpp"
#include "providers/IvrApi.hpp"
#include "providers/twitch/api/Helix.hpp"
#include "providers/twitch/TwitchAccount.hpp"
#include "providers/twitch/TwitchChannel.hpp"
#include "providers/twitch/TwitchMessageBuilder.hpp"
#include "util/Twitch.hpp"

namespace {

using namespace chatterino;

QString formatGetVIPsError(HelixListVIPsError error, const QString &message)
{
    using Error = HelixListVIPsError;

    QString errorMessage = QString("Failed to list VIPs - ");

    switch (error)
    {
        case Error::Forwarded: {
            errorMessage += message;
        }
        break;

        case Error::Ratelimited: {
            errorMessage += "You are being ratelimited by Twitch. Try "
                            "again in a few seconds.";
        }
        break;

        case Error::UserMissingScope: {
            // TODO(pajlada): Phrase MISSING_REQUIRED_SCOPE
            errorMessage += "Missing required scope. "
                            "Re-login with your "
                            "account and try again.";
        }
        break;

        case Error::UserNotAuthorized: {
            // TODO(pajlada): Phrase MISSING_PERMISSION
            errorMessage += "You don't have permission to "
                            "perform that action.";
        }
        break;

        case Error::UserNotBroadcaster: {
            errorMessage +=
                "Due to Twitch restrictions, "
                "this command can only be used by the broadcaster. "
                "To see the list of VIPs you must use the Twitch website.";
        }
        break;

        case Error::Unknown: {
            errorMessage += "An unknown error has occurred.";
        }
        break;
    }
    return errorMessage;
}

}  // namespace

namespace chatterino::commands {

QString getVIPs(const CommandContext &ctx)
{
    if (ctx.channel == nullptr)
    {
        return "";
    }

    if (ctx.twitchChannel == nullptr)
    {
        ctx.channel->addMessage(makeSystemMessage(
            "The /vips command only works in Twitch channels"));
        return "";
    }

    auto currentUser = getApp()->accounts->twitch.getCurrent();
    if (ctx.twitchChannel->isBroadcaster() && currentUser->isAnon())
    {
        getHelix()->getChannelVIPs(
            ctx.twitchChannel->roomId(),
            [channel{ctx.channel}, twitchChannel{ctx.twitchChannel}](
                const std::vector<HelixVip> &vipList) {
                if (vipList.empty())
                {
                    channel->addMessage(makeSystemMessage(
                        "This channel does not have any VIPs."));
                    return;
                }

                auto messagePrefix = QString("The VIPs of this channel are");

                // TODO: sort results?
                MessageBuilder builder;
                TwitchMessageBuilder::listOfUsersSystemMessage(
                    messagePrefix, vipList, twitchChannel, &builder);

                channel->addMessage(builder.release());
            },
            [channel{ctx.channel}](auto error, auto message) {
                auto errorMessage = formatGetVIPsError(error, message);
                channel->addMessage(makeSystemMessage(errorMessage));
            });
    }
    else
    {
        QString target = ctx.channel->getName();
        getIvr()->getVips2807Tools(
            target,
            [channel{ctx.channel}, twitchChannel{ctx.twitchChannel},
             target](auto result) {
                if (result.isEmpty())
                {
                    channel->addMessage(makeSystemMessage(
                        "This channel does not have any VIPs."));
                    return;
                }

                QStringList vips;
                for (int i = 0; i < result.size(); i++)
                {
                    vips.append(
                        result.at(i).toObject().value("login").toString());
                }

                MessageBuilder builder;
                TwitchMessageBuilder::listOfUsersSystemMessage(
                    "The VIPs of this channel are", vips, twitchChannel,
                    &builder);
                channel->addMessage(builder.release());
            },
            [channel{ctx.channel}]() {
                channel->addMessage(
                    makeSystemMessage("Could not get VIPs list!"));
            });
    }

    return "";
}

}  // namespace chatterino::commands
