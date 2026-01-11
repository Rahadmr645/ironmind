export const checkNotificationPermission = (openPopup) => {
  const permission = Notification.permission;

  // Already allowed
  if (permission === "granted") {
    console.log("Notification already granted");
    return;
  }

  // Already denied by browser
  if (permission === "denied") {
    console.log("User has blocked notifications!");
    openPopup(true); 
    return;
  }

  // Not decided -> show popup
  openPopup(true); 
};

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error("Permission request failed:", error);
  }
};
