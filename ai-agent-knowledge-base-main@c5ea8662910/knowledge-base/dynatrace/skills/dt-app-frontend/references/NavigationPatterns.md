# Navigation Patterns

Analyze user navigation flows, referrers, and navigation types in web applications.

**Data Source:** `fetch user.events` with `characteristics.has_navigation`

**Key Fields:**

- `navigation.type` - navigate, reload, back_forward, soft_navigation, prerender
- `navigation.tab_state` - new, existing, duplicated
- `view.source.*` - Previous view information
- `page.source.url.*` - Referrer URL components

## Navigation Types Distribution

Analyze how users navigate:

```dql
fetch user.events, from:now()-24h
| filter characteristics.has_navigation == true
| fieldsAdd app_name = entityName(dt.rum.application.entity, type:"dt.entity.application")
| summarize
    nav_count = count(),
    unique_sessions = countDistinct(dt.rum.session.id),
    by: {app_name, navigation.type}
| sort nav_count desc

```

**Use Case:** Understand navigation behavior patterns.

## New vs Returning Tab Sessions

Analyze tab usage:

```dql
fetch user.events, from:now()-24h
| filter characteristics.has_navigation == true
| fieldsAdd app_name = entityName(dt.rum.application.entity, type:"dt.entity.application")
| summarize
    nav_count = count(),
    by: {app_name, navigation.tab_state}

```

**Use Case:** Track multi-tab usage patterns.

## External Referrers

Analyze traffic sources:

```dql
fetch user.events, from:now()-24h
| filter characteristics.has_navigation == true
| filter navigation.type == "navigate"
| filter isNotNull(page.source.url.domain)
| fieldsAdd app_name = entityName(dt.rum.application.entity, type:"dt.entity.application")
| summarize
    referral_count = count(),
    unique_sessions = countDistinct(dt.rum.session.id),
    by: {app_name, page.source.url.domain}
| sort referral_count desc
| limit 20

```

**Use Case:** Identify top traffic sources.

## Internal Navigation Flows

Track page-to-page navigation:

```dql
fetch user.events, from:now()-24h
| filter characteristics.has_navigation == true
| filter isNotNull(view.source.url.path)
| fieldsAdd app_name = entityName(dt.rum.application.entity, type:"dt.entity.application")
| summarize
    flow_count = count(),
    by: {app_name, view.source.url.path, page.url.path}
| sort flow_count desc
| limit 30

```

**Use Case:** Visualize common user journeys.

## Page Reload Analysis

Monitor page reloads:

```dql
fetch user.events, from:now()-24h
| filter characteristics.has_navigation == true
| filter navigation.type == "reload"
| fieldsAdd app_name = entityName(dt.rum.application.entity, type:"dt.entity.application")
| summarize
    reload_count = count(),
    unique_sessions = countDistinct(dt.rum.session.id),
    by: {app_name, page.url.path}
| sort reload_count desc
| limit 20

```

**Use Case:** Identify pages with high reload rates (potential UX issues).

## Back/Forward Navigation

Analyze history navigation:

```dql
fetch user.events, from:now()-24h
| filter characteristics.has_navigation == true
| filter in(navigation.type, "back_forward", "back_forward_cache")
| fieldsAdd app_name = entityName(dt.rum.application.entity, type:"dt.entity.application")
| summarize
    back_forward_count = count(),
    cache_hits = countIf(navigation.type == "back_forward_cache"),
    by: {app_name}

```

**Use Case:** Monitor browser cache effectiveness.

## Entry Point Analysis

First navigation per session:

```dql
fetch user.events, from:now()-24h
| filter characteristics.has_navigation == true
| filter view.sequence_number == 1
| fieldsAdd app_name = entityName(dt.rum.application.entity, type:"dt.entity.application")
| summarize
    entry_count = count(),
    by: {app_name, page.url.path, navigation.type}
| sort entry_count desc
| limit 20

```

**Use Case:** Optimize landing page experiences.

## Navigation by Device

Compare navigation patterns across devices:

```dql
fetch user.events, from:now()-24h
| filter characteristics.has_navigation == true
| fieldsAdd app_name = entityName(dt.rum.application.entity, type:"dt.entity.application")
| summarize
    nav_count = count(),
    by: {app_name, device.type, navigation.type}
| sort device.type, nav_count desc

```

**Use Case:** Tailor UX for different devices.

## Prerender Analysis

Track prerendered navigations:

```dql
fetch user.events, from:now()-24h
| filter characteristics.has_navigation == true
| filter navigation.type == "prerender"
| fieldsAdd app_name = entityName(dt.rum.application.entity, type:"dt.entity.application")
| summarize
    prerender_count = count(),
    by: {app_name, page.url.path}
| sort prerender_count desc

```

**Use Case:** Monitor speculation rules effectiveness.

## Session Navigation Depth

Count navigations per session:

```dql
fetch user.events, from:now()-24h
| filter characteristics.has_navigation == true
| fieldsAdd app_name = entityName(dt.rum.application.entity, type:"dt.entity.application")
| summarize nav_count = count(), by: {app_name, dt.rum.session.id}
| summarize
    sessions = count(),
    avg_navigations = avg(nav_count),
    p50_navigations = percentile(nav_count, 50),
    p90_navigations = percentile(nav_count, 90),
    by: {app_name}

```

**Use Case:** Measure session engagement depth.
