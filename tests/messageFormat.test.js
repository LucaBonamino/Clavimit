import { describe, it, expect } from "vitest";
import { parseMessage, deserializeMessage, validateMessage, parseMessage } from "../scripts/messageFormat";
import {
    MESSAGE_BEGIN,
    MESSAGE_END,
    PAYLOAD_VERSION,
    ALGORITHM,
    KEY_ALGORITHM
} from "../scripts/config";

describe("desetialize", () => {

    it("throws INVALID_MESSAGE for invalid JSON", () => {
        expect.assertions(1);

        try {
            deserializeMessage("dummyMessage");
        } catch (error) {
            expect(error.code).toBe("INVALID_MESSAGE");
        }
    });

    it("throws INVALID_MESSAGE when the message format is invalid", () => {
        const invalidMessage = JSON.stringify({
            version: 1
        });
        expect(() => {
            deserializeMessage(invalidMessage);
        }).toThrow(
            "The Clavimit message does not satisfy the expected format."
        );
    });

    const validMessage = {
        version: 1,
        algorithm: "AES-256-GCM",
        keyAlgorithm: "RSA-OAEP-SHA256",
        encryptedKey: "dummyEncryptedKey",
        iv: "dummyIv",
        ciphertext: "dummyCiphertext"
    };

    it("Succeed", () => {
        const ret = deserializeMessage(JSON.stringify(validMessage));
        expect(ret).toEqual(validMessage);

    })
});

describe("validateMessage", () => {

    const validMessage = {
        version: 1,
        algorithm: "AES-256-GCM",
        keyAlgorithm: "RSA-OAEP-SHA256",
        encryptedKey: "dummyEncryptedKey",
        iv: "dummyIv",
        ciphertext: "dummyCiphertext"
    };

    it("accepts a valid message", () => {
        expect(validateMessage(validMessage)).toBe(true);
    });

    it("rejects null", () => {
        expect(validateMessage(null)).toBe(false);
    });

    it("rejects a message with a missing ciphertext", () => {
        const message = {
            ...validMessage
        };

        delete message.ciphertext;

        expect(validateMessage(message)).toBe(false);
    });

    it("rejects a message with an invalid version", () => {
        const message = {
            ...validMessage,
            version: 999
        };

        expect(validateMessage(message)).toBe(false);
    });

    it("rejects a message with an invalid algorithm", () => {
        const message = {
            ...validMessage,
            algorithm: "AES-128-CBC"
        };

        expect(validateMessage(message)).toBe(false);
    });

    it("rejects a message with an invalid key algorithm", () => {
        const message = {
            ...validMessage,
            keyAlgorithm: "RSA-PKCS1"
        };

        expect(validateMessage(message)).toBe(false);
    });

});

describe("parseMessage", () => {
    const validMessage = {
        version: 1,
        algorithm: "AES-256-GCM",
        keyAlgorithm: "RSA-OAEP-SHA256",
        encryptedKey: "dummyEncryptedKey",
        iv: "dummyIv",
        ciphertext: "dummyCiphertext"
    };

    const MESSAGE_BEGIN = "-----BEGIN CLAVIMIT MAIL-----";
    const MESSAGE_END = "-----END CLAVIMIT MAIL-----";

    it("throws INVALID_MESSAGE for empty text", () => {
        try {
            parseMessage("");
        } catch (error) {
            expect(error.code).toBe("INVALID_MESSAGE");
            expect(error.message).toBe(
                "No Clavimit message was found"
            );
            return;
        }

        //throw new Error("Expected parseMessage to throw");
    });

    it("throws INVALID_MESSAGE when message markers are missing", () => {
        try {
            parseMessage("Hello, this is just a normal email");
        } catch (error) {
            expect(error.code).toBe("INVALID_MESSAGE");
            expect(error.message).toBe(
                "Not a Clavimit message"
            );
            return;
        }

        //throw new Error("Expected parseMessage to throw");
    });

    it("throws when the end marker is missing", () => {
        const text = `
${MESSAGE_BEGIN}
${JSON.stringify(validMessage)}
`;

        expect(() => {
            parseMessage(text);
        }).toThrow("Not a Clavimit message");
    });

    it("throws when the begin marker is missing", () => {
        const text = `
${JSON.stringify(validMessage)}
${MESSAGE_END}
`;

        expect(() => {
            parseMessage(text);
        }).toThrow("Not a Clavimit message");
    });

    it("parses a valid Clavimit message", () => {
        const text = `
${MESSAGE_BEGIN}

${JSON.stringify(validMessage)}

${MESSAGE_END}
`;

        const result = parseMessage(text);

        expect(result).toEqual(validMessage);
    });

    it("parses a Clavimit message surrounded by other text", () => {
        const text = `
Dummy wrapper begin

${MESSAGE_BEGIN}
${JSON.stringify(validMessage)}
${MESSAGE_END}

dummy wrapper end
`;

        const result = parseMessage(text);

        expect(result).toEqual(validMessage);
    });

    it("throws INVALID_MESSAGE when the enclosed JSON is invalid", () => {
        const text = `
${MESSAGE_BEGIN}
this is not a json text
${MESSAGE_END}
`;

        expect(() => {
            parseMessage(text);
        }).toThrow(
            "The Clavimit message contains invalid JSON."
        );
    });

    it("throws INVALID_MESSAGE when the enclosed message has an invalid format", () => {
        const text = `
${MESSAGE_BEGIN}
${JSON.stringify({ version: 1 })}
${MESSAGE_END}
`;

        expect(() => {
            parseMessage(text);
        }).toThrow(
            "The Clavimit message does not satisfy the expected format."
        );
    });
});