#!/usr/bin/env python3
"""Batch 6: marketplace, media, mining, music"""
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
"config-marketplace-discovery.json": {
    "co": "MarketplaceX", "dom": "https://www.marketplacex.com",
    "ind": "Marketplace & Platform", "jt": "Product Discovery",
    "jd": "AI-Powered Marketplace Product Discovery",
    "steps": [
        {"sn": "SearchAndBrowse", "sv": "SearchService", "c": "Discovery", "dur": 0.3, "d": "AI-powered search with natural language understanding, visual search, and faceted navigation. Personalised ranking blends relevance, seller performance, and buyer preference.", "r": "Search is the #1 conversion driver. Improving search relevance by 10% increases GMV by 5-8%.", "sub": [("NLPSearch", 0.1), ("VisualSearch", 0.1), ("PersonalisedRanking", 0.1)]},
        {"sn": "ProductRecommendation", "sv": "RecommendationService", "c": "Personalisation", "dur": 0.2, "d": "AI recommends products from collaborative filtering, content similarity, and purchase graph analysis. Cross-seller bundling and 'frequently bought together' suggestions.", "r": "Recommendations drive 35% of marketplace GMV. Cross-seller bundling increases basket size by 25%.", "sub": [("CollaborativeFiltering", 0.07), ("ContentSimilarity", 0.07), ("CrossSellerBundle", 0.06)]},
        {"sn": "SellerMatching", "sv": "SellerMatchService", "c": "Matching", "dur": 0.3, "d": "AI selects optimal seller/offer for buy box: price, shipping speed, seller rating, fulfilment method, and return policy. A/B testing rotates seller exposure fairly.", "r": "Buy box allocation drives 80% of purchases. Fair and transparent seller matching maintains marketplace trust.", "sub": [("PriceComparison", 0.1), ("QualityScoring", 0.1), ("BuyBoxAllocation", 0.1)]},
        {"sn": "TrustAndReview", "sv": "TrustService", "c": "Trust", "dur": 1, "d": "AI authenticates reviews, detects fake ratings, and generates review summaries. Buyer protection and dispute resolution insights. Seller trust scores visible to buyers.", "r": "Trust is the oxygen of marketplaces. A 0.1 average rating increase = 5% more sales. Fake reviews destroy the ecosystem.", "sub": [("ReviewAuthentication", 0.3), ("SentimentSummary", 0.3), ("TrustScoring", 0.4)]},
        {"sn": "CheckoutOptimization", "sv": "CheckoutService", "c": "Conversion", "dur": 0.5, "d": "AI optimises checkout: payment method recommendation, shipping option personalisation, tax calculation, and abandoned cart recovery. Multi-seller cart aggregation.", "r": "Checkout abandonment is 65-75% on marketplaces. Each 1% improvement in completion = millions in recovered GMV.", "sub": [("PaymentOptimization", 0.2), ("ShippingSelection", 0.15), ("CartRecovery", 0.15)]},
        {"sn": "PostPurchaseExperience", "sv": "PostPurchaseService", "c": "Retention", "dur": 168, "d": "AI tracks multi-seller fulfilment, predicts delivery issues, and proactively communicates. Return prediction and prevention. Repurchase prompts timed by consumption cycle.", "r": "Post-purchase experience determines retention. Customers who have a bad delivery experience have 40% lower repeat rate.", "sub": [("FulfilmentTracking", 56), ("ReturnPrevention", 56), ("RepurchasePrompting", 56)]}
    ],
    "af": {
        "orderTotal": 65, "transactionValue": 65, "averageOrderValue": 55,
        "contractValue": 0, "annualRevenue": 15000000000, "revenuePerCustomer": 850,
        "profitMargin": 12.0, "customerLifetimeValue": 4200, "lifetimeValue": 4200,
        "acquisitionCost": 18, "costPerAcquisition": 18, "conversionProbability": 0.04,
        "conversionRate": 4, "engagementScore": 72, "timeToConversion": 720,
        "sessionDuration": 480, "pageViews": 14, "purchaseFrequency": 18,
        "netPromoterScore": 38, "satisfactionRating": 4.0, "retentionProbability": 0.55,
        "processingTime": 5, "operationalCost": 8, "efficiencyRating": 82,
        "gmv": 45000000000, "takeRate": 12.5,
        "channel": ["web_marketplace", "mobile_app", "social_commerce", "voice_assistant", "partner_site"],
        "deviceType": ["desktop", "mobile", "mobile", "voice", "desktop"],
        "region": ["US", "UK", "Germany", "Japan", "India"],
        "customerSegmentValue": ["power_buyer", "bargain_hunter", "brand_loyalist", "impulse_buyer", "researcher"],
        "loyaltyTier": ["Prime", "Plus", "Standard", "New", "Guest"],
        "segment": ["electronics", "fashion", "home_garden", "beauty", "sports"],
        "Productname": ["Wireless Headphones Pro", "Organic Cotton T-Shirt", "Smart Garden Kit", "Vitamin C Serum", "Running Shoes Ultra"],
        "ProductId": ["MKT-WH-001", "MKT-OC-002", "MKT-SG-003", "MKT-VC-004", "MKT-RS-005"],
        "ProductType": ["electronics", "apparel", "home", "beauty", "footwear"],
        "Price": [79, 35, 120, 28, 145],
        "sellerRating": [4.7, 4.5, 4.8, 4.3, 4.6],
        "fulfilmentMethod": ["marketplace_fulfilled", "seller_shipped", "marketplace_fulfilled", "seller_shipped", "marketplace_fulfilled"],
        "marketTrend": ["social_commerce", "live_shopping", "AI_curation", "sustainability_marketplace", "cross_border_trade"]
    }
},
"config-marketplace-seller.json": {
    "co": "MarketplaceX", "dom": "https://www.marketplacex.com",
    "ind": "Marketplace & Platform", "jt": "Seller Onboarding",
    "jd": "AI-Assisted Marketplace Seller Onboarding & Growth",
    "steps": [
        {"sn": "SellerRegistration", "sv": "SellerRegService", "c": "Onboarding", "dur": 2, "d": "AI streamlines seller registration: business verification, tax docs, banking, and category approval. Risk scoring determines verification depth. Fraudulent seller detection.", "r": "Seller quality is the marketplace's moat. One fraudulent seller can generate thousands of customer complaints.", "sub": [("BusinessVerification", 0.5), ("DocumentCapture", 0.5), ("RiskScoring", 1)]},
        {"sn": "CatalogueOnboarding", "sv": "CatalogueService", "c": "Listing", "dur": 24, "d": "AI assists product listing: auto-categorisation, attribute extraction from images, SEO title/description generation, and competitive pricing guidance.", "r": "Complete, accurate listings get 3x more views. AI-optimised listings reduce seller onboarding from weeks to hours.", "sub": [("AutoCategorisation", 8), ("ImageAnalysis", 8), ("PricingGuidance", 8)]},
        {"sn": "InventoryAndFulfilment", "sv": "InventoryService", "c": "Operations", "dur": 168, "d": "AI forecasts demand per SKU, recommends stock levels, and suggests fulfilment strategy (self-ship vs marketplace fulfilment). Returns reduction through listing quality.", "r": "Stockouts cost 4% of annual revenue. Marketplace fulfilment improves buy box win rate by 30% and conversion by 25%.", "sub": [("DemandForecast", 56), ("StockOptimization", 56), ("FulfilmentStrategy", 56)]},
        {"sn": "PricingOptimization", "sv": "PricingOptService", "c": "Revenue", "dur": 1, "d": "AI monitors competitor pricing, recommends dynamic price adjustments, and predicts buy box win probability at each price point. Margin protection alerts.", "r": "Sellers with dynamic pricing win 40% more buy box rotations. Over-discounting destroys margins; AI finds the sweet spot.", "sub": [("CompetitorMonitoring", 0.3), ("DynamicPricing", 0.3), ("BuyBoxPrediction", 0.4)]},
        {"sn": "PerformanceMonitoring", "sv": "PerformanceService", "c": "Quality", "dur": 24, "d": "AI tracks seller KPIs: order defect rate, late shipment, cancellation rate, and customer complaints. Performance improvement recommendations. Penalty risk alerts.", "r": "Sellers below performance thresholds lose visibility and can be suspended. Proactive monitoring prevents account health crises.", "sub": [("KPITracking", 8), ("QualityAlerts", 8), ("ImprovementRecs", 8)]},
        {"sn": "GrowthAndExpansion", "sv": "GrowthService", "c": "Growth", "dur": 720, "d": "AI identifies category expansion opportunities, new marketplace launches, and advertising ROI optimisation. Cross-border selling guidance. Brand registry and A+ content.", "r": "Top sellers grow 4x faster with AI guidance. Cross-border expansion can double addressable market overnight.", "sub": [("CategoryExpansion", 240), ("AdvertisingROI", 240), ("CrossBorderGuidance", 240)]}
    ],
    "af": {
        "orderTotal": 0, "transactionValue": 0, "averageOrderValue": 0,
        "contractValue": 0, "annualRevenue": 15000000000, "revenuePerCustomer": 120000,
        "profitMargin": 12.0, "customerLifetimeValue": 480000, "lifetimeValue": 480000,
        "acquisitionCost": 250, "costPerAcquisition": 250, "conversionProbability": 0.25,
        "conversionRate": 25, "engagementScore": 65, "timeToConversion": 2880,
        "sessionDuration": 1200, "pageViews": 18, "purchaseFrequency": 365,
        "netPromoterScore": 32, "satisfactionRating": 3.8, "retentionProbability": 0.70,
        "processingTime": 30, "operationalCost": 150, "efficiencyRating": 75,
        "activeSellers": 2500000, "sellerChurnRate": 15,
        "channel": ["seller_central", "mobile_seller_app", "API_integration", "bulk_upload", "partner_tools"],
        "deviceType": ["desktop", "mobile", "server", "desktop", "desktop"],
        "region": ["US", "UK", "Germany", "India", "China"],
        "customerSegmentValue": ["enterprise_brand", "SMB_seller", "artisan_maker", "dropshipper", "manufacturer"],
        "loyaltyTier": ["Platinum Seller", "Gold Seller", "Silver Seller", "New Seller", "Restricted"],
        "segment": ["electronics", "fashion", "home_living", "grocery", "handmade"],
        "Productname": ["Seller Analytics Dashboard", "AI Listing Optimizer", "Fulfilment Network Access", "Advertising Suite", "Brand Registry"],
        "ProductId": ["SLR-AD-001", "SLR-LO-002", "SLR-FN-003", "SLR-AS-004", "SLR-BR-005"],
        "ProductType": ["analytics", "optimization", "fulfilment", "advertising", "brand_protection"],
        "Price": [39, 99, 0, 500, 0],
        "buyBoxWinRate": [0.65, 0.45, 0.80, 0.55, 0.72],
        "orderDefectRate": [0.005, 0.012, 0.003, 0.018, 0.008],
        "marketTrend": ["seller_AI_assistants", "unified_commerce", "social_selling", "sustainability_ratings", "cross_border_expansion"]
    }
},
"config-media-content-discovery.json": {
    "co": "MediaStream Global", "dom": "https://www.mediastream-global.com",
    "ind": "Media & Entertainment", "jt": "Content Discovery",
    "jd": "AI-Personalised Content Discovery & Engagement",
    "steps": [
        {"sn": "PersonalisedHomeFeed", "sv": "HomeFeedService", "c": "Discovery", "dur": 0.1, "d": "AI curates personalised home feed from viewing history, explicit preferences, trending content, and social signals. Multi-armed bandit for exploration vs exploitation.", "r": "The home feed is where 75% of viewing starts. Better personalisation directly drives 15-20% more watch time.", "sub": [("ProfileAnalysis", 0.03), ("ContentRanking", 0.04), ("TrendInjection", 0.03)]},
        {"sn": "SearchAndRecommendation", "sv": "SearchRecService", "c": "Navigation", "dur": 0.2, "d": "AI-powered search with natural language, voice, and visual queries. 'Because you watched' recommendations. Mood-based and contextual suggestions (time of day, device).", "r": "Good recommendations reduce browse time from 10 minutes to 2. Users who find content in under 60 seconds have 3x higher session duration.", "sub": [("NLPSearch", 0.07), ("CollabFiltering", 0.07), ("ContextualRec", 0.06)]},
        {"sn": "ContentPreview", "sv": "PreviewService", "c": "Engagement", "dur": 0.5, "d": "AI generates personalised trailers, thumbnails (A/B tested per user), and synopsis summaries. Auto-play previews with attention-optimised duration.", "r": "Personalised thumbnails increase click-through by 20-30%. The right preview converts a browser to a viewer.", "sub": [("DynamicThumbnail", 0.2), ("TrailerGeneration", 0.15), ("SynopsisGeneration", 0.15)]},
        {"sn": "ViewingExperience", "sv": "ViewingService", "c": "Experience", "dur": 60, "d": "AI optimises stream quality (adaptive bitrate), provides skip-intro/recap features, and tracks engagement signals. Real-time content rating and social viewing features.", "r": "Buffering causes 25% of session abandonment. AI-optimised streaming quality reduces abandonment and maintains engagement.", "sub": [("AdaptiveBitrate", 20), ("EngagementTracking", 20), ("SocialFeatures", 20)]},
        {"sn": "ContinuityAndBingeing", "sv": "ContinuityService", "c": "Retention", "dur": 5, "d": "AI manages cross-device continuity, auto-play next episode with smart countdowns, and binge-watch pacing. Content calendar notifications for new episodes.", "r": "Binge completion rate directly predicts subscription retention. Users who finish a series are 70% more likely to renew.", "sub": [("CrossDeviceSync", 1.5), ("AutoPlayOptimization", 1.5), ("ReleaseNotifications", 2)]},
        {"sn": "ContentAnalytics", "sv": "ContentAnalyticsService", "c": "Analytics", "dur": 168, "d": "AI analyses viewership patterns for content acquisition decisions. Audience overlap, completion rates, and engagement depth by genre/format. Content ROI calculation.", "r": "Content spend is the #1 cost ($15-20B for major platforms). AI-informed acquisition decisions improve content ROI by 20-40%.", "sub": [("ViewershipAnalysis", 56), ("ContentROI", 56), ("AcquisitionInsights", 56)]}
    ],
    "af": {
        "orderTotal": 12.99, "transactionValue": 12.99, "averageOrderValue": 14.99,
        "contractValue": 0, "annualRevenue": 8000000000, "revenuePerCustomer": 156,
        "profitMargin": 8.0, "customerLifetimeValue": 780, "lifetimeValue": 780,
        "acquisitionCost": 50, "costPerAcquisition": 50, "conversionProbability": 0.06,
        "conversionRate": 6, "engagementScore": 70, "timeToConversion": 1440,
        "sessionDuration": 3600, "pageViews": 8, "purchaseFrequency": 12,
        "netPromoterScore": 42, "satisfactionRating": 4.1, "retentionProbability": 0.72,
        "processingTime": 0.1, "operationalCost": 2, "efficiencyRating": 90,
        "avgWatchTime": 95, "completionRate": 68,
        "channel": ["smart_tv", "mobile_app", "web_browser", "gaming_console", "tablet"],
        "deviceType": ["smart_tv", "mobile", "desktop", "console", "tablet"],
        "region": ["US", "UK", "Brazil", "India", "Japan"],
        "customerSegmentValue": ["binge_watcher", "casual_viewer", "family_account", "sports_fan", "documentary_lover"],
        "loyaltyTier": ["Premium 4K", "Standard HD", "Basic", "Ad-Supported", "Trial"],
        "segment": ["drama", "comedy", "documentary", "reality", "sports"],
        "Productname": ["Premium 4K Plan", "Standard HD Plan", "Basic Plan", "Ad-Supported Free", "Sports Add-On"],
        "ProductId": ["MED-P4-001", "MED-SH-002", "MED-BA-003", "MED-AF-004", "MED-SA-005"],
        "ProductType": ["subscription_premium", "subscription_standard", "subscription_basic", "ad_supported", "add_on"],
        "Price": [22.99, 15.49, 6.99, 0, 9.99],
        "contentLibrarySize": [15000, 12000, 8000, 5000, 3000],
        "churnRate": [0.03, 0.05, 0.08, 0.12, 0.04],
        "marketTrend": ["ad_supported_tiers", "live_sports_streaming", "interactive_content", "AI_content_creation", "global_localisation"]
    }
},
"config-media-subscription-management.json": {
    "co": "MediaStream Global", "dom": "https://www.mediastream-global.com",
    "ind": "Media & Entertainment", "jt": "Subscription Management",
    "jd": "AI-Optimised Subscription Lifecycle & Retention",
    "steps": [
        {"sn": "TrialConversion", "sv": "TrialService", "c": "Acquisition", "dur": 336, "d": "AI optimises free trial: personalised content push during trial, engagement milestones, and conversion triggers. Trial extension for high-potential users. Paywall timing.", "r": "Trial-to-paid conversion averages 60%. AI-optimised trials improve this to 75%. Each 1% improvement = millions in annual revenue.", "sub": [("ContentPush", 112), ("EngagementMilestones", 112), ("ConversionTrigger", 112)]},
        {"sn": "PlanOptimization", "sv": "PlanService", "c": "Revenue", "dur": 24, "d": "AI recommends optimal plan per subscriber: usage analysis, feature utilisation, and willingness-to-pay prediction. Upsell/cross-sell opportunities for add-ons.", "r": "30% of subscribers are on suboptimal plans. Right-sizing increases ARPU by 10-15% while improving satisfaction.", "sub": [("UsageAnalysis", 8), ("PlanRecommendation", 8), ("UpsellTiming", 8)]},
        {"sn": "ChurnPrediction", "sv": "ChurnPredictService", "c": "Retention", "dur": 24, "d": "AI calculates churn probability from engagement decline, payment failures, competitive launches, and complaint history. 30/60/90-day churn forecasts per segment.", "r": "Acquiring a new subscriber costs 5-7x more than retaining one. Identifying churn risk early enables targeted retention spend.", "sub": [("EngagementDecline", 8), ("PaymentRisk", 8), ("CompetitiveThreats", 8)]},
        {"sn": "RetentionIntervention", "sv": "RetentionService", "c": "Recovery", "dur": 48, "d": "AI triggers personalised retention offers: content highlights, plan discounts, feature unlocks, and exclusive previews. Intervention channel and timing optimised per user.", "r": "Targeted retention saves 15-25% of at-risk subscribers. Blanket discounts destroy margin; personalised offers preserve it.", "sub": [("OfferPersonalisation", 16), ("ChannelOptimization", 16), ("ImpactMeasurement", 16)]},
        {"sn": "PaymentRecovery", "sv": "PaymentRecoveryService", "c": "Revenue Recovery", "dur": 168, "d": "AI manages involuntary churn: smart retry scheduling, card update reminders, and alternative payment methods. Grace periods personalised by subscriber value.", "r": "Involuntary churn (failed payments) accounts for 20-40% of all churn. Smart dunning recovers 40-60% of failed payments.", "sub": [("SmartRetry", 56), ("CardUpdatePrompts", 56), ("GracePeriodManagement", 56)]},
        {"sn": "WinbackCampaigns", "sv": "WinbackService", "c": "Re-acquisition", "dur": 720, "d": "AI targets churned subscribers with personalised winback campaigns at optimal timing. New content highlights, competitive pricing, and changed value proposition messaging.", "r": "Winback converts 5-15% of churned subscribers at 50% lower CAC than new acquisition. Timing and content relevance are key.", "sub": [("TimingOptimization", 240), ("ContentHighlights", 240), ("PersonalisedOffer", 240)]}
    ],
    "af": {
        "orderTotal": 14.99, "transactionValue": 14.99, "averageOrderValue": 16.50,
        "contractValue": 0, "annualRevenue": 8000000000, "revenuePerCustomer": 180,
        "profitMargin": 8.0, "customerLifetimeValue": 780, "lifetimeValue": 780,
        "acquisitionCost": 50, "costPerAcquisition": 50, "conversionProbability": 0.62,
        "conversionRate": 62, "engagementScore": 65, "timeToConversion": 336,
        "sessionDuration": 120, "pageViews": 3, "purchaseFrequency": 12,
        "netPromoterScore": 38, "satisfactionRating": 3.9, "retentionProbability": 0.92,
        "processingTime": 5, "operationalCost": 3, "efficiencyRating": 88,
        "monthlyChurn": 4.5, "arpu": 14.20,
        "channel": ["in_app", "email", "push_notification", "sms", "customer_service"],
        "deviceType": ["smart_tv", "mobile", "desktop", "mobile", "phone"],
        "region": ["US", "UK", "Brazil", "India", "Japan"],
        "customerSegmentValue": ["premium_loyal", "standard_engaged", "basic_at_risk", "ad_supported_convert", "winback_target"],
        "loyaltyTier": ["Lifetime", "Annual", "Monthly", "Trial", "Churned"],
        "segment": ["retention", "upsell", "winback", "trial_conversion", "payment_recovery"],
        "Productname": ["Retention Analytics Engine", "Smart Dunning System", "Winback Campaign Manager", "Trial Optimizer", "ARPU Maximizer"],
        "ProductId": ["SUB-RA-001", "SUB-SD-002", "SUB-WC-003", "SUB-TO-004", "SUB-AM-005"],
        "ProductType": ["analytics", "payment_recovery", "marketing", "conversion", "revenue_optimization"],
        "Price": [150000, 80000, 120000, 100000, 200000],
        "retentionSavings": [0.18, 0.42, 0.10, 0.15, 0.12],
        "revenueImpact": [5000000, 12000000, 3000000, 8000000, 15000000],
        "marketTrend": ["bundled_subscriptions", "ad_tier_monetization", "family_plan_growth", "annual_plan_incentives", "content_cost_optimization"]
    }
},
"config-mining-exploration-targeting.json": {
    "co": "MineralTech Resources", "dom": "https://www.mineraltech-resources.com",
    "ind": "Mining & Resources", "jt": "Exploration Targeting",
    "jd": "AI-Powered Mineral Exploration & Target Generation",
    "steps": [
        {"sn": "GeologicalDataIntegration", "sv": "GeoDataService", "c": "Data", "dur": 720, "d": "AI integrates geological surveys, remote sensing, geochemical sampling, geophysical data, and historical drill results. Multi-source fusion creates unified geological model.", "r": "Exploration success rate is 1-3%. AI-integrated data analysis increases discovery probability to 5-10% by eliminating human bias in target selection.", "sub": [("RemoteSensing", 240), ("GeochemicalAnalysis", 240), ("GeophysicalModelling", 240)]},
        {"sn": "TargetGeneration", "sv": "TargetGenService", "c": "Analysis", "dur": 168, "d": "AI generates exploration targets from geological signatures, mineral system models, and analogues from known deposits. Prospectivity mapping with probability and tonnage estimates.", "r": "Traditional targeting misses 60% of viable deposits. AI target generation has found deposits that geologists overlooked for decades.", "sub": [("ProspectivityMapping", 56), ("AnalogueMatching", 56), ("TonnageEstimation", 56)]},
        {"sn": "DrillProgramDesign", "sv": "DrillDesignService", "c": "Planning", "dur": 48, "d": "AI optimises drill hole placement, depth, and orientation to maximise geological information per metre drilled. Budget allocation across targets ranked by expected value.", "r": "Drilling is the most expensive exploration activity ($200-500/metre). Optimised drill programmes achieve 30% more information per dollar spent.", "sub": [("HolePlacement", 16), ("DepthOptimization", 16), ("BudgetAllocation", 16)]},
        {"sn": "SampleAnalysis", "sv": "SampleAnalysisService", "c": "Assessment", "dur": 336, "d": "AI analyses drill core and chip samples: mineralogy, grade, geological structure, and alteration patterns. Real-time grade estimation guides ongoing drill decisions.", "r": "Rapid sample analysis enables adaptive drilling: modifying the programme based on results to follow mineralisation rather than rigid pre-planned patterns.", "sub": [("MineralogyAnalysis", 112), ("GradeEstimation", 112), ("AlterationMapping", 112)]},
        {"sn": "ResourceEstimation", "sv": "ResourceEstService", "c": "Valuation", "dur": 720, "d": "AI generates JORC/NI43-101 compliant resource estimates. Geostatistical modelling, grade interpolation, and geological domaining. Sensitivity analysis for cut-off grades.", "r": "Resource estimates drive company valuation and investment decisions. A 10% increase in resource confidence can double market capitalisation.", "sub": [("GeostatModelling", 240), ("GradeInterpolation", 240), ("SensitivityAnalysis", 240)]},
        {"sn": "PortfolioOptimization", "sv": "PortfolioOptService", "c": "Strategy", "dur": 168, "d": "AI optimises exploration portfolio across multiple projects: risk diversification, budget allocation by expected NPV, and stage-gate decision support.", "r": "Exploration companies must balance high-risk/high-reward greenfield with lower-risk brownfield. AI portfolio optimisation improves capital allocation ROI by 25-40%.", "sub": [("RiskDiversification", 56), ("NPVRanking", 56), ("StageGateAnalysis", 56)]}
    ],
    "af": {
        "orderTotal": 0, "transactionValue": 0, "averageOrderValue": 0,
        "contractValue": 50000000, "annualRevenue": 2500000000, "revenuePerCustomer": 500000000,
        "profitMargin": 25.0, "customerLifetimeValue": 5000000000, "lifetimeValue": 5000000000,
        "acquisitionCost": 5000000, "costPerAcquisition": 5000000, "conversionProbability": 0.08,
        "conversionRate": 8, "engagementScore": 60, "timeToConversion": 43200,
        "sessionDuration": 7200, "pageViews": 20, "purchaseFrequency": 1,
        "netPromoterScore": 35, "satisfactionRating": 3.8, "retentionProbability": 0.85,
        "processingTime": 10080, "operationalCost": 2000000, "efficiencyRating": 65,
        "discoveryRate": 5.2, "drillCostPerMetre": 350,
        "channel": ["field_survey", "satellite_remote_sensing", "engineering_portal", "GIS_platform", "boardroom_presentation"],
        "deviceType": ["ruggedised_tablet", "desktop", "desktop", "desktop", "desktop"],
        "region": ["Western Australia", "Ontario CA", "Chile", "DRC Congo", "Nevada US"],
        "customerSegmentValue": ["gold", "copper", "lithium", "iron_ore", "rare_earth"],
        "loyaltyTier": ["Major Miner", "Mid-Tier", "Junior Explorer", "Prospect Generator", "Royalty Co"],
        "segment": ["greenfield_exploration", "brownfield_expansion", "near_mine", "regional_targeting", "grassroots"],
        "Productname": ["AI Target Generator Pro", "Drill Optimiser Suite", "Resource Estimation Engine", "Remote Sensing Package", "Portfolio Optimizer"],
        "ProductId": ["MIN-TG-001", "MIN-DO-002", "MIN-RE-003", "MIN-RS-004", "MIN-PO-005"],
        "ProductType": ["target_generation", "drill_optimization", "resource_estimation", "remote_sensing", "portfolio"],
        "Price": [5000000, 2000000, 3000000, 1500000, 1000000],
        "drillMetres": [50000, 25000, 100000, 0, 0],
        "resourceCategory": ["indicated", "inferred", "measured", "exploration_target", "prospective"],
        "marketTrend": ["battery_metals_rush", "AI_exploration", "ESG_permitting", "deep_learning_geophysics", "autonomous_drilling"]
    }
},
"config-mining-production-optimization.json": {
    "co": "MineralTech Resources", "dom": "https://www.mineraltech-resources.com",
    "ind": "Mining & Resources", "jt": "Production Optimization",
    "jd": "AI-Driven Mine Production & Processing Optimisation",
    "steps": [
        {"sn": "MinePlanning", "sv": "MinePlanService", "c": "Planning", "dur": 720, "d": "AI generates optimal mine plans: pit shell optimisation, cut-off grade analysis, production scheduling, and waste dump design. Multi-scenario modelling for commodity price sensitivity.", "r": "Mine plans span 10-30 years and determine $billions in capital commitment. A 5% improvement in mine planning NPV = hundreds of millions.", "sub": [("PitOptimization", 240), ("ProductionScheduling", 240), ("ScenarioModelling", 240)]},
        {"sn": "FleetManagement", "sv": "FleetMgmtService", "c": "Operations", "dur": 0.1, "d": "AI dispatches haul trucks, excavators, and drills in real-time. Route optimisation, queue management at dumps and crushers, and predictive maintenance scheduling.", "r": "Fleet is 40-60% of mining operating costs. AI dispatch improves fleet productivity by 10-15%. One extra truck cycle per hour = $millions annually.", "sub": [("TruckDispatch", 0.03), ("RouteOptimization", 0.04), ("QueueManagement", 0.03)]},
        {"sn": "GradeControl", "sv": "GradeControlService", "c": "Quality", "dur": 1, "d": "AI manages ore/waste classification at the dig face using blast hole sampling, real-time sensor data, and geological model updates. Grade reconciliation between model and mill.", "r": "Ore loss and dilution cost mines 10-20% of potential revenue. Better grade control recovers value from every tonne.", "sub": [("BlastHoleAnalysis", 0.3), ("SensorFusion", 0.3), ("ReconciliationLoop", 0.4)]},
        {"sn": "ProcessingOptimization", "sv": "ProcessingService", "c": "Processing", "dur": 0.5, "d": "AI optimises comminution (crushing/grinding), flotation, leaching, and smelting. Real-time adjustments to reagent dosing, particle size, and throughput based on ore variability.", "r": "Processing is 30-40% of production costs. AI optimisation improves recovery by 1-3% and throughput by 5-10% with same energy.", "sub": [("GrindingOptimization", 0.15), ("FlotationControl", 0.15), ("ReagentDosing", 0.2)]},
        {"sn": "SafetyAndEnvironmental", "sv": "SafetyEnvService", "c": "Compliance", "dur": 24, "d": "AI monitors safety KPIs: near-miss patterns, fatigue detection, proximity alerts, and geotechnical slope stability. Environmental monitoring: dust, water, tailings dam, and rehabilitation.", "r": "Mining fatalities cost lives and can result in $billion liabilities. AI safety reduces LTIFR by 30-50%. Environmental non-compliance can close a mine.", "sub": [("FatigueDetection", 8), ("ProximityAlerts", 8), ("EnvironmentalMonitoring", 8)]},
        {"sn": "ProductionAnalytics", "sv": "ProductionAnalyticsService", "c": "Analytics", "dur": 24, "d": "AI generates shift reports, production dashboards, and cost-per-tonne analysis. Variance from plan reporting. Integration with commodity markets for revenue forecasting.", "r": "Real-time production analytics enable same-shift corrections. Variance analysis identifies systemic issues before they compound.", "sub": [("ShiftReporting", 8), ("CostAnalysis", 8), ("RevenueForecasting", 8)]}
    ],
    "af": {
        "orderTotal": 0, "transactionValue": 0, "averageOrderValue": 0,
        "contractValue": 200000000, "annualRevenue": 2500000000, "revenuePerCustomer": 2500000000,
        "profitMargin": 30.0, "customerLifetimeValue": 0, "lifetimeValue": 0,
        "acquisitionCost": 0, "costPerAcquisition": 0, "conversionProbability": 1.0,
        "conversionRate": 100, "engagementScore": 85, "timeToConversion": 0,
        "sessionDuration": 28800, "pageViews": 50, "purchaseFrequency": 365,
        "netPromoterScore": 0, "satisfactionRating": 0, "retentionProbability": 1.0,
        "processingTime": 1440, "operationalCost": 1200000000, "efficiencyRating": 78,
        "oee": 88, "recoveryRate": 91.5,
        "channel": ["SCADA_control", "dispatch_system", "mobile_field", "engineering_desktop", "boardroom_dashboard"],
        "deviceType": ["HMI_panel", "desktop", "ruggedised_tablet", "desktop", "desktop"],
        "region": ["Pilbara AU", "Atacama CL", "Sudbury CA", "Witwatersrand ZA", "Carajas BR"],
        "customerSegmentValue": ["open_pit_gold", "underground_copper", "iron_ore_bulk", "lithium_brine", "coal_thermal"],
        "loyaltyTier": ["Tier 1 Major", "Tier 2 Producer", "Mid-Tier", "Junior Producer", "Development Stage"],
        "segment": ["open_pit", "underground", "heap_leach", "concentrator", "smelter"],
        "Productname": ["Fleet Management System", "Processing Control AI", "Grade Control Suite", "Safety Monitoring Platform", "Mine Plan Optimizer"],
        "ProductId": ["MOP-FM-001", "MOP-PC-002", "MOP-GC-003", "MOP-SM-004", "MOP-MP-005"],
        "ProductType": ["fleet", "processing", "grade_control", "safety", "planning"],
        "Price": [15000000, 8000000, 5000000, 3000000, 10000000],
        "tonnagePerDay": [250000, 50000, 250000, 80000, 150000],
        "costPerTonne": [2.50, 12.00, 2.50, 8.00, 4.00],
        "marketTrend": ["autonomous_haulage", "electric_fleet", "digital_twin_mine", "ESG_decarbonization", "remote_operations_centre"]
    }
},
"config-music-discovery.json": {
    "co": "SonicStream Music", "dom": "https://www.sonicstream-music.com",
    "ind": "Music & Audio", "jt": "Music Discovery",
    "jd": "AI-Powered Personalised Music Discovery",
    "steps": [
        {"sn": "ListeningProfileBuild", "sv": "ProfileService", "c": "Profiling", "dur": 168, "d": "AI builds listener profile from play history, skips, saves, playlist creation, and audio feature preferences (tempo, energy, valence). Taste clusters and genre affinities mapped.", "r": "Deep listener profiling is the foundation of personalisation. Platforms with better profiles achieve 40% higher daily active use.", "sub": [("PlayHistoryAnalysis", 56), ("AudioFeatureProfiling", 56), ("TasteClusterMapping", 56)]},
        {"sn": "PersonalisedPlaylists", "sv": "PlaylistService", "c": "Discovery", "dur": 24, "d": "AI generates personalised playlists: Discover Weekly, Daily Mix, Release Radar. New artist introduction balanced with familiar favourites. Mood and activity-based playlists.", "r": "Personalised playlists drive 31% of all streams. Discover Weekly alone has introduced 2.3B artist discoveries globally.", "sub": [("DiscoverWeekly", 8), ("DailyMix", 8), ("MoodPlaylists", 8)]},
        {"sn": "ArtistRecommendation", "sv": "ArtistRecService", "c": "Exploration", "dur": 1, "d": "AI recommends new artists from audio similarity, listener overlap, and concert proximity. 'Fans Also Like' with explanation. Emerging artist spotlight for early adopters.", "r": "Artist discovery benefits the entire ecosystem: listeners find new favourites, artists grow audiences. Better discovery = more engagement.", "sub": [("AudioSimilarity", 0.3), ("ListenerOverlap", 0.3), ("EmergingArtistSpotlight", 0.4)]},
        {"sn": "ContextualMusic", "sv": "ContextualService", "c": "Adaptation", "dur": 0.5, "d": "AI adapts music recommendations to context: time of day, weather, workout intensity, driving speed, and calendar events. Smart speaker and connected device integration.", "r": "Contextual music plays have 2x completion rate. Right music at right moment builds the habit loop that drives daily use.", "sub": [("TimeOfDayAdaptation", 0.15), ("ActivityDetection", 0.15), ("DeviceContext", 0.2)]},
        {"sn": "SocialAndSharing", "sv": "SocialService", "c": "Engagement", "dur": 24, "d": "AI facilitates social discovery: collaborative playlists, listening activity feed, blend playlists for friend pairs, and concert group matching. Viral content identification.", "r": "Social features increase referrals by 25%. Collaborative playlists have 3x the engagement of solo playlists.", "sub": [("CollaborativePlaylists", 8), ("SocialFeed", 8), ("ViralDetection", 8)]},
        {"sn": "ListeningAnalytics", "sv": "ListeningAnalyticsService", "c": "Analytics", "dur": 168, "d": "AI generates personalised listening stats: top genres, artists, tracks, listening hours, and music personality type. Year-in-review features for social sharing.", "r": "Wrapped/year-in-review generates $100M+ in earned media. Listening analytics create emotional connection and prevent churn.", "sub": [("PersonalStats", 56), ("YearInReview", 56), ("MusicPersonality", 56)]}
    ],
    "af": {
        "orderTotal": 10.99, "transactionValue": 10.99, "averageOrderValue": 11.99,
        "contractValue": 0, "annualRevenue": 5000000000, "revenuePerCustomer": 132,
        "profitMargin": 5.0, "customerLifetimeValue": 660, "lifetimeValue": 660,
        "acquisitionCost": 8, "costPerAcquisition": 8, "conversionProbability": 0.12,
        "conversionRate": 12, "engagementScore": 80, "timeToConversion": 720,
        "sessionDuration": 2400, "pageViews": 6, "purchaseFrequency": 12,
        "netPromoterScore": 50, "satisfactionRating": 4.3, "retentionProbability": 0.78,
        "processingTime": 0.1, "operationalCost": 0.004, "efficiencyRating": 92,
        "avgDailyListeningMinutes": 52, "skipRate": 22,
        "channel": ["mobile_app", "desktop_app", "smart_speaker", "car_infotainment", "web_player"],
        "deviceType": ["mobile", "desktop", "smart_speaker", "car", "desktop"],
        "region": ["US", "UK", "Brazil", "Mexico", "Sweden"],
        "customerSegmentValue": ["premium_individual", "premium_family", "free_ad_supported", "student", "duo"],
        "loyaltyTier": ["Premium Family", "Premium Individual", "Premium Student", "Free", "Trial"],
        "segment": ["pop", "hip_hop", "rock", "latin", "electronic"],
        "Productname": ["Premium Individual", "Premium Family (6)", "Premium Student", "Free Ad-Supported", "Premium Duo"],
        "ProductId": ["MUS-PI-001", "MUS-PF-002", "MUS-PS-003", "MUS-FA-004", "MUS-PD-005"],
        "ProductType": ["premium_individual", "premium_family", "premium_student", "free", "premium_duo"],
        "Price": [10.99, 16.99, 5.99, 0, 14.99],
        "tracksAvailable": [100000000, 100000000, 100000000, 100000000, 100000000],
        "playlistFollowers": [5000000, 2000000, 1500000, 8000000, 800000],
        "marketTrend": ["spatial_audio", "AI_generated_music", "podcast_integration", "live_audio", "creator_economy"]
    }
},
"config-music-distribution.json": {
    "co": "SonicStream Music", "dom": "https://www.sonicstream-music.com",
    "ind": "Music & Audio", "jt": "Music Distribution",
    "jd": "AI-Optimised Music Distribution & Artist Analytics",
    "steps": [
        {"sn": "TrackIngestion", "sv": "IngestionService", "c": "Onboarding", "dur": 2, "d": "AI processes master recordings: audio quality validation, metadata enrichment, ISRC assignment, and content ID fingerprinting. Rights and ownership verification.", "r": "Clean metadata is essential for royalty accuracy. Missing or incorrect metadata causes 10-15% of royalties to go unclaimed globally.", "sub": [("AudioValidation", 0.5), ("MetadataEnrichment", 0.5), ("ContentFingerprint", 1)]},
        {"sn": "MultiPlatformDistribution", "sv": "DistributionService", "c": "Distribution", "dur": 48, "d": "AI distributes to 150+ streaming platforms, download stores, and social media. Release timing optimised for each market. Pre-save campaign automation.", "r": "Day-one streams drive algorithmic playlist placement. Optimised release timing and pre-save campaigns increase first-week streams by 40-60%.", "sub": [("PlatformDelivery", 16), ("ReleaseTimingOptimization", 16), ("PreSaveCampaign", 16)]},
        {"sn": "PlaylistPitching", "sv": "PlaylistPitchService", "c": "Promotion", "dur": 336, "d": "AI identifies optimal playlists for pitching, generates pitch narratives, and tracks playlist additions. Algorithmic and editorial playlist targeting based on audio features.", "r": "A single major playlist placement can generate 1M+ streams. AI-powered pitching improves acceptance rate from 5% to 15%.", "sub": [("PlaylistMatching", 112), ("PitchGeneration", 112), ("AdditionTracking", 112)]},
        {"sn": "RoyaltyAccounting", "sv": "RoyaltyService", "c": "Finance", "dur": 720, "d": "AI reconciles streams across platforms, calculates per-stream royalties by territory and plan type, and manages splits between writers, producers, and labels.", "r": "Royalty accounting for a hit song involves millions of micro-transactions across 150+ countries. Errors create legal disputes and lost income.", "sub": [("StreamReconciliation", 240), ("RoyaltyCalculation", 240), ("SplitManagement", 240)]},
        {"sn": "ArtistAnalytics", "sv": "ArtistAnalyticsService", "c": "Intelligence", "dur": 24, "d": "AI provides artist dashboard: streaming trends, audience demographics, geographic hotspots, playlist performance, and social engagement. Tour routing recommendations.", "r": "Data-driven artists grow 3x faster. Geographic hotspot data informs tour routing, increasing concert revenue by 20-30%.", "sub": [("StreamingTrends", 8), ("AudienceDemographics", 8), ("TourRecommendations", 8)]},
        {"sn": "MarketingAutomation", "sv": "MarketingAutoService", "c": "Growth", "dur": 168, "d": "AI automates marketing: social media content calendar, ad spend allocation, influencer matching, and release cycle planning. Fan engagement and community building.", "r": "Independent artists who use AI marketing tools earn 60% more than those who don't. Automated marketing frees artists to focus on creation.", "sub": [("SocialContentCalendar", 56), ("AdSpendOptimization", 56), ("FanEngagement", 56)]}
    ],
    "af": {
        "orderTotal": 0, "transactionValue": 0, "averageOrderValue": 0,
        "contractValue": 0, "annualRevenue": 5000000000, "revenuePerCustomer": 2500,
        "profitMargin": 15.0, "customerLifetimeValue": 25000, "lifetimeValue": 25000,
        "acquisitionCost": 50, "costPerAcquisition": 50, "conversionProbability": 0.45,
        "conversionRate": 45, "engagementScore": 70, "timeToConversion": 1440,
        "sessionDuration": 900, "pageViews": 10, "purchaseFrequency": 52,
        "netPromoterScore": 40, "satisfactionRating": 4.0, "retentionProbability": 0.82,
        "processingTime": 120, "operationalCost": 25, "efficiencyRating": 80,
        "avgPerStreamPayout": 0.004, "catalogueTracks": 120000000,
        "channel": ["artist_dashboard", "mobile_app", "API_integration", "label_portal", "distribution_partner"],
        "deviceType": ["desktop", "mobile", "server", "desktop", "desktop"],
        "region": ["US", "UK", "Latin America", "India", "Sub-Saharan Africa"],
        "customerSegmentValue": ["major_label", "indie_label", "independent_artist", "podcast_creator", "audiobook_publisher"],
        "loyaltyTier": ["Platinum Artist", "Gold Artist", "Silver Artist", "Bronze Artist", "New Artist"],
        "segment": ["pop", "hip_hop", "rock", "latin", "afrobeats"],
        "Productname": ["Pro Distribution Plan", "Label Services", "Basic Free Plan", "Podcast Distribution", "Audiobook Distribution"],
        "ProductId": ["DIS-PD-001", "DIS-LS-002", "DIS-BF-003", "DIS-PC-004", "DIS-AB-005"],
        "ProductType": ["premium_distribution", "label_services", "free_distribution", "podcast", "audiobook"],
        "Price": [19.99, 500, 0, 9.99, 24.99],
        "streamsPerMonth": [50000000000, 20000000000, 30000000000, 5000000000, 2000000000],
        "artistPayout": [0.004, 0.005, 0.003, 0.006, 0.008],
        "marketTrend": ["direct_fan_monetization", "AI_mastering", "sync_licensing_AI", "NFT_music", "global_genre_blending"]
    }
},
}

if __name__ == "__main__":
    for fn, data in SECTORS.items():
        gen(fn, data)
    print(f"Batch 6 complete: {len(SECTORS)} configs updated.")
