---
title: "What The Bear Taught Me About Daily Deployments"
date: 2025-10-27
excerpt: "Monthly deployments are like serving 30-day-old food. Here's how three principles from professional kitchens can transform deployment hell into daily routine."
tags: ["continuous-delivery", "deployment", "engineering-culture", "devops"]
illustration: "map"
---

## Stop Serving Month-Old Food

A few years back, like many teams, I watched an engineering org get stuck in deployment hell. Monthly releases, a dozen-plus engineers on the hook, three-hour war rooms. One bad change in 30 days of work would spoil everything. Nobody owned anything. Deployments were "events," not routine.

Sound familiar?

Here's what we're building with modern practices like GitOps, FluxCD, and Kubernetes: daily deployments with zero drama. Routine rollbacks, not crisis. Teams that never ask "when will we deploy?" because service runs on schedule. It's continuous improvement, and the principles below will accelerate your journey.

The breakthrough didn't come from new tools or extensive retraining. It came from applying three principles from *The Bear*—yes, the FX show about a struggling restaurant kitchen. When we stopped treating deployments as crisis events and started treating them like dinner service, everything changed.

## The Monthly Deployment Buffet Problem

Monthly deployments are like serving a 30-dish buffet where every item has been sitting for a day. When something tastes wrong, you can't isolate which dish is the problem—you're throwing out the entire buffet or doing emergency surgery to extract the bad item.

According to [DORA's State of DevOps research](https://dora.dev/), elite performers deploy on-demand, multiple times per day, with lead times under one hour. They're not serving month-old food. They're serving fresh dishes, one at a time, with immediate feedback.

The shift from monthly chaos to daily service isn't about moving faster for speed's sake. It's about reducing batch size, establishing clear ownership, and treating software delivery as a service operation with standards and accountability.

Here's how to make it happen.

## Principle 1: Reduce Batch Size - One Dish at a Time

In *The Bear*, Marcus doesn't serve 30 different pastries at once. He serves one perfect donut. When something's off, he fixes that one item and moves on.

Your monthly deployment is a 30-day buffet. A single bad change requires rolling back everything or debugging which of hundreds of commits broke production. With daily deploys, you're serving 1-2 changes at a time. If something breaks, you know exactly what broke it. Rollback is trivial.

This isn't theoretical. Jez Humble and David Farley established this principle in *Continuous Delivery*: reduce batch size to reduce risk. Small batches mean faster feedback, easier debugging, and lower-stakes rollbacks.

**Try this tomorrow:**

Visualize your deployment as a restaurant buffet. Monthly = 30 dishes at once (overwhelming, high risk). Daily = 1-2 dishes (manageable, isolated risk).

Ask your team: "If this change breaks, how many other changes do we have to roll back with it?"

That question exposes the real cost of batching. When the answer is "all 47 PRs from the last month," you've identified the problem.

## Principle 2: Clear Ownership Kills the Committee

In *The Bear*, Marcus owns pastry. Not a committee. Not consensus. Not a rotation. Marcus. When pastry's late, there are no excuses. When pastry's perfect, Marcus gets the credit.

The problem with most engineering teams isn't lack of skills — it's a dozen-plus engineers playing hot potato with deployment responsibility. The team had the skills all along. The breakthrough came when one owner was assigned per environment.

Not a team. Not a rotation. **One person.**

When a single engineer owns the test environment deployment, the question isn't "who should deploy?" It's "what's the status?" Excuses evaporate. Ownership creates accountability. Accountability creates results.

This was uncomfortable at first. Managers worried about single points of failure. Engineers worried about being blamed. But here's what happened: the owner didn't do all the work — they owned the service. They coordinated, they unblocked, they made the call when the team needed to rollback. The team supported them, but they owned it.

Within two weeks, test environment deployments went from "whenever someone has time" to "10am daily, the test-env owner runs service."

**Tomorrow morning in standup:**

Assign one person as the deployment owner for each environment (test, staging, prod). Not a team, not a rotation—ONE person. That person doesn't do all the work, but they own the service.

Watch how fast "we're not ready" becomes "here's what we need to be ready."

## Principle 3: Service-Level Accountability - It's Not an Event, It's Service

The biggest shift wasn't technical. It was linguistic.

We stopped calling them "deployments." We started calling them "service."

When it's a "deployment," teams can say "we're not ready." When it's "service," the question becomes "what do we need to run service today?"

In a restaurant, you don't cancel dinner service because the kitchen's messy. You work the problem. The guests are coming at 6pm whether you're ready or not.

This mental model shift is everything. Deployments are events that happen when convenient. Service is an operation that runs on schedule. Service has standards. Service has customers waiting.

The language shaped behavior. Once we started saying "What time is service?" instead of "When should we deploy?", the team treated it like something that must happen, not something that might happen.

**This week:**

Change your language. Stop saying "deployment." Say "service."

In Slack: "What time is deployment service today?"
In standup: "Are we ready for service?"
In retrospectives: "How did service go this week?"

Language shapes culture. When you call it service, teams treat it like a professional operation with standards, not a special event that requires perfect conditions.

## The Deployment Brigade System

Here's the framework that emerged from applying these three principles:

### 1. Daily Service Schedule

Just like dinner service starts at 6pm, deployment service runs on a schedule. We picked two time windows: 10am and 2pm.

Code ready by 9:30am? It goes in the 10am service.
Not ready? It waits for 2pm.

No more "when will this deploy?" questions. The schedule is the schedule.

### 2. Station Ownership

Each environment has one owner, like stations in a kitchen:
- Test environment: one engineer owns it
- Staging: one engineer owns it
- Production: one engineer owns it

They don't do everything — they own the service. They coordinate, unblock, make the call.

### 3. Service Standards

Clear definition of "ready for service":
- Tests pass (green CI pipeline)
- Canary deployment plan ready
- Rollback plan verified
- Metrics dashboard clean

No standards? No service. Simple as that.

### 4. "Behind!" Protocol

In professional kitchens, when something's wrong, you shout "Behind!" The brigade doesn't blame—they help.

We adopted the same protocol. When something breaks during service, the owner calls "Behind!" in Slack. No blame. No finger-pointing. The team swarms to help or executes immediate rollback.

This created urgency culture, not blame culture. Problems get surfaced instantly because surfacing them brings help, not punishment.

### 5. Post-Service Review

At the end of each service window, a quick 5-minute recap:
- What went out?
- Any issues?
- What's on tomorrow's menu?

This isn't a long retrospective. It's a quick sync to close the loop and prep for next service.

## How It Works in Practice

**Morning standup (9am):**
"What's ready for the 10am service?" The test-env owner flags the new payment flow — tests green, good to go. Another engineer mentions their feature needs one more test fix and will target 2pm service.

**First service window (10am):**
The test-env owner deploys to test and checks canary metrics for 15 minutes. Clean. The prod owner proceeds with a canary rollout: 5% → 50% → 100%, monitoring error rates, latency, and key business metrics.

**Issue detected (10:18am):**
The prod owner calls "Behind!" in Slack — error rate spike on the checkout endpoint. Rollback starts immediately. Within three minutes, rollback is complete. Service restored.

**Second service window (2pm):**
The staging lead runs their deploy. Tests pass, canary clean, full rollout complete by 2:20pm.

**End of day:**
Two features shipped. One rollback (no drama). Tomorrow's menu identified.

## Measuring What Matters

Track four metrics:

**1. Deployment Frequency**
- Before: 1x per month (often slipped to 6 weeks)
- Target: 1x per day minimum, work up to 6+
- How: Count successful production deployments per day

**2. Lead Time for Changes**
- Before: 30 days (monthly cycle)
- Target: Same day (code merged → deployed)
- How: Track time from PR merge to production

**3. Change Failure Rate**
- Before: Unknown (too many changes to isolate)
- Target: <15% initially (will improve)
- How: Deployments requiring rollback ÷ total deployments

**4. Time to Restore Service**
- Before: Hours (debugging which change broke)
- Target: <15 minutes (rollback is routine)
- How: Time from incident to service restored

**The Non-Obvious Metric:**
Track how many times per week someone asks "when will this deploy?"

Target: Zero.

When service runs daily, nobody asks—they know the schedule.

## What Stops Most Teams (And How to Fix It)

**"We'll break production daily instead of monthly."**

You're already breaking production monthly—just with more damage. This is like saying one massive surgery is safer than daily checkups. When you break daily with small changes, you know exactly what broke. When you break monthly with 30 days of changes, you're debugging a haystack.

Plus, rollback is trivial when it's one small change versus a month of work.

**"We need better tooling first."**

The team had the same tools before and after. What changed? Ownership and accountability. Start service with what you have. You'll discover real blockers fast, not theoretical ones.

Pick ONE blocker—the biggest one—and fix it. Don't wait for the perfect toolchain.

**"Daily deploys will expose who's actually slow."**

Yes. That's the point.

Monthly cycles let everyone hide. Daily service makes velocity visible. This is the unspoken objection that kills most transformation efforts. Middle managers resist because they can't obscure problems anymore.

But if you're serious about improvement, transparency is required. *The Bear* succeeds because there's nowhere to hide during service. That pressure drives excellence.

## Start Service Tomorrow

Don't announce a transformation. Don't create a roadmap. Don't form a committee.

Tomorrow morning, ask your team one question: "What would need to be true for us to deploy today?"

Write down every excuse. Those are your actual blockers.

Pick the biggest one. Assign ONE owner. Give them 48 hours to fix it or propose a fix.

Then pick a pilot team—your strongest team, the one closest to weekly deploys already. Let them be the pilot kitchen. When they're deploying daily without drama, fear evaporates across the organization.

Start with what you have. Change your language. Assign owners. Run service.

## Key Takeaways

- **Reduce batch size**: Monthly deploys are 30-day-old food. Daily deploys mean smaller changes, easier rollbacks, faster feedback.
- **Clear ownership**: Assign one owner per environment. Committees create excuses, ownership creates accountability.
- **Service-level accountability**: Stop calling them "deployments." Start calling them "service." Language shapes behavior.
- **The Deployment Brigade System**: Daily service schedule, station ownership, service standards, "Behind!" protocol, post-service reviews.
- **Start small**: Pick one blocker, assign one owner, pilot with one team. Daily deploys expose everything—that transparency drives improvement.

## What's Next?

What would Carmen from *The Bear* do? He wouldn't have a meeting about meetings. He'd start service.

Your turn.

Tomorrow morning, ask your team: "What would need to be true for us to deploy today?" Don't announce a transformation. Just fix that one thing. Then ask again the next day.

That's how you start service.

---

*This post is part of a bi-weekly series on engineering leadership. [Subscribe to Bear Essentials newsletter](/blog/) to get the next post delivered to your inbox.*
