# Zotshort

A Zotero plugin that adds convenient keyboard shortcuts for commonly used functions.

## Features

- Adds keyboard shortcuts for frequently used Zotero functions:
  - Ctrl+Alt+N: Open the "Add Item by Identifier" dialog
  - Ctrl+Alt+P: Open the "Plugins" menu
  - Ctrl+Alt+S: Open the "Settings/Preferences" dialog
- All shortcuts are customizable through preferences
- Compatible with Zotero 7.x
- Multiple fallback approaches to ensure reliability
- Debounce protection to prevent accidental double-triggering

## Installation

1. Download the latest release from the [releases page](https://github.com/alon/zotshort/releases)
2. In Zotero:
   - Go to Tools → Add-ons
   - Click the gear icon and select "Install Add-on From File..."
   - Select the downloaded .xpi file

## Usage

### Default Shortcuts
- Press Ctrl+Alt+N anywhere in Zotero to open the "Add Item by Identifier" dialog
- Press Ctrl+Alt+P to open the Plugins menu
- Press Ctrl+Alt+S to open Settings/Preferences

### Customizing Shortcuts
1. Go to Zotero Preferences
2. Navigate to the Zotshort section
3. For each shortcut you can:
   - Enable/disable using the checkbox
   - Click the shortcut button to record a new key combination
   - Press Esc or click outside to cancel recording

## Development Notes

This plugin uses multiple approaches to trigger menu actions:
1. Direct menu item click simulation
2. Multiple selectors to handle different OS labels (e.g., "Preferences" vs "Settings")
3. Debounce protection (300ms) to prevent accidental double-triggers
4. Comprehensive error handling with user notifications

## Version History

### v0.003-alpha
- New shortcuts for settings and plugin menus
- New Zotshort preferences menu under settings menu
- Enhanced error handling and notifications.

### v0.002-alpha
- Added customizable shortcuts for Plugins (Ctrl+Alt+P) and Settings (Ctrl+Alt+S)
- Improved shortcut handling with debounce protection
- Added comprehensive error notifications

### v0.001-alpha
- Initial beta release
- Implemented "Add Item by Identifier" shortcut (Ctrl+Alt+N)
- Added success/failure logging

## License

MIT

## Author

Alon
