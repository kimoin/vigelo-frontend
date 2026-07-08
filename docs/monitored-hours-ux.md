# Monitored Hours UX

## Purpose

Monitored hours are the user-facing policy for when movement/no-movement should
matter. The app presents local-time intent. VSRV converts that intent to the UTC
monitored-window policy that VNMS delivers to the device.

## User Model

Users should think:

```text
Monitor this place between 08:00 and 20:00.
Notify me if movement or no movement happens according to my alert settings.
```

Users should not think about:

- UTC.
- Device-relative schedules.
- Downlink timing.
- NB-IoT.

## MVP Constraints

Reflect the first VNMS/device constraints:

- Up to two monitored windows.
- Windows are hourly.
- Windows cannot overlap.
- A 24-hour window must be the only window.
- Daily repeating windows only unless VSRV later supports weekdays.
- Changes reach the device on its next contact, not instantly.

## Editor UX

Recommended controls:

- Toggle monitored hours on/off.
- Add window.
- Start time picker.
- End time picker.
- Remove window.
- Timezone display.
- Save button.

Use 24-hour clock.

Example:

```text
Monitored hours
Timezone: Europe/Helsinki

08:00 - 20:00

Changes are sent to the device the next time it checks in.
```

## Delivery States

Show delivery separately from desired state:

- `saved`: VSRV accepted the desired settings.
- `pending delivery`: waiting for the device to receive settings.
- `delivered`: VNMS confirmed policy delivery.
- `failed`: VSRV could not save or send settings.

Suggested copy:

```text
Saved. Waiting for device delivery.
```

```text
Delivered to device.
```

## Validation Messages

Overlapping windows:

```text
Monitored windows cannot overlap.
```

Too many windows:

```text
You can add up to two monitored windows.
```

24-hour plus another window:

```text
A full-day window cannot be combined with another window.
```

Invalid time:

```text
Choose a start and end time.
```

## Activity Display Connection

Activity screens should show monitored windows as background/context, not just
movement:

- Movement hour.
- Monitored hour.
- Movement detected event.
- No movement detected event.
- Current day/hour when useful.

Use local dates and 24-hour labels. VSRV should return local-day structures, so
the app does not need to reason about VNMS UTC days directly.

## Daylight Saving Time

For MVP:

- Use the household timezone from VSRV.
- Let VSRV handle conversion.
- If VSRV constrains DST edge cases, show clear validation or informational text.

Do not let the mobile app independently compute VNMS UTC policy.

## Empty State

If no monitored hours:

```text
No monitored hours set.
The device will still check in periodically, but movement alerts are not tied to
a monitored window.
```

Keep this aligned with VSRV/VNMS behavior.
