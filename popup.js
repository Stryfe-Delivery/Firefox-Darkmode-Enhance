document.addEventListener('DOMContentLoaded', function () {
  // Get the current dark mode state from storage
  chrome.storage.local.get('darkModeEnabled', (data) => {
    const darkModeEnabled = data.darkModeEnabled || false;

    // Update button text based on dark mode state
    const toggleButton = document.getElementById('toggleButton');
    toggleButton.textContent = darkModeEnabled ? 'Disable Dark Mode' : 'Enable Dark Mode';

    // Add click listener to toggle dark mode
    toggleButton.addEventListener('click', () => {
      const newDarkModeState = !darkModeEnabled;
      chrome.storage.local.set({ darkModeEnabled: newDarkModeState }, () => {
        // Update button text
        toggleButton.textContent = newDarkModeState ? 'Disable Dark Mode' : 'Enable Dark Mode';

        // Send message to all tabs to apply new dark mode state
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach((tab) => {
            chrome.tabs.sendMessage(tab.id, { darkModeEnabled: newDarkModeState }, () => {
              // Ignore errors for tabs where content script isn't available
              if (chrome.runtime.lastError) {
                // Tab might not have content script, which is fine
              }
            });
          });
        });
        
        // Show status message
        showStatusMessage(`Dark mode ${newDarkModeState ? 'enabled' : 'disabled'} for all sites`);
      });
    });
  });

  // Add current site to blacklist
  document.getElementById('blacklistCurrent').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (!tabs[0]) return;
      
      try {
        const currentUrl = new URL(tabs[0].url);
        const hostname = currentUrl.hostname;
        
        // Don't allow blacklisting extension pages
        if (currentUrl.protocol === 'chrome-extension:' || currentUrl.protocol === 'moz-extension:') {
          showStatusMessage('Cannot blacklist extension pages');
          return;
        }
        
        chrome.storage.local.get('blacklistedSites', (data) => {
          const blacklistedSites = data.blacklistedSites || [];
          if (!blacklistedSites.includes(hostname)) {
            blacklistedSites.push(hostname);
            chrome.storage.local.set({ blacklistedSites }, () => {
              showStatusMessage(`Added ${hostname} to blacklist. Reload the page to see changes.`);
              // Disable dark mode on current tab immediately
              chrome.tabs.sendMessage(tabs[0].id, { darkModeEnabled: false }, () => {
                if (chrome.runtime.lastError) {
                  // Content script might not be available, which is fine
                }
              });
            });
          } else {
            showStatusMessage(`${hostname} is already blacklisted.`);
          }
        });
      } catch (error) {
        showStatusMessage('Cannot blacklist this page (invalid URL).');
      }
    });
  });

  // Add click listener to reset all states
  document.getElementById('resetButton').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset dark mode for all sites and clear all blacklists?')) {
      chrome.storage.local.set({ darkModeEnabled: false, blacklistedSites: [] }, () => {
        const toggleButton = document.getElementById('toggleButton');
        toggleButton.textContent = 'Enable Dark Mode';
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach((tab) => {
            chrome.tabs.sendMessage(tab.id, { darkModeEnabled: false }, () => {
              if (chrome.runtime.lastError) {
                // Tab might not have content script, which is fine
              }
            });
          });
        });
        showStatusMessage('All settings have been reset. Dark mode disabled on all sites.');
      });
    }
  });

  // Function to show status messages
  function showStatusMessage(message) {
    // Remove any existing status message
    const existingStatus = document.getElementById('statusMessage');
    if (existingStatus) {
      existingStatus.remove();
    }
    
    // Create new status message
    const statusElement = document.createElement('div');
    statusElement.id = 'statusMessage';
    statusElement.style.cssText = `
      margin-top: 10px;
      padding: 10px;
      background-color: #e7f3ff;
      border: 1px solid #b3d9ff;
      border-radius: 4px;
      font-size: 13px;
      color: #0066cc;
    `;
    statusElement.textContent = message;
    
    // Insert before the script tag
    document.body.insertBefore(statusElement, document.querySelector('script'));
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (statusElement.parentNode) {
        statusElement.remove();
      }
    }, 5000);
  }
});