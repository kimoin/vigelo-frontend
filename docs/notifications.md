# Notifications

## Purpose

The mobile app receives push notifications from VSRV for user-facing alerts. VNMS
does not send push notifications and the app does not subscribe to VNMS events.

## Ownership

VSRV owns:

- Alert rule evaluation.
- Notification preferences.
- Recipient selection.
- Quiet hours.
- Push token storage.
- APNs/FCM delivery.

Mobile app owns:

- Asking OS notification permission.
- Registering/unregistering push tokens with VSRV.
- Displaying foreground alerts.
- Deep-linking from notification taps.
- Letting users edit notification preferences.

## Permission Flow

Recommended flow:

1. Do not ask for push permission on first launch before context.
2. Explain why notifications are useful during device setup or alert settings.
3. Ask OS permission.
4. Register APNs/FCM token with VSRV if granted.
5. Show a recoverable disabled state if denied.

Copy direction:

- "Vigelo can notify you when movement or device issues are detected."
- Avoid fear-driven wording.
- Avoid medical claims.

## Push Token Registration

On app startup/login:

```text
if authenticated and push permission granted:
  get platform token
  POST /v1/push-tokens
```

On logout:

```text
DELETE /v1/push-tokens/{id}
clear local session
```

On token refresh:

- Register the new token.
- Let VSRV disable old invalid tokens by provider feedback.

## Notification Types

Initial notification types:

- Movement detected during monitored hours.
- No movement detected during monitored window.
- Device has not checked in recently.
- Battery may need attention.
- Subscription/payment action needed.

Future:

- Device setup completed.
- Monitored-hours delivery failed.
- Household invitation.

## Foreground Behavior

When the app is open:

- Update active alert/device state.
- Optionally show an in-app banner.
- Avoid duplicate noisy system notification if product chooses foreground
  suppression.
- Deep link to the relevant device or alert when user taps banner.

## Background Tap Behavior

Notification payload should include stable product IDs:

- `alert_id`
- `device_binding_id`
- `household_id`

It should not include:

- Raw `device_id`/IMEI.
- IMSI/ICCID.
- Detailed movement history.
- Device keys or secrets.

Tap flow:

```text
notification tap
  -> app opens
  -> if authenticated: navigate to alert/device
  -> if session expired: login, then continue if still authorized
```

## Preferences UI

Per-device notification preferences:

- Movement detected alerts on/off.
- No-movement alerts on/off.
- Device offline alerts on/off.
- Low battery alerts on/off.
- Quiet hours.
- Recipients later when household roles exist.

Make it clear that OS-level notification permission can still block delivery.

## Quiet Hours

Quiet hours are a VSRV policy. The app edits them; VSRV applies them.

UI should:

- Use household timezone.
- Use 24-hour clock.
- Explain whether alerts are suppressed or delayed.
- Keep critical/safety exceptions as a future product decision.

## Notification Content

Good examples:

- "Movement detected in Living room."
- "No movement detected during the monitored window."
- "Living room device has not checked in recently."
- "Battery may need attention soon."

Avoid:

- "Possible emergency."
- "Health risk detected."
- Raw timestamps without context.
- Raw identifiers.

## Testing

Test:

- Permission denied.
- Permission granted.
- Token refresh.
- Logout unregisters token.
- Tapping alert opens correct screen.
- Tapping while logged out goes through login.
- Duplicate push does not create duplicate visible alert.
- Foreground and background behavior.

## Open Decisions

- Whether foreground notifications use OS banners or in-app banners.
- Default alert preferences.
- Whether quiet hours suppress or delay notifications.
- Whether SMS/email channels are needed later.
- Exact push payload schema from VSRV.
