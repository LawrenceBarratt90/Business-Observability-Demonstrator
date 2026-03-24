# Service Metrics Reference

Complete reference for service performance monitoring, including RED metrics, advanced service analysis, and service mesh monitoring.

---

## Part 1: Service Metrics (RED Metrics)

Monitor service performance, failures, and traffic using metrics-based timeseries queries.

### Response Time Analysis

#### Basic Response Time Monitoring

```dql
timeseries response_time = avg(dt.service.request.response_time), by: {dt.entity.service}
| fieldsAdd avg_response_ms = arrayAvg(response_time) / 1000
| sort avg_response_ms desc

```

**Key Metrics:**

- `dt.service.request.response_time`: Server-side response time (microseconds)
- `dt.service.request.count`: Total request count
- `dt.service.request.failure_count`: Failed request count

#### Response Time Percentiles

```dql
timeseries {
  p50 = percentile(dt.service.request.response_time, 50),
  p95 = percentile(dt.service.request.response_time, 95),
  p99 = percentile(dt.service.request.response_time, 99)
}, by: {dt.entity.service}
| fieldsAdd p50_ms = p50[] / 1000, p95_ms = p95[] / 1000, p99_ms = p99[] / 1000
```

#### Response Time by Endpoint

```dql
timeseries response_time = avg(dt.service.request.response_time),
  by: {dt.entity.service, endpoint.name}
| fieldsAdd avg_response_ms = arrayAvg(response_time) / 1000
| filter avg_response_ms > 500
| sort avg_response_ms desc
| limit 20

```

#### Performance Degradation Detection

```dql
timeseries recent_avg = avg(dt.service.request.response_time), by: {dt.entity.service}, from: now() - 15m
| fieldsAdd recent_avg_ms = arrayAvg(recent_avg) / 1000
| append [
  timeseries baseline_avg = avg(dt.service.request.response_time), by: {dt.entity.service}, shift: -15m
  | fieldsAdd baseline_avg_ms = arrayAvg(baseline_avg) / 1000
]
| fieldsAdd degradation_pct = (recent_avg_ms - baseline_avg_ms) * 100 / baseline_avg_ms
| filter degradation_pct > 50
| sort degradation_pct desc
```

### Failure Analysis

#### Error Rate Calculation

```dql
timeseries {
    total_requests = sum(dt.service.request.count),
    failures = sum(dt.service.request.failure_count)
  }, by: {dt.entity.service}
| fieldsAdd error_rate_pct = (failures[] * 100.0) / total_requests[]
| filter arrayAvg(error_rate_pct) > 0

```

#### Failure Spikes

```dql
timeseries failures = sum(dt.service.request.failure_count), by: {dt.entity.service}
| fieldsAdd {
    max_failures = arrayMax(failures),
    avg_failures = arrayAvg(failures),
    spike_ratio = arrayMax(failures) / arrayAvg(failures)
  }
| filter spike_ratio > 3 and arraySum(failures) > 20
| sort spike_ratio desc

```

#### Failures by HTTP Status

```dql
timeseries failures = sum(dt.service.request.failure_count),
  by: {dt.entity.service, http.response.status_code}
| fieldsAdd total_failures = arraySum(failures)
| filter total_failures > 0
| sort total_failures desc

```

### Traffic Analysis

#### Request Throughput

```dql
timeseries requests = sum(dt.service.request.count), by: {dt.entity.service}, bins: 100
| fieldsAdd requests_per_second = requests[] / 60

```

#### Peak Traffic Detection

```dql
timeseries requests = sum(dt.service.request.count), by: {dt.entity.service}
| fieldsAdd {
    max_requests = arrayMax(requests),
    avg_requests = arrayAvg(requests),
    peak_ratio = arrayMax(requests) / arrayAvg(requests)
  }
| filter peak_ratio > 2
| sort peak_ratio desc

```

#### Traffic Growth

```dql
timeseries recent_total = sum(dt.service.request.count, scalar: true), by: {dt.entity.service}, from: -30m, to: now()
| append [
  timeseries baseline_total = sum(dt.service.request.count, scalar: true), by: {dt.entity.service}, from: -60m, to: -30m
]
| fieldsAdd growth_pct = ((recent_total - baseline_total) * 100.0) / baseline_total
| filter baseline_total > 100
| sort growth_pct desc

```

### Kubernetes Context

#### Service Performance by Workload

```dql
timeseries {
    response_time = avg(dt.service.request.response_time),
    requests = sum(dt.service.request.count),
    failures = sum(dt.service.request.failure_count)
  }, by: {k8s.workload.name, k8s.namespace.name}
| fieldsAdd response_time_ms = response_time[] / 1000
```

#### Multi-Cluster Comparison

```dql
timeseries {
    avg_response = avg(dt.service.request.response_time),
    total_requests = sum(dt.service.request.count),
    failures = sum(dt.service.request.failure_count)
  }, by: {k8s.cluster.name, dt.entity.service}
| fieldsAdd avg_response_ms = avg_response[] / 1000, error_rate = failures[] * 100.0 / total_requests[]
```

---

## Part 2: Advanced Service Performance Analysis

Span-based queries for complex service analysis requiring flexible filtering and custom aggregations. For standard metric monitoring, use timeseries queries in Part 1.

### SLA Compliance Tracking

Custom SLA calculation with complex conditions:

```dql
fetch spans, from: now() - 1h
| filter request.is_root_span == true
| fieldsAdd
    service_name = entityName(dt.entity.service),
    meets_sla = if(request.is_failed == false AND duration < 3000000000, 1, else: 0)
| summarize
    total_requests = count(),
    sla_compliant = sum(meets_sla),
    by: {service_name}
| fieldsAdd sla_compliance_percent = (sla_compliant * 100.0) / total_requests
| filter sla_compliance_percent < 99.9
| sort sla_compliance_percent asc

```

**Use Case:** Custom SLA thresholds combining failure status and duration.

### Service Health Scoring

Multi-dimensional health assessment:

```dql
fetch spans, from:now()-1h
| filter request.is_root_span == true
| fieldsAdd service_name = entityName(dt.entity.service)
| summarize
    total = count(),
    errors = countIf(request.is_failed == true),
    slow = countIf(duration > 3s),
    p95_duration = percentile(duration, 95),
    by: {service_name}
| fieldsAdd
    error_rate = (errors * 100.0) / total,
    slow_rate = (slow * 100.0) / total
| fieldsAdd
    health_status = if(
        error_rate < 1.0 and slow_rate < 5.0, "healthy",
        else: if(error_rate < 5.0, "degraded", else: "critical")
    )
| sort health_status, error_rate desc

```

**Use Case:** Combined health score using multiple conditions and thresholds.

### Operation-Level Performance

Analyze performance by specific operations:

```dql
fetch spans, from: now() - 2h
| filter request.is_root_span == true
| fieldsAdd service_name = entityName(dt.entity.service)
| summarize
    request_count = count(),
    avg_duration_ms = avg(duration) / 1000000,
    p95_duration_ms = percentile(duration, 95) / 1000000,
    error_count = countIf(request.is_failed == true),
    by: {service_name, span.name}
| fieldsAdd error_rate = (error_count * 100.0) / request_count
| filter request_count > 10
| sort p95_duration_ms desc
| limit 30

```

**Use Case:** Detailed operation/endpoint analysis with span names.

### Custom Error Classification

Categorize errors with complex logic:

```dql
fetch spans, from: now() - 1h
| filter request.is_root_span == true and request.is_failed == true
| fieldsAdd
    service_name = entityName(dt.entity.service),
    error_category = if(
        http.response.status_code >= 500, "server_error",
        else: if(http.response.status_code >= 400, "client_error",
        else: "other_failure")
    )
| summarize count = count(),
  by: {service_name, error_category, http.response.status_code}
| sort count desc

```

**Use Case:** Custom error categorization beyond standard failure metrics.

### Request Context Analysis

Analyze performance with additional span attributes:

```dql
fetch spans, from: now() - 1h
| filter request.is_root_span == true
| fieldsAdd service_name = entityName(dt.entity.service)
| summarize
    request_count = count(),
    avg_duration_ms = avg(duration) / 1000000,
    p95_duration_ms = percentile(duration, 95) / 1000000,
    by: {service_name, http.request.method, http.route}
| filter request_count > 5
| sort p95_duration_ms desc
| limit 50

```

**Use Case:** Performance analysis by HTTP method and route patterns.

### Failure Pattern Detection

Identify failure patterns with span details:

```dql
fetch spans, from: now() - 2h
| filter request.is_root_span == true and request.is_failed == true
| fieldsAdd service_name = entityName(dt.entity.service)
| summarize
    failure_count = count(),
    unique_errors = countDistinctExact(error.message),
    avg_duration_ms = avg(duration) / 1000000,
    by: {service_name, span.name}
| filter failure_count > 3
| sort failure_count desc
| limit 20

```

**Use Case:** Pattern analysis requiring span-level details like error messages.

---

## Part 3: Service Mesh Metrics

Monitor service mesh ingress performance, failures, and traffic patterns.

### Mesh Response Time

#### Basic Mesh Performance

```dql
timeseries response_time = avg(dt.service.request.service_mesh.response_time), by: {dt.entity.service}
| fieldsAdd avg_response_ms = arrayAvg(response_time) / 1000
| sort avg_response_ms desc

```

**Key Metrics:**

- `dt.service.request.service_mesh.response_time`: Mesh ingress response time (microseconds)
- `dt.service.request.service_mesh.count`: Mesh request count
- `dt.service.request.service_mesh.failure_count`: Mesh failure count

#### Mesh vs Direct Overhead

```dql
timeseries {
    direct_p95 = percentile(dt.service.request.response_time, 95),
    mesh_p95 = percentile(dt.service.request.service_mesh.response_time, 95)
  }, by: {dt.entity.service}
| fieldsAdd direct_p95_ms = direct_p95[] / 1000, mesh_p95_ms = mesh_p95[] / 1000
| fieldsAdd mesh_overhead = mesh_p95_ms - direct_p95_ms
| filter arrayAvg(mesh_overhead) > 0
| sort mesh_overhead desc
```

#### Mesh Performance Degradation

```dql
timeseries recent_avg = avg(dt.service.request.service_mesh.response_time), by: {dt.entity.service}, from: now() - 15m
| fieldsAdd recent_avg_ms = arrayAvg(recent_avg) / 1000
| append [
  timeseries baseline_avg = avg(dt.service.request.service_mesh.response_time), by: {dt.entity.service}, from: now() - 30m, to: now() - 15m
  | fieldsAdd baseline_avg_ms = arrayAvg(baseline_avg) / 1000
]
| fieldsAdd degradation_pct = (recent_avg_ms - baseline_avg_ms) * 100 / baseline_avg_ms
| filter degradation_pct > 30
| sort degradation_pct desc
```

### Mesh Failures

#### Mesh Error Rate

```dql
timeseries {
    total_requests = sum(dt.service.request.service_mesh.count),
    failures = sum(dt.service.request.service_mesh.failure_count)
  }, by: {dt.entity.service}
| fieldsAdd error_rate_pct = (failures[] * 100.0) / total_requests[]
| filter arrayAvg(error_rate_pct) > 0

```

#### Mesh Failures by Status Code

```dql
timeseries {
    requests = sum(dt.service.request.service_mesh.count),
    failures = sum(dt.service.request.service_mesh.failure_count)
  }, by: {dt.entity.service, http.response.status_code}
| fieldsAdd failure_pct = (failures[] * 100.0) / requests[]

```

### Mesh Traffic

#### Mesh Request Volume

```dql
timeseries requests = sum(dt.service.request.service_mesh.count), by: {dt.entity.service}
| fieldsAdd total_requests = arraySum(requests)
| sort total_requests desc

```

#### Mesh gRPC Traffic

```dql
timeseries {
    requests = sum(dt.service.request.service_mesh.count),
    failures = sum(dt.service.request.service_mesh.failure_count)
  }, by: {dt.entity.service, rpc.grpc.status_code}
| filter isNotNull(rpc.grpc.status_code)

```

### Mesh Kubernetes Context

#### Mesh Performance by Workload

```dql
timeseries {
    response_time = avg(dt.service.request.service_mesh.response_time),
    failures = sum(dt.service.request.service_mesh.failure_count),
    total = sum(dt.service.request.service_mesh.count)
  }, by: {k8s.workload.name, k8s.namespace.name}
| fieldsAdd response_time_ms = response_time[] / 1000, error_rate = failures[] * 100.0 / total[]
```

#### Mesh Multi-Cluster Performance

```dql
timeseries {
    avg_response = avg(dt.service.request.service_mesh.response_time),
    p95_response = percentile(dt.service.request.service_mesh.response_time, 95)
  }, by: {k8s.cluster.name, dt.entity.service}
| fieldsAdd avg_response_ms = avg_response[] / 1000, p95_response_ms = p95_response[] / 1000
```
