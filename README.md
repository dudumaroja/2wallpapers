# 2 Wallpapers GNOME Shell Extension

[![GNOME Version](https://img.shields.io/badge/GNOME-45%2B-blue.svg)](https://gnome.org/)
[![License](https://img.shields.io/badge/License-GPL%20v2%2B-orange.svg)](https://www.gnu.org/licenses/gpl-2.0.html)


## Description

GNOME Shell extension Concept that switches wallpapers based on desktop visibility:
- No visible windows (all minimized/none open): Wallpaper 1 (clean mode).
- One or more visible windows: Wallpaper 2 (busy mode).

Ignores minimized windows for intuitive transitions (e.g., Super+D).

## Features

- Supports GNOME 45-49.
- Settings dialog for wallpaper selection.
- Real-time updates on window changes or workspace switches.
- Image filter (JPEG, PNG, etc.).

## Requirements

- GNOME Shell 45+.
- Standard GNOME libs (Gio, Gtk, Adw, Meta).

## Installation

### Via extensions.gnome.org (Recommended)

Todo
### Manual

1. Clone repo: `git clone https://github.com/dudumaroja/2wallpapers.git`
2. Copy to extensions: `cp -r 2wallpapers@dudumaroja ~/.local/share/gnome-shell/extensions/`
3. Compile schemas: `glib-compile-schemas ~/.local/share/gnome-shell/extensions/2wallpapers@dudumaroja/schemas/`
4. Restart Shell: Alt+F2, `r` (X11) or logout/login (Wayland).
5. Enable: `gnome-extensions enable 2wallpapers@dudumaroja`

## Configuration

In "Extensions" app > Settings:
- Click buttons to select wallpapers.
- Changes apply instantly.

## Screenshots

<!-- Add images -->
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/aeda1e4c-3b17-4b2e-888c-a9f881e8dcf6" />

*Wallpaper 1.*

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/1664e98d-719c-47ba-a8f3-847286caeeb3" />

*Wallpaper 2.*

## Development

- Issues: I really dont know what i'm doing, but seens to be working as intended.. clone and mod at will
- GPL-2.0-or-later.

## License

[GNU GPL v2.0 or later](LICENSE).

## Credits

Developed by [@dudumaroja](https://github.com/dudumaroja).
