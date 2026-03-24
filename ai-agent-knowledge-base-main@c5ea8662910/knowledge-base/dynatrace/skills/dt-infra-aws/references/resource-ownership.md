# AWS Resource Ownership & Chargeback

Track resource ownership and enable cost allocation across teams.

## Cost Allocation by Cost Center

Group resources by cost center tag:

```dql
smartscapeNodes "AWS_*"
| filter isNotNull(tags[CostCenter])
| summarize resource_count = count(), by: {tags[CostCenter], type}
| sort resource_count desc
```

## Resource Ownership Analysis

Analyze resources by owner:

```dql
smartscapeNodes "AWS_*"
| filter isNotNull(tags[Owner])
| summarize resource_count = count(), by: {tags[Owner], type}
| sort resource_count desc
```

## Project Resource Distribution

View resources by project:

```dql
smartscapeNodes "AWS_*"
| filter isNotNull(tags[Project])
| summarize resource_count = count(), by: {tags[Project], type}
| sort resource_count desc
```

## Application-Based Resource Grouping

Group resources by application:

```dql
smartscapeNodes "AWS_*"
| filter isNotNull(tags[Application])
| summarize resource_count = count(), by: {tags[Application], type}
| sort resource_count desc
```

## Team Resource Allocation

Find resources by team:

```dql
smartscapeNodes "AWS_*"
| filter isNotNull(tags[Team])
| summarize resource_count = count(), by: {tags[Team], aws.region}
| sort resource_count desc
```

## Environment-Based Segmentation

Segment resources by environment:

```dql
smartscapeNodes "AWS_*"
| filter isNotNull(tags[Environment])
| summarize resource_count = count(), by: {tags[Environment], type}
| sort resource_count desc
```

## EC2 Instance by Department

Analyze EC2 instances by department:

```dql
smartscapeNodes "AWS_EC2_INSTANCE"
| filter isNotNull(tags[Department])
| summarize instance_count = count(), by: {tags[Department], aws.region}
| sort instance_count desc
```

## Lambda Function by Application

Map Lambda functions to applications:

```dql
smartscapeNodes "AWS_LAMBDA_FUNCTION"
| filter isNotNull(tags[Application])
| summarize function_count = count(), by: {tags[Application], aws.region}
| sort function_count desc
```

## RDS Cluster by Owner

Track database ownership:

```dql
smartscapeNodes "AWS_RDS_DBCLUSTER"
| filter isNotNull(tags[Owner])
| fields name, aws.resource.id, tags[Owner], aws.region
```

## EKS Cluster by Business Unit

Identify EKS clusters by business unit:

```dql
smartscapeNodes "AWS_EKS_CLUSTER"
| filter isNotNull(tags[BusinessUnit])
| fields name, tags[BusinessUnit], aws.vpc.id, aws.region
```

## Volume Ownership by Project

Analyze EBS volumes by project:

```dql
smartscapeNodes "AWS_EC2_VOLUME"
| filter isNotNull(tags[Project])
| summarize volume_count = count(), by: {tags[Project], aws.availability_zone}
| sort volume_count desc
```

## Multi-Account Resource Summary

Summarize resources across accounts:

```dql
smartscapeNodes "AWS_*"
| summarize resource_count = count(), by: {aws.account.id, type}
| sort resource_count desc
| limit 50
```
