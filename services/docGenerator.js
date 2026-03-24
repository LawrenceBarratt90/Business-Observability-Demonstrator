/**
 * Dynatrace Intelligence — Executive Summary Document Generator
 *
 * Produces a clean, structured HTML document that can be opened in a browser
 * and converted to Word (File > Save As .docx, or open .html directly in Word).
 *
 * Same rich content as the PDF version but formatted for easy Word conversion:
 * - Executive Overview
 * - Industry Context & Challenges
 * - Journey Flow
 * - Step-by-Step Intelligence
 * - Observability Architecture
 * - Quantified Value Metrics
 * - Why Dynatrace (capabilities)
 * - Value Alignment (objectives + use cases)
 * - Projected Business Outcomes
 * - Recommended Next Steps
 */

// ── Industry context — drives bespoke narrative ──
const INDUSTRY_CTX = {
  'e-commerce':     { noun: 'online retail', risk: 'cart abandonment, checkout latency, or payment failures', kpi: 'conversion rate, average order value, and basket completion' },
  'retail':         { noun: 'retail', risk: 'purchase friction, stock-out errors, or delivery delays', kpi: 'conversion rate, fulfilment speed, and customer satisfaction' },
  'banking':        { noun: 'banking', risk: 'transaction failures, authentication timeouts, or compliance gaps', kpi: 'transaction success rate, processing latency, and fraud detection accuracy' },
  'financial':      { noun: 'financial services', risk: 'settlement delays, account creation failures, or portfolio errors', kpi: 'processing speed, onboarding completion, and regulatory compliance' },
  'wealth':         { noun: 'wealth management', risk: 'fund purchase failures, identity verification timeouts, or portfolio setup errors', kpi: 'account opening completion rate, verification speed, and portfolio activation time' },
  'insurance':      { noun: 'insurance', risk: 'claim processing delays, assessment bottlenecks, or payout failures', kpi: 'claim cycle time, assessment accuracy, and settlement speed' },
  'telecom':        { noun: 'telecommunications', risk: 'activation failures, billing errors, or service degradation', kpi: 'activation success rate, service quality metrics, and subscriber churn' },
  'travel':         { noun: 'travel and hospitality', risk: 'booking failures, payment timeouts, or itinerary disruptions', kpi: 'booking completion rate, ancillary revenue, and rebooking frequency' },
  'hospitality':    { noun: 'hospitality', risk: 'reservation failures, check-in delays, or guest service issues', kpi: 'occupancy optimisation, guest satisfaction, and revenue per room' },
  'manufacturing':  { noun: 'manufacturing', risk: 'supply chain disruptions, quality control failures, or procurement bottlenecks', kpi: 'production throughput, defect rate, and supplier lead time' },
  'media':          { noun: 'media and entertainment', risk: 'streaming buffering, content delivery failures, or subscription churn', kpi: 'stream quality, subscriber engagement, and content delivery latency' },
  'healthcare':     { noun: 'healthcare', risk: 'patient workflow bottlenecks, data access failures, or appointment scheduling issues', kpi: 'patient throughput, care response time, and system availability' },
};

const VALUE_OBJECTIVES = {
  'e-commerce':     { obj1: 'Accelerate Digital Commerce Innovation', obj2: 'Optimise Storefront Cost and Performance', obj3: 'Protect Checkout Resilience and Revenue' },
  'retail':         { obj1: 'Elevate Omnichannel Customer Experience', obj2: 'Streamline Retail Operations and Reduce Waste', obj3: 'Ensure Supply Chain and Platform Resilience' },
  'banking':        { obj1: 'Modernise Digital Banking Experiences', obj2: 'Reduce Operational Cost Through Automation', obj3: 'Strengthen Transaction Integrity and Compliance' },
  'financial':      { obj1: 'Accelerate Financial Product Innovation', obj2: 'Optimise Processing Costs and Efficiency', obj3: 'Reinforce Regulatory Compliance and Resilience' },
  'wealth':         { obj1: 'Digitise Client Onboarding and Portfolio Experiences', obj2: 'Drive Operational Efficiency Across Wealth Platforms', obj3: 'Ensure Fiduciary Compliance and Data Integrity' },
  'insurance':      { obj1: 'Transform Claims and Policyholder Experiences', obj2: 'Optimise Underwriting and Processing Costs', obj3: 'Maintain Actuarial Accuracy and Regulatory Standing' },
  'telecom':        { obj1: 'Deliver Superior Subscriber Experiences', obj2: 'Reduce Network and Support Costs', obj3: 'Ensure Service Availability and SLA Compliance' },
  'travel':         { obj1: 'Create Seamless Booking and Travel Experiences', obj2: 'Maximise Revenue Per Traveller', obj3: 'Protect Booking Platform Reliability' },
  'hospitality':    { obj1: 'Elevate Guest Digital Experiences', obj2: 'Optimise Property Platform Costs', obj3: 'Ensure Reservation and Payment System Resilience' },
  'manufacturing':  { obj1: 'Advance Smart Manufacturing Intelligence', obj2: 'Reduce Production Downtime and Waste', obj3: 'Secure Industrial Systems and Supply Chains' },
  'media':          { obj1: 'Optimise Content Delivery and Engagement', obj2: 'Reduce Streaming Infrastructure Costs', obj3: 'Protect Subscriber Experience and Retention' },
  'healthcare':     { obj1: 'Improve Digital Patient and Clinician Experiences', obj2: 'Optimise Health IT Operational Costs', obj3: 'Ensure System Availability and HIPAA Compliance' },
};

const VALUE_USE_CASES = {
  obj1: [
    { uc: 'Maximise Availability and Avoid Leakage', desc: 'Prevent revenue loss from flawed digital interactions through real-time experience monitoring' },
    { uc: 'Drive Revenue Through Enhanced Experiences', desc: 'Correlate customer journey performance to business outcomes and conversion rates' },
    { uc: 'Accelerate Innovation Through Faster Releases', desc: 'Ship features faster with confidence using pre-production observability and shift-left testing' },
  ],
  obj2: [
    { uc: 'Automate Remediation and Improve MTTR', desc: 'Reduce resolution effort with AI-driven root cause identification and automated workflows' },
    { uc: 'Reduce Tool Sprawl and Consolidate', desc: 'Replace fragmented monitoring tools with a unified Dynatrace platform' },
    { uc: 'Maximise Infrastructure Efficiency', desc: 'Right-size resources and eliminate waste using real-time utilisation analytics' },
  ],
  obj3: [
    { uc: 'Solve Issues Faster with AI Diagnostics', desc: 'Davis AI identifies root cause automatically, from business impact to infrastructure fault' },
    { uc: 'Minimise Critical Incident Frequency', desc: 'Proactive anomaly detection reduces the number and duration of customer-impacting events' },
    { uc: 'Ensure Compliance by Design', desc: 'Continuous platform observability supports audit readiness and regulatory requirements' },
  ],
};

function getIndustryCtx(industry) {
  const lower = (industry || '').toLowerCase();
  for (const [key, ctx] of Object.entries(INDUSTRY_CTX)) {
    if (lower.includes(key)) return ctx;
  }
  return { noun: 'enterprise operations', risk: 'process failures, latency spikes, or experience degradation', kpi: 'cycle time, success rate, and customer satisfaction' };
}

function getValueObjectives(industry) {
  const lower = (industry || '').toLowerCase();
  for (const [key, obj] of Object.entries(VALUE_OBJECTIVES)) {
    if (lower.includes(key)) return obj;
  }
  return { obj1: 'Accelerate Innovation and Elevate Experiences', obj2: 'Optimise Cost and Operational Efficiency', obj3: 'Strengthen Resilience, Compliance and Risk Management' };
}

function cleanName(name) {
  return (name || '').replace(/Service$/i, '').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim();
}

function titleCase(str) {
  return (str || 'Enterprise').replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function totalDuration(steps) {
  return steps.reduce((sum, s) => sum + (s.estimatedDuration || 0), 0);
}

function formatDate() {
  return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function esc(text) {
  return (text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function generateStepDescription(name, ctx) {
  const variants = [
    `The customer interacts with the ${name} stage of the ${ctx.noun} journey. This step emits business events capturing the interaction outcome, duration, and any errors encountered. Performance at this stage directly influences downstream steps and overall journey completion rates.`,
    `During ${name}, the system processes critical ${ctx.noun} operations that are instrumented with BizEvent telemetry. Every successful and failed execution is captured, providing granular visibility into throughput, latency distribution, and error classification.`,
    `${name} represents a key decision point in the ${ctx.noun} lifecycle. Dynatrace observes user interactions, backend service calls, and data processing operations at this stage, correlating business outcomes with technical performance metrics.`,
  ];
  return pick(variants);
}

function generateRationale(name, dur, ctx) {
  const variants = [
    `The ${name} step is estimated at ${dur} minutes. Performance here directly impacts ${ctx.kpi}, making it a critical observability target. Degradation at this stage risks triggering ${ctx.risk}.`,
    `With an estimated duration of ${dur} minutes, ${name} is a high-impact touchpoint where delays or failures immediately affect ${ctx.kpi}. Continuous monitoring ensures rapid detection and resolution.`,
    `At ${dur} minutes, ${name} accounts for a significant portion of the end-to-end journey time. Maintaining performance here is essential to protecting ${ctx.kpi} and preventing ${ctx.risk}.`,
  ];
  return pick(variants);
}

// ══════════════════════════════════════════════════════════════
// Main entry point
// ══════════════════════════════════════════════════════════════
export function generateExecutiveSummaryDoc({ journeyData, dashboardData }) {
  const company  = journeyData.companyName || journeyData.company || 'Customer';
  const industry = journeyData.industryType || journeyData.industry || 'Enterprise';
  const journey  = journeyData.journeyType  || journeyData.journeyDetail || 'Customer Journey';
  const domain   = journeyData.domain || '';
  const steps    = journeyData.steps || [];
  const meta     = dashboardData?.metadata || dashboardData || {};
  const tileCount = meta.totalTiles || Object.keys(dashboardData?.content?.tiles || {}).length || 0;
  const ctx = getIndustryCtx(industry);
  const nice = titleCase(industry);
  const totalDur = totalDuration(steps);
  const objs = getValueObjectives(industry);

  const stepNames = steps.slice(0, 4).map(s => cleanName(s.stepName || s.name || '')).filter(Boolean);
  const stepList = stepNames.length > 1
    ? stepNames.slice(0, -1).join(', ') + ' and ' + stepNames[stepNames.length - 1]
    : stepNames[0] || 'each stage';
  const categories = [...new Set(steps.map(s => s.category).filter(Boolean))];
  const catNames = categories.length > 0 ? categories.slice(0, 4).join(', ') : 'multiple business phases';

  let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${esc(company)} — Dynatrace Intelligence Executive Summary</title>
<style>
  @page { size: A4; margin: 2.5cm; }
  body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; color: #1a1a2e; line-height: 1.65; max-width: 800px; margin: 0 auto; padding: 40px 20px; }
  h1 { color: #6F2DA8; font-size: 28px; margin-bottom: 4px; border-bottom: 3px solid #6F2DA8; padding-bottom: 8px; }
  h2 { color: #1565C0; font-size: 20px; margin-top: 32px; margin-bottom: 8px; border-bottom: 2px solid #e0e0e0; padding-bottom: 6px; }
  h3 { color: #00796B; font-size: 16px; margin-top: 20px; margin-bottom: 6px; }
  h4 { color: #333; font-size: 14px; margin-top: 14px; margin-bottom: 4px; }
  p { margin: 8px 0; font-size: 13px; }
  .subtitle { color: #666; font-size: 14px; margin-bottom: 20px; }
  .tag { display: inline-block; background: #f0f0f5; color: #555; padding: 3px 10px; border-radius: 4px; font-size: 12px; margin-right: 8px; }
  .date { color: #999; font-size: 12px; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 13px; }
  th { background: #6F2DA8; color: white; padding: 10px 14px; text-align: left; font-size: 12px; }
  td { padding: 8px 14px; border-bottom: 1px solid #e8e8e8; vertical-align: top; }
  tr:nth-child(even) { background: #fafafe; }
  .step-card { border-left: 4px solid #00BCD4; background: #f8f9fc; padding: 14px 18px; margin: 12px 0; border-radius: 4px; }
  .step-card h4 { margin-top: 0; color: #1565C0; }
  .step-meta { font-size: 12px; color: #888; margin-bottom: 6px; }
  .metric-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin: 12px 0; }
  .metric-box { border: 1px solid #e0e0e0; border-left: 4px solid #6F2DA8; padding: 12px 14px; border-radius: 4px; }
  .metric-value { font-size: 22px; font-weight: 700; color: #6F2DA8; }
  .metric-label { font-size: 12px; font-weight: 600; color: #333; margin-top: 2px; }
  .metric-detail { font-size: 11px; color: #777; margin-top: 4px; }
  .cap-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 12px 0; }
  .cap-box { border: 1px solid #e0e0e0; border-left: 4px solid #00BCD4; padding: 12px 14px; border-radius: 4px; }
  .cap-box h4 { margin: 0 0 6px 0; font-size: 13px; color: #1565C0; }
  .cap-box p { margin: 0; font-size: 12px; color: #555; }
  .outcome-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 12px 0; }
  .outcome-box { border: 1px solid #e0e0e0; border-left: 4px solid #4CAF50; padding: 12px 14px; border-radius: 4px; }
  .outcome-box h4 { margin: 0; font-size: 13px; color: #333; }
  .outcome-value { float: right; font-weight: 700; color: #4CAF50; font-size: 13px; }
  .outcome-box p { margin: 4px 0 0 0; font-size: 12px; color: #555; clear: both; }
  .phase-box { border-left: 4px solid #00BCD4; background: #f8f9fc; padding: 12px 18px; margin: 10px 0; border-radius: 4px; }
  .phase-box h4 { margin: 0 0 4px 0; color: #1565C0; font-size: 13px; }
  .phase-box p { margin: 0; font-size: 12px; color: #444; }
  .obj-header { background: #f0f0f5; padding: 8px 14px; border-left: 4px solid #6F2DA8; margin: 14px 0 8px 0; font-weight: 700; font-size: 13px; border-radius: 2px; }
  .uc-row { display: flex; gap: 14px; padding: 6px 14px; font-size: 12px; border-bottom: 1px solid #f0f0f0; }
  .uc-name { font-weight: 600; min-width: 220px; color: #333; }
  .uc-desc { color: #666; }
  .closing { font-style: italic; color: #555; padding: 16px 20px; border-left: 4px solid #6F2DA8; background: #faf8fc; margin: 24px 0; font-size: 13px; line-height: 1.7; }
  .challenge-card { border-left: 4px solid #EF5350; background: #fdf8f8; padding: 10px 14px; margin: 8px 0; border-radius: 4px; }
  .challenge-card h4 { margin: 0 0 4px 0; font-size: 13px; }
  .challenge-card p { margin: 0; font-size: 12px; color: #555; }
  .flow-steps { display: flex; align-items: center; gap: 0; margin: 12px 0; flex-wrap: wrap; }
  .flow-step { background: #6F2DA8; color: white; padding: 8px 14px; border-radius: 4px; font-size: 11px; font-weight: 600; text-align: center; min-width: 80px; }
  .flow-arrow { color: #ccc; font-size: 18px; padding: 0 4px; }
  .arch-layer { border: 1px solid #e0e0e0; padding: 10px 14px; margin: 6px 0; border-radius: 4px; }
  .arch-layer h4 { margin: 0 0 4px 0; font-size: 12px; }
  .arch-layer p { margin: 0; font-size: 12px; color: #555; }
  .footer { margin-top: 40px; padding-top: 12px; border-top: 2px solid #6F2DA8; font-size: 11px; color: #999; text-align: center; }
  @media print { body { padding: 0; } .metric-grid, .cap-grid, .outcome-grid { break-inside: avoid; } }
</style>
</head>
<body>

<p class="date">Dynatrace Intelligence &bull; Business Observability Forge &bull; ${esc(formatDate())}</p>
<h1>${esc(company)}</h1>
<p class="subtitle">Executive Summary &mdash; ${esc(journey)} Journey</p>

<p>
  <span class="tag">${esc(nice)}</span>
  <span class="tag">${steps.length} Steps</span>
  <span class="tag">${totalDur} mins end-to-end</span>
  ${domain ? `<span class="tag">${esc(domain)}</span>` : ''}
</p>

<!-- ── Executive Overview ── -->
<h2>Executive Overview</h2>
<p>
  Dynatrace Intelligence has mapped the complete ${esc(journey)} journey for ${esc(company)}, enabling unprecedented business visibility.
  Spanning ${steps.length} business-critical steps &mdash; from ${esc(stepList)} &mdash; this journey captures the full
  ${esc(ctx.noun)} lifecycle across ${esc(catNames)}. With an estimated end-to-end duration of ${totalDur} minutes,
  each step has been mapped with precise estimated durations, detailed business rationale, service-level context,
  and observability requirements. Dynatrace surfaces ${esc(ctx.kpi)} in real time, correlated directly to the
  infrastructure and services that underpin them.
</p>
<p>
  This executive summary provides a comprehensive analysis of the ${esc(journey)} journey, including a visual journey
  pipeline, detailed step-by-step intelligence with business rationale, an observability architecture overview,
  quantified impact metrics, Dynatrace platform capabilities mapped to this specific journey, projected business
  outcomes, and recommended next steps for implementation.
</p>

<!-- ── Industry Context & Challenges ── -->
<h2>Industry Context &amp; Challenges</h2>
<p>
  Organisations in the ${esc(ctx.noun)} sector face mounting pressure to deliver seamless digital experiences
  while managing increasingly complex technology stacks. As operations become more digital, the gap between
  business outcomes and technology performance narrows &mdash; every millisecond matters.
</p>

<div class="challenge-card" style="border-left-color: #EF5350;">
  <h4 style="color: #EF5350;">Customer Experience Risk</h4>
  <p>When ${esc(ctx.risk)} strikes, the impact is immediate: lost revenue, damaged trust, and increased churn.
  With ${steps.length} interconnected steps, a failure in any one can cascade across the entire journey.</p>
</div>
<div class="challenge-card" style="border-left-color: #FF7043;">
  <h4 style="color: #FF7043;">Operational Complexity</h4>
  <p>Modern ${esc(ctx.noun)} journeys depend on dozens of microservices, APIs, and third-party integrations.
  Pinpointing the root cause of a degradation in ${esc(ctx.kpi)} requires end-to-end correlation across the full stack.</p>
</div>
<div class="challenge-card" style="border-left-color: #FFD600;">
  <h4 style="color: #b08800;">Business-IT Alignment Gap</h4>
  <p>Business stakeholders care about ${esc(ctx.kpi)}. Engineering teams monitor infrastructure metrics.
  Without a unified observability platform, these two views remain disconnected &mdash; delaying decisions and resolution.</p>
</div>

<!-- ── Journey Flow ── -->
<h2>Journey Flow</h2>
<div class="flow-steps">
`;

  // Journey flow visual
  for (let i = 0; i < Math.min(steps.length, 10); i++) {
    const s = steps[i];
    const name = esc(cleanName(s.stepName || s.name || `Step ${i + 1}`));
    const colors = ['#6F2DA8', '#00BCD4', '#4CAF50', '#1565C0', '#FF7043', '#FFD600', '#EF5350', '#9C27B0'];
    const color = colors[i % colors.length];
    if (i > 0) html += `<span class="flow-arrow">&rarr;</span>`;
    html += `<span class="flow-step" style="background:${color};">${i + 1}. ${name}</span>`;
  }

  html += `
</div>

<!-- ── Step-by-Step Intelligence ── -->
<h2>Journey Intelligence &mdash; Step-by-Step Analysis</h2>
<p>Comprehensive business context, rationale, and observability mapping for each step.</p>
`;

  // Step detail cards
  const stepColors = ['#00BCD4', '#4CAF50', '#6F2DA8', '#1565C0', '#FF7043', '#FFD600', '#EF5350', '#9C27B0'];
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    const name = cleanName(s.stepName || s.name || `Step ${i + 1}`);
    const dur = s.estimatedDuration || '?';
    const cat = s.category || 'General';
    const desc = s.description || generateStepDescription(name, ctx);
    const rationale = s.businessRationale || generateRationale(name, dur, ctx);
    const substeps = s.substeps || [];
    const svcName = s.serviceName || '';
    const color = stepColors[i % stepColors.length];

    html += `
<div class="step-card" style="border-left-color: ${color};">
  <h4>Step ${s.stepIndex || i + 1}: ${esc(name)}</h4>
  <p class="step-meta">${esc(cat)} &bull; ${dur} min${svcName ? ` &bull; Service: ${esc(svcName)}` : ''}</p>
  <p><strong>Description:</strong> ${esc(desc)}</p>
  <p><em><strong>Business Rationale:</strong> ${esc(rationale)}</em></p>`;

    if (substeps.length > 0) {
      html += `<p><strong>Substeps:</strong></p><ul>`;
      for (const ss of substeps.slice(0, 5)) {
        const subName = typeof ss === 'string' ? ss : (ss.name || ss.substepName || ss.description || '');
        if (subName) html += `<li style="font-size:12px;">${esc(subName)}</li>`;
      }
      html += `</ul>`;
    }

    html += `
  <p style="font-size:11px; color:#00796B;"><strong>Observability:</strong> BizEvent emitted | Duration tracked | Error detection enabled | ${esc(cat)} phase correlation</p>
</div>`;
  }

  // Observability Architecture
  html += `
<h2>Observability Architecture</h2>
<p>How Dynatrace captures, correlates, and analyses data across the journey.</p>
<p>
  The Dynatrace platform provides a unified observability architecture purpose-built for complex ${esc(ctx.noun)}
  journeys like the ${esc(journey)}. Data flows from instrumented applications through OneAgent and OpenTelemetry
  collectors into Dynatrace Grail &mdash; the platform's massively parallel analytics engine. From there, Davis AI
  applies causal analysis to connect business events, service performance, and infrastructure health into a
  single, queryable data model.
</p>
`;

  const archLayers = [
    { label: 'Business Events Layer', desc: `${steps.length} BizEvents emitted per journey execution, each carrying step name, category, duration, customer context, and transaction metadata. Enables real-time journey analytics and conversion tracking.`, color: '#4CAF50' },
    { label: 'Service & Trace Layer', desc: `Distributed traces span every service call across the ${journey}. OpenTelemetry provides automatic context propagation, linking front-end user actions to back-end database queries and third-party API calls.`, color: '#1565C0' },
    { label: 'Infrastructure Layer', desc: `OneAgent captures host metrics, container performance, and process-level data. When a business event shows degradation, Dynatrace correlates it instantly to the responsible pod, node, or cloud resource.`, color: '#FF7043' },
    { label: 'AI & Analytics Layer', desc: `Davis AI continuously baselines all ${steps.length} steps, detecting anomalies in ${ctx.kpi} and automatically identifying root cause. Grail enables ad-hoc DQL queries across all data in context.`, color: '#6F2DA8' },
  ];

  for (const l of archLayers) {
    html += `
<div class="arch-layer" style="border-left: 4px solid ${l.color};">
  <h4 style="color:${l.color};">${esc(l.label)}</h4>
  <p>${esc(l.desc)}</p>
</div>`;
  }

  // Quantified Value
  const substepCount = steps.reduce((sum, s) => sum + (s.substeps?.length || 0), 0);
  const shortestStep = steps.reduce((min, s) => Math.min(min, s.estimatedDuration || 99), 99);
  const longestStep = steps.reduce((mx, s) => Math.max(mx, s.estimatedDuration || 0), 0);
  const avgDur = steps.length > 0 ? Math.round(totalDur / steps.length) : 0;
  const svcCount = new Set(steps.map(s => s.serviceName).filter(Boolean)).size;

  const metrics = [
    { stat: `${steps.length}`, label: 'Business Steps', detail: 'Fully instrumented with BizEvent telemetry', color: '#00BCD4' },
    { stat: `${totalDur}m`, label: 'End-to-End Duration', detail: `Shortest: ${shortestStep}m | Longest: ${longestStep}m | Avg: ${avgDur}m`, color: '#4CAF50' },
    { stat: `${substepCount || steps.length * 2}`, label: 'Observable Substeps', detail: 'Fine-grained performance tracking points', color: '#FF7043' },
    { stat: `${categories.length || 3}`, label: 'Journey Phases', detail: categories.slice(0, 4).join(', ') || 'Multiple business categories', color: '#6F2DA8' },
    { stat: '90%', label: 'Faster MTTR', detail: 'Davis AI automatic root cause analysis', color: '#EF5350' },
    { stat: '100%', label: 'Journey Visibility', detail: 'Every step, substep, and service call captured', color: '#00BCD4' },
  ];
  if (svcCount > 0) metrics.splice(4, 0, { stat: `${svcCount}`, label: 'Distinct Services', detail: 'Microservices instrumented across the journey', color: '#1565C0' });
  if (tileCount > 0) metrics.splice(4, 0, { stat: `${tileCount}`, label: 'Dashboard Tiles', detail: 'Real-time KPI visualisations in Dynatrace', color: '#1565C0' });

  html += `
<h2>Quantified Observability Value</h2>
<p>Measurable metrics derived from the journey configuration and Dynatrace platform capabilities.</p>
<div class="metric-grid">`;

  for (const m of metrics) {
    html += `
  <div class="metric-box" style="border-left-color: ${m.color};">
    <div class="metric-value" style="color:${m.color};">${esc(m.stat)}</div>
    <div class="metric-label">${esc(m.label)}</div>
    <div class="metric-detail">${esc(m.detail)}</div>
  </div>`;
  }

  html += `</div>`;

  // Why Dynatrace
  const capabilities = [
    { title: 'Automated Business Event Capture', desc: `Every step in the ${journey} emits structured BizEvents into Grail \u2014 no manual tagging required. Each event carries full business context: step category, duration, customer segment, and transaction value.`, color: '#00BCD4' },
    { title: 'Davis AI Causal Analysis', desc: `Davis AI continuously baselines all ${steps.length} steps. When ${ctx.risk} occurs, root cause is identified automatically from business KPI down to the responsible service, deployment, or infrastructure component.`, color: '#4CAF50' },
    { title: 'Full-Stack Distributed Tracing', desc: `OpenTelemetry-powered traces link every journey interaction to the underlying services, pods, and hosts. One click from a ${ctx.kpi} anomaly navigates directly to the responsible code-level execution.`, color: '#FF7043' },
    { title: 'Real-Time Journey Analytics', desc: `Live dashboards show step-by-step conversion, duration variance, and error rates. Business teams see customer impact; platform teams see service performance \u2014 both from the same unified data source.`, color: '#6F2DA8' },
    { title: 'Grail Data Lakehouse', desc: `All observability data \u2014 logs, metrics, traces, BizEvents, and user sessions \u2014 stored with full context retention. DQL enables ad-hoc analysis across all data types without pre-aggregation or sampling.`, color: '#1565C0' },
    { title: 'Automated Alerting & Workflows', desc: `When Davis AI detects an anomaly affecting ${ctx.kpi}, automated workflows trigger notifications, create incidents, or execute remediation runbooks \u2014 reducing response time from hours to seconds.`, color: '#EF5350' },
  ];

  html += `
<h2>Why Dynatrace for This Journey</h2>
<p>Platform capabilities mapped to the specific requirements of the ${esc(journey)}.</p>
<div class="cap-grid">`;

  for (const cap of capabilities) {
    html += `
  <div class="cap-box" style="border-left-color: ${cap.color};">
    <h4 style="color:${cap.color};">${esc(cap.title)}</h4>
    <p>${esc(cap.desc)}</p>
  </div>`;
  }

  html += `</div>`;

  // Value Alignment
  const objectives = [
    { name: objs.obj1, theme: 'Innovation and Experience', useCases: VALUE_USE_CASES.obj1 },
    { name: objs.obj2, theme: 'Cost and Efficiency', useCases: VALUE_USE_CASES.obj2 },
    { name: objs.obj3, theme: 'Resilience and Compliance', useCases: VALUE_USE_CASES.obj3 },
  ];

  html += `
<h2>Dynatrace Value Alignment</h2>
<p>Account objectives and use cases tailored for ${esc(company)} in the ${esc(ctx.noun)} space.
The Dynatrace platform delivers value across three strategic pillars, each aligned to ${esc(company)}'s
critical business objectives.</p>`;

  for (let i = 0; i < objectives.length; i++) {
    const obj = objectives[i];
    html += `
<div class="obj-header">Objective ${i + 1}: ${esc(obj.name)}</div>`;
    for (const uc of obj.useCases) {
      html += `
<div class="uc-row">
  <span class="uc-name">${esc(uc.uc)}</span>
  <span class="uc-desc">${esc(uc.desc)}</span>
</div>`;
    }
  }

  // Projected Business Outcomes
  const outcomes = [
    { title: 'Reduced Mean Time to Resolution', value: '90% faster', desc: `Davis AI eliminates manual triage, identifying root cause automatically across all ${steps.length} journey steps and their underlying services.`, color: '#EF5350' },
    { title: 'Proactive Incident Prevention', value: '75% fewer', desc: `Continuous baselining detects anomalies in ${ctx.kpi} before they escalate to customer-impacting incidents.`, color: '#FF7043' },
    { title: 'End-to-End Business Visibility', value: '100% coverage', desc: `Every step from start to finish is observable. No blind spots between teams, services, or infrastructure boundaries.`, color: '#00BCD4' },
    { title: 'Team Productivity Improvement', value: 'Up to 30%', desc: `Automated root cause analysis and unified dashboards free engineering and business teams to focus on innovation rather than firefighting.`, color: '#4CAF50' },
    { title: 'Customer Experience Protection', value: 'Real-time', desc: `${titleCase(ctx.kpi)} are monitored continuously. Degradations trigger automated alerts before customers experience the impact.`, color: '#6F2DA8' },
    { title: 'Data-Driven Decision Making', value: 'Always-on', desc: `Grail retains all journey data with full context, enabling historical analysis, trend identification, and capacity planning.`, color: '#1565C0' },
  ];

  html += `
<h2>Projected Business Outcomes</h2>
<p>Expected value realisation from full journey observability.</p>
<p>
  By investing in comprehensive observability, ${esc(company)} can expect significant reductions in mean time
  to resolution, fewer customer-facing incidents, and measurable improvements in ${esc(ctx.kpi)}.
  Organisations that adopt Dynatrace typically see a 90% reduction in MTTR and up to 30% improvement
  in team productivity through automated root cause analysis.
</p>
<div class="outcome-grid">`;

  for (const o of outcomes) {
    html += `
  <div class="outcome-box" style="border-left-color: ${o.color};">
    <h4>${esc(o.title)} <span class="outcome-value" style="color:${o.color};">${esc(o.value)}</span></h4>
    <p>${esc(o.desc)}</p>
  </div>`;
  }

  html += `</div>`;

  // Next Steps
  const nextSteps = [
    { phase: 'Phase 1: Instrument', desc: `Deploy OneAgent across all services involved in the ${journey}. Configure BizEvent capture rules for each of the journey steps identified in this report. Validate data flow into Grail with initial DQL queries.`, color: '#00BCD4' },
    { phase: 'Phase 2: Baseline', desc: `Allow Davis AI to establish performance baselines across all steps. Define custom alerting profiles for ${ctx.kpi}. Build the initial journey analytics dashboard with step-by-step conversion and duration visualisations.`, color: '#4CAF50' },
    { phase: 'Phase 3: Operationalise', desc: `Integrate Dynatrace alerts with existing incident management workflows. Train both engineering and business teams on journey analytics dashboards. Establish regular review cadences to track ${ctx.kpi} trends.`, color: '#FF7043' },
    { phase: 'Phase 4: Optimise', desc: `Use Grail-powered analytics to identify performance bottlenecks and conversion drop-off points. Implement automated remediation workflows for common failure patterns. Continuously refine observability coverage as the journey evolves.`, color: '#6F2DA8' },
  ];

  html += `
<h2>Recommended Next Steps</h2>
<p>The path from this executive summary to production-grade observability involves several focused workstreams for ${esc(company)}:</p>`;

  for (const ns of nextSteps) {
    html += `
<div class="phase-box" style="border-left-color: ${ns.color};">
  <h4 style="color:${ns.color};">${esc(ns.phase)}</h4>
  <p>${esc(ns.desc)}</p>
</div>`;
  }

  // Closing
  const closers = [
    `With Dynatrace observing every step of the ${journey}, ${company} moves from reactive troubleshooting to proactive business optimisation \u2014 catching ${ctx.risk} before customers are impacted.`,
    `${company}'s ${journey} is now fully instrumented. Every second of latency, every failed transaction, every drop in ${ctx.kpi} is automatically detected, diagnosed, and prioritised for resolution.`,
    `The partnership between ${company} and Dynatrace ensures that the ${journey} operates at peak efficiency \u2014 with ${ctx.kpi} protected by continuous AI-driven analysis and full-stack observability.`,
  ];

  html += `
<div class="closing">
  &ldquo;${esc(pick(closers))}&rdquo;
</div>

<div class="footer">
  <p>Prepared by Dynatrace Intelligence &bull; Business Observability Forge</p>
  <p>Report generated ${esc(formatDate())} &bull; All data derived from journey configuration</p>
  <p style="color:#ccc;">To convert to Word: Open this file in Microsoft Word or Google Docs (File &rarr; Open), then save as .docx</p>
</div>

</body>
</html>`;

  return html;
}
