# AWS Load Balancing & API Management

Monitor Application/Network Load Balancers, API Gateway, and CloudFront distributions.

## List All Load Balancers (ALB/NLB/GLB)

Get all modern load balancers:

```dql
smartscapeNodes "AWS_ELASTICLOADBALANCINGV2_LOADBALANCER"
| fields name, aws.account.id, aws.region, aws.vpc.id
```

## Find Internet-Facing Load Balancers

Filter load balancers by scheme:

```dql
smartscapeNodes "AWS_ELASTICLOADBALANCINGV2_LOADBALANCER"
| parse aws.object, "JSON:awsjson"
| fieldsAdd scheme = awsjson[configuration][scheme], dnsName = awsjson[configuration][dnsName]
| filter scheme == "internet-facing"
| fields name, dnsName, aws.resource.id, aws.vpc.id
```

## Map Load Balancer to Target Groups

Find target groups for a load balancer:

```dql
smartscapeNodes "AWS_ELASTICLOADBALANCINGV2_LOADBALANCER"
| traverse "balanced_by", "AWS_ELASTICLOADBALANCINGV2_TARGETGROUP", direction:backward
| fields name, aws.resource.id
```

## Find Target Group Targets

Discover instances behind a target group:

```dql
smartscapeNodes "AWS_ELASTICLOADBALANCINGV2_TARGETGROUP"
| traverse "balances", "AWS_EC2_INSTANCE"
| fields name, aws.resource.id, aws.availability_zone
```

## Complete Load Balancer Topology

Map load balancer to instances through target groups:

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

## List Classic Load Balancers

Get ELB (classic) load balancers:

```dql
smartscapeNodes "AWS_ELASTICLOADBALANCING_LOADBALANCER"
| fields name, aws.account.id, aws.region, aws.vpc.id
```

## Find Load Balancer Listeners

List listeners for load balancers:

```dql
smartscapeNodes "AWS_ELASTICLOADBALANCINGV2_LISTENER"
| fields name, aws.account.id, aws.region
```

## List API Gateway REST APIs

Get all REST APIs:

```dql
smartscapeNodes "AWS_APIGATEWAY_RESTAPI"
| fields name, aws.account.id, aws.region, aws.resource.id
```

## Find API Gateway Stages

List deployment stages:

```dql
smartscapeNodes "AWS_APIGATEWAY_STAGE"
| fields name, aws.account.id, aws.region, aws.resource.id
```

## List API Gateway V2 (HTTP/WebSocket)

Get HTTP and WebSocket APIs:

```dql
smartscapeNodes "AWS_APIGATEWAYV2_API"
| fields name, aws.account.id, aws.region, aws.resource.id
```

## Find API Gateway V2 Stages

List stages for V2 APIs:

```dql
smartscapeNodes "AWS_APIGATEWAYV2_STAGE"
| fields name, aws.account.id, aws.region
```

## List CloudFront Distributions

Get CDN distributions:

```dql
smartscapeNodes "AWS_CLOUDFRONT_DISTRIBUTION"
| fields name, aws.account.id, aws.region, aws.resource.id
```

## Analyze Load Balancer Distribution

Count load balancers by type and region:

```dql
smartscapeNodes ["AWS_ELASTICLOADBALANCINGV2_LOADBALANCER", "AWS_ELASTICLOADBALANCING_LOADBALANCER"]
| summarize lb_count = count(), by: {type, aws.region}
| sort lb_count desc
```

## Find Load Balancers by VPC

List all load balancers in a VPC:

```dql
smartscapeNodes "AWS_ELASTICLOADBALANCINGV2_LOADBALANCER"
| filter aws.vpc.id == "vpc-0be61db7c5d2d1bd1"
| fields name, aws.resource.id, aws.subnet.id
```

## Find Load Balancer Security Groups

List security groups attached to load balancers:

```dql
smartscapeNodes "AWS_ELASTICLOADBALANCINGV2_LOADBALANCER"
| fields name, aws.resource.id, aws.security_group.id
| expand aws.security_group.id
```

## Analyze API Gateway by Region

Count APIs across regions:

```dql
smartscapeNodes ["AWS_APIGATEWAY_RESTAPI", "AWS_APIGATEWAYV2_API"]
| summarize api_count = count(), by: {type, aws.region}
| sort api_count desc
```

## Find Multi-AZ Load Balancers

Check load balancer availability zone distribution:

```dql
smartscapeNodes "AWS_ELASTICLOADBALANCINGV2_LOADBALANCER"
| fields name, aws.resource.id, aws.availability_zone
| expand aws.availability_zone
```
