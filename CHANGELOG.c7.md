# Changelog

## Unreleased

- Minor: Added setting to disable animated 7TV badges (3bbcc9f4a01a015f93f7855be36312e56968ac5f)
- Bugfix: Paints are no longer rendered in system messages (b55e723fcea9520f47b1a6bf786a52011ffc7289)
- Bugfix: Emotes now properly use the AVIF version if it's available and supported (9776bb03d9adb0021d452eb468379f3ee27d9bd9)
- Dev(macOS): Changed CFBundleIdentifier from `com.chatterino` to `app.7tv.chatterino7` (fec0dbdf558b1e6e358971a256f5540d34bb6a8d)
- Dev: Updated Conan version used in CI to 2.4 (330d05d50ffd296b34744dbcc97290534e8cf704)
- Dev(Windows): Updated `libavif` to 1.0.4, `boost` to 1.85, and `openssl` to 3.2.2 (330d05d50ffd296b34744dbcc97290534e8cf704)
- Dev(macOS): A single universal app is now released for macOS (#274, #279)
- Dev: Refactored paints to avoid creation of intermediate widgets (#277)
- Dev(macOS): The minimum required macOS version is now 13.0 Ventura (5e4a9c54e1ef369bb033ab32759019d324c03c85)
- Dev: The client version is now sent through URL parameters to the 7TV EventAPI - previously, this was only sent in the `User-Agent` (1ad27c58fa4745cabf0358055df11be05cfe659a)
