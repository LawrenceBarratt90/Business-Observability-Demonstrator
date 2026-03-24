# AWS Cost Optimization

Identify cost savings opportunities and optimize AWS spending.

## Find KMS Keys Pending Deletion

Identify KMS keys scheduled for deletion:

```dql
smartscapeNodes "AWS_KMS_KEY"
| parse aws.object, "JSON:awsjson"
| fieldsAdd keyState = awsjson[configuration][keyState]
| filter keyState == "PendingDeletion"
| fields name, aws.resource.id, aws.region, aws.account.id
```

## Analyze EBS Volume Costs by State

Calculate storage costs by volume state:

```dql
smartscapeNodes "AWS_EC2_VOLUME"
| parse aws.object, "JSON:awsjson"
| fieldsAdd volumeType = awsjson[configuration][volumeType],
            size = awsjson[configuration][size],
            state = awsjson[configuration][state]
| summarize total_volumes = count(), total_size_gb = sum(size), by: {volumeType, state}
| sort total_size_gb desc
```

## Find Running Instance Costs by Type

Analyze instance type distribution for cost optimization:

```dql
smartscapeNodes "AWS_EC2_INSTANCE"
| parse aws.object, "JSON:awsjson"
| fieldsAdd instanceType = awsjson[configuration][instanceType],
            state = awsjson[configuration][state][name]
| filter state == "running"
| summarize instance_count = count(), by: {instanceType, aws.region}
| sort instance_count desc
```

## Analyze NAT Gateway Costs

Count NAT gateways by VPC for cost analysis:

```dql
smartscapeNodes "AWS_EC2_NATGATEWAY"
| parse aws.object, "JSON:awsjson"
| fieldsAdd state = awsjson[configuration][state]
| filter state == "available"
| summarize nat_count = count(), by: {aws.vpc.id, aws.availability_zone}
| sort nat_count desc
```

## VPC Endpoint Cost Analysis

Analyze VPC endpoint types for cost optimization:

```dql
smartscapeNodes "AWS_EC2_VPCENDPOINT"
| parse aws.object, "JSON:awsjson"
| fieldsAdd vpcEndpointType = awsjson[configuration][vpcEndpointType],
            serviceName = awsjson[configuration][serviceName]
| summarize endpoint_count = count(), by: {vpcEndpointType, serviceName, aws.vpc.id}
| sort endpoint_count desc
```

## Find Lambda Functions by Runtime

Identify Lambda runtime distribution for upgrade planning:

```dql
smartscapeNodes "AWS_LAMBDA_FUNCTION"
| parse aws.object, "JSON:awsjson"
| fieldsAdd runtime = awsjson[configuration][runtime]
| summarize function_count = count(), by: {runtime, aws.region}
| sort function_count desc
```

## RDS Instance Class Distribution

Analyze RDS instance costs by class:

```dql
smartscapeNodes "AWS_RDS_DBINSTANCE"
| parse aws.object, "JSON:awsjson"
| fieldsAdd instanceClass = awsjson[configuration][dbInstanceClass]
| summarize db_count = count(), by: {instanceClass, aws.region}
| sort db_count desc
```

## ElastiCache Node Type Analysis

Review ElastiCache cluster sizes:

```dql
smartscapeNodes "AWS_ELASTICACHE_REPLICATIONGROUP"
| parse aws.object, "JSON:awsjson"
| fieldsAdd nodeType = awsjson[configuration][cacheNodeType]
| summarize cluster_count = count(), by: {nodeType, aws.region}
| sort cluster_count desc
```

## S3 Bucket Versioning Status

Find buckets with versioning for storage cost analysis:

```dql
smartscapeNodes "AWS_S3_BUCKET"
| parse aws.object, "JSON:awsjson"
| fieldsAdd versioning = awsjson[configuration][versioningConfiguration][status]
| summarize bucket_count = count(), by: {versioning, aws.region}
```

## Terminated Instance Analysis

Find recently terminated instances:

```dql
smartscapeNodes "AWS_EC2_INSTANCE"
| parse aws.object, "JSON:awsjson"
| fieldsAdd state = awsjson[configuration][state][name]
| filter state == "terminated"
| fields name, aws.resource.id, aws.region, aws.account.id
| limit 20
```

## RDS Snapshot Storage Analysis

Count RDS cluster snapshots for backup cost analysis:

```dql
smartscapeNodes "AWS_RDS_DBCLUSTERSNAPSHOT"
| parse aws.object, "JSON:awsjson"
| fieldsAdd snapshotType = awsjson[configuration][snapshotType]
| summarize snapshot_count = count(), by: {snapshotType, aws.region}
| sort snapshot_count desc
```

## CloudFormation Stack Status

Review CloudFormation stack states:

```dql
smartscapeNodes "AWS_CLOUDFORMATION_STACK"
| parse aws.object, "JSON:awsjson"
| fieldsAdd stackStatus = awsjson[configuration][stackStatus]
| summarize stack_count = count(), by: {stackStatus, aws.region}
| sort stack_count desc
```
