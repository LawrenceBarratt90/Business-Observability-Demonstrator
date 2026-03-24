#!/usr/bin/env python3
"""Batch 8: ridehailing, robotics, semiconductor, shipping"""
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
"config-ridehailing-matching.json": {
    "co": "RideFlow Mobility", "dom": "https://www.rideflow-mobility.com",
    "ind": "Ride-Hailing & Mobility", "jt": "Driver-Rider Matching",
    "jd": "AI-Powered Ride Matching & Dispatch",
    "steps": [
        {"sn": "RideRequest", "sv": "RideRequestService", "c": "Initiation", "dur": 0.1, "d": "AI processes ride request: origin/destination parsing, ride type selection (economy, premium, shared), ETA estimation, and upfront fare calculation with route-based pricing.", "r": "Fast, accurate ETA and fare estimates set customer expectations. Over-promising ETAs causes cancellation; under-quoting fares causes rider dissatisfaction.", "sub": [("LocationParsing", 0.03), ("RideTypeSelection", 0.03), ("FareCalculation", 0.04)]},
        {"sn": "DriverMatching", "sv": "MatchingService", "c": "Matching", "dur": 0.3, "d": "AI matches rider to optimal driver: proximity, direction of travel, driver rating, vehicle type, and predicted acceptance probability. Batched matching for shared rides.", "r": "Matching quality determines both rider wait time and driver utilisation. Better matching reduces pickup time by 20% and increases driver earnings.", "sub": [("ProximityMatching", 0.1), ("AcceptancePrediction", 0.1), ("SharedRideBatching", 0.1)]},
        {"sn": "RoutePlanning", "sv": "RoutePlanService", "c": "Navigation", "dur": 0.5, "d": "AI generates optimal route: real-time traffic, road closures, passenger pickup sequence (shared rides), and driver-preferred routes. Dynamic re-routing during trip.", "r": "Route quality directly impacts fare, driver earnings, and rider satisfaction. A 10% shorter route = 10% cost savings for riders.", "sub": [("TrafficAwareRouting", 0.2), ("SharedRideSequencing", 0.15), ("DynamicRerouting", 0.15)]},
        {"sn": "TripExecution", "sv": "TripExecService", "c": "Operations", "dur": 20, "d": "AI monitors trip in real-time: safety detection (hard braking, route deviation), trip progress for ETA updates, and driver behavior scoring. Emergency SOS integration.", "r": "Safety monitoring prevents incidents and enables rapid response. Real-time tracking provides peace of mind and enables accurate arrival communication.", "sub": [("SafetyMonitoring", 7), ("ProgressTracking", 7), ("BehaviourScoring", 6)]},
        {"sn": "TripCompletion", "sv": "TripCompleteService", "c": "Settlement", "dur": 0.5, "d": "AI calculates final fare (accounting for route changes, wait time, tolls), processes payment, and facilitates mutual rating. Tip prompting and post-ride feedback.", "r": "Seamless payment and fair rating build trust on both sides. Accurate fare calculation prevents disputes that cost $5-10 each to resolve.", "sub": [("FareCalculation", 0.2), ("PaymentProcessing", 0.15), ("RatingAndFeedback", 0.15)]},
        {"sn": "PostTripAnalytics", "sv": "PostTripAnalyticsService", "c": "Analytics", "dur": 24, "d": "AI analyses trip data: service quality metrics, area coverage gaps, peak demand patterns, and driver earnings optimisation. Market health scoring by zone.", "r": "Trip analytics identify supply/demand imbalances. Addressing coverage gaps before riders experience them prevents churn to competitors.", "sub": [("ServiceQualityMetrics", 8), ("CoverageAnalysis", 8), ("MarketHealthScoring", 8)]}
    ],
    "af": {
        "orderTotal": 22, "transactionValue": 22, "averageOrderValue": 18,
        "contractValue": 0, "annualRevenue": 30000000000, "revenuePerCustomer": 1200,
        "profitMargin": 3.0, "customerLifetimeValue": 4800, "lifetimeValue": 4800,
        "acquisitionCost": 25, "costPerAcquisition": 25, "conversionProbability": 0.35,
        "conversionRate": 35, "engagementScore": 72, "timeToConversion": 5,
        "sessionDuration": 1200, "pageViews": 3, "purchaseFrequency": 60,
        "netPromoterScore": 35, "satisfactionRating": 4.2, "retentionProbability": 0.55,
        "processingTime": 0.3, "operationalCost": 4, "efficiencyRating": 82,
        "avgPickupTime": 4.5, "driverUtilisation": 68,
        "channel": ["mobile_app", "web_app", "API_integration", "voice_assistant", "corporate_portal"],
        "deviceType": ["mobile", "mobile", "server", "smart_speaker", "desktop"],
        "region": ["San Francisco US", "London UK", "Sao Paulo BR", "Mumbai IN", "Lagos NG"],
        "customerSegmentValue": ["daily_commuter", "weekend_social", "airport_transfer", "corporate_account", "tourist"],
        "loyaltyTier": ["Platinum Rider", "Gold Rider", "Silver Rider", "Regular", "New"],
        "segment": ["economy", "premium", "shared_pool", "XL_group", "electric_green"],
        "Productname": ["Economy Ride", "Premium Black", "Shared Pool", "XL Group", "Green Electric"],
        "ProductId": ["RH-EC-001", "RH-PB-002", "RH-SP-003", "RH-XL-004", "RH-GE-005"],
        "ProductType": ["economy", "premium", "shared", "xl", "electric"],
        "Price": [15, 35, 8, 25, 18],
        "requestToPickup": [4.5, 3.2, 6.8, 5.5, 7.0],
        "riderRating": [4.75, 4.85, 4.60, 4.70, 4.80],
        "marketTrend": ["autonomous_vehicles", "electric_fleet", "micro_mobility_integration", "subscription_rides", "shared_autonomous"]
    }
},
"config-ridehailing-pricing.json": {
    "co": "RideFlow Mobility", "dom": "https://www.rideflow-mobility.com",
    "ind": "Ride-Hailing & Mobility", "jt": "Dynamic Pricing",
    "jd": "AI-Driven Surge Pricing & Revenue Optimisation",
    "steps": [
        {"sn": "DemandForecasting", "sv": "DemandForecastService", "c": "Forecasting", "dur": 5, "d": "AI forecasts ride demand by zone: historical patterns, weather, events, transit disruptions, and social media signals. 15-minute granularity demand heatmaps.", "r": "Accurate demand forecasting enables proactive driver positioning. Foreseeing a concert ending 30 minutes early = 1000 fewer unserved ride requests.", "sub": [("HistoricPatterns", 2), ("EventImpact", 1.5), ("WeatherCorrelation", 1.5)]},
        {"sn": "SupplyForecasting", "sv": "SupplyForecastService", "c": "Forecasting", "dur": 5, "d": "AI predicts driver supply by zone: active drivers, shift patterns, earnings targets, and competitor incentives. Supply gap identification triggers driver incentive campaigns.", "r": "Supply/demand balance is the core marketplace challenge. Understanding driver behaviour enables proactive supply management.", "sub": [("DriverAvailability", 2), ("ShiftPrediction", 1.5), ("CompetitorAnalysis", 1.5)]},
        {"sn": "SurgePricing", "sv": "SurgePriceService", "c": "Pricing", "dur": 0.01, "d": "AI calculates real-time surge multipliers: zone-level supply/demand ratio, price elasticity, and competitor pricing awareness. Surge smoothing to prevent price spikes. Maximum surge caps.", "r": "Surge pricing balances markets: incentivises drivers to high-demand areas and manages demand. Without surge, 30% of peak requests go unserved.", "sub": [("MultiplierCalculation", 0.003), ("ElasticityAdjustment", 0.003), ("SurgeSmoothing", 0.004)]},
        {"sn": "DriverIncentives", "sv": "IncentiveService", "c": "Supply Management", "dur": 24, "d": "AI designs driver incentive programmes: quest bonuses, consecutive trip rewards, and zone-based boost earnings. ROI-optimised to attract supply at minimum cost.", "r": "Incentives cost $1-3B annually for major platforms. AI optimisation reduces incentive spend by 20% while maintaining supply levels.", "sub": [("QuestDesign", 8), ("BoostZoning", 8), ("ROIOptimization", 8)]},
        {"sn": "RiderPromotions", "sv": "PromoService", "c": "Demand Management", "dur": 24, "d": "AI targets rider promotions: off-peak discounts, new rider coupons, lapsed rider winback, and loyalty rewards. Promotion ROI tracked by cohort and channel.", "r": "Promotions drive 15-25% of rides but must be ROI-positive. AI targeting ensures discounts go to riders who will become retained customers.", "sub": [("OffPeakDiscounting", 8), ("WinbackCampaigns", 8), ("LoyaltyRewards", 8)]},
        {"sn": "PricingAnalytics", "sv": "PricingAnalyticsService", "c": "Analytics", "dur": 168, "d": "AI analyses pricing effectiveness: GMV impact, rider price sensitivity, driver earnings satisfaction, and market share vs competitors. Regulatory compliance reporting.", "r": "Pricing directly determines profitability, rider retention, and driver satisfaction. Wrong pricing loses riders or drivers to competitors.", "sub": [("GMVAnalysis", 56), ("PriceSensitivity", 56), ("MarketShareTracking", 56)]}
    ],
    "af": {
        "orderTotal": 22, "transactionValue": 22, "averageOrderValue": 18,
        "contractValue": 0, "annualRevenue": 30000000000, "revenuePerCustomer": 1200,
        "profitMargin": 3.0, "customerLifetimeValue": 4800, "lifetimeValue": 4800,
        "acquisitionCost": 8, "costPerAcquisition": 8, "conversionProbability": 0.50,
        "conversionRate": 50, "engagementScore": 70, "timeToConversion": 15,
        "sessionDuration": 120, "pageViews": 2, "purchaseFrequency": 60,
        "netPromoterScore": 32, "satisfactionRating": 4.0, "retentionProbability": 0.55,
        "processingTime": 0.01, "operationalCost": 2, "efficiencyRating": 85,
        "avgSurgeMultiplier": 1.3, "driverEarningsPerHour": 28,
        "channel": ["mobile_app", "web_app", "corporate_API", "transit_partner", "event_prebook"],
        "deviceType": ["mobile", "mobile", "server", "mobile", "desktop"],
        "region": ["Manhattan US", "Central London UK", "Sao Paulo BR", "Bangalore IN", "Jakarta ID"],
        "customerSegmentValue": ["price_sensitive", "convenience_first", "premium_willing", "corporate_account", "event_goer"],
        "loyaltyTier": ["VIP", "Frequent", "Regular", "Occasional", "New"],
        "segment": ["peak_morning", "peak_evening", "weekend_night", "airport", "event_surge"],
        "Productname": ["Standard Rate", "Surge Premium", "Scheduled Ride", "Flat Rate Airport", "Event Pre-Book"],
        "ProductId": ["RP-SR-001", "RP-SP-002", "RP-SC-003", "RP-FA-004", "RP-EP-005"],
        "ProductType": ["standard", "surge", "scheduled", "flat_rate", "pre_book"],
        "Price": [18, 32, 20, 45, 22],
        "surgeFrequency": [0.25, 0.80, 0, 0, 0.60],
        "driverAcceptanceRate": [0.85, 0.95, 0.90, 0.92, 0.88],
        "marketTrend": ["subscription_pricing", "upfront_pricing", "dynamic_commission", "carbon_pricing", "multimodal_pricing"]
    }
},
"config-robotics-fleet.json": {
    "co": "RoboFleet Technologies", "dom": "https://www.robofleet-tech.com",
    "ind": "Robotics & Automation", "jt": "Fleet Management",
    "jd": "AI-Powered Autonomous Robot Fleet Management",
    "steps": [
        {"sn": "FleetDeployment", "sv": "FleetDeployService", "c": "Setup", "dur": 168, "d": "AI plans robot fleet deployment: facility mapping, charging station placement, navigation path optimisation, and fleet size calculation based on task demand forecasting.", "r": "Optimal fleet sizing prevents both under-capacity (missed tasks) and over-investment (idle robots). AI sizing reduces capital cost by 20%.", "sub": [("FacilityMapping", 56), ("ChargingStationPlacement", 56), ("FleetSizing", 56)]},
        {"sn": "TaskAllocation", "sv": "TaskAllocService", "c": "Dispatch", "dur": 0.05, "d": "AI dispatches robots to tasks: priority-based allocation, multi-robot coordination, and dead-heading minimisation. Heterogeneous fleet management (different robot types for different tasks).", "r": "Optimal task allocation increases fleet throughput by 30-40%. Poor dispatching creates bottlenecks and idle robots simultaneously.", "sub": [("PriorityQueuing", 0.015), ("MultiRobotCoordination", 0.02), ("DeadheadMinimisation", 0.015)]},
        {"sn": "NavigationAndExecution", "sv": "NavigationService", "c": "Operations", "dur": 5, "d": "AI manages real-time navigation: SLAM, obstacle avoidance, human-safe path planning, and elevator/door integration. Task execution monitoring with error recovery.", "r": "Safe navigation in human environments is the core technical challenge. A single collision or stuck robot can erode employee trust in the entire programme.", "sub": [("SLAMNavigation", 2), ("ObstacleAvoidance", 1.5), ("TaskExecution", 1.5)]},
        {"sn": "FleetHealthMonitoring", "sv": "FleetHealthService", "c": "Monitoring", "dur": 0.1, "d": "AI monitors robot health: battery degradation, motor wear, sensor calibration, and software versioning. Predictive maintenance scheduling and spare parts inventory optimisation.", "r": "Robot downtime costs $500-2000 per day in lost productivity. Predictive maintenance reduces unplanned downtime by 60%.", "sub": [("BatteryMonitoring", 0.03), ("MotorHealth", 0.03), ("SensorCalibration", 0.04)]},
        {"sn": "PerformanceOptimization", "sv": "PerfOptService", "c": "Optimisation", "dur": 24, "d": "AI continuously optimises fleet performance: route learning from repeated tasks, speed/efficiency trade-offs, and inter-robot communication for crowd avoidance.", "r": "Robots that learn from experience become 15-25% more efficient over 6 months. Continuous optimisation is what makes robots surpass manual labor ROI.", "sub": [("RouteLearning", 8), ("SpeedOptimization", 8), ("CrowdAvoidance", 8)]},
        {"sn": "FleetAnalytics", "sv": "FleetAnalyticsService", "c": "Analytics", "dur": 168, "d": "AI generates fleet reports: tasks completed, utilisation rates, energy consumption, ROI calculation vs manual labor, and expansion recommendations.", "r": "Clear ROI analytics justify fleet expansion investment. Typical payback period is 12-18 months; analytics prove this to decision-makers.", "sub": [("UtilisationReporting", 56), ("ROICalculation", 56), ("ExpansionRecommendation", 56)]}
    ],
    "af": {
        "orderTotal": 0, "transactionValue": 0, "averageOrderValue": 0,
        "contractValue": 2000000, "annualRevenue": 150000000, "revenuePerCustomer": 2000000,
        "profitMargin": 20.0, "customerLifetimeValue": 10000000, "lifetimeValue": 10000000,
        "acquisitionCost": 150000, "costPerAcquisition": 150000, "conversionProbability": 0.25,
        "conversionRate": 25, "engagementScore": 80, "timeToConversion": 12960,
        "sessionDuration": 3600, "pageViews": 15, "purchaseFrequency": 365,
        "netPromoterScore": 48, "satisfactionRating": 4.2, "retentionProbability": 0.85,
        "processingTime": 0.05, "operationalCost": 50000, "efficiencyRating": 82,
        "fleetUtilisation": 78, "tasksPerRobotPerDay": 120,
        "channel": ["fleet_dashboard", "mobile_supervisor_app", "API_integration", "SCADA_link", "VR_monitoring"],
        "deviceType": ["desktop", "mobile", "server", "HMI_panel", "VR_headset"],
        "region": ["US", "Japan", "Germany", "South Korea", "China"],
        "customerSegmentValue": ["warehouse_fulfilment", "hospital_logistics", "hotel_service", "retail_inventory", "manufacturing_line"],
        "loyaltyTier": ["Enterprise Fleet", "Growth Fleet", "Pilot Fleet", "Evaluation", "Partner"],
        "segment": ["AMR_delivery", "cleaning_robot", "inspection_drone", "picking_arm", "security_patrol"],
        "Productname": ["AMR Delivery Bot", "Autonomous Cleaning Unit", "Inspection Drone Fleet", "Robotic Picking Arm", "Security Patrol Robot"],
        "ProductId": ["ROB-AD-001", "ROB-AC-002", "ROB-ID-003", "ROB-RP-004", "ROB-SP-005"],
        "ProductType": ["delivery", "cleaning", "inspection", "picking", "security"],
        "Price": [45000, 35000, 80000, 120000, 55000],
        "mtbf": [8500, 6000, 4500, 10000, 7000],
        "laborCostReplaced": [65000, 45000, 80000, 70000, 60000],
        "marketTrend": ["humanoid_robots", "multi_robot_orchestration", "robot_as_a_service", "cobots", "edge_AI_robotics"]
    }
},
"config-robotics-fulfillment.json": {
    "co": "RoboFleet Technologies", "dom": "https://www.robofleet-tech.com",
    "ind": "Robotics & Automation", "jt": "Warehouse Fulfillment",
    "jd": "AI-Powered Robotic Warehouse Fulfilment",
    "steps": [
        {"sn": "OrderIngestion", "sv": "OrderIngestService", "c": "Initiation", "dur": 0.01, "d": "AI ingests orders and optimises fulfilment: order batching, wave planning, and priority sequencing (same-day, next-day, standard). Inventory reservation and allocation.", "r": "Smart order batching reduces robot travel distance by 35%. Priority sequencing ensures SLA compliance for premium orders.", "sub": [("OrderBatching", 0.003), ("WavePlanning", 0.003), ("PrioritySequencing", 0.004)]},
        {"sn": "RoboticPicking", "sv": "PickingService", "c": "Picking", "dur": 3, "d": "AI coordinates goods-to-person picking: pod robot navigation, pick station optimisation, and vision-guided robotic arm picking for complex items. Error prevention via weight verification.", "r": "Robotic picking achieves 99.8% accuracy vs 97% manual. Speed is 3-5x faster with goods-to-person vs person-to-goods.", "sub": [("PodNavigation", 1), ("PickStationOptimization", 1), ("VisionGuidedPicking", 1)]},
        {"sn": "SortingAndPacking", "sv": "SortPackService", "c": "Processing", "dur": 2, "d": "AI manages robotic sorting: order consolidation, optimal box selection (DIM weight minimisation), and automated packing. Customs documentation for international orders.", "r": "Optimal box selection reduces shipping costs by 15-25%. A 1cm reduction in average package dimensions = $millions in freight savings.", "sub": [("OrderConsolidation", 0.5), ("BoxSelection", 0.5), ("AutomatedPacking", 1)]},
        {"sn": "OutboundStaging", "sv": "StagingService", "c": "Dispatch", "dur": 1, "d": "AI stages packed orders for carrier pickup: carrier-specific sorting, loading sequence optimisation, and label/manifest generation. Real-time carrier integration.", "r": "Efficient staging reduces carrier wait time and ensures on-time dispatch. A missed carrier window delays delivery by 24 hours.", "sub": [("CarrierSorting", 0.3), ("LoadingSequence", 0.3), ("ManifestGeneration", 0.4)]},
        {"sn": "InventoryManagement", "sv": "InventoryMgmtService", "c": "Stock", "dur": 24, "d": "AI manages inventory: cycle counting via autonomous drones, slotting optimisation for fast-moving items, and replenishment triggering. Inventory accuracy tracking.", "r": "Inventory accuracy above 99.5% is essential for reliable fulfilment. Drone counting achieves this 10x faster than manual counting.", "sub": [("DroneCounting", 8), ("SlottingOptimization", 8), ("ReplenishmentTriggering", 8)]},
        {"sn": "FulfilmentAnalytics", "sv": "FulfilmentAnalyticsService", "c": "Analytics", "dur": 168, "d": "AI analyses fulfilment performance: orders per hour, pick accuracy, robot utilisation, and cost per order. Labour vs automation ROI comparison. Capacity planning.", "r": "Fulfilment analytics quantify automation ROI. Typical robotic warehouse achieves 3-5x throughput improvement at 50% lower cost per order.", "sub": [("ThroughputAnalysis", 56), ("AccuracyMetrics", 56), ("CostPerOrderTracking", 56)]}
    ],
    "af": {
        "orderTotal": 45, "transactionValue": 45, "averageOrderValue": 55,
        "contractValue": 5000000, "annualRevenue": 150000000, "revenuePerCustomer": 3000000,
        "profitMargin": 20.0, "customerLifetimeValue": 15000000, "lifetimeValue": 15000000,
        "acquisitionCost": 250000, "costPerAcquisition": 250000, "conversionProbability": 0.20,
        "conversionRate": 20, "engagementScore": 85, "timeToConversion": 17280,
        "sessionDuration": 28800, "pageViews": 25, "purchaseFrequency": 365,
        "netPromoterScore": 50, "satisfactionRating": 4.3, "retentionProbability": 0.90,
        "processingTime": 5, "operationalCost": 0.80, "efficiencyRating": 90,
        "ordersPerHour": 450, "pickAccuracy": 99.8,
        "channel": ["WMS_integration", "ecommerce_API", "ERP_link", "mobile_supervisor", "control_tower"],
        "deviceType": ["server", "server", "server", "mobile", "desktop"],
        "region": ["US East", "US West", "EU Central", "UK", "Japan"],
        "customerSegmentValue": ["ecommerce_giant", "3PL_provider", "grocery_chain", "pharma_distributor", "fashion_retailer"],
        "loyaltyTier": ["Mega Warehouse", "Large Warehouse", "Medium Warehouse", "Small Warehouse", "Micro Fulfilment"],
        "segment": ["goods_to_person", "person_to_goods", "robotic_arm_picking", "autonomous_forklift", "drone_inventory"],
        "Productname": ["Pod Robot Fleet", "Robotic Picking Arm", "Autonomous Forklift", "Inventory Drone", "Sorting Conveyor Robot"],
        "ProductId": ["FUL-PR-001", "FUL-RA-002", "FUL-AF-003", "FUL-ID-004", "FUL-SC-005"],
        "ProductType": ["pod_robot", "picking_arm", "forklift", "drone", "sorting"],
        "Price": [30000, 150000, 200000, 45000, 85000],
        "unitsPerHour": [300, 600, 100, 1000, 500],
        "errorRate": [0.002, 0.005, 0.003, 0.001, 0.004],
        "marketTrend": ["micro_fulfilment_centres", "same_day_delivery", "returns_automation", "cold_chain_robots", "sustainable_packaging_robots"]
    }
},
"config-semiconductor-defect.json": {
    "co": "ChipVision Semiconductor", "dom": "https://www.chipvision-semi.com",
    "ind": "Semiconductor & Chip", "jt": "Defect Detection",
    "jd": "AI-Powered Semiconductor Defect Detection & Yield",
    "steps": [
        {"sn": "WaferInspection", "sv": "WaferInspectService", "c": "Inspection", "dur": 0.5, "d": "AI performs high-resolution wafer inspection: optical, SEM, and e-beam imaging. Sub-10nm defect detection with classification into killer vs nuisance defects.", "r": "A single killer defect renders a $500-50000 chip worthless. At 3nm node, defect density directly determines yield and profitability.", "sub": [("OpticalInspection", 0.15), ("SEMImaging", 0.2), ("DefectClassification", 0.15)]},
        {"sn": "RootCauseAnalysis", "sv": "RootCauseService", "c": "Analysis", "dur": 4, "d": "AI correlates defects with process parameters: tool-by-tool contribution, wafer-level patterns, and temporal trends. Pareto analysis of defect sources with automated tool fingerprinting.", "r": "Identifying root cause in hours vs days saves millions per day in scrap. Tool fingerprinting links defects to specific equipment needing maintenance.", "sub": [("ParetoAnalysis", 1.5), ("ToolFingerprinting", 1.5), ("TemporalCorrelation", 1)]},
        {"sn": "YieldPrediction", "sv": "YieldPredictService", "c": "Prediction", "dur": 1, "d": "AI predicts lot-level and wafer-level yield: defect density integration, parametric test correlation, and historical yield modelling. Early yield excursion detection.", "r": "1% yield improvement at a leading-edge fab = $100M+ annual profit. Early excursion detection prevents days of yield loss.", "sub": [("DefectDensityModel", 0.3), ("ParametricCorrelation", 0.3), ("ExcursionDetection", 0.4)]},
        {"sn": "InlineDisposition", "sv": "DispositionService", "c": "Decision", "dur": 0.1, "d": "AI makes real-time disposition decisions: pass, rework, or scrap based on defect criticality, downstream impact prediction, and customer spec compliance.", "r": "Over-scrapping wastes $1000s per wafer. Under-scrapping sends defective products to customers. AI balances these risks optimally.", "sub": [("CriticalityAssessment", 0.03), ("DownstreamImpact", 0.04), ("DispositionDecision", 0.03)]},
        {"sn": "ProcessControl", "sv": "ProcessControlService", "c": "Control", "dur": 0.5, "d": "AI manages statistical process control (SPC), run-to-run control, and advanced process control (APC). Automatic recipe adjustments to maintain process within spec.", "r": "APC keeps processes centered on target despite tool drift and incoming variation. Without it, process variation consumes 30% of the process window.", "sub": [("SPCMonitoring", 0.15), ("RunToRunControl", 0.15), ("RecipeAdjustment", 0.2)]},
        {"sn": "YieldAnalytics", "sv": "YieldAnalyticsService", "c": "Analytics", "dur": 168, "d": "AI generates yield reports: wafer maps, defect Pareto, yield trends by technology node, and competitive benchmarking. Fab-wide defect reduction roadmap.", "r": "Yield analytics drive fab continuous improvement. Leading fabs achieve 95%+ yield through systematic AI-driven defect reduction.", "sub": [("WaferMapAnalysis", 56), ("DefectTrending", 56), ("BenchmarkComparison", 56)]}
    ],
    "af": {
        "orderTotal": 0, "transactionValue": 0, "averageOrderValue": 0,
        "contractValue": 50000000, "annualRevenue": 40000000000, "revenuePerCustomer": 0,
        "profitMargin": 45.0, "customerLifetimeValue": 0, "lifetimeValue": 0,
        "acquisitionCost": 0, "costPerAcquisition": 0, "conversionProbability": 1.0,
        "conversionRate": 100, "engagementScore": 92, "timeToConversion": 0,
        "sessionDuration": 28800, "pageViews": 50, "purchaseFrequency": 365,
        "netPromoterScore": 0, "satisfactionRating": 0, "retentionProbability": 1.0,
        "processingTime": 0.5, "operationalCost": 15000000000, "efficiencyRating": 88,
        "yieldRate": 92.5, "defectDensity": 0.08,
        "channel": ["fab_automation", "engineering_workstation", "mobile_fab_app", "executive_dashboard", "customer_portal"],
        "deviceType": ["SCADA", "desktop", "cleanroom_tablet", "desktop", "desktop"],
        "region": ["Taiwan TSMC", "South Korea Samsung", "US Intel", "Japan", "EU ASML"],
        "customerSegmentValue": ["logic_7nm", "logic_3nm", "memory_DRAM", "memory_NAND", "analog_power"],
        "loyaltyTier": ["Leading Edge", "Mature Node", "Specialty", "R&D", "Foundry"],
        "segment": ["front_end_litho", "front_end_etch", "front_end_deposition", "back_end_packaging", "metrology"],
        "Productname": ["Optical Defect Inspector", "e-Beam Review System", "Yield Management Suite", "APC Controller", "Wafer Map Analytics"],
        "ProductId": ["SEM-OI-001", "SEM-EB-002", "SEM-YM-003", "SEM-AP-004", "SEM-WA-005"],
        "ProductType": ["inspection", "review", "yield_management", "process_control", "analytics"],
        "Price": [25000000, 40000000, 10000000, 5000000, 3000000],
        "wafersPerDay": [3000, 500, 3000, 3000, 3000],
        "killerDefectCapture": [0.95, 0.99, 0, 0, 0],
        "marketTrend": ["3nm_yield_challenge", "EUV_defect_control", "AI_defect_classification", "chiplet_integration", "heterogeneous_packaging"]
    }
},
"config-semiconductor-fabrication.json": {
    "co": "ChipVision Semiconductor", "dom": "https://www.chipvision-semi.com",
    "ind": "Semiconductor & Chip", "jt": "Fabrication Optimization",
    "jd": "AI-Optimised Semiconductor Fabrication Process",
    "steps": [
        {"sn": "ProcessDesign", "sv": "ProcessDesignService", "c": "Design", "dur": 4320, "d": "AI accelerates process development: DOE optimisation, TCAD simulation, and process window characterisation. Technology node scaling from R&D to high-volume manufacturing.", "r": "Process development for a new node costs $1-3B and takes 3-5 years. AI reduces development cycle by 20-30% and finds wider process windows.", "sub": [("DOEOptimization", 1440), ("TCADSimulation", 1440), ("ProcessWindowCharacterisation", 1440)]},
        {"sn": "LithographyControl", "sv": "LithoControlService", "c": "Critical Process", "dur": 0.5, "d": "AI manages lithography: overlay correction, CD uniformity, and focus/dose optimisation. EUV stochastic defect management. Computational lithography for OPC and mask synthesis.", "r": "Lithography is the most critical and expensive step ($150M+ per EUV tool). A 1nm overlay error at 3nm node kills yield.", "sub": [("OverlayCorrection", 0.15), ("CDUniformity", 0.15), ("EUVDefectManagement", 0.2)]},
        {"sn": "EtchAndDeposition", "sv": "EtchDepService", "c": "Processing", "dur": 0.3, "d": "AI controls etch profiles, deposition thickness, and selectivity. Multi-step etch recipes with endpoint detection. ALD and CVD process optimisation for atomic-level control.", "r": "Etch and deposition account for 60% of processing steps. Atomic-level uniformity across 300mm wafers determines device performance.", "sub": [("EtchProfileControl", 0.1), ("DepositionThickness", 0.1), ("EndpointDetection", 0.1)]},
        {"sn": "MetrologyAndInspection", "sv": "MetrologyService", "c": "Quality", "dur": 1, "d": "AI optimises metrology sampling: smart sampling based on process risk, virtual metrology from tool sensors, and real-time SPC. Measurement recipe optimisation.", "r": "100% metrology is impossible (too slow/expensive). AI smart sampling achieves equivalent defect detection at 30% of measurement cost.", "sub": [("SmartSampling", 0.3), ("VirtualMetrology", 0.3), ("SPCOptimization", 0.4)]},
        {"sn": "FabScheduling", "sv": "FabScheduleService", "c": "Operations", "dur": 24, "d": "AI manages fab scheduling: lot dispatching, tool allocation, maintenance window optimisation, and WIP management. Cycle time reduction through bottleneck identification.", "r": "A leading-edge fab has $20B+ in capital equipment. Every hour of tool idle time = $10K-50K in lost output. AI scheduling maximises output.", "sub": [("LotDispatching", 8), ("ToolAllocation", 8), ("CycleTimeOptimization", 8)]},
        {"sn": "FabAnalytics", "sv": "FabAnalyticsService", "c": "Analytics", "dur": 168, "d": "AI generates fab performance reports: wafers out, cycle time, tool utilisation, and cost per wafer layer. Competitive benchmarking and capacity planning for next-gen nodes.", "r": "Fab analytics drive $billions in planning decisions. Output per tool per day determines whether the $20B fab investment delivers returns.", "sub": [("OutputTracking", 56), ("CostAnalysis", 56), ("CapacityPlanning", 56)]}
    ],
    "af": {
        "orderTotal": 0, "transactionValue": 0, "averageOrderValue": 0,
        "contractValue": 100000000, "annualRevenue": 40000000000, "revenuePerCustomer": 500000000,
        "profitMargin": 45.0, "customerLifetimeValue": 5000000000, "lifetimeValue": 5000000000,
        "acquisitionCost": 0, "costPerAcquisition": 0, "conversionProbability": 1.0,
        "conversionRate": 100, "engagementScore": 95, "timeToConversion": 0,
        "sessionDuration": 28800, "pageViews": 60, "purchaseFrequency": 365,
        "netPromoterScore": 0, "satisfactionRating": 0, "retentionProbability": 1.0,
        "processingTime": 2880, "operationalCost": 15000000000, "efficiencyRating": 85,
        "cycleTime": 60, "wafersOutPerWeek": 15000,
        "channel": ["MES_system", "engineering_workstation", "executive_dashboard", "customer_design_portal", "remote_monitoring"],
        "deviceType": ["SCADA", "desktop", "desktop", "desktop", "mobile"],
        "region": ["Hsinchu TW", "Hwaseong KR", "Chandler AZ US", "Dresden DE", "Kumamoto JP"],
        "customerSegmentValue": ["fabless_design_house", "IDM_customer", "government_contract", "automotive_chip", "AI_accelerator"],
        "loyaltyTier": ["Strategic Customer", "Key Account", "Volume Customer", "Emerging", "R&D Partner"],
        "segment": ["logic_advanced", "logic_mature", "memory", "analog_mixed", "MEMS_sensor"],
        "Productname": ["3nm Logic Process", "7nm Logic Process", "Advanced DRAM Process", "28nm Mature Node", "Power Management Process"],
        "ProductId": ["FAB-3N-001", "FAB-7N-002", "FAB-DR-003", "FAB-28-004", "FAB-PM-005"],
        "ProductType": ["leading_edge_logic", "advanced_logic", "memory", "mature_logic", "specialty"],
        "Price": [20000, 8000, 5000, 2000, 3000],
        "toolUtilisation": [0.92, 0.88, 0.90, 0.85, 0.82],
        "processSteps": [1000, 500, 300, 200, 150],
        "marketTrend": ["3nm_ramp", "chiplet_packaging", "EUV_high_NA", "silicon_photonics", "CFET_transistor"]
    }
},
"config-shipping-port-scheduling.json": {
    "co": "OceanTech Shipping", "dom": "https://www.oceantech-shipping.com",
    "ind": "Shipping & Maritime", "jt": "Port Scheduling",
    "jd": "AI-Optimised Port Operations & Berth Scheduling",
    "steps": [
        {"sn": "VesselArrivalPrediction", "sv": "VesselPredictService", "c": "Forecasting", "dur": 24, "d": "AI predicts vessel arrival times from AIS tracking, weather routing, and port congestion. Dynamic ETA updates shared with all port stakeholders. Berth window optimisation.", "r": "Accurate ETAs enable berth planning 24-48 hours ahead. Each hour of berth idle time costs the port $5K-15K in lost revenue.", "sub": [("AISSTracking", 8), ("WeatherRouting", 8), ("CongestionModelling", 8)]},
        {"sn": "BerthAllocation", "sv": "BerthAllocService", "c": "Planning", "dur": 4, "d": "AI allocates berths: vessel size/type matching, crane availability, cargo type (container, bulk, tanker), and tidal window constraints. Priority handling for liner services.", "r": "Optimal berth allocation increases port throughput by 15-20% without capital investment. Poor allocation creates cascading delays across the port.", "sub": [("VesselMatching", 1.5), ("CraneAvailability", 1.5), ("TidalConstraints", 1)]},
        {"sn": "CraneScheduling", "sv": "CraneScheduleService", "c": "Operations", "dur": 2, "d": "AI schedules container crane operations: quay crane assignment, container sequencing (restow minimisation), and yard crane coordination. Twin-lift and tandem-lift optimisation.", "r": "Crane productivity determines vessel turnaround time. Improving crane moves per hour from 25 to 30 = 20% faster vessel operations.", "sub": [("CraneAssignment", 0.5), ("ContainerSequencing", 1), ("YardCoordination", 0.5)]},
        {"sn": "YardManagement", "sv": "YardManagementService", "c": "Storage", "dur": 24, "d": "AI manages container yard: stack position optimisation (minimising re-handles), reefer container monitoring, and dangerous goods segregation. Gate appointment scheduling.", "r": "Re-handling adds $25-50 per container move. AI stacking reduces re-handles by 30-40%. Reefer failure can destroy $100K+ in cargo.", "sub": [("StackOptimization", 8), ("ReeferMonitoring", 8), ("GateScheduling", 8)]},
        {"sn": "InlandTransport", "sv": "InlandTransportService", "c": "Distribution", "dur": 48, "d": "AI coordinates inland transport: truck appointment systems, rail loading optimisation, and barge scheduling. Modal split optimisation for cost and carbon. Chassis management.", "r": "Port congestion from uncoordinated trucking costs $billions annually. Truck appointment systems reduce gate wait times from 2 hours to 20 minutes.", "sub": [("TruckAppointments", 16), ("RailOptimization", 16), ("ModalSplitOptimization", 16)]},
        {"sn": "PortAnalytics", "sv": "PortAnalyticsService", "c": "Analytics", "dur": 168, "d": "AI generates port performance reports: vessel turnaround time, crane productivity, yard utilisation, and dwell time analysis. Benchmarking against competitor ports.", "r": "Port analytics drive investment decisions and competitive positioning. Ports that demonstrate efficiency win shipping line contracts worth $100M+.", "sub": [("TurnaroundAnalysis", 56), ("ProductivityMetrics", 56), ("CompetitiveBenchmark", 56)]}
    ],
    "af": {
        "orderTotal": 0, "transactionValue": 0, "averageOrderValue": 0,
        "contractValue": 500000000, "annualRevenue": 2000000000, "revenuePerCustomer": 50000000,
        "profitMargin": 20.0, "customerLifetimeValue": 500000000, "lifetimeValue": 500000000,
        "acquisitionCost": 0, "costPerAcquisition": 0, "conversionProbability": 1.0,
        "conversionRate": 100, "engagementScore": 82, "timeToConversion": 0,
        "sessionDuration": 28800, "pageViews": 40, "purchaseFrequency": 365,
        "netPromoterScore": 0, "satisfactionRating": 0, "retentionProbability": 1.0,
        "processingTime": 1440, "operationalCost": 500000000, "efficiencyRating": 75,
        "craneMPH": 28, "avgDwellTime": 4.5,
        "channel": ["port_TOS", "shipping_line_portal", "truck_appointment_app", "customs_EDI", "control_tower"],
        "deviceType": ["HMI_panel", "desktop", "mobile", "server", "desktop"],
        "region": ["Rotterdam NL", "Singapore", "Shanghai CN", "Los Angeles US", "Dubai UAE"],
        "customerSegmentValue": ["container_liner", "bulk_carrier", "tanker_operator", "cruise_line", "feeder_service"],
        "loyaltyTier": ["Alliance Partner", "Key Account", "Regular Caller", "Occasional", "Transshipment"],
        "segment": ["container_terminal", "bulk_terminal", "tanker_berth", "cruise_terminal", "ro_ro_terminal"],
        "Productname": ["Smart Berth Planner", "Crane Scheduling AI", "Yard Management Suite", "Gate Control System", "Port Community Platform"],
        "ProductId": ["PORT-SB-001", "PORT-CS-002", "PORT-YM-003", "PORT-GC-004", "PORT-PC-005"],
        "ProductType": ["berth_planning", "crane_scheduling", "yard_management", "gate_control", "port_community"],
        "Price": [10000000, 8000000, 12000000, 5000000, 3000000],
        "annualTEU": [15000000, 5000000, 0, 0, 2000000],
        "vesselCallsPerYear": [12000, 3000, 2000, 500, 5000],
        "marketTrend": ["port_automation", "digital_twin_port", "green_port_operations", "blockchain_BL", "autonomous_vessels"]
    }
},
"config-shipping-voyage-optimization.json": {
    "co": "OceanTech Shipping", "dom": "https://www.oceantech-shipping.com",
    "ind": "Shipping & Maritime", "jt": "Voyage Optimization",
    "jd": "AI-Powered Maritime Voyage Optimisation",
    "steps": [
        {"sn": "VoyagePlanning", "sv": "VoyagePlanService", "c": "Planning", "dur": 24, "d": "AI generates optimal voyage plans: weather routing, ocean current exploitation, canal transit scheduling, and fuel consumption minimisation. Multi-port rotation optimisation.", "r": "Fuel accounts for 50-60% of voyage costs. AI voyage optimisation reduces fuel consumption by 5-15% per voyage.", "sub": [("WeatherRouting", 8), ("CurrentExploitation", 8), ("FuelOptimization", 8)]},
        {"sn": "SpeedOptimization", "sv": "SpeedOptService", "c": "Operations", "dur": 0.5, "d": "AI calculates optimal speed profile: just-in-time arrival (virtual arrival), weather-adaptive speed, and fuel-emission trade-offs. CII and EEXI compliance optimisation.", "r": "Slowing from 14 to 12 knots reduces fuel consumption by 30%. Just-in-time arrival eliminates waiting at anchor ($20K/day cost).", "sub": [("JustInTimeArrival", 0.2), ("WeatherAdaptiveSpeed", 0.15), ("EmissionCompliance", 0.15)]},
        {"sn": "CargoOptimization", "sv": "CargoOptService", "c": "Loading", "dur": 8, "d": "AI optimises cargo operations: stowage planning, stability calculations, stress analysis, and dangerous goods segregation. Container weight distribution and reefer positioning.", "r": "Optimal stowage reduces port time by 10-15% (fewer moves) and ensures vessel stability. Poor stowage has caused vessel capsizing.", "sub": [("StowagePlanning", 3), ("StabilityCalculation", 2.5), ("DGSegregation", 2.5)]},
        {"sn": "FleetPositioning", "sv": "FleetPositionService", "c": "Strategy", "dur": 168, "d": "AI manages fleet positioning: trade lane optimisation, ballast voyage minimisation, and charter-in/charter-out decisions. Seasonal demand forecasting for fleet allocation.", "r": "Ballast voyages (empty ships repositioning) account for 40% of all voyages. AI reduces ballast by 15% through smarter fleet positioning.", "sub": [("TradeLaneOptimization", 56), ("BallastMinimisation", 56), ("CharterDecisions", 56)]},
        {"sn": "EmissionsManagement", "sv": "EmissionsService", "c": "Compliance", "dur": 24, "d": "AI manages carbon emissions: EU ETS compliance, CII rating tracking, and alternative fuel transition planning (LNG, methanol, ammonia). Carbon credit trading optimisation.", "r": "EU ETS adds $20-50 per tonne CO2 cost. CII non-compliance results in speed restrictions that destroy commercial capacity.", "sub": [("EUETSCompliance", 8), ("CIITracking", 8), ("AlternativeFuelPlanning", 8)]},
        {"sn": "VoyageAnalytics", "sv": "VoyageAnalyticsService", "c": "Analytics", "dur": 168, "d": "AI generates voyage reports: actual vs planned performance, fuel efficiency, charter party compliance, and demurrage/despatch calculations. Fleet environmental reporting.", "r": "Voyage analytics identify $millions in performance improvement opportunities. Charter party disputes cost $10K-100K each; AI evidence prevents disputes.", "sub": [("PerformanceComparison", 56), ("FuelEfficiency", 56), ("CharterCompliance", 56)]}
    ],
    "af": {
        "orderTotal": 0, "transactionValue": 0, "averageOrderValue": 0,
        "contractValue": 10000000, "annualRevenue": 5000000000, "revenuePerCustomer": 100000000,
        "profitMargin": 15.0, "customerLifetimeValue": 1000000000, "lifetimeValue": 1000000000,
        "acquisitionCost": 0, "costPerAcquisition": 0, "conversionProbability": 1.0,
        "conversionRate": 100, "engagementScore": 85, "timeToConversion": 0,
        "sessionDuration": 28800, "pageViews": 35, "purchaseFrequency": 365,
        "netPromoterScore": 0, "satisfactionRating": 0, "retentionProbability": 1.0,
        "processingTime": 720, "operationalCost": 3000000000, "efficiencyRating": 72,
        "fuelSavings": 12, "ciiRating": "B",
        "channel": ["fleet_management_system", "bridge_ECDIS", "office_chartering", "weather_routing_provider", "emission_registry"],
        "deviceType": ["desktop", "bridge_panel", "desktop", "server", "desktop"],
        "region": ["Asia-Europe", "Trans-Pacific", "Trans-Atlantic", "Middle East-Asia", "Intra-Asia"],
        "customerSegmentValue": ["container_line", "dry_bulk", "tanker_crude", "tanker_product", "LNG_carrier"],
        "loyaltyTier": ["Top 10 Operator", "Major Operator", "Regional Operator", "Niche Operator", "Spot Charter"],
        "segment": ["container", "dry_bulk", "crude_tanker", "product_tanker", "gas_carrier"],
        "Productname": ["Weather Routing AI", "Speed Optimiser", "Cargo Planning Suite", "Fleet Position Optimizer", "Emission Manager"],
        "ProductId": ["VOY-WR-001", "VOY-SO-002", "VOY-CP-003", "VOY-FP-004", "VOY-EM-005"],
        "ProductType": ["weather_routing", "speed_optimization", "cargo_planning", "fleet_positioning", "emission_management"],
        "Price": [3000000, 2000000, 1500000, 5000000, 1000000],
        "vesselCount": [600, 200, 150, 300, 50],
        "fuelCostPerDay": [35000, 20000, 25000, 15000, 45000],
        "marketTrend": ["decarbonisation_2050", "autonomous_ships", "digital_twin_vessel", "alternative_fuels", "just_in_time_arrival"]
    }
},
}

if __name__ == "__main__":
    for fn, data in SECTORS.items():
        gen(fn, data)
    print(f"Batch 8 complete: {len(SECTORS)} configs updated.")
