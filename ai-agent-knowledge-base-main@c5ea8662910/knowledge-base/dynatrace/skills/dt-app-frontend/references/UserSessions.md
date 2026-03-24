# Frontend User and Session Tracking

Track active user sessions, unique users, and basic activity patterns using aggregated RUM metrics.

**Key Metrics:**

- `dt.frontend.session.active.estimated_count` - Active user sessions
- `dt.frontend.user.active.estimated_count` - Unique active users

**Alerting Thresholds:**

- Critical: Active sessions dropping > 50%
- Track user growth trends for capacity planning

## Active User Session Monitoring

Track active user sessions by application:

```dql
timeseries active_sessions = countDistinct(dt.frontend.session.active.estimated_count),
          by: {dt.rum.application.entity},
          from: now() - 4h
| lookup [fetch dt.entity.application], sourceField:dt.rum.application.entity, lookupField:id, fields:{entity.name}
| fieldsAdd app_name = entity.name
| sort active_sessions desc

```

**Use Case:** Monitor real-time user engagement and capacity planning.

## Unique Active User Tracking

Monitor unique active users:

```dql
timeseries unique_users = countDistinct(dt.frontend.user.active.estimated_count),
          active_sessions = countDistinct(dt.frontend.session.active.estimated_count),
          by: {dt.rum.application.entity},
          from: now() - 2h
| lookup [fetch dt.entity.application], sourceField:dt.rum.application.entity, lookupField:id, fields:{entity.name}
| fieldsAdd
    app_name = entity.name,
    sessions_per_user = active_sessions / unique_users
| sort unique_users desc

```

**Use Case:** Understand user engagement patterns and identify power users.

## Geographic User Distribution

Analyze user distribution across regions:

```dql
timeseries unique_users = countDistinct(dt.frontend.user.active.estimated_count),
          active_sessions = countDistinct(dt.frontend.session.active.estimated_count),
          by: {dt.rum.application.entity, geo.country.iso_code},
          from: now() - 6h
| lookup [fetch dt.entity.application], sourceField:dt.rum.application.entity, lookupField:id, fields:{entity.name}
| fieldsAdd
    app_name = entity.name,
    avg_sessions_per_user = active_sessions / unique_users
| filter unique_users > 5
| sort unique_users desc

```

**Use Case:** Identify key geographic markets and plan regional infrastructure investments.

## Device Type Usage Patterns

Compare user activity across device types:

```dql
timeseries unique_users = countDistinct(dt.frontend.user.active.estimated_count),
          active_sessions = countDistinct(dt.frontend.session.active.estimated_count),
          by: {dt.rum.application.entity, device.type},
          from: now() - 4h
| lookup [fetch dt.entity.application], sourceField:dt.rum.application.entity, lookupField:id, fields:{entity.name}
| fieldsAdd
    app_name = entity.name,
    session_ratio = active_sessions / unique_users
| sort device.type, unique_users desc

```

**Use Case:** Optimize mobile-first or desktop-first strategies based on device usage.

## Browser Adoption Tracking

Track browser distribution among active users:

```dql
timeseries unique_users = countDistinct(dt.frontend.user.active.estimated_count),
          active_sessions = countDistinct(dt.frontend.session.active.estimated_count),
          by: {dt.rum.application.entity, browser.name},
          from: now() - 24h,
          interval: 1h
| lookup [fetch dt.entity.application], sourceField:dt.rum.application.entity, lookupField:id, fields:{entity.name}
| fieldsAdd app_name = entity.name
| filter unique_users > 1
| sort browser.name, timeframe desc

```

**Use Case:** Prioritize browser compatibility testing based on actual user distribution.

## Operating System User Base

Analyze user distribution by operating system:

```dql
timeseries unique_users = countDistinct(dt.frontend.user.active.estimated_count),
          active_sessions = countDistinct(dt.frontend.session.active.estimated_count),
          by: {dt.rum.application.entity, os.name},
          from: now() - 12h
| lookup [fetch dt.entity.application], sourceField:dt.rum.application.entity, lookupField:id, fields:{entity.name}
| fieldsAdd
    app_name = entity.name,
    sessions_per_user = active_sessions / unique_users
| filter unique_users > 2
| sort unique_users desc

```

**Use Case:** Plan OS-specific features or optimizations based on platform distribution.

## App Version User Distribution

Track active users across application versions:

```dql
timeseries unique_users = countDistinct(dt.frontend.user.active.estimated_count),
          active_sessions = countDistinct(dt.frontend.session.active.estimated_count),
          by: {dt.rum.application.entity, app.short_version},
          from: now() - 24h
| lookup [fetch dt.entity.application], sourceField:dt.rum.application.entity, lookupField:id, fields:{entity.name}
| fieldsAdd
    app_name = entity.name,
    version = app.short_version
| filter unique_users > 1
| sort app.short_version desc, unique_users desc

```

**Use Case:** Monitor version adoption rates and plan deprecation strategies.
