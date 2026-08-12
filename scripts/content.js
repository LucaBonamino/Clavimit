import { encryptMessage, decryptMessage } from "./cryptography.js";
import { getReceivedEmailText, setEmailText, getInputEmailText } from "./emailParser.js"
import { parseMessage, composeMessage } from "./messageFormat.js";


const button = document.getElementById("enc");
const publicKeyInput = document.getElementById("publicKey");
const privateKeyInput = document.getElementById("privateKey");

const decryptButton = document.getElementById("dec");
const decryptedText = document.getElementById("decryptedText");

const privateKeyFile = document.getElementById("privateKeyFile");
const publicKeyFile = document.getElementById("publicKeyFile");

privateKeyFile.addEventListener("change", async () => {
    const file = privateKeyFile.files[0];

    if (!file) {
        return;
    }

    const text = await file.text();

    document.getElementById("privateKey").value = text;
});

publicKeyFile.addEventListener("change", async () => {
    const file = publicKeyFile.files[0];

    if (!file) {
        return;
    }

    const text = await file.text();

    document.getElementById("publicKey").value = text;
});


decryptButton.addEventListener("click", async () => {
    try {
        const privateKey = privateKeyInput.value.trim();

        if (!privateKey) {
            throw new Error("Please enter your private key.");
        }
        const text = await getReceivedEmailText();
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