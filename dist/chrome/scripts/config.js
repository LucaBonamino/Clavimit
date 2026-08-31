// Shared constants used across Clavimit.
// Defines the message wrapper markers, the current payload format
// version, and the algorithm identifiers embedded in every encrypted
// message. Used by messageFormat.js when composing/parsing messages,
// and by cryptography.js/content.js for algorithm labeling.

export const MESSAGE_BEGIN = "-----BEGIN CLAVIMIT MAIL-----";
export const MESSAGE_END = "-----END CLAVIMIT MAIL-----";

export const PAYLOAD_VERSION = 1;

export const ALGORITHM = "AES-256-GCM";
export const KEY_ALGORITHM = "RSA-OAEP-SHA256";
