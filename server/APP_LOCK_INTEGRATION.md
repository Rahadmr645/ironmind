# IronMind App Lock Integration (Android)

These APIs are designed for a native Android app-lock client.

## 1) Save blocked apps policy

`PUT /api/lock/policy`

Body:

```json
{
  "userId": "USER_ID",
  "isEnabled": true,
  "blockedApps": [
    "com.facebook.katana",
    "com.instagram.android",
    "com.zhiliaoapp.musically"
  ]
}
```

## 2) Read blocked apps policy

`GET /api/lock/policy/:userId`

## 3) Real-time lock decision (Android checks this)

`POST /api/lock/decision`

Body:

```json
{
  "userId": "USER_ID",
  "packageName": "com.facebook.katana"
}
```

Response:

```json
{
  "shouldLock": true,
  "reason": "task_in_progress",
  "taskId": "TASK_ID",
  "taskTitle": "Deep Work Session"
}
```

`shouldLock=false` means Android app can allow opening that package.

## 4) Request unlock OTP (only after task completion)

`POST /api/lock/request-otp`

Body:

```json
{
  "userId": "USER_ID",
  "taskId": "TASK_ID"
}
```

If task is not completed, this returns 403.

## 5) Verify unlock OTP

`POST /api/lock/verify-otp`

Body:

```json
{
  "userId": "USER_ID",
  "taskId": "TASK_ID",
  "otp": "123456"
}
```

On success, backend creates an unlock session.

## 6) Read current lock status

`GET /api/lock/status/:userId`

Response includes `isUnlocked` and `unlockedUntil`.

---

## Android side flow

1. Use UsageStats/Accessibility to detect current foreground app package.
2. Call `POST /api/lock/decision` with that package name.
3. If `shouldLock=true`, show your lock screen overlay.
4. In lock screen, call request/verify OTP endpoints.
5. Poll `GET /api/lock/status/:userId` or re-check `decision` to remove overlay when unlocked.
