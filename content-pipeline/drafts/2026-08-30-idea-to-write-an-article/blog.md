---
title: "The Cost We Couldn't Forecast"
date: 2026-09-13
excerpt: "We budgeted AI like software and it behaves like a meter. The price was never the mystery. The quantity was, and success is what makes it run faster."
tags: [ai, engineering-leadership, finops, agentic-engineering]
subtitle: "Success and overspend are the same curve, and most budgets only modeled one of them"
category: ai
illustration: binoculars
audio: true
audioVoice: Matthew
---

On Monday I was the evangelist. I stood in front of a room and walked through what an agent had shipped overnight while everyone slept. The reaction was the one you want: people leaning forward, asking how fast they could get their own team on it.

On Tuesday I was the accountant. Same person, same program, different job. I sat with a usage dashboard open and did arithmetic nobody had asked me for. What does this bill look like if every team gets as productive as the best team?

My first reaction was pride. The tools are working.

My second reaction, about a day later, was the one that mattered. Nothing scales cost like a tool that works.

I lead AI adoption for a living and I am a believer. That is exactly why I think this is worth saying out loud. Skeptics counting the costs is expected. Builders counting them is useful. I am not going to share figures from my own program, and you should be suspicious of anyone who does. The publishable part is the shape of the mechanism, not the size of the account.

## Success and overspend are the same curve

We budgeted AI the way we budget software. Seats, times price, times twelve months. A known quantity you negotiate once a year and then stop thinking about.

Agentic workloads are not seats. They are a meter.

Consumption scales with tool-call depth, with retry loops, with the overnight runs that produce the demos people applaud on Monday morning. It does not scale with headcount. One engineer running a deep agentic workflow can consume more in an afternoon than a careful team consumes in a week of hand-written code.

Which means every productivity win recruits more teams onto the same curve. The better the program performs, the faster the meter runs. There is no version of this where adoption succeeds and spend stays flat.

That is not a personal problem. The FinOps Foundation's State of FinOps research (finops.org) has elevated AI and GenAI to a top-ranked cost-management concern, and multiple enterprise surveys across 2024 and 2025 reported AI spend arriving over forecast at a majority of adopting organizations.

The failure was in the framing. The budget treated adoption as a risk to be encouraged. It was a cost driver to be forecast. Those two framings produce completely different numbers, and we had only built one of them.

So model the success case. Ask what the bill looks like if every team performs like your best team, and then decide whether you would still greenlight it.

## The mystery is not the price. It is the quantity.

"Nobody knows what AI really costs" is the sentence that gets an essay out of doing arithmetic. It is also false, and I want to concede that directly because it was my own instinct first.

Per-token prices are published by every major lab and have fallen sharply per unit of capability. Hyperscaler capital expenditure is disclosed quarterly in filings anyone can open. Energy demand has been modeled in public: the IEA's *Energy and AI* report from April 2025 (iea.org) projects data centre electricity demand roughly doubling to around 945 TWh by 2030, close to 3% of global electricity. Cost curves get published annually in Stanford HAI's AI Index. Training-compute estimates are maintained openly by Epoch AI.

The price of AI is one of the best-documented numbers in the industry. That is precisely why budgeting on it felt safe, and precisely why it was the wrong variable.

What is genuinely unforecastable is quantity. How much you consume is a function of task difficulty and retry depth, and neither of those is knowable at planning time. A task that resolves in three tool calls this quarter resolves in thirty when someone points the same agent at a gnarlier codebase.

We budgeted on the variable that was already public and ignored the one that was not.

The practical move is a swap. Stop projecting from price per token. Start projecting from quantity drivers: agent runs initiated, average tool-call depth per task, retry rate, and the share of teams sitting on your highest-consumption workflows.

## The bill that never arrives as an invoice

There is a second ledger, and it is worse instrumented than the first.

One pattern I have observed, and I want to hold this loosely because it is observation rather than measurement, is that three things changed for engineers that are AI-shaped rather than macro-shaped.

The productivity denominator moved. People are now measured against what the tools supposedly make possible. The tools exist, so what is your excuse.

The work changed shape. Writing code became reviewing machine-generated code, which changes what a day feels like and what "I built something" means at the end of it.

And judgment became the bottleneck while typing got automated. Judgment was always the scarce resource. We just automated the abundant one first.

The evidence here is genuinely split, and I am not going to pretend otherwise. A randomized controlled trial published by METR in July 2025 (metr.org) found experienced open-source developers were roughly 19% slower on their own repositories using early-2025 AI tools, while self-reporting roughly 20% faster. That perception-reality gap is the mechanism I care about: leadership prices in gains that may not be occurring, and engineers absorb the difference.

Alongside it, DORA's State of DevOps 2024 (dora.dev) associated AI adoption with reduced delivery stability even as individuals perceived productivity gains, and DORA 2025 found near-universal use paired with a large minority reporting low trust in AI-generated code. Stack Overflow's 2025 Developer Survey (survey.stackoverflow.co) found usage rising while trust fell, with "almost right but not quite" as the dominant frustration. That is a description of review burden, not relief. The Upwork Research Institute's 2024 research found 77% of employees said AI tools increased their workload.

Now the honest counterweight. The METR study is one study, sixteen developers, working on mature repositories they knew deeply, which the authors themselves flag as close to a worst case for AI assistance. The other side is not weak: GitHub's 2023 productivity study (github.blog) reported roughly a 56% reduction in completion time on a scoped task, and the 2024 field experiments across a large software firm, a consultancy, and a Fortune 100 company reported roughly 26% more tasks completed. Several of those found higher job satisfaction and less frustration, the direct opposite of a psychological-cost thesis.

My position is not that AI makes engineers miserable. It is that nobody is counting the full bill in either direction.

And there is a confound I should name before you do. This pressure is not purely AI. Post-ZIRP cost discipline, flat headcount, and sector layoffs would produce identical symptoms, and all of it predates agentic tooling. Cost pressure exists without AI and would exist without AI. The narrow claim I will defend is that the moved denominator, the shift from authoring to reviewing, and judgment becoming the bottleneck are three changes that did not exist in 2021 under any macro conditions. The pressure is a compound. Only the AI-shaped part is mine to claim.

In private conversations with people I used to work with, scattered across the industry now, the same two things keep coming up: budgets that ran out faster than anyone forecast, and a kind of pressure nobody's dashboard measures. That is mood, not evidence, and the selection bias is obvious. The people for whom it went badly are the ones talking about it. The ones who are fine are not posting.

## Three questions worth asking out loud

**What are we actually buying?** Name the specific hours saved or the work unblocked. If you cannot name it, the meter will name it for you at the end of the quarter.

**What are we paying that is not on the invoice?** Ask the people doing the work, somewhere honesty is safe. Skip-level, anonymous, one-to-one. Not a team retro. Then instrument cost per outcome, per merged change or per resolved ticket, rather than cost per token.

**Who pays later?** Review capacity and judgment are constrained resources with a ceiling, not elastic slack that absorbs whatever the agents produce. Put a number on them. Watch them the way you watch a budget, because that is what they are.

Take these to your next planning conversation, especially the second one. Ask what you are paying that is not on the invoice, and ask it of the people doing the work rather than of the dashboard.
