# ChAIPanel - ChatGPT Side Panel Extension

A Chrome extension that allows you to access ChatGPT in a convenient side panel, making it easy to chat with AI while browsing the web.

## Features

- Quick access to ChatGPT in a side panel
- Keyboard shortcut support (Ctrl+I / Cmd+I)
- Persistent chat sessions
- Customizable settings
- Clean and modern interface
- Intelligent page content extraction for context-aware conversations
- Automatic detection of main content areas on web pages
- Smart filtering of navigation, headers, and footers
- Content length optimization for efficient processing

## Installation

### From Chrome Web Store (Coming Soon)

1. Visit the Chrome Web Store
2. Search for "ChAIPanel"
3. Click "Add to Chrome"

### Manual Installation (Developer Mode)

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory
5. The extension should now be installed and ready to use

## Usage

- Click the extension icon in your Chrome toolbar to open the side panel
- Use the keyboard shortcut `Ctrl+I` (Windows/Linux) or `Cmd+I` (Mac) to toggle the side panel
- Start chatting with ChatGPT directly in the side panel
- Access settings through the extension options page

## Project Structure

```
├── src/
│   ├── background/    # Background service worker
│   ├── content/       # Content scripts for page interaction
│   ├── popup/         # Extension popup interface
│   ├── settings/      # Settings page
│   └── sidepanel/     # Main ChatGPT interface
├── public/            # Static assets
│   └── icons/         # Extension icons
├── style.css          # Global styles
└── manifest.json      # Extension configuration
```

## Development

1. Clone the repository
2. Install dependencies (if any)
3. Make your changes
4. Load the extension in Chrome using Developer mode
5. Test your changes

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[Add your license here]

## Support

If you encounter any issues or have suggestions, please open an issue in the GitHub repository. 