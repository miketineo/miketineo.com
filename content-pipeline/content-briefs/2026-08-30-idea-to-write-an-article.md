# Content Brief: The Cost We Couldn't Forecast

**Seed ID:** 2026-08-30-idea-to-write-an-article
**Date Created:** 2026-08-30
**Target Publish Date:** 2026-09-13
**Content Type:** Blog Post + Newsletter

---

## Overview

**Topic:** Why organizations budgeted AI on the wrong variable, and what that miscalculation costs the people doing the work.

**Angle/Hook:** The author runs AI adoption for a living and is a believer. That is exactly why the piece is worth reading: skeptics counting costs is expected, builders counting them is useful. The specific reframe is that AI's unit price is public and falling, while the unit *quantity* is unforecastable, because agentic workloads consume tokens as a function of task difficulty and retry depth rather than headcount. Success and overspend are the same curve. The essay leads with the concrete operational story and earns the philosophical turn in the final third, inverting the seed's original "very philosophical" instruction.

**Target Audience:** Engineering leaders (Directors, VPs, staff-plus ICs with budget influence) at companies 18 to 36 months into AI tooling adoption, who are now being asked to justify a line item that behaves nothing like the software line items around it.

**Word Counts:**
- Blog Post: 1200-1500 words
- Newsletter: 150-200 words

---

## Key Message

AI spend was budgeted like software (a known per-seat, per-year quantity) but behaves like a meter, and the meter runs faster the more useful the tools become. Nobody is counting the full bill in either direction: not the spend that scales with adoption success, and not the review capacity and judgment being consumed to pay for it.

This message rests on the author's first-hand operational experience (mechanism-level, not figure-level) and on the published, verifiable fact that per-token prices are public and falling. It does not rest on any SPECULATIVE or CONTRADICTED claim.

---

## Story/Hook

**Setting:** A single week leading an AI adoption program. Monday and Tuesday, same person, two different jobs.

**Challenge:** Monday is the evangelist's job: demoing what an agent shipped overnight, showing the room what the tools can do. Tuesday is the accountant's job: staring at the usage dashboard, doing the mental math on what happens if every team gets as productive as the best one.

**Action:** Ran the arithmetic forward from adoption success rather than from adoption cost. Nobody in the budget process had modeled the tools *working*.

**Result:** First reaction to the dashboard was pride. The tools are working. Second reaction, a day later, was the one that matters: nothing scales cost like a tool that works.

**Learning:** The budget assumed adoption was a risk to be encouraged. It was a cost driver to be forecast. Those two framings produce completely different numbers, and the org had only built one of them.

**Sourcing constraint (hard):** No absolute figures, no company-specific ratios, no numbers on the screen in the scene. The publishable unit is the shape of the mechanism, not the size of the account. Do not name the employer, the tools, or the internal program.

---

## Main Arguments / Key Points

### Point 1: Success and overspend are the same curve

- **Core idea:** Seat-based software intuition fails on metered agentic workloads. Cost scales with tool-call depth, retry loops, and overnight agent runs, not with headcount. Every productivity win recruits more teams onto the same curve, so the better the program performs, the faster the meter runs. There is no version of this where adoption succeeds and spend stays flat.
- **Evidence:** The author's own first-hand mechanism description (agentic workflows multiplying token consumption non-linearly as adoption succeeds). Supported by the general documented pattern: FinOps Foundation surveys elevated AI/GenAI to a top-ranked cost concern, and multiple 2024-2025 enterprise surveys report AI spend exceeding forecast at a majority of adopting organizations.
- **Challenge report rating:** Draws on the reframe of Claim 1 (SPECULATIVE as originally stated about named companies). The named-company version is cut entirely. What survives is the first-party mechanism, which is the one thing in the seed nobody else can write.
- **Practical application:** Model the budget from the adoption-success case, not the adoption-risk case. Ask what the bill looks like if every team performs like the best team, then decide whether you would still greenlight it.

### Point 2: The mystery is not the price, it is the quantity

- **Core idea:** "Nobody knows the real cost of AI" is false as stated and it is the rhetorical move that lets an essay avoid doing arithmetic. Unit prices are published by every major lab and have fallen sharply per unit of capability. Hyperscaler capex is disclosed quarterly. Energy demand has been modeled publicly. What is genuinely unforecastable is how much you will consume, because consumption is a function of task difficulty and retry depth. Organizations budgeted on the variable that was already knowable and ignored the one that was not.
- **Evidence:** Published per-token pricing from major labs; quarterly 10-Q capex disclosure from the large hyperscalers; the IEA "Energy and AI" report (April 2025) projecting data centre electricity demand roughly doubling to around 945 TWh by 2030, near 3% of global electricity; Stanford HAI's AI Index annual cost curves; Epoch AI training-compute estimates.
- **Challenge report rating:** Claim 2 was rated CONTRADICTED as originally written ("no one knows"). This point adopts the report's reframe wholesale and turns the counter-evidence into the argument. The essay should acknowledge the correction openly: the price is one of the best-documented numbers in the industry, which is precisely why budgeting on it was so comfortable and so wrong.
- **Practical application:** Replace the price variable with quantity drivers in the forecast: number of agent-initiated runs, average tool-call depth per task, retry rate, and the share of teams on the highest-consumption workflows.

### Point 3: The bill that never arrives as an invoice

- **Core idea:** Three things changed for engineers since 2021 that are AI-shaped rather than macro-shaped. First, the productivity denominator moved: people are now measured against what the tools supposedly make possible ("the tools exist, so what's your excuse"). Second, the work shifted from writing code to reviewing machine-generated code, which changes what a day feels like and what "I built something" means. Third, judgment became the bottleneck while typing got automated, and judgment was always the scarce resource. None of those three existed in 2021 regardless of macro conditions.
- **Evidence:** METR's July 2025 randomized controlled trial found experienced open-source developers were roughly 19% slower on their own repositories using early-2025 AI tools while self-reporting roughly 20% faster. That perception-reality gap is the specific mechanism: leadership prices in gains that may not be occurring, and engineers absorb the difference. Google's DORA 2024 found AI adoption associated with reduced delivery stability alongside perceived individual productivity gains; DORA 2025 found near-universal use alongside a large minority reporting low trust in AI-generated code. Stack Overflow's 2025 developer survey found rising usage with declining trust, "almost right but not quite" being the dominant frustration, which describes a review burden rather than relief.
- **Challenge report rating:** Claim 3, PLAUSIBLE. It stays hedged throughout ("one pattern I've observed", "in my experience"). Claim 6 (the causal chain from overspend to engineer pressure) was SPECULATIVE, and the essay must name the confound itself: cost pressure predates AI, and post-ZIRP discipline, flat headcount, and sector layoffs would produce identical symptoms. The claim is that the pressure is a compound of both, and only the AI-shaped part gets claimed.
- **Practical application:** Treat review capacity and judgment as constrained resources with a budget, not as free elastic supply that absorbs whatever the agents produce.

---

## Framework/Model

Three questions, presented as questions rather than as a maturity model or a named framework. The piece stays an essay with a takeaway, not a listicle.

1. **What are we actually buying?** Name the specific hours saved or the work unblocked. If you cannot name it, the meter will name it for you at the end of the quarter.
2. **What are we paying that is not on the invoice?** Ask the people doing the work, somewhere honesty is safe. Then instrument cost per outcome (per merged change, per resolved ticket), not cost per token.
3. **Who pays later?** Review capacity and judgment are the constrained resources. Watch them the way you watch a budget, because that is what they are.

---

## External Sources to Cite

Research access was unavailable when the challenge report was written, so every URL below must be opened and verified before publication. Any figure that cannot be traced to its primary source gets cut.

1. **METR, "Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity" (July 2025)** : experienced developers ~19% slower while self-reporting ~20% faster. Use in Point 3 as the mechanism for pressure, and disclose the limitation in the objections section (16 developers, mature repositories they knew deeply, close to the worst case for AI assistance). URL to verify: metr.org research blog.
2. **Google Cloud DORA "State of DevOps" 2024 and 2025** : adoption associated with reduced delivery stability; near-universal use with low trust in generated code. Use in Point 3 alongside METR. URL to verify: dora.dev.
3. **Stack Overflow Developer Survey 2025** : usage up, trust down, "almost right but not quite" as dominant frustration. Use in Point 3 as the review-burden evidence. URL to verify: survey.stackoverflow.co.
4. **IEA, "Energy and AI" (April 2025)** : data centre electricity demand projected to roughly double to around 945 TWh by 2030, near 3% of global electricity. Use in Point 2 as proof that the macro costs are measured, not mysterious. URL to verify: iea.org.
5. **MIT NANDA, "The State of AI in Business 2025"** : widely covered for the finding that roughly 95% of enterprise GenAI pilots produced no measurable P&L impact. Use in Point 2 with the caveat stated inline: this is a *returns* finding, not a cost-measurement finding, and it drew methodological criticism over sample and the definition of "return". Cite it as a returns datapoint or not at all.
6. **FinOps Foundation, "State of FinOps"** : AI/GenAI ranked among top cost-management concerns. Use in Point 1 to establish that the overspend pattern is general, not personal. URL to verify: finops.org.
7. **GitHub Copilot productivity study (2023) and the three-firm field experiments (2024) covering a large software firm, a consultancy, and an anonymous Fortune 100 company** : ~56% completion-time reduction on a scoped task, and roughly 26% more tasks completed. Cite by URL, not by researcher name. Use in the objections section as the strongest case against Point 3.
8. **Upwork Research Institute (2024)** : 77% of employees reported AI tools increased their workload. Use in Point 3 as supporting, not load-bearing, evidence.

**Excluded on purpose:** the podcast episode that prompted the idea is the *occasion*, not a citation. It can appear as "something I heard got me thinking", with no numbers taken from it and no name attached. The originating show has a documented verification problem in its health coverage, so nothing from it enters the piece as fact.

---

## Practical Takeaways

1. Rebuild your AI forecast from the adoption-success case: model the bill assuming every team performs like your best team, and present that number to whoever approved the original one.
2. Swap the forecast variable. Stop projecting from price per token (public, falling, already known) and start projecting from quantity drivers: agent runs initiated, average tool-call depth, retry rate, and share of teams on high-consumption workflows.
3. Instrument cost per outcome, not cost per token. Pick one unit that matters to your org (per merged change, per resolved ticket) and start measuring it this week, even crudely.
4. Put a number on review capacity. Count the hours your team spends reviewing machine-generated work, and track it as a resource with a ceiling rather than as slack that absorbs whatever arrives.
5. Ask the workload question somewhere honesty is safe (skip-level, anonymous, or one-to-one, not a team retro): has this made your week better or busier? Then compare the answer to what your dashboard claims.

---

## Common Objections/Questions

**Objection:** "The evidence says AI makes developers faster and happier, not pressured. You're cherry-picking the one study that agrees with you."

**Response:** Concede it directly and early. The literature is genuinely split, and the pro-AI side is not weak: the 2023 completion-time study and the 2024 three-firm field experiments both found substantial gains, and several reported *higher* job satisfaction and *less* frustration, the direct opposite of a psychological-cost thesis. The METR result is one study, 16 developers, on mature repositories they knew deeply, which the authors themselves flag as close to a worst case. The essay's stance is not "AI makes engineers miserable". It is "nobody is counting the full bill, in either direction". Both sides of that ledger are undercounted.

**Objection:** "This pressure isn't AI. It's layoffs, flat headcount, and post-ZIRP cost discipline. All of that predates agentic AI and produces identical symptoms."

**Response:** Name the confound before the reader does, and concede most of it. Cost pressure exists without AI and would exist without AI. Then argue the narrow part: the moved productivity denominator, the shift from authoring to reviewing, and judgment becoming the bottleneck are three changes that did not exist in 2021 under any macro conditions. The claim is a compound, and only the AI-shaped component gets claimed.

**Objection:** "Which companies? You're describing anecdotes about unnamed firms."

**Response:** Say plainly that the specific budget stories circulating in the author's network stay anonymous and carry no factual weight, and that they are included as mood, not as evidence. Name the selection bias in the same breath: people in an alumni channel talking about AI pressure are disproportionately the ones for whom it went badly, and the ones who are fine are not posting. Every factual claim in the piece must stand without that conversation.

**Objection:** "Everyone knows what AI costs. The pricing pages are public."

**Response:** Agree, and make that the argument. The price is one of the best-documented numbers in the industry. That is exactly why budgeting on it felt safe. The quantity was never modeled, and quantity is where the surprise lives.

---

## Call to Action

**Blog Post CTA:** Take the three questions to your next budget or planning conversation, specifically question two. Ask what you are paying that is not on the invoice, and ask it of the people doing the work rather than of the dashboard.

**Newsletter CTA:** Reply with one line: did your AI spend come in over forecast this year, and did anyone model what happens if adoption actually works? Responses stay private and unattributed.

---

## Newsletter Adaptation Notes

**Keep:** The Monday/Tuesday double-life scene, compressed to three or four sentences, plus the single reframe (price is public and falling, quantity is unforecastable, success and overspend are the same curve).

**Cut:** All external citations, the confound discussion, the objections section, and the third framework question. The newsletter carries the hook and one idea, nothing else.

**Link:** "Read the full post: https://miketineo.com/blog/the-cost-we-couldnt-forecast.html"

---

## Voice & Tone

- Tone: 70% warm, 30% professional.
- Lead with "I" in the Monday/Tuesday scene and the dashboard moment, shift to "you" for the three questions and the takeaways.
- Structure is concrete first, philosophical last. The abstract turn is earned in the final third, not used as the opening register. If the concrete material is not strong enough to carry the first two-thirds, the piece is not ready.
- Hedge PLAUSIBLE material explicitly: "one pattern I've observed", "in my experience", "the evidence so far suggests".
- Use role labels ("the platform team lead", "a senior engineer I worked with") instead of personal names.
- No em-dash or double-hyphen phrase separators. No use of the word "land" or its conjugations. Use merge, ship, deploy, arrive, persist.

---

## Names Allowlist

Every proper noun that appears in this brief is listed below. Each must be explicitly approved before the draft phase.

| Name/Noun | Type | Approved? | Reason |
|-----------|------|-----------|--------|
| Miguel Tineo | Author | Yes | Author's own name |
| METR | Research org (source) | Yes | Cited by URL as the source of the 2025 developer productivity RCT; no individual researchers named |
| DORA / Google Cloud | Research program (source) | Yes | Cited by URL as the source of the 2024 and 2025 State of DevOps findings |
| Stack Overflow | Survey publisher (source) | Yes | Cited by URL as the source of the 2025 Developer Survey |
| IEA | Institution (source) | Yes | Cited by URL as the source of the April 2025 "Energy and AI" report |
| MIT NANDA | Research org (source) | Needs review | Report is contested on methodology; include only with the inline caveat, or cut |
| FinOps Foundation | Industry body (source) | Yes | Cited by URL for the State of FinOps AI cost finding |
| Upwork Research Institute | Research org (source) | Yes | Cited by URL for the 2024 workload finding; supporting evidence only |
| Stanford HAI / Epoch AI | Research orgs (source) | Yes | Cited by URL as evidence that cost curves are published |
| GitHub | Product/publisher (source) | Yes | Cited by URL as publisher of the 2023 Copilot study, used as counter-evidence |
| Uber | Company | No | Cut entirely. Unsourceable budget claim traced to a private chat; the only item in the seed carrying legal exposure |
| Zendesk | Company | No | Cut entirely. Privately held since 2022, budget internals unreported; same sourcing and exposure problem |
| Antimatter | Author's employer | No | Employer must not be named. First-hand experience appears as mechanism description only, with no figures, ratios, or identifying detail |
| Diary of a CEO | Podcast | No | Used as the unnamed occasion for the idea, never as a citation. The show has a documented verification problem in its health coverage |
| Peng et al. / Cui et al. | Researchers | No | Policy is to cite sources by URL, not by human name. Refer to the studies by publisher and year |

**Names & Attribution Policy:** Use role labels ("the platform team lead", "a senior engineer I worked with") instead of personal names. No fake personas. No work brands in blog/newsletter body. Cite sources by URL, not by human name. See voice-guidelines.md for the full policy.

---

## Sourcing Constraints (carry into the draft phase)

These are not suggestions. They come from the author's answers to the interview questions and from the challenge report's legal and ethical flags.

1. **No absolute figures and no company-specific ratios** from the author's own program. The publishable unit is the shape of the mechanism. "AI spend budgeted like software behaves like a meter" is publishable. Any number attached to it is not.
2. **The private alumni conversation is a labelled subjective observation about mood, with zero factual weight.** No quotes, no names, no workspace identification, no detail vivid enough to identify a speaker. The honest one-sentence version, which is the only version that may appear: "In private conversations with people I used to work with, scattered across the industry now, the same two things keep coming up: budgets that ran out faster than anyone forecast, and a kind of pressure nobody's dashboard measures." Where that scene is used, the selection bias is named in the same paragraph.
3. **Stories about recognizable companies stay anonymous and are framed as stories, not as sourced claims.** They may illustrate a shape the author has independently described. They may not carry a fact.
4. **Every external figure is traced to its primary source before it appears in the draft.** Anything untraceable is cut, not softened.
