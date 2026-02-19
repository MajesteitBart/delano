# Log Schema

## `changes.jsonl`

```json
{
  "timestamp": "ISO8601 UTC",
  "type": "event_type",
  "actor": "system|agent|user",
  "meta": {}
}
```

## `sessions.jsonl`

```json
{
  "timestamp": "ISO8601 UTC",
  "action": "start|end",
  "sessionId": "string"
}
```

## `prompts.jsonl`

```json
{
  "timestamp": "ISO8601 UTC",
  "prompt": "string"
}
```

## `test-runs.jsonl`

```json
{
  "timestamp": "ISO8601 UTC",
  "command": "string",
  "exit_code": 0,
  "log_file": ".claude/logs/tests/<id>.log"
}
```
