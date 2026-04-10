/**
 * Dynatrace Intelligence — Executive Summary PDF Generator v4
 *
 * Produces a comprehensive, multi-page, marketing-quality executive brief for each
 * customer journey. Every PDF is unique — driven by the customer's specific industry,
 * journey steps, business rationale, categories, durations, and quantifiable data.
 *
 * v4: Extended to 3-4 pages with deeper narrative, full step analysis,
 * observability architecture mapping, ROI projections, industry challenges,
 * and expanded Dynatrace capability showcase.
 *
 * Design: Dark-themed, Dynatrace branded, with company image placeholder.
 * Built with PDFKit + Helvetica only — no external fonts, no emoji.
 */

import PDFDocument from 'pdfkit';

// ── Dynatrace Brand Palette ────────────────────────────────
const C = {
  purple:  '#6F2DA8',
  cyan:    '#00BCD4',
  green:   '#4CAF50',
  blue:    '#1565C0',
  orange:  '#FF7043',
  red:     '#EF5350',
  yellow:  '#FFD600',
  dark:    '#14161A',
  dark2:   '#1A1C22',
  card:    '#1E2028',
  slate:   '#2A2D36',
  white:   '#FFFFFF',
  light:   '#D0D0D6',
  mid:     '#8B8FA3',
  faint:   '#505468',
  accent:  '#00E5FF',
};

const STEP_COLORS = [C.purple, C.cyan, C.green, C.blue, C.orange, C.yellow, C.red, '#9C27B0'];
const CATEGORY_COLORS = {
  Acquisition: C.cyan, Discovery: C.blue, Consideration: C.blue,
  Purchase: C.green, Payment: C.green, Fulfilment: C.orange, FulfilmentPreparation: C.orange,
  PostPurchase: C.purple, Delivery: C.orange, Confirmation: C.green,
  Onboarding: C.cyan, Activation: C.cyan, Billing: C.yellow,
  RiskDetection: C.red, RiskMitigation: C.red, Security: C.red,
  UserAction: C.blue, Recovery: C.orange, PostRecovery: C.purple,
  Compliance: C.blue, Support: C.purple, Decisioning: C.yellow,
  Conversion: C.green, Investigation: C.orange,
};

// Page dimensions
const A4W = 595.28, A4H = 841.89, ML = 42, MR = 42;
const W = A4W - ML - MR;
const PAGE_BOTTOM = A4H - 50; // usable bottom before footer

// ── Randomised openers (8 variants) ────────────────────────
const OPENERS = [
  (c, j) => `${c} is embarking on a transformative observability initiative for their ${j}.`,
  (c, j) => `This document outlines how Dynatrace delivers end-to-end intelligence across ${c}'s ${j}.`,
  (c, j) => `Dynatrace Intelligence has mapped the complete ${j} for ${c}, enabling unprecedented business visibility.`,
  (c, j) => `For ${c}, every interaction in the ${j} represents a measurable business moment. Dynatrace captures them all.`,
  (c, j) => `The ${j} is central to ${c}'s digital strategy. This report quantifies its observability potential.`,
  (c, j) => `${c}'s competitive edge depends on flawless execution of the ${j}. Dynatrace makes every step observable.`,
  (c, j) => `In an era of rising customer expectations, ${c}'s ${j} must be instrumented end to end. This is how.`,
  (c, j) => `Dynatrace has analysed the full ${j} for ${c}, mapping every business-critical interaction to observability signals.`,
];

// ── Randomised industry challenge intros (5 variants) ──────
const CHALLENGE_INTROS = [
  (ctx) => `Organisations in the ${ctx.noun} sector face mounting pressure to deliver seamless digital experiences while managing increasingly complex technology stacks.`,
  (ctx) => `The ${ctx.noun} industry is at an inflection point: customer expectations are higher than ever, and the cost of ${ctx.risk} continues to rise.`,
  (ctx) => `Digital transformation in ${ctx.noun} has introduced new dependencies, microservices, and integration points — each a potential source of ${ctx.risk}.`,
  (ctx) => `${titleCase(ctx.noun)} leaders recognise that ${ctx.kpi} are no longer just IT metrics — they are direct indicators of business health and customer trust.`,
  (ctx) => `As ${ctx.noun} operations become more digital, the gap between business outcomes and technology performance narrows. Every millisecond matters.`,
];

// ── Randomised closers (5 variants) ────────────────────────
const CLOSERS = [
  (c, j, ctx) => `With Dynatrace observing every step of the ${j}, ${c} moves from reactive troubleshooting to proactive business optimisation — catching ${ctx.risk} before customers are impacted.`,
  (c, j, ctx) => `${c}'s ${j} is now fully instrumented. Every second of latency, every failed transaction, every drop in ${ctx.kpi} is automatically detected, diagnosed, and prioritised for resolution.`,
  (c, j, ctx) => `By connecting ${ctx.kpi} directly to infrastructure performance, ${c} gains the intelligence to optimise the ${j} continuously — reducing ${ctx.risk} and accelerating time to value.`,
  (c, j, ctx) => `Dynatrace transforms ${c}'s ${j} from a black box into a fully transparent, data-driven operation — where ${ctx.kpi} are monitored in real time and anomalies trigger instant, automated responses.`,
  (c, j, ctx) => `The partnership between ${c} and Dynatrace ensures that the ${j} operates at peak efficiency — with ${ctx.kpi} protected by continuous AI-driven analysis and full-stack observability.`,
];

// ── Randomised ROI narratives (4 variants) ─────────────────
const ROI_NARRATIVES = [
  (c, ctx) => `By investing in comprehensive observability, ${c} can expect significant reductions in mean time to resolution, fewer customer-facing incidents, and measurable improvements in ${ctx.kpi}. Organisations that adopt Dynatrace typically see a 90% reduction in MTTR and up to 30% improvement in team productivity through automated root cause analysis.`,
  (c, ctx) => `The business case for observability is clear: for every minute of ${ctx.risk}, ${c} incurs direct revenue impact and long-term customer trust erosion. Dynatrace Intelligence eliminates blind spots, enabling ${c} to resolve issues before they affect ${ctx.kpi} — often before customers even notice.`,
  (c, ctx) => `Dynatrace customers in the ${ctx.noun} space report transformative outcomes: 75% fewer production incidents, 90% faster root cause identification, and sustained improvements in ${ctx.kpi}. For ${c}, these translate directly into competitive advantage and operational resilience.`,
  (c, ctx) => `Proactive observability delivers compounding returns. ${c} gains not just faster incident resolution, but also the data-driven insights needed to continuously optimise ${ctx.kpi}, reduce operational costs, and make informed architectural decisions based on real user behaviour.`,
];

// ── Randomised next-step openers (3 variants) ──────────────
const NEXT_STEP_INTROS = [
  (c) => `To bring this observability vision to life, ${c} should consider the following recommended next steps:`,
  (c) => `The path from this executive summary to production-grade observability involves several focused workstreams for ${c}:`,
  (c) => `Dynatrace recommends the following phased approach to operationalise full journey observability for ${c}:`,
];


// ══════════════════════════════════════════════════════════════
// Main entry point
// ══════════════════════════════════════════════════════════════
export function generateExecutiveSummaryPDF({ journeyData, dashboardData }) {
  return new Promise((resolve, reject) => {
    try {
      const company  = journeyData.companyName || journeyData.company || 'Customer';
      const industry = journeyData.industryType || journeyData.industry || 'Enterprise';
      const journey  = journeyData.journeyType  || journeyData.journeyDetail || 'Customer Journey';
      const domain   = journeyData.domain || '';
      const steps    = journeyData.steps || [];
      const meta     = dashboardData?.metadata || dashboardData || {};
      const tileCount = meta.totalTiles || Object.keys(dashboardData?.content?.tiles || {}).length || 0;
      const ctx = getIndustryCtx(industry);

      const doc = new PDFDocument({ size: 'A4', margin: 0, info: {
        Title: `${company} — Dynatrace Intelligence Executive Summary`,
        Author: 'Dynatrace Intelligence — Business Observability Demonstrator',
        Subject: `${journey} — Comprehensive Executive Overview`,
        Creator: 'BizObs Demonstrator v4',
      }});

      const buffers = [];
      doc.on('data', (c) => buffers.push(c));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      let y = 0;
      let pageNum = 1;

      // Helper: check if we need a new page; takes current y, returns updated y
      function ensureSpace(currentY, needed) {
        if (currentY + needed > PAGE_BOTTOM) {
          drawFooter(doc, pageNum);
          doc.addPage({ size: 'A4', margin: 0 });
          pageNum++;
          return drawContinuationBanner(doc, pageNum);
        }
        return currentY;
      }

      // ── PAGE 1 ──────────────────────────────────────────
      y = drawHeaderBanner(doc, company, domain);
      y = drawExecutiveOverview(doc, y, company, industry, journey, steps, ctx);
      y = drawIndustryChallenges(doc, y, company, ctx, steps);
      y = ensureSpace(y, 80);
      y = drawJourneyPipeline(doc, y, steps);

      // ── PAGE 2: Deep step analysis ──────────────────────
      y = ensureSpace(y, 200);
      y = drawDetailedStepAnalysis(doc, y, steps, ctx, ensureSpace);

      // ── Observability architecture ──────────────────────
      y = ensureSpace(y, 180);
      y = drawObservabilityArchitecture(doc, y, steps, ctx, journey);

      // ── PAGE 3: Metrics + capabilities ──────────────────
      y = ensureSpace(y, 180);
      y = drawQuantifiedImpact(doc, y, steps, ctx, tileCount);

      y = ensureSpace(y, 160);
      y = drawDynatraceCapabilities(doc, y, steps, ctx, journey);

      // ── Value alignment (account objectives + use cases) ──
      y = ensureSpace(y, 200);
      y = drawValueAlignment(doc, y, company, industry, ctx, ensureSpace);

      // ── ROI + next steps + closing ──────────────────────
      y = ensureSpace(y, 200);
      y = drawBusinessOutcomes(doc, y, company, ctx, steps);

      y = ensureSpace(y, 180);
      y = drawNextSteps(doc, y, company, journey, ctx);

      y = ensureSpace(y, 60);
      y = drawClosingStatement(doc, y, company, journey, ctx);

      drawFooter(doc, pageNum);
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}


// ══════════════════════════════════════════════════════════════
// SECTION: Header Banner with company image placeholder
// ══════════════════════════════════════════════════════════════
function drawHeaderBanner(doc, company, domain) {
  doc.rect(0, 0, A4W, 100).fill(C.dark);
  doc.rect(0, 96, A4W, 4).fill(C.accent);

  doc.font('Helvetica-Bold').fontSize(11).fillColor(C.mid)
    .text('DYNATRACE INTELLIGENCE', ML, 14);

  doc.font('Helvetica-Bold').fontSize(20).fillColor(C.white)
    .text('Executive Summary', ML, 32);

  doc.font('Helvetica').fontSize(8).fillColor(C.faint)
    .text('Business Observability Demonstrator', ML, 60);
  doc.font('Helvetica').fontSize(8).fillColor(C.faint)
    .text(formatDate(), ML, 72);

  // Company image placeholder (top right)
  const logoW = 100, logoH = 52;
  const logoX = A4W - MR - logoW, logoY = 16;
  doc.roundedRect(logoX, logoY, logoW, logoH, 4)
    .lineWidth(1).strokeColor(C.faint).dash(3, { space: 3 }).stroke();
  doc.undash();
  doc.font('Helvetica').fontSize(7).fillColor(C.faint)
    .text('Company Logo', logoX, logoY + 18, { width: logoW, align: 'center' });
  doc.font('Helvetica').fontSize(6).fillColor(C.faint)
    .text('(placeholder)', logoX, logoY + 30, { width: logoW, align: 'center' });

  return 114;
}


// ══════════════════════════════════════════════════════════════
// SECTION: Executive Overview — extended narrative
// ══════════════════════════════════════════════════════════════
function drawExecutiveOverview(doc, y, company, industry, journey, steps, ctx) {
  const nice = titleCase(industry);

  // Company name
  doc.font('Helvetica-Bold').fontSize(22).fillColor(C.white)
    .text(company, ML, y);
  y += 28;

  // Tags
  doc.font('Helvetica').fontSize(9.5).fillColor(C.mid)
    .text(`${nice}  |  ${journey}  |  ${steps.length} Steps  |  ${totalDuration(steps)} mins end-to-end`, ML, y);
  y += 20;

  // Bespoke opener
  const opener = pick(OPENERS)(company, journey);
  const stepNames = steps.slice(0, 4).map(s => cleanName(s.stepName || s.name || '')).filter(Boolean);
  const stepList = stepNames.length > 1
    ? stepNames.slice(0, -1).join(', ') + ' and ' + stepNames[stepNames.length - 1]
    : stepNames[0] || 'each stage';

  // Extended narrative paragraph — longer and more informative
  const categories = [...new Set(steps.map(s => s.category).filter(Boolean))];
  const catNames = categories.length > 0 ? categories.slice(0, 4).join(', ') : 'multiple business phases';
  const totalDur = totalDuration(steps);

  const narrative = `${opener} Spanning ${steps.length} business-critical steps \u2014 from ${stepList} \u2014 ` +
    `this journey captures the full ${ctx.noun} lifecycle across ${catNames}. With an estimated end-to-end ` +
    `duration of ${totalDur} minutes, each step has been mapped with precise estimated durations, detailed ` +
    `business rationale, service-level context, and observability requirements. Dynatrace surfaces ` +
    `${ctx.kpi} in real time, correlated directly to the infrastructure and services that underpin them.`;

  doc.font('Helvetica').fontSize(9).fillColor(C.light)
    .text(narrative, ML, y, { width: W, lineGap: 3.5 });
  y += doc.heightOfString(narrative, { width: W, lineGap: 3.5 }) + 6;

  // Second paragraph: what this document contains
  const scopePara = `This executive summary provides a comprehensive analysis of the ${journey}, ` +
    `including a visual journey pipeline, detailed step-by-step intelligence with business rationale, ` +
    `an observability architecture overview, quantified impact metrics, Dynatrace platform capabilities ` +
    `mapped to this specific journey, projected business outcomes, and recommended next steps for implementation.`;

  doc.font('Helvetica').fontSize(8.5).fillColor(C.mid)
    .text(scopePara, ML, y, { width: W, lineGap: 3 });
  y += doc.heightOfString(scopePara, { width: W, lineGap: 3 }) + 14;

  return y;
}


// ══════════════════════════════════════════════════════════════
// SECTION: Industry Challenges — context and pressures
// ══════════════════════════════════════════════════════════════
function drawIndustryChallenges(doc, y, company, ctx, steps) {
  sectionLine(doc, y, C.red);
  y += 4;
  doc.font('Helvetica-Bold').fontSize(9).fillColor(C.red)
    .text('INDUSTRY CONTEXT & CHALLENGES', ML, y);
  y += 14;

  const intro = pick(CHALLENGE_INTROS)(ctx);
  doc.font('Helvetica').fontSize(8.5).fillColor(C.light)
    .text(intro, ML, y, { width: W, lineGap: 3 });
  y += doc.heightOfString(intro, { width: W, lineGap: 3 }) + 8;

  // Three challenge cards
  const challenges = [
    {
      title: 'Customer Experience Risk',
      text: `When ${ctx.risk} strikes, the impact is immediate: lost revenue, damaged trust, and increased churn. ` +
            `With ${steps.length} interconnected steps, a failure in any one can cascade across the entire journey.`,
      color: C.red,
    },
    {
      title: 'Operational Complexity',
      text: `Modern ${ctx.noun} journeys depend on dozens of microservices, APIs, and third-party integrations. ` +
            `Pinpointing the root cause of a degradation in ${ctx.kpi} requires end-to-end correlation across the full stack.`,
      color: C.orange,
    },
    {
      title: 'Business-IT Alignment Gap',
      text: `Business stakeholders care about ${ctx.kpi}. Engineering teams monitor infrastructure metrics. ` +
            `Without a unified observability platform, these two views remain disconnected — delaying decisions and resolution.`,
      color: C.yellow,
    },
  ];

  for (let i = 0; i < challenges.length; i++) {
    const ch = challenges[i];
    const cardY = y;

    doc.roundedRect(ML, cardY, W, 42, 3).fill(C.card);
    doc.rect(ML, cardY, 3, 42).fill(ch.color);

    doc.font('Helvetica-Bold').fontSize(7.5).fillColor(ch.color)
      .text(ch.title, ML + 12, cardY + 6, { width: W - 24 });

    doc.font('Helvetica').fontSize(7).fillColor(C.light)
      .text(ch.text, ML + 12, cardY + 18, { width: W - 24, lineGap: 2, height: 22 });

    y = cardY + 46;
  }

  return y + 8;
}


// ══════════════════════════════════════════════════════════════
// SECTION: Journey Pipeline (visual step flow)
// ══════════════════════════════════════════════════════════════
function drawJourneyPipeline(doc, y, steps) {
  sectionLine(doc, y, C.accent);
  y += 4;
  doc.font('Helvetica-Bold').fontSize(9).fillColor(C.accent)
    .text('PROSPECTIVE JOURNEY FLOW', ML, y);
  y += 16;

  const max = Math.min(steps.length, 8);
  if (max === 0) return y;

  const gap = 5;
  const boxW = (W - (max - 1) * gap) / max;
  const boxH = 56;

  for (let i = 0; i < max; i++) {
    const s = steps[i];
    const x = ML + i * (boxW + gap);
    const color = STEP_COLORS[i % STEP_COLORS.length];

    doc.roundedRect(x, y, boxW, boxH, 3).fill(C.card);
    doc.rect(x, y, boxW, 2.5).fill(color);

    doc.font('Helvetica-Bold').fontSize(5).fillColor(color)
      .text(`STEP ${s.stepIndex || i + 1}`, x + 4, y + 6, { width: boxW - 8 });

    const name = cleanName(s.stepName || s.name || `Step ${i + 1}`);
    doc.font('Helvetica-Bold').fontSize(6.5).fillColor(C.white)
      .text(name, x + 4, y + 15, { width: boxW - 8, height: 16, ellipsis: true });

    const cat = s.category || '';
    const dur = s.estimatedDuration ? `${s.estimatedDuration}m` : '';
    const meta = [cat, dur].filter(Boolean).join(' | ');
    doc.font('Helvetica').fontSize(5).fillColor(getCategoryColor(cat))
      .text(meta, x + 4, y + 44, { width: boxW - 8 });

    if (i < max - 1) {
      const ax = x + boxW + 0.5, ay = y + boxH / 2;
      doc.save().fillColor(C.faint);
      doc.moveTo(ax, ay - 3).lineTo(ax + 3.5, ay).lineTo(ax, ay + 3).fill();
      doc.restore();
    }
  }

  return y + boxH + 14;
}


// ══════════════════════════════════════════════════════════════
// SECTION: Detailed Step Analysis — full page, no truncation
// ══════════════════════════════════════════════════════════════
function drawDetailedStepAnalysis(doc, y, steps, ctx, ensureSpace) {
  sectionLine(doc, y, C.green);
  y += 4;
  doc.font('Helvetica-Bold').fontSize(9).fillColor(C.green)
    .text('JOURNEY INTELLIGENCE — STEP-BY-STEP ANALYSIS', ML, y);
  y += 4;
  doc.font('Helvetica').fontSize(7).fillColor(C.mid)
    .text('Comprehensive business context, rationale, and observability mapping for each step', ML, y);
  y += 16;

  const maxSteps = Math.min(steps.length, 10);

  for (let i = 0; i < maxSteps; i++) {
    const s = steps[i];
    const color = STEP_COLORS[i % STEP_COLORS.length];
    const name = cleanName(s.stepName || s.name || `Step ${i + 1}`);
    const dur = s.estimatedDuration || '?';
    const cat = s.category || 'General';
    const desc = s.description || generateStepDescription(name, ctx);
    const rationale = s.businessRationale || generateRationale(name, dur, ctx);
    const substeps = s.substeps || [];
    const svcName = s.serviceName || '';

    // Each step card needs ~100-130px depending on content
    y = ensureSpace(y, 130);

    // Step card background
    const cardH = 100 + (substeps.length > 0 ? 16 : 0);
    doc.roundedRect(ML, y, W, cardH, 4).fill(C.card);
    doc.rect(ML, y, 4, cardH).fill(color);

    // Step header bar
    doc.rect(ML + 4, y, W - 4, 18).fill(C.slate);

    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(color)
      .text(`Step ${s.stepIndex || i + 1}`, ML + 14, y + 4);
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C.white)
      .text(name, ML + 60, y + 4, { width: W - 180 });

    // Category + duration badges
    doc.font('Helvetica').fontSize(6.5).fillColor(getCategoryColor(cat))
      .text(cat, ML + W - 120, y + 5, { width: 55, align: 'right' });
    doc.font('Helvetica-Bold').fontSize(6.5).fillColor(C.accent)
      .text(`${dur} min`, ML + W - 55, y + 5, { width: 40, align: 'right' });

    let innerY = y + 24;

    // Service name (if available)
    if (svcName) {
      doc.font('Helvetica').fontSize(6.5).fillColor(C.faint)
        .text(`Service: ${svcName}`, ML + 14, innerY);
      innerY += 12;
    }

    // Full description — not truncated
    doc.font('Helvetica-Bold').fontSize(7).fillColor(C.light)
      .text('Description', ML + 14, innerY);
    innerY += 10;
    doc.font('Helvetica').fontSize(7).fillColor(C.light)
      .text(desc, ML + 14, innerY, { width: W - 32, lineGap: 2 });
    innerY += doc.heightOfString(desc, { width: W - 32, lineGap: 2 }) + 6;

    // Full business rationale — not truncated
    doc.font('Helvetica-Bold').fontSize(7).fillColor(C.faint)
      .text('Business Rationale', ML + 14, innerY);
    innerY += 10;
    doc.font('Helvetica-Oblique').fontSize(6.5).fillColor(C.faint)
      .text(rationale, ML + 14, innerY, { width: W - 32, lineGap: 2 });
    innerY += doc.heightOfString(rationale, { width: W - 32, lineGap: 2 }) + 6;

    // Substeps (if available)
    if (substeps.length > 0) {
      doc.font('Helvetica-Bold').fontSize(6.5).fillColor(C.mid)
        .text(`Substeps (${substeps.length}):`, ML + 14, innerY);
      innerY += 9;
      const subList = substeps.slice(0, 5).map(ss =>
        typeof ss === 'string' ? ss : (ss.name || ss.description || '')
      ).filter(Boolean);
      for (const sub of subList) {
        doc.font('Helvetica').fontSize(6).fillColor(C.mid)
          .text(`  - ${sub}`, ML + 18, innerY, { width: W - 40 });
        innerY += 8;
      }
    }

    // Observability signal indicator
    const obsY = innerY + 2;
    doc.font('Helvetica-Bold').fontSize(6).fillColor(C.accent)
      .text('Observability:', ML + 14, obsY);
    doc.font('Helvetica').fontSize(6).fillColor(C.accent)
      .text(`BizEvent emitted | Duration tracked | Error detection enabled | ${cat} phase correlation`, ML + 70, obsY, { width: W - 90 });

    y = obsY + 14;
  }

  return y + 8;
}


// ══════════════════════════════════════════════════════════════
// SECTION: Observability Architecture
// ══════════════════════════════════════════════════════════════
function drawObservabilityArchitecture(doc, y, steps, ctx, journey) {
  sectionLine(doc, y, C.cyan);
  y += 4;
  doc.font('Helvetica-Bold').fontSize(9).fillColor(C.cyan)
    .text('OBSERVABILITY ARCHITECTURE', ML, y);
  y += 4;
  doc.font('Helvetica').fontSize(7).fillColor(C.mid)
    .text('How Dynatrace captures, correlates, and analyses data across the journey', ML, y);
  y += 16;

  // Architecture intro paragraph
  const archIntro = `The Dynatrace platform provides a unified observability architecture purpose-built for ` +
    `complex ${ctx.noun} journeys like the ${journey}. Data flows from instrumented applications through ` +
    `OneAgent and OpenTelemetry collectors into Dynatrace Grail \u2014 the platform's massively parallel ` +
    `analytics engine. From there, Dynatrace Intelligence applies causal analysis to connect business events, ` +
    `service performance, and infrastructure health into a single, queryable data model.`;

  doc.font('Helvetica').fontSize(8).fillColor(C.light)
    .text(archIntro, ML, y, { width: W, lineGap: 3 });
  y += doc.heightOfString(archIntro, { width: W, lineGap: 3 }) + 12;

  // Architecture layers
  const layers = [
    {
      label: 'BUSINESS EVENTS LAYER',
      desc: `${steps.length} BizEvents emitted per journey execution, each carrying step name, category, duration, ` +
            `customer context, and transaction metadata. Enables real-time journey analytics and conversion tracking.`,
      color: C.green,
    },
    {
      label: 'SERVICE & TRACE LAYER',
      desc: `Distributed traces span every service call across the ${journey}. OpenTelemetry provides automatic ` +
            `context propagation, linking front-end user actions to back-end database queries and third-party API calls.`,
      color: C.blue,
    },
    {
      label: 'INFRASTRUCTURE LAYER',
      desc: `OneAgent captures host metrics, container performance, and process-level data. When a business event ` +
            `shows degradation, Dynatrace correlates it instantly to the responsible pod, node, or cloud resource.`,
      color: C.orange,
    },
    {
      label: 'AI & ANALYTICS LAYER',
      desc: `Dynatrace Intelligence continuously baselines all ${steps.length} steps, detecting anomalies in ${ctx.kpi} and ` +
            `automatically identifying root cause — no manual threshold configuration required. Grail enables ` +
            `ad-hoc DQL queries across all data in context.`,
      color: C.purple,
    },
  ];

  const layerH = 36;
  for (let i = 0; i < layers.length; i++) {
    const l = layers[i];
    const ly = y + i * (layerH + 4);

    doc.roundedRect(ML, ly, W, layerH, 3).fill(C.card);
    // Left color bar
    doc.rect(ML, ly, 4, layerH).fill(l.color);
    // Arrow connector (except last)
    if (i < layers.length - 1) {
      const ax = ML + W / 2, ay = ly + layerH + 1;
      doc.save().fillColor(C.faint);
      doc.moveTo(ax - 4, ay).lineTo(ax, ay + 3).lineTo(ax + 4, ay).fill();
      doc.restore();
    }

    doc.font('Helvetica-Bold').fontSize(7).fillColor(l.color)
      .text(l.label, ML + 14, ly + 5, { width: W - 28 });
    doc.font('Helvetica').fontSize(6.5).fillColor(C.light)
      .text(l.desc, ML + 14, ly + 15, { width: W - 28, lineGap: 1.5, height: 20 });
  }

  return y + layers.length * (layerH + 4) + 12;
}


// ══════════════════════════════════════════════════════════════
// SECTION: Quantified Impact — data-driven value cards
// ══════════════════════════════════════════════════════════════
function drawQuantifiedImpact(doc, y, steps, ctx, tileCount) {
  sectionLine(doc, y, C.purple);
  y += 4;
  doc.font('Helvetica-Bold').fontSize(9).fillColor(C.purple)
    .text('QUANTIFIED OBSERVABILITY VALUE', ML, y);
  y += 4;
  doc.font('Helvetica').fontSize(7).fillColor(C.mid)
    .text('Measurable metrics derived from the journey configuration and Dynatrace platform capabilities', ML, y);
  y += 14;

  const totalDur = totalDuration(steps);
  const categories = [...new Set(steps.map(s => s.category).filter(Boolean))];
  const substepCount = steps.reduce((sum, s) => sum + (s.substeps?.length || 0), 0);
  const shortestStep = steps.reduce((min, s) => Math.min(min, s.estimatedDuration || 99), 99);
  const longestStep = steps.reduce((mx, s) => Math.max(mx, s.estimatedDuration || 0), 0);
  const avgDur = steps.length > 0 ? Math.round(totalDur / steps.length) : 0;
  const svcCount = new Set(steps.map(s => s.serviceName).filter(Boolean)).size;

  const metrics = [
    { stat: `${steps.length}`, label: 'Business Steps', detail: 'Fully instrumented with BizEvent telemetry — each step emits structured events', color: C.cyan },
    { stat: `${totalDur}m`, label: 'End-to-End Duration', detail: `Shortest: ${shortestStep}m | Longest: ${longestStep}m | Avg: ${avgDur}m per step`, color: C.green },
    { stat: `${substepCount || steps.length * 2}`, label: 'Observable Substeps', detail: 'Fine-grained performance tracking points within each business step', color: C.orange },
    { stat: `${categories.length || 3}`, label: 'Journey Phases', detail: categories.slice(0, 4).join(', ') || 'Multiple business categories mapped', color: C.purple },
  ];

  if (svcCount > 0) {
    metrics.push({ stat: `${svcCount}`, label: 'Distinct Services', detail: 'Microservices instrumented across the journey', color: C.blue });
  }
  if (tileCount > 0) {
    metrics.push({ stat: `${tileCount}`, label: 'Dashboard Tiles', detail: 'Real-time KPI visualisations configured in Dynatrace', color: C.blue });
  }
  metrics.push({ stat: '90%', label: 'Faster MTTR', detail: 'Dynatrace Intelligence automatic root cause analysis reduces resolution time', color: C.red });
  metrics.push({ stat: '100%', label: 'Journey Visibility', detail: 'Every step, substep, and service call captured — no blind spots', color: C.accent });

  const cols = Math.min(metrics.length, 3);
  const cardW = (W - (cols - 1) * 8) / cols;
  const cardH = 56;

  for (let i = 0; i < Math.min(metrics.length, 9); i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = ML + col * (cardW + 8);
    const cy = y + row * (cardH + 6);
    const m = metrics[i];

    doc.roundedRect(x, cy, cardW, cardH, 4).fill(C.card);
    doc.rect(x, cy, 3, cardH).fill(m.color);

    doc.font('Helvetica-Bold').fontSize(18).fillColor(m.color)
      .text(m.stat, x + 12, cy + 6, { width: cardW - 24 });

    doc.font('Helvetica-Bold').fontSize(7).fillColor(C.white)
      .text(m.label, x + 12, cy + 27, { width: cardW - 24 });

    doc.font('Helvetica').fontSize(6).fillColor(C.mid)
      .text(m.detail, x + 12, cy + 38, { width: cardW - 24, lineGap: 1.5, height: 16 });
  }

  const metricRows = Math.ceil(Math.min(metrics.length, 9) / cols);
  return y + metricRows * (cardH + 6) + 12;
}


// ══════════════════════════════════════════════════════════════
// SECTION: Why Dynatrace — 6 capabilities mapped to journey
// ══════════════════════════════════════════════════════════════
function drawDynatraceCapabilities(doc, y, steps, ctx, journey) {
  sectionLine(doc, y, C.blue);
  y += 4;
  doc.font('Helvetica-Bold').fontSize(9).fillColor(C.blue)
    .text('WHY DYNATRACE FOR THIS JOURNEY', ML, y);
  y += 4;
  doc.font('Helvetica').fontSize(7).fillColor(C.mid)
    .text('Platform capabilities mapped to the specific requirements of this journey', ML, y);
  y += 14;

  const capabilities = [
    {
      title: 'Automated Business Event Capture',
      desc: `Every step in the ${journey} emits structured BizEvents into Dynatrace Grail \u2014 ` +
            `no manual tagging required. Each event carries full business context: step category, ` +
            `duration, customer segment, and transaction value. This creates a queryable business ` +
            `data layer that persists for 35 days by default.`,
      color: C.cyan,
    },
    {
      title: 'Dynatrace Intelligence Causal Analysis',
      desc: `Dynatrace Intelligence continuously baselines all ${steps.length} steps and their substeps. When ${ctx.risk} occurs, ` +
            `root cause is identified automatically \u2014 from business KPI down to the responsible service, ` +
            `deployment, or infrastructure component. No manual threshold configuration is needed.`,
      color: C.green,
    },
    {
      title: 'Full-Stack Distributed Tracing',
      desc: `OpenTelemetry-powered distributed traces link every journey interaction to the underlying services, ` +
            `pods, and hosts. One click from a ${ctx.kpi} anomaly navigates directly to the responsible ` +
            `code-level execution, database query, or third-party API call.`,
      color: C.orange,
    },
    {
      title: 'Real-Time Journey Analytics',
      desc: `Live dashboards show step-by-step conversion, duration variance, and error rates. ` +
            `Business teams see the customer impact; platform teams see the service performance ` +
            `\u2014 both from the same unified data source powered by Grail.`,
      color: C.purple,
    },
    {
      title: 'Grail Data Lakehouse',
      desc: `All observability data \u2014 logs, metrics, traces, BizEvents, and user sessions \u2014 are stored ` +
            `in Grail with full context retention. DQL (Dynatrace Query Language) enables ad-hoc analysis ` +
            `across all data types without pre-aggregation or sampling.`,
      color: C.blue,
    },
    {
      title: 'Automated Alerting & Workflows',
      desc: `When Dynatrace Intelligence detects an anomaly affecting ${ctx.kpi}, automated workflows can trigger ` +
            `notifications, create incidents, or execute remediation runbooks \u2014 reducing human ` +
            `response time from hours to seconds.`,
      color: C.red,
    },
  ];

  const colW = (W - 10) / 2;
  const itemH = 52;

  for (let i = 0; i < capabilities.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = ML + col * (colW + 10);
    const iy = y + row * (itemH + 4);
    const cap = capabilities[i];

    doc.roundedRect(x, iy, colW, itemH, 3).fill(C.card);
    doc.rect(x, iy, 3, itemH).fill(cap.color);

    doc.font('Helvetica-Bold').fontSize(7.5).fillColor(C.white)
      .text(cap.title, x + 11, iy + 5, { width: colW - 20 });

    doc.font('Helvetica').fontSize(6.5).fillColor(C.mid)
      .text(cap.desc, x + 11, iy + 16, { width: colW - 20, lineGap: 1.5, height: 32 });
  }

  const capRows = Math.ceil(capabilities.length / 2);
  return y + capRows * (itemH + 4) + 10;
}


// ══════════════════════════════════════════════════════════════
// SECTION: Business Outcomes & ROI
// ══════════════════════════════════════════════════════════════
function drawBusinessOutcomes(doc, y, company, ctx, steps) {
  sectionLine(doc, y, C.green);
  y += 4;
  doc.font('Helvetica-Bold').fontSize(9).fillColor(C.green)
    .text('PROJECTED BUSINESS OUTCOMES', ML, y);
  y += 4;
  doc.font('Helvetica').fontSize(7).fillColor(C.mid)
    .text('Expected value realisation from full journey observability', ML, y);
  y += 14;

  // ROI narrative paragraph
  const roiNarrative = pick(ROI_NARRATIVES)(company, ctx);
  doc.font('Helvetica').fontSize(8.5).fillColor(C.light)
    .text(roiNarrative, ML, y, { width: W, lineGap: 3 });
  y += doc.heightOfString(roiNarrative, { width: W, lineGap: 3 }) + 12;

  // Outcome cards
  const outcomes = [
    {
      title: 'Reduced Mean Time to Resolution',
      value: '90% faster',
      desc: 'Dynatrace Intelligence eliminates manual triage, identifying root cause automatically across all ' +
            `${steps.length} journey steps and their underlying services.`,
      color: C.red,
    },
    {
      title: 'Proactive Incident Prevention',
      value: '75% fewer',
      desc: `Continuous baselining detects anomalies in ${ctx.kpi} before they escalate to ` +
            `customer-impacting incidents.`,
      color: C.orange,
    },
    {
      title: 'End-to-End Business Visibility',
      value: '100% coverage',
      desc: `Every step from start to finish is observable. No blind spots between teams, ` +
            `services, or infrastructure boundaries.`,
      color: C.cyan,
    },
    {
      title: 'Team Productivity Improvement',
      value: 'Up to 30%',
      desc: `Automated root cause analysis and unified dashboards free engineering and business ` +
            `teams to focus on innovation rather than firefighting.`,
      color: C.green,
    },
    {
      title: 'Customer Experience Protection',
      value: 'Real-time',
      desc: `${ctx.kpi} are monitored continuously. Degradations trigger automated alerts ` +
            `before customers experience the impact of ${ctx.risk}.`,
      color: C.purple,
    },
    {
      title: 'Data-Driven Decision Making',
      value: 'Always-on',
      desc: `Grail retains all journey data with full context, enabling historical analysis, ` +
            `trend identification, and capacity planning based on real customer behaviour.`,
      color: C.blue,
    },
  ];

  const colW = (W - 10) / 2;
  const cardH = 50;

  for (let i = 0; i < outcomes.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = ML + col * (colW + 10);
    const cy = y + row * (cardH + 4);
    const o = outcomes[i];

    doc.roundedRect(x, cy, colW, cardH, 3).fill(C.card);
    doc.rect(x, cy, 3, cardH).fill(o.color);

    doc.font('Helvetica-Bold').fontSize(7.5).fillColor(C.white)
      .text(o.title, x + 11, cy + 5, { width: colW - 70 });

    doc.font('Helvetica-Bold').fontSize(8).fillColor(o.color)
      .text(o.value, x + colW - 70, cy + 5, { width: 58, align: 'right' });

    doc.font('Helvetica').fontSize(6.5).fillColor(C.mid)
      .text(o.desc, x + 11, cy + 18, { width: colW - 20, lineGap: 1.5, height: 28 });
  }

  const outcomeRows = Math.ceil(outcomes.length / 2);
  return y + outcomeRows * (cardH + 4) + 10;
}


// ══════════════════════════════════════════════════════════════
// SECTION: Recommended Next Steps
// ══════════════════════════════════════════════════════════════
function drawNextSteps(doc, y, company, journey, ctx) {
  sectionLine(doc, y, C.accent);
  y += 4;
  doc.font('Helvetica-Bold').fontSize(9).fillColor(C.accent)
    .text('RECOMMENDED NEXT STEPS', ML, y);
  y += 14;

  const intro = pick(NEXT_STEP_INTROS)(company);
  doc.font('Helvetica').fontSize(8.5).fillColor(C.light)
    .text(intro, ML, y, { width: W, lineGap: 3 });
  y += doc.heightOfString(intro, { width: W, lineGap: 3 }) + 10;

  const nextSteps = [
    {
      phase: 'Phase 1: Instrument',
      desc: `Deploy OneAgent across all services involved in the ${journey}. Configure BizEvent ` +
            `capture rules for each of the journey steps identified in this report. Validate data ` +
            `flow into Grail with initial DQL queries.`,
      color: C.cyan,
    },
    {
      phase: 'Phase 2: Baseline',
      desc: `Allow Dynatrace Intelligence to establish performance baselines across all steps. Define custom ` +
            `alerting profiles for ${ctx.kpi}. Build the initial journey analytics dashboard ` +
            `with step-by-step conversion and duration visualisations.`,
      color: C.green,
    },
    {
      phase: 'Phase 3: Operationalise',
      desc: `Integrate Dynatrace alerts with existing incident management workflows. Train both ` +
            `engineering and business teams on journey analytics dashboards. Establish regular ` +
            `review cadences to track ${ctx.kpi} trends.`,
      color: C.orange,
    },
    {
      phase: 'Phase 4: Optimise',
      desc: `Use Grail-powered analytics to identify performance bottlenecks and conversion ` +
            `drop-off points. Implement automated remediation workflows for common failure ` +
            `patterns. Continuously refine observability coverage as the journey evolves.`,
      color: C.purple,
    },
  ];

  for (let i = 0; i < nextSteps.length; i++) {
    const ns = nextSteps[i];

    doc.roundedRect(ML, y, W, 40, 3).fill(C.card);
    doc.rect(ML, y, 4, 40).fill(ns.color);

    // Phase number circle
    doc.circle(ML + 20, y + 20, 10).fill(ns.color);
    doc.font('Helvetica-Bold').fontSize(10).fillColor(C.white)
      .text(`${i + 1}`, ML + 14, y + 15, { width: 12, align: 'center' });

    doc.font('Helvetica-Bold').fontSize(7.5).fillColor(ns.color)
      .text(ns.phase, ML + 38, y + 5, { width: W - 50 });

    doc.font('Helvetica').fontSize(6.5).fillColor(C.light)
      .text(ns.desc, ML + 38, y + 16, { width: W - 50, lineGap: 1.5, height: 22 });

    y += 44;
  }

  return y + 8;
}


// ══════════════════════════════════════════════════════════════
// SECTION: Dynatrace Value Alignment — account objectives + use cases
// ══════════════════════════════════════════════════════════════
function drawValueAlignment(doc, y, company, industry, ctx, ensureSpace) {
  const objs = getValueObjectives(industry);
  const objectives = [
    { name: objs.obj1, theme: 'Innovation and Experience', color: C.cyan, useCases: VALUE_USE_CASES.obj1 },
    { name: objs.obj2, theme: 'Cost and Efficiency', color: C.green, useCases: VALUE_USE_CASES.obj2 },
    { name: objs.obj3, theme: 'Resilience and Compliance', color: C.orange, useCases: VALUE_USE_CASES.obj3 },
  ];

  sectionLine(doc, y, C.yellow);
  y += 4;
  doc.font('Helvetica-Bold').fontSize(9).fillColor(C.yellow)
    .text('DYNATRACE VALUE ALIGNMENT', ML, y);
  y += 4;
  doc.font('Helvetica').fontSize(7).fillColor(C.mid)
    .text(`Account objectives and use cases tailored for ${company}`, ML, y);
  y += 14;

  // Intro narrative
  const intro = `The Dynatrace platform delivers value across three strategic pillars, each aligned to ${company}'s ` +
    `critical business objectives in the ${ctx.noun} space. The following maps Dynatrace capabilities to ` +
    `account-specific outcomes, providing a clear value narrative for executive stakeholders.`;
  doc.font('Helvetica').fontSize(8).fillColor(C.light)
    .text(intro, ML, y, { width: W, lineGap: 3 });
  y += doc.heightOfString(intro, { width: W, lineGap: 3 }) + 10;

  for (let oi = 0; oi < objectives.length; oi++) {
    const obj = objectives[oi];
    y = ensureSpace(y, 120);

    // Objective header card
    doc.roundedRect(ML, y, W, 20, 3).fill(C.slate);
    doc.rect(ML, y, 4, 20).fill(obj.color);

    doc.font('Helvetica-Bold').fontSize(8).fillColor(obj.color)
      .text(`OBJECTIVE ${oi + 1}:`, ML + 12, y + 5);
    doc.font('Helvetica-Bold').fontSize(8).fillColor(C.white)
      .text(obj.name, ML + 82, y + 5, { width: W - 100 });
    y += 24;

    // Use case cards
    for (let ui = 0; ui < obj.useCases.length; ui++) {
      const uc = obj.useCases[ui];

      doc.roundedRect(ML + 10, y, W - 20, 26, 2).fill(C.card);
      doc.rect(ML + 10, y, 2, 26).fill(obj.color);

      doc.font('Helvetica-Bold').fontSize(7).fillColor(C.white)
        .text(uc.uc, ML + 20, y + 4, { width: (W - 40) * 0.4 });

      doc.font('Helvetica').fontSize(6.5).fillColor(C.mid)
        .text(uc.desc, ML + 20 + (W - 40) * 0.42, y + 4, { width: (W - 40) * 0.56, lineGap: 1.5, height: 20 });

      y += 30;
    }

    y += 6;
  }

  return y + 4;
}


// ══════════════════════════════════════════════════════════════
// SECTION: Closing statement — extended
// ══════════════════════════════════════════════════════════════
function drawClosingStatement(doc, y, company, journey, ctx) {
  sectionLine(doc, y, C.purple);
  y += 8;

  const closing = pick(CLOSERS)(company, journey, ctx);
  doc.font('Helvetica-Oblique').fontSize(9).fillColor(C.light)
    .text(`"${closing}"`, ML + 20, y, { width: W - 40, lineGap: 3 });
  y += doc.heightOfString(`"${closing}"`, { width: W - 40, lineGap: 3 }) + 10;

  // Attribution line
  doc.font('Helvetica').fontSize(7).fillColor(C.faint)
    .text('Prepared by Dynatrace Intelligence  |  Business Observability Demonstrator', ML, y, { width: W, align: 'center' });
  y += 10;
  doc.font('Helvetica').fontSize(7).fillColor(C.faint)
    .text(`Report generated ${formatDate()}  |  All data derived from journey configuration`, ML, y, { width: W, align: 'center' });
  y += 14;

  return y;
}


// ══════════════════════════════════════════════════════════════
// Continuation banner (for pages 2+)
// ══════════════════════════════════════════════════════════════
function drawContinuationBanner(doc, pageNum) {
  doc.rect(0, 0, A4W, 36).fill(C.dark);
  doc.rect(0, 34, A4W, 2).fill(C.accent);
  doc.font('Helvetica-Bold').fontSize(8).fillColor(C.mid)
    .text(`DYNATRACE INTELLIGENCE  |  Executive Summary  |  Page ${pageNum}`, ML, 12);
  return 48;
}


// ══════════════════════════════════════════════════════════════
// Footer
// ══════════════════════════════════════════════════════════════
function drawFooter(doc, pageNum) {
  const fy = A4H - 30;
  doc.rect(0, fy, A4W, 30).fill(C.dark);
  doc.rect(0, fy, A4W, 1).fill(C.purple);

  doc.font('Helvetica').fontSize(6.5).fillColor(C.faint)
    .text(`Dynatrace Intelligence  |  Business Observability Demonstrator  |  Confidential`, ML, fy + 10, { width: W * 0.55 });

  doc.font('Helvetica').fontSize(6.5).fillColor(C.mid)
    .text(`Page ${pageNum || 1}`, ML + W * 0.55, fy + 10, { width: W * 0.15, align: 'center' });

  doc.font('Helvetica').fontSize(6.5).fillColor(C.accent)
    .text('dynatrace.com', ML + W * 0.7, fy + 10, { width: W * 0.3, align: 'right' });
}


// ══════════════════════════════════════════════════════════════
// Drawing helpers
// ══════════════════════════════════════════════════════════════
function sectionLine(doc, y, color) {
  doc.rect(ML, y, W, 1).fill(color);
}

function getCategoryColor(cat) {
  return CATEGORY_COLORS[cat] || C.mid;
}


// ══════════════════════════════════════════════════════════════
// Industry context — drives bespoke narrative variants
// ══════════════════════════════════════════════════════════════
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

function getIndustryCtx(industry) {
  const lower = (industry || '').toLowerCase();
  for (const [key, ctx] of Object.entries(INDUSTRY_CTX)) {
    if (lower.includes(key)) return ctx;
  }
  return { noun: 'enterprise operations', risk: 'process failures, latency spikes, or experience degradation', kpi: 'cycle time, success rate, and customer satisfaction' };
}


// ══════════════════════════════════════════════════════════════
// Account Objectives — Dynatrace value tree tailored per industry
// ══════════════════════════════════════════════════════════════
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

function getValueObjectives(industry) {
  const lower = (industry || '').toLowerCase();
  for (const [key, obj] of Object.entries(VALUE_OBJECTIVES)) {
    if (lower.includes(key)) return obj;
  }
  return { obj1: 'Accelerate Innovation and Elevate Experiences', obj2: 'Optimise Cost and Operational Efficiency', obj3: 'Strengthen Resilience, Compliance and Risk Management' };
}

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
    { uc: 'Solve Issues Faster with AI Diagnostics', desc: 'Dynatrace Intelligence identifies root cause automatically, from business impact to infrastructure fault' },
    { uc: 'Minimise Critical Incident Frequency', desc: 'Proactive anomaly detection reduces the number and duration of customer-impacting events' },
    { uc: 'Ensure Compliance by Design', desc: 'Continuous platform observability supports audit readiness and regulatory requirements' },
  ],
};


// ══════════════════════════════════════════════════════════════
// Dynamic content generators (for steps without saved data)
// ══════════════════════════════════════════════════════════════
function generateStepDescription(name, ctx) {
  const variants = [
    `The customer interacts with the ${name} stage of the ${ctx.noun} journey. ` +
      `This step emits business events capturing the interaction outcome, duration, and any errors encountered. ` +
      `Performance at this stage directly influences downstream steps and overall journey completion rates.`,
    `During ${name}, the system processes critical ${ctx.noun} operations that are instrumented with BizEvent telemetry. ` +
      `Every successful and failed execution is captured, providing granular visibility into throughput, ` +
      `latency distribution, and error classification.`,
    `${name} represents a key decision point in the ${ctx.noun} lifecycle. Dynatrace observes user interactions, ` +
      `backend service calls, and data processing operations at this stage, correlating business outcomes ` +
      `with technical performance metrics.`,
  ];
  return pick(variants);
}

function generateRationale(name, dur, ctx) {
  const variants = [
    `The ${name} step is estimated at ${dur} minutes. Performance here directly impacts ${ctx.kpi}, ` +
      `making it a critical observability target. Degradation at this stage risks triggering ${ctx.risk}.`,
    `With an estimated duration of ${dur} minutes, ${name} is a high-impact touchpoint where delays or ` +
      `failures immediately affect ${ctx.kpi}. Continuous monitoring ensures rapid detection and resolution.`,
    `At ${dur} minutes, ${name} accounts for a significant portion of the end-to-end journey time. ` +
      `Maintaining performance here is essential to protecting ${ctx.kpi} and preventing ${ctx.risk}.`,
  ];
  return pick(variants);
}


// ══════════════════════════════════════════════════════════════
// Text utilities
// ══════════════════════════════════════════════════════════════
function cleanName(name) {
  return (name || '')
    .replace(/Service$/i, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
}

function titleCase(str) {
  return (str || 'Enterprise').replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function trunc(text, max) {
  if (!text) return '';
  return text.length > max ? text.substring(0, max - 1) + '\u2026' : text;
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