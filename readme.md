**Recent Overview**
====================

Recent Overview is a GNOME Shell extension that sorts windows in the Activities Overview by their most recent usage. This improves workflow by making it easier to switch between the windows you've used most recently.

## Features
* Sorts windows in the GNOME overview based on last used
* Lightweight and easy to install
* Compatible with GNOME Shell versions 3.32 – 42

## Demo
![til](overview.gif)

## Installation
### 1. Clone the repository

```bash
git clone https://github.com/aabhiojha/Recent-Overview.git ~/.local/share/gnome-shell/extensions/recent_overview@aabhiojha.com
```

### 2. Restart GNOME Shell

On X11: Press <kbd>Alt</kbd> + <kbd>F2</kbd>, type `r`, and press <kbd>Enter</kbd>

On Wayland: Log out and log back in

### 3. Enable the extension

You can enable it using:

* GNOME Extensions app (recommended)
* Or run: `gnome-extensions enable recent_overview@aabhiojha.com`

## Updating

To update the extension:

```bash
cd ~/.local/share/gnome-shell/extensions/recent_overview@aabhiojha.com
git pull
```

Then reload GNOME Shell as described above.
