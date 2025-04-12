/**
 * Import configuration from package.json
 */
import { config } from "../package.json";
import { DialogHelper } from "zotero-plugin-toolkit";
/**
 * Import all lifecycle hooks
 */
import hooks from "./hooks";
/**
 * Import utility to create the toolkit instance
 */
import { createZToolkit } from "./utils/ztoolkit";

/**
 * Main addon class that represents the plugin instance
 * This is the entrypoint for the addon and holds all references to components
 */
class Addon {
  /**
   * Data object that holds references to various parts of the addon
   */
  public data: {
    /**
     * Flag indicating if the addon is active
     */
    alive: boolean;
    /**
     * Configuration from package.json
     */
    config: typeof config;
    /**
     * Current environment (development or production)
     */
    env: "development" | "production";
    /**
     * Reference to the toolkit helper library
     */
    ztoolkit: ZToolkit;
    /**
     * Localization data
     */
    locale?: {
      current: any;
    };
  };
  /**
   * Lifecycle hooks that are called by Zotero
   */
  public hooks: typeof hooks;
  /**
   * Public API that can be used by other addons
   */
  public api: object;

  /**
   * Constructor initializes the addon with default values
   */
  constructor() {
    this.data = {
      alive: true,
      config,
      env: __env__,
      ztoolkit: createZToolkit(),
    };
    this.hooks = hooks;
    this.api = {};
  }
}

export default Addon;
