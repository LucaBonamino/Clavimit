import {
    MESSAGE_BEGIN,
    MESSAGE_END,
    PAYLOAD_VERSION,
    ALGORITHM,
    KEY_ALGORITHM
} from "./config.js";

export function createMessageBody(encrypted) {
    return {
        version: PAYLOAD_VERSION,
        algorithm: ALGORITHM,
        keyAlgorithm: KEY_ALGORITHM,
        encryptedKey: encrypted.encryptedKey,
        iv: encrypted.iv,
        ciphertext: encrypted.ciphertext
    };
}


export function createMessage(encrypted) {
    const message = createMessageBody(encrypted);

    return `${MESSAGE_BEGIN}

${serializeMessage(message)}

${MESSAGE_END}`;
}


export function serializeMessage(message) {
    return JSON.stringify(message);
}


export function deserializeMessage(text) {
    const message = JSON.parse(text);

    if (!validateMessage(message)) {
        throw new Error("Invalid Clavimit message");
    }

    return message;
}


export function validateMessage(message) {
    return (
        message.version === PAYLOAD_VERSION &&
        message.algorithm === ALGORITHM &&
        message.keyAlgorithm === KEY_ALGORITHM &&
        typeof message.encryptedKey === "string" &&
        typeof message.iv === "string" &&
        typeof message.ciphertext === "string"
    );
}

export function composeMessage(encrypted) {
    return createMessage(encrypted);
}

export function parseMessage(text) {
    const start = text.indexOf(MESSAGE_BEGIN);
    const finish = text.indexOf(MESSAGE_END);

    if (start === -1 || finish === -1) {
        throw new Error("Not a Clavimit message");
    }

    const json = text
        .slice(start + MESSAGE_BEGIN.length, finish)
        .trim();

    return deserializeMessage(json);
}