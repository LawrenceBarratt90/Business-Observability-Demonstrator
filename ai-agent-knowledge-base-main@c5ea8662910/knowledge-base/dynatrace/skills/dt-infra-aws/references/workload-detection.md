# Workload Detection Reference

Identify how an EC2 instance is orchestrated. Run these detection queries during problem analysis to determine which orchestration system manages the affected instance — this determines the correct resolution path.

## Overview

EC2 instances can be managed by different orchestration systems, each requiring a different resolution approach. Run the detection queries below to identify the workload pattern before following a resolution path.

**Workload Pattern Summary**

| Tag Present | Workload Pattern | Resolution Path |
|---|---|---|
| `AmazonECSManaged` | ECS container instance | See Step 7: ECS |
| `kubernetes.io/cluster/<name>` | EKS / Kubernetes node | See Step 7: EKS/K8s |
| `AWSBatchServiceTag` | AWS Batch compute node | See Step 7: Batch |
| `aws:autoscaling:groupName` only | Generic ASG / web tier | See Step 7: ASG |
| None of the above | Standalone instance | See Step 7: standalone |

Replace `<ROOT_CAUSE_ENTITY_ID>` with the Dynatrace entity ID of the affected instance (e.g., `AWS_EC2_INSTANCE-ABC123`).

---

## 1. Load Balancer Detection

Determine if the instance is registered in a target group behind an Application or Network Load Balancer.

```dql
smartscapeNodes "AWS_EC2_INSTANCE"
| filter id == "<ROOT_CAUSE_ENTITY_ID>"
| traverse "balanced_by", "AWS_ELASTICLOADBALANCINGV2_TARGETGROUP", direction:backward
| fieldsAdd targetGroupName = aws.resource.name, targetGroupId = id
| traverse "balanced_by", "AWS_ELASTICLOADBALANCINGV2_LOADBALANCER", fieldsKeep:{targetGroupName, targetGroupId}
| parse aws.object, "JSON:awsjson"
| fieldsAdd
    lbDnsName = awsjson[configuration][dnsName],
    lbScheme = awsjson[configuration][scheme],
    lbType = awsjson[configuration][type]
| fields name, lbDnsName, lbScheme, lbType, targetGroupName,
         dt.traverse.history[-1][targetGroupId]
```

**If results returned:** The instance is behind a load balancer. Record the ALB/NLB name and `lbScheme` (`internet-facing` vs `internal`) — this is critical for resolution (e.g., traffic can be shifted away before remediation).

---

## 2. Auto Scaling Group Detection

Determine if the instance is part of an Auto Scaling Group and check current capacity vs configured limits.

```dql
smartscapeNodes "AWS_AUTOSCALING_AUTOSCALINGGROUP"
| parse aws.object, "JSON:awsjson"
| fieldsAdd
    minSize = awsjson[configuration][minSize],
    maxSize = awsjson[configuration][maxSize],
    desiredCapacity = awsjson[configuration][desiredCapacity]
| traverse "is_part_of", "AWS_EC2_INSTANCE", direction:backward
| filter id == "<ROOT_CAUSE_ENTITY_ID>"
| fieldsAdd asgName = dt.traverse.history[-1][name],
            asgMin = dt.traverse.history[-1][minSize],
            asgMax = dt.traverse.history[-1][maxSize],
            asgDesired = dt.traverse.history[-1][desiredCapacity]
| fields name, id, asgName, asgMin, asgMax, asgDesired
```

**If results returned:** Record `asgName`, `asgMin`, `asgMax`, and `asgDesired` — if `asgDesired < asgMax`, scale-out is possible. If `asgDesired == asgMax`, the ASG is at capacity and cannot scale further without a limit change.

---

## 3. ECS Detection

Detect whether the instance is an ECS container instance, managed by ECS for running containerized tasks.

**Step 1 — Detect by tag:**

```dql
smartscapeNodes "AWS_EC2_INSTANCE"
| filter id == "<ROOT_CAUSE_ENTITY_ID>"
| filter isNotNull(tags[`AmazonECSManaged`])
| fields name, id, tags[`aws:autoscaling:groupName`]
```

**Step 2 — If matched, find the ECS cluster:**

```dql
smartscapeNodes "AWS_EC2_INSTANCE"
| filter id == "<ROOT_CAUSE_ENTITY_ID>"
| traverse {"*"}, {"AWS_ECS_CONTAINERINSTANCE"}, direction:backward
| traverse {"*"}, {"AWS_ECS_CLUSTER"}
| fields name, id, aws.resource.id
```

**Record:** ECS cluster name and ID — needed for resolution guidance (e.g., draining the container instance, scaling the ECS service).

---

## 4. EKS / Kubernetes Node Detection

Detect whether the instance is a Kubernetes worker node managed by EKS, and identify the node management mechanism (Karpenter, Cluster Autoscaler, EKS Managed Node Group, or eksctl).

**Step 1 — Detect by tag and extract node manager details:**

```dql
smartscapeNodes "AWS_EC2_INSTANCE"
| filter id == "<ROOT_CAUSE_ENTITY_ID>"
| fieldsAdd tagStr = toString(tags)
| filter matchesPhrase(tagStr, "kubernetes.io/cluster")
| fieldsAdd
    eksClusterName = tags[`aws:eks:cluster-name`],
    nodegroupName = tags[`eks:nodegroup-name`],
    karpenterManagedBy = tags[`karpenter.sh/managed-by`],
    karpenterNodepool = tags[`karpenter.sh/nodepool`],
    casEnabled = tags[`k8s.io/cluster-autoscaler/enabled`],
    eksctlNodegroupName = tags[`alpha.eksctl.io/nodegroup-name`],
    eksctlNodegroupType = tags[`alpha.eksctl.io/nodegroup-type`]
| fields name, id, eksClusterName, nodegroupName, karpenterManagedBy,
         karpenterNodepool, casEnabled, eksctlNodegroupName, eksctlNodegroupType
```

**Step 2 — Find the EKS cluster entity:**

```dql
smartscapeNodes "AWS_EKS_CLUSTER"
| filter aws.resource.name == "<EKS_CLUSTER_NAME>"
| fields name, id, aws.resource.id, aws.region
```

Replace `<EKS_CLUSTER_NAME>` with the value from `eksClusterName` in Step 1.

**Step 3 — Determine the node manager from the extracted fields:**

| Field present | Node manager |
|---|---|
| `karpenter.sh/managed-by` is set | **Karpenter** |
| `k8s.io/cluster-autoscaler/enabled` is set | **Cluster Autoscaler** + ASG |
| `eks:nodegroup-name` is set (no eksctl prefix) | **EKS Managed Node Group** |
| `alpha.eksctl.io/nodegroup-name` + `nodegroup-type: unmanaged` | **eksctl unmanaged node group** + ASG |
| `alpha.eksctl.io/nodegroup-name` + `nodegroup-type: managed` | **eksctl managed node group** (EKS MNG) |

**Record:** EKS cluster name, node manager type, and node pool / node group name — needed for resolution guidance (e.g., cordon/drain via kubectl, scale Karpenter node pool, or update ASG desired capacity).

---

## 5. AWS Batch Detection

Detect whether the instance is a compute environment node managed by AWS Batch.

```dql
smartscapeNodes "AWS_EC2_INSTANCE"
| filter id == "<ROOT_CAUSE_ENTITY_ID>"
| filter isNotNull(tags[`AWSBatchServiceTag`])
| fieldsAdd
    batchJobQueue = tags[`aws:batch:job-queue-name`],
    batchComputeEnv = tags[`aws:batch:compute-environment-name`]
| fields name, id, batchJobQueue, batchComputeEnv, tags
```

**Record:** Batch compute environment name (`batchComputeEnv`) and job queue (`batchJobQueue`) — needed for resolution guidance (e.g., disabling the compute environment, draining the job queue).
