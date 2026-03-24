---
name: dt-dql-essentials
description: REQUIRED before generating any DQL queries. Provides critical syntax rules, common pitfalls, and patterns. Load this skill BEFORE writing DQL to avoid syntax errors.
license: Apache-2.0
---

# DQL Essentials Skill

DQL is a pipeline-based query language. Queries chain commands with `|` to filter, transform, and aggregate data. DQL has unique syntax that differs from SQL — load this skill before writing any DQL query.

______________________________________________________________________

## Use Cases

Before working on specific use cases, load the relevant reference:

| Use Case                                                                      | Required Reading                                                                             |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Query optimization (filter early, time ranges, field selection, performance)  | [references/optimization.md](references/optimization.md)                                     |
| Smartscape topology navigation for discovering relationships between entities | [references/smartscape-topology-navigation.md](references/smartscape-topology-navigation.md) |

> More use cases will be added here.

______________________________________________________________________

## Syntax Pitfalls

| ❌ Wrong                                      | ✅ Right                        | Issue                                                                |
| --------------------------------------------- | ------------------------------- | -------------------------------------------------------------------- |
| `filter field in ["a", "b"]`                  | `filter in(field, "a", "b")`    | No array literal syntax                                              |
| `by: severity, status`                        | `by: {severity, status}`        | Multiple grouping fields require curly braces                        |
| `contains(toLowercase(field), "err")`         | `contains(field, "err")`        | `contains()` is already case-insensitive — no case conversion needed |
| `filter name == "*serv*9*"`                   | `filter contains(name, "serv")` | Mid-string wildcards not allowed; use `contains()`                   |
| `matchesValue(field, "prod")` on string field | `contains(field, "prod")`       | `matchesValue()` is for array fields only                            |
| `toLowercase(field)`                          | *(no equivalent)*               | Function does not exist in DQL                                       |
| `arrayAvg(field[])` or `arraySum(field[])`    | `arrayAvg(field)` or `field[]`  | `field[]` = element-wise (array→array); `arrayAvg(field)` = collapse to scalar. Never mix both. |
| `my_field` after `lookup` or `join`           | `lookup.my_field` / `right.my_field` | `lookup` prefixes fields with `lookup.`; `join` prefixes right-side fields with `right.` |
| `substring(field, 0, 200)`                    | `substring(field, from: 0, to: 200)` | DQL functions use **named parameters** — positional args cause `TOO_MANY_POSITIONAL_PARAMETERS` |

______________________________________________________________________

## Time Alignment (@-operator)

The `@` operator aligns timestamps to a boundary — agents often get this wrong.

| Expression   | Meaning                                                     |
| ------------ | ----------------------------------------------------------- |
| `now()@h`    | Current time, aligned to the hour boundary                  |
| `now()@d`    | Midnight today                                              |
| `now()@w1`   | Monday this week                                            |
| `now()-2h@h` | 2 hours ago, aligned to the hour (offset first, then align) |

**Rules:**

- Order: offset before alignment — `now()-2h@h`, not `now()@h-2h`

→ [references/timeframe.md](references/timeframe.md)

______________________________________________________________________

## Entity Field Patterns

Entity fields in DQL are scoped to specific entity types — not universal like SQL columns.

- `entity.id` **does not exist** — use `dt.entity.<type>` instead:

| Entity             | ID field                       |
| ------------------ | ------------------------------ |
| Host               | `dt.entity.host`               |
| Service            | `dt.entity.service`            |
| Process group      | `dt.entity.process_group`      |
| Kubernetes cluster | `dt.entity.kubernetes_cluster` |

- The field `dt.entity.host` holds the ID value (e.g. `HOST-BEBD5A98E4439615`). For the name: `entityName(dt.entity.host)`
- **`entityName()` only works with `dt.entity.*` fields** — it fails on other entity references like `dt.rum.application.entity`. For those, use `lookup`:
  ```dql
  | lookup [fetch dt.entity.application], sourceField: dt.rum.application.entity, lookupField: id, fields: {entity.name}
  ```
- **To inspect available fields on an entity type:** `fetch dt.entity.<host|service|...> | limit 1`
- **To look up an entity ID by name:**
  ```dql
  fetch dt.entity.host
  | filter entity.name == "my-host"
  | fields id, entity.name
  ```

______________________________________________________________________

## Smartscape Entity Patterns

Use `smartscapeNodes` (not `fetch dt.entity.*`) for topology queries. Node types are uppercase strings — different from `dt.entity.*` naming.

| Entity      | `fetch` type                   | `smartscapeNodes` type |
| ----------- | ------------------------------ | ---------------------- |
| Host        | `dt.entity.host`               | `"HOST"`               |
| Service     | `dt.entity.service`            | `"SERVICE"`            |
| K8s cluster | `dt.entity.kubernetes_cluster` | `"K8S_CLUSTER"`        |

Use toSmartscapeId() for ID conversion from strings (required!).

→ [references/smartscape-topology-navigation.md](references/smartscape-topology-navigation.md)

______________________________________________________________________

## matchesValue() Usage

Use `matchesValue()` for **array fields** such as `dt.tags`:

```dql
| filter matchesValue(dt.tags, "env:production")
```

- **Not** for string fields with special characters — use `contains()` for those
- `matchesValue()` on a scalar string field does not behave like a wildcard or fuzzy match

______________________________________________________________________

## References

- **[references/timeframe.md](references/timeframe.md)** — Time expressions and `@`-alignment
- **[references/iterative_expressions.md](references/iterative_expressions.md)** — Array and timeseries manipulation (creation, modifications, use in filters) using DQL
- **[references/smartscape-topology-navigation.md](references/smartscape-topology-navigation.md)** — Smartscape topology navigation syntax and patterns
- **[references/optimization.md](references/optimization.md)** — DQL query optimization: filter placement, time ranges, field selection, and performance best practices
