import { getString } from "../utils/locale";

export class ZotshortFactory {
  private static lastTriggerTime = 0;
  private static DEBOUNCE_DELAY = 300; // 300ms delay

  /**
   * Register the Ctrl+Alt+N shortcut to trigger "Add Item by Identifier"
   */
  static registerShortcuts() {
    // Register Ctrl+Alt+N shortcut
    ztoolkit.Keyboard.register((ev, keyOptions) => {
      if (ev.ctrlKey && ev.altKey && ev.key === "n") {
        // Prevent multiple triggers in quick succession
        const now = Date.now();
        if (now - ZotshortFactory.lastTriggerTime < ZotshortFactory.DEBOUNCE_DELAY) {
          return;
        }
        ZotshortFactory.lastTriggerTime = now;

        // Show debug notification
        new ztoolkit.ProgressWindow("Debug Info")
          .createLine({
            text: `Detected: Ctrl + Alt + ${ev.key.toUpperCase()}`,
            type: "default",
          })
          .createLine({
            text: "Action: Add Item by Identifier",
            type: "default",
          })
          .show();

        ZotshortFactory.triggerAddByIdentifier();
      }
    });

    // Notify that shortcut has been registered
    ztoolkit.log("Registered Ctrl+Alt+N shortcut for Add Item by Identifier");
  }

  /**
   * Trigger the Add Item by Identifier function using menu click
   */
  static triggerAddByIdentifier() {
    const win = Zotero.getMainWindow();
    if (!win) {
      ztoolkit.log("No Zotero window found");
      return;
    }

    try {
      const menuItem = win.document.querySelector('menuitem[label*="Add by Identifier"], menuitem[id*="add-by-identifier"]') as HTMLElement;
      if (menuItem) {
        menuItem.click();
        // Success notification is handled by Zotero itself
      } else {
        throw new Error("Menu item not found");
      }
    } catch (e) {
      ztoolkit.log("Failed to trigger Add by Identifier");
      new ztoolkit.ProgressWindow(addon.data.config.addonName)
        .createLine({
          text: getString("shortcut-error"),
          type: "error",
        })
        .show();
    }
  }
} 