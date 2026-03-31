# Business Observability Forge — Partner Event Talk Track & Demo Showcase

**Event Date:** April 1, 2026  
**Audience:** Dynatrace Partners (predominantly Dynatrace Managed customers)  
**Duration:** ~30–40 minutes (adjustable)  
**Presenter Notes:** 🎤 = spoken script | 🖥️ = demo action | 💡 = talking point | ⚠️ = Managed callout

---

## TABLE OF CONTENTS

1. [Opening & Hook (3 min)](#1-opening--hook)
2. [The Problem We Solve (5 min)](#2-the-problem-we-solve)
3. [What Is the Business Observability Forge? (5 min)](#3-what-is-the-business-observability-forge)
4. [Live Demo: Zero to Business Observability (15 min)](#4-live-demo-zero-to-business-observability)
5. [The 55 Industry Verticals (3 min)](#5-the-55-industry-verticals)
6. [Chaos Engineering & AI Remediation (5 min)](#6-chaos-engineering--ai-remediation)
7. [What This Means for Managed Customers (3 min)](#7-what-this-means-for-managed-customers)
8. [Close & Call to Action (2 min)](#8-close--call-to-action)
9. [Appendix: Full Vertical List](#appendix-a-all-55-industry-verticals)
10. [Appendix: Demo Cheat Sheet](#appendix-b-demo-cheat-sheet)

---

## 1. Opening & Hook

**[SLIDE: Title — "Business Observability Forge"]**

🎤 *"Let me ask you a question. How many of you have been in a customer meeting where they say: 'Dynatrace is great for infrastructure monitoring, but can you show me the **business impact**?' Show of hands."*

🎤 *"Every hand goes up, right? Because that's the gap. We're brilliant at telling a CTO their response times are slow. But when the CFO asks 'how much money did that cost us?' — we go quiet."*

🎤 *"That's what the Business Observability Forge solves. It's a platform that lets you walk into **any** customer, in **any** industry, and within minutes show them what Dynatrace business observability looks like — with **their** data, **their** journey, **their** KPIs."*

💡 **Pause here — let that land.**

---

## 2. The Problem We Solve

**[SLIDE: "The Partner Challenge"]**

🎤 *"As partners, you face three challenges when selling business observability:"*

🎤 *"**One** — Every customer is different. A bank cares about fraud detection rates and loan approval times. A hospital cares about patient triage accuracy and bed turnover. A retailer cares about cart abandonment and conversion rates. You can't build a demo for every vertical."*

🎤 *"**Two** — Setting up a realistic demo environment takes weeks. You need services, you need data flowing, you need dashboards. Most of us resort to PowerPoint and say 'imagine this...'"*

🎤 *"**Three** — The C-suite doesn't speak MELT. They speak revenue, risk, cost, and customer experience. We need to translate observability into their language."*

🎤 *"The Forge solves all three. Let me show you."*

---

## 3. What Is the Business Observability Forge?

**[SLIDE: Architecture Overview]**

🎤 *"The Business Observability Forge is an AI-powered customer journey simulation engine. There are two parts:"*

🎤 *"**The Engine** — a Node.js server that runs on any VM, EC2 instance, or even a laptop. It dynamically spawns real microservices that simulate customer journeys. We're not mocking anything — these are real HTTP services, with real trace propagation, real errors, real latency."*

🎤 *"**The Forge UI** — a Dynatrace AppEngine application that gives you a single pane of glass to control everything. Build journeys, inject chaos, generate dashboards, export executive summaries."*

💡 **Key architecture points to emphasise:**
- Each journey step becomes its own microservice (separate process, separate port)
- OneAgent auto-detects each service and creates full Smartscape topology
- Service-to-service HTTP calls create real distributed traces
- Business events are emitted at every step with revenue/KPI context
- 256+ pre-built journey templates across 55 industry verticals

🎤 *"Think of it as a business observability sandbox that makes any customer meeting feel like you've been running their platform for months."*

**[SLIDE: The Numbers]**

| Metric | Value |
|--------|-------|
| Industry Verticals | 55 |
| Pre-built Journey Templates | 256+ |
| Journey Steps per Template | 5–8 per journey |
| BizEvent Field Schemas | Industry-specific per vertical |
| AI Agents | 4 (Nemesis, Fix-It, Librarian, Dashboard) |
| Setup Time | < 15 minutes |

---

## 4. Live Demo: Zero to Business Observability

### Demo Flow Overview

| Time | What You Show | What You Say |
|------|---------------|-------------|
| 0:00 | Forge UI Home tab | "Let me show you how fast this is" |
| 1:00 | Select industry vertical | "Let's say our customer is a retail bank" |
| 2:00 | Journey auto-generates | "6 services just spun up — real processes" |
| 3:00 | Dynatrace Services view | "OneAgent already detected them all" |
| 5:00 | Smartscape topology | "Full service flow — no config needed" |
| 7:00 | Business events flowing | "Every transaction carries revenue context" |
| 9:00 | Dashboard auto-generated | "AI just built a dashboard from the data" |
| 12:00 | Inject chaos | "Now let's break something and see the business impact" |
| 14:00 | Executive PDF export | "And here's the PDF for their C-suite" |

---

### Step 1: Open the Forge UI (1 min)

🖥️ *Open Dynatrace tenant → Apps → Business Observability Forge*

🎤 *"This is the Forge. It lives inside Dynatrace as a native app. Everything you see here — the journey builder, the chaos controls, the solutions library — it's all integrated."*

🖥️ *Show the 8 tabs: Home, Solutions, Forge Dashboards, Services, Chaos Control, Fix-It Agent, Demo Guide, Settings*

---

### Step 2: Pick an Industry & Launch a Journey (2 min)

🖥️ *Navigate to Home tab → Select industry vertical (e.g., "Retail Banking") → Select journey type (e.g., "Loan Application")*

🎤 *"I'm going to pick Retail Banking — Loan Application journey. Watch what happens."*

🖥️ *Click Generate/Launch. Show the services spinning up in the terminal or Services tab.*

🎤 *"In about 10 seconds, the Forge just created 6 independent microservices:"*

| Step | Service Name | What It Simulates |
|------|-------------|-------------------|
| 1 | ApplicationSubmissionService | Customer fills out loan application |
| 2 | CreditCheckService | AI credit scoring and bureau check |
| 3 | DocumentVerificationService | ID and income verification |
| 4 | UnderwritingDecisionService | AI underwriting model decision |
| 5 | LoanApprovalService | Final approval and terms generation |
| 6 | FundsDisbursementService | Funds transfer to customer account |

🎤 *"Each one is a real Node.js process. Each one has its own port, its own OneAgent identity, its own error profile. And they're calling each other over HTTP — exactly like a real distributed system."*

---

### Step 3: Show Dynatrace Service Detection (3 min)

🖥️ *Switch to Dynatrace → Services → Filter by DT_TAGS or service name*

🎤 *"Here's the magic. I didn't configure anything in Dynatrace. OneAgent detected all 6 services automatically. Each one has:"*
- *"Its own service entry in Smartscape"*
- *"Request-level distributed traces"*
- *"Failure rate, response time, throughput — all automatic"*

🖥️ *Click into Smartscape → Show the service flow*

🎤 *"Look at this topology. You can see the full loan application flow — from submission through to funds disbursement. This is generated from real HTTP traffic, not a static diagram."*

⚠️ **MANAGED CALLOUT:**  
🎤 *"And here's what's important for your Managed customers — **this entire service detection, Smartscape topology, and distributed tracing works identically on Managed.** No Grail required. OneAgent does all of this natively."*

---

### Step 4: Show Business Events (2 min)

🖥️ *Show the business events flowing — either via DQL notebook (SaaS demo) or explain the concept with a BizEvent JSON sample*

🎤 *"Every step in that journey emits a structured business event. Here's what one looks like:"*

```json
{
  "event.type": "BIZ_EVENT",
  "event.provider": "bizobs-forge",
  "companyName": "First National Bank",
  "journeyType": "Loan Application",
  "stepName": "CreditCheck",
  "orderTotal": 45000,
  "customerLifetimeValue": 128000,
  "conversionRate": 78,
  "approvalTime": 4.2,
  "riskScore": 0.23,
  "channel": "mobile_app",
  "customerSegment": "Prime"
}
```

🎤 *"Notice what's in there — it's not just technical metrics. It's loan value, customer lifetime value, conversion rate, risk score. This is the language the CFO speaks."*

💡 **Partner value prop:** *"When your customer sees their data in Dynatrace with revenue context, the conversation shifts from 'nice monitoring tool' to 'this is how we measure business outcomes.'"*

⚠️ **MANAGED CALLOUT:**  
🎤 *"For Managed customers — the BizEvent **ingestion** works. The events are sent. What you'll need on Managed is to leverage custom metrics and the Events API to surface this data in Classic dashboards. On SaaS with Grail, you get DQL querying of these events for free."*

---

### Step 5: AI Dashboard Generation (3 min)

🖥️ *Navigate to Forge Dashboards tab → Click "Generate Dashboard" for the active journey*

🎤 *"Now watch this. I'm going to ask the AI to build me a dashboard for this loan application journey."*

🖥️ *Show the dashboard generating — tiles appearing with DQL queries*

🎤 *"The AI looked at the journey data — it found fields like approvalTime, riskScore, conversionRate, customerLifetimeValue — and it automatically created:"*
- *"A revenue trend tile showing loan values over time"*
- *"A conversion funnel from application to disbursement"*  
- *"An AI model accuracy tile for credit scoring"*
- *"A customer segment breakdown"*

🎤 *"I didn't write a single DQL query. The AI did it all from the journey schema."*

💡 **This is a SaaS/Grail feature.** For the Managed audience, frame it as: *"This is what's coming when you move to SaaS, and it's a powerful reason to start that conversation with your customers today."*

---

### Step 6: Executive PDF Export (2 min)

🖥️ *Click "Export Executive Summary" → Show the generated PDF*

🎤 *"And because we know partners need to leave something behind after a meeting — the Forge generates a polished executive PDF."*

🎤 *"Look at this. It's branded, it's got the customer's company name, it maps each journey step to observability signals, and — this is the best part — it auto-generates ROI language specific to their industry:"*

> *"AI credit decisioning reduced false decline rates by 12%, recovering $2.3M in previously blocked legitimate transactions. Meanwhile, fraud detection maintained 99.7% accuracy, preventing $8.4M in losses this quarter."*

🎤 *"That PDF goes straight to the C-suite. You're not just showing a demo — you're leaving behind a business case."*

---

## 5. The 55 Industry Verticals

**[SLIDE: Vertical Grid]**

🎤 *"Let's talk about coverage. The Forge ships with 55 industry verticals. That's not 55 slight variations — each one has:"*
- *"Industry-specific journey templates with realistic step names"*
- *"Custom BizEvent schemas with domain-relevant fields"*  
- *"Tailored KPIs and ROI language"*
- *"Pre-built integration references (Epic for healthcare, FIS for banking, SAP for manufacturing)"*

🎤 *"Let me highlight a few that partners tell me resonate most:"*

### Top Verticals for Partner Conversations

| Vertical | Why It Resonates | Key Demo Hook |
|----------|-----------------|---------------|
| **Retail Banking** | Every bank is doing AI credit scoring | "Show the false positive rate on fraud detection — that's money left on the table" |
| **Healthcare** | AI clinical decision support is exploding | "Is your AI triage system accurate? Prove it with observability" |
| **E-commerce & Retail** | Cart abandonment is universal | "Every 100ms of latency costs 1% conversion — let's measure that" |
| **Insurance** | Claims processing is ripe for AI | "Straight-through processing rate is your profitability driver" |
| **Telecommunications** | Network + digital experience | "5G slice performance directly impacts enterprise SLA revenue" |
| **Automotive & Mobility** | Connected vehicles, OTA updates | "Over-the-air update success rate by vehicle model and region" |
| **Airlines & Aviation** | Complex multi-step journeys | "Check-in flow abandonment at document verification = lost ancillary revenue" |
| **Energy & Utilities** | Smart meter and grid AI | "Predictive maintenance catching failures before outages saves millions" |
| **Pharmaceuticals** | Clinical trial AI acceleration | "AI patient matching reduced Phase III enrollment time by 40%" |
| **Government & Public Sector** | Digital transformation mandates | "Citizen portal uptime during benefit enrollment periods" |

🎤 *"And because every vertical has pre-built journey templates, you're not starting from scratch. You pick the industry, pick the journey, and the Forge does the rest."*

---

## 6. Chaos Engineering & AI Remediation

**[SLIDE: "What Happens When Things Break?"]**

🎤 *"Observability isn't just about watching things work. It's about understanding what happens when they don't. That's where Nemesis and Fix-It come in."*

### Demo: Inject Chaos (3 min)

🖥️ *Navigate to Chaos Control tab → Select a service (e.g., CreditCheckService) → Inject "Service Unavailable" error at 80% rate*

🎤 *"I'm going to break the credit check service. 80% of requests will now fail with a 503."*

🖥️ *Wait 30 seconds → Show in Dynatrace:*
- *Service failure rate spike*
- *Davis AI problem detection*
- *Distributed trace showing the failed call*

🎤 *"Within seconds, Davis detected the problem. But here's what makes this different from a generic load test — look at the business impact:"*

🎤 *"The dashboard now shows: 'Credit check failures are blocking loan approvals. Estimated revenue impact: £340K per hour in delayed disbursements. 23 customers affected in the Prime segment.'"*

🎤 *"That's not a technical alert. That's a board-level conversation."*

⚠️ **MANAGED CALLOUT:**  
🎤 *"Chaos injection, service failure detection, Davis AI problem detection — **all of this works on Managed.** Your customers can see the service break, see Davis open a problem, and see the distributed trace. The business impact overlay is a SaaS enhancement, but the core observability story is fully Managed-compatible."*

### Nemesis Agent Capabilities

| Chaos Type | What It Does | Business Impact |
|-----------|-------------|-----------------|
| Service Unavailable (503) | Returns server errors | Blocked transactions, revenue loss |
| Timeout (504) | Artificial response delay | Customer abandonment, SLA breach |
| Connection Refused | Service won't accept connections | Cascading failures, queue buildup |
| Internal Error (500) | Application crashes | Data inconsistency, retry storms |
| Slow Response | 2-10x latency injection | UX degradation, conversion drop |
| Circuit Breaker Trip | Stops calling downstream | Graceful degradation test |

### Fix-It Agent

🎤 *"And then Fix-It kicks in. It's an autonomous remediation agent that:"*
- *"Detects the Dynatrace problem"*
- *"Correlates it with the business impact (which journey, which step, how much revenue)"*
- *"Triggers a remediation workflow — restart the service, roll back a feature flag, escalate to on-call"*
- *"Logs everything to the Librarian for audit trail"*

🎤 *"So you're showing the customer: Dynatrace doesn't just find the problem — it fixes it and tells you the cost of the incident."*

---

## 7. What This Means for Managed Customers

**[SLIDE: "Managed-Ready Features"]**

🎤 *"I know many of your customers are on Dynatrace Managed. Let me be clear about what works today and what's the path forward."*

### Works on Managed TODAY

| Feature | How |
|---------|-----|
| **Real microservice generation** | OneAgent detects every spawned service |
| **Full Smartscape topology** | Service-to-service HTTP creates natural topology |
| **Distributed tracing** | Traces propagate across all journey steps |
| **Davis AI problem detection** | Works identically on Managed |
| **Chaos engineering** | Feature flag injection — break services, see Davis react |
| **Service splitting** | DT_TAGS + DT_APPLICATION_ID for per-service identity |
| **Custom events** | Events API v2 for business context |
| **Executive PDF export** | Generated from journey data — no Grail needed |
| **256+ journey templates** | All templates work — they generate real services |

### Enhanced on SaaS / Grail

| Feature | What SaaS Adds |
|---------|---------------|
| **Business event querying** | DQL: `fetch bizevents` for revenue analytics |
| **AI dashboard generation** | Auto-built dashboards with DQL tiles |
| **Forge UI (AppEngine)** | Native in-tenant control plane |
| **DQL notebooks** | Ad-hoc business analysis |
| **Davis AI + Grail** | Enhanced root cause with entity relationships |

🎤 *"The story for Managed customers is: **you can run the Forge today and get full-stack observability with real services, real traces, real problems.** And when they're ready to explore SaaS, the business events and AI dashboards become the unlock that justifies the move."*

🎤 *"It's not an either/or — it's a migration accelerator."*

---

## 8. Close & Call to Action

**[SLIDE: "Get Started"]**

🎤 *"So here's what I want you to take away:"*

🎤 *"**One** — Next time a customer says 'show me business observability,' you don't need to build anything. Open the Forge, pick their industry, and you have a live demo in minutes."*

🎤 *"**Two** — The executive PDF is your leave-behind. It speaks CFO language with ROI numbers specific to their vertical. That PDF does more than any slide deck."*

🎤 *"**Three** — This is a conversation starter for SaaS migration. Show them what Managed gives them today, then show them the DQL dashboards and Grail analytics as the 'and here's what's next' story."*

🎤 *"**Four** — The Forge covers 55 verticals with 256 journey templates. Whatever customer walks through your door tomorrow — banking, healthcare, retail, manufacturing, energy, government — you're ready."*

**[SLIDE: Contact / Setup]**

🎤 *"The Forge is available now. Setup takes 15 minutes on any Linux VM with Node.js. I'm happy to walk anyone through it after this session."*

🎤 *"Questions?"*

---

## Appendix A: All 55 Industry Verticals

### Financial Services
1. Retail Banking
2. Wealth Management & Investment
3. Payments & Fintech
4. Insurance — Retail
5. Accounting & Audit
6. Lottery & Regulated Betting

### Healthcare & Life Sciences
7. Healthcare & Life Sciences
8. Pharmaceuticals & Life Sciences
9. Veterinary & Animal Health

### Retail & Consumer
10. E-commerce & Retail
11. Fashion & Luxury
12. Food & Beverage
13. Beauty & Cosmetics
14. Fitness & Wellness
15. Food Delivery & Quick Commerce
16. Hospitality & Travel
17. Gaming & Entertainment

### Travel & Transport
18. Airlines & Aviation
19. Automotive & Mobility
20. Railway & Public Transit
21. Ride-hailing & Mobility
22. Shipping & Maritime
23. EV & Charging Infrastructure
24. Logistics & Supply Chain

### Industrial & Manufacturing
25. Industrial Manufacturing
26. Construction & Engineering
27. Mining & Natural Resources
28. Chemical & Petrochemical
29. Semiconductors & Chips
30. Defence & Aerospace
31. Agriculture & AgriTech

### Utilities & Energy
32. Energy & Utilities
33. Water & Wastewater
34. Waste Management & Recycling

### Technology & Infrastructure
35. Data Centres & Cloud Infrastructure
36. Cybersecurity
37. Telecommunications
38. Smart Cities & Urban Planning
39. Robotics & Warehouse Automation
40. Space & Satellite

### Education & Professional Services
41. Education & Learning
42. Government & Public Sector
43. Consulting & Professional Services
44. Legal Services

### Media & Digital
45. Media & Entertainment
46. Publishing & News
47. Music & Audio
48. Advertising & MarTech
49. Social Media & Platforms
50. Online Marketplaces
51. Real Estate & Property

### Human Services & HR
52. HR & Workforce
53. Nonprofit & Public Health

### Emerging
54. Environmental & ESG
55. Business Observability Platform (Meta)

---

## Appendix B: Demo Cheat Sheet

### Pre-Demo Checklist

```
[ ] Server running: curl http://localhost:8080/health
[ ] At least one journey active (check Services tab)
[ ] Dynatrace tenant accessible in browser
[ ] Forge UI loads (Apps → Business Observability Forge)
[ ] Ollama running (optional — for AI dashboard generation)
[ ] Have a PDF pre-generated as backup (in case of network issues)
```

### Quick Commands

```bash
# Check server health
curl -s http://localhost:8080/health | python3 -m json.tool

# Check running services
curl -s http://localhost:8080/api/admin/services/status | python3 -m json.tool

# Check feature flags (chaos injection status)
curl -s http://localhost:8080/api/feature_flag | python3 -m json.tool

# Emergency: stop all services and restart clean
curl -X POST http://localhost:8080/api/admin/services/stop-everything
```

### Key URLs

| Resource | URL |
|----------|-----|
| Forge UI | `https://<tenant>.apps.dynatracelabs.com/ui/apps/my.bizobs.generator.master` |
| Engine Health | `http://localhost:8080/health` |
| Dynatrace Services | `https://<tenant>/ui/services` |
| Smartscape | `https://<tenant>/ui/smartscape` |

### Demo Recovery Scripts

**If a journey won't start:**
```bash
curl -X POST http://localhost:8080/api/admin/reset-and-restart
```

**If too many services are running (port exhaustion):**
```bash
curl -X POST http://localhost:8080/api/admin/services/stop-everything
# Then start fresh with just one journey
```

**If you need to kill chaos injection mid-demo:**
```bash
curl -X POST http://localhost:8080/api/feature_flag \
  -H "Content-Type: application/json" \
  -d '{"errors_per_transaction": 0}'
```

---

## Appendix C: Solutions Deep Dive — Partner Reference

### Healthcare & Life Sciences Solution

**Tagline:** *"Prove AI is improving patient outcomes — not just generating cost"*

**Pre-Built Integrations:**
- **Epic EHR** — AI clinical decision support, MyChart AI triage, predictive sepsis detection, ambient clinical documentation
- **Cerner (Oracle Health)** — AI-assisted clinical alerts, medical coding accuracy, Health Data Intelligence
- **Meditech** — Clinical surveillance AI, predictive patient flow, documentation, charge capture

**Key KPIs to Demo:**
- AI recommendation acceptance rate vs. override rate by department
- MyChart AI triage confidence scores & escalation accuracy
- Predictive sepsis model early warning effectiveness
- FHIR API response times for AI consumers

**ROI Language:**
> *"AI sepsis prediction caught 23 true positives this month with 4-hour early warning, preventing an estimated £180K in adverse outcome costs. However, the false alarm rate of 18% is causing alert fatigue in ICU — a tuning opportunity worth £45K in nursing time recovery."*

---

### Retail Banking Solution

**Tagline:** *"Prove AI is driving revenue and reducing risk — not just hype"*

**Pre-Built Integrations:**
- **FIS** — Core banking, fraud detection, credit decisioning, payment routing
- **Temenos** — Core banking AI features
- **Finastra** — Risk management, trading

**Key KPIs to Demo:**
- AI fraud model false positive rate and blocked legitimate transaction revenue
- AI credit decision accuracy vs actual 90-day default rates
- AI payment routing approval rate lift %
- AI chatbot containment rate & escalation patterns

**ROI Language:**
> *"AI fraud detection prevented £8.4M in losses this quarter. False positives blocked only £890K in legitimate transactions — a 10.6:1 return. Meanwhile, AI credit decisioning reduced false decline rates by 12%, recovering £2.3M in previously blocked applications."*

---

### Pharmaceutical & Life Sciences Solution

**Tagline:** *"Prove AI is accelerating discovery and reducing compliance risk"*

**Pre-Built Integrations:**
- **IQVIA** — AI trial design, patient matching, OCT automation, RWE NLP
- **SAP S/4HANA** — AI demand forecasting, predictive quality, intelligent supply chain
- **Regulatory Systems** — AI pharmacovigilance, safety signal detection

**Key KPIs to Demo:**
- AI patient matching precision/recall for clinical trial enrollment
- Demand forecast accuracy (MAPE) by product line
- Batch release automation time vs manual inspection
- Cold chain optimization cost savings

**ROI Language:**
> *"AI demand forecasting achieved 94.2% accuracy (MAPE 5.8%), reducing overstock waste by £4.7M annually while maintaining 99.2% fill rate. Meanwhile, AI patient matching reduced Phase III enrollment time by 40%, accelerating time-to-market by an estimated 6 months — worth £28M+ in extended patent exclusivity revenue."*

---

## Appendix D: Talking Points for Common Questions

### "Does this work on Managed?"

> *"Absolutely — the core engine works identically. You get real microservices, full Smartscape topology, distributed traces, Davis problem detection, and chaos engineering. The business event querying and AI dashboards are SaaS/Grail features, but everything else runs out of the box. In fact, many partners use this as the migration conversation — show the customer what they get today, then show the SaaS unlock."*

### "How long does setup take?"

> *"15 minutes. You need a Linux VM with Node.js, a Dynatrace tenant, and an API token. Run the setup script, answer 6 prompts, and you're live. We've had partners set this up during a lunch break before an afternoon customer meeting."*

### "Can I use this for a POC?"

> *"That's exactly what it's designed for. Pick the customer's industry, generate their journey, let it run for a day. You'll have real Dynatrace data — services, traces, problems, business events — that demonstrates exactly what their production observability would look like. The executive PDF becomes your POC summary document."*

### "What if the customer's industry isn't in the 55 verticals?"

> *"It almost certainly is — we cover everything from retail banking to space & satellite to veterinary clinics. But even if it's niche, you can create a custom journey with the AI generator. Describe the business process in plain English, and the Forge generates the services, BizEvent schema, and dashboard automatically."*

### "Does the customer need to install anything?"

> *"No — the Forge runs on YOUR infrastructure. The customer sees the results in their Dynatrace tenant (or yours for demo purposes). There's nothing to install on their side. You're just generating realistic observability data that demonstrates the platform's capabilities."*

### "What about data privacy / compliance?"

> *"All data is synthetic. Company names, customer profiles, transaction values — everything is generated. No real customer data is involved. You can safely demo this in any regulated environment."*

### "Can I run this for multiple customers simultaneously?"

> *"Yes — the Forge supports multiple companies running concurrently. Each company gets its own set of services with isolated OneAgent identities. You can run a banking demo and a healthcare demo side by side on the same instance."*

---

## Appendix E: 90-Second Power Demo Script

*For when you only have 90 seconds at a booth or in a hallway conversation:*

🎤 *"Let me show you something. Give me an industry — any industry."*

*[They say "Insurance"]*

🖥️ *Open Forge → Select Insurance — Claims Processing → Launch*

🎤 *"In 10 seconds, 6 real microservices just spun up simulating a claims journey — from first notice of loss through to settlement. OneAgent detected them all automatically."*

🖥️ *Show Dynatrace Services view — 6 new services visible*

🎤 *"Every claim emits a business event with claim value, customer segment, fraud risk score. The AI built this dashboard showing settlement time by claim type and fraud detection accuracy."*

🖥️ *Show the dashboard*

🎤 *"Now I'll break the fraud detection service."*

🖥️ *Inject chaos → Show Davis problem appear*

🎤 *"Davis caught it in seconds. But look at the business impact — £240K in claims are stuck in queue because fraud check is down. That's the number your customer's CFO cares about."*

🎤 *"This works on Managed today. 55 industries, 256 templates. Ready to go."*

---

*Document generated: March 31, 2026 | Business Observability Forge v2.22.5*
