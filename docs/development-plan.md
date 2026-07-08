# Frontend Development Plan

## Principles

- Build against VSRV mobile API, not VNMS.
- Use product models: household, device binding, subscription, alerts.
- Keep device protocol details out of app code.
- Prefer typed API contracts from OpenAPI.
- Store tokens securely.
- Build onboarding and claim flow early.
- Keep MVP simple but do not hard-code one-user/one-device forever.

## Phase 0: Product and API Contracts

Inputs needed:

- VSRV OpenAPI skeleton.
- Initial visual direction.
- Device QR payload shape.
- Subscription/payment flow decision.
- Push notification payload shape.

Frontend outputs:

- Navigation map.
- Screen list.
- API fixture models.
- Design states for loading/empty/error/pending delivery.

## Phase 1: App Skeleton

Implement:

- App project setup.
- TypeScript.
- Navigation.
- Theme/design tokens.
- API client wrapper.
- Secure storage wrapper.
- Environment config.
- Basic error boundary.

Screens:

- Welcome.
- Login.
- Signup.
- Empty home placeholder.

## Phase 2: Authentication

Implement:

- Signup.
- Login.
- Token storage.
- Token refresh.
- Logout.
- Password reset entry point.
- Email verification state.

Tests:

- Successful login.
- Expired access token refresh.
- Refresh failure clears session.
- Logout clears local data.

## Phase 3: Household and Device List

Implement:

- Load current user.
- Load household(s).
- Device list/home screen.
- Empty state: "Add your Vigelo device."
- Basic pull-to-refresh.

Use mocked VSRV data until backend is ready.

## Phase 4: Device Claim

Implement:

- QR scanner.
- Camera permission flow.
- Claim payload submission to VSRV.
- Claim loading/success/failure states.
- Device already claimed/support path.
- Pending first contact state.

Security:

- Do not log QR payload.
- Clear QR payload from memory as soon as possible.

## Phase 5: Subscription Activation

Implement:

- Service inactive screen/state.
- Start checkout/customer portal through VSRV.
- Return/refresh subscription state.
- Payment issue state.

Keep provider-specific UI behind VSRV responses.

## Phase 6: Device Detail

Implement:

- Online/offline/delayed status.
- Last seen.
- Battery voltage in volts.
- Monitored-hours summary.
- Active alerts summary.
- Subscription/service status.
- Diagnostics section later.

Do not show raw `device_id` in the normal detail screen.

## Phase 7: Monitored Hours

Implement:

- Local-time editor.
- Up to two windows.
- 24-hour clock.
- Validation.
- Save to VSRV.
- Pending delivery/delivered/failed status.

UX copy:

- "Changes are sent to the device the next time it checks in."

## Phase 8: Activity and Timeline

Implement:

- Local-date activity view.
- Hourly movement presence.
- Monitored-hour highlights.
- Movement/no-movement event markers.
- Recent timeline.

Avoid minute-level data in MVP.

## Phase 9: Alerts and Push

Implement:

- Push permission explanation.
- Push token registration.
- Notification preferences.
- Alert list/detail.
- Acknowledge alert.
- Deep link from push notification.

Test foreground, background, logged-out, and duplicate notification cases.

## Phase 10: Account, Household, Support

Implement:

- Account settings.
- Logout.
- Household settings.
- Basic support/contact screen.
- Device remove flow.
- Invite/member management later.

## Quality Gates

Before production:

- VSRV OpenAPI typed client or contract tests.
- Secure token storage verified.
- Sensitive logging review.
- Push permission UX tested.
- Accessibility pass.
- Localization-ready strings.
- App store payment wording reviewed.
- Offline/error states for every core screen.
- Device pending-delivery states tested.

## MVP Screen List

Required:

- Welcome.
- Signup.
- Login.
- Home/device list.
- QR claim.
- Subscription activation.
- Device detail.
- Monitored hours.
- Activity.
- Alerts.
- Notification preferences.
- Account/logout.

Later:

- Household members.
- Caregiver invites.
- Advanced diagnostics.
- Data export/delete request.
- Support/admin handoff.
