---
title: "Stop Staging."
date: 2026-04-23
excerpt: "Fifteen years apprenticing in other people's CONTRIBUTING.md. Then I just opened my own kitchen."
tags: [ai, side-projects, open-source, shipping]
subtitle: "Fifteen years apprenticing in other people's CONTRIBUTING.md. Then I started my own kitchen."
category: "engineering"
illustration: "tent"
audio: true
audioVoice: Matthew
---

For most of my career I confused two things that look almost identical from a distance: "I should open-source my side projects" and "I should contribute to other people's open-source projects." They are not the same thing. Conflating them cost me about fifteen years of unshipped repos sitting in `~/hack/`.

The trap looks like this. You decide you should be doing more open source. The default cultural script (the one every "first contribution" guide reinforces) points you at someone else's repo. You pick a project you use. You open the CONTRIBUTING.md. It is forty lines of branch-naming rules, commit-message prefixes, and a PR template with a section titled "have you considered the following edge cases." You read the maintainer's response to the previous PR, and it is firm, a little testy, because they have answered that exact question a hundred times. None of this is wrong. The barriers are doing real work; one peer-reviewed systematic review of newcomer barriers in OSS catalogues fifty-eight of them, most having nothing to do with code. Maintainers have day jobs and their patience is finite.

But the cumulative effect is that "drive-by contribution" turns into *staging*: the chef word (pronounced *stahj*) for an unpaid apprenticeship at someone else's kitchen. Which is exactly what it feels like. Most evenings I do not have staging in me. I would read two contribution guides, close both tabs, and tell myself I would try again when I had a longer weekend. Repeat for fifteen years.

The unlock (whatever label you want to put on it: imposter syndrome, perfectionism, permission-seeking) was realizing I could just start my own repo.

## chmoji

The grounded example here is a tiny zsh plugin called [chmoji](https://github.com/miketineo/chmoji). About sixty lines that auto-open an fzf emoji picker when you type `:` and quietly expand `:tada:` into the glyph. I built it in one evening with Claude Code. Honest framing: there is prior art. `pschmitt/emoji-fzf.zsh` has done the picker side of this for years. The novelty in chmoji is the auto-trigger on colon, not the picker itself. If you want a picker, that other plugin is excellent and predates mine.

<figure style="margin:2rem 0;text-align:center;">
  <img src="/blog/images/chmoji-demo.gif" alt="chmoji demo: auto-popup picker, silent :name: expansion, and the Ctrl-X e hotkey" loading="lazy" width="640" height="320" style="display:block;width:100%;max-width:640px;height:auto;aspect-ratio:1200/600;margin:0 auto;border-radius:8px;border:1px solid rgba(128,128,128,0.2);">
  <figcaption style="margin-top:0.75rem;font-size:0.85rem;color:rgba(128,128,128,0.7);">The picker pops the instant you type a colon. No keybinding required.</figcaption>
</figure>

Try it: `brew install miketineo/tap/chmoji`. Source: [github.com/miketineo/chmoji](https://github.com/miketineo/chmoji).

The interesting thing is not the plugin. It is that the friction that used to keep my side projects in `~/hack/` has dropped a lot, and I do not think the dropping is entirely about me. Three things changed, none of them about typing speed.

## Polish stopped being a second project

Before, shipping a side project meant prototyping in an evening and then spending a week staring at the README. The install path. The caveats. The edge cases. The Homebrew formula I never quite finished. Most of the time I gave up halfway, around the moment I had to write the third paragraph of the README explaining why anyone should care.

With Claude in the loop I got the sixty-line prototype, the Homebrew tap, the auto-bump GitHub Action, and the social-preview card in one sitting. The work that used to die in "I'll finish it tomorrow" was done by tomorrow. The peripheral artifacts (the things that always felt like a second project bolted onto the first) collapsed into the same evening.

There is a real caveat. Producing polish is not the same as maintaining polish. The tap, the Action, the social card, and the formula are now four small systems I own. In six months `actions/cache@v3` will be deprecated, the formula will break on a Homebrew core bump, and the social-card template will look dated. Shipping is the start line for a published artifact, not the finish line. There is a [strong case being made](https://www.jeffgeerling.com/blog/2026/ai-is-destroying-open-source/) that AI has collapsed the cost of publishing while leaving the cost of maintenance untouched, and the imbalance is landing on maintainers. I think that case is right. So plan the maintenance window before you build the social card, not after.

## The internal critic got quieter

Claude does not flinch at weird taste decisions. It does not ask me whether someone has already built this. It builds the thing I describe, and if I hate it I say "no, that is not it" and try the next thing. No audience yet means no judgment yet, and that means things actually leave the laptop.

This is double-edged, and it is worth being honest about which edge you are on. The same mechanism that lets me ship a sixty-line plugin in an evening is the mechanism producing the slop wave that maintainers are now writing kill-switches against. The "is this worth doing" filter that used to fire before I started is the one that got quieter. For a tool where I am the user and the audience, that is fine. For a drive-by PR into someone else's project, the same disabled filter is exactly the problem the ecosystem is grappling with. The taste call has to come from you, and it has to come earlier than it used to.

## Failing out loud became cheap

I built a teaser GIF for the [chmoji](https://github.com/miketineo/chmoji) README, dropped it in next to the real demo, and hated it immediately. I deleted it. That kind of mid-stream self-correction I would have resisted if it meant redoing work someone else had done for me, or explaining to a reviewer why I changed my mind. With Claude the cost of "never mind" is close enough to zero that I stopped budgeting for it. Lowering the cost of being wrong midway lowers the cost of starting at all, because the worst case shrinks.

"Effectively zero" is probably overstating it. There is a tokens cost, an attention cost, and iterations that survive into committed code carry a maintenance bill into next quarter. But for the throwaway GIF, for the second draft of the README opening, for the third version of the install command? Close enough to zero that the difference no longer dominates the decision to start.

## Where this lands, and where it doesn't

I want to be careful with the generalization. The pattern that worked for [chmoji](https://github.com/miketineo/chmoji) (small, well-scoped, opinion-heavy tool sitting on top of a well-documented API) is the best case for AI-assisted shipping. A half-finished SaaS idea, an abandoned mobile prototype, a fifth attempt at rewriting your own blog engine: those are different shapes, and the polish-tax collapse does not extend cleanly to all of them.

So the version of the CTA I will stand behind is narrower than I might have written six months ago. If you have private repos that you keep private out of polish-perfectionism (the README is not quite right, the install path has rough edges, you have not made the social card), that gap is probably smaller than it used to be. Ship one. If you keep them private out of genuine doubt about whether the idea is any good, the friction you were feeling was probably real signal, and AI tooling does not change that. Listen to it.

The thing I had wrong for fifteen years was thinking "doing open source" had to mean apprenticing into someone else's repo. It does not. You can start your own thing. Whether shipping it is the right call is a different question. But the answer is no longer reflexively no, and that is the part that changed.
