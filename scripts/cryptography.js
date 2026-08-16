import { ClavimitError } from "./exeptions.js";

const encoder = new TextEncoder();

export async function encrypt(text, key) {
    const data = encoder.encode(text);
    const iv = crypto.getRandomValues(
        new Uint8Array(12)
    );
    const encrypted = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        data
    );

    return {
        ciphertext: toBase64(encrypted),
        iv: toBase64(iv)
    };
}

export async function encryptMessage(text, publicKeyPem) {
    const key = await crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256
        },
        true,
        ["encrypt", "decrypt"]
    );

    const encryptedText = await encrypt(text, key);
    const rsaKey = await importPublicKey(publicKeyPem);

    const rawKey = await crypto.subtle.exportKey(
        "raw",
        key
    );

    const encKey = await crypto.subtle.encrypt(
        {
            name: "RSA-OAEP"
        },
        rsaKey,
        rawKey
    );

    return {
        encryptedKey: toBase64(encKey),
        ciphertext: encryptedText.ciphertext,
        iv: encryptedText.iv
    };
}

export async function importPublicKey(pem) {
    try {
        if (!pem.includes("-----BEGIN PUBLIC KEY-----") ||
            !pem.includes("-----END PUBLIC KEY-----")) {
            throw new ClavimitError(
                "INVALID_PUBLIC_KEY",
                "The public key could not be read. Expected -----BEGIN PUBLIC KEY-----"
            );
        }

        const cleanPem = pem
            .replace("-----BEGIN PUBLIC KEY-----", "")
            .replace("-----END PUBLIC KEY-----", "")
            .replace(/\s+/g, "");

        const invalid = cleanPem.match(/[^A-Za-z0-9+/=]/g);

        if (invalid) {
            console.log("Invalid characters:", invalid);

            throw new Error(
                "Public key contains invalid Base64 characters"
            );
        }

        if (cleanPem.length % 4 !== 0) {
            throw new Error(
                `Invalid Base64 length: ${cleanPem.length}`
            );
        }

        const binary = atob(cleanPem);

        const bytes = Uint8Array.from(
            binary,
            char => char.charCodeAt(0)
        );

        return await crypto.subtle.importKey(
            "spki",
            bytes.buffer,
            {
                name: "RSA-OAEP",
                hash: "SHA-256"
            },
            false,
            ["encrypt"]
        );
    } catch (error) {
        console.error("Public key import failed:", error);

        throw new ClavimitError(
            "INVALID_PUBLIC_KEY",
            "The public key could not be read."
        );
    }
}


export async function importPrivateKey(pem) {
    try {
        if (!pem.includes("-----BEGIN PRIVATE KEY-----") ||
            !pem.includes("-----END PRIVATE KEY-----")) {
            throw new ClavimitError(
                "INVALID_PRIVATE_KEY",
                "The private key could not be read. Expected -----BEGIN PRIVATE KEY-----"
            );
        }
        const cleanPem = pem
            .replace("-----BEGIN PRIVATE KEY-----", "")
            .replace("-----END PRIVATE KEY-----", "")
            .replace(/\s+/g, "");

        const binary = atob(cleanPem);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        return await crypto.subtle.importKey(
            "pkcs8",
            bytes.buffer,
            {
                name: "RSA-OAEP",
                hash: "SHA-256"
            },
            false,
            ["decrypt"]
        );
    } catch (error) {
        throw new ClavimitError("INVALID_PRIVATE_KEY", "The private key could not be read.")
    }
}


function fromBase64(base64) {
    const binary = atob(base64);

    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
}

function toBase64(data) {
    const bytes = data instanceof Uint8Array
        ? data
        : new Uint8Array(data);

    let binary = "";

    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary);
}

export async function decryptMessage(message, privateKeyPem) {
    const privateKey = await importPrivateKey(privateKeyPem);
    const encryptedKey = fromBase64(message.encryptedKey);

    let rawAesKey;

    try {
        rawAesKey = await crypto.subtle.decrypt(
            {
                name: "RSA-OAEP"
            },
            privateKey,
            encryptedKey
        );
    } catch (error) {
        throw new ClavimitError(
            "DECRYPTION_FAILED",
            "The encryption key could not be decrypted with this private key."
        );
    }

    const aesKey = await crypto.subtle.importKey(
        "raw",
        rawAesKey,
        {
            name: "AES-GCM"
        },
        false,
        ["decrypt"]
    );

    const iv = fromBase64(message.iv);
    const ciphertext = fromBase64(message.ciphertext);

    let decrypted;

    try {
        decrypted = await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            aesKey,
            ciphertext
        );
    } catch (error) {
        throw new ClavimitError(
            "DECRYPTION_FAILED",
            "The message could not be decrypted."
        );
    }

    return new TextDecoder().decode(decrypted);
}