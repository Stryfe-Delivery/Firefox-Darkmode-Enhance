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
            chrome.tabs.sendMessage(tab.id, { darkModeEnabled: newDarkModeState });
          });
        });
      });
    });

    // Add click listener to reset all states
    document.getElementById('resetButton').addEventListener('click', () => {
      chrome.storage.local.set({ darkModeEnabled: false }, () => {
        toggleButton.textContent = 'Enable Dark Mode';
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach((tab) => {
            chrome.tabs.sendMessage(tab.id, { darkModeEnabled: false });
          });
        });
      });
    });
  });
});
