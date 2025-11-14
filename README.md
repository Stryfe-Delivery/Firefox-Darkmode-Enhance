# 🌙 Global Dark Mode - Firefox Extension

An expanded dark mode extension for Firefox that automatically applies dark themes to all websites, with intelligent element detection and site-specific exceptions for those with unpredicted styles or that natively respect dark modes. 

## Features

- **Universal Coverage** - Works on most websites with intelligent CSS injection
- **Smart Performance** - Optimized MutationObserver and lazy CSS loading for minimal resource usage
- **Element-Aware** - Special handling for headers, footers, forms, tables, and dynamic content
- **Smart(-ish) Blacklisting** - Automatically skip sites with native dark mode or manually blacklist problematic sites
- **Keyboard Shortcuts** - Quick toggle with Ctrl+Shift+D
- **Persistent Settings** - Remembers your preferences across browser sessions
- **Real-time Updates** - Instant application to new tabs and dynamic content

## Installation
At this time there are no plans to host this via the firefox store. While this would allow easier downloads, there is some really sketchy stuff there these days and it almost makes something less trustworthy imho. 

### Manual Installation (Developer mode)
1. Download or clone this repository
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Select any file in the extension directory (e.g., `manifest.json`)

## How to Use

### Basic Usage
1. Click the extension icon in your toolbar
2. Click "Enable Dark Mode" to activate globally
3. Use "Disable Dark Mode" to revert to light themes

### Keyboard Shortcut
- **Ctrl+Shift+D** - Toggle dark mode on/off instantly

### Managing Site Exceptions
1. Navigate to a site you want to exclude from dark mode
2. Click the extension icon
3. Click "Blacklist This Site"
4. The site will be immediately reverted to its original theme
5. Reload the page to see changes take effect permanently

### Resetting Settings
- Click "Reset All Sites" to clear all blacklists and disable dark mode globally

## Technical Details

### Supported Elements
- Body and main content backgrounds
- Headers, footers, and navigation elements
- Forms, inputs, and buttons
- Tables and data grids
- Modals, dialogs, and popups
- Cards, panels, and containers
- Images and media (with brightness adjustment)
- Scrollbars and text selection
If something is not working, toggle it off, add an exception, hit reset, or report the issue. 

### Performance Features
- **Lazy CSS Injection** - Styles only load when dark mode is active
- **Debounced Processing** - Batches DOM changes to reduce CPU usage
- **Element Caching** - Prevents re-processing of already styled elements
- **Memory Management** - Automatic cleanup of cached elements
- **Optimized Messaging** - Prioritizes active tabs for immediate feedback

### File Structure
```
global-dark-mode/
├── manifest.json          # Extension configuration
├── background.js          # Background process and messaging
├── content.js            # Content script and CSS injection
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality and storage
└── icons/                # Extension icons
    ├── icon-16.png
    ├── icon-48.png
    └── icon-128.png
```

## Customization

### Modifying Dark Theme Colors
Edit the CSS variables in `content.js`:

```css
:root.dark-mode {
  --dark-bg-primary: #121212;      /* Main background */
  --dark-bg-secondary: #1e1e1e;    /* Secondary backgrounds */
  --dark-bg-tertiary: #2d2d2d;     /* Form elements, cards */
  --dark-text-primary: #e0e0e0;    /* Primary text */
  --dark-text-secondary: #a0a0a0;  /* Secondary text */
  --dark-accent: #bb86fc;          /* Links and accents */
  --dark-border: #444;             /* Borders and separators */
}
```

### Adding Default Blacklisted Sites
Edit the `SITE_BLACKLIST` array in both `content.js` and `background.js`:

```javascript
const SITE_BLACKLIST = [
  'deepseek.com',
  'github.com',
  'discord.com',
  // Add more sites as needed
];
```

## Bugs / Troubleshooting

### Dark Mode Not Applying
- Ensure the extension is enabled in `about:addons`
- Check if the site is blacklisted in the popup
- Reload the page to re-apply styles
- Use Ctrl+Shift+D to force toggle

### Performance Issues
- The extension includes performance optimizations, but very complex sites may experience slight delays
- Blacklist performance-heavy sites if needed

### Site-Specific Issues
1. Use the blacklist feature for problematic sites
2. Some sites with complex CSS may require manual overrides
3. Dynamic content (SPAs) are supported but may need page reload

## Contributing

We welcome contributions! Please feel free to submit pull requests or open issues for:

- New site-specific fixes
- Performance improvements
- Additional element selectors
- Translation support
- Bug reports

### Development Setup
1. Fork the repository
2. Load as temporary extension in Firefox
3. Make changes and test
4. Submit pull request with description of changes

## License

This project is licensed according to the terms in the attached license file. 

## Acknowledgments

- Inspired by various dark mode extensions, that didn't work  or weren't maintained. I loved the idea of midnight lizard, but it always froze or crashed
- Contributors and testers who helped improve the extension (so far, just me >_< )

---

**Note**: This extension works by injecting CSS styles into web pages. Some sites with strict Content Security Policies (CSP) may not work perfectly. The blacklist feature helps manage these edge cases.

---

<div align="center">

**Enjoy browsing in dark mode!** 🌙

If you find this extension helpful, please consider giving it a ⭐ on GitHub!

</div>
