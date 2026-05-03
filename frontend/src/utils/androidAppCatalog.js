/**
 * Normalizes apps injected by the native shell (e.g. Android WebView).
 * Set on window before or after load:
 *   window.__IRONMIND_INSTALLED_APPS__ = [
 *     { packageName: "com.instagram.android", name: "Instagram" },
 *     ...
 *   ];
 */
export function normalizeInstalledAppsList(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  const seen = new Set();
  for (const item of raw) {
    let packageName = "";
    let name = "";
    if (typeof item === "string") {
      packageName = item.trim();
      name = packageName;
    } else if (item && typeof item === "object") {
      packageName = String(item.packageName || item.package || "").trim();
      name = String(item.name || item.label || item.appName || packageName).trim();
    }
    if (!packageName || seen.has(packageName)) continue;
    seen.add(packageName);
    out.push({ packageName, name: name || packageName });
  }
  out.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  return out;
}

export function readInjectedDeviceApps() {
  if (typeof window === "undefined") return [];
  return normalizeInstalledAppsList(window.__IRONMIND_INSTALLED_APPS__);
}
