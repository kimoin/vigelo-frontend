# Mobile App Design

## Purpose

The Vigelo mobile app is the primary user interface for the monitoring service.
It should make device setup, monitored-hour configuration, alerts, and service
status understandable without exposing VNMS or device protocol complexity.

The app talks only to VSRV.

## Product Goals

- Let a user create and manage a Vigelo account from mobile.
- Let a user claim a physical device by scanning a QR code.
- Help the user activate the device monitoring subscription.
- Show whether the device is online and healthy.
- Let the user configure monitored hours.
- Show simple movement/no-movement outcomes.
- Deliver and explain push alerts.
- Keep device identifiers and protocol details out of normal UX.

## Non-Goals

The app should not:

- Call VNMS directly.
- Know about UDP, AEAD, `key_id`, boot counters, or message counters.
- Decode binary payloads.
- Store device keys.
- Show IMEI/IMSI/ICCID in normal user flows.
- Present minute-level movement data by default.
- Make health/medical claims.

## Recommended Technology Direction

The exact frontend stack is still open. Choose conservatively:

- Mobile-first cross-platform app unless native-only requirements appear.
- TypeScript strongly preferred.
- Generated or typed API client from VSRV OpenAPI.
- Central API/session layer.
- Secure token storage abstraction.
- Push notification abstraction.
- Lightweight state management first.

Good candidates later:

- React Native with Expo or bare React Native.
- Native iOS/Android only if hardware, push, QR, or store requirements justify it.

Do not choose a heavy framework before VSRV mobile API contracts exist.

## App Boundary

```text
Mobile screens and local state
  -> VSRV HTTPS API
     -> account, household, device binding, subscription, alert policy
     -> VNMS-derived status/activity projections
```

VSRV should return mobile-ready models:

- Device binding ID.
- Display name.
- Online/offline state.
- Last seen timestamp.
- Battery voltage in volts.
- Monitored-hour intent and delivery state.
- Alert state.
- Subscription status.

The app should not transform VNMS UTC policy directly except through VSRV-provided
local-time models.

## Navigation Structure

Suggested top-level structure:

```text
Unauthenticated
  - Welcome
  - Sign up
  - Login
  - Email verification
  - Password reset

Authenticated
  - Home / Devices
  - Device Detail
  - Activity
  - Monitored Hours
  - Alerts
  - Subscription / Service
  - Account
  - Household / Members later
  - Support
```

MVP can have one household and one device, but navigation should not assume this
forever.

## Home Screen

Purpose: quick confidence that the service is working.

Show:

- Device display name.
- Online/offline/delayed status.
- Last seen in user-friendly relative form and exact timestamp on detail.
- Battery voltage/status.
- Current monitored-hours summary.
- Active alerts.
- Subscription/service status if action is needed.

Avoid:

- Raw `device_id`.
- Modem counters unless in support/diagnostics.
- Protocol labels.

## Device Detail

Show:

- Device name/location.
- Connectivity status.
- Last seen.
- Battery voltage as volts, for example `3.000 V`.
- Firmware/version details only under diagnostics/support.
- Monitored-hours delivery state:
  - saved
  - pending delivery to device
  - delivered
  - failed/retry needed
- Activity summary.
- Active alerts and recent timeline.

## Monitored Hours UX

User intent should be local time:

- "Monitor from 08:00 to 20:00."
- Household/site timezone is explicit or inferred.
- Up to two windows initially.
- Explain that changes are sent to the device on its next contact.

VNMS delivers UTC policy to the device, but the app should never ask the user to
think in UTC.

Important UI states:

- `saved`: desired state stored by VSRV.
- `pending delivery`: VSRV sent to VNMS but device has not yet received it.
- `delivered`: VNMS/device delivery confirmed.
- `failed`: VSRV could not update VNMS or policy invalid.

## Activity UX

First release should show coarse hourly/product-level activity:

- Hourly movement presence.
- Monitored windows.
- Movement/no-movement monitored-window events.
- Local dates and 24-hour clock.

Do not show minute-level movement by default. Raw minute-level data is not part of
the normal product UX and may require separate consent if ever used.

## Alerts UX

Alert cards should be direct and calm:

- "Movement detected during monitored hours."
- "No movement detected during the monitored window."
- "Device has not checked in recently."
- "Battery may need attention."

Each alert should show:

- Device/location.
- Time.
- What happened.
- Whether the user needs to act.
- Acknowledge/dismiss action where appropriate.

Avoid health diagnosis language. Do not imply medical monitoring unless the
product later intentionally enters that regulatory path.

## Subscription UX

Position the subscription as device monitoring service activation:

- "Activate monitoring service for this Vigelo device."
- "Cellular-connected monitoring service."

Avoid wording that makes the subscription look like a digital-only premium app
feature unless product/legal review confirms app-store handling.

Subscription states:

- not active
- trialing
- active
- payment issue
- cancelled
- service limited

The app should rely on VSRV for payment sessions, customer portal links, and
service state.

## Local State

Store locally:

- Session/access tokens in secure storage.
- Basic cached app state for fast startup.
- Push permission state.
- Non-sensitive preferences.

Avoid storing:

- Raw movement history beyond cache needs.
- Device keys or QR secrets after claim.
- Raw device identifiers unless necessary.
- Push tokens in plaintext logs.

## Offline and Refresh Behavior

The app should tolerate intermittent mobile connectivity:

- Show cached status with "last updated".
- Refresh on foreground.
- Pull-to-refresh on device detail/activity.
- Use push notifications for alert delivery.
- Do not poll aggressively in background.

Device connectivity is separate from phone connectivity. Make UI wording clear:

- "Phone offline" means the app cannot reach VSRV.
- "Device offline" means the Vigelo device has not contacted VNMS/VSRV recently.

## Accessibility and Localization

From the start:

- Use 24-hour clock where configured by locale/product decision.
- Keep times clear with timezone context.
- Use dynamic text sizes.
- Ensure alert colors are not the only signal.
- Prepare strings for localization.
- Avoid dense technical wording.

## Open Decisions

- Frontend framework.
- Exact visual design system.
- Whether support diagnostics are visible in-app.
- How much history is shown in MVP.
- Subscription checkout method inside mobile app.
- Whether household/member management is MVP or later.
