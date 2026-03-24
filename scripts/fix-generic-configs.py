#!/usr/bin/env python3
"""Fix generic configs with sector-tailored additionalFields and steps. Run with: python3 scripts/fix-generic-configs.py [batch_number]"""
import json, os, sys, uuid

CONFIGS_DIR = os.path.join(os.path.dirname(__file__), '..', 'saved-configs')

# ── Sector-specific data for each config file ──
SECTOR_DATA = {
# ── Agriculture ──
"config-agriculture-crop-planning.json": {
    "companyName": "AgriTech Corp",
    "domain": "https://www.agritech-corp.com",
    "industryType": "Agriculture & AgriTech",
    "journeyType": "Crop Planning",
    "journeyDetail": "AI-Driven Seasonal Crop Planning",
    "steps": [
        {"stepName": "SoilAnalysis", "service": "SoilAnalysisService", "cat": "Assessment", "dur": 12,
         "desc": "AI analyses soil composition, moisture levels, nutrient content and historical yield data across farm zones. Satellite imagery processed for vegetation index mapping. Business event: soil_assessment_completed with zone_id, nutrient_scores, and moisture_level.",
         "rationale": "Accurate soil analysis determines optimal crop selection and fertiliser requirements. Poor analysis leads to 15-25% yield reduction.",
         "subs": [("SoilSampling", 6), ("NutrientMapping", 3), ("SatelliteImageryAnalysis", 3)]},
        {"stepName": "CropSelection", "service": "CropSelectionService", "cat": "Planning", "dur": 8,
         "desc": "AI recommends crop varieties based on soil data, weather forecasts, market prices, and rotation history. Considers disease resistance, water requirements, and expected ROI per hectare. Business event: crop_selection_made with variety, expected_yield, and projected_revenue.",
         "rationale": "Optimal crop selection can improve revenue per hectare by 20-35%. Wrong variety choice wastes an entire growing season.",
         "subs": [("VarietyAnalysis", 3), ("MarketPriceForecast", 2), ("RotationOptimization", 3)]},
        {"stepName": "ResourceAllocation", "service": "ResourceAllocationService", "cat": "Procurement", "dur": 10,
         "desc": "Seed, fertiliser, and equipment allocation planned based on crop selection. AI optimises procurement timing against supplier pricing and delivery windows. Business event: resources_allocated with seed_quantity, fertiliser_type, and equipment_schedule.",
         "rationale": "Procurement timing affects input costs by 10-20%. Late ordering causes planting delays that reduce yields.",
         "subs": [("SeedProcurement", 4), ("FertiliserPlanning", 3), ("EquipmentScheduling", 3)]},
        {"stepName": "PlantingExecution", "service": "PlantingExecutionService", "cat": "Operations", "dur": 48,
         "desc": "GPS-guided planting with variable rate seeding based on zone-level soil data. Real-time monitoring of planting depth, spacing, and seed population. Business event: planting_completed with hectares_planted, seed_rate, and zone_coverage.",
         "rationale": "Precision planting improves germination rates by 8-12%. Each day of planting delay in the window can reduce yields by 1-2%.",
         "subs": [("FieldPreparation", 16), ("PrecisionPlanting", 24), ("PlantingVerification", 8)]},
        {"stepName": "GrowthMonitoring", "service": "GrowthMonitoringService", "cat": "Monitoring", "dur": 720,
         "desc": "Drone and satellite imagery monitors crop health throughout growing season. AI detects stress, disease, pest presence, and nutrient deficiency. Irrigation scheduling optimised based on weather and crop stage. Business event: growth_alert with field_id, issue_type, and severity.",
         "rationale": "Early detection of crop issues enables intervention 5-10 days earlier, saving 10-30% of affected yield. Irrigation optimization reduces water use by 25%.",
         "subs": [("DroneScanning", 240), ("DiseaseDetection", 240), ("IrrigationOptimization", 240)]},
        {"stepName": "YieldForecast", "service": "YieldForecastService", "cat": "Analytics", "dur": 24,
         "desc": "AI generates yield predictions based on growth data, weather models, and historical patterns. Market timing recommendations provided for optimal selling price. Business event: yield_forecast_updated with predicted_tonnes, confidence_interval, and recommended_sell_window.",
         "rationale": "Accurate yield forecasting enables forward contracts at better prices. 5% forecast accuracy improvement translates to 3-7% revenue gain.",
         "subs": [("YieldModelling", 12), ("MarketTimingAnalysis", 8), ("HarvestScheduling", 4)]}
    ],
    "additionalFields": {
        "orderTotal": 45000, "transactionValue": 45000, "averageOrderValue": 38000,
        "contractValue": 120000, "annualRevenue": 850000, "revenuePerCustomer": 425000,
        "profitMargin": 18.0, "customerLifetimeValue": 2500000, "lifetimeValue": 2500000,
        "acquisitionCost": 5000, "costPerAcquisition": 5000, "conversionProbability": 0.72,
        "conversionRate": 72, "engagementScore": 78, "timeToConversion": 4320,
        "sessionDuration": 1800, "pageViews": 12, "purchaseFrequency": 2,
        "netPromoterScore": 45, "satisfactionRating": 4.0, "retentionProbability": 0.85,
        "processingTime": 2880, "operationalCost": 15000, "efficiencyRating": 76,
        "yieldPerHectare": 8.5, "cropWastage": 4.2,
        "channel": ["farm_portal", "mobile_field_app", "agronomist_visit", "api_integration", "cooperative_platform"],
        "deviceType": ["tablet", "mobile", "desktop", "mobile", "tablet"],
        "region": ["Midwest US", "Central Valley CA", "East Anglia UK", "Punjab India", "Mato Grosso Brazil"],
        "customerSegmentValue": ["large_farm", "family_farm", "cooperative", "agribusiness", "smallholder"],
        "loyaltyTier": ["Platinum Grower", "Gold Grower", "Silver Grower", "Bronze Grower", "Starter"],
        "segment": ["grain", "vegetable", "fruit", "livestock_feed", "specialty_crop"],
        "Productname": ["Winter Wheat Seed Pack", "Precision Fertiliser Blend", "Corn Hybrid Select", "Soybean Premium", "Cover Crop Mix"],
        "ProductId": ["AG-SD-001", "AG-FR-002", "AG-SD-003", "AG-SD-004", "AG-CC-005"],
        "ProductType": ["seed", "fertiliser", "seed", "seed", "cover_crop"],
        "Price": [4500, 8200, 5100, 3800, 1200],
        "hectaresPlanned": [200, 150, 300, 250, 100],
        "soilType": ["clay_loam", "sandy_loam", "silt", "clay", "loam"],
        "marketTrend": ["precision_agriculture", "regenerative_farming", "carbon_credits", "vertical_farming", "agri_fintech"]
    }
},
"config-agriculture-harvest-operations.json": {
    "companyName": "AgriTech Corp",
    "domain": "https://www.agritech-corp.com",
    "industryType": "Agriculture & AgriTech",
    "journeyType": "Harvest Operations",
    "journeyDetail": "AI-Optimised Harvest Operations",
    "steps": [
        {"stepName": "HarvestReadiness", "service": "HarvestReadinessService", "cat": "Assessment", "dur": 24,
         "desc": "AI analyses crop maturity using moisture sensors, satellite NDVI, and weather forecasts to determine optimal harvest window. Equipment readiness checked against field conditions.",
         "rationale": "Harvesting at optimal moisture saves 5-8% in drying costs. Missing the window by 3 days can reduce quality grade by one level.", "subs": [("MoistureAnalysis", 12), ("WeatherWindowPrediction", 8), ("EquipmentReadyCheck", 4)]},
        {"stepName": "FleetDispatch", "service": "FleetDispatchService", "cat": "Logistics", "dur": 8,
         "desc": "Combine harvesters, grain carts, and transport trucks dispatched to fields in optimised sequence. Route planning considers field access, load capacity, and elevator wait times.",
         "rationale": "Fleet coordination reduces idle time by 30%. Poor sequencing wastes $500-1000/day per combine in lost productivity.", "subs": [("CombineRouting", 3), ("GrainCartAllocation", 2), ("TransportScheduling", 3)]},
        {"stepName": "HarvestExecution", "service": "HarvestExecutionService", "cat": "Operations", "dur": 72,
         "desc": "GPS-guided harvesting with real-time yield mapping, moisture monitoring, and grain loss detection. AI adjusts combine settings based on crop conditions. Business event: field_harvested with tonnes, moisture, and yield_per_hectare.",
         "rationale": "Automated combine adjustment reduces grain loss by 2-4%. Real-time yield mapping enables immediate ROI calculation per field zone.", "subs": [("PrecisionHarvesting", 48), ("YieldMonitoring", 12), ("GrainQualityCheck", 12)]},
        {"stepName": "GrainHandling", "service": "GrainHandlingService", "cat": "PostHarvest", "dur": 24,
         "desc": "Grain drying, storage allocation, and quality grading. Temperature and moisture monitored in bins. AI determines optimal storage duration vs immediate sale based on market conditions.",
         "rationale": "Proper drying prevents spoilage losses of 5-15%. Storage timing decisions can add $0.50-1.50/bushel in market returns.", "subs": [("DryingOptimization", 12), ("StorageAllocation", 8), ("QualityGrading", 4)]},
        {"stepName": "MarketExecution", "service": "MarketExecutionService", "cat": "Sales", "dur": 48,
         "desc": "AI-timed grain sales against futures market, basis levels, and storage costs. Contract fulfilment tracked against forward sales commitments. Business event: grain_sold with quantity, price, grade, and buyer.",
         "rationale": "Market timing can improve realised prices by 8-15%. Meeting contract specs avoids penalties of $0.10-0.50/bushel.", "subs": [("PriceAnalysis", 16), ("ContractFulfilment", 16), ("LogisticsToElevator", 16)]},
        {"stepName": "SeasonReconciliation", "service": "SeasonReconciliationService", "cat": "Analytics", "dur": 24,
         "desc": "Full season P&L calculated per field zone. AI compares planned vs actual yields, costs, and revenue. Insights fed back into next season planning. Business event: season_closed with total_revenue, total_cost, and roi_per_hectare.",
         "rationale": "Zone-level P&L drives precision decisions for next season. Farms that track zone economics improve margins by 5-10% year over year.", "subs": [("YieldReconciliation", 8), ("CostAnalysis", 8), ("NextSeasonRecommendations", 8)]}
    ],
    "additionalFields": {
        "orderTotal": 85000, "transactionValue": 85000, "averageOrderValue": 72000,
        "contractValue": 350000, "annualRevenue": 850000, "revenuePerCustomer": 425000,
        "profitMargin": 22.0, "customerLifetimeValue": 2500000, "lifetimeValue": 2500000,
        "acquisitionCost": 5000, "costPerAcquisition": 5000, "conversionProbability": 0.92,
        "conversionRate": 92, "engagementScore": 85, "timeToConversion": 720,
        "sessionDuration": 600, "pageViews": 8, "purchaseFrequency": 1,
        "netPromoterScore": 52, "satisfactionRating": 4.2, "retentionProbability": 0.88,
        "processingTime": 4320, "operationalCost": 35000, "efficiencyRating": 82,
        "yieldPerHectare": 9.2, "grainMoisture": [13.5, 14.2, 12.8, 15.1, 13.0],
        "channel": ["farm_portal", "mobile_field_app", "grain_elevator", "futures_broker", "cooperative"],
        "deviceType": ["tablet", "mobile", "desktop", "desktop", "mobile"],
        "region": ["Midwest US", "Great Plains", "Prairies CA", "East Anglia UK", "Queensland AU"],
        "customerSegmentValue": ["large_farm", "family_farm", "cooperative", "contract_grower", "organic_farm"],
        "loyaltyTier": ["Platinum", "Gold", "Silver", "Bronze", "Starter"],
        "segment": ["wheat", "corn", "soybean", "barley", "canola"],
        "Productname": ["Winter Wheat Harvest", "Corn Grain Harvest", "Soybean Harvest", "Barley Malt Grade", "Canola Crush Grade"],
        "ProductId": ["HV-WH-001", "HV-CN-002", "HV-SB-003", "HV-BL-004", "HV-CL-005"],
        "ProductType": ["grain", "grain", "oilseed", "grain", "oilseed"],
        "Price": [7.20, 5.85, 13.50, 6.40, 14.80],
        "tonnesHarvested": [1800, 2400, 950, 600, 450],
        "qualityGrade": ["#1", "#2", "#1", "Malt", "Crush"],
        "marketTrend": ["precision_harvest", "yield_mapping", "carbon_farming", "traceability", "autonomous_combines"]
    }
},
# ── Construction ──
"config-construction-project-bidding.json": {
    "companyName": "BuildTech Group",
    "domain": "https://www.buildtech-group.com",
    "industryType": "Construction & Engineering",
    "journeyType": "Project Bidding",
    "journeyDetail": "AI-Powered Construction Project Bidding",
    "steps": [
        {"stepName": "OpportunityScreening", "service": "OpportunityScreeningService", "cat": "Discovery", "dur": 4, "desc": "AI scans tender databases, evaluates project fit against company capabilities, capacity, and risk appetite. Scores opportunities by win probability and margin potential.", "rationale": "Selective bidding improves win rates from 15% to 30%. Each bid costs $20K-200K in estimating resources.", "subs": [("TenderScan", 2), ("FitScoring", 2)]},
        {"stepName": "CostEstimation", "service": "CostEstimationService", "cat": "Analysis", "dur": 48, "desc": "AI-assisted quantity takeoff from BIM models, material pricing from supplier databases, and labor hour estimation based on historical project data. Risk contingency calculated.", "rationale": "Estimation accuracy directly determines profitability. A 2% error on a $50M project means $1M variance.", "subs": [("QuantityTakeoff", 20), ("MaterialPricing", 12), ("LaborEstimation", 10), ("RiskContingency", 6)]},
        {"stepName": "SupplyChainPricing", "service": "SupplyChainPricingService", "cat": "Procurement", "dur": 24, "desc": "Subcontractor quotes solicited and evaluated. Material supplier pricing locked for bid validity period. AI identifies supply chain risks and alternative sourcing.", "rationale": "Subcontractor costs are 60-80% of project value. Getting 3+ competitive quotes per trade saves 5-15%.", "subs": [("SubcontractorRFQ", 12), ("MaterialQuotes", 8), ("SupplyRiskAnalysis", 4)]},
        {"stepName": "BidCompilation", "service": "BidCompilationService", "cat": "Submission", "dur": 16, "desc": "Commercial and technical proposals compiled. Margin targets applied, risk adjustments made, and management review completed. Business event: bid_submitted with project_value, margin_target, and win_probability.", "rationale": "Well-structured bids with clear value propositions win 2x more often. Late submissions mean automatic disqualification.", "subs": [("CommercialProposal", 6), ("TechnicalSubmission", 6), ("ManagementReview", 4)]},
        {"stepName": "NegotiationAndAward", "service": "NegotiationService", "cat": "Closing", "dur": 72, "desc": "Client Q&A, bid clarifications, best-and-final-offer negotiations. Contract terms reviewed and risk allocation negotiated. Business event: contract_awarded with final_value and terms.", "rationale": "Negotiation phase typically adjusts price by 3-8%. Unfavorable risk allocation can turn a profitable project into a loss.", "subs": [("ClientClarifications", 24), ("PriceNegotiation", 24), ("ContractReview", 24)]},
        {"stepName": "MobilizationPlanning", "service": "MobilizationPlanningService", "cat": "Execution", "dur": 168, "desc": "Project team assembled, site logistics planned, equipment mobilised, and subcontractors contracted. Baseline schedule and budget established.", "rationale": "Fast mobilization wins client confidence and enables early revenue recognition. Poor planning causes 3-6 month delays.", "subs": [("TeamAssembly", 48), ("SiteLogistics", 48), ("SubcontractorContracting", 72)]}
    ],
    "additionalFields": {
        "orderTotal": 2500000, "transactionValue": 2500000, "averageOrderValue": 1800000,
        "contractValue": 45000000, "annualRevenue": 180000000, "revenuePerCustomer": 15000000,
        "profitMargin": 6.5, "customerLifetimeValue": 75000000, "lifetimeValue": 75000000,
        "acquisitionCost": 150000, "costPerAcquisition": 150000, "conversionProbability": 0.22,
        "conversionRate": 22, "engagementScore": 65, "timeToConversion": 10080,
        "sessionDuration": 3600, "pageViews": 15, "purchaseFrequency": 0.5,
        "netPromoterScore": 42, "satisfactionRating": 3.8, "retentionProbability": 0.65,
        "processingTime": 20160, "operationalCost": 350000, "efficiencyRating": 72,
        "projectDuration": 24, "safetyIncidentRate": 0.8,
        "channel": ["tender_portal", "client_direct", "framework_agreement", "design_build", "joint_venture"],
        "deviceType": ["desktop", "desktop", "tablet", "desktop", "desktop"],
        "region": ["London", "Dubai", "Sydney", "New York", "Singapore"],
        "customerSegmentValue": ["government", "commercial_developer", "infrastructure", "residential", "industrial"],
        "loyaltyTier": ["Tier 1 Partner", "Preferred", "Approved", "New", "Framework"],
        "segment": ["commercial_building", "infrastructure", "residential", "industrial", "renovation"],
        "Productname": ["Office Tower Complex", "Highway Bridge Expansion", "Residential Estate", "Data Centre Build", "Hospital Wing Extension"],
        "ProductId": ["CON-CB-001", "CON-IF-002", "CON-RS-003", "CON-DC-004", "CON-HC-005"],
        "ProductType": ["new_build", "infrastructure", "residential", "data_centre", "extension"],
        "Price": [45000000, 28000000, 62000000, 35000000, 18000000],
        "bidWinRate": [0.25, 0.18, 0.30, 0.22, 0.35],
        "projectRisk": ["medium", "high", "low", "medium", "low"],
        "marketTrend": ["modular_construction", "BIM_mandate", "green_building", "offsite_manufacturing", "digital_twin"]
    }
},
"config-construction-safety-monitoring.json": {
    "companyName": "BuildTech Group",
    "domain": "https://www.buildtech-group.com",
    "industryType": "Construction & Engineering",
    "journeyType": "Site Safety Monitoring",
    "journeyDetail": "AI-Driven Construction Site Safety",
    "steps": [
        {"stepName": "SiteInduction", "service": "SiteInductionService", "cat": "Onboarding", "dur": 2, "desc": "Workers complete AI-verified safety induction. Facial recognition confirms identity, competency cards scanned, and site-specific hazard briefing delivered via tablet.", "rationale": "Proper induction reduces first-week incidents by 60%. Competency verification prevents unqualified workers entering hazardous zones.", "subs": [("IdentityVerification", 1), ("CompetencyCheck", 0.5), ("HazardBriefing", 0.5)]},
        {"stepName": "RealTimeMonitoring", "service": "SafetyMonitoringService", "cat": "Surveillance", "dur": 480, "desc": "AI cameras and wearable sensors monitor PPE compliance, exclusion zone breaches, and unsafe behaviors. Real-time alerts sent to safety officers and site managers.", "rationale": "AI monitoring detects 95% of PPE violations vs 30% for manual checks. Proactive intervention prevents incidents before they occur.", "subs": [("PPEDetection", 160), ("ExclusionZoneMonitoring", 160), ("BehaviorAnalysis", 160)]},
        {"stepName": "IncidentDetection", "service": "IncidentDetectionService", "cat": "Alert", "dur": 1, "desc": "AI detects safety incidents: falls, struck-by events, near-misses, and environmental hazards. Automatic emergency response triggered including first aid dispatch and site isolation.", "rationale": "Reducing emergency response time from 8 minutes to 2 minutes dramatically improves outcomes for serious injuries.", "subs": [("EventDetection", 0.25), ("EmergencyAlert", 0.25), ("ResponseDispatch", 0.5)]},
        {"stepName": "InvestigationAndReporting", "service": "InvestigationService", "cat": "Compliance", "dur": 24, "desc": "AI assists root cause analysis using video replay, sensor data, and similar incident pattern matching. Regulatory reports auto-generated for OSHA/HSE submission.", "rationale": "Thorough investigation and reporting prevents repeat incidents. Regulatory non-compliance fines average $15K-70K per violation.", "subs": [("RootCauseAnalysis", 12), ("RegulatoryReporting", 8), ("CorrectiveActions", 4)]},
        {"stepName": "SafetyScoreTracking", "service": "SafetyScoreService", "cat": "Analytics", "dur": 24, "desc": "Site safety score calculated from incidents, near-misses, compliance checks, and training completion. Benchmarked against company average and industry standards.", "rationale": "Safety scores correlate with insurance premiums and client willingness to award future contracts. Top-quartile safety = 15% lower insurance costs.", "subs": [("ScoreCalculation", 8), ("TrendAnalysis", 8), ("BenchmarkComparison", 8)]},
        {"stepName": "ContinuousImprovement", "service": "SafetyImprovementService", "cat": "Optimization", "dur": 168, "desc": "AI identifies systemic safety patterns across projects. Training programmes adjusted, high-risk activities re-planned, and safety investment prioritised by impact.", "rationale": "Companies that invest in proactive safety improvement see 40% fewer lost-time injuries and 25% lower project insurance costs.", "subs": [("PatternAnalysis", 48), ("TrainingUpdates", 72), ("ProcessRedesign", 48)]}
    ],
    "additionalFields": {
        "orderTotal": 85000, "transactionValue": 85000, "averageOrderValue": 65000,
        "contractValue": 500000, "annualRevenue": 180000000, "revenuePerCustomer": 15000000,
        "profitMargin": 6.5, "customerLifetimeValue": 75000000, "lifetimeValue": 75000000,
        "acquisitionCost": 25000, "costPerAcquisition": 25000, "conversionProbability": 0.95,
        "conversionRate": 95, "engagementScore": 88, "timeToConversion": 48,
        "sessionDuration": 480, "pageViews": 5, "purchaseFrequency": 365,
        "netPromoterScore": 55, "satisfactionRating": 4.3, "retentionProbability": 0.92,
        "processingTime": 60, "operationalCost": 12000, "efficiencyRating": 85,
        "incidentRate": 0.8, "nearMissRate": 3.2,
        "channel": ["site_tablet", "wearable_sensor", "cctv_ai", "mobile_app", "safety_kiosk"],
        "deviceType": ["tablet", "wearable", "camera", "mobile", "kiosk"],
        "region": ["London", "Dubai", "Sydney", "Texas", "Singapore"],
        "customerSegmentValue": ["tier1_contractor", "specialist_sub", "self_employed", "agency_worker", "apprentice"],
        "loyaltyTier": ["Gold Card", "Green Card", "Inducted", "Probation", "New Starter"],
        "segment": ["high_rise", "infrastructure", "residential", "demolition", "tunnelling"],
        "Productname": ["Hard Hat with Sensor", "Smart Safety Vest", "Gas Detection Badge", "Fall Arrest Monitor", "Proximity Alert Band"],
        "ProductId": ["SAF-HH-001", "SAF-SV-002", "SAF-GD-003", "SAF-FA-004", "SAF-PA-005"],
        "ProductType": ["PPE_smart", "PPE_smart", "gas_detection", "fall_protection", "proximity"],
        "Price": [185, 120, 95, 250, 75],
        "complianceRate": [0.94, 0.91, 0.97, 0.88, 0.93],
        "riskZone": ["high", "medium", "confined_space", "height", "traffic"],
        "marketTrend": ["AI_safety_monitoring", "wearable_PPE", "digital_twin_safety", "predictive_safety", "autonomous_inspection"]
    }
},
# ── Defence ──
"config-defence-mission-planning.json": {
    "companyName": "Defence Systems",
    "domain": "https://www.defence-systems.gov",
    "industryType": "Defence & Aerospace",
    "journeyType": "Mission Planning",
    "journeyDetail": "AI-Assisted Mission Planning & Execution",
    "steps": [
        {"stepName": "IntelligenceGathering", "service": "IntelligenceService", "cat": "Assessment", "dur": 48, "desc": "Multi-source intelligence fusion from SIGINT, HUMINT, OSINT, and satellite imagery. AI pattern recognition identifies threats, force dispositions, and environmental factors.", "rationale": "Comprehensive intelligence reduces mission risk by 40%. AI fusion processes data 100x faster than manual analysis.", "subs": [("MultisourceFusion", 24), ("ThreatAssessment", 12), ("EnvironmentalAnalysis", 12)]},
        {"stepName": "CourseOfAction", "service": "COAService", "cat": "Planning", "dur": 24, "desc": "AI generates multiple courses of action with risk/benefit analysis. Wargaming simulations test each option against adversary responses. Commander selects preferred COA.", "rationale": "AI wargaming evaluates 1000x more scenarios than manual planning. Better COA selection reduces casualties and mission failure risk.", "subs": [("COAGeneration", 8), ("WargameSimulation", 10), ("RiskBenefitAnalysis", 6)]},
        {"stepName": "ResourceAllocation", "service": "ForceAllocationService", "cat": "Logistics", "dur": 12, "desc": "Personnel, equipment, air assets, and logistics allocated to mission. AI optimises force structure against threat assessment and mission objectives.", "rationale": "Optimal force allocation achieves mission success with minimum resource expenditure. Over-allocation wastes scarce assets, under-allocation risks failure.", "subs": [("ForceStructuring", 4), ("EquipmentAssignment", 4), ("LogisticsPlanning", 4)]},
        {"stepName": "MissionBriefing", "service": "BriefingService", "cat": "Communication", "dur": 4, "desc": "AI generates mission briefing packages with maps, timelines, contingencies, and communications plans. Distributed securely to all participating units.", "rationale": "Clear briefings reduce friendly fire incidents by 60% and improve coordination. Digital briefings reach all units instantly vs hours for paper.", "subs": [("BriefingGeneration", 2), ("SecureDistribution", 1), ("AcknowledgementTracking", 1)]},
        {"stepName": "MissionExecution", "service": "ExecutionMonitoringService", "cat": "Operations", "dur": 72, "desc": "Real-time situational awareness with AI tracking friendly forces, threats, and objectives. Automated re-planning when conditions change. Battle damage assessment.", "rationale": "Real-time AI monitoring reduces decision latency from hours to minutes. Automatic threat detection saves lives.", "subs": [("SituationalAwareness", 24), ("DynamicReplanning", 24), ("BattleDamageAssessment", 24)]},
        {"stepName": "AfterActionReview", "service": "AARService", "cat": "Analytics", "dur": 48, "desc": "AI analyses mission execution vs plan. Identifies lessons learned, tactical innovations, and areas for improvement. Feeds into doctrine and training updates.", "rationale": "Systematic after-action analysis improves future mission success rates by 15-25%. AI finds patterns humans miss across hundreds of operations.", "subs": [("ExecutionAnalysis", 16), ("LessonsExtraction", 16), ("DoctrineUpdate", 16)]}
    ],
    "additionalFields": {
        "orderTotal": 0, "transactionValue": 0, "averageOrderValue": 0,
        "contractValue": 250000000, "annualRevenue": 0, "revenuePerCustomer": 0,
        "profitMargin": 0, "customerLifetimeValue": 0, "lifetimeValue": 0,
        "acquisitionCost": 0, "costPerAcquisition": 0, "conversionProbability": 0.85,
        "conversionRate": 85, "engagementScore": 95, "timeToConversion": 4320,
        "sessionDuration": 7200, "pageViews": 25, "purchaseFrequency": 0,
        "netPromoterScore": 0, "satisfactionRating": 0, "retentionProbability": 0.99,
        "processingTime": 14400, "operationalCost": 5000000, "efficiencyRating": 88,
        "missionReadiness": 0.92, "threatLevel": ["low", "medium", "high", "critical", "extreme"],
        "channel": ["command_centre", "tactical_terminal", "mobile_ops", "secure_radio", "satellite_link"],
        "deviceType": ["ruggedised_desktop", "tactical_tablet", "mobile_secure", "radio", "terminal"],
        "region": ["EUCOM", "INDOPACOM", "CENTCOM", "AFRICOM", "NATO_HQ"],
        "customerSegmentValue": ["joint_force", "special_ops", "air_wing", "naval_group", "logistics_corps"],
        "loyaltyTier": ["Strategic", "Operational", "Tactical", "Support", "Reserve"],
        "segment": ["kinetic", "ISR", "cyber", "logistics", "peacekeeping"],
        "Productname": ["Joint Strike Package", "ISR Mission Suite", "Cyber Defence Op", "Logistics Convoy Plan", "Peacekeeping Patrol"],
        "ProductId": ["DEF-KN-001", "DEF-IS-002", "DEF-CY-003", "DEF-LG-004", "DEF-PK-005"],
        "ProductType": ["kinetic_mission", "surveillance", "cyber_operation", "logistics", "peacekeeping"],
        "Price": [0, 0, 0, 0, 0],
        "classificationLevel": ["SECRET", "TOP_SECRET", "SECRET", "CONFIDENTIAL", "RESTRICTED"],
        "forceReadiness": [0.95, 0.92, 0.88, 0.90, 0.85],
        "marketTrend": ["AI_decision_support", "autonomous_systems", "multi_domain_ops", "cyber_warfare", "space_domain"]
    }
},
"config-defence-fleet-maintenance.json": {
    "companyName": "Defence Systems",
    "domain": "https://www.defence-systems.gov",
    "industryType": "Defence & Aerospace",
    "journeyType": "Fleet Maintenance",
    "journeyDetail": "Predictive Military Fleet Maintenance",
    "steps": [
        {"stepName": "FleetHealthAssessment", "service": "FleetHealthService", "cat": "Monitoring", "dur": 24, "desc": "AI aggregates sensor data from aircraft, vehicles, and vessels. Predictive models calculate remaining useful life for critical components.", "rationale": "Predictive maintenance reduces unplanned downtime by 45% and extends asset life by 20%. Each grounded aircraft costs $50K-500K/day.", "subs": [("SensorDataAggregation", 8), ("PredictiveModelling", 8), ("RULCalculation", 8)]},
        {"stepName": "MaintenancePrioritization", "service": "PrioritizationService", "cat": "Planning", "dur": 8, "desc": "AI prioritises maintenance tasks by operational readiness impact, safety criticality, and resource availability. Generates optimised maintenance schedules.", "rationale": "Smart prioritisation ensures highest-readiness assets are always available. Random scheduling leaves 15-25% of fleet unavailable.", "subs": [("ReadinessImpactScoring", 3), ("SafetyPriority", 2), ("ScheduleOptimization", 3)]},
        {"stepName": "PartsForecasting", "service": "PartsService", "cat": "Logistics", "dur": 48, "desc": "AI predicts spare parts demand based on fleet usage patterns, component failure rates, and maintenance schedules. Pre-positions parts at forward locations.", "rationale": "Parts availability drives 60% of maintenance delays. AI forecasting reduces stockout rates from 12% to 3%.", "subs": [("DemandPrediction", 16), ("InventoryOptimization", 16), ("ForwardPositioning", 16)]},
        {"stepName": "MaintenanceExecution", "service": "MaintenanceExecService", "cat": "Operations", "dur": 72, "desc": "AI-assisted maintenance using AR work instructions, torque validation, and automated inspection. Digital sign-off with photographic evidence.", "rationale": "AI-guided maintenance reduces errors by 30% and completion time by 20%. Digital records ensure airworthiness compliance.", "subs": [("WorkExecution", 36), ("QualityInspection", 24), ("DigitalSignoff", 12)]},
        {"stepName": "ReadinessVerification", "service": "ReadinessService", "cat": "Certification", "dur": 8, "desc": "Post-maintenance functional testing, calibration verification, and airworthiness/seaworthiness certification. AI validates all checklist items completed.", "rationale": "Thorough verification prevents maintenance-induced failures, which account for 12% of military aviation incidents.", "subs": [("FunctionalTest", 4), ("CalibrationCheck", 2), ("CertificationRelease", 2)]},
        {"stepName": "FleetReadinessReport", "service": "ReadinessReportService", "cat": "Analytics", "dur": 4, "desc": "Fleet-wide readiness dashboard updated. Maintenance backlog, parts status, and readiness rates reported to command. AI flags emerging fleet-wide issues.", "rationale": "Accurate readiness reporting enables operational planning. A 5% improvement in fleet readiness dramatically expands operational capability.", "subs": [("ReadinessCalculation", 2), ("BacklogAnalysis", 1), ("CommandBriefing", 1)]}
    ],
    "additionalFields": {
        "orderTotal": 750000, "transactionValue": 750000, "averageOrderValue": 450000,
        "contractValue": 50000000, "annualRevenue": 0, "revenuePerCustomer": 0,
        "profitMargin": 0, "customerLifetimeValue": 0, "lifetimeValue": 0,
        "acquisitionCost": 0, "costPerAcquisition": 0, "conversionProbability": 1.0,
        "conversionRate": 100, "engagementScore": 92, "timeToConversion": 0,
        "sessionDuration": 3600, "pageViews": 15, "purchaseFrequency": 12,
        "netPromoterScore": 0, "satisfactionRating": 0, "retentionProbability": 1.0,
        "processingTime": 4320, "operationalCost": 450000, "efficiencyRating": 78,
        "fleetReadiness": 0.87, "mtbf": [2400, 1800, 3200, 1200, 4500],
        "channel": ["maintenance_portal", "hangar_terminal", "flight_line_tablet", "parts_system", "command_dashboard"],
        "deviceType": ["desktop", "ruggedised_terminal", "tablet", "barcode_scanner", "desktop"],
        "region": ["RAF Brize Norton", "Ramstein AB", "Pearl Harbor", "Darwin AU", "NATO Sigonella"],
        "customerSegmentValue": ["fast_jet", "rotary_wing", "transport", "maritime", "ground_vehicle"],
        "loyaltyTier": ["Priority 1", "Priority 2", "Scheduled", "Routine", "Depot"],
        "segment": ["aircraft", "helicopter", "naval_vessel", "armoured_vehicle", "UAV"],
        "Productname": ["F-35 Engine Module", "Chinook Gearbox", "Frigate Gas Turbine", "Challenger Powerpack", "MQ-9 Sensor Pod"],
        "ProductId": ["MNT-FJ-001", "MNT-RW-002", "MNT-NV-003", "MNT-GV-004", "MNT-UA-005"],
        "ProductType": ["engine", "transmission", "propulsion", "powerpack", "sensor"],
        "Price": [2500000, 850000, 4200000, 650000, 1200000],
        "componentRUL": [1200, 800, 2100, 450, 1800],
        "maintenanceType": ["phase", "unscheduled", "depot", "field", "calendar"],
        "marketTrend": ["predictive_maintenance", "digital_twin", "additive_manufacturing", "condition_based", "autonomous_inspection"]
    }
},
}

# I'll add more sectors in subsequent batches - this dict gets extended by batch scripts

def generate_config(filename, data):
    """Generate a full config JSON from sector data."""
    steps = []
    for i, step in enumerate(data["steps"], 1):
        s = {
            "stepIndex": i,
            "stepName": step["stepName"],
            "serviceName": step["service"],
            "description": step["desc"],
            "category": step["cat"],
            "estimatedDuration": step["dur"],
            "businessRationale": step["rationale"],
            "substeps": [{"substepName": sub[0], "duration": sub[1]} for sub in step["subs"]]
        }
        if i == 1:
            s["timestamp"] = "2025-11-21T00:00:00.000Z"
        steps.append(s)

    config = {
        "companyName": data["companyName"],
        "domain": data["domain"],
        "industryType": data["industryType"],
        "journeyType": data["journeyType"],
        "journeyDetail": data["journeyDetail"],
        "journeyId": f"journey_{data['journeyType'].lower().replace(' ', '_').replace('&', 'and')}_{uuid.uuid4().hex[:8]}",
        "journeyStartTime": "2025-11-21T00:00:00.000Z",
        "steps": steps,
        "id": str(uuid.uuid4()),
        "name": f"{data['industryType']} - {data['journeyType']}",
        "timestamp": "2026-03-18T12:00:00.000Z",
        "source": "sector-demo",
        "additionalFields": data["additionalFields"]
    }
    return config

def process_batch(batch_files):
    """Process a list of config filenames."""
    count = 0
    for fn in batch_files:
        if fn in SECTOR_DATA:
            config = generate_config(fn, SECTOR_DATA[fn])
            path = os.path.join(CONFIGS_DIR, fn)
            with open(path, 'w') as f:
                json.dump(config, f, indent=4)
            print(f"  ✅ {fn}")
            count += 1
        else:
            print(f"  ⏭️  {fn} - no sector data yet")
    return count

if __name__ == "__main__":
    batch = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    all_generic = sorted([fn for fn in SECTOR_DATA.keys()])
    
    if batch == 0:
        # Process all available
        print(f"Processing all {len(all_generic)} configs with sector data...")
        count = process_batch(all_generic)
        print(f"\nDone! Updated {count} configs.")
    else:
        # Process specific batch (5 at a time)
        batch_size = 5
        start = (batch - 1) * batch_size
        end = start + batch_size
        batch_files = all_generic[start:end]
        print(f"Batch {batch}: processing {len(batch_files)} configs...")
        count = process_batch(batch_files)
        print(f"Done! Updated {count}/{len(batch_files)} configs. ({end}/{len(all_generic)} total)")
