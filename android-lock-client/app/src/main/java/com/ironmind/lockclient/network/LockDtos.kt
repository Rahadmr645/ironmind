package com.ironmind.lockclient.network

data class LockDecisionResponse(
    val shouldLock: Boolean,
    val reason: String?,
    val taskId: String?,
    val taskTitle: String?
)

data class LockStatusResponse(
    val isUnlocked: Boolean,
    val unlockedUntil: String?
)

data class LockPolicyResponse(
    val isEnabled: Boolean,
    val blockedApps: List<String>
)

data class GenericResponse(
    val message: String
)
