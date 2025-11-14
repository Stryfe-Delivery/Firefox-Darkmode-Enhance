// Inject styles only when needed and use CSS variables
const STYLE_ID = 'dark-mode-styles';
let darkModeEnabled = false;
let processingTimeout = null;
let processedElements = new WeakSet();
let cleanupCounter = 0;
const CLEANUP_THRESHOLD = 1000;

// In content.js - use stored blacklist
let SITE_BLACKLIST = [];

// Check if current site is blacklisted
function isSiteBlacklisted() {
  const hostname = window.location.hostname;
  return SITE_BLACKLIST.some(blacklisted => 
    hostname === blacklisted || hostname.endsWith('.' + blacklisted)
  );
}

// Check if we should run on this site
function shouldApplyDarkMode() {
  return !isSiteBlacklisted();
}

// Load blacklist from storage
chrome.storage.local.get(['blacklistedSites', 'darkModeEnabled'], (data) => {
  SITE_BLACKLIST = data.blacklistedSites || [
    'deepseek.com',
    'github.com'
    // Default blacklisted sites
  ];
  
  darkModeEnabled = data.darkModeEnabled || false;
  
  // Then proceed with dark mode initialization
  initializeDarkMode();
});

function initializeDarkMode() {
  if (!shouldApplyDarkMode()) {
    // Do nothing on blacklisted sites
    console.log('Dark Mode: Site is blacklisted, skipping execution');
    return;
  }

  // Optimized mutation observer with debouncing
  const observer = new MutationObserver((mutations) => {
    if (!darkModeEnabled) return;
    
    clearTimeout(processingTimeout);
    processingTimeout = setTimeout(() => {
      const allAddedNodes = [];
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length) {
          allAddedNodes.push(...mutation.addedNodes);
        }
      });
      
      if (allAddedNodes.length) {
        processNewElements(allAddedNodes);
      }
    }, 100);
  });

  // Start observing
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false
    });
  }

  // Message handler
  chrome.runtime.onMessage.addListener(msg => {
    if (msg.darkModeEnabled !== undefined) {
      darkModeEnabled = msg.darkModeEnabled;
      
      if (darkModeEnabled) {
        safeInjectStyles();
        document.body.classList.add('dark-mode');
        safeProcessExistingElements();
      } else {
        document.body.classList.remove('dark-mode');
        safeRemoveStyles();
        processedElements = new WeakSet(); // Reset cache
        cleanupCounter = 0;
      }
    }
  });

  // Request initial state
  if (document.body) {
    chrome.runtime.sendMessage(
      {type: 'getDarkModeState'},
      state => {
        if (state !== undefined) {
          darkModeEnabled = state;
          if (state) {
            safeInjectStyles();
            document.body.classList.add('dark-mode');
            safeProcessExistingElements();
          }
        }
      }
    );
  } else {
    // Wait for body to be available
    document.addEventListener('DOMContentLoaded', () => {
      chrome.runtime.sendMessage(
        {type: 'getDarkModeState'},
        state => {
          if (state !== undefined) {
            darkModeEnabled = state;
            if (state) {
              safeInjectStyles();
              document.body.classList.add('dark-mode');
              safeProcessExistingElements();
            }
          }
        }
      );
    });
  }
}

// CSS with variables and enhanced styling
function getDarkModeCSS() {
  return `
    :root.dark-mode {
      --dark-bg-primary: #121212;
      --dark-bg-secondary: #1e1e1e;
      --dark-bg-tertiary: #2d2d2d;
      --dark-text-primary: #e0e0e0;
      --dark-text-secondary: #a0a0a0;
      --dark-accent: #bb86fc;
      --dark-border: #444;
      --dark-shadow: rgba(0, 0, 0, 0.5);
      --dark-header-footer: #1F1F1F;
    }
    
    /* Comprehensive body and main content styling */
    body.dark-mode {
      background-color: #121212 !important;
      color: white !important;
    }
    
    /* Target main content areas that might have separate backgrounds */
    body.dark-mode main,
    body.dark-mode .main,
    body.dark-mode .content,
    body.dark-mode [class*="main"],
    body.dark-mode [class*="content"],
    body.dark-mode [role="main"],
    body.dark-mode #main,
    body.dark-mode #content,
    body.dark-mode .app,
    body.dark-mode .application,
    body.dark-mode .page,
    body.dark-mode .container,
    body.dark-mode .wrapper {
      background-color: #121212 !important;
      color: white !important;
    }
    
    /* Handle divs that might be acting as main background containers */
    body.dark-mode div:not(header):not(footer):not([class*="header"]):not([class*="footer"]) {
      background-color: inherit !important;
      color: inherit !important;
    }

    /* Additional common background containers */
    body.dark-mode [style*="background-color"]:not(header):not(footer):not([class*="header"]):not([class*="footer"]) {
      background-color: var(--dark-bg-secondary) !important;
    }

    body.dark-mode [class*="bg-"]:not(header):not(footer) {
      background-color: var(--dark-bg-secondary) !important;
    }

    /* Common light background classes */
    body.dark-mode .bg-white,
    body.dark-mode .bg-light,
    body.dark-mode .bg-gray,
    body.dark-mode .bg-silver {
      background-color: var(--dark-bg-secondary) !important;
    }

    /* Handle section elements */
    body.dark-mode section,
    body.dark-mode .section,
    body.dark-mode [class*="section"] {
      background-color: var(--dark-bg-primary) !important;
      color: var(--dark-text-primary) !important;
    }

    /* Global header/footer targeting */
    body.dark-mode header,
    body.dark-mode footer,
    body.dark-mode [class*="header"],
    body.dark-mode [class*="footer"],
    body.dark-mode [class*="head"],
    body.dark-mode [class*="foot"] {
      background-color: var(--dark-header-footer) !important;
      color: var(--dark-text-primary) !important;
      border-color: var(--dark-border) !important;
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
      color: var(--dark-text-primary) !important;
    }
    
    body.dark-mode a {
      color: var(--dark-accent) !important;
    }
    
    /* Enhanced Form elements */
    body.dark-mode input:not([type="button"]):not([type="submit"]):not([type="reset"]),
    body.dark-mode select,
    body.dark-mode textarea {
      background-color: var(--dark-bg-tertiary) !important;
      color: var(--dark-text-primary) !important;
      border: 1px solid var(--dark-border) !important;
    }
    
    body.dark-mode input[type="button"],
    body.dark-mode input[type="submit"],
    body.dark-mode input[type="reset"],
    body.dark-mode button {
      background-color: var(--dark-bg-secondary) !important;
      color: var(--dark-text-primary) !important;
      border: 1px solid var(--dark-border) !important;
    }
    
    /* Table styling */
    body.dark-mode table {
      background-color: var(--dark-bg-secondary) !important;
      border-color: var(--dark-border) !important;
    }

    body.dark-mode th,
    body.dark-mode td {
      background-color: var(--dark-bg-secondary) !important;
      color: var(--dark-text-primary) !important;
      border-color: var(--dark-border) !important;
    }

    body.dark-mode tr:nth-child(even) {
      background-color: var(--dark-bg-tertiary) !important;
    }
    
    /* Modal/dialog support */
    body.dark-mode .modal,
    body.dark-mode .dialog,
    body.dark-mode [role="dialog"],
    body.dark-mode .popup,
    body.dark-mode .overlay {
      background-color: var(--dark-bg-secondary) !important;
      color: var(--dark-text-primary) !important;
      border-color: var(--dark-border) !important;
      box-shadow: 0 4px 12px var(--dark-shadow) !important;
    }
    
    /* Card and panel elements */
    body.dark-mode .card,
    body.dark-mode [class*="card"],
    body.dark-mode .panel,
    body.dark-mode [class*="panel"] {
      background-color: var(--dark-bg-secondary) !important;
      color: var(--dark-text-primary) !important;
      border: 1px solid var(--dark-border) !important;
    }
    
    /* Image and media adjustments */
    body.dark-mode img,
    body.dark-mode video {
      filter: brightness(0.8) contrast(1.1) !important;
    }
    
    /* Don't affect already dark images */
    body.dark-mode img[src*="dark"],
    body.dark-mode img[src*="black"],
    body.dark-mode .dark-image,
    body.dark-mode .logo {
      filter: none !important;
    }
    
    /* Scrollbar styling */
    body.dark-mode ::-webkit-scrollbar {
      width: 12px;
    }

    body.dark-mode ::-webkit-scrollbar-track {
      background: var(--dark-bg-secondary) !important;
    }

    body.dark-mode ::-webkit-scrollbar-thumb {
      background: var(--dark-bg-tertiary) !important;
      border-radius: 6px;
    }

    body.dark-mode ::-webkit-scrollbar-thumb:hover {
      background: #555 !important;
    }
    
    /* Text selection */
    body.dark-mode ::selection {
      background: var(--dark-accent) !important;
      color: white !important;
    }

    body.dark-mode ::-moz-selection {
      background: var(--dark-accent) !important;
      color: white !important;
    }

    /* Respect reduced motion preferences */
    @media (prefers-reduced-motion: reduce) {
      body.dark-mode,
      body.dark-mode * {
        transition: none !important;
      }
    }
  `;
}

// Safe style injection with error handling
function safeInjectStyles() {
  try {
    if (!document.getElementById(STYLE_ID) && darkModeEnabled) {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = getDarkModeCSS();
      document.head.append(style);
    }
  } catch (error) {
    console.warn('Dark Mode: Failed to inject styles', error);
    // Fallback: try basic style injection
    try {
      const fallbackStyle = document.createElement('style');
      fallbackStyle.textContent = 'body.dark-mode { background: #121212 !important; color: white !important; }';
      document.head.append(fallbackStyle);
    } catch (fallbackError) {
      console.error('Dark Mode: Fallback style injection failed', fallbackError);
    }
  }
}

function safeRemoveStyles() {
  try {
    const existingStyle = document.getElementById(STYLE_ID);
    if (existingStyle) {
      existingStyle.remove();
    }
  } catch (error) {
    console.warn('Dark Mode: Failed to remove styles', error);
  }
}

// Efficient element detection
function isHeaderFooterElement(element) {
  const tag = element.tagName.toLowerCase();
  const className = element.className || '';
  
  return tag === 'header' || tag === 'footer' ||
         /(header|footer|head|foot)/i.test(className);
}

// Process new elements with caching and memory management
function processNewElements(nodes) {
  try {
    nodes.forEach(node => {
      if (node.nodeType !== 1) return;
      
      // Periodic cleanup to prevent memory issues
      cleanupCounter++;
      if (cleanupCounter > CLEANUP_THRESHOLD) {
        processedElements = new WeakSet();
        cleanupCounter = 0;
      }
      
      if (!processedElements.has(node) && isHeaderFooterElement(node)) {
        node.style.backgroundColor = '#1F1F1F';
        node.style.color = '#e0e0e0';
        processedElements.add(node);
      }
      
      // Process children only if needed
      if (node.children.length) {
        processNewElements([...node.children]);
      }
    });
  } catch (error) {
    console.warn('Dark Mode: Error processing new elements', error);
  }
}

// Process existing elements on enable
function safeProcessExistingElements() {
  try {
    const elements = [
      ...document.querySelectorAll('header, footer'),
      ...document.querySelectorAll('[class*="header"], [class*="footer"], [class*="head"], [class*="foot"]')
    ];
    
    elements.forEach(element => {
      if (!processedElements.has(element)) {
        element.style.backgroundColor = '#1F1F1F';
        element.style.color = '#e0e0e0';
        processedElements.add(element);
      }
    });
  } catch (error) {
    console.warn('Dark Mode: Error processing existing elements', error);
  }
}