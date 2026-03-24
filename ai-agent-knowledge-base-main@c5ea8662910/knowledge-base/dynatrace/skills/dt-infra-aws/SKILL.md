---
name: dt-infra-aws
description: AWS cloud resources including EC2, RDS, Lambda, ECS/EKS, VPC networking, load balancers, databases, serverless, messaging, and cost optimization. Monitor AWS infrastructure, analyze resource usage, optimize costs, and ensure security compliance.
license: Apache-2.0
---

# AWS Cloud Infrastructure

Monitor and analyze AWS resources using Dynatrace Smartscape and DQL. Query AWS services, optimize costs, manage security, and plan capacity across your AWS infrastructure.

## When to Use This Skill

Use this skill when the user needs to:

- **Inventory:** "Show me all EC2 instances in us-east-1"
- **Network:** "Find all resources in VPC vpc-abc123"
- **Database:** "List all RDS instances with Multi-AZ enabled"
- **Serverless:** "Show Lambda functions with VPC access"
- **Cost:** "Find unattached EBS volumes for cost savings"
- **Security:** "Identify publicly accessible databases"
- **Compliance:** "Find resources missing Environment tags"
- **Capacity:** "Analyze subnet IP utilization"
- **Troubleshoot:** "Map load balancer to instances through target groups"
- **Problem Analysis:** "What changed before this AWS problem?" / "What events affected this resource?"
- **Workload Context:** "Is this instance behind a load balancer, in an EKS cluster, or managed by ECS?"
- **Events:** "Have there been any recent events in AWS affecting this resource?"

---

## Core Concepts

### Entity Types

AWS resources use the `AWS_*` prefix and can be queried using the `smartscapeNodes` function. All AWS entities are automatically discovered and modeled in Dynatrace Smartscape.

**Compute:** `AWS_EC2_INSTANCE`, `AWS_LAMBDA_FUNCTION`, `AWS_ECS_CLUSTER`, `AWS_ECS_SERVICE`, `AWS_EKS_CLUSTER`  
**Networking:** `AWS_EC2_VPC`, `AWS_EC2_SUBNET`, `AWS_EC2_SECURITYGROUP`, `AWS_EC2_NATGATEWAY`, `AWS_EC2_VPCENDPOINT`  
**Database:** `AWS_RDS_DBINSTANCE`, `AWS_RDS_DBCLUSTER`, `AWS_DYNAMODB_TABLE`, `AWS_ELASTICACHE_CACHECLUSTER`  
**Storage:** `AWS_S3_BUCKET`, `AWS_EC2_VOLUME`, `AWS_EFS_FILESYSTEM`  
**Load Balancing:** `AWS_ELASTICLOADBALANCINGV2_LOADBALANCER`, `AWS_ELASTICLOADBALANCINGV2_TARGETGROUP`  
**Messaging:** `AWS_SQS_QUEUE`, `AWS_SNS_TOPIC`, `AWS_EVENTS_EVENTBUS`, `AWS_MSK_CLUSTER`

### Common AWS Fields

All AWS entities include:
- `aws.account.id` - AWS account identifier
- `aws.region` - AWS region (e.g., us-east-1)
- `aws.resource.id` - Unique resource identifier
- `aws.resource.name` - Resource name
- `aws.arn` - Amazon Resource Name
- `aws.vpc.id` - VPC identifier (for VPC-attached resources)
- `aws.subnet.id` - Subnet identifier
- `aws.availability_zone` - Availability zone
- `aws.security_group.id` - Security group IDs (array)
- `tags` - Resource tags (use `tags[TagName]`)

### Relationship Types

AWS entities use these relationship types:
- `is_attached_to` - Exclusive attachment (e.g., volume to instance)
- `uses` - Dependency relationship (e.g., instance uses security group)
- `runs_on` - Vertical relationship (e.g., instance runs on AZ)
- `is_part_of` - Composition (e.g., instance in cluster)
- `belongs_to` - Aggregation (e.g., service belongs to cluster)
- `balances` - Load balancing (e.g., target group balances instances)
- `balanced_by` - Reverse of balances

---

## Key Workflows

### 1. AWS Resource Discovery

Get all AWS resources by type:

```dql
smartscapeNodes "AWS_*"
| summarize count = count(), by: {type}
| sort count desc
```

Filter by account and region:

```dql
smartscapeNodes "AWS_*"
| filter aws.account.id == "123456789012" and aws.region == "us-east-1"
| fields type, name, aws.resource.id
```

Using tags for filtering:

```dql
smartscapeNodes "AWS_*"
| filter tags[Environment] == "production"
| summarize count = count(), by: {type, aws.region}
```

→ For complete resource inventory patterns, see [references/resource-management.md](#resource-inventory)

### 2. VPC Networking Analysis

List all VPCs:

```dql
smartscapeNodes "AWS_EC2_VPC"
| fields name, aws.account.id, aws.region, aws.vpc.id
```

Find resources in a VPC:

```dql
smartscapeNodes "AWS_*"
| filter aws.vpc.id == "vpc-0be61db7c5d2d1bd1"
| summarize resource_count = count(), by: {type, aws.subnet.id}
| sort resource_count desc
```

Analyze security group usage:

```dql
smartscapeNodes "AWS_EC2_INSTANCE"
| filter contains(aws.security_group.id, "sg-abc123")
| fields name, aws.resource.id, aws.vpc.id, aws.subnet.id
```

→ For VPC networking, see [references/vpc-networking-security.md](#vpc-analysis)  
→ For security group patterns, see [references/security-compliance.md](#security-groups)

### 3. Database Monitoring

List all RDS instances:

```dql
smartscapeNodes "AWS_RDS_DBINSTANCE"
| fields name, aws.account.id, aws.region, aws.vpc.id, aws.availability_zone
```

Find Multi-AZ databases:

```dql
smartscapeNodes "AWS_RDS_DBINSTANCE"
| parse aws.object, "JSON:awsjson"
| fieldsAdd multiAZ = awsjson[configuration][multiAZ]
| filter multiAZ == true
| fields name, aws.resource.id, aws.region
```

Group by engine type:

```dql
smartscapeNodes "AWS_RDS_DBINSTANCE"
| parse aws.object, "JSON:awsjson"
| fieldsAdd engine = awsjson[configuration][engine]
| summarize db_count = count(), by: {engine, aws.region}
| sort db_count desc
```

→ For database monitoring, see [references/database-monitoring.md](#rds-monitoring)

### 4. Serverless and Container Workloads

List Lambda functions:

```dql
smartscapeNodes "AWS_LAMBDA_FUNCTION"
| fields name, aws.account.id, aws.region, aws.vpc.id
```

Find ECS services in a cluster:

```dql
smartscapeNodes "AWS_ECS_SERVICE"
| traverse "belongs_to", "AWS_ECS_CLUSTER"
| fields name, aws.resource.id, aws.region
```

List EKS clusters:

```dql
smartscapeNodes "AWS_EKS_CLUSTER"
| fields name, aws.account.id, aws.region, aws.vpc.id
```

→ For serverless, see [references/serverless-containers.md](#lambda-monitoring)  
→ For containers, see [references/serverless-containers.md](#ecs-monitoring)

### 5. Load Balancer Topology

Complete load balancer to instance mapping:

```dql
smartscapeNodes "AWS_ELASTICLOADBALANCINGV2_LOADBALANCER"
| parse aws.object, "JSON:awsjson"
| fieldsAdd dnsName = awsjson[configuration][dnsName], scheme = awsjson[configuration][scheme]
| filter scheme == "internet-facing"
| traverse "balanced_by", "AWS_ELASTICLOADBALANCINGV2_TARGETGROUP", direction:backward, fieldsKeep:{dnsName, id}
| fieldsAdd targetGroupName = aws.resource.name
| traverse "balances", "AWS_EC2_INSTANCE", fieldsKeep: {targetGroupName, id}
| fieldsAdd loadBalancerDnsName = dt.traverse.history[-2][dnsName],
            loadBalancerId = dt.traverse.history[-2][id],
            targetGroupId = dt.traverse.history[-1][id]
```

→ For load balancing, see [references/load-balancing-api.md](#lb-topology)

### 6. Cost Optimization

Find unattached EBS volumes:

```dql
smartscapeNodes "AWS_EC2_VOLUME"
| parse aws.object, "JSON:awsjson"
| fieldsAdd state = awsjson[configuration][state]
| filter state == "available"
| fields name, aws.resource.id, aws.availability_zone, aws.account.id
```

Analyze EBS costs by type:

```dql
smartscapeNodes "AWS_EC2_VOLUME"
| parse aws.object, "JSON:awsjson"
| fieldsAdd volumeType = awsjson[configuration][volumeType],
            size = awsjson[configuration][size],
            state = awsjson[configuration][state]
| summarize total_volumes = count(), total_size_gb = sum(size), by: {volumeType, state}
| sort total_size_gb desc
```

→ For cost optimization, see [references/cost-optimization.md](#cost-savings)

### 7. Security and Compliance

Find publicly accessible databases:

```dql
smartscapeNodes "AWS_RDS_DBINSTANCE"
| parse aws.object, "JSON:awsjson"
| fieldsAdd publiclyAccessible = awsjson[configuration][publiclyAccessible]
| filter publiclyAccessible == true
| fields name, aws.resource.id, aws.vpc.id, aws.account.id
```

Security group blast radius:

```dql
smartscapeNodes "AWS_EC2_INSTANCE"
| traverse "uses", "AWS_EC2_SECURITYGROUP"
| summarize instance_count = count(), by: {aws.resource.name, aws.vpc.id}
| sort instance_count desc
| limit 20
```

→ For security, see [references/security-compliance.md](#security-analysis)

### 8. Resource Ownership and Tagging

Find untagged resources:

```dql
smartscapeNodes "AWS_*"
| filter arraySize(tags) == 0
| fields type, name, aws.resource.id, aws.account.id, aws.region
```

Cost allocation by cost center:

```dql
smartscapeNodes "AWS_*"
| filter isNotNull(tags[CostCenter])
| summarize resource_count = count(), by: {tags[CostCenter], type}
| sort resource_count desc
```

→ For resource ownership, see [references/resource-ownership.md](#chargeback)

---

## Common Query Patterns

### Pattern 1: Smartscape Discovery
Use `smartscapeNodes` to discover AWS resources:
```dql
smartscapeNodes "AWS_*"
| fieldsAdd <aws-attributes>
| filter <conditions>
| summarize <aggregations>
```

### Pattern 2: Configuration Parsing
Parse `aws.object` for detailed configuration:
```dql
smartscapeNodes "AWS_<SERVICE>_<TYPE>"
| parse aws.object, "JSON:awsjson"
| fieldsAdd config_field = awsjson[configuration][fieldName]
| filter <config-conditions>
```

### Pattern 3: Relationship Traversal
Follow relationships between resources:
```dql
smartscapeNodes "AWS_<SOURCE>"
| traverse "<relationship>", "AWS_<TARGET>"
| fields name, aws.resource.id
```

### Pattern 4: Multi-Resource Queries
Query multiple resource types:
```dql
smartscapeNodes ["AWS_TYPE1", "AWS_TYPE2", "AWS_TYPE3"]
| filter <common-conditions>
| summarize count = count(), by: {type, aws.region}
```

---

## Use Case Categories

### VPC Networking & Security
Monitor VPC infrastructure, security groups, subnets, and network connectivity.
- VPC and subnet analysis
- Security group management
- Network interface monitoring
- NAT gateways and VPN connections
- VPC endpoints and peering

→ See [references/vpc-networking-security.md](references/vpc-networking-security.md)

### Database Monitoring
Track RDS, DynamoDB, ElastiCache, and Redshift resources.
- RDS instance and cluster management
- Multi-AZ configuration analysis
- Database engine distribution
- Cache cluster monitoring
- Subnet group configuration

→ See [references/database-monitoring.md](references/database-monitoring.md)

### Serverless & Containers
Monitor Lambda, ECS, EKS, and App Runner workloads.
- Lambda function inventory
- ECS cluster and service topology
- EKS node group analysis
- Container distribution patterns
- VPC connectivity for serverless

→ See [references/serverless-containers.md](references/serverless-containers.md)

### Load Balancing & API
Analyze load balancers, API Gateway, and CloudFront.
- ALB/NLB/Classic LB monitoring
- Target group relationships
- API Gateway REST and HTTP APIs
- CloudFront distribution tracking
- Multi-AZ load balancer analysis

→ See [references/load-balancing-api.md](references/load-balancing-api.md)

### Messaging & Event Streaming
Track SQS, SNS, EventBridge, Kinesis, and MSK.
- Queue and topic inventory
- Event bus management
- Streaming resource analysis
- Step Functions monitoring
- Kafka cluster tracking

→ See [references/messaging-event-streaming.md](references/messaging-event-streaming.md)

### Resource Management
Optimize costs and manage resource lifecycle.
- Resource inventory and counting
- Tag compliance analysis
- Unattached resource detection
- Regional distribution patterns
- Resource lifecycle tracking

→ See [references/resource-management.md](references/resource-management.md)

### Cost Optimization
Identify cost savings and optimize spending.
- KMS key cleanup opportunities
- EBS volume cost analysis
- Instance type cost optimization
- NAT gateway and VPC endpoint costs
- RDS snapshot storage analysis

→ See [references/cost-optimization.md](references/cost-optimization.md)

### Capacity Planning
Analyze resource capacity and plan for growth.
- Instance type distribution
- Auto-scaling capacity analysis
- Subnet IP utilization monitoring
- Network interface capacity
- EKS and Lambda sizing

→ See [references/capacity-planning.md](references/capacity-planning.md)

### Security & Compliance
Monitor security configurations and compliance.
- Security group blast radius analysis
- IAM role and KMS key management
- SSL/TLS certificate tracking
- Publicly accessible resource detection
- Encryption status monitoring

→ See [references/security-compliance.md](references/security-compliance.md)

### Resource Ownership
Track ownership and enable cost allocation.
- Cost allocation by capability
- Team-based resource grouping
- Chargeback and ownership analysis
- Multi-account resource tracking
- Service-based segmentation

→ See [references/resource-ownership.md](references/resource-ownership.md)

---

## Best Practices

### Query Optimization
1. Filter early by account and region
2. Use specific entity types (avoid `"AWS_*"` wildcards when possible)
3. Limit results with `| limit N` for exploration
4. Use `isNotNull()` checks before accessing nested fields

### Configuration Parsing
1. Always parse `aws.object` with JSON parser
2. Use consistent field naming: `fieldsAdd configField = awsjson[configuration][field]`
3. Check for null values after parsing
4. Use `toString()` for complex nested objects

### Security Fields
1. Security group IDs are arrays - use `contains()` or `expand`
2. Parse `aws.object` for detailed security context
3. Check `publiclyAccessible`, `storageEncrypted`, and similar flags
4. Validate IAM role assumptions

### Tagging Strategy
1. Use `tags[TagName]` for filtering
2. Check `arraySize(tags)` for untagged resources
3. Implement consistent tag naming conventions
4. Track tag coverage with summarize operations

---

## Limitations and Notes

### Smartscape Limitations
- AWS object configuration requires parsing with `parse aws.object, "JSON:awsjson"`
- Some detailed metrics may require CloudWatch integration
- Resource discovery depends on AWS integration configuration
- Tag synchronization may have slight delays

### Relationship Traversal
- Use `direction:backward` for reverse relationships (e.g., target group → load balancer)
- Use `fieldsKeep` to maintain important fields through traversal
- Access traversal history with `dt.traverse.history[-N]`
- Complex topologies may require multiple traverse operations

### Best Practices
- Use `entityName()` for human-readable resource names
- Handle null values gracefully with `isNotNull()` and `isNull()`
- Combine region and account filters for large environments
- Use `countDistinct()` for unique resource counts

---

## When to Load References

This skill uses **progressive disclosure**. Start here for 80% of use cases. Load reference files for detailed specifications when needed.

### Load vpc-networking-security.md when:
- Analyzing VPC topology and connectivity
- Investigating security group configurations
- Finding resources by security group
- Troubleshooting network interface issues

### Load database-monitoring.md when:
- Managing RDS instances and clusters
- Analyzing database engine distributions
- Checking Multi-AZ configurations
- Monitoring cache clusters

### Load serverless-containers.md when:
- Working with Lambda functions
- Analyzing ECS/EKS deployments
- Investigating container networking
- Planning serverless migrations

### Load load-balancing-api.md when:
- Mapping load balancer topologies
- Analyzing target group health
- Working with API Gateway
- Configuring CloudFront

### Load messaging-event-streaming.md when:
- Managing SQS queues and SNS topics
- Analyzing EventBridge event buses
- Working with Kinesis or MSK
- Monitoring Step Functions

### Load resource-management.md when:
- Conducting resource audits
- Analyzing tag compliance
- Finding unattached resources
- Planning regional distribution

### Load cost-optimization.md when:
- Identifying cost savings opportunities
- Analyzing storage costs
- Finding unused resources
- Optimizing instance types

### Load capacity-planning.md when:
- Planning capacity expansions
- Analyzing resource utilization
- Monitoring subnet IP usage
- Sizing auto-scaling groups

### Load security-compliance.md when:
- Conducting security audits
- Checking encryption status
- Analyzing IAM roles
- Finding public resources

### Load resource-ownership.md when:
- Implementing chargeback
- Tracking resource ownership
- Allocating costs by team
- Managing multi-account environments

### Load events.md when:
- Investigating what changed before or during a problem
- Checking for recent CloudFormation stack deployments
- Reviewing AWS Auto Scaling activity (scale-in/scale-out)
- Checking AWS Health service events affecting a resource

### Load workload-detection.md when:
- Determining how an EC2 instance is orchestrated (ECS, EKS, Batch, ASG, standalone)
- Following a resolution path that depends on the workload pattern
- Understanding the blast radius of an instance failure

### Check health alerts when:
- Verifying whether Dynatrace health alerts are configured for an AWS resource type
- Confirming alert coverage before or after a problem

Use `dtctl` to query the `builtin:health-experience.cloud-alert` settings schema. Replace `CpuUtilization` with the metric name relevant to the resource type being investigated:

```bash
dtctl get settings --schema builtin:health-experience.cloud-alert -o json --plain \
  | jq '[.[] | select(.value.alertKey | test("CpuUtilization"))]'
```

---

## References

- [vpc-networking-security.md](references/vpc-networking-security.md) - VPC infrastructure, security groups, and network connectivity
- [database-monitoring.md](references/database-monitoring.md) - RDS, DynamoDB, ElastiCache, and Redshift monitoring
- [serverless-containers.md](references/serverless-containers.md) - Lambda, ECS, EKS, and App Runner workloads
- [load-balancing-api.md](references/load-balancing-api.md) - Load balancers, API Gateway, and CloudFront
- [messaging-event-streaming.md](references/messaging-event-streaming.md) - SQS, SNS, EventBridge, Kinesis, and MSK
- [resource-management.md](references/resource-management.md) - Resource inventory and lifecycle management
- [cost-optimization.md](references/cost-optimization.md) - Cost savings and spending optimization
- [capacity-planning.md](references/capacity-planning.md) - Capacity analysis and growth planning
- [security-compliance.md](references/security-compliance.md) - Security configurations and compliance monitoring
- [resource-ownership.md](references/resource-ownership.md) - Cost allocation and ownership tracking
- [events.md](references/events.md) - AWS AutoScaling, Health, and CloudFormation events for problem timeline analysis
- [workload-detection.md](references/workload-detection.md) - Identify how an EC2 instance is orchestrated (LB, ASG, ECS, EKS, Batch)

---
