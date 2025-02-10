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
    auto *view = new GeneralPageView;
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
    layout.addCheckbox("Show placeholder in text input box (requires restart)",
                       s.showTextInputPlaceholder);
    layout.addCheckbox("Gray-out recent messages", s.grayOutRecents, false,
                       "Gray-out recent messages");
    layout.addCheckbox("Convert #text to channel links", s.channelLinks, false,
                       "Gray-out recent messages");

    layout.addTitle("Miscellaneous");
    layout.addCheckbox("Fake messages as webchat", s.fakeWebChat);
    layout.addCheckbox("Use bot limits for messages", s.useBotLimitsMessage);
    layout.addCheckbox("Use bot limits for JOINs", s.useBotLimitsJoin);
    layout.addCheckbox(
        "Enable. Required for abnormal nonce and webchat detection to work!",
        s.nonceFuckeryEnabled);
    layout.addCheckbox("Abnormal nonce detection", s.abnormalNonceDetection);
    layout.addCheckbox("Webchat detection. Highlights messages sent from "
                       "webchat in color specified below.",
                       s.normalNonceDetection);
    layout.addColorButton("Webchat detected color",
                          QColor(getSettings()->webchatColor.getValue()),
                          getSettings()->webchatColor);
    layout.addCheckbox("Watching tab live sound", s.watchingTabLiveSound);
    layout.addCheckbox("Auto detach watching tab (~10s timeout)",
                       s.autoDetachLiveTab);
    layout.addCheckbox("Markdown parsing (Experimental)", s.markdownParsing);

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
