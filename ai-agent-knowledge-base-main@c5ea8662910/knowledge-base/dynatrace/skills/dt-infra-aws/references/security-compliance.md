# AWS Security & Compliance

Monitor security configurations and compliance across AWS resources.

## Security Group Blast Radius

Find security groups with the most instances:

```dql
smartscapeNodes "AWS_EC2_INSTANCE"
| traverse "uses", "AWS_EC2_SECURITYGROUP"
| summarize instance_count = count(), by: {aws.resource.name, aws.vpc.id}
| sort instance_count desc
| limit 20
```

## Lambda Execution Roles

Identify IAM roles used by Lambda functions:

```dql
smartscapeNodes "AWS_IAM_ROLE"
| parse aws.object, "JSON:awsjson"
| fieldsAdd assumeRolePolicyDocument = awsjson[configuration][assumeRolePolicyDocument]
| filter contains(toString(assumeRolePolicyDocument), "lambda")
| fields name, aws.account.id
```

## ACM Certificate Inventory

List SSL/TLS certificates for expiration tracking:

```dql
smartscapeNodes "AWS_ACM_CERTIFICATE"
| fields name, aws.account.id, aws.region
| summarize cert_count = count(), by: {aws.region}
```

## KMS Key State Analysis

Monitor encryption key states:

```dql
smartscapeNodes "AWS_KMS_KEY"
| parse aws.object, "JSON:awsjson"
| fieldsAdd keyState = awsjson[configuration][keyState],
            keyUsage = awsjson[configuration][keyUsage]
| summarize key_count = count(), by: {keyState, keyUsage}
| sort key_count desc
```

## RDS Publicly Accessible Databases

Find databases exposed to the internet:

```dql
smartscapeNodes "AWS_RDS_DBINSTANCE"
| parse aws.object, "JSON:awsjson"
| fieldsAdd publiclyAccessible = awsjson[configuration][publiclyAccessible]
| filter publiclyAccessible == true
| fields name, aws.resource.id, aws.vpc.id, aws.account.id
```

## RDS Encryption Status

Check database encryption:

```dql
smartscapeNodes "AWS_RDS_DBINSTANCE"
| parse aws.object, "JSON:awsjson"
| fieldsAdd storageEncrypted = awsjson[configuration][storageEncrypted]
| summarize db_count = count(), by: {storageEncrypted, aws.region}
```

## Lambda Functions in VPC

Find Lambda functions with VPC access:

```dql
smartscapeNodes "AWS_LAMBDA_FUNCTION"
| filter isNotNull(aws.vpc.id)
| fields name, aws.resource.id, aws.vpc.id, aws.security_group.id
| summarize function_count = count(), by: {aws.vpc.id}
```

## Internet-Facing Load Balancers

Identify publicly accessible load balancers:

```dql
smartscapeNodes "AWS_ELASTICLOADBALANCINGV2_LOADBALANCER"
| parse aws.object, "JSON:awsjson"
| fieldsAdd scheme = awsjson[configuration][scheme]
| filter scheme == "internet-facing"
| fields name, aws.resource.id, aws.vpc.id, aws.region
```

## Route53 Hosted Zones

List DNS zones for management:

```dql
smartscapeNodes "AWS_ROUTE53_HOSTEDZONE"
| summarize zone_count = count(), by: {aws.account.id}
```

## VPC Endpoint Service Types

Analyze private connectivity patterns:

```dql
smartscapeNodes "AWS_EC2_VPCENDPOINT"
| parse aws.object, "JSON:awsjson"
| fieldsAdd serviceName = awsjson[configuration][serviceName]
| summarize endpoint_count = count(), by: {serviceName, aws.vpc.id}
| sort endpoint_count desc
```

## Security Groups Without Instances

Find unused security groups:

```dql
smartscapeNodes "AWS_EC2_SECURITYGROUP"
| fields name, aws.resource.id, aws.vpc.id
| limit 100
```

## IAM Role Distribution

Count IAM roles by account:

```dql
smartscapeNodes "AWS_IAM_ROLE"
| summarize role_count = count(), by: {aws.account.id}
| sort role_count desc
```
