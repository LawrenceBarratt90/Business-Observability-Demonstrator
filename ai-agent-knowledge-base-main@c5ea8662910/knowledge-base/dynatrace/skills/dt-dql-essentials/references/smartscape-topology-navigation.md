# Smartscape Topology Navigation

Navigate entity relationships using `traverse`, `references`, `smartscapeNodes` and `smartscapeEdges`.

## Table of Contents

- [Method Selection](#method-selection)
- [Node Types](#node-types)
- [Relationship Types](#relationship-types)
- [Traverse Syntax](#traverse-syntax)
- [Task: Multi-Hop Traversal](#task-multi-hop-traversal)
- [Task: Quick Relationship Lookup](#task-quick-relationship-lookup)
- [Task: Discover Edge Types](#task-discover-edge-types)
- [Task: Debug Empty Traversal Results](#task-debug-empty-traversal-results)
- [Common Patterns](#common-patterns)
- [Guidelines](#guidelines)

## Method Selection

| Task                            | Method            | Query Pattern                                                            |
| ------------------------------- | ----------------- | ------------------------------------------------------------------------ |
| Entity lookup / traversal start | `smartscapeNodes` | `smartscapeNodes "<TYPE>"` → `filter` / `traverse`                       |
| Discover node types             | `smartscapeNodes` | `smartscapeNodes "*"` → `dedup type`                                     |
| Discover edge types per node    | `smartscapeEdges` | `smartscapeEdges "*"` → `filter source_type` → `dedup type, target_type` |
| Count connections               | `references`      | `fieldsAdd references[...]` → `arraySize()`                              |
| Single hop lookup               | `references`      | `fieldsAdd references[...]` → `expand`                                   |
| Multi-hop walk                  | `traverse`        | Chain multiple `traverse` commands                                       |
| Discover / verify edge types    | `smartscapeEdges` | Query before traverse                                                    |
| Empty results debug             | `smartscapeEdges` | Verify edge types exist                                                  |

**CRITICAL:** Wrong edge types return empty results (no error). Always validate for unfamiliar entities.

______________________________________________________________________

## Node Types

Node types are uppercase strings (e.g. `"HOST"`, `"SERVICE"`, `"K8S_POD"`). Entity IDs follow the pattern `<TYPE>-<HEX>` (e.g. `HOST-ABC123`).

- Use wildcard `*` to select all types of `smartscapeNodes`.
- AWS-related node types support prefix wildcard `AWS_*`, only selecting node types that are AWS resources.

**Discover all node types in the environment:**

```dql
smartscapeNodes "*"
| dedup type
| fields type
```

**CRITICAL:** Wrong node types return empty results (no error). Always validate for unfamiliar entities.

## Relationship/Edge Types

The first argument to `smartscapeEdges` is the edge type name (e.g., `"calls"`, `"runs_on"`) or `"*"` for all edge types — unlike `smartscapeNodes` where the argument is the node type. An edge type describes a type of relationship or dependency between two `smartscapeNodes`.

| Edge Type        | Description                                                       | Opposite       | Examples                                                                              |
| ---------------- | ----------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------- |
| `balanced_by`    | Load balancer relationship                                        | `balances`     |                                                                                       |
| `balances`       | Target balances source                                            | `balanced_by`  |                                                                                       |
| `belongs_to`     | Many-to-many without existential dependency (UML aggregation)     | `contains`     | SERVICE → K8S_CLUSTER, K8S_POD → K8S_NAMESPACE                                        |
| `calls`          | Horizontal communication between entities, no structural relation | —              | SERVICE → SERVICE, SERVICE → DATABASE                                                 |
| `contains`       | Parent contains children                                          | `belongs_to`   |                                                                                       |
| `instance_of`    | Instance-of-template relationship                                 | `instantiates` |                                                                                       |
| `is_attached_to` | Exclusively attached (1-to-many)                                  | —              | AWS_EBS_VOLUME → AWS_EC2_INSTANCE, AZURE_NETWORK_INTERFACE → AZURE_VIRTUAL_SUBNETWORK |
| `is_part_of`     | Composition (UML); child cannot exist without parent              | —              | AWS_EC2_INSTANCE → AWS_AUTOSCALING_GROUP, K8S_POD → K8S_DEPLOYMENT                    |
| `routes_to`      | Network routing relationship                                      | —              | ROUTE_TABLE → NAT_GATEWAY, VPC_PEERING → VPC                                          |
| `runs_on`        | Vertical "runs on" association, no composition implied            | —              | SERVICE → K8S_POD, CONTAINER → HOST                                                   |
| `uses`           | Loose usage dependency (opposite direction of `is_attached_to`)   | —              | K8S_POD → K8S_CONFIGMAP, ASG → LAUNCH_TEMPLATE                                        |

**Get an overview of all Smartscape edges for all node types:**

Use `*` as wildcard to select all `smartscapeEdges`.

```dql
smartscapeEdges "*"
| summarize count(), by:{ source_type, type, target_type }
```

**List all edge types for a given node type:**

```dql
smartscapeEdges "*"
| filter source_type == "HOST"
| fields type, target_type
| dedup type, target_type
```

______________________________________________________________________

## Traverse Syntax

```dql
smartscapeNodes "<SOURCE_TYPE>"
| traverse edgeTypes: {<EDGE_TYPE>}, targetTypes: {<TARGET_TYPE>}, direction: <forward|backward>
```

| Parameter     | Values                                                             | Usage                                             |
| ------------- | ------------------------------------------------------------------ | ------------------------------------------------- |
| `edgeTypes`   | `{specific_type}` or `{"*"}`                                       | Relationship type to follow                       |
| `targetTypes` | `{ENTITY_TYPE}` or `{"*"}` or `{"AWS_*"}` prefix for AWS resources | Target entity type                                |
| `direction`   | `forward` or `backward`                                            | forward = source→target, backward = source←target |
| `fieldsKeep`  | `{field1, field2}`                                                 | Preserve fields across hops                       |

Use the `dt.traverse.history` array of records to access the history of a traversal. For example:

- `dt.traverse.history[1]` returns the edge (`id`, `edge_type`, `direction`) of the first hop in a potential sequence of hops,
- `dt.traverse.history[-1][\`id\`\]\` the id of the target smartscape node of the last edge,
- `dt.traverse.history[-2][\`edge_type\`\]\` the edge type of the last but one edge.

### Direction Patterns

| Pattern                    | Direction         | Use Case                                               |
| -------------------------- | ----------------- | ------------------------------------------------------ |
| Instance → Security Groups | `forward`         | What does this use?                                    |
| Security Group ← Instances | `backward`        | What uses this?                                        |
| Instance → Subnet → VPC    | `forward` (chain) | Follow dependencies                                    |
| VPC ← Resources            | `backward`        | Find all in VPC                                        |
| Service → Service          | `forward`         | Find horizontal Service-to-Service "calls" connections |

______________________________________________________________________

## Task: Multi-Hop Traversal

**Pattern:** Chain traverse commands for multiple hops

```dql
smartscapeNodes "AWS_EC2_INSTANCE"
| filter aws.resource.id == "i-ABC123"
| traverse edgeTypes: {is_attached_to}, targetTypes: {AWS_EC2_SUBNET}, direction: forward
| traverse edgeTypes: {is_attached_to}, targetTypes: {AWS_EC2_VPC}, direction: forward
| fields vpc_id = id, vpc_name = name
```

**Preserve source fields:**
Use `fieldsKeep` to preserve fields from the origin of the traverse.

```dql
smartscapeNodes "AWS_EC2_INSTANCE"
| traverse edgeTypes: {is_attached_to}, targetTypes: {AWS_EC2_SUBNET}, direction: forward, fieldsKeep:{lifetime}
| fields id, ec2_lifetime=lifetime
```

**Access history (previous hops):**

```dql
smartscapeNodes "AWS_ELASTICLOADBALANCINGV2_LOADBALANCER"
| traverse edgeTypes: {balanced_by}, targetTypes: {AWS_ELASTICLOADBALANCINGV2_TARGETGROUP}, direction: backward
| traverse edgeTypes: {balances}, targetTypes: {AWS_EC2_INSTANCE}, direction: forward
| fields dt.traverse.history[-1], dt.traverse.history[-2]
```

______________________________________________________________________

## Task: Quick Relationship Lookup

The `references` attribute cannot be used for `smartscapeNodes` of type `SERVICE`. Use alternatives laid out below in this section instead.

**Method:** `references` field (no traversal overhead)

**Discover structure:**

```dql
smartscapeNodes "K8S_POD" | limit 1 | fieldsAdd references
```

**Extract specific relationships:**

```dql
smartscapeNodes "HOST"
| fieldsAdd references
| fields 
    id,
    vm = references[`runs_on.aws_ec2_instance`]
```

**Expand to rows:**

```dql
smartscapeNodes "AWS_EC2_INSTANCE"
| fieldsAdd sg_ids = references[`uses.aws_ec2_securitygroup`]
| expand sg_ids
```

**Count relationships:**

```dql
smartscapeNodes "AWS_EC2_INSTANCE"
| fieldsAdd sg_count = arraySize(references[`uses.aws_ec2_securitygroup`])
| summarize avg_sgs = avg(sg_count)
```

**Syntax:** Use backticks for keys with dots: `references[\`edge.type\`\]\`

______________________________________________________________________

## Task: Discover Edge Types

**Find outgoing edges (FROM entity):**

```dql
smartscapeEdges "calls"
| filter source_id == toSmartscapeId("SERVICE-XYZ")
| fields type, target_type
```

**Find incoming edges (TO entity):**

```dql
smartscapeEdges "calls"
| filter target_id == toSmartscapeId("SERVICE-XYZ")
| fields type, source_type
```

______________________________________________________________________

## Task: Debug Empty Traversal Results

| Issue           | Check             | Solution                                               |
| --------------- | ----------------- | ------------------------------------------------------ |
| Empty results   | Edge type exists? | Query `smartscapeEdges` first                          |
| Wrong direction | Try opposite      | Switch `forward` ↔ `backward`                          |
| Typo            | Spelling          | Check reference markdowns to understand field spelling |
| Wrong target    | Entity type       | Verify with `smartscapeNodes`                          |

______________________________________________________________________

## Common Patterns

### Process → Container → K8S Pod (Process to Kubernetes Pod)

```dql
smartscapeNodes "PROCESS"
| filter id == toSmartscapeId("PROCESS-XYZ")
| traverse edgeTypes: {runs_on}, targetTypes: {CONTAINER}, direction: forward
| traverse edgeTypes: {is_part_of}, targetTypes: {K8S_POD}, direction: forward
```

### Service Dependency Chain

```dql
smartscapeNodes "SERVICE"
| filter id == toSmartscapeId("SERVICE-XYZ")
| traverse edgeTypes: {calls}, targetTypes: {SERVICE}, direction: forward
| fields downstream_id = id, downstream_name = name
```

### Kubernetes: Pod → Node → Cluster

```dql
smartscapeNodes "K8S_POD"
| filter id == toSmartscapeId("K8S_POD-XYZ")
| traverse edgeTypes: {runs_on}, targetTypes: {K8S_NODE}, direction: forward
| traverse edgeTypes: {belongs_to}, targetTypes: {K8S_CLUSTER}, direction: forward
| fields cluster_id = id, cluster_name = name
```

### Load Balancer → Instances

```dql
smartscapeNodes "AWS_ELASTICLOADBALANCINGV2_LOADBALANCER"
| traverse edgeTypes: {balanced_by}, targetTypes: {AWS_ELASTICLOADBALANCINGV2_TARGETGROUP}, direction: backward
| traverse edgeTypes: {balances}, targetTypes: {AWS_EC2_INSTANCE}, direction: forward
```

### All Resources in VPC

```dql
smartscapeNodes "AWS_EC2_VPC"
| filter aws.vpc.id == "vpc-abc123"
| traverse edgeTypes: {is_attached_to}, targetTypes: {"AWS_*"}, direction: backward
| summarize count = count(), by: {type}
```

### Blast Radius (Security Group Impact)

```dql
smartscapeNodes "AWS_EC2_SECURITYGROUP"
| filter aws.resource.id == "sg-CRITICAL"
| traverse edgeTypes: {uses}, targetTypes: {"*"}, direction: backward
| summarize count = count(), by: {type}
```

### Cross-Account Usage

```dql
smartscapeNodes "AWS_IAM_ROLE"
| traverse edgeTypes: {uses}, targetTypes: {"AWS_*"}, direction: backward
| filter aws.account.id != "123456789012"
| fields role_id = dt.traverse.history[-1][`id`], resource_type = type, aws.account.id
```

### Network Topology (3-hop)

```dql
smartscapeNodes "AWS_EC2_NETWORKINTERFACE"
| traverse edgeTypes: {is_attached_to}, targetTypes: {AWS_EC2_INSTANCE}, direction: forward
| traverse edgeTypes: {is_attached_to}, targetTypes: {AWS_EC2_SUBNET}, direction: forward
| traverse edgeTypes: {is_attached_to}, targetTypes: {AWS_EC2_VPC}, direction: forward
| fields 
    eni = dt.traverse.history[-3],
    instance = dt.traverse.history[-2],
    subnet = dt.traverse.history[-1],
    vpc = aws.resource.id
```

______________________________________________________________________

## Guidelines

### `toSmartscapeId()` Usage

Do not use strings to filter Smartscape Ids. SmartscapeId strings must be converted to data type SmartscapeId first. For example:

- When filtering by ID in `smartscapeEdges` or `smartscapeNodes`, or comparing IDs across hops, you must convert string IDs using `toSmartscapeId()`.
- Filtering `id` on `smartscapeNodes`
- Filtering `source_id` or `target_id` in `smartscapeEdges` queries
- Comparing IDs returned from `dt.traverse.history` against known values

**Example:**

```dql
smartscapeEdges "calls"
| filter source_id == toSmartscapeId("SERVICE-XYZ")
```

```dql
smartscapeNodes "SERVICE"
| filter id == toSmartscapeId("SERVICE-XYZ")
```

______________________________________________________________________

### Performance

1. **Filter before traverse** - Reduce dataset size early
1. **Use specific types** - Try to avoid `{"*"}` if not necessary
1. **Limit wildcards** - Add `| limit 100` for exploration
1. **Use references for counting** - No traversal overhead
1. **Use traverse for details** - When you need entity fields
