# Shopiators API Request Logging

Every API request made to the Shopiators Public API is centrally logged.

## Request ID

All API responses include a unique `X-Request-ID` HTTP header. 

Additionally, if the response envelope supports JSON metadata, the JSON body will include `"debug_id"` matching the request ID.

### Example Successful Response

```json
{
  "success": true,
  "data": { ... },
  "debug_id": "req_847120a1bc304d9e9e1c210d3211a510"
}
```

### Example Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters"
  },
  "debug_id": "req_f481023a9b1c0451db92a10d9e843b12"
}
```

## Reporting Problems

When contacting Shopiators support regarding a failing API request, **you must include the Request ID (`X-Request-ID` or `debug_id`)**. This allows our engineers to safely locate the exact request payload, latency metrics, and backend error details without exposing sensitive system internals.

## Storage and Retention

- Logs are written locally to rotating daily files in the `logs/` directory (e.g., `api-logs-2023-10-01.jsonl`).
- A background task automatically deletes files older than **30 days** (configurable via the `API_LOG_RETENTION_DAYS` environment variable).
- Sensitive headers (e.g., Authorization), passwords, and raw payloads are actively redacted from the logs.
