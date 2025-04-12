/**
 * Import basic toolkit utilities
 */
import { BasicTool } from "zotero-plugin-toolkit";
/**
 * Import main addon class
 */
import Addon from "./addon";
/**
 * Import configuration from package.json
 */
import { config } from "../package.json";

/**
 * Create basic toolkit instance for global utilities
 */
const basicTool = new BasicTool();

/**
 * Initialize the addon if it doesn't already exist in Zotero's global scope
 */
// @ts-ignore - Plugin instance is not typed
if (!basicTool.getGlobal("Zotero")[config.addonInstance]) {
  // Create addon instance and assign to global scope
  _globalThis.addon = new Addon();
  
  // Define the ztoolkit as a global property for easy access
  defineGlobal("ztoolkit", () => {
    return _globalThis.addon.data.ztoolkit;
  });
  
  // Register the addon instance in Zotero's global scope
  // @ts-ignore - Plugin instance is not typed
  Zotero[config.addonInstance] = addon;
}

/**
 * Defines a global property that can be accessed directly from the global scope
 * Overload for defining a global property that maps to an existing Zotero property
 * 
 * @param name The name of the property to define
 */
function defineGlobal(name: Parameters<BasicTool["getGlobal"]>[0]): void;
/**
 * Defines a global property with a custom getter
 * 
 * @param name The name of the property to define
 * @param getter A function that returns the property value
 */
function defineGlobal(name: string, getter: () => any): void;
/**
 * Implementation of the defineGlobal function
 * Creates a global property with either a custom getter or one mapped to Zotero
 * 
 * @param name The name of the property to define
 * @param getter Optional custom getter function
 */
function defineGlobal(name: string, getter?: () => any) {
  Object.defineProperty(_globalThis, name, {
    get() {
      return getter ? getter() : basicTool.getGlobal(name);
    },
  });
}
