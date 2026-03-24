# AWS Database Monitoring

Monitor and analyze AWS database services including RDS, DynamoDB, ElastiCache, and Redshift.

## List All RDS Instances

Get all RDS database instances:

```dql
smartscapeNodes "AWS_RDS_DBINSTANCE"
| fields name, aws.account.id, aws.region, aws.vpc.id, aws.availability_zone
```

## Find RDS Instances in Multi-AZ

Identify databases with high availability:

```dql
smartscapeNodes "AWS_RDS_DBINSTANCE"
| parse aws.object, "JSON:awsjson"
| fieldsAdd multiAZ = awsjson[configuration][multiAZ]
| filter multiAZ == true
| fields name, aws.resource.id, aws.region, aws.availability_zone
```

## Analyze RDS by Engine Type

Group databases by engine:

```dql
smartscapeNodes "AWS_RDS_DBINSTANCE"
| parse aws.object, "JSON:awsjson"
| fieldsAdd engine = awsjson[configuration][engine]
| summarize db_count = count(), by: {engine, aws.region}
| sort db_count desc
```

## Find RDS Cluster Members

Get cluster and instance relationships:

```dql
smartscapeNodes "AWS_RDS_DBINSTANCE"
| traverse "is_part_of", "AWS_RDS_DBCLUSTER"
| fields name, aws.resource.id, aws.region
```

## List All DynamoDB Tables

Get DynamoDB tables:

```dql
smartscapeNodes "AWS_DYNAMODB_TABLE"
| fields name, aws.account.id, aws.region, aws.resource.id
```

## Analyze ElastiCache Clusters

Find ElastiCache clusters and their configuration:

```dql
smartscapeNodes "AWS_ELASTICACHE_CACHECLUSTER"
| fields name, aws.account.id, aws.region, aws.vpc.id, aws.subnet.id
```

## Find ElastiCache by Engine

Group cache clusters by engine type:

```dql
smartscapeNodes "AWS_ELASTICACHE_CACHECLUSTER"
| parse aws.object, "JSON:awsjson"
| fieldsAdd engine = awsjson[configuration][engine]
| summarize cluster_count = count(), by: {engine, aws.region}
```

## List Redshift Clusters

Get all Redshift data warehouses:

```dql
smartscapeNodes "AWS_REDSHIFT_CLUSTER"
| fields name, aws.account.id, aws.region, aws.vpc.id
```

## Find Publicly Accessible Databases

Identify databases exposed to the internet:

```dql
smartscapeNodes "AWS_RDS_DBINSTANCE"
| parse aws.object, "JSON:awsjson"
| fieldsAdd publiclyAccessible = awsjson[configuration][publiclyAccessible]
| filter publiclyAccessible == true
| fields name, aws.resource.id, aws.vpc.id, aws.account.id
```

## Analyze Database Security Groups

Find databases and their security groups:

```dql
smartscapeNodes "AWS_RDS_DBINSTANCE"
| fields name, aws.resource.id, aws.vpc.id, aws.security_group.id
| expand aws.security_group.id
```

## Map Database Subnet Groups

Find RDS subnet groups:

```dql
smartscapeNodes "AWS_RDS_DBSUBNETGROUP"
| fields name, aws.account.id, aws.region, aws.vpc.id
```

## Discover Database Dependencies

Find what security groups a database uses:

```dql
smartscapeNodes "AWS_RDS_DBINSTANCE"
| filter aws.resource.id == "mydb-instance"
| traverse "uses", "AWS_EC2_SECURITYGROUP"
| fields name, aws.resource.id
```

## Find Databases by VPC

List all databases in a specific VPC:

```dql
smartscapeNodes ["AWS_RDS_DBINSTANCE", "AWS_ELASTICACHE_CACHECLUSTER", "AWS_REDSHIFT_CLUSTER"]
| filter aws.vpc.id == "vpc-0be61db7c5d2d1bd1"
| fields type, name, aws.resource.id, aws.subnet.id
```

## Analyze Database Distribution by Region

Count databases across regions:

```dql
smartscapeNodes ["AWS_RDS_DBINSTANCE", "AWS_DYNAMODB_TABLE", "AWS_ELASTICACHE_CACHECLUSTER"]
| summarize db_count = count(), by: {type, aws.region}
| sort aws.region, db_count desc
```

## Find RDS Option Groups

List RDS option groups:

```dql
smartscapeNodes "AWS_RDS_OPTIONGROUP"
| fields name, aws.account.id, aws.region
```

## Find ElastiCache Subnet Groups

List ElastiCache subnet groups:

```dql
smartscapeNodes "AWS_ELASTICACHE_SUBNETGROUP"
| fields name, aws.region, aws.vpc.id
```

## Discover Redshift Serverless Workgroups

List Redshift Serverless resources:

```dql
smartscapeNodes "AWS_REDSHIFTSERVERLESS_WORKGROUP"
| fields name, aws.account.id, aws.region
```
