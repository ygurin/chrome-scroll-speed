// Listen for keyboard command to toggle scroll speed
chrome.commands.onCommand.addListener((command) => {
    if (command === 'toggle-scroll-speed') {
        // Get current enabled state
        chrome.storage.sync.get({enabled: true}, function(items) {
            const newEnabledState = !items.enabled;

            // Save the new state
            chrome.storage.sync.set({enabled: newEnabledState});

            // Optional: Show a notification or update icon to indicate state
            console.log(`Scroll speed ${newEnabledState ? 'enabled' : 'disabled'}`);
        });
    }
});
