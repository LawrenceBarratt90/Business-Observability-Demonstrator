# Visibility Changes & Tab Activity

Monitor when users switch browser tabs or apps to understand engagement patterns.

**Data Source:** `fetch user.events` with `characteristics.has_visibility_change`

**Key Fields:**

- `visibility.state` - Current state: foreground, background, prerender, unknown
- `duration` - Time in the visibility state

## Visibility State Distribution

Analyze visibility patterns:

```dql
fetch user.events, from:now() - 24h
| filter characteristics.has_visibility_change == true
| fieldsAdd app_name = entityName(dt.rum.application.entity, type:"dt.entity.application")
| summarize
    change_count = count(),
    unique_sessions = countDistinct(dt.rum.session.id),
    by: {app_name, visibility.state}
| sort change_count desc

```

**Use Case:** Understand foreground vs background activity.

## Tab Switch Frequency

Count visibility changes per session:

```dql
fetch user.events, from:now() - 24h
| filter characteristics.has_visibility_change == true
| fieldsAdd app_name = entityName(dt.rum.application.entity, type:"dt.entity.application")
| summarize change_count = count(), by: {app_name, dt.rum.session.id}
| summarize
    sessions = count(),
    avg_switches = avg(change_count),
    p50_switches = percentile(change_count, 50),
    p90_switches = percentile(change_count, 90),
    by: {app_name}

```

**Use Case:** Measure user attention patterns.

## Time in Background

Calculate background duration:

```dql
fetch user.events, from:now() - 24h
| filter characteristics.has_visibility_change == true
| filter visibility.state == "background"
| fieldsAdd app_name = entityName(dt.rum.application.entity, type:"dt.entity.application")
| summarize
    background_events = count(),
    total_background_time = sum(duration),
    avg_background_duration = avg(duration),
    by: {app_name}

```

**Use Case:** Understand how long users leave tabs inactive.

## Visibility by Page

Analyze which pages users leave:

```dql
fetch user.events, from:now() - 24h
| filter characteristics.has_visibility_change == true
| filter visibility.state == "background"
| fieldsAdd app_name = entityName(dt.rum.application.entity, type:"dt.entity.application")
| summarize
    background_count = count(),
    avg_background_time = avg(duration),
    by: {app_name, page.url.path}
| sort background_count desc
| limit 20

```

**Use Case:** Identify pages with engagement issues.

## Prerender Activity

Track prerendered pages:

```dql
fetch user.events, from:now() - 24h
| filter characteristics.has_visibility_change == true
| filter visibility.state == "prerender"
| fieldsAdd app_name = entityName(dt.rum.application.entity, type:"dt.entity.application")
| summarize
    prerender_count = count(),
    unique_sessions = countDistinct(dt.rum.session.id),
    by: {app_name}

```

**Use Case:** Monitor speculation rules effectiveness.

## Visibility Patterns Over Time

Track engagement trends:

```dql
fetch user.events, from:now() - 7d
| filter characteristics.has_visibility_change == true
| fieldsAdd app_name = entityName(dt.rum.application.entity, type:"dt.entity.application")
| summarize
    foreground = countIf(visibility.state == "foreground"),
    background = countIf(visibility.state == "background"),
    by: {app_name, time_bucket = bin(start_time, 1h)}
| sort time_bucket asc

```

**Use Case:** Correlate engagement with time of day.

## Session Engagement Quality

Classify session engagement:

```dql
fetch user.events, from:now() - 24h
| filter characteristics.has_visibility_change == true
| fieldsAdd app_name = entityName(dt.rum.application.entity, type:"dt.entity.application")
| summarize
    foreground_count = countIf(visibility.state == "foreground"),
    background_count = countIf(visibility.state == "background"),
    by: {app_name, dt.rum.session.id}
| fieldsAdd engagement_ratio = foreground_count / (foreground_count + background_count + 1.0)
| summarize
    high_engagement = countIf(engagement_ratio > 0.7),
    medium_engagement = countIf(engagement_ratio >= 0.3 and engagement_ratio <= 0.7),
    low_engagement = countIf(engagement_ratio < 0.3),
    by: {app_name}

```

**Use Case:** Segment users by attention level.

## Device Type Comparison

Compare visibility patterns across devices:

```dql
fetch user.events, from:now() - 24h
| filter characteristics.has_visibility_change == true
| fieldsAdd app_name = entityName(dt.rum.application.entity, type:"dt.entity.application")
| summarize
    visibility_changes = count(),
    background_count = countIf(visibility.state == "background"),
    by: {app_name, device.type}
| fieldsAdd background_ratio = background_count / visibility_changes

```

**Use Case:** Compare mobile vs desktop engagement.

## Unknown Visibility States

Monitor edge cases:

```dql
fetch user.events, from:now() - 24h
| filter characteristics.has_visibility_change == true
| filter visibility.state == "unknown"
| fieldsAdd app_name = entityName(dt.rum.application.entity, type:"dt.entity.application")
| summarize
    unknown_count = count(),
    by: {app_name, browser.name, browser.version}

```

**Use Case:** Identify browser compatibility issues.
