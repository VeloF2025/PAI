#!/bin/bash
# Alternative: Setup keyboard shortcuts for PAI (GNOME)
# Use this if Espanso doesn't work for your setup

set -e

PAI_LAUNCHER="$HOME/Workspace/PAI/scripts/pai-launcher.sh"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Setting up GNOME keyboard shortcuts for PAI...${NC}"

# Create .desktop file for PAI launcher
mkdir -p "$HOME/.local/share/applications"

cat > "$HOME/.local/share/applications/pai-launcher.desktop" << EOF
[Desktop Entry]
Name=PAI Launcher
Comment=Launch Claude Code with PAI protocols
Exec=gnome-terminal -- bash -c '$PAI_LAUNCHER pai; exec bash'
Icon=utilities-terminal
Terminal=false
Type=Application
Categories=Development;
EOF

cat > "$HOME/.local/share/applications/kai-launcher.desktop" << EOF
[Desktop Entry]
Name=KAI Launcher
Comment=Launch Claude Code with KAI autonomous mode
Exec=gnome-terminal -- bash -c '$PAI_LAUNCHER kai; exec bash'
Icon=utilities-terminal
Terminal=false
Type=Application
Categories=Development;
EOF

echo -e "${GREEN}Desktop entries created!${NC}"
echo ""
echo -e "${YELLOW}Manual Step Required:${NC}"
echo ""
echo "1. Open Settings → Keyboard → Keyboard Shortcuts → Custom Shortcuts"
echo "2. Add new shortcut:"
echo "   Name: PAI Launcher"
echo "   Command: gnome-terminal -- bash -c '$PAI_LAUNCHER pai; exec bash'"
echo "   Shortcut: Super+P (or your preference)"
echo ""
echo "3. Add another for KAI:"
echo "   Name: KAI Launcher"
echo "   Command: gnome-terminal -- bash -c '$PAI_LAUNCHER kai; exec bash'"
echo "   Shortcut: Super+K (or your preference)"
echo ""
echo -e "${GREEN}Or use dconf to set programmatically:${NC}"
echo ""

# Set up via dconf (GNOME)
CUSTOM_KEYBINDINGS=$(gsettings get org.gnome.settings-daemon.plugins.media-keys custom-keybindings 2>/dev/null || echo "[]")

if [[ "$CUSTOM_KEYBINDINGS" == "@as []" ]] || [[ "$CUSTOM_KEYBINDINGS" == "[]" ]]; then
    gsettings set org.gnome.settings-daemon.plugins.media-keys custom-keybindings \
        "['/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/pai/', '/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/kai/']"

    # PAI shortcut (Super+P)
    gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/pai/ name 'PAI Launcher'
    gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/pai/ command "gnome-terminal -- bash -c '$PAI_LAUNCHER pai; exec bash'"
    gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/pai/ binding '<Super>p'

    # KAI shortcut (Super+K)
    gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/kai/ name 'KAI Launcher'
    gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/kai/ command "gnome-terminal -- bash -c '$PAI_LAUNCHER kai; exec bash'"
    gsettings set org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/kai/ binding '<Super>k'

    echo -e "${GREEN}Keyboard shortcuts configured!${NC}"
    echo ""
    echo "  Super+P → PAI (standard mode)"
    echo "  Super+K → KAI (autonomous mode)"
else
    echo -e "${YELLOW}Existing custom keybindings found. Add manually via Settings.${NC}"
fi
