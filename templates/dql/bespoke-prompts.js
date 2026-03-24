/**
 * Bespoke Dashboard Prompts by Industry
 * Grouped by Dynatrace official industry categories
 * Each prompt highlights sector-specific KPIs, fields, and business concerns
 * so Ollama + customer_dynamic produce truly relevant dashboards.
 */

// ═══════════════════════════════════════════════════════════════════
// INDUSTRY → PROMPT MAPPING
// Keys match the `industryType` field from saved-configs.
// Falls back to Dynatrace industry group, then generic.
// ═══════════════════════════════════════════════════════════════════

const INDUSTRY_PROMPTS = {

  // ── FINANCIAL SERVICES ─────────────────────────────────────────
  'Retail Banking': {
    group: 'Financial Services',
    prompt: (company, journey) =>
      `Build a financial services dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize credit risk and lending KPIs: credit score distribution, loan approval rates, debt-to-income ratios, ` +
      `interest rate benchmarks, KYC verification status, and overdraft utilization. ` +
      `Include fraud detection rates, regulatory compliance scores, and NPS by account tier. ` +
      `Show geographic distribution of applications and trend analysis of approval rates over time.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'filtered_view', 'error_analysis', 'trend_analysis', 'geographic_view'],
  },

  'Financial Services (Wealth Mgmt)': {
    group: 'Financial Services',
    prompt: (company, journey) =>
      `Build a wealth management dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize portfolio and investment KPIs: AUM growth, investment horizon distribution, risk appetite segmentation, ` +
      `annual management fee trends, ISA transfer volumes, and out-of-market days impact. ` +
      `Include client lifetime value by segment, regulatory compliance, and conversion funnel analysis.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'filtered_view', 'trend_analysis'],
  },

  'Payments & FinTech': {
    group: 'Financial Services',
    prompt: (company, journey) =>
      `Build a payments and fintech dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize transaction processing KPIs: authorization rates, transactions per second, average transaction fees, ` +
      `fraud detection rates vs false positive rates, model accuracy, and processing volume trends. ` +
      `Include real-time error rates, latency percentiles, and geographic payment distribution.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'performance_sla', 'error_analysis', 'golden_signals_traffic', 'golden_signals_latency', 'geographic_view'],
  },

  'Accounting & Audit': {
    group: 'Financial Services',
    prompt: (company, journey) =>
      `Build an accounting and audit dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize audit and tax KPIs: audit risk levels, findings count, materiality thresholds, ` +
      `effective tax rates, filing deadline compliance, and tax savings achieved. ` +
      `Include compliance trends, error rates in filings, and performance SLAs for processing.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'performance_sla', 'error_analysis', 'trend_analysis'],
  },

  // ── INSURANCE ──────────────────────────────────────────────────
  'Retail Insurance': {
    group: 'Insurance',
    prompt: (company, journey) =>
      `Build an insurance dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize claims and underwriting KPIs: claim amounts and settlement rates, days to settle, ` +
      `excess paid vs settlement offers, claims complexity breakdown, no-claims discount impact, ` +
      `premium amounts by coverage level, and loss ratio trends. ` +
      `Include fraud risk scoring, customer retention by segment, and geographic claims distribution.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'filtered_view', 'error_analysis', 'trend_analysis', 'geographic_view'],
  },

  // ── RETAIL & ECOMMERCE ─────────────────────────────────────────
  'E-commerce (Retail)': {
    group: 'Retail & Ecommerce',
    prompt: (company, journey) =>
      `Build a retail e-commerce dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize shopping and conversion KPIs: basket size, cart abandonment rate, browse-to-cart conversion, ` +
      `delivery method split, return likelihood, click-and-collect pickup rates, and additional in-store purchases. ` +
      `Include revenue per session, payment method breakdown, and hourly shopping patterns.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'filtered_view', 'performance_sla', 'trend_analysis', 'geographic_view'],
  },

  'Fashion & Apparel': {
    group: 'Retail & Ecommerce',
    prompt: (company, journey) =>
      `Build a fashion and apparel dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize fashion-specific KPIs: size accuracy and fit rates, keep rate vs return rate, ` +
      `fabric composition insights, full-price sell-through, markdown rates, trend strength indicators, ` +
      `and personal styling conversion. Include seasonal trend analysis and customer segment performance.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'filtered_view', 'trend_analysis'],
  },

  'Beauty & Cosmetics': {
    group: 'Retail & Ecommerce',
    prompt: (company, journey) =>
      `Build a beauty and cosmetics dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize product and experience KPIs: shade match accuracy, skin type/tone distribution, ` +
      `virtual try-on conversion, formulation stage progress, ingredient counts, and sustainability scores. ` +
      `Include customer segment analysis and trend forecasting.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'filtered_view', 'trend_analysis'],
  },

  'Marketplace & Platform': {
    group: 'Retail & Ecommerce',
    prompt: (company, journey) =>
      `Build a marketplace platform dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize platform economics: GMV, take rate, seller ratings, buy box win rates, ` +
      `order defect rates, seller churn, fulfilment method split, and active seller growth. ` +
      `Include performance SLAs, error rates, and geographic marketplace activity.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'filtered_view', 'performance_sla', 'error_analysis', 'geographic_view'],
  },

  // ── HEALTHCARE ─────────────────────────────────────────────────
  'Healthcare & Life Sciences': {
    group: 'Healthcare',
    prompt: (company, journey) =>
      `Build a healthcare dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize patient and clinical KPIs: claims processing status, CPT/ICD code distribution, ` +
      `allowed amounts vs patient responsibility, insurance verification rates, copay tracking, ` +
      `HIPAA consent compliance, and primary care assignment rates. ` +
      `Include error analysis for claim denials and processing time SLAs.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'filtered_view', 'performance_sla', 'error_analysis'],
  },

  'Pharmaceuticals & Life Sciences': {
    group: 'Healthcare',
    prompt: (company, journey) =>
      `Build a pharmaceutical / life sciences dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize clinical trial and regulatory KPIs: patient screening rates, inclusion criteria compliance, ` +
      `informed consent tracking, randomisation arm distribution, trial phase progress, ` +
      `submission milestones, deficiency letters, and review timeline adherence. ` +
      `Include compliance trends and geographic site distribution.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'performance_sla', 'trend_analysis', 'geographic_view'],
  },

  'Veterinary & Animal Health': {
    group: 'Healthcare',
    prompt: (company, journey) =>
      `Build a veterinary and animal health dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize clinical and practice KPIs: species distribution, breed risk levels, vaccination status rates, ` +
      `diagnostic abnormal rates, turnaround hours for lab results, and appointment utilization. ` +
      `Include trend analysis for visit patterns and error tracking.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'performance_sla', 'trend_analysis'],
  },

  // ── EDUCATION ──────────────────────────────────────────────────
  'Education & Learning': {
    group: 'Education',
    prompt: (company, journey) =>
      `Build an education dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize enrolment and academic KPIs: class capacity utilization, credit points distribution, ` +
      `delivery mode breakdown (online/hybrid/in-person), waitlist position tracking, prerequisite completion, ` +
      `tuition fee analysis, scholarship application rates, and student loan uptake. ` +
      `Include trend analysis for enrolment patterns and geographic student distribution.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'filtered_view', 'trend_analysis', 'geographic_view'],
  },

  // ── ENERGY & UTILITIES ─────────────────────────────────────────
  'Energy & Utilities': {
    group: 'Energy & Utilities',
    prompt: (company, journey) =>
      `Build an energy and utilities dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize consumption and billing KPIs: kWh consumed, unit rates, standing charges, ` +
      `meter read types, estimated annual costs, energy efficiency ratings, and payment method distribution. ` +
      `Include deposit tracking, error rates for meter readings, and consumption trend analysis.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'filtered_view', 'performance_sla', 'error_analysis', 'trend_analysis'],
  },

  'Electric Vehicle & Charging': {
    group: 'Energy & Utilities',
    prompt: (company, journey) =>
      `Build an EV charging dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize charging and fleet KPIs: kWh delivered, charging speed distribution, charger utilisation, ` +
      `session duration, fleet size, average daily miles, energy cost per mile, and emissions saved. ` +
      `Include performance SLAs for charger uptime and geographic charging distribution.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'performance_sla', 'trend_analysis', 'geographic_view'],
  },

  'Environmental & ESG': {
    group: 'Energy & Utilities',
    prompt: (company, journey) =>
      `Build an ESG and environmental dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize sustainability KPIs: CO2e emissions tracking, reduction target progress, reporting framework compliance, ` +
      `ESG rating trends, data points managed, and frameworks covered. ` +
      `Include trend analysis for emissions reduction and geographic environmental impact.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'trend_analysis', 'geographic_view'],
  },

  'Water & Wastewater': {
    group: 'Energy & Utilities',
    prompt: (company, journey) =>
      `Build a water and wastewater dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize water infrastructure KPIs: leak flow rates, pipe age and material distribution, ` +
      `chlorine residual levels, flow rates, turbidity measurements, and treatment efficiency. ` +
      `Include performance SLAs for leak response and trend analysis for water quality.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'performance_sla', 'error_analysis', 'trend_analysis'],
  },

  'Waste Management & Recycling': {
    group: 'Energy & Utilities',
    prompt: (company, journey) =>
      `Build a waste management dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize collection and recycling KPIs: bin fill levels, recycling rates, tonnage per week, ` +
      `material sorting purity, recovery rates, throughput, and route optimisation efficiency. ` +
      `Include geographic collection distribution and trend analysis for recycling improvements.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'performance_sla', 'trend_analysis', 'geographic_view'],
  },

  // ── GAMING & LEISURE ───────────────────────────────────────────
  'Gaming & Entertainment': {
    group: 'Gaming & Leisure',
    prompt: (company, journey) =>
      `Build a gaming and entertainment dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize player and monetization KPIs: player level distribution, virtual currency spend, ` +
      `in-app purchase conversion, rarity level economics, limited-time offer performance, ` +
      `tutorial completion rates, platform preferences, and referral code tracking. ` +
      `Include performance SLAs for game responsiveness and player engagement trends.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'filtered_view', 'performance_sla', 'trend_analysis'],
  },

  'Lottery & Gaming': {
    group: 'Gaming & Leisure',
    prompt: (company, journey) =>
      `Build a lottery and responsible gaming dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize responsible gaming KPIs: at-risk detection rates, intervention effectiveness, ` +
      `fraud detection vs false positive rates, jackpot sizes, win probability distribution, ` +
      `and players monitored volumes. Include compliance trend analysis and error tracking.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'error_analysis', 'trend_analysis'],
  },

  'Sports & Live Events': {
    group: 'Gaming & Leisure',
    prompt: (company, journey) =>
      `Build a sports and live events dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize event and fan KPIs: venue occupancy rates, dynamic ticket pricing, event type distribution, ` +
      `attendance volumes, fan engagement (fantasy points, social shares), and venue capacity utilization. ` +
      `Include trend analysis for ticket demand and geographic fan distribution.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'filtered_view', 'trend_analysis', 'geographic_view'],
  },

  'Fitness & Wellness': {
    group: 'Gaming & Leisure',
    prompt: (company, journey) =>
      `Build a fitness and wellness dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize member retention and studio KPIs: churn risk scores, member tenure, visit decline tracking, ` +
      `class occupancy, instructor ratings, studio capacity utilization, and engagement trends. ` +
      `Include trend analysis for membership patterns.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'filtered_view', 'trend_analysis'],
  },

  // ── GOVERNMENT & PUBLIC SECTOR ─────────────────────────────────
  'Government & Public Sector': {
    group: 'Government',
    prompt: (company, journey) =>
      `Build a government and public sector dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize citizen service KPIs: benefits claim processing, assessment requirements, backdating weeks, ` +
      `mandatory reconsideration rates, vulnerability flags, tax filing compliance, submission methods, ` +
      `penalty risk, and waiting days distribution. ` +
      `Include performance SLAs for processing times and error analysis for rejected submissions.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'filtered_view', 'performance_sla', 'error_analysis', 'trend_analysis'],
  },

  'Smart Cities & Urban Planning': {
    group: 'Government',
    prompt: (company, journey) =>
      `Build a smart cities dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize urban operations KPIs: emergency response times, incident severity distribution, ` +
      `units dispatched, lives at risk, traffic congestion levels, average speed, emissions reduction, ` +
      `intersection sensor data, and outcome status. Include geographic distribution and trend analysis.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'performance_sla', 'error_analysis', 'trend_analysis', 'geographic_view'],
  },

  // ── HOSPITALITY & TRAVEL ───────────────────────────────────────
  'Hospitality & Travel': {
    group: 'Hospitality',
    prompt: (company, journey) =>
      `Build a hospitality dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize hotel and booking KPIs: RevPAR, occupancy rates, average daily rate, nights booked, ` +
      `guest ratings, policy compliance (corporate bookings), savings vs rack rate, ` +
      `and room night volumes. Include geographic property distribution and seasonal trend analysis.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'filtered_view', 'trend_analysis', 'geographic_view'],
  },

  'Food & Beverage': {
    group: 'Hospitality',
    prompt: (company, journey) =>
      `Build a food and beverage dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize restaurant and ordering KPIs: delivery times, cuisine type distribution, ` +
      `item counts per order, delivery method split, reservation party sizes, ` +
      `no-show rates, dietary restriction tracking, and deposit collection. Include hourly demand patterns.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'filtered_view', 'performance_sla', 'trend_analysis'],
  },

  'Food Delivery & Quick Commerce': {
    group: 'Hospitality',
    prompt: (company, journey) =>
      `Build a food delivery dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize delivery operations KPIs: ETA accuracy, delivery attempts, vehicle type distribution, ` +
      `parcel weight, customer open rates for notifications, and dispatch efficiency. ` +
      `Include performance SLAs for delivery times and geographic delivery coverage.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'performance_sla', 'error_analysis', 'trend_analysis', 'geographic_view'],
  },

  // ── LOGISTICS ──────────────────────────────────────────────────
  'Logistics & Supply Chain': {
    group: 'Logistics',
    prompt: (company, journey) =>
      `Build a logistics and supply chain dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize shipping and tracking KPIs: ETA variance, exceptions raised, temperature compliance, ` +
      `tracking accuracy, transit days, customs clearance status, incoterms distribution, ` +
      `weight categories, and carbon offset inclusion. Include geographic shipment routing and trend analysis.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'filtered_view', 'performance_sla', 'error_analysis', 'trend_analysis', 'geographic_view'],
  },

  'Shipping & Maritime': {
    group: 'Logistics',
    prompt: (company, journey) =>
      `Build a shipping and maritime dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize port and vessel KPIs: annual TEU, vessel calls, crane MPH, average dwell time, ` +
      `CII rating, fuel costs per day, fuel savings, vessel count, and voyage efficiency. ` +
      `Include performance SLAs for port operations and geographic route analysis.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'performance_sla', 'trend_analysis', 'geographic_view'],
  },

  // ── MANUFACTURING ──────────────────────────────────────────────
  'Industrial & Manufacturing IoT': {
    group: 'Manufacturing',
    prompt: (company, journey) =>
      `Build an industrial IoT and manufacturing dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize OT and production KPIs: OEE (Overall Equipment Effectiveness), MTBF, failure mode distribution, ` +
      `asset criticality, predictive maintenance alerts, and production line efficiency. ` +
      `Include performance SLAs for equipment uptime and trend analysis for failure patterns.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'performance_sla', 'error_analysis', 'golden_signals_saturation', 'trend_analysis'],
  },

  'Industrial Manufacturing': {
    group: 'Manufacturing',
    prompt: (company, journey) =>
      `Build a manufacturing procurement dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize procurement and quality KPIs: lead times, MOQ quantities, quality grades, supplier ratings, ` +
      `and supply chain reliability. Include performance SLAs and trend analysis for supplier performance.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'performance_sla', 'trend_analysis'],
  },

  'Chemical & Petrochemical': {
    group: 'Manufacturing',
    prompt: (company, journey) =>
      `Build a chemical and petrochemical dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize safety and process KPIs: hazard class distribution, exposure limits (PPM), ` +
      `incident rates, batch yield, purity grades, and energy per tonne. ` +
      `Include safety compliance trends and error analysis for process deviations.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'performance_sla', 'error_analysis', 'trend_analysis'],
  },

  'Chemical & Process Industries': {
    group: 'Manufacturing',
    prompt: (company, journey) =>
      `Build a chemical process dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize batch and quality KPIs: batch yield, energy per tonne, purity grades, ` +
      `hazard class distribution, and process efficiency. Include trend analysis and error tracking.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'performance_sla', 'error_analysis', 'trend_analysis'],
  },

  'Semiconductor & Chip': {
    group: 'Manufacturing',
    prompt: (company, journey) =>
      `Build a semiconductor fabrication dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize fab and yield KPIs: yield rates, defect density, killer defect capture rates, ` +
      `wafers per day/week, cycle times, tool utilisation, and process step tracking. ` +
      `Include error analysis for defect patterns and trend analysis for yield improvement.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'performance_sla', 'error_analysis', 'trend_analysis'],
  },

  'Robotics & Automation': {
    group: 'Manufacturing',
    prompt: (company, journey) =>
      `Build a robotics and automation dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize fleet and fulfillment KPIs: fleet utilisation, tasks per robot per day, MTBF, ` +
      `labour cost replaced, orders per hour, pick accuracy, and units per hour. ` +
      `Include performance SLAs for robot uptime and error analysis for fulfillment failures.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'performance_sla', 'error_analysis', 'trend_analysis'],
  },

  'Mining & Resources': {
    group: 'Manufacturing',
    prompt: (company, journey) =>
      `Build a mining and resources dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize production and exploration KPIs: tonnage per day, recovery rates, OEE, cost per tonne, ` +
      `drill metres, drill cost per metre, discovery rates, and resource categories. ` +
      `Include performance SLAs and trend analysis for production efficiency.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'performance_sla', 'trend_analysis', 'geographic_view'],
  },

  // ── NEWS & MEDIA ───────────────────────────────────────────────
  'Media & Entertainment': {
    group: 'News & Media',
    prompt: (company, journey) =>
      `Build a media and entertainment dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize content and subscription KPIs: average watch time, completion rates, content library size, ` +
      `monthly churn rates, ARPU, retention savings, and revenue impact of churn prevention. ` +
      `Include trend analysis for engagement patterns and content performance.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'filtered_view', 'trend_analysis'],
  },

  'Publishing & Digital Media': {
    group: 'News & Media',
    prompt: (company, journey) =>
      `Build a publishing and digital media dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize reader engagement and subscription KPIs: articles per session, dwell time, bounce rate, ` +
      `paywall conversion, monthly churn, MRR contribution, renewal rates, and trial conversion. ` +
      `Include trend analysis for readership patterns and content performance.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'filtered_view', 'trend_analysis'],
  },

  'Music & Audio': {
    group: 'News & Media',
    prompt: (company, journey) =>
      `Build a music and audio platform dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize streaming and artist KPIs: daily listening minutes, skip rates, playlist followers, ` +
      `tracks available, streams per month, artist payouts, per-stream payout rates, and catalogue size. ` +
      `Include trend analysis for listening patterns and geographic streaming distribution.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'filtered_view', 'trend_analysis', 'geographic_view'],
  },

  'Social Media & Platforms': {
    group: 'News & Media',
    prompt: (company, journey) =>
      `Build a social media platform dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize content and advertising KPIs: content type distribution, moderation outcomes, viral scores, ` +
      `ad format performance, CTR, impressions served, and engagement rates. ` +
      `Include performance SLAs for content delivery and trend analysis.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'performance_sla', 'trend_analysis'],
  },

  'Advertising & MarTech': {
    group: 'News & Media',
    prompt: (company, journey) =>
      `Build an advertising and marketing technology dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize campaign and spend KPIs: campaigns active, managed spend, ROAS targets, ` +
      `CPM rates, viewability rates, fraud rates, and automation rule performance. ` +
      `Include trend analysis for campaign effectiveness and performance SLAs.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'performance_sla', 'trend_analysis'],
  },

  // ── REAL ESTATE ────────────────────────────────────────────────
  'Real Estate & Property': {
    group: 'Real Estate',
    prompt: (company, journey) =>
      `Build a real estate and property dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize property and mortgage KPIs: LTV percentages, deposit amounts, interest rates, ` +
      `mortgage terms, monthly payments, property type distribution, bedroom counts, ` +
      `saved properties, viewings booked, and alerts set up. ` +
      `Include geographic property distribution and trend analysis for market activity.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'filtered_view', 'trend_analysis', 'geographic_view'],
  },

  'Construction & Engineering': {
    group: 'Real Estate',
    prompt: (company, journey) =>
      `Build a construction and engineering dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize project and safety KPIs: bid win rates, project duration, project risk scores, ` +
      `safety incident rates, near miss rates, compliance rates, and risk zone distribution. ` +
      `Include performance SLAs for project milestones and trend analysis for safety improvements.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'performance_sla', 'error_analysis', 'trend_analysis'],
  },

  // ── SECURITY & PROTECTION SERVICES ─────────────────────────────
  'Cybersecurity': {
    group: 'Security & Protection Services',
    prompt: (company, journey) =>
      `Build a cybersecurity dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize threat and incident KPIs: MTTD and MTTR, attack vector distribution, threat severity levels, ` +
      `detection coverage, events per second throughput, false positive rates, and MITRE ATT&CK coverage. ` +
      `Include error analysis for missed detections and trend analysis for threat patterns.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'performance_sla', 'error_analysis', 'golden_signals_traffic', 'trend_analysis'],
  },

  'Defence & Aerospace': {
    group: 'Security & Protection Services',
    prompt: (company, journey) =>
      `Build a defence and aerospace dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize readiness and maintenance KPIs: fleet readiness, mission readiness, force readiness, ` +
      `component remaining useful life, MTBF, maintenance types, classification levels, ` +
      `and threat level distribution. Include performance SLAs and trend analysis.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'performance_sla', 'trend_analysis'],
  },

  // ── SOFTWARE ───────────────────────────────────────────────────
  'Consulting & Professional Services': {
    group: 'Software',
    prompt: (company, journey) =>
      `Build a consulting and professional services dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize utilization and engagement KPIs: utilisation rates vs targets, bench days, ` +
      `consultant count, engagement duration, team size, and revenue per consultant. ` +
      `Include trend analysis for utilization patterns and performance SLAs.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'filtered_view', 'trend_analysis'],
  },

  'Human Resources & HRTech': {
    group: 'Software',
    prompt: (company, journey) =>
      `Build an HR technology dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize talent and engagement KPIs: eNPS scores, voluntary turnover rates, engagement lift, ` +
      `survey response rates, cost per hire, time to hire, offer acceptance rates, ` +
      `and application-to-hire conversion. Include trend analysis for engagement patterns.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'filtered_view', 'trend_analysis'],
  },

  'Legal Services': {
    group: 'Software',
    prompt: (company, journey) =>
      `Build a legal services dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize case and document KPIs: estimated case values, conflict check compliance, ` +
      `fee arrangement types, jurisdiction distribution, document counts, AI-assisted review rates, ` +
      `risk issues found, and turnaround days. Include performance SLAs and error analysis.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'performance_sla', 'error_analysis', 'trend_analysis'],
  },

  // ── TECHNOLOGY ─────────────────────────────────────────────────
  'Data Centres & Cloud': {
    group: 'Technology',
    prompt: (company, journey) =>
      `Build a data centre and cloud infrastructure dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize infrastructure KPIs: PUE (Power Usage Effectiveness), rack counts, power density, ` +
      `cooling capacity, ambient temperatures, and capacity planning metrics. ` +
      `Include golden signals for saturation and performance SLAs for uptime.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'performance_sla', 'golden_signals_saturation', 'trend_analysis'],
  },

  'Space & Satellite': {
    group: 'Technology',
    prompt: (company, journey) =>
      `Build a space and satellite operations dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize orbital and observation KPIs: coverage area, resolution, revisit days, ` +
      `fuel remaining, orbit type distribution, satellite mass, and ground station contact windows. ` +
      `Include performance SLAs and trend analysis for satellite health.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'performance_sla', 'trend_analysis'],
  },

  // ── TELECOMMUNICATIONS ─────────────────────────────────────────
  'Telecommunications': {
    group: 'Telecommunications',
    prompt: (company, journey) =>
      `Build a telecommunications dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize network and subscriber KPIs: data usage (GB), network type distribution, ` +
      `contract lengths, first contact resolution rates, issue categories, resolution times, ` +
      `and ARPU by segment. Include performance SLAs for network uptime and trend analysis.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'filtered_view', 'performance_sla', 'error_analysis', 'golden_signals_traffic', 'trend_analysis'],
  },

  // ── TRANSPORTATION ─────────────────────────────────────────────
  'Airlines & Aviation': {
    group: 'Transportation',
    prompt: (company, journey) =>
      `Build an airlines and aviation dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize flight and passenger KPIs: check-in timing, seat assignment distribution, boarding groups, ` +
      `special assistance rates, travel document verification, ancillary revenue, baggage allowance, ` +
      `carbon offset uptake, flight duration, and seat selection preferences. ` +
      `Include performance SLAs for check-in processing and geographic route analysis.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'filtered_view', 'performance_sla', 'trend_analysis', 'geographic_view'],
  },

  'Rail & Transit': {
    group: 'Transportation',
    prompt: (company, journey) =>
      `Build a rail and transit dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize network and reliability KPIs: punctuality rates, capacity utilisation, load factors, ` +
      `train paths per day, delay minutes reduced, failure reduction rates, network reliability, ` +
      `and route kilometres monitored. Include performance SLAs and trend analysis.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'performance_sla', 'trend_analysis', 'geographic_view'],
  },

  'Ride-Hailing & Mobility': {
    group: 'Transportation',
    prompt: (company, journey) =>
      `Build a ride-hailing and mobility dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize matching and pricing KPIs: average pickup times, driver utilisation, request-to-pickup latency, ` +
      `rider ratings, surge multipliers, driver acceptance rates, driver earnings per hour, ` +
      `and surge frequency. Include performance SLAs and geographic demand distribution.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'performance_sla', 'golden_signals_latency', 'trend_analysis', 'geographic_view'],
  },

  'Automotive & Mobility': {
    group: 'Transportation',
    prompt: (company, journey) =>
      `Build an automotive dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize vehicle and service KPIs: vehicle age, mileage, warranty status, finance types, ` +
      `monthly payments, CO2 emissions, fuel type distribution, test drive bookings, ` +
      `trade-in values, and loaner vehicle requirements. Include trend analysis for sales patterns.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'filtered_view', 'trend_analysis'],
  },

  // ── TRAVEL ─────────────────────────────────────────────────────
  // (Hospitality & Travel already covered above)

  // ── WEALTH ─────────────────────────────────────────────────────
  // (Financial Services Wealth Mgmt already covered above)

  // ── AGRICULTURE & FOOD PRODUCTION ──────────────────────────────
  'Agriculture & AgriTech': {
    group: 'Manufacturing',
    prompt: (company, journey) =>
      `Build an agriculture and agritech dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize crop and harvest KPIs: yield per hectare, hectares planned, soil types, crop wastage rates, ` +
      `grain moisture levels, quality grades, tonnes harvested, and seasonal yield trends. ` +
      `Include geographic farm distribution and trend analysis for yield improvement.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'trend_analysis', 'geographic_view'],
  },

  // ── NONPROFIT ──────────────────────────────────────────────────
  'Nonprofit & NGO': {
    group: 'Public Sector',
    prompt: (company, journey) =>
      `Build a nonprofit and NGO dashboard for ${company} focused on the ${journey} journey. ` +
      `Prioritize impact and donor KPIs: donor retention rates, donor recurrence, cost per dollar raised, ` +
      `impact per dollar, disease surveillance alerts, outbreak detection accuracy, ` +
      `detection lead times, and countries monitored. Include geographic impact distribution.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'trend_analysis', 'geographic_view'],
  },
};

// ═══════════════════════════════════════════════════════════════════
// DYNATRACE INDUSTRY GROUP → FALLBACK PROMPTS
// For industries not explicitly listed above, fall back by group.
// ═══════════════════════════════════════════════════════════════════

const GROUP_FALLBACKS = {
  'Financial Services': (company, journey) =>
    `Build a financial services dashboard for ${company} focused on the ${journey} journey. ` +
    `Prioritize financial KPIs: transaction volumes, compliance scores, risk levels, approval rates, ` +
    `fraud detection, and customer lifetime value by segment. Include trend analysis and error tracking.`,

  'Insurance': (company, journey) =>
    `Build an insurance dashboard for ${company} focused on the ${journey} journey. ` +
    `Prioritize claims and policy KPIs: claim processing rates, settlement times, premium analysis, ` +
    `risk scoring, and customer retention. Include compliance trends and geographic distribution.`,

  'Retail & Ecommerce': (company, journey) =>
    `Build a retail and e-commerce dashboard for ${company} focused on the ${journey} journey. ` +
    `Prioritize conversion and shopping KPIs: cart rates, basket size, delivery methods, returns, ` +
    `payment distribution, and customer segmentation. Include hourly patterns and geographic analysis.`,

  'Healthcare': (company, journey) =>
    `Build a healthcare dashboard for ${company} focused on the ${journey} journey. ` +
    `Prioritize patient and clinical KPIs: processing volumes, verification rates, compliance status, ` +
    `claim outcomes, and care quality metrics. Include SLA tracking and error analysis.`,

  'Education': (company, journey) =>
    `Build an education dashboard for ${company} focused on the ${journey} journey. ` +
    `Prioritize student and academic KPIs: enrolment rates, capacity utilization, course completion, ` +
    `financial aid tracking, and student satisfaction. Include trend analysis and geographic distribution.`,

  'Energy & Utilities': (company, journey) =>
    `Build an energy and utilities dashboard for ${company} focused on the ${journey} journey. ` +
    `Prioritize consumption and infrastructure KPIs: usage metrics, billing accuracy, efficiency ratings, ` +
    `outage tracking, and sustainability targets. Include trend analysis and geographic coverage.`,

  'Gaming & Leisure': (company, journey) =>
    `Build a gaming and leisure dashboard for ${company} focused on the ${journey} journey. ` +
    `Prioritize player and event KPIs: engagement rates, monetization, session times, ` +
    `retention patterns, and responsible gaming compliance. Include trend analysis.`,

  'Government': (company, journey) =>
    `Build a government services dashboard for ${company} focused on the ${journey} journey. ` +
    `Prioritize citizen service KPIs: application volumes, processing times, compliance rates, ` +
    `error rates, and service accessibility. Include SLA tracking and trend analysis.`,

  'Hospitality': (company, journey) =>
    `Build a hospitality dashboard for ${company} focused on the ${journey} journey. ` +
    `Prioritize guest and booking KPIs: occupancy, RevPAR, booking rates, guest satisfaction, ` +
    `and operational efficiency. Include seasonal trends and geographic distribution.`,

  'Logistics': (company, journey) =>
    `Build a logistics dashboard for ${company} focused on the ${journey} journey. ` +
    `Prioritize shipping and tracking KPIs: delivery performance, exception rates, transit times, ` +
    `compliance, and cost efficiency. Include geographic routing and trend analysis.`,

  'Manufacturing': (company, journey) =>
    `Build a manufacturing dashboard for ${company} focused on the ${journey} journey. ` +
    `Prioritize production and quality KPIs: OEE, yield rates, defect tracking, MTBF, ` +
    `and supply chain metrics. Include performance SLAs and trend analysis.`,

  'News & Media': (company, journey) =>
    `Build a media and content dashboard for ${company} focused on the ${journey} journey. ` +
    `Prioritize engagement and subscription KPIs: content consumption, churn rates, ARPU, ` +
    `conversion funnels, and audience reach. Include trend analysis and content performance.`,

  'Real Estate': (company, journey) =>
    `Build a real estate dashboard for ${company} focused on the ${journey} journey. ` +
    `Prioritize property and market KPIs: listing performance, valuation trends, occupancy, ` +
    `and transaction volumes. Include geographic distribution and trend analysis.`,

  'Security & Protection Services': (company, journey) =>
    `Build a security services dashboard for ${company} focused on the ${journey} journey. ` +
    `Prioritize threat and response KPIs: detection rates, response times, incident severity, ` +
    `coverage metrics, and compliance. Include trend analysis and error tracking.`,

  'Software': (company, journey) =>
    `Build a software and services dashboard for ${company} focused on the ${journey} journey. ` +
    `Prioritize utilisation and delivery KPIs: engagement metrics, resource allocation, ` +
    `project tracking, and client satisfaction. Include performance SLAs and trend analysis.`,

  'Technology': (company, journey) =>
    `Build a technology infrastructure dashboard for ${company} focused on the ${journey} journey. ` +
    `Prioritize infrastructure and capacity KPIs: utilization, efficiency, uptime, ` +
    `and operational metrics. Include golden signals and trend analysis.`,

  'Telecommunications': (company, journey) =>
    `Build a telecommunications dashboard for ${company} focused on the ${journey} journey. ` +
    `Prioritize network and subscriber KPIs: usage metrics, service quality, resolution rates, ` +
    `and ARPU. Include performance SLAs, golden signals, and trend analysis.`,

  'Transportation': (company, journey) =>
    `Build a transportation dashboard for ${company} focused on the ${journey} journey. ` +
    `Prioritize route and service KPIs: punctuality, capacity, efficiency metrics, ` +
    `and passenger experience. Include performance SLAs and geographic analysis.`,

  'Public Sector': (company, journey) =>
    `Build a public sector dashboard for ${company} focused on the ${journey} journey. ` +
    `Prioritize service delivery KPIs: processing volumes, wait times, compliance, ` +
    `and impact metrics. Include trend analysis and geographic distribution.`,

  'Wealth': (company, journey) =>
    `Build a wealth management dashboard for ${company} focused on the ${journey} journey. ` +
    `Prioritize portfolio and client KPIs: AUM, risk profiles, fees, transfer efficiency, ` +
    `and client segmentation. Include trend analysis and compliance tracking.`,

  'Travel': (company, journey) =>
    `Build a travel and tourism dashboard for ${company} focused on the ${journey} journey. ` +
    `Prioritize booking and experience KPIs: occupancy, satisfaction, revenue per unit, ` +
    `and seasonal patterns. Include geographic distribution and trend analysis.`,
};

// ═══════════════════════════════════════════════════════════════════
// MAIN EXPORT: Get the bespoke prompt for any industry + journey
// ═══════════════════════════════════════════════════════════════════

/**
 * Returns a bespoke prompt tailored to the specific industry, or falls back
 * to the Dynatrace industry group, or finally a generic prompt.
 */
export function getBespokePrompt(industryType, company, journeyType) {
  // 1. Exact industry match
  const exact = INDUSTRY_PROMPTS[industryType];
  if (exact) {
    return {
      prompt: exact.prompt(company, journeyType),
      sections: exact.sections,
      group: exact.group,
      matchType: 'exact',
    };
  }

  // 2. Try fuzzy match on industry name (handle minor naming variations)
  const normalised = industryType.toLowerCase().replace(/[^a-z0-9 ]/g, '');
  for (const [key, val] of Object.entries(INDUSTRY_PROMPTS)) {
    const normKey = key.toLowerCase().replace(/[^a-z0-9 ]/g, '');
    if (normalised.includes(normKey) || normKey.includes(normalised)) {
      return {
        prompt: val.prompt(company, journeyType),
        sections: val.sections,
        group: val.group,
        matchType: 'fuzzy',
      };
    }
  }

  // 3. Try group fallback — match the group name in the industry string
  for (const [groupName, promptFn] of Object.entries(GROUP_FALLBACKS)) {
    const normGroup = groupName.toLowerCase().replace(/[^a-z0-9 ]/g, '');
    if (normalised.includes(normGroup) || normGroup.includes(normalised)) {
      return {
        prompt: promptFn(company, journeyType),
        sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'filtered_view', 'performance_sla', 'trend_analysis'],
        group: groupName,
        matchType: 'group',
      };
    }
  }

  // 4. Generic fallback
  return {
    prompt: `Create a comprehensive business observability dashboard for ${company} covering the ${journeyType} journey. ` +
      `Include executive KPIs, journey funnel overview, error analysis, performance SLAs, customer experience metrics, ` +
      `and trend analysis. Show key business metrics from the journey data.`,
    sections: ['executive_kpis', 'journey_overview', 'customer_dynamic', 'filtered_view', 'performance_sla', 'error_analysis', 'trend_analysis'],
    group: 'Generic',
    matchType: 'generic',
  };
}

/**
 * Returns the recommended sections for a given industry (for keyword fallback).
 */
export function getBespokeSections(industryType) {
  const exact = INDUSTRY_PROMPTS[industryType];
  if (exact) return exact.sections;
  return ['executive_kpis', 'journey_overview', 'customer_dynamic', 'filtered_view', 'performance_sla', 'trend_analysis'];
}

export default { getBespokePrompt, getBespokeSections, INDUSTRY_PROMPTS, GROUP_FALLBACKS };
