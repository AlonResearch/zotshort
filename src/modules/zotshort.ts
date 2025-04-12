import { getString } from "../utils/locale";

export class ZotshortFactory {
  /**
   * Register the Ctrl+Alt+N shortcut to trigger "Add Item by Identifier"
   */
  static registerShortcuts() {
    // Register Ctrl+Alt+N shortcut
    ztoolkit.Keyboard.register((ev, keyOptions) => {
      if (ev.ctrlKey && ev.altKey && ev.key === "n") {
        ZotshortFactory.testAllApproaches();
      }
    });

    // Notify that shortcut has been registered
    ztoolkit.log("Registered Ctrl+Alt+N shortcut for Add Item by Identifier");
  }

  /**
   * Test all approaches to trigger the Add Item by Identifier function
   */
  static testAllApproaches() {
    const results = [];

    // Get the main Zotero window
    const win = Zotero.getMainWindow();
    if (!win) {
      ztoolkit.log("No Zotero window found");
      return;
    }

    // Approach 1
    try {
      if (win.ZoteroPane && typeof win.ZoteroPane.addItemFromIdentifier === 'function') {
        win.ZoteroPane.addItemFromIdentifier();
        results.push("Approach 1 succeeded");
      }
    } catch (e) {
      results.push("Approach 1 failed");
    }

    // Approach 2
    try {
      const zp = win.Zotero.getActiveZoteroPane();
      if (zp && typeof zp.addItemFromIdentifier === 'function') {
        zp.addItemFromIdentifier();
        results.push("Approach 2 succeeded");
      }
    } catch (e) {
      results.push("Approach 2 failed");
    }

    // Approach 3
    try {
      const menuItem = win.document.querySelector('menuitem[label*="Add by Identifier"], menuitem[id*="add-by-identifier"]') as HTMLElement;
      if (menuItem) {
        menuItem.click();
        results.push("Approach 3 succeeded");
      }
    } catch (e) {
      results.push("Approach 3 failed");
    }

    // Approach 4
    try {
      const event = new win.KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        keyCode: 73, // 'I'
        shiftKey: true
      });
      const activeElement = win.document.activeElement;
      if (activeElement) {
        activeElement.dispatchEvent(event);
        results.push("Approach 4 succeeded");
      }
    } catch (e) {
      results.push("Approach 4 failed");
    }

    // Approach 5
    try {
      const internal = Zotero.Utilities?.Internal as any;
      if (internal && typeof internal.openIdentifierWindow === 'function') {
        internal.openIdentifierWindow();
        results.push("Approach 5 succeeded");
      }
    } catch (e) {
      results.push("Approach 5 failed");
    }

    // Log results
    ztoolkit.log("Test results:", results);
    new ztoolkit.ProgressWindow(addon.data.config.addonName)
      .createLine({
        text: `Test results: ${results.join(', ')}`,
        type: "info",
      })
      .show();
  }

  /**
   * Show a success notification
   */
  static showSuccessNotification(details: string = "") {
    const text = details ? 
      `${getString("shortcut-success")} (${details})` : 
      getString("shortcut-success");
    
    new ztoolkit.ProgressWindow(addon.data.config.addonName)
      .createLine({
        text: text,
        type: "success",
      })
      .show();
  }
} 