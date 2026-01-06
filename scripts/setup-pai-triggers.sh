#!/bin/bash
# Setup PAI System-Wide Triggers
# Installs Espanso and configures @pai/@kai triggers

set -e

PAI_DIR="${PAI_DIR:-$HOME/Workspace/PAI}"
ESPANSO_CONFIG="$HOME/.config/espanso"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  PAI Trigger Setup${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""

# Step 1: Install Espanso if not present
if ! command -v espanso &> /dev/null; then
    echo -e "${YELLOW}Installing Espanso...${NC}"

    # Download and install Espanso for Linux
    wget -q https://github.com/espanso/espanso/releases/download/v2.2.1/espanso-debian-x11-amd64.deb -O /tmp/espanso.deb
    sudo dpkg -i /tmp/espanso.deb || sudo apt-get install -f -y
    rm /tmp/espanso.deb

    echo -e "${GREEN}Espanso installed!${NC}"
else
    echo -e "${GREEN}Espanso already installed${NC}"
fi

# Step 2: Create Espanso config directory
mkdir -p "$ESPANSO_CONFIG/match"

# Step 3: Create PAI trigger configuration
echo -e "${YELLOW}Configuring PAI triggers...${NC}"

cat > "$ESPANSO_CONFIG/match/pai.yml" << 'EOF'
# PAI/KAI System-Wide Triggers
# Type @pai or @kai anywhere to launch Claude Code with PAI protocols

matches:
  # @pai trigger - opens terminal with PAI
  - trigger: "@pai"
    replace: ""
    vars:
      - name: launch
        type: shell
        params:
          cmd: |
            gnome-terminal -- bash -c '$HOME/Workspace/PAI/scripts/pai-launcher.sh pai; exec bash' &

  # @kai trigger - opens terminal with KAI (autonomous mode)
  - trigger: "@kai"
    replace: ""
    vars:
      - name: launch
        type: shell
        params:
          cmd: |
            gnome-terminal -- bash -c '$HOME/Workspace/PAI/scripts/pai-launcher.sh kai; exec bash' &

  # @pai:here - launches in current directory (for file managers)
  - trigger: "@pai:here"
    replace: ""
    vars:
      - name: launch
        type: shell
        params:
          cmd: |
            gnome-terminal --working-directory="$(pwd)" -- bash -c '$HOME/Workspace/PAI/scripts/pai-launcher.sh pai; exec bash' &
EOF

echo -e "${GREEN}PAI triggers configured!${NC}"

# Step 4: Register and start Espanso
echo -e "${YELLOW}Starting Espanso service...${NC}"

# Register espanso as a systemd service
espanso service register 2>/dev/null || true

# Start espanso
espanso start 2>/dev/null || espanso restart 2>/dev/null || true

echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  SETUP COMPLETE${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo -e "Available triggers:"
echo -e "  ${YELLOW}@pai${NC}      - Launch Claude Code with PAI protocols"
echo -e "  ${YELLOW}@kai${NC}      - Launch Claude Code with KAI (autonomous)"
echo -e "  ${YELLOW}@pai:here${NC} - Launch in current directory"
echo ""
echo -e "${GREEN}Type any trigger in ANY application to activate!${NC}"
