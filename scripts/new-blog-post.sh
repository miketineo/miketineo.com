#!/bin/bash

# new-blog-post.sh
# Creates a new blog post with frontmatter template

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
POSTS_DIR="$PROJECT_ROOT/blog/posts"

# Get title slug from user
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage: ./scripts/new-blog-post.sh title-slug \"Post Title\" \"Brief excerpt\" tag1,tag2,tag3${NC}"
    echo ""
    echo "Example:"
    echo "  ./scripts/new-blog-post.sh psychological-safety \\"
    echo "    \"Building Psychological Safety in Remote Teams\" \\"
    echo "    \"Learn practical strategies for creating trust and safety in distributed engineering teams.\" \\"
    echo "    leadership,remote-work,culture"
    echo ""
    exit 1
fi

TITLE_SLUG="$1"
POST_TITLE="${2:-Untitled Post}"
EXCERPT="${3:-}"
TAGS="${4:-leadership}"

# Generate filename with today's date
DATE=$(date +%Y-%m-%d)
FILENAME="${DATE}-${TITLE_SLUG}.md"
POST_PATH="$POSTS_DIR/$FILENAME"

# Check if post already exists
if [ -f "$POST_PATH" ]; then
    echo -e "${YELLOW}Post already exists: $POST_PATH${NC}"
    echo -e "Do you want to overwrite it? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        echo "Aborted."
        exit 0
    fi
fi

# Create posts directory if it doesn't exist
mkdir -p "$POSTS_DIR"

# Convert comma-separated tags to YAML array format
IFS=',' read -ra TAG_ARRAY <<< "$TAGS"
YAML_TAGS="["
for i in "${!TAG_ARRAY[@]}"; do
    TAG_ARRAY[$i]=$(echo "${TAG_ARRAY[$i]}" | xargs) # trim whitespace
    if [ $i -eq 0 ]; then
        YAML_TAGS+="\"${TAG_ARRAY[$i]}\""
    else
        YAML_TAGS+=", \"${TAG_ARRAY[$i]}\""
    fi
done
YAML_TAGS+="]"

# Create the blog post with frontmatter
cat > "$POST_PATH" <<EOF
---
title: "$POST_TITLE"
date: $DATE
excerpt: "$EXCERPT"
tags: $YAML_TAGS
---

## Why This Matters

[Opening hook - tell a story or ask a question that draws readers in]

[Context - why is this topic important?]

## [First Key Point]

[Explanation]

[Example or evidence]

[Practical application]

## [Second Key Point]

[Explanation]

[Example or evidence]

[Practical application]

## [Third Key Point]

[Explanation]

[Example or evidence]

[Practical application]

## Measuring Progress

[How readers can track success with this approach]

## Key Takeaways

- [Takeaway 1]
- [Takeaway 2]
- [Takeaway 3]

## What's Next?

[Call to action - one specific next step]

[Invitation to engage]

---

*This post is part of a bi-weekly series on engineering leadership. [Subscribe to the newsletter](/blog/) to get the next post delivered to your inbox.*
EOF

echo -e "${GREEN}✓ Blog post created!${NC}"
echo ""
echo -e "${BLUE}File:${NC} $POST_PATH"
echo ""
echo -e "${BLUE}Details:${NC}"
echo "  Title: $POST_TITLE"
echo "  Date: $DATE"
echo "  Tags: ${YAML_TAGS}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Edit the post content"
echo "  2. Run: npm run build:blog"
echo "  3. Preview locally: python3 -m http.server 8000"
echo "  4. Commit and push to deploy"
echo ""
echo -e "${BLUE}Open the post:${NC}"
echo "  code $POST_PATH"
echo ""
