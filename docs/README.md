# Vigelo Frontend Design Docs

Read in this order:

1. [`mobile-app-design.md`](mobile-app-design.md) - product scope and app architecture.
2. [`user-flows.md`](user-flows.md) - onboarding, claim, subscription, alerts.
3. [`device-claim.md`](device-claim.md) - QR claim UX and security rules.
4. [`monitored-hours-ux.md`](monitored-hours-ux.md) - monitored-hour editing and delivery states.
5. [`api-integration.md`](api-integration.md) - VSRV API use and client behavior.
6. [`notifications.md`](notifications.md) - push permission, preferences, alert delivery.
7. [`security-privacy.md`](security-privacy.md) - token storage, identifiers, local data.
8. [`development-plan.md`](development-plan.md) - staged implementation plan.

The frontend talks only to VSRV. It should not call VNMS or depend on device
protocol details.
