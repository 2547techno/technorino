#include "providers/IvrApi.hpp"

#include "common/network/NetworkResult.hpp"
#include "common/QLogging.hpp"

#include <QUrlQuery>

namespace chatterino {

static IvrApi *instance = nullptr;

void IvrApi::getSubage(QString userName, QString channelName,
                       ResultCallback<IvrSubage> successCallback,
                       IvrFailureCallback failureCallback)
{
    assert(!userName.isEmpty() && !channelName.isEmpty());

    this->makeRequest(
            QString("twitch/subage/%1/%2").arg(userName).arg(channelName), {})
        .onSuccess([successCallback, failureCallback](auto result) {
            auto root = result.parseJson();

            successCallback(root);
        })
        .onError([failureCallback](auto result) {
            qCWarning(chatterinoIvr)
                << "Failed IVR API Call!" << result.formatError()
                << QString(result.getData());
            failureCallback();
        })
        .execute();
}

void IvrApi::getFounders(QString channelName,
                         ResultCallback<QJsonArray> successCallback,
                         IvrFailureCallback failureCallback)
{
    assert(!channelName.isEmpty());

    this->makeRequest(QString("twitch/founders/%1").arg(channelName), {})
        .onSuccess([successCallback, failureCallback](auto result) {
            auto root = result.parseJson().value("founders").toArray();

            successCallback(root);
        })
        .onError([failureCallback](auto result) {
            qCWarning(chatterinoIvr)
                << "Failed IVR API Call!" << result.formatError()
                << QString(result.getData());
            failureCallback();
        })
        .execute();
}

void IvrApi::getModVip(QString channelName,
                       ResultCallback<IvrModVip> successCallback,
                       IvrFailureCallback failureCallback)
{
    assert(!channelName.isEmpty());

    this->makeRequest(QString("twitch/modvip/%1").arg(channelName), {})
        .onSuccess([successCallback, failureCallback](auto result) {
            auto root = result.parseJson();

            successCallback(root);
        })
        .onError([failureCallback](auto result) {
            qCWarning(chatterinoIvr)
                << "Failed IVR API Call!" << result.formatError()
                << QString(result.getData());
            failureCallback();
        })
        .execute();
}

void IvrApi::getMods2807Tools(QString channelName,
                              ResultCallback<QJsonArray> resultCallback,
                              IvrFailureCallback failureCallback)
{
    assert(!channelName.isEmpty());

    this->makeRequest2807Tools(QString("getmods/%1").arg(channelName), {})
        .onSuccess([resultCallback, failureCallback](auto result) {
            auto root = result.parseJsonArray();

            resultCallback(root);
        })
        .onError([failureCallback](auto result) {
            qCWarning(chatterinoIvr)
                << "Failed IVR API Call!" << result.formatError()
                << QString(result.getData());
            failureCallback();
        })
        .execute();
}

void IvrApi::getVips2807Tools(QString channelName,
                              ResultCallback<QJsonArray> resultCallback,
                              IvrFailureCallback failureCallback)
{
    assert(!channelName.isEmpty());

    this->makeRequest2807Tools(QString("getvips/%1").arg(channelName), {})
        .onSuccess([resultCallback, failureCallback](auto result) {
            auto root = result.parseJsonArray();

            resultCallback(root);
        })
        .onError([failureCallback](auto result) {
            qCWarning(chatterinoIvr)
                << "Failed IVR API Call!" << result.formatError()
                << QString(result.getData());
            failureCallback();
        })
        .execute();
}

void IvrApi::getUserRoles(QString userName,
                          ResultCallback<IvrResolve> successCallback,
                          IvrFailureCallback failureCallback)
{
    assert(!userName.isEmpty());

    this->makeRequest(QString("twitch/user"),
                      QUrlQuery(QString("login=%1").arg(userName)))
        .onSuccess([successCallback, failureCallback](auto result) {
            auto root = result.parseJsonArray();

            successCallback(root);
        })
        .onError([failureCallback](auto result) {
            qCWarning(chatterinoIvr)
                << "Failed IVR API Call!" << result.formatError()
                << QString(result.getData());
            failureCallback();
        })
        .execute();
}

NetworkRequest IvrApi::makeRequest(QString url, QUrlQuery urlQuery)
{
    assert(!url.startsWith("/"));

    const QString baseUrl("https://api.ivr.fi/v2/");
    QUrl fullUrl(baseUrl + url);
    fullUrl.setQuery(urlQuery);

    return NetworkRequest(fullUrl).timeout(5 * 1000).header("Accept",
                                                            "application/json");
}

NetworkRequest IvrApi::makeRequest2807Tools(QString url, QUrlQuery urlQuery)
{
    assert(!url.startsWith("/"));

    const QString baseUrl("https://tools.2807.eu/api/");
    QUrl fullUrl(baseUrl + url);
    fullUrl.setQuery(urlQuery);

    return NetworkRequest(fullUrl).timeout(5 * 1000).header("Accept",
                                                            "application/json");
}

void IvrApi::initialize()
{
    assert(instance == nullptr);

    instance = new IvrApi();
}

IvrApi *getIvr()
{
    assert(instance != nullptr);

    return instance;
}

}  // namespace chatterino
