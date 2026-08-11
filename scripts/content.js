import { encryptMessage , composeMessage, parseMessage, decryptMessage} from "./cryptography.js";
import {getReceivedEmailText, setEmailText, getInputEmailText} from "./emailParser.js"

const button = document.getElementById("enc");
const publicKeyInput = document.getElementById("publicKey");
const privateKeyInput = document.getElementById("privateKey");

const decryptButton = document.getElementById("dec");
const decryptedText = document.getElementById("decryptedText");


decryptButton.addEventListener("click", async () => {
    try { 
        const text = await getReceivedEmailText();
        const privateKey = privateKeyInput.value;
        const message = parseMessage(text);
        const plaintext = await decryptMessage(
            message,
            privateKey
        );

        console.log("Decrypted:", plaintext);
        decryptedText.value = plaintext;
    } catch (error) {
        console.log("Error:", error);
    }
});

button.addEventListener("click", async () => {
    try {
        const publicKey = publicKeyInput.value;
        const text = await getInputEmailText();
        const enc = await encryptMessage(
            text,
            publicKey
        );
        const message = composeMessage(enc);

        await setEmailText(message);

    } catch (error) {
        console.error("ERROR:", error);
    }
});


