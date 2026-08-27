// Side panel initialization logic.
// On load, detects whether the active Gmail tab has an open message
// or compose window (via emailParser.js) and expands the matching
// encrypt/decrypt card accordingly, updating the status text shown
// to the user.

import { isComposeOpen, isMessageOpen } from "./emailParser.js";

// async function setInitialCard() {
//     const decryptCard = document.getElementById("decryptCard");
//     const encryptCard = document.getElementById("encryptCard");

//     const messageOpen = await isMessageOpen();
//     const composeOpen = await isComposeOpen();

//     // Decryption gets priority
//     if (messageOpen) {
//         decryptCard.open = true;
//         encryptCard.open = false;
//     } else if (composeOpen) {
//         decryptCard.open = false;
//         encryptCard.open = true;
//     } else {
//         decryptCard.open = false;
//         encryptCard.open = false;
//     }
// }

setInitialCard();

async function setInitialCard() {
  const decryptCard = document.getElementById("decryptCard");
  const encryptCard = document.getElementById("encryptCard");
  const gmailStatus = document.getElementById("gmailStatus");

  const messageOpen = await isMessageOpen();
  const composeOpen = await isComposeOpen();

  if (messageOpen) {
    decryptCard.open = true;
    encryptCard.open = false;

    gmailStatus.textContent = "✓ Gmail message detected";
    gmailStatus.classList.add("context-status--active");
  } else if (composeOpen) {
    decryptCard.open = false;
    encryptCard.open = true;

    gmailStatus.textContent = "✓ Gmail compose detected";
    gmailStatus.classList.add("context-status--active");
  } else {
    decryptCard.open = false;
    encryptCard.open = false;

    gmailStatus.textContent =
      "Open a Gmail message or compose window to get started.";
    gmailStatus.classList.remove("context-status--active");
  }
}
