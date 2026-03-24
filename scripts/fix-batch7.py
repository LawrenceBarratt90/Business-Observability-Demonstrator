#!/usr/bin/env python3
"""Batch 7: nonprofit, payments, publishing, rail"""
import json, os, uuid

CONFIGS_DIR = os.path.join(os.path.dirname(__file__), '..', 'saved-configs')

def gen(fn, d):
    steps = []
    for i, s in enumerate(d["steps"], 1):
        st = {"stepIndex": i, "stepName": s["sn"], "serviceName": s["sv"], "description": s["d"],
              "category": s["c"], "estimatedDuration": s["dur"], "businessRationale": s["r"],
              "substeps": [{"substepName": n, "duration": dur} for n, dur in s["sub"]]}
        if i == 1: st["timestamp"] = "2025-11-21T00:00:00.000Z"
        steps.append(st)
    config = {"companyName": d["co"], "domain": d["dom"], "industryType": d["ind"],
              "journeyType": d["jt"], "journeyDetail": d["jd"],
              "journeyId": f"journey_{d['jt'].lower().replace(' ','_')}_{uuid.uuid4().hex[:8]}",
              "journeyStartTime": "2025-11-21T00:00:00.000Z", "steps": steps,
              "id": str(uuid.uuid4()), "name": f"{d['ind']} - {d['jt']}",
              "timestamp": "2026-03-18T12:00:00.000Z", "source": "sector-demo",
              "additionalFields": d["af"]}
    with open(os.path.join(CONFIGS_DIR, fn), 'w') as f: json.dump(config, f, indent=4)
    print(f"  ✅ {fn}")

SECTORS = {
"config-nonprofit-donor-engagement.json": {
    "co": "ImpactTech Foundation", "dom": "https://www.impacttech-foundation.org",
    "ind": "Nonprofit & NGO", "jt": "Donor Engagement",
    "jd": "AI-Powered Donor Engagement & Fundraising",
    "steps": [
        {"sn": "DonorIdentification", "sv": "DonorIDService", "c": "Acquisition", "dur": 168, "d": "AI identifies prospective donors from wealth screening, philanthropic signals, cause alignment, and social network analysis. Major gift prospects scored and prioritised.", "r": "Major gifts ($10K+) account for 80% of fundraising revenue from 20% of donors. AI identification expands the prospect pool by 3x.", "sub": [("WealthScreening", 56), ("CauseAlignment", 56), ("ProspectScoring", 56)]},
        {"sn": "PersonalisedOutreach", "sv": "OutreachService", "c": "Engagement", "dur": 48, "d": "AI crafts personalised appeal messaging by donor segment: impact stories, programme updates, and giving opportunities matched to donor interests and communication preferences.", "r": "Personalised appeals generate 2.5x higher response rates. Generic mass emails have <1% response; targeted messaging achieves 5-8%.", "sub": [("ImpactStoryCuration", 16), ("SegmentMessaging", 16), ("ChannelOptimization", 16)]},
        {"sn": "DonationProcessing", "sv": "DonationService", "c": "Transaction", "dur": 0.5, "d": "AI optimises donation flow: suggested amounts based on donor capacity, recurring giving nudges, matching gift identification, and Gift Aid/tax deduction automation.", "r": "Optimised donation pages increase average gift by 20%. Recurring giving provides predictable revenue with 90% retention vs 45% for one-time gifts.", "sub": [("SmartAskAmounts", 0.2), ("RecurringNudge", 0.15), ("MatchingGiftDetection", 0.15)]},
        {"sn": "DonorStewardship", "sv": "StewardshipService", "c": "Retention", "dur": 720, "d": "AI manages donor journey: thank-you timing, impact reporting, milestone recognition, and birthday/anniversary acknowledgement. Personalised stewardship cadence per donor tier.", "r": "Donors who receive impact reports within 48 hours have 40% higher renewal rates. Stewardship is the #1 predictor of second gift.", "sub": [("ThankYouAutomation", 240), ("ImpactReporting", 240), ("MilestoneRecognition", 240)]},
        {"sn": "GiftUpgrading", "sv": "UpgradeService", "c": "Growth", "dur": 168, "d": "AI identifies upgrade opportunities based on giving history, wealth capacity, engagement signals, and life events. Ask amounts calibrated to maximise probability of increase.", "r": "Upgrading existing donors is 3x more cost-effective than acquiring new ones. AI-calibrated asks improve upgrade rates from 8% to 15%.", "sub": [("CapacityAnalysis", 56), ("TimingOptimization", 56), ("AskCalibration", 56)]},
        {"sn": "FundraisingAnalytics", "sv": "FundraisingAnalyticsService", "c": "Analytics", "dur": 168, "d": "AI analyses campaign performance, donor lifetime value, cost per dollar raised, and channel effectiveness. Board reporting with trend analysis and forecast.", "r": "Data-driven nonprofits raise 30% more per dollar invested. Board-level analytics justify fundraising investment and strategy.", "sub": [("CampaignPerformance", 56), ("DonorLTVAnalysis", 56), ("BoardReporting", 56)]}
    ],
    "af": {
        "orderTotal": 150, "transactionValue": 150, "averageOrderValue": 250,
        "contractValue": 0, "annualRevenue": 50000000, "revenuePerCustomer": 500,
        "profitMargin": 0, "customerLifetimeValue": 5000, "lifetimeValue": 5000,
        "acquisitionCost": 25, "costPerAcquisition": 25, "conversionProbability": 0.03,
        "conversionRate": 3, "engagementScore": 60, "timeToConversion": 4320,
        "sessionDuration": 300, "pageViews": 5, "purchaseFrequency": 3,
        "netPromoterScore": 55, "satisfactionRating": 4.4, "retentionProbability": 0.45,
        "processingTime": 10, "operationalCost": 12, "efficiencyRating": 75,
        "donorRetentionRate": 45, "costPerDollarRaised": 0.15,
        "channel": ["email_appeal", "direct_mail", "website", "social_media", "event_fundraising"],
        "deviceType": ["desktop", "paper", "mobile", "mobile", "in_person"],
        "region": ["US", "UK", "Canada", "Australia", "EU"],
        "customerSegmentValue": ["major_donor", "mid_level_donor", "recurring_donor", "one_time_donor", "legacy_prospect"],
        "loyaltyTier": ["Founder Circle", "Champion", "Partner", "Supporter", "Friend"],
        "segment": ["individual_giving", "corporate_partnership", "foundation_grant", "event_fundraising", "legacy_giving"],
        "Productname": ["Clean Water Programme", "Education Initiative", "Health Clinic Build", "Emergency Response Fund", "Climate Action Campaign"],
        "ProductId": ["NPO-CW-001", "NPO-EI-002", "NPO-HC-003", "NPO-ER-004", "NPO-CA-005"],
        "ProductType": ["programme_support", "restricted_fund", "capital_campaign", "emergency", "advocacy"],
        "Price": [25, 50, 500, 100, 250],
        "impactPerDollar": [4.5, 3.2, 2.8, 6.0, 1.5],
        "donorRecurrence": [0.45, 0.55, 0.30, 0.15, 0.65],
        "marketTrend": ["monthly_giving_growth", "donor_advised_funds", "impact_investing", "AI_fundraising", "peer_to_peer"]
    }
},
"config-nonprofit-disease-surveillance.json": {
    "co": "ImpactTech Foundation", "dom": "https://www.impacttech-foundation.org",
    "ind": "Nonprofit & NGO", "jt": "Disease Surveillance",
    "jd": "AI-Powered Global Disease Surveillance & Response",
    "steps": [
        {"sn": "DataCollection", "sv": "DataCollectService", "c": "Ingestion", "dur": 0.1, "d": "AI ingests multi-source health data: hospital reports, lab results, pharmacy sales, social media sentiment, news feeds, and environmental sensors. Real-time global coverage.", "r": "Early detection saves lives. Every day of delay in outbreak detection doubles the potential impact. Multi-source data catches signals that single-source misses.", "sub": [("HospitalReports", 0.03), ("SocialMediaSignals", 0.03), ("EnvironmentalSensors", 0.04)]},
        {"sn": "AnomalyDetection", "sv": "EpiAnomalyService", "c": "Detection", "dur": 1, "d": "AI detects disease anomalies: unusual case clusters, unexpected pathogens, geographic spread patterns, and syndromic surveillance signals. Multi-language processing for global signals.", "r": "AI detected COVID-19 signals 9 days before WHO announcement. Anomaly detection is the first line of defence against pandemics.", "sub": [("ClusterDetection", 0.3), ("SyndromicSurveillance", 0.3), ("GeospatialAlerts", 0.4)]},
        {"sn": "RiskAssessment", "sv": "RiskAssessService", "c": "Analysis", "dur": 4, "d": "AI assesses outbreak risk: pathogen characteristics, population vulnerability, healthcare capacity, and transmission modelling. R-number estimation and doubling time projection.", "r": "Rapid risk assessment enables proportionate response. Over-reaction wastes resources; under-reaction costs lives.", "sub": [("PathogenProfiling", 1.5), ("VulnerabilityMapping", 1.5), ("TransmissionModelling", 1)]},
        {"sn": "ResponseCoordination", "sv": "ResponseCoordService", "c": "Response", "dur": 48, "d": "AI coordinates response: resource deployment recommendations, contact tracing optimisation, vaccination campaign targeting, and supply chain logistics for medical supplies.", "r": "Coordinated response reduces outbreak impact by 40-60%. AI optimises resource allocation when every hour counts.", "sub": [("ResourceDeployment", 16), ("ContactTracingOptimization", 16), ("SupplyChainLogistics", 16)]},
        {"sn": "CommunityAlert", "sv": "CommunityAlertService", "c": "Communication", "dur": 2, "d": "AI generates public health alerts: multi-language, culturally appropriate messaging via appropriate channels. Misinformation detection and counter-messaging. Travel advisory automation.", "r": "Clear, timely communication prevents panic and enables protective behaviour. Misinformation during outbreaks is as dangerous as the disease itself.", "sub": [("AlertGeneration", 0.5), ("MisinformationDetection", 0.5), ("TravelAdvisory", 1)]},
        {"sn": "EpidemiologicalAnalytics", "sv": "EpiAnalyticsService", "c": "Analytics", "dur": 720, "d": "AI generates epidemiological reports: case fatality rates, attack rates, genomic sequencing analysis, and vaccine effectiveness monitoring. Lessons learned for future outbreaks.", "r": "Post-outbreak analysis informs future preparedness. Genomic surveillance tracks variant evolution and predicts next threats.", "sub": [("CaseFatalityAnalysis", 240), ("GenomicSurveillance", 240), ("VaccineEffectiveness", 240)]}
    ],
    "af": {
        "orderTotal": 0, "transactionValue": 0, "averageOrderValue": 0,
        "contractValue": 25000000, "annualRevenue": 50000000, "revenuePerCustomer": 5000000,
        "profitMargin": 0, "customerLifetimeValue": 50000000, "lifetimeValue": 50000000,
        "acquisitionCost": 0, "costPerAcquisition": 0, "conversionProbability": 1.0,
        "conversionRate": 100, "engagementScore": 90, "timeToConversion": 0,
        "sessionDuration": 3600, "pageViews": 25, "purchaseFrequency": 365,
        "netPromoterScore": 60, "satisfactionRating": 4.5, "retentionProbability": 0.95,
        "processingTime": 0.1, "operationalCost": 500000, "efficiencyRating": 88,
        "detectionLeadTime": 9, "countryMonitored": 195,
        "channel": ["API_feed", "dashboard", "email_alert", "mobile_app", "WHO_integration"],
        "deviceType": ["server", "desktop", "mobile", "mobile", "server"],
        "region": ["Sub-Saharan Africa", "South-East Asia", "Latin America", "Middle East", "Pacific Islands"],
        "customerSegmentValue": ["WHO", "CDC", "national_health_ministry", "NGO_partner", "research_institute"],
        "loyaltyTier": ["Global Partner", "Regional Partner", "National Partner", "Research Partner", "Data Contributor"],
        "segment": ["respiratory", "vector_borne", "waterborne", "zoonotic", "antimicrobial_resistance"],
        "Productname": ["Global Surveillance Platform", "Outbreak Response Engine", "Genomic Tracking Suite", "Contact Tracing Module", "Vaccine Monitoring Dashboard"],
        "ProductId": ["EPI-GS-001", "EPI-OR-002", "EPI-GT-003", "EPI-CT-004", "EPI-VM-005"],
        "ProductType": ["surveillance", "response", "genomic", "contact_tracing", "vaccine"],
        "Price": [5000000, 3000000, 2000000, 1500000, 1000000],
        "alertsPerDay": [150, 45, 200, 80, 30],
        "outbreakDetectionAccuracy": [0.94, 0.91, 0.96, 0.89, 0.92],
        "marketTrend": ["wastewater_surveillance", "genomic_real_time", "one_health", "pandemic_preparedness", "AI_epidemiology"]
    }
},
"config-payments-fraud-detection.json": {
    "co": "PaySecure Systems", "dom": "https://www.paysecure-systems.com",
    "ind": "Payments & FinTech", "jt": "Fraud Detection",
    "jd": "AI-Powered Real-Time Payment Fraud Detection",
    "steps": [
        {"sn": "TransactionScreening", "sv": "TransactionScreenService", "c": "Screening", "dur": 0.01, "d": "AI screens every transaction in real-time: velocity checks, geographic anomalies, device fingerprinting, and behavioural biometrics. Sub-50ms decision latency.", "r": "Payment fraud costs $32B annually. Real-time screening is the first defence. Every millisecond of latency matters for customer experience.", "sub": [("VelocityCheck", 0.003), ("GeoAnomaly", 0.003), ("BiometricCheck", 0.004)]},
        {"sn": "RiskScoring", "sv": "RiskScoreService", "c": "Analysis", "dur": 0.02, "d": "AI calculates transaction risk score from 150+ features: merchant category, amount pattern, time deviation, device trust, and network graph analysis. Ensemble ML models.", "r": "Accurate risk scoring reduces false positives by 50% while maintaining fraud catch rate above 95%. Every false positive costs $50 in customer friction.", "sub": [("FeatureExtraction", 0.007), ("EnsembleScoring", 0.007), ("DecisionEngine", 0.006)]},
        {"sn": "FraudPatternDetection", "sv": "PatternDetectService", "c": "Intelligence", "dur": 0.5, "d": "AI detects emerging fraud patterns: card testing attacks, account takeover sequences, synthetic identity frauds, and first-party fraud networks. Adaptive learning from new attacks.", "r": "Fraudsters constantly evolve tactics. Pattern detection identifies new attack vectors within hours vs weeks for rule-based systems.", "sub": [("CardTestingDetection", 0.15), ("AccountTakeoverDetection", 0.15), ("SyntheticIdentityDetection", 0.2)]},
        {"sn": "CaseManagement", "sv": "CaseManagementService", "c": "Investigation", "dur": 4, "d": "AI prioritises fraud cases, auto-generates investigation summaries, links related events, and recommends actions. Analyst workload optimised by case complexity scoring.", "r": "Fraud analysts can handle 3x more cases with AI assistance. Case prioritisation ensures highest-impact fraud is investigated first.", "sub": [("CasePrioritisation", 1), ("SummaryGeneration", 1.5), ("ActionRecommendation", 1.5)]},
        {"sn": "DisputeResolution", "sv": "DisputeService", "c": "Recovery", "dur": 48, "d": "AI manages chargeback responses: evidence compilation, reason code matching, and representment optimisation. Auto-resolution for clear-cut cases. Win rate prediction per case.", "r": "Chargebacks cost merchants $3.75 for every $1 of fraud. Effective representment recovers 40-60% of disputed transactions.", "sub": [("EvidenceCompilation", 16), ("RepresentmentOptimization", 16), ("WinRatePrediction", 16)]},
        {"sn": "FraudAnalytics", "sv": "FraudAnalyticsService", "c": "Analytics", "dur": 168, "d": "AI generates fraud performance reports: detection rates, false positive rates, loss trends by channel, and model drift monitoring. Regulatory reporting for PSD2/SCA compliance.", "r": "Continuous model monitoring prevents degradation. A 0.1% increase in fraud losses = $millions. Regulatory compliance avoids $10M+ fines.", "sub": [("DetectionMetrics", 56), ("LossTrends", 56), ("RegulatoryReporting", 56)]}
    ],
    "af": {
        "orderTotal": 85, "transactionValue": 85, "averageOrderValue": 120,
        "contractValue": 5000000, "annualRevenue": 500000000, "revenuePerCustomer": 2500000,
        "profitMargin": 40.0, "customerLifetimeValue": 20000000, "lifetimeValue": 20000000,
        "acquisitionCost": 250000, "costPerAcquisition": 250000, "conversionProbability": 0.25,
        "conversionRate": 25, "engagementScore": 88, "timeToConversion": 8640,
        "sessionDuration": 1800, "pageViews": 12, "purchaseFrequency": 365,
        "netPromoterScore": 52, "satisfactionRating": 4.3, "retentionProbability": 0.92,
        "processingTime": 0.01, "operationalCost": 0.02, "efficiencyRating": 95,
        "fraudDetectionRate": 96.5, "falsePositiveRate": 0.8,
        "channel": ["card_present", "card_not_present", "mobile_wallet", "bank_transfer", "BNPL"],
        "deviceType": ["POS_terminal", "mobile", "desktop", "mobile", "desktop"],
        "region": ["US", "UK", "EU", "Brazil", "India"],
        "customerSegmentValue": ["enterprise_bank", "retail_bank", "neobank", "payment_processor", "merchant_acquirer"],
        "loyaltyTier": ["Tier 1 Bank", "Mid-Tier Bank", "FinTech", "Merchant", "Startup"],
        "segment": ["card_fraud", "account_takeover", "synthetic_identity", "first_party_fraud", "merchant_fraud"],
        "Productname": ["Real-Time Fraud Engine", "Account Takeover Shield", "Synthetic ID Detector", "Chargeback Defender", "Fraud Analytics Dashboard"],
        "ProductId": ["PAY-RF-001", "PAY-AT-002", "PAY-SI-003", "PAY-CD-004", "PAY-FA-005"],
        "ProductType": ["real_time_detection", "account_protection", "identity_verification", "dispute_management", "analytics"],
        "Price": [2000000, 1500000, 800000, 500000, 300000],
        "transactionsPerSecond": [50000, 10000, 5000, 2000, 0],
        "modelAccuracy": [0.965, 0.942, 0.918, 0.875, 0],
        "marketTrend": ["real_time_payments_fraud", "synthetic_identity", "authorised_push_payment", "AI_vs_AI_fraud", "open_banking_risk"]
    }
},
"config-payments-processing.json": {
    "co": "PaySecure Systems", "dom": "https://www.paysecure-systems.com",
    "ind": "Payments & FinTech", "jt": "Payment Processing",
    "jd": "AI-Optimised Global Payment Processing",
    "steps": [
        {"sn": "PaymentInitiation", "sv": "PaymentInitService", "c": "Initiation", "dur": 0.1, "d": "AI optimises checkout: smart payment method ranking, one-click tokenised payments, and local payment method detection by geography. Multi-currency with optimal FX routing.", "r": "Offering the right payment method at checkout increases conversion by 20-30%. Missing local methods (iDEAL, Pix, UPI) loses 40% of local customers.", "sub": [("MethodRanking", 0.03), ("TokenisedPayment", 0.03), ("CurrencyDetection", 0.04)]},
        {"sn": "PaymentRouting", "sv": "RoutingService", "c": "Processing", "dur": 0.05, "d": "AI routes each transaction through optimal acquirer/processor: success rate maximisation, cost minimisation, and latency optimisation. Cascading fallback for declined transactions.", "r": "Smart routing improves authorisation rates by 3-8%. Each 1% auth rate improvement = millions in recovered revenue for large merchants.", "sub": [("AcquirerSelection", 0.02), ("CostOptimization", 0.015), ("CascadeLogic", 0.015)]},
        {"sn": "AuthorisationOptimization", "sv": "AuthService", "c": "Authorisation", "dur": 0.5, "d": "AI optimises authorisation: retry logic for soft declines, network token usage, SCA exemption request engine, and issuer-specific formatting for higher approval rates.", "r": "15-25% of declined transactions are recoverable with smart retry and formatting. Network tokens improve auth rates by 5-10% vs raw PANs.", "sub": [("RetryStrategy", 0.2), ("NetworkTokens", 0.15), ("SCAExemption", 0.15)]},
        {"sn": "SettlementAndReconciliation", "sv": "SettlementService", "c": "Finance", "dur": 24, "d": "AI manages multi-acquirer settlement, cross-currency reconciliation, and fee validation. Automated matching of transactions to settlements. Exception handling for mismatches.", "r": "Settlement errors cost merchants 0.5-1% of processed volume. Automated reconciliation reduces finance team effort by 80%.", "sub": [("SettlementMatching", 8), ("FeeValidation", 8), ("ExceptionHandling", 8)]},
        {"sn": "MerchantAnalytics", "sv": "MerchantAnalyticsService", "c": "Intelligence", "dur": 24, "d": "AI provides merchant dashboard: authorisation rates by issuer/BIN, decline reason analysis, cost analysis by route, and conversion funnel by payment method and geography.", "r": "Payment data is a goldmine of business intelligence. Merchants who act on payment analytics increase revenue by 5-15%.", "sub": [("AuthRateAnalysis", 8), ("DeclineReasons", 8), ("CostBreakdown", 8)]},
        {"sn": "ComplianceAndReporting", "sv": "ComplianceService", "c": "Compliance", "dur": 168, "d": "AI manages PCI-DSS compliance, PSD2/SCA reporting, scheme compliance (Visa/MC mandates), and tax withholding per jurisdiction. Audit trail generation.", "r": "PCI-DSS non-compliance can result in $5K-100K monthly fines. Scheme mandates change quarterly; automated compliance prevents costly violations.", "sub": [("PCIDSSAudit", 56), ("SchemeCompliance", 56), ("TaxWithholding", 56)]}
    ],
    "af": {
        "orderTotal": 85, "transactionValue": 85, "averageOrderValue": 120,
        "contractValue": 500000, "annualRevenue": 500000000, "revenuePerCustomer": 500000,
        "profitMargin": 25.0, "customerLifetimeValue": 3000000, "lifetimeValue": 3000000,
        "acquisitionCost": 50000, "costPerAcquisition": 50000, "conversionProbability": 0.30,
        "conversionRate": 30, "engagementScore": 82, "timeToConversion": 4320,
        "sessionDuration": 900, "pageViews": 8, "purchaseFrequency": 365,
        "netPromoterScore": 48, "satisfactionRating": 4.2, "retentionProbability": 0.88,
        "processingTime": 0.05, "operationalCost": 0.03, "efficiencyRating": 95,
        "authorizationRate": 92.5, "processingVolume": 50000000000,
        "channel": ["ecommerce", "in_store_POS", "mobile_in_app", "recurring_billing", "marketplace"],
        "deviceType": ["desktop", "POS_terminal", "mobile", "server", "desktop"],
        "region": ["US", "UK", "EU", "Latin America", "APAC"],
        "customerSegmentValue": ["enterprise_merchant", "mid_market", "SMB", "marketplace_platform", "SaaS_subscription"],
        "loyaltyTier": ["Enterprise", "Growth", "Starter", "Custom", "Partner"],
        "segment": ["card_payments", "bank_transfers", "digital_wallets", "BNPL", "crypto"],
        "Productname": ["Global Payment Gateway", "Smart Routing Engine", "Tokenisation Vault", "Recurring Billing Platform", "Payout Service"],
        "ProductId": ["PAY-GP-001", "PAY-SR-002", "PAY-TV-003", "PAY-RB-004", "PAY-PO-005"],
        "ProductType": ["gateway", "routing", "security", "billing", "payout"],
        "Price": [0, 200000, 100000, 150000, 0],
        "transactionsPerMonth": [500000000, 500000000, 500000000, 50000000, 100000000],
        "avgTransactionFee": [0.029, 0.025, 0.010, 0.015, 0.005],
        "marketTrend": ["real_time_payments", "embedded_finance", "open_banking", "cross_border_instant", "account_to_account"]
    }
},
"config-publishing-engagement.json": {
    "co": "PublishTech Media", "dom": "https://www.publishtech-media.com",
    "ind": "Publishing & Digital Media", "jt": "Reader Engagement",
    "jd": "AI-Powered Reader Engagement & Content Personalisation",
    "steps": [
        {"sn": "ReaderProfiling", "sv": "ReaderProfileService", "c": "Profiling", "dur": 168, "d": "AI builds reader profiles from reading history, dwell time, scroll depth, topic interests, and sharing behaviour. Reading personas and content affinity scores generated.", "r": "Deep reader understanding drives engagement. Personalised content recommendations increase page views per session by 40%.", "sub": [("ReadingHistoryAnalysis", 56), ("BehaviouralSignals", 56), ("PersonaMapping", 56)]},
        {"sn": "ContentPersonalisation", "sv": "ContentPersonService", "c": "Personalisation", "dur": 0.2, "d": "AI personalises homepage, article recommendations, and newsletter content per reader. Topic-based and behavioural targeting. Serendipity injection to prevent filter bubbles.", "r": "Personalised homepages generate 2x more article reads. Breaking filter bubbles maintains editorial breadth and prevents audience fragmentation.", "sub": [("HomepagePersonalisation", 0.07), ("ArticleRecommendation", 0.07), ("SerendipityInjection", 0.06)]},
        {"sn": "EngagementOptimization", "sv": "EngagementOptService", "c": "Engagement", "dur": 24, "d": "AI optimises headlines (A/B testing), article length, multimedia placement, and comment moderation. Push notification timing and frequency personalised per reader.", "r": "Headline optimisation alone increases click-through by 15-25%. Notification timing directly affects open rates: right time = 3x engagement.", "sub": [("HeadlineTesting", 8), ("MultimediaPlacement", 8), ("NotificationTiming", 8)]},
        {"sn": "NewsletterOptimization", "sv": "NewsletterService", "c": "Distribution", "dur": 24, "d": "AI curates personalised newsletters: content selection, subject line optimisation, send time optimisation, and format adaptation (brief vs deep). Subscriber segment targeting.", "r": "Newsletters are the strongest retention channel with 40% open rates vs 2% social media. AI-personalised newsletters reduce unsubscribe by 30%.", "sub": [("ContentCuration", 8), ("SubjectLineOptimization", 8), ("SendTimeOptimization", 8)]},
        {"sn": "PaywallOptimization", "sv": "PaywallService", "c": "Monetisation", "dur": 1, "d": "AI manages dynamic paywall: meter flexibility per user, propensity-to-subscribe scoring, and optimal conversion moment identification. Free article sampling strategy.", "r": "Dynamic paywalls convert 40% more subscribers than rigid meters. The sweet spot between too many free articles and too few is different per reader.", "sub": [("MeterFlexibility", 0.3), ("PropensityScoring", 0.3), ("ConversionMoment", 0.4)]},
        {"sn": "ContentAnalytics", "sv": "ContentAnalyticsService", "c": "Analytics", "dur": 168, "d": "AI analyses content performance: article engagement depth, topic trends, author performance, and editorial calendar effectiveness. Newsroom resource allocation recommendations.", "r": "Data-informed newsrooms produce 25% more high-performing content. Understanding what resonates guides editorial strategy without compromising journalism.", "sub": [("ArticlePerformance", 56), ("TopicTrending", 56), ("AuthorAnalytics", 56)]}
    ],
    "af": {
        "orderTotal": 0, "transactionValue": 0, "averageOrderValue": 0,
        "contractValue": 0, "annualRevenue": 500000000, "revenuePerCustomer": 120,
        "profitMargin": 15.0, "customerLifetimeValue": 600, "lifetimeValue": 600,
        "acquisitionCost": 4, "costPerAcquisition": 4, "conversionProbability": 0.02,
        "conversionRate": 2, "engagementScore": 65, "timeToConversion": 20160,
        "sessionDuration": 420, "pageViews": 6, "purchaseFrequency": 30,
        "netPromoterScore": 35, "satisfactionRating": 3.8, "retentionProbability": 0.60,
        "processingTime": 0.1, "operationalCost": 0.05, "efficiencyRating": 85,
        "avgDwellTime": 180, "articlesPerSession": 3.2,
        "channel": ["website", "mobile_app", "newsletter", "social_media", "google_discover"],
        "deviceType": ["desktop", "mobile", "email", "mobile", "mobile"],
        "region": ["US", "UK", "India", "Australia", "Canada"],
        "customerSegmentValue": ["loyal_subscriber", "registered_free", "flyby_visitor", "newsletter_only", "social_referral"],
        "loyaltyTier": ["Premium Subscriber", "Digital Subscriber", "Registered Free", "Anonymous", "Churned"],
        "segment": ["news", "opinion", "lifestyle", "sport", "business"],
        "Productname": ["Premium Digital Access", "Standard Digital", "Weekend Print+Digital", "All Access Bundle", "Student Subscription"],
        "ProductId": ["PUB-PD-001", "PUB-SD-002", "PUB-WP-003", "PUB-AA-004", "PUB-SS-005"],
        "ProductType": ["premium_digital", "standard_digital", "print_digital", "all_access", "student"],
        "Price": [19.99, 12.99, 29.99, 39.99, 4.99],
        "bounceRate": [0.45, 0.55, 0.30, 0.65, 0.70],
        "paywallConversion": [0.015, 0.035, 0.008, 0.055, 0.005],
        "marketTrend": ["newsletter_renaissance", "audio_journalism", "AI_content_tools", "subscriber_only_events", "bundled_subscriptions"]
    }
},
"config-publishing-subscription.json": {
    "co": "PublishTech Media", "dom": "https://www.publishtech-media.com",
    "ind": "Publishing & Digital Media", "jt": "Subscription Management",
    "jd": "AI-Optimised Publishing Subscription Lifecycle",
    "steps": [
        {"sn": "TrialOnboarding", "sv": "TrialOnboardService", "c": "Acquisition", "dur": 336, "d": "AI optimises trial experience: personalised content recommendations during trial, habit-building nudges, and premium feature sampling. Trial extension for high-engagement users.", "r": "Trial-to-paid conversion averages 30% for publishing. AI-optimised trials improve to 45%. Every 1% = thousands of new subscribers.", "sub": [("PersonalisedOnboarding", 112), ("HabitBuilding", 112), ("ConversionTrigger", 112)]},
        {"sn": "SubscriptionConversion", "sv": "ConversionService", "c": "Conversion", "dur": 1, "d": "AI identifies optimal conversion moment: propensity scoring, personalised offer selection (plan, discount, term), and urgency messaging. Frictionless checkout with saved payment.", "r": "Converting readers at peak engagement raises subscription rates by 60%. The right offer at the right moment is 5x more effective than a generic popup.", "sub": [("PropensityScoring", 0.3), ("OfferSelection", 0.3), ("CheckoutOptimization", 0.4)]},
        {"sn": "SubscriberNurturing", "sv": "NurturingService", "c": "Engagement", "dur": 720, "d": "AI nurtures subscribers: personalised content alerts, exclusive content previews, and community features. Reading streaks and achievement badges. Subscriber-only events and perks.", "r": "Subscribers who read 5+ articles in the first week have 80% 1-year retention. Nurturing builds the reading habit early.", "sub": [("ContentAlerts", 240), ("ExclusivePreview", 240), ("CommunityEngagement", 240)]},
        {"sn": "ChurnPrevention", "sv": "ChurnPreventService", "c": "Retention", "dur": 24, "d": "AI predicts churn risk from engagement decline, payment failure signals, and cancellation page visits. Proactive retention offers: plan downgrade, pause, or discount.", "r": "Saving 10% of churning subscribers = 10x ROI on retention spend. A pause option recovers 25% of subscribers about to cancel.", "sub": [("ChurnPrediction", 8), ("RetentionOffers", 8), ("PauseOption", 8)]},
        {"sn": "PricingOptimization", "sv": "PricingService", "c": "Revenue", "dur": 168, "d": "AI optimises pricing: elasticity modelling, bundle design, promotional pricing, and geo-specific pricing. Annual vs monthly plan incentives. Family/group plan design.", "r": "Price sensitivity varies 3x across reader segments. Optimised pricing increases ARPU by 10-20% without increasing churn.", "sub": [("ElasticityModelling", 56), ("BundleDesign", 56), ("GeoSpecificPricing", 56)]},
        {"sn": "SubscriptionAnalytics", "sv": "SubAnalyticsService", "c": "Analytics", "dur": 168, "d": "AI analyses subscription metrics: MRR growth, churn cohorts, LTV by acquisition source, and engagement-to-revenue correlation. Board reporting with predictive forecasting.", "r": "Subscription analytics connect editorial quality to business performance. Data-driven publishing companies grow 2x faster than peers.", "sub": [("MRRAnalysis", 56), ("CohortTracking", 56), ("LTVForecasting", 56)]}
    ],
    "af": {
        "orderTotal": 12.99, "transactionValue": 12.99, "averageOrderValue": 18.50,
        "contractValue": 0, "annualRevenue": 500000000, "revenuePerCustomer": 180,
        "profitMargin": 15.0, "customerLifetimeValue": 600, "lifetimeValue": 600,
        "acquisitionCost": 30, "costPerAcquisition": 30, "conversionProbability": 0.04,
        "conversionRate": 4, "engagementScore": 68, "timeToConversion": 10080,
        "sessionDuration": 360, "pageViews": 5, "purchaseFrequency": 12,
        "netPromoterScore": 38, "satisfactionRating": 3.9, "retentionProbability": 0.75,
        "processingTime": 5, "operationalCost": 2, "efficiencyRating": 82,
        "monthlyChurn": 5.5, "trialConversion": 32,
        "channel": ["website_paywall", "mobile_app", "newsletter_upsell", "social_media_ad", "referral_programme"],
        "deviceType": ["desktop", "mobile", "email", "mobile", "desktop"],
        "region": ["US", "UK", "India", "Australia", "Canada"],
        "customerSegmentValue": ["digital_native", "print_migrator", "student", "corporate", "gifted_subscription"],
        "loyaltyTier": ["Lifetime Subscriber", "Annual", "Monthly", "Trial", "Churned"],
        "segment": ["individual_digital", "family_plan", "corporate_licence", "student_plan", "group_subscription"],
        "Productname": ["Digital All Access", "Print + Digital Bundle", "Corporate Group Licence", "Student Discount Plan", "Gift Subscription"],
        "ProductId": ["SUB-DA-001", "SUB-PD-002", "SUB-CG-003", "SUB-SD-004", "SUB-GS-005"],
        "ProductType": ["individual", "bundle", "corporate", "student", "gift"],
        "Price": [12.99, 29.99, 99.99, 4.99, 99.00],
        "renewalRate": [0.72, 0.80, 0.90, 0.55, 0.25],
        "mrrContribution": [50, 20, 15, 8, 7],
        "marketTrend": ["AI_personalised_paywall", "newsletter_first_strategy", "micro_payments", "community_model", "bundled_news"]
    }
},
"config-rail-predictive-maintenance.json": {
    "co": "RailTech Systems", "dom": "https://www.railtech-systems.com",
    "ind": "Rail & Transit", "jt": "Predictive Maintenance",
    "jd": "AI-Powered Rail Infrastructure Predictive Maintenance",
    "steps": [
        {"sn": "AssetMonitoring", "sv": "AssetMonitorService", "c": "Monitoring", "dur": 0.01, "d": "AI monitors rail assets from track-side sensors, onboard diagnostics, measurement trains, and drone inspections. Track geometry, rail wear, signalling health, and rolling stock vibration.", "r": "Rail infrastructure failures cause delays costing $1M+ per incident. Continuous monitoring catches degradation that periodic inspections miss.", "sub": [("TrackGeometry", 0.003), ("RailWearSensors", 0.003), ("SignallingHealth", 0.004)]},
        {"sn": "DegradationModelling", "sv": "DegradationModelService", "c": "Prediction", "dur": 168, "d": "AI models asset degradation curves: rail fatigue, sleeper deterioration, ballast settlement, and points mechanism wear. Remaining useful life estimation per asset.", "r": "Understanding degradation rates enables optimal intervention timing: too early wastes money, too late causes failures and delays.", "sub": [("RailFatigueModelling", 56), ("SleeperDeterioration", 56), ("PointsMechanismWear", 56)]},
        {"sn": "MaintenancePlanning", "sv": "MaintenancePlanService", "c": "Planning", "dur": 24, "d": "AI generates maintenance plans: work bank prioritisation, possession window optimisation, and resource allocation. Integration with timetable to minimise passenger disruption.", "r": "Track possessions (maintenance windows) cost $10K-100K per hour in lost capacity. AI planning reduces possession duration by 20-30%.", "sub": [("WorkBankPrioritisation", 8), ("PossessionOptimization", 8), ("ResourceAllocation", 8)]},
        {"sn": "WorkExecution", "sv": "WorkExecService", "c": "Operations", "dur": 8, "d": "AI guides maintenance teams: real-time work progress tracking, quality verification, and safety compliance. Digital work instructions and competency matching for specialist tasks.", "r": "Quality assurance during maintenance prevents repeat failures. Digital tracking ensures compliance with railway safety standards.", "sub": [("WorkTracking", 3), ("QualityVerification", 3), ("SafetyCompliance", 2)]},
        {"sn": "PerformanceVerification", "sv": "PerfVerifyService", "c": "Verification", "dur": 24, "d": "AI validates maintenance effectiveness: before/after sensor comparison, speed restriction removal tracking, and fault recurrence monitoring. Maintenance quality scoring.", "r": "30% of maintenance interventions don't fully resolve the underlying issue. Post-maintenance verification catches these before they cause another failure.", "sub": [("SensorComparison", 8), ("SpeedRestrictionTracking", 8), ("RecurrenceMonitoring", 8)]},
        {"sn": "AssetLifecycleAnalytics", "sv": "AssetAnalyticsService", "c": "Analytics", "dur": 720, "d": "AI analyses total cost of ownership per asset type, renewal vs maintenance decision support, and capital programme prioritisation. 5-30 year asset management planning.", "r": "Rail infrastructure has 30-100 year lifecycles. AI-informed renewal decisions optimise $billions in capital expenditure across the network.", "sub": [("TCOAnalysis", 240), ("RenewalDecisionSupport", 240), ("CapitalProgramming", 240)]}
    ],
    "af": {
        "orderTotal": 0, "transactionValue": 0, "averageOrderValue": 0,
        "contractValue": 500000000, "annualRevenue": 15000000000, "revenuePerCustomer": 0,
        "profitMargin": 5.0, "customerLifetimeValue": 0, "lifetimeValue": 0,
        "acquisitionCost": 0, "costPerAcquisition": 0, "conversionProbability": 1.0,
        "conversionRate": 100, "engagementScore": 85, "timeToConversion": 0,
        "sessionDuration": 28800, "pageViews": 30, "purchaseFrequency": 365,
        "netPromoterScore": 0, "satisfactionRating": 0, "retentionProbability": 1.0,
        "processingTime": 60, "operationalCost": 2000000000, "efficiencyRating": 75,
        "networkReliability": 93.5, "delayMinutesReduced": 2500000,
        "channel": ["SCADA_rail", "mobile_field_app", "engineering_portal", "control_centre", "drone_inspection"],
        "deviceType": ["HMI_panel", "ruggedised_tablet", "desktop", "control_desk", "UAV"],
        "region": ["UK Network Rail", "Deutsche Bahn DE", "SNCF France", "JR East Japan", "Indian Railways"],
        "customerSegmentValue": ["high_speed_line", "commuter_suburban", "freight_corridor", "regional_line", "metro_urban"],
        "loyaltyTier": ["Critical National", "High Usage", "Standard", "Rural", "Heritage"],
        "segment": ["track_infrastructure", "signalling_systems", "rolling_stock", "stations", "power_systems"],
        "Productname": ["Track Geometry AI Monitor", "Points & Crossing Predictor", "Signalling Health Suite", "Rail Defect Detector", "Overhead Line Monitor"],
        "ProductId": ["RAIL-TG-001", "RAIL-PC-002", "RAIL-SH-003", "RAIL-RD-004", "RAIL-OL-005"],
        "ProductType": ["track", "switches", "signalling", "rail_defect", "overhead_line"],
        "Price": [25000000, 15000000, 20000000, 10000000, 12000000],
        "routeKmMonitored": [30000, 15000, 30000, 30000, 12000],
        "failureReduction": [0.35, 0.40, 0.28, 0.32, 0.25],
        "marketTrend": ["digital_railway", "autonomous_inspection", "ERTMS_migration", "hydrogen_rail", "passenger_experience_AI"]
    }
},
"config-rail-timetable-optimization.json": {
    "co": "RailTech Systems", "dom": "https://www.railtech-systems.com",
    "ind": "Rail & Transit", "jt": "Timetable Optimization",
    "jd": "AI-Optimised Rail Timetabling & Capacity Management",
    "steps": [
        {"sn": "DemandForecasting", "sv": "DemandForecastService", "c": "Forecasting", "dur": 168, "d": "AI forecasts passenger demand by route, time, and day: ticket sales, smart card data, mobile signals, and event calendars. Long-term growth modelling for infrastructure planning.", "r": "Understanding demand at 15-minute granularity enables right-size services. Over-provision wastes capacity; under-provision creates overcrowding and poor customer experience.", "sub": [("HistoricAnalysis", 56), ("EventImpact", 56), ("GrowthModelling", 56)]},
        {"sn": "TimetableGeneration", "sv": "TimetableGenService", "c": "Planning", "dur": 720, "d": "AI generates conflict-free timetables: platform allocation, junction timing, rolling stock utilisation, and crew rostering. Multi-objective optimisation for speed, frequency, and cost.", "r": "Timetable planning is NP-hard with millions of constraints. AI finds solutions 15% more efficient than human planners while satisfying all safety constraints.", "sub": [("ConflictResolution", 240), ("PlatformAllocation", 240), ("CrewRostering", 240)]},
        {"sn": "RealTimeRescheduling", "sv": "RescheduleService", "c": "Operations", "dur": 0.5, "d": "AI manages real-time disruption: automatic rescheduling during incidents, platform changes, connection protection, and rolling stock reallocation. Passenger information updates.", "r": "Disruption costs the rail industry $5B+ annually. AI rescheduling reduces recovery time by 30-50% and protects passenger connections.", "sub": [("DisruptionAssessment", 0.15), ("AutoRescheduling", 0.2), ("ConnectionProtection", 0.15)]},
        {"sn": "CapacityOptimization", "sv": "CapacityOptService", "c": "Optimisation", "dur": 24, "d": "AI optimises network capacity: train length decisions, skip-stop patterns, express/local service mix, and off-peak frequency adjustment. Freight path allocation.", "r": "Extracting 5% more capacity from existing infrastructure avoids $billion infrastructure upgrades. AI identifies capacity without building new lines.", "sub": [("TrainLengthDecisions", 8), ("ServicePatternMix", 8), ("FreightPathing", 8)]},
        {"sn": "PricingAndRevenue", "sv": "PricingRevService", "c": "Revenue", "dur": 24, "d": "AI implements dynamic rail pricing: off-peak incentives, advance purchase discounts, and demand-responsive fares. Yield management for high-speed and long-distance services.", "r": "Dynamic pricing shifts 10-15% of peak demand to off-peak. Revenue management increases yield by 8-12% while improving load factor distribution.", "sub": [("DemandPricing", 8), ("YieldManagement", 8), ("IncentiveDesign", 8)]},
        {"sn": "NetworkAnalytics", "sv": "NetworkAnalyticsService", "c": "Analytics", "dur": 168, "d": "AI analyses network performance: punctuality, capacity utilisation, passenger satisfaction by route, and bottleneck identification. Strategic planning for frequency increases and new routes.", "r": "Network analytics identify the 5% of infrastructure causing 80% of delays. Targeted investment in bottlenecks gives 10x return vs spread investment.", "sub": [("PunctualityAnalysis", 56), ("BottleneckIdentification", 56), ("StrategicPlanning", 56)]}
    ],
    "af": {
        "orderTotal": 12, "transactionValue": 12, "averageOrderValue": 25,
        "contractValue": 200000000, "annualRevenue": 15000000000, "revenuePerCustomer": 450,
        "profitMargin": 5.0, "customerLifetimeValue": 9000, "lifetimeValue": 9000,
        "acquisitionCost": 2, "costPerAcquisition": 2, "conversionProbability": 0.85,
        "conversionRate": 85, "engagementScore": 55, "timeToConversion": 60,
        "sessionDuration": 180, "pageViews": 4, "purchaseFrequency": 200,
        "netPromoterScore": 28, "satisfactionRating": 3.5, "retentionProbability": 0.80,
        "processingTime": 15, "operationalCost": 5, "efficiencyRating": 72,
        "punctuality": 88.2, "loadFactor": 72,
        "channel": ["mobile_ticket_app", "station_kiosk", "website", "smartcard_tap", "conductor_sale"],
        "deviceType": ["mobile", "kiosk", "desktop", "smartcard", "handheld"],
        "region": ["London-Edinburgh UK", "Berlin-Munich DE", "Paris-Lyon FR", "Tokyo-Osaka JP", "Delhi-Mumbai IN"],
        "customerSegmentValue": ["season_commuter", "advance_leisure", "walk_up_business", "railcard_holder", "tourist"],
        "loyaltyTier": ["Season Ticket Holder", "Frequent Traveller", "Railcard Member", "Occasional", "Tourist"],
        "segment": ["high_speed", "intercity", "commuter", "regional", "freight"],
        "Productname": ["AI Timetable Planner", "Real-Time Reschedule Engine", "Demand Forecast Module", "Dynamic Pricing Engine", "Capacity Optimizer"],
        "ProductId": ["RAIL-TP-001", "RAIL-RR-002", "RAIL-DF-003", "RAIL-DP-004", "RAIL-CO-005"],
        "ProductType": ["planning", "operations", "forecasting", "pricing", "capacity"],
        "Price": [30000000, 20000000, 15000000, 25000000, 18000000],
        "trainPathsPerDay": [25000, 25000, 0, 25000, 5000],
        "capacityUtilisation": [0.72, 0.68, 0, 0.75, 0.55],
        "marketTrend": ["mobility_as_a_service", "integrated_ticketing", "autonomous_trains", "green_rail_shift", "highspeed_expansion"]
    }
},
}

if __name__ == "__main__":
    for fn, data in SECTORS.items():
        gen(fn, data)
    print(f"Batch 7 complete: {len(SECTORS)} configs updated.")
