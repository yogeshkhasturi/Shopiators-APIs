# Admin Logs API Guide for Super Admins

This document provides instructions for Super Admins on how to use the Admin Logs API to fetch, search, and analyze logs across all Shopiators APIs.

## Base URL
All Admin Logs API endpoints are relative to:
`/api/v1/admin/logs`

## Authentication

Use `Authorization` header with the Bearer token configured in the environment:
```http
Authorization: Bearer <ADMIN_LOGS_TOKEN>
```

---

## Endpoints

### 1. Fetch and Search API Logs
**Endpoint:** `GET /api/v1/admin/logs`

Retrieves a paginated list of API logs. You can use various query parameters to filter and sort the logs to find specific requests, errors, or performance bottlenecks.

**Query Parameters:**
- `page` (number): The page number for pagination.
- `limit` (number): The number of logs per page.
- `search` (string): Text search across log messages (max 100 chars).
- `method` (string): Filter by HTTP method (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
- `path` (string): Filter by the API path requested (e.g., `/api/v1/products`).
- `statusCode` (number): Filter by a specific 3-digit HTTP status code (e.g., `500`, `400`).
- `tenantId` (string): Filter by a specific store/tenant ID.
- `appId` (string): Filter by a specific application ID.
- `errorCode` (string): Filter by a specific internal error code.
- `startDate` (ISO 8601 datetime string): Start date for the log query.
- `endDate` (ISO 8601 datetime string): End date for the log query (must be >= `startDate`).
- `minDuration` (number): Filter logs with a response time greater than or equal to this value (in milliseconds).
- `maxDuration` (number): Filter logs with a response time less than or equal to this value (in milliseconds).
- `sortBy` (string): Sort the results by `timestamp`, `durationMs`, `statusCode`, `method`, or `path`.
- `sortOrder` (string): `asc` or `desc`.

**Example Request:**
```http
GET /api/v1/admin/logs?method=POST&statusCode=500&sortBy=timestamp&sortOrder=desc&limit=50
```

---

### 2. Get API Usage Statistics
**Endpoint:** `GET /api/v1/admin/logs/stats`

Retrieves aggregated statistics about API usage, including total requests, error rates, and average response times.

**Query Parameters (Optional):**
- `startDate` (ISO 8601 datetime string)
- `endDate` (ISO 8601 datetime string)
- `tenantId` (string)
- `appId` (string)

**Example Request:**
```http
GET /api/v1/admin/logs/stats?tenantId=store-slug-123
```

---

### 3. Get Specific Log by Request ID
**Endpoint:** `GET /api/v1/admin/logs/:requestId`

Fetches the complete, detailed log entry for a specific API request using its unique `x-request-id`.

**Path Parameters:**
- `requestId` (string): The unique ID of the request (max 100 chars).

**Example Request:**
```http
GET /api/v1/admin/logs/req-1693829482012
```

## Tips for Super Admins

> [!TIP]
> - **Identifying Bottlenecks:** Use `minDuration=2000` to find all API requests that took longer than 2 seconds to respond.
> - **Error Tracking:** Use `statusCode=500` or search for specific `errorCode` values to investigate platform-wide errors.
> - **Tenant Monitoring:** Filter by `tenantId` to review API usage or troubleshoot specific issues for a single store.
