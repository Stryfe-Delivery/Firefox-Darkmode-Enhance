// Inject styles only once
const STYLE_ID = 'dark-mode-styles';
if (!document.getElementById(STYLE_ID)) {
  const css = `
    body.dark-mode {
      background-color: #121212;
      color: white;
      --dark-header-footer: #1F1F1F;
      --dark-text: #e0e0e0;
    }
    
    /* Global header/footer targeting */
    body.dark-mode header,
    body.dark-mode footer,
    body.dark-mode [class*="header"],
    body.dark-mode [class*="footer"],
    body.dark-mode [class*="head"],
    body.dark-mode [class*="foot"] {
      background-color: var(--dark-header-footer) !important;
      color: var(--dark-text) !important;
      border-color: #333 !important;
    }
    
    /* Specific REI.com example override */
    body.dark-mode .ccsite-footer__wrapper--light-gray {
      background-color: var(--dark-header-footer) !important;
    }

    /* Additional common patterns */
    body.dark-mode .top-bar,
    body.dark-mode .bottom-bar,
    body.dark-mode .site-header,
    body.dark-mode .site-footer,
    body.dark-mode .main-header,
    body.dark-mode .main-footer,
    body.dark-mode .page-header,
    body.dark-mode .page-footer {
      background-color: var(--dark-header-footer) !important;
    }
    
    /* Nested element support */
    body.dark-mode header *:not(a),
    body.dark-mode footer *:not(a),
    body.dark-mode [class*="header"] *:not(a),
    body.dark-mode [class*="footer"] *:not(a) {
      color: var(--dark-text) !important;
    }
    
    body.dark-mode a {
      color: #BB86FC;
    }
    
    /* Form elements */
    body.dark-mode input,
    body.dark-mode select,
    body.dark-mode textarea {
      background-color: #2d2d2d;
      color: white;
      border: 1px solid #444;
    }`;
  
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = css;
  document.head.append(style);
}

let darkModeEnabled = false; // Track state locally

// Process headers/footers in new elements
function processNewElements(nodes) {
  nodes.forEach(node => {
    if (node.nodeType === 1) { // Only element nodes
      if (node.matches('header, footer, [class*="header"], [class*="footer"], [class*="head"], [class*="foot"]')) {
        node.style.backgroundColor = '#1F1F1F';
        node.style.color = '#e0e0e0';
      }
      if (node.children.length) {
        processNewElements([...node.children]);
      }
    }
  });
}

// Improved mutation observer
const observer = new MutationObserver((mutations) => {
  if (!darkModeEnabled) return;
  
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      processNewElements([...mutation.addedNodes]);
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Message handler
chrome.runtime.onMessage.addListener(msg => {
  if (msg.darkModeEnabled !== undefined) {
    darkModeEnabled = msg.darkModeEnabled;
    document.body.classList.toggle('dark-mode', darkModeEnabled);
    
    // Process existing headers/footers when enabling
    if (darkModeEnabled) {
      const elements = [
        ...document.querySelectorAll('header, footer'),
        ...document.querySelectorAll('[class*="header"], [class*="footer"], [class*="head"], [class*="foot"]')
      ];
      processNewElements(elements);
    }
  }
});

// Request initial state
chrome.runtime.sendMessage(
  {type: 'getDarkModeState'},
  state => {
    if (state !== undefined) {
      darkModeEnabled = state;
      document.body.classList.toggle('dark-mode', state);
      if (state) {
        const elements = [
          ...document.querySelectorAll('header, footer'),
          ...document.querySelectorAll('[class*="header"], [class*="footer"], [class*="head"], [class*="foot"]')
        ];
        processNewElements(elements);
      }
    }
  }
);