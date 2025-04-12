/**
 * This file serves as the main entry point for the Zotero plugin's lifecycle and event handling.
 * It manages startup, shutdown, preferences, and shortcut functionality.
 */

/**
 * Imports for locale utilities
 */
import { getString, initLocale } from "./utils/locale";
/**
 * Import for creating the toolkit instance
 */
import { createZToolkit } from "./utils/ztoolkit";
/**
 * Import the main shortcut functionality class
 */
import { ZotshortFactory } from "./modules/zotshort";
import { config } from "../package.json";
import { version } from "../package.json";
import { showDebugNotification, showErrorNotification } from "./utils/notifications";

/**
 * Plugin Lifecycle Management
 * -------------------------
 * The following functions handle the plugin's lifecycle events:
 * - onStartup: Called when Zotero loads the plugin
 * - onMainWindowLoad: Called for each Zotero window that opens
 * - onMainWindowUnload: Called when a Zotero window closes
 * - onShutdown: Called when the plugin is being disabled/uninstalled
 */

/**
 * Called when Zotero starts up and the addon is loaded
 * Initializes the addon and registers shortcuts
 */
async function onStartup() {
  // Wait for Zotero to be fully ready before initializing
  await Promise.all([
    Zotero.initializationPromise,
    Zotero.unlockPromise,
    Zotero.uiReadyPromise,
  ]);

  // Set up localization for internationalization support
  initLocale();

  // Register our preferences pane in Zotero's preferences window
  if (typeof Zotero.PreferencePanes !== 'undefined') {
    Zotero.PreferencePanes.register({
      pluginID: config.addonID,
      label: 'Zotshort',
      image: `chrome://${config.addonRef}/content/icons/favicon.png`,
      src: `chrome://${config.addonRef}/content/preferences.xhtml`
    });
  }

  // Initialize keyboard shortcuts from saved preferences
  ZotshortFactory.registerShortcuts();

  // Set up each open Zotero window
  await Promise.all(
    Zotero.getMainWindows().map((win) => onMainWindowLoad(win)),
  );
}

/**
 * Called when a main Zotero window is loaded
 * Sets up the UI components and displays startup notification
 * @param win The Zotero window that was loaded
 */
async function onMainWindowLoad(win: _ZoteroTypes.MainWindow): Promise<void> {
  // Create ztoolkit for every window
  addon.data.ztoolkit = createZToolkit();

  // Load localization resources for this window
  // @ts-ignore This is a moz feature
  win.MozXULElement.insertFTLIfNeeded(
    `${addon.data.config.addonRef}-mainWindow.ftl`,
  );

  // Show a notification that the addon has been loaded
  showDebugNotification(addon.data.config.addonName, {
    text: getString("startup-notification", { args: { version } }),
    type: "success",
    closeTime: 3000,
  });
}

/**
 * Called when a Zotero window is closed
 * Cleans up resources for that window
 * @param win The window being closed
 */
async function onMainWindowUnload(win: Window): Promise<void> {
  ztoolkit.unregisterAll();
}

/**
 * Called when Zotero is shutting down or the addon is being disabled/uninstalled
 * Performs cleanup operations
 */
function onShutdown(): void {
  ztoolkit.unregisterAll();
  // Remove addon object
  addon.data.alive = false;
  // @ts-ignore - Plugin instance is not typed
  delete Zotero[addon.data.config.addonInstance];
}

/**
 * Preferences Management
 * --------------------
 * These functions handle the preferences window and shortcut configuration:
 * - onPrefsEvent: Entry point for preference window events
 * - initializeShortcutButtons: Sets up the UI elements in preferences
 * - onShortcutCheckboxChange: Handles enabling/disabling shortcuts
 */

/**
 * Handles events from the preferences window
 * @param type The type of event (load, save, etc.)
 * @param data Data associated with the event, including the window object
 */
async function onPrefsEvent(type: string, data: { window: Window }) {
  switch (type) {
    case "load":
    case "show":
      // Initialize or refresh the preferences UI
      initializeShortcutButtons(data.window);
      break;
  }
}

/**
 * Handles when a checkbox state changes in preferences
 * @param event The change event
 */
function onShortcutCheckboxChange(event: Event) {
  const checkbox = event.target as Element;
  const prefName = checkbox.getAttribute('preference');
  if (prefName) {
    const xulCheckbox = checkbox as unknown as { checked: boolean };
    Zotero.Prefs.set(prefName, xulCheckbox.checked, true);
    
    // Re-register all shortcuts to apply the change
    ZotshortFactory.registerShortcuts();
  }
}

/**
 * Preferences UI Initialization
 * ---------------------------
 * This function sets up the preferences window UI by:
 * 1. Initializing shortcut buttons with current values
 * 2. Setting up checkboxes with saved states
 * 3. Adding event listeners for user interaction
 */
function initializeShortcutButtons(window: Window) {
  const doc = window.document;
  if (!doc) return;

  // Set up shortcut buttons
  const buttons = doc.querySelectorAll('button[preference]');
  buttons.forEach((button: Element) => {
    const prefName = button.getAttribute('preference');
    if (prefName && button instanceof HTMLButtonElement) {
      // Load and display the saved shortcut or default value
      const savedValue = Zotero.Prefs.get(prefName, true) as string | undefined;
      
      const textSpan = button.querySelector('.shortcut-text');
      if (textSpan) {
        if (savedValue) {
          textSpan.textContent = savedValue;
        } else {
          // Set default shortcuts based on button type
          if (button.id.includes('addByIdentifier')) {
            textSpan.textContent = 'Default: Ctrl+Alt+N';
          } else if (button.id.includes('plugins')) {
            textSpan.textContent = 'Default: Ctrl+Alt+P';
          } else if (button.id.includes('settings')) {
            textSpan.textContent = 'Default: Ctrl+Alt+S';
          } else {
            textSpan.textContent = 'Click to set shortcut';
          }
        }
      }
    }
  });

  // Set up enable/disable checkboxes
  const checkboxes = doc.querySelectorAll('checkbox[preference]');
  checkboxes.forEach((checkbox: Element) => {
    const prefName = checkbox.getAttribute('preference');
    if (prefName) {
      // Load saved state or default to enabled
      let value = Zotero.Prefs.get(prefName, true) as boolean | undefined;
      if (value === undefined) {
        value = true;
        Zotero.Prefs.set(prefName, value, true);
      }
      
      const xulCheckbox = checkbox as unknown as { checked: boolean };
      xulCheckbox.checked = value;
      
      // Add listener for checkbox state changes
      checkbox.addEventListener('command', onShortcutCheckboxChange);
    }
  });
}

/**
 * Shortcut Recording System
 * -----------------------
 * These functions handle the UI for recording new shortcuts:
 * - onShortcutButtonClick: Starts recording mode
 * - onShortcutKeyDown: Captures the actual key combination
 * - onShortcutBlur: Handles cancellation of recording
 */

/**
 * Handles clicking on a shortcut button to start recording a new shortcut
 * @param event The mouse event from clicking the button
 */
function onShortcutButtonClick(event: MouseEvent) {
  const button = event.target as HTMLButtonElement;
  const actualButton = button.closest('button') as HTMLButtonElement;
  if (!actualButton || actualButton.hasAttribute('recording')) return;

  // Mark the button as recording and update its text
  actualButton.setAttribute('recording', 'true');
  const textSpan = actualButton.querySelector('.shortcut-text');
  if (textSpan) {
    textSpan.textContent = 'Press shortcut keys...';
  }
  actualButton.focus();
}

/**
 * Handles keydown events when recording a shortcut
 * Captures the key combination and saves it to preferences
 * @param event The keyboard event
 */
function onShortcutKeyDown(event: KeyboardEvent) {
  event.preventDefault();
  event.stopPropagation();

  const button = event.target as HTMLButtonElement;
  if (!button.hasAttribute('recording')) return;

  // Build the shortcut string from the pressed keys
  const keys: string[] = [];
  if (event.ctrlKey) keys.push('Ctrl');
  if (event.altKey) keys.push('Alt');
  if (event.shiftKey) keys.push('Shift');
  if (event.metaKey) keys.push('Meta');

  // Only add the key if it's not a modifier key
  const key = event.key.toLowerCase();
  if (!['control', 'alt', 'shift', 'meta'].includes(key)) {
    keys.push(event.key.toUpperCase());
    
    // Save the shortcut to preferences
    const shortcut = keys.join('+');
    const prefName = button.getAttribute('preference');
    if (prefName) {
      // Save the preference and verify it was saved
      Zotero.Prefs.set(prefName, shortcut, true);
      
      // Update the UI with the actual saved value
      const savedValue = Zotero.Prefs.get(prefName, true);
      const textSpan = button.querySelector('.shortcut-text');
      if (textSpan) {
        textSpan.textContent = String(savedValue || shortcut);
      }

      // Notify ZotshortFactory to update its shortcuts
      ZotshortFactory.registerShortcuts();
    }

    // End recording
    button.removeAttribute('recording');
    button.blur();
  } else {
    // Show current combination while still waiting for a non-modifier key
    const textSpan = button.querySelector('.shortcut-text');
    if (textSpan) {
      textSpan.textContent = [...keys, '...'].join('+');
    }
  }
}

/**
 * Handles when a shortcut button loses focus
 * Cancels recording if it was in progress
 * @param event The focus event
 */
function onShortcutBlur(event: FocusEvent) {
  const button = event.target as HTMLButtonElement;
  if (button.hasAttribute('recording')) {
    // Cancel recording and restore the previous value or default placeholder
    button.removeAttribute('recording');
    const prefName = button.getAttribute('preference');
    if (prefName) {
      const savedValue = Zotero.Prefs.get(prefName, true);
      const textSpan = button.querySelector('.shortcut-text');
      if (textSpan) {
        if (savedValue) {
          textSpan.textContent = String(savedValue);
        } else {
          // Show default placeholder based on the button type
          if (button.id.includes('addByIdentifier')) {
            textSpan.textContent = 'Default: Ctrl+Alt+N';
          } else if (button.id.includes('plugins')) {
            textSpan.textContent = 'Default: Ctrl+Alt+P';
          } else if (button.id.includes('settings')) {
            textSpan.textContent = 'Default: Ctrl+Alt+S';
          } else {
            textSpan.textContent = 'Click to set shortcut';
          }
        }
      }
    }
  }
}

/**
 * Settings Application
 * ------------------
 * Handles saving changes and restarting Zotero when needed
 */
function onSaveRestartClick(event: MouseEvent) {
  event.preventDefault();
  
  try {
    // Apply new shortcuts
    ZotshortFactory.registerShortcuts();
    
    // Show restart notification - this is important enough to always show
    new addon.data.ztoolkit.ProgressWindow("Zotshort")
      .createLine({
        text: "Saving changes and restarting Zotero...",
        type: "default",
      })
      .show();
    
    // Delay restart slightly to show notification
    setTimeout(() => {
      Zotero.Utilities.Internal.quit(true);
    }, 1000);
  } catch (error) {
    // Show error if restart fails - errors should always be shown
    showErrorNotification("Zotshort", "Failed to save changes and restart");
    
    console.error("Failed to save and restart:", error);
  }
}

// Export all hooks for use by the plugin system
export default {
  onStartup,
  onShutdown,
  onMainWindowLoad,
  onMainWindowUnload,
  onPrefsEvent,
  onShortcutButtonClick,
  onShortcutKeyDown,
  onShortcutBlur,
  onSaveRestartClick,
};
