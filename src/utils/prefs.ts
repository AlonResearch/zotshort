/**
 * Import configuration from package.json
 */
import { config } from "../../package.json";

/**
 * TypeScript type definition for plugin preferences
 * Uses Zotero's built-in preference map type
 */
type PluginPrefsMap = _ZoteroTypes.Prefs["PluginPrefsMap"];

/**
 * Prefix for all preferences related to this addon
 * Based on the configuration in package.json
 */
const PREFS_PREFIX = config.prefsPrefix;

/**
 * Get preference value from Zotero preferences system
 * Automatically prefixes the key with the addon's preference prefix
 * 
 * @param key The preference key without the prefix
 * @returns The preference value, or undefined if not set
 */
export function getPref<K extends keyof PluginPrefsMap>(key: K) {
  return Zotero.Prefs.get(`${PREFS_PREFIX}.${key}`, true) as PluginPrefsMap[K];
}

/**
 * Set preference value in Zotero preferences system
 * Automatically prefixes the key with the addon's preference prefix
 * 
 * @param key The preference key without the prefix
 * @param value The value to set
 * @returns Success status from Zotero.Prefs.set
 */
export function setPref<K extends keyof PluginPrefsMap>(
  key: K,
  value: PluginPrefsMap[K],
) {
  return Zotero.Prefs.set(`${PREFS_PREFIX}.${key}`, value, true);
}

/**
 * Clear a preference value from Zotero preferences system
 * Automatically prefixes the key with the addon's preference prefix
 * 
 * @param key The preference key without the prefix
 * @returns Success status from Zotero.Prefs.clear
 */
export function clearPref(key: string) {
  return Zotero.Prefs.clear(`${PREFS_PREFIX}.${key}`, true);
}
