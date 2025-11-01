// Get references to input elements
const enabledCheckbox = document.getElementById('enabled');
const scrollFactorInput = document.getElementById('scrollFactor');

// Default settings
const defaults = {
    enabled: true,
    scrollFactor: 1
};

// Load saved settings
chrome.storage.sync.get(defaults, function (items) {
    enabledCheckbox.checked = items.enabled;
    scrollFactorInput.value = items.scrollFactor;
});

// Update settings and notify content script
function updateSettings() {
    const scrollFactor = parseFloat(scrollFactorInput.value);

    // Validate input
    if (scrollFactor < 0 || scrollFactor > 1000) {
        return;
    }

    const settings = {
        enabled: enabledCheckbox.checked,
        scrollFactor: scrollFactor
    };

    // Save to storage
    chrome.storage.sync.set(settings);

    // Send to active tab (ignore errors for pages without content script)
    chrome.tabs.query({ active: true, windowId: chrome.windows.WINDOW_ID_CURRENT }, function(tabs) {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
                ...settings,
                CSS: 'ChangeScrollSpeed'
            }).catch(() => {
                // Silently ignore - content script not available on this page
            });
        }
    });
}

// Add event listeners
enabledCheckbox.addEventListener('change', updateSettings);
scrollFactorInput.addEventListener('change', updateSettings);
scrollFactorInput.addEventListener('keyup', updateSettings);


