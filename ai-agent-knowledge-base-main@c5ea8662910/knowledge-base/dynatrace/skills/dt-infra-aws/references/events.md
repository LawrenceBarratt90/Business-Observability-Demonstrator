# AWS Events Reference

Event queries for problem timeline analysis. Use these during incident investigation to determine what changed before or during a problem on an AWS resource.

## Placeholder Reference

| Placeholder | Description |
|---|---|
| `<PROBLEM_START>` | Problem start timestamp (e.g., `now()-2h`) |
| `<PROBLEM_END>` | Problem end timestamp (e.g., `now()`) |
| `<ROOT_CAUSE_ENTITY_ID>` | Dynatrace entity ID of the affected resource (e.g., `AWS_EC2_INSTANCE-ABC123`) |
| `<AWS_INSTANCE_ID>` | AWS resource ID of the affected resource (e.g., `i-0abc1234def56789`) |

---

## Auto Scaling Events

List recent Auto Scaling activity. Run this first during any EC2 instance problem to detect scale-in/scale-out events, lifecycle hooks, or capacity changes that may have caused or contributed to the issue.

```dql
fetch events
| filter source == "aws.autoscaling"
| fields timestamp, event.type, event.name, data
| sort timestamp desc
| limit 50
```

**Note:** This query returns the most recent 50 events globally. For incident-scoped analysis, add a time range:

```dql
fetch events, from: <PROBLEM_START>, to: <PROBLEM_END>
| filter source == "aws.autoscaling"
| fields timestamp, event.type, event.name, data
| sort timestamp desc
```

---

## AWS Health Events

Query for AWS Health service events affecting the specific resource. AWS Health events indicate service disruptions, scheduled maintenance, or account-level notifications from AWS.

```dql
fetch events, from: <PROBLEM_START - 1h>, to: <PROBLEM_END + 1h>
| filter event.provider == "aws.health"
| filter contains(toString(affected_entity_ids), "<ROOT_CAUSE_ENTITY_ID>")
    or contains(toString(event.description), "<AWS_INSTANCE_ID>")
| fields timestamp, event.name, event.description, event.category, affected_entity_ids
| sort timestamp desc
```

**What to look for:**

- `event.category == "issue"` — active service disruption from AWS
- `event.category == "scheduledChange"` — planned maintenance (e.g., instance retirement)
- `event.category == "accountNotification"` — account-level notifications

---

## CloudFormation Events

Check for recent CloudFormation stack deployments or changes. Infrastructure changes via CloudFormation are a common cause of problems — correlate stack events with the problem timeline.

```dql
fetch events, from: <PROBLEM_START - 2h>, to: <PROBLEM_END + 1h>
| filter event.provider == "aws.cloudformation"
| fields timestamp, event.name, event.description, event.category
| sort timestamp desc
| limit 20
```

**What to look for:**

- Stack updates that completed shortly before the problem started
- Failed stack operations that may have left resources in a degraded state
- Resource replacements (e.g., instance replaced due to a launch template change)
