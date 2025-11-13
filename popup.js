// Get references to input elements
const enabledCheckbox = document.getElementById('enabled');
const scrollFactorInput = document.getElementById('scrollFactor');
const shortcutDisplay = document.getElementById('shortcutDisplay');
const configureShortcutBtn = document.getElementById('configureShortcut');

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

// Listen for storage changes (e.g., from keyboard shortcut)
chrome.storage.onChanged.addListener(function(changes, areaName) {
    if (areaName === 'sync') {
        if (changes.enabled !== undefined) {
            enabledCheckbox.checked = changes.enabled.newValue;
        }
        if (changes.scrollFactor !== undefined) {
            scrollFactorInput.value = changes.scrollFactor.newValue;
        }
    }
});

// Load and display the current keyboard shortcut
chrome.commands.getAll(function(commands) {
    const toggleCommand = commands.find(cmd => cmd.name === 'toggle-scroll-speed');
    if (toggleCommand && toggleCommand.shortcut) {
        shortcutDisplay.textContent = `Current: ${toggleCommand.shortcut}`;
    } else {
        shortcutDisplay.textContent = 'No shortcut configured';
    }
});

// Open Chrome's shortcuts configuration page
configureShortcutBtn.addEventListener('click', function() {
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
});


