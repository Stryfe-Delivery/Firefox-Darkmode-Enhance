# Firefox-Darkmode-Enhance
tool to force darkmode on pages that dont respect mode flag in firefox/chrome

Installation

    Download the latest release

    Open Firefox and navigate to about:debugging

    Click "This Firefox" > "Load Temporary Add-on"

    Select any file from the extension folder

Usage

    Toggle dark mode: Press Ctrl+Shift+D

    Browser Action: Click the toolbar icon to:

        Enable/disable dark mode

        Reset to default light mode

Technical Highlights
Smart Header/Footer Detection
css

/* Targets various header/footer patterns */
body.dark-mode header,
body.dark-mode footer,
body.dark-mode [class*="header"],
body.dark-mode [class*="footer"] {
  background-color: #1F1F1F !important;
  color: #e0e0e0 !important;
}

/* example of an unhandled pattern correction */
/* REI.com specific fix */
body.dark-mode .ccsite-footer__wrapper--light-gray {
  background-color: #1F1F1F !important;
}

Dynamic Content Handling
javascript

const observer = new MutationObserver((mutations) => {
  if (!darkModeEnabled) return;
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      processNewElements([...mutation.addedNodes]);
    }
  });
});

Compatibility

Works with all modern websites including:

    E-commerce sites (Amazon, eBay)

    Content-heavy sites (Wikipedia, news sites)

    SPAs (React, Angular, Vue applications)

    Complex sites like REI.com with custom footers

Contribution

Contributions are welcome! Please report issues or submit PRs for:

    Additional site-specific fixes

    Improved CSS coverage

    Performance optimizations
