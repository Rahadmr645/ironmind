# IronMind Android Lock Client (Starter)

This is a starter Android app that connects to your IronMind backend lock APIs.

## What this starter does

- Shows the real installed device apps list and lets user select apps to block.
- Monitors foreground app package names using Usage Stats.
- Calls `POST /api/lock/decision` for the current package.
- Shows a lock overlay activity when backend says `shouldLock=true`.
- Allows Request OTP and Verify OTP from overlay:
  - `POST /api/lock/request-otp`
  - `POST /api/lock/verify-otp`
- Polls `GET /api/lock/status/:userId` and closes overlay when unlocked.

## Before running

1. Open `android-lock-client` in Android Studio.
2. Sync Gradle and run on Android device (API 28+).
3. In app:
   - Set Base URL (server IP reachable from phone, e.g. `http://192.168.0.10:5003`)
   - Set User ID
   - Save Settings
   - Select blocked apps from the device app list, then Save Selected Apps Policy
   - Grant Usage Access permission
   - Start Lock Monitoring

## Notes

- This is a foundation starter, not a production-hardened app lock.
- OEM restrictions can affect background launch behavior.
- For stronger lock enforcement, add AccessibilityService + overlay window permission flow.
- Keep server running and phone on same network as backend base URL.
