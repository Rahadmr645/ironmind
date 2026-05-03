package com.ironmind.lockclient.network

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class LockApiClient(private val baseUrl: String) {
    private val client = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .build()

    private val jsonType = "application/json; charset=utf-8".toMediaType()

    suspend fun getLockDecision(userId: String, packageName: String): LockDecisionResponse =
        withContext(Dispatchers.IO) {
            val bodyJson = JSONObject()
                .put("userId", userId)
                .put("packageName", packageName)
                .toString()
            val request = Request.Builder()
                .url("$baseUrl/api/lock/decision")
                .post(bodyJson.toRequestBody(jsonType))
                .build()
            client.newCall(request).execute().use { response ->
                val raw = response.body?.string().orEmpty()
                val json = JSONObject(raw.ifBlank { "{}" })
                LockDecisionResponse(
                    shouldLock = json.optBoolean("shouldLock", false),
                    reason = json.optString("reason", null),
                    taskId = json.optString("taskId", null),
                    taskTitle = json.optString("taskTitle", null)
                )
            }
        }

    suspend fun requestUnlockOtp(userId: String, taskId: String): GenericResponse =
        withContext(Dispatchers.IO) {
            val bodyJson = JSONObject()
                .put("userId", userId)
                .put("taskId", taskId)
                .toString()
            val request = Request.Builder()
                .url("$baseUrl/api/lock/request-otp")
                .post(bodyJson.toRequestBody(jsonType))
                .build()
            client.newCall(request).execute().use { response ->
                val raw = response.body?.string().orEmpty()
                val json = JSONObject(raw.ifBlank { "{}" })
                if (!response.isSuccessful) {
                    throw IllegalStateException(json.optString("message", "Request OTP failed"))
                }
                GenericResponse(json.optString("message", "OTP requested"))
            }
        }

    suspend fun verifyUnlockOtp(userId: String, taskId: String, otp: String): GenericResponse =
        withContext(Dispatchers.IO) {
            val bodyJson = JSONObject()
                .put("userId", userId)
                .put("taskId", taskId)
                .put("otp", otp)
                .toString()
            val request = Request.Builder()
                .url("$baseUrl/api/lock/verify-otp")
                .post(bodyJson.toRequestBody(jsonType))
                .build()
            client.newCall(request).execute().use { response ->
                val raw = response.body?.string().orEmpty()
                val json = JSONObject(raw.ifBlank { "{}" })
                if (!response.isSuccessful) {
                    throw IllegalStateException(json.optString("message", "Verify OTP failed"))
                }
                GenericResponse(json.optString("message", "Unlocked"))
            }
        }

    suspend fun getLockStatus(userId: String): LockStatusResponse =
        withContext(Dispatchers.IO) {
            val request = Request.Builder()
                .url("$baseUrl/api/lock/status/$userId")
                .get()
                .build()
            client.newCall(request).execute().use { response ->
                val raw = response.body?.string().orEmpty()
                val json = JSONObject(raw.ifBlank { "{}" })
                LockStatusResponse(
                    isUnlocked = json.optBoolean("isUnlocked", false),
                    unlockedUntil = json.optString("unlockedUntil", null)
                )
            }
        }

    suspend fun getLockPolicy(userId: String): LockPolicyResponse =
        withContext(Dispatchers.IO) {
            val request = Request.Builder()
                .url("$baseUrl/api/lock/policy/$userId")
                .get()
                .build()
            client.newCall(request).execute().use { response ->
                val raw = response.body?.string().orEmpty()
                val json = JSONObject(raw.ifBlank { "{}" })
                val blockedAppsJson = json.optJSONArray("blockedApps") ?: JSONArray()
                val blockedApps = mutableListOf<String>()
                for (i in 0 until blockedAppsJson.length()) {
                    blockedApps.add(blockedAppsJson.optString(i))
                }
                LockPolicyResponse(
                    isEnabled = json.optBoolean("isEnabled", true),
                    blockedApps = blockedApps
                )
            }
        }

    suspend fun syncDeviceAppsCatalog(
        userId: String,
        apps: List<Pair<String, String>>
    ): GenericResponse = withContext(Dispatchers.IO) {
        val arr = JSONArray()
        for ((name, packageName) in apps) {
            arr.put(
                JSONObject()
                    .put("packageName", packageName)
                    .put("name", name)
            )
        }
        val bodyJson = JSONObject()
            .put("userId", userId)
            .put("apps", arr)
            .toString()
        val request = Request.Builder()
            .url("$baseUrl/api/lock/device-apps")
            .post(bodyJson.toRequestBody(jsonType))
            .build()
        client.newCall(request).execute().use { response ->
            val raw = response.body?.string().orEmpty()
            val json = JSONObject(raw.ifBlank { "{}" })
            if (!response.isSuccessful) {
                throw IllegalStateException(json.optString("message", "Sync device apps failed"))
            }
            GenericResponse(json.optString("message", "Synced"))
        }
    }

    suspend fun upsertLockPolicy(
        userId: String,
        isEnabled: Boolean,
        blockedApps: List<String>
    ): GenericResponse = withContext(Dispatchers.IO) {
        val bodyJson = JSONObject()
            .put("userId", userId)
            .put("isEnabled", isEnabled)
            .put("blockedApps", JSONArray(blockedApps))
            .toString()
        val request = Request.Builder()
            .url("$baseUrl/api/lock/policy")
            .put(bodyJson.toRequestBody(jsonType))
            .build()
        client.newCall(request).execute().use { response ->
            val raw = response.body?.string().orEmpty()
            val json = JSONObject(raw.ifBlank { "{}" })
            if (!response.isSuccessful) {
                throw IllegalStateException(json.optString("message", "Save policy failed"))
            }
            GenericResponse(json.optString("message", "Policy saved"))
        }
    }
}
