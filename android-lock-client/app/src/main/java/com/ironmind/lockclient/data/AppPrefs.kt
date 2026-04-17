package com.ironmind.lockclient.data

import android.content.Context

class AppPrefs(context: Context) {
    private val prefs = context.getSharedPreferences("ironmind_lock_prefs", Context.MODE_PRIVATE)

    var baseUrl: String
        get() = prefs.getString("base_url", "") ?: ""
        set(value) = prefs.edit().putString("base_url", value.trimEnd('/')).apply()

    var userId: String
        get() = prefs.getString("user_id", "") ?: ""
        set(value) = prefs.edit().putString("user_id", value.trim()).apply()
}
