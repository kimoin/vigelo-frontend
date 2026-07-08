# Mobile Security and Privacy

## Purpose

The mobile app handles user sessions, household/device access, push tokens, and
movement-related product data. It should keep local data minimal and avoid
exposing device identifiers or protocol details.

## Token Storage

Store authentication tokens only in secure OS storage:

- iOS Keychain.
- Android Keystore-backed secure storage.

Do not store tokens in:

- Plain async storage.
- Logs.
- Crash reports.
- Analytics events.
- Screenshots.

On logout:

- Revoke session through VSRV.
- Delete local tokens.
- Delete local cached user/device data where practical.
- Unregister push token if authenticated call is possible.

## Device Claim Secrets

QR codes may contain enrollment data or device key material.

Rules:

- Parse only enough locally to validate shape and improve UX.
- Send claim payload to VSRV over TLS.
- Do not persist QR payload after claim.
- Do not include QR payload in logs or analytics.
- Do not display device key/enrollment secret.
- On failure, show a safe message and support path.

## Device Identifiers

Current-generation `device_id` is modem IMEI. It is globally unique and not a
secret, but once linked to a household it is protected device metadata.

App rules:

- Use VSRV device binding IDs internally.
- Avoid raw `device_id` in normal user-visible screens.
- Redact identifiers in support views, for example show last 4-6 digits only.
- Do not put raw `device_id` in analytics events.
- Do not expose IMSI/ICCID except possibly in an explicit diagnostics/support
  screen.

## Local Data

Allowed local cache:

- Non-sensitive app settings.
- Last selected household.
- Recent device summary for fast startup.
- Push permission state.

Avoid local cache:

- Raw movement history beyond short UI cache.
- QR payloads.
- Device keys.
- Full push tokens in debug logs.
- Payment details.

If activity data is cached for UX, clear it on logout and keep it bounded.

## Network Security

- TLS only for VSRV API.
- Certificate pinning is optional and can add operational risk; decide later.
- Do not call VNMS.
- Do not call payment provider APIs directly except through approved hosted/native
  checkout flows initiated by VSRV.
- Use request timeouts and safe retry behavior.

## Logging and Analytics

Do not log:

- Tokens.
- Passwords.
- QR payloads.
- Device keys.
- Raw `device_id`, IMEI, IMSI, ICCID.
- Push tokens.
- Movement history.
- Payment details.

Analytics should use:

- Screen names.
- Feature usage.
- Error categories.
- Anonymous or VSRV-provided non-sensitive IDs where needed.

## Screenshots and Support

Mobile OS screenshots and support captures can expose sensitive household data.

Design guidance:

- Avoid raw identifiers on normal screens.
- Consider privacy mode for support screen sharing later.
- Keep alert content concise.
- Do not show detailed movement history on lock-screen notifications.

## Biometric Lock

Optional later:

- Let users protect app open with Face ID/Touch ID/Android biometrics.
- This is additional local protection, not a replacement for server sessions.

## Privacy UX

Explain clearly:

- What the device monitors: simple movement/no-movement presence.
- What it does not monitor: no camera, no microphone, no location from the device.
- What notifications mean.
- How to remove a device.
- How to request account/data deletion later.

Avoid:

- Medical claims.
- Overstating certainty.
- Hidden diagnostics.

## Testing

Test:

- Logout clears local data.
- Token refresh failure returns to login.
- QR payload is not retained after claim.
- Analytics/log filters redact sensitive fields.
- Push notification payload does not expose raw identifiers.
- App behaves safely on rooted/jailbroken devices if detection is added later.
