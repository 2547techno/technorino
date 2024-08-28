#pragma once

#include "common/network/NetworkRequest.hpp"
#include "providers/twitch/TwitchEmotes.hpp"

#include <QJsonArray>
#include <QJsonObject>

#include <functional>

namespace chatterino {

using IvrFailureCallback = std::function<void()>;
template <typename... T>
using ResultCallback = std::function<void(T...)>;

struct IvrSubage {
    const bool isSubHidden;
    const bool isSubbed;
    const QString subTier;
    const int totalSubMonths;
    const QString followingSince;

    IvrSubage(const QJsonObject &root)
        : isSubHidden(root.value("statusHidden").toBool())
        , isSubbed(!root.value("meta").isNull())
        , subTier(root.value("meta").toObject().value("tier").toString())
        , totalSubMonths(
              root.value("cumulative").toObject().value("months").toInt())
        , followingSince(root.value("followedAt").toString())
    {
    }
};

struct IvrResolve {
    const bool isPartner;
    const bool isAffiliate;
    const bool isBot;
    const bool isStaff;
    const bool isExStaff;

    IvrResolve(QJsonArray arr)
        : isPartner(arr.at(0)
                        .toObject()
                        .value("roles")
                        .toObject()
                        .value("isPartner")
                        .toBool())
        , isAffiliate(arr.at(0)
                          .toObject()
                          .value("roles")
                          .toObject()
                          .value("isAffiliate")
                          .toBool())
        , isBot(arr.at(0).toObject().value("verifiedBot").toBool())
        , isStaff(arr.at(0)
                      .toObject()
                      .value("roles")
                      .toObject()
                      .value("isStaff")
                      .toBool())
        , isExStaff(!arr.at(0)
                         .toObject()
                         .value("roles")
                         .toObject()
                         .value("isStaff")
                         .isNull() &&
                    !arr.at(0)
                         .toObject()
                         .value("roles")
                         .toObject()
                         .value("isStaff")
                         .toBool() &&
                    !arr.at(0).isUndefined())
    {
    }
};

struct IvrEmoteSet {
    const QString setId;
    const QString displayName;
    const QString login;
    const QString channelId;
    const QString tier;
    const QJsonArray emotes;

    IvrEmoteSet(const QJsonObject &root)
        : setId(root.value("setID").toString())
        , displayName(root.value("channelName").toString())
        , login(root.value("channelLogin").toString())
        , channelId(root.value("channelID").toString())
        , tier(root.value("tier").toString())
        , emotes(root.value("emoteList").toArray())

    {
    }
};

struct IvrEmote {
    const QString code;
    const QString id;
    const QString setId;
    const QString url;
    const QString emoteType;
    const QString imageType;

    explicit IvrEmote(const QJsonObject &root)
        : code(root.value("code").toString())
        , id(root.value("id").toString())
        , setId(root.value("setID").toString())
        , url(TWITCH_EMOTE_TEMPLATE.arg(this->id, u"3.0"))
        , emoteType(root.value("type").toString())
        , imageType(root.value("assetType").toString())
    {
    }
};

struct IvrModVip {
    const QJsonArray mods;
    const QJsonArray vips;

    IvrModVip(const QJsonObject &root)
        : mods(root.value("mods").toArray())
        , vips(root.value("vips").toArray())
    {
    }
};

class IvrApi final
{
public:
    // https://api.ivr.fi/v2/docs/static/index.html#/Twitch/get_twitch_subage__user___channel_
    void getSubage(QString userName, QString channelName,
                   ResultCallback<IvrSubage> resultCallback,
                   IvrFailureCallback failureCallback);

    // https://api.ivr.fi/v2/docs/static/index.html#/Twitch/get_twitch_user
    void getUserRoles(QString userName,
                      ResultCallback<IvrResolve> resultCallback,
                      IvrFailureCallback failureCallback);

    // https://api.ivr.fi/v2/docs/static/index.html#/Twitch/get_twitch_emotes_sets
    void getBulkEmoteSets(QString emoteSetList,
                          ResultCallback<QJsonArray> successCallback,
                          IvrFailureCallback failureCallback);

    // https://api.ivr.fi/v2/docs/static/index.html#/Twitch/get_twitch_founders__login_
    void getFounders(QString channelName,
                     ResultCallback<QJsonArray> resultCallback,
                     IvrFailureCallback failureCallback);

    // https://api.ivr.fi/v2/docs/static/index.html#/Twitch/get_twitch_modvip__channel_
    void getModVip(QString channelName,
                   ResultCallback<IvrModVip> resultCallback,
                   IvrFailureCallback failureCallback);

    void getMods2807Tools(QString channelName,
                          ResultCallback<QJsonArray> resultCallback,
                          IvrFailureCallback failureCallback);

    void getVips2807Tools(QString channelName,
                          ResultCallback<QJsonArray> resultCallback,
                          IvrFailureCallback failureCallback);

    static void initialize();

    IvrApi() = default;

    IvrApi(const IvrApi &) = delete;
    IvrApi &operator=(const IvrApi &) = delete;

    IvrApi(IvrApi &&) = delete;
    IvrApi &operator=(IvrApi &&) = delete;

private:
    NetworkRequest makeRequest(QString url, QUrlQuery urlQuery);
    NetworkRequest makeRequest2807Tools(QString url, QUrlQuery urlQuery);
};

IvrApi *getIvr();

}  // namespace chatterino
