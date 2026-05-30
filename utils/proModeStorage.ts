import AsyncStorage from "@react-native-async-storage/async-storage";

export const PRO_MODE_STORAGE_KEY = "@led_banner_pro_expires_at_v1";

export async function readProExpiresAt(): Promise<number | null> {
  const raw = await AsyncStorage.getItem(PRO_MODE_STORAGE_KEY);
  if (!raw) return null;
  const expiresAt = Number(raw);
  return Number.isFinite(expiresAt) ? expiresAt : null;
}

export async function writeProExpiresAt(
  expiresAt: number | null,
): Promise<void> {
  if (expiresAt == null) {
    await AsyncStorage.removeItem(PRO_MODE_STORAGE_KEY);
    return;
  }
  await AsyncStorage.setItem(PRO_MODE_STORAGE_KEY, String(expiresAt));
}

export function isProActive(expiresAt: number | null): boolean {
  return expiresAt != null && expiresAt > Date.now();
}
