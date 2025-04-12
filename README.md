# Zotshort

A Zotero plugin that adds a keyboard shortcut (Ctrl+Alt+N) to trigger the "Add Item by Identifier" function.

## Features

- Adds Ctrl+Alt+N shortcut to quickly open the "Add Item by Identifier" dialog
- Compatible with Zotero 7.x
- Multiple fallback approaches to ensure reliability

## Installation

1. Download the latest release from the [releases page](https://github.com/alon/zotshort/releases)
2. In Zotero:
   - Go to Tools → Add-ons
   - Click the gear icon and select "Install Add-on From File..."
   - Select the downloaded .xpi file

## Usage

Simply press Ctrl+Alt+N anywhere in Zotero to open the "Add Item by Identifier" dialog.

## Development Notes

This plugin uses multiple approaches to trigger the "Add Item by Identifier" function:
1. Direct ZoteroPane method call
2. Active Zotero pane method call
3. Menu item click simulation
4. Keyboard shortcut simulation
5. Internal utilities method call

Testing shows that approaches 3 (menu item click) and 4 (keyboard shortcut) are currently the most reliable methods.

## Version History

### v0.0.1-beta
- Initial beta release
- Implemented multiple approaches for triggering the Add Item by Identifier function
- Added success/failure logging for each approach

## License

MIT

## Author

Alon
