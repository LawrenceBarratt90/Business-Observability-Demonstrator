---
name: dt-app-frontend
description: Real User Monitoring (RUM), Web Vitals, user sessions, mobile crashes, page performance, user interactions, and frontend errors. Query web and mobile application telemetry.
license: Apache-2.0
---

# Frontend Observability Skill

Monitor web and mobile applications using Real User Monitoring (RUM) with DQL queries.

## Overview

This skill helps you:
- Monitor Core Web Vitals and frontend performance
- Track user sessions, engagement, and behavior
- Analyze errors and correlate with backend traces
- Optimize mobile app startup and stability
- Diagnose performance issues with detailed timing analysis

**Data Sources:**
- **Metrics**: `timeseries` with `dt.frontend.*` (trends, alerting)
- **Events**: `fetch user.events` (individual page views, requests, clicks, errors)
- **Sessions**: `fetch user.sessions` (session-level aggregates: duration, bounce, counts)

## Quick Reference

### Common Metrics
- `dt.frontend.request.count` - Request volume
- `dt.frontend.request.duration` - Request latency (ms)
- `dt.frontend.error.count` - Error counts
- `dt.frontend.session.active.estimated_count` - Active sessions
- `dt.frontend.user.active.estimated_count` - Unique users
- `dt.frontend.web.page.largest_contentful_paint` - LCP metric
- `dt.frontend.web.page.interaction_to_next_paint` - INP metric

### Common Filters
- `dt.rum.application.entity` - Filter by application (entity ID, e.g. `APPLICATION-ABC123`)
- `dt.rum.user_type` - Exclude synthetic monitoring
- `geo.country.iso_code` - Geographic filtering
- `device.type` - Mobile, desktop, tablet
- `browser.name` - Browser filtering

### Application Name Resolution

**`entityName(dt.rum.application.entity)` does NOT work** — it fails with `INVALID_ENTITY_TYPE`. Use `lookup` instead:

```dql
fetch user.events, from: now() - 1h
| filter characteristics.has_page_summary == true
| summarize page_views = count(), by: {dt.rum.application.entity}
| lookup [fetch dt.entity.application], sourceField: dt.rum.application.entity, lookupField: id, fields: {entity.name}
| sort page_views desc
```

### Event Characteristics
- `characteristics.has_page_summary` - Page views (web)
- `characteristics.has_view_summary` - Views (mobile)
- `characteristics.has_navigation` - Navigation events
- `characteristics.has_user_interaction` - Clicks, forms, etc.
- `characteristics.has_error` - Error events
- `characteristics.has_crash` - Mobile crashes
- `characteristics.has_long_task` - Long JavaScript tasks
- `characteristics.has_csp_violation` - CSP violations

### Session Data (`user.sessions`)

`user.sessions` contains session-level aggregates produced by the session aggregation service from `user.events`. **Field names differ from `user.events`** — sessions use underscores where events use dots.

**Session identity and context:**
- `dt.rum.session.id` — Session ID (NOT `dt.rum.session_id`)
- `dt.rum.instance.id` — Instance ID
- `dt.rum.application.entities` — Array of application entity IDs
- `dt.rum.application.type` — `web` or `mobile`
- `dt.rum.user_type` — `real_user`, `synthetic`, or `robot`

**Session aggregates (underscore naming — NOT dot):**

| Field | Description | ⚠️ NOT this |
|-------|-------------|-------------|
| `navigation_count` | Number of navigations | ~~`navigation.count`~~ |
| `user_interaction_count` | Clicks, form submissions | ~~`user_interaction.count`~~ |
| `user_action_count` | User actions | ~~`user_action.count`~~ |
| `request_count` | XHR/fetch requests | ~~`request.count`~~ |
| `event_count` | Total events in session | ~~`event.count`~~ |
| `page_summary_count` | Page views (web) | ~~`page_summary.count`~~ |
| `view_summary_count` | Views (mobile/SPA) | ~~`view_summary.count`~~ |

**Error fields (dot naming — same as events):**
- `error.count`, `error.exception_count`, `error.http_4xx_count`, `error.http_5xx_count`
- `error.anr_count`, `error.csp_violation_count`, `error.has_crash`

**Session lifecycle:**
- `start_time`, `end_time`, `duration` (nanoseconds)
- `end_reason` — `timeout`, `synthetic_execution_finished`, etc.
- `characteristics.is_bounce` — Boolean bounce flag
- `characteristics.has_replay` — Session replay available

**User identity:**
- `dt.rum.user_tag` — User identifier (typically email), set via `dtrum.identifyUser()` API call in the instrumented application. **Not always populated** — only present when the application explicitly calls `identifyUser()`. Many applications (including the Dynatrace UI itself) do not set this for most sessions.
- When `dt.rum.user_tag` is empty, `client.ip` is often the only user differentiator.
- The user tag is a **session-level field** — query it from `user.sessions`, not `user.events` (where it may be empty even if the session has one).

**Client/device context:**
- `browser.name`, `browser.version`, `device.type`, `os.name`
- `geo.country.iso_code`, `client.ip`, `client.isp`

**Synthetic-only fields:**
- `dt.entity.synthetic_test`, `dt.entity.synthetic_location`, `dt.entity.synthetic_test_step`

**Time window behavior:**
- `fetch user.sessions, from: X, to: Y` only returns sessions that **started** in `[X, Y]` — NOT sessions that were merely active during that window.
- Sessions can last 8h+ (the aggregation service waits 30+ minutes of inactivity before closing a session).
- To find all sessions active during a time window, extend the lookback by at least 8 hours: e.g., to cover events from the last 24h, query `fetch user.sessions, from: now() - 32h`.
- This matters for correlation queries (e.g., matching `user.events` to `user.sessions` by session ID) — a narrow `user.sessions` window will miss long-running sessions and produce false "orphans."

**Session creation delay:**
- The session aggregation service waits for ~30+ minutes of inactivity before closing a session and writing the `user.sessions` record.
- This means **recent events (last ~1 hour) will not yet have a matching `user.sessions` entry** — this is normal, not a data gap.
- When correlating `user.events` with `user.sessions`, exclude recent data (e.g., use `to: now() - 1h`) to avoid counting in-progress sessions as orphans.

**Zombie sessions (events without a `user.sessions` record):**
- Not every `dt.rum.session.id` in `user.events` will have a corresponding `user.sessions` record. The session aggregation service intentionally skips **zombie sessions** — sessions with no real user activity (zero navigations and zero user interactions).
- Zombie sessions contain only background, machine-driven activity (e.g., automatic XHR requests, heartbeats) with no page views or clicks. Serializing them would add no value to users.
- When correlating `user.events` with `user.sessions`, expect a large number of unmatched session IDs. This is **by design**, not a data gap. Filter to sessions with activity before diagnosing orphans:
  ```dql
  fetch user.events, from: now() - 48h, to: now() - 1h
  | filter isNotNull(dt.rum.session.id)
  | summarize navs = countIf(characteristics.has_navigation == true),
      interactions = countIf(characteristics.has_user_interaction == true),
      by: {dt.rum.session.id}
  | filter navs > 0 or interactions > 0
  ```

**Example — bounce rate and session quality:**
```dql
fetch user.sessions, from: now() - 24h
| filter dt.rum.user_type == "real_user"
| summarize
    total_sessions = count(),
    bounces = countIf(characteristics.is_bounce == true),
    zero_activity = countIf(toLong(navigation_count) == 0 and toLong(user_interaction_count) == 0),
    avg_duration_s = avg(toLong(duration)) / 1000000000
| fieldsAdd bounce_rate_pct = round((bounces * 100.0) / total_sessions, decimals: 1)
```

### Performance Thresholds
- **LCP**: Good <2.5s | Poor >4.0s
- **INP**: Good <200ms | Poor >500ms
- **CLS**: Good <0.1 | Poor >0.25
- **Cold Start**: Good <3s | Poor >5s
- **Long Tasks**: >50ms problematic, >250ms severe

## Core Workflows

### 1. Web Performance Monitoring
Track Core Web Vitals, page performance, and request latency for SEO and UX optimization.

**Primary Files:**
- `references/web-vitals.md` - Core Web Vitals (LCP, INP, CLS)
- `references/performance-analysis.md` - Request and page performance

**Common Queries:**
- All Core Web Vitals summary
- Web Vitals by page/device
- Request duration SLA monitoring
- Page load performance trends

### 2. User Session & Behavior Analysis
Understand user engagement, navigation patterns, and session characteristics. Analyze button clicks, form interactions, and user journeys.

**Data source choice:**
- Use `fetch user.sessions` for session-level analysis (bounce rate, session duration, session counts)
- Use `fetch user.events` for event-level detail (individual clicks, navigation timing, specific pages)

**Primary Files:**
- `references/user-sessions.md` - Session tracking and user analytics
- `references/performance-analysis.md` - Navigation and engagement patterns

**Common Queries:**
- Active sessions by application
- Sessions by custom property
- Bounce rate analysis (use `user.sessions` with `characteristics.is_bounce`)
- Session quality (zero-activity sessions via `navigation_count`, `user_interaction_count`)
- Click analysis on UI elements (use `user.events` with `characteristics.has_user_interaction`)
- External referrers (traffic sources)

### 3. Error Tracking & Debugging
Monitor error rates, analyze exceptions, and correlate frontend issues with backend.

**Primary Files:**
- `references/error-tracking.md` - Error analysis and debugging
- `references/performance-analysis.md` - Trace correlation

**Common Queries:**
- Error rate monitoring
- JavaScript exceptions by type
- Failed requests with backend traces
- Request timing breakdown

### 4. Mobile Application Monitoring
Track mobile app performance, startup times, and crash analytics for iOS and Android. Analyze app version performance and device-specific issues.

**Primary Files:**
- `references/mobile-monitoring.md` - App starts, crashes, and mobile-specific metrics

**Common Queries:**
- Cold start performance by app version (iOS, Android)
- Warm start and hot start metrics
- Crash rate by device model and OS version
- ANR events (Android)
- Native crash signals
- App version comparison

### 5. Advanced Performance Optimization
Deep performance diagnostics including JavaScript profiling, main thread blocking, UI jank analysis, and geographic performance.

**Primary Files:**
- `references/performance-analysis.md` - Advanced diagnostics and long tasks

**Common Queries:**
- Long JavaScript tasks blocking main thread
- UI jank and rendering delays
- Tasks >50ms impacting responsiveness
- Third-party long tasks (iframes)
- Single-page app performance issues
- Geographic performance distribution
- Performance degradation detection

## Best Practices

1. **Use metrics for trends, events for debugging**
   - Metrics: Timeseries dashboards, alerting, capacity planning
   - Events: Root cause analysis, detailed diagnostics

2. **Filter by application in multi-app environments**
   - Always use `dt.rum.application.entity` for clarity

3. **Match interval to time range**
   - 5m intervals for hours, 1h for days, 1d for weeks

4. **Exclude synthetic traffic when analyzing real users**
   - Filter `dt.rum.user_type` to focus on genuine behavior

5. **Combine metrics with events for complete insights**
   - Start with metric trends, drill into events for details

6. **Extend `user.sessions` time window for correlation queries**
   - `user.sessions` only returns sessions that **started** in the query window
   - Sessions can last 8h+, so extend lookback by at least 8h when joining with `user.events`

## Troubleshooting

### Handling Zero Results

When queries return no data, follow this diagnostic workflow:

1. **Validate Timeframe**
   - Check if timeframe is appropriate for the data type
   - RUM data may have delay (1-2 minutes for recent events)
   - Verify timeframe syntax: `now()-1h to now()` or similar
   - Try expanding timeframe: `now()-24h` for initial exploration

2. **Verify Application Configuration**
   - Confirm application is instrumented and sending RUM data
   - Check `dt.rum.application.entity` filter is correct
   - Test without application filter to see if any RUM data exists
   - Verify application name/ID matches user's environment

3. **Check Data Availability**
   - Run basic query: `fetch user.events | limit 1`
   - If no events exist, RUM may not be configured
   - Check if timeframe predates application deployment
   - Verify user has access to the environment

4. **Review Query Syntax**
   - Validate filters aren't too restrictive
   - Check for typos in field names or metric names
   - Test query incrementally: start simple, add filters gradually
   - Verify characteristics filters match event types

**When to Ask User for Clarification:**
- No RUM data exists in environment → "Is RUM configured for this application?"
- Application name ambiguous → "Which application entity ID should I use?"
- Timeframe unclear → "What time period should I analyze?"
- Expected data missing → "Has this application sent data recently?"

### Handling Anomalous Results

When query results seem unexpected or suspicious:

**Unexpected High Values:**
- **Metric spikes**: Verify interval aggregation (avg vs. max vs. sum)
- **Session counts**: Check for bot traffic or synthetic monitoring
- **Error rates**: Confirm error definition matches expectations
- **Performance degradation**: Look for deployment or infrastructure changes

**Unexpected Low Values:**
- **Missing sessions**: Verify `dt.rum.user_type` filter isn't excluding real users
- **Low request counts**: Check if application filter is too narrow
- **Few errors**: Confirm error characteristics filter is correct
- **Missing mobile data**: Verify platform-specific fields exist

**Inconsistent Data:**
- **Metrics vs. Events mismatch**: Different aggregation methods are expected
- **Geographic anomalies**: Check timezone assumptions
- **Device distribution skew**: May reflect actual user base
- **Version mismatches**: Verify app version filtering logic

### Decision Tree: Ask vs. Investigate

```
Query returns unexpected results
│
├─ Is this a zero-result scenario?
│  ├─ YES → Follow "Handling Zero Results" workflow
│  └─ NO → Continue
│
├─ Can I validate the result independently?
│  ├─ YES → Run validation query
│  │        ├─ Validation confirms result → Report findings
│  │        └─ Validation contradicts → Investigate further
│  └─ NO → Continue
│
├─ Is the anomaly clearly explained by data?
│  ├─ YES → Report with explanation
│  └─ NO → Continue
│
├─ Do I need domain knowledge to interpret?
│  ├─ YES → Ask user for context
│  │        Example: "The error rate is 15%. Is this expected for your application?"
│  └─ NO → Continue
│
└─ Is the issue ambiguous or requires clarification?
   ├─ YES → Ask specific question with data context
   │        Example: "I see two applications named 'web-app'. Which entity ID should I use?"
   └─ NO → Investigate and report findings with caveats
```

### Common Investigation Steps

**For Performance Issues:**
1. Compare to baseline: Query same metric for previous week
2. Segment by dimension: Break down by device, browser, geography
3. Check for outliers: Use percentiles (p50, p95, p99) vs. averages
4. Correlate with deployments: Filter by app version or time windows

**For Data Availability Issues:**
1. Start broad: Query all RUM data without filters
2. Add filters incrementally: Isolate which filter eliminates data
3. Check related metrics: If events missing, try timeseries
4. Validate entity relationships: Confirm application-to-service links

**For Unexpected Patterns:**
1. Expand timeframe: Look for historical context
2. Cross-reference data sources: Compare events and metrics
3. Check sampling: Verify no sampling is affecting results
4. Consider external factors: Holidays, outages, traffic changes

### Red Flags: When to Stop and Ask

**Always ask the user when:**
- ❌ No RUM data exists anywhere in the environment
- ❌ Multiple applications match the user's description
- ❌ Results contradict user's stated expectations explicitly
- ❌ Data suggests monitoring is misconfigured
- ❌ Query requires business context (e.g., "acceptable error rate")
- ❌ Timeframe is ambiguous and affects interpretation significantly

**Example clarifying questions:**
- "I found two applications named 'checkout'. Which one: `APPLICATION-ABC123` or `APPLICATION-DEF456`?"
- "The query returns 0 results for the past hour. Should I expand the timeframe, or do you expect real-time data?"
- "The average LCP is 8 seconds, which exceeds the 4-second threshold. Is this application known to have performance issues?"
- "I see only synthetic traffic. Should I include `dt.rum.user_type='REAL_USER'` to focus on real users?"

## When to Use This Skill

**Use frontend-observability skill when:**
- Monitoring web or mobile application performance
- Analyzing Core Web Vitals for SEO
- Tracking user sessions, engagement, or behavior
- Analyzing click events and button interactions
- Debugging frontend errors or slow requests
- Correlating frontend issues with backend traces
- Optimizing mobile app startup or crash rates (iOS, Android)
- Analyzing app version performance
- Diagnosing UI jank and main thread blocking
- Analyzing security compliance (CSP violations)
- Profiling JavaScript performance (long tasks)

**Do NOT use for:**
- Backend service monitoring (use services skill)
- Infrastructure metrics (use infrastructure skill)
- Log analysis (use logs skill)
- Business process monitoring (use business-events skill)

## Progressive Disclosure

### Always Available
- **FrontendBasics.md** - RUM fundamentals and quick reference

### Loaded by Workflow
- **Web Performance**: web-vitals.md, performance-analysis.md
- **User Behavior**: user-sessions.md, performance-analysis.md
- **Error Analysis**: error-tracking.md, performance-analysis.md
- **Mobile Apps**: mobile-monitoring.md

### Load on Explicit Request
- Advanced diagnostics (long tasks, activity events)
- Security compliance (CSP violations, visibility tracking)
- Specialized mobile features (platform-specific phases)

## Reference Files

### Core Reference Documents
- `references/web-vitals.md` - Core Web Vitals monitoring
- `references/user-sessions.md` - Session and user analytics
- `references/error-tracking.md` - Error analysis and debugging
- `references/mobile-monitoring.md` - Mobile app performance and crashes
- `references/performance-analysis.md` - Advanced performance diagnostics

### Source Files (Full Documentation)
All 20 original documentation files are preserved in the skill's asset directory for complete reference.
