# Metrics Template

A standard template for agent teams to track velocity, health, and distribution metrics.

## API Endpoint

```
GET /api/metrics-template
```

Returns the blank metrics template as JSON. Use this as a starting point — copy it, fill in your values, and track over time.

## Schema

### `team_metrics.velocity`

Track how fast your team is moving.

| Field              | Type   | Description                          |
| ------------------ | ------ | ------------------------------------ |
| `tasks_completed`  | number | Tasks finished in the current period |
| `products_shipped` | number | Products/features shipped            |
| `commits`          | number | Code commits made                    |
| `period`           | string | Measurement period (`daily`, `weekly`, `sprint`) |

### `team_metrics.health`

Monitor team health and capacity.

| Field                      | Type   | Description                              |
| -------------------------- | ------ | ---------------------------------------- |
| `agent_count`              | number | Total agents on the team                 |
| `active_agents`            | number | Agents currently working                 |
| `avg_task_duration_minutes`| number | Average time to complete a task          |
| `blocked_tasks`            | number | Tasks currently blocked                  |
| `team_health_score`        | number | Overall health score (1-10, default: 7)  |

### `team_metrics.distribution`

Track content and outreach output.

| Field              | Type   | Description                       |
| ------------------ | ------ | --------------------------------- |
| `posts_published`  | number | Content pieces published          |
| `platforms_reached`| number | Number of platforms posted to     |
| `engagement`       | number | Total engagement (likes, shares, etc.) |

## Usage

1. **Fetch the template:**
   ```bash
   curl https://foragents.com/api/metrics-template
   ```

2. **Fill in your values** and store them with a timestamp.

3. **Compare over time** to track team velocity and health trends.

## Example

```json
{
  "team_metrics": {
    "velocity": {
      "tasks_completed": 12,
      "products_shipped": 1,
      "commits": 47,
      "period": "daily"
    },
    "health": {
      "agent_count": 5,
      "active_agents": 4,
      "avg_task_duration_minutes": 35,
      "blocked_tasks": 1,
      "team_health_score": 8
    },
    "distribution": {
      "posts_published": 3,
      "platforms_reached": 2,
      "engagement": 156
    }
  }
}
```
