# Frontend Error Analysis

Comprehensive error analysis using both event-based queries (detailed diagnostics) and metric-based queries (trends and alerting).

**Data Sources:**

- **Metric**: `dt.frontend.error.count` - Aggregated error counts for trends and alerting
- **Event**: `fetch user.events` with `error.type` - Detailed error diagnostics with messages

## Metric-Based: Error Rate Monitoring

Track error rates across applications:

```dql
timeseries error_count = sum(dt.frontend.error.count, scalar: true),
          request_count = sum(dt.frontend.request.count, scalar: true),
          by: {dt.rum.application.entity},
          from: now() - 2h
| lookup [fetch dt.entity.application], sourceField:dt.rum.application.entity, lookupField:id, fields:{entity.name}
| fieldsAdd
    app_name = entity.name,
    error_rate_percent = (error_count / request_count) * 100
| filter error_rate_percent > 1
| sort error_rate_percent desc

```

**Use Case:** Monitor application error rates and create alerts for threshold violations.

## Event-Based: JavaScript Exceptions

Analyze specific JavaScript errors:

```dql
fetch user.events, from:now() - 24h
| filter error.type == "exception"
| fieldsAdd app_name = entityName(dt.rum.application.entity, type:"dt.entity.application")
| summarize
    exception_count = count(),
    affected_users = countDistinct(dt.rum.instance.id, precision: 9),
    affected_sessions = countDistinct(dt.rum.session.id),
    by: {app_name, exception.message, exception.type}
| sort exception_count desc
| limit 20

```

**Use Case:** Debug specific JavaScript errors with detailed exception messages.

## Event-Based: Request Errors

Analyze failed API requests:

```dql
fetch user.events, from:now() - 24h
| filter error.type == "request"
| fieldsAdd app_name = entityName(dt.rum.application.entity, type:"dt.entity.application")
| summarize
    error_count = count(),
    affected_sessions = countDistinct(dt.rum.session.id),
    by: {app_name, error.display_name}
| sort error_count desc

```

**Use Case:** Identify failing backend API calls from frontend applications.

## Metric-Based: Error Spike Detection

Detect sudden increases in error rates:

```dql
timeseries {
    error_count = sum(dt.frontend.error.count),
    request_count = sum(dt.frontend.request.count)
},
  by: {dt.rum.application.entity},
  from: now() - 24h,
  interval: 1h
| lookup [fetch dt.entity.application], sourceField:dt.rum.application.entity, lookupField:id, fields:{entity.name}
| fieldsAdd
    error_rate_percent = (error_count[] / request_count[]) * 100

| join [
  timeseries {
    prev_error_count = sum(dt.frontend.error.count),
    prev_request_count = sum(dt.frontend.request.count)
  },
    by: {dt.rum.application.entity},
    from: now() - 24h,
    interval: 1h,
    shift: 1h
  | lookup [fetch dt.entity.application], sourceField:dt.rum.application.entity, lookupField:id, fields:{entity.name}
  | fieldsAdd prev_error_rate = (prev_error_count[] / prev_request_count[]) * 100
], on: { dt.rum.application.entity }, fields: { prev_error_rate }

| fieldsAdd
    app_name = entity.name,
    error_rate_change = coalesce((error_rate_percent[] - prev_error_rate[]) / (prev_error_rate[]) * 100, 0)
| filter arrayAvg(error_rate_change) > 50
| sort error_rate_change desc


```

**Use Case:** Alert on error spikes indicating deployment issues.

## Metric-Based: Browser-Specific Errors

Identify browser compatibility issues:

```dql
timeseries error_count = sum(dt.frontend.error.count, scalar: true),
          request_count = sum(dt.frontend.request.count, scalar: true),
          by: {dt.rum.application.entity, browser.name},
          from: now() - 4h
| lookup [fetch dt.entity.application], sourceField:dt.rum.application.entity, lookupField:id, fields:{entity.name}
| fieldsAdd
    app_name = entity.name,
    error_rate_percent = (error_count / request_count) * 100
| filter request_count > 100
| sort error_rate_percent desc

```

**Use Case:** Prioritize browser-specific bug fixes based on error rates.

## Event-Based: Errors by Device Type

Analyze errors by device:

```dql
fetch user.events, from:now() - 24h
| filter error.type == "exception"
| summarize
    error_count = count(),
    affected_users = countDistinct(dt.rum.instance.id, precision: 9),
    by: {device.type}
| sort error_count desc

```

**Use Case:** Optimize error handling for specific device types.

## Metric-Based: Geographic Error Patterns

Identify region-specific error issues:

```dql
timeseries error_count = sum(dt.frontend.error.count, scalar: true),
          request_count = sum(dt.frontend.request.count, scalar: true),
          by: {dt.rum.application.entity, geo.country.iso_code},
          from: now() - 6h
| lookup [fetch dt.entity.application], sourceField:dt.rum.application.entity, lookupField:id, fields:{entity.name}
| fieldsAdd
    app_name = entity.name,
    error_rate_percent = (error_count / request_count) * 100
| filter request_count > 50 and error_rate_percent > 2
| sort error_rate_percent desc

```

**Use Case:** Detect regional infrastructure or connectivity issues.
