const encoder = new TextEncoder();

async function encrypt(text, key) {
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

    const bytes = new Uint8Array(encrypted);

    const hex = [...bytes]
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

    return {
        hex,
        iv
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

    const cipherText = await encrypt(text, key);
    const rsaKey = await importPublicKey(publicKeyPem);
    const rawKey = await crypto.subtle.exportKey(
        "raw",
        key
    );

    console.log(
        "5: AES key exported",
        rawKey.byteLength
    );

    const encKey = await crypto.subtle.encrypt(
        {
            name: "RSA-OAEP"
        },
        rsaKey,
        rawKey
    );

    return {
        cipherKey: encKey,
        hex: cipherText.hex,
        iv: cipherText.iv
    };
}

async function importPublicKey(pem) {
    
    if (!pem.includes("-----BEGIN PUBLIC KEY-----")) {
        throw new Error(
            "Wrong public key format. Expected -----BEGIN PUBLIC KEY-----"
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
}

function toBase64(data){
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
    let binary = "";
    for (const byte of bytes){
        binary += String.fromCharCode(byte);
    }
    return btoa(binary);
}

export function composeMessage(encrypted) {
    const message = {
        version: 1,
        algorithm: "AES-256-GCM",
        keyAlgorithm: "RSA-OAEP-SHA256",

        encryptedKey: toBase64(encrypted.cipherKey),
        iv: toBase64(encrypted.iv),
        ciphertext: encrypted.hex
    };

    return `-----BEGIN CIPHER MAIL-----

${JSON.stringify(message)}

-----END CIPHER MAIL-----`;
}