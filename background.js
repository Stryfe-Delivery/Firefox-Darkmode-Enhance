let darkModeEnabled = true;

// Initialize from storage
chrome.storage.local.get('darkModeEnabled', (data) => {
  // Fix shadowing and default value
  darkModeEnabled = data.darkModeEnabled ?? true;
  
  // Only notify active tabs in normal windows
  chrome.tabs.query({active: true, windowType: 'normal'}, (tabs) => {
    tabs.forEach(tab => {
      notifyTab(tab.id);
    });
  });
});

// Handle keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-dark-mode") toggleDarkMode();
});

// Handle content script requests
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'getDarkModeState') {
    sendResponse(darkModeEnabled);
  }
});

function toggleDarkMode() {
  darkModeEnabled = !darkModeEnabled;
  chrome.storage.local.set({ darkModeEnabled });
  
  // Notify all normal windows
  chrome.tabs.query({windowType: 'normal'}, (tabs) => {
    tabs.forEach(tab => notifyTab(tab.id));
  });
}

function notifyTab(tabId) {
  chrome.tabs.sendMessage(
    tabId,
    { darkModeEnabled },
    () => {
      if (chrome.runtime.lastError) {
        // Retry for dynamic content pages
        setTimeout(() => chrome.tabs.sendMessage(tabId, { darkModeEnabled }), 1000);
      }
    }
  );
}

// Add this listener to background.js
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete') {
    chrome.tabs.sendMessage(tabId, { darkModeEnabled }, () => {
      if (chrome.runtime.lastError) {
        // Retry if content script isn't ready
        setTimeout(() => chrome.tabs.sendMessage(tabId, { darkModeEnabled }), 500);
      }
    });
  }
});
