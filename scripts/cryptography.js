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


export function composeMessage(encrypted) {
    const message = {
        version: 1,
        algorithm: "AES-256-GCM",
        keyAlgorithm: "RSA-OAEP-SHA256",

        encryptedKey: encrypted.encryptedKey,
        iv: encrypted.iv,
        ciphertext: encrypted.ciphertext
    };

    return `-----BEGIN CIPHER MAIL-----

${JSON.stringify(message)}

-----END CIPHER MAIL-----`;
}

export function parseMessage(text) {
    const begin = "-----BEGIN CIPHER MAIL-----";
    const end = "-----END CIPHER MAIL-----";

    const start = text.indexOf(begin);
    const finish = text.indexOf(end);

    if (start === -1 || finish === -1) {
        throw new Error("Not a Cipher Mail message");
    }

    const json = text
        .slice(start + begin.length, finish)
        .trim();

    return JSON.parse(json);
}

export async function importPrivateKey(pem) {
    const cleanPem = pem
        .replace("-----BEGIN PRIVATE KEY-----", "")
        .replace("-----END PRIVATE KEY-----", "")
        .replace(/\s+/g, "");

    const binary = atob(cleanPem);

    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    console.log("Private key bytes:", bytes.length);

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
}

function fromHex(hex) {
    const bytes = new Uint8Array(hex.length / 2);

    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(
            hex.substring(i * 2, i * 2 + 2),
            16
        );
    }

    return bytes;
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
    const rawAesKey = await crypto.subtle.decrypt(
            {
                name: "RSA-OAEP"
            },
            privateKey,
            encryptedKey
        );

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

    
    const decrypted = await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            aesKey,
            ciphertext
        );

    
    return new TextDecoder().decode(decrypted);
}