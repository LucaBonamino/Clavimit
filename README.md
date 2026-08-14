# Clavimit

Clavimit is a Chrome extension for encrypting and decrypting Gmail messages using client-side cryptography.

It uses hybrid encryption with **AES-256-GCM** and **RSA-OAEP with SHA-256**. Encryption and decryption are performed locally in the browser using the Web Crypto API.

Clavimit does not require an account or a Clavimit server.

## How it works

When encrypting a message:

1. Write an email in Gmail.
2. Open Clavimit.
3. Provide the recipient's RSA public key by:

   * pasting the key, or
   * selecting a public-key file.
4. Click **Encrypt**.

Clavimit generates a new AES-256 key for each message and encrypts the email content using AES-GCM.

The AES key is then encrypted using the recipient's RSA public key with RSA-OAEP.

The encrypted email contains the information required for the recipient to decrypt it, including:

* the encrypted AES key
* the initialization vector (IV)
* the encrypted message
* the algorithm identifiers
* the Clavimit message-format version

Encrypted messages are wrapped in a Clavimit message block:

```text
-----BEGIN CLAVIMIT MAIL-----
...
-----END CLAVIMIT MAIL-----
```

## Decryption

To decrypt a Clavimit message:

1. Open the encrypted email in Gmail.
2. Open Clavimit.
3. Provide your RSA private key by:

   * pasting the key, or
   * selecting a private-key file.
4. Click **Decrypt**.

Clavimit decrypts the AES key using the RSA private key and then uses that AES key to decrypt the message.

The resulting plaintext is displayed by the extension.

## Cryptography

Clavimit currently uses:

* **AES-256-GCM** for message encryption
* **RSA-OAEP with SHA-256** for encrypting the AES key
* a newly generated AES key for every encrypted message
* a new random initialization vector for every encryption operation
* the browser's native **Web Crypto API**

Clavimit does not implement cryptographic primitives itself.

## Key ownership

Clavimit does not manage or persist cryptographic keys.

Users remain responsible for generating, storing, backing up, exchanging, and verifying their own RSA keys.

Keys are provided to Clavimit only when they are needed, either by pasting them into the extension or selecting a key file.

For encryption, Clavimit requires the recipient's **public key**.

For decryption, Clavimit requires the corresponding **private key**.

Clavimit does not intentionally:

* generate user key pairs
* upload keys to a server
* synchronize keys between devices
* permanently store private keys in the browser
* provide key recovery
* distribute public keys
* verify that a public key belongs to a particular person

Key ownership and key distribution remain under the user's control.

## Privacy

Encryption and decryption are performed locally in the browser.

Clavimit does not require a backend service for message encryption or decryption.

The email content and cryptographic keys are processed by the extension only when required to perform the requested operation.

For more details, see [Privacy Policy](PRIVACY.md).

### Gmail draft limitation

Clavimit currently encrypts the message after it has been written in Gmail's compose window.

Gmail may automatically save the plaintext message as a draft before Clavimit applies encryption.

Therefore, the current version of Clavimit does **not** protect the plaintext message from Gmail itself while the message is being composed.

Clavimit primarily protects the content of the email after encryption has been applied.

A future secure-compose mode could avoid placing plaintext message content inside Gmail before encryption.

## Security limitations

Clavimit is currently an experimental project and has **not been independently security audited**.

It should not currently be relied upon for highly sensitive or production-critical communication.

Clavimit also does not currently provide:

* public-key identity verification
* digital signatures
* sender authentication
* automatic public-key discovery
* protection against a malicious or compromised browser
* protection against a compromised device
* protection against plaintext drafts created by Gmail before encryption

Users should independently verify that a public key really belongs to the intended recipient before using it.

## Installation

Clavimit is currently distributed as a development version.

To install it manually:

1. Clone or download this repository.
2. Open Chrome.
3. Navigate to `chrome://extensions`.
4. Enable **Developer mode**.
5. Click **Load unpacked**.
6. Select the Clavimit project directory.
7. Open Gmail.
8. Open Clavimit from Chrome and use the side panel to encrypt or decrypt messages.

## Current status

Clavimit is under active development.

The current implementation supports:

* Gmail message encryption
* Gmail message decryption
* RSA public keys provided as pasted text or files
* RSA private keys provided as pasted text or files
* AES-256-GCM message encryption
* RSA-OAEP key encryption
* Clavimit-formatted encrypted email messages
* local browser-based cryptographic operations

## Project scope

Clavimit is intended to provide a simple encryption layer for Gmail while keeping cryptographic key ownership in the hands of the user.

The project deliberately does not aim to become a full cryptographic key-management system.

Future versions may improve usability around public keys and identity verification without requiring Clavimit to take ownership of users' private keys.

## Roadmap

### Near-term improvements

The next planned improvements focus on extending the current email workflow and improving privacy:

* **Secure compose mode** — allow users to write the plaintext message inside Clavimit so that only the encrypted content is inserted into Gmail.
* **Attachment encryption** — encrypt email attachments together with the message content.
* **Formatted decrypted messages** — correctly display decrypted HTML and structured message content instead of showing the raw representation.
* **Sent-message decryption** — allow senders to decrypt messages they previously encrypted, potentially by encrypting the per-message AES key for both the recipient and the sender.
* **Symmetric encryption mode** — optionally allow encryption using a user-provided symmetric key for situations where both parties already share a secret.
* **Improved Gmail integration** — make message detection and compose-window handling more robust.
* **Automated tests** — add tests for cryptographic operations, message formatting, corrupted messages, invalid keys, and edge cases.

### Potential future features

Longer-term features that may be explored include:

* public-key fingerprint display
* digital signatures
* signature verification using user-provided public keys
* support for additional cryptographic algorithms

Clavimit will continue to leave key ownership, distribution, and identity verification to the user rather than acting as a key-management or identity service.

## Contributing

Contributions are welcome.

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, contribution guidelines, issue reporting, and current areas for contribution.

## License

Clavimit is licensed under the **GNU General Public License v3.0**.

See the [LICENSE](LICENSE) file for details.
