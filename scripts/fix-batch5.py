#!/usr/bin/env python3
"""Batch 5: hospitality, hr, industrial, lottery"""
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
"config-hospitality-booking-journey.json": {
    "co": "HotelTech International", "dom": "https://www.hoteltech-intl.com",
    "ind": "Hospitality & Travel", "jt": "Guest Booking",
    "jd": "AI-Personalised Hotel Guest Booking Journey",
    "steps": [
        {"sn": "SearchAndDiscovery", "sv": "SearchService", "c": "Discovery", "dur": 0.5, "d": "AI-powered search with personalised results based on loyalty history, past stays, and preferences. Dynamic pricing displayed. Competitive rate comparison.", "r": "Personalised search increases direct booking by 25%. Each OTA booking costs 15-25% commission.", "sub": [("PersonalisedSearch", 0.2), ("DynamicPricing", 0.15), ("RateComparison", 0.15)]},
        {"sn": "RoomSelection", "sv": "RoomService", "c": "Selection", "dur": 3, "d": "AI recommends room type, view, floor, and upgrades based on guest profile. Virtual room tour available. Upsell propensity scored per guest.", "r": "AI upselling generates $15-30 incremental revenue per booking. Matching guest to right room reduces complaint rate by 40%.", "sub": [("RoomRecommendation", 1), ("VirtualTour", 1), ("UpsellOptimization", 1)]},
        {"sn": "BookingConfirmation", "sv": "BookingConfirmService", "c": "Transaction", "dur": 0.5, "d": "Secure payment, loyalty point accrual, and confirmation. Pre-arrival preferences captured: pillow type, minibar stocking, check-in time, and restaurant reservations.", "r": "Pre-arrival preference capture improves guest satisfaction by 20%. Guests who share preferences have 15% higher spend during stay.", "sub": [("PaymentProcessing", 0.2), ("LoyaltyAccrual", 0.1), ("PreferenceCapture", 0.2)]},
        {"sn": "PreArrivalExperience", "sv": "PreArrivalService", "c": "Engagement", "dur": 48, "d": "AI sends personalised pre-arrival communication: local area guide, restaurant recommendations, spa booking offers, and mobile check-in option.", "r": "Pre-arrival engagement drives 30% more ancillary bookings. Mobile check-in reduces front desk queue and improves arrival experience.", "sub": [("LocalGuide", 16), ("AncillaryOffers", 16), ("MobileCheckIn", 16)]},
        {"sn": "OnPropertyExperience", "sv": "OnPropertyService", "c": "Experience", "dur": 48, "d": "AI concierge: restaurant reservations, activity booking, room service personalisation. Real-time issue detection from IoT sensors and sentiment analysis.", "r": "In-stay AI concierge increases guest spend by 20-35%. Real-time issue detection enables recovery before guests complain.", "sub": [("AIConcierge", 16), ("PersonalisedOffers", 16), ("IssueDetection", 16)]},
        {"sn": "PostStayEngagement", "sv": "PostStayService", "c": "Retention", "dur": 720, "d": "AI-triggered review request, loyalty programme engagement, and personalised re-booking offers. Sentiment analysis of reviews for operational improvement.", "r": "Post-stay engagement drives 25% increase in direct rebooking. A 0.1 improvement in review score = 2% increase in RevPAR.", "sub": [("ReviewManagement", 240), ("LoyaltyEngagement", 240), ("RebookingOffers", 240)]}
    ],
    "af": {
        "orderTotal": 450, "transactionValue": 450, "averageOrderValue": 380,
        "contractValue": 0, "annualRevenue": 250000000, "revenuePerCustomer": 1800,
        "profitMargin": 22.0, "customerLifetimeValue": 12000, "lifetimeValue": 12000,
        "acquisitionCost": 45, "costPerAcquisition": 45, "conversionProbability": 0.08,
        "conversionRate": 8, "engagementScore": 78, "timeToConversion": 1440,
        "sessionDuration": 600, "pageViews": 12, "purchaseFrequency": 4,
        "netPromoterScore": 52, "satisfactionRating": 4.3, "retentionProbability": 0.55,
        "processingTime": 30, "operationalCost": 85, "efficiencyRating": 80,
        "revPAR": 185, "occupancyRate": 78,
        "channel": ["direct_website", "mobile_app", "booking_com", "expedia", "corporate_portal"],
        "deviceType": ["desktop", "mobile", "mobile", "desktop", "desktop"],
        "region": ["London", "Paris", "New York", "Dubai", "Tokyo"],
        "customerSegmentValue": ["luxury_leisure", "business_traveller", "group_conference", "wedding_event", "OTA_guest"],
        "loyaltyTier": ["Ambassador", "Platinum", "Gold", "Silver", "Member"],
        "segment": ["luxury", "business", "resort", "boutique", "extended_stay"],
        "Productname": ["Deluxe City View Suite", "Executive Business Room", "Presidential Suite", "Standard Double", "Club Level Access"],
        "ProductId": ["HTL-DX-001", "HTL-EX-002", "HTL-PS-003", "HTL-SD-004", "HTL-CL-005"],
        "ProductType": ["suite", "executive", "presidential", "standard", "club"],
        "Price": [650, 350, 2500, 180, 450],
        "nightsBooked": [3, 2, 5, 1, 4],
        "guestRating": [4.8, 4.5, 4.9, 4.2, 4.6],
        "marketTrend": ["AI_concierge", "mobile_first_booking", "experience_economy", "sustainable_hospitality", "bleisure_travel"]
    }
},
"config-hospitality-corporate-booking.json": {
    "co": "HotelTech International", "dom": "https://www.hoteltech-intl.com",
    "ind": "Hospitality & Travel", "jt": "Corporate Booking",
    "jd": "AI-Managed Corporate Travel & Accommodation",
    "steps": [
        {"sn": "RateNegotiation", "sv": "RateNegotiationService", "c": "Procurement", "dur": 720, "d": "AI analyses corporate travel patterns, room night volumes, and market rates to negotiate optimal corporate rates. Dynamic discount structures based on commitment tiers.", "r": "AI-negotiated rates save 10-20% vs standard corporate discounts. Volume commitment optimisation maximises discount without over-committing.", "sub": [("PatternAnalysis", 240), ("MarketBenchmarking", 240), ("TierOptimization", 240)]},
        {"sn": "PolicyCompliance", "sv": "PolicyService", "c": "Compliance", "dur": 0.5, "d": "AI enforces corporate travel policy at booking time. Budget limits, preferred properties, advance booking requirements, and approval workflows automated.", "r": "Policy compliance reduces travel spend by 15-25%. Without enforcement, 40% of bookings violate policy.", "sub": [("BudgetCheck", 0.2), ("PropertyCompliance", 0.15), ("ApprovalRouting", 0.15)]},
        {"sn": "BookingOptimization", "sv": "BookingOptService", "c": "Booking", "dur": 1, "d": "AI recommends optimal property for each trip: nearest to meeting location, best rate, loyalty status consideration, and traveller preference matching.", "r": "Smart property recommendation saves 20 minutes per booking and reduces location-related complaints by 60%.", "sub": [("LocationMatching", 0.3), ("RateComparison", 0.3), ("PreferenceMatching", 0.4)]},
        {"sn": "ExpenseManagement", "sv": "ExpenseService", "c": "Finance", "dur": 2, "d": "AI auto-captures folio charges, matches to bookings, and generates expense reports. Policy violations flagged. Tax reclaim (VAT/GST) automated per jurisdiction.", "r": "Automated expense management saves 30 minutes per trip per employee. VAT recovery adds 5-15% to travel spend savings.", "sub": [("FolioCapture", 0.5), ("ExpenseMatching", 0.5), ("TaxReclaim", 1)]},
        {"sn": "TravellerSatisfaction", "sv": "SatisfactionService", "c": "Experience", "dur": 24, "d": "AI surveys travellers post-stay, aggregates property ratings, and generates preferred property lists. Traveller wellbeing tracked for duty of care.", "r": "Traveller satisfaction directly affects talent retention. Companies with good travel programmes have 20% higher satisfaction among frequent travellers.", "sub": [("PostStaySurvey", 8), ("PropertyRating", 8), ("WellbeingTracking", 8)]},
        {"sn": "SpendAnalytics", "sv": "SpendAnalyticsService", "c": "Analytics", "dur": 168, "d": "AI analyses total travel spend by department, destination, property, and traveller. Identifies savings opportunities, negotiation leverage, and policy gaps.", "r": "Travel spend analytics identifies 8-15% additional savings. Board-level reporting justifies travel programme investment.", "sub": [("SpendBreakdown", 56), ("SavingsIdentification", 56), ("NegotiationInsights", 56)]}
    ],
    "af": {
        "orderTotal": 280, "transactionValue": 280, "averageOrderValue": 320,
        "contractValue": 2500000, "annualRevenue": 250000000, "revenuePerCustomer": 85000,
        "profitMargin": 18.0, "customerLifetimeValue": 500000, "lifetimeValue": 500000,
        "acquisitionCost": 5000, "costPerAcquisition": 5000, "conversionProbability": 0.72,
        "conversionRate": 72, "engagementScore": 70, "timeToConversion": 4320,
        "sessionDuration": 300, "pageViews": 5, "purchaseFrequency": 48,
        "netPromoterScore": 40, "satisfactionRating": 3.9, "retentionProbability": 0.85,
        "processingTime": 10, "operationalCost": 35, "efficiencyRating": 82,
        "policyCompliance": 88, "avgDailyRate": 195,
        "channel": ["TMC_platform", "corporate_portal", "mobile_app", "email_booking", "direct_phone"],
        "deviceType": ["desktop", "desktop", "mobile", "desktop", "phone"],
        "region": ["London", "New York", "Frankfurt", "Singapore", "Sydney"],
        "customerSegmentValue": ["executive", "senior_manager", "consultant", "sales_team", "technical_staff"],
        "loyaltyTier": ["C-Suite", "Director", "Manager", "Individual", "Contractor"],
        "segment": ["transient_business", "group_meeting", "conference", "extended_stay", "project_based"],
        "Productname": ["Corporate Rate Room", "Meeting Room Block", "Conference Package", "Extended Stay Suite", "Project Team Rate"],
        "ProductId": ["CRP-CR-001", "CRP-MR-002", "CRP-CP-003", "CRP-ES-004", "CRP-PT-005"],
        "ProductType": ["corporate_rate", "group_block", "conference", "extended_stay", "project"],
        "Price": [195, 180, 250, 165, 175],
        "roomNightsBooked": [25000, 5000, 3000, 8000, 12000],
        "savingsVsRack": [0.28, 0.22, 0.35, 0.40, 0.25],
        "marketTrend": ["managed_travel_AI", "bleisure", "sustainability_reporting", "duty_of_care", "virtual_meetings_offset"]
    }
},
"config-hr-talent-acquisition.json": {
    "co": "TalentTech HR", "dom": "https://www.talenttech-hr.com",
    "ind": "Human Resources & HRTech", "jt": "Talent Acquisition",
    "jd": "AI-Powered Recruitment & Hiring",
    "steps": [
        {"sn": "JobRequisition", "sv": "RequisitionService", "c": "Initiation", "dur": 4, "d": "AI auto-generates job descriptions from role requirements, market benchmarks, and internal career frameworks. Compensation ranges set from real-time market data.", "r": "Well-crafted JDs attract 40% more qualified applicants. Market-aligned compensation prevents losing candidates to counter-offers.", "sub": [("JDGeneration", 1.5), ("CompBenchmarking", 1.5), ("ApprovalRouting", 1)]},
        {"sn": "CandidateSourcing", "sv": "SourcingService", "c": "Sourcing", "dur": 168, "d": "AI sources candidates from job boards, LinkedIn, internal mobility, referral networks, and talent pools. Diversity-aware sourcing ensures inclusive pipelines.", "r": "AI sourcing identifies 3x more qualified candidates. Diverse slates lead to 35% better hiring outcomes.", "sub": [("MultiChannelPosting", 48), ("PassiveSourcing", 72), ("DiversityTargeting", 48)]},
        {"sn": "ScreeningAndShortlisting", "sv": "ScreeningService", "c": "Assessment", "dur": 24, "d": "AI screens CVs against job requirements, skills, and culture fit indicators. Bias-mitigated scoring ensures fair evaluation. Top candidates shortlisted for interviews.", "r": "AI screening reduces time-to-shortlist from 2 weeks to 2 days. Consistent, bias-aware scoring improves quality of hire.", "sub": [("CVParsing", 8), ("SkillMatching", 8), ("BiasAudit", 8)]},
        {"sn": "InterviewProcess", "sv": "InterviewService", "c": "Evaluation", "dur": 168, "d": "AI schedules interviews, generates role-specific question banks, and provides interviewer scoring frameworks. Structured interviews with AI-assisted debrief analysis.", "r": "Structured interviews predict job performance 2x better than unstructured. AI scheduling eliminates 80% of coordination overhead.", "sub": [("Scheduling", 24), ("QuestionGeneration", 48), ("ScoringFramework", 96)]},
        {"sn": "OfferManagement", "sv": "OfferService", "c": "Closing", "dur": 48, "d": "AI generates competitive offer packages. Counter-offer probability predicted. Negotiation guidance provided. Offer acceptance tracked with pipeline analytics.", "r": "AI-optimised offers improve acceptance rate from 75% to 90%. Each declined offer wastes $5K-15K in recruitment costs and restarts the process.", "sub": [("OfferGeneration", 16), ("NegotiationGuidance", 16), ("AcceptanceTracking", 16)]},
        {"sn": "OnboardingHandoff", "sv": "OnboardingService", "c": "Transition", "dur": 240, "d": "AI generates personalised onboarding plan: documentation, equipment, training schedule, buddy assignment, and 90-day goals. New hire engagement tracked.", "r": "Structured onboarding improves new hire retention by 82% and productivity ramp by 50%. Poor onboarding is the #1 cause of early attrition.", "sub": [("DocumentSetup", 48), ("TrainingPlan", 96), ("BuddyAssignment", 96)]}
    ],
    "af": {
        "orderTotal": 0, "transactionValue": 0, "averageOrderValue": 0,
        "contractValue": 500000, "annualRevenue": 20000000, "revenuePerCustomer": 150000,
        "profitMargin": 25.0, "customerLifetimeValue": 1200000, "lifetimeValue": 1200000,
        "acquisitionCost": 8500, "costPerAcquisition": 8500, "conversionProbability": 0.35,
        "conversionRate": 35, "engagementScore": 75, "timeToConversion": 5040,
        "sessionDuration": 1200, "pageViews": 8, "purchaseFrequency": 12,
        "netPromoterScore": 42, "satisfactionRating": 4.0, "retentionProbability": 0.85,
        "processingTime": 10080, "operationalCost": 6500, "efficiencyRating": 72,
        "timeToHire": 35, "costPerHire": 4200,
        "channel": ["careers_site", "linkedin", "indeed", "referral_portal", "university_portal"],
        "deviceType": ["desktop", "mobile", "mobile", "desktop", "mobile"],
        "region": ["San Francisco", "London", "Berlin", "Singapore", "Bangalore"],
        "customerSegmentValue": ["engineering", "sales", "operations", "executive", "graduate"],
        "loyaltyTier": ["Executive", "Senior", "Mid-Level", "Junior", "Intern"],
        "segment": ["tech_hiring", "sales_hiring", "executive_search", "graduate_programme", "contract"],
        "Productname": ["Full Recruitment Cycle", "Executive Search Retainer", "Graduate Programme", "Contract Staffing", "RPO Service"],
        "ProductId": ["HR-FC-001", "HR-ES-002", "HR-GP-003", "HR-CS-004", "HR-RP-005"],
        "ProductType": ["permanent", "executive", "graduate", "contract", "outsourced"],
        "Price": [8500, 45000, 3500, 5000, 120000],
        "applicationToHire": [0.02, 0.08, 0.05, 0.10, 0.015],
        "offerAcceptance": [0.85, 0.90, 0.95, 0.92, 0.88],
        "marketTrend": ["AI_screening", "skills_based_hiring", "internal_mobility", "DEI_analytics", "candidate_experience"]
    }
},
"config-hr-employee-engagement.json": {
    "co": "TalentTech HR", "dom": "https://www.talenttech-hr.com",
    "ind": "Human Resources & HRTech", "jt": "Employee Engagement",
    "jd": "AI-Driven Employee Experience & Engagement",
    "steps": [
        {"sn": "PulseSurveying", "sv": "PulseSurveyService", "c": "Listening", "dur": 168, "d": "AI administers continuous pulse surveys, analyses sentiment from free-text responses, and identifies engagement trends by team, location, and demographic.", "r": "Annual surveys are too infrequent to catch disengagement. Continuous listening enables intervention 6-8 weeks earlier.", "sub": [("SurveyDelivery", 56), ("SentimentAnalysis", 56), ("TrendDetection", 56)]},
        {"sn": "EngagementScoring", "sv": "EngagementScoreService", "c": "Analysis", "dur": 24, "d": "AI calculates engagement scores from survey data, system usage patterns, collaboration metrics, and recognition activity. eNPS tracked by segment.", "r": "Engaged employees are 21% more productive and 87% less likely to leave. Each disengaged employee costs $34K/year in lost productivity.", "sub": [("ScoreCalculation", 8), ("SegmentAnalysis", 8), ("eNPSTracking", 8)]},
        {"sn": "ManagerInsights", "sv": "ManagerInsightService", "c": "Coaching", "dur": 24, "d": "AI provides managers with team engagement insights, intervention recommendations, and coaching prompts. Anonymised feedback themes surfaced. Action planning guided.", "r": "Manager quality accounts for 70% of engagement variance. Giving managers data and coaching tools improves their team scores by 15-20%.", "sub": [("TeamInsightReport", 8), ("ActionRecommendation", 8), ("CoachingPrompts", 8)]},
        {"sn": "RecognitionAndRewards", "sv": "RecognitionService", "c": "Motivation", "dur": 720, "d": "AI-powered peer recognition platform with points, badges, and rewards. Social feed for celebrating achievements. Budget allocation optimised by impact.", "r": "Public recognition is the #1 driver of discretionary effort. Companies with strong recognition programmes have 31% lower voluntary turnover.", "sub": [("PeerRecognition", 240), ("RewardsFulfilment", 240), ("ImpactTracking", 240)]},
        {"sn": "WellbeingSupport", "sv": "WellbeingService", "c": "Support", "dur": 720, "d": "AI monitors burnout indicators: working hours, meeting overload, PTO usage, and sentiment decline. Proactive wellbeing resources pushed. Manager alerts for at-risk individuals.", "r": "Burnout costs employers $125-190B annually in healthcare spending. Proactive wellbeing support reduces sick days by 25% and attrition by 15%.", "sub": [("BurnoutDetection", 240), ("ResourceRecommendation", 240), ("ManagerAlerts", 240)]},
        {"sn": "RetentionAnalytics", "sv": "RetentionService", "c": "Analytics", "dur": 168, "d": "AI predicts flight risk per employee from engagement data, market conditions, tenure patterns, and compensation competitiveness. Retention actions recommended for key talent.", "r": "Replacing an employee costs 50-200% of salary. Predicting and preventing 10% of voluntary departures saves millions.", "sub": [("FlightRiskScoring", 56), ("CompetitivenessAnalysis", 56), ("RetentionActions", 56)]}
    ],
    "af": {
        "orderTotal": 0, "transactionValue": 0, "averageOrderValue": 0,
        "contractValue": 250000, "annualRevenue": 20000000, "revenuePerCustomer": 80000,
        "profitMargin": 65.0, "customerLifetimeValue": 640000, "lifetimeValue": 640000,
        "acquisitionCost": 12000, "costPerAcquisition": 12000, "conversionProbability": 0.42,
        "conversionRate": 42, "engagementScore": 82, "timeToConversion": 4320,
        "sessionDuration": 300, "pageViews": 5, "purchaseFrequency": 52,
        "netPromoterScore": 55, "satisfactionRating": 4.3, "retentionProbability": 0.90,
        "processingTime": 60, "operationalCost": 15000, "efficiencyRating": 82,
        "eNPS": 32, "voluntaryTurnover": 12,
        "channel": ["employee_app", "web_portal", "slack_integration", "teams_integration", "email"],
        "deviceType": ["mobile", "desktop", "desktop", "desktop", "mobile"],
        "region": ["US", "UK", "Germany", "India", "Australia"],
        "customerSegmentValue": ["enterprise_1000+", "mid_market_500", "growth_200", "startup_50", "remote_first"],
        "loyaltyTier": ["Enterprise", "Professional", "Growth", "Starter", "Free"],
        "segment": ["engagement", "recognition", "wellbeing", "DEI", "culture"],
        "Productname": ["Continuous Listening Platform", "Peer Recognition Engine", "Wellbeing Pulse Monitor", "DEI Analytics Dashboard", "Manager Effectiveness Suite"],
        "ProductId": ["HR-CL-001", "HR-PR-002", "HR-WP-003", "HR-DI-004", "HR-ME-005"],
        "ProductType": ["survey", "recognition", "wellbeing", "analytics", "coaching"],
        "Price": [80000, 50000, 60000, 40000, 70000],
        "responseRate": [0.78, 0, 0.65, 0, 0.72],
        "engagementLift": [0.12, 0.15, 0.08, 0.05, 0.18],
        "marketTrend": ["continuous_listening", "AI_manager_coaching", "burnout_prevention", "skills_marketplace", "people_analytics"]
    }
},
"config-industrial-maintenance-support.json": {
    "co": "IndustrialTech Systems", "dom": "https://www.industrialtech-systems.com",
    "ind": "Industrial & Manufacturing IoT", "jt": "Predictive Maintenance",
    "jd": "AI-Powered Industrial Predictive Maintenance",
    "steps": [
        {"sn": "SensorDeployment", "sv": "SensorDeployService", "c": "Setup", "dur": 168, "d": "IoT sensors deployed on critical assets: vibration, temperature, acoustic, current, and oil quality. Edge gateways configured for data collection and pre-processing.", "r": "Comprehensive sensor coverage is foundational. Missing a critical asset sensor means blind spots that cause undetected failures.", "sub": [("VibrationSensors", 56), ("TemperatureSensors", 56), ("GatewayConfig", 56)]},
        {"sn": "DataIngestionAndModelling", "sv": "DataModelService", "c": "ML", "dur": 720, "d": "AI ingests sensor data, maintenance history, and operational params. ML models trained per asset class to predict failure modes. Digital twins created for critical assets.", "r": "ML models need 3-6 months of data to establish baselines. Digital twins enable what-if analysis for maintenance decisions.", "sub": [("DataPipeline", 240), ("ModelTraining", 240), ("DigitalTwinCreation", 240)]},
        {"sn": "AnomalyDetection", "sv": "AnomalyService", "c": "Detection", "dur": 0.01, "d": "Real-time anomaly detection on vibration spectrum, temperature trends, and power consumption. Severity classification and escalation. Root cause suggestions.", "r": "Detecting anomalies 2-4 weeks before failure enables planned maintenance. A single unplanned shutdown of a production line costs $50K-500K.", "sub": [("SpectrumAnalysis", 0.005), ("TrendDetection", 0.003), ("SeverityClassification", 0.002)]},
        {"sn": "MaintenancePlanning", "sv": "MaintenancePlanService", "c": "Planning", "dur": 8, "d": "AI generates maintenance work orders, schedules resources, and pre-orders parts. Maintenance window optimised around production schedule to minimise downtime.", "r": "Coordinated maintenance planning reduces downtime by 50%. Parts pre-ordering prevents the #1 delay cause: waiting for spares.", "sub": [("WorkOrderGeneration", 3), ("ResourceScheduling", 2), ("PartsOrdering", 3)]},
        {"sn": "MaintenanceExecution", "sv": "MaintenanceExecService", "c": "Operations", "dur": 8, "d": "AR-guided maintenance with step-by-step work instructions. Torque verification, alignment checks, and quality sign-off. Before/after sensor comparison validates repair.", "r": "AR-guided maintenance reduces errors by 30% and contractor dependency by 50%. Sensor-validated repair confirms the fix actually worked.", "sub": [("ARGuidedRepair", 4), ("QualityVerification", 2), ("SensorValidation", 2)]},
        {"sn": "ReliabilityAnalytics", "sv": "ReliabilityService", "c": "Analytics", "dur": 168, "d": "AI calculates overall equipment effectiveness (OEE), mean time between failures (MTBF), and maintenance cost per asset. ROI of predictive maintenance programme quantified.", "r": "OEE improvement of 5% translates to $millions in additional production capacity. MTBF tracking drives capital investment decisions.", "sub": [("OEECalculation", 56), ("MTBFAnalysis", 56), ("ROIReporting", 56)]}
    ],
    "af": {
        "orderTotal": 350000, "transactionValue": 350000, "averageOrderValue": 250000,
        "contractValue": 2000000, "annualRevenue": 80000000, "revenuePerCustomer": 1500000,
        "profitMargin": 15.0, "customerLifetimeValue": 12000000, "lifetimeValue": 12000000,
        "acquisitionCost": 100000, "costPerAcquisition": 100000, "conversionProbability": 0.55,
        "conversionRate": 55, "engagementScore": 78, "timeToConversion": 8640,
        "sessionDuration": 2400, "pageViews": 15, "purchaseFrequency": 4,
        "netPromoterScore": 48, "satisfactionRating": 4.1, "retentionProbability": 0.90,
        "processingTime": 60, "operationalCost": 85000, "efficiencyRating": 78,
        "oee": 82.5, "mtbf": 4200,
        "channel": ["SCADA_integration", "engineering_portal", "mobile_rounds", "API_EAM", "dashboard"],
        "deviceType": ["HMI_panel", "desktop", "ruggedised_tablet", "server", "desktop"],
        "region": ["Detroit US", "Stuttgart DE", "Nagoya JP", "Shanghai CN", "Pune IN"],
        "customerSegmentValue": ["automotive_OEM", "food_beverage", "pharma", "steel_metals", "pulp_paper"],
        "loyaltyTier": ["Strategic", "Enterprise", "Growth", "Standard", "Pilot"],
        "segment": ["rotating_equipment", "conveyor_systems", "hydraulic_press", "CNC_machine", "HVAC_system"],
        "Productname": ["Motor Bearing Monitor", "Conveyor Health Suite", "Press Force Sensor Pack", "CNC Spindle Tracker", "Chiller Predictive Module"],
        "ProductId": ["IND-MB-001", "IND-CH-002", "IND-PF-003", "IND-CS-004", "IND-CP-005"],
        "ProductType": ["vibration", "conveyor", "force", "spindle", "thermal"],
        "Price": [350000, 200000, 150000, 250000, 120000],
        "assetCriticality": ["critical", "high", "medium", "high", "medium"],
        "failureMode": ["bearing_wear", "belt_tracking", "seal_leak", "tool_wear", "refrigerant_loss"],
        "marketTrend": ["digital_twin", "edge_AI", "autonomous_maintenance", "asset_performance_mgmt", "sustainability_maintenance"]
    }
},
"config-lottery-fraud.json": {
    "co": "LotteryTech Gaming", "dom": "https://www.lotterytech-gaming.com",
    "ind": "Lottery & Gaming", "jt": "Fraud Detection",
    "jd": "AI-Powered Lottery Fraud & Integrity Detection",
    "steps": [
        {"sn": "TransactionMonitoring", "sv": "TransactionMonitorService", "c": "Monitoring", "dur": 0.01, "d": "AI monitors every ticket purchase, claim, and payout in real-time. Pattern detection for synthetic identity fraud, retailer manipulation, and insider threats.", "r": "A single lottery fraud can cost $10M+ and destroy public trust. Real-time monitoring is required by every gaming regulator.", "sub": [("PurchasePatterns", 0.005), ("ClaimAnalysis", 0.003), ("RetailerBehavior", 0.002)]},
        {"sn": "SyndicateDetection", "sv": "SyndicateDetectService", "c": "Detection", "dur": 0.5, "d": "AI identifies suspicious syndicate activity: coordinated bulk purchases, geographic anomalies, and proxy claiming. Network analysis maps relationships between accounts.", "r": "Organised fraud syndicates target lotteries globally. Detection prevents $1M-50M in fraudulent claims per incident.", "sub": [("NetworkMapping", 0.2), ("BulkPurchaseDetection", 0.15), ("ProxyClaimAnalysis", 0.15)]},
        {"sn": "RetailerIntegrity", "sv": "RetailerIntegrityService", "c": "Compliance", "dur": 24, "d": "AI monitors retailer behaviour for ticket cashing irregularities, insider winning claims, and age verification compliance. Retailer risk scoring updated continuously.", "r": "Retailer fraud accounts for 40% of lottery fraud. Dishonest retailers scanning winning tickets before returning them to customers.", "sub": [("CashingPatterns", 8), ("InsiderWinMonitoring", 8), ("AgeVerification", 8)]},
        {"sn": "DrawIntegrity", "sv": "DrawIntegrityService", "c": "Verification", "dur": 1, "d": "AI verifies draw equipment randomness, monitors draw process via video analytics, and validates results against mathematical expectations. Any anomaly triggers immediate investigation.", "r": "Draw integrity is the foundation of public trust. A compromised draw would end a lottery programme entirely.", "sub": [("EquipmentVerification", 0.3), ("VideoAnalytics", 0.3), ("StatisticalValidation", 0.4)]},
        {"sn": "ClaimVerification", "sv": "ClaimVerifService", "c": "Validation", "dur": 4, "d": "AI validates prize claims: ticket authenticity, ownership verification, identity checks (KYC/AML), and prize calculation. Flagged claims routed to investigation team.", "r": "KYC/AML compliance is mandatory for prizes above threshold. Failure to detect money laundering through lottery claims carries regulatory penalties.", "sub": [("TicketAuth", 1), ("IdentityVerification", 2), ("AMLChecks", 1)]},
        {"sn": "RegulatoryReporting", "sv": "RegulatoryReportService", "c": "Reporting", "dur": 24, "d": "AI generates fraud reports for gaming commissions, suspicious activity reports (SARs) for financial regulators, and integrity audit trails. Real-time regulator dashboard.", "r": "Regulators require complete audit trails and timely SAR filing. Non-compliance risks licence revocation worth $100M+ in annual revenue.", "sub": [("FraudReporting", 8), ("SARFiling", 8), ("AuditTrail", 8)]}
    ],
    "af": {
        "orderTotal": 5, "transactionValue": 5, "averageOrderValue": 8,
        "contractValue": 0, "annualRevenue": 3500000000, "revenuePerCustomer": 250,
        "profitMargin": 35.0, "customerLifetimeValue": 2500, "lifetimeValue": 2500,
        "acquisitionCost": 5, "costPerAcquisition": 5, "conversionProbability": 0.65,
        "conversionRate": 65, "engagementScore": 55, "timeToConversion": 5,
        "sessionDuration": 120, "pageViews": 4, "purchaseFrequency": 52,
        "netPromoterScore": 25, "satisfactionRating": 3.5, "retentionProbability": 0.72,
        "processingTime": 0.01, "operationalCost": 0.50, "efficiencyRating": 92,
        "fraudDetectionRate": 99.2, "falsePositiveRate": 0.3,
        "channel": ["retail_terminal", "mobile_app", "website", "subscription", "retail_counter"],
        "deviceType": ["terminal", "mobile", "desktop", "mobile", "terminal"],
        "region": ["California US", "UK", "Ontario CA", "Victoria AU", "Italy"],
        "customerSegmentValue": ["regular_player", "occasional", "syndicate", "subscription", "instant_win"],
        "loyaltyTier": ["VIP Player", "Regular", "Occasional", "New", "Guest"],
        "segment": ["draw_game", "instant_win", "online_instant", "daily_game", "multi_state"],
        "Productname": ["National Lottery Draw", "Scratch Card Instant Win", "Online Instant Game", "Daily Numbers", "Mega Millions Entry"],
        "ProductId": ["LOT-NL-001", "LOT-SC-002", "LOT-OI-003", "LOT-DN-004", "LOT-MM-005"],
        "ProductType": ["draw", "instant", "digital_instant", "daily", "multi_jurisdiction"],
        "Price": [2, 5, 3, 1, 2],
        "jackpotSize": [50000000, 500000, 100000, 25000, 200000000],
        "winProbability": [0.000000071, 0.041, 0.035, 0.001, 0.0000000033],
        "marketTrend": ["digital_lottery", "iLottery", "blockchain_verification", "responsible_gaming_AI", "social_gaming"]
    }
},
"config-lottery-responsible.json": {
    "co": "LotteryTech Gaming", "dom": "https://www.lotterytech-gaming.com",
    "ind": "Lottery & Gaming", "jt": "Responsible Gaming",
    "jd": "AI-Powered Responsible Gaming Programme",
    "steps": [
        {"sn": "BehaviourMonitoring", "sv": "BehaviourMonitorService", "c": "Detection", "dur": 0.05, "d": "AI monitors player behaviour for problem gambling indicators: increasing spend, chasing losses, session length escalation, and time-of-day shifts. Multi-dimensional risk scoring.", "r": "1-3% of players develop gambling problems. AI can identify 80% of at-risk players 2-4 weeks before self-exclusion.", "sub": [("SpendTracking", 0.02), ("PatternAnalysis", 0.02), ("RiskScoring", 0.01)]},
        {"sn": "PlayerIntervention", "sv": "InterventionService", "c": "Support", "dur": 0.5, "d": "AI triggers graduated interventions: informational pop-ups, reality checks, cooling-off suggestions, and voluntary limit setting. Tone and timing personalised per player.", "r": "Well-timed interventions reduce problem gambling progression by 40-60%. Heavy-handed messaging causes avoidance rather than behaviour change.", "sub": [("MessageSelection", 0.2), ("TimingOptimization", 0.15), ("ResponseTracking", 0.15)]},
        {"sn": "LimitManagement", "sv": "LimitService", "c": "Controls", "dur": 0.1, "d": "AI manages deposit limits, loss limits, session time limits, and wagering limits. Cooling-off periods and self-exclusion enforced across all channels. Limit effectiveness tracked.", "r": "Limit-setting is the most effective responsible gaming tool. Players who set limits have 70% lower risk of developing problems.", "sub": [("DepositLimits", 0.03), ("SessionLimits", 0.03), ("CrossChannelEnforcement", 0.04)]},
        {"sn": "SelfExclusionProgram", "sv": "ExclusionService", "c": "Protection", "dur": 24, "d": "AI manages self-exclusion registry, enforces multi-venue/multi-channel exclusion, and prevents circumvention through identity matching. Re-activation process managed safely.", "r": "Self-exclusion is the last resort for problem gamblers. Any breach of exclusion is a serious regulatory violation and duty of care failure.", "sub": [("RegistryManagement", 8), ("IdentityMatching", 8), ("BreachPrevention", 8)]},
        {"sn": "ResearchAndInsights", "sv": "ResearchService", "c": "Analysis", "dur": 720, "d": "AI analyses population-level gambling patterns, correlates with harm indicators, and evaluates programme effectiveness. Research findings published for industry benefit.", "r": "Evidence-based responsible gaming drives regulatory trust. Operators with strong programmes receive regulatory goodwill worth $10M+ in licence terms.", "sub": [("PopulationAnalysis", 240), ("HarmCorrelation", 240), ("ProgrammeEvaluation", 240)]},
        {"sn": "RegulatoryCompliance", "sv": "RGComplianceService", "c": "Compliance", "dur": 168, "d": "AI generates responsible gaming compliance reports for regulators. Interaction tracking, exclusion logs, and harm minimisation metrics reported per jurisdiction.", "r": "RG compliance failures result in fines ($1M-50M) and licence conditions. Proactive reporting builds regulatory trust.", "sub": [("InteractionReporting", 56), ("ExclusionAudit", 56), ("HarmMetrics", 56)]}
    ],
    "af": {
        "orderTotal": 0, "transactionValue": 0, "averageOrderValue": 0,
        "contractValue": 2000000, "annualRevenue": 3500000000, "revenuePerCustomer": 250,
        "profitMargin": 35.0, "customerLifetimeValue": 2500, "lifetimeValue": 2500,
        "acquisitionCost": 0, "costPerAcquisition": 0, "conversionProbability": 1.0,
        "conversionRate": 100, "engagementScore": 60, "timeToConversion": 0,
        "sessionDuration": 180, "pageViews": 3, "purchaseFrequency": 52,
        "netPromoterScore": 30, "satisfactionRating": 3.6, "retentionProbability": 0.72,
        "processingTime": 0.05, "operationalCost": 1000000, "efficiencyRating": 85,
        "atRiskDetectionRate": 82, "interventionEffectiveness": 45,
        "channel": ["gaming_platform", "mobile_app", "retail_terminal", "helpline", "website"],
        "deviceType": ["desktop", "mobile", "terminal", "phone", "desktop"],
        "region": ["UK", "Australia", "Sweden", "Ontario CA", "New Jersey US"],
        "customerSegmentValue": ["low_risk", "medium_risk", "high_risk", "self_excluded", "recovering"],
        "loyaltyTier": ["Monitored", "Caution", "Alert", "Excluded", "Returning"],
        "segment": ["deposit_limits", "session_limits", "self_exclusion", "treatment_referral", "education"],
        "Productname": ["Behaviour Analytics Platform", "Intervention Message Engine", "Self-Exclusion Registry", "Limit Management System", "RG Compliance Dashboard"],
        "ProductId": ["RG-BA-001", "RG-IM-002", "RG-SE-003", "RG-LM-004", "RG-CD-005"],
        "ProductType": ["analytics", "intervention", "exclusion", "controls", "compliance"],
        "Price": [500000, 300000, 400000, 250000, 200000],
        "playersMonitored": [5000000, 5000000, 15000, 5000000, 0],
        "interventionRate": [0.08, 0.12, 0.003, 0.05, 0],
        "marketTrend": ["AI_harm_prevention", "affordability_checks", "single_customer_view", "cross_operator_exclusion", "lived_experience_design"]
    }
},
}

if __name__ == "__main__":
    for fn, data in SECTORS.items():
        gen(fn, data)
    print(f"Batch 5 complete: {len(SECTORS)} configs updated.")
