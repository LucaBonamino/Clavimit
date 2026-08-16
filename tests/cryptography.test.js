import { describe, it, expect } from "vitest";
import { encryptMessage, decryptMessage, importPublicKey, importPrivateKey } from "../scripts/cryptography";

async function generateKeyPair() {
    const { publicKey, privateKey } = await crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 4096,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256"
        },
        true,
        ["encrypt", "decrypt"]
    );

    const publicKeyBuffer = await crypto.subtle.exportKey(
        "spki",
        publicKey
    );

    const privateKeyBuffer = await crypto.subtle.exportKey(
        "pkcs8",
        privateKey
    );

    return {
        publicKey: toPem(publicKeyBuffer, "PUBLIC KEY"),
        privateKey: toPem(privateKeyBuffer, "PRIVATE KEY")
    };
}

function toPem(buffer, label) {
    const bytes = new Uint8Array(buffer);

    let binary = "";
    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    const base64 = btoa(binary);
    const lines = base64.match(/.{1,64}/g).join("\n");

    return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----`;
}


describe("encryption and decryption", () => {
    it("encrypts and decrypts a message", async () => {
        const { publicKey, privateKey } = await generateKeyPair();

        const message = "This is a dummy message";

        const encrypted = await encryptMessage(message, publicKey);
        const decrypted = await decryptMessage(encrypted, privateKey);

        expect(decrypted).toBe(message);
    });

    it("encrypts and decrypts an empty message", async () => {
        const { publicKey, privateKey } = await generateKeyPair();

        const message = "";

        const encrypted = await encryptMessage(message, publicKey);
        const decrypted = await decryptMessage(encrypted, privateKey);

        expect(decrypted).toBe(message);
    });

    it("throws INVALID_PUBLIC_KEY when the public key is empty", async () => {
        await expect(
            encryptMessage("dummy message", "")
        ).rejects.toMatchObject({
            code: "INVALID_PUBLIC_KEY"
        });
    });

    it("throws INVALID_PUBLIC_KEY when the public key is empty", async () => {
        await expect(
            encryptMessage("dummy message", "dummy key")
        ).rejects.toMatchObject({
            code: "INVALID_PUBLIC_KEY"
        });
    });

});

describe("importPublicKey", () => {

    it("throws INVALID_PUBLIC_KEY when PEM headers are missing", async () => {
        await expect(
            importPublicKey("not a public key")
        ).rejects.toMatchObject({
            code: "INVALID_PUBLIC_KEY"
        });
    });

    it("throws INVALID_PUBLIC_KEY when PEM content is invalid", async () => {
        const pem = `
-----BEGIN PUBLIC KEY-----
this-is-not-valid-base64!!!
-----END PUBLIC KEY-----
`;

        await expect(
            importPublicKey(pem)
        ).rejects.toMatchObject({
            code: "INVALID_PUBLIC_KEY"
        });
    });

    it("imports a valid RSA-OAEP public key", async () => {
        const { publicKey } = await generateKeyPair();

        const key = await importPublicKey(publicKey);

        expect(key).toBeInstanceOf(CryptoKey);
        expect(key.type).toBe("public");
        expect(key.algorithm.name).toBe("RSA-OAEP");
        expect(key.algorithm.hash.name).toBe("SHA-256");
        expect(key.usages).toContain("encrypt");
    });

});

describe("importPrivateKey", () => {

    it("imports a valid RSA-OAEP private key", async () => {
        const { privateKey } = await generateKeyPair();

        const key = await importPrivateKey(privateKey);

        expect(key).toBeInstanceOf(CryptoKey);
        expect(key.type).toBe("private");
        expect(key.algorithm.name).toBe("RSA-OAEP");
        expect(key.algorithm.hash.name).toBe("SHA-256");
        expect(key.usages).toContain("decrypt");
    });

    it("throws INVALID_PRIVATE_KEY when the private key is empty", async () => {
        await expect(
            importPrivateKey("")
        ).rejects.toMatchObject({
            code: "INVALID_PRIVATE_KEY"
        });
    });

    it("throws INVALID_PRIVATE_KEY when PEM content is invalid", async () => {
        const pem = `
-----BEGIN PRIVATE KEY-----
this-is-not-valid-base64!!!
-----END PRIVATE KEY-----
`;

        await expect(
            importPrivateKey(pem)
        ).rejects.toMatchObject({
            code: "INVALID_PRIVATE_KEY"
        });
    });

    it("throws INVALID_PRIVATE_KEY when PEM headers are missing", async () => {
        const { privateKey } = await generateKeyPair();

        const withoutHeaders = privateKey
            .replace("-----BEGIN PRIVATE KEY-----", "")
            .replace("-----END PRIVATE KEY-----", "");

        await expect(
            importPrivateKey(withoutHeaders)
        ).rejects.toMatchObject({
            code: "INVALID_PRIVATE_KEY"
        });
    });

});