#!/bin/bash

# create-content-brief.sh
# Creates a new content brief from template with today's date

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the script's directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Paths
TEMPLATE_PATH="$PROJECT_ROOT/content-pipeline/templates/content-brief-template.md"
BRIEFS_DIR="$PROJECT_ROOT/content-pipeline/content-briefs"

# Get topic slug from user
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage: ./scripts/create-content-brief.sh topic-slug${NC}"
    echo ""
    echo "Example: ./scripts/create-content-brief.sh incident-response-leadership"
    echo ""
    exit 1
fi

TOPIC_SLUG="$1"

# Generate filename with today's date
DATE=$(date +%Y-%m-%d)
FILENAME="${DATE}-${TOPIC_SLUG}.md"
BRIEF_PATH="$BRIEFS_DIR/$FILENAME"

# Check if brief already exists
if [ -f "$BRIEF_PATH" ]; then
    echo -e "${YELLOW}Brief already exists: $BRIEF_PATH${NC}"
    echo -e "Do you want to overwrite it? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        echo "Aborted."
        exit 0
    fi
fi

# Create briefs directory if it doesn't exist
mkdir -p "$BRIEFS_DIR"

# Copy template to new brief
cp "$TEMPLATE_PATH" "$BRIEF_PATH"

# Replace YYYY-MM-DD with actual date in the file
sed -i.bak "s/YYYY-MM-DD/$DATE/g" "$BRIEF_PATH"
rm "${BRIEF_PATH}.bak"

echo -e "${GREEN}✓ Content brief created!${NC}"
echo ""
echo -e "${BLUE}File:${NC} $BRIEF_PATH"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Run content-strategy-specialist agent for interview"
echo "  2. Fill in the brief based on interview insights"
echo "  3. Pass completed brief to copy-writer agent"
echo ""
echo -e "${BLUE}Open the brief:${NC}"
echo "  code $BRIEF_PATH"
echo ""
