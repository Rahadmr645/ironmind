package com.ironmind.lockclient.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.ironmind.lockclient.data.AppPrefs
import com.ironmind.lockclient.network.LockApiClient
import com.ironmind.lockclient.ui.LockOverlayActivity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

class AppMonitorService : Service() {
    private val channelId = "ironmind_lock_monitor"
    private val scope = CoroutineScope(Dispatchers.IO + Job())

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForeground(1001, buildNotification("Monitoring blocked apps"))

        scope.launch {
            val prefs = AppPrefs(this@AppMonitorService)
            while (isActive) {
                try {
                    val baseUrl = prefs.baseUrl
                    val userId = prefs.userId
                    if (baseUrl.isNotBlank() && userId.isNotBlank()) {
                        val currentPackage = getForegroundPackage()
                        if (!currentPackage.isNullOrBlank() && currentPackage != packageName) {
                            val api = LockApiClient(baseUrl)
                            val decision = api.getLockDecision(userId, currentPackage)
                            if (decision.shouldLock) {
                                launchOverlay(decision.taskId ?: "", decision.taskTitle ?: "Task in progress")
                            }
                        }
                    }
                } catch (_: Exception) {
                    // Keep monitoring loop alive; Android overlay reliability varies by OEM.
                }
                delay(5000)
            }
        }

        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        scope.coroutineContext[Job]?.cancel()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun launchOverlay(taskId: String, taskTitle: String) {
        val intent = Intent(this, LockOverlayActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
            putExtra("taskId", taskId)
            putExtra("taskTitle", taskTitle)
        }
        startActivity(intent)
    }

    private fun getForegroundPackage(): String? {
        val usm = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val end = System.currentTimeMillis()
        val begin = end - 10_000
        val events = usm.queryEvents(begin, end)
        val event = UsageEvents.Event()
        var packageName: String? = null

        while (events.hasNextEvent()) {
            events.getNextEvent(event)
            if (event.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND) {
                packageName = event.packageName
            }
        }
        return packageName
    }

    private fun buildNotification(content: String): Notification {
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "IronMind Lock Monitor",
                NotificationManager.IMPORTANCE_LOW
            )
            manager.createNotificationChannel(channel)
        }
        return NotificationCompat.Builder(this, channelId)
            .setContentTitle("IronMind lock active")
            .setContentText(content)
            .setSmallIcon(android.R.drawable.ic_lock_lock)
            .setOngoing(true)
            .build()
    }
}
