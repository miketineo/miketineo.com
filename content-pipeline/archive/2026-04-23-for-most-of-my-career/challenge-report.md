# Challenge Report: 2026-04-23-for-most-of-my-career

## Claims Identified

### Claim 1: "For most of my career I confused 'I should open-source my side projects' with 'I should contribute to other people's open-source projects.' These are not the same thing, and conflating them cost me fifteen years."
**Rating:** PLAUSIBLE

**Supporting evidence:**
- This is framed as personal experience, so it's unfalsifiable as autobiography. The underlying conflation is real-world: open-source guides (firsttimersonly.com, opensource.guide, First Contributions) overwhelmingly frame "getting into open source" as contributing *to* existing projects, which plausibly primes that mental model.
- 63.9% of developers in the Stack Overflow survey report some OSS contribution activity, and the public conversation tilts heavily toward "how to make your first contribution to X" rather than "how to start X."

**Counter-evidence:**
- The "cost me fifteen years" framing assumes counterfactual productivity that you can't prove. Plenty of developers in that same fifteen-year window were happily starting their own repos (npm alone went from ~50k packages in 2014 to >2M by 2023) without any AI tooling. The friction you describe wasn't universal — a large cohort was shipping the whole time. Attributing the gap to "conflation" rather than to personal preference, taste, or competing priorities is a just-so story.
- The author specifically rules out imposter syndrome as the cause later in the essay, but the research (arxiv 2312.03966: 52.7% of software engineers experience frequent-to-intense impostor feelings; Blind survey: 58%) suggests imposter-adjacent dynamics are the median experience, not an outlier. Dismissing it may be self-protective rather than accurate.

**Reframe suggestion:** "For a long time my mental model of 'doing open source' was shaped by the contributor-funnel narrative in first-OSS guides. I took that as the only on-ramp and didn't seriously consider that publishing my own small repos was the easier door." This keeps the observation and drops the fifteen-year causal claim that you can't defend.

---

### Claim 2: "Contributing to established open source is hard in ways that have nothing to do with code."
**Rating:** GROUNDED

**Supporting evidence:**
- Steinmacher et al.'s systematic review ("Barriers Faced by Newcomers to Open Source Projects") identifies 58 barriers across six categories — cultural differences, reception issues, orientation, documentation problems, and social contacts — most of which are non-code.
- The ACM ESEC/FSE 2023 paper ("Do CONTRIBUTING Files Provide Information about OSS Newcomers' Onboarding Barriers?") found 52% of projects' CONTRIBUTING files miss at least 3 of 6 documented newcomer barriers; 84% miss at least 2. Information about task selection and community communication — the two most common barriers — is absent in >75% of projects.

**Counter-evidence:**
- This framing treats the friction as a bug. Maintainers would call it a feature: the barriers filter out low-signal contributions. With AI slop now real (Coolify receiving 120+ AI-generated slop PRs/month per The Register Feb 2026; curl ending its bug bounty program over AI-generated reports), those CONTRIBUTING.md walls are the thing keeping maintainers afloat. The essay sympathizes with maintainers ("their patience is a finite resource") but doesn't grapple with the fact that the friction you experienced is actively good for the ecosystem — and that lowering it is part of what's producing the current slop crisis.

---

### Claim 3: "chmoji ... is the first thing I've shipped publicly in a long time. I built it in one evening with Claude Code."
**Rating:** GROUNDED (as autobiography)

**Supporting evidence:**
- Unfalsifiable personal claim. Repo is at github.com/miketineo/chmoji per the text; the evening-build is consistent with reported average time savings (3.6 hrs/week, 30–75% task-level time compression per the 2026 AI coding stats compilations).

**Counter-evidence:**
- Calling chmoji a "plugin" is a stretch worth being honest about — there's an existing pschmitt/emoji-fzf.zsh plugin that already does "fzf emoji picker for zsh" and has for years. The novelty is the auto-trigger-on-colon behavior, not the picker itself. If the essay's grounding example is positioned as a first-of-its-kind ship, the reader who greps for five seconds will find prior art and trust drops. Better to name the prior art and explain what's different.

---

### Claim 4: "The unlock wasn't getting over some kind of imposter syndrome. It was realizing I could just start my own repo."
**Rating:** SPECULATIVE

**Supporting evidence:**
- Self-report. Internally coherent with the narrative.

**Counter-evidence:**
- Dismissing imposter syndrome without interrogation is itself a tell. The academic data (52.7% of SWEs experience frequent-to-intense impostor feelings; 88% per HubSpot's survey; Stack Overflow Blog 2023 long-form piece treating it as pervasive) suggests imposter dynamics are the water most devs swim in. The thing you're describing — "I could just start my own repo" — is the *realization* that maps onto impostor-phenomenon research almost perfectly (attributing success to luck, feeling like you need permission, avoiding public exposure). Calling it something else doesn't make it something else.
- There's also a simpler alternative explanation the essay doesn't consider: *time and taste*. A zsh plugin that makes `:tada:` expand via ZLE is a small, well-scoped, opinion-heavy tool. A lot of developers ship those routinely with or without AI. The "unlock" may be "I picked a small enough project" rather than "I reframed open source."

**Reframe suggestion:** "Whatever label you want to put on it — imposter syndrome, permission-seeking, perfectionism — the thing that changed was realizing I could just start my own repo." Lets you keep the beat without making a contested psychological claim.

---

### Claim 5: "the friction that used to keep my side projects in ~/hack/ has dropped a lot, and I don't think the dropping is entirely about me."
**Rating:** PLAUSIBLE

**Supporting evidence:**
- GitHub Octoverse 2025: 36M new developers in a year, 630M total repos, TypeScript surging 66% tied to AI-assistant affordances. That's a real substrate shift.
- Developer surveys: 76% of devs use or plan to use AI coding tools; 51% daily usage among professionals. That's the closest available data to "friction has dropped broadly."

**Counter-evidence:**
- "Dropped a lot" also produced: 42% of companies abandoning most AI initiatives in 2025 (double 2024's rate); an estimated 8,000 of 10,000 vibe-coded startups now needing rescue engineering at $50k–$500k per rebuild; GitClear's finding that code churn is up 39% and refactored code is down 60% in AI-heavy codebases. Friction didn't drop — some of it just moved downstream, where it will hit the maintainer, not the shipper. Your 60-line plugin won't feel that, but the generalization to "your three or four private repos" might not survive six-month maintenance contact with a user base.
- The shiftmag.dev piece ("93% of Developers Use AI. Why Is Productivity Only 10%?") summarizes the productivity-paradox literature: adoption is near-universal, end-to-end productivity gains are small and sometimes negative. That's in tension with the essay's implicit framing that shipping just got cheap.

---

### Claim 6: "Polish stopped being a second project. ... I got the 60-line prototype, the Homebrew tap, the auto-bump GitHub Action, and the social-preview card in one sitting."
**Rating:** GROUNDED (as a personal event) / PLAUSIBLE (as a generalization)

**Supporting evidence:**
- Claude Code / Copilot reporting consistently cites compression of the "peripheral artifact" workload (READMEs, workflows, release notes) — the Every.to piece ("How I Use Claude Code to Ship Like a Team of Five"), the MindStudio comparison, and the DEV Community week-with-Claude-Code post all describe this specific pattern.

**Counter-evidence:**
- "Polish stopped being a second project" conflates *producing* polish with *maintaining* polish. The Homebrew tap, auto-bump Action, and social card are now four systems you own. In six months you'll get a deprecation warning on `actions/cache@v3`, your formula will break on a Homebrew core bump, and the social card template will be out of date. The essay frames shipping as the finish line. For an ecosystem-facing package it's the start line. The Jeff Geerling piece ("AI is destroying Open Source") is specifically about this — the cost of publication has collapsed while the cost of maintenance hasn't, and the imbalance is landing on maintainers.
- This is worth calling out in the draft rather than leaving implicit: an evening ship is the prototype equivalent, not the full-lifecycle equivalent. Otherwise you're writing aspirational copy that sets readers up to ship ten chmojis and maintain zero.

---

### Claim 7: "The internal critic got quieter. Claude doesn't flinch at weird taste decisions. It doesn't ask me if someone's already built this."
**Rating:** PLAUSIBLE

**Supporting evidence:**
- Consistent with reported user experience. The removal of a human audience before the shipping gate is a real phenomenological change.

**Counter-evidence:**
- "Claude doesn't ask me if someone's already built this" is presented as a feature. It's also exactly why prior-art checks are now the user's responsibility and why the GitHub ecosystem is clogged with duplicates (see: the existing `pschmitt/emoji-fzf.zsh` your chmoji largely overlaps with, per search results). The "quieter critic" is the same mechanism producing "AI slop" at ecosystem scale — the filter that used to say *wait, is this worth doing?* is the one that got silenced. For a zsh plugin, that's fine. As a general claim about shipping more, it's the argument Jeff Geerling, curl maintainers, and GitHub's anti-slop working group are pushing back on.

---

### Claim 8: "Failing out loud became cheap. ... With Claude the cost of 'never mind' is effectively zero."
**Rating:** PLAUSIBLE

**Supporting evidence:**
- Iteration cycles on AI-assisted tasks are measurably shorter. The MIT Tech Review 2025 piece and the Faros.ai 2026 review both describe "try-throw-away-retry" as a dominant new workflow.

**Counter-evidence:**
- "Effectively zero" is doing a lot of lifting. There's a tokens cost, an attention cost, and — from the LeadDev and InfoQ pieces on AI technical debt — a reviewing-later cost that lands on future-you. The arxiv paper 2510.10165 ("AI-Assisted Programming Decreases the Productivity of Experienced Developers by Increasing the Technical Debt and Maintenance Burden") specifically argues that the "cheap iteration" framing underweights the compounding downstream cost. For a README GIF you hated and deleted — sure, zero. For code decisions you iterated through and merged — not zero, just deferred.

---

### Claim 9: "If you have three or four private repos you think nobody wants, the friction that kept them private has probably dropped a lot. Ship the one you're least embarrassed about this week."
**Rating:** SPECULATIVE

**Supporting evidence:**
- Follows from the earlier claims if those hold.

**Counter-evidence:**
- This is the essay's load-bearing universal, and it's the weakest one. "Ship it this week" advice is the exact pattern GitHub is now writing kill-switches against. The reader most likely to act on this advice is also the reader most likely to produce one of the 120+/month slop PRs Coolify gets — not because they're malicious but because the calibration the essay dismisses (imposter-syndrome-as-quality-filter, CONTRIBUTING.md-as-apprenticeship) was doing real filtering work. Telling someone "ship the one you're least embarrassed about" assumes their embarrassment is mis-calibrated upward. For some readers it is. For others it's well-calibrated and the advice makes the ecosystem worse.
- Zero evidence in the search results that lowering shipping friction leads to *better* ecosystem outcomes. The available evidence (Octoverse repo growth, AI slop surge, maintainer burnout, vibe-coding cleanup cost estimates in the $400M–$4B range) points the other way on aggregate.

**Reframe suggestion:** Ground this in audience-specific experience rather than prescription. "For me, the threshold dropped. If you've got private repos that you keep private out of polish-perfectionism rather than genuine doubt about whether they're useful, that gap is probably smaller than it used to be." Keeps the invitation, drops the universal.

---

### Claim 10: "You don't have to contribute to anyone else's project to count as contributing."
**Rating:** PLAUSIBLE

**Supporting evidence:**
- Reasonable cultural claim. The OSS community has long recognized publishing original work as a contribution (see the "maintainers" track at events like FOSDEM, the All Contributors spec categorizing creator/author roles).

**Counter-evidence:**
- "Count as contributing" is doing social-proof work that the essay doesn't interrogate. To whom does it count? For a hiring manager skimming GitHub: a maintained library someone else uses outranks ten solo repos. For your own sense of participating in OSS: sure, it counts. The essay collapses those two audiences. Worth being explicit that the claim is about self-permission, not external legibility.

---

## Overall Assessment

The essay's strongest material is the autobiographical spine: the CONTRIBUTING.md-as-apprenticeship observation (Claim 2) is backed by peer-reviewed research, and the phenomenology of AI-assisted polish (Claim 6) matches widely reported user experience. Those two beats could carry the piece.

The essay's weakest material is everything that universalizes. Claims 4, 5, 7, 8, and 9 are written as if they describe a broad shift, but the 2025–2026 evidence on AI-assisted development is sharply split: adoption is real, end-to-end productivity gains are contested (10% per shiftmag.dev synthesis, 30–75% per vendor-adjacent reports), technical debt is measurably up, and the OSS ecosystem is actively building defenses against the exact behavior the essay's CTA encourages ("ship the one you're least embarrassed about"). The dismissal of imposter syndrome in Claim 4 specifically contradicts the academic consensus you'd find on the first page of results for the term.

The single most dangerous framing is the implicit equivalence between "my 60-line zsh plugin shipped in one evening" and "your three or four private repos." A well-scoped taste-heavy tool with a clear end-state is the best-case for AI-assisted shipping; a half-finished SaaS idea, an abandoned mobile app prototype, a rewrites-of-my-blog-engine is the median case, and those are the ones that become AI slop, technical debt, or unmaintained zombie repos a year later.

**Stronger angle:** Narrow the thesis. The essay is most defensible if the claim is "AI assistants collapsed the polish-tax for small taste-heavy tools with well-documented APIs, and that category of side project now ships faster than it used to for me." Keep chmoji as the one grounded example, drop the universal prescription, and acknowledge — briefly, not defensively — that the same mechanism producing your evening ship is also producing the AI slop crisis, and the difference is taste and scope. That version of the essay is honest, interesting, and survives contact with the 2026 evidence base. The current version does not.

Sources:
- [Do CONTRIBUTING Files Provide Information about OSS Newcomers' Onboarding Barriers? (ACM ESEC/FSE 2023)](https://dl.acm.org/doi/10.1145/3611643.3616288)
- [Social Barriers Faced by Newcomers Placing Their First Contribution in OSS (ACM CSCW)](https://dl.acm.org/doi/10.1145/2675133.2675215)
- [Barriers Faced by Newcomers to Open Source Projects: A Systematic Review](https://www.researchgate.net/publication/261055914_Barriers_Faced_by_Newcomers_to_Open_Source_Projects_A_Systematic_Review)
- [AI coding is now everywhere. But not everyone is convinced. (MIT Technology Review, Dec 2025)](https://www.technologyreview.com/2025/12/15/1128352/rise-of-ai-coding-developers-2026/)
- [93% of Developers Use AI. Why Is Productivity Only 10%? (shiftmag.dev)](https://shiftmag.dev/this-cto-says-93-of-developers-use-ai-but-productivity-is-still-10-8013/)
- [AI-Assisted Programming Decreases the Productivity of Experienced Developers (arxiv 2510.10165)](https://arxiv.org/abs/2510.10165)
- [AI-Generated Code Creates New Wave of Technical Debt (InfoQ)](https://www.infoq.com/news/2025/11/ai-code-technical-debt/)
- [The Vibe Coding Delusion: Thousands of Startups Paying for AI Technical Debt (Tech Startups, Dec 2025)](https://techstartups.com/2025/12/11/the-vibe-coding-delusion-why-thousands-of-startups-are-now-paying-the-price-for-ai-generated-technical-debt/)
- [How AI generated code compounds technical debt (LeadDev)](https://leaddev.com/technical-direction/how-ai-generated-code-accelerates-technical-debt)
- [Octoverse 2025: A new developer joins GitHub every second (GitHub Blog)](https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/)
- [GitHub Data Shows AI Tools Creating "Convenience Loops" (InfoQ)](https://www.infoq.com/news/2026/03/ai-reshapes-language-choice/)
- [GitHub ponders kill switch for pull requests to stop AI slop (The Register, Feb 2026)](https://www.theregister.com/2026/02/03/github_kill_switch_pull_requests_ai/)
- [GitHub itself to blame for AI slop PRs, say devs (DevClass)](https://www.devclass.com/ai-ml/2026/02/19/github-itself-to-blame-for-ai-slop-prs-say-devs/4091420)
- [AI is destroying Open Source, and it's not even good yet (Jeff Geerling)](https://www.jeffgeerling.com/blog/2026/ai-is-destroying-open-source/)
- [Impostor Phenomenon in Software Engineers (arxiv 2312.03966)](https://arxiv.org/abs/2312.03966)
- [What we talk about when we talk about impostor syndrome (Stack Overflow Blog)](https://stackoverflow.blog/2023/09/11/what-we-talk-about-when-we-talk-about-imposter-syndrome/)
- [Survival Rate of GitHub Projects — An Empirical Study (Livable Software)](https://livablesoftware.com/survival-rate-github-projects-empirical/)
- [pschmitt/emoji-fzf.zsh (existing prior art)](https://github.com/pschmitt/emoji-fzf.zsh)
- [AI Coding Assistant Statistics 2026 (Uvik Software)](https://uvik.net/blog/ai-coding-assistant-statistics/)
