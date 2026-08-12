import { isComposeOpen, isMessageOpen } from "./emailParser.js";

async function setInitialCard() {
    const decryptCard = document.getElementById("decryptCard");
    const encryptCard = document.getElementById("encryptCard");

    const messageOpen = await isMessageOpen();
    const composeOpen = await isComposeOpen();

    // Decryption gets priority
    if (messageOpen) {
        decryptCard.open = true;
        encryptCard.open = false;
    } else if (composeOpen) {
        decryptCard.open = false;
        encryptCard.open = true;
    } else {
        decryptCard.open = false;
        encryptCard.open = false;
    }
}

setInitialCard();