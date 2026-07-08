# Vigelo Frontend

Vigelo Frontend is the mobile-first user interface for the Vigelo monitoring
service. It talks only to Vigelo Backend (VSRV). It does not call Vigelo NMS
(VNMS), decode device payloads, handle device keys after claim, or know about
NB-IoT/UDP protocol details.

The app lets users create an account, claim a device by scanning its QR code,
activate/manage the device service subscription, configure monitored hours and
alert preferences, view device status/activity, and receive push notifications.

## Design Documents

- [`docs/mobile-app-design.md`](docs/mobile-app-design.md) - app goals,
  architecture, navigation, state, and implementation direction.
- [`docs/user-flows.md`](docs/user-flows.md) - onboarding, claim, subscription,
  monitored hours, alerts, and support flows.
- [`docs/api-integration.md`](docs/api-integration.md) - how the app should use
  the VSRV mobile API and avoid VNMS details.
- [`docs/notifications.md`](docs/notifications.md) - push permissions,
  preferences, foreground/background behavior, and alert UX.
- [`docs/security-privacy.md`](docs/security-privacy.md) - token storage, privacy,
  local data, screenshots/logging, and device identifier handling.
- [`docs/development-plan.md`](docs/development-plan.md) - staged frontend build
  plan.

## Product Boundary

The app is a user interface only:

```text
Mobile app -> VSRV -> VNMS -> Vigelo device
```

VSRV owns users, households, device ownership, subscriptions, alert policy, push
delivery, and the mobile API. VNMS owns device-network state and low-level device
facts.
