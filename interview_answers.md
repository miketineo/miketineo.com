
### 1. The Customer Migration Story

**Monthly spend before migration:**
€5,000-€8,000/month across OpenAI, Google, and Claude APIs

**Document volume:**
Hard to pin down exact document counts, but we're looking at 500-1,000 API calls per minute during peak, processing about 2 million tokens per minute. They're a Paris-based accounting automation company (under NDA, so can't name them) that switched to LLMs for 90% of their document processing stack. Main use cases: invoice processing, document data extraction, and accounting entry generation for French accounting firms, plus a new FinTech offering within their parent group.

**Cost comparison:**
Estimated 60% reduction moving to our GPU infrastructure with open models. Still in prototype phase, but the math looks solid.

**Model selection:**
We're matching their current proprietary API setup with gpt-oss-20B, Gemma 7B, and Llama3 - tuned with the right settings to replicate what they're getting from the big providers.

**Biggest surprise:**
The complexity of implementing proper ethical and performance guardrails for BOTH their business (accuracy, safety) AND our infrastructure (security, protection). We're coordinating protection against prompt reverse engineering and other security considerations, plus ethical filters for open-source models deployed out-of-the-box. Way more layers than people expect.

---

### 2. The Gateway Layer Architecture

**Architecture overview:**
We're proposing tools we've been using internally: model routing, parallelization gateways, and comprehensive security layers that sit in front of the models.

**Problem it solves:**
Three main things: dealing with bad actors, protecting the infrastructure, and optimizing unnecessary complexities in the workflow. They're mainly processing legal documents and receipts in PDF format, so we're optimizing the heavy lifting on image and doc processing to avoid overloading the LLM.

**Fallback mechanisms:**
No fallback to cloud APIs from our side - we want to fully support our infrastructure and prove it works. They might have the option to fallback on their end, but we're running this as a fully functional prototype on Hivenet infrastructure.

**Trade-offs:**
Standard ones - latency vs cost, reliability vs flexibility. But the bigger challenge has been...

**Aha moments:**
Honestly? The complexity of picking the right amount and type of GPUs. So many variables: precision, memory, optimization strategies. Still working through it. No clean "aha" yet - just grinding through the permutations.

---

### 3. Agentic Development Shift

**What it looks like in practice:**
I'm still hands-on as an engineering lead while doing long-term strategic planning. Been coordinating agents to write unit tests, increase code coverage, report on system health, and track SLAs/observability. At the same time, pushing the whole org to adopt it - we rolled out an "AI Booster" initiative giving €40 to each employee to use any AI tool they want to boost productivity.

**Concrete example:**
Our Compute team manages 2 Kubernetes clusters with event-driven cloud instance computing state management - lots of ins, lots of outs (Big Lebowski reference). Hard to troubleshoot. We created a specific troubleshooting agent with very limited read-only permissions to see it all but only advise on what's happening. Been using it to detect root causes during incidents and so far it's been flawless. Reduces firefighting time dramatically - engineers start from an accurate diagnosis instead of hunting through runbooks, running commands, reading logs and events. They just take action.

**Biggest resistance:**
Some developers are still skeptical of AI and LLMs making coding mistakes, so they rely on them for other content but keep writing code themselves. My focus is reshaping the culture - giving them what they need to build better prompts, follow better agentic standards, and use their expertise to train our Artificial Workforce to shine where it should: repetitive and deterministic tasks like testing, coverage, verification, validation, simulation.

Main pushback I hear: "The principle is that AI hallucinations in mathematical proof are mathematically inevitable due to a combination of factors, even with perfect data and models." Fair point from the precise engineers.

**Testing/observability changes:**
For me personally, I now create Grafana dashboards in seconds after giving the right context to my agents. This includes static code analysis but most importantly, access to APIs via MCPs. I'm reviewing mainly reports - of course the tests, but most importantly the results. You can't fake code coverage. Tests hit the lines, and to do that they need to validly go through the right path with the right arguments and payloads.

**Metrics:**
Tracking code coverage and seeing dashboards come up. Time saved and quality metrics related to AI? Not yet - would love to see that but maybe too early.

---

### 4. Energy Efficiency at Scale

**When it became first-class:**
Since the beginning for me. I left some SaaS companies to find my north, and when I saw Hivenet I knew they were looking at the right thing. Joined the mission in June 2024 no matter what the outcome is. My goal: focus engineering and teach how to advance AI in the most responsible and sustainable way possible. Is it hard? What isn't when you put the REAL engineer hat on - ask the Apollo mission guys.

**Concrete decision:**
Everything we do at Hivenet has that consideration, but the most recent one: building our cloud computing platform on Kubernetes, specifically K3s, due to its smallest carbon footprint. [Reference: https://programming-group.com/assets/pdf/papers/2023_Lightweight-Kubernetes-Distributions.pdf]

**CSOA-VM model:**
We're not supporting VMs now but we're working on them, so I'm preparing for the future. Energy awareness became a first-class architecture concern once we realized compute utilization and carbon cost were leaking money and credibility.

We created a lightweight CSOA-VM model (Compute-Sustainability-Optimized-Allocation) to score VMs by watt-per-token efficiency and grid intensity. Our orchestrator picks regions and instance types based on this score.

Example: choosing between A100s in Frankfurt vs RTX 4090s in Milan - same performance, but Milan's grid mix was 40% cleaner that week.

**Numbers:**
Early results:
- ~18-25% lower energy draw per processed document
- Carbon intensity down by 30-40g CO₂e per 1K tokens

We now surface energy cost alongside dollar cost in dashboards. That visibility turned engineers into active participants in sustainability decisions.

**Performance vs efficiency balance:**
Every architectural decision sits at the intersection of cost, control, and carbon. Sometimes we choose GPUs because they're cheaper; other times because they're cleaner or offer better latency locality.

Customers rarely ask for sustainability, but they love when it's part of the ROI story. When you show that "saving €X also saved Y kWh," the conversation shifts from procurement to purpose, and passion.

---

### 5. The Connecting Thread

**Three-way trade-off:**
All three factors matter equally from my perspective, but... money (always) talks.

**Customer perspective on sustainability:**
They're not asking about it, but when we "Salt Bae" that on top of our engineering flexing, it always extracts a smile from the customer. [Keep the Salt Bae reference, potentially add meme]

**ROI framing:**
Carbon is a secondary benefit for them but extremely important for us. We help, but cleanly.

---

### 6. Lessons & Frameworks

**Decision framework for cloud API vs self-hosted:**
Cloud computing cost has been extremely hectic and unpredictable from the get-go. Part of what we do is being conscious and giving customers the best deal reality can buy - paying for what they need as close to the metal as possible. There are already too many hidden costs in AI-related cloud infrastructure; we're trying to dismantle that.

Three things: 1. Decentralized, 2. Distributed, 3. Affordable cloud.

**What I'd do differently:**
We should test more practical scenarios and grab the math early on so we don't need to rely on customer assumptions or guesstimations. That makes proving our point slower and harder. We know our throughput, TTFT, token throughput, and other metrics from experiments - I'd try to be sharper on model requirement estimations and maybe show customers prebuilt RAG or fully new pipelines and infrastructures.

**Biggest misconception:**
That it's easier and more efficient to just pay for public AI cloud. But people also forget that a lot of components are needed: security, ethical filters, jailbreak protection, etc. We provide raw power, but customers need to pull out the big guns to protect their work.

**Advice for engineering leaders:**
Be thorough, do your math, and keep an ear to the ground on academic papers - AI, cloud computing, agentic software engineering, etc. Everything is moving extremely fast in computer science. Keeping yourself updated in these fields used to be a good-to-have, but now it's a must-do. Adding energy consumption best practices in terms of security and ethics is at the highest point ever, so I'd say: eyes open.

One thing that's been poking my head for a while - more and more devices are becoming AI-powered. I guess thinking about integrating them into the mesh the cloud will become will be interesting. Start thinking about building the software gaps and tech bridges that could bring us closer to a reality of decentralized, distributed, democratic Distributed Inference/Training/Fine-tuning and the future of AI Engineering.

