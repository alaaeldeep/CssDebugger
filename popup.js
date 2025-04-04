// Function to save settings automatically
function saveSettings() {
    const newSettings = {
        outlineColor: document.getElementById("outlineColor").value,
        outlineThickness: document.getElementById("outlineThickness").value,
        outlineStyle: document.getElementById("outlineStyle").value,
        selector: document.getElementById("selector").value,
        enableGrid: document.getElementById("enableGrid").checked,
        gridSize: document.getElementById("gridSize").value,
        enableTooltips: document.getElementById("enableTooltips").checked,
        enableInspector: document.getElementById("enableInspector").checked,
    };
    chrome.storage.sync.set(newSettings, () => {
        console.log("Settings saved:", newSettings);
    });
}

// Load settings on popup open
document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get(
        {
            outlineColor: "#ff0000",
            outlineThickness: "1",
            outlineStyle: "solid",
            selector: "*",
            enableGrid: false,
            gridSize: "20",
            enableTooltips: false,
            enableInspector: false,
        },
        (settings) => {
            document.getElementById("outlineColor").value =
                settings.outlineColor;
            document.getElementById("outlineThickness").value =
                settings.outlineThickness;
            document.getElementById("outlineStyle").value =
                settings.outlineStyle;
            document.getElementById("selector").value = settings.selector;
            document.getElementById("enableGrid").checked = settings.enableGrid;
            document.getElementById("gridSize").value = settings.gridSize;
            document.getElementById("enableTooltips").checked =
                settings.enableTooltips;
            document.getElementById("enableInspector").checked =
                settings.enableInspector;
        }
    );
});

// Listen for changes on all form elements to auto-save
document
    .querySelectorAll("#settingsForm input, #settingsForm select")
    .forEach((el) => {
        el.addEventListener("input", saveSettings);
    });

// Toggle debugger on active tab when clicking the button
document.getElementById("toggleDebugger").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"],
        });
    });
});
