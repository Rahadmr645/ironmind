export const requestNotificationPermission = async () => {
    // Check if browser supports notifications
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
        return;
    }

    // If permission already granted
    if (Notification.permission === "granted") {
        console.log("Notification permission already granted ✅");
        return true;
    }

    // If permission denied before
    if (Notification.permission === "denied") {
        alert("You have blocked notifications. Please enable them in your browser settings.");
        return false;
    }

    // Otherwise ask user for permission
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
        console.log("User allowed notifications ✅");
        new Notification("✅ Notifications Enabled", {
            body: "You’ll now receive important updates and alerts!",
            icon: "/logo.png",
        });
        return true;
    } else {
        alert("You denied notification permission 😢");
        return false;
    }
};
