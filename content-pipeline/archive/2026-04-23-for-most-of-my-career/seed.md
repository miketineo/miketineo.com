---
id: 2026-04-23-for-most-of-my-career
type: text
source: cli
created: 2026-04-23T18:51:56Z
word_count: 850
quality: rich
---

For most of my career I confused "I should open-source my side projects" with "I should contribute to other people's open-source projects." These are not the same thing, and conflating them cost me fifteen years.

Contributing to established open source is hard in ways that have nothing to do with code. You read the CONTRIBUTING.md and it's forty lines of rules about branch naming and commit prefixes. You read the PR template and it has a section titled "have you considered the following edge cases." You read the maintainer's response to the previous PR and it's firm, a little testy, because they've answered that exact question a hundred times. None of this is wrong — maintainers have day jobs and their patience is a finite resource — but it turns "drive-by contribution" into "apprenticeship." Most evenings I don't have apprenticeship in me. I'd read two contribution guides, close both tabs, and tell myself I'd try again when I had a longer weekend.

The unlock wasn't getting over some kind of imposter syndrome. It was realizing I could just start my own repo.

chmoji — a ~60-line zsh plugin that auto-opens an fzf emoji picker when you type ':' and quietly expands ':tada:' into the glyph — is the first thing I've shipped publicly in a long time. I built it in one evening with Claude Code. The interesting thing isn't the plugin. It's that the friction that used to keep my side projects in ~/hack/ has dropped a lot, and I don't think the dropping is entirely about me.

Three things Claude changed, none of them about speed:

Polish stopped being a second project. Before, shipping a side project meant prototyping in an evening and then spending a week staring at the README, the install path, the caveats, the edge cases — and most of the time giving up halfway. With Claude in the loop I got the 60-line prototype, the Homebrew tap, the auto-bump GitHub Action, and the social-preview card in one sitting. The work that used to die in "I'll finish it tomorrow" was done by tomorrow.

The internal critic got quieter. Claude doesn't flinch at weird taste decisions. It doesn't ask me if someone's already built this. It builds the thing I described, and if I hate it I can say "no, that's not it" and try the next thing. No audience yet = no judgment yet = things actually leave the laptop.

Failing out loud became cheap. I built a teaser GIF for the README, put it next to the real demo, and hated it immediately. I dropped it. That kind of self-correction I would have resisted if it meant redoing work someone else had done for me, or explaining to a reviewer why I changed my mind. With Claude the cost of "never mind" is effectively zero, and that lowers the threshold for shipping because the cost of being wrong midway drops with it.

The chmoji evening itself: I asked Claude to make Ghostty and tmux play nicer together, ended up yak-shaving into zsh, and we shipped a plugin plus a Homebrew tap plus release-automation in one sitting. Repo: github.com/miketineo/chmoji. Install: brew install miketineo/tap/chmoji.

What Claude helped me see, more than anything, is that I had spent fifteen years assuming "open source" meant squeezing my ideas into someone else's contribution model. It doesn't. I can start my own thing. So can you. If you have three or four private repos you think nobody wants, the friction that kept them private has probably dropped a lot. Ship the one you're least embarrassed about this week. You don't have to contribute to anyone else's project to count as contributing.

---

Direction for the draft:

- Target length: ~1000 words. Tight, closer to 1000 than 1300.
- Structure: narrative personal essay. NOT a numbered list. The three shifts flow as three paragraphs inside the narrative arc, not as bullet points.
- Thesis: AI as a confidence unlock for experienced devs who had ideas but defaulted to "I should contribute to existing projects" and got stuck in the CONTRIBUTING.md / apprenticeship barrier. chmoji is the grounding example, not the subject.
- Audience: developers with private side-project repos who conflate "open source" with "contribute to other people's open source."
- CTA: ship your OWN thing, not someone else's.

Claims to soften during drafting:
- Do not claim ZLE is the only way to build this — bash readline has bind -x which is clunkier but comparable. Focus on the confidence/shipping arc, not the technical one-upmanship.
- Soften "neither of us could have shipped alone" to "I didn't know ZLE well enough to write this in an evening without help; Claude compressed what would otherwise have been a weekend of man-page reading into a working draft I could taste-test."
- Keep the pair-programming-shape observation but keep it specific to small taste-heavy tools with well-documented APIs, not a universal claim.

Voice notes:
- First person, warm but not self-deprecating.
- One concrete anecdote per shift (README-staring, teaser-GIF-dropped, etc.)
- End with the CTA about shipping your own thing — not about chmoji.
