---
title: "From Typing Code to Orchestrating Outcomes"
date: 2026-04-09
excerpt: "Two engineers, same tools, very different results. The gap isn't the software—it's the paradigm. Here's how to shift from Type A to Type B."
tags: ["ai", "engineering-leadership", "agentic-engineering", "productivity", "software-engineering"]
subtitle: "Why the engineers who win with AI aren't typing faster"
category: "Engineering Leadership"
illustration: "compass"
---

## Two Engineers, Same Tools, Completely Different Results

A few weeks ago, I overheard an engineer describing how they use their AI coding assistant. They chat with it mid-function, accept the smart suggestions, move faster than before. On the surface, it looks like AI adoption. Check the box. Benefit unlocked.

Then I thought about another engineer on a team I've worked with closely. They don't use AI the same way at all. They start with a JIRA ticket or a short PRD, write a one-paragraph problem statement, dispatch that to an agentic workflow, review the resulting pull request, and push it through the team's normal review process — all before lunch. They're not chatting with AI mid-keystroke. They're directing it like a capable team member.

The first engineer saves some keystrokes. The second engineer ships full features.

That output delta isn't incremental. It's multiplicative.

Here's the thing: they're often using the same underlying tools. The tool isn't the variable. **The paradigm is.**

## The Gap That's Quietly Opening

There are two types of engineers navigating the AI moment right now, and the gap between them is growing fast.

| | **Type A** | **Type B** |
|---|---|---|
| **Starting question** | How do I implement this? | What problem needs solving here? |
| **AI role** | Smarter autocomplete | Fast, capable team member |
| **Human role** | Implementation | Planning, review, judgment |
| **Output** | Incremental gains | Multiplicative gains |
| **Mental model** | Craftsperson | PM of a small agent team |

Type A engineers are optimizing typing. They've layered AI onto an existing workflow and gotten faster at what they were already doing. That's real — but it's the equivalent of getting a better hammer when the job was always going to require a different approach.

Type B engineers are optimizing outcomes. They've changed their fundamental relationship with implementation. They still write code — but they've moved the seat of judgment from "how does this get built?" to "is the right thing getting built, and is it built correctly?"

Addy Osmani put it well: AI isn't making developers faster typists — it's shifting them from carpenters to architects. The human focus moves to system architecture, business requirements, and validation. That shift is the whole ballgame.

## Why Most Teams Aren't Seeing the Gains

A 2025 study found that while 75% of engineers use AI tools regularly, most organizations see no measurable gains in delivery at the company level.

That number makes total sense once you understand the Type A / Type B distinction.

If the majority of engineers are adding AI to their existing workflow rather than adopting a new one, the output curve stays flat. You get faster typists across the board, but the bottlenecks — requirements clarity, review quality, deployment reliability, architectural decisions — remain exactly where they were. AI accelerated the easy parts. It didn't touch the hard parts.

Type B engineers found the hard parts. That's why their teams see results that look anomalous from the outside.

The shift isn't about which tool you use. It's about which question you ask when you open it.

## The Engineer as PM

When you treat AI as a team member rather than an autocomplete, your job description changes quietly but completely. You're no longer the primary implementer. You're defining requirements, reviewing output, iterating on quality, and pushing results through review gates. If you squint, that's a product manager's job — applied to an agent team.

McKinsey's research on agentic organizations found that a human team of two to five people can already supervise 50 to 100 specialized agents running an end-to-end process. The leverage is real. But — and this is the part that gets lost in the hype — it only works if the humans running those agents are thinking at the right level of abstraction.

Here's a concrete example. One of the highest-leverage things I've seen recently is engineers pairing AI-powered design tools with agentic workflows to prototype full feature experiences before writing a line of implementation code. The engineer isn't doing less work — they're doing more important work earlier in the cycle, when changes are cheap. That's the PM mindset applied precisely.

The practical move: take your current sprint tasks and map them into two columns.

- **Column A:** Things you're writing yourself
- **Column B:** Things you could hand off to an agent with a well-written prompt or structured input

Most engineers are surprised how much belongs in the second column. Start there. The PM mindset shows up in how you write the ticket — the specificity of the problem statement, the clarity of the acceptance criteria — not in how you write the code.

## The Ownership Bar

When the cost of implementation drops, the ceiling on what a single engineer can own rises.

Ideas that used to require a two-sprint roadmap can now be prototyped in a day. That changes what it means to take ownership of a problem — you can go further, faster, without waiting for team bandwidth to open up. The scope of ownership expands, but so does the type of judgment required to use it well.

Allstacks describes it clearly: engineers who thrive in AI-forward organizations are "the ones who make the micro product decisions that AI cannot make, filling gaps that AI cannot identify, and exercising product judgment that specs could never fully capture."

That's a much more interesting job than what most engineers signed up for — in the best way.

The practical reframe: the next time you're scoping a feature, don't start with "how long will this take to build?" Start with "what decision needs to be made here, and what do I need to know to make it?" The build is now a smaller fraction of the work. The judgment is the job.

## The Leadership Shift

For engineering managers and directors, the Type A vs Type B dynamic plays out at the team level — and it changes your job too.

When engineers can move faster and own more scope, the manager's role shifts. You spend less time unblocking implementation and more time setting guardrails. Less "let me clear the path" and more "go — but keep security, quality, and the team's standards in frame."

I've started using AI for synthesis work that used to eat hours: DORA metric summaries, performance review inputs, leadership presentations. That's not because those things don't matter — it's because they're exactly the kind of structured, high-volume, low-ambiguity work that agents handle well. Which frees me to focus on the judgment calls that require context AI doesn't have: organizational dynamics, trust calibration, sequencing decisions that depend on reading the room.

The practical move for leaders: in your next team planning session, identify one decision that currently routes through you before it can move forward. Ask whether the engineer on the other side of that bottleneck could own it with the right guardrails in place. If the answer is yes, write the guardrail document together and hand it off. That's what enabling autonomy looks like in practice — not abdication, but deliberate transfer with a clear frame.

## Which Type Are You?

Here's the honest audit:

**For the next three days**, every time you open an AI tool, ask yourself: am I telling it *how* to do something, or am I telling it *what* to solve? That's the whole test. Most engineers are surprised by the ratio when they actually track it.

Then try this: before writing a single line of code on your next ticket, write a one-paragraph problem statement. Hand that to your AI system as the starting point. Don't touch the implementation until you've seen what comes back and decided how to evaluate it.

That one change is the starting posture of a Type B engineer.

The other habit that makes a real difference: **write your review criteria before you review AI output**. Define what "done" looks like before you look at the generated code. This forces you into the PM mindset — and it catches more issues than reviewing with fresh eyes, because you know what you're looking for.

## Two Common Objections

**"I still need to understand the code — I can't just trust what the AI generates."**

Correct. Type B engineers review everything. The shift is not from reviewing to blind trust — it's from writing to reviewing. A senior engineer who can evaluate a pull request in 20 minutes is more valuable than one who spent four hours writing it. Your judgment about the output is the job, and that judgment gets sharper the more you practice it.

**"This only works for simple tasks. Complex architectural work still requires a human in the seat."**

Yes and no. Architectural decisions still require deep human judgment — nobody's arguing otherwise. But the *implementation* of architectural decisions — the code, the scaffolding, the configuration — is increasingly something agents can handle with the right inputs. The question isn't whether AI can do the whole job. It's whether you're spending your time on the judgment calls or on the scaffolding. Type B engineers protect their time for the former.

## Key Takeaways

- **The tool isn't the variable. The paradigm is.** Type A asks the AI how to do something. Type B tells the AI what problem to solve. One refines the old workflow. The other operates in a new one.
- **Think of yourself as the PM of a small agent team.** Your job is requirements, review, judgment, and quality standards — not implementation volume.
- **The scope of ownership expands when the cost of implementation drops.** Use that headroom deliberately.
- **Leaders shift from unblocking to enabling.** Guardrails replace bottlenecks. Autonomy is the outcome.
- **The audit is simple:** Are you telling AI *how* or *what*? Track it for three days. Then change the ratio.

## What's Next?

This week, pick one task from your backlog and run it entirely as a Type B engineer. Problem statement first, in plain language. AI handles the implementation. You handle the review and judgment.

Note what changes — about the output, about your time, about what the work actually feels like.

Then come back and tell me. I'm genuinely curious where this lands for people who are already deep in the tools and trying to figure out what the real shift looks like. Reply to the next Bear Essentials newsletter with what you observed — what worked, what didn't, and what surprised you.

That's the only way this gets better.

---

*This post is part of a bi-weekly series on engineering leadership. [Subscribe to Bear Essentials newsletter](/blog/) to get the next post delivered to your inbox.*
