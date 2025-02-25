#pragma once

#include "widgets/settingspages/SettingsPage.hpp"

class QLabel;
class QCheckBox;
class QComboBox;

namespace chatterino {

class GeneralPageView;
class DescriptionLabel;
struct DropdownArgs;

class TechnorinoPage : public SettingsPage
{
    Q_OBJECT

public:
    TechnorinoPage();

    bool filterElements(const QString &query) override;

private:
    void initLayout(GeneralPageView &layout);
    void initExtra();

    QString getFont(const DropdownArgs &args) const;

    DescriptionLabel *cachePath_{};
    GeneralPageView *view_{};
};

}  // namespace chatterino
