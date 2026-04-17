package com.ironmind.lockclient

import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.content.pm.ResolveInfo
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.CheckBox
import android.widget.EditText
import android.widget.ListView
import android.widget.TextView
import androidx.activity.ComponentActivity
import androidx.core.content.ContextCompat
import com.ironmind.lockclient.data.AppPrefs
import com.ironmind.lockclient.network.LockApiClient
import com.ironmind.lockclient.service.AppMonitorService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainActivity : ComponentActivity() {
    private lateinit var prefs: AppPrefs
    private val uiScope = CoroutineScope(Dispatchers.Main + Job())
    private lateinit var lvApps: ListView
    private lateinit var cbPolicyEnabled: CheckBox
    private lateinit var tvStatus: TextView
    private var installedApps: List<InstalledApp> = emptyList()

    data class InstalledApp(
        val label: String,
        val packageName: String
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        prefs = AppPrefs(this)
        val etBaseUrl = findViewById<EditText>(R.id.etBaseUrl)
        val etUserId = findViewById<EditText>(R.id.etUserId)
        tvStatus = findViewById(R.id.tvStatus)
        lvApps = findViewById(R.id.lvApps)
        cbPolicyEnabled = findViewById(R.id.cbPolicyEnabled)

        etBaseUrl.setText(prefs.baseUrl)
        etUserId.setText(prefs.userId)
        setupInstalledAppsList()

        findViewById<Button>(R.id.btnSave).setOnClickListener {
            prefs.baseUrl = etBaseUrl.text.toString()
            prefs.userId = etUserId.text.toString()
            tvStatus.text = "Status: settings saved"
            fetchAndApplyPolicySelection()
        }

        findViewById<Button>(R.id.btnSavePolicy).setOnClickListener {
            prefs.baseUrl = etBaseUrl.text.toString()
            prefs.userId = etUserId.text.toString()
            savePolicyFromSelectedApps()
        }

        findViewById<Button>(R.id.btnUsageAccess).setOnClickListener {
            startActivity(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS))
        }

        findViewById<Button>(R.id.btnStartService).setOnClickListener {
            if (!hasUsageStatsPermission()) {
                tvStatus.text = "Status: grant Usage Access first"
                return@setOnClickListener
            }
            if (prefs.baseUrl.isBlank() || prefs.userId.isBlank()) {
                tvStatus.text = "Status: set Base URL and User ID first"
                return@setOnClickListener
            }
            val intent = Intent(this, AppMonitorService::class.java)
            ContextCompat.startForegroundService(this, intent)
            tvStatus.text = "Status: lock monitoring started"
        }

        findViewById<Button>(R.id.btnStopService).setOnClickListener {
            stopService(Intent(this, AppMonitorService::class.java))
            tvStatus.text = "Status: lock monitoring stopped"
        }

        fetchAndApplyPolicySelection()
    }

    override fun onDestroy() {
        super.onDestroy()
        uiScope.coroutineContext[Job]?.cancel()
    }

    private fun setupInstalledAppsList() {
        installedApps = loadLaunchableApps()
        val labels = installedApps.map { "${it.label} (${it.packageName})" }
        val adapter = ArrayAdapter(this, android.R.layout.simple_list_item_multiple_choice, labels)
        lvApps.choiceMode = ListView.CHOICE_MODE_MULTIPLE
        lvApps.adapter = adapter
    }

    private fun loadLaunchableApps(): List<InstalledApp> {
        val launchIntent = Intent(Intent.ACTION_MAIN, null).apply {
            addCategory(Intent.CATEGORY_LAUNCHER)
        }
        val apps: List<ResolveInfo> = packageManager.queryIntentActivities(launchIntent, 0)
        return apps
            .mapNotNull { resolveInfo ->
                val pkg = resolveInfo.activityInfo?.packageName ?: return@mapNotNull null
                if (pkg == packageName) return@mapNotNull null
                val label = resolveInfo.loadLabel(packageManager)?.toString().orEmpty().ifBlank { pkg }
                InstalledApp(label = label, packageName = pkg)
            }
            .distinctBy { it.packageName }
            .sortedBy { it.label.lowercase() }
    }

    private fun fetchAndApplyPolicySelection() {
        if (prefs.baseUrl.isBlank() || prefs.userId.isBlank()) return

        uiScope.launch {
            try {
                val api = LockApiClient(prefs.baseUrl)
                val policy = withContext(Dispatchers.IO) { api.getLockPolicy(prefs.userId) }
                cbPolicyEnabled.isChecked = policy.isEnabled
                val blockedSet = policy.blockedApps.toSet()
                for (i in installedApps.indices) {
                    lvApps.setItemChecked(i, installedApps[i].packageName in blockedSet)
                }
                tvStatus.text = "Status: policy loaded from server"
            } catch (e: Exception) {
                tvStatus.text = "Status: failed to load policy (${e.message})"
            }
        }
    }

    private fun savePolicyFromSelectedApps() {
        if (prefs.baseUrl.isBlank() || prefs.userId.isBlank()) {
            tvStatus.text = "Status: set Base URL and User ID first"
            return
        }

        val selectedPackages = installedApps
            .mapIndexedNotNull { index, app -> if (lvApps.isItemChecked(index)) app.packageName else null }

        uiScope.launch {
            try {
                val api = LockApiClient(prefs.baseUrl)
                withContext(Dispatchers.IO) {
                    api.upsertLockPolicy(
                        userId = prefs.userId,
                        isEnabled = cbPolicyEnabled.isChecked,
                        blockedApps = selectedPackages
                    )
                }
                tvStatus.text = "Status: blocked apps policy saved"
            } catch (e: Exception) {
                tvStatus.text = "Status: failed to save policy (${e.message})"
            }
        }
    }

    private fun hasUsageStatsPermission(): Boolean {
        val appOps = getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            appOps.unsafeCheckOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                android.os.Process.myUid(),
                packageName
            )
        } else {
            @Suppress("DEPRECATION")
            appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, android.os.Process.myUid(), packageName)
        }
        return mode == AppOpsManager.MODE_ALLOWED
    }
}
