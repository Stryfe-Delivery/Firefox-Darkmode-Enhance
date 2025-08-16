# Dark Mode Force Extension

This Firefox extension forces dark mode on all websites, except for those in a whitelist.

## Features:
- Applies dark mode to websites that don't already use it.
- Allows whitelisting of websites (e.g., `libbyapp.com`, `chatgpt.com`).
- Supports dynamic content and re-applies dark mode when necessary.


## How to Use:
- Install the extension.
- The extension will automatically apply dark mode to any site not in the whitelist.
- Sites in the whitelist are excluded from dark mode.

## Whitelisted Sites:
- libbyapp.com
- chatgpt.com

## Credits:
- [Your Name]

##TO DO
- storage is invoked but setting does not persist over page refresh
- setting will need to be made flexible to handle variations of the root domain
- icon update seems laggy
- added catch for g-nav bars on REI site, likely extra overhead due to inflexible code
- does not work on sites like matlab


The extension enables users to toggle dark mode on any website using a keyboard shortcut (Ctrl+Shift+D) or a button in a popup. It also remembers the dark mode state per tab and supports a reset function to clear all states. The extension is built to be simple and flexible, with keyboard shortcuts and a popup UI for better interaction.
Key Components

    manifest.json
        Permissions: The extension requests permissions for activeTab, storage, tabs, and commands.
        Background: Defines the background script (background.js) which listens for events like the keyboard shortcut.
        Content Scripts: Injects content.js into web pages to modify their appearance and enable dark mode.
        Commands: Configures a keyboard shortcut (Ctrl+Shift+D) that triggers dark mode toggling.
        Browser Action: Defines a browser action with a popup (popup.html) that allows users to toggle dark mode from the popup interface.

1. background.js - Background Script

This script is responsible for managing the dark mode toggle state and listening for keyboard shortcuts.

    Whitelisted Domains: A predefined list of domains (libbyapp.com, chatgpt.com) is stored in chrome.storage.local. These domains are excluded from dark mode.
    Command Listener: It listens for the keyboard shortcut (Ctrl+Shift+D) using the chrome.commands.onCommand.addListener method. When the shortcut is pressed:
        It checks if the current tab's hostname is on the whitelist.
        If the domain is not whitelisted, it sends a message to the content script (content.js) to toggle dark mode.
        It then toggles the dark mode state and saves this state in chrome.storage.local for that tab.

2. content.js - Content Script

This script is injected into each web page to modify its appearance based on the dark mode state.

    Dark Mode Toggle: It listens for messages from the background script (or the popup) to toggle dark mode. When the dark mode is toggled, it applies a dark-mode class to the body element and modifies the background color of the page.

    Styles: You can customize the dark-mode class styles to adjust text colors, backgrounds, etc., to suit the dark mode design.

3. popup.html - Popup UI

This is the user interface shown when clicking on the extension icon in the browser.

    Toggle Button: This button allows users to enable or disable dark mode on the current page by interacting with the popup.
        It also displays the current dark mode state (ON or OFF) and changes text accordingly.
        Clicking this button sends a message to the content script to toggle dark mode on the page.

    Reset Button: The reset button clears the dark mode states across all sites by calling chrome.storage.local.clear(). This resets the dark mode preferences stored for every tab.

4. popup.js - Popup Script

This script handles the logic of the popup interface, ensuring it interacts with the background script to toggle dark mode and update the UI.

    Initial State: When the popup is opened, it checks if dark mode is enabled for the active tab by querying chrome.storage.local for the stored state.
        It uses the tab ID to fetch the stored dark mode state for that tab and updates the button text and appearance accordingly (e.g., "Enable Dark Mode" or "Disable Dark Mode").

    Toggle Button: When clicked, it:
        Sends a message to the content script to toggle dark mode.
        Updates the button text and appearance to reflect the new state.
        Saves the new state (enabled or disabled) in chrome.storage.local for that specific tab.

    Reset Button: When clicked, it clears all dark mode states from chrome.storage.local. This means dark mode preferences for all tabs will be reset to the default state (off).

How the Dark Mode Toggle Works

    Keyboard Shortcut (Ctrl+Shift+D):
        The background script listens for this shortcut and triggers the toggle.
        It checks if the current tab's hostname is on the whitelist (e.g., libbyapp.com or chatgpt.com).
        If not, it sends a message to the content script to toggle dark mode on the page.
        The background script then updates the dark mode state for the active tab in chrome.storage.local.

    Popup Button:
        The user can also toggle dark mode directly via the popup. The button in the popup sends a message to the content script to toggle dark mode.
        The popup also checks the current dark mode state for the active tab when opened and updates the button text accordingly.
        The state is stored in chrome.storage.local for persistence, and it persists even after a page reload or tab switch.

    Persistent State:
        The state of dark mode is saved in chrome.storage.local using the tab ID as the key. This ensures that each tab has its own independent dark mode state.
        When the tab is reloaded or a new tab is opened, the extension checks chrome.storage.local to see if dark mode should be applied.

    Whitelisted Domains:
        Sites on the whitelist (libbyapp.com and chatgpt.com) are excluded from dark mode. If the current page’s hostname is on the whitelist, dark mode is not applied even if the user toggles it.

Additional Features

    Reset Button:
        The reset button in the popup clears all saved dark mode states from chrome.storage.local, effectively resetting all sites back to their default (light) mode.

    Dark Mode CSS Customization:
        The content script (content.js) can be expanded to apply custom dark mode CSS styles. You can add more CSS rules to make sure dark mode appears correctly for various website structures.

    UI Feedback:
        The popup UI provides immediate feedback on the current dark mode state (ON or OFF), helping users understand whether dark mode is active for the current tab.

How It All Works Together

    When the user presses Ctrl+Shift+D or clicks the popup button:
        The background script checks the current domain and ensures it's not on the whitelist.
        It toggles the dark mode state for the current tab and stores the new state in chrome.storage.local.
    Popup UI:
        The popup shows the current state of dark mode (whether it’s enabled or disabled) and allows the user to toggle it or reset the state for all tabs.
    On page load or tab refresh:
        The content script reads the stored dark mode state for the current tab from chrome.storage.local and applies the necessary styles (dark mode or light mode).

Summary

    Keyboard Shortcuts: Ctrl+Shift+D toggles dark mode.
    Popup UI: Users can toggle dark mode and reset all states.
    Persistent State: Dark mode is saved per tab using chrome.storage.local.
    Whitelisted Domains: Sites like libbyapp.com and chatgpt.com are excluded from dark mode.

This setup ensures a smooth user experience with a persistent dark mode that works across tab reloads, page reloads, and new tabs. Let me know if you have any more questions!