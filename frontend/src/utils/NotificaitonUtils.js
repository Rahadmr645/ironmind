// utils/NotificationUtils.js
export const requestNotificationPermission = async () => {
  try {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications.");
      return false;
    }

    const permission = Notification.permission;

    if (permission === "granted") {
      console.log("✅ Notification permission already granted.");
      return true;
    }

    if (permission === "denied") {
      console.warn("🚫 User has denied notifications. Must change manually.");
      alert("Please allow notifications from browser settings to get task alerts.");
      return false;
    }

    // Ask for permission
    const result = await Notification.requestPermission();
    if (result === "granted") {
      console.log("🎉 User granted notification permission.");
      return true;
    } else {
      console.warn("User dismissed or denied permission:", result);
      return false;
    }
  } catch (err) {
    console.error("Error requesting notification permission:", err);
    return false;
  }
};

export const showSystemNotification = async (title, body, icon) => {
  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: icon || "/logo.png",
      silent: false,
    });
  } else {
    console.warn("🔕 Notifications not allowed yet.");
  }
};
