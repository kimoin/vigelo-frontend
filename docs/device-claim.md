# Device Claim UX

## Purpose

The device claim flow connects a physical Vigelo device to a user's household.
The app provides QR scanning and user feedback. VSRV performs validation,
provisioning, household binding, and VNMS integration.

## Flow

```text
User taps Add device
  -> app explains QR scan
  -> app asks camera permission
  -> user scans QR
  -> app submits QR payload to VSRV
  -> VSRV provisions device in VNMS
  -> app shows success or clear recovery path
```

## Screen States

- Intro: explain where to find QR code.
- Camera permission required.
- Scanner active.
- QR detected, validating.
- Claim succeeded.
- Device already claimed.
- Invalid QR.
- Network error/retry.
- Waiting for first device contact.
- Subscription activation needed.

## Security Rules

- Do not show device key/enrollment secret.
- Do not log QR payload.
- Do not store QR payload after claim.
- Do not send QR payload anywhere except VSRV over TLS.
- Do not expose raw IMEI/device ID in normal success UI.

## Success UI

After claim, show:

- Device display name editor.
- Household/location confirmation.
- Service activation prompt if subscription is not active.
- "Waiting for first contact" if VNMS has not seen the device yet.

Suggested copy:

```text
Device added.
Vigelo will finish setup when the device next checks in.
```

## Error UX

Invalid QR:

```text
This does not look like a Vigelo device code.
```

Already claimed:

```text
This device is already linked to another account or household.
Contact support if this is your device.
```

VNMS/provisioning temporarily unavailable:

```text
We could not finish setup right now. Please try again.
```

Do not expose backend/VNMS error internals to users.

## Diagnostics

Support screens may show a redacted identifier:

```text
Device ending in 9012
```

Avoid showing IMEI/IMSI/ICCID in normal mobile screens.
