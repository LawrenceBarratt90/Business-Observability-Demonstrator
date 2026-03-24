# AWS Messaging & Event Streaming

Monitor SQS queues, SNS topics, EventBridge, Kinesis, and MSK clusters.

## List All SQS Queues

Get all SQS queues:

```dql
smartscapeNodes "AWS_SQS_QUEUE"
| fields name, aws.account.id, aws.region, aws.resource.id
```

## Find SQS Queues by Tag

Filter queues by tags:

```dql
smartscapeNodes "AWS_SQS_QUEUE"
| filter tags[Environment] == "production"
| fields name, aws.resource.id, aws.region
```

## Analyze SQS Distribution

Count queues by region:

```dql
smartscapeNodes "AWS_SQS_QUEUE"
| summarize queue_count = count(), by: {aws.region, aws.account.id}
| sort queue_count desc
```

## List All SNS Topics

Get all SNS topics:

```dql
smartscapeNodes "AWS_SNS_TOPIC"
| fields name, aws.account.id, aws.region, aws.resource.id
```

## Find SNS Topics by Region

Group topics by region:

```dql
smartscapeNodes "AWS_SNS_TOPIC"
| summarize topic_count = count(), by: {aws.region}
| sort topic_count desc
```

## List EventBridge Event Buses

Get all event buses:

```dql
smartscapeNodes "AWS_EVENTS_EVENTBUS"
| fields name, aws.account.id, aws.region, aws.resource.id
```

## Find Custom Event Buses

Filter for non-default event buses:

```dql
smartscapeNodes "AWS_EVENTS_EVENTBUS"
| filter name != "default"
| fields name, aws.resource.id, aws.region
```

## List Kinesis Firehose Delivery Streams

Get Firehose streams:

```dql
smartscapeNodes "AWS_KINESISFIREHOSE_DELIVERYSTREAM"
| fields name, aws.account.id, aws.region, aws.resource.id
```

## List MSK Clusters

Get Managed Kafka clusters:

```dql
smartscapeNodes "AWS_MSK_CLUSTER"
| fields name, aws.account.id, aws.region, aws.vpc.id
```

## Find MSK Clusters in VPC

Filter Kafka clusters by VPC:

```dql
smartscapeNodes "AWS_MSK_CLUSTER"
| filter aws.vpc.id == "vpc-0be61db7c5d2d1bd1"
| fields name, aws.resource.id, aws.subnet.id
```

## Analyze Messaging Services Distribution

Count all messaging resources:

```dql
smartscapeNodes ["AWS_SQS_QUEUE", "AWS_SNS_TOPIC", "AWS_EVENTS_EVENTBUS"]
| summarize resource_count = count(), by: {type, aws.region}
| sort resource_count desc
```

## Find Step Functions State Machines

List Step Functions:

```dql
smartscapeNodes "AWS_STEPFUNCTIONS_STATEMACHINE"
| fields name, aws.account.id, aws.region, aws.resource.id
```

## Analyze Streaming Resources

Count streaming services by type:

```dql
smartscapeNodes ["AWS_KINESISFIREHOSE_DELIVERYSTREAM", "AWS_MSK_CLUSTER"]
| summarize count = count(), by: {type, aws.region}
| sort count desc
```

## Find All Messaging Resources by Account

List messaging resources for an account:

```dql
smartscapeNodes ["AWS_SQS_QUEUE", "AWS_SNS_TOPIC", "AWS_EVENTS_EVENTBUS", "AWS_MSK_CLUSTER"]
| filter aws.account.id == "123456789012"
| fields type, name, aws.region, aws.resource.id
```

## List SQS Queues by Name Pattern

Find queues matching a pattern:

```dql
smartscapeNodes "AWS_SQS_QUEUE"
| filter matchesPhrase(name, "orders")
| fields name, aws.resource.id, aws.region
```

## Find SNS Topics by Name Pattern

Find topics matching a pattern:

```dql
smartscapeNodes "AWS_SNS_TOPIC"
| filter matchesPhrase(name, "notification")
| fields name, aws.resource.id, aws.region
```

## Analyze MSK Multi-AZ Distribution

Check Kafka cluster availability zones:

```dql
smartscapeNodes "AWS_MSK_CLUSTER"
| fields name, aws.resource.id, aws.availability_zone, aws.vpc.id
| expand aws.availability_zone
```

## Count All Async Resources

Total count of async messaging resources:

```dql
smartscapeNodes ["AWS_SQS_QUEUE", "AWS_SNS_TOPIC", "AWS_EVENTS_EVENTBUS", "AWS_KINESISFIREHOSE_DELIVERYSTREAM", "AWS_MSK_CLUSTER", "AWS_STEPFUNCTIONS_STATEMACHINE"]
| summarize total = count(), by: {type}
| sort total desc
```
