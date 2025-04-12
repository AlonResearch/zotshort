import { getPref } from "./prefs";
import Addon from "../addon";

// Get the addon instance
declare const addon: InstanceType<typeof Addon>;

/**
 * Shows a notification only if debug notifications are enabled
 * @param title The title of the notification window
 * @param options Options for the notification
 * @returns The ProgressWindow instance if shown, null if notifications are disabled
 */
export function showDebugNotification(
  title: string,
  options: {
    text: string;
    type?: "default" | "success" | "error";
    closeTime?: number;
  }
) {
  // Check if debug notifications are enabled
  const debugEnabled = getPref("debug-notifications");
  if (!debugEnabled) {
    return null;
  }

  // Show the notification
  return new addon.data.ztoolkit.ProgressWindow(title, {
    closeOnClick: true,
    closeTime: options.closeTime || 3000,
  })
    .createLine({
      text: options.text,
      type: options.type || "default",
    })
    .show();
}

/**
 * Shows an error notification regardless of debug settings
 * @param title The title of the notification window
 * @param text The error message to display
 * @returns The ProgressWindow instance
 */
export function showErrorNotification(title: string, text: string) {
  return new addon.data.ztoolkit.ProgressWindow(title, {
    closeOnClick: true,
    closeTime: 5000,
  })
    .createLine({
      text,
      type: "error",
    })
    .show();
} 