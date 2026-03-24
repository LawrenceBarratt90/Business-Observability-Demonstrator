# AWS Resource Management & Optimization

Analyze AWS resource usage, identify cost optimization opportunities, and manage resource tagging.

## Count All AWS Resources

Get total resource count by type:

```dql
smartscapeNodes "AWS_*"
| summarize resource_count = count(), by: {type}
| sort resource_count desc
```

## Analyze Resources by Account

View resource distribution across accounts:

```dql
smartscapeNodes "AWS_*"
| summarize resource_count = count(), by: {aws.account.id, aws.region}
| sort resource_count desc
```

## Find Untagged Resources

Identify resources without tags:

```dql
smartscapeNodes "AWS_*"
| filter arraySize(tags) == 0
| fields type, name, aws.resource.id, aws.account.id, aws.region
```

## Find Resources Missing Specific Tag

Locate resources without required tags:

```dql
smartscapeNodes "AWS_*"
| filter isNull(tags[Environment]) or tags[Environment] == ""
| fields type, name, aws.resource.id, aws.account.id
| summarize count = count(), by: {type, aws.account.id}
```

## Analyze Tag Coverage

Calculate tagging compliance:

```dql
smartscapeNodes "AWS_*"
| fieldsAdd has_env_tag = if(isNotNull(tags[Environment]), 1, 0),
            has_owner_tag = if(isNotNull(tags[Owner]), 1, 0)
| summarize
    total = count(),
    with_env = sum(has_env_tag),
    with_owner = sum(has_owner_tag),
    by: {type}
| fieldsAdd
    env_coverage_pct = (with_env * 100.0) / total,
    owner_coverage_pct = (with_owner * 100.0) / total
| sort env_coverage_pct asc
```

## Find Resources by Tag Value

Filter resources by tag:

```dql
smartscapeNodes "AWS_*"
| filter tags[Environment] == "production"
| fields type, name, aws.resource.id, aws.region
| summarize count = count(), by: {type, aws.region}
```

## Detect Deleted Resources

Find resources marked as deleted:

```dql
smartscapeNodes "AWS_*"
| filter cloud.acquisition.status == "DELETED"
| fields type, name, aws.resource.id, aws.account.id, aws.region
```

## Find Incomplete Resource Data

Identify resources with acquisition issues:

```dql
smartscapeNodes "AWS_*"
| filter cloud.acquisition.status in ["ERROR", "INCOMPLETE"]
| fields type, name, aws.resource.id, cloud.acquisition.status, aws.account.id
```

## Analyze Regional Distribution

View resources by region:

```dql
smartscapeNodes "AWS_*"
| summarize resource_count = count(), by: {aws.region}
| sort resource_count desc
```

## Find Multi-Region Resources

Identify resource types across regions:

```dql
smartscapeNodes "AWS_*"
| summarize
    region_count = countDistinct(aws.region),
    total_resources = count(),
    by: {type}
| filter region_count > 1
| sort region_count desc
```

## Analyze VPC Resource Density

Count resources per VPC:

```dql
smartscapeNodes "AWS_*"
| filter isNotNull(aws.vpc.id)
| summarize resource_count = count(), by: {aws.vpc.id, type}
| sort resource_count desc
```

## Find Unattached EBS Volumes

Locate volumes not attached to instances:

```dql
smartscapeNodes "AWS_EC2_VOLUME"
| parse aws.object, "JSON:awsjson"
| fieldsAdd state = awsjson[configuration][state]
| filter state == "available"
| fields name, aws.resource.id, aws.availability_zone, aws.account.id
```

## Find Elastic IPs Not Associated

List unattached Elastic IPs:

```dql
smartscapeNodes "AWS_EC2_EIP"
| parse aws.object, "JSON:awsjson"
| fieldsAdd associationId = awsjson[configuration][associationId]
| filter isNull(associationId)
| fields name, aws.resource.id, aws.region, aws.account.id
```

## Analyze Storage Resources

Count storage services:

```dql
smartscapeNodes ["AWS_S3_BUCKET", "AWS_EC2_VOLUME", "AWS_EFS_FILESYSTEM"]
| summarize count = count(), by: {type, aws.region}
| sort count desc
```

## Find Resources by Naming Convention

Locate resources matching naming pattern:

```dql
smartscapeNodes "AWS_*"
| filter matchesPhrase(name, "prod")
| fields type, name, aws.resource.id, aws.region, tags[Environment]
```

## Analyze Security Resources

Count IAM and security resources:

```dql
smartscapeNodes ["AWS_IAM_ROLE", "AWS_IAM_USER", "AWS_IAM_GROUP", "AWS_KMS_KEY", "AWS_EC2_SECURITYGROUP"]
| summarize count = count(), by: {type}
| sort count desc
```

## Find Old Snapshots

Identify EC2 snapshots (requires parsing aws.object for creation date):

```dql
smartscapeNodes "AWS_EC2_SNAPSHOT"
| fields name, aws.resource.id, aws.region, aws.account.id
```

## List All S3 Buckets

Get all S3 buckets:

```dql
smartscapeNodes "AWS_S3_BUCKET"
| fields name, aws.account.id, aws.region, aws.resource.id
```
