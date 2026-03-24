# AWS VPC Networking & Security

Monitor and troubleshoot AWS VPC network infrastructure, security groups, and connectivity.

## List All VPCs

Get all VPCs with their basic information:

```dql
smartscapeNodes "AWS_EC2_VPC"
| fields name, aws.account.id, aws.region, aws.resource.id, aws.vpc.id
```

## Find EC2 Instances in a Specific VPC

Filter instances by VPC ID:

```dql
smartscapeNodes "AWS_EC2_INSTANCE"
| filter aws.vpc.id == "vpc-0be61db7c5d2d1bd1"
| fields name, aws.resource.id, aws.subnet.id, aws.availability_zone
```

## Analyze Security Group Usage

Find all instances and their security groups:

```dql
smartscapeNodes "AWS_EC2_INSTANCE"
| fields name, aws.resource.id, aws.vpc.id, aws.security_group.id
| expand aws.security_group.id
```

## Find Resources by Security Group

Locate all resources using a specific security group:

```dql
smartscapeNodes "AWS_EC2_INSTANCE"
| filter contains(aws.security_group.id, "sg-184e3ddb341dd478b")
| fields name, aws.resource.id, aws.vpc.id, aws.subnet.id
```

## Discover Subnet Distribution

Count resources per subnet:

```dql
smartscapeNodes "AWS_EC2_INSTANCE"
| summarize instance_count = count(), by: {aws.vpc.id, aws.subnet.id}
| sort instance_count desc
```

## Map VPC Resources

Get all resources in a VPC grouped by type:

```dql
smartscapeNodes "AWS_*"
| filter aws.vpc.id == "vpc-0be61db7c5d2d1bd1"
| summarize resource_count = count(), by: {type, aws.subnet.id}
| sort resource_count desc
```

## Find Internet-Facing Resources

Locate instances with public IPs:

```dql
smartscapeNodes "AWS_EC2_INSTANCE"
| parse aws.object, "JSON:awsjson"
| fieldsAdd publicIp = awsjson[configuration][networkInterfaces][0][association][publicIp]
| filter isNotNull(publicIp)
| fields name, aws.resource.id, publicIp, aws.vpc.id
```

## Analyze Network Interfaces

List network interfaces and their attachments:

```dql
smartscapeNodes "AWS_EC2_NETWORKINTERFACE"
| fields name, aws.resource.id, aws.vpc.id, aws.subnet.id, aws.security_group.id
```

## Find NAT Gateways

Get all NAT gateways by VPC:

```dql
smartscapeNodes "AWS_EC2_NATGATEWAY"
| fields name, aws.resource.id, aws.vpc.id, aws.subnet.id
| summarize nat_count = count(), by: {aws.vpc.id}
```

## Discover VPN Connections

List VPN connections and gateways:

```dql
smartscapeNodes "AWS_EC2_VPNGATEWAY"
| fields name, aws.resource.id, aws.vpc.id, aws.region
```

## Find VPC Endpoints

List VPC endpoints for private connectivity:

```dql
smartscapeNodes "AWS_EC2_VPCENDPOINT"
| fields name, aws.resource.id, aws.vpc.id, aws.subnet.id
```

## Analyze Cross-VPC Connectivity

Find VPC peering connections:

```dql
smartscapeNodes "AWS_EC2_VPCPEERINGCONNECTION"
| fields name, aws.resource.id, aws.vpc.id, aws.region
```

## Security Group Association Analysis

Find instances with multiple security groups:

```dql
smartscapeNodes "AWS_EC2_INSTANCE"
| parse aws.object, "JSON:awsjson"
| fieldsAdd sg_count = arraySize(awsjson[configuration][securityGroups])
| filter sg_count > 1
| fields name, aws.resource.id, aws.security_group.id, sg_count
| sort sg_count desc
```

## Find Resources Without Security Groups

Identify potential misconfigurations:

```dql
smartscapeNodes "AWS_EC2_INSTANCE"
| filter isNull(aws.security_group.id) or aws.security_group.id == ""
| fields name, aws.resource.id, aws.vpc.id, aws.account.id
```

## Analyze Availability Zone Distribution

View instance distribution across AZs:

```dql
smartscapeNodes "AWS_EC2_INSTANCE"
| summarize
    instance_count = count(),
    by: {aws.region, aws.availability_zone, aws.vpc.id}
| sort aws.region, instance_count desc
```
