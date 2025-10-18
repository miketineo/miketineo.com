#!/bin/bash

# archive-content.sh
# Archives published content (brief, draft, newsletter) after publication

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the script's directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Paths
BRIEFS_DIR="$PROJECT_ROOT/content-pipeline/content-briefs"
DRAFTS_DIR="$PROJECT_ROOT/content-pipeline/drafts"
ARCHIVE_DIR="$PROJECT_ROOT/content-pipeline/archive"

# Get date pattern from user (YYYY-MM-DD or slug)
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage: ./scripts/archive-content.sh YYYY-MM-DD-topic-slug${NC}"
    echo ""
    echo "Example: ./scripts/archive-content.sh 2025-10-20-psychological-safety"
    echo ""
    echo "This will archive:"
    echo "  - content-briefs/2025-10-20-psychological-safety.md"
    echo "  - drafts/2025-10-20-psychological-safety.md"
    echo "  - drafts/newsletter-2025-10-20-psychological-safety.md"
    echo ""
    echo "To: content-pipeline/archive/2025-10-20-psychological-safety/"
    echo ""
    exit 1
fi

PATTERN="$1"

# Create archive directory for this content
ARCHIVE_PATH="$ARCHIVE_DIR/$PATTERN"
mkdir -p "$ARCHIVE_PATH"

# Track what was archived
ARCHIVED_COUNT=0

# Function to archive a file
archive_file() {
    local source="$1"
    local dest="$2"

    if [ -f "$source" ]; then
        mv "$source" "$dest"
        echo -e "${GREEN}  ✓ Archived:${NC} $(basename "$source")"
        ((ARCHIVED_COUNT++))
    fi
}

echo -e "${BLUE}Archiving content for: $PATTERN${NC}"
echo ""

# Archive content brief
archive_file "$BRIEFS_DIR/${PATTERN}.md" "$ARCHIVE_PATH/content-brief.md"

# Archive blog post draft
archive_file "$DRAFTS_DIR/${PATTERN}.md" "$ARCHIVE_PATH/blog-draft.md"

# Archive newsletter draft
archive_file "$DRAFTS_DIR/newsletter-${PATTERN}.md" "$ARCHIVE_PATH/newsletter-draft.md"

# Also check for any other files with this pattern
for file in "$DRAFTS_DIR"/*"${PATTERN}"*; do
    if [ -f "$file" ] && [ "$file" != "$DRAFTS_DIR/${PATTERN}.md" ] && [ "$file" != "$DRAFTS_DIR/newsletter-${PATTERN}.md" ]; then
        filename=$(basename "$file")
        archive_file "$file" "$ARCHIVE_PATH/$filename"
    fi
done

echo ""
if [ $ARCHIVED_COUNT -eq 0 ]; then
    echo -e "${RED}No files found to archive for pattern: $PATTERN${NC}"
    echo ""
    echo "Make sure the content exists in:"
    echo "  - $BRIEFS_DIR/${PATTERN}.md"
    echo "  - $DRAFTS_DIR/${PATTERN}.md"
    echo "  - $DRAFTS_DIR/newsletter-${PATTERN}.md"
    echo ""
    exit 1
else
    echo -e "${GREEN}✓ Archived $ARCHIVED_COUNT file(s) to:${NC}"
    echo "  $ARCHIVE_PATH"
    echo ""
    echo -e "${BLUE}Contents:${NC}"
    ls -1 "$ARCHIVE_PATH" | sed 's/^/  /'
    echo ""
    echo -e "${BLUE}Note:${NC} The published blog post remains in blog/posts/"
    echo ""
fi
