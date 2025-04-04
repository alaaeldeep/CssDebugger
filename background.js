chrome.commands.onCommand.addListener((command) => {
    if (command === "toggle-debugger") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["content.js"],
            });
        });
    }
});
