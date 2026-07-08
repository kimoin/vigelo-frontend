# User Flows

## Purpose

This document outlines the main mobile user journeys. The app should keep these
flows simple and product-oriented while VSRV handles account, household,
subscription, and VNMS integration logic.

## First App Launch

```text
Open app
  -> Welcome
  -> Sign up or log in
  -> Email verification if required
  -> Create or select household/site
  -> Claim device or skip to empty home
```

MVP can auto-create a household after signup to reduce friction.

## Signup

Steps:

1. User enters email and password.
2. App submits to VSRV.
3. VSRV creates account and session, or requires email verification.
4. App prompts for verification if needed.
5. App enters authenticated onboarding.

UX requirements:

- Clear password requirements.
- Friendly duplicate-email handling.
- No account enumeration in security-sensitive flows.
- Loading and retry states.

## Login

Steps:

1. User enters email and password.
2. App submits to VSRV.
3. VSRV returns tokens/session.
4. App stores tokens in secure storage.
5. App loads households/devices.

Support:

- Forgot password.
- Logout.
- Logout all sessions later.

## Device Claim With QR

```text
Home/Onboarding
  -> Scan QR
  -> Parse claim payload locally enough to validate shape
  -> Send full payload to VSRV
  -> VSRV provisions device in VNMS
  -> App shows claimed device
  -> App prompts subscription activation if needed
```

UX states:

- Camera permission needed.
- QR invalid.
- Device already claimed.
- Device provisioned but not yet contacted.
- Network/VSRV error, retry possible.
- Claim succeeded.

Security requirements:

- Do not display device key/enrollment secret.
- Do not log QR payload.
- Do not store claim payload after flow completes.
- If showing a device identifier for support, prefer partial/redacted value.

## Subscription Activation

```text
Device claimed
  -> App shows service not active
  -> User taps Activate service
  -> VSRV creates checkout/payment session
  -> User completes provider flow
  -> VSRV webhook activates subscription
  -> App refreshes subscription/device service status
```

UX states:

- Trial available.
- Active.
- Payment pending.
- Payment failed.
- Payment issue/past due.
- Cancelled.

Do not claim "premium app feature" unless product/legal review approves. Use
"monitoring service" language.

## Configure Monitored Hours

```text
Device detail
  -> Monitored Hours
  -> User edits one or two local-time windows
  -> App validates obvious issues
  -> Submit to VSRV
  -> VSRV converts to VNMS UTC policy
  -> App shows pending delivery
  -> Later delivery confirmed by VSRV/VNMS event
```

UX rules:

- Use 24-hour clock.
- Show timezone.
- Keep MVP to daily repeating windows unless backend supports weekday rules.
- Explain: "Changes are sent to the device the next time it checks in."
- Show delivery state separately from saved desired state.

Validation:

- Start and end cannot be identical unless intentionally meaning 24h.
- Up to two windows.
- No overlapping windows.
- 24h window cannot be combined with another.

## View Activity

```text
Device detail
  -> Activity
  -> App requests local date range from VSRV
  -> VSRV returns local-day/hour buckets
  -> App shows movement, monitored hours, and event markers
```

UX direction:

- Use local dates.
- Use 24-hour time.
- Show monitored windows clearly.
- Show movement/no-movement outcomes as facts.
- Avoid minute-level detail in MVP.

## Receive Push Alert

```text
VNMS fact
  -> VSRV alert rule
  -> VSRV push notification
  -> User taps notification
  -> App opens alert/device detail
```

Foreground behavior:

- Show in-app banner or update alert list.
- Avoid duplicate system notification if app is active and product chooses that
  behavior.

Background behavior:

- Tapping notification deep-links to alert detail.
- If session expired, login first then continue to alert if authorized.

## Acknowledge Alert

Steps:

1. User opens alert.
2. User taps acknowledge/dismiss.
3. App sends to VSRV.
4. VSRV records actor/time.
5. App updates alert state.

Acknowledging an alert does not alter VNMS facts. It is user-facing alert state.

## Device Offline

When VSRV reports delayed/offline:

- Explain simply: "The device has not checked in recently."
- Show last seen.
- Offer troubleshooting.
- Do not show carrier/NB-IoT internals unless in diagnostics.

Possible actions:

- Refresh.
- Check battery/device placement guidance.
- Contact support.

## Request Device Refresh

Support/diagnostic flow only at first:

- Request device info.
- Request device status.

These are queued until next device contact. UI must say this clearly.

## Remove Device

```text
Device settings
  -> Remove device
  -> Confirm consequences
  -> VSRV removes binding and calls VNMS deactivate/revoke if appropriate
  -> App returns to device list
```

Confirm copy should explain:

- Device stops being associated with this household.
- Monitoring service may need cancellation/transfer.
- Historical data retention follows account policy.

## Invite User Later

Future flow:

```text
Household settings
  -> Invite member/caregiver
  -> Recipient accepts
  -> Role controls device and alert access
```

Do not hard-code single-user assumptions in navigation or state.
