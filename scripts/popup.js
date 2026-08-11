const button = document.getElementById("openSidePanel");

button.addEventListener("click", async () => {
    try {
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        console.log("Opening side panel for tab:", tab.id);

        await chrome.sidePanel.open({
            tabId: tab.id
        });

        window.close();

    } catch (error) {
        console.error("Could not open side panel:", error);
    }
});