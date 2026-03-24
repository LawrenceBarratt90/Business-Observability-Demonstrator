# DQL Time Alignment Reference

## @ Alignment Operator

Aligns timestamps to time unit boundaries. Agents commonly fail this pattern.

**Syntax:** `now()@<unit>`

| Unit  | Meaning                     |
| ----- | --------------------------- |
| `@h`  | Current hour start          |
| `@d`  | Current day start           |
| `@w1` | Current week start (Monday) |
| `@M`  | Current month start         |
| `@q`  | Current quarter start       |
| `@y`  | Current year start          |

**CRITICAL:** No space between `@` and the unit — `now()@h` not `now() @h`

**Combined offset + alignment:** Apply offset first, then align.

- `now()-2h@h` → go back 2 hours, then align to hour boundary
- `now()-1d@d` → yesterday's start
- `now()-1w@w1` → last week's start

**Examples:**

```
| timeframe from:now()-1h@h to:now()@h     // current complete hour
| timeframe from:now()-1d@d to:now()@d     // yesterday complete  
| timeframe from:now()@M to:now()           // this month so far
```

## m vs M

- `m` = minutes
- `M` = months

Example: `now()-30m` (30 minutes ago) vs `now()-1M` (1 month ago)

## Absolute Timestamps

Use ISO 8601 format:

```
| timeframe from:"2024-01-15T08:00:00Z" to:"2024-01-15T09:00:00Z"
```
