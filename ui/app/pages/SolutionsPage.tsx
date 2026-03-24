import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Page } from '@dynatrace/strato-components-preview/layouts';
import { Flex } from '@dynatrace/strato-components/layouts';
import { Heading, Paragraph, Strong } from '@dynatrace/strato-components/typography';
import Colors from '@dynatrace/strato-design-tokens/colors';
import { InfoButton } from '../components/InfoButton';

// ── Types ──────────────────────────────────────────────────
interface Integration {
  name: string;
  description: string;
  category?: string;
  useCases?: string[];
  monitoringPoints?: string[];
  bizObsValue?: string;
  dynatraceHow?: { capability: string; detail: string }[];
}

interface Journey {
  name: string;
  configFile: string;
}

interface VerticalSolution {
  id: string;
  icon: string;
  industry: string;
  color: string;
  tagline: string;
  description: string;
  painPoints: string[];
  roiPoints: string[];
  integrations: Integration[];
  journeys: Journey[];
  kpis: string[];
}

// ── Vertical Solutions Data ────────────────────────────────
const SOLUTIONS: VerticalSolution[] = [
  {
    id: 'healthcare',
    icon: '🏥',
    industry: 'Healthcare & Life Sciences',
    color: '#e74c3c',
    tagline: 'Prove AI is improving patient outcomes — not just generating cost',
    description: 'Healthcare is pouring investment into AI — clinical decision support, AI triage, predictive readmission models, ambient clinical documentation, and AI-powered imaging. But without observability into these AI systems, organizations cannot prove ROI, detect silent failures, or satisfy regulatory scrutiny. Dynatrace makes AI performance and patient impact measurable.',
    painPoints: [
      'AI clinical decision support tools add latency to Epic/Cerner workflows but nobody measures whether they actually reduce misdiagnosis rates',
      'Ambient AI documentation (DAX Copilot, Nuance) fails silently — physicians lose notes and revert to manual, negating the $100K+ investment',
      'Predictive readmission models score patients but nobody validates whether interventions triggered by AI actually reduce 30-day readmissions',
      'AI-powered imaging analysis (PathAI, Viz.ai) has variable inference times — slow results delay critical stroke/PE diagnoses',
      'No way to prove AI ROI to the board — "We spent $5M on AI last year, did patient outcomes improve?" remains unanswerable',
    ],
    roiPoints: [
      'Prove AI clinical ROI — measure whether AI decision support actually reduces misdiagnosis rates and unnecessary testing vs baseline',
      'Detect AI documentation failures instantly — alert when ambient AI transcription accuracy drops below threshold, before physicians lose trust',
      'Validate predictive model effectiveness — correlate AI readmission risk scores with actual 30-day readmission data to prove model ROI',
      'Accelerate partner deployment — pre-built Epic/Cerner/Meditech integrations let partners demonstrate AI observability value in weeks, not months',
      'Satisfy regulatory requirements — provide auditable evidence of AI system performance, uptime, and accuracy for FDA/CMS compliance',
    ],
    integrations: [
      {
        name: 'Epic',
        category: 'EHR Platform',
        description: 'Epic is the largest EHR platform in the US, and its AI ecosystem — Cognitive Computing, predictive analytics, MyChart AI triage, and third-party AI integrations — is expanding rapidly. Dynatrace provides observability into how AI features perform within Epic workflows and whether they deliver measurable patient outcome improvements.',
        useCases: [
          'AI clinical decision support — monitor Epic\'s embedded AI recommendation latency within physician workflows and measure adoption rates (accepted vs overridden)',
          'MyChart AI triage — track AI symptom checker accuracy, response times, and appropriate escalation rates for patient self-service',
          'Predictive Sepsis/Deterioration — observe AI early warning model inference times, alert accuracy (true positive vs false alarm rates), and intervention response times',
          'Ambient clinical documentation — monitor AI transcription integrations (Nuance DAX, Abridge) within Epic for accuracy, completion rates, and physician time saved',
          'FHIR API AI consumers — track third-party AI apps consuming Epic FHIR APIs for latency, error rates, and data freshness that affects AI model quality',
        ],
        monitoringPoints: [
          'AI recommendation acceptance rate vs override rate by department',
          'MyChart AI triage confidence scores and escalation accuracy',
          'Predictive model inference latency within clinical workflows',
          'Ambient documentation AI transcription accuracy and save rates',
          'FHIR API response times for AI consumer applications',
          'AI feature availability during peak clinical hours (7am-7pm)',
        ],
        bizObsValue: 'Partners can show health systems exactly how AI is performing — "AI sepsis prediction caught 23 true positives this month with 4-hour early warning, but false alarm rate is 18% causing alert fatigue in ICU. MyChart AI triage deflected 1,200 low-acuity visits worth $340K." That proves AI ROI in patient outcome and financial terms.',
        dynatraceHow: [
          { capability: 'OneAgent (Full-Stack)', detail: 'Deploy OneAgent on Epic Hyperspace web servers, Interconnect middleware, and FHIR API gateways. Auto-discover every AI integration point — from clinical decision support calls to ambient documentation API requests — without modifying Epic configurations.' },
          { capability: 'Business Events (BizEvents)', detail: 'Capture AI-specific clinical events — ai_recommendation_shown, ai_recommendation_accepted, ai_recommendation_overridden, ai_triage_completed, ai_sepsis_alert_fired — each carrying patient acuity and outcome data for ROI measurement.' },
          { capability: 'Dynatrace Intelligence', detail: 'Dynatrace Intelligence baselines AI system performance across all Epic environments. When AI transcription accuracy drops, prediction model latency spikes, or MyChart AI triage starts escalating abnormally, it detects the anomaly and identifies root cause automatically.' },
          { capability: 'Log Analytics (Grail)', detail: 'Ingest Epic Chronicles audit logs, AI model inference logs, and FHIR API access logs into Grail. Correlate AI prediction events with actual patient outcomes for retrospective ROI analysis and regulatory compliance evidence.' },
          { capability: 'Dashboards & Notebooks', detail: 'Pre-built AI ROI dashboards for healthcare — AI recommendation adoption rates by department, predictive model accuracy trends, AI-deflected visits and cost savings, ambient documentation time savings. Partners present these to C-suite to justify continued AI investment.' },
        ],
      },
      {
        name: 'Cerner (Oracle Health)',
        category: 'EHR Platform',
        description: 'Oracle Health (Cerner) is integrating Oracle\'s AI and cloud capabilities into the Millennium platform — AI-assisted coding, clinical AI alerts, and Oracle Health Data Intelligence. Dynatrace observes the full AI pipeline from data ingestion through model inference to clinical action.',
        useCases: [
          'Oracle Clinical AI — monitor AI-assisted clinical alerts for accuracy, latency within Millennium PowerChart workflows, and physician response rates',
          'AI-assisted medical coding — track automated ICD/CPT code suggestion accuracy, coder acceptance rates, and revenue cycle impact',
          'Health Data Intelligence — observe AI analytics pipeline performance, data freshness, and predictive model inference times for population health',
          'AI order sets — monitor smart order recommendation relevance, adoption rates, and impact on standardized care pathway adherence',
          'Oracle AI infrastructure — track Oracle Cloud AI services underpinning Cerner AI features for availability and latency',
        ],
        monitoringPoints: [
          'AI clinical alert accuracy (true positive rate) and response times',
          'Automated coding suggestion acceptance rate and revenue accuracy',
          'Health Data Intelligence pipeline freshness and query performance',
          'AI order set adoption rate vs manual ordering by department',
          'Oracle Cloud AI service availability and inference latency',
          'Millennium PowerChart AI widget load times during peak hours',
        ],
        bizObsValue: 'Oracle Health clients investing in AI coding and clinical AI need proof it works — "AI-assisted coding improved first-pass claim acceptance by 12%, recovering $2.1M annually. AI clinical alerts had a 78% true positive rate — up from 61% after model retraining last quarter." That ROI data drives expansion.',
        dynatraceHow: [
          { capability: 'Distributed Tracing', detail: 'Trace AI-powered transactions end-to-end — from physician action in PowerChart through Millennium middleware to Oracle Cloud AI services and back. Identify exactly where AI inference latency is introduced in clinical workflows.' },
          { capability: 'Business Events (BizEvents)', detail: 'Emit events for AI coding interactions — ai_code_suggested, ai_code_accepted, ai_code_overridden, ai_alert_fired, ai_alert_acknowledged — with revenue and clinical context. DQL queries show AI coding ROI and alert effectiveness in dollars and outcomes.' },
          { capability: 'Service-Level Objectives (SLOs)', detail: 'Define AI-specific SLOs — "AI clinical alerts fire within 30 seconds 99.9% of the time" or "AI coding suggestions available during 99.5% of coder work hours." Track burn rate so AI system degradation is caught before it impacts clinical operations.' },
          { capability: 'Dynatrace Intelligence', detail: 'Dynatrace Intelligence detects when AI features within Millennium degrade — coding suggestion latency increases, alert accuracy drops, or Health Data Intelligence pipelines fall behind — and automatically correlates with infrastructure or cloud changes.' },
        ],
      },
      {
        name: 'Meditech',
        category: 'HIS Platform',
        description: 'Meditech Expanse is adopting AI for clinical surveillance, predictive analytics, and operational efficiency in community and rural hospitals. These facilities often have limited IT resources — making pre-built Dynatrace observability essential for proving AI value without heavy custom work.',
        useCases: [
          'Clinical surveillance AI — monitor AI sepsis/deterioration screening accuracy and alert-to-intervention time in Expanse',
          'Predictive analytics — track AI-powered patient flow predictions (bed management, ED wait times) for accuracy and operational impact',
          'AI-powered documentation — observe ambient clinical documentation AI integrations within Meditech for transcription quality and physician adoption',
          'Revenue cycle AI — monitor AI charge capture and coding assistance accuracy within Meditech billing workflows',
        ],
        monitoringPoints: [
          'AI surveillance alert accuracy and false alarm rates',
          'Patient flow prediction accuracy vs actual outcomes',
          'AI documentation transcription accuracy and save rates',
          'AI charge capture revenue uplift vs manual process',
          'Meditech Expanse AI feature availability during shifts',
        ],
        bizObsValue: 'Community hospitals need to justify AI investments with limited budgets. Partners can show — "AI clinical surveillance caught 8 deteriorating patients 6 hours earlier this quarter, potentially avoiding $480K in ICU escalation costs. AI charge capture recovered $67K in missed charges." That makes the business case for rural AI adoption.',
        dynatraceHow: [
          { capability: 'Real User Monitoring (RUM)', detail: 'Deploy RUM on Meditech Expanse web interfaces to capture clinician interactions with AI features — alert acknowledgments, documentation workflows, and AI suggestion adoption. Measure AI feature load times and usability across community hospital networks.' },
          { capability: 'Synthetic Monitoring', detail: 'Run scheduled synthetic checks against AI surveillance endpoints, documentation AI services, and coding AI APIs. Detect AI feature outages before the start of clinical shifts in hospitals with limited 24/7 IT coverage.' },
          { capability: 'Dashboards & Notebooks', detail: 'Pre-built community hospital AI dashboards — AI surveillance accuracy trends, documentation time savings per physician, charge capture uplift, and patient flow prediction accuracy. Designed for quick partner deployment with minimal customization.' },
        ],
      },
    ],
    journeys: [
      { name: 'Patient Registration', configFile: 'config-healthcare-patient-registration.json' },
      { name: 'Insurance Claims', configFile: 'config-healthcare-insurance-claims.json' },
    ],
    kpis: ['AI clinical alert accuracy', 'AI recommendation adoption rate', 'AI-deflected visit savings', 'AI feature uptime during clinical hours'],
  },
  {
    id: 'pharma',
    icon: '💊',
    industry: 'Pharmaceuticals & Life Sciences',
    color: '#8e44ad',
    tagline: 'Prove AI accelerates drug development — not just adds complexity',
    description: 'Pharma is investing billions in AI — from AI-powered drug discovery and molecule design to AI clinical trial optimization, real-world evidence mining, and AI pharmacovigilance. But without observability, these AI investments are opaque. Dynatrace lets pharma organizations and partners prove that AI is measurably accelerating timelines, improving trial outcomes, and reducing costs.',
    painPoints: [
      'AI drug discovery platforms (Schrödinger, Recursion) run expensive GPU-intensive simulations with no visibility into cost-per-prediction or model accuracy trends',
      'AI clinical trial matching (Tempus, Trials.ai) silently degrades — patient matching quality drops when upstream EHR data feeds become stale',
      'AI pharmacovigilance systems miss adverse event signals when NLP models encounter unfamiliar drug terminology or reporting formats',
      'AI regulatory document generation produces draft submissions that require extensive manual rework — no one measures the actual time savings vs cost',
      'No way to answer the board question: "Our $50M AI R&D investment — how many months did it actually shave off our pipeline timelines?"',
    ],
    roiPoints: [
      'Prove AI drug discovery ROI — measure cost per AI-discovered candidate vs traditional screening and time-to-IND reduction',
      'Validate AI trial optimization — correlate AI-matched patients with actual enrolment rates, retention, and trial outcome quality',
      'Detect AI pharmacovigilance gaps — alert when NLP adverse event detection accuracy declines before regulatory exposure occurs',
      'Accelerate partner deployment — pre-built Veeva/IQVIA/SAP integrations let partners show AI observability value without custom GxP validation work',
      'Satisfy GxP compliance for AI — provide auditable evidence of AI system performance, data integrity, and model versioning for FDA/EMA submissions',
    ],
    integrations: [
      {
        name: 'Veeva',
        category: 'Life Sciences Cloud',
        description: 'Veeva Systems is the dominant cloud platform for pharma — Vault (clinical, regulatory, quality), CRM, and increasingly Veeva AI Partners. Dynatrace observes AI features across the Veeva ecosystem to prove they deliver measurable pipeline acceleration.',
        useCases: [
          'Veeva Vault AI — monitor AI-powered document classification, auto-tagging, and content suggestion accuracy within Vault PromoMats and Vault Submissions',
          'Veeva CRM AI — track AI-driven HCP engagement scoring, next-best-action recommendations, and rep adoption rates',
          'Veeva Andi (AI Assistant) — observe AI assistant response times, query accuracy, and user satisfaction within Vault workflows',
          'Clinical Vault AI — monitor AI-assisted study startup, document review automation, and milestone prediction accuracy',
          'Veeva Compass AI — track AI-powered patient and prescriber data enrichment quality and freshness',
        ],
        monitoringPoints: [
          'AI document classification accuracy and manual correction rates',
          'HCP next-best-action AI acceptance rate by sales team',
          'Veeva Andi AI response latency and query success rate',
          'AI study startup prediction accuracy vs actual timelines',
          'Vault AI feature availability during critical submission windows',
          'Veeva API response times for AI-consuming integrations',
        ],
        bizObsValue: 'Partners can show pharma clients — "AI document classification in Vault PromoMats reduced manual review time by 340 hours this quarter. But Veeva Andi AI response times degraded 3x during your NDA submission crunch, costing an estimated 2-day delay." That data justifies investment and drives optimization.',
        dynatraceHow: [
          { capability: 'Real User Monitoring (RUM)', detail: 'Deploy RUM on Veeva Vault web interfaces to capture every AI interaction — document classification suggestions, AI search results, Andi queries. Measure AI feature adoption rates and response times across teams and regions.' },
          { capability: 'Business Events (BizEvents)', detail: 'Emit events for AI-powered actions — ai_doc_classified, ai_tag_suggested, ai_nba_shown, ai_nba_accepted, ai_study_prediction. Each carries accuracy and business context for DQL-powered AI ROI analysis.' },
          { capability: 'Dynatrace Intelligence', detail: 'Dynatrace Intelligence baselines AI feature performance within Veeva. When document classification accuracy drops, AI assistant response times spike, or HCP scoring quality degrades, it detects anomalies and correlates with data pipeline or infrastructure changes.' },
          { capability: 'Service-Level Objectives (SLOs)', detail: 'Define GxP-relevant AI SLOs — "AI document classification available 99.9% during regulatory submission windows" or "AI study predictions accurate within ±15% for 95% of milestones." Auditable SLO reports satisfy FDA/EMA computerized system validation requirements.' },
        ],
      },
      {
        name: 'IQVIA',
        category: 'Clinical Trial Platform',
        description: 'IQVIA\'s AI-powered platforms — Orchestrated Clinical Trials (OCT), AI trial design, patient analytics — are central to modern clinical development. Dynatrace ensures AI-driven trial optimization actually delivers measurable enrolment and timeline improvements.',
        useCases: [
          'AI trial design — monitor AI-powered protocol optimization models for prediction accuracy (enrolment feasibility, site selection, endpoint optimization)',
          'AI patient finding — track AI patient identification and matching algorithms for accuracy, coverage, and successful enrolment conversion',
          'OCT AI automation — observe AI-automated trial workflows (randomization, data cleaning, signal detection) for speed and accuracy vs manual processes',
          'Real-world evidence AI — monitor NLP/ML models processing real-world data (claims, EHR, lab) for extraction quality and insight generation times',
          'AI safety analytics — track AI-powered adverse event detection and signal analysis accuracy within pharmacovigilance workflows',
        ],
        monitoringPoints: [
          'AI trial design prediction accuracy vs actual outcomes',
          'Patient matching algorithm precision and recall rates',
          'OCT AI automation time savings vs manual workflows',
          'RWE NLP extraction accuracy and processing throughput',
          'AI safety signal detection sensitivity and specificity',
          'IQVIA platform API response times for AI features',
        ],
        bizObsValue: 'Clinical development leaders need proof — "AI trial design recommendations reduced our Phase III enrollment timeline by 4.2 months, saving an estimated $28M in operational costs. AI patient finding identified 34% more eligible patients than manual methods." That justifies the IQVIA AI investment.',
        dynatraceHow: [
          { capability: 'Distributed Tracing', detail: 'Trace AI-powered clinical workflows end-to-end — from trial design request through AI model inference, data retrieval from real-world evidence databases, and result delivery. Pinpoint where AI processing bottlenecks delay trial optimization decisions.' },
          { capability: 'Custom Metrics via OpenTelemetry', detail: 'Instrument AI trial metrics — model confidence scores, patient match quality scores, NLP extraction accuracy, signal detection sensitivity. Dynatrace ingests via OTLP and correlates with trial outcome data for end-to-end AI ROI measurement.' },
          { capability: 'Log Analytics (Grail)', detail: 'Ingest IQVIA processing logs, AI model training and inference logs, and data pipeline status logs. Detect when AI model retraining causes quality regressions or when data freshness issues degrade patient finding accuracy.' },
          { capability: 'Dashboards & Notebooks', detail: 'Pre-built clinical AI dashboards — trial design AI accuracy trends, patient finding conversion funnels, RWE processing throughput, safety signal detection rates. Partners present these to pharma sponsors to justify AI-powered trial optimization investment.' },
        ],
      },
      {
        name: 'SAP (Pharma)',
        category: 'Supply Chain & Manufacturing',
        description: 'SAP S/4HANA with AI-powered demand forecasting, predictive quality, and intelligent supply chain planning is transforming pharma manufacturing and distribution. Dynatrace ensures AI-driven supply chain decisions actually reduce waste and improve availability.',
        useCases: [
          'AI demand forecasting — monitor ML-powered demand prediction accuracy for drug products, measuring forecast error vs actual sales',
          'Predictive quality — track AI quality inspection models for defect detection accuracy vs manual inspection in GMP manufacturing',
          'Intelligent supply chain — observe AI-powered cold chain optimization, route planning, and inventory rebalancing recommendation quality',
          'AI batch release — monitor AI-assisted batch review and release recommendation accuracy and time savings vs manual review',
          'SAP Business AI — track SAP Joule AI assistant adoption and effectiveness within pharma supply chain workflows',
        ],
        monitoringPoints: [
          'AI demand forecast accuracy (MAPE/WMAPE) by product and region',
          'Predictive quality AI detection accuracy vs manual inspection',
          'Cold chain AI optimization cost savings per shipment',
          'AI batch release time savings vs manual review cycles',
          'SAP Business AI (Joule) response times and query accuracy',
          'AI data pipeline freshness from manufacturing systems to models',
        ],
        bizObsValue: 'Pharma supply chain leaders need concrete AI ROI — "AI demand forecasting reduced overstock waste by $4.7M this year while maintaining 99.2% fill rate. Predictive quality AI caught 23 batches that would have failed final QC, avoiding $8.2M in rework costs." That drives continued investment.',
        dynatraceHow: [
          { capability: 'OneAgent (Full-Stack)', detail: 'Deploy OneAgent on SAP S/4HANA application servers, batch processing systems, and AI model serving infrastructure. Auto-discover the complete AI supply chain pipeline without modifying SAP configurations or affecting GMP validation status.' },
          { capability: 'Business Events (BizEvents)', detail: 'Capture supply chain AI events — ai_forecast_generated, ai_quality_check_passed, ai_quality_check_flagged, ai_route_optimized, ai_batch_release_recommended — with financial and compliance context for ROI dashboards.' },
          { capability: 'Workflows & Automation', detail: 'When Dynatrace Intelligence detects AI forecast accuracy degradation or predictive quality model drift, Dynatrace Workflows automatically notify supply chain teams, create quality incidents, and trigger model revalidation processes.' },
          { capability: 'Dashboards & Notebooks', detail: 'Pre-built pharma supply chain AI dashboards — demand forecast accuracy trends, predictive quality savings, cold chain optimization ROI, batch release acceleration. Partners use these to demonstrate AI value to pharma operations leadership.' },
        ],
      },
    ],
    journeys: [
      { name: 'Drug Trial Enrolment', configFile: 'config-pharma-drug-trial-enrolment.json' },
      { name: 'Regulatory Submission', configFile: 'config-pharma-regulatory-submission.json' },
    ],
    kpis: ['AI trial timeline reduction', 'AI forecast accuracy (MAPE)', 'AI pharmacovigilance detection rate', 'AI feature GxP compliance score'],
  },
  {
    id: 'retail-banking',
    icon: '🏦',
    industry: 'Retail Banking',
    color: '#2980b9',
    tagline: 'Prove AI is driving revenue and reducing risk — not just hype',
    description: 'Banks are deploying AI across every channel — AI-powered fraud detection, AI credit decisioning, conversational banking chatbots, AI-driven personalization, and robo-advisory. But most cannot prove whether these AI systems are actually reducing fraud losses, accelerating approvals, or improving customer lifetime value. Dynatrace closes the measurement gap.',
    painPoints: [
      'AI fraud detection blocks legitimate transactions (false positives) causing customer friction and churn, but nobody quantifies the revenue impact',
      'AI credit decisioning models drift silently — approval rates shift without teams noticing until quarterly reviews reveal anomalies',
      'Conversational AI chatbots (Kasisto, Clinc) escalate to live agents at high rates, negating the cost-saving justification for the AI investment',
      'AI-powered personalization engines recommend irrelevant products because behavioral data pipelines are stale or incomplete',
      'Board asks "Is our $30M AI transformation actually working?" and digital banking teams cannot answer with auditable data',
    ],
    roiPoints: [
      'Prove AI fraud ROI — measure fraud prevented vs false positive revenue loss, giving risk teams data to optimize AI thresholds',
      'Validate AI credit decisioning — correlate AI approval/decline patterns with actual default rates to prove model quality',
      'Quantify chatbot ROI — measure AI containment rate, deflected call center costs, and customer satisfaction vs human agent interactions',
      'Accelerate partner deployment — pre-built FIS/Temenos/Finastra integrations let partners show AI observability value in weeks',
      'Lower barriers to AI adoption — partners deliver pre-configured AI monitoring for bank clients, reducing time-to-value from months to weeks',
    ],
    integrations: [
      {
        name: 'FIS',
        category: 'Core Banking Platform',
        description: 'FIS is the largest banking technology provider globally, and its AI capabilities — AI fraud detection (NYCE, Worldpay), AI credit decisioning, predictive analytics — are embedded across payment processing, digital banking, and risk management. Dynatrace ensures these AI features deliver measurable business outcomes.',
        useCases: [
          'AI fraud detection — monitor FIS fraud AI model accuracy, false positive rates, and blocked legitimate transaction revenue across card networks',
          'AI credit decisioning — track automated loan/credit AI approval accuracy, model drift, and correlation with actual default rates over time',
          'Worldpay AI payment routing — observe AI-powered payment routing optimization for approval rate lift vs standard routing',
          'Digital banking AI — monitor AI-personalized product recommendations, chatbot interactions, and AI-driven customer insights within FIS Digital One',
          'FIS analytics AI — track AI-powered business intelligence and predictive analytics delivery times, data freshness, and insight accuracy',
        ],
        monitoringPoints: [
          'AI fraud model false positive rate and blocked legitimate revenue',
          'AI credit decision accuracy vs actual 90-day default rates',
          'AI payment routing approval rate lift percentage',
          'AI chatbot containment rate and escalation patterns',
          'AI personalization click-through and product adoption rates',
          'FIS platform API response times for AI-powered endpoints',
        ],
        bizObsValue: 'Partners can show banks — "AI fraud detection prevented $12.4M in losses this quarter but false positives blocked $890K in legitimate transactions. AI credit decisioning reduced default rates by 0.3% across the portfolio, worth $4.2M annually." That ROI data drives AI investment expansion.',
        dynatraceHow: [
          { capability: 'Distributed Tracing', detail: 'Trace AI-powered banking transactions end-to-end — from customer action through FIS core banking to AI fraud scoring, credit decisioning, and payment routing. See exactly where AI latency and decisions impact the customer experience and business outcomes.' },
          { capability: 'Business Events (BizEvents)', detail: 'Capture AI banking events — ai_fraud_blocked, ai_fraud_approved, ai_credit_approved, ai_credit_declined, ai_route_selected, ai_chatbot_contained — with transaction amounts. DQL dashboards show AI ROI in dollars: fraud prevented, false positive costs, approval rate improvements.' },
          { capability: 'Dynatrace Intelligence', detail: 'Dynatrace Intelligence baselines AI banking metrics and detects when fraud model accuracy shifts, credit decisioning patterns change abnormally, or chatbot escalation rates spike — correlating with model deployments, data pipeline issues, or infrastructure changes.' },
          { capability: 'Service-Level Objectives (SLOs)', detail: 'Define AI-specific SLOs — "AI fraud scoring completes in <100ms for 99.9% of transactions" or "AI chatbot containment rate >65%." Track burn rate and alert before AI features breach performance or business outcome thresholds.' },
          { capability: 'Dashboards & Notebooks', detail: 'Pre-built AI banking ROI dashboards — fraud AI effectiveness (prevented vs false positives), credit AI accuracy trends, chatbot cost savings, personalization conversion lift. Partners present these to bank leadership quarterly to justify continued AI investment.' },
        ],
      },
      {
        name: 'Temenos',
        category: 'Banking Platform',
        description: 'Temenos powers 3,000+ banks globally and its AI capabilities — Explainable AI for credit, AI financial crime, AI customer engagement — are core to its value proposition. Dynatrace proves these AI features deliver measurable outcomes on the T24/Transact platform.',
        useCases: [
          'Explainable AI credit — monitor AI credit scoring model performance, decision explainability quality, and regulatory compliance evidence generation',
          'AI financial crime — track AI anti-money laundering model accuracy, false positive rates, and investigation efficiency improvements',
          'AI customer engagement — observe AI next-best-action recommendation effectiveness, personalization accuracy, and customer lifetime value impact',
          'Temenos AI infrastructure — monitor ML model serving, training pipelines, and data quality across the Temenos AI ecosystem',
        ],
        monitoringPoints: [
          'AI credit scoring response times and model accuracy trends',
          'AML AI false positive rate and investigation time reduction',
          'AI next-best-action acceptance rates and revenue impact',
          'ML model serving infrastructure utilization and latency',
          'AI data pipeline freshness and feature store accuracy',
          'Temenos API response times for AI-enabled endpoints',
        ],
        bizObsValue: 'Banks on Temenos need to prove AI ROI to regulators and boards — "Explainable AI credit reduced manual underwriting by 40%, saving $1.8M annually. AML AI cut false positives by 35%, freeing investigators to focus on real threats." That regulatory-grade evidence is what partners deliver with Dynatrace.',
        dynatraceHow: [
          { capability: 'OneAgent (Full-Stack)', detail: 'Deploy OneAgent on Temenos T24/Transact servers and AI model serving infrastructure. Auto-discover the complete AI pipeline — from API request through business logic to ML model inference and response — without modifying Temenos core configurations.' },
          { capability: 'Business Events (BizEvents)', detail: 'Emit events for AI banking decisions — ai_credit_scored, ai_aml_flagged, ai_aml_cleared, ai_nba_presented, ai_nba_accepted — with financial context. DQL enables queries like "AML AI false positive rate by customer segment" or "AI credit score accuracy by income bracket."' },
          { capability: 'Log Analytics (Grail)', detail: 'Ingest Temenos AI logs, model training logs, and decision audit trails into Grail. Correlate model retraining events with changes in decision quality. Provide regulators with auditable AI decision logs meeting explainability requirements.' },
          { capability: 'Dynatrace Intelligence', detail: 'Dynatrace Intelligence detects when AI feature behavior changes — credit scoring patterns shift, AML flagging rates spike, or customer engagement AI relevance drops — and automatically identifies whether the cause is model drift, data issues, or infrastructure degradation.' },
        ],
      },
      {
        name: 'Finastra',
        category: 'Financial Technology',
        description: 'Finastra\'s AI-powered solutions — AI lending, AI treasury, AI payments — serve 8,000+ institutions. Dynatrace ensures AI features within Finastra platforms deliver measurable improvements in lending speed, treasury optimization, and payment processing efficiency.',
        useCases: [
          'AI lending — monitor AI-powered loan origination, automated underwriting, and credit decision speed vs manual processes within Finastra Fusion',
          'AI treasury management — track AI cash flow forecasting accuracy, liquidity optimization recommendations, and FX risk predictions',
          'AI payments — observe AI-powered payment fraud detection, routing optimization, and reconciliation automation within Finastra payment hubs',
          'Finastra FusionFabric AI — monitor AI marketplace app performance, API response times, and third-party AI integration quality',
        ],
        monitoringPoints: [
          'AI loan origination processing time vs manual baseline',
          'AI cash flow forecast accuracy (daily, weekly, monthly)',
          'AI payment fraud detection rates and false positives',
          'AI reconciliation automation success rate vs exceptions',
          'FusionFabric AI API response times and availability',
          'AI model version tracking and deployment success rates',
        ],
        bizObsValue: 'Financial institutions using Finastra need concrete AI proof — "AI lending reduced origination time from 5 days to 4 hours for 72% of applications. AI treasury forecasting improved cash position accuracy by 23%, reducing overnight borrowing costs by $340K quarterly." Partners deliver that proof with Dynatrace.',
        dynatraceHow: [
          { capability: 'Custom Metrics via OpenTelemetry', detail: 'Instrument Finastra AI metrics — loan decisioning speed, forecast accuracy, fraud detection precision, reconciliation automation rates. Dynatrace ingests via OTLP and correlates with business outcome data for comprehensive AI ROI measurement.' },
          { capability: 'Synthetic Monitoring', detail: 'Run scheduled synthetic tests against AI-powered lending APIs, treasury services, and payment processing endpoints. Detect AI feature degradation outside business hours before it impacts morning trading or loan processing operations.' },
          { capability: 'Dashboards & Notebooks', detail: 'Pre-built financial AI dashboards — lending AI speed and accuracy, treasury forecast ROI, payment fraud prevention effectiveness, reconciliation automation rates. Partners use these to demonstrate AI value to bank and credit union leadership.' },
        ],
      },
    ],
    journeys: [
      { name: 'Account Opening', configFile: 'config-banking-account-opening.json' },
      { name: 'Loan Application', configFile: 'config-banking-loan-application.json' },
    ],
    kpis: ['AI fraud false positive rate', 'AI credit decisioning accuracy', 'AI chatbot containment rate', 'AI-powered approval speed'],
  },
  {
    id: 'insurance',
    icon: '🛡️',
    industry: 'Retail Insurance',
    color: '#16a085',
    tagline: 'Prove AI is reducing loss ratios and costs — not just automating paperwork',
    description: 'Insurers are investing heavily in AI — automated claims adjudication, AI underwriting, predictive fraud detection, AI customer service, and telematics-based pricing. But without observability, these AI investments are opaque. Dynatrace proves whether AI is actually reducing combined ratios, detecting fraud, and improving customer retention.',
    painPoints: [
      'AI claims adjudication auto-approves or denies incorrectly — nobody measures accuracy until quarterly loss ratio reviews reveal problems',
      'AI underwriting models drift silently — risk pricing becomes misaligned with actual loss experience, impacting profitability',
      'AI fraud detection generates excessive false positives, delaying legitimate claims and driving policyholder complaints',
      'AI chatbots for policy servicing can\'t handle complex scenarios — escalation rates are high but containment rate isn\'t tracked against cost savings',
      'No way to tell leadership: "AI reduced our combined ratio by X points and claims processing costs by $Y" with auditable evidence',
    ],
    roiPoints: [
      'Prove AI claims ROI — measure auto-adjudication accuracy, processing time savings, and impact on loss ratio vs manual processing',
      'Validate AI underwriting — correlate AI risk scores with actual claims experience to prove pricing model accuracy over time',
      'Quantify AI fraud detection — measure fraud prevented vs false positive costs and legitimate claim delays caused by AI flags',
      'Accelerate partner deployment — pre-built Guidewire/Duck Creek/Majesco integrations let partners show AI value in weeks',
      'Lower barriers to AI adoption — partners deploy a vertical solution pack and demonstrate AI insurance ROI to carrier leadership immediately',
    ],
    integrations: [
      {
        name: 'Guidewire',
        category: 'P&C Insurance Suite',
        description: 'Guidewire is the dominant P&C insurance platform, and its AI capabilities — Guidewire Predict, AI claims automation, intelligent underwriting, and Guidewire GO data intelligence — are central to carrier modernization. Dynatrace ensures these AI features deliver measurable underwriting and claims improvements.',
        useCases: [
          'Guidewire Predict — monitor AI predictive model accuracy for claims severity, litigation propensity, subrogation opportunity, and fraud likelihood',
          'AI claims automation — track auto-adjudication accuracy, straight-through processing rates, and time savings vs manual claims handling',
          'Intelligent underwriting — observe AI risk scoring model performance, pricing accuracy, and impact on loss ratio by line of business',
          'Guidewire GO analytics — monitor AI-driven business intelligence data freshness, query performance, and insight relevance metrics',
          'AI customer engagement — track AI-powered chatbot and self-service claims portal performance (FNOL submission, status updates, document upload)',
        ],
        monitoringPoints: [
          'Guidewire Predict model accuracy (claims severity, fraud likelihood)',
          'Auto-adjudication straight-through processing rate and accuracy',
          'AI underwriting risk score accuracy vs actual loss experience',
          'AI FNOL chatbot containment rate and escalation patterns',
          'Guidewire API response times for AI-powered endpoints',
          'AI data pipeline freshness (policy/claims data → model input)',
        ],
        bizObsValue: 'Partners can show carriers — "AI claims auto-adjudication processed 43% of claims straight-through, saving $3.2M in adjuster costs this year. Guidewire Predict identified 89 subrogation opportunities worth $1.7M that manual review would have missed." That ROI data drives Guidewire AI adoption.',
        dynatraceHow: [
          { capability: 'OneAgent (Full-Stack)', detail: 'Deploy OneAgent on Guidewire InsuranceSuite (ClaimCenter, PolicyCenter, BillingCenter) application servers and AI model serving infrastructure. Auto-discover the complete AI pipeline without modifying Guidewire configurations or affecting carrier audit posture.' },
          { capability: 'Business Events (BizEvents)', detail: 'Capture AI insurance events — ai_claim_auto_adjudicated, ai_fraud_flagged, ai_subrogation_identified, ai_risk_scored, ai_chatbot_fnol_completed — each with financial context (claim amount, premium, reserve). DQL dashboards show AI ROI in combined ratio impact.' },
          { capability: 'Dynatrace Intelligence', detail: 'Dynatrace Intelligence baselines AI model performance across all lines of business. When Predict accuracy drops for a specific peril type, auto-adjudication rates fall, or fraud model false positives spike, it detects the anomaly and identifies root cause.' },
          { capability: 'Log Analytics (Grail)', detail: 'Ingest Guidewire processing logs, AI model inference logs, and claims audit trails into Grail. Correlate AI decisions with actual claims outcomes over time for retrospective accuracy analysis and regulatory compliance evidence.' },
          { capability: 'Dashboards & Notebooks', detail: 'Pre-built carrier AI dashboards — auto-adjudication savings, Predict model accuracy trends, AI fraud detection effectiveness, AI underwriting impact on loss ratio. Partners present these to carrier C-suite to justify continued AI investment and expansion.' },
        ],
      },
      {
        name: 'Duck Creek',
        category: 'Insurance Platform',
        description: 'Duck Creek Technologies provides cloud-native insurance platforms with AI capabilities for rating, underwriting, claims, and distribution. Dynatrace observes AI features to prove they deliver measurable carrier outcomes.',
        useCases: [
          'AI rating and underwriting — monitor AI-powered rate optimization, risk selection models, and pricing accuracy within Duck Creek Policy',
          'AI claims intelligence — track AI-assisted claims routing, reserve estimation accuracy, and fraud indicator scoring',
          'AI distribution — observe AI-powered agent recommendation engines and customer matching for distribution optimization',
          'Duck Creek Clarity analytics — monitor AI-driven analytics pipeline performance, data freshness, and predictive insight quality',
        ],
        monitoringPoints: [
          'AI rating model processing times and accuracy vs actual loss',
          'AI claims routing accuracy and reserve estimation precision',
          'AI agent recommendation click-through and conversion rates',
          'Clarity AI analytics pipeline freshness and query performance',
          'Duck Creek API response times for AI-enabled endpoints',
          'AI model version tracking and A/B test performance',
        ],
        bizObsValue: 'Carriers on Duck Creek need concrete AI proof — "AI rate optimization improved loss ratio by 2.1 points on auto book, generating $5.4M in underwriting profit improvement. AI claims routing reduced average cycle time by 31%, improving policyholder retention." That closes renewals and expansions.',
        dynatraceHow: [
          { capability: 'Distributed Tracing', detail: 'Trace AI-powered insurance transactions end-to-end — from quote request through AI rating, underwriting decision, and policy issuance. See where AI processing adds value (better risk selection) vs adds latency (slow model inference slowing agents).' },
          { capability: 'Business Events (BizEvents)', detail: 'Emit events for AI insurance decisions — ai_rate_calculated, ai_risk_selected, ai_claim_routed, ai_reserve_estimated, ai_fraud_scored — with premium and claims data for DQL-powered loss ratio impact analysis.' },
          { capability: 'Service-Level Objectives (SLOs)', detail: 'Define AI-specific SLOs — "AI rating returns in <2 seconds for 99% of quotes" or "AI claims routing accuracy >85% for straight-through processing." Track burn rate so AI performance degradation is caught before it impacts agents or policyholders.' },
          { capability: 'Dynatrace Intelligence', detail: 'Dynatrace Intelligence detects when Duck Creek AI features degrade — rating model latency increases during peak quoting, claims routing accuracy drops, or reserve estimation variance expands — and correlates with data quality or infrastructure changes.' },
        ],
      },
      {
        name: 'Majesco',
        category: 'Cloud Insurance',
        description: 'Majesco\'s cloud insurance platform includes AI-powered capabilities for speed-to-market, intelligent underwriting, and digital customer engagement. Dynatrace ensures AI features accelerate carrier operations and prove ROI.',
        useCases: [
          'AI speed-to-market — monitor AI-powered product configuration, automated rate filing, and digital distribution setup acceleration',
          'Intelligent underwriting AI — track AI risk assessment model accuracy, decision automation rates, and exception handling efficiency',
          'AI digital engagement — observe AI-powered customer self-service, chatbot interactions, and personalized renewal recommendations',
          'AI data intelligence — monitor AI analytics and predictive modeling pipeline performance within Majesco\'s data platform',
        ],
        monitoringPoints: [
          'AI product configuration time savings vs manual setup',
          'AI underwriting automation rate and exception handling volume',
          'AI chatbot containment rate and customer satisfaction scores',
          'AI predictive analytics pipeline freshness and model accuracy',
          'Majesco API response times for AI-enabled operations',
        ],
        bizObsValue: 'Speed-to-market carriers using Majesco need proof — "AI product configuration reduced new product launch from 6 months to 3 weeks. AI underwriting automated 58% of small commercial submissions, freeing underwriters for complex risks." Partners deliver that evidence with Dynatrace.',
        dynatraceHow: [
          { capability: 'Real User Monitoring (RUM)', detail: 'Deploy RUM on Majesco policyholder portals and agent interfaces to capture interactions with AI features — automated quotes, AI chatbot conversations, personalized renewal offers. Measure AI feature adoption and conversion impact.' },
          { capability: 'Synthetic Monitoring', detail: 'Run scheduled synthetic checks against AI-powered quoting, underwriting, and claims APIs. Detect AI feature degradation outside business hours before agents or policyholders experience it Monday morning.' },
          { capability: 'Dashboards & Notebooks', detail: 'Pre-built cloud insurance AI dashboards — underwriting automation rates, AI product launch acceleration, chatbot ROI, predictive analytics accuracy. Partners deploy these quickly for mid-market carriers with limited technical resources.' },
        ],
      },
    ],
    journeys: [
      { name: 'Purchase Journey', configFile: 'config-insurance-purchase-journey.json' },
      { name: 'Claims Journey', configFile: 'config-insurance-claims-journey.json' },
    ],
    kpis: ['AI auto-adjudication accuracy', 'AI fraud detection precision', 'AI underwriting loss ratio impact', 'AI claims processing speed'],
  },
  {
    id: 'retail',
    icon: '🛒',
    industry: 'E-commerce & Retail',
    color: '#e67e22',
    tagline: 'Prove the ROI of AI investments across the digital storefront',
    description: 'Retailers are investing heavily in AI — personalization engines, AI-powered search, dynamic pricing, chatbots, and fraud detection. But without observability, these AI investments are a black box. Dynatrace provides the end-to-end visibility needed to demonstrate that AI is actually improving conversion, revenue, and customer experience — and to pinpoint when it isn\'t.',
    painPoints: [
      'AI recommendation engines degrade silently — latency spikes reduce click-through but nobody notices until weekly reports',
      'AI-powered search (Algolia, Bloomreach) returns poor results when index pipelines break, tanking conversion',
      'Dynamic pricing models make suboptimal decisions when fed stale or incomplete data from upstream systems',
      'AI chatbots hallucinate or time out when backend APIs are slow, eroding customer trust and increasing support escalations',
      'No way to prove AI ROI — leadership asks "is our $2M AI investment actually increasing revenue?" and teams can\'t answer with data',
    ],
    roiPoints: [
      'Prove AI personalization ROI — measure revenue lift from AI recommendations vs baseline with BizEvent attribution',
      'Reduce AI failure blast radius — detect when ML model serving degrades and quantify the revenue impact per minute',
      'Accelerate partner adoption — pre-built Dynatrace integrations with Shopify, Algolia, SFCC Einstein eliminate months of custom instrumentation',
      'Lower barriers to observability — partners can deploy a vertical solution pack and show AI ROI to their retail clients within days, not quarters',
      'Protect peak AI workloads — ensure AI-driven personalization and dynamic pricing perform during Black Friday, flash sales, and seasonal spikes',
    ],
    integrations: [
      {
        name: 'Shopify',
        category: 'E-commerce Platform',
        description: 'Shopify powers 4.6M+ stores and its AI features (Shopify Magic, AI product descriptions, smart recommendations) are becoming central to merchant success. Dynatrace ensures these AI features deliver measurable business value.',
        useCases: [
          'AI recommendation performance — monitor Shopify\'s product recommendation engine latency and click-through rates to prove personalization ROI',
          'Shopify Magic monitoring — track AI-generated content (product descriptions, email campaigns) creation times and error rates',
          'Checkout flow AI — observe AI-powered abandoned cart recovery, dynamic discount suggestions, and smart upsell conversion',
          'App ecosystem AI — monitor 3rd-party AI apps (AI reviews, chatbots, visual search) for latency that degrades storefront performance',
          'Shopify Flow automations — ensure AI-triggered workflows (inventory alerts, fraud flags, customer segments) execute within SLA',
        ],
        monitoringPoints: [
          'AI recommendation engine response times & conversion lift',
          'Shopify Magic content generation success rates',
          'AI-powered search suggestion accuracy and latency',
          'Checkout funnel AI intervention effectiveness (upsell, recovery)',
          'Third-party AI app latency impact on Core Web Vitals',
          'Shopify Flow AI automation execution success rates',
        ],
        bizObsValue: 'Partners can show Shopify merchants exactly how much revenue their AI features generate — "Your AI recommendations drove $47K in additional revenue this month, but latency spikes on Friday lost you $3.2K." That\'s the data that justifies the Shopify Plus investment.',
        dynatraceHow: [
          { capability: 'Real User Monitoring (RUM)', detail: 'Deploy the Dynatrace JS tag on Shopify storefronts to capture every user interaction with AI-powered features — recommendation clicks, AI search suggestions, chatbot conversations. Attribute each interaction to a revenue outcome (purchase, abandon, bounce).' },
          { capability: 'Business Events (BizEvents)', detail: 'Capture AI-specific business events — ai_recommendation_shown, ai_recommendation_clicked, ai_upsell_accepted, ai_search_converted — each carrying revenue data. Query with DQL to build AI ROI dashboards showing incremental revenue from AI features vs baseline.' },
          { capability: 'Synthetic Monitoring', detail: 'Run scheduled synthetic tests that exercise AI features end-to-end — search with AI suggestions, browse with recommendations, checkout with dynamic pricing. Detect AI feature degradation before real users are impacted.' },
          { capability: 'Dynatrace Intelligence', detail: 'Dynatrace Intelligence automatically baselines AI feature performance and alerts when recommendation latency or chatbot error rates deviate from normal. Root cause analysis pinpoints whether the issue is Shopify infrastructure, a 3rd-party AI app, or your backend integration.' },
          { capability: 'Dashboards & Notebooks', detail: 'Pre-built DQL queries for AI ROI reporting — revenue attributed to AI recommendations, conversion lift from AI search, cost savings from AI-automated workflows. Partners can present these dashboards directly to merchant leadership.' },
        ],
      },
      {
        name: 'Magento (Adobe Commerce)',
        category: 'Commerce Platform',
        description: 'Adobe Commerce leverages Adobe Sensei AI for product recommendations, visual search, and intelligent catalog management. Dynatrace provides deep stack observability to prove these AI features deliver ROI on the complex PHP/MySQL/Elasticsearch infrastructure.',
        useCases: [
          'Adobe Sensei recommendations — monitor AI recommendation API latency, model serving performance, and click-through-to-purchase conversion',
          'AI-powered catalog management — track intelligent product categorization, auto-tagging, and smart attribute generation for catalog quality',
          'Visual search & image recognition — observe AI image processing pipelines for product matching accuracy and response times',
          'Live Search (AI) — monitor Adobe Commerce\'s AI-powered search relevance, zero-result rates, and search-to-conversion metrics',
          'AI-driven customer segmentation — ensure real-time segmentation models process behavioral data within SLA for personalized experiences',
        ],
        monitoringPoints: [
          'Adobe Sensei recommendation API response times & model freshness',
          'AI search relevance scores and zero-result rates',
          'Product recommendation click-through and conversion rates',
          'ML model serving infrastructure (GPU/CPU utilization, inference latency)',
          'AI data pipeline freshness (behavioral data → model → serving)',
          'GraphQL endpoint performance for headless AI feature delivery',
        ],
        bizObsValue: 'Adobe Commerce sites invest heavily in Sensei AI but struggle to quantify its impact. Dynatrace BizObs shows the revenue lift from each AI feature — e.g., "AI recommendations generated 18% of total revenue this quarter, but Live Search AI was down for 6 hours on Cyber Monday costing $120K."',
        dynatraceHow: [
          { capability: 'OneAgent (Full-Stack)', detail: 'OneAgent on Magento servers auto-discovers the entire AI pipeline — from user request through PHP application logic, to Adobe Sensei API calls, Elasticsearch AI queries, and Redis model caches. Every AI-related transaction is traced without code changes.' },
          { capability: 'PurePath Distributed Tracing', detail: 'Trace AI recommendation requests end-to-end: browser → CDN → Varnish → PHP-FPM → Sensei API → model serving → response rendering. Identify exactly where AI latency is introduced — is it model inference, data retrieval, or response serialization?' },
          { capability: 'Log Analytics (Grail)', detail: 'Ingest Magento AI/ML logs, Sensei API logs, and model training logs into Grail. Correlate model retraining events with changes in recommendation quality. Detect data pipeline failures that cause models to serve stale predictions.' },
          { capability: 'Custom Metrics via OpenTelemetry', detail: 'Instrument AI-specific metrics — model inference latency, prediction confidence scores, A/B test variant performance, recommendation diversity index. Dynatrace ingests via OTLP and correlates with business outcomes.' },
          { capability: 'Service-Level Objectives (SLOs)', detail: 'Define AI-specific SLOs — "AI recommendation API responds in <200ms for 99.5% of requests" or "AI search returns relevant results for >95% of queries." Track burn rate and alert before AI features breach acceptable performance.' },
        ],
      },
      {
        name: 'Salesforce Commerce Cloud',
        category: 'Enterprise Commerce',
        description: 'SFCC\'s Einstein AI powers product recommendations, predictive sorting, and commerce insights. Proving that Einstein drives measurable revenue lift is critical for justifying SFCC licensing costs. Dynatrace makes this measurable.',
        useCases: [
          'Einstein Recommendations — monitor AI recommendation widget render times, click-through rates, and attributable revenue per recommendation type',
          'Einstein Predictive Sort — track AI-powered product sorting effectiveness, measuring conversion rate lift vs default sorting',
          'Einstein Search Dictionaries — observe AI-generated synonyms, redirects, and search intent mapping for search quality improvement',
          'Commerce Insights AI — monitor AI-generated business insights delivery latency, data freshness, and actionability metrics',
          'Einstein GPT for Commerce — track generative AI product description quality, customer service response accuracy, and contained resolution rates',
        ],
        monitoringPoints: [
          'Einstein recommendation widget load time & render performance',
          'AI predictive sort A/B test conversion lift metrics',
          'Einstein Search API response times and relevance scores',
          'OCAPI/SCAPI latency for AI-powered endpoints specifically',
          'Einstein GPT response latency and content quality signals',
          'AI feature availability across global storefronts (per region)',
        ],
        bizObsValue: 'SFCC partners often struggle to justify Einstein licensing costs. Dynatrace BizObs provides the proof — "Einstein recommendations generated $2.1M in attributable revenue this quarter with 12% conversion lift. Einstein Predictive Sort added $340K incremental." That data closes renewals and upsells.',
        dynatraceHow: [
          { capability: 'Real User Monitoring (RUM)', detail: 'Capture every Einstein AI interaction in the browser — recommendation impressions, clicks, add-to-carts from AI widgets, and subsequent purchases. Build end-to-end AI attribution funnels that prove Einstein ROI per storefront.' },
          { capability: 'Business Events (BizEvents)', detail: 'Emit business events for each Einstein touchpoint — einstein_rec_shown, einstein_rec_clicked, einstein_sort_applied, einstein_gpt_response. Each event carries product and revenue data, enabling DQL queries like "revenue from Einstein recs vs manual merchandising."' },
          { capability: 'Workflows & Automation', detail: 'When Dynatrace Intelligence detects Einstein AI degradation (slow recommendation loading, search quality drop), Dynatrace Workflows can automatically alert the commerce team, create a ServiceNow incident, and trigger a failover to rules-based recommendations.' },
          { capability: 'Dashboards & Notebooks', detail: 'Pre-built Einstein ROI dashboards showing: revenue attributed to each Einstein feature, A/B test performance, AI feature uptime SLAs, and cost-per-recommendation. Partners present these directly to retail clients as proof of AI investment value.' },
          { capability: 'Dynatrace Intelligence', detail: 'Dynatrace Intelligence baselines Einstein performance across all global storefronts. When Einstein recommendation quality degrades in a specific region (stale model, API throttling), it detects the anomaly and links it to the revenue impact for that region.' },
        ],
      },
      {
        name: 'Stripe',
        category: 'AI-Powered Payments',
        description: 'Stripe\'s AI capabilities — Radar fraud detection, adaptive acceptance, smart retries, and revenue recovery — directly impact the bottom line. Observing these AI payment features ensures they maximize revenue rather than silently blocking legitimate transactions.',
        useCases: [
          'Stripe Radar AI — monitor AI fraud detection accuracy, false positive rates, and blocked legitimate transaction revenue (the "AI tax" on revenue)',
          'Adaptive Acceptance — track AI-powered payment routing decisions and approval rate optimization across card networks',
          'Smart Retries — observe AI retry logic for failed payments, measuring recovered revenue from intelligent retry timing',
          'Revenue Recovery — monitor AI-powered dunning (Smart Retries for subscriptions), measuring recovered MRR vs baseline dunning',
          'Stripe Billing AI — track AI-driven revenue recognition, usage metering, and dynamic pricing model performance',
        ],
        monitoringPoints: [
          'Stripe Radar AI block rate and false positive rate (revenue lost to false positives)',
          'AI adaptive acceptance approval rate lift vs standard routing',
          'Smart Retry recovered revenue per billing cycle',
          'AI fraud score distribution and threshold effectiveness',
          'Payment method AI routing optimization success rates',
          '3D Secure AI challenge rate and friction impact on conversion',
        ],
        bizObsValue: 'Stripe Radar AI blocks fraud but also blocks legitimate customers. BizObs quantifies the "false positive tax" — "Radar blocked $84K in legitimate transactions last month by misclassifying 0.3% of intents." That data lets teams tune AI thresholds with confidence.',
        dynatraceHow: [
          { capability: 'Distributed Tracing', detail: 'Trace payment flows from user click through your backend to Stripe API and back. See where AI decisions happen — Radar risk scoring, adaptive routing selection, 3DS challenge decisions — and correlate each with the business outcome (approved, declined, abandoned).' },
          { capability: 'Business Events (BizEvents)', detail: 'Capture AI payment events — radar_blocked, radar_approved, smart_retry_recovered, adaptive_route_selected — with transaction amounts. Build DQL dashboards showing AI payment ROI: "Radar prevented $450K in fraud, but false positives cost $84K in lost sales."' },
          { capability: 'Dynatrace Intelligence Anomaly Detection', detail: 'Dynatrace Intelligence baselines payment AI metrics and alerts when Stripe Radar suddenly blocks abnormally more transactions (new fraud rule deployment?), when adaptive acceptance rates drop (network issue?), or when smart retry recovery falls (pattern change?).' },
          { capability: 'Log Analytics (Grail)', detail: 'Ingest Stripe webhook events and payment processing logs. Query AI-specific patterns — "show me all Radar false positives >$200 in the last week by card country" or "smart retry success rate by time-of-day for subscription renewals."' },
        ],
      },
      {
        name: 'Algolia',
        category: 'AI Search & Discovery',
        description: 'Algolia\'s AI features — NeuralSearch, Dynamic Re-Ranking, Recommend — are the highest-leverage AI investments in e-commerce. When AI search works, conversion soars. When it degrades, revenue craters. Dynatrace makes the difference visible.',
        useCases: [
          'NeuralSearch performance — monitor AI semantic search latency, relevance quality, and conversion lift vs keyword search',
          'Dynamic Re-Ranking AI — track AI re-ranking model freshness, personalization accuracy, and revenue impact per re-rank strategy',
          'Algolia Recommend — observe AI recommendation engine latency, click-through rates, and cross-sell/upsell attributable revenue',
          'AI Rules — monitor AI-enhanced merchandising rule execution and revenue impact per rule fired',
          'Query Understanding AI — track AI intent classification, synonym generation, and typo tolerance effectiveness',
        ],
        monitoringPoints: [
          'NeuralSearch vs keyword search conversion rate comparison',
          'AI re-ranking model serving latency and freshness',
          'Algolia Recommend click-through and conversion rates',
          'Zero-result rate with and without AI (measuring AI query understanding lift)',
          'AI index freshness — time from product update to searchable',
          'Search revenue attribution (AI-assisted vs organic browsing)',
        ],
        bizObsValue: 'AI search is the biggest conversion lever in e-commerce. BizObs proves it — "NeuralSearch converts at 4.2% vs 1.8% for keyword search, generating $1.2M in incremental monthly revenue. But AI re-ranking was stale for 3 days last week, costing $58K." That\'s the ROI story partners need.',
        dynatraceHow: [
          { capability: 'Real User Monitoring (RUM)', detail: 'Capture every AI search interaction — query submitted, AI suggestions shown, result clicked, and purchase completed. Build AI search attribution funnels showing exactly how much revenue flows through AI-enhanced search vs standard browsing.' },
          { capability: 'Custom Metrics via OpenTelemetry', detail: 'Instrument Algolia AI metrics — NeuralSearch confidence scores, re-ranking model version, recommendation diversity, A/B test variants. Dynatrace ingests via OTLP and correlates with conversion and revenue data from RUM and BizEvents.' },
          { capability: 'Business Events (BizEvents)', detail: 'Emit events for AI search milestones — neural_search_used, ai_rerank_applied, recommend_widget_clicked, ai_synonym_matched. Each carries search query, result count, and downstream revenue. DQL joins these with purchase events for end-to-end AI attribution.' },
          { capability: 'Dashboards & Notebooks', detail: 'Pre-built AI Search ROI dashboards — NeuralSearch revenue lift, AI re-ranking conversion impact, Recommend widget revenue, zero-result rate improvement from AI. Partners use these to prove Algolia AI investment value to retail clients quarterly.' },
        ],
      },
    ],
    journeys: [
      { name: 'Purchase Journey', configFile: 'config-retail-purchase-journey.json' },
      { name: 'Click & Collect', configFile: 'config-retail-click-and-collect.json' },
    ],
    kpis: ['AI recommendation conversion lift', 'AI search revenue attribution', 'AI false positive rate (fraud)', 'AI feature availability %'],
  },
  {
    id: 'telecoms',
    icon: '📡',
    industry: 'Telecommunications',
    color: '#3498db',
    tagline: 'Prove AI is reducing churn and costs — not just adding network complexity',
    description: 'Telcos are deploying AI across every domain — AI-powered network optimization, predictive churn, AI customer service, intelligent provisioning, and AI fraud detection. But proving that these AI investments reduce OPEX, lower churn, and improve ARPU remains elusive. Dynatrace connects AI system performance to business outcomes.',
    painPoints: [
      'AI network optimization makes changes to 5G parameters but nobody measures whether it actually improved subscriber experience or just reduced alarm noise',
      'AI churn prediction models flag at-risk subscribers but retention campaigns can\'t prove whether AI targeting improved save rates vs random offers',
      'AI chatbots handle 40% of support volume but escalation rates to live agents are climbing — is the bot getting worse or are issues getting harder?',
      'AI-powered provisioning promises zero-touch activation but quietly falls back to manual intervention for 25% of orders without alerting anyone',
      'Cannot answer the CEO question: "We spent $80M on AI and automation — did our OPEX actually decrease and did churn rates improve?"',
    ],
    roiPoints: [
      'Prove AI network ROI — measure whether AI optimization actually improves subscriber QoE metrics and reduces truck rolls vs manual tuning',
      'Validate AI churn prediction — correlate AI risk scores with actual churn outcomes and retention campaign effectiveness',
      'Quantify AI chatbot savings — measure true containment rates, deflected call center costs, and CSAT impact vs human agents',
      'Accelerate partner deployment — pre-built Amdocs/Ericsson/Nokia integrations let partners demonstrate AI observability value to telcos in weeks',
      'Lower barriers to adoption — partners deploy vertical solution packs that prove AI ROI to telco CXOs immediately, not after 18-month BI projects',
    ],
    integrations: [
      {
        name: 'Amdocs',
        category: 'BSS/OSS Platform',
        description: 'Amdocs serves 350+ CSPs and its AI capabilities — amAIz (AI customer engagement), AI revenue management, AI service orchestration — are central to monetizing 5G and reducing OPEX. Dynatrace proves these AI features deliver measurable subscriber and financial outcomes.',
        useCases: [
          'amAIz AI engagement — monitor AI-powered next-best-offer accuracy, personalization relevance, and subscriber acceptance rates driving ARPU uplift',
          'AI revenue assurance — track AI leakage detection accuracy, revenue recovery amounts, and false positive investigation costs',
          'AI service orchestration — observe AI-powered zero-touch provisioning success rates, fallback-to-manual rates, and activation time savings',
          'AI customer care — monitor AI chatbot and virtual agent performance within Amdocs digital care for containment rate and cost-per-interaction',
          'AI billing optimization — track AI-powered billing anomaly detection accuracy and prevented billing errors',
        ],
        monitoringPoints: [
          'AI next-best-offer acceptance rate and ARPU impact',
          'AI revenue leakage detection accuracy and recovery amounts',
          'Zero-touch provisioning AI success rate vs manual fallback',
          'AI chatbot containment rate and cost-per-interaction savings',
          'AI billing anomaly detection accuracy and error prevention rate',
          'Amdocs API response times for AI-powered operations',
        ],
        bizObsValue: 'Partners can show CSPs — "AI next-best-offer increased ARPU by $2.40/sub/month across 4M subscribers ($115M annualized). AI zero-touch provisioning handled 78% of activations without manual intervention, saving $12M in OPEX. But AI chatbot escalation rates rose 8% after last model update — costing $340K/month in additional agent costs." That data drives AI optimization.',
        dynatraceHow: [
          { capability: 'OneAgent (Full-Stack)', detail: 'Deploy OneAgent on Amdocs BSS/OSS application servers, AI model serving infrastructure, and digital care platforms. Auto-discover the complete AI pipeline from subscriber request through AI decisioning to fulfillment without modifying Amdocs configurations.' },
          { capability: 'Business Events (BizEvents)', detail: 'Capture AI telco events — ai_offer_presented, ai_offer_accepted, ai_leakage_detected, ai_provision_automated, ai_chatbot_contained, ai_billing_anomaly — with subscriber and revenue context for DQL-powered AI ROI analysis.' },
          { capability: 'Dynatrace Intelligence', detail: 'Dynatrace Intelligence baselines AI performance across all subscriber segments and regions. When AI offer relevance drops, provisioning automation rates decline, or chatbot quality degrades, it detects anomalies and correlates with model deployments or data pipeline issues.' },
          { capability: 'Dashboards & Notebooks', detail: 'Pre-built telco AI dashboards — ARPU uplift from AI offers, provisioning automation rates, chatbot cost savings, revenue leakage recovery. Partners present these to CSP leadership to justify AI transformation investment and identify optimization opportunities.' },
        ],
      },
      {
        name: 'Ericsson',
        category: 'Network Intelligence',
        description: 'Ericsson\'s AI-powered network solutions — AI RAN optimization, network digital twins, AI energy management, and predictive maintenance — are core to 5G monetization. Dynatrace observes whether AI network decisions actually improve subscriber experience and reduce operational costs.',
        useCases: [
          'AI RAN optimization — monitor AI-powered radio access network parameter tuning for actual subscriber QoE impact (throughput, latency, dropped calls)',
          'Network digital twin AI — track AI simulation accuracy for capacity planning, network changes, and "what-if" scenario prediction quality',
          'AI energy management — observe AI-powered base station energy optimization for actual cost savings while maintaining coverage SLAs',
          'Predictive maintenance AI — monitor AI failure prediction accuracy for network equipment, measuring prevented outages vs false alarms',
        ],
        monitoringPoints: [
          'AI RAN optimization impact on subscriber QoE metrics',
          'Digital twin prediction accuracy vs actual network behavior',
          'AI energy optimization savings vs coverage SLA compliance',
          'Predictive maintenance true positive rate and prevented outages',
          'AI model inference latency for real-time network decisions',
          'AI training pipeline data freshness and model version tracking',
        ],
        bizObsValue: 'Telcos need proof that AI network investment works — "AI RAN optimization improved average cell throughput by 18% while reducing energy consumption by 12%, saving $6.3M annually. Predictive maintenance prevented 34 major outages affecting 890K subscribers." That ROI justifies 5G AI expansion.',
        dynatraceHow: [
          { capability: 'Custom Metrics via OpenTelemetry', detail: 'Instrument AI network metrics — optimization decision counts, QoE improvement deltas, energy savings measurements, prediction accuracy scores. Dynatrace ingests via OTLP and correlates with subscriber experience and financial outcomes.' },
          { capability: 'Log Analytics (Grail)', detail: 'Ingest Ericsson AI optimization logs, model training events, and network change logs. Correlate AI-driven network changes with subscriber experience metrics to prove causation between AI decisions and QoE improvements.' },
          { capability: 'Dynatrace Intelligence', detail: 'Dynatrace Intelligence detects when AI network optimization quality changes — QoE improvements plateau, energy savings decline, or prediction accuracy drops — and correlates with model retraining events, data quality issues, or network topology changes.' },
        ],
      },
      {
        name: 'Nokia NetGuard',
        category: 'Network Assurance',
        description: 'Nokia NetGuard AI-driven network management provides anomaly detection, predictive assurance, and autonomous network operations. Dynatrace connects AI network decisions to subscriber experience and business outcomes that NetGuard alone cannot measure.',
        useCases: [
          'AI anomaly detection — monitor Nokia AI network anomaly detection accuracy, false alarm rates, and mean-time-to-identify improvements',
          'Predictive assurance — track AI-powered service quality predictions and their accuracy against actual subscriber experience degradation',
          'Autonomous operations AI — observe AI-driven automated remediation success rates, rollback frequencies, and SLA impact',
          'AI capacity planning — monitor AI traffic prediction accuracy and capacity recommendation effectiveness',
        ],
        monitoringPoints: [
          'AI anomaly detection accuracy and false alarm rate',
          'AI service quality prediction accuracy vs actual outcomes',
          'Autonomous remediation success rate and rollback frequency',
          'AI capacity prediction accuracy vs actual traffic patterns',
          'Nokia API response times for AI-enabled operations',
        ],
        bizObsValue: 'Network operations teams need AI proof — "AI anomaly detection reduced MTTI by 67%, from 45 minutes to 15 minutes average. Autonomous remediation resolved 230 incidents without human intervention, saving $1.2M in NOC costs." That data drives autonomous network strategy.',
        dynatraceHow: [
          { capability: 'Distributed Tracing', detail: 'Trace AI-driven network management workflows — from anomaly detection through automated diagnosis to remediation action. Understand the full AI decision chain and where human intervention is still required.' },
          { capability: 'Service-Level Objectives (SLOs)', detail: 'Define AI-specific network SLOs — "AI anomaly detection identifies service-impacting issues within 5 minutes for 95% of incidents" or "Autonomous remediation resolves P3+ incidents without human intervention 80% of the time."' },
          { capability: 'Workflows & Automation', detail: 'When Dynatrace Intelligence detects that Nokia AI anomaly detection is missing real issues or generating excessive false alarms, Dynatrace Workflows automatically notify NOC leads and create improvement tickets for AI model tuning.' },
        ],
      },
    ],
    journeys: [
      { name: 'Purchase Journey', configFile: 'config-telecoms-purchase-journey.json' },
      { name: 'Support Request', configFile: 'config-telecoms-support-request.json' },
    ],
    kpis: ['AI provisioning automation rate', 'AI churn prediction accuracy', 'AI chatbot containment rate', 'AI ARPU uplift per subscriber'],
  },
  {
    id: 'airlines',
    icon: '✈️',
    industry: 'Airlines & Aviation',
    color: '#1abc9c',
    tagline: 'Prove AI is improving operations and revenue — not just adding IT complexity',
    description: 'Airlines are deploying AI across every touchpoint — AI dynamic pricing, AI disruption management, conversational AI for rebooking, AI-powered ancillary revenue optimization, and predictive maintenance. But proving that AI actually increases yield, reduces IRROPS costs, and improves NPS is a major gap. Dynatrace connects AI system performance to airline business outcomes.',
    painPoints: [
      'AI dynamic pricing adjusts fares millions of times daily but revenue management can\'t prove whether AI yield optimization outperforms analyst-set prices',
      'AI disruption management recommends passenger rebooking but operations teams manually override 30%+ of AI suggestions — nobody measures whether AI or human decisions result in better outcomes',
      'Conversational AI for rebooking handles high volumes during IRROPS but containment quality degrades under load, silently streaming passengers to overwhelmed agents',
      'AI ancillary revenue (upgrade offers, seat selection, lounge access) fires recommendations but conversion attribution is missing — which AI offers actually generate revenue?',
      'Board asks "Our AI transformation program cost $60M — did we increase per-passenger yield?" and the answer is a spreadsheet, not auditable AI performance data',
    ],
    roiPoints: [
      'Prove AI pricing ROI — measure AI yield optimization revenue lift vs analyst pricing, broken down by route, cabin, and booking window',
      'Validate AI disruption management — compare AI rebooking outcomes (passenger satisfaction, cost) vs manual decisions during IRROPS events',
      'Quantify conversational AI savings — measure true containment rates during disruptions and cost per AI vs agent interaction for rebooking',
      'Accelerate partner deployment — pre-built Amadeus/SITA/Sabre integrations let partners show AI observability value to airlines in weeks',
      'Lower adoption barriers — partners deploy vertical solution packs that demonstrate AI ROI to airline CXOs without 12-month integration projects',
    ],
    integrations: [
      {
        name: 'Amadeus',
        category: 'Travel Technology',
        description: 'Amadeus powers ~40% of global travel bookings and its AI capabilities — AI pricing, Altéa AI disruption management, AI traveler experience — are core to modern airline operations. Dynatrace ensures these AI features deliver measurable yield and operational improvements.',
        useCases: [
          'AI dynamic pricing — monitor Amadeus AI fare optimization model performance, pricing decision speed, and revenue yield impact vs rule-based pricing',
          'Altéa AI disruption management — track AI rebooking recommendation quality, acceptance rates by OCC staff, and passenger outcome metrics during IRROPS',
          'AI traveler experience — observe AI-powered personalization (offer bundling, upgrade suggestions, ancillary recommendations) click-through and conversion rates',
          'AI search & shopping — monitor AI-powered fare search latency, result relevance, and booking conversion from AI-optimized shopping displays',
          'Amadeus AI infrastructure — track ML model serving latency, training pipeline health, and data freshness across the Amadeus AI ecosystem',
        ],
        monitoringPoints: [
          'AI pricing yield impact per route/cabin vs baseline',
          'AI disruption rebooking acceptance rate and passenger NPS',
          'AI ancillary offer conversion rate and revenue per passenger',
          'AI fare search latency and booking conversion rate',
          'ML model serving latency and training pipeline health',
          'Amadeus API response times for AI-powered endpoints',
        ],
        bizObsValue: 'Partners can show airlines — "AI dynamic pricing increased per-passenger yield by $4.20 on transatlantic routes, generating $18M in incremental revenue annually. Altéa AI disruption management resolved 67% of IRROPS rebookings automatically, saving $8.4M in agent costs and improving disrupted-passenger NPS by 12 points." That data justifies AI investment expansion.',
        dynatraceHow: [
          { capability: 'Distributed Tracing', detail: 'Trace AI-powered airline transactions end-to-end — from fare search through AI pricing decisions, availability checks, and booking confirmation. See exactly where AI adds value (yield optimization) vs adds risk (pricing latency during peak search volume).' },
          { capability: 'Business Events (BizEvents)', detail: 'Capture AI airline events — ai_price_set, ai_offer_presented, ai_upgrade_accepted, ai_rebook_suggested, ai_rebook_accepted, ai_rebook_overridden — with yield and cost context. DQL dashboards show AI revenue attribution and disruption management ROI.' },
          { capability: 'Dynatrace Intelligence', detail: 'Dynatrace Intelligence baselines AI performance across all routes, cabins, and disruption scenarios. When AI pricing yield drops on specific routes, AI rebooking acceptance rates decline, or ancillary AI conversion falls, it detects anomalies and correlates with model deployments or data issues.' },
          { capability: 'Dashboards & Notebooks', detail: 'Pre-built airline AI dashboards — AI yield optimization by route, AI disruption management cost savings, ancillary AI revenue attribution, conversational AI containment rates. Partners present these to airline revenue management and operations leadership.' },
        ],
      },
      {
        name: 'SITA',
        category: 'Aviation IT',
        description: 'SITA provides IT and communications for 90% of the world\'s airlines and its AI solutions — AI baggage tracking, AI passenger processing, autonomous airport operations — are transforming airport efficiency. Dynatrace proves AI improves operational KPIs and passenger experience.',
        useCases: [
          'AI baggage tracking — monitor AI-powered baggage matching, routing optimization, and mishandled bag prediction for accuracy and cost reduction',
          'AI passenger processing — track AI facial recognition gate speed, accuracy, and passenger throughput improvement vs manual processing',
          'AI airport operations — observe AI runway/gate optimization, turnaround prediction accuracy, and on-time performance impact',
          'AI disruption recovery — monitor AI-powered airport recovery optimization during irregular operations for time-to-normal-operations improvement',
        ],
        monitoringPoints: [
          'AI baggage matching accuracy and mishandled bag reduction',
          'AI biometric processing speed and passenger throughput increase',
          'AI gate/runway optimization impact on OTP (on-time performance)',
          'AI disruption recovery time-to-normal improvement',
          'SITA AI API response times and availability',
        ],
        bizObsValue: 'Airport operators need AI proof — "AI baggage tracking reduced mishandled bags by 34%, saving $2.8M in claims and redelivery costs. AI passenger processing achieved 8-second average biometric boarding vs 45-second manual, improving turnaround times by 6 minutes." That drives airport AI investment.',
        dynatraceHow: [
          { capability: 'Custom Metrics via OpenTelemetry', detail: 'Instrument SITA AI metrics — baggage matching confidence scores, biometric processing speeds, gate optimization decisions, disruption recovery timelines. Dynatrace ingests via OTLP and correlates with operational KPIs (OTP, mishandled baggage rate, turnaround times).' },
          { capability: 'Synthetic Monitoring', detail: 'Run synthetic tests against AI-powered passenger processing, baggage tracking, and operations APIs. Detect AI degradation before peak departure waves hit, ensuring AI features perform when they matter most.' },
          { capability: 'Workflows & Automation', detail: 'When Dynatrace Intelligence detects AI baggage matching degradation or passenger processing slowdowns, Dynatrace Workflows automatically notify airport ops, adjust processing capacity, and create incident tickets for AI system investigation.' },
        ],
      },
      {
        name: 'Sabre',
        category: 'Travel Platform',
        description: 'Sabre\'s AI capabilities — SabreMosaic intelligent retailing, AI revenue optimization, AI operations management — serve 400+ airlines. Dynatrace ensures AI features deliver measurable revenue and operational improvements.',
        useCases: [
          'SabreMosaic AI retailing — monitor AI-powered offer creation, personalized bundling, and dynamic pricing for revenue impact vs traditional filings',
          'AI revenue optimization — track AI demand forecasting accuracy, overbooking model performance, and revenue management decision quality',
          'AI operations — observe AI crew scheduling optimization, fuel management predictions, and maintenance planning accuracy',
          'Sabre AI marketplace — monitor third-party AI apps on Sabre platform for latency, availability, and value delivery',
        ],
        monitoringPoints: [
          'AI retailing conversion rate and revenue per offer',
          'AI demand forecast accuracy vs actual load factors',
          'AI overbooking model denial rate and compensation costs',
          'AI crew scheduling optimization savings vs manual planning',
          'Sabre API response times for AI-powered retailing',
        ],
        bizObsValue: 'Airlines on Sabre need retailing AI proof — "SabreMosaic AI offers generated 23% higher ancillary revenue per booking vs traditional filings. AI demand forecasting improved load factors by 2.1 points on domestic routes." Partners deliver that revenue story with Dynatrace.',
        dynatraceHow: [
          { capability: 'Real User Monitoring (RUM)', detail: 'Deploy RUM on airline booking funnels powered by Sabre to capture passenger interactions with AI-personalized offers, dynamic bundles, and smart pricing. Attribute each AI interaction to a revenue outcome for end-to-end yield measurement.' },
          { capability: 'Business Events (BizEvents)', detail: 'Capture AI retailing events — ai_offer_created, ai_bundle_presented, ai_dynamic_price_set, ai_upgrade_offered, ai_ancillary_converted — with yield and booking context. DQL dashboards show AI retailing ROI by route, cabin class, and booking channel.' },
          { capability: 'Dynatrace Intelligence', detail: 'Dynatrace Intelligence detects when AI retailing performance changes — offer conversion drops, demand forecast accuracy declines, or overbooking rates exceed thresholds — and correlates with market changes, model updates, or competitive pricing shifts.' },
        ],
      },
    ],
    journeys: [
      { name: 'Flight Booking', configFile: 'config-airlines-flight-booking.json' },
      { name: 'Check-In', configFile: 'config-airlines-check-in.json' },
    ],
    kpis: ['AI yield optimization lift', 'AI disruption rebooking rate', 'AI ancillary revenue per pax', 'AI baggage mishandling reduction'],
  },
  {
    id: 'automotive',
    icon: '🚗',
    industry: 'Automotive & Mobility',
    color: '#34495e',
    tagline: 'Prove AI is driving revenue and safety — not just generating data',
    description: 'Automotive is investing heavily in AI — AI-powered vehicle configurators, predictive maintenance, autonomous driving systems, AI demand forecasting, and AI customer lifecycle management. But OEMs and dealers struggle to prove these AI investments improve margins, reduce warranty costs, and enhance ownership experience. Dynatrace connects AI system performance to automotive business outcomes.',
    painPoints: [
      'AI vehicle configurators recommend builds that maximize margin but recommendation quality degrades silently when inventory data feeds lag — nobody measures lost revenue from stale AI',
      'Predictive maintenance AI alerts owners to service needs but false positive rates drive unnecessary dealer visits, eroding trust and inflating warranty costs',
      'AI demand forecasting for production planning produces inaccurate builds-per-model predictions when market signals change, causing dealer inventory mismatches',
      'Connected vehicle AI (ADAS, driver assistance) generates millions of edge inferences daily with no observability into model accuracy or degradation patterns',
      'Cannot answer the board: "Our $200M AI and connected vehicle investment — what is the measurable revenue and safety improvement?"',
    ],
    roiPoints: [
      'Prove AI configurator ROI — measure AI recommendation impact on average vehicle margin, build-to-order rates, and customer satisfaction scores',
      'Validate predictive maintenance — correlate AI predictions with actual service outcomes, measuring warranty cost reduction vs false positive waste',
      'Quantify AI demand forecasting — compare AI vs analyst production planning accuracy, measuring inventory turns and dealer satisfaction impact',
      'Accelerate partner deployment — pre-built CDK/Salesforce Automotive/SAP integrations let partners demonstrate AI value to OEMs and dealer groups quickly',
      'Lower barriers — partners deploy observability for connected vehicle AI without requiring access to proprietary vehicle software platforms',
    ],
    integrations: [
      {
        name: 'CDK Global',
        category: 'Dealer Management',
        description: 'CDK Global connects 15,000+ dealer locations and its AI features — AI lead scoring, AI service recommendations, AI inventory optimization — are central to retail automotive profitability. Dynatrace proves these AI features deliver measurable revenue outcomes at the dealer level.',
        useCases: [
          'AI lead scoring — monitor AI-powered lead quality prediction accuracy, dealer follow-up rates on AI-prioritized leads, and actual close rates vs AI scores',
          'AI service recommendations — track AI predictive service suggestions sent to vehicle owners, appointment conversion rates, and service revenue per AI recommendation',
          'AI inventory optimization — observe AI-powered inventory stocking recommendations, days-on-lot improvement, and margin impact per AI-optimized purchase',
          'AI digital retailing — monitor AI-powered online pricing, trade-in valuations, and payment estimation accuracy affecting digital deal completion rates',
        ],
        monitoringPoints: [
          'AI lead score accuracy vs actual close outcomes',
          'AI service recommendation conversion rate and revenue per alert',
          'AI inventory stocking accuracy vs actual sales velocity',
          'AI trade-in valuation accuracy vs actual wholesale values',
          'CDK API response times for AI-powered dealer operations',
          'AI feature availability during peak showroom hours',
        ],
        bizObsValue: 'Partners can show dealer groups — "AI lead scoring prioritized 2,400 leads that closed at 28% vs 11% for non-AI leads, generating $4.2M in incremental gross profit. AI service recommendations drove 890 additional service appointments worth $340K in parts and labor revenue." That justifies CDK AI investment at the dealer level.',
        dynatraceHow: [
          { capability: 'Business Events (BizEvents)', detail: 'Capture AI dealer events — ai_lead_scored, ai_lead_converted, ai_service_recommended, ai_service_booked, ai_inventory_suggestion, ai_trade_valued — with profit and revenue context. DQL dashboards show AI ROI per dealership, region, and brand.' },
          { capability: 'Dynatrace Intelligence', detail: 'Dynatrace Intelligence baselines AI feature performance across all dealer locations. When lead scoring accuracy drops, service recommendation conversion declines, or inventory AI quality degrades, it detects anomalies and correlates with data pipeline or model changes.' },
          { capability: 'Real User Monitoring (RUM)', detail: 'Deploy RUM on CDK digital retailing interfaces to capture customer interactions with AI pricing, trade-in tools, and payment estimators. Measure AI feature impact on digital deal completion rates and time-to-purchase.' },
          { capability: 'Dashboards & Notebooks', detail: 'Pre-built dealer AI dashboards — AI lead scoring ROI per store, service recommendation revenue, inventory optimization impact, digital retailing AI conversion. Partners can present these to dealer principals and OEM regional managers.' },
        ],
      },
      {
        name: 'Salesforce Automotive Cloud',
        category: 'Customer Lifecycle',
        description: 'Salesforce Automotive Cloud with Einstein AI powers OEM and dealer customer lifecycle management — AI lead management, AI service prediction, connected vehicle insights. Dynatrace ensures Einstein AI delivers measurable lifecycle revenue improvements.',
        useCases: [
          'Einstein lead management — monitor AI lead scoring, routing, and next-best-action recommendations for accuracy and sales team adoption rates',
          'AI vehicle health insights — track AI-powered connected vehicle data analysis for predictive service accuracy and customer notification timing',
          'Einstein service prediction — observe AI predictive maintenance accuracy, customer notification effectiveness, and dealership appointment conversion',
          'AI customer lifecycle — monitor AI-driven repurchase propensity models, loyalty program optimization, and lifetime value prediction accuracy',
        ],
        monitoringPoints: [
          'Einstein lead scoring accuracy and sales team override rate',
          'AI vehicle health prediction accuracy vs actual service needs',
          'AI service notification open rates and appointment booking rates',
          'AI repurchase prediction accuracy vs actual buying behavior',
          'Salesforce API response times for AI-powered endpoints',
          'Einstein AI feature availability across global markets',
        ],
        bizObsValue: 'OEMs need Einstein ROI proof — "AI repurchase prediction identified 12,000 owners in the buying window, targeted campaigns achieved 8.4% conversion vs 2.1% for untargeted. Einstein service predictions generated $7.2M in incremental service revenue by proactively engaging owners." That data drives CRM AI expansion.',
        dynatraceHow: [
          { capability: 'Business Events (BizEvents)', detail: 'Emit AI lifecycle events — ai_lead_scored, ai_nba_presented, ai_vehicle_health_alert, ai_service_predicted, ai_repurchase_identified — with revenue context. DQL enables queries like "AI-driven service revenue by model year" or "Einstein lead scoring ROI by dealer tier."' },
          { capability: 'Service-Level Objectives (SLOs)', detail: 'Define AI-specific SLOs — "Einstein vehicle health insights delivered within 4 hours of diagnostic event" or "AI lead scoring available for 99.5% of business hours." Track burn rate so AI feature degradation is caught before it impacts sales teams or owners.' },
          { capability: 'Dynatrace Intelligence', detail: 'Dynatrace Intelligence detects when Einstein AI features degrade — lead scoring accuracy drops, service prediction quality declines, or repurchase model effectiveness changes — and correlates with connected vehicle data pipeline issues or CRM configuration changes.' },
        ],
      },
      {
        name: 'SAP (Automotive)',
        category: 'Manufacturing & Supply Chain',
        description: 'SAP S/4HANA with AI-powered production planning, quality prediction, and supply chain optimization is transforming automotive manufacturing. Dynatrace proves AI-driven production decisions improve quality, reduce waste, and optimize throughput.',
        useCases: [
          'AI production planning — monitor AI-powered build scheduling optimization for throughput improvement and changeover time reduction',
          'Predictive quality AI — track AI defect detection accuracy in manufacturing processes vs manual inspection, measuring warranty cost impact',
          'AI supply chain — observe AI-powered supplier risk prediction, parts demand forecasting, and just-in-sequence delivery optimization',
          'SAP Joule AI — monitor AI assistant adoption and effectiveness within automotive manufacturing and logistics workflows',
        ],
        monitoringPoints: [
          'AI production schedule optimization throughput improvement',
          'Predictive quality AI defect detection accuracy vs manual',
          'AI supply chain forecast accuracy and stockout prevention rate',
          'AI supplier risk prediction accuracy vs actual disruptions',
          'SAP AI processing times for manufacturing decisions',
        ],
        bizObsValue: 'Manufacturing leaders need AI proof — "Predictive quality AI caught 340 defects that manual inspection would have missed, avoiding $12M in warranty claims. AI production scheduling improved line throughput by 8%, generating $24M in incremental production capacity." That makes the case for factory AI expansion.',
        dynatraceHow: [
          { capability: 'OneAgent (Full-Stack)', detail: 'Deploy OneAgent on SAP S/4HANA manufacturing execution, quality management, and supply chain planning systems. Auto-discover AI integration points without modifying production-critical SAP configurations.' },
          { capability: 'Workflows & Automation', detail: 'When Dynatrace Intelligence detects AI quality prediction degradation or supply chain forecast accuracy drops, Workflows automatically notify manufacturing and supply chain teams, create quality incidents, and trigger model revalidation.' },
          { capability: 'Log Analytics (Grail)', detail: 'Ingest SAP manufacturing AI logs, quality prediction results, and production planning decisions. Correlate AI decisions with actual production outcomes for continuous AI accuracy measurement and improvement.' },
        ],
      },
    ],
    journeys: [
      { name: 'Vehicle Purchase', configFile: 'config-automotive-vehicle-purchase.json' },
      { name: 'Service Booking', configFile: 'config-automotive-service-booking.json' },
    ],
    kpis: ['AI lead conversion uplift', 'AI predictive maintenance accuracy', 'AI production quality improvement', 'AI inventory optimization ROI'],
  },
  {
    id: 'education',
    icon: '🎓',
    industry: 'Education & Learning',
    color: '#9b59b6',
    tagline: 'Prove AI is improving student outcomes — not just adding tech spend',
    description: 'Higher education is investing in AI across the student lifecycle — AI-powered adaptive learning, AI enrollment optimization, AI academic advising, AI plagiarism detection, and AI-driven student success prediction. But institutions struggle to prove these AI investments actually improve retention, graduation rates, and learning outcomes. Dynatrace connects AI system performance to student success metrics.',
    painPoints: [
      'AI adaptive learning platforms personalize content but nobody measures whether AI-adapted paths actually improve exam scores vs standard coursework',
      'AI enrollment optimization predicts yield but admissions can\'t prove whether AI-targeted outreach improved enrollment quality or just volume',
      'AI academic advising recommends course paths but advisor override rates are high — no data on whether AI or human recommendations lead to better outcomes',
      'AI plagiarism and integrity detection (Turnitin AI) generates false positives that waste faculty time and create student disputes',
      'Provost asks "We spent $8M on educational AI — did graduation rates or student satisfaction actually improve?" and nobody has auditable evidence',
    ],
    roiPoints: [
      'Prove AI learning ROI — measure whether AI-adapted learning paths improve exam scores, course completion, and time-to-degree vs standard instruction',
      'Validate AI enrollment optimization — correlate AI-predicted yield with actual enrollment outcomes and student quality metrics',
      'Quantify AI advising effectiveness — compare outcomes for AI-advised course paths vs advisor-selected paths across retention and graduation',
      'Accelerate partner deployment — pre-built Workday/Canvas/Ellucian integrations let partners demonstrate AI observability value to institutions quickly',
      'Lower barriers — partners deploy solution packs that show AI student success ROI to university leadership within an academic term',
    ],
    integrations: [
      {
        name: 'Workday Student',
        category: 'Student Information System',
        description: 'Workday Student with AI capabilities powers enrollment, academic planning, and financial aid for hundreds of institutions. Its AI-driven student insights, predictive analytics, and intelligent automation need observability to prove measurable student outcome improvements.',
        useCases: [
          'AI student success prediction — monitor AI retention risk models for accuracy, measuring predicted-at-risk students vs actual dropout/transfer outcomes',
          'AI enrollment optimization — track AI yield prediction accuracy, targeted communication effectiveness, and enrollment quality vs AI predictions',
          'AI financial aid — observe AI-powered aid packaging optimization speed, accuracy, and impact on enrollment yield for aided students',
          'Workday AI (Assistant) — monitor AI assistant response quality within student-facing self-service portals for registration, financial aid, and academic queries',
        ],
        monitoringPoints: [
          'AI retention prediction accuracy (precision/recall for at-risk students)',
          'AI enrollment yield prediction vs actual enrollment outcomes',
          'AI financial aid packaging speed and optimization accuracy',
          'AI assistant query success rate and student satisfaction',
          'Workday API response times for AI-powered student services',
          'AI feature availability during critical enrollment windows',
        ],
        bizObsValue: 'Partners can show institutions — "AI retention prediction identified 2,400 at-risk students with 82% accuracy. Targeted interventions retained 340 additional students worth $12M in tuition. AI financial aid optimization processed packages 60% faster during peak." That data justifies continued AI investment.',
        dynatraceHow: [
          { capability: 'Real User Monitoring (RUM)', detail: 'Deploy RUM on Workday Student portals to capture student interactions with AI features — retention alerts, AI-recommended course plans, financial aid estimators. Measure AI feature adoption and impact on student engagement during enrollment windows.' },
          { capability: 'Business Events (BizEvents)', detail: 'Capture AI education events — ai_risk_flagged, ai_intervention_triggered, ai_yield_predicted, ai_aid_optimized, ai_query_resolved — with student outcome context for DQL-powered AI ROI analysis across academic terms.' },
          { capability: 'Dynatrace Intelligence', detail: 'Dynatrace Intelligence baselines AI feature performance across all academic cycles. When retention prediction accuracy drops, enrollment AI yield forecasts diverge, or AI assistant quality degrades, it detects anomalies and correlates with data freshness or integration issues.' },
          { capability: 'Dashboards & Notebooks', detail: 'Pre-built education AI dashboards — retention prediction accuracy trends, AI-driven enrollment yield, financial aid optimization speed, AI assistant effectiveness. Partners present these to provosts and enrollment VPs as AI investment evidence.' },
        ],
      },
      {
        name: 'Canvas (Instructure)',
        category: 'Learning Management',
        description: 'Canvas LMS with AI features — AI-powered learning analytics, intelligent course recommendations, AI grading assistance, and adaptive learning integrations — is central to the modern academic experience. Dynatrace ensures AI learning features deliver measurable educational outcomes.',
        useCases: [
          'AI learning analytics — monitor AI-powered engagement scoring, at-risk student detection within courses, and early alert system accuracy',
          'AI course recommendations — track AI-driven course and resource recommendations for relevance, student adoption, and learning outcome impact',
          'AI grading assistance — observe AI-powered rubric suggestions, feedback generation quality, and faculty adoption rates for AI grading tools',
          'Adaptive learning integrations — monitor third-party AI adaptive platforms (McGraw-Hill ALEKS, Pearson AI) within Canvas for performance and effectiveness',
        ],
        monitoringPoints: [
          'AI engagement scoring accuracy vs actual course outcomes',
          'AI early alert detection sensitivity and false alarm rates',
          'AI course recommendation click-through and completion rates',
          'AI grading tool adoption rates and faculty satisfaction',
          'Adaptive learning platform response times within Canvas',
          'Canvas AI feature availability during exam periods',
        ],
        bizObsValue: 'Faculty and deans need AI proof — "AI early alerts identified 890 struggling students 3 weeks earlier than manual detection. Targeted support improved pass rates by 12% in flagged courses. AI adaptive learning students scored 0.4 GPA points higher on average." That evidence drives campus-wide AI adoption.',
        dynatraceHow: [
          { capability: 'Synthetic Monitoring', detail: 'Run scheduled synthetic tests against Canvas AI features — learning analytics dashboards, recommendation engines, adaptive platform integrations. Detect AI degradation before exam week when system reliability is most critical.' },
          { capability: 'Custom Metrics via OpenTelemetry', detail: 'Instrument AI learning metrics — engagement scores, prediction confidence levels, adaptive platform interaction counts, AI grading tool usage. Dynatrace ingests via OTLP and correlates with student performance data for AI effectiveness measurement.' },
          { capability: 'Service-Level Objectives (SLOs)', detail: 'Define education AI SLOs — "AI early alerts generated within 48 hours of engagement drop" or "Adaptive learning platform responds in <3 seconds for 99% of interactions during exam week." Track compliance across academic terms.' },
        ],
      },
      {
        name: 'Ellucian',
        category: 'Higher Education ERP',
        description: 'Ellucian (Banner, Colleague) with AI-powered CRM Advise, predictive analytics, and intelligent workflows serves 2,700+ institutions. Dynatrace ensures AI features deliver measurable enrollment and retention improvements.',
        useCases: [
          'CRM Advise AI — monitor AI-powered academic advising recommendations, student engagement scoring, and intervention trigger accuracy',
          'Predictive analytics — track AI enrollment and retention predictions across the student lifecycle for accuracy and actionability',
          'Intelligent workflows — observe AI-automated administrative processes (transcript evaluation, degree audit, registration) for speed and accuracy improvements',
          'Ellucian Experience AI — monitor AI-powered student portal personalization and self-service effectiveness',
        ],
        monitoringPoints: [
          'AI advising recommendation accuracy vs student outcomes',
          'AI retention prediction precision and intervention effectiveness',
          'AI workflow automation time savings vs manual processes',
          'AI portal personalization engagement and satisfaction scores',
          'Ellucian API response times for AI-powered operations',
        ],
        bizObsValue: 'Institution leaders need concrete AI evidence — "AI advising interventions retained 280 additional students worth $9.8M in tuition revenue. AI transcript evaluation automated 67% of transfer credit reviews, saving 4,200 staff hours annually." That justifies EdTech AI investment to boards of trustees.',
        dynatraceHow: [
          { capability: 'OneAgent (Full-Stack)', detail: 'Deploy OneAgent on Ellucian Banner/Colleague servers and AI model serving infrastructure. Auto-discover AI integration points — from student interaction through AI scoring to intervention triggering — without modifying ERP configurations.' },
          { capability: 'Business Events (BizEvents)', detail: 'Emit AI education events — ai_advising_triggered, ai_retention_flagged, ai_transcript_evaluated, ai_workflow_automated — with student and institutional context for DQL-powered AI ROI measurement per term.' },
          { capability: 'Workflows & Automation', detail: 'When Dynatrace Intelligence detects AI advising accuracy degradation or retention prediction quality drops, Workflows automatically notify enrollment management, create investigation tickets, and trigger model recalibration processes.' },
        ],
      },
    ],
    journeys: [
      { name: 'Student Enrolment', configFile: 'config-education-student-enrolment.json' },
      { name: 'Course Registration', configFile: 'config-education-course-registration.json' },
    ],
    kpis: ['AI retention prediction accuracy', 'AI enrollment yield improvement', 'AI advising effectiveness', 'AI learning outcome lift'],
  },
  {
    id: 'energy',
    icon: '⚡',
    industry: 'Energy & Utilities',
    color: '#f39c12',
    tagline: 'Prove AI is optimizing the grid — not just generating dashboards',
    description: 'Utilities are deploying AI across operations — AI grid optimization, predictive equipment maintenance, AI demand forecasting, AI outage management, and AI customer engagement. But proving that AI actually reduces outage duration, improves grid reliability, and lowers operational costs requires observability into AI system performance and business outcomes. Dynatrace bridges that gap.',
    painPoints: [
      'AI grid optimization adjusts load balancing and switching but nobody measures whether AI decisions actually reduce SAIDI/SAIFI metrics vs operator decisions',
      'Predictive maintenance AI flags equipment for replacement but false positive rates drive unnecessary truck rolls costing $800-2,000 each',
      'AI demand forecasting errors cause expensive imbalanced positions in wholesale energy markets — nobody tracks forecast accuracy in real time',
      'AI outage management predicts restoration times but accuracy degrades during major storm events exactly when it matters most',
      'Cannot answer the regulator or board: "Our AI grid modernization program — did reliability actually improve and were costs reduced?"',
    ],
    roiPoints: [
      'Prove AI grid optimization ROI — measure whether AI load management decisions actually reduce SAIDI minutes and energy losses vs manual dispatch',
      'Validate predictive maintenance — correlate AI equipment alerts with actual failure data, measuring prevented outages vs unnecessary truck roll costs',
      'Quantify AI forecasting value — measure AI demand forecast accuracy impact on wholesale market costs and renewable integration efficiency',
      'Accelerate partner deployment — pre-built SAP/Oracle/Itron integrations let partners demonstrate AI observability value to utilities quickly',
      'Lower barriers — partners deploy vertical solution packs that prove AI ROI to utility boards and regulators with auditable evidence',
    ],
    integrations: [
      {
        name: 'SAP for Utilities',
        category: 'Utility ERP & Billing',
        description: 'SAP for Utilities with AI-powered demand forecasting, predictive billing, intelligent meter data management, and smart grid analytics is central to utility digital transformation. Dynatrace ensures AI features deliver measurable operational and financial improvements.',
        useCases: [
          'AI demand forecasting — monitor AI load prediction accuracy for grid operations, wholesale purchasing, and renewable dispatch optimization',
          'Predictive billing AI — track AI-powered billing estimation accuracy, customer dispute reduction, and revenue assurance improvements',
          'AI meter data management — observe AI anomaly detection in smart meter data streams for theft detection, meter failure prediction, and data quality',
          'SAP Business AI — monitor Joule AI assistant effectiveness within utility operations and customer service workflows',
        ],
        monitoringPoints: [
          'AI demand forecast accuracy (MAPE) vs actual grid load',
          'AI billing estimation accuracy and dispute rate reduction',
          'AI meter anomaly detection true positive rate and response time',
          'AI theft detection accuracy and revenue recovery amounts',
          'SAP utility AI API response times and availability',
          'AI data pipeline freshness from SCADA/AMI to models',
        ],
        bizObsValue: 'Partners can show utilities — "AI demand forecasting reduced wholesale imbalance costs by $2.3M annually with 94% accuracy. AI meter anomaly detection identified $890K in revenue theft. AI billing estimation reduced customer disputes by 28%." That ROI data drives utility AI investment.',
        dynatraceHow: [
          { capability: 'OneAgent (Full-Stack)', detail: 'Deploy OneAgent on SAP for Utilities servers, AI model serving infrastructure, and meter data management systems. Auto-discover the complete AI pipeline from meter data ingestion through AI processing to billing and grid operations.' },
          { capability: 'Business Events (BizEvents)', detail: 'Capture AI utility events — ai_demand_forecast, ai_billing_estimated, ai_anomaly_detected, ai_theft_flagged, ai_maintenance_predicted — with operational and financial context for DQL-powered AI ROI measurement.' },
          { capability: 'Dynatrace Intelligence', detail: 'Dynatrace Intelligence baselines AI performance across all utility operations. When demand forecast accuracy drops, meter anomaly detection rates change, or billing AI quality degrades, it detects anomalies and correlates with data pipeline or infrastructure changes.' },
          { capability: 'Dashboards & Notebooks', detail: 'Pre-built utility AI dashboards — demand forecast accuracy trends, AI billing savings, meter anomaly detection ROI, prediction maintenance effectiveness. Partners present these to utility executives and regulators as AI investment evidence.' },
        ],
      },
      {
        name: 'Oracle Utilities',
        category: 'Customer & Asset Management',
        description: 'Oracle Utilities Cloud with AI capabilities — AI-powered customer engagement, AI asset health, predictive outage management — serves major utilities globally. Dynatrace ensures AI features deliver measurable reliability and customer experience improvements.',
        useCases: [
          'AI customer engagement — monitor AI-powered usage insights, personalized efficiency recommendations, and customer program enrollment optimization',
          'AI asset health — track AI predictive maintenance model accuracy for distribution network equipment (transformers, switches, lines)',
          'AI outage management — observe AI storm impact prediction, crew dispatch optimization, and estimated restoration time accuracy',
          'Oracle AI analytics — monitor AI-driven operational analytics pipeline performance and insight generation quality',
        ],
        monitoringPoints: [
          'AI customer engagement recommendation effectiveness',
          'AI asset health prediction accuracy vs actual failures',
          'AI outage restoration time estimate accuracy during events',
          'AI crew dispatch optimization savings vs manual routing',
          'Oracle Utilities API performance for AI-powered services',
          'AI model accuracy during extreme weather events',
        ],
        bizObsValue: 'Utility operations leaders need proof — "AI asset health predicted 45 transformer failures before outage, preventing 120,000+ customer-minutes of interruption worth $2.1M. AI crew dispatch optimization reduced storm restoration times by 22%." That evidence justifies continued grid AI modernization.',
        dynatraceHow: [
          { capability: 'Distributed Tracing', detail: 'Trace AI-powered utility workflows — from sensor data through AI processing (asset health scoring, outage prediction, crew optimization) to operator action. Identify where AI adds value and where processing latency delays critical grid decisions.' },
          { capability: 'Log Analytics (Grail)', detail: 'Ingest Oracle Utilities AI logs, SCADA event data, and outage management logs. Correlate AI predictions with actual grid events for retrospective accuracy analysis. Provide regulators with auditable AI decision evidence for rate case proceedings.' },
          { capability: 'Service-Level Objectives (SLOs)', detail: 'Define AI-specific utility SLOs — "AI asset health scores updated within 1 hour of new sensor data" or "AI outage restoration estimates accurate within ±30 minutes for 90% of events." Track SLO compliance for regulatory reporting.' },
        ],
      },
      {
        name: 'Itron',
        category: 'Smart Grid & AMI',
        description: 'Itron\'s AI-powered smart grid platform — distributed intelligence, AI edge analytics, grid optimization — processes billions of meter and sensor readings. Dynatrace ensures AI at the grid edge delivers measurable reliability and efficiency improvements.',
        useCases: [
          'AI edge analytics — monitor AI processing at grid devices (meters, sensors, switches) for anomaly detection accuracy and response times',
          'AI demand response — track AI-powered load management effectiveness, customer participation rates, and peak reduction impact',
          'AI grid optimization — observe AI-driven voltage regulation, conservation voltage reduction, and loss minimization effectiveness',
          'AI data analytics — monitor AI processing pipeline for the billions of daily meter readings flowing through Itron platforms',
        ],
        monitoringPoints: [
          'AI edge device processing latency and accuracy',
          'AI demand response load reduction effectiveness',
          'AI voltage optimization energy savings measurements',
          'AI data pipeline throughput and processing latency',
          'Itron platform API response times for AI queries',
        ],
        bizObsValue: 'Grid operators need smart grid AI proof — "AI conservation voltage reduction saved 3.2% energy across the distribution network, worth $4.8M annually. AI demand response optimized 340MW of flexible load with 94% reliability." That drives smart grid AI expansion to additional circuits.',
        dynatraceHow: [
          { capability: 'Custom Metrics via OpenTelemetry', detail: 'Instrument Itron AI metrics — edge analytics accuracy, demand response participation rates, voltage optimization savings, data pipeline throughput. Dynatrace ingests via OTLP and correlates with grid reliability and financial metrics.' },
          { capability: 'Workflows & Automation', detail: 'When Dynatrace Intelligence detects AI edge analytics degradation or demand response effectiveness drops, Workflows automatically notify grid operations, adjust AI parameters, and create investigation tickets for smart grid teams.' },
          { capability: 'Dashboards & Notebooks', detail: 'Pre-built smart grid AI dashboards — edge analytics accuracy, demand response ROI, voltage optimization savings, data pipeline health. Partners deploy these for utilities transitioning from basic AMI to AI-powered grid intelligence.' },
        ],
      },
    ],
    journeys: [
      { name: 'Account Setup', configFile: 'config-energy-utilities-account-setup.json' },
      { name: 'Meter Reading & Billing', configFile: 'config-energy-utilities-meter-billing.json' },
    ],
    kpis: ['AI demand forecast accuracy', 'AI asset health prediction rate', 'AI outage restoration improvement', 'AI grid optimization savings'],
  },
  {
    id: 'logistics',
    icon: '🚛',
    industry: 'Logistics & Supply Chain',
    color: '#d35400',
    tagline: 'Prove AI is optimizing logistics — not just generating predictions nobody uses',
    description: 'Logistics companies are investing in AI across the supply chain — AI route optimization, predictive ETAs, AI demand planning, autonomous warehouse robotics, and AI last-mile delivery. But proving that AI actually reduces transportation costs, improves on-time delivery, and increases warehouse throughput requires observability into AI system performance. Dynatrace connects AI decisions to supply chain business outcomes.',
    painPoints: [
      'AI route optimization recommends paths but drivers override 30%+ of AI suggestions — nobody measures whether AI or driver decisions result in better outcomes',
      'AI predictive ETAs promise real-time accuracy but degrade during disruptions (weather, port delays) exactly when accurate ETAs matter most',
      'AI demand planning forecasts drive warehouse staffing and inventory but forecast errors cause overtime costs and stockouts that aren\'t attributed back to AI',
      'Autonomous warehouse robotics (Locus, 6 River) have variable AI performance — pick accuracy and throughput fluctuate without clear visibility into root cause',
      'Cannot answer leadership: "Our AI supply chain investment — did transportation costs decrease and did on-time delivery improve?"',
    ],
    roiPoints: [
      'Prove AI routing ROI — measure AI-optimized route cost savings, fuel reduction, and on-time delivery improvement vs manual/legacy planning',
      'Validate AI ETA accuracy — correlate AI predictions with actual delivery times, measuring customer experience and operational planning impact',
      'Quantify AI demand planning — measure forecast accuracy impact on inventory costs, stockout rates, and warehouse labor optimization',
      'Accelerate partner deployment — pre-built SAP TM/Blue Yonder/FourKites integrations let partners show AI logistics value quickly',
      'Lower barriers — partners deploy vertical solution packs that prove AI supply chain ROI to logistics CXOs with auditable data',
    ],
    integrations: [
      {
        name: 'SAP TM',
        category: 'Transportation Management',
        description: 'SAP Transportation Management with AI-powered route optimization, carrier selection, freight cost prediction, and shipment consolidation is central to logistics digital transformation. Dynatrace ensures AI features deliver measurable cost and service improvements.',
        useCases: [
          'AI route optimization — monitor AI-powered route planning decision quality, measuring cost savings, delivery time improvement, and CO2 reduction vs manual planning',
          'AI carrier selection — track AI carrier recommendation accuracy, measuring on-time performance and cost of AI-selected carriers vs manual dispatch',
          'AI freight cost prediction — observe AI freight rate forecasting accuracy for spot market procurement, measuring savings from AI-timed purchases',
          'AI shipment consolidation — monitor AI multi-stop consolidation effectiveness, measuring load utilization improvement and per-shipment cost reduction',
        ],
        monitoringPoints: [
          'AI route optimization cost savings vs manual planning baseline',
          'AI carrier selection on-time delivery rate vs historical average',
          'AI freight rate prediction accuracy vs actual market rates',
          'AI consolidation load utilization improvement percentage',
          'SAP TM AI processing times for planning decisions',
          'AI data pipeline freshness (traffic, weather, capacity data)',
        ],
        bizObsValue: 'Partners can show logistics companies — "AI route optimization saved $4.7M in transportation costs annually with 12% fuel reduction. AI carrier selection improved on-time delivery by 6 points. AI freight predictions saved $890K by timing spot market purchases." That data justifies supply chain AI investment.',
        dynatraceHow: [
          { capability: 'OneAgent (Full-Stack)', detail: 'Deploy OneAgent on SAP TM servers and AI model serving infrastructure. Auto-discover the complete AI logistics pipeline — from data ingestion through route optimization, carrier scoring, and shipment execution — without modifying SAP configurations.' },
          { capability: 'Business Events (BizEvents)', detail: 'Capture AI logistics events — ai_route_optimized, ai_carrier_selected, ai_freight_predicted, ai_consolidation_planned — with cost and service context for DQL-powered transportation AI ROI dashboards.' },
          { capability: 'Dynatrace Intelligence', detail: 'Dynatrace Intelligence baselines AI logistics performance. When route optimization quality drops, carrier selection accuracy declines, or freight predictions diverge from market, it detects anomalies and correlates with data pipeline issues or market volatility.' },
          { capability: 'Dashboards & Notebooks', detail: 'Pre-built transportation AI dashboards — route optimization savings, carrier AI performance, freight prediction accuracy, consolidation efficiency. Partners present these to logistics executives and supply chain VPs.' },
        ],
      },
      {
        name: 'Blue Yonder',
        category: 'Supply Chain Platform',
        description: 'Blue Yonder\'s AI/ML-powered supply chain platform — demand planning, warehouse management, transportation, and labor optimization — processes decisions across the entire logistics network. Dynatrace ensures AI-driven supply chain decisions deliver measurable improvements.',
        useCases: [
          'AI demand planning — monitor ML forecast accuracy for inventory positioning, measuring stockout reduction and overstock waste prevention',
          'AI warehouse optimization — track AI-powered pick path optimization, slotting recommendations, and wave planning effectiveness',
          'AI labor planning — observe AI workforce scheduling accuracy, measuring labor utilization improvement and overtime reduction',
          'Luminate AI — monitor Blue Yonder\'s AI cognitive platform for decision quality, processing speed, and exception handling accuracy',
        ],
        monitoringPoints: [
          'AI demand forecast accuracy (MAPE/bias) by product and location',
          'AI warehouse pick productivity improvement vs baseline',
          'AI labor forecast accuracy and scheduling optimization savings',
          'Luminate AI decision processing times and exception rates',
          'Blue Yonder API performance for AI-powered operations',
          'AI model retraining frequency and accuracy impact',
        ],
        bizObsValue: 'Supply chain leaders need AI proof — "AI demand planning reduced inventory carrying costs by $8.2M while improving fill rates by 3 points. AI warehouse optimization increased pick productivity by 18%. AI labor scheduling reduced overtime by 23%." That ROI drives platform-wide AI adoption.',
        dynatraceHow: [
          { capability: 'Distributed Tracing', detail: 'Trace AI supply chain decisions end-to-end — from demand signal through AI forecast, inventory optimization, warehouse execution, and order fulfillment. Identify where AI decisions add value and where processing delays impact supply chain velocity.' },
          { capability: 'Custom Metrics via OpenTelemetry', detail: 'Instrument Blue Yonder AI metrics — forecast accuracy scores, pick path optimization savings, labor utilization rates, exception handling counts. Dynatrace ingests via OTLP and correlates with supply chain financial outcomes.' },
          { capability: 'Service-Level Objectives (SLOs)', detail: 'Define supply chain AI SLOs — "AI demand forecasts updated daily within 2-hour processing window" or "AI warehouse optimization available during 99.9% of shift hours." Track compliance across distribution network.' },
        ],
      },
      {
        name: 'FourKites',
        category: 'Visibility Platform',
        description: 'FourKites AI-powered supply chain visibility — predictive ETAs, dynamic ETA refinement, AI-driven exception management — serves major shippers and carriers. Dynatrace ensures AI visibility features deliver measurable customer experience and operational improvements.',
        useCases: [
          'AI predictive ETAs — monitor AI ETA prediction accuracy across modes (TL, LTL, ocean, rail), measuring customer satisfaction and operational planning impact',
          'AI exception management — track AI-powered delay prediction, proactive alerting accuracy, and exception resolution effectiveness',
          'AI dynamic routing — observe AI-powered rerouting recommendations during disruptions, measuring cost and service impact vs no-AI baseline',
          'AI dock scheduling — monitor AI-powered appointment optimization for warehouse receiving, measuring dock utilization and driver wait time reduction',
        ],
        monitoringPoints: [
          'AI ETA prediction accuracy (±window) by mode and carrier',
          'AI exception prediction lead time and accuracy',
          'AI rerouting recommendation acceptance rate and cost impact',
          'AI dock scheduling utilization improvement and wait reduction',
          'FourKites API response times for AI-powered queries',
        ],
        bizObsValue: 'Shippers need visibility AI proof — "AI predictive ETAs were accurate within ±2 hours for 91% of TL shipments, enabling $1.4M in dock labor optimization. AI exception alerts gave 8-hour average early warning, reducing expedited freight costs by $2.3M." That drives visibility platform expansion.',
        dynatraceHow: [
          { capability: 'Real User Monitoring (RUM)', detail: 'Deploy RUM on FourKites visibility portals used by shippers, carriers, and customers. Capture interactions with AI ETAs, exception alerts, and route recommendations. Measure how AI visibility features impact user decisions and outcomes.' },
          { capability: 'Business Events (BizEvents)', detail: 'Capture AI visibility events — ai_eta_predicted, ai_exception_detected, ai_reroute_suggested, ai_dock_scheduled — with accuracy and cost context for DQL-powered visibility AI ROI analysis.' },
          { capability: 'Dynatrace Intelligence', detail: 'Dynatrace Intelligence detects when AI prediction quality changes — ETA accuracy drops for specific lanes, exception prediction lead times decrease, or rerouting recommendations fail — and correlates with carrier data quality, weather data issues, or model drift.' },
        ],
      },
    ],
    journeys: [
      { name: 'Shipment Booking', configFile: 'config-logistics-shipment-booking.json' },
      { name: 'Cargo Tracking', configFile: 'config-logistics-cargo-tracking.json' },
    ],
    kpis: ['AI route optimization savings', 'AI ETA prediction accuracy', 'AI demand forecast accuracy', 'AI warehouse throughput lift'],
  },
  {
    id: 'government',
    icon: '🏛️',
    industry: 'Government & Public Sector',
    color: '#2c3e50',
    tagline: 'AI-powered citizen services — observable, accountable, trusted',
    description: 'Governments are deploying AI chatbots for citizen self-service, AI fraud detection in benefits and tax, and AI-driven case triage to reduce backlogs. When these AI systems fail silently — hallucinating tax guidance, misclassifying benefits claims, or routing cases incorrectly — public trust erodes and vulnerable citizens suffer. Dynatrace provides the observability layer that ensures AI citizen services are accurate, fair, and auditable.',
    painPoints: [
      'AI chatbots providing incorrect tax or benefits guidance to citizens without detection',
      'AI fraud detection models producing false positives that block legitimate claimants',
      'AI case triage systems routing complex cases incorrectly, increasing backlogs',
      'No auditability or explainability for AI-driven decisions in public services',
      'Legacy system integrations failing when AI modernization layers are added',
    ],
    roiPoints: [
      'Ensure AI citizen chatbots deliver accurate, auditable guidance — reducing call centre volumes by 40%',
      'Monitor AI fraud detection precision to protect £50M+ in legitimate benefits payments annually',
      'Track AI case triage accuracy — correctly routing 95%+ of cases first time, cutting backlogs by 30%',
      'Provide full AI decision audit trails for regulatory compliance (GDPR, GDS standards)',
      'Measure AI modernization ROI — quantifying legacy cost reduction vs AI platform investment',
    ],
    integrations: [
      {
        name: 'ServiceNow (Gov)',
        description: 'Government service management — AI-powered citizen portals, virtual agents, case management, and IT operations across central and local government',
        category: 'Citizen Service Management',
        useCases: [
          'AI virtual agent accuracy monitoring — ensuring citizen self-service bots give correct guidance',
          'Case management AI triage observability — tracking routing accuracy and resolution times',
          'Citizen portal performance — digital experience monitoring across accessibility requirements',
          'Cross-department workflow automation — monitoring AI-driven process orchestration',
        ],
        monitoringPoints: [
          'Virtual agent response accuracy rate and fallback-to-human frequency',
          'AI case triage correctness — first-time-right routing percentage',
          'Citizen portal availability and WCAG accessibility compliance',
          'Workflow automation success rates across department boundaries',
          'Service catalogue request completion funnel metrics',
        ],
        bizObsValue: 'Connect ServiceNow AI virtual agent interactions to citizen satisfaction outcomes — proving that AI self-service reduces call volumes while maintaining service quality for vulnerable populations.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Automatically detects anomalies in AI virtual agent response patterns, identifying when chatbot accuracy degrades before citizen complaints escalate' },
          { capability: 'Real User Monitoring', detail: 'Tracks citizen portal journeys across devices and accessibility tools, ensuring WCAG compliance and equitable digital access' },
          { capability: 'Business Analytics', detail: 'Correlates AI triage decisions with case resolution outcomes, measuring whether AI routing actually reduces backlogs' },
          { capability: 'OpenPipeline', detail: 'Ingests cross-department workflow telemetry to provide end-to-end visibility across siloed government systems' },
        ],
      },
      {
        name: 'Salesforce Government Cloud',
        description: 'FedRAMP-authorized citizen engagement platform — AI-powered case management, Einstein AI for service delivery, and constituent relationship management',
        category: 'Citizen Engagement',
        useCases: [
          'Einstein AI accuracy monitoring — ensuring AI recommendations for case workers are reliable',
          'Benefits application journey observability — tracking citizen experience from application to decision',
          'Constituent 360 data quality — monitoring AI-enriched citizen profiles for accuracy',
          'Cross-agency data sharing — ensuring AI-driven interoperability between departments',
        ],
        monitoringPoints: [
          'Einstein AI recommendation acceptance rate by case workers',
          'Benefits application completion rates and abandonment points',
          'Constituent data enrichment accuracy and refresh latency',
          'API integration health between Salesforce and legacy government systems',
          'FedRAMP compliance monitoring and security event correlation',
        ],
        bizObsValue: 'Link Salesforce Einstein AI recommendations to actual case outcomes — proving whether AI-assisted case management delivers faster, fairer decisions for citizens.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates Einstein AI recommendation patterns with case resolution speed and citizen satisfaction, detecting AI model drift' },
          { capability: 'Synthetic Monitoring', detail: 'Continuously tests citizen-facing application journeys to ensure availability during peak filing and benefits seasons' },
          { capability: 'Application Security', detail: 'Monitors FedRAMP security boundaries and detects vulnerabilities in citizen data handling pipelines' },
          { capability: 'Business Analytics', detail: 'Measures AI-assisted vs manual case processing times, quantifying ROI of AI investment in public services' },
        ],
      },
      {
        name: 'Microsoft Power Platform',
        description: 'Low-code government application platform — AI Builder for document processing, Power Virtual Agents for citizen self-service, and Power Automate for workflow automation',
        category: 'Low-Code AI Platform',
        useCases: [
          'AI Builder document processing accuracy — monitoring automated form extraction for benefits and permits',
          'Power Virtual Agent citizen self-service — tracking bot effectiveness and escalation patterns',
          'Power Automate workflow reliability — ensuring AI-triggered automations complete successfully',
          'Citizen app performance — monitoring low-code applications built for specific government services',
        ],
        monitoringPoints: [
          'AI Builder document extraction accuracy rates by form type',
          'Power Virtual Agent containment rate and citizen satisfaction scores',
          'Power Automate flow success rates and failure categorization',
          'Low-code application response times and error rates',
          'Dataverse data quality metrics and sync health across departments',
          'Licensing consumption and capacity utilization across agencies',
        ],
        bizObsValue: 'Measure how AI Builder and Power Virtual Agents reduce manual processing costs across government — quantifying the citizen time saved and staff productivity gained from AI automation.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects degradation in AI Builder document processing accuracy, alerting before incorrect form data enters government systems' },
          { capability: 'Digital Experience Monitoring', detail: 'Tracks citizen interactions with Power Apps and Virtual Agents across all channels and devices' },
          { capability: 'Business Analytics', detail: 'Calculates cost-per-transaction for AI-automated vs manual government processes, proving digital transformation ROI' },
          { capability: 'OpenPipeline', detail: 'Unifies telemetry from Power Platform, legacy systems, and third-party integrations into a single observability view' },
        ],
      },
    ],
    journeys: [
      { name: 'Tax Filing', configFile: 'config-government-tax-filing.json' },
      { name: 'Benefits Claim', configFile: 'config-government-benefits-claim.json' },
    ],
    kpis: ['Filing completion rate', 'Benefits processing time', 'Application approval rate', 'System availability'],
  },
  {
    id: 'hospitality',
    icon: '🏨',
    industry: 'Hospitality & Travel',
    color: '#e91e63',
    tagline: 'AI-driven guest experiences — personalized, profitable, observable',
    description: 'Hotels and travel companies are deploying AI for dynamic pricing, personalized guest recommendations, AI concierge chatbots, and predictive demand forecasting. When AI pricing engines set rates incorrectly, AI recommendations miss guest preferences, or chatbots give wrong booking information, revenue leaks and guest satisfaction plummets. Dynatrace ensures every AI-powered hospitality experience is accurate, performant, and revenue-optimizing.',
    painPoints: [
      'AI dynamic pricing engines setting incorrect rates during peak demand — losing revenue or pricing out guests',
      'AI recommendation systems failing to personalize offers, reducing upsell conversion rates',
      'AI chatbot concierges providing wrong booking or property information to guests',
      'Predictive demand forecasting models drifting, causing overbooking or underutilized inventory',
      'OTA integration failures when AI-driven rate parity systems malfunction',
    ],
    roiPoints: [
      'Monitor AI dynamic pricing accuracy — protecting $2M+ annual revenue per property from pricing errors',
      'Track AI recommendation conversion rates — driving 25% uplift in ancillary revenue through personalization',
      'Ensure AI concierge chatbot accuracy — reducing front desk calls by 45% while maintaining guest satisfaction',
      'Validate AI demand forecasting — achieving 95%+ occupancy prediction accuracy to optimize inventory',
      'Measure AI rate parity compliance across OTAs — protecting direct booking revenue margins',
    ],
    integrations: [
      {
        name: 'Oracle OPERA Cloud',
        description: 'Enterprise property management system — AI-enhanced reservations, guest profiles, revenue management, and housekeeping optimization across hotel portfolios',
        category: 'Property Management',
        useCases: [
          'AI revenue management accuracy — monitoring dynamic pricing decisions against actual booking outcomes',
          'Guest 360 AI personalization — tracking AI-driven guest preference prediction accuracy',
          'Reservation journey observability — end-to-end monitoring from search to confirmation',
          'Housekeeping AI optimization — monitoring room assignment and cleaning schedule predictions',
        ],
        monitoringPoints: [
          'AI dynamic pricing decision accuracy vs actual RevPAR achieved',
          'Guest profile AI enrichment accuracy and recommendation acceptance rates',
          'Reservation funnel conversion rates and abandonment by step',
          'PMS API response times for check-in, check-out, and room assignment',
          'Cross-property data sync latency and consistency metrics',
        ],
        bizObsValue: 'Connect OPERA AI pricing decisions to actual revenue outcomes — proving whether dynamic pricing AI maximizes RevPAR or leaves money on the table across the property portfolio.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects AI pricing anomalies by correlating rate decisions with booking velocity, flagging when AI sets rates that deviate from optimal RevPAR patterns' },
          { capability: 'Real User Monitoring', detail: 'Tracks the complete guest booking journey across web and mobile, identifying where AI-powered personalization impacts conversion' },
          { capability: 'Business Analytics', detail: 'Measures revenue impact of AI pricing decisions per property, per room type, per season — quantifying AI ROI' },
          { capability: 'Synthetic Monitoring', detail: 'Continuously tests booking engine availability and performance across global markets and peak demand periods' },
        ],
      },
      {
        name: 'Amadeus Hospitality',
        description: 'Central reservation and distribution platform — AI-powered demand forecasting, channel management, business intelligence, and rate optimization',
        category: 'Revenue & Distribution',
        useCases: [
          'AI demand forecasting accuracy — monitoring prediction models against actual occupancy outcomes',
          'Channel distribution AI optimization — ensuring rate parity and availability across OTAs',
          'Business intelligence AI insights — validating automated market analysis recommendations',
          'Group booking AI — monitoring automated pricing and availability for events and conferences',
        ],
        monitoringPoints: [
          'Demand forecast accuracy — predicted vs actual occupancy by date range',
          'Rate parity compliance percentage across distribution channels',
          'Channel manager API health and booking distribution latency',
          'AI market insight generation frequency and recommendation accuracy',
          'Group booking AI pricing accuracy vs final negotiated rates',
          'GDS connectivity health and response time percentiles',
        ],
        bizObsValue: 'Link AI demand forecasting accuracy directly to occupancy rates and revenue outcomes — proving whether predictive models are optimizing or costing the business money.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates AI demand predictions with actual booking patterns, automatically detecting forecast drift before it impacts revenue' },
          { capability: 'OpenPipeline', detail: 'Ingests booking data from all distribution channels to provide unified visibility across OTAs, GDS, and direct bookings' },
          { capability: 'Business Analytics', detail: 'Compares AI-optimized channel distribution against manual strategies, quantifying incremental revenue from AI' },
          { capability: 'Application Security', detail: 'Monitors API security across distribution channels, protecting against rate scraping and unauthorized inventory access' },
        ],
      },
      {
        name: 'Mews',
        description: 'Cloud-native hospitality platform — AI-powered guest journey management, automated payments, operations optimization, and marketplace integrations',
        category: 'Guest Experience Platform',
        useCases: [
          'AI guest journey automation — monitoring contactless check-in/out, digital key, and automated communications',
          'AI payment optimization — tracking automated payment routing and fraud detection accuracy',
          'Operations AI — monitoring automated task assignment for housekeeping and maintenance',
          'Marketplace integration health — ensuring AI-driven upselling through connected services works reliably',
        ],
        monitoringPoints: [
          'Contactless check-in success rate and digital key delivery reliability',
          'AI payment routing optimization — transaction success rates by payment method',
          'Automated task assignment accuracy and completion rates',
          'Guest communication automation — delivery rates and response triggers',
          'Marketplace API integration health and upsell conversion rates',
          'Real-time occupancy dashboard accuracy and refresh latency',
        ],
        bizObsValue: 'Measure how AI-driven guest journey automation impacts both operational efficiency and guest satisfaction — proving that contactless AI experiences increase NPS while reducing staffing costs.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects anomalies in AI-automated guest journeys — alerting when contactless check-in failures spike or payment routing degrades' },
          { capability: 'Digital Experience Monitoring', detail: 'Tracks guest interactions across mobile app, web, and kiosk touchpoints to ensure seamless AI-powered experiences' },
          { capability: 'Business Analytics', detail: 'Correlates AI automation rates with NPS scores and operational costs, proving the business case for hospitality AI investment' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures cloud-native platform reliability across global properties with auto-scaling validation during peak periods' },
        ],
      },
    ],
    journeys: [
      { name: 'Booking Journey', configFile: 'config-hospitality-booking-journey.json' },
      { name: 'Corporate Booking', configFile: 'config-hospitality-corporate-booking.json' },
    ],
    kpis: ['Booking conversion rate', 'Direct vs OTA ratio', 'Guest satisfaction score', 'Resolution time'],
  },
  {
    id: 'food-bev',
    icon: '🍽️',
    industry: 'Food & Beverage',
    color: '#ff5722',
    tagline: 'AI-optimized restaurants — from kitchen to customer, observable',
    description: 'Restaurant chains and food service companies are deploying AI for demand-based menu pricing, AI-powered kitchen production optimization, predictive inventory management, and personalized ordering recommendations. When AI pricing alienates customers, kitchen AI miscalculates prep times, or inventory predictions cause waste or stockouts, margins evaporate. Dynatrace ensures AI-driven food operations are accurate, efficient, and profit-maximizing.',
    painPoints: [
      'AI demand forecasting errors causing food waste or stockouts during peak hours',
      'AI-powered ordering recommendation engines failing to personalize, reducing average order value',
      'Kitchen display AI miscalculating prep priorities during rush periods, increasing wait times',
      'AI dynamic pricing models alienating price-sensitive customers without detection',
      'Third-party delivery platform AI integration failures causing order errors and refunds',
    ],
    roiPoints: [
      'Monitor AI demand forecasting accuracy — reducing food waste by 25% while preventing stockouts during peak service',
      'Track AI recommendation engine conversion — driving 15-20% uplift in average order value through personalization',
      'Ensure AI kitchen optimization accuracy — reducing average prep time by 30% during peak hours',
      'Validate AI dynamic pricing impact — protecting customer loyalty while optimizing margin per transaction',
      'Measure AI delivery integration reliability — reducing order error rates below 1% across all platforms',
    ],
    integrations: [
      {
        name: 'Toast',
        description: 'Restaurant technology platform — AI-powered POS, online ordering, kitchen display systems, payroll, and marketing with AI-driven insights across single and multi-location operations',
        category: 'Restaurant Platform',
        useCases: [
          'AI menu recommendation accuracy — monitoring personalized upsell suggestions and conversion rates',
          'Kitchen display AI optimization — tracking prep time predictions and order sequencing accuracy',
          'Online ordering AI — monitoring demand prediction and dynamic preparation time estimates',
          'AI-driven labour scheduling — validating predicted staffing needs against actual demand',
        ],
        monitoringPoints: [
          'AI menu recommendation acceptance rate and average order value impact',
          'Kitchen display system order sequencing accuracy and average prep time',
          'Online ordering funnel conversion rates and AI-predicted wait time accuracy',
          'POS transaction processing speed and payment success rates',
          'AI labour scheduling — predicted vs actual covers per labour hour',
        ],
        bizObsValue: 'Connect Toast AI recommendations and kitchen optimization to actual revenue per cover and customer satisfaction — proving whether AI-driven operations increase margins while maintaining service quality.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects anomalies in AI kitchen optimization — alerting when prep time predictions drift from actuals, causing service delays during peak hours' },
          { capability: 'Real User Monitoring', detail: 'Tracks online ordering journeys from menu browse to checkout, measuring AI recommendation impact on conversion' },
          { capability: 'Business Analytics', detail: 'Correlates AI upsell recommendations with revenue per cover across locations, quantifying personalization ROI' },
          { capability: 'Synthetic Monitoring', detail: 'Continuously tests online ordering platform availability before and during peak meal periods' },
        ],
      },
      {
        name: 'Square for Restaurants',
        description: 'Restaurant management ecosystem — AI-powered order management, payment processing, inventory tracking, team management, and customer loyalty with machine learning insights',
        category: 'Operations Management',
        useCases: [
          'AI inventory prediction — monitoring automated stock level recommendations and reorder accuracy',
          'Payment AI fraud detection — tracking false positive rates to avoid blocking legitimate transactions',
          'Customer loyalty AI — monitoring personalized reward recommendations and redemption patterns',
          'AI sales forecasting — validating predicted daily sales against actual revenue outcomes',
        ],
        monitoringPoints: [
          'AI inventory prediction accuracy — recommended vs actual usage by ingredient',
          'Payment processing success rates and AI fraud detection false positive rate',
          'Loyalty program AI recommendation relevance and redemption rates',
          'AI sales forecast accuracy — daily predicted vs actual revenue by location',
          'Order management system response times during peak transaction periods',
          'Multi-location data synchronization latency and consistency',
        ],
        bizObsValue: 'Link AI inventory predictions to actual food cost percentages and AI sales forecasts to staffing decisions — proving whether predictive AI reduces waste and optimizes labour across locations.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates AI inventory predictions with actual consumption patterns, detecting forecast drift that leads to waste or stockouts' },
          { capability: 'Business Analytics', detail: 'Measures AI-driven food cost savings vs manual ordering across locations, building the business case for AI adoption' },
          { capability: 'Digital Experience Monitoring', detail: 'Tracks customer-facing ordering and payment experiences across in-store, online, and mobile channels' },
          { capability: 'OpenPipeline', detail: 'Unifies POS, inventory, and delivery platform telemetry into a single observability view across all restaurant locations' },
        ],
      },
      {
        name: 'Olo',
        description: 'Digital ordering and delivery platform — AI-powered dispatch optimization, delivery marketplace management, payment processing, and customer engagement for restaurant brands',
        category: 'Digital Ordering & Delivery',
        useCases: [
          'AI dispatch optimization — monitoring automated delivery partner selection and routing accuracy',
          'Delivery time AI prediction — tracking estimated vs actual delivery times across platforms',
          'AI order throttling — monitoring intelligent capacity management during demand spikes',
          'Payment Rails AI — tracking payment routing optimization and transaction success rates',
        ],
        monitoringPoints: [
          'AI dispatch partner selection accuracy and delivery time performance',
          'Predicted vs actual delivery times across all marketplace partners',
          'AI order throttling trigger accuracy — avoiding unnecessary capacity restrictions',
          'Payment routing success rates by method and provider',
          'Menu syndication accuracy across delivery platforms',
          'API integration health with DoorDash, Uber Eats, Grubhub, and direct channels',
        ],
        bizObsValue: 'Measure how AI dispatch optimization impacts delivery times and customer satisfaction scores across all platforms — proving whether AI routing reduces delivery costs while maintaining speed-of-service SLAs.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects AI dispatch anomalies — alerting when delivery time predictions deviate significantly from actuals across marketplace partners' },
          { capability: 'Business Analytics', detail: 'Compares AI-optimized dispatch costs and times against baseline, quantifying delivery margin improvement from AI' },
          { capability: 'Application Security', detail: 'Monitors API security across multi-platform integrations, protecting customer payment data and order information' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures platform scalability during demand spikes — validating AI throttling decisions maintain quality without rejecting profitable orders' },
        ],
      },
    ],
    journeys: [
      { name: 'Online Ordering', configFile: 'config-foodbev-online-ordering.json' },
      { name: 'Table Reservation', configFile: 'config-foodbev-table-reservation.json' },
    ],
    kpis: ['Order completion rate', 'Reservation accuracy', 'Loyalty redemption rate', 'Avg order time'],
  },
  {
    id: 'gaming',
    icon: '🎮',
    industry: 'Gaming & Entertainment',
    color: '#673ab7',
    tagline: 'AI-powered player experiences — engaging, fair, observable',
    description: 'Gaming companies are deploying AI for player matchmaking, AI-generated content, dynamic difficulty adjustment, personalized monetization, and AI anti-cheat systems. When matchmaking AI creates unfair lobbies, AI content generation produces broken assets, or AI monetization pushes players too aggressively, player engagement tanks and revenue follows. Dynatrace ensures AI-powered gaming experiences are fair, performant, and retention-optimizing.',
    painPoints: [
      'AI matchmaking creating unbalanced lobbies that frustrate players and increase churn',
      'AI-generated content (levels, assets, dialogue) producing quality issues that break immersion',
      'AI dynamic difficulty adjustment being perceived as unfair, eroding player trust',
      'AI monetization models pushing too aggressively, causing negative player sentiment and regulatory scrutiny',
      'AI anti-cheat systems producing false positives, wrongly banning legitimate players',
    ],
    roiPoints: [
      'Monitor AI matchmaking fairness — improving player session length by 35% through better lobby balancing',
      'Track AI content generation quality — ensuring 99%+ of AI-generated assets pass quality gates before release',
      'Validate AI difficulty adjustment — maintaining optimal player flow state to increase DAU/MAU ratios by 20%',
      'Measure AI monetization effectiveness — driving 30% ARPU uplift while keeping player sentiment positive',
      'Ensure AI anti-cheat precision — reducing false positive bans to below 0.01% while catching 95%+ of cheaters',
    ],
    integrations: [
      {
        name: 'Unity',
        description: 'Game engine and services platform — AI-powered analytics, player engagement, multiplayer services, cloud build, and AI-assisted content creation tools',
        category: 'Game Engine & Services',
        useCases: [
          'AI player analytics accuracy — monitoring engagement prediction models and churn risk scoring',
          'AI-assisted content creation quality — tracking AI-generated asset quality metrics and review pass rates',
          'Multiplayer service AI — monitoring matchmaking algorithm fairness and lobby balance metrics',
          'Cloud build AI optimization — tracking intelligent build pipeline efficiency and failure prediction',
        ],
        monitoringPoints: [
          'AI player churn prediction accuracy — predicted vs actual retention by cohort',
          'AI-generated asset quality scores and human review override rates',
          'Matchmaking algorithm fairness metrics — win rate distribution and skill gap variance',
          'Multiplayer server latency percentiles by region and player count',
          'Cloud build success rates and AI-predicted build failure accuracy',
        ],
        bizObsValue: 'Connect Unity AI player analytics predictions directly to retention and monetization outcomes — proving whether AI-driven engagement strategies actually increase player lifetime value.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects anomalies in AI matchmaking patterns — alerting when lobby balancing degrades and player session lengths start declining' },
          { capability: 'Real User Monitoring', detail: 'Tracks actual player experience metrics including frame rates, load times, and input latency across devices and platforms' },
          { capability: 'Business Analytics', detail: 'Correlates AI engagement predictions with actual DAU/MAU, ARPU, and LTV metrics to validate AI model accuracy' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Monitors game server auto-scaling and performance to ensure AI-driven infrastructure decisions maintain low latency globally' },
        ],
      },
      {
        name: 'PlayFab (Microsoft)',
        description: 'Game backend platform — AI-powered player data management, matchmaking services, economy management, content delivery, and LiveOps automation',
        category: 'Game Backend & LiveOps',
        useCases: [
          'AI economy balancing — monitoring virtual currency, pricing, and reward distribution for fairness and engagement',
          'AI LiveOps automation — tracking automated event targeting and personalized content delivery effectiveness',
          'Player segmentation AI — monitoring automated cohort classification and targeting accuracy',
          'AI matchmaking quality — tracking skill-based matching accuracy and queue time optimization',
        ],
        monitoringPoints: [
          'Virtual economy AI balance metrics — inflation rates, currency sink effectiveness, pricing fairness',
          'LiveOps AI event targeting — audience reach, engagement rates, and conversion by segment',
          'Player segmentation accuracy — classification consistency and targeting relevance scores',
          'Matchmaking queue times vs match quality trade-off metrics',
          'Economy transaction processing latency and failure rates',
          'Content delivery reliability and update distribution speed across regions',
        ],
        bizObsValue: 'Link AI economy balancing and LiveOps targeting directly to player spending patterns and retention — proving whether AI-driven game operations maximize revenue while maintaining fair play.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates AI economy changes with player spending behavior, detecting when AI pricing pushes cause spending drops or player exits' },
          { capability: 'Business Analytics', detail: 'Measures AI LiveOps event ROI — comparing AI-targeted events to manual campaigns on engagement, conversion, and player sentiment' },
          { capability: 'Synthetic Monitoring', detail: 'Continuously tests game backend API endpoints across regions to ensure consistent player experience globally' },
          { capability: 'OpenPipeline', detail: 'Ingests player telemetry, economy transactions, and LiveOps events into a unified analytics pipeline for full-stack game observability' },
        ],
      },
      {
        name: 'Xsolla',
        description: 'Game commerce platform — AI-powered payment optimization, subscription management, store launcher, and cross-platform monetization with fraud detection',
        category: 'Game Commerce & Monetization',
        useCases: [
          'AI payment routing optimization — monitoring intelligent payment method selection and authorization rates',
          'AI fraud detection — tracking accuracy of automated transaction fraud scoring and false positive rates',
          'AI pricing localization — monitoring regional price optimization and conversion impact',
          'Subscription AI — tracking churn prediction accuracy and automated retention offer effectiveness',
        ],
        monitoringPoints: [
          'AI payment routing — authorization rate improvement vs baseline by region and method',
          'Fraud detection AI accuracy — true positive rate, false positive rate, and revenue protected',
          'Regional AI pricing — conversion rate changes and revenue impact by market',
          'Subscription churn prediction accuracy and retention intervention success rates',
          'Store launcher performance and game delivery speeds across regions',
          'Cross-platform purchase synchronization accuracy and latency',
        ],
        bizObsValue: 'Measure how AI payment optimization and regional pricing directly impact global revenue per player — proving that AI-driven commerce decisions increase monetization while reducing fraud losses.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects AI payment routing degradation — alerting when authorization rates drop in specific regions or payment methods before revenue impact compounds' },
          { capability: 'Business Analytics', detail: 'Calculates incremental revenue from AI payment optimization and regional pricing vs static pricing models across all markets' },
          { capability: 'Application Security', detail: 'Monitors payment infrastructure security and AI fraud detection effectiveness, ensuring PCI compliance across the commerce stack' },
          { capability: 'Digital Experience Monitoring', detail: 'Tracks the complete purchase experience from in-game store to payment completion across all platforms and regions' },
        ],
      },
    ],
    journeys: [
      { name: 'Player Registration', configFile: 'config-gaming-player-registration.json' },
      { name: 'In-App Purchase', configFile: 'config-gaming-in-app-purchase.json' },
    ],
    kpis: ['DAU/MAU ratio', 'Purchase conversion rate', 'Matchmaking latency', 'Subscription churn'],
  },
  {
    id: 'manufacturing',
    icon: '🏭',
    industry: 'Industrial Manufacturing',
    color: '#607d8b',
    tagline: 'AI-driven Industry 4.0 — predictive, optimized, observable',
    description: 'Manufacturers are deploying AI for predictive quality control, AI-optimized production scheduling, digital twin simulation, AI-driven supply chain optimization, and predictive maintenance. When AI quality models miss defects, production AI creates bottlenecks, or predictive maintenance triggers false alarms, the cost impacts cascade through the entire supply chain. Dynatrace ensures AI-powered manufacturing delivers on the Industry 4.0 promise with measurable, observable outcomes.',
    painPoints: [
      'AI quality control models missing defects that reach customers, causing costly recalls',
      'AI production scheduling creating bottlenecks that reduce OEE instead of improving it',
      'Predictive maintenance AI generating excessive false alarms, causing unnecessary production stops',
      'Digital twin AI simulations diverging from physical reality, leading to wrong optimization decisions',
      'AI supply chain demand sensing failing to anticipate disruptions, causing material shortages',
    ],
    roiPoints: [
      'Monitor AI quality control precision — reducing defect escape rates by 60% and recall costs by $10M+ annually',
      'Track AI production scheduling effectiveness — improving OEE by 15-20% through optimized sequencing',
      'Validate predictive maintenance AI accuracy — achieving 90%+ true positive rates while reducing false alarms by 70%',
      'Ensure digital twin fidelity — maintaining <2% deviation between AI simulation predictions and physical outcomes',
      'Measure AI demand sensing accuracy — reducing material shortages by 40% and excess inventory by 25%',
    ],
    integrations: [
      {
        name: 'SAP S/4HANA Manufacturing',
        description: 'Enterprise manufacturing platform — AI-enhanced production planning, quality management, predictive maintenance, and supply chain with embedded machine learning',
        category: 'Enterprise Manufacturing',
        useCases: [
          'AI production planning optimization — monitoring AI-driven scheduling decisions against actual throughput outcomes',
          'AI quality management — tracking predictive quality models for defect detection accuracy',
          'AI-driven supply chain planning — monitoring demand sensing AI accuracy and material availability predictions',
          'Predictive maintenance integration — validating AI maintenance recommendations against actual equipment failures',
        ],
        monitoringPoints: [
          'AI production schedule optimization — planned vs actual throughput by production line',
          'Predictive quality model accuracy — defect detection rate and false positive rate',
          'AI demand sensing — forecast accuracy by material, supplier, and time horizon',
          'Predictive maintenance — prediction accuracy, lead time, and false alarm rate',
          'MRP run performance and material availability prediction accuracy',
        ],
        bizObsValue: 'Connect SAP AI production planning decisions to actual OEE and quality outcomes — proving whether AI-optimized manufacturing delivers measurable efficiency gains over traditional planning.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates AI production planning decisions with actual throughput and quality metrics, detecting when AI scheduling causes bottlenecks' },
          { capability: 'Business Analytics', detail: 'Measures AI production optimization ROI — comparing AI-scheduled production runs against manual planning on OEE, yield, and cost metrics' },
          { capability: 'OpenPipeline', detail: 'Ingests IoT sensor data, MES telemetry, and ERP metrics into a unified manufacturing observability platform' },
          { capability: 'Application Security', detail: 'Monitors OT/IT convergence security boundaries, ensuring AI-connected manufacturing systems are protected from cyber threats' },
        ],
      },
      {
        name: 'Siemens MindSphere / Xcelerator',
        description: 'Industrial IoT and digital twin platform — AI-powered asset monitoring, predictive analytics, simulation, and closed-loop manufacturing optimization',
        category: 'Industrial IoT & Digital Twin',
        useCases: [
          'Digital twin AI fidelity — monitoring deviation between AI simulation predictions and physical asset behavior',
          'Predictive maintenance AI — tracking equipment failure prediction accuracy and maintenance scheduling optimization',
          'AI-driven energy optimization — monitoring production energy consumption predictions and optimization effectiveness',
          'Edge AI analytics — monitoring AI model performance on edge devices across factory floor deployments',
        ],
        monitoringPoints: [
          'Digital twin simulation accuracy — predicted vs actual asset performance metrics',
          'Predictive maintenance AI — true positive rate, false alarm rate, and mean time to prediction',
          'Energy optimization AI — predicted vs actual energy consumption reduction by production line',
          'Edge AI model inference latency and accuracy by device type and location',
          'IoT data pipeline reliability — sensor data ingestion completeness and latency',
          'Cross-plant digital twin synchronization and model update propagation',
        ],
        bizObsValue: 'Link digital twin AI predictions directly to physical production outcomes — proving whether simulation-driven optimization delivers real OEE improvements and energy cost reductions.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects digital twin drift — alerting when AI simulation predictions diverge from physical reality beyond acceptable thresholds' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Monitors IoT data pipeline health from edge sensors through cloud analytics, ensuring AI models receive complete, timely data' },
          { capability: 'Business Analytics', detail: 'Calculates ROI of digital twin AI by comparing simulation-optimized vs baseline production metrics across plants' },
          { capability: 'OpenPipeline', detail: 'Unifies OT sensor telemetry, IT application metrics, and digital twin predictions into a single manufacturing observability view' },
        ],
      },
      {
        name: 'PTC ThingWorx',
        description: 'Industrial IoT and AR platform — AI-powered connected operations, predictive maintenance, spatial computing for factory workers, and manufacturing intelligence',
        category: 'Connected Operations & AR',
        useCases: [
          'AI predictive maintenance — monitoring failure prediction models across connected equipment fleets',
          'AR-guided AI assistance — tracking AI-powered work instruction effectiveness and error reduction',
          'Manufacturing intelligence AI — monitoring KPI prediction accuracy and anomaly detection',
          'Connected product AI — tracking field equipment health prediction and proactive service outcomes',
        ],
        monitoringPoints: [
          'Predictive maintenance model accuracy by equipment type and failure mode',
          'AR work instruction AI — task completion time reduction and error rate improvement',
          'Manufacturing KPI prediction accuracy — OEE, scrap rate, and throughput forecasts',
          'Connected product health prediction accuracy and service intervention outcomes',
          'IoT platform data ingestion rates and edge-to-cloud pipeline reliability',
          'AR application performance — render times, spatial tracking accuracy, and device compatibility',
        ],
        bizObsValue: 'Measure how AI-driven connected operations translate to actual maintenance cost reduction and workforce productivity gains — proving the business case for IoT and AR investment on the factory floor.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates AI predictive maintenance alerts with actual equipment failures, automatically tuning alert thresholds to minimize false alarms' },
          { capability: 'Digital Experience Monitoring', detail: 'Tracks AR-guided worker experiences to ensure AI work instructions are responsive and accurate across devices' },
          { capability: 'Business Analytics', detail: 'Measures predictive maintenance ROI — comparing AI-predicted maintenance costs and downtime reduction against reactive maintenance baselines' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures IoT platform reliability and edge computing performance for real-time AI inference on the factory floor' },
        ],
      },
    ],
    journeys: [
      { name: 'Procurement Journey', configFile: 'config-manufacturing-procurement-journey.json' },
      { name: 'Maintenance Support', configFile: 'config-industrial-maintenance-support.json' },
    ],
    kpis: ['OEE (Overall Equipment Effectiveness)', 'Procurement cycle time', 'MTTR', 'Production throughput'],
  },
  {
    id: 'real-estate',
    icon: '🏠',
    industry: 'Real Estate & Property',
    color: '#00897b',
    tagline: 'AI-powered property management — smarter buildings, better returns, observable',
    description: 'Real estate companies are deploying AI for automated property valuation, AI-driven tenant screening, predictive maintenance for building systems, AI-optimized energy management, and intelligent lease pricing. When AI valuations are wrong, tenant screening AI introduces bias, or smart building AI wastes energy instead of saving it, property portfolios underperform. Dynatrace ensures AI-driven real estate operations are accurate, fair, and value-maximizing.',
    painPoints: [
      'AI automated valuation models (AVMs) producing inaccurate property valuations that mislead investment decisions',
      'AI tenant screening introducing undetected bias, creating regulatory and reputational risk',
      'Smart building AI failing to optimize energy consumption, negating sustainability investment ROI',
      'AI lease pricing models mispricing renewals, causing tenant churn or leaving revenue on the table',
      'Predictive maintenance AI for building systems generating false alarms or missing critical failures',
    ],
    roiPoints: [
      'Monitor AI valuation accuracy — achieving <3% deviation from market prices across the portfolio, protecting $100M+ in investment decisions',
      'Ensure AI tenant screening fairness — maintaining regulatory compliance while reducing screening time by 50%',
      'Track smart building AI energy optimization — delivering 20-30% energy cost reduction across managed properties',
      'Validate AI lease pricing — optimizing renewal rates to 85%+ while maximizing rental yield per unit',
      'Measure AI predictive maintenance effectiveness — reducing emergency repairs by 45% and extending equipment life by 25%',
    ],
    integrations: [
      {
        name: 'Yardi Voyager',
        description: 'Property management and accounting platform — AI-enhanced leasing, maintenance, energy management, and portfolio analytics across residential and commercial properties',
        category: 'Property Management',
        useCases: [
          'AI lease pricing optimization — monitoring automated rent recommendations against market data and tenant retention outcomes',
          'AI maintenance prioritization — tracking predictive maintenance model accuracy for building systems',
          'AI tenant screening — monitoring risk scoring accuracy and fairness metrics across demographic groups',
          'Portfolio AI analytics — validating AI-driven investment recommendations and property performance predictions',
        ],
        monitoringPoints: [
          'AI rent recommendation accuracy — suggested vs achieved rental rates and time-to-lease',
          'Predictive maintenance model accuracy — predicted vs actual equipment failures by system type',
          'AI tenant screening — approval rates, risk score accuracy, and fairness metrics across protected classes',
          'Portfolio AI — investment recommendation accuracy and property performance prediction vs actuals',
          'Lease management workflow completion rates and automation accuracy',
        ],
        bizObsValue: 'Connect Yardi AI rent pricing and maintenance predictions directly to portfolio NOI — proving whether AI-optimized property management delivers measurably better returns than manual approaches.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects AI rent pricing anomalies — alerting when AI recommendations deviate from market trends or when tenant screening patterns show potential bias' },
          { capability: 'Business Analytics', detail: 'Measures AI property management ROI across the portfolio — comparing AI-optimized properties against manually managed properties on NOI and tenant retention' },
          { capability: 'OpenPipeline', detail: 'Ingests property management, IoT building sensor, and market data telemetry into a unified real estate observability platform' },
          { capability: 'Synthetic Monitoring', detail: 'Continuously tests tenant portal and leasing application journeys to ensure availability during peak leasing seasons' },
        ],
      },
      {
        name: 'RealPage',
        description: 'Real estate technology platform — AI-powered revenue management, market analytics, AI-optimized pricing, and operational intelligence for multifamily and commercial properties',
        category: 'Revenue Management & Analytics',
        useCases: [
          'AI revenue management — monitoring dynamic pricing recommendations and their impact on occupancy and revenue',
          'Market analytics AI — tracking market rent prediction accuracy and competitive positioning',
          'AI-driven marketing optimization — monitoring lead scoring accuracy and marketing spend efficiency',
          'Operational AI — tracking automated workflow effectiveness for turn management and resident services',
        ],
        monitoringPoints: [
          'AI pricing recommendation accuracy — suggested vs achieved rents and occupancy impact',
          'Market rent AI prediction accuracy by submarket and property class',
          'Lead scoring AI — conversion rate by score tier and cost per acquisition',
          'Turn management AI — predicted vs actual turn time and cost by unit type',
          'Revenue management model update frequency and data freshness',
          'API integration health with property management systems and data sources',
        ],
        bizObsValue: 'Link AI revenue management pricing decisions directly to occupancy rates and effective rent growth — proving whether AI-driven pricing outperforms static pricing strategies across the portfolio.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates AI pricing decisions with leasing velocity and occupancy trends, detecting when AI recommendations underperform market conditions' },
          { capability: 'Business Analytics', detail: 'Compares AI-priced properties against control groups on revenue growth, occupancy, and resident retention metrics' },
          { capability: 'Digital Experience Monitoring', detail: 'Tracks prospect and resident digital experiences across listing sites, application portals, and resident apps' },
          { capability: 'Application Security', detail: 'Monitors data security across tenant PII handling, payment processing, and third-party integrations' },
        ],
      },
      {
        name: 'MRI Software',
        description: 'Real estate solutions platform — AI-enhanced accounting, lease management, investment modeling, and space management for commercial and residential portfolios',
        category: 'Investment & Lease Management',
        useCases: [
          'AI investment modeling — monitoring portfolio optimization recommendations and return predictions',
          'AI lease abstraction — tracking automated lease document processing accuracy and extraction quality',
          'Space management AI — monitoring occupancy prediction models and space utilization optimization',
          'AI financial forecasting — validating budget predictions and variance analysis automation accuracy',
        ],
        monitoringPoints: [
          'Investment AI — portfolio return prediction accuracy and recommendation quality scores',
          'AI lease abstraction accuracy — extraction completeness rate and error rate by clause type',
          'Space utilization AI — occupancy prediction accuracy and optimization recommendation acceptance rate',
          'Financial forecast AI accuracy — budget vs actual variance by property and line item',
          'Accounting automation accuracy and journal entry processing success rates',
          'Integration health between MRI, building systems, and third-party data providers',
        ],
        bizObsValue: 'Measure how AI-driven investment modeling and lease management translate to actual portfolio returns — proving whether AI optimization decisions deliver alpha over manual portfolio management.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects AI investment model drift — alerting when portfolio optimization recommendations diverge from actual market performance patterns' },
          { capability: 'Business Analytics', detail: 'Calculates AI investment modeling ROI — comparing AI-recommended allocation strategies against benchmark returns across the portfolio' },
          { capability: 'OpenPipeline', detail: 'Unifies financial, operational, and market data from multiple sources into a single real estate investment observability view' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures platform reliability during month-end closes, portfolio revaluations, and large-scale lease processing cycles' },
        ],
      },
    ],
    journeys: [
      { name: 'Property Search & Viewing', configFile: 'config-realestate-property-search-viewing.json' },
      { name: 'Mortgage Application', configFile: 'config-realestate-mortgage-application.json' },
    ],
    kpis: ['Search-to-viewing conversion', 'Mortgage approval time', 'Lease completion rate', 'Portal uptime'],
  },
  {
    id: 'wealth',
    icon: '💰',
    industry: 'Wealth Management & Investment',
    color: '#006064',
    tagline: 'AI-powered investing — accurate, compliant, observable',
    description: 'Wealth managers and investment firms are deploying AI for portfolio optimization, robo-advisory, AI-driven risk modeling, automated compliance monitoring, and personalized client engagement. When AI portfolio recommendations underperform, robo-advisors give unsuitable advice, or AI risk models fail during market stress, assets under management erode and regulatory penalties follow. Dynatrace ensures AI-driven wealth management is accurate, compliant, and value-generating.',
    painPoints: [
      'AI portfolio optimization models underperforming benchmarks without detection, quietly eroding client AUM',
      'Robo-advisory AI providing unsuitable recommendations that breach suitability obligations',
      'AI risk models failing during extreme market conditions when they are needed most',
      'AI-driven compliance monitoring missing regulatory breaches, creating exposure to FCA/SEC enforcement',
      'Client-facing AI tools (chatbots, portfolio visualizations) providing inconsistent or incorrect information',
    ],
    roiPoints: [
      'Monitor AI portfolio optimization — ensuring AI-driven strategies deliver consistent alpha vs benchmarks across market conditions',
      'Track robo-advisory suitability accuracy — maintaining 99.9%+ recommendation compliance while reducing advisor workload by 40%',
      'Validate AI risk models — ensuring VaR and stress test predictions remain accurate within 5% during volatility events',
      'Measure AI compliance monitoring effectiveness — detecting 95%+ of regulatory breaches automatically, reducing compliance costs by 30%',
      'Ensure AI client engagement tools deliver accurate, personalized information — improving client retention by 20%',
    ],
    integrations: [
      {
        name: 'SS&C Technologies',
        description: 'Investment management platform — AI-powered portfolio accounting, fund administration, transfer agency, and compliance with machine learning analytics across institutional and retail wealth',
        category: 'Investment Operations',
        useCases: [
          'AI portfolio analytics accuracy — monitoring automated performance attribution and benchmark comparison',
          'AI fund administration — tracking automated NAV calculation accuracy and exception detection',
          'AI compliance screening — monitoring automated trade surveillance and regulatory breach detection rates',
          'AI transfer agency automation — tracking automated transaction processing accuracy for ISA/pension transfers',
        ],
        monitoringPoints: [
          'AI performance attribution accuracy — tracked vs reported returns discrepancy rates',
          'Automated NAV calculation accuracy and AI exception detection precision',
          'AI compliance screening — true positive rate, false positive rate, and detection latency',
          'Transfer processing automation accuracy and straight-through processing rates',
          'Trading platform latency percentiles during market volatility events',
        ],
        bizObsValue: 'Connect SS&C AI portfolio analytics to actual investment outcomes — proving whether AI-optimized fund operations deliver better risk-adjusted returns and lower operational costs.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects anomalies in AI NAV calculations and performance attribution, alerting before valuation errors compound across fund reporting cycles' },
          { capability: 'Business Analytics', detail: 'Measures AI compliance screening effectiveness — comparing automated detection rates against manual review to quantify cost savings and accuracy improvement' },
          { capability: 'Synthetic Monitoring', detail: 'Continuously tests trading platform and client portal latency to ensure sub-second response during peak market hours' },
          { capability: 'Application Security', detail: 'Monitors security across investment data pipelines, client PII handling, and regulatory reporting infrastructure' },
        ],
      },
      {
        name: 'FNZ',
        description: 'Wealth management platform — AI-enhanced custody, platform administration, wrap services, robo-advisory infrastructure, and digital client engagement tools',
        category: 'Wealth Platform & Advisory',
        useCases: [
          'Robo-advisory AI suitability — monitoring automated investment recommendations against client risk profiles and regulatory requirements',
          'AI portfolio rebalancing — tracking automated rebalancing decisions and their impact on client portfolio performance',
          'Digital client onboarding AI — monitoring automated KYC/AML verification accuracy and processing speed',
          'AI client engagement — tracking personalized communication effectiveness and digital self-service adoption',
        ],
        monitoringPoints: [
          'Robo-advisory recommendation suitability scores and regulatory compliance rates',
          'AI rebalancing decision accuracy — trigger point optimization and performance impact',
          'Digital onboarding AI — KYC verification accuracy, false rejection rates, and processing times',
          'Client portal AI — personalization accuracy, engagement metrics, and self-service completion rates',
          'Platform availability during ISA season peaks and tax year end processing',
          'Custody reconciliation accuracy and settlement processing rates',
        ],
        bizObsValue: 'Link robo-advisory AI recommendations directly to client portfolio performance and retention — proving whether AI-driven advice delivers better outcomes than traditional advisory models.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates robo-advisory AI recommendations with client portfolio performance, detecting when AI advice begins underperforming suitability or return expectations' },
          { capability: 'Digital Experience Monitoring', detail: 'Tracks client digital journeys across portal and mobile app, measuring how AI personalization impacts engagement and self-service adoption' },
          { capability: 'Business Analytics', detail: 'Compares AI-advised vs traditionally-advised client cohorts on AUM growth, retention, and satisfaction — quantifying the robo-advisory business case' },
          { capability: 'OpenPipeline', detail: 'Unifies trading, custody, compliance, and client interaction telemetry into a single wealth management observability view' },
        ],
      },
      {
        name: 'Broadridge',
        description: 'Financial technology platform — AI-powered trade processing, investor communications, data analytics, regulatory reporting, and AI-driven proxy voting and governance',
        category: 'Trade Processing & Communications',
        useCases: [
          'AI trade processing optimization — monitoring automated trade matching, settlement, and exception handling accuracy',
          'AI investor communications — tracking personalized report generation accuracy and delivery reliability',
          'AI regulatory reporting — monitoring automated EMIR, MiFID, and Dodd-Frank reporting accuracy and timeliness',
          'AI proxy voting — tracking automated voting recommendation accuracy and governance analytics',
        ],
        monitoringPoints: [
          'AI trade matching accuracy — straight-through processing rates and exception categorization',
          'Investor communication AI — report personalization accuracy and delivery success rates',
          'Regulatory reporting AI — submission accuracy, timeliness, and reconciliation break rates',
          'Proxy voting AI — recommendation accuracy and client instruction processing reliability',
          'Trade processing latency and throughput during settlement cycles',
          'Data analytics pipeline freshness and accuracy across client portfolios',
        ],
        bizObsValue: 'Measure how AI trade processing and communication automation impacts operational efficiency — proving that AI-driven post-trade operations reduce costs while improving accuracy and regulatory compliance.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects AI trade processing anomalies — alerting when matching accuracy degrades or exception rates spike before settlement deadlines' },
          { capability: 'Business Analytics', detail: 'Calculates AI operations ROI — comparing AI-automated vs manual processing on cost per trade, error rates, and settlement efficiency' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures platform scalability during peak settlement cycles, quarter-end reporting, and regulatory filing deadlines' },
          { capability: 'OpenPipeline', detail: 'Ingests trade lifecycle, communication delivery, and regulatory filing telemetry into a unified post-trade observability platform' },
        ],
      },
    ],
    journeys: [
      { name: 'Account Opening', configFile: 'config-financial-services-account-opening.json' },
      { name: 'ISA Transfer', configFile: 'config-financial-services-isa-transfer.json' },
    ],
    kpis: ['Account opening time', 'Transfer completion rate', 'Client portal uptime', 'Trading latency'],
  },
  {
    id: 'legal',
    icon: '⚖️',
    industry: 'Legal Services',
    color: '#795548',
    tagline: 'AI-powered legal practice — faster, fairer, observable',
    description: 'Law firms and legal departments are deploying AI for contract analysis, AI-powered legal research, eDiscovery automation, predictive case outcomes, and AI-assisted document drafting. When AI misses critical contract clauses, gives incorrect legal research results, or eDiscovery AI fails to surface relevant documents, the consequences range from lost cases to malpractice claims. Dynatrace ensures AI-driven legal technology is accurate, reliable, and audit-ready.',
    painPoints: [
      'AI contract analysis missing critical clauses or obligations, creating liability exposure for clients',
      'AI legal research returning incorrect or outdated precedents without confidence indicators',
      'eDiscovery AI failing to surface relevant documents, risking spoliation sanctions and case outcomes',
      'AI document drafting generating language that contradicts firm precedent or contains hallucinated references',
      'AI predictive analytics overstating case success probability, leading to poor strategy decisions',
    ],
    roiPoints: [
      'Monitor AI contract analysis accuracy — ensuring 99%+ clause detection rate, reducing contract review time by 60%',
      'Track AI legal research precision — delivering relevant precedents with 95%+ accuracy, saving 10+ hours per matter',
      'Validate eDiscovery AI recall rates — achieving 98%+ relevant document identification while reducing review costs by 50%',
      'Ensure AI document drafting quality — maintaining 99%+ consistency with firm precedent and zero hallucinated citations',
      'Measure AI case prediction accuracy — calibrating win probability models to within 10% of actual outcomes for strategic planning',
    ],
    integrations: [
      {
        name: 'iManage',
        description: 'Document and knowledge management platform — AI-powered document classification, knowledge search, security, and collaboration with embedded machine learning for legal content',
        category: 'Document & Knowledge Management',
        useCases: [
          'AI document classification accuracy — monitoring automated filing, tagging, and categorization precision',
          'AI knowledge search relevance — tracking search result quality and attorney adoption rates',
          'AI security classification — monitoring automated ethical wall enforcement and conflict detection',
          'AI content recommendations — tracking relevance of automated precedent and template suggestions',
        ],
        monitoringPoints: [
          'AI document classification accuracy — correct categorization rate by practice area and document type',
          'Knowledge search AI — result relevance scores, click-through rates, and search refinement frequency',
          'AI ethical wall enforcement — conflict detection accuracy and false positive rates',
          'Content recommendation relevance — attorney acceptance rate of AI-suggested templates and precedents',
          'Document management system availability and response times during peak filing periods',
        ],
        bizObsValue: 'Connect iManage AI knowledge search accuracy to attorney productivity metrics — proving whether AI-powered document management reduces research time and improves work product quality.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects AI classification anomalies — alerting when document categorization accuracy degrades or ethical wall enforcement shows gaps' },
          { capability: 'Digital Experience Monitoring', detail: 'Tracks attorney interactions with AI search and recommendation features, measuring adoption and productivity impact' },
          { capability: 'Business Analytics', detail: 'Measures AI knowledge management ROI — comparing attorney research time and work product quality with vs without AI assistance' },
          { capability: 'Application Security', detail: 'Monitors document access patterns and ethical wall enforcement to prevent unauthorized access to privileged content' },
        ],
      },
      {
        name: 'Relativity',
        description: 'eDiscovery and compliance platform — AI-powered document review, Technology Assisted Review (TAR), legal hold management, and AI-driven case analytics',
        category: 'eDiscovery & Compliance',
        useCases: [
          'AI document review (TAR) accuracy — monitoring precision and recall of AI-assisted relevance coding',
          'AI concept clustering — tracking document grouping quality and reviewer agreement with AI classifications',
          'AI privilege detection — monitoring automated attorney-client privilege identification accuracy',
          'AI case analytics — tracking predictive coding model stability and review progress forecasting accuracy',
        ],
        monitoringPoints: [
          'TAR precision and recall rates — AI relevance coding accuracy vs human reviewer gold standard',
          'AI concept clustering quality metrics — cluster coherence and reviewer override rates',
          'Privilege detection AI accuracy — true positive rate and miss rate for privileged documents',
          'Review progress AI forecasting — predicted vs actual review completion timelines',
          'Platform processing throughput — document ingestion, indexing, and analytics speed',
          'AI model training stability — consistency of predictions across review sessions',
        ],
        bizObsValue: 'Link Relativity AI review accuracy directly to case outcomes and review costs — proving whether AI-assisted eDiscovery delivers defensible results at a fraction of manual review cost.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates AI review model stability with recall metrics, detecting when TAR models begin drifting from acceptable accuracy thresholds' },
          { capability: 'Business Analytics', detail: 'Calculates AI eDiscovery ROI — comparing cost per document reviewed, accuracy rates, and timeline adherence for AI-assisted vs manual review' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures platform performance during large matter processing — monitoring ingestion throughput and AI model training completion times' },
          { capability: 'OpenPipeline', detail: 'Ingests eDiscovery workflow telemetry from ingestion through production, providing end-to-end matter observability' },
        ],
      },
      {
        name: 'Clio',
        description: 'Legal practice management platform — AI-powered case management, billing, client intake, document automation, and AI-assisted time recording for law firms',
        category: 'Practice Management',
        useCases: [
          'AI time recording accuracy — monitoring automated time capture and billing narrative generation quality',
          'AI client intake — tracking automated lead scoring, conflict checking, and onboarding efficiency',
          'AI document automation — monitoring template assembly accuracy and clause selection for client documents',
          'AI matter analytics — tracking case outcome predictions and workflow optimization recommendations',
        ],
        monitoringPoints: [
          'AI time capture accuracy — automated vs manually recorded time comparison and billing narrative quality',
          'Client intake AI — lead scoring accuracy, conflict detection precision, and onboarding completion rates',
          'Document automation AI — template assembly accuracy and client review revision frequency',
          'Matter analytics AI — case outcome prediction accuracy and workflow recommendation effectiveness',
          'Billing system accuracy — automated pre-bill generation and write-down prediction',
          'Practice management platform response times and availability during billing cycles',
        ],
        bizObsValue: 'Measure how AI time capture and practice management automation impacts firm revenue per lawyer — proving that AI-driven productivity tools increase realization rates and reduce billing leakage.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects AI time recording anomalies — alerting when automated capture accuracy drops or billing narratives diverge from firm style standards' },
          { capability: 'Business Analytics', detail: 'Measures AI practice management ROI — comparing utilization rates, realization rates, and revenue per lawyer for AI-enabled vs traditional workflows' },
          { capability: 'Real User Monitoring', detail: 'Tracks attorney interactions with AI billing, intake, and document tools to measure adoption and identify friction points' },
          { capability: 'Synthetic Monitoring', detail: 'Continuously tests client portal, billing system, and document management availability during critical business hours' },
        ],
      },
    ],
    journeys: [
      { name: 'Case Intake', configFile: 'config-legal-case-intake.json' },
      { name: 'Document Review', configFile: 'config-legal-document-review.json' },
    ],
    kpis: ['Case intake time', 'Document review throughput', 'Billing accuracy', 'DMS availability'],
  },
  {
    id: 'media-entertainment',
    icon: '🎬',
    industry: 'Media & Entertainment',
    color: '#9c27b0',
    tagline: 'AI-powered content — personalized, profitable, observable',
    description: 'Media and entertainment companies are deploying AI for content recommendation engines, AI-driven ad targeting, automated content moderation, AI-powered streaming optimization, and generative AI for content creation. When recommendation AI fails to engage viewers, ad targeting AI wastes spend, or streaming AI delivers poor quality, subscriber growth stalls and ad revenue drops. Dynatrace ensures AI-driven media experiences are engaging, monetizable, and quality-assured.',
    painPoints: [
      'AI recommendation engines failing to personalize — increasing content discovery friction and subscriber churn',
      'AI ad targeting delivering irrelevant ads, wasting advertiser spend and reducing CPMs',
      'Automated content moderation AI missing policy violations or over-censoring legitimate content',
      'AI streaming optimization delivering poor adaptive bitrate decisions, causing buffering and quality drops',
      'Generative AI content tools producing outputs that violate brand guidelines or copyright requirements',
    ],
    roiPoints: [
      'Monitor AI recommendation engine engagement — driving 30%+ increase in content consumption and 25% reduction in subscriber churn',
      'Track AI ad targeting precision — improving CPMs by 40% through better audience matching and viewability',
      'Validate content moderation AI accuracy — achieving 99%+ policy violation detection while keeping false positive rates below 2%',
      'Ensure AI streaming optimization — maintaining 4K quality for 95%+ of sessions with intelligent bitrate adaptation',
      'Measure generative AI content quality — ensuring 98%+ brand compliance and zero copyright violations in AI-generated assets',
    ],
    integrations: [
      {
        name: 'AWS Media Services',
        description: 'Cloud media platform — AI-powered transcoding (MediaConvert), live streaming (MediaLive), content delivery, personalization (MediaTailor), and ML-driven content analysis (Rekognition)',
        category: 'Streaming & Content Delivery',
        useCases: [
          'AI adaptive bitrate optimization — monitoring streaming quality decisions and viewer experience impact',
          'AI content analysis (Rekognition) — tracking automated tagging, moderation, and metadata enrichment accuracy',
          'AI-powered ad insertion (MediaTailor) — monitoring SSAI targeting accuracy and ad delivery quality',
          'AI transcoding optimization — tracking quality-per-bit efficiency and encoding decision accuracy',
        ],
        monitoringPoints: [
          'Adaptive bitrate AI — quality score distribution, buffering rates, and start-up time by device and region',
          'Content analysis AI — tagging accuracy, moderation precision/recall, and metadata enrichment completeness',
          'SSAI ad insertion — targeting accuracy, fill rates, ad completion rates, and creative rendering quality',
          'Transcoding AI — quality-per-bit efficiency scores and encoding time vs quality trade-offs',
          'CDN hit rates and origin shield effectiveness across global edge locations',
        ],
        bizObsValue: 'Connect AWS streaming AI optimization directly to viewer engagement metrics — proving whether AI bitrate adaptation and content personalization reduce churn while improving content consumption hours.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates AI bitrate decisions with viewer engagement metrics, detecting when streaming quality optimization degrades viewing experience in specific regions or devices' },
          { capability: 'Real User Monitoring', detail: 'Tracks actual viewer experience across all devices and platforms — buffering, quality switches, and engagement patterns in real time' },
          { capability: 'Business Analytics', detail: 'Measures AI streaming optimization ROI — comparing viewer retention and engagement for AI-optimized vs baseline streaming quality' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Monitors media processing pipeline health from ingestion through CDN delivery, ensuring AI optimization has reliable infrastructure' },
        ],
      },
      {
        name: 'Adobe Experience Platform',
        description: 'Customer experience platform — AI-powered audience segmentation (Sensei), content personalization, cross-channel campaign orchestration, and real-time customer profiles for media companies',
        category: 'Audience & Personalization',
        useCases: [
          'AI audience segmentation (Sensei) — monitoring automated audience classification accuracy and targeting effectiveness',
          'AI content recommendation — tracking personalized content suggestions and their impact on consumption',
          'AI campaign optimization — monitoring automated A/B testing decisions and cross-channel campaign performance',
          'Real-time personalization AI — tracking segment qualification speed and profile enrichment accuracy',
        ],
        monitoringPoints: [
          'Sensei AI segmentation accuracy — audience classification quality and targeting relevance scores',
          'Content recommendation AI — click-through rates, consumption lift, and session extension metrics',
          'Campaign AI optimization — automated decision accuracy and conversion rate improvement vs control',
          'Real-time profile AI — segment qualification latency, enrichment accuracy, and identity resolution quality',
          'Cross-channel orchestration — message delivery rates, timing optimization, and engagement by channel',
          'Data ingestion pipeline freshness and profile update propagation latency',
        ],
        bizObsValue: 'Link Adobe Sensei AI personalization decisions directly to subscriber engagement and ad revenue outcomes — proving whether AI-driven audience targeting delivers measurably better CPMs and retention.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects AI personalization anomalies — alerting when recommendation relevance drops or audience segmentation quality degrades across channels' },
          { capability: 'Business Analytics', detail: 'Measures AI personalization ROI — comparing engagement, retention, and ad revenue for AI-personalized vs non-personalized audience segments' },
          { capability: 'Digital Experience Monitoring', detail: 'Tracks viewer and subscriber journeys across web, mobile, and connected TV platforms to measure AI personalization impact' },
          { capability: 'OpenPipeline', detail: 'Ingests audience interaction, content consumption, and campaign performance data into unified media observability' },
        ],
      },
      {
        name: 'Brightcove',
        description: 'Video technology platform — AI-powered video hosting, live streaming, monetization, analytics, and intelligent content management for media publishers and enterprises',
        category: 'Video Platform & Monetization',
        useCases: [
          'AI video analytics — monitoring automated content performance prediction and audience engagement scoring',
          'AI monetization optimization — tracking ad yield optimization decisions and revenue per stream',
          'AI content management — monitoring automated video tagging, chaptering, and metadata generation',
          'AI quality of experience — tracking intelligent player behavior and adaptive delivery optimization',
        ],
        monitoringPoints: [
          'Video analytics AI — content performance prediction accuracy and engagement score reliability',
          'AI monetization — ad yield optimization effectiveness, fill rate improvement, and revenue per viewer hour',
          'Content AI — auto-tagging accuracy, chapter detection precision, and thumbnail selection quality',
          'Player AI — adaptive delivery decision quality, rebuffering rates, and viewer-perceived quality scores',
          'Live streaming reliability — encoder health, stream stability, and failover effectiveness',
          'API integration health with CMS, ad servers, and analytics platforms',
        ],
        bizObsValue: 'Measure how AI video analytics and monetization optimization impact revenue per viewer hour — proving that AI-driven video platform decisions increase both engagement and ad yield.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates AI monetization decisions with actual ad revenue metrics, detecting when yield optimization algorithms underperform or ad quality degrades' },
          { capability: 'Real User Monitoring', detail: 'Tracks video player performance and viewer quality of experience across all devices, networks, and geographic regions' },
          { capability: 'Business Analytics', detail: 'Calculates AI video platform ROI — comparing revenue per viewer hour, engagement time, and completion rates for AI-optimized vs standard delivery' },
          { capability: 'Synthetic Monitoring', detail: 'Continuously tests video playback startup, ad insertion, and content delivery from global locations to ensure consistent viewer experience' },
        ],
      },
    ],
    journeys: [
      { name: 'Content Discovery', configFile: 'config-media-content-discovery.json' },
      { name: 'Subscription Management', configFile: 'config-media-subscription-management.json' },
    ],
    kpis: ['Content engagement rate', 'Subscriber churn rate', 'Ad CPM / fill rate', 'Stream quality score'],
  },
  {
    id: 'agriculture',
    icon: '🌾',
    industry: 'Agriculture & AgriTech',
    color: '#4caf50',
    tagline: 'AI-powered precision farming — sustainable, efficient, observable',
    description: 'AgriTech companies are deploying AI for crop yield prediction, precision irrigation, livestock health monitoring, autonomous farming equipment, and supply chain traceability. When AI irrigation models waste water, yield predictions mislead planting decisions, or livestock AI misses disease indicators, farm profitability and food security suffer. Dynatrace ensures AI-driven agriculture is data-accurate, resource-efficient, and yield-maximizing.',
    painPoints: [
      'AI crop yield predictions diverging from actual harvests, causing mispriced forward contracts',
      'Precision irrigation AI over- or under-watering zones, wasting resources and reducing yields',
      'Livestock health AI missing early disease indicators, leading to herd-wide outbreaks',
      'Autonomous equipment AI making suboptimal field routing decisions, increasing fuel costs',
      'Supply chain traceability AI losing provenance data, breaking compliance certifications',
    ],
    roiPoints: [
      'Monitor AI crop yield prediction accuracy — achieving <5% variance to optimize planting and pricing decisions',
      'Track precision irrigation AI — reducing water usage by 30% while maintaining or improving yields',
      'Validate livestock health AI — detecting 95%+ of early disease indicators, reducing veterinary costs by 40%',
      'Ensure autonomous equipment AI efficiency — reducing fuel and labour costs by 25% through optimal routing',
      'Measure AI traceability completeness — maintaining 100% chain-of-custody for premium certifications',
    ],
    integrations: [
      {
        name: 'John Deere Operations Center',
        description: 'Precision agriculture platform — AI-powered field analytics, equipment telematics, agronomic modeling, and autonomous operation management across farming operations',
        category: 'Precision Agriculture',
        useCases: [
          'AI agronomic modeling — monitoring crop health predictions and variable-rate application accuracy',
          'Autonomous equipment AI — tracking navigation decisions, field coverage efficiency, and safety systems',
          'Equipment predictive maintenance — monitoring AI failure predictions for tractors, combines, and planters',
          'Yield mapping AI — tracking harvest prediction accuracy against actual field performance',
        ],
        monitoringPoints: [
          'AI crop prescription accuracy — recommended vs actual application rates by zone',
          'Autonomous equipment navigation accuracy and field coverage efficiency metrics',
          'Predictive maintenance model accuracy — predicted vs actual equipment failures',
          'Yield prediction AI accuracy — forecast vs actual bushels per acre by field',
          'IoT sensor data pipeline health from field equipment to cloud analytics',
        ],
        bizObsValue: 'Connect John Deere AI prescriptions directly to actual yield outcomes — proving whether precision agriculture AI delivers measurably better returns per acre than traditional farming methods.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates AI agronomic recommendations with actual yield outcomes, detecting when prescription models drift from optimal performance' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Monitors IoT data pipelines from field sensors and equipment telematics through cloud analytics platforms' },
          { capability: 'Business Analytics', detail: 'Measures precision agriculture ROI — comparing AI-optimized fields against control fields on yield, input costs, and profitability' },
          { capability: 'OpenPipeline', detail: 'Unifies equipment telemetry, weather data, and agronomic sensor readings into a single farm observability platform' },
        ],
      },
      {
        name: 'Trimble Agriculture',
        description: 'Farm management platform — AI-powered guidance, water management, crop monitoring, and connected farm operations with precision positioning',
        category: 'Farm Management & Guidance',
        useCases: [
          'AI water management — monitoring irrigation scheduling optimization and soil moisture predictions',
          'Connected crop monitoring — tracking AI-driven pest and disease detection accuracy from satellite and drone imagery',
          'Precision guidance AI — monitoring autonomous steering accuracy and overlap reduction',
          'Farm data analytics AI — validating profitability predictions and input optimization recommendations',
        ],
        monitoringPoints: [
          'Irrigation AI scheduling accuracy — predicted vs actual soil moisture by zone',
          'Pest/disease detection AI accuracy — true positive rates from imagery analysis',
          'Guidance system precision — overlap percentage and area coverage efficiency',
          'Farm profitability AI prediction accuracy by field and crop type',
          'Satellite/drone imagery processing pipeline latency and quality metrics',
        ],
        bizObsValue: 'Link Trimble AI water management and crop monitoring decisions to actual resource savings and yield outcomes — proving precision farming AI reduces costs while improving sustainability metrics.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects irrigation AI anomalies — alerting when watering recommendations deviate from soil sensor reality' },
          { capability: 'Business Analytics', detail: 'Calculates water savings and yield improvement from AI-optimized irrigation vs traditional scheduling' },
          { capability: 'Digital Experience Monitoring', detail: 'Tracks farmer interactions with mobile farm management apps to ensure AI insights are accessible and actionable' },
          { capability: 'OpenPipeline', detail: 'Ingests satellite imagery, drone surveys, and ground sensor data into unified crop analytics' },
        ],
      },
      {
        name: 'Climate FieldView',
        description: 'Digital agriculture platform — AI-powered seed selection, field health monitoring, nitrogen management, and yield analytics with machine learning insights',
        category: 'Data-Driven Agronomy',
        useCases: [
          'AI seed selection optimization — monitoring variety recommendation accuracy by soil type and conditions',
          'Nitrogen management AI — tracking variable-rate application recommendations and efficiency outcomes',
          'Field health AI — monitoring satellite-based crop stress detection accuracy and alerting',
          'Yield analytics AI — validating harvest predictions and year-over-year improvement trends',
        ],
        monitoringPoints: [
          'Seed selection AI recommendation accuracy — yield performance by recommended vs alternative varieties',
          'Nitrogen AI — application recommendation accuracy and environmental compliance metrics',
          'Crop stress detection AI — sensitivity and specificity from satellite imagery analysis',
          'Yield model accuracy — seasonal prediction refinement tracking and final accuracy',
          'Data ingestion reliability from connected equipment and weather stations',
        ],
        bizObsValue: 'Measure how AI-driven seed and nitrogen recommendations translate to actual yield and profitability improvements — proving that data-driven agronomy delivers measurable ROI per acre.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates AI nitrogen recommendations with actual uptake efficiency and yield, detecting when models underperform for specific soil conditions' },
          { capability: 'Business Analytics', detail: 'Compares AI-recommended seed and input strategies against farmer baselines to quantify per-acre ROI improvement' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures platform reliability during critical planting and harvest windows when AI decisions are most time-sensitive' },
          { capability: 'Application Security', detail: 'Monitors farm data privacy and cross-operation anonymization to maintain grower trust in data sharing' },
        ],
      },
    ],
    journeys: [
      { name: 'Crop Planning', configFile: 'config-agriculture-crop-planning.json' },
      { name: 'Harvest Operations', configFile: 'config-agriculture-harvest-operations.json' },
    ],
    kpis: ['Yield per acre', 'Water usage efficiency', 'Input cost per bushel', 'Equipment uptime'],
  },
  {
    id: 'construction',
    icon: '🏗️',
    industry: 'Construction & Engineering',
    color: '#ff9800',
    tagline: 'AI-powered project delivery — on time, on budget, observable',
    description: 'Construction firms are deploying AI for project cost estimation, BIM clash detection, safety hazard prediction, schedule optimization, and autonomous site equipment. When AI estimates miss the mark, safety AI fails to flag hazards, or schedule AI creates unrealistic timelines, projects overrun and lives are at risk. Dynatrace ensures AI-powered construction is safe, predictable, and profit-protecting.',
    painPoints: [
      'AI cost estimation models producing inaccurate bids, leading to margin erosion on fixed-price contracts',
      'BIM AI clash detection missing critical conflicts, causing expensive rework during construction',
      'Safety AI failing to predict hazardous conditions, increasing incident rates on sites',
      'AI schedule optimization creating unrealistic timelines that compound delays across trades',
      'Autonomous equipment AI making unsafe decisions in dynamic site environments',
    ],
    roiPoints: [
      'Monitor AI cost estimation accuracy — achieving <5% variance on bids to protect margins across the portfolio',
      'Track BIM AI clash detection recall — catching 98%+ of conflicts pre-construction, reducing rework costs by 40%',
      'Validate safety AI prediction — reducing recordable incidents by 50% through proactive hazard identification',
      'Ensure AI schedule optimization accuracy — improving on-time delivery from 60% to 85% across projects',
      'Measure autonomous equipment AI safety — maintaining zero AI-related safety incidents on active sites',
    ],
    integrations: [
      {
        name: 'Autodesk Construction Cloud',
        description: 'Construction management platform — AI-powered BIM coordination, project management, cost management, and quality with machine learning insights across the project lifecycle',
        category: 'BIM & Project Management',
        useCases: [
          'AI clash detection — monitoring automated BIM conflict identification accuracy across disciplines',
          'AI risk identification — tracking automated project risk scoring and mitigation recommendation quality',
          'Construction AI analytics — monitoring predictive quality issue detection and RFI prediction accuracy',
          'AI design optimization — tracking generative design recommendation effectiveness',
        ],
        monitoringPoints: [
          'BIM clash detection AI — precision, recall, and priority classification accuracy',
          'Project risk AI — risk score accuracy and mitigation recommendation acceptance rates',
          'Quality issue prediction AI — detected vs actual issues by trade and phase',
          'RFI prediction accuracy — anticipated vs actual information requests by project',
          'Model coordination platform performance and sync reliability across project teams',
        ],
        bizObsValue: 'Connect Autodesk AI clash detection and risk predictions to actual rework costs and schedule impacts — proving BIM AI prevents expensive construction-phase problems.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects BIM AI model degradation — alerting when clash detection accuracy drops or risk scoring patterns shift unexpectedly' },
          { capability: 'Business Analytics', detail: 'Measures AI construction management ROI — comparing rework costs and schedule adherence for AI-assisted vs traditional projects' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures BIM platform performance during large model coordination sessions and deadline-critical project phases' },
          { capability: 'Digital Experience Monitoring', detail: 'Tracks field team interactions with mobile construction apps to ensure AI insights reach workers on site' },
        ],
      },
      {
        name: 'Procore',
        description: 'Construction management platform — AI-enhanced project management, financial controls, quality and safety, and workforce management for general contractors and owners',
        category: 'Project & Financial Controls',
        useCases: [
          'AI change order prediction — monitoring automated cost impact estimation and approval workflow optimization',
          'Safety AI — tracking automated incident prediction and hazard identification from site data',
          'AI financial forecasting — monitoring cost-to-complete predictions and variance analysis automation',
          'Workforce AI — tracking labour productivity predictions and resource optimization recommendations',
        ],
        monitoringPoints: [
          'Change order AI — prediction accuracy of cost impacts and processing time optimization',
          'Safety incident AI — prediction sensitivity, false alarm rate, and leading indicator accuracy',
          'Financial forecast AI — cost-to-complete prediction accuracy by project phase',
          'Labour productivity AI — predicted vs actual output by trade and project type',
          'Platform reliability during month-end cost reporting and project milestone reviews',
        ],
        bizObsValue: 'Link Procore AI safety predictions and financial forecasting to actual project outcomes — proving AI tools reduce incident rates and improve cost predictability.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates safety AI predictions with actual site conditions, detecting when hazard models need recalibration for specific project types' },
          { capability: 'Business Analytics', detail: 'Compares AI-predicted vs actual project costs and safety metrics, building the data-driven case for construction AI investment' },
          { capability: 'Real User Monitoring', detail: 'Tracks field user experiences on mobile devices across varying site conditions and connectivity' },
          { capability: 'Synthetic Monitoring', detail: 'Tests project management platform availability and API responsiveness during critical project milestones' },
        ],
      },
      {
        name: 'Oracle Aconex',
        description: 'Construction and engineering document management — AI-powered document control, correspondence management, process automation, and project analytics for large capital projects',
        category: 'Document Control & Compliance',
        useCases: [
          'AI document classification — monitoring automated categorization, tagging, and routing accuracy',
          'AI correspondence analytics — tracking automated risk identification in project communications',
          'Process automation AI — monitoring automated approval workflow optimization and bottleneck prediction',
          'Contract analytics AI — tracking automated clause extraction and obligation identification accuracy',
        ],
        monitoringPoints: [
          'Document classification AI accuracy — correct categorization rate by document type',
          'Correspondence AI — risk identification accuracy and flagging reliability',
          'Workflow automation AI — bottleneck prediction accuracy and process optimization effectiveness',
          'Contract AI — clause extraction completeness and obligation tracking accuracy',
          'Document management system availability and search performance for large project repositories',
        ],
        bizObsValue: 'Measure how AI document control reduces administrative overhead and improves compliance on capital projects — proving automated document management delivers faster decisions with fewer errors.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects AI document classification drift — alerting when routing accuracy degrades for specific document types or project phases' },
          { capability: 'Business Analytics', detail: 'Calculates AI document management ROI — comparing processing time, error rates, and compliance scores for AI-assisted vs manual workflows' },
          { capability: 'OpenPipeline', detail: 'Unifies document management, project communication, and contract analytics into a single capital project observability view' },
          { capability: 'Application Security', detail: 'Monitors document access controls and data classification compliance across multi-stakeholder project teams' },
        ],
      },
    ],
    journeys: [
      { name: 'Project Bidding', configFile: 'config-construction-project-bidding.json' },
      { name: 'Site Safety Monitoring', configFile: 'config-construction-safety-monitoring.json' },
    ],
    kpis: ['Bid accuracy', 'Safety incident rate', 'Schedule adherence', 'Cost variance %'],
  },
  {
    id: 'defence',
    icon: '🛡️',
    industry: 'Defence & Aerospace',
    color: '#37474f',
    tagline: 'AI-powered mission readiness — secure, resilient, observable',
    description: 'Defence and aerospace organizations are deploying AI for mission planning, predictive fleet maintenance, autonomous systems, cybersecurity threat detection, and logistics optimization. When AI mission planning makes flawed assessments, maintenance AI misses critical failures, or cyber AI generates excessive false alerts, operational readiness degrades. Dynatrace ensures AI-powered defence systems are reliable, secure, and mission-ready.',
    painPoints: [
      'AI mission planning systems producing assessments based on stale or incomplete intelligence data',
      'Predictive maintenance AI for aircraft and vehicles generating excessive false alarms, reducing fleet availability',
      'Autonomous system AI making unexpected decisions in complex operational environments',
      'AI cybersecurity systems overwhelmed with false positives, masking real threats',
      'AI logistics optimization failing during surge operations, causing critical supply chain gaps',
    ],
    roiPoints: [
      'Monitor AI mission planning data quality — ensuring near-real-time intelligence integration and assessment reliability',
      'Track predictive maintenance AI — improving fleet availability to 90%+ while reducing maintenance costs by 30%',
      'Validate autonomous system AI decision quality — ensuring safety and reliability in all operational conditions',
      'Measure AI cyber detection accuracy — achieving 99%+ threat detection with <1% false positive rate',
      'Ensure AI logistics optimization — maintaining 95%+ supply chain fulfilment during surge operations',
    ],
    integrations: [
      {
        name: 'Palantir Foundry',
        description: 'Data operations platform — AI-powered intelligence analysis, operational planning, logistics optimization, and decision support for defence and national security',
        category: 'Intelligence & Decision Support',
        useCases: [
          'AI intelligence fusion — monitoring data integration accuracy and analysis recommendation quality',
          'Operational planning AI — tracking scenario analysis accuracy and course of action recommendations',
          'AI logistics optimization — monitoring supply chain prediction accuracy during operations',
          'Sensor fusion AI — tracking multi-source data correlation accuracy and alert quality',
        ],
        monitoringPoints: [
          'Intelligence AI — data fusion completeness and analysis accuracy metrics',
          'Planning AI — scenario prediction accuracy and recommendation acceptance rates',
          'Logistics AI — supply forecast accuracy and fulfilment optimization effectiveness',
          'Sensor fusion — multi-source correlation accuracy and latency',
          'Platform availability and performance under classified network constraints',
        ],
        bizObsValue: 'Connect Palantir AI intelligence analysis to operational decision outcomes — proving whether AI-assisted planning delivers faster, more accurate decisions than traditional methods.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Monitors AI analysis pipeline health, detecting when data fusion quality degrades or intelligence recommendations lose accuracy' },
          { capability: 'Business Analytics', detail: 'Measures AI decision support effectiveness — comparing AI-assisted vs traditional planning speed and accuracy' },
          { capability: 'Application Security', detail: 'Ensures classified environment security posture and monitors for anomalous access patterns across security domains' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Monitors platform performance across secure cloud environments with strict availability requirements' },
        ],
      },
      {
        name: 'Lockheed Martin Digital',
        description: 'Aerospace and defence digital platform — AI-powered predictive maintenance, digital twins, autonomous systems management, and production optimization',
        category: 'Fleet & Production',
        useCases: [
          'AI predictive maintenance for aircraft — monitoring fleet health predictions and maintenance scheduling',
          'Digital twin AI — tracking simulation accuracy for aircraft, satellite, and system performance',
          'Production AI — monitoring manufacturing line optimization and quality prediction accuracy',
          'Autonomous system AI — tracking decision quality and safety boundary adherence',
        ],
        monitoringPoints: [
          'Fleet maintenance AI — failure prediction accuracy by aircraft type and system',
          'Digital twin fidelity — simulation vs actual performance deviation metrics',
          'Production AI — quality prediction accuracy and throughput optimization effectiveness',
          'Autonomous system AI — decision quality metrics and safety boundary compliance',
          'Secure data pipeline reliability across classified and unclassified networks',
        ],
        bizObsValue: 'Link fleet predictive maintenance AI to actual aircraft availability and mission readiness rates — proving AI-driven maintenance increases operational tempo while reducing lifecycle costs.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects fleet AI prediction drift — alerting when maintenance models lose accuracy for specific aircraft variants or operating conditions' },
          { capability: 'OpenPipeline', detail: 'Ingests fleet telemetry, production data, and digital twin outputs into unified defence observability' },
          { capability: 'Business Analytics', detail: 'Measures AI maintenance ROI — comparing fleet availability and maintenance costs for AI-predicted vs scheduled maintenance regimes' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures platform reliability across hybrid classified/commercial cloud environments' },
        ],
      },
      {
        name: 'BAE Systems Digital Intelligence',
        description: 'Defence technology platform — AI-powered cybersecurity, electronic warfare, communications intelligence, and secure information systems',
        category: 'Cyber & Intelligence',
        useCases: [
          'AI cybersecurity threat detection — monitoring automated threat identification accuracy across networks',
          'Electronic warfare AI — tracking signal analysis accuracy and countermeasure recommendation quality',
          'Communications intelligence AI — monitoring automated intercept analysis and classification accuracy',
          'Secure systems AI — tracking anomaly detection accuracy in classified network environments',
        ],
        monitoringPoints: [
          'Cyber AI — threat detection rate, false positive rate, and mean time to detection',
          'EW AI — signal classification accuracy and countermeasure recommendation effectiveness',
          'COMINT AI — intercept classification accuracy and priority ranking quality',
          'Network anomaly detection — sensitivity, specificity, and alert actionability scores',
          'Secure platform availability and performance across operational security levels',
        ],
        bizObsValue: 'Measure AI cybersecurity detection effectiveness against actual threat outcomes — proving whether AI-driven security delivers faster detection and response while reducing analyst fatigue.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates AI threat detections with confirmed incidents, automatically tuning detection thresholds to minimize false positives' },
          { capability: 'Application Security', detail: 'Provides defence-grade application security monitoring across classification boundaries' },
          { capability: 'Business Analytics', detail: 'Measures AI security operations ROI — comparing detection rates, investigation time, and analyst workload with vs without AI assistance' },
          { capability: 'OpenPipeline', detail: 'Ingests security telemetry from multiple classification domains into unified threat observability' },
        ],
      },
    ],
    journeys: [
      { name: 'Mission Planning', configFile: 'config-defence-mission-planning.json' },
      { name: 'Fleet Maintenance', configFile: 'config-defence-fleet-maintenance.json' },
    ],
    kpis: ['Fleet availability rate', 'Mission readiness %', 'Threat detection rate', 'Maintenance cost per flight hour'],
  },
  {
    id: 'mining',
    icon: '⛏️',
    industry: 'Mining & Natural Resources',
    color: '#6d4c41',
    tagline: 'AI-powered extraction — safer, leaner, observable',
    description: 'Mining companies are deploying AI for exploration targeting, autonomous haul trucks, safety prediction, environmental monitoring, and ore grade optimization. When exploration AI targets wrong deposits, autonomous trucks make unsafe decisions, or grade prediction AI misclassifies ore, billions in capital are wasted. Dynatrace ensures AI-driven mining operations are safe, efficient, and value-maximizing.',
    painPoints: [
      'AI exploration models targeting uneconomic deposits, wasting drilling capital',
      'Autonomous haul truck AI making suboptimal routing decisions, reducing throughput',
      'Safety prediction AI missing critical hazard indicators in underground operations',
      'Ore grade prediction AI misclassifying material, sending waste to processing or ore to dumps',
      'Environmental monitoring AI failing to detect compliance breaches before regulatory action',
    ],
    roiPoints: [
      'Monitor AI exploration targeting accuracy — improving drill-hit rates by 40%, saving $10M+ in exploration spend',
      'Track autonomous haul AI efficiency — increasing fleet throughput by 20% while reducing fuel consumption by 15%',
      'Validate safety AI prediction — reducing lost-time injuries by 60% through proactive hazard identification',
      'Ensure ore grade AI accuracy — achieving <3% grade prediction variance, optimizing processing plant feed',
      'Measure environmental AI compliance — maintaining 100% regulatory compliance with predictive breach detection',
    ],
    integrations: [
      {
        name: 'Caterpillar MineStar',
        description: 'Mining technology platform — AI-powered fleet management, autonomous haulage, terrain management, and safety monitoring for surface and underground operations',
        category: 'Autonomous Mining Operations',
        useCases: [
          'Autonomous haulage AI — monitoring fleet routing decisions, safety compliance, and throughput optimization',
          'AI terrain management — tracking automated drill planning accuracy and blast optimization',
          'Fleet health AI — monitoring predictive maintenance accuracy for haul trucks, excavators, and drills',
          'Safety AI — tracking proximity detection and automated hazard response system effectiveness',
        ],
        monitoringPoints: [
          'Autonomous haul AI — tonnes moved per hour, fuel efficiency, and safety incident rate',
          'Terrain AI — drill pattern accuracy and blast fragmentation prediction vs actuals',
          'Fleet maintenance AI — failure prediction accuracy and unplanned downtime reduction',
          'Safety system AI — proximity alert accuracy and automated response effectiveness',
          'Fleet telematics data pipeline reliability and real-time command latency',
        ],
        bizObsValue: 'Connect autonomous haulage AI decisions to actual mining productivity — proving whether AI fleet management delivers lower cost per tonne while maintaining zero-harm safety targets.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects autonomous fleet AI anomalies — alerting when routing efficiency degrades or safety system response patterns deviate from baselines' },
          { capability: 'Business Analytics', detail: 'Measures autonomous mining ROI — comparing cost per tonne, throughput, and safety metrics for AI vs manually operated fleets' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Monitors mine-to-cloud data pipelines ensuring real-time fleet command reliability in remote locations' },
          { capability: 'OpenPipeline', detail: 'Unifies fleet telematics, safety systems, and production data into a single mining observability platform' },
        ],
      },
      {
        name: 'Hexagon Mining',
        description: 'Mining technology platform — AI-powered mine planning, fleet management, safety, and production optimization with digital twin simulation',
        category: 'Mine Planning & Safety',
        useCases: [
          'AI mine planning — monitoring long-range plan optimization and block model accuracy',
          'Safety AI — tracking collision avoidance system accuracy and operator fatigue detection',
          'Production AI — monitoring loader-hauler matching optimization and dig-face assessment',
          'Digital twin AI — tracking mine simulation accuracy against actual production outcomes',
        ],
        monitoringPoints: [
          'Mine plan AI — optimization quality scores and reconciliation accuracy vs geological model',
          'Safety AI — collision avoidance intervention rate and fatigue detection accuracy',
          'Production AI — equipment matching efficiency and dig-face assessment accuracy',
          'Digital twin — simulation vs actual production variance by pit and stage',
          'Underground positioning system accuracy and communication network reliability',
        ],
        bizObsValue: 'Link mine planning AI optimization to actual production outcomes — proving whether AI-driven planning delivers better extraction rates with lower dilution and loss.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates mine plan AI predictions with actual production reconciliation, detecting plan vs actual drift early' },
          { capability: 'Business Analytics', detail: 'Compares AI-optimized mine plans against traditional approaches on extraction rate, dilution, and cost metrics' },
          { capability: 'Digital Experience Monitoring', detail: 'Tracks operator interaction with AI-guided systems to measure adoption and workflow efficiency' },
          { capability: 'Application Security', detail: 'Monitors OT/IT convergence security in mining control systems and safety-critical networks' },
        ],
      },
      {
        name: 'OSIsoft PI (AVEVA)',
        description: 'Operational data management — AI-powered process analytics, environmental monitoring, energy optimization, and real-time data historian for mining and resources',
        category: 'Process Analytics & Environmental',
        useCases: [
          'AI process optimization — monitoring mineral processing plant efficiency predictions and control recommendations',
          'Environmental AI — tracking automated emissions monitoring and compliance prediction accuracy',
          'Energy optimization AI — monitoring power consumption predictions and cost reduction for processing plants',
          'Ore grade prediction AI — tracking real-time grade estimation accuracy through the processing chain',
        ],
        monitoringPoints: [
          'Processing AI — recovery rate prediction accuracy and reagent optimization effectiveness',
          'Environmental AI — emissions prediction accuracy and compliance risk scoring',
          'Energy AI — power consumption prediction accuracy and cost reduction metrics',
          'Grade AI — real-time ore grade estimation accuracy through crush-grind-float circuits',
          'Data historian ingestion rate, compression efficiency, and query performance',
        ],
        bizObsValue: 'Measure how AI process optimization translates to actual recovery rates and cost per ounce — proving that data-driven processing delivers measurable extraction efficiency improvements.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects process AI degradation — alerting when recovery predictions drift from actual plant performance before material losses accumulate' },
          { capability: 'OpenPipeline', detail: 'Ingests historian data, environmental sensors, and energy metrics into unified processing plant observability' },
          { capability: 'Business Analytics', detail: 'Calculates process AI ROI — comparing recovery rates, reagent costs, and energy consumption for AI-optimized vs manual operation' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures data pipeline reliability from plant floor sensors through edge computing to cloud analytics' },
        ],
      },
    ],
    journeys: [
      { name: 'Exploration Targeting', configFile: 'config-mining-exploration-targeting.json' },
      { name: 'Production Optimization', configFile: 'config-mining-production-optimization.json' },
    ],
    kpis: ['Cost per tonne', 'Recovery rate %', 'Fleet availability', 'Safety incident rate'],
  },
  {
    id: 'shipping',
    icon: '🚢',
    industry: 'Shipping & Maritime',
    color: '#0277bd',
    tagline: 'AI-navigated supply chains — vessel to port, observable',
    description: 'Maritime companies deploy AI for route optimization, port scheduling, predictive vessel maintenance, container tracking, and weather-risk modeling. When route AI selects suboptimal paths, port scheduling AI creates congestion, or maintenance AI fails to predict engine failures, the cost per TEU skyrockets. Dynatrace ensures every AI decision on the water is measured and optimized.',
    painPoints: [
      'Route optimization AI selecting suboptimal paths, increasing fuel costs and voyage duration',
      'Port scheduling AI creating berth congestion, leading to costly vessel waiting times',
      'Predictive maintenance AI missing critical engine and hull degradation signals',
      'Container tracking AI losing visibility of high-value cargo in transit',
      'Weather-risk AI underestimating sea-state severity, creating safety and schedule risks',
    ],
    roiPoints: [
      'Monitor route AI accuracy — reducing fuel consumption by 12% and voyage duration by 8% through optimal path selection',
      'Track port scheduling AI — cutting vessel waiting times by 40%, saving $50K+ per day in demurrage costs',
      'Validate maintenance AI predictions — reducing unplanned drydock events by 55%, saving $2M+ per vessel annually',
      'Ensure container tracking AI coverage — maintaining 99.9% visibility for high-value and hazmat cargo',
      'Measure weather-risk AI accuracy — achieving 95% sea-state prediction accuracy for voyage safety planning',
    ],
    integrations: [
      {
        name: 'Maersk Digital',
        description: 'Maritime logistics platform — AI-powered vessel scheduling, container tracking, port optimization, and end-to-end supply chain visibility',
        category: 'Global Shipping Operations',
        useCases: [
          'Vessel scheduling AI — monitoring route optimization decisions and ETA prediction accuracy across global fleet',
          'Container tracking AI — validating real-time location prediction and exception detection for millions of containers',
          'Port optimization AI — tracking berth allocation efficiency and crane scheduling accuracy',
          'Supply chain AI — monitoring end-to-end transit time predictions and customs clearance automation',
        ],
        monitoringPoints: [
          'Route AI — fuel savings per voyage, ETA accuracy, and weather-adjusted path optimization quality',
          'Container AI — tracking accuracy %, exception detection rate, and false positive ratio',
          'Port AI — berth utilization rate, crane idle time, and vessel turnaround speed',
          'Supply chain AI — transit time prediction accuracy and customs delay prediction',
          'API gateway performance for customer-facing booking and tracking systems',
        ],
        bizObsValue: 'Connect route optimization AI to actual fuel costs and delivery reliability — proving whether AI-driven logistics delivers lower cost per TEU with better schedule adherence.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects route AI degradation — alerting when ETA prediction accuracy drops or fuel efficiency declines across fleet segments' },
          { capability: 'Business Analytics', detail: 'Measures logistics AI ROI — comparing cost per TEU, transit times, and customer satisfaction for AI-optimized vs standard routes' },
          { capability: 'Digital Experience Monitoring', detail: 'Monitors shipper-facing tracking portals ensuring real-time container visibility meets customer SLAs' },
          { capability: 'OpenPipeline', detail: 'Unifies vessel telemetry, container IoT, port systems, and weather data into maritime observability' },
        ],
      },
      {
        name: 'Wärtsilä Voyage',
        description: 'Maritime technology platform — AI-powered voyage optimization, fleet performance management, autonomous ship navigation, and emissions monitoring',
        category: 'Voyage Optimization & Autonomy',
        useCases: [
          'Voyage optimization AI — monitoring fuel-optimal routing considering weather, currents, and schedule constraints',
          'Fleet performance AI — tracking vessel efficiency degradation and hull fouling prediction accuracy',
          'Autonomous navigation AI — monitoring decision-making quality in assisted and autonomous vessel modes',
          'Emissions AI — tracking CII rating prediction accuracy and regulatory compliance optimization',
        ],
        monitoringPoints: [
          'Voyage AI — fuel savings per voyage, schedule adherence, and safety margin compliance',
          'Fleet performance AI — hull fouling prediction accuracy and efficiency degradation rate detection',
          'Autonomy AI — navigation decision quality scores and safety intervention frequency',
          'Emissions AI — CII prediction accuracy and regulatory compliance trajectory',
          'Shore-to-ship connectivity reliability and data synchronization latency',
        ],
        bizObsValue: 'Link voyage optimization AI to actual fleet fuel costs and emissions compliance — proving that AI routing delivers measurable cost savings while maintaining IMO regulatory targets.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates voyage AI recommendations with actual vessel performance, detecting when optimization quality degrades' },
          { capability: 'Business Analytics', detail: 'Compares AI-optimized voyages against master-planned routes on fuel cost, time, and emissions metrics' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Monitors vessel-to-cloud data pipelines ensuring reliable connectivity for real-time optimization updates' },
          { capability: 'Application Security', detail: 'Secures maritime OT systems and vessel navigation networks against cyber threats' },
        ],
      },
      {
        name: 'MarineTraffic',
        description: 'Maritime intelligence platform — AI-powered vessel tracking, port analytics, trade flow analysis, and maritime risk assessment using AIS and satellite data',
        category: 'Maritime Intelligence & Risk',
        useCases: [
          'Vessel tracking AI — monitoring AIS data quality and position prediction accuracy for global fleet',
          'Port analytics AI — tracking congestion predictions and berth availability forecasting',
          'Trade flow AI — monitoring commodity movement pattern detection and sanctions compliance',
          'Maritime risk AI — tracking collision risk assessment and dark vessel detection accuracy',
        ],
        monitoringPoints: [
          'Tracking AI — position prediction accuracy and AIS data gap detection rate',
          'Port AI — congestion prediction accuracy and berth availability forecast reliability',
          'Trade flow AI — pattern detection accuracy and sanctions screening false positive rate',
          'Risk AI — collision risk assessment accuracy and dark vessel detection sensitivity',
          'AIS data ingestion throughput and satellite imagery processing pipeline performance',
        ],
        bizObsValue: 'Measure maritime intelligence AI accuracy against actual vessel movements and port events — proving that AI-driven risk assessment and trade intelligence adds measurable value to decision-making.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects intelligence AI accuracy degradation — alerting when vessel predictions or risk assessments deviate from actual outcomes' },
          { capability: 'OpenPipeline', detail: 'Ingests AIS streams, satellite data, and port information into unified maritime intelligence observability' },
          { capability: 'Business Analytics', detail: 'Quantifies intelligence AI value — measuring decision quality improvement for port operators and commodity traders' },
          { capability: 'Digital Experience Monitoring', detail: 'Ensures maritime intelligence dashboards and API services meet user response time expectations' },
        ],
      },
    ],
    journeys: [
      { name: 'Voyage Optimization', configFile: 'config-shipping-voyage-optimization.json' },
      { name: 'Port Scheduling', configFile: 'config-shipping-port-scheduling.json' },
    ],
    kpis: ['Cost per TEU', 'Vessel utilization %', 'ETA accuracy', 'Emissions per voyage'],
  },
  {
    id: 'fashion',
    icon: '👗',
    industry: 'Fashion & Luxury',
    color: '#ad1457',
    tagline: 'AI-styled commerce — from runway to revenue, observable',
    description: 'Fashion and luxury brands deploy AI for trend forecasting, personalized styling, inventory optimization, virtual try-on, and counterfeit detection. When trend AI forecasts the wrong styles, personalization AI alienates high-value clients, or inventory AI causes stockouts on hero products, brand equity and margins erode rapidly. Dynatrace ensures AI-powered fashion delivers both creativity and commercial performance.',
    painPoints: [
      'Trend forecasting AI predicting wrong styles, leading to excess inventory and deep markdowns',
      'Personalization AI recommending mismatched styles, degrading luxury client experience',
      'Inventory AI failing to predict demand for hero products, causing stockouts during peak seasons',
      'Virtual try-on AI providing inaccurate fit recommendations, increasing return rates',
      'Counterfeit detection AI producing excessive false positives, blocking legitimate products',
    ],
    roiPoints: [
      'Monitor trend AI accuracy — reducing excess inventory by 30% and markdowns by $5M+ per season',
      'Track personalization AI relevance — increasing average order value by 25% for styled recommendations',
      'Validate inventory AI predictions — achieving 95% in-stock rate on hero products during peak events',
      'Ensure virtual try-on AI accuracy — reducing fit-related returns by 40%, saving $3M+ annually',
      'Measure counterfeit AI precision — achieving 99% detection accuracy with <1% legitimate product blocks',
    ],
    integrations: [
      {
        name: 'Centric PLM',
        description: 'Product lifecycle management — AI-powered trend analytics, style development, material sourcing, and collection planning for fashion brands',
        category: 'Product Lifecycle & Trend Intelligence',
        useCases: [
          'Trend AI — monitoring style prediction accuracy against actual sell-through performance',
          'Collection planning AI — tracking assortment optimization and category mix recommendations',
          'Material sourcing AI — monitoring supplier risk scoring and sustainable sourcing compliance',
          'Design collaboration AI — tracking concept-to-market timeline optimization effectiveness',
        ],
        monitoringPoints: [
          'Trend AI — style prediction accuracy, sell-through rates, and markdown frequency per predicted trend',
          'Collection AI — assortment optimization quality and category revenue contribution',
          'Sourcing AI — supplier risk score accuracy and sustainable material compliance rate',
          'Collaboration AI — design iteration speed and concept-to-shelf timeline reduction',
          'PLM system performance and integration reliability with design and sourcing tools',
        ],
        bizObsValue: 'Connect trend prediction AI to actual sell-through performance — proving whether AI-driven collection planning reduces markdowns while increasing full-price sell-through rates.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects trend AI prediction drift — alerting when style forecasts diverge from actual consumer demand patterns' },
          { capability: 'Business Analytics', detail: 'Measures collection planning AI ROI — comparing sell-through, margins, and markdown rates for AI-planned vs traditionally planned collections' },
          { capability: 'Digital Experience Monitoring', detail: 'Monitors designer and merchandiser interaction with AI recommendation tools to measure workflow adoption' },
          { capability: 'OpenPipeline', detail: 'Unifies trend signals, sales data, and social sentiment into fashion intelligence observability' },
        ],
      },
      {
        name: 'Infor CloudSuite Fashion',
        description: 'Fashion ERP platform — AI-powered demand planning, inventory optimization, omnichannel fulfillment, and size/color allocation for fashion retail',
        category: 'Demand Planning & Inventory',
        useCases: [
          'Demand planning AI — monitoring seasonal forecast accuracy across categories, sizes, and colors',
          'Size/color allocation AI — tracking allocation optimization to minimize stockouts and overstocks',
          'Omnichannel AI — monitoring cross-channel inventory balancing and ship-from-store optimization',
          'Markdown optimization AI — tracking price reduction timing and depth for maximum margin recovery',
        ],
        monitoringPoints: [
          'Demand AI — forecast accuracy by category, size curve prediction, and color mix optimization',
          'Allocation AI — stockout rate, overstock rate, and sell-through by size/color/store',
          'Omnichannel AI — cross-channel fill rate, ship-from-store efficiency, and customer wait time',
          'Markdown AI — margin recovery rate, markdown timing effectiveness, and clearance velocity',
          'ERP transaction throughput and integration reliability with POS and e-commerce systems',
        ],
        bizObsValue: 'Link demand planning AI to actual inventory performance — proving that AI allocation reduces size-curve mismatches, minimizes deadstock, and improves gross margins across channels.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates demand AI forecasts with actual sales patterns, detecting allocation errors before they cascade to stockouts or overstocks' },
          { capability: 'Business Analytics', detail: 'Compares AI-optimized allocation against traditional buying on sell-through, margin, and markdown metrics by store cluster' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Monitors ERP-to-store data synchronization ensuring real-time inventory accuracy across all channels' },
          { capability: 'Application Security', detail: 'Protects customer data and payment systems across fashion e-commerce and in-store POS platforms' },
        ],
      },
      {
        name: 'Farfetch Platform Solutions',
        description: 'Luxury e-commerce platform — AI-powered personal styling, virtual try-on, boutique marketplace management, and luxury customer experience',
        category: 'Luxury Digital Experience',
        useCases: [
          'Personal styling AI — monitoring recommendation relevance and client style profile accuracy for luxury shoppers',
          'Virtual try-on AI — tracking size and fit prediction accuracy for luxury apparel and accessories',
          'Marketplace AI — monitoring boutique inventory curation and product discovery optimization',
          'Client intelligence AI — tracking lifetime value prediction and VIP re-engagement trigger accuracy',
        ],
        monitoringPoints: [
          'Styling AI — recommendation click-through rate, conversion rate per styled look, and return rate',
          'Try-on AI — fit prediction accuracy, size recommendation acceptance, and post-purchase satisfaction',
          'Marketplace AI — product discovery effectiveness, boutique performance scoring, and curation quality',
          'Client AI — LTV prediction accuracy, re-engagement trigger effectiveness, and VIP retention rate',
          'Luxury e-commerce platform performance, visual search latency, and checkout conversion funnel',
        ],
        bizObsValue: 'Measure personal styling AI impact on luxury client lifetime value — proving that AI-curated experiences drive higher spend per client while maintaining brand exclusivity.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects styling AI quality degradation — alerting when recommendation relevance or conversion rates decline for luxury client segments' },
          { capability: 'Digital Experience Monitoring', detail: 'Ensures flawless luxury shopping experiences with sub-second page loads and seamless virtual try-on rendering' },
          { capability: 'Business Analytics', detail: 'Quantifies styling AI value — comparing client LTV, average order value, and repeat purchase rates for AI-styled vs self-browsing shoppers' },
          { capability: 'OpenPipeline', detail: 'Unifies client behavior, styling interactions, and purchase data into luxury commerce observability' },
        ],
      },
    ],
    journeys: [
      { name: 'Trend Forecasting', configFile: 'config-fashion-trend-forecasting.json' },
      { name: 'Personal Styling', configFile: 'config-fashion-personal-styling.json' },
    ],
    kpis: ['Sell-through rate %', 'Return rate', 'Average order value', 'Full-price sell %'],
  },
  {
    id: 'sports',
    icon: '🏟️',
    industry: 'Sports & Live Events',
    color: '#2e7d32',
    tagline: 'AI-powered fan experiences — every event, observable',
    description: 'Sports and live entertainment companies deploy AI for dynamic ticket pricing, fan engagement personalization, athlete performance analytics, broadcasting optimization, and venue operations. When pricing AI undervalues premium events, fan recommendation AI alienates audiences, or broadcasting AI selects wrong camera angles, revenue and viewer satisfaction plummet. Dynatrace ensures every AI touchpoint across the fan journey is measured.',
    painPoints: [
      'Dynamic pricing AI undervaluing premium events or overpricing low-demand matches, leaving revenue on the table',
      'Fan engagement AI delivering irrelevant content, reducing app engagement and merchandise conversion',
      'Athlete performance AI missing injury risk signals, leading to preventable absences',
      'Broadcasting AI selecting suboptimal camera angles and replays, degrading viewer experience',
      'Venue operations AI miscalculating crowd flow, creating safety bottlenecks and concession queues',
    ],
    roiPoints: [
      'Monitor pricing AI accuracy — increasing ticket revenue by 18% through optimal dynamic pricing per event segment',
      'Track fan engagement AI — boosting in-app purchase conversion by 35% with personalized content and offers',
      'Validate athlete AI predictions — reducing injury-related absences by 30% with proactive load management',
      'Ensure broadcasting AI quality — increasing viewer retention by 25% through AI-optimized production decisions',
      'Measure venue AI efficiency — reducing average concession wait time by 45% and improving crowd safety scores',
    ],
    integrations: [
      {
        name: 'Sportradar',
        description: 'Sports data platform — AI-powered odds calculation, live statistics, integrity monitoring, and athlete performance analytics for sports organizations and media partners',
        category: 'Sports Data & Analytics',
        useCases: [
          'Live data AI — monitoring real-time statistics accuracy and latency for in-play products',
          'Integrity AI — tracking match-fixing pattern detection accuracy and alert quality',
          'Performance AI — monitoring athlete workload optimization and injury risk prediction',
          'Odds AI — tracking pre-match and in-play odds accuracy against actual outcomes',
        ],
        monitoringPoints: [
          'Data AI — live statistics latency, accuracy rate, and coverage completeness per sport',
          'Integrity AI — suspicious pattern detection rate, false positive ratio, and investigation conversion',
          'Performance AI — injury prediction accuracy and load management recommendation adherence',
          'Odds AI — margin accuracy, in-play adjustment speed, and outcome prediction calibration',
          'Data feed reliability, API throughput, and real-time streaming performance under peak loads',
        ],
        bizObsValue: 'Connect sports data AI accuracy to downstream product quality — proving that reliable AI-powered statistics drive better fan engagement, more accurate odds, and actionable integrity monitoring.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects data AI quality degradation — alerting when statistics latency or accuracy drops during live events before downstream products are impacted' },
          { capability: 'Business Analytics', detail: 'Measures data AI value — correlating statistics accuracy with fan engagement metrics, odds quality, and integrity detection rates' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Monitors real-time data processing infrastructure ensuring sub-second delivery during peak concurrent events' },
          { capability: 'OpenPipeline', detail: 'Unifies live match data, integrity signals, and performance metrics into sports analytics observability' },
        ],
      },
      {
        name: 'Ticketmaster',
        description: 'Ticketing platform — AI-powered dynamic pricing, fan recommendation, event discovery, and venue capacity management for live entertainment',
        category: 'Ticketing & Fan Commerce',
        useCases: [
          'Dynamic pricing AI — monitoring price optimization decisions across events, sections, and time windows',
          'Fan recommendation AI — tracking event discovery accuracy and personalized offer conversion',
          'Demand forecasting AI — monitoring sell-through predictions and inventory release timing',
          'Anti-bot AI — tracking automated purchase detection accuracy and legitimate fan protection',
        ],
        monitoringPoints: [
          'Pricing AI — revenue per event vs forecast, section yield optimization, and price elasticity accuracy',
          'Recommendation AI — event discovery click-through, conversion rate, and fan satisfaction',
          'Demand AI — sell-through prediction accuracy and optimal on-sale timing effectiveness',
          'Anti-bot AI — bot detection rate, false positive rate, and legitimate fan conversion impact',
          'Ticketing platform performance during high-demand on-sales with millions of concurrent users',
        ],
        bizObsValue: 'Link dynamic pricing AI to actual event revenue — proving that AI-optimized pricing maximizes yield while maintaining fan satisfaction and sell-through velocity.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates pricing AI decisions with actual sell-through patterns, detecting underpricing or overpricing anomalies in real time' },
          { capability: 'Digital Experience Monitoring', detail: 'Ensures seamless fan purchase experience during high-demand on-sales with real-time performance visibility' },
          { capability: 'Business Analytics', detail: 'Compares AI-priced events against fixed-price benchmarks on total revenue, sell-through speed, and fan satisfaction' },
          { capability: 'Application Security', detail: 'Protects ticketing platforms from bot attacks and scalping while ensuring legitimate fan access' },
        ],
      },
      {
        name: 'SAP Sports One',
        description: 'Sports management platform — AI-powered athlete management, scouting analytics, team performance optimization, and commercial operations for professional sports organizations',
        category: 'Team Performance & Operations',
        useCases: [
          'Athlete management AI — monitoring training load optimization and recovery prediction accuracy',
          'Scouting AI — tracking talent identification accuracy and transfer value prediction',
          'Team performance AI — monitoring tactical analysis quality and opponent modeling effectiveness',
          'Commercial AI — tracking sponsorship valuation accuracy and fan segment revenue optimization',
        ],
        monitoringPoints: [
          'Athlete AI — load optimization adherence, recovery prediction accuracy, and injury prevention rate',
          'Scouting AI — talent identification success rate and transfer value prediction accuracy',
          'Performance AI — tactical recommendation quality and match outcome correlation',
          'Commercial AI — sponsorship ROI prediction accuracy and fan segment revenue attribution',
          'Platform integration reliability across medical, performance, and commercial data systems',
        ],
        bizObsValue: 'Measure athlete management AI impact on team performance — proving that AI-driven load management and scouting delivers better results while reducing injury-related financial losses.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects athlete risk AI pattern changes — alerting when injury prediction models show declining accuracy or bias' },
          { capability: 'Business Analytics', detail: 'Quantifies athlete AI ROI — measuring injury cost avoidance, transfer value accuracy, and team performance improvement' },
          { capability: 'OpenPipeline', detail: 'Ingests wearable sensor data, medical records, and performance metrics into unified athlete observability' },
          { capability: 'Digital Experience Monitoring', detail: 'Monitors coaching staff interaction with AI tools ensuring workflow adoption and decision support quality' },
        ],
      },
    ],
    journeys: [
      { name: 'Dynamic Ticket Pricing', configFile: 'config-sports-dynamic-pricing.json' },
      { name: 'Fan Engagement', configFile: 'config-sports-fan-engagement.json' },
    ],
    kpis: ['Revenue per event', 'Fan engagement rate', 'Ticket sell-through %', 'Viewer retention'],
  },
  {
    id: 'advertising',
    icon: '📢',
    industry: 'Advertising & MarTech',
    color: '#e65100',
    tagline: 'AI-optimized campaigns — every impression, observable',
    description: 'Advertising and marketing technology companies deploy AI for programmatic bidding, audience targeting, creative optimization, attribution modeling, and campaign automation. When bidding AI overspends on low-value impressions, targeting AI reaches wrong audiences, or attribution AI misallocates credit, marketing budgets burn with poor ROI. Dynatrace ensures AI-driven marketing spend is transparent, measurable, and optimized.',
    painPoints: [
      'Programmatic bidding AI overspending on low-quality inventory, wasting media budgets',
      'Audience targeting AI reaching wrong segments, reducing conversion rates and ROAS',
      'Creative optimization AI selecting underperforming ad variants, degrading campaign effectiveness',
      'Attribution AI misallocating conversion credit, leading to misinformed budget allocation',
      'Campaign automation AI triggering wrong messages at wrong times, causing brand damage',
    ],
    roiPoints: [
      'Monitor bidding AI accuracy — reducing wasted ad spend by 25% through quality-scored impression targeting',
      'Track audience AI precision — increasing ROAS by 40% with AI-refined segment targeting',
      'Validate creative AI decisions — boosting CTR by 30% through continuous creative performance optimization',
      'Ensure attribution AI accuracy — achieving 90% attribution confidence, enabling data-driven budget reallocation',
      'Measure automation AI timing — increasing campaign response rates by 35% with AI-optimized send timing',
    ],
    integrations: [
      {
        name: 'The Trade Desk',
        description: 'Programmatic advertising platform — AI-powered real-time bidding, audience targeting, campaign optimization, and measurement across digital channels',
        category: 'Programmatic Advertising',
        useCases: [
          'Real-time bidding AI — monitoring bid strategy optimization and inventory quality assessment',
          'Audience AI — tracking first-party data activation accuracy and lookalike modeling effectiveness',
          'Campaign optimization AI — monitoring budget pacing, frequency capping, and creative rotation decisions',
          'Measurement AI — tracking cross-channel attribution accuracy and incrementality measurement',
        ],
        monitoringPoints: [
          'Bidding AI — win rate, effective CPM, and inventory quality score correlation with conversions',
          'Audience AI — segment reach accuracy, lookalike performance, and audience overlap rates',
          'Optimization AI — budget pacing accuracy, frequency distribution, and creative fatigue detection',
          'Measurement AI — attribution accuracy, incrementality lift measurement, and cross-channel deduplication',
          'Bid request processing throughput, decisioning latency, and auction participation rate',
        ],
        bizObsValue: 'Connect programmatic bidding AI to actual conversion outcomes — proving whether AI-optimized media buying delivers better ROAS than manual approaches across channels.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects bidding AI performance shifts — alerting when ROAS degrades or inventory quality scoring becomes miscalibrated' },
          { capability: 'Business Analytics', detail: 'Measures programmatic AI ROI — comparing ROAS, conversion rates, and cost efficiency for AI-optimized vs manual campaigns' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Monitors bid processing infrastructure ensuring sub-100ms decisioning under millions of bid requests per second' },
          { capability: 'OpenPipeline', detail: 'Unifies bid data, conversion signals, and inventory quality metrics into advertising observability' },
        ],
      },
      {
        name: 'Google Marketing Platform',
        description: 'Enterprise marketing suite — AI-powered campaign management, audience insights, creative testing, and cross-channel measurement and analytics',
        category: 'Marketing Intelligence & Measurement',
        useCases: [
          'Smart Bidding AI — monitoring automated bid strategy effectiveness across search, display, and video',
          'Audience intelligence AI — tracking predictive audience creation and intent signal accuracy',
          'Creative AI — monitoring responsive ad optimization and dynamic creative performance',
          'Analytics AI — tracking predictive metrics accuracy and automated insight generation quality',
        ],
        monitoringPoints: [
          'Bidding AI — target CPA/ROAS achievement rate, conversion volume, and bidding signal quality',
          'Audience AI — predictive audience conversion rate and intent signal correlation',
          'Creative AI — responsive ad performance vs manual creative and dynamic assembly quality',
          'Analytics AI — predictive metric accuracy, insight quality scoring, and anomaly detection precision',
          'Tag management reliability, data collection completeness, and reporting pipeline freshness',
        ],
        bizObsValue: 'Link marketing AI automation to actual business outcomes — proving that AI-driven campaign management delivers better ROI than manual optimization approaches.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates marketing AI decisions with business outcomes, detecting when automated strategies underperform manual baselines' },
          { capability: 'Digital Experience Monitoring', detail: 'Monitors marketing tag performance ensuring data collection completeness without degrading user experience' },
          { capability: 'Business Analytics', detail: 'Compares AI campaign management against manual approaches on ROI, efficiency, and scalability metrics' },
          { capability: 'Application Security', detail: 'Monitors marketing data flows ensuring GDPR/CCPA compliance for audience targeting and measurement' },
        ],
      },
      {
        name: 'Salesforce Marketing Cloud',
        description: 'Marketing automation platform — AI-powered journey orchestration, personalization, send-time optimization, and predictive engagement for enterprise marketing',
        category: 'Marketing Automation & CRM',
        useCases: [
          'Journey AI — monitoring customer journey orchestration decisions and next-best-action accuracy',
          'Send-time optimization AI — tracking delivery timing accuracy across email, SMS, and push channels',
          'Predictive engagement AI — monitoring lead scoring accuracy and engagement probability predictions',
          'Content AI — tracking personalization engine recommendation relevance and dynamic content selection',
        ],
        monitoringPoints: [
          'Journey AI — journey completion rate, next-best-action conversion, and drop-off point identification',
          'Send-time AI — open rate improvement, optimal timing accuracy, and channel preference prediction',
          'Predictive AI — lead score accuracy, engagement prediction calibration, and conversion correlation',
          'Content AI — personalization click-through rate, content relevance score, and A/B test velocity',
          'Marketing automation execution reliability, API throughput, and data synchronization with CRM',
        ],
        bizObsValue: 'Measure marketing automation AI impact on customer lifecycle value — proving that AI-orchestrated journeys drive higher engagement and conversion than rule-based campaigns.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects automation AI degradation — alerting when journey completion rates or engagement predictions decline across campaigns' },
          { capability: 'Business Analytics', detail: 'Quantifies automation AI ROI — comparing customer LTV, engagement rates, and conversion costs for AI-orchestrated vs manual campaigns' },
          { capability: 'OpenPipeline', detail: 'Ingests campaign execution data, engagement signals, and CRM events into marketing automation observability' },
          { capability: 'Digital Experience Monitoring', detail: 'Ensures marketing content delivery performance across email rendering, landing pages, and mobile push' },
        ],
      },
    ],
    journeys: [
      { name: 'Programmatic Campaign', configFile: 'config-advertising-programmatic.json' },
      { name: 'Marketing Automation', configFile: 'config-advertising-automation.json' },
    ],
    kpis: ['ROAS', 'Click-through rate', 'Cost per acquisition', 'Attribution accuracy'],
  },
  {
    id: 'hr-workforce',
    icon: '👥',
    industry: 'HR & Workforce',
    color: '#4527a0',
    tagline: 'AI-powered talent — hire to retire, observable',
    description: 'HR and workforce management companies deploy AI for talent acquisition, employee engagement prediction, skills gap analysis, workforce planning, and attrition risk modeling. When hiring AI introduces bias, engagement AI misreads sentiment, or attrition AI fails to flag flight risks, organizations lose critical talent and face compliance exposure. Dynatrace ensures AI-driven people decisions are fair, accurate, and value-creating.',
    painPoints: [
      'Talent acquisition AI introducing unconscious bias, creating legal and diversity risks',
      'Engagement prediction AI misreading employee sentiment, missing early turnover signals',
      'Skills gap AI recommending wrong training investments, wasting L&D budgets',
      'Workforce planning AI miscalculating staffing needs, causing over- or under-hiring',
      'Attrition AI failing to identify high-performer flight risk until resignation notice',
    ],
    roiPoints: [
      'Monitor hiring AI fairness — maintaining bias-free scoring while reducing time-to-hire by 35% and cost-per-hire by 28%',
      'Track engagement AI accuracy — predicting attrition risk 6 months early, reducing regrettable turnover by 40%',
      'Validate skills AI recommendations — increasing L&D ROI by 45% through targeted capability building',
      'Ensure workforce planning AI accuracy — achieving ±5% headcount forecast accuracy, optimizing recruitment pipeline',
      'Measure attrition AI precision — identifying 80% of flight risks 90+ days before resignation, enabling retention intervention',
    ],
    integrations: [
      {
        name: 'Workday HCM',
        description: 'Human capital management platform — AI-powered talent management, workforce analytics, skills intelligence, and organizational planning',
        category: 'Human Capital Management',
        useCases: [
          'Skills intelligence AI — monitoring skills ontology accuracy and gap analysis recommendation quality',
          'Workforce planning AI — tracking headcount forecasting accuracy and organizational design optimization',
          'Talent marketplace AI — monitoring internal mobility matching and career path recommendation quality',
          'Compensation AI — tracking pay equity analysis accuracy and market-competitive offer recommendations',
        ],
        monitoringPoints: [
          'Skills AI — skills graph accuracy, gap identification precision, and training recommendation relevance',
          'Planning AI — headcount forecast accuracy, productivity predictions, and cost-per-FTE optimization',
          'Mobility AI — internal fill rate, role-match quality scores, and career path satisfaction ratings',
          'Compensation AI — pay equity variance detection, market alignment accuracy, and offer acceptance rates',
          'HCM platform reliability, workflow execution performance, and integration sync with payroll systems',
        ],
        bizObsValue: 'Connect workforce AI decisions to actual talent outcomes — proving that AI-driven skills intelligence and planning reduce hiring costs while improving internal mobility and retention.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects workforce AI drift — alerting when skills gap predictions or headcount forecasts diverge from actual organizational needs' },
          { capability: 'Business Analytics', detail: 'Measures people AI ROI — comparing hiring costs, internal fill rates, and retention metrics for AI-driven vs traditional HR approaches' },
          { capability: 'Digital Experience Monitoring', detail: 'Monitors employee self-service platforms ensuring seamless access to AI-powered career and benefits tools' },
          { capability: 'Application Security', detail: 'Protects sensitive employee data and ensures AI model compliance with employment law and data privacy regulations' },
        ],
      },
      {
        name: 'SAP SuccessFactors',
        description: 'Talent management suite — AI-powered recruiting, learning, performance management, and succession planning for enterprise HR',
        category: 'Talent Management & Development',
        useCases: [
          'Recruiting AI — monitoring candidate scoring accuracy, bias detection, and hiring manager satisfaction',
          'Learning AI — tracking personalized learning path recommendations and skill development effectiveness',
          'Performance AI — monitoring goal recommendation quality and calibration session insights',
          'Succession planning AI — tracking leadership pipeline prediction accuracy and readiness assessments',
        ],
        monitoringPoints: [
          'Recruiting AI — candidate score-to-hire correlation, bias audit metrics, and time-to-fill optimization',
          'Learning AI — skill acquisition rate, course completion impact, and competency gap closure',
          'Performance AI — goal alignment quality, calibration accuracy, and performance prediction vs actual',
          'Succession AI — leadership readiness prediction accuracy and pipeline strength scoring',
          'Talent management platform performance, integration reliability, and data freshness across modules',
        ],
        bizObsValue: 'Link talent AI to actual workforce outcomes — proving that AI-driven recruiting and development deliver better-quality hires, faster skill development, and stronger leadership pipelines.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates recruiting AI scores with actual hire performance, detecting when scoring models become miscalibrated' },
          { capability: 'Business Analytics', detail: 'Compares AI-driven talent processes against manual approaches on quality-of-hire, time-to-productivity, and retention metrics' },
          { capability: 'OpenPipeline', detail: 'Unifies recruiting, learning, performance, and succession data into talent management observability' },
          { capability: 'Digital Experience Monitoring', detail: 'Ensures candidate and employee experience quality across recruiting portals and learning platforms' },
        ],
      },
      {
        name: 'ServiceNow HRSD',
        description: 'HR service delivery platform — AI-powered employee service management, case routing, knowledge automation, and workplace experience optimization',
        category: 'HR Service Delivery',
        useCases: [
          'Case routing AI — monitoring automated case classification accuracy and SLA achievement rates',
          'Knowledge AI — tracking automated response accuracy and employee self-service deflection rates',
          'Employee experience AI — monitoring sentiment analysis accuracy and proactive service recommendations',
          'Workflow AI — tracking process automation effectiveness and exception handling quality',
        ],
        monitoringPoints: [
          'Routing AI — case classification accuracy, first-contact resolution, and SLA achievement rate',
          'Knowledge AI — self-service deflection rate, answer accuracy, and employee satisfaction',
          'Experience AI — sentiment prediction accuracy and proactive recommendation conversion',
          'Workflow AI — process automation success rate, exception handling, and cycle time reduction',
          'HRSD platform reliability, virtual agent performance, and integration with core HR systems',
        ],
        bizObsValue: 'Measure HR service AI impact on employee experience — proving that AI-driven case routing and knowledge automation deliver faster resolution while reducing HR operational costs.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects service AI quality issues — alerting when case routing accuracy or self-service resolution rates decline' },
          { capability: 'Business Analytics', detail: 'Quantifies HR service AI ROI — measuring cost per resolution, employee satisfaction, and deflection rates for AI vs manual handling' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Monitors HRSD platform performance ensuring reliable service delivery across global employee populations' },
          { capability: 'OpenPipeline', detail: 'Ingests HR service data, employee feedback, and workflow metrics into HR operations observability' },
        ],
      },
    ],
    journeys: [
      { name: 'Talent Acquisition', configFile: 'config-hr-talent-acquisition.json' },
      { name: 'Employee Engagement', configFile: 'config-hr-employee-engagement.json' },
    ],
    kpis: ['Time to hire', 'Retention rate %', 'Employee NPS', 'Cost per hire'],
  },
  {
    id: 'nonprofit',
    icon: '🤝',
    industry: 'Nonprofit & Public Health',
    color: '#00695c',
    tagline: 'AI for social impact — every program, observable',
    description: 'Nonprofit and public health organizations deploy AI for donor engagement, program outcome prediction, disease surveillance, resource allocation, and impact measurement. When donor AI mistargets campaigns, program AI misallocates resources, or surveillance AI misses outbreak signals, vulnerable populations suffer and donor trust erodes. Dynatrace ensures AI-driven social impact programs are transparent, effective, and measurable.',
    painPoints: [
      'Donor engagement AI mistarging campaigns, reducing fundraising conversion and donor retention',
      'Program outcome AI misallocating resources, reducing intervention effectiveness in underserved communities',
      'Disease surveillance AI missing early outbreak signals, delaying public health response',
      'Grant management AI miscalculating impact metrics, jeopardizing funding and compliance reporting',
      'Volunteer matching AI assigning mismatched skills, reducing program delivery effectiveness',
    ],
    roiPoints: [
      'Monitor donor AI accuracy — increasing fundraising conversion by 30% and recurring donor retention by 25%',
      'Track program AI allocation — improving intervention effectiveness by 40% through data-driven resource deployment',
      'Validate surveillance AI detection — achieving 90% early outbreak detection, reducing response time by 60%',
      'Ensure grant AI compliance — maintaining 99% impact reporting accuracy for funder accountability',
      'Measure volunteer AI matching — increasing program delivery effectiveness by 35% through skill-aligned placement',
    ],
    integrations: [
      {
        name: 'Salesforce NPSP',
        description: 'Nonprofit success pack — AI-powered donor management, fundraising analytics, program tracking, and impact measurement for nonprofit organizations',
        category: 'Donor Management & Fundraising',
        useCases: [
          'Donor AI — monitoring donor propensity scoring accuracy and gift amount prediction',
          'Campaign AI — tracking fundraising campaign optimization and channel effectiveness',
          'Program AI — monitoring beneficiary outcome tracking and intervention effectiveness prediction',
          'Engagement AI — tracking supporter journey orchestration and retention risk identification',
        ],
        monitoringPoints: [
          'Donor AI — propensity score calibration, gift prediction accuracy, and upgrade conversion rates',
          'Campaign AI — channel effectiveness, cost per dollar raised, and donor acquisition quality',
          'Program AI — outcome measurement accuracy, intervention effectiveness, and cost per impact',
          'Engagement AI — supporter retention prediction accuracy and re-engagement trigger effectiveness',
          'CRM platform performance, data integration reliability, and reporting pipeline freshness',
        ],
        bizObsValue: 'Connect donor AI predictions to actual fundraising outcomes — proving that AI-driven engagement strategies maximize donor lifetime value while reducing cost per dollar raised.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects donor AI model drift — alerting when propensity scores or gift predictions diverge from actual fundraising outcomes' },
          { capability: 'Business Analytics', detail: 'Measures fundraising AI ROI — comparing donor LTV, conversion rates, and cost efficiency for AI-targeted vs traditional campaigns' },
          { capability: 'Digital Experience Monitoring', detail: 'Monitors donation platforms ensuring seamless giving experiences across web, mobile, and event channels' },
          { capability: 'OpenPipeline', detail: 'Unifies donor data, campaign signals, and program outcomes into nonprofit operations observability' },
        ],
      },
      {
        name: 'Blackbaud',
        description: 'Social impact platform — AI-powered fundraising intelligence, grant management, financial analytics, and program outcomes tracking for nonprofits and foundations',
        category: 'Social Impact Analytics',
        useCases: [
          'Fundraising intelligence AI — monitoring wealth screening accuracy and major gift prospect identification',
          'Grant management AI — tracking compliance monitoring automation and impact reporting accuracy',
          'Financial AI — monitoring budget forecasting and fund accounting optimization',
          'Volunteer AI — tracking skill matching accuracy and engagement optimization',
        ],
        monitoringPoints: [
          'Wealth AI — screening accuracy, prospect identification precision, and gift conversion rates',
          'Grant AI — compliance monitoring accuracy, report generation quality, and deadline management',
          'Financial AI — budget forecast accuracy, fund accounting reconciliation, and audit readiness',
          'Volunteer AI — skill match quality, retention rate, and hours contributed per volunteer',
          'Platform integration reliability, data migration accuracy, and batch processing performance',
        ],
        bizObsValue: 'Link fundraising intelligence AI to actual gift revenue — proving that AI-driven prospect identification and grant management improve fundraising efficiency and compliance outcomes.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates wealth screening AI with actual giving patterns, detecting when prospect scoring becomes miscalibrated' },
          { capability: 'Business Analytics', detail: 'Compares AI-driven fundraising against traditional methods on revenue per prospect, cost efficiency, and compliance metrics' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Monitors platform performance during peak fundraising periods ensuring reliable donation processing' },
          { capability: 'Application Security', detail: 'Protects donor PII and payment data across fundraising platforms and grant management systems' },
        ],
      },
      {
        name: 'DHIS2',
        description: 'Health information system — AI-powered disease surveillance, health program analytics, supply chain tracking, and population health management for public health organizations',
        category: 'Public Health Surveillance',
        useCases: [
          'Surveillance AI — monitoring disease outbreak detection accuracy and early warning system effectiveness',
          'Program AI — tracking health intervention coverage prediction and resource allocation optimization',
          'Supply chain AI — monitoring essential medicine stock prediction and distribution optimization',
          'Population health AI — tracking risk stratification accuracy and health equity analysis',
        ],
        monitoringPoints: [
          'Surveillance AI — outbreak detection sensitivity, false alarm rate, and detection lead time',
          'Program AI — intervention coverage prediction accuracy and resource allocation effectiveness',
          'Supply AI — stock prediction accuracy, stockout prevention rate, and distribution optimization',
          'Population AI — risk stratification accuracy and health equity metric tracking',
          'Health data pipeline reliability, data quality scores, and reporting completeness across facilities',
        ],
        bizObsValue: 'Measure surveillance AI impact on public health outcomes — proving that AI-driven early detection and resource allocation save lives through faster, more targeted health interventions.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects surveillance AI sensitivity changes — alerting when outbreak detection patterns or risk scoring accuracy degrade' },
          { capability: 'OpenPipeline', detail: 'Ingests health facility data, surveillance signals, and supply chain metrics into public health observability' },
          { capability: 'Business Analytics', detail: 'Quantifies public health AI value — measuring outbreak response time improvement, resource optimization, and intervention coverage' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures health information system reliability across thousands of facilities in low-connectivity environments' },
        ],
      },
    ],
    journeys: [
      { name: 'Donor Engagement', configFile: 'config-nonprofit-donor-engagement.json' },
      { name: 'Disease Surveillance', configFile: 'config-nonprofit-disease-surveillance.json' },
    ],
    kpis: ['Cost per dollar raised', 'Program effectiveness %', 'Outbreak detection time', 'Donor retention rate'],
  },
  {
    id: 'payments',
    icon: '💳',
    industry: 'Payments & Fintech',
    color: '#1565c0',
    tagline: 'AI-secured transactions — every payment, observable',
    description: 'Payments and fintech companies deploy AI for fraud detection, transaction routing, credit decisioning, regulatory compliance, and customer onboarding. When fraud AI misses sophisticated attacks, routing AI selects suboptimal processors, or credit AI makes unfair decisions, financial losses mount and regulatory penalties follow. Dynatrace ensures AI-powered financial infrastructure is fast, fair, and fraud-resistant.',
    painPoints: [
      'Fraud detection AI missing sophisticated attack patterns while generating excessive false positives that block legitimate transactions',
      'Transaction routing AI selecting suboptimal payment processors, increasing decline rates and processing costs',
      'Credit decisioning AI introducing bias or making inconsistent approval decisions, creating compliance risk',
      'KYC/AML AI failing to identify suspicious patterns, exposing the organization to regulatory penalties',
      'Customer onboarding AI creating friction that increases drop-off rates during application flows',
    ],
    roiPoints: [
      'Monitor fraud AI accuracy — reducing fraud losses by 50% while decreasing false positive rate by 35%, unlocking $10M+ in blocked legitimate revenue',
      'Track routing AI optimization — reducing payment decline rates by 20% and processing costs by 15% through intelligent processor selection',
      'Validate credit AI fairness — maintaining regulatory compliance while improving approval rates by 12% through bias-free scoring',
      'Ensure KYC AI accuracy — achieving 98% suspicious activity detection while reducing manual review volume by 60%',
      'Measure onboarding AI conversion — increasing application completion rates by 40% through friction-optimized identity verification',
    ],
    integrations: [
      {
        name: 'Stripe',
        description: 'Payment infrastructure platform — AI-powered fraud prevention, payment optimization, revenue recovery, and financial automation for internet businesses',
        category: 'Payment Infrastructure',
        useCases: [
          'Radar fraud AI — monitoring fraud detection accuracy, false positive rates, and adaptive rule effectiveness',
          'Payment optimization AI — tracking intelligent retry logic and processor routing optimization',
          'Revenue recovery AI — monitoring failed payment recovery prediction and dunning optimization',
          'Identity AI — tracking KYC verification accuracy, speed, and conversion impact',
        ],
        monitoringPoints: [
          'Fraud AI — detection rate, false positive rate, dispute rate, and adaptive rule trigger accuracy',
          'Routing AI — authorization rate by processor, decline reason analysis, and cost optimization',
          'Recovery AI — failed payment recovery rate, retry timing accuracy, and revenue recaptured',
          'Identity AI — verification pass rate, document validation accuracy, and onboarding conversion',
          'Payment API latency, webhook delivery reliability, and transaction processing throughput',
        ],
        bizObsValue: 'Connect fraud AI decisions to actual financial outcomes — proving that ML-driven fraud prevention reduces losses while maximizing legitimate payment acceptance rates.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects fraud AI model drift — alerting when detection patterns shift, false positives increase, or new attack vectors emerge' },
          { capability: 'Business Analytics', detail: 'Measures payment AI ROI — comparing fraud losses, authorization rates, and processing costs for AI-optimized vs rule-based approaches' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Monitors payment processing infrastructure ensuring sub-100ms authorization across global payment rails' },
          { capability: 'Application Security', detail: 'Secures payment data flows and PCI DSS compliance across payment processing and token vault infrastructure' },
        ],
      },
      {
        name: 'Adyen',
        description: 'Global payment platform — AI-powered risk management, shopper authentication, payment optimization, and unified commerce across online, in-store, and mobile channels',
        category: 'Unified Commerce Payments',
        useCases: [
          'RevenueProtect AI — monitoring risk scoring accuracy and authentication optimization across global markets',
          'Payment optimization AI — tracking acquirer routing intelligence and local payment method optimization',
          'Shopper recognition AI — monitoring cross-channel customer identification and personalization',
          'Compliance AI — tracking regulatory adherence across jurisdictions and scheme mandate compliance',
        ],
        monitoringPoints: [
          'Risk AI — risk score accuracy, authentication success rate, and chargeback rate by market',
          'Routing AI — acquirer acceptance rates, cost per transaction, and local payment method coverage',
          'Recognition AI — cross-channel identification accuracy and repeat shopper conversion improvement',
          'Compliance AI — regulatory mandate tracking, scheme compliance rate, and audit readiness',
          'Terminal fleet management, POS reliability, and omnichannel transaction synchronization',
        ],
        bizObsValue: 'Link payment optimization AI to actual revenue metrics — proving that intelligent routing and risk management deliver higher authorization rates and lower cost of payment across markets.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates risk AI scoring with actual fraud outcomes, detecting when regional risk models need recalibration' },
          { capability: 'Digital Experience Monitoring', detail: 'Monitors checkout experience across web, mobile, and in-store ensuring frictionless payment flows' },
          { capability: 'Business Analytics', detail: 'Compares AI-optimized routing against static configurations on authorization rates, costs, and customer experience metrics' },
          { capability: 'OpenPipeline', detail: 'Unifies payment data across channels, acquirers, and markets into unified commerce observability' },
        ],
      },
      {
        name: 'Marqeta',
        description: 'Modern card issuing platform — AI-powered card program management, transaction controls, spend intelligence, and just-in-time funding for fintech and enterprise',
        category: 'Card Issuing & Controls',
        useCases: [
          'Transaction control AI — monitoring real-time authorization decisioning and dynamic spend rules',
          'JIT funding AI — tracking just-in-time funding accuracy and liquidity optimization',
          'Spend intelligence AI — monitoring transaction categorization and anomaly detection accuracy',
          'Program management AI — tracking card lifecycle optimization and activation rate prediction',
        ],
        monitoringPoints: [
          'Authorization AI — decision accuracy, rule evaluation speed, and decline reason analysis',
          'Funding AI — JIT funding success rate, timing accuracy, and liquidity optimization',
          'Spend AI — transaction categorization accuracy, anomaly detection rate, and false positive ratio',
          'Program AI — activation rate prediction, utilization forecasting, and revenue per card',
          'Card processing API latency, webhook reliability, and real-time notification delivery',
        ],
        bizObsValue: 'Measure card program AI impact on transaction approval rates and cardholder experience — proving that AI-driven controls maximize legitimate approvals while preventing unauthorized use.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects authorization AI anomalies — alerting when transaction control patterns shift or JIT funding accuracy degrades' },
          { capability: 'Business Analytics', detail: 'Quantifies card program AI ROI — measuring approval rates, cardholder satisfaction, and fraud prevention for AI vs static rule programs' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures card processing infrastructure reliability with real-time authorization at global scale' },
          { capability: 'OpenPipeline', detail: 'Ingests transaction streams, funding events, and program metrics into card issuing observability' },
        ],
      },
    ],
    journeys: [
      { name: 'Payment Processing', configFile: 'config-payments-processing.json' },
      { name: 'Fraud Detection', configFile: 'config-payments-fraud-detection.json' },
    ],
    kpis: ['Authorization rate %', 'Fraud rate', 'Processing cost', 'False positive rate'],
  },
  {
    id: 'cybersecurity',
    icon: '🛡️',
    industry: 'Cybersecurity',
    color: '#b71c1c',
    tagline: 'AI-defended enterprises — every threat, observable',
    description: 'Cybersecurity companies deploy AI for threat detection, incident response automation, vulnerability prioritization, identity analytics, and security orchestration. When detection AI misses advanced persistent threats, response AI triggers wrong playbooks, or vulnerability AI mispriotizes patches, organizations face breaches and compliance failures. Dynatrace ensures AI-driven security operations are precise, timely, and effective.',
    painPoints: [
      'Threat detection AI generating overwhelming alert volumes with excessive false positives, causing analyst fatigue',
      'Automated response AI triggering wrong remediation playbooks, causing service disruptions',
      'Vulnerability scoring AI mispriotizing patch urgency, leaving critical exploits unaddressed',
      'Identity analytics AI failing to detect compromised credentials and insider threats',
      'Security orchestration AI creating automation loops that amplify rather than contain incidents',
    ],
    roiPoints: [
      'Monitor detection AI accuracy — reducing mean time to detect (MTTD) by 65% while cutting false positives by 80%',
      'Track response AI precision — reducing mean time to respond (MTTR) by 70% through accurate automated playbook selection',
      'Validate vulnerability AI scoring — focusing remediation on the 5% of vulnerabilities that pose 95% of actual risk',
      'Ensure identity AI detection — identifying 95% of compromised credentials within 4 hours of compromise',
      'Measure orchestration AI effectiveness — achieving 90% automated resolution for Tier 1 incidents, freeing analysts for advanced threats',
    ],
    integrations: [
      {
        name: 'CrowdStrike',
        description: 'Endpoint security platform — AI-powered threat detection, incident response, threat intelligence, and endpoint protection using behavioral analysis and ML',
        category: 'Endpoint Detection & Response',
        useCases: [
          'Threat detection AI — monitoring real-time behavioral analysis accuracy and malware classification',
          'Threat intelligence AI — tracking indicator of compromise (IoC) enrichment and threat attribution quality',
          'Incident response AI — monitoring automated containment decisions and remediation playbook accuracy',
          'Identity AI — tracking credential compromise detection and lateral movement identification',
        ],
        monitoringPoints: [
          'Detection AI — true positive rate, false positive rate, and detection latency per threat category',
          'Intelligence AI — IoC enrichment accuracy, threat attribution confidence, and intelligence freshness',
          'Response AI — containment decision accuracy, playbook success rate, and mean time to remediate',
          'Identity AI — credential compromise detection speed and lateral movement identification accuracy',
          'Sensor telemetry ingestion rate, cloud processing throughput, and alert delivery latency',
        ],
        bizObsValue: 'Connect detection AI accuracy to actual security outcomes — proving that AI-driven endpoint protection reduces breach risk while decreasing analyst workload through precise, automated threat response.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects security AI effectiveness changes — alerting when detection rates decline, false positives spike, or response automation quality degrades' },
          { capability: 'Business Analytics', detail: 'Measures security AI ROI — comparing MTTD, MTTR, and analyst productivity for AI-driven vs manual security operations' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Monitors security platform infrastructure ensuring real-time threat processing at millions of events per second' },
          { capability: 'OpenPipeline', detail: 'Unifies security telemetry, threat intelligence, and incident data into security operations observability' },
        ],
      },
      {
        name: 'Palo Alto Cortex',
        description: 'Security operations platform — AI-powered extended detection and response (XDR), security orchestration (XSOAR), and attack surface management',
        category: 'Security Operations & Orchestration',
        useCases: [
          'XDR AI — monitoring cross-source correlation accuracy and alert grouping quality',
          'XSOAR AI — tracking playbook automation effectiveness and analyst workflow optimization',
          'Attack surface AI — monitoring external asset discovery accuracy and risk prioritization',
          'Threat hunting AI — tracking proactive detection query effectiveness and novel threat identification',
        ],
        monitoringPoints: [
          'XDR AI — correlation accuracy, alert grouping quality, and investigation context completeness',
          'XSOAR AI — playbook execution success rate, automation coverage, and mean time to resolve',
          'Surface AI — asset discovery coverage, risk score accuracy, and vulnerability exposure tracking',
          'Hunting AI — detection query hit rate, novel threat identification, and hypothesis validation speed',
          'SIEM data ingestion throughput, correlation engine performance, and dashboard render speed',
        ],
        bizObsValue: 'Link security orchestration AI to operational outcomes — proving that AI-driven SOC automation reduces incident resolution time while improving analyst effectiveness.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates XDR AI correlation decisions with actual incident outcomes, identifying detection and grouping quality trends' },
          { capability: 'Business Analytics', detail: 'Compares AI-automated security operations against manual workflows on resolution time, accuracy, and cost per incident' },
          { capability: 'Digital Experience Monitoring', detail: 'Monitors SOC analyst dashboard performance ensuring real-time visibility during incident response' },
          { capability: 'Application Security', detail: 'Validates security platform integrity and detects any compromise of security tooling itself' },
        ],
      },
      {
        name: 'Splunk SOAR',
        description: 'Security orchestration platform — AI-powered incident response automation, case management, threat intelligence orchestration, and security workflow automation',
        category: 'Incident Response Automation',
        useCases: [
          'Playbook AI — monitoring automated response action accuracy and execution success rates',
          'Case management AI — tracking incident classification, prioritization, and analyst assignment optimization',
          'Intelligence AI — monitoring threat feed aggregation quality and contextual enrichment accuracy',
          'Workflow AI — tracking automation coverage expansion and manual process elimination',
        ],
        monitoringPoints: [
          'Playbook AI — action success rate, execution time, and rollback requirement frequency',
          'Case AI — classification accuracy, priority assignment quality, and analyst workload balance',
          'Intelligence AI — feed quality scoring, enrichment accuracy, and deduplication effectiveness',
          'Workflow AI — automation coverage percentage, process cycle time, and exception handling rate',
          'Orchestration platform reliability, API integration health, and action execution throughput',
        ],
        bizObsValue: 'Measure SOAR AI impact on security operations efficiency — proving that automated playbooks resolve incidents faster with fewer errors than manual analyst-driven processes.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects automation AI quality changes — alerting when playbook success rates decline or execution patterns indicate misconfiguration' },
          { capability: 'OpenPipeline', detail: 'Ingests security automation metrics, case data, and workflow executions into SOAR observability' },
          { capability: 'Business Analytics', detail: 'Quantifies SOAR AI value — measuring analyst hours saved, incident resolution speed, and error rate reduction' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures orchestration platform availability and integration health across security tool ecosystem' },
        ],
      },
    ],
    journeys: [
      { name: 'Threat Detection', configFile: 'config-cybersecurity-threat-detection.json' },
      { name: 'Incident Response', configFile: 'config-cybersecurity-incident-response.json' },
    ],
    kpis: ['Mean time to detect', 'Mean time to respond', 'False positive rate', 'Automation coverage %'],
  },
  {
    id: 'rail',
    icon: '🚆',
    industry: 'Rail & Public Transit',
    color: '#37474f',
    tagline: 'AI-optimized transit — every journey, observable',
    description: 'Rail and public transit operators deploy AI for timetable optimization, predictive maintenance, passenger flow management, energy efficiency, and safety monitoring. When scheduling AI creates conflicts, maintenance AI misses critical defects, or passenger AI miscalculates demand, delays cascade across networks and safety risk increases. Dynatrace ensures AI-driven transit networks are punctual, safe, and efficient.',
    painPoints: [
      'Timetable optimization AI creating scheduling conflicts that cascade into network-wide delays',
      'Predictive maintenance AI missing critical wheel, track, or signaling defects before failure',
      'Passenger flow AI miscalculating peak demand, leading to overcrowding and safety incidents',
      'Energy management AI failing to optimize traction power, increasing operating costs',
      'Signal system AI producing unsafe movement authorities, requiring manual intervention',
    ],
    roiPoints: [
      'Monitor scheduling AI accuracy — improving on-time performance by 15% and reducing cascade delays by 40%',
      'Track maintenance AI predictions — reducing unplanned service disruptions by 55% and extending asset life by 20%',
      'Validate passenger AI forecasting — achieving 95% demand prediction accuracy for optimal fleet deployment',
      'Ensure energy AI optimization — reducing traction energy costs by 18% through AI-driven regenerative braking and coasting',
      'Measure signaling AI safety — maintaining 99.999% safe movement authority while reducing manual interventions by 70%',
    ],
    integrations: [
      {
        name: 'Siemens Mobility',
        description: 'Rail technology platform — AI-powered signaling, train control, rolling stock maintenance, and digital rail operations for mainline and urban transit',
        category: 'Rail Signaling & Operations',
        useCases: [
          'Signaling AI — monitoring movement authority decisions, conflict detection, and safe separation assurance',
          'Train control AI — tracking automatic train operation (ATO) efficiency and energy optimization',
          'Maintenance AI — monitoring rolling stock condition prediction and depot scheduling optimization',
          'Operations AI — tracking timetable adherence and real-time service recovery decision quality',
        ],
        monitoringPoints: [
          'Signaling AI — movement authority accuracy, conflict detection rate, and safety margin compliance',
          'ATO AI — driving profile optimization, energy savings per journey, and punctuality impact',
          'Maintenance AI — failure prediction accuracy, component life estimation, and maintenance window optimization',
          'Operations AI — timetable adherence, recovery decision quality, and passenger information accuracy',
          'Signaling system health, interlocking processing time, and communication network reliability',
        ],
        bizObsValue: 'Connect signaling AI to actual network performance — proving that AI-driven train control delivers better punctuality and energy efficiency while maintaining the highest safety standards.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects signaling AI quality changes — alerting when movement authority accuracy or conflict detection patterns deviate from safety baselines' },
          { capability: 'Business Analytics', detail: 'Measures digital rail ROI — comparing punctuality, energy costs, and maintenance spend for AI-operated vs conventionally-operated networks' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Monitors rail control center infrastructure ensuring real-time command and monitoring of the entire network' },
          { capability: 'OpenPipeline', detail: 'Unifies signaling data, train telemetry, and passenger information into rail operations observability' },
        ],
      },
      {
        name: 'Alstom',
        description: 'Train manufacturer and transit solutions — AI-powered predictive maintenance, fleet management, passenger information, and autonomous transit operations',
        category: 'Fleet Management & Maintenance',
        useCases: [
          'HealthHub AI — monitoring rolling stock health prediction and maintenance planning optimization',
          'Fleet management AI — tracking vehicle allocation optimization and depot capacity planning',
          'Passenger info AI — monitoring real-time journey planning accuracy and disruption communication',
          'Autonomous AI — tracking driverless metro operation safety and efficiency metrics',
        ],
        monitoringPoints: [
          'Health AI — component failure prediction accuracy, maintenance planning optimization, and fleet availability',
          'Fleet AI — vehicle allocation efficiency, depot capacity utilization, and deployment cost optimization',
          'Info AI — disruption detection speed, journey alternative accuracy, and passenger satisfaction',
          'Autonomy AI — driverless operation safety score, dwell time accuracy, and energy efficiency',
          'Train-to-wayside communication reliability, onboard system health, and data pipeline latency',
        ],
        bizObsValue: 'Link predictive maintenance AI to actual fleet availability — proving that AI-driven maintenance reduces life-cycle costs while maximizing service availability for passengers.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates maintenance AI predictions with actual component failures, improving prediction model accuracy over time' },
          { capability: 'Business Analytics', detail: 'Compares AI-maintained fleets against traditional schedules on availability, cost per km, and mean distance between failures' },
          { capability: 'Digital Experience Monitoring', detail: 'Monitors passenger-facing journey planning and real-time information systems for service quality' },
          { capability: 'Application Security', detail: 'Protects critical rail OT infrastructure and passenger data systems from cyber threats' },
        ],
      },
      {
        name: 'Optibus',
        description: 'Transit planning platform — AI-powered scheduling, rostering, real-time operations, and passenger analytics for public transit agencies',
        category: 'Transit Planning & Scheduling',
        useCases: [
          'Scheduling AI — monitoring service plan optimization for maximum coverage with minimum resources',
          'Rostering AI — tracking crew assignment optimization for cost efficiency and regulatory compliance',
          'Operations AI — monitoring real-time dispatch optimization and service recovery decisions',
          'Demand AI — tracking ridership prediction accuracy and service frequency optimization',
        ],
        monitoringPoints: [
          'Scheduling AI — service coverage quality, resource utilization, and cost efficiency per trip',
          'Rostering AI — crew utilization rate, overtime minimization, and regulatory compliance',
          'Operations AI — dispatch decision quality, headway adherence, and bunching prevention',
          'Demand AI — ridership prediction accuracy, load factor optimization, and equity coverage',
          'Optimization engine processing time, real-time data integration, and schedule change propagation',
        ],
        bizObsValue: 'Measure transit planning AI impact on service quality and cost — proving that AI-optimized scheduling delivers better coverage with lower operating costs per passenger journey.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects scheduling AI optimization drift — alerting when service coverage or cost efficiency metrics degrade from planned targets' },
          { capability: 'OpenPipeline', detail: 'Ingests transit operations data, ridership counts, and crew management events into public transit observability' },
          { capability: 'Business Analytics', detail: 'Quantifies planning AI value — measuring cost per passenger journey, service reliability, and coverage equity improvements' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures planning platform reliability during critical schedule generation and real-time operations periods' },
        ],
      },
    ],
    journeys: [
      { name: 'Timetable Optimization', configFile: 'config-rail-timetable-optimization.json' },
      { name: 'Predictive Maintenance', configFile: 'config-rail-predictive-maintenance.json' },
    ],
    kpis: ['On-time performance %', 'Fleet availability', 'Cost per passenger km', 'Safety incidents'],
  },
  {
    id: 'ridehailing',
    icon: '🚗',
    industry: 'Ride-hailing & Mobility',
    color: '#000000',
    tagline: 'AI-dispatched mobility — every ride, observable',
    description: 'Ride-hailing and mobility companies deploy AI for dynamic pricing, driver-rider matching, route optimization, demand forecasting, and safety monitoring. When pricing AI surges incorrectly, matching AI creates poor driver-rider pairings, or demand AI underestimates peak zones, revenue leaks and customer satisfaction drops. Dynatrace ensures AI-driven mobility platforms deliver optimal experiences at scale.',
    painPoints: [
      'Dynamic pricing AI applying incorrect surge multipliers, driving away riders or underpaying drivers',
      'Matching AI creating suboptimal driver-rider pairings, increasing wait times and deadheading miles',
      'Route optimization AI selecting suboptimal paths, increasing trip duration and fuel costs',
      'Demand forecasting AI underestimating peak zone demand, causing driver supply shortages',
      'Safety AI missing risky driving patterns or failing to detect trip anomalies',
    ],
    roiPoints: [
      'Monitor pricing AI accuracy — optimizing surge to maximize marketplace liquidity, increasing completed trips by 15%',
      'Track matching AI efficiency — reducing average wait time by 30% and driver deadheading by 25%',
      'Validate route AI decisions — decreasing average trip duration by 12% through real-time traffic-aware routing',
      'Ensure demand AI forecasting — achieving 90% demand prediction accuracy for proactive driver positioning',
      'Measure safety AI effectiveness — reducing unsafe driving incidents by 50% through real-time monitoring alerts',
    ],
    integrations: [
      {
        name: 'Uber Platform',
        description: 'Mobility platform — AI-powered marketplace matching, dynamic pricing, route optimization, and demand prediction for ride-hailing and delivery operations',
        category: 'Marketplace Operations',
        useCases: [
          'Marketplace AI — monitoring supply-demand balancing, driver incentive optimization, and surge pricing accuracy',
          'Matching AI — tracking rider-driver assignment efficiency, ETA accuracy, and trip quality scoring',
          'Route AI — monitoring real-time path optimization, traffic prediction, and navigation accuracy',
          'Demand AI — tracking zone-level demand forecasting and proactive driver positioning effectiveness',
        ],
        monitoringPoints: [
          'Marketplace AI — completion rate, surge accuracy, and supply-demand balance by zone',
          'Matching AI — wait time, match quality score, ETA prediction accuracy, and driver acceptance rate',
          'Route AI — trip duration accuracy, navigation compliance, and fuel efficiency estimation',
          'Demand AI — zone demand prediction accuracy and driver pre-positioning effectiveness',
          'Platform API latency, dispatch cycle time, and real-time location processing throughput',
        ],
        bizObsValue: 'Connect marketplace AI to actual ride economics — proving that AI-driven matching and pricing maximize completed trips while maintaining rider satisfaction and driver earnings.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects marketplace AI imbalances — alerting when matching efficiency drops, surge becomes miscalibrated, or ETA accuracy degrades' },
          { capability: 'Business Analytics', detail: 'Measures platform AI ROI — comparing completed trips, rider LTV, and driver earnings for AI-optimized vs baseline marketplace operations' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Monitors real-time dispatch infrastructure processing millions of location updates and matching decisions per second' },
          { capability: 'Digital Experience Monitoring', detail: 'Ensures rider and driver app performance with real-time location tracking and seamless trip flows' },
        ],
      },
      {
        name: 'Lyft',
        description: 'Mobility platform — AI-powered ride matching, shared rides optimization, bike/scooter fleet management, and multimodal transit integration',
        category: 'Multimodal Mobility',
        useCases: [
          'Shared ride AI — monitoring ride pooling optimization, detour minimization, and co-rider matching',
          'Fleet AI — tracking bike and scooter rebalancing optimization and maintenance prediction',
          'Transit AI — monitoring multimodal journey planning accuracy and connection timing optimization',
          'Safety AI — tracking driver behavior scoring and trip safety anomaly detection',
        ],
        monitoringPoints: [
          'Shared AI — pool match rate, detour ratio, and shared ride savings per passenger',
          'Fleet AI — vehicle availability by zone, rebalancing efficiency, and maintenance prediction accuracy',
          'Transit AI — multimodal journey time accuracy and connection reliability scoring',
          'Safety AI — driving behavior score accuracy, anomaly detection rate, and intervention effectiveness',
          'Ride platform reliability, geospatial query performance, and real-time communication latency',
        ],
        bizObsValue: 'Link multimodal mobility AI to actual rider experience — proving that AI-optimized shared rides and fleet management deliver cost-efficient journeys with minimal detours.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates shared ride AI decisions with actual rider satisfaction and detour metrics, optimizing pool matching quality' },
          { capability: 'Business Analytics', detail: 'Compares AI-optimized shared rides against single trips on cost efficiency, carbon reduction, and rider satisfaction' },
          { capability: 'OpenPipeline', detail: 'Unifies ride data, fleet telemetry, and transit schedules into multimodal mobility observability' },
          { capability: 'Application Security', detail: 'Protects rider PII, payment data, and location privacy across mobility platform systems' },
        ],
      },
      {
        name: 'HERE Technologies',
        description: 'Location platform — AI-powered mapping, traffic prediction, fleet tracking, and geospatial analytics for mobility and logistics applications',
        category: 'Location Intelligence',
        useCases: [
          'Traffic AI — monitoring real-time traffic prediction accuracy and routing recommendation quality',
          'Mapping AI — tracking map freshness, accuracy, and automated change detection',
          'Fleet tracking AI — monitoring real-time location processing and geofence event accuracy',
          'ETA AI — tracking arrival time prediction accuracy across different transport modes and conditions',
        ],
        monitoringPoints: [
          'Traffic AI — prediction accuracy by corridor, time horizon, and congestion severity',
          'Mapping AI — map update freshness, feature accuracy, and automated detection coverage',
          'Tracking AI — location processing latency, geofence trigger accuracy, and tracking reliability',
          'ETA AI — arrival prediction accuracy by distance, mode, and condition complexity',
          'Location API throughput, tile rendering performance, and geospatial query latency',
        ],
        bizObsValue: 'Measure location AI accuracy impact on downstream mobility products — proving that better traffic prediction and mapping directly improve ride-hailing ETA accuracy and route efficiency.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects location AI quality degradation — alerting when traffic predictions or ETA accuracy decline in specific corridors or conditions' },
          { capability: 'OpenPipeline', detail: 'Ingests location streams, traffic probe data, and map updates into location intelligence observability' },
          { capability: 'Business Analytics', detail: 'Quantifies location AI value — measuring routing efficiency improvement and ETA accuracy impact on mobility platform performance' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures location platform reliability for real-time processing of billions of location data points daily' },
        ],
      },
    ],
    journeys: [
      { name: 'Ride Matching', configFile: 'config-ridehailing-matching.json' },
      { name: 'Dynamic Pricing', configFile: 'config-ridehailing-pricing.json' },
    ],
    kpis: ['Completion rate %', 'Average wait time', 'Revenue per trip', 'Driver utilization'],
  },
  {
    id: 'ev-charging',
    icon: '⚡',
    industry: 'EV & Charging Infrastructure',
    color: '#43a047',
    tagline: 'AI-charged mobility — every station, observable',
    description: 'EV and charging infrastructure companies deploy AI for charge station demand prediction, grid load balancing, battery health monitoring, dynamic pricing, and fleet charging optimization. When demand AI miscalculates station usage, grid AI fails to balance loads, or battery AI misjudges degradation, charger downtime increases and grid instability follows. Dynatrace ensures AI-driven EV infrastructure is reliable, efficient, and scalable.',
    painPoints: [
      'Demand prediction AI miscalculating charger utilization, causing driver frustration and revenue loss',
      'Grid balancing AI failing to manage peak charging loads, risking grid instability and penalty charges',
      'Battery health AI misjudging degradation rates, leading to unsafe fast-charging or premature replacement',
      'Dynamic pricing AI setting incorrect electricity rates, reducing charger utilization or margin',
      'Fleet charging AI creating scheduling conflicts at depot chargers, delaying departure readiness',
    ],
    roiPoints: [
      'Monitor demand AI accuracy — increasing charger utilization by 30% through predictive driver flow management',
      'Track grid AI balancing — reducing demand charges by 25% while maintaining 100% charger availability during peaks',
      'Validate battery AI predictions — extending battery life by 15% through optimized charging profiles',
      'Ensure pricing AI optimization — maximizing revenue per kWh while maintaining 90%+ utilization targets',
      'Measure fleet charging AI — achieving 99% departure readiness with 20% lower electricity costs through off-peak optimization',
    ],
    integrations: [
      {
        name: 'ChargePoint',
        description: 'EV charging network — AI-powered station management, demand prediction, energy optimization, and fleet charging solutions for the world\'s largest charging network',
        category: 'Charging Network Management',
        useCases: [
          'Station AI — monitoring charging session prediction, utilization optimization, and maintenance forecasting',
          'Energy AI — tracking demand response coordination and grid-friendly charging optimization',
          'Fleet AI — monitoring depot charging schedule optimization and departure readiness prediction',
          'Driver AI — tracking real-time availability prediction and wait time estimation accuracy',
        ],
        monitoringPoints: [
          'Station AI — utilization rate prediction accuracy, session duration estimation, and fault prediction',
          'Energy AI — demand response participation, grid signal compliance, and cost optimization savings',
          'Fleet AI — departure readiness rate, charging schedule adherence, and energy cost per mile',
          'Driver AI — availability prediction accuracy, wait time estimation, and route-to-charger optimization',
          'Charging network connectivity, OCPP message reliability, and payment processing performance',
        ],
        bizObsValue: 'Connect charging AI to actual network economics — proving that AI-driven demand management and energy optimization maximize revenue per station while delivering reliable driver experience.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects charging AI anomalies — alerting when utilization predictions, energy optimization, or fault detection patterns degrade across the network' },
          { capability: 'Business Analytics', detail: 'Measures charging AI ROI — comparing revenue per station, utilization rates, and energy costs for AI-managed vs manually configured stations' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Monitors charging network backend ensuring real-time station communication and payment processing reliability' },
          { capability: 'OpenPipeline', detail: 'Unifies station telemetry, energy grid data, and driver behavior into EV charging observability' },
        ],
      },
      {
        name: 'Tesla Fleet API',
        description: 'EV fleet management platform — AI-powered battery management, route planning, charging optimization, and over-the-air vehicle intelligence for fleet operators',
        category: 'EV Fleet Intelligence',
        useCases: [
          'Battery AI — monitoring state-of-health prediction accuracy and optimal charging profile recommendations',
          'Route AI — tracking range prediction accuracy considering battery state, weather, and terrain',
          'Charging AI — monitoring Supercharger routing optimization and preconditioning effectiveness',
          'Fleet AI — tracking total cost of ownership prediction and vehicle lifecycle optimization',
        ],
        monitoringPoints: [
          'Battery AI — SoH prediction accuracy, degradation rate estimation, and charging profile optimization',
          'Route AI — range prediction accuracy, energy consumption estimation, and arrival charge level',
          'Charging AI — preconditioning effectiveness, charge speed optimization, and session cost',
          'Fleet AI — TCO prediction accuracy, maintenance scheduling, and residual value estimation',
          'Fleet API reliability, OTA update delivery, and real-time telemetry processing',
        ],
        bizObsValue: 'Link battery AI to actual fleet economics — proving that AI-driven battery management extends usable life and reduces total cost of ownership for EV fleet operators.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates battery AI predictions with actual degradation patterns, detecting when SoH models need recalibration for specific vehicle cohorts' },
          { capability: 'Business Analytics', detail: 'Compares AI-managed fleets against baseline on battery longevity, energy costs, and total cost of ownership metrics' },
          { capability: 'Digital Experience Monitoring', detail: 'Monitors fleet management dashboards and driver-facing apps for real-time vehicle and charging status' },
          { capability: 'Application Security', detail: 'Secures vehicle API access and fleet data ensuring authorized-only remote vehicle management' },
        ],
      },
      {
        name: 'Enel X',
        description: 'Energy services platform — AI-powered demand response, smart charging, virtual power plant orchestration, and grid flexibility services for EV infrastructure',
        category: 'Grid Integration & Energy Services',
        useCases: [
          'Demand response AI — monitoring grid flexibility participation and load reduction compliance',
          'Smart charging AI — tracking V2G/V1G optimization decisions and grid revenue generation',
          'Virtual power plant AI — monitoring aggregated EV fleet battery coordination and grid service quality',
          'Energy trading AI — tracking wholesale market participation and arbitrage optimization',
        ],
        monitoringPoints: [
          'Demand AI — load reduction compliance rate, response time, and revenue per event',
          'Smart charging AI — V2G revenue generated, grid service quality score, and battery impact',
          'VPP AI — fleet aggregation accuracy, dispatch response compliance, and service reliability',
          'Trading AI — market price prediction accuracy, arbitrage effectiveness, and risk management',
          'Grid communication reliability, meter data processing, and settlement calculation accuracy',
        ],
        bizObsValue: 'Measure grid integration AI impact on charging economics — proving that AI-driven smart charging and demand response generate additional revenue streams while supporting grid stability.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects grid AI performance shifts — alerting when demand response compliance or V2G optimization effectiveness degrades' },
          { capability: 'OpenPipeline', detail: 'Ingests grid signals, charging session data, and energy market feeds into grid-integrated EV observability' },
          { capability: 'Business Analytics', detail: 'Quantifies smart charging AI value — measuring additional revenue per charger from grid services and demand response participation' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures real-time grid communication and energy management platform reliability for time-critical demand response' },
        ],
      },
    ],
    journeys: [
      { name: 'Charging Session', configFile: 'config-ev-charging-session.json' },
      { name: 'Fleet Depot Charging', configFile: 'config-ev-fleet-charging.json' },
    ],
    kpis: ['Charger utilization %', 'Uptime %', 'Energy cost per kWh', 'Departure readiness'],
  },
  {
    id: 'smart-cities',
    icon: '🏙️',
    industry: 'Smart Cities & Urban Planning',
    color: '#546e7a',
    tagline: 'AI-orchestrated cities — every service, observable',
    description: 'Smart city programs deploy AI for traffic management, public safety, energy grid optimization, waste collection, and citizen service delivery. When traffic AI fails to adapt signal timing, safety AI triggers false alarms, or grid AI miscalculates load, urban services degrade and citizen trust erodes. Dynatrace ensures AI-powered city infrastructure delivers measurable improvements in quality of life.',
    painPoints: [
      'Traffic management AI failing to adapt signal timing to real-time conditions, increasing congestion',
      'Public safety AI generating excessive false alarms, wasting first responder resources',
      'Energy grid AI miscalculating district-level load patterns, causing brownouts or waste',
      'Waste collection AI optimizing routes without accounting for special events or seasonal variation',
      'Citizen service AI providing inaccurate information, reducing public trust in digital government',
    ],
    roiPoints: [
      'Monitor traffic AI effectiveness — reducing average commute time by 18% and intersection delays by 30%',
      'Track safety AI accuracy — reducing false alarm dispatches by 60% while maintaining 95% true incident detection',
      'Validate grid AI predictions — reducing district energy waste by 20% and peak demand charges by 25%',
      'Ensure waste AI optimization — reducing collection costs by 30% while maintaining 99% pickup compliance',
      'Measure citizen AI service quality — increasing digital service satisfaction by 40% through AI-accurate responses',
    ],
    integrations: [
      {
        name: 'Cisco Kinetic for Cities',
        description: 'Smart city platform — AI-powered IoT management, traffic optimization, environmental monitoring, and connected infrastructure for urban environments',
        category: 'Urban IoT & Traffic',
        useCases: [
          'Traffic AI — monitoring adaptive signal control decisions and congestion prediction accuracy',
          'Environmental AI — tracking air quality prediction and pollution source identification accuracy',
          'Parking AI — monitoring occupancy prediction accuracy and guidance system effectiveness',
          'IoT management AI — tracking device health prediction and network optimization across city infrastructure',
        ],
        monitoringPoints: [
          'Traffic AI — signal optimization effectiveness, congestion reduction metrics, and intersection throughput',
          'Environmental AI — air quality prediction accuracy, source attribution, and compliance monitoring',
          'Parking AI — occupancy prediction accuracy, guidance effectiveness, and revenue optimization',
          'IoT AI — device failure prediction accuracy, network reliability, and data pipeline completeness',
          'City IoT platform connectivity, sensor data ingestion rate, and real-time dashboard performance',
        ],
        bizObsValue: 'Connect traffic AI decisions to actual city mobility outcomes — proving that AI-adaptive traffic management delivers measurable improvements in commute times, safety, and air quality.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects traffic AI effectiveness changes — alerting when congestion patterns worsen despite AI intervention or signal timing becomes suboptimal' },
          { capability: 'Business Analytics', detail: 'Measures smart city AI ROI — comparing traffic flow, air quality, and energy metrics for AI-managed vs traditional city infrastructure' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Monitors city IoT infrastructure ensuring reliable connectivity across thousands of sensors and controllers' },
          { capability: 'OpenPipeline', detail: 'Unifies traffic, environmental, parking, and utility data into smart city observability' },
        ],
      },
      {
        name: 'Siemens City Intelligence',
        description: 'Urban intelligence platform — AI-powered city digital twin, infrastructure planning, building management, and district-level energy optimization',
        category: 'Urban Digital Twin & Energy',
        useCases: [
          'Digital twin AI — monitoring city simulation accuracy and urban planning scenario analysis quality',
          'Building AI — tracking district-level energy management optimization and comfort prediction',
          'Infrastructure AI — monitoring asset condition prediction and maintenance prioritization',
          'Planning AI — tracking urban development impact simulation and zoning optimization',
        ],
        monitoringPoints: [
          'Twin AI — simulation accuracy vs real-world measurements, scenario analysis quality scores',
          'Building AI — energy optimization savings, comfort prediction accuracy, and grid contribution',
          'Infrastructure AI — condition prediction accuracy, maintenance prioritization effectiveness, and asset life extension',
          'Planning AI — development impact prediction accuracy and community outcome metrics',
          'Digital twin rendering performance, simulation processing time, and data synchronization freshness',
        ],
        bizObsValue: 'Link urban digital twin AI to actual city performance — proving that simulation-driven planning and energy management delivers better outcomes than traditional approaches.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates digital twin predictions with actual city metrics, identifying where simulation accuracy needs improvement' },
          { capability: 'Business Analytics', detail: 'Compares AI-planned interventions against baseline on energy savings, infrastructure longevity, and citizen satisfaction' },
          { capability: 'Digital Experience Monitoring', detail: 'Monitors city planner interaction with digital twin tools ensuring responsive simulation and analysis workflows' },
          { capability: 'Application Security', detail: 'Protects critical city infrastructure control systems and citizen data in smart city platforms' },
        ],
      },
      {
        name: 'IBM Intelligent Operations',
        description: 'City operations platform — AI-powered emergency management, utility optimization, citizen engagement, and cross-agency coordination for municipal government',
        category: 'City Operations & Emergency',
        useCases: [
          'Emergency AI — monitoring incident prediction accuracy and resource pre-positioning optimization',
          'Utility AI — tracking water, waste, and energy service optimization and demand forecasting',
          'Citizen AI — monitoring service request classification accuracy and resolution time prediction',
          'Coordination AI — tracking cross-agency resource sharing optimization and workflow automation',
        ],
        monitoringPoints: [
          'Emergency AI — incident prediction accuracy, resource deployment speed, and response effectiveness',
          'Utility AI — demand forecast accuracy, service optimization savings, and infrastructure health',
          'Citizen AI — request classification accuracy, routing efficiency, and satisfaction scoring',
          'Coordination AI — cross-agency collaboration effectiveness and resource sharing efficiency',
          'Operations center platform reliability, real-time situational awareness, and alert processing speed',
        ],
        bizObsValue: 'Measure city operations AI impact on service delivery — proving that AI-driven coordination and prediction deliver faster emergency response and more efficient municipal services.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects operations AI quality issues — alerting when emergency prediction accuracy or citizen service routing effectiveness declines' },
          { capability: 'OpenPipeline', detail: 'Ingests multi-agency data, emergency feeds, and utility metrics into city operations observability' },
          { capability: 'Business Analytics', detail: 'Quantifies operations AI value — measuring emergency response improvement, service delivery efficiency, and citizen satisfaction gains' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures operations center reliability during critical emergency events and peak service demand' },
        ],
      },
    ],
    journeys: [
      { name: 'Traffic Management', configFile: 'config-smartcity-traffic.json' },
      { name: 'Emergency Response', configFile: 'config-smartcity-emergency.json' },
    ],
    kpis: ['Average commute time', 'Emergency response time', 'Energy efficiency', 'Citizen satisfaction'],
  },
  {
    id: 'semiconductors',
    icon: '🔬',
    industry: 'Semiconductors & Chips',
    color: '#283593',
    tagline: 'AI-fabricated precision — every wafer, observable',
    description: 'Semiconductor companies deploy AI for defect detection, yield optimization, process control, supply chain planning, and design verification. When defect AI misclassifies wafer anomalies, yield AI recommends wrong process adjustments, or supply AI miscalculates demand, billions in fab capacity are wasted. Dynatrace ensures AI-driven semiconductor manufacturing achieves maximum yield and minimum defectivity.',
    painPoints: [
      'Defect detection AI misclassifying wafer anomalies, allowing defective dies through or scrapping good ones',
      'Yield optimization AI recommending process adjustments that degrade rather than improve output',
      'Process control AI failing to detect equipment drift until significant yield loss accumulates',
      'Supply chain AI miscalculating chip demand, causing either costly overcapacity or allocation shortages',
      'Design verification AI missing functional bugs that escape to silicon, requiring expensive respins',
    ],
    roiPoints: [
      'Monitor defect AI accuracy — reducing defect escape rate by 70% and false scrap by 40%, saving $50M+ per fab annually',
      'Track yield AI recommendations — improving die yield by 5-8 percentage points, worth $100M+ per fab in recovered revenue',
      'Validate process AI detection — identifying equipment drift 10x faster, preventing cumulative yield loss events',
      'Ensure supply AI accuracy — achieving 95% demand forecast accuracy, optimizing $10B+ in fab capacity investment',
      'Measure verification AI coverage — reducing silicon respin risk by 60% through AI-accelerated functional verification',
    ],
    integrations: [
      {
        name: 'Synopsys',
        description: 'EDA platform — AI-powered chip design automation, verification, design-for-manufacturing, and silicon lifecycle management for semiconductor companies',
        category: 'Chip Design & Verification',
        useCases: [
          'Design AI — monitoring AI-driven placement and routing optimization quality and timing closure',
          'Verification AI — tracking AI-accelerated simulation coverage and bug detection effectiveness',
          'DFM AI — monitoring design-for-manufacturing rule checking and yield prediction accuracy',
          'Security AI — tracking hardware security vulnerability detection in chip design',
        ],
        monitoringPoints: [
          'Design AI — placement quality, routing congestion, and timing closure achievement rate',
          'Verification AI — simulation coverage acceleration, bug detection rate, and false negative risk',
          'DFM AI — yield prediction accuracy, rule violation detection, and manufacturing compatibility scoring',
          'Security AI — hardware vulnerability detection coverage and security verification completeness',
          'EDA compute farm utilization, job scheduling efficiency, and license management optimization',
        ],
        bizObsValue: 'Connect design AI to actual silicon outcomes — proving that AI-driven EDA tools deliver first-pass silicon success more frequently while reducing tape-out schedule and compute costs.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects design AI quality anomalies — alerting when optimization convergence slows or verification coverage metrics degrade' },
          { capability: 'Business Analytics', detail: 'Measures EDA AI ROI — comparing tape-out schedules, first-pass success rates, and compute costs for AI-assisted vs traditional design flows' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Monitors EDA compute infrastructure ensuring efficient utilization of HPC clusters for chip design workloads' },
          { capability: 'OpenPipeline', detail: 'Unifies design metrics, verification data, and compute utilization into semiconductor design observability' },
        ],
      },
      {
        name: 'Cadence',
        description: 'EDA and IP platform — AI-powered circuit design, system analysis, PCB design, and computational fluid dynamics for semiconductor and electronics industries',
        category: 'Circuit Design & System Analysis',
        useCases: [
          'Cerebrus AI — monitoring autonomous design optimization campaign effectiveness and PPA convergence',
          'Analysis AI — tracking electromagnetic and thermal simulation accuracy and prediction quality',
          'IP AI — monitoring silicon IP integration verification and interoperability validation',
          'System AI — tracking system-level performance prediction and power-thermal-signal integrity analysis',
        ],
        monitoringPoints: [
          'Cerebrus AI — PPA improvement per optimization cycle, convergence speed, and design space exploration',
          'Analysis AI — simulation accuracy vs silicon measurements, prediction confidence, and compute efficiency',
          'IP AI — integration verification coverage, interoperability score, and validation throughput',
          'System AI — system performance prediction accuracy and multi-physics analysis quality',
          'Design infrastructure performance, cloud burst efficiency, and multi-tool workflow orchestration',
        ],
        bizObsValue: 'Link autonomous design AI to actual PPA outcomes — proving that AI-driven design exploration achieves better performance, power, and area targets with fewer engineering iterations.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates design AI optimization campaigns with actual PPA results, detecting when convergence quality degrades' },
          { capability: 'Business Analytics', detail: 'Compares AI-driven design flows against manual approaches on PPA achievement, iteration count, and time-to-tapeout' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Monitors hybrid cloud design infrastructure for efficient compute scaling during peak design campaigns' },
          { capability: 'Digital Experience Monitoring', detail: 'Tracks engineer interaction with AI design tools to measure adoption and workflow acceleration' },
        ],
      },
      {
        name: 'Applied Materials',
        description: 'Semiconductor equipment platform — AI-powered process control, defect detection, equipment maintenance, and yield optimization for wafer fabrication',
        category: 'Fab Process Control & Yield',
        useCases: [
          'Process AI — monitoring real-time equipment parameter optimization and recipe adjustment quality',
          'Defect AI — tracking inline and end-of-line defect classification accuracy and root cause identification',
          'Equipment AI — monitoring predictive maintenance accuracy and chamber matching optimization',
          'Yield AI — tracking wafer-level yield prediction and systematic defect pattern recognition',
        ],
        monitoringPoints: [
          'Process AI — parameter optimization effectiveness, recipe stability, and uniformity achievement',
          'Defect AI — classification accuracy, nuisance filtering rate, and root cause identification speed',
          'Equipment AI — maintenance prediction accuracy, chamber matching quality, and uptime improvement',
          'Yield AI — die yield prediction accuracy, systematic defect identification, and excursion detection speed',
          'Fab data collection reliability, sensor data quality, and real-time SPC performance',
        ],
        bizObsValue: 'Measure process AI impact on actual fab yield — proving that AI-driven process control and defect detection recover millions of dollars in yield that traditional statistical methods miss.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects process AI drift — alerting when equipment parameters shift, defect classification accuracy degrades, or yield predictions diverge from actuals' },
          { capability: 'OpenPipeline', detail: 'Ingests fab sensor data, defect images, and equipment telemetry into semiconductor manufacturing observability' },
          { capability: 'Business Analytics', detail: 'Quantifies fab AI value — measuring yield improvement, defect cost avoidance, and equipment uptime gains from AI process control' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures fab-to-cloud data pipeline reliability for real-time process monitoring and yield analytics' },
        ],
      },
    ],
    journeys: [
      { name: 'Wafer Fabrication', configFile: 'config-semiconductor-fabrication.json' },
      { name: 'Defect Analysis', configFile: 'config-semiconductor-defect.json' },
    ],
    kpis: ['Die yield %', 'Defect density', 'Equipment uptime', 'Cycle time'],
  },
  {
    id: 'chemical',
    icon: '🧪',
    industry: 'Chemical & Petrochemical',
    color: '#795548',
    tagline: 'AI-optimized processes — every reaction, observable',
    description: 'Chemical and petrochemical companies deploy AI for process optimization, safety monitoring, quality prediction, energy management, and environmental compliance. When process AI recommends suboptimal parameters, safety AI misses hazardous conditions, or quality AI allows off-spec product, the consequences range from waste and inefficiency to catastrophic incidents. Dynatrace ensures AI-driven chemical operations are safe, compliant, and value-maximizing.',
    painPoints: [
      'Process optimization AI recommending suboptimal reactor parameters, reducing yield and increasing energy costs',
      'Safety monitoring AI missing hazardous condition precursors, risking environmental and human safety incidents',
      'Quality prediction AI allowing off-spec product to advance, requiring costly rework or disposal',
      'Energy management AI failing to optimize steam and power balance, increasing utility costs',
      'Environmental AI missing emissions excursions before they trigger regulatory violations',
    ],
    roiPoints: [
      'Monitor process AI optimization — improving reactor yield by 3-5% and reducing energy consumption by 12%, worth $20M+ annually per plant',
      'Track safety AI detection — identifying 95% of hazardous precursors 30+ minutes before incident escalation',
      'Validate quality AI predictions — achieving 99% on-spec first-pass production, reducing rework costs by $5M+ annually',
      'Ensure energy AI balance — reducing steam and power costs by 15% through AI-optimized utility management',
      'Measure environmental AI compliance — maintaining 100% emissions compliance with 60-minute advance warning of excursions',
    ],
    integrations: [
      {
        name: 'Honeywell Connected Plant',
        description: 'Process industry platform — AI-powered process control, safety management, asset performance, and operational optimization for chemical and petrochemical plants',
        category: 'Process Control & Safety',
        useCases: [
          'Process AI — monitoring advanced process control optimization and multivariable controller performance',
          'Safety AI — tracking safety instrumented system performance and hazardous event prediction',
          'Asset AI — monitoring equipment health prediction and reliability-centered maintenance optimization',
          'Operations AI — tracking operator advisory system quality and alarm management optimization',
        ],
        monitoringPoints: [
          'Process AI — controller performance index, constraint pushing effectiveness, and yield improvement',
          'Safety AI — safety system demand rate, hazardous condition detection time, and false trip rate',
          'Asset AI — equipment failure prediction accuracy, maintenance schedule optimization, and availability',
          'Operations AI — advisory quality scoring, alarm rationalization effectiveness, and operator response',
          'DCS connectivity, historian data quality, and real-time process data pipeline reliability',
        ],
        bizObsValue: 'Connect process AI decisions to actual plant economics — proving that AI-driven process control delivers better yield, less energy waste, and higher safety margins than manual operation.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects process AI degradation — alerting when controller performance drops, safety detection patterns change, or equipment predictions diverge from actuals' },
          { capability: 'Business Analytics', detail: 'Measures process AI ROI — comparing yield, energy costs, and safety metrics for AI-optimized vs conventionally-operated plant units' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Monitors plant-to-cloud data infrastructure ensuring real-time process data availability for AI analytics' },
          { capability: 'OpenPipeline', detail: 'Unifies DCS data, safety systems, and equipment telemetry into chemical plant observability' },
        ],
      },
      {
        name: 'AspenTech',
        description: 'Process optimization platform — AI-powered modeling, simulation, supply chain optimization, and performance management for process industries',
        category: 'Process Modeling & Supply Chain',
        useCases: [
          'Process modeling AI — monitoring first-principles and hybrid model accuracy for reactor and separation optimization',
          'Supply chain AI — tracking crude/feedstock selection optimization and production scheduling',
          'Performance AI — monitoring plant-wide performance benchmarking and bottleneck identification',
          'Sustainability AI — tracking carbon emissions modeling and energy transition pathway optimization',
        ],
        monitoringPoints: [
          'Modeling AI — model prediction accuracy, parameter estimation quality, and simulation fidelity',
          'Supply AI — feedstock optimization value, schedule adherence, and margin improvement',
          'Performance AI — benchmark accuracy, bottleneck identification precision, and throughput optimization',
          'Sustainability AI — emissions prediction accuracy, carbon intensity tracking, and reduction pathway viability',
          'Optimization solver performance, model convergence speed, and data integration freshness',
        ],
        bizObsValue: 'Link process modeling AI to actual margin performance — proving that AI-driven optimization and scheduling deliver measurably better economics than experience-based decision-making.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates modeling AI predictions with actual plant outcomes, detecting when models lose fidelity and need recalibration' },
          { capability: 'Business Analytics', detail: 'Compares AI-optimized operations against baseline on margin, throughput, and energy efficiency metrics per unit' },
          { capability: 'Digital Experience Monitoring', detail: 'Monitors engineer interaction with AI modeling tools ensuring responsive simulation and optimization workflows' },
          { capability: 'Application Security', detail: 'Protects proprietary process models and intellectual property in cloud-deployed optimization platforms' },
        ],
      },
      {
        name: 'AVEVA',
        description: 'Industrial software platform — AI-powered digital twin, predictive analytics, MES, and unified operations for chemical, oil & gas, and process industries',
        category: 'Digital Twin & Operations',
        useCases: [
          'Digital twin AI — monitoring process simulation accuracy and what-if scenario analysis quality',
          'Predictive AI — tracking equipment failure prediction and process anomaly detection across plant assets',
          'MES AI — monitoring production execution optimization and batch quality prediction',
          'Unified operations AI — tracking cross-plant performance comparison and best practice identification',
        ],
        monitoringPoints: [
          'Twin AI — simulation accuracy, scenario plausibility, and prediction time horizon reliability',
          'Predictive AI — failure prediction lead time, false positive rate, and anomaly detection sensitivity',
          'MES AI — batch quality prediction accuracy, production schedule optimization, and OEE improvement',
          'Operations AI — cross-plant benchmarking accuracy and best practice applicability scoring',
          'Industrial platform integration health, data historian performance, and cloud synchronization reliability',
        ],
        bizObsValue: 'Measure digital twin AI impact on operational decisions — proving that simulation-based optimization delivers better plant performance than reactive, experience-based management.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects digital twin accuracy drift — alerting when simulation predictions diverge from actual plant behavior or anomaly patterns change' },
          { capability: 'OpenPipeline', detail: 'Ingests plant process data, equipment sensors, and MES events into industrial digital twin observability' },
          { capability: 'Business Analytics', detail: 'Quantifies digital twin value — measuring decision quality improvement, waste reduction, and throughput gains from AI simulation' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures industrial platform reliability across plant-floor, edge, and cloud computing tiers' },
        ],
      },
    ],
    journeys: [
      { name: 'Process Optimization', configFile: 'config-chemical-process-optimization.json' },
      { name: 'Safety Monitoring', configFile: 'config-chemical-safety.json' },
    ],
    kpis: ['Yield %', 'Energy cost per tonne', 'Safety incident rate', 'On-spec production %'],
  },
  {
    id: 'water',
    icon: '💧',
    industry: 'Water & Wastewater',
    color: '#0288d1',
    tagline: 'AI-managed water — every drop, observable',
    description: 'Water utilities deploy AI for leak detection, treatment optimization, demand forecasting, network pressure management, and regulatory compliance. When leak AI misses pipe failures, treatment AI allows quality violations, or demand AI miscalculates consumption, water is wasted and public health is at risk. Dynatrace ensures AI-driven water infrastructure is efficient, safe, and compliant.',
    painPoints: [
      'Leak detection AI failing to identify pipe failures, allowing non-revenue water losses to escalate',
      'Treatment AI allowing water quality parameter excursions, risking compliance violations and public health',
      'Demand forecasting AI miscalculating consumption patterns, causing pressure issues and supply shortfalls',
      'Network AI miscalculating optimal pressure zones, increasing pipe burst risk and energy waste',
      'Sewer overflow AI missing combined sewer overflow events, triggering environmental violations',
    ],
    roiPoints: [
      'Monitor leak AI detection — reducing non-revenue water by 25%, recovering $10M+ annually per utility',
      'Track treatment AI optimization — maintaining 100% drinking water compliance while reducing chemical costs by 20%',
      'Validate demand AI accuracy — achieving 95% daily demand forecast accuracy for optimal pumping schedules',
      'Ensure network AI pressure management — reducing pipe burst frequency by 35% through AI-optimized pressure zones',
      'Measure sewer AI predictions — detecting 90% of overflow events 2+ hours in advance for proactive response',
    ],
    integrations: [
      {
        name: 'Xylem',
        description: 'Water technology platform — AI-powered leak detection, network optimization, treatment intelligence, and smart metering for water utilities',
        category: 'Water Network Intelligence',
        useCases: [
          'Leak AI — monitoring acoustic and pressure-based leak detection accuracy across distribution networks',
          'Network AI — tracking pressure optimization decisions and pipe burst risk scoring',
          'Metering AI — monitoring smart meter anomaly detection and consumption pattern analysis',
          'Treatment AI — tracking process optimization for energy efficiency and chemical dosing',
        ],
        monitoringPoints: [
          'Leak AI — detection rate, location accuracy, false positive rate, and identification lead time',
          'Network AI — pressure zone optimization effectiveness, burst reduction rate, and energy savings',
          'Metering AI — anomaly detection accuracy, consumption prediction, and meter health scoring',
          'Treatment AI — energy optimization savings, chemical dosing accuracy, and effluent quality',
          'Sensor network reliability, data collection completeness, and real-time analytics pipeline performance',
        ],
        bizObsValue: 'Connect leak AI detection to actual water savings — proving that AI-driven network intelligence reduces non-revenue water and operational costs measurably.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects network AI quality changes — alerting when leak detection accuracy drops or pressure optimization effectiveness degrades' },
          { capability: 'Business Analytics', detail: 'Measures water AI ROI — comparing non-revenue water reduction, burst rates, and energy costs for AI-managed vs traditional network operations' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Monitors water utility cloud infrastructure ensuring reliable sensor data processing and real-time analytics' },
          { capability: 'OpenPipeline', detail: 'Unifies sensor data, meter readings, and network models into water infrastructure observability' },
        ],
      },
      {
        name: 'Veolia',
        description: 'Water services platform — AI-powered treatment optimization, resource recovery, industrial water management, and environmental compliance for municipal and industrial water',
        category: 'Treatment & Resource Recovery',
        useCases: [
          'Treatment optimization AI — monitoring biological and chemical process control for drinking and wastewater',
          'Resource recovery AI — tracking energy generation, nutrient recovery, and biosolids optimization',
          'Industrial AI — monitoring process water quality management and reuse optimization for industrial clients',
          'Compliance AI — tracking regulatory parameter monitoring and predictive compliance assurance',
        ],
        monitoringPoints: [
          'Treatment AI — process efficiency, energy per megaliter, and effluent quality vs permit limits',
          'Recovery AI — energy generation efficiency, nutrient recovery rate, and biosolids quality',
          'Industrial AI — process water quality achievement, reuse rate, and discharge compliance',
          'Compliance AI — regulatory parameter tracking accuracy and violation prediction lead time',
          'SCADA system reliability, lab data integration, and treatment plant data pipeline completeness',
        ],
        bizObsValue: 'Link treatment AI to actual operational costs and compliance — proving that AI-driven process control reduces chemical and energy costs while maintaining perfect regulatory compliance.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates treatment AI decisions with actual water quality outcomes, detecting when process optimization diverges from targets' },
          { capability: 'Business Analytics', detail: 'Compares AI-optimized treatment against conventional operations on cost per megaliter, energy use, and compliance metrics' },
          { capability: 'OpenPipeline', detail: 'Ingests SCADA data, lab results, and compliance metrics into water treatment observability' },
          { capability: 'Application Security', detail: 'Protects critical water treatment OT infrastructure and SCADA networks from cyber threats' },
        ],
      },
      {
        name: 'Bentley OpenFlows',
        description: 'Hydraulic modeling platform — AI-powered network simulation, capacity planning, flood modeling, and infrastructure resilience analysis for water utilities',
        category: 'Hydraulic Modeling & Planning',
        useCases: [
          'Network modeling AI — monitoring hydraulic simulation accuracy and calibration quality',
          'Capacity AI — tracking growth scenario analysis and infrastructure investment optimization',
          'Flood AI — monitoring urban flood prediction accuracy and risk zone identification',
          'Resilience AI — tracking infrastructure vulnerability assessment and failure cascade prediction',
        ],
        monitoringPoints: [
          'Modeling AI — simulation accuracy vs field measurements, calibration quality scoring',
          'Capacity AI — growth prediction accuracy, investment optimization value, and scenario reliability',
          'Flood AI — prediction accuracy by event severity, lead time, and spatial precision',
          'Resilience AI — vulnerability scoring accuracy and cascade prediction reliability',
          'Model computation performance, GIS integration reliability, and scenario processing throughput',
        ],
        bizObsValue: 'Measure hydraulic AI accuracy against actual network behavior — proving that AI-driven modeling enables better infrastructure investment decisions and flood preparedness.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects modeling AI calibration drift — alerting when hydraulic predictions diverge from field measurements' },
          { capability: 'OpenPipeline', detail: 'Ingests sensor data, model outputs, and GIS data into water infrastructure planning observability' },
          { capability: 'Business Analytics', detail: 'Quantifies modeling AI value — measuring investment optimization savings and flood damage avoidance from AI predictions' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures modeling platform performance for time-critical flood prediction and emergency scenario analysis' },
        ],
      },
    ],
    journeys: [
      { name: 'Leak Detection', configFile: 'config-water-leak-detection.json' },
      { name: 'Treatment Optimization', configFile: 'config-water-treatment.json' },
    ],
    kpis: ['Non-revenue water %', 'Treatment cost per ML', 'Compliance rate %', 'Burst frequency'],
  },
  {
    id: 'consulting',
    icon: '💼',
    industry: 'Consulting & Professional Services',
    color: '#455a64',
    tagline: 'AI-augmented expertise — every engagement, observable',
    description: 'Consulting and professional services firms deploy AI for resource allocation, project profitability prediction, knowledge management, proposal automation, and client insight generation. When staffing AI assigns wrong expertise, profitability AI misestimates project margins, or knowledge AI surfaces irrelevant precedents, utilization drops and margins shrink. Dynatrace ensures AI-driven professional services operations are profitable, efficient, and client-delighting.',
    painPoints: [
      'Resource allocation AI assigning consultants with mismatched skills, reducing engagement quality and utilization',
      'Profitability AI misestimating project margins, leading to write-offs and pricing errors on proposals',
      'Knowledge management AI surfacing irrelevant precedents and deliverable templates, wasting consultant time',
      'Proposal automation AI generating generic responses that fail to differentiate in competitive pursuits',
      'Client insight AI missing account expansion signals, leaving revenue growth opportunities on the table',
    ],
    roiPoints: [
      'Monitor staffing AI accuracy — increasing consultant utilization by 12% through skill-matched resource allocation',
      'Track profitability AI predictions — reducing project write-offs by 40% through accurate margin forecasting',
      'Validate knowledge AI relevance — saving 5+ hours per consultant per week through precise precedent matching',
      'Ensure proposal AI quality — increasing win rates by 20% through AI-personalized, differentiated responses',
      'Measure client AI signals — identifying 60% more expansion opportunities through proactive account intelligence',
    ],
    integrations: [
      {
        name: 'ServiceNow',
        description: 'Enterprise service platform — AI-powered project management, resource optimization, time tracking, and client service delivery for professional services organizations',
        category: 'Service Delivery Operations',
        useCases: [
          'Resource AI — monitoring skills-based staffing recommendations and utilization optimization',
          'Project AI — tracking project health prediction and risk identification accuracy',
          'Service AI — monitoring client request routing and SLA compliance prediction',
          'Workflow AI — tracking process automation effectiveness and exception handling quality',
        ],
        monitoringPoints: [
          'Resource AI — skill match accuracy, utilization rate improvement, and bench time reduction',
          'Project AI — health prediction accuracy, risk identification lead time, and budget adherence',
          'Service AI — request routing accuracy, SLA prediction calibration, and resolution speed',
          'Workflow AI — automation coverage, exception rate, and process cycle time reduction',
          'Platform integration reliability, workflow execution performance, and reporting pipeline freshness',
        ],
        bizObsValue: 'Connect staffing AI to actual engagement outcomes — proving that AI-driven resource allocation delivers higher utilization, better skill matching, and improved project margins.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects staffing AI quality changes — alerting when skill matching accuracy drops or utilization patterns deviate from targets' },
          { capability: 'Business Analytics', detail: 'Measures service delivery AI ROI — comparing utilization, project margins, and client satisfaction for AI-staffed vs manually staffed engagements' },
          { capability: 'Digital Experience Monitoring', detail: 'Monitors consultant-facing tools ensuring seamless access to AI-powered project and knowledge management systems' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures service platform reliability during peak periods with large concurrent project portfolios' },
        ],
      },
      {
        name: 'Mavenlink/Kantata',
        description: 'Professional services automation — AI-powered resource management, project financials, business intelligence, and client collaboration for services firms',
        category: 'Professional Services Automation',
        useCases: [
          'Resource management AI — monitoring demand forecasting and capacity planning optimization',
          'Financial AI — tracking project margin prediction accuracy and revenue recognition timing',
          'Business intelligence AI — monitoring engagement performance dashboards and trend identification',
          'Collaboration AI — tracking client communication optimization and deliverable quality scoring',
        ],
        monitoringPoints: [
          'Resource AI — demand forecast accuracy, capacity utilization, and over/under staffing prediction',
          'Financial AI — margin prediction accuracy, revenue forecast precision, and write-off prediction',
          'BI AI — performance trend detection accuracy, benchmark quality, and insight actionability',
          'Collaboration AI — communication effectiveness scoring and deliverable quality prediction',
          'PSA platform performance, time tracking integration, and financial system synchronization',
        ],
        bizObsValue: 'Link resource planning AI to actual firm financials — proving that AI-driven project management delivers better margins and utilization than spreadsheet-based planning.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates resource AI predictions with actual project outcomes, detecting when capacity planning needs adjustment' },
          { capability: 'Business Analytics', detail: 'Compares AI-managed project portfolios against manually-planned baselines on margin, utilization, and client satisfaction' },
          { capability: 'OpenPipeline', detail: 'Unifies project data, financial metrics, and resource utilization into professional services observability' },
          { capability: 'Application Security', detail: 'Protects client data and project intellectual property across cloud-based collaboration platforms' },
        ],
      },
      {
        name: 'Salesforce PSA',
        description: 'Professional services add-on — AI-powered engagement lifecycle management, revenue optimization, and client success intelligence for consulting organizations',
        category: 'Client Success & Revenue',
        useCases: [
          'Revenue AI — monitoring account expansion prediction and cross-sell opportunity scoring',
          'Client success AI — tracking client health scoring accuracy and churn risk identification',
          'Proposal AI — monitoring response quality scoring and competitive differentiation analysis',
          'Knowledge AI — tracking precedent search relevance and deliverable template recommendation',
        ],
        monitoringPoints: [
          'Revenue AI — expansion opportunity identification rate, cross-sell conversion, and pipeline accuracy',
          'Client AI — health score accuracy, churn prediction lead time, and retention intervention effectiveness',
          'Proposal AI — win rate by AI quality score, differentiation effectiveness, and response speed',
          'Knowledge AI — search relevance scoring, template recommendation acceptance, and time savings',
          'CRM integration reliability, opportunity pipeline synchronization, and reporting accuracy',
        ],
        bizObsValue: 'Measure client intelligence AI impact on revenue growth — proving that AI-driven account management identifies more expansion opportunities and reduces client churn.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects client AI accuracy shifts — alerting when health scores or expansion predictions diverge from actual client outcomes' },
          { capability: 'Business Analytics', detail: 'Quantifies client AI value — measuring revenue growth, retention improvement, and win rate increase from AI-driven engagement management' },
          { capability: 'OpenPipeline', detail: 'Ingests CRM data, engagement metrics, and client feedback into professional services revenue observability' },
          { capability: 'Digital Experience Monitoring', detail: 'Ensures client-facing portals and collaboration platforms deliver seamless professional experiences' },
        ],
      },
    ],
    journeys: [
      { name: 'Client Engagement', configFile: 'config-consulting-engagement.json' },
      { name: 'Resource Planning', configFile: 'config-consulting-resource.json' },
    ],
    kpis: ['Utilization rate %', 'Project margin %', 'Win rate', 'Client satisfaction'],
  },
  {
    id: 'datacentres',
    icon: '🖥️',
    industry: 'Data Centres & Cloud Infrastructure',
    color: '#37474f',
    tagline: 'AI-cooled compute — every rack, observable',
    description: 'Data centre operators deploy AI for cooling optimization, power management, capacity planning, workload placement, and predictive maintenance. When cooling AI wastes energy, power AI overloads circuits, or placement AI creates hotspots, PUE increases and availability suffers. Dynatrace ensures AI-managed data centre operations maximize efficiency while maintaining five-nines availability.',
    painPoints: [
      'Cooling AI wasting energy by overcooling or creating hot/cold aisle inefficiencies',
      'Power management AI overloading circuits or failing to balance load across PDUs',
      'Capacity planning AI miscalculating growth trajectories, causing stranded capacity or outages',
      'Workload placement AI creating thermal hotspots that degrade hardware and risk downtime',
      'Predictive maintenance AI missing critical UPS, generator, or HVAC degradation signals',
    ],
    roiPoints: [
      'Monitor cooling AI efficiency — reducing PUE by 15% through AI-optimized airflow and temperature management',
      'Track power AI balancing — achieving 99.999% power availability while maximizing rack density utilization',
      'Validate capacity AI forecasts — achieving ±5% accuracy on compute, power, and cooling capacity needs',
      'Ensure placement AI thermal safety — eliminating hotspot-driven throttling and maintaining optimal hardware life',
      'Measure maintenance AI predictions — reducing unplanned critical infrastructure failures by 70%',
    ],
    integrations: [
      {
        name: 'Schneider EcoStruxure',
        description: 'Data centre management platform — AI-powered cooling optimization, power monitoring, capacity planning, and sustainability management for enterprise and colocation facilities',
        category: 'Facility Management & Cooling',
        useCases: [
          'Cooling AI — monitoring CRAC/CRAH optimization decisions and airflow management effectiveness',
          'Power AI — tracking PDU load balancing, UPS efficiency, and power chain redundancy optimization',
          'Capacity AI — monitoring compute, power, and cooling capacity forecasting accuracy',
          'Sustainability AI — tracking PUE optimization, carbon intensity, and energy efficiency metrics',
        ],
        monitoringPoints: [
          'Cooling AI — temperature set-point accuracy, COP improvement, and cooling energy reduction',
          'Power AI — load balance accuracy, power chain efficiency, and redundancy compliance',
          'Capacity AI — forecast accuracy by resource type, stranded capacity identification, and growth tracking',
          'Sustainability AI — PUE trending, renewable energy utilization, and carbon offset tracking',
          'BMS integration reliability, sensor data quality, and real-time monitoring dashboard performance',
        ],
        bizObsValue: 'Connect cooling AI to actual energy costs — proving that AI-driven facility management delivers lower PUE and energy spend while maintaining availability SLAs.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects cooling AI efficiency changes — alerting when PUE trends upward or thermal management patterns indicate optimization degradation' },
          { capability: 'Business Analytics', detail: 'Measures facility AI ROI — comparing PUE, energy costs, and availability for AI-managed vs conventionally managed data centres' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Monitors DCIM platform reliability ensuring continuous visibility into critical infrastructure health' },
          { capability: 'OpenPipeline', detail: 'Unifies BMS data, power metrics, and environmental sensors into data centre operations observability' },
        ],
      },
      {
        name: 'Nlyte',
        description: 'DCIM platform — AI-powered asset management, capacity planning, change management, and compliance tracking for data centre operations',
        category: 'Asset & Capacity Management',
        useCases: [
          'Asset AI — monitoring automated asset discovery accuracy and lifecycle management optimization',
          'Capacity AI — tracking multi-dimensional capacity forecasting and what-if scenario analysis',
          'Change AI — monitoring automated workflow validation and risk assessment for data centre changes',
          'Compliance AI — tracking regulatory and standards compliance monitoring automation',
        ],
        monitoringPoints: [
          'Asset AI — discovery accuracy, lifecycle prediction quality, and refresh planning optimization',
          'Capacity AI — multi-resource forecast accuracy and scenario analysis reliability',
          'Change AI — workflow validation speed, risk assessment accuracy, and change success rate',
          'Compliance AI — standards compliance coverage, audit readiness scoring, and gap identification',
          'DCIM platform reliability, data synchronization freshness, and integration health',
        ],
        bizObsValue: 'Link capacity AI to actual utilization outcomes — proving that AI-driven planning maximizes facility ROI while preventing capacity-related incidents.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates capacity AI forecasts with actual growth patterns, identifying when planning models need updating' },
          { capability: 'Business Analytics', detail: 'Compares AI-planned capacity against actual utilization on efficiency, waste, and investment timing metrics' },
          { capability: 'OpenPipeline', detail: 'Ingests DCIM data, asset inventory, and capacity metrics into data centre planning observability' },
          { capability: 'Application Security', detail: 'Monitors access control and change management compliance for critical data centre infrastructure' },
        ],
      },
      {
        name: 'Vertiv',
        description: 'Critical infrastructure platform — AI-powered thermal management, power protection, monitoring, and service optimization for data centres and edge computing',
        category: 'Critical Infrastructure & Edge',
        useCases: [
          'Thermal AI — monitoring precision cooling unit optimization and predictive thermal management',
          'Power AI — tracking UPS health prediction and battery degradation modeling',
          'Edge AI — monitoring distributed edge site management and remote infrastructure optimization',
          'Service AI — tracking predictive maintenance scheduling and technician dispatch optimization',
        ],
        monitoringPoints: [
          'Thermal AI — cooling efficiency, temperature accuracy, and predictive maintenance lead time',
          'Power AI — UPS health prediction accuracy, battery SoH estimation, and failure anticipation',
          'Edge AI — remote site availability, environmental compliance, and capacity utilization',
          'Service AI — maintenance prediction accuracy, first-time fix rate, and mean time to repair',
          'Remote monitoring connectivity, alert accuracy, and service management integration',
        ],
        bizObsValue: 'Measure critical infrastructure AI impact on availability — proving that AI-driven predictive maintenance and thermal management deliver higher uptime at lower operating cost.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects infrastructure AI prediction quality — alerting when thermal, power, or maintenance predictions diverge from equipment behavior' },
          { capability: 'OpenPipeline', detail: 'Ingests UPS telemetry, cooling metrics, and service data into critical infrastructure observability' },
          { capability: 'Business Analytics', detail: 'Quantifies infrastructure AI value — measuring uptime improvement, maintenance cost reduction, and energy savings' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures monitoring platform reliability for real-time visibility across distributed data centre and edge sites' },
        ],
      },
    ],
    journeys: [
      { name: 'Cooling Optimization', configFile: 'config-datacentre-cooling.json' },
      { name: 'Capacity Planning', configFile: 'config-datacentre-capacity.json' },
    ],
    kpis: ['PUE', 'Availability %', 'Rack utilization', 'Energy cost per kW'],
  },
  {
    id: 'robotics',
    icon: '🤖',
    industry: 'Robotics & Warehouse Automation',
    color: '#e64a19',
    tagline: 'AI-directed fulfillment — every pick, observable',
    description: 'Warehouse and logistics companies deploy AI for robotic picking, autonomous navigation, inventory placement, order batching, and predictive maintenance. When picking AI selects wrong items, navigation AI creates path conflicts, or inventory AI misplaces SKUs, fulfillment speed drops and error rates climb. Dynatrace ensures AI-driven warehouse automation delivers the speed, accuracy, and throughput that modern commerce demands.',
    painPoints: [
      'Robotic picking AI selecting wrong items or failing to grasp products, reducing pick accuracy and speed',
      'Autonomous navigation AI creating path deadlocks and traffic jams in aisle intersections',
      'Inventory placement AI mislocating SKUs, increasing travel distance and pick times',
      'Order batching AI creating suboptimal wave plans, reducing throughput and missing SLA windows',
      'Predictive maintenance AI missing robot component failures, causing unplanned fleet downtime',
    ],
    roiPoints: [
      'Monitor picking AI accuracy — achieving 99.9% pick accuracy at 3x human picking speed with AI-guided robotics',
      'Track navigation AI efficiency — eliminating aisle deadlocks and increasing robot utilization by 25%',
      'Validate placement AI decisions — reducing average pick travel distance by 35% through AI-optimized slotting',
      'Ensure batching AI optimization — increasing wave throughput by 30% while maintaining 99.5% SLA compliance',
      'Measure maintenance AI predictions — reducing unplanned robot downtime by 60% through proactive component replacement',
    ],
    integrations: [
      {
        name: 'Amazon Robotics (Kiva)',
        description: 'Warehouse robotics platform — AI-powered goods-to-person fulfillment, robotic fleet management, inventory pod optimization, and automated sorting',
        category: 'Goods-to-Person Fulfillment',
        useCases: [
          'Fleet AI — monitoring robotic fleet coordination, pod assignment optimization, and traffic management',
          'Picking AI — tracking pick station efficiency, error detection, and item presentation optimization',
          'Inventory AI — monitoring pod placement optimization and SKU velocity-based slotting',
          'Throughput AI — tracking system-wide fulfillment rate optimization and bottleneck identification',
        ],
        monitoringPoints: [
          'Fleet AI — robot utilization rate, pod delivery time, and traffic congestion frequency',
          'Picking AI — pick accuracy, presentation quality, and error detection rate per station',
          'Inventory AI — pod placement efficiency, travel distance optimization, and rebalancing frequency',
          'Throughput AI — units per hour, SLA achievement rate, and bottleneck identification accuracy',
          'Robotic fleet connectivity, charging station management, and floor control system reliability',
        ],
        bizObsValue: 'Connect robotic fleet AI to actual fulfillment economics — proving that AI-directed goods-to-person automation delivers lower cost per pick with higher accuracy than manual picking.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects fleet AI degradation — alerting when robot utilization drops, traffic congestion increases, or pick accuracy declines' },
          { capability: 'Business Analytics', detail: 'Measures automation AI ROI — comparing cost per pick, accuracy, and throughput for robotic vs manual fulfillment' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Monitors warehouse management system and fleet control infrastructure ensuring real-time robotic coordination' },
          { capability: 'OpenPipeline', detail: 'Unifies robot telemetry, picking data, and inventory events into warehouse automation observability' },
        ],
      },
      {
        name: 'Locus Robotics',
        description: 'Collaborative robotics platform — AI-powered autonomous mobile robots for picking, putaway, and transport in warehouse and distribution centre operations',
        category: 'Collaborative Mobile Robotics',
        useCases: [
          'Navigation AI — monitoring autonomous path planning, obstacle avoidance, and multi-robot coordination',
          'Task AI — tracking dynamic work assignment optimization and multi-bot collaboration',
          'Productivity AI — monitoring picker-robot coordination efficiency and gamification effectiveness',
          'Scale AI — tracking fleet scaling decisions and zone assignment optimization',
        ],
        monitoringPoints: [
          'Navigation AI — path efficiency, obstacle avoidance success rate, and congestion prevention',
          'Task AI — assignment optimization quality, completion rate, and inter-bot coordination',
          'Productivity AI — units per hour per picker, robot utilization, and engagement metrics',
          'Scale AI — fleet sizing accuracy, zone coverage optimization, and demand-responsive scaling',
          'Robot fleet health, Wi-Fi connectivity, and WMS integration reliability',
        ],
        bizObsValue: 'Link collaborative robot AI to picker productivity — proving that AI-coordinated human-robot teams achieve higher throughput than either alone.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates task AI assignments with actual picker productivity, identifying optimization opportunities' },
          { capability: 'Business Analytics', detail: 'Compares collaborative robot teams against manual picking on units per hour, accuracy, and worker satisfaction' },
          { capability: 'Digital Experience Monitoring', detail: 'Monitors robot management dashboards and supervisor tools for fleet coordination visibility' },
          { capability: 'Application Security', detail: 'Secures robot fleet communication and warehouse management system integrations' },
        ],
      },
      {
        name: '6 River Systems',
        description: 'Warehouse automation platform — AI-powered collaborative robots, fulfillment optimization, real-time analytics, and warehouse workflow management',
        category: 'Fulfillment Workflow Automation',
        useCases: [
          'Workflow AI — monitoring end-to-end fulfillment workflow optimization and exception handling',
          'Routing AI — tracking zone-based routing optimization and dynamic rebalancing',
          'Analytics AI — monitoring real-time performance prediction and capacity forecasting',
          'Training AI — tracking automated onboarding optimization and operator skill development',
        ],
        monitoringPoints: [
          'Workflow AI — fulfillment cycle time, exception rate, and end-to-end optimization quality',
          'Routing AI — zone coverage efficiency, walk distance reduction, and rebalancing effectiveness',
          'Analytics AI — performance prediction accuracy, capacity forecast precision, and trend detection',
          'Training AI — onboarding speed, operator proficiency ramp, and error rate reduction',
          'Warehouse connectivity, robot fleet management, and real-time dashboard accuracy',
        ],
        bizObsValue: 'Measure workflow AI impact on fulfillment operations — proving that AI-orchestrated warehouse workflows achieve faster cycle times with fewer exceptions than rule-based systems.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects workflow AI quality shifts — alerting when fulfillment cycle times increase or exception handling patterns change' },
          { capability: 'OpenPipeline', detail: 'Ingests robot data, fulfillment events, and workforce metrics into warehouse automation observability' },
          { capability: 'Business Analytics', detail: 'Quantifies workflow AI value — measuring cycle time improvement, exception reduction, and labor efficiency gains' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures warehouse platform reliability for real-time robot coordination and workflow management' },
        ],
      },
    ],
    journeys: [
      { name: 'Order Fulfillment', configFile: 'config-robotics-fulfillment.json' },
      { name: 'Fleet Management', configFile: 'config-robotics-fleet.json' },
    ],
    kpis: ['Units per hour', 'Pick accuracy %', 'Robot utilization', 'Cost per pick'],
  },
  {
    id: 'social-media',
    icon: '📱',
    industry: 'Social Media & Platforms',
    color: '#1976d2',
    tagline: 'AI-curated feeds — every scroll, observable',
    description: 'Social media platforms deploy AI for content recommendation, moderation, ad targeting, creator monetization, and trend prediction. When feed AI shows irrelevant content, moderation AI misses harmful posts or overcensors, or ad AI undervalues inventory, user engagement drops and advertiser trust erodes. Dynatrace ensures AI-driven platform experiences are engaging, safe, and commercially optimized.',
    painPoints: [
      'Feed recommendation AI showing irrelevant or repetitive content, reducing session time and daily active users',
      'Content moderation AI missing harmful content or over-removing legitimate posts, damaging trust',
      'Ad targeting AI underperforming on relevance, reducing CPM and advertiser retention',
      'Creator monetization AI miscalculating revenue share, causing top creator churn',
      'Trend detection AI missing viral content early, ceding competitive advantage to rival platforms',
    ],
    roiPoints: [
      'Monitor feed AI quality — increasing average session time by 20% and DAU by 10% through personalized recommendations',
      'Track moderation AI accuracy — achieving 95% harmful content detection while keeping false positive rate below 2%',
      'Validate ad AI performance — increasing average CPM by 25% through AI-improved targeting relevance',
      'Ensure monetization AI fairness — maintaining creator satisfaction above 80% through transparent, accurate revenue attribution',
      'Measure trend AI speed — detecting 90% of viral content within 15 minutes of emergence',
    ],
    integrations: [
      {
        name: 'Meta Business Suite',
        description: 'Social media management platform — AI-powered content scheduling, audience insights, ad management, and performance analytics across Facebook, Instagram, and WhatsApp',
        category: 'Social Media Management',
        useCases: [
          'Content AI — monitoring post scheduling optimization and content type recommendation quality',
          'Audience AI — tracking segment identification accuracy and lookalike audience performance',
          'Ad AI — monitoring campaign delivery optimization and creative performance prediction',
          'Insights AI — tracking trend detection accuracy and competitive benchmarking quality',
        ],
        monitoringPoints: [
          'Content AI — scheduling optimization impact, content type performance, and engagement prediction',
          'Audience AI — segment accuracy, lookalike quality, and audience overlap metrics',
          'Ad AI — delivery optimization effectiveness, creative performance scoring, and ROAS impact',
          'Insights AI — trend detection speed, competitive analysis accuracy, and recommendation actionability',
          'API reliability, webhook delivery, and data synchronization freshness across platforms',
        ],
        bizObsValue: 'Connect content AI to actual engagement metrics — proving that AI-optimized posting and targeting deliver measurably better reach, engagement, and ROAS.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects content AI effectiveness changes — alerting when engagement patterns shift or audience targeting quality degrades' },
          { capability: 'Business Analytics', detail: 'Measures social AI ROI — comparing engagement, reach, and ROAS for AI-optimized vs manually managed social media campaigns' },
          { capability: 'Digital Experience Monitoring', detail: 'Monitors social management platform performance ensuring reliable scheduling and analytics access' },
          { capability: 'OpenPipeline', detail: 'Unifies social engagement data, ad performance, and audience metrics into social media observability' },
        ],
      },
      {
        name: 'TikTok for Business',
        description: 'Short-form video platform — AI-powered content creation tools, audience targeting, trend analytics, and creator marketplace for brand advertising',
        category: 'Short-Form Video & Creator',
        useCases: [
          'Creative AI — monitoring AI-assisted video creation tools and template recommendation quality',
          'Distribution AI — tracking content discovery algorithm performance and viral prediction',
          'Targeting AI — monitoring interest-based audience matching and behavioral targeting accuracy',
          'Creator AI — tracking creator matching for brand partnerships and content authenticity verification',
        ],
        monitoringPoints: [
          'Creative AI — template performance, creation tool adoption, and content quality scoring',
          'Distribution AI — discovery algorithm effectiveness, viral prediction accuracy, and reach optimization',
          'Targeting AI — audience match quality, behavioral prediction accuracy, and conversion attribution',
          'Creator AI — partnership match quality, authenticity scoring, and brand safety compliance',
          'Campaign API performance, real-time analytics latency, and creative asset processing speed',
        ],
        bizObsValue: 'Link distribution AI to actual brand outcomes — proving that AI-powered content discovery and targeting deliver measurable brand awareness and conversion for advertisers.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates distribution AI patterns with actual campaign outcomes, identifying when targeting or discovery effectiveness shifts' },
          { capability: 'Business Analytics', detail: 'Compares AI-targeted campaigns against broad targeting on engagement, view completion, and conversion metrics' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Monitors ad platform infrastructure ensuring reliable campaign delivery and real-time reporting' },
          { capability: 'Application Security', detail: 'Ensures brand safety compliance and protects advertiser data across platform integrations' },
        ],
      },
      {
        name: 'Reddit Ads',
        description: 'Community advertising platform — AI-powered contextual targeting, community insights, interest-based matching, and conversation-driven advertising for brands',
        category: 'Community & Contextual Advertising',
        useCases: [
          'Contextual AI — monitoring subreddit and thread-level contextual targeting accuracy',
          'Community AI — tracking community sentiment analysis and brand safety scoring',
          'Interest AI — monitoring interest-graph based audience targeting and matching quality',
          'Conversation AI — tracking promoted content placement optimization and engagement prediction',
        ],
        monitoringPoints: [
          'Contextual AI — targeting relevance score, placement accuracy, and brand alignment',
          'Community AI — sentiment analysis accuracy, brand safety scoring, and cultural context awareness',
          'Interest AI — interest-graph matching quality, audience expansion accuracy, and conversion correlation',
          'Conversation AI — placement effectiveness, engagement prediction accuracy, and community reception',
          'Ad delivery reliability, targeting API performance, and real-time bidding latency',
        ],
        bizObsValue: 'Measure contextual AI targeting impact on brand metrics — proving that AI-driven community-based advertising delivers higher engagement and brand consideration than traditional targeting.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects targeting AI quality shifts — alerting when contextual relevance or community sentiment scoring accuracy changes' },
          { capability: 'OpenPipeline', detail: 'Ingests community signals, ad performance data, and audience metrics into contextual advertising observability' },
          { capability: 'Business Analytics', detail: 'Quantifies contextual AI value — measuring engagement lift, brand consideration, and conversion improvement from AI targeting' },
          { capability: 'Digital Experience Monitoring', detail: 'Ensures ad platform user experience for advertisers managing campaigns and reviewing analytics' },
        ],
      },
    ],
    journeys: [
      { name: 'Content Distribution', configFile: 'config-social-content.json' },
      { name: 'Ad Targeting', configFile: 'config-social-targeting.json' },
    ],
    kpis: ['Daily active users', 'Engagement rate', 'Average CPM', 'Content moderation accuracy'],
  },
  {
    id: 'marketplaces',
    icon: '🛒',
    industry: 'Online Marketplaces',
    color: '#ff6f00',
    tagline: 'AI-matched commerce — every listing, observable',
    description: 'Online marketplaces deploy AI for search relevance, recommendation engines, seller quality scoring, dynamic pricing, and fraud prevention. When search AI returns irrelevant results, recommendation AI fails to personalize, or seller AI misscores quality, buyer trust drops and GMV declines. Dynatrace ensures AI-driven marketplace experiences convert browsers to buyers at scale.',
    painPoints: [
      'Search AI returning irrelevant results, causing buyer frustration and cart abandonment',
      'Recommendation AI failing to personalize, showing generic products that reduce conversion',
      'Seller scoring AI misranking quality merchants, degrading buyer experience and platform reputation',
      'Dynamic pricing AI setting incorrect prices, losing sales or eroding marketplace margins',
      'Fraud prevention AI missing counterfeit listings while flagging legitimate sellers',
    ],
    roiPoints: [
      'Monitor search AI relevance — increasing search-to-purchase conversion by 25% through AI-optimized ranking',
      'Track recommendation AI personalization — boosting average order value by 20% with relevant cross-sell suggestions',
      'Validate seller AI scoring — improving buyer satisfaction by 30% through accurate quality-based merchant ranking',
      'Ensure pricing AI accuracy — maximizing GMV while maintaining competitive positioning across categories',
      'Measure fraud AI precision — detecting 98% of counterfeit listings while keeping false positive rate below 1%',
    ],
    integrations: [
      {
        name: 'Mirakl',
        description: 'Enterprise marketplace platform — AI-powered seller onboarding, catalog management, order orchestration, and marketplace intelligence for B2B and B2C commerce',
        category: 'Marketplace Platform',
        useCases: [
          'Catalog AI — monitoring product matching accuracy and catalog enrichment quality',
          'Seller AI — tracking seller quality scoring, onboarding automation, and performance management',
          'Order AI — monitoring order routing optimization and fulfillment partner selection',
          'Intelligence AI — tracking marketplace health metrics and competitive positioning analysis',
        ],
        monitoringPoints: [
          'Catalog AI — product match accuracy, duplicate detection rate, and enrichment quality scoring',
          'Seller AI — quality score accuracy, onboarding success rate, and performance prediction',
          'Order AI — routing optimization effectiveness, fulfillment SLA achievement, and cost optimization',
          'Intelligence AI — GMV prediction accuracy, category health scoring, and competitive insight quality',
          'Marketplace platform reliability, API throughput, and integration with existing e-commerce systems',
        ],
        bizObsValue: 'Connect marketplace AI to actual GMV performance — proving that AI-driven seller management and catalog intelligence deliver higher buyer conversion and satisfaction.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects marketplace AI quality issues — alerting when catalog matching degrades, seller scores miscalibrate, or order routing becomes suboptimal' },
          { capability: 'Business Analytics', detail: 'Measures marketplace AI ROI — comparing GMV, seller performance, and buyer satisfaction for AI-managed vs manually curated marketplace operations' },
          { capability: 'Digital Experience Monitoring', detail: 'Monitors buyer and seller marketplace experiences ensuring fast search, smooth checkout, and reliable seller dashboards' },
          { capability: 'OpenPipeline', detail: 'Unifies catalog data, seller metrics, and order events into marketplace operations observability' },
        ],
      },
      {
        name: 'Commercetools',
        description: 'Composable commerce platform — AI-powered product discovery, personalization, cart optimization, and headless commerce orchestration for enterprise marketplaces',
        category: 'Commerce & Discovery',
        useCases: [
          'Discovery AI — monitoring product search ranking accuracy and faceted navigation optimization',
          'Personalization AI — tracking real-time product recommendation relevance and conversion impact',
          'Cart AI — monitoring cross-sell and upsell recommendation timing and effectiveness',
          'Commerce AI — tracking checkout optimization and payment method recommendation',
        ],
        monitoringPoints: [
          'Discovery AI — search ranking quality, zero-result rate, and category navigation effectiveness',
          'Personalization AI — recommendation click-through rate, conversion impact, and revenue attribution',
          'Cart AI — cross-sell acceptance rate, upsell conversion, and average order value impact',
          'Commerce AI — checkout completion rate, payment optimization, and abandonment reduction',
          'Commerce API performance, headless content delivery, and multi-storefront synchronization',
        ],
        bizObsValue: 'Link discovery AI to actual conversion metrics — proving that AI-powered product search and personalization measurably increase conversion rates and average order value.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates discovery AI changes with conversion patterns, detecting when search relevance or personalization quality shifts' },
          { capability: 'Business Analytics', detail: 'Compares AI-powered commerce against baseline on conversion rate, AOV, and revenue per session metrics' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Monitors composable commerce infrastructure ensuring API-first performance at scale' },
          { capability: 'Application Security', detail: 'Protects customer data and payment flows across headless commerce architecture' },
        ],
      },
      {
        name: 'Algolia',
        description: 'Search and discovery platform — AI-powered search relevance, personalization, recommendations, and analytics for marketplace and e-commerce applications',
        category: 'Search & Recommendation',
        useCases: [
          'Search AI — monitoring query understanding, typo tolerance, and relevance ranking optimization',
          'Recommend AI — tracking collaborative filtering accuracy and complementary product suggestions',
          'Personalization AI — monitoring user-level personalization quality and A/B test velocity',
          'Analytics AI — tracking search analytics insights and conversion funnel optimization',
        ],
        monitoringPoints: [
          'Search AI — relevance scoring accuracy, query understanding rate, and zero-result frequency',
          'Recommend AI — click-through rate, conversion attribution, and recommendation diversity',
          'Personalization AI — personalization lift measurement, segment accuracy, and test velocity',
          'Analytics AI — insight actionability, funnel identification accuracy, and opportunity sizing',
          'Search API latency (P50/P99), indexing throughput, and availability across regions',
        ],
        bizObsValue: 'Measure search AI impact on marketplace conversion — proving that AI-powered search and recommendations directly drive higher revenue per search session.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects search AI quality degradation — alerting when relevance scores drop, zero-result rates increase, or recommendation quality declines' },
          { capability: 'Digital Experience Monitoring', detail: 'Ensures sub-100ms search response times and seamless discovery experiences across all marketplace surfaces' },
          { capability: 'Business Analytics', detail: 'Quantifies search AI value — measuring revenue per search, conversion rate improvement, and click-through rate from AI-ranked results' },
          { capability: 'OpenPipeline', detail: 'Ingests search queries, click streams, and conversion data into search and discovery observability' },
        ],
      },
    ],
    journeys: [
      { name: 'Product Discovery', configFile: 'config-marketplace-discovery.json' },
      { name: 'Seller Management', configFile: 'config-marketplace-seller.json' },
    ],
    kpis: ['GMV', 'Conversion rate', 'Search relevance score', 'Seller satisfaction'],
  },
  {
    id: 'publishing',
    icon: '📰',
    industry: 'Publishing & News',
    color: '#424242',
    tagline: 'AI-curated journalism — every story, observable',
    description: 'Publishers and news organizations deploy AI for content recommendation, paywall optimization, audience segmentation, ad yield management, and automated journalism. When recommendation AI creates filter bubbles, paywall AI blocks valuable readers, or ad AI undermonetizes premium content, subscriber growth stalls and revenue declines. Dynatrace ensures AI-driven publishing delivers engaged audiences and sustainable business models.',
    painPoints: [
      'Content recommendation AI creating echo chambers that reduce content diversity and long-term engagement',
      'Paywall AI blocking high-potential readers or letting habitual free-riders access premium content',
      'Ad yield AI underpricing premium editorial environments, leaving revenue on the table',
      'Audience segmentation AI misclassifying readers, delivering irrelevant newsletter and push notifications',
      'Automated content AI producing low-quality summaries that damage editorial credibility',
    ],
    roiPoints: [
      'Monitor recommendation AI balance — increasing pageviews per session by 25% while maintaining content diversity above 70%',
      'Track paywall AI conversion — increasing subscriber conversion by 30% through AI-optimized meter limits and offer timing',
      'Validate ad AI pricing — increasing programmatic CPM by 20% through AI-driven contextual and audience-based yield optimization',
      'Ensure audience AI accuracy — increasing newsletter open rates by 35% through precise segment-matched content delivery',
      'Measure content AI quality — achieving human-equivalent quality scores on automated summaries while reducing production costs by 40%',
    ],
    integrations: [
      {
        name: 'Piano',
        description: 'Digital experience platform — AI-powered paywall management, subscription optimization, audience segmentation, and content analytics for publishers',
        category: 'Subscription & Paywall',
        useCases: [
          'Paywall AI — monitoring dynamic paywall decisions, meter limits, and propensity-based offer timing',
          'Subscription AI — tracking churn prediction accuracy and retention campaign effectiveness',
          'Audience AI — monitoring reader segmentation quality and engagement scoring',
          'Commerce AI — tracking offer optimization and pricing elasticity for subscription plans',
        ],
        monitoringPoints: [
          'Paywall AI — conversion rate by meter position, propensity score calibration, and offer acceptance rate',
          'Subscription AI — churn prediction accuracy, retention intervention effectiveness, and LTV optimization',
          'Audience AI — segment classification accuracy, engagement score correlation, and recency metrics',
          'Commerce AI — price sensitivity detection, offer conversion by plan type, and upgrade rate',
          'Platform integration reliability, paywall rendering performance, and analytics pipeline freshness',
        ],
        bizObsValue: 'Connect paywall AI to actual subscriber economics — proving that AI-optimized metering and offer timing drive higher conversion and longer subscriber lifetimes.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects paywall AI effectiveness shifts — alerting when conversion rates drop or propensity scoring becomes miscalibrated' },
          { capability: 'Business Analytics', detail: 'Measures subscription AI ROI — comparing conversion rates, ARPU, and churn for AI-optimized vs static paywall configurations' },
          { capability: 'Digital Experience Monitoring', detail: 'Ensures seamless reader experience across paywall interactions, subscription flows, and content delivery' },
          { capability: 'OpenPipeline', detail: 'Unifies reader behavior, subscription data, and content engagement into publishing observability' },
        ],
      },
      {
        name: 'Chartbeat',
        description: 'Content analytics platform — AI-powered real-time audience insights, editorial analytics, engagement optimization, and headline testing for newsrooms',
        category: 'Editorial Analytics',
        useCases: [
          'Engagement AI — monitoring real-time content performance prediction and trending detection',
          'Headline AI — tracking A/B testing optimization speed and headline performance prediction',
          'Distribution AI — monitoring social and search referral optimization and content placement',
          'Loyalty AI — tracking reader recirculation quality and habit-forming content identification',
        ],
        monitoringPoints: [
          'Engagement AI — content performance prediction accuracy, engaged time optimization, and scroll depth',
          'Headline AI — A/B test velocity, headline prediction accuracy, and click-through improvement',
          'Distribution AI — referral source optimization, social sharing prediction, and SEO content scoring',
          'Loyalty AI — recirculation effectiveness, return visit prediction, and habit strength scoring',
          'Data collection reliability, real-time dashboard performance, and editorial tool responsiveness',
        ],
        bizObsValue: 'Link editorial AI to actual reader engagement — proving that AI-driven content analytics and optimization deliver measurably better engaged time and reader loyalty.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates editorial AI insights with actual content performance, detecting when recommendation patterns create engagement declines' },
          { capability: 'Business Analytics', detail: 'Compares AI-optimized editorial decisions against manual approaches on engaged time, pageviews, and subscriber conversion' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Monitors real-time analytics infrastructure ensuring instant editorial visibility during breaking news' },
          { capability: 'Digital Experience Monitoring', detail: 'Tracks reader experience quality across content delivery and advertising co-existence' },
        ],
      },
      {
        name: 'Arc XP',
        description: 'Content management platform — AI-powered publishing workflows, content distribution, personalization, and commerce for enterprise news and media organizations',
        category: 'Content Management & Distribution',
        useCases: [
          'Distribution AI — monitoring multi-channel content publishing optimization and timing',
          'Personalization AI — tracking homepage and section front personalization quality',
          'Workflow AI — monitoring editorial workflow automation and content production optimization',
          'Commerce AI — tracking content monetization optimization across subscription and advertising',
        ],
        monitoringPoints: [
          'Distribution AI — cross-platform reach optimization, timing effectiveness, and format adaptation',
          'Personalization AI — homepage CTR, section relevance, and reader satisfaction by segment',
          'Workflow AI — production cycle time, automation coverage, and editorial efficiency',
          'Commerce AI — revenue per page, ad-subscription balance, and monetization optimization',
          'CMS performance, CDN delivery speed, and content API reliability under breaking news traffic',
        ],
        bizObsValue: 'Measure CMS AI impact on publishing efficiency and reader engagement — proving that AI-powered content management delivers better reach with faster production cycles.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects distribution AI quality changes — alerting when content reach, personalization quality, or publishing performance degrades' },
          { capability: 'OpenPipeline', detail: 'Ingests content performance, reader behavior, and revenue data into publishing operations observability' },
          { capability: 'Business Analytics', detail: 'Quantifies CMS AI value — measuring production efficiency, content reach, and revenue per article for AI-assisted vs traditional workflows' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures CMS reliability and CDN performance during traffic spikes from breaking news events' },
        ],
      },
    ],
    journeys: [
      { name: 'Reader Engagement', configFile: 'config-publishing-engagement.json' },
      { name: 'Subscription Conversion', configFile: 'config-publishing-subscription.json' },
    ],
    kpis: ['Subscriber conversion %', 'Engaged time', 'ARPU', 'Ad CPM'],
  },
  {
    id: 'music',
    icon: '🎵',
    industry: 'Music & Audio',
    color: '#1db954',
    tagline: 'AI-tuned listening — every stream, observable',
    description: 'Music and audio platforms deploy AI for playlist curation, music discovery, royalty calculation, audio quality optimization, and creator analytics. When playlist AI curates poorly, discovery AI fails to surface new artists, or royalty AI miscalculates payments, listener retention drops and creator trust erodes. Dynatrace ensures AI-driven audio experiences keep listeners engaged and creators fairly compensated.',
    painPoints: [
      'Playlist curation AI creating repetitive or mismatched playlists that reduce listening time',
      'Music discovery AI failing to surface relevant new artists, reducing platform differentiation',
      'Royalty calculation AI miscounting stream attributions, creating payment disputes with labels and artists',
      'Audio quality AI failing to adapt bitrate to network conditions, causing buffering and dropouts',
      'Podcast recommendation AI showing irrelevant episodes, reducing spoken-word engagement',
    ],
    roiPoints: [
      'Monitor playlist AI quality — increasing average listening time by 20% through AI-curated, personalized playlists',
      'Track discovery AI effectiveness — increasing new artist discovery by 35% and emerging artist streams by 50%',
      'Validate royalty AI accuracy — achieving 99.99% stream attribution accuracy, eliminating payment disputes',
      'Ensure audio AI quality — maintaining <0.1% buffering rate through AI-adaptive bitrate optimization',
      'Measure podcast AI relevance — increasing podcast listening hours by 30% through AI-personalized episode recommendations',
    ],
    integrations: [
      {
        name: 'Spotify for Developers',
        description: 'Music streaming platform — AI-powered personalization, playlist generation, audio analysis, and creator tools for music and podcast distribution',
        category: 'Music Streaming & Personalization',
        useCases: [
          'Personalization AI — monitoring Discover Weekly, Daily Mix, and radio quality for listener retention',
          'Audio AI — tracking music analysis accuracy for mood, energy, and genre classification',
          'Creator AI — monitoring artist recommendation placement and playlist inclusion algorithms',
          'Podcast AI — tracking episode recommendation relevance and spoken-word discovery effectiveness',
        ],
        monitoringPoints: [
          'Personalization AI — playlist skip rate, save rate, listening duration, and repeat rate',
          'Audio AI — genre classification accuracy, mood detection, and tempo analysis quality',
          'Creator AI — recommendation placement effectiveness, new listener acquisition per artist',
          'Podcast AI — episode recommendation CTR, completion rate, and show subscription conversion',
          'Streaming service reliability, audio delivery latency, and content delivery network performance',
        ],
        bizObsValue: 'Connect personalization AI to actual listener retention — proving that AI-curated playlists and discovery drive measurably longer listening sessions and higher premium conversion.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects personalization AI quality shifts — alerting when skip rates increase, listening duration drops, or discovery effectiveness declines' },
          { capability: 'Business Analytics', detail: 'Measures music AI ROI — comparing listening time, premium conversion, and artist discovery for AI-personalized vs editorial playlists' },
          { capability: 'Digital Experience Monitoring', detail: 'Ensures flawless streaming experience with zero buffering across devices and network conditions' },
          { capability: 'OpenPipeline', detail: 'Unifies streaming data, listener behavior, and audio analysis into music platform observability' },
        ],
      },
      {
        name: 'SoundCloud',
        description: 'Audio platform — AI-powered music distribution, creator monetization, content discovery, and community engagement for independent artists',
        category: 'Creator Distribution & Monetization',
        useCases: [
          'Distribution AI — monitoring content recommendation quality and algorithmic promotion for indie creators',
          'Monetization AI — tracking fan-powered royalty calculation and creator payout optimization',
          'Discovery AI — monitoring genre trend detection and emerging artist identification',
          'Community AI — tracking engagement prediction for comments, reposts, and playlist additions',
        ],
        monitoringPoints: [
          'Distribution AI — recommendation effectiveness, creator reach growth, and algorithmic equity',
          'Monetization AI — royalty calculation accuracy, payout timeliness, and revenue per stream',
          'Discovery AI — trend detection speed, emerging artist identification accuracy, and genre expansion',
          'Community AI — engagement prediction accuracy, community health scoring, and creator retention',
          'Upload processing throughput, audio transcoding quality, and platform availability',
        ],
        bizObsValue: 'Link creator AI to actual monetization outcomes — proving that AI-driven distribution and fan-powered royalties deliver fairer compensation and faster audience growth for creators.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates distribution AI with creator growth patterns, detecting when recommendation equity or monetization accuracy shifts' },
          { capability: 'Business Analytics', detail: 'Compares AI-powered distribution against baseline on creator revenue, audience growth, and platform engagement metrics' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Monitors audio processing infrastructure ensuring reliable upload, transcoding, and streaming at creator scale' },
          { capability: 'Application Security', detail: 'Protects creator content, payment data, and intellectual property across the distribution platform' },
        ],
      },
      {
        name: 'DistroKid',
        description: 'Music distribution platform — AI-powered upload processing, rights management, royalty tracking, and multi-platform distribution for independent musicians',
        category: 'Distribution & Rights Management',
        useCases: [
          'Distribution AI — monitoring automated upload processing quality and metadata validation',
          'Rights AI — tracking copyright detection accuracy and rights conflict resolution',
          'Royalty AI — monitoring cross-platform earning aggregation and payment accuracy',
          'Analytics AI — tracking streaming performance insights and platform comparison intelligence',
        ],
        monitoringPoints: [
          'Distribution AI — upload processing speed, metadata accuracy, and platform delivery success rate',
          'Rights AI — copyright detection accuracy, false claim rate, and resolution speed',
          'Royalty AI — aggregation accuracy, payment timing, and cross-platform reconciliation quality',
          'Analytics AI — insight accuracy, trend detection, and platform comparison reliability',
          'Upload pipeline throughput, multi-platform API reliability, and payment processing accuracy',
        ],
        bizObsValue: 'Measure distribution AI impact on creator experience — proving that AI-automated music distribution delivers faster, more accurate uploads with better royalty transparency.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects distribution pipeline AI issues — alerting when upload processing quality drops or royalty aggregation accuracy declines' },
          { capability: 'OpenPipeline', detail: 'Ingests upload data, distribution events, and royalty streams into music distribution observability' },
          { capability: 'Business Analytics', detail: 'Quantifies distribution AI efficiency — measuring upload speed, delivery accuracy, and royalty transparency improvement' },
          { capability: 'Digital Experience Monitoring', detail: 'Ensures creator dashboard responsiveness for real-time streaming analytics and earnings tracking' },
        ],
      },
    ],
    journeys: [
      { name: 'Music Discovery', configFile: 'config-music-discovery.json' },
      { name: 'Creator Distribution', configFile: 'config-music-distribution.json' },
    ],
    kpis: ['Listening time', 'Skip rate', 'Discovery rate', 'Creator payout accuracy'],
  },
  {
    id: 'accounting',
    icon: '📊',
    industry: 'Accounting & Audit',
    color: '#1a237e',
    tagline: 'AI-audited accuracy — every transaction, observable',
    description: 'Accounting firms and audit practices deploy AI for automated bookkeeping, anomaly detection, audit sampling, tax optimization, and regulatory compliance. When bookkeeping AI misclassifies transactions, audit AI selects poor samples, or tax AI applies wrong rules, financial statements become unreliable and regulatory risk escalates. Dynatrace ensures AI-driven accounting and audit processes are accurate, compliant, and trustworthy.',
    painPoints: [
      'Automated bookkeeping AI misclassifying transactions, requiring manual correction and delaying close',
      'Audit sampling AI selecting non-representative samples, missing material misstatements',
      'Tax optimization AI applying outdated or incorrect rules, creating compliance exposure',
      'Anomaly detection AI generating excessive false positives, wasting auditor investigation time',
      'Compliance AI missing regulatory changes, leaving organizations exposed to new requirements',
    ],
    roiPoints: [
      'Monitor bookkeeping AI accuracy — achieving 98% correct classification, reducing month-end close time by 40%',
      'Track audit AI sampling — increasing material misstatement detection by 50% through risk-weighted AI sampling',
      'Validate tax AI compliance — maintaining 100% rule accuracy across jurisdictions, eliminating penalty exposure',
      'Ensure anomaly AI precision — reducing auditor false positive investigation by 70% while catching 95% of true anomalies',
      'Measure compliance AI coverage — detecting 100% of applicable regulatory changes within 48 hours of publication',
    ],
    integrations: [
      {
        name: 'Xero',
        description: 'Cloud accounting platform — AI-powered bank reconciliation, invoice processing, expense categorization, and financial reporting for small and medium businesses',
        category: 'Cloud Accounting & Automation',
        useCases: [
          'Reconciliation AI — monitoring automated bank matching accuracy and suggestion quality',
          'Invoice AI — tracking automated data extraction accuracy and coding recommendations',
          'Categorization AI — monitoring expense classification accuracy and rule learning effectiveness',
          'Reporting AI — tracking financial insight generation and cash flow prediction accuracy',
        ],
        monitoringPoints: [
          'Reconciliation AI — match accuracy, suggestion acceptance rate, and unmatched transaction rate',
          'Invoice AI — data extraction accuracy, coding recommendation acceptance, and processing speed',
          'Categorization AI — classification accuracy, rule adaptation speed, and correction frequency',
          'Reporting AI — cash flow prediction accuracy, insight relevance, and forecast reliability',
          'Platform reliability, bank feed integration health, and multi-entity synchronization',
        ],
        bizObsValue: 'Connect accounting AI to actual bookkeeping efficiency — proving that AI automation reduces manual data entry while maintaining financial accuracy standards.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects accounting AI accuracy shifts — alerting when classification accuracy drops or reconciliation match rates decline' },
          { capability: 'Business Analytics', detail: 'Measures accounting AI ROI — comparing bookkeeping time, error rates, and close speed for AI-automated vs manual processes' },
          { capability: 'Digital Experience Monitoring', detail: 'Monitors accountant and client access to cloud accounting ensuring responsive financial management tools' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures accounting platform reliability and bank feed integration health for continuous financial data flow' },
        ],
      },
      {
        name: 'QuickBooks / Intuit',
        description: 'Financial management platform — AI-powered expense tracking, tax preparation, invoicing, and business insights for SMBs and self-employed professionals',
        category: 'Financial Management & Tax',
        useCases: [
          'Expense AI — monitoring receipt scanning accuracy and automatic categorization quality',
          'Tax AI — tracking deduction identification accuracy and tax optimization recommendations',
          'Cash flow AI — monitoring cash flow prediction and bill payment optimization',
          'Business AI — tracking financial health scoring and growth recommendation quality',
        ],
        monitoringPoints: [
          'Expense AI — receipt data extraction accuracy, categorization quality, and duplicate detection',
          'Tax AI — deduction identification rate, rule accuracy by jurisdiction, and optimization value',
          'Cash flow AI — prediction accuracy, payment timing optimization, and liquidity scoring',
          'Business AI — health score accuracy, growth recommendation relevance, and insight value',
          'Platform performance, mobile app responsiveness, and third-party integration reliability',
        ],
        bizObsValue: 'Link financial AI to actual tax outcomes — proving that AI-driven deduction finding and categorization save measurably more money than manual tax preparation.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates tax AI recommendations with actual filing outcomes, detecting when deduction accuracy or rule application degrades' },
          { capability: 'Business Analytics', detail: 'Compares AI-assisted financial management against manual approaches on tax savings, accuracy, and time efficiency' },
          { capability: 'OpenPipeline', detail: 'Unifies financial transactions, tax calculations, and business metrics into accounting observability' },
          { capability: 'Application Security', detail: 'Protects sensitive financial data and tax information across cloud accounting and mobile platforms' },
        ],
      },
      {
        name: 'Wolters Kluwer',
        description: 'Professional information platform — AI-powered audit analytics, tax research, regulatory compliance, and accounting workflow automation for professional firms',
        category: 'Audit & Compliance Intelligence',
        useCases: [
          'Audit analytics AI — monitoring full-population testing accuracy and anomaly detection for audit engagements',
          'Tax research AI — tracking regulatory interpretation accuracy and treatment recommendation quality',
          'Compliance AI — monitoring regulatory change tracking and impact assessment automation',
          'Workflow AI — tracking audit procedure automation and engagement quality management',
        ],
        monitoringPoints: [
          'Audit AI — anomaly detection accuracy, sample coverage quality, and material misstatement identification',
          'Tax AI — research accuracy, treatment recommendation quality, and regulatory currency',
          'Compliance AI — change detection speed, impact assessment accuracy, and coverage completeness',
          'Workflow AI — procedure automation rate, quality control scoring, and engagement efficiency',
          'Platform reliability, knowledge base freshness, and multi-firm deployment management',
        ],
        bizObsValue: 'Measure audit AI impact on engagement quality — proving that AI-powered analytics find more anomalies with fewer audit hours than traditional sampling approaches.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects audit AI quality changes — alerting when detection accuracy shifts or compliance coverage gaps emerge' },
          { capability: 'OpenPipeline', detail: 'Ingests audit data, regulatory feeds, and compliance events into audit intelligence observability' },
          { capability: 'Business Analytics', detail: 'Quantifies audit AI value — measuring anomaly detection improvement, audit efficiency gains, and compliance coverage' },
          { capability: 'Digital Experience Monitoring', detail: 'Ensures professional platform responsiveness for auditors accessing AI analytics and research tools' },
        ],
      },
    ],
    journeys: [
      { name: 'Audit Analytics', configFile: 'config-accounting-audit.json' },
      { name: 'Tax Optimization', configFile: 'config-accounting-tax.json' },
    ],
    kpis: ['Classification accuracy %', 'Close cycle time', 'Anomaly detection rate', 'Tax accuracy'],
  },
  {
    id: 'esg',
    icon: '🌱',
    industry: 'Environmental & ESG',
    color: '#2e7d32',
    tagline: 'AI-measured sustainability — every metric, observable',
    description: 'ESG and sustainability platforms deploy AI for carbon accounting, supply chain emissions tracking, ESG scoring, climate risk modeling, and regulatory reporting. When carbon AI miscounts emissions, scoring AI misrates companies, or risk AI underestimates climate exposure, greenwashing lawsuits follow and investor confidence drops. Dynatrace ensures AI-driven ESG measurement is accurate, auditable, and trustworthy.',
    painPoints: [
      'Carbon accounting AI miscounting Scope 1/2/3 emissions, creating regulatory and reputational risk',
      'ESG scoring AI using inconsistent methodologies, producing unreliable company ratings',
      'Climate risk AI underestimating physical and transition risk exposure for investment portfolios',
      'Supply chain AI failing to trace emissions through complex multi-tier supplier networks',
      'Reporting AI generating non-compliant disclosures that fail regulatory review',
    ],
    roiPoints: [
      'Monitor carbon AI accuracy — achieving 95% emissions measurement accuracy across Scope 1/2/3 categories',
      'Track scoring AI consistency — improving ESG rating stability and reducing methodology-driven volatility by 50%',
      'Validate climate AI modeling — achieving 85% climate risk prediction accuracy for portfolio stress testing',
      'Ensure supply chain AI traceability — mapping 90% of Scope 3 emissions through AI-powered supplier engagement',
      'Measure reporting AI compliance — maintaining 100% regulatory disclosure compliance across frameworks (CSRD, SEC, ISSB)',
    ],
    integrations: [
      {
        name: 'Persefoni',
        description: 'Carbon management platform — AI-powered carbon accounting, Scope 1/2/3 measurement, PCAF-aligned financial emissions, and climate disclosure automation',
        category: 'Carbon Accounting & Disclosure',
        useCases: [
          'Carbon AI — monitoring automated emissions calculation accuracy across Scope 1/2/3 categories',
          'Financial AI — tracking PCAF-aligned financed emissions calculation and portfolio footprinting',
          'Disclosure AI — monitoring regulatory report generation quality across CSRD, SEC, TCFD frameworks',
          'Reduction AI — tracking decarbonization pathway modeling and target-setting optimization',
        ],
        monitoringPoints: [
          'Carbon AI — emissions calculation accuracy, data coverage completeness, and methodology compliance',
          'Financial AI — financed emissions accuracy, asset-class coverage, and PCAF quality scoring',
          'Disclosure AI — report completeness, framework alignment accuracy, and audit trail quality',
          'Reduction AI — pathway feasibility scoring, target achievability, and scenario analysis quality',
          'Data ingestion pipeline reliability, emissions factor database freshness, and calculation engine performance',
        ],
        bizObsValue: 'Connect carbon AI to actual audit outcomes — proving that AI-driven emissions measurement delivers audit-ready accuracy while reducing manual data collection effort by 80%.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects carbon AI measurement drift — alerting when emissions calculations diverge from expected patterns or data quality degrades' },
          { capability: 'Business Analytics', detail: 'Measures carbon AI ROI — comparing measurement accuracy, data coverage, and reporting speed for AI-automated vs manual carbon accounting' },
          { capability: 'OpenPipeline', detail: 'Unifies emissions data, activity data, and regulatory frameworks into carbon management observability' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures carbon platform reliability during critical reporting periods and regulatory submission deadlines' },
        ],
      },
      {
        name: 'Watershed',
        description: 'Enterprise sustainability platform — AI-powered carbon measurement, supplier engagement, clean energy procurement, and climate action planning for large organizations',
        category: 'Enterprise Climate Action',
        useCases: [
          'Measurement AI — monitoring enterprise-wide emissions tracking and supplier data quality management',
          'Supplier AI — tracking supplier engagement effectiveness and emissions data collection automation',
          'Procurement AI — monitoring clean energy sourcing optimization and PPA evaluation',
          'Action AI — tracking climate commitment progress and intervention effectiveness measurement',
        ],
        monitoringPoints: [
          'Measurement AI — data quality scoring, coverage percentage, and estimation accuracy',
          'Supplier AI — engagement response rate, data quality improvement, and emissions verification',
          'Procurement AI — clean energy coverage, cost optimization, and additionality scoring',
          'Action AI — commitment tracking accuracy, intervention ROI, and progress trajectory',
          'Enterprise data integration health, supplier portal performance, and analytics dashboard reliability',
        ],
        bizObsValue: 'Link supplier engagement AI to actual Scope 3 reduction — proving that AI-driven supply chain programs deliver measurable emissions reductions with lower engagement costs.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates supplier AI engagement with actual emissions data quality and reduction outcomes' },
          { capability: 'Business Analytics', detail: 'Compares AI-driven supplier programs against manual outreach on data quality, response rates, and emissions reduction metrics' },
          { capability: 'Digital Experience Monitoring', detail: 'Monitors supplier engagement portal experience ensuring high completion rates for emissions data collection' },
          { capability: 'Application Security', detail: 'Protects sensitive corporate emissions data and supplier information across enterprise sustainability platforms' },
        ],
      },
      {
        name: 'Sphera',
        description: 'ESG performance platform — AI-powered environmental risk assessment, product lifecycle analysis, safety management, and sustainability reporting',
        category: 'ESG Risk & Lifecycle',
        useCases: [
          'Risk AI — monitoring environmental risk assessment accuracy and regulatory compliance prediction',
          'LCA AI — tracking product lifecycle carbon footprint calculation and hotspot identification',
          'Safety AI — monitoring EHS incident prediction and compliance management automation',
          'Reporting AI — tracking multi-framework ESG report generation and data validation',
        ],
        monitoringPoints: [
          'Risk AI — environmental risk score accuracy, regulatory prediction quality, and coverage',
          'LCA AI — lifecycle calculation accuracy, database coverage, and hotspot identification',
          'Safety AI — incident prediction accuracy, compliance tracking, and EHS performance',
          'Reporting AI — multi-framework alignment, data validation accuracy, and assurance readiness',
          'Platform integration with operational data sources, EHS systems, and supply chain databases',
        ],
        bizObsValue: 'Measure ESG risk AI accuracy against actual outcomes — proving that AI-driven environmental risk assessment identifies material risks earlier with fewer false positives.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects ESG AI accuracy shifts — alerting when risk scores, LCA calculations, or compliance predictions diverge from actual outcomes' },
          { capability: 'OpenPipeline', detail: 'Ingests operational data, safety events, and supply chain metrics into ESG performance observability' },
          { capability: 'Business Analytics', detail: 'Quantifies ESG AI value — measuring risk identification improvement, compliance cost reduction, and reporting efficiency' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures ESG platform reliability for continuous compliance monitoring and reporting deadline management' },
        ],
      },
    ],
    journeys: [
      { name: 'Carbon Accounting', configFile: 'config-esg-carbon.json' },
      { name: 'ESG Reporting', configFile: 'config-esg-reporting.json' },
    ],
    kpis: ['Emissions accuracy %', 'Data coverage', 'Reporting compliance', 'Scope 3 visibility'],
  },
  {
    id: 'waste',
    icon: '♻️',
    industry: 'Waste Management & Recycling',
    color: '#558b2f',
    tagline: 'AI-sorted sustainability — every bin, observable',
    description: 'Waste management companies deploy AI for route optimization, material sorting, contamination detection, fill-level monitoring, and recycling process optimization. When route AI creates inefficient schedules, sorting AI misclassifies materials, or fill-level AI miscalculates pickup urgency, costs increase and recycling rates suffer. Dynatrace ensures AI-driven waste operations maximize recycling rates while minimizing collection costs.',
    painPoints: [
      'Route optimization AI creating inefficient collection schedules, increasing fuel costs and emissions',
      'Material sorting AI misclassifying recyclables, contaminating recycling streams and reducing material value',
      'Fill-level AI miscalculating bin urgency, causing overflows or unnecessary empty-bin pickups',
      'Contamination detection AI missing contaminants that degrade recycling batch quality',
      'Process optimization AI failing to adapt to changing waste composition, reducing recycling yield',
    ],
    roiPoints: [
      'Monitor route AI efficiency — reducing collection miles by 25% and fuel costs by 20% through AI-optimized scheduling',
      'Track sorting AI accuracy — achieving 95% material classification accuracy, increasing recyclable material value by 30%',
      'Validate fill-level AI predictions — eliminating 90% of unnecessary pickups while preventing 99% of overflow events',
      'Ensure contamination AI detection — reducing recycling batch rejection by 60% through early contaminant identification',
      'Measure process AI adaptation — increasing recycling yield by 15% through AI-responsive processing adjustments',
    ],
    integrations: [
      {
        name: 'Rubicon',
        description: 'Waste management platform — AI-powered route optimization, fleet management, recycling analytics, and sustainability reporting for waste haulers and enterprises',
        category: 'Collection & Route Optimization',
        useCases: [
          'Route AI — monitoring dynamic route optimization effectiveness and schedule efficiency',
          'Fleet AI — tracking vehicle utilization, maintenance prediction, and driver performance',
          'Sustainability AI — monitoring waste diversion tracking and recycling rate optimization',
          'Analytics AI — tracking waste composition prediction and volume forecasting accuracy',
        ],
        monitoringPoints: [
          'Route AI — miles per stop, route efficiency score, and on-time pickup rate',
          'Fleet AI — vehicle utilization, maintenance prediction accuracy, and fuel efficiency',
          'Sustainability AI — diversion rate accuracy, recycling contribution tracking, and emissions reduction',
          'Analytics AI — volume prediction accuracy, composition estimation, and seasonal adjustment quality',
          'Platform connectivity, GPS tracking reliability, and driver mobile app performance',
        ],
        bizObsValue: 'Connect route AI to actual collection economics — proving that AI-optimized routing delivers lower cost per stop while maintaining pickup reliability.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects route AI efficiency changes — alerting when collection costs increase or service levels degrade due to routing quality' },
          { capability: 'Business Analytics', detail: 'Measures collection AI ROI — comparing cost per stop, miles driven, and service quality for AI-optimized vs fixed routes' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Monitors waste management platform ensuring real-time fleet tracking and route dispatch reliability' },
          { capability: 'OpenPipeline', detail: 'Unifies fleet telemetry, pickup data, and sustainability metrics into waste operations observability' },
        ],
      },
      {
        name: 'AMCS',
        description: 'Smart waste platform — AI-powered collection management, material processing, weighbridge automation, and circular economy analytics',
        category: 'Processing & Circular Economy',
        useCases: [
          'Processing AI — monitoring material recovery facility sorting optimization and throughput',
          'Weighbridge AI — tracking automated weighing accuracy and classification quality',
          'Customer AI — monitoring service level optimization and contamination feedback automation',
          'Circular AI — tracking material lifecycle tracking and secondary raw material market matching',
        ],
        monitoringPoints: [
          'Processing AI — sorting accuracy, recovery rate, and throughput optimization effectiveness',
          'Weighbridge AI — measurement accuracy, classification quality, and process speed',
          'Customer AI — service compliance rate, contamination notification effectiveness, and satisfaction',
          'Circular AI — material traceability accuracy, market matching quality, and value optimization',
          'Operational platform reliability, IoT sensor integration, and customer portal performance',
        ],
        bizObsValue: 'Link processing AI to actual material recovery rates — proving that AI-optimized sorting and processing delivers higher-value recyclable output.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates processing AI decisions with actual material recovery outcomes, identifying when sorting quality shifts' },
          { capability: 'Business Analytics', detail: 'Compares AI-optimized MRF operations against baseline on recovery rates, material value, and processing costs' },
          { capability: 'OpenPipeline', detail: 'Ingests processing line data, weighbridge events, and material flow metrics into recycling observability' },
          { capability: 'Digital Experience Monitoring', detail: 'Monitors customer portal and driver mobile app for collection scheduling and service management' },
        ],
      },
      {
        name: 'Greyparrot',
        description: 'Waste AI platform — AI-powered computer vision for waste composition analysis, material identification, and sorting quality monitoring at recycling facilities',
        category: 'AI Waste Composition Analysis',
        useCases: [
          'Vision AI — monitoring real-time waste stream composition analysis accuracy',
          'Sorting AI — tracking sorting line quality verification and missorting detection',
          'Composition AI — monitoring incoming waste characterization and contamination level estimation',
          'Reporting AI — tracking regulatory compliance data collection and EPR scheme reporting',
        ],
        monitoringPoints: [
          'Vision AI — material identification accuracy, classification speed, and coverage completeness',
          'Sorting AI — quality verification accuracy, missorting detection rate, and correction effectiveness',
          'Composition AI — characterization accuracy, contamination estimation, and composition trending',
          'Reporting AI — data quality for regulatory compliance, EPR scheme accuracy, and audit trail',
          'Camera system reliability, image processing throughput, and edge computing performance',
        ],
        bizObsValue: 'Measure computer vision AI impact on recycling quality — proving that AI-powered composition analysis enables higher purity outputs and better regulatory reporting.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects vision AI accuracy degradation — alerting when material identification rates drop or contamination detection misses increase' },
          { capability: 'OpenPipeline', detail: 'Ingests camera feeds, composition analysis, and sorting metrics into recycling quality observability' },
          { capability: 'Business Analytics', detail: 'Quantifies vision AI value — measuring purity improvement, material value increase, and compliance reporting efficiency' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures edge and cloud infrastructure reliability for real-time waste stream analysis' },
        ],
      },
    ],
    journeys: [
      { name: 'Collection Optimization', configFile: 'config-waste-collection.json' },
      { name: 'Material Sorting', configFile: 'config-waste-sorting.json' },
    ],
    kpis: ['Recycling rate %', 'Cost per tonne', 'Contamination rate', 'Collection efficiency'],
  },
  {
    id: 'food-delivery',
    icon: '🛵',
    industry: 'Food Delivery & Quick Commerce',
    color: '#d84315',
    tagline: 'AI-dispatched delivery — every order, observable',
    description: 'Food delivery and quick commerce companies deploy AI for order dispatching, delivery time prediction, driver assignment, dark store inventory, and demand forecasting. When dispatch AI assigns wrong drivers, ETA AI miscalculates delivery windows, or demand AI misforecasts meal prep volumes, late deliveries and food waste escalate. Dynatrace ensures AI-powered delivery achieves speed, accuracy, and efficiency at scale.',
    painPoints: [
      'Dispatch AI assigning suboptimal driver-order pairings, increasing delivery times and costs',
      'ETA prediction AI miscalculating delivery windows, causing customer dissatisfaction and cancellations',
      'Demand forecasting AI misestimating order volumes, leading to restaurant prep waste or stockouts',
      'Dark store AI failing to optimize inventory placement, increasing pick times and error rates',
      'Driver batching AI creating multi-order routes that degrade food quality through excessive transit time',
    ],
    roiPoints: [
      'Monitor dispatch AI accuracy — reducing average delivery time by 20% through optimal driver-order matching',
      'Track ETA AI reliability — achieving 90% delivery-within-promise accuracy, reducing cancellations by 35%',
      'Validate demand AI forecasting — reducing restaurant food waste by 25% and stockout events by 40%',
      'Ensure dark store AI efficiency — reducing average pick time by 30% through AI-optimized inventory slotting',
      'Measure batching AI quality — increasing driver throughput by 25% while maintaining food quality standards',
    ],
    integrations: [
      {
        name: 'DoorDash Drive',
        description: 'Delivery logistics platform — AI-powered order dispatching, Dasher assignment, ETA prediction, and last-mile delivery optimization for food and retail delivery',
        category: 'Last-Mile Delivery Operations',
        useCases: [
          'Dispatch AI — monitoring order-Dasher assignment optimization and batch delivery planning',
          'ETA AI — tracking delivery time prediction accuracy across zones, times, and order types',
          'Routing AI — monitoring last-mile path optimization considering real-time traffic and restaurant prep times',
          'Quality AI — tracking food quality scoring based on transit time and temperature management',
        ],
        monitoringPoints: [
          'Dispatch AI — assignment quality, driver utilization, and batch optimization effectiveness',
          'ETA AI — prediction accuracy by zone, time of day, and cuisine type, and customer satisfaction',
          'Routing AI — path efficiency, traffic adaptation quality, and multi-stop optimization',
          'Quality AI — on-time delivery rate, food quality scores, and customer complaint frequency',
          'Platform reliability, order processing throughput, and real-time driver tracking accuracy',
        ],
        bizObsValue: 'Connect dispatch AI to actual delivery economics — proving that AI-optimized assignment delivers faster, cheaper, and more reliable delivery than manual dispatch.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects dispatch AI degradation — alerting when delivery times increase, ETA accuracy drops, or driver utilization declines' },
          { capability: 'Business Analytics', detail: 'Measures delivery AI ROI — comparing cost per delivery, on-time rate, and customer satisfaction for AI-dispatched vs zone-based assignment' },
          { capability: 'Digital Experience Monitoring', detail: 'Ensures seamless ordering and real-time tracking experience across customer and driver apps' },
          { capability: 'OpenPipeline', detail: 'Unifies order data, driver telemetry, and delivery events into last-mile delivery observability' },
        ],
      },
      {
        name: 'Uber Direct',
        description: 'White-label delivery platform — AI-powered delivery matching, route optimization, and real-time logistics for merchants across food, grocery, and retail',
        category: 'Merchant Delivery Platform',
        useCases: [
          'Matching AI — monitoring merchant-courier assignment for multi-category delivery optimization',
          'Route AI — tracking multi-stop delivery route optimization across food, grocery, and retail orders',
          'Demand AI — monitoring zone-level demand prediction and courier pre-positioning efficiency',
          'Merchant AI — tracking store preparation time estimation and pickup coordination accuracy',
        ],
        monitoringPoints: [
          'Matching AI — courier assignment quality, cross-category delivery performance, and idle time',
          'Route AI — multi-stop efficiency, order sequence optimization, and total delivery time',
          'Demand AI — zone demand prediction accuracy, courier positioning effectiveness, and coverage',
          'Merchant AI — prep time estimation accuracy, pickup coordination, and wait time reduction',
          'API integration reliability, webhook delivery, and real-time tracking data freshness',
        ],
        bizObsValue: 'Link delivery matching AI to actual merchant outcomes — proving that AI-optimized white-label delivery achieves comparable or better service than dedicated fleet operations.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates matching AI with delivery outcomes, detecting when assignment quality degrades for specific merchant categories or zones' },
          { capability: 'Business Analytics', detail: 'Compares AI-matched delivery against merchant self-delivery on cost, speed, and customer satisfaction metrics' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Monitors delivery API infrastructure ensuring real-time order processing and tracking reliability' },
          { capability: 'Application Security', detail: 'Secures merchant integration APIs and customer data across the white-label delivery platform' },
        ],
      },
      {
        name: 'Deliverect',
        description: 'Order management platform — AI-powered multi-channel aggregation, menu synchronization, kitchen dispatch, and delivery analytics for restaurant operations',
        category: 'Restaurant Order Management',
        useCases: [
          'Aggregation AI — monitoring multi-platform order consolidation accuracy and dispatch priority',
          'Menu AI — tracking menu synchronization and dynamic availability management across platforms',
          'Kitchen AI — monitoring order preparation sequencing and capacity management',
          'Analytics AI — tracking cross-platform performance comparison and menu optimization insights',
        ],
        monitoringPoints: [
          'Aggregation AI — order consolidation accuracy, dispatch priority optimization, and error rate',
          'Menu AI — sync accuracy, availability update speed, and out-of-stock prevention rate',
          'Kitchen AI — preparation sequence optimization, capacity utilization, and estimated prep time accuracy',
          'Analytics AI — cross-platform comparison fairness, insight actionability, and revenue attribution',
          'Multi-platform integration reliability, POS synchronization, and order processing throughput',
        ],
        bizObsValue: 'Measure order management AI impact on restaurant operations — proving that AI-driven multi-platform aggregation reduces errors and improves kitchen efficiency.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects order management AI issues — alerting when aggregation errors increase, menu sync fails, or kitchen dispatch becomes suboptimal' },
          { capability: 'OpenPipeline', detail: 'Ingests multi-platform orders, kitchen events, and delivery data into restaurant operations observability' },
          { capability: 'Business Analytics', detail: 'Quantifies order management AI value — measuring error reduction, kitchen efficiency, and cross-platform revenue optimization' },
          { capability: 'Digital Experience Monitoring', detail: 'Monitors restaurant staff interaction with order management dashboards during peak service hours' },
        ],
      },
    ],
    journeys: [
      { name: 'Order Dispatch', configFile: 'config-delivery-dispatch.json' },
      { name: 'ETA Prediction', configFile: 'config-delivery-eta.json' },
    ],
    kpis: ['Delivery time', 'On-time rate %', 'Cost per delivery', 'Order accuracy'],
  },
  {
    id: 'lottery',
    icon: '🎰',
    industry: 'Lottery & Regulated Betting',
    color: '#6a1b9a',
    tagline: 'AI-regulated gaming — every wager, observable',
    description: 'Lottery and regulated betting operators deploy AI for responsible gambling detection, fraud prevention, odds optimization, player engagement, and regulatory compliance. When responsible gambling AI misses problem player signals, fraud AI fails to detect collusion, or compliance AI misreports to regulators, licenses are at risk. Dynatrace ensures AI-driven regulated gaming is safe, fair, and compliant.',
    painPoints: [
      'Responsible gambling AI missing problem player behavioral patterns, failing duty of care obligations',
      'Fraud detection AI failing to identify multi-account collusion and bonus abuse schemes',
      'Odds optimization AI creating unfair or non-compliant pricing, risking regulatory sanctions',
      'Player engagement AI over-targeting at-risk players, violating responsible marketing regulations',
      'Compliance AI failing to meet real-time reporting requirements for regulatory bodies',
    ],
    roiPoints: [
      'Monitor responsible AI detection — identifying 90% of at-risk players through behavioral AI before self-exclusion triggers',
      'Track fraud AI accuracy — detecting 95% of collusion and bonus abuse with <2% false positive rate',
      'Validate odds AI fairness — maintaining regulatory-compliant pricing while optimizing margin by 8%',
      'Ensure marketing AI compliance — achieving 100% responsible marketing adherence while maintaining engagement ROI',
      'Measure compliance AI reporting — maintaining 100% real-time regulatory reporting accuracy across jurisdictions',
    ],
    integrations: [
      {
        name: 'Scientific Games',
        description: 'Lottery technology platform — AI-powered game management, instant win validation, draw systems, and player analytics for lottery operators worldwide',
        category: 'Lottery Operations & Gaming',
        useCases: [
          'Draw AI — monitoring random number generation integrity and draw system reliability',
          'Validation AI — tracking instant win ticket validation accuracy and fraud detection',
          'Player AI — monitoring player engagement analytics and responsible play monitoring',
          'Retail AI — tracking point-of-sale optimization and retailer performance',
        ],
        monitoringPoints: [
          'Draw AI — RNG certification compliance, draw integrity verification, and system availability',
          'Validation AI — ticket validation accuracy, fraud detection rate, and response time',
          'Player AI — engagement scoring quality, responsible play flag accuracy, and intervention timing',
          'Retail AI — terminal uptime, transaction processing speed, and retailer optimization',
          'Lottery platform availability, jackpot system reliability, and regulatory reporting timeliness',
        ],
        bizObsValue: 'Connect lottery AI to operational integrity — proving that AI-driven systems maintain perfect draw integrity while maximizing player engagement within responsible limits.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects lottery system AI anomalies — alerting on draw integrity concerns, validation accuracy shifts, or player pattern changes' },
          { capability: 'Business Analytics', detail: 'Measures lottery AI performance — tracking revenue per draw, player engagement, and responsible gaming compliance metrics' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures mission-critical lottery infrastructure availability for draw systems and ticket validation' },
          { capability: 'Application Security', detail: 'Protects lottery platform integrity and player data across retail and digital channels' },
        ],
      },
      {
        name: 'IGT',
        description: 'Gaming technology platform — AI-powered lottery systems, sports betting, iGaming, and responsible gaming solutions for regulated markets worldwide',
        category: 'Regulated Gaming & Sports',
        useCases: [
          'Sports AI — monitoring odds compilation accuracy and in-play pricing quality for sports betting',
          'Responsible AI — tracking problem gambling detection and player self-exclusion system effectiveness',
          'iGaming AI — monitoring game recommendation personalization and session management',
          'Regulatory AI — tracking multi-jurisdiction compliance monitoring and reporting automation',
        ],
        monitoringPoints: [
          'Sports AI — odds accuracy, margin optimization, and in-play pricing quality by sport',
          'Responsible AI — problem player detection accuracy, intervention timing, and exclusion compliance',
          'iGaming AI — recommendation relevance, session length management, and player satisfaction',
          'Regulatory AI — jurisdiction compliance rate, reporting accuracy, and audit trail completeness',
          'Gaming platform performance, concurrent player capacity, and bet processing throughput',
        ],
        bizObsValue: 'Link responsible gambling AI to actual player protection outcomes — proving that AI-driven monitoring identifies at-risk players earlier while maintaining compliant, engaging experiences.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates responsible AI detection with player outcomes, improving identification accuracy and intervention timing' },
          { capability: 'Business Analytics', detail: 'Compares AI-monitored player populations against baseline on problem gambling rates, player satisfaction, and regulatory compliance' },
          { capability: 'OpenPipeline', detail: 'Unifies player behavior, betting data, and compliance events into regulated gaming observability' },
          { capability: 'Digital Experience Monitoring', detail: 'Ensures gaming platform performance across mobile, web, and retail betting channels' },
        ],
      },
      {
        name: 'Sportradar Integrity',
        description: 'Sports integrity platform — AI-powered match-fixing detection, betting pattern analysis, and regulatory intelligence for sports governing bodies and betting operators',
        category: 'Integrity & Fraud Prevention',
        useCases: [
          'Integrity AI — monitoring suspicious betting pattern detection across global markets',
          'Fraud AI — tracking multi-account detection and bonus abuse identification',
          'AML AI — monitoring anti-money laundering transaction pattern analysis and reporting',
          'Intelligence AI — tracking organized crime pattern identification and cross-operator intelligence sharing',
        ],
        monitoringPoints: [
          'Integrity AI — suspicious pattern detection accuracy, investigation conversion rate, and false alert reduction',
          'Fraud AI — multi-account detection rate, bonus abuse identification, and collusion pattern analysis',
          'AML AI — suspicious transaction identification, reporting accuracy, and regulatory compliance',
          'Intelligence AI — organized crime pattern identification, cross-market correlation, and alert quality',
          'Data feed processing throughput, real-time alert delivery, and investigation platform performance',
        ],
        bizObsValue: 'Measure integrity AI impact on market confidence — proving that AI-driven monitoring protects sporting events and betting markets from manipulation more effectively.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects integrity AI sensitivity changes — alerting when detection patterns shift or false alarm rates indicate model degradation' },
          { capability: 'OpenPipeline', detail: 'Ingests betting data, event feeds, and investigation outcomes into sports integrity observability' },
          { capability: 'Business Analytics', detail: 'Quantifies integrity AI value — measuring investigation quality, prosecution support, and market confidence improvement' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures real-time integrity monitoring infrastructure for simultaneous global sporting events' },
        ],
      },
    ],
    journeys: [
      { name: 'Responsible Gambling', configFile: 'config-lottery-responsible.json' },
      { name: 'Fraud Detection', configFile: 'config-lottery-fraud.json' },
    ],
    kpis: ['Player protection rate', 'Fraud detection %', 'Regulatory compliance', 'Revenue per player'],
  },
  {
    id: 'beauty',
    icon: '💄',
    industry: 'Beauty & Cosmetics',
    color: '#e91e63',
    tagline: 'AI-powered beauty — every recommendation, observable',
    description: 'Beauty and cosmetics brands deploy AI for virtual try-on experiences, skin analysis diagnostics, personalized product recommendations, shade matching, and ingredient safety analysis. When virtual try-on AI renders inaccurate results, skin analysis misclassifies conditions, or shade-matching AI fails across diverse skin tones, brands lose trust. Dynatrace ensures AI-driven beauty technology delivers inclusive, accurate, and personalized experiences.',
    painPoints: [
      'Virtual try-on AI rendering inaccurate visualizations, destroying purchase confidence and driving returns',
      'Skin analysis AI misclassifying conditions across diverse skin tones, creating bias complaints',
      'Shade-matching AI providing poor matches for darker complexions, revealing algorithmic bias',
      'Recommendation AI pushing high-margin products over genuinely suitable options, eroding trust',
      'Ingredient safety AI missing allergen interactions, creating potential liability and health risks',
    ],
    roiPoints: [
      'Monitor virtual try-on AI — achieving 92% customer satisfaction with accurate rendering across all device types',
      'Track skin analysis AI — ensuring 95% classification accuracy across Fitzpatrick I-VI scale skin types',
      'Validate shade-matching AI — delivering 90% first-match accuracy across all skin tones, reducing returns by 30%',
      'Ensure recommendation AI relevance — increasing repeat purchase rate by 25% through genuine personalization',
      'Measure ingredient AI safety — achieving 99.5% allergen interaction detection accuracy before product recommendation',
    ],
    integrations: [
      {
        name: 'Perfect Corp',
        description: 'Beauty tech platform — AI-powered virtual try-on, skin analysis, shade matching, and face mapping for beauty brands and retailers',
        category: 'Virtual Beauty & AR',
        useCases: [
          'Try-on AI — monitoring augmented reality makeup rendering accuracy and real-time performance',
          'Skin AI — tracking skin condition analysis accuracy and personalized routine recommendations',
          'Shade AI — monitoring foundation and color-match accuracy across diverse skin tones',
          'Face AI — tracking face mapping precision and feature detection for personalized beauty',
        ],
        monitoringPoints: [
          'Try-on AI — rendering accuracy, frame rate, color fidelity, and AR overlay precision',
          'Skin AI — condition classification accuracy, tone analysis fairness, and recommendation quality',
          'Shade AI — match accuracy by skin tone category, return rate correlation, and bias metrics',
          'Face AI — landmark detection accuracy, feature mapping precision, and processing speed',
          'Platform performance across mobile devices, camera compatibility, and rendering latency',
        ],
        bizObsValue: 'Connect virtual beauty AI accuracy to purchase conversion — proving that better AI rendering directly drives higher basket value and lower return rates.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects beauty AI accuracy degradation — alerting on rendering quality drops, shade-matching drift, or skin analysis bias patterns' },
          { capability: 'Digital Experience Monitoring', detail: 'Measures virtual try-on performance across mobile devices, cameras, and lighting conditions' },
          { capability: 'Business Analytics', detail: 'Correlates AI accuracy with conversion rates, return rates, and customer satisfaction by skin tone category' },
          { capability: 'Application Security', detail: 'Protects biometric face mapping data and personal skin analysis information' },
        ],
      },
      {
        name: 'Centric PLM',
        description: 'Product lifecycle management platform — AI-powered beauty product development, formulation management, and ingredient compliance for cosmetics companies',
        category: 'Product Development & Compliance',
        useCases: [
          'Formulation AI — monitoring ingredient combination safety analysis and regulatory compliance checking',
          'Trend AI — tracking beauty trend prediction accuracy and speed-to-market optimization',
          'Compliance AI — monitoring multi-region regulatory compliance for ingredients and claims',
          'Sustainability AI — tracking clean beauty formulation optimization and packaging sustainability',
        ],
        monitoringPoints: [
          'Formulation AI — ingredient safety check accuracy, interaction detection, and approval speed',
          'Trend AI — prediction accuracy, lead time reduction, and market adoption correlation',
          'Compliance AI — regulatory change detection, compliance gap identification, and submission accuracy',
          'Sustainability AI — clean ingredient substitution quality, packaging optimization, and carbon impact',
          'PLM platform performance, workflow automation reliability, and integration throughput',
        ],
        bizObsValue: 'Link formulation AI to product success — proving that AI-driven ingredient optimization and compliance checking accelerate launches while reducing safety incidents.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates formulation AI decisions with product safety outcomes and regulatory compliance rates' },
          { capability: 'Business Analytics', detail: 'Measures AI impact on time-to-market, formulation costs, and product success rates' },
          { capability: 'OpenPipeline', detail: 'Unifies formulation data, compliance events, and market performance into beauty product observability' },
          { capability: 'Workflow Automation', detail: 'Automates compliance checking workflows and ingredient safety alert escalation' },
        ],
      },
      {
        name: 'SAP Fashion',
        description: 'Beauty retail management platform — AI-powered demand forecasting, assortment planning, and omnichannel beauty retail optimization',
        category: 'Retail & Supply Chain',
        useCases: [
          'Demand AI — monitoring beauty product demand forecasting across seasonal and trend-driven categories',
          'Assortment AI — tracking store-level product mix optimization for diverse demographics',
          'Pricing AI — monitoring promotional pricing optimization and margin management for beauty products',
          'Omnichannel AI — tracking cross-channel inventory optimization for ship-from-store and BOPIS',
        ],
        monitoringPoints: [
          'Demand AI — forecast accuracy by category, trend responsiveness, and seasonal adjustment quality',
          'Assortment AI — demographic matching accuracy, sell-through optimization, and markdown reduction',
          'Pricing AI — promotional effectiveness, margin impact, and competitive positioning accuracy',
          'Omnichannel AI — inventory visibility accuracy, fulfillment optimization, and channel allocation',
          'Retail platform performance, POS integration reliability, and real-time inventory accuracy',
        ],
        bizObsValue: 'Measure beauty retail AI impact on revenue — proving that AI-driven demand forecasting and assortment planning reduce markdowns while maximizing full-price sell-through.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects demand AI forecast drift — alerting when beauty trend prediction accuracy degrades or assortment decisions underperform' },
          { capability: 'Business Analytics', detail: 'Quantifies AI retail impact — measuring sell-through improvement, markdown reduction, and revenue per square foot gains' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures beauty retail platform performance during peak promotional and seasonal periods' },
          { capability: 'Digital Experience Monitoring', detail: 'Optimizes omnichannel beauty shopping experiences across web, mobile, and in-store digital touchpoints' },
        ],
      },
    ],
    journeys: [
      { name: 'Virtual Try-On', configFile: 'config-beauty-tryon.json' },
      { name: 'Product Development', configFile: 'config-beauty-plm.json' },
    ],
    kpis: ['Try-on accuracy %', 'Shade match rate', 'Return reduction %', 'Product launch speed'],
  },
  {
    id: 'veterinary',
    icon: '🐾',
    industry: 'Veterinary & Animal Health',
    color: '#4caf50',
    tagline: 'AI-powered animal care — every diagnosis, observable',
    description: 'Veterinary and animal health providers deploy AI for diagnostic imaging analysis, treatment recommendation, livestock health monitoring, drug interaction checking, and telemedicine triage. When diagnostic AI misclassifies conditions, treatment AI recommends incorrect dosages, or livestock monitoring fails to detect disease outbreaks early, animal welfare and business outcomes suffer. Dynatrace ensures AI-driven veterinary care is accurate, timely, and reliable.',
    painPoints: [
      'Diagnostic imaging AI misclassifying conditions across species, leading to delayed or incorrect treatment',
      'Treatment recommendation AI suggesting incorrect dosages for weight and species variations',
      'Livestock monitoring AI failing to detect early disease indicators, allowing outbreaks to spread',
      'Telemedicine triage AI incorrectly assessing urgency, delaying critical emergency interventions',
      'Drug interaction AI missing species-specific contraindications with potentially fatal consequences',
    ],
    roiPoints: [
      'Monitor diagnostic AI — achieving 93% imaging classification accuracy across companion and large animals',
      'Track treatment AI — reducing medication errors by 40% through weight-species-adjusted dosage validation',
      'Validate livestock AI — detecting disease indicators 3 days earlier, reducing herd mortality by 25%',
      'Ensure triage AI accuracy — correctly prioritizing 95% of emergency cases for immediate intervention',
      'Measure drug interaction AI — catching 99% of species-specific contraindications before dispensing',
    ],
    integrations: [
      {
        name: 'IDEXX',
        description: 'Veterinary diagnostics platform — AI-powered blood analysis, imaging diagnostics, reference lab integration, and disease detection for veterinary practices',
        category: 'Veterinary Diagnostics',
        useCases: [
          'Blood AI — monitoring automated blood panel analysis accuracy and anomaly detection',
          'Imaging AI — tracking radiograph and ultrasound AI interpretation accuracy by species',
          'Disease AI — monitoring early disease detection from pathology patterns and lab results',
          'Reference AI — tracking lab result integration, critical value alerting, and trend analysis',
        ],
        monitoringPoints: [
          'Blood AI — panel analysis accuracy, critical value detection, and turnaround time',
          'Imaging AI — classification accuracy by species and modality, confidence scoring, and error patterns',
          'Disease AI — early detection sensitivity, specificity, and false positive rate by condition',
          'Reference AI — result accuracy, integration reliability, and critical alert delivery speed',
          'Diagnostic platform uptime, instrument connectivity, and data integration throughput',
        ],
        bizObsValue: 'Connect diagnostic AI accuracy to patient outcomes — proving that better AI diagnostics lead to earlier detection, more accurate treatment, and improved animal welfare.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects diagnostic AI accuracy drift — alerting when blood panel analysis or imaging classification degrades by species or condition' },
          { capability: 'Business Analytics', detail: 'Correlates diagnostic AI performance with treatment outcomes, repeat visits, and revenue per case' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures diagnostic platform and instrument connectivity for real-time result processing' },
          { capability: 'Workflow Automation', detail: 'Automates critical diagnostic value alerts and urgent case escalation workflows' },
        ],
      },
      {
        name: 'Covetrus',
        description: 'Veterinary practice management platform — AI-powered inventory management, prescription processing, treatment planning, and financial analytics for veterinary practices',
        category: 'Practice Management & Pharmacy',
        useCases: [
          'Prescription AI — monitoring drug interaction checking and dosage calculation across species and weights',
          'Inventory AI — tracking pharmaceutical demand forecasting and automated reorder optimization',
          'Treatment AI — monitoring treatment protocol recommendations based on diagnosis and patient history',
          'Financial AI — tracking revenue cycle optimization, pricing recommendations, and profitability analysis',
        ],
        monitoringPoints: [
          'Prescription AI — interaction detection accuracy, dosage validation rate, and species-specific safety',
          'Inventory AI — forecast accuracy, stockout prevention rate, and expiration waste reduction',
          'Treatment AI — protocol adherence, outcome correlation, and recommendation acceptance rate',
          'Financial AI — revenue optimization accuracy, collection improvement, and profitability forecasting',
          'Practice platform performance, prescription processing speed, and integration reliability',
        ],
        bizObsValue: 'Link prescription AI safety to practice outcomes — proving that AI-driven drug checking prevents errors while inventory optimization reduces waste and stockouts.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates prescription AI with safety outcomes — detecting patterns in near-miss events and dosage adjustments' },
          { capability: 'Business Analytics', detail: 'Measures practice AI impact — tracking medication safety, inventory savings, and revenue per visit improvement' },
          { capability: 'OpenPipeline', detail: 'Unifies prescription, inventory, and financial data into veterinary practice observability' },
          { capability: 'Application Security', detail: 'Protects controlled substance tracking and patient health records across practice systems' },
        ],
      },
      {
        name: 'ezyVet',
        description: 'Cloud veterinary practice management — AI-powered appointment scheduling, clinical workflow automation, telehealth, and client communication for modern vet practices',
        category: 'Clinical Workflow & Telehealth',
        useCases: [
          'Triage AI — monitoring telemedicine symptom assessment and urgency classification accuracy',
          'Scheduling AI — tracking intelligent appointment optimization and resource allocation',
          'Clinical AI — monitoring automated clinical note generation and treatment documentation',
          'Communication AI — tracking pet owner engagement, reminder optimization, and satisfaction',
        ],
        monitoringPoints: [
          'Triage AI — urgency classification accuracy, emergency detection sensitivity, and referral appropriateness',
          'Scheduling AI — utilization optimization, wait time reduction, and no-show prediction accuracy',
          'Clinical AI — note generation quality, documentation completeness, and clinician time savings',
          'Communication AI — reminder effectiveness, engagement rate improvement, and client satisfaction',
          'Cloud platform performance, telehealth video quality, and mobile app responsiveness',
        ],
        bizObsValue: 'Measure clinical workflow AI impact on practice efficiency — proving that AI-driven scheduling and triage improve throughput while maintaining care quality.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects triage AI accuracy changes — alerting when urgency classification or emergency detection sensitivity shifts' },
          { capability: 'Digital Experience Monitoring', detail: 'Ensures telehealth video quality and mobile app performance for pet owner engagement' },
          { capability: 'Business Analytics', detail: 'Quantifies workflow AI impact — measuring throughput improvement, wait time reduction, and client retention' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures cloud practice management availability and performance during peak appointment hours' },
        ],
      },
    ],
    journeys: [
      { name: 'Veterinary Diagnostics', configFile: 'config-vet-diagnostics.json' },
      { name: 'Practice Management', configFile: 'config-vet-practice.json' },
    ],
    kpis: ['Diagnostic accuracy %', 'Prescription safety', 'Triage accuracy', 'Practice throughput'],
  },
  {
    id: 'fitness',
    icon: '🏋️',
    industry: 'Fitness & Wellness',
    color: '#ff5722',
    tagline: 'AI-powered wellness — every workout, observable',
    description: 'Fitness and wellness companies deploy AI for personalized workout programming, nutrition planning, injury prevention, member retention prediction, and wearable health monitoring. When workout AI overtrains members causing injuries, nutrition AI ignores dietary restrictions, or retention AI fails to flag at-risk members, health outcomes and membership revenue suffer. Dynatrace ensures AI-driven fitness experiences are safe, effective, and personalized.',
    painPoints: [
      'Workout AI creating overtraining programs that cause injuries and member dissatisfaction',
      'Nutrition AI ignoring allergies or dietary restrictions, creating safety and liability risks',
      'Retention AI failing to identify at-risk members early, losing revenue to preventable churn',
      'Wearable AI providing inaccurate health metrics, undermining training effectiveness and trust',
      'Class scheduling AI creating suboptimal capacity plans, leaving popular classes overbooked and others empty',
    ],
    roiPoints: [
      'Monitor workout AI — reducing training-related injuries by 35% through progressive overload optimization',
      'Track nutrition AI — achieving 100% dietary restriction compliance while improving nutritional guidance satisfaction by 40%',
      'Validate retention AI — identifying 85% of at-risk members 30 days before cancellation, improving save rates by 25%',
      'Ensure wearable AI accuracy — maintaining 95% heart rate and calorie tracking accuracy across device types',
      'Measure scheduling AI — increasing class utilization to 85% while reducing overbooking complaints by 60%',
    ],
    integrations: [
      {
        name: 'Mindbody',
        description: 'Wellness business platform — AI-powered class scheduling, member management, booking optimization, and marketing automation for fitness studios and wellness businesses',
        category: 'Studio Management & Booking',
        useCases: [
          'Scheduling AI — monitoring class capacity optimization and instructor-time slot matching',
          'Retention AI — tracking member churn prediction accuracy and intervention effectiveness',
          'Pricing AI — monitoring dynamic pricing optimization for classes, memberships, and packages',
          'Marketing AI — tracking campaign targeting accuracy and member reactivation success',
        ],
        monitoringPoints: [
          'Scheduling AI — class fill rate, waitlist conversion, and capacity utilization optimization',
          'Retention AI — churn prediction accuracy, intervention conversion rate, and member lifetime value impact',
          'Pricing AI — revenue optimization accuracy, price sensitivity modeling, and competitive positioning',
          'Marketing AI — targeting precision, reactivation rate, and campaign ROI by segment',
          'Booking platform performance, payment processing reliability, and mobile app responsiveness',
        ],
        bizObsValue: 'Connect scheduling AI to studio revenue — proving that AI-driven class optimization and retention prediction directly improve membership revenue and utilization.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects retention AI prediction degradation — alerting when churn models lose accuracy or scheduling optimization underperforms' },
          { capability: 'Business Analytics', detail: 'Measures studio AI impact — tracking revenue per class, member retention improvement, and lifetime value growth' },
          { capability: 'Digital Experience Monitoring', detail: 'Ensures booking and mobile app performance during peak scheduling hours' },
          { capability: 'Workflow Automation', detail: 'Automates at-risk member intervention workflows and class capacity alerts' },
        ],
      },
      {
        name: 'ABC Fitness',
        description: 'Gym management platform — AI-powered member engagement, facility utilization analytics, workout tracking, and operational management for fitness clubs',
        category: 'Gym Operations & Analytics',
        useCases: [
          'Engagement AI — monitoring member visit pattern analysis and engagement scoring',
          'Facility AI — tracking equipment utilization optimization and maintenance prediction',
          'Workout AI — monitoring personalized program generation and progression tracking',
          'Operations AI — tracking staffing optimization, energy management, and facility efficiency',
        ],
        monitoringPoints: [
          'Engagement AI — visit prediction accuracy, engagement scoring quality, and intervention timing',
          'Facility AI — equipment utilization accuracy, maintenance prediction reliability, and downtime reduction',
          'Workout AI — program personalization quality, progression appropriateness, and member satisfaction',
          'Operations AI — staffing optimization accuracy, energy savings, and operational cost reduction',
          'Gym management platform reliability, access control integration, and real-time reporting accuracy',
        ],
        bizObsValue: 'Link engagement AI to membership outcomes — proving that AI-driven member engagement and facility optimization reduce churn while maximizing per-member revenue.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates engagement AI with membership outcomes — detecting patterns between visit frequency changes and churn risk' },
          { capability: 'Business Analytics', detail: 'Quantifies gym AI value — measuring utilization improvement, churn reduction, and revenue per square foot gains' },
          { capability: 'OpenPipeline', detail: 'Unifies access control, equipment usage, and member engagement data into fitness facility observability' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures gym management platform reliability across multi-location fitness chains' },
        ],
      },
      {
        name: 'Peloton Platform',
        description: 'Connected fitness platform — AI-powered workout personalization, performance tracking, instructor matching, and community engagement for at-home and in-studio fitness',
        category: 'Connected Fitness & Wearables',
        useCases: [
          'Personalization AI — monitoring workout recommendation accuracy based on fitness level and goals',
          'Performance AI — tracking real-time effort zone guidance and calorie estimation accuracy',
          'Instructor AI — monitoring instructor-member matching and content recommendation optimization',
          'Community AI — tracking social motivation features, challenge matching, and engagement optimization',
        ],
        monitoringPoints: [
          'Personalization AI — recommendation relevance, difficulty appropriateness, and goal alignment',
          'Performance AI — heart rate zone accuracy, power output calibration, and calorie estimation precision',
          'Instructor AI — content recommendation quality, completion rates, and member-instructor fit scores',
          'Community AI — challenge engagement rates, social feature effectiveness, and motivation impact',
          'Streaming platform quality, device connectivity, and real-time leaderboard performance',
        ],
        bizObsValue: 'Measure connected fitness AI impact on retention — proving that personalized AI-driven workouts and community features drive higher engagement and lower subscription churn.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects personalization AI quality shifts — alerting when recommendation accuracy, difficulty calibration, or engagement patterns change' },
          { capability: 'Digital Experience Monitoring', detail: 'Ensures streaming quality, device connectivity, and real-time interaction performance across connected equipment' },
          { capability: 'Business Analytics', detail: 'Correlates AI personalization with engagement — measuring workout completion, streak maintenance, and subscription retention' },
          { capability: 'Application Security', detail: 'Protects personal health and biometric data across connected fitness devices and platforms' },
        ],
      },
    ],
    journeys: [
      { name: 'Studio Scheduling', configFile: 'config-fitness-scheduling.json' },
      { name: 'Member Retention', configFile: 'config-fitness-retention.json' },
    ],
    kpis: ['Member retention %', 'Class utilization', 'Workout completion', 'Revenue per member'],
  },
  {
    id: 'space',
    icon: '🛰️',
    industry: 'Space & Satellite',
    color: '#1a237e',
    tagline: 'AI-powered space operations — every orbit, observable',
    description: 'Space and satellite companies deploy AI for orbital trajectory optimization, satellite health monitoring, Earth observation analytics, ground station management, and debris collision avoidance. When trajectory AI miscalculates orbital paths, health monitoring AI misses satellite anomalies, or collision avoidance AI fails to detect debris threats, missions worth hundreds of millions are at risk. Dynatrace ensures AI-driven space operations are precise, reliable, and mission-critical.',
    painPoints: [
      'Trajectory AI miscalculating orbital maneuvers, wasting precious fuel reserves and shortening mission life',
      'Satellite health AI missing early component degradation signals, leading to preventable mission failures',
      'Collision avoidance AI generating excessive false alerts, causing unnecessary and fuel-costly evasive maneuvers',
      'Earth observation AI delivering poor image classification, degrading commercial data product quality',
      'Ground station AI failing to optimize communication windows, missing critical data downlink opportunities',
    ],
    roiPoints: [
      'Monitor trajectory AI — reducing fuel consumption by 15% through optimized orbital maneuver planning',
      'Track health AI — detecting satellite anomalies 72 hours earlier, preventing 80% of preventable mission failures',
      'Validate collision AI — maintaining 99.9% debris detection while reducing false positive alerts by 60%',
      'Ensure observation AI accuracy — achieving 95% image classification accuracy for commercial data products',
      'Measure ground station AI — optimizing communication windows to achieve 98% data downlink success rate',
    ],
    integrations: [
      {
        name: 'Planet Labs',
        description: 'Earth observation platform — AI-powered satellite imagery analysis, change detection, environmental monitoring, and geospatial analytics from the largest constellation of Earth-imaging satellites',
        category: 'Earth Observation & Analytics',
        useCases: [
          'Imagery AI — monitoring automated satellite image classification and feature extraction accuracy',
          'Change AI — tracking land-use change detection, deforestation monitoring, and urban growth analysis',
          'Environmental AI — monitoring climate indicator tracking, agricultural health assessment, and water resource analysis',
          'Pipeline AI — tracking satellite data processing pipeline throughput and quality assurance',
        ],
        monitoringPoints: [
          'Imagery AI — classification accuracy, feature extraction precision, and cloud cover compensation quality',
          'Change AI — detection sensitivity, temporal accuracy, and false change alert rate',
          'Environmental AI — indicator accuracy, assessment reliability, and temporal trend quality',
          'Pipeline AI — processing throughput, data quality metrics, and delivery latency',
          'Constellation health, imaging capture success rate, and data downlink reliability',
        ],
        bizObsValue: 'Connect imagery AI quality to commercial value — proving that higher classification accuracy and faster processing directly increase data product revenue and customer retention.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects imagery AI quality degradation — alerting on classification accuracy drops, processing pipeline bottlenecks, or change detection sensitivity shifts' },
          { capability: 'Business Analytics', detail: 'Measures observation AI commercial impact — tracking data product quality, customer usage, and revenue per image' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures satellite data processing infrastructure scales for constellation-scale imagery throughput' },
          { capability: 'OpenPipeline', detail: 'Ingests telemetry, imagery metadata, and processing metrics into Earth observation observability' },
        ],
      },
      {
        name: 'Maxar',
        description: 'Space infrastructure platform — AI-powered high-resolution Earth intelligence, satellite manufacturing analytics, orbital operations, and geospatial data services',
        category: 'Space Infrastructure & Intelligence',
        useCases: [
          'Geospatial AI — monitoring high-resolution imagery analysis and 3D terrain model generation',
          'Manufacturing AI — tracking satellite component quality prediction and assembly optimization',
          'Orbital AI — monitoring satellite constellation management and orbital slot optimization',
          'Intelligence AI — tracking automated feature extraction and change detection for defense and commercial clients',
        ],
        monitoringPoints: [
          'Geospatial AI — resolution quality, positional accuracy, and 3D model fidelity',
          'Manufacturing AI — component quality prediction accuracy, assembly efficiency, and defect detection rate',
          'Orbital AI — constellation positioning accuracy, fuel optimization, and collision risk assessment',
          'Intelligence AI — feature extraction accuracy, change detection reliability, and analyst workflow integration',
          'Ground system performance, data processing capacity, and satellite command uplink reliability',
        ],
        bizObsValue: 'Link space manufacturing AI to mission reliability — proving that AI-driven quality prediction and orbital optimization extend satellite lifespan and maximize return on launch investment.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Correlates manufacturing AI with mission outcomes — detecting quality patterns that predict satellite longevity and operational reliability' },
          { capability: 'Business Analytics', detail: 'Quantifies space AI ROI — measuring mission extension value, manufacturing cost reduction, and data product revenue optimization' },
          { capability: 'OpenPipeline', detail: 'Unifies satellite telemetry, manufacturing data, and operational metrics into space mission observability' },
          { capability: 'Workflow Automation', detail: 'Automates satellite anomaly response workflows and constellation management adjustments' },
        ],
      },
      {
        name: 'AWS Ground Station',
        description: 'Ground station as a service — AI-optimized satellite communication scheduling, data downlink management, and antenna resource allocation across global ground station networks',
        category: 'Ground Station & Communications',
        useCases: [
          'Scheduling AI — monitoring communication window optimization and antenna allocation efficiency',
          'Downlink AI — tracking data transfer optimization using adaptive coding and modulation',
          'Network AI — monitoring global ground station load balancing and failover management',
          'Processing AI — tracking edge processing of satellite data for latency-critical applications',
        ],
        monitoringPoints: [
          'Scheduling AI — window utilization rate, contact success rate, and conflict resolution quality',
          'Downlink AI — data transfer efficiency, link budget optimization, and throughput maximization',
          'Network AI — load distribution accuracy, failover reliability, and global coverage optimization',
          'Processing AI — edge processing latency, data quality preservation, and delivery timeliness',
          'Ground station availability, antenna tracking accuracy, and network connectivity reliability',
        ],
        bizObsValue: 'Measure ground station AI impact on data economics — proving that AI-optimized scheduling and downlink management maximize data captured per dollar of ground infrastructure.',
        dynatraceHow: [
          { capability: 'Dynatrace Intelligence', detail: 'Detects ground station AI efficiency changes — alerting on scheduling optimization degradation or downlink quality issues' },
          { capability: 'Cloud Infrastructure Monitoring', detail: 'Ensures global ground station infrastructure availability and edge processing performance' },
          { capability: 'Business Analytics', detail: 'Tracks ground station AI economics — measuring cost per contact, data throughput optimization, and infrastructure utilization' },
          { capability: 'Digital Experience Monitoring', detail: 'Monitors satellite operator portal performance and real-time mission control dashboard responsiveness' },
        ],
      },
    ],
    journeys: [
      { name: 'Earth Observation', configFile: 'config-space-observation.json' },
      { name: 'Satellite Operations', configFile: 'config-space-operations.json' },
    ],
    kpis: ['Image accuracy %', 'Satellite uptime', 'Downlink success %', 'Fuel efficiency'],
  },
];

// ── Component ──────────────────────────────────────────────
export const SolutionsPage: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>(SOLUTIONS[0].id);
  const [expandedIntegration, setExpandedIntegration] = useState<number | null>(null);
  const [sectorSearch, setSectorSearch] = useState('');
  const [partnerSearch, setPartnerSearch] = useState('');

  const filteredSolutions = SOLUTIONS.filter(s => {
    const sMatch = !sectorSearch || s.industry.toLowerCase().includes(sectorSearch.toLowerCase());
    const pMatch = !partnerSearch || s.integrations.some(ig => ig.name.toLowerCase().includes(partnerSearch.toLowerCase()));
    return sMatch && pMatch;
  });

  const current = SOLUTIONS.find(s => s.id === selectedId) || SOLUTIONS[0];

  return (
    <Page>
      <Page.Main>
        <Flex style={{ height: '100%', overflow: 'hidden' }}>
          {/* ── Left Sidebar ── */}
          <div style={{
            width: 260, flexShrink: 0, overflow: 'auto',
            borderRight: `1px solid ${Colors.Border.Neutral.Default}`,
            background: Colors.Background.Surface.Default,
            padding: '16px 0',
          }}>
            {/* Header */}
            <div style={{ padding: '0 16px 16px', borderBottom: `1px solid ${Colors.Border.Neutral.Default}` }}>
              <Flex alignItems="center" gap={8}>
                <span style={{ fontSize: 22 }}>🏢</span>
                <div>
                  <Flex alignItems="center" gap={6}>
                    <Heading level={5} style={{ margin: 0 }}>Vertical Solutions</Heading>
                    <InfoButton
                      align="left"
                      title="🏢 Vertical Solutions"
                      description="Industry-specific journey templates with pre-built integration partners and KPIs."
                      sections={[
                        { label: '🔍 Search sector', detail: 'Filter industries by name (e.g. Retail, Healthcare, Financial Services)' },
                        { label: '🔌 Search integration', detail: 'Find industries by integration partner name' },
                        { label: 'Industry cards', detail: 'Click an industry in the sidebar to see its journeys, integrations, pain points, and ROI metrics' },
                        { label: 'Journeys', detail: 'Pre-built customer journey templates with step-by-step flows for each industry' },
                        { label: 'KPIs', detail: 'Business KPIs and talking points tailored to each vertical' },
                      ]}
                      footer="Use these templates to quickly generate industry-specific demos on the Home page."
                    />
                  </Flex>
                  <Paragraph style={{ fontSize: 11, margin: 0, color: Colors.Text.Neutral.Subdued }}>
                    {filteredSolutions.length === SOLUTIONS.length
                      ? `${SOLUTIONS.length} Industries · ${SOLUTIONS.reduce((n, s) => n + s.journeys.length, 0)} Journeys`
                      : `${filteredSolutions.length} of ${SOLUTIONS.length} Industries`}
                  </Paragraph>
                </div>
              </Flex>
            </div>

            {/* Search bars */}
            <div style={{ padding: '10px 12px 4px' }}>
              <input
                type="text"
                placeholder="🔍  Search sector..."
                value={sectorSearch}
                onChange={e => { setSectorSearch(e.target.value); }}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: 8,
                  border: `1px solid ${Colors.Border.Neutral.Default}`,
                  background: Colors.Background.Surface.Default,
                  fontSize: 12, outline: 'none', boxSizing: 'border-box',
                  color: Colors.Text.Neutral.Default,
                }}
              />
              <input
                type="text"
                placeholder="🔌  Search integration partner..."
                value={partnerSearch}
                onChange={e => { setPartnerSearch(e.target.value); }}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: 8, marginTop: 6,
                  border: `1px solid ${Colors.Border.Neutral.Default}`,
                  background: Colors.Background.Surface.Default,
                  fontSize: 12, outline: 'none', boxSizing: 'border-box',
                  color: Colors.Text.Neutral.Default,
                }}
              />
            </div>

            {/* Back link */}
            <div style={{ padding: '10px 16px 6px' }}>
              <Link to="/" style={{
                fontSize: 12, color: Colors.Text.Neutral.Subdued, textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                ← Back to Home
              </Link>
            </div>

            {/* Industry list */}
            <div style={{ padding: '4px 8px' }}>
              {filteredSolutions.length === 0 && (
                <div style={{ padding: '20px 12px', textAlign: 'center', fontSize: 12, color: Colors.Text.Neutral.Subdued }}>
                  No matching industries found
                </div>
              )}
              {filteredSolutions.map(s => (
                <div
                  key={s.id}
                  onClick={() => { setSelectedId(s.id); setExpandedIntegration(null); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 8, marginBottom: 2,
                    cursor: 'pointer', transition: 'all 0.15s ease',
                    background: selectedId === s.id ? `${s.color}12` : 'transparent',
                    border: selectedId === s.id ? `1px solid ${s.color}33` : '1px solid transparent',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{s.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: selectedId === s.id ? 600 : 400,
                      color: selectedId === s.id ? s.color : Colors.Text.Neutral.Default,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {s.industry}
                    </div>
                    <div style={{ fontSize: 10, color: Colors.Text.Neutral.Subdued }}>
                      {s.journeys.length} journeys · {s.integrations.length} integrations
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right Content ── */}
          <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px' }}>

            {/* Hero header */}
            <div style={{
              background: `linear-gradient(135deg, ${current.color}15, ${current.color}05)`,
              borderRadius: 14, border: `1px solid ${current.color}33`,
              padding: '24px 28px', marginBottom: 28,
            }}>
              <Flex alignItems="center" gap={16}>
                <div style={{ fontSize: 44 }}>{current.icon}</div>
                <div style={{ flex: 1 }}>
                  <Heading level={3} style={{ margin: 0, marginBottom: 4 }}>{current.industry}</Heading>
                  <Paragraph style={{ fontSize: 14, margin: 0, color: current.color, fontWeight: 500 }}>
                    {current.tagline}
                  </Paragraph>
                </div>
                <div style={{
                  padding: '6px 14px', borderRadius: 20,
                  background: `${current.color}15`, border: `1px solid ${current.color}30`,
                  fontSize: 11, color: current.color, fontWeight: 600,
                }}>
                  SOLUTION PACK
                </div>
              </Flex>
              <Paragraph style={{ fontSize: 13, lineHeight: 1.7, marginTop: 14, marginBottom: 0, color: Colors.Text.Neutral.Default }}>
                {current.description}
              </Paragraph>
            </div>

            {/* Two-column layout: Pain Points + ROI */}
            <Flex gap={20} style={{ marginBottom: 28 }}>
              {/* Pain Points */}
              <div style={{
                flex: 1, padding: '18px 22px', borderRadius: 12,
                background: 'rgba(231,76,60,0.04)', border: '1px solid rgba(231,76,60,0.15)',
              }}>
                <Strong style={{ fontSize: 13, display: 'block', marginBottom: 14 }}>
                  🔥 Industry Pain Points
                </Strong>
                {current.painPoints.map((point, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 10, marginBottom: i < current.painPoints.length - 1 ? 10 : 0,
                    fontSize: 13, lineHeight: 1.6,
                  }}>
                    <span style={{ color: '#e74c3c', flexShrink: 0 }}>•</span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              {/* ROI Points */}
              <div style={{
                flex: 1, padding: '18px 22px', borderRadius: 12,
                background: 'rgba(39,174,96,0.04)', border: '1px solid rgba(39,174,96,0.15)',
              }}>
                <Strong style={{ fontSize: 13, display: 'block', marginBottom: 14 }}>
                  📈 Observability ROI
                </Strong>
                {current.roiPoints.map((point, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 10, marginBottom: i < current.roiPoints.length - 1 ? 10 : 0,
                    fontSize: 13, lineHeight: 1.6,
                  }}>
                    <span style={{ color: '#27ae60', flexShrink: 0 }}>✓</span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </Flex>

            {/* KPIs */}
            <div style={{ marginBottom: 28 }}>
              <Strong style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>🎯 Key Performance Indicators</Strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {current.kpis.map((kpi, i) => (
                  <div key={i} style={{
                    padding: '7px 16px', borderRadius: 20,
                    background: `${current.color}08`, border: `1px solid ${current.color}25`,
                    fontSize: 12, color: current.color, fontWeight: 500,
                  }}>
                    {kpi}
                  </div>
                ))}
              </div>
            </div>

            {/* Integrations */}
            <div style={{ marginBottom: 28 }}>
              <Strong style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>🔌 Integration Partners</Strong>
              {current.integrations.map((integration, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: 8, borderRadius: 10, overflow: 'hidden',
                    border: `1px solid ${expandedIntegration === i ? current.color + '44' : Colors.Border.Neutral.Default}`,
                    background: expandedIntegration === i ? `${current.color}04` : Colors.Background.Surface.Default,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    onClick={() => setExpandedIntegration(expandedIntegration === i ? null : i)}
                    style={{
                      padding: '14px 18px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 12,
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: `${current.color}12`, border: `1px solid ${current.color}25`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 700, color: current.color, flexShrink: 0,
                    }}>
                      {integration.name.charAt(0)}
                    </div>
                    <Strong style={{ fontSize: 14, flex: 1 }}>{integration.name}</Strong>
                    <div style={{
                      padding: '3px 10px', borderRadius: 12,
                      background: 'rgba(108,44,156,0.06)', border: `1px solid ${Colors.Border.Neutral.Default}`,
                      fontSize: 10, color: Colors.Text.Neutral.Subdued, fontWeight: 500,
                    }}>
                      PLACEHOLDER
                    </div>
                    <div style={{
                      fontSize: 12, color: Colors.Text.Neutral.Subdued,
                      transform: expandedIntegration === i ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                    }}>▼</div>
                  </div>
                  {expandedIntegration === i && (
                    <div style={{ padding: '0 18px 16px 62px' }}>
                      {integration.category && (
                        <div style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: 10, marginBottom: 10,
                          background: `${current.color}10`, fontSize: 10, fontWeight: 600, color: current.color,
                          textTransform: 'uppercase', letterSpacing: 0.5,
                        }}>
                          {integration.category}
                        </div>
                      )}
                      <Paragraph style={{ fontSize: 13, lineHeight: 1.7, margin: '0 0 14px 0', color: Colors.Text.Neutral.Subdued }}>
                        {integration.description}
                      </Paragraph>

                      {integration.useCases && integration.useCases.length > 0 && (
                        <div style={{ marginBottom: 14 }}>
                          <Strong style={{ fontSize: 12, display: 'block', marginBottom: 8, color: Colors.Text.Neutral.Default }}>
                            Use Cases
                          </Strong>
                          {integration.useCases.map((uc, j) => {
                            const dashIdx = uc.indexOf(' — ');
                            return (
                              <div key={j} style={{
                                display: 'flex', gap: 8, marginBottom: 6, fontSize: 12, lineHeight: 1.6,
                              }}>
                                <span style={{ color: current.color, flexShrink: 0, marginTop: 1 }}>▸</span>
                                <span>
                                  {dashIdx > -1 ? (
                                    <><strong>{uc.slice(0, dashIdx)}</strong>{uc.slice(dashIdx)}</>
                                  ) : uc}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {integration.monitoringPoints && integration.monitoringPoints.length > 0 && (
                        <div style={{ marginBottom: 14 }}>
                          <Strong style={{ fontSize: 12, display: 'block', marginBottom: 8, color: Colors.Text.Neutral.Default }}>
                            Monitoring Points
                          </Strong>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {integration.monitoringPoints.map((mp, j) => (
                              <div key={j} style={{
                                padding: '5px 12px', borderRadius: 16,
                                background: `${current.color}06`, border: `1px solid ${current.color}18`,
                                fontSize: 11, color: Colors.Text.Neutral.Default,
                              }}>
                                {mp}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {integration.bizObsValue && (
                        <div style={{
                          padding: '12px 16px', borderRadius: 10, marginTop: 4,
                          background: 'rgba(108,44,156,0.05)', border: '1px solid rgba(108,44,156,0.15)',
                        }}>
                          <Strong style={{ fontSize: 11, display: 'block', marginBottom: 6, color: '#6c2c9c' }}>
                            💡 BizObs Value
                          </Strong>
                          <Paragraph style={{ fontSize: 12, lineHeight: 1.7, margin: 0, color: Colors.Text.Neutral.Default }}>
                            {integration.bizObsValue}
                          </Paragraph>
                        </div>
                      )}

                      {integration.dynatraceHow && integration.dynatraceHow.length > 0 && (
                        <div style={{
                          padding: '14px 16px', borderRadius: 10, marginTop: 4,
                          background: 'linear-gradient(135deg, rgba(20,55,130,0.06), rgba(75,135,230,0.04))',
                          border: '1px solid rgba(20,55,130,0.15)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: 22, height: 22, borderRadius: 6, fontSize: 10, fontWeight: 700,
                              background: 'linear-gradient(135deg, #143782, #4b87e6)', color: '#fff',
                            }}>DT</span>
                            <Strong style={{ fontSize: 11, color: '#143782' }}>How Dynatrace Integrates</Strong>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {integration.dynatraceHow.map((item, dIdx) => (
                              <div key={dIdx} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                <span style={{
                                  flexShrink: 0, marginTop: 2, padding: '2px 8px', borderRadius: 6,
                                  fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap',
                                  background: 'rgba(20,55,130,0.08)', color: '#143782',
                                }}>{item.capability}</span>
                                <Paragraph style={{ fontSize: 12, lineHeight: 1.6, margin: 0, color: Colors.Text.Neutral.Default }}>
                                  {item.detail}
                                </Paragraph>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Demo Journeys */}
            <div style={{ marginBottom: 28 }}>
              <Strong style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>🗺️ Pre-Built Demo Journeys</Strong>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                {current.journeys.map((journey, i) => (
                  <div key={i} style={{
                    padding: '16px 18px', borderRadius: 12,
                    border: `1px solid ${current.color}25`,
                    background: `linear-gradient(135deg, ${current.color}06, transparent)`,
                    cursor: 'default',
                  }}>
                    <div style={{ fontSize: 22, marginBottom: 8 }}>{current.icon}</div>
                    <Strong style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>
                      {journey.name}
                    </Strong>
                    <div style={{ fontSize: 11, color: Colors.Text.Neutral.Subdued, fontFamily: 'monospace' }}>
                      {journey.configFile}
                    </div>
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        padding: '5px 12px', borderRadius: 6,
                        background: 'rgba(200,60,60,0.08)', border: '1px solid rgba(200,60,60,0.20)',
                        fontSize: 11, color: '#c0392b', fontWeight: 600,
                        display: 'inline-block',
                      }}>
                        ⬤ Not Configured
                      </div>
                      <div
                        title="This journey needs a config JSON uploaded to the app. Once configured, journey generation will be enabled for this vertical."
                        style={{
                          width: 20, height: 20, borderRadius: '50%',
                          background: 'rgba(100,100,100,0.08)', border: '1px solid rgba(100,100,100,0.18)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, color: Colors.Text.Neutral.Subdued, cursor: 'help',
                          fontWeight: 700,
                        }}
                      >
                        ?
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer note */}
            <div style={{
              padding: '14px 18px', borderRadius: 10,
              background: 'rgba(108,44,156,0.04)', border: `1px solid ${Colors.Border.Neutral.Default}`,
              fontSize: 12, color: Colors.Text.Neutral.Subdued, lineHeight: 1.7,
            }}>
              <strong>💡 About Solution Packs:</strong> These are placeholder solution packs showing how Dynatrace Business Observability
              can be positioned for specific industries. Each pack includes pre-built demo journeys, integration partner mapping,
              ROI talking points, and industry-specific KPIs. Integration details are illustrative — actual integration depth
              will vary by partner and deployment.
            </div>
          </div>
        </Flex>
      </Page.Main>
    </Page>
  );
};
