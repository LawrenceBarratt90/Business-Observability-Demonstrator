# AWS Capacity Planning

Analyze resource capacity and plan for growth.

## Instance Type Distribution

View instance types and counts across regions:

```dql
smartscapeNodes "AWS_EC2_INSTANCE"
| parse aws.object, "JSON:awsjson"
| fieldsAdd instanceType = awsjson[configuration][instanceType],
            state = awsjson[configuration][state][name]
| summarize instance_count = count(), by: {instanceType, state, aws.region}
| sort instance_count desc
```

## Auto Scaling Group Capacity

Analyze auto-scaling group capacity and headroom:

```dql
smartscapeNodes "AWS_AUTOSCALING_AUTOSCALINGGROUP"
| parse aws.object, "JSON:awsjson"
| fieldsAdd minSize = awsjson[configuration][minSize],
            maxSize = awsjson[configuration][maxSize],
            desiredCapacity = awsjson[configuration][desiredCapacity]
| fields name, minSize, maxSize, desiredCapacity, aws.region
| sort desiredCapacity desc
```

## Subnet IP Address Utilization

Monitor subnet IP capacity:

```dql
smartscapeNodes "AWS_EC2_SUBNET"
| parse aws.object, "JSON:awsjson"
| fieldsAdd availableIpCount = awsjson[configuration][availableIpAddressCount],
            cidrBlock = awsjson[configuration][cidrBlock]
| fields name, cidrBlock, availableIpCount, aws.vpc.id, aws.availability_zone
| sort availableIpCount asc
```

## Network Interface Capacity by Type

Analyze network interface usage:

```dql
smartscapeNodes "AWS_EC2_NETWORKINTERFACE"
| parse aws.object, "JSON:awsjson"
| fieldsAdd interfaceType = awsjson[configuration][interfaceType],
            status = awsjson[configuration][status]
| summarize eni_count = count(), by: {interfaceType, status}
| sort eni_count desc
```

## EKS Node Group Sizing

Review EKS node group configurations:

```dql
smartscapeNodes "AWS_EKS_NODEGROUP"
| fields name, aws.account.id, aws.region
| summarize nodegroup_count = count(), by: {aws.region, aws.account.id}
| sort nodegroup_count desc
```

## Lambda Memory Configuration

Analyze Lambda function memory allocations:

```dql
smartscapeNodes "AWS_LAMBDA_FUNCTION"
| parse aws.object, "JSON:awsjson"
| fieldsAdd memory = awsjson[configuration][memorySize]
| summarize function_count = count(), by: {memory, aws.region}
| sort memory desc
```

## RDS Storage Type Distribution

Review database storage configurations:

```dql
smartscapeNodes "AWS_RDS_DBINSTANCE"
| parse aws.object, "JSON:awsjson"
| fieldsAdd storageType = awsjson[configuration][storageType]
| summarize db_count = count(), by: {storageType, aws.region}
| sort db_count desc
```

## ECS Service Capacity

Monitor ECS service desired vs running counts:

```dql
smartscapeNodes "AWS_ECS_SERVICE"
| parse aws.object, "JSON:awsjson"
| fieldsAdd desiredCount = awsjson[configuration][desiredCount],
            runningCount = awsjson[configuration][runningCount]
| fields name, desiredCount, runningCount, aws.region
```

## Route Table Distribution

Count route tables per VPC:

```dql
smartscapeNodes "AWS_EC2_ROUTETABLE"
| summarize route_table_count = count(), by: {aws.vpc.id, aws.region}
| sort route_table_count desc
```

## Transit Gateway Inventory

List transit gateways for multi-VPC connectivity:

```dql
smartscapeNodes "AWS_EC2_TRANSITGATEWAY"
| fields name, aws.account.id, aws.region, aws.resource.id
```

## Container Registry Growth

Track ECR repository counts:

```dql
smartscapeNodes "AWS_ECR_REPOSITORY"
| summarize repo_count = count(), by: {aws.region, aws.account.id}
| sort repo_count desc
```

## Launch Template Usage

Analyze launch template distribution:

```dql
smartscapeNodes "AWS_EC2_LAUNCHTEMPLATE"
| summarize template_count = count(), by: {aws.region, aws.account.id}
| sort template_count desc
```
