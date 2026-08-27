// Extension popup entry point.
// Handles the small popup shown when clicking the Clavimit toolbar
// icon; its only responsibility is opening Chrome's side panel for
// the active tab, where the main encrypt/decrypt UI lives.

const button = document.getElementById("openSidePanel");

button.addEventListener("click", async () => {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    console.log("Opening side panel for tab:", tab.id);

    await chrome.sidePanel.open({
      tabId: tab.id,
    });

    window.close();
  } catch (error) {
    console.error("Could not open side panel:", error);
  }
});
