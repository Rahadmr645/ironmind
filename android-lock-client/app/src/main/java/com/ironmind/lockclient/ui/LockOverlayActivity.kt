package com.ironmind.lockclient.ui

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.activity.ComponentActivity
import com.ironmind.lockclient.R
import com.ironmind.lockclient.data.AppPrefs
import com.ironmind.lockclient.network.LockApiClient
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class LockOverlayActivity : ComponentActivity() {
    private val scope = CoroutineScope(Dispatchers.Main + Job())
    private lateinit var prefs: AppPrefs
    private lateinit var tvTaskTitle: TextView
    private lateinit var tvMessage: TextView
    private lateinit var etOtp: EditText
    private var taskId: String = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_lock_overlay)
        setFinishOnTouchOutside(false)

        prefs = AppPrefs(this)
        tvTaskTitle = findViewById(R.id.tvTaskTitle)
        tvMessage = findViewById(R.id.tvMessage)
        etOtp = findViewById(R.id.etOtp)
        taskId = intent.getStringExtra("taskId").orEmpty()
        val taskTitle = intent.getStringExtra("taskTitle").orEmpty()

        tvTaskTitle.text = "Locked by: $taskTitle"

        findViewById<Button>(R.id.btnRequestOtp).setOnClickListener {
            requestOtp()
        }

        findViewById<Button>(R.id.btnVerifyOtp).setOnClickListener {
            verifyOtp()
        }

        startUnlockStatusPolling()
    }

    override fun onBackPressed() {
        // Block back navigation while lock is active.
    }

    override fun onDestroy() {
        super.onDestroy()
        scope.coroutineContext[Job]?.cancel()
    }

    private fun requestOtp() {
        val baseUrl = prefs.baseUrl
        val userId = prefs.userId
        if (baseUrl.isBlank() || userId.isBlank() || taskId.isBlank()) {
            tvMessage.text = "Missing base URL / userId / taskId"
            return
        }

        scope.launch {
            try {
                val api = LockApiClient(baseUrl)
                val res = withContext(Dispatchers.IO) {
                    api.requestUnlockOtp(userId, taskId)
                }
                tvMessage.text = res.message
            } catch (e: Exception) {
                tvMessage.text = e.message ?: "Request OTP failed"
            }
        }
    }

    private fun verifyOtp() {
        val baseUrl = prefs.baseUrl
        val userId = prefs.userId
        val otp = etOtp.text.toString().trim()

        if (baseUrl.isBlank() || userId.isBlank() || taskId.isBlank() || otp.isBlank()) {
            tvMessage.text = "Missing base URL / userId / taskId / otp"
            return
        }

        scope.launch {
            try {
                val api = LockApiClient(baseUrl)
                val res = withContext(Dispatchers.IO) {
                    api.verifyUnlockOtp(userId, taskId, otp)
                }
                tvMessage.text = res.message
                finish()
            } catch (e: Exception) {
                tvMessage.text = e.message ?: "Verify OTP failed"
            }
        }
    }

    private fun startUnlockStatusPolling() {
        val baseUrl = prefs.baseUrl
        val userId = prefs.userId
        if (baseUrl.isBlank() || userId.isBlank()) return

        scope.launch {
            while (isActive) {
                try {
                    val api = LockApiClient(baseUrl)
                    val status = withContext(Dispatchers.IO) { api.getLockStatus(userId) }
                    if (status.isUnlocked) {
                        finish()
                        return@launch
                    }
                } catch (_: Exception) {
                    // Ignore transient network errors in polling loop.
                }
                delay(7000)
            }
        }
    }
}
