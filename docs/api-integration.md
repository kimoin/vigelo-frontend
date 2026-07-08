# API Integration

## Purpose

The mobile app integrates with VSRV only. VSRV converts product requests into
VNMS actions and returns mobile-ready models.

## API Boundary

```text
Mobile app -> VSRV HTTPS JSON API
Mobile app -x-> VNMS
```

The app must not call VNMS, consume VNMS OpenAPI directly, or depend on VNMS
event payloads.

## Client Generation

Once VSRV publishes OpenAPI:

- Generate or type the API client from the VSRV OpenAPI spec.
- Keep generated code isolated from app state/UI code.
- Add a small handwritten API wrapper for auth refresh, request IDs, and error
  normalization.
- Use fixtures/mocks from the OpenAPI examples for UI development.

## Authentication Handling

The app stores:

- Access/session token.
- Refresh token.
- Token expiry if provided.

Storage:

- iOS Keychain.
- Android secure storage.

Request flow:

```text
request
  -> attach access token
  -> if 401 and refresh token exists:
       call refresh endpoint
       store rotated tokens
       retry original request once
  -> if refresh fails:
       clear tokens
       return to login
```

Do not retry mutations blindly unless endpoint is idempotent or the API provides
an idempotency key.

## Expected API Areas

Authentication:

```http
POST /v1/auth/signup
POST /v1/auth/login
POST /v1/auth/refresh
POST /v1/auth/logout
GET  /v1/me
```

Households:

```http
GET  /v1/households
POST /v1/households
GET  /v1/households/{household_id}
```

Devices:

```http
POST /v1/households/{household_id}/device-claims
GET  /v1/households/{household_id}/devices
GET  /v1/devices/{device_binding_id}
PATCH /v1/devices/{device_binding_id}
POST /v1/devices/{device_binding_id}/remove
```

Monitored hours:

```http
GET /v1/devices/{device_binding_id}/monitored-windows
PUT /v1/devices/{device_binding_id}/monitored-windows
```

Activity and alerts:

```http
GET  /v1/devices/{device_binding_id}/activity
GET  /v1/devices/{device_binding_id}/alerts
POST /v1/devices/{device_binding_id}/alerts/{alert_id}/ack
```

Subscription:

```http
GET  /v1/devices/{device_binding_id}/subscription
POST /v1/devices/{device_binding_id}/subscription/checkout
POST /v1/devices/{device_binding_id}/subscription/portal
```

Push:

```http
POST   /v1/push-tokens
DELETE /v1/push-tokens/{push_token_id}
```

## Device Model Expected By App

The app should expect a VSRV product model like:

```json
{
  "id": "devbind_123",
  "display_name": "Living room",
  "status": "online",
  "last_seen_at": "2026-07-08T12:00:00Z",
  "battery_voltage_v": 3.0,
  "battery_status": "ok",
  "subscription_status": "active",
  "monitored_windows_delivery_state": "delivered",
  "active_alert_count": 0
}
```

Fields should use VSRV IDs. Raw `device_id` is not needed in normal UI.

## Time and Timezone Handling

Rules:

- Store API timestamps as UTC.
- Display using household timezone or device/site timezone where VSRV provides it.
- Use 24-hour time by product preference.
- Monitored-hour editing uses local time.
- Activity views should be local-date based, with VSRV doing UTC conversion.

The app should not convert mobile local windows directly into VNMS UTC policy.
That belongs in VSRV.

## Error Handling

Map structured VSRV error codes to UI behavior:

- `unauthorized`: refresh/login.
- `forbidden`: show no-access state.
- `subscription_required`: open subscription screen.
- `device_not_ready`: show pending device contact.
- `conflict`: show claim/configuration conflict and support path.
- `rate_limited`: show wait/retry message.
- `internal_error`: show generic retry message.

Always preserve developer diagnostics in debug logs without exposing secrets.

## Refresh Strategy

Recommended:

- Refresh session on app foreground if needed.
- Refresh device list on foreground and pull-to-refresh.
- Refresh device detail on screen entry and pull-to-refresh.
- Let push notifications trigger targeted refresh.
- Avoid background polling.

Device changes may be delayed because devices receive downlinks only after their
next uplink. UI must represent pending delivery rather than pretending changes
are instant.

## Local Cache

Cache:

- Last successful device list.
- Last selected household.
- Non-sensitive settings.

Do not cache:

- QR claim secrets.
- Device keys.
- Raw movement history beyond short UI cache.
- Full push tokens in plaintext logs.

## API Mocking

Before backend implementation is complete:

- Use OpenAPI examples as fixtures.
- Build mock handlers for signup/login/device list/detail/activity.
- Include delayed/pending states in fixtures.
- Include error fixtures for claim conflict, subscription required, and offline
  device.

This lets UI and backend evolve against a shared contract.
