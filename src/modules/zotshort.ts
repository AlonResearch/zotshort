/**
 * Utility for importing localized strings
 */
import { getString } from "../utils/locale";
/**
 * Utility for accessing plugin preferences
 */
import { getPref } from "../utils/prefs";
import { showDebugNotification, showErrorNotification } from "../utils/notifications";
import Addon from "../addon";

// Get the addon instance
declare const addon: InstanceType<typeof Addon>;

/**
 * Main factory class that handles keyboard shortcuts for Zotero actions
 */
export class ZotshortFactory {
  /**
   * Tracks when the shortcut was last triggered to prevent multiple rapid activations
   */
  private static lastTriggerTime = 0;
  /**
   * Time in milliseconds to wait before allowing another shortcut trigger
   * Prevents accidental double-triggering
   */
  private static DEBOUNCE_DELAY = 300; // 300ms delay

  /**
   * Stores the currently registered keyboard shortcuts
   */
  private static registeredShortcuts: { [key: string]: (ev: KeyboardEvent) => void } = {};

  /**
   * Registers keyboard shortcuts for Zotero functions based on user preferences
   * This is the main entry point called during plugin initialization
   */
  static registerShortcuts() {
    // Unregister all existing shortcuts first
    ZotshortFactory.unregisterAllShortcuts();
    
    // Register the "Add by Identifier" shortcut
    ZotshortFactory.registerAddByIdentifierShortcut();
    
    // Register the "Plugins" shortcut
    ZotshortFactory.registerPluginsShortcut();
    
    // Register the "Settings" shortcut
    ZotshortFactory.registerSettingsShortcut();
  }
  
  /**
   * Unregisters all currently registered shortcuts
   */
  static unregisterAllShortcuts() {
    for (const shortcutKey in ZotshortFactory.registeredShortcuts) {
      const callback = ZotshortFactory.registeredShortcuts[shortcutKey];
      addon.data.ztoolkit.Keyboard.unregister(callback);
    }
    ZotshortFactory.registeredShortcuts = {};
  }
  
  /**
   * Registers the shortcut for "Add by Identifier" function
   */
  static registerAddByIdentifierShortcut() {
    // Check if the shortcut is enabled in preferences
    const shortcutEnabled = getPref("shortcut-addByIdentifier-enabled") ?? true;
    if (!shortcutEnabled) {
      addon.data.ztoolkit.log("Add by Identifier shortcut is disabled in preferences.");
      return;
    }

    // Get the user-configured shortcut key or use default Ctrl+Alt+N
    const shortcutKeyString = String(getPref("shortcut-addByIdentifier-key") || "Ctrl+Alt+N");

    // Register the shortcut with the parsed key combination
    ZotshortFactory.registerShortcutWithAction(
      shortcutKeyString, 
      "Add Item by Identifier", 
      ZotshortFactory.triggerAddByIdentifier
    );
  }
  
  /**
   * Registers the shortcut for "Plugins" menu
   */
  static registerPluginsShortcut() {
    // Check if the shortcut is enabled in preferences
    const shortcutEnabled = getPref("shortcut-plugins-enabled") ?? true;
    if (!shortcutEnabled) {
      addon.data.ztoolkit.log("Plugins shortcut is disabled in preferences.");
      return;
    }

    // Get the user-configured shortcut key or use default Ctrl+Alt+P
    const shortcutKeyString = String(getPref("shortcut-plugins-key") || "Ctrl+Alt+P");

    // Register the shortcut with the parsed key combination
    ZotshortFactory.registerShortcutWithAction(
      shortcutKeyString, 
      "Plugins", 
      ZotshortFactory.triggerPlugins
    );
  }
  
  /**
   * Registers the shortcut for "Settings" menu
   */
  static registerSettingsShortcut() {
    // Check if the shortcut is enabled in preferences
    const shortcutEnabled = getPref("shortcut-settings-enabled") ?? true;
    if (!shortcutEnabled) {
      addon.data.ztoolkit.log("Settings shortcut is disabled in preferences.");
      return;
    }

    // Get the user-configured shortcut key or use default Ctrl+Alt+S
    const shortcutKeyString = String(getPref("shortcut-settings-key") || "Ctrl+Alt+S");

    // Register the shortcut with the parsed key combination
    ZotshortFactory.registerShortcutWithAction(
      shortcutKeyString, 
      "Settings", 
      ZotshortFactory.triggerSettings
    );
  }
  
  /**
   * Helper function to register a shortcut with a specific action
   * @param shortcutKeyString The keyboard shortcut as a string (e.g., "Ctrl+Alt+N")
   * @param actionName The name of the action for logging/notification
   * @param actionCallback The function to call when the shortcut is triggered
   */
  private static registerShortcutWithAction(
    shortcutKeyString: string, 
    actionName: string, 
    actionCallback: () => void
  ) {
    // Parse the shortcut string (simple parser for common cases)
    const parts = shortcutKeyString.split('+').map(part => part.trim().toLowerCase());
    const key = parts.pop() || ''; // Last part is the key
    const ctrlKey = parts.includes('ctrl');
    const altKey = parts.includes('alt');
    const shiftKey = parts.includes('shift');
    const metaKey = parts.includes('meta'); // For Cmd key on Mac

    if (!key) {
      addon.data.ztoolkit.log(`Invalid shortcut key format for ${actionName}: ${shortcutKeyString}`, 'error');
      return;
    }

    // Create the keyboard event handler
    const handler = (ev: KeyboardEvent) => {
      // Check if the pressed keys match the configured shortcut
      if (
        ev.key.toLowerCase() === key &&
        ev.ctrlKey === ctrlKey &&
        ev.altKey === altKey &&
        ev.shiftKey === shiftKey &&
        ev.metaKey === metaKey
      ) {
        // Prevent multiple triggers in quick succession using debouncing
        const now = Date.now();
        if (now - ZotshortFactory.lastTriggerTime < ZotshortFactory.DEBOUNCE_DELAY) {
          return;
        }
        ZotshortFactory.lastTriggerTime = now;

        // Show debug notification
        showDebugNotification("Debug Info", {
          text: `Detected: ${shortcutKeyString}\nAction: ${actionName}`,
          type: "default",
          closeTime: 2000
        });

        actionCallback();
      }
    };

    // Register the shortcut and store it for later unregistration
    addon.data.ztoolkit.Keyboard.register(handler);
    ZotshortFactory.registeredShortcuts[`${actionName}-${shortcutKeyString}`] = handler;

    // Log that shortcut has been registered
    addon.data.ztoolkit.log(`Registered '${shortcutKeyString}' shortcut for ${actionName}`);
  }

  /**
   * Trigger the Add Item by Identifier function using menu click approach
   * This approach simulates clicking the menu item in the Zotero UI
   */
  static triggerAddByIdentifier() {
    // Get the main Zotero window
    const win = Zotero.getMainWindow();
    if (!win) {
      addon.data.ztoolkit.log("No Zotero window found");
      return;
    }

    try {
      // Find the Add by Identifier menu item in the Zotero UI
      const menuItem = win.document.querySelector('menuitem[label*="Add by Identifier"], menuitem[id*="add-by-identifier"]') as HTMLElement;
      if (menuItem) {
        // Simulate clicking the menu item
        menuItem.click();
        // Success notification is handled by Zotero itself
      } else {
        throw new Error("Menu item not found");
      }
    } catch (e) {
      // Display error notification if the menu item couldn't be found or clicked
      addon.data.ztoolkit.log("Failed to trigger Add by Identifier");
      showErrorNotification(addon.data.config.addonName, getString("shortcut-error"));
    }
  }
  
  /**
   * Trigger the Plugins menu item from the Tools menu
   */
  static triggerPlugins() {
    // Get the main Zotero window
    const win = Zotero.getMainWindow();
    if (!win) {
      addon.data.ztoolkit.log("No Zotero window found");
      return;
    }

    try {
      // Find the Plugins menu item in the Tools menu
      const menuItem = win.document.querySelector('menuitem[label*="Plugins"], menuitem[id*="plugins"]') as HTMLElement;
      if (menuItem) {
        // Simulate clicking the menu item
        menuItem.click();
        // Success notification is handled by Zotero itself
      } else {
        throw new Error("Plugins menu item not found");
      }
    } catch (e) {
      // Display error notification if the menu item couldn't be found or clicked
      addon.data.ztoolkit.log("Failed to trigger Plugins menu");
      showErrorNotification(addon.data.config.addonName, getString("shortcut-error"));
    }
  }
  
  /**
   * Trigger the Settings/Preferences menu item
   */
  static triggerSettings() {
    // Get the main Zotero window
    const win = Zotero.getMainWindow();
    if (!win) {
      addon.data.ztoolkit.log("No Zotero window found");
      return;
    }

    try {
      // Find the Preferences/Settings menu item using various potential selectors
      // The menu item might be labeled as "Preferences" or "Settings" depending on the OS
      const menuItem = win.document.querySelector(
        'menuitem[label*="Preferences"], menuitem[label*="Settings"], menuitem[id*="preferences"], menuitem[id*="settings"]'
      ) as HTMLElement;
      
      if (menuItem) {
        // Simulate clicking the menu item
        menuItem.click();
        // Success notification is handled by Zotero itself
      } else {
        throw new Error("Settings/Preferences menu item not found");
      }
    } catch (e) {
      // Display error notification if the menu item couldn't be found or clicked
      addon.data.ztoolkit.log("Failed to trigger Settings/Preferences menu");
      showErrorNotification(addon.data.config.addonName, getString("shortcut-error"));
    }
  }
} 