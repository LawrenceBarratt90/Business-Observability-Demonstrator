# Activity Events & User Actions

Analyze activity events that capture user action lifecycles with resource loading and mutations.

**Data Source:** `fetch user.events` with `characteristics.has_activity`

**Key Fields:**

- `activity.id` - Unique activity identifier
- `activity.complete_reason` - How activity ended: completed, timeout, interrupted
- `activity.mutation_count` - DOM changes during activity
- `activity.requests.count` - XHR/fetch requests during activity
- `activity.resource.count` - Resources loaded during activity
- `interaction.name` - Triggering interaction type

## Activity Overview

Query all activities:

```dql
fetch user.events, from:now()-24h
| filter characteristics.has_activity == true
| fieldsAdd app_name = entityName(dt.rum.application.entity, type:"dt.entity.application")
| summarize
    activity_count = count(),
    unique_sessions = countDistinct(dt.rum.session.id),
    avg_duration = avg(duration),
    by: {app_name}

```

**Use Case:** Baseline activity volume and duration.

## Activity Completion Reasons

Analyze how activities end:

```dql
fetch user.events, from:now()-24h
| filter characteristics.has_activity == true
| fieldsAdd app_name = entityName(dt.rum.application.entity, type:"dt.entity.application")
| summarize
    activity_count = count(),
    by: {app_name, activity.complete_reason}
| sort activity_count desc

```

**Use Case:** Identify interrupted or timed-out activities.

## Activity by Interaction Type

Map activities to user actions:

```dql
fetch user.events, from:now()-24h
| filter characteristics.has_activity == true
| fieldsAdd app_name = entityName(dt.rum.application.entity, type:"dt.entity.application")
| summarize
    activity_count = count(),
    avg_duration = avg(duration),
    avg_requests = avg(activity.requests.count),
    by: {app_name, interaction.name}
| sort activity_count desc

```

**Use Case:** Understand which interactions trigger most activity.

## Resource-Heavy Activities

Find activities loading many resources:

```dql
fetch user.events, from:now()-24h
| filter characteristics.has_activity == true
| filter activity.resource.count > 10
| fieldsAdd app_name = entityName(dt.rum.application.entity, type:"dt.entity.application")
| summarize
    activity_count = count(),
    avg_resources = avg(activity.resource.count),
    avg_duration = avg(duration),
    by: {app_name, ui_element.name, interaction.name}
| sort avg_resources desc
| limit 20

```

**Use Case:** Optimize resource-heavy user actions.

## Activities with Pending Requests

Find activities with incomplete requests:

```dql
fetch user.events, from:now()-24h
| filter characteristics.has_activity == true
| filter activity.requests.pending_request_count > 0
| fieldsAdd app_name = entityName(dt.rum.application.entity, type:"dt.entity.application")
| summarize
    activity_count = count(),
    avg_pending = avg(activity.requests.pending_request_count),
    by: {app_name, activity.complete_reason}
| sort avg_pending desc

```

**Use Case:** Identify activities completing before requests finish.

## DOM Mutation Analysis

Analyze DOM change patterns:

```dql
fetch user.events, from:now()-24h
| filter characteristics.has_activity == true
| filter activity.mutation_count > 0
| fieldsAdd app_name = entityName(dt.rum.application.entity, type:"dt.entity.application")
| summarize
    activity_count = count(),
    avg_mutations = avg(activity.mutation_count),
    max_mutations = max(activity.mutation_count),
    by: {app_name}

```

**Use Case:** Detect excessive DOM manipulation.

## Timed-Out Activities

Analyze activities that timed out:

```dql
fetch user.events, from:now()-24h
| filter characteristics.has_activity == true
| filter activity.complete_reason == "timeout"
| fieldsAdd app_name = entityName(dt.rum.application.entity, type:"dt.entity.application")
| summarize
    timeout_count = count(),
    avg_duration = avg(duration),
    avg_pending = avg(activity.requests.pending_request_count),
    by: {app_name, ui_element.name}
| sort timeout_count desc
| limit 20

```

**Use Case:** Fix slow activities that time out.

## Interrupted Activities

Analyze interrupted user flows:

```dql
fetch user.events, from:now()-24h
| filter characteristics.has_activity == true
| filter in(activity.complete_reason, "interrupted_by_navigation", "interrupted_by_request", "interrupted_by_api")
| fieldsAdd app_name = entityName(dt.rum.application.entity, type:"dt.entity.application")
| summarize
    interrupted_count = count(),
    by: {app_name, activity.complete_reason, interaction.name}
| sort interrupted_count desc

```

**Use Case:** Understand activity interruption patterns.

## Activity Web Vitals

Get Web Vitals captured during activities:

```dql
fetch user.events, from:now()-24h
| filter characteristics.has_activity == true
| filter isNotNull(web_vitals.largest_contentful_paint)
| fieldsAdd app_name = entityName(dt.rum.application.entity, type:"dt.entity.application")
| summarize
    activity_count = count(),
    p75_lcp = percentile(web_vitals.largest_contentful_paint, 75),
    p75_cls = percentile(web_vitals.cumulative_layout_shift, 75),
    by: {app_name}

```

**Use Case:** Correlate activities with Core Web Vitals.

## Custom Named Activities

Analyze API-reported activities:

```dql
fetch user.events, from:now()-24h
| filter characteristics.has_activity == true
| filter isNotNull(activity.custom_name)
| fieldsAdd app_name = entityName(dt.rum.application.entity, type:"dt.entity.application")
| summarize
    activity_count = count(),
    avg_duration = avg(duration),
    by: {app_name, activity.custom_name}
| sort activity_count desc

```

**Use Case:** Track custom business actions.
