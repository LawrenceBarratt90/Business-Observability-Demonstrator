# Entity Lookups and Service Context

Enrich traces with entity metadata, correlate with infrastructure, and analyze performance by hardware.

## Overview

Spans reference services via entity IDs. Service names and attributes are available through Dynatrace Smartscape (Entity Model) using entity lookups. This enables enriching trace data with infrastructure context, analyzing performance by hardware, and correlating across multiple entity types.

## Service Entity Basics

### List Services

Fetch service entities:

```dql
fetch dt.entity.service | limit 100

```

### Add Service Name to Spans

Enrich spans with service names:

```dql
fetch spans
| fieldsAdd entityName(dt.entity.service)
| summarize spans=count(), by: { dt.entity.service, dt.entity.service.name }
| sort spans desc

```

## Filtering by Service

### Using Entity Selector

Filter spans for specific service (commented alternative approach):

```dql
fetch spans
// Via classicEntitySelector (alternative)
//| filter in(dt.entity.service, classicEntitySelector("type(service), entityName(\"BookStore-Ratings\")") )

// Via subquery (recommended)
| filter dt.entity.service in [
    fetch dt.entity.service
    | filter entity.name == "BookStore.Books.dev"
    | fields id
]
| filter request.is_root_span == true
| summarize { requests=count(), avg(duration) }, by: { url.path }

```

## Service Performance

### Service and Endpoint Response Times

Analyze performance by service and endpoint:

```dql
fetch spans
| filter request.is_root_span == true
| fieldsAdd entityName(dt.entity.service)
| summarize {
    requests=count(),
    avg_response_time=avg(duration)
  }, by: { dt.entity.service, dt.entity.service.name, endpoint.name }
| sort dt.entity.service.name, endpoint.name
| sort requests desc

```

## Advanced Entity Lookups

### Host, Process Group, and Service Attributes

Lookup multiple entity types with attributes:

```dql
fetch spans
| filter isNotNull(dt.entity.host) and isNotNull(dt.entity.service) and isNotNull(dt.entity.process_group)

// Add host information including hardware
| fieldsAdd entityName(dt.entity.host),
            entityAttr(dt.entity.host, "bitness"),
            entityAttr(dt.entity.host, "additionalSystemInfo")

// Flatten system info
| fieldsFlatten dt.entity.host.additionalSystemInfo

| fieldsAdd entityName(dt.entity.service)

// Add process group with detected technologies
| fieldsAdd entityName(dt.entity.process_group),
            entityAttr(dt.entity.process_group, "softwareTechnologies")

// Parse technologies into structured data
| parse toString(dt.entity.process_group.softwareTechnologies), """'[' ARRAY{'\"'
  (
    'type:' LD:type ','
    'edition:' LD:edition ','
    'version:' LD:version
  )
  ('\", ' | '\"')}{1,}:technologies"""

| limit 1

```

### Performance by Hardware

Analyze response times split by CPU type:

```dql
fetch spans
| filter request.is_root_span == true

// Add host information including hardware
| fieldsAdd entityName(dt.entity.host),
            entityAttr(dt.entity.host, "bitness"),
            entityAttr(dt.entity.host, "additionalSystemInfo")

// Extract CPU information
| fieldsAdd host.cpu = dt.entity.host.additionalSystemInfo[system.processor.model]

| filter isNotNull(host.cpu)

| summarize {
    count(),
    avg(duration)
  }, by: { dt.entity.service, endpoint.name, bitness=dt.entity.host.bitness, host.cpu }

```

## Best Practices

- **Use `entityName()`** to add entity names: `entityName(dt.entity.service)` adds `dt.entity.service.name`
- **Use `entityAttr()`** to access specific entity attributes
- **Prefer subqueries** over `classicEntitySelector()` for better performance and readability
- **Filter early** - apply entity filters before expensive operations
- **Access nested attributes** using bracket notation after `fieldsFlatten`
- **Parse complex attributes** when entity attributes contain structured text (e.g., software technologies)
