#include "widgets/settingspages/TechnorinoPage.hpp"

#include "Application.hpp"
#include "common/Literals.hpp"
#include "providers/twitch/TwitchIrcServer.hpp"
#include "singletons/CrashHandler.hpp"
#include "singletons/Fonts.hpp"
#include "singletons/NativeMessaging.hpp"
#include "singletons/Paths.hpp"
#include "singletons/Settings.hpp"
#include "util/Helpers.hpp"
#include "widgets/BaseWindow.hpp"
#include "widgets/settingspages/GeneralPageView.hpp"
#include "widgets/settingspages/SettingWidget.hpp"

#include <magic_enum/magic_enum.hpp>
#include <QDesktopServices>
#include <QFileDialog>
#include <QFontDialog>
#include <QLabel>
#include <QScrollArea>

namespace {

using namespace chatterino;
using namespace literals;

#ifdef Q_OS_WIN
const QString META_KEY = u"Windows"_s;
#else
const QString META_KEY = u"Meta"_s;
#endif

void addKeyboardModifierSetting(GeneralPageView &layout, const QString &title,
                                EnumSetting<Qt::KeyboardModifier> &setting)
{
    layout.addDropdown<std::underlying_type<Qt::KeyboardModifier>::type>(
        title, {"None", "Shift", "Control", "Alt", META_KEY}, setting,
        [](int index) {
            switch (index)
            {
                case Qt::ShiftModifier:
                    return 1;
                case Qt::ControlModifier:
                    return 2;
                case Qt::AltModifier:
                    return 3;
                case Qt::MetaModifier:
                    return 4;
                default:
                    return 0;
            }
        },
        [](DropdownArgs args) {
            switch (args.index)
            {
                case 1:
                    return Qt::ShiftModifier;
                case 2:
                    return Qt::ControlModifier;
                case 3:
                    return Qt::AltModifier;
                case 4:
                    return Qt::MetaModifier;
                default:
                    return Qt::NoModifier;
            }
        },
        false);
}
}  // namespace

namespace chatterino {

TechnorinoPage::TechnorinoPage()
{
    auto *y = new QVBoxLayout;
    auto *x = new QHBoxLayout;
    auto *view = GeneralPageView::withNavigation(this);
    this->view_ = view;
    x->addWidget(view);
    auto *z = new QFrame;
    z->setLayout(x);
    y->addWidget(z);
    this->setLayout(y);

    this->initLayout(*view);

    this->initExtra();
}

bool TechnorinoPage::filterElements(const QString &query)
{
    if (this->view_)
    {
        return this->view_->filterElements(query) || query.isEmpty();
    }
    else
    {
        return false;
    }
}

void TechnorinoPage::initLayout(GeneralPageView &layout)
{
    auto &s = *getSettings();

    layout.addTitle("Chat");
    // SettingWidget::checkbox("", s.hideModerated)->setTooltip("")->addTo(layout);
    SettingWidget::checkbox(
        "Show placeholder in text input box (requires restart)",
        s.showTextInputPlaceholder)
        ->setTooltip("Show placeholder in text input box (requires restart)")
        ->addTo(layout);
    SettingWidget::checkbox("Convert #text to channel links", s.channelLinks)
        ->setTooltip("Convert #text to channel links")
        ->addTo(layout);

    layout.addTitle("Miscellaneous");
    SettingWidget::checkbox("Fake messages as webchat", s.fakeWebChat)
        ->setTooltip("Fake messages as webchat")
        ->addTo(layout);
    SettingWidget::checkbox("Use bot limits for messages",
                            s.useBotLimitsMessage)
        ->setTooltip("Use bot limits for messages")
        ->addTo(layout);
    SettingWidget::checkbox("Use bot limits for JOINs", s.useBotLimitsJoin)
        ->setTooltip("Use bot limits for JOINs")
        ->addTo(layout);
    SettingWidget::checkbox(
        "Enable. Required for abnormal nonce and webchat detection to work!",
        s.nonceFuckeryEnabled)
        ->setTooltip("Enable. Required for abnormal nonce and webchat "
                     "detection to work!")
        ->addTo(layout);
    SettingWidget::checkbox("Abnormal nonce detection",
                            s.abnormalNonceDetection)
        ->setTooltip("Abnormal nonce detection")
        ->addTo(layout);

    layout.addTitle("Client detection");
    SettingWidget::checkbox("Client detection highlights. ",
                            s.normalNonceDetection)
        ->setTooltip("Highlights messages sent from specified clients "
                     "using the specified color below.")
        ->addTo(layout);
    SettingWidget::colorButton("Webchat color", getSettings()->webchatColor)
        ->addTo(layout);
    SettingWidget::colorButton("Android color", getSettings()->androidColor)
        ->addTo(layout);
    SettingWidget::colorButton("iOS color", getSettings()->iosColor)
        ->addTo(layout);

    SettingWidget::checkbox("Watching tab live sound", s.watchingTabLiveSound)
        ->setTooltip("Watching tab live sound")
        ->addTo(layout);
    SettingWidget::checkbox("Auto detach watching tab (~10s timeout)",
                            s.autoDetachLiveTab)
        ->setTooltip("Auto detach watching tab (~10s timeout)")
        ->addTo(layout);
    SettingWidget::checkbox("Markdown parsing (Experimental)",
                            s.markdownParsing)
        ->setTooltip("Markdown parsing (Experimental)")
        ->addTo(layout);
    layout.addStretch();

    // invisible element for width
    auto *inv = new BaseWidget(this);
    //    inv->setScaleIndependantWidth(600);
    layout.addWidget(inv);
}

void TechnorinoPage::initExtra()
{
    /// update cache path
    if (this->cachePath_)
    {
        getSettings()->cachePath.connect(
            [cachePath = this->cachePath_](const auto &, auto) mutable {
                QString newPath = getApp()->getPaths().cacheDirectory();

                QString pathShortened = "Current location: <a href=\"file:///" +
                                        newPath + "\">" +
                                        shortenString(newPath, 50) + "</a>";

                cachePath->setText(pathShortened);
                cachePath->setToolTip(newPath);
            });
    }
}

}  // namespace chatterino
