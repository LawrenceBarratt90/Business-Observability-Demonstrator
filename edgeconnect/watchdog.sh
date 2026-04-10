#!/bin/bash
# EdgeConnect watchdog — restarts the container if it's not running or stale
# Runs every 5 minutes via cron:
#   */5 * * * * /home/ec2-user/Business-Observability-Demonstrator/edgeconnect/watchdog.sh >> /tmp/ec-watchdog.log 2>&1

CONTAINER="edgeconnect-bizobs"
CONFIG="/home/ec2-user/Business-Observability-Demonstrator/edgeconnect/edgeConnect.yaml"
LOG_FILE="/tmp/ec-watchdog.log"

# Trim log file if it gets too big (>1MB)
if [[ -f "$LOG_FILE" ]] && [[ $(stat -c%s "$LOG_FILE" 2>/dev/null || echo 0) -gt 1048576 ]]; then
  tail -100 "$LOG_FILE" > "${LOG_FILE}.tmp" && mv "${LOG_FILE}.tmp" "$LOG_FILE"
fi

STATUS=$(docker inspect --format='{{.State.Status}}' "$CONTAINER" 2>/dev/null)

if [[ "$STATUS" != "running" ]]; then
  echo "$(date): Container $CONTAINER is ${STATUS:-missing} — starting..."
  docker rm "$CONTAINER" 2>/dev/null
  docker run -d \
    --name "$CONTAINER" \
    --restart always \
    -v "$CONFIG:/edgeConnect.yaml:ro" \
    dynatrace/edgeconnect:latest
  echo "$(date): Container restarted."
else
  # Container is running — check if the process inside has recent log activity
  # EdgeConnect reconnects every ~3 minutes, so >10 min of silence = stale
  LAST_LOG=$(docker logs --tail 1 --timestamps "$CONTAINER" 2>&1 | head -1 | grep -oP '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}')
  if [[ -n "$LAST_LOG" ]]; then
    LAST_EPOCH=$(date -d "$LAST_LOG" +%s 2>/dev/null || echo 0)
    NOW_EPOCH=$(date +%s)
    AGE=$(( NOW_EPOCH - LAST_EPOCH ))
    if [[ $AGE -gt 600 ]]; then
      echo "$(date): Container $CONTAINER last log activity ${AGE}s ago (>600s) — restarting..."
      docker restart "$CONTAINER"
      echo "$(date): Container restarted due to stale logs."
    fi
  fi
fi
