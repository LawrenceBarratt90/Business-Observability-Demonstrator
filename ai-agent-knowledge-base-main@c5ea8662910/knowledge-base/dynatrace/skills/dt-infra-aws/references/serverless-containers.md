# AWS Serverless & Container Workloads

Monitor AWS Lambda, ECS, EKS, and App Runner services.

## List All Lambda Functions

Get all Lambda functions:

```dql
smartscapeNodes "AWS_LAMBDA_FUNCTION"
| fields name, aws.account.id, aws.region, aws.vpc.id
```

## Find Lambda Functions in VPC

Filter Lambda functions with VPC access:

```dql
smartscapeNodes "AWS_LAMBDA_FUNCTION"
| filter isNotNull(aws.vpc.id)
| fields name, aws.resource.id, aws.vpc.id, aws.subnet.id, aws.security_group.id
```

## List Lambda Functions by Region

Group functions by region:

```dql
smartscapeNodes "AWS_LAMBDA_FUNCTION"
| summarize function_count = count(), by: {aws.region, aws.account.id}
| sort function_count desc
```

## Find ECS Clusters

Get all ECS clusters:

```dql
smartscapeNodes "AWS_ECS_CLUSTER"
| fields name, aws.account.id, aws.region, aws.resource.id
```

## List ECS Services

Get ECS services and their clusters:

```dql
smartscapeNodes "AWS_ECS_SERVICE"
| fields name, aws.account.id, aws.region
```

## Find ECS Services in a Cluster

Map services to clusters:

```dql
smartscapeNodes "AWS_ECS_SERVICE"
| traverse "belongs_to", "AWS_ECS_CLUSTER"
| fields name, aws.resource.id, aws.region
```

## List Running ECS Tasks

Get active ECS tasks:

```dql
smartscapeNodes "AWS_ECS_TASK"
| fields name, aws.account.id, aws.region
```

## Find ECS Task Definitions

List task definitions:

```dql
smartscapeNodes "AWS_ECS_TASKDEFINITION"
| fields name, aws.account.id, aws.region
```

## Analyze ECS Services by Task Definition

Find which services use which task definitions:

```dql
smartscapeNodes "AWS_ECS_SERVICE"
| traverse "uses", "AWS_ECS_TASKDEFINITION"
| fields name, aws.resource.id
```

## List EKS Clusters

Get all EKS clusters:

```dql
smartscapeNodes "AWS_EKS_CLUSTER"
| fields name, aws.account.id, aws.region, aws.vpc.id
```

## Find EKS Node Groups

List EKS node groups:

```dql
smartscapeNodes "AWS_EKS_NODEGROUP"
| fields name, aws.account.id, aws.region
```

## List App Runner Services

Get App Runner services:

```dql
smartscapeNodes "AWS_APPRUNNER_SERVICE"
| fields name, aws.account.id, aws.region
```

## Find App Runner VPC Connectors

List VPC connectors for App Runner:

```dql
smartscapeNodes "AWS_APPRUNNER_VPCCONNECTOR"
| fields name, aws.resource.id, aws.vpc.id
```

## Analyze Container Distribution

Count containers by type and region:

```dql
smartscapeNodes ["AWS_ECS_CLUSTER", "AWS_EKS_CLUSTER", "AWS_APPRUNNER_SERVICE"]
| summarize count = count(), by: {type, aws.region}
| sort count desc
```

## Find Lambda Functions by Tag

Filter functions by tags:

```dql
smartscapeNodes "AWS_LAMBDA_FUNCTION"
| filter tags[Environment] == "production"
| fields name, aws.resource.id, aws.region
```

## List ECS Container Instances

Get EC2 instances used by ECS:

```dql
smartscapeNodes "AWS_ECS_CONTAINERINSTANCE"
| fields name, aws.account.id, aws.region
```

## Find Lambda Event Sources

List Lambda event source mappings:

```dql
smartscapeNodes "AWS_LAMBDA_EVENTSOURCEMAPPING"
| fields name, aws.account.id, aws.region
```

## Analyze ECS Service Networking

Find ECS services and their network config:

```dql
smartscapeNodes "AWS_ECS_SERVICE"
| traverse "is_attached_to", "AWS_EC2_SUBNET"
| fields name, aws.resource.id, aws.vpc.id
```

## Find ECS Services with Security Groups

List ECS service security configurations:

```dql
smartscapeNodes "AWS_ECS_SERVICE"
| traverse "uses", "AWS_EC2_SECURITYGROUP"
| fields name, aws.resource.id
```
