import { encryptMessage, decryptMessage } from "./cryptography.js";
import { getReceivedEmailText, setEmailText, getInputEmailText } from "./emailParser.js"
import { parseMessage, composeMessage } from "./messageFormat.js";
import { ClavimitError } from "./exeptions.js";


const decryptError = document.getElementById("decryptError");

function showDecryptError(message) {
    decryptError.textContent = message;
    decryptError.hidden = false;
}

function clearDecryptError() {
    decryptError.textContent = "";
    decryptError.hidden = true;
}

const encryptError = document.getElementById("encryptError");

function showEncryptError(message) {
    encryptError.textContent = message;
    encryptError.hidden = false;
}

function clearEncryptError() {
    encryptError.textContent = "";
    encryptError.hidden = true;
}

const button = document.getElementById("enc");
const publicKeyInput = document.getElementById("publicKey");
const privateKeyInput = document.getElementById("privateKey");
const senderPublicKeyInput = document.getElementById("senderPublicKey");

const decryptButton = document.getElementById("dec");
const decryptedText = document.getElementById("decryptedText");

const privateKeyFile = document.getElementById("privateKeyFile");
const publicKeyFile = document.getElementById("publicKeyFile");
const senderPublicKeyFile = document.getElementById("senderPublicKeyFile");

const encryptWithSenderKeyCheckBox = document.getElementById("encryptWithSenderPublicKey");


encryptWithSenderKeyCheckBox.addEventListener("change", () => {
    const encryptWithSenderKeyDiv = document.getElementById("encryptWithSenderPublicKeyDiv");
    encryptWithSenderKeyDiv.hidden = !encryptWithSenderKeyCheckBox.checked;
})

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

senderPublicKeyFile.addEventListener("change", async () => {
    const file = senderPublicKeyFile.files[0];
    if (!file) {
        return;
    }
    const text = await file.text();
    document.getElementById("senderPublicKey").value = text;
});


decryptButton.addEventListener("click", async () => {
    clearDecryptError();
    try {
        const privateKey = privateKeyInput.value.trim();

        if (!privateKey) {
            throw new ClavimitError("EMPTY_PRIVATE_KEY", "Please enter your private key.");
        }
        const text = await getReceivedEmailText();
        const message = parseMessage(text);
        const plaintext = await decryptMessage(message, privateKey);
        decryptedText.value = plaintext;
        privateKeyInput.value = "";
    } catch (error) {
        console.error("Decryption error:", error);

        if (error instanceof ClavimitError) {
            showDecryptError(error.message);
        } else {
            showDecryptError(
                "Something went wrong while decrypting the message."
            );
        }
    }

});

button.addEventListener("click", async () => {
    clearEncryptError();
    try {
        const publicKey = publicKeyInput.value.trim();
        if (!publicKey) {
            throw new ClavimitError(
                "EMPTY_PUBLIC_KEY",
                "Please enter the recipient's public key."
            )
        }
        
        let senderPublicKey = null;
        if (encryptWithSenderKeyCheckBox.checked) {
             senderPublicKey = senderPublicKeyInput.value.trim();

            if (!senderPublicKey) {
                throw new ClavimitError(
                    "EMPTY_SENDER_PUBLIC_KEY",
                    "Please enter the sender's public key."
                );
            }
        }
        const text = await getInputEmailText();
        
        if (!text?.trim()) {
            throw new ClavimitError(
                "EMPTY_MESSAGE",
                "No message to encrypt provided."
            )
        }
        const enc = await encryptMessage(
            text,
            publicKey,
            senderPublicKey
        );
        const message = composeMessage(enc);

        await setEmailText(message);
        publicKeyInput.value = "";
        if (senderPublicKeyInput.value) {
            senderPublicKeyInput.value = "";
        }

    } catch (error) {
        console.error("Encryption error:", error);

        if (error instanceof ClavimitError) {
            showEncryptError(error.message);
        } else {
            showEncryptError(
                "Something unexpected went wrong."
            );
        }
    }
});