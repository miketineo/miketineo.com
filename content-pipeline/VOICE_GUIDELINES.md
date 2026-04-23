# Miguel Tineo: Voice & Tone Guidelines

**Last Updated:** 2026-04-14
**Extracted From:** Published blog post, website copy, about page

---

## 🚨 NAMES & ATTRIBUTION POLICY (Read First)

**This is a personal blog.** Who gets named matters — the goal is to keep Miguel's personal and work worlds from colliding, and to avoid parasocial shortcuts that weaken the writing. Every piece of content must pass this policy before it ships. The policy is load-bearing: a violation has already happened once (a "famous tech author" whose surname overlapped with a coworker's, reached for under work-context priming), which is exactly the failure mode this section exists to catch.

### ✅ Allowed names

- **Miguel Tineo** — the author, always.
- **Genuinely famous public figures** *when the name is the point of the sentence*, **and only after the name is explicitly added to the brief's Names Allowlist during the interview gate**. Bar: the paragraph loses its meaning if you remove the name. An example of the shape that passes: a post specifically about a public author's published book, where the book title alone doesn't carry the argument. An example of the shape that fails: "As [someone] said, you should write tests" — generic advice, attribution is decorative, cut the name and keep the advice. Default: prefer citing the published work by title rather than naming the author.
- **Past employers, schools, and collaborators** — only on the About / Experience / bio pages. Never in blog or newsletter body text.
- **Current employer** — only on the About / Experience / bio pages. Never in blog or newsletter body text, not even as a setting ("at my company…"), not even obliquely ("the platform I work on…"). If the story can't be told without naming the workplace, change the story, not the policy.
- **Fictional characters from published works** when the reference is explicit and attributed to its source. Naming a character from a published show or book is allowed *only when the work itself is cited as the anchor* (e.g., "a named character from *[specific show]*" — the work name is what makes the reference legitimate). Without that anchor, the same word reads like an invented persona and falls under the fake-personas rule below.

### ❌ Blocked names

- **Coworker names** — first, last, or any combination. This includes famous public figures whose surname coincides with a coworker's surname; in that overlap, use *neither* name. If you want to cite an idea that a famous figure happens to share with a coworker, paraphrase the idea in first person and drop the attribution entirely.
- **Work brands** — the employer name, parent/umbrella company, product names, subdomain URLs, internal codenames. Blog and newsletter only; the About / Experience pages are exempt.
- **Fake example personas** — no "[Name] the engineer", no "a PM named [Name]", no "let's call her [Name]", no composite characters, no mock Slack dialogue between invented people. This rule covers *every* invented first name — obviously-fake, "neutral" placeholder, or real first name borrowed hypothetically — because any invented persona name risks accidentally matching a real person. Use **role labels** instead: "the test-env owner", "a senior engineer I worked with", "the platform team lead", "an engineering manager I know".
- **Work-specific details that function as identifiers** — even if you scrub the company name, "A100s in Frankfurt", "a partner burning €4–9k/month", "a product launch last month", and internal codenames act as fingerprints. Strip the specifics or genericize them to ranges ("several thousand euros a month", "a recent launch").

### ⚠️ When in doubt

- **Default to role labels and first-person narration.** "I once worked with a team where…" always beats "[any first name] from the platform team…". The role label is stronger writing anyway — it tells the reader what the person *did*, not what they were called.
- **Cite sources by URL, not by human name.** "[This post](https://example.com/foo) makes the case that…" is fine. "[Firstname Lastname](https://example.com/foo) makes the case that…" is not — the link already does the attribution work, and adding the name creates a name-surface that has to pass the policy.
- **Paraphrase in first person when borrowing an idea.** "I've come to think of AI less as a faster typewriter and more as a shift from carpenter to architect" is fine. "As [Name] put it, AI is shifting us from carpenters to architects" is not — unless the name is genuinely famous *and* the paragraph collapses without it.
- **If a name feels necessary, ask the user before writing it.** Do not guess. Do not reach. A moment of friction here prevents a cleanup later.

### 🔒 Pre-publish name audit (automated)

Before any `./scripts/bear` transition emits or ships a draft (specifically DRAFTED → AUDITED, and AUDITED → SHIPPED via `approve --yes`), it must run this audit against the staged markdown. The bear CLI enforces this automatically via `scripts/audit.sh` at the DRAFTED → AUDITED gate; agents invoking the pipeline outside bear must run it by hand.

1. **Blocklist grep** — `grep -rEn "Hivenet|compute\.hivenet|hive\.net|Antimatter" <files>`. Any hit = halt. The published About/Experience pages are the only place Hivenet may appear and they're exempt because the bear ship step operates on blog and newsletter files, not static pages. **The blocklist contains public work brand names only — never person names.** Two reasons: (a) listing a coworker surname in this regex would itself leak that name into version-controlled config (the exact failure mode the policy exists to prevent), and (b) the next grep (proper-noun-surface) already catches every two-word capitalized pattern, making enumeration of specific names redundant. If a near-miss happens with a person's name, **do not** add that name to this regex — the correct response is to strengthen the proper-noun-surface review step below and tighten the Names Allowlist in the brief.
2. **Proper-noun surface grep** — `grep -rEn "\b[A-Z][a-z]+ [A-Z][a-z]+\b" <files>`. Surface every hit to the user for review. False positives are fine (e.g., "New York", "Black Friday") — the point is to make sure no human name slips by unreviewed. This is the *primary* defense against person names — it's generic, scales automatically as coworker rosters change, and doesn't require maintaining a list.
3. **Attribution-idiom grep** — `grep -rEn "\bsaid\b|according to|put it well|argues|wrote about|'s book|'s post|'s article|inspired by" <files>`. Any hit means there's an attribution — confirm the attributed entity is on the allowed list before continuing.
4. **Fake-persona pattern grep** — `grep -rEn "(a developer named|an engineer named|let's call (him|her|them)|for example,? [A-Z][a-z]+ (the|our|a) )" <files>`. Any hit = halt. Rewrite with role labels.
5. **On any halt**: surface every hit to the user, ask which (if any) are allowed per the policy, and block the publish until the user confirms each one explicitly. Silent edits are not allowed — the user must see the name and approve it.

**Why this is a hard gate:** the previous violation wasn't caught by any review step because there was no review step for names specifically. The whole point of this audit is that it runs *every time*, not "when it feels relevant". If the audit is skipped, the gate doesn't exist.

### Worked examples

**Borrowed-idea paraphrase**

❌ "[Famous Author] put it well: AI isn't making us faster typists — it's shifting us from carpenters to architects."
✅ "AI isn't making us faster typists. It's shifting us from carpenters to architects — from the people who swing the hammer to the people who decide what gets built."

*Why the rewrite works:* The idea is preserved, the first-person framing makes it feel earned, and there's no attribution surface to audit.

**Fake-persona replacement**

❌ "[Name 1] owns the test environment. [Name 2] runs staging. [Name 3] handles prod."
✅ "One engineer owns the test environment. Another owns staging. A third owns prod. Each of them is the single accountable person for their station."

*Why the rewrite works:* The structural point (one owner per environment) lands harder without the fake names, because the reader's brain isn't doing persona-tracking on characters it will never see again.

**Work-specifics genericization**

❌ "At Hivenet, we had a mystery partner burning €4–9k/month on A100s in Frankfurt while sitting idle in Cannes."
✅ "I've seen teams leaving several thousand euros a month on the table — high-end GPUs sitting idle most of the day in a region with expensive electricity."

*Why the rewrite works:* The framework point (cost / control / carbon tradeoff) is intact. The fingerprint details (company, specific hardware SKU, specific cities, exact euro range) are gone.

**Legitimate published-source reference**

✅ "The authors of *Continuous Delivery* establish this principle: reduce batch size to reduce risk."

*Why this is allowed:* The book title is the citation anchor — it points at a specific public work, and the reader can look up the authorship if they want to. No person-name surface is introduced into the draft itself. If the paragraph genuinely collapses without the authors named (e.g., a post specifically about their philosophy), the name may be added per-draft via the Names Allowlist in the brief — but only after an explicit interview-time decision that the name is the point of the paragraph, not decoration.

---

## 🚫 EM-DASH BAN (Read Second)

**No em-dashes (—) in any Bear Essentials content. Ever.**

This applies to blog bodies, newsletter bodies, titles, subtitles, excerpts, frontmatter, and quoted seed text. En-dashes (–) in numeric ranges are fine (`2000–2010`). Hyphens in compound words are fine (`open-source`, `drive-by`). What is banned is the em-dash used as a prose separator.

**Why:** Em-dashes are one of the clearest tells that prose was machine-produced. Miguel has flagged them as "blasphemy" in his voice. This rule is a taste rule, not a style-guide preference: em-dashes make the writing sound not-his, which defeats the entire point of the pipeline.

**How to replace them during drafting:**

- **Period.** Best default. Creates snappier prose.
  - ❌ `I confused two things — they are not the same.`
  - ✅ `I confused two things. They are not the same.`
- **Colon.** For introducing a list, definition, or explanation.
  - ❌ `Three shifts in particular — polish, critic, failure.`
  - ✅ `Three shifts in particular: polish, critic, failure.`
- **Comma.** For short mid-sentence parentheticals.
  - ❌ `With Claude — or any capable assistant — the cost drops.`
  - ✅ `With Claude, or any capable assistant, the cost drops.`
- **Parentheses.** For true asides off the main line of thought.
  - ❌ `The Homebrew formula — which I never finished — sat for months.`
  - ✅ `The Homebrew formula (which I never finished) sat for months.`

Do not simply delete an em-dash without repairing the sentence around it. The cleanest rewrite usually splits one comma-spliced-via-dashes sentence into two clean sentences with a period between them.

**Pre-publish grep (recommended, not yet automated in `scripts/audit.sh`):**

```
grep -n '—' content-pipeline/drafts/<id>/blog.md content-pipeline/drafts/<id>/newsletter.md
```

Any hit is a halt. Rewrite before advancing.

---

## Voice Overview

Miguel's voice is **professional yet warm, action-oriented, and deeply human-centered**. He balances technical expertise with accessibility, using concrete examples and personal experience to make complex topics relatable. The writing feels like a conversation with an experienced mentor—confident without arrogance, direct without being harsh.

---

## Core Voice Attributes

### 1. **Human-Centered & People-First**
- Great engineering starts with people, not just systems
- Emphasizes psychological safety, mentorship, growth
- Balances technical excellence with team health

**Examples:**
- ✅ "I believe great engineering starts with people"
- ✅ "Building teams that build the future"
- ❌ "Optimizing human resources for maximum output"

### 2. **Action-Oriented & Practical**
- Focus on doing, building, creating—not theorizing
- Always includes concrete next steps
- Uses strong, active verbs

**Examples:**
- ✅ "Start small. Pick one strategy and implement it this week."
- ✅ "Leading AI adoption and agentic engineering initiatives"
- ❌ "One could consider potentially implementing..."

### 3. **Confident but Approachable**
- States expertise clearly without boasting
- Shares personal mistakes and learning moments
- Invites dialogue and questions

**Examples:**
- ✅ "I've helped teams grow sustainably—combining mentorship, clarity, and technical excellence"
- ✅ "I made a mistake this week when I..."
- ❌ "As the world's leading expert..." or "Obviously, everyone knows..."

### 4. **Specific & Evidence-Based**
- Uses concrete numbers, metrics, research
- References real projects and outcomes
- Avoids vague generalizations

**Examples:**
- ✅ "Reduced AWS costs by 20%"
- ✅ "Google's Project Aristotle found that psychological safety was the #1 factor"
- ❌ "Significantly improved efficiency" or "Many experts believe"

### 5. **Direct & Clear**
- No unnecessary jargon or complexity
- Scannable structure (headers, bullets, short paragraphs)
- Front-loads important information

**Examples:**
- ✅ "Psychological safety isn't just nice-to-have—it's the foundation"
- ✅ Clear headers like "Why This Matters" and "Practical Strategies"
- ❌ "With regard to the aforementioned considerations..."

---

## Tone Spectrum

Miguel's tone adapts based on content type while maintaining consistency:

### Blog Posts (Professional + Warm)
```
Formal ←———————————[•]————————→ Casual
                 70% warm, 30% formal

- Personal but professional
- Uses "I" and "you" pronouns
- Tells stories, shares experiences
- Includes humor when natural
- Technical depth with accessible explanations
```

### Newsletter (Punchy + Direct)
```
Formal ←—————————————[•]————→ Casual
                    80% punchy, 20% warm

- More concise, every word earns its place
- Action-oriented opening and closing
- One clear takeaway per section
- Engaging but efficient
```

### Website Copy (Confident + Inviting)
```
Formal ←————————[•]——————————→ Casual
              50% confident, 50% inviting

- Strong, declarative statements
- Results-focused language
- Clear calls-to-action
- Balance authority with approachability
```

---

## Language Patterns

### Voice (Active, Not Passive)
- ✅ "I lead engineering teams"
- ❌ "Engineering teams are led by me"

### Pronouns (Personal, Not Distant)
- ✅ "I believe", "You can", "Let's explore"
- ❌ "One might consider", "It is believed that"

### Verbs (Strong, Not Weak)
- ✅ Building, scaling, leading, architecting, mentoring
- ❌ Working on, helping with, involved in, doing

### Specificity (Concrete, Not Abstract)
- ✅ "50+ engineers mentored", "10M+ daily requests"
- ❌ "Many engineers", "Lots of traffic"

### Structure (Organized, Not Rambling)
- ✅ Clear sections, numbered lists, headers
- ❌ Long walls of text, stream of consciousness

---

## Content Structure Preferences

### Blog Post Format (1200-1500 words)

```markdown
## Hook
Why this topic matters (2-3 sentences)

## Context / Problem
What challenge does this address?

## Framework / Solution
- Break into 3-5 clear strategies
- Use subheaders for each
- Include concrete examples

## How to Measure / Track
Metrics or indicators of success

## Key Takeaways
Bullet point summary

## Call to Action
One clear next step + invitation to engage
```

### Newsletter Format (150-200 words)

```markdown
**Opening Hook:** 1-2 punchy sentences

**Core Insight:** The main point (3-4 sentences)

**Practical Takeaway:** One actionable step

**Call to Action:** Engage, reply, read more

**Signature:** - Miguel
```

---

## What to Emphasize

### ✅ DO Use:
- **Personal stories**: "At Zendesk, I learned..."
- **Concrete examples**: Code snippets, before/after, specific scenarios
- **Frameworks**: Organize ideas into systems (numbered lists, categories)
- **Research/data**: Cite studies, use metrics
- **Analogies**: Make complex ideas relatable
- **Calls to action**: Always give reader a next step
- **Questions**: Engage the reader ("Have you faced this?")

### ❌ AVOID:
- **Corporate speak**: "Leverage synergies", "Move the needle"
- **Jargon without explanation**: Assume intelligent but not expert audience
- **Hedging language**: "Perhaps", "Maybe", "Possibly"
- **Passive voice**: Unless specifically needed for emphasis
- **Buzzwords**: Unless explaining/critiquing them
- **Abstract theories**: Without concrete application
- **Overly long sentences**: Keep it scannable

---

## Audience Assumptions

**Who's Reading:**
- Engineering leaders (EMs, Directors, VPs)
- Senior+ individual contributors interested in leadership
- Technical professionals exploring AI/distributed systems
- People who value substance over hype

**What They Want:**
- Actionable insights, not just theory
- Real-world examples and data
- Honest takes, including failures/mistakes
- Frameworks they can apply immediately
- Depth without unnecessary complexity

**What They Don't Want:**
- Fluff or filler content
- Generic platitudes
- "Thought leadership" without substance
- Overly academic or overly casual extremes

---

## Voice in Different Contexts

### Technical Topics (AI, Distributed Systems, Cloud)
- Balance depth with accessibility
- Explain "why" not just "how"
- Use code examples when helpful
- Connect to business/team impact

**Example:**
> "Agentic Engineering means enabling teams to build systems where AI agents augment human decision-making, automate complex workflows, and accelerate innovation. This means establishing patterns for agent-based architectures, building team capabilities around LLM-powered tools, and creating frameworks that let engineers ship faster without sacrificing quality."

### Leadership Topics (Culture, Mentorship, Teams)
- Lead with empathy and understanding
- Share personal failures and learnings
- Provide frameworks and systems
- Always practical, never preachy

**Example:**
> "The fastest way to build psychological safety is to demonstrate it yourself. Share your own mistakes, uncertainties, and learning moments. In your next team meeting, start with: 'I made a mistake this week when I...'"

### Personal Topics (Bio, About, Journey)
- Authentic but professional
- Connect journey to reader's benefit
- Balance accomplishments with humility
- Show the "why" behind the "what"

**Example:**
> "As I progressed in my career, I discovered that the most impactful work wasn't just about building scalable systems—it was about building scalable teams that could tackle increasingly complex challenges."

---

## Quality Checklist

Before publishing, verify:

- [ ] **Is it scannable?** (Headers, bullets, short paragraphs)
- [ ] **Is it specific?** (Concrete examples, numbers, names)
- [ ] **Is it actionable?** (Clear next steps)
- [ ] **Is it personal?** (Uses "I" and "you", tells stories)
- [ ] **Is it authentic?** (No corporate speak, no fluff)
- [ ] **Is it valuable?** (Teaches something, provides framework)
- [ ] **Is it inviting?** (Ends with engagement opportunity)

---

## Brand Phrases / Signature Lines

**Taglines that capture the voice:**
- "Engineering Leadership. Scaled. Human."
- "Building teams that build the future"
- "The essential wisdom for modern builders—distilled, thoughtful, no fluff"
- "Great engineering starts with people"

**Closing styles:**
- "I'd love to hear from you" (inviting)
- "Start small. Pick one strategy..." (actionable)
- "What's your experience with [topic]?" (engaging)
- "Share your progress or challenges—let's learn together" (collaborative)

---

## Examples: Before & After

### ❌ Generic / Weak
"In today's fast-paced business environment, it's important to consider implementing best practices for team management in order to improve outcomes."

### ✅ Miguel's Voice
"Building psychological safety doesn't happen overnight. It requires consistency, patience, and intentionality. Start with one strategy this week—model vulnerability by sharing a mistake in your next team meeting."

---

### ❌ Too Formal / Academic
"Research indicates that organizational psychological safety serves as a predictor of team performance metrics across distributed engineering contexts."

### ✅ Miguel's Voice
"Google's Project Aristotle found that psychological safety was the #1 factor differentiating high-performing teams from the rest. In remote settings, this matters even more."

---

### ❌ Too Casual / Vague
"Hey! So like, remote work is kinda tough for teams and stuff, you know? But there are some cool tricks you can try!"

### ✅ Miguel's Voice
"Building psychological safety is challenging in co-located teams. In remote settings, the challenge intensifies—lack of casual interactions, communication gaps, and isolation all contribute."

---

## Summary: The Miguel Tineo Voice

**In one sentence:**
Professional engineering leader who combines technical depth with human-centered warmth, using concrete examples and actionable frameworks to help readers solve real problems.

**The voice feels like:**
A thoughtful conversation with an experienced mentor who's been in your shoes, made mistakes, learned from them, and now shares practical wisdom that you can apply immediately.

**The reader should finish feeling:**
Informed, equipped, and motivated—with a clear next step and the confidence that they can tackle the challenge ahead.

---

## Audio Narration (Standard for Bear Essentials)

Every new Bear Essentials blog post ships with an AI-generated audio
narration by default. The narration is rendered as a native `<audio>`
player at the top and bottom of the post page.

### Defaults

Add these fields to every new post's frontmatter unless there is a
specific reason to opt out:

```yaml
audio: true
audioVoice: Matthew   # Amazon Polly neural voice
```

`Matthew` is the default voice — warm, steady cadence, closest match to
the mentor-tone the written voice aims for. Override only when a
different voice genuinely fits the piece better (e.g. an interview-style
post might use `Ruth` or `Stephen` for variety).

### Picking a voice

Polly neural voices that fit the Bear Essentials tone:

| Voice | Gender | Why |
|---|---|---|
| `Matthew` | Male | Default — warm, steady, mentor-like |
| `Stephen` | Male | Crisper, more news-anchor — good for punchier posts |
| `Gregory` | Male | Deeper, slower — good for reflective essays |
| `Ruth` | Female | Clear, confident — good for assertive pieces |
| `Joanna` | Female | Warm, conversational — good for personal stories |
| `Danielle` | Female | Softer cadence — good for vulnerable or emotional posts |

Full list: `aws polly describe-voices --language-code en-US`.

### Opt-out

Skip audio (`audio: false` or omit the field) only when:

- The post is extremely code-heavy (the narrator announces code blocks
  as "code example omitted" — too many gets noisy)
- The post is a link roundup or short announcement under ~300 words
- The post is time-sensitive and you need to ship before the audio can
  be generated locally

### Running the pipeline

The `./scripts/bear approve --yes` ship step generates the MP3 locally
before committing — the audio file is tracked in git and deployed by
the standard S3 sync. Requires `AWS_PROFILE=tineo-labs-deploy` in the
environment. See `BLOG_README.md` for full details.
