// Extension popup entry point.
// Handles the small popup shown when clicking the Clavimit toolbar
// icon; its only responsibility is opening Chrome's side panel for
// the active tab, where the main encrypt/decrypt UI lives.

import { openSidePanel } from "./browser.js";

const button = document.getElementById("openSidePanel");

button.addEventListener("click", openSidePanel);
