const TTL_MS = Number(process.env.DEVICE_APPS_CATALOG_TTL_MS || 30 * 60 * 1000);
const MAX_APPS = Number(process.env.DEVICE_APPS_CATALOG_MAX || 600);

/** @type {Map<string, { apps: { packageName: string, name: string }[], syncedAt: number, expiresAt: number }>} */
const catalogByUserId = new Map();

export function setDeviceAppCatalog(userId, apps) {
  const id = String(userId);
  const now = Date.now();
  const slice = apps.slice(0, MAX_APPS);
  catalogByUserId.set(id, {
    apps: slice,
    syncedAt: now,
    expiresAt: now + TTL_MS,
  });
}

export function getDeviceAppCatalog(userId) {
  const id = String(userId);
  const row = catalogByUserId.get(id);
  if (!row) return null;
  if (Date.now() > row.expiresAt) {
    catalogByUserId.delete(id);
    return null;
  }
  return {
    apps: row.apps,
    syncedAt: new Date(row.syncedAt).toISOString(),
    expiresAt: new Date(row.expiresAt).toISOString(),
  };
}
