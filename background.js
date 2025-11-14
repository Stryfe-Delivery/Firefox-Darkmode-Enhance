let darkModeEnabled = true;
let SITE_BLACKLIST = [];

// Load blacklist from storage
chrome.storage.local.get(['blacklistedSites', 'darkModeEnabled'], (data) => {
  SITE_BLACKLIST = data.blacklistedSites || [];
  darkModeEnabled = data.darkModeEnabled ?? true;
  notifyTabsOptimized();
});

// Check if a tab URL is blacklisted
function isTabBlacklisted(tab) {
  if (!tab.url) return false;
  try {
    const url = new URL(tab.url);
    return SITE_BLACKLIST.some(blacklisted => 
      url.hostname === blacklisted || url.hostname.endsWith('.' + blacklisted)
    );
  } catch (error) {
    return false;
  }
}

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
  notifyTabsOptimized();
}

// Optimized tab notification with blacklist support
function notifyTabsOptimized() {
  // First notify active tabs for immediate response
  chrome.tabs.query({active: true, windowType: 'normal'}, (activeTabs) => {
    activeTabs.forEach(tab => {
      if (!isTabBlacklisted(tab)) {
        notifyTab(tab.id);
      }
    });
    
    // Then notify background tabs with delay
    chrome.tabs.query({active: false, windowType: 'normal'}, (backgroundTabs) => {
      setTimeout(() => {
        backgroundTabs.forEach(tab => {
          if (!isTabBlacklisted(tab)) {
            notifyTab(tab.id);
          }
        });
      }, 1000);
    });
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

// Notify tabs when they complete loading (skip blacklisted sites)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && !isTabBlacklisted(tab)) {
    chrome.tabs.sendMessage(tabId, { darkModeEnabled }, () => {
      if (chrome.runtime.lastError) {
        // Retry if content script isn't ready
        setTimeout(() => chrome.tabs.sendMessage(tabId, { darkModeEnabled }), 500);
      }
    });
  }
});