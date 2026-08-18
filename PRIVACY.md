# Clavimit Privacy Policy

**Last updated: August 18, 2026**

Clavimit is a Chrome extension for encrypting and decrypting Gmail messages locally in the user's browser.

Clavimit is designed so that email content and cryptographic keys used by the extension are processed locally and are not sent to a Clavimit server.

## Data accessed by Clavimit

To provide its encryption and decryption functionality, Clavimit may access the following information when the user explicitly uses the extension:

* Gmail message content selected for encryption or decryption
* RSA public keys supplied by the user
* RSA private keys supplied by the user
* key files explicitly selected by the user
* the Gmail compose window or opened message required to perform the requested operation

Clavimit accesses this information only as necessary to perform encryption, decryption, and related user-facing functionality.

## Cryptographic keys

Clavimit does not manage or store users' cryptographic keys.

Public and private keys may be supplied by the user when required by:

* pasting the key into Clavimit, or
* selecting a key file from the user's device.

Clavimit can also optionally generate an RSA key pair locally in the browser. Generated keys are shown to the user and may be downloaded for later use.

Clavimit does not intentionally:

* upload cryptographic keys to a server
* synchronize keys between devices
* store private keys in the browser
* provide key backup or recovery
* distribute public keys
* verify the identity of the owner of a public key

Users remain responsible for securely storing, backing up, exchanging, and verifying cryptographic keys, including keys generated with Clavimit.


## Email content

Clavimit accesses Gmail message content only when required to perform an operation requested by the user.

For encryption, Clavimit supports two compose modes:
* **Gmail compose** - the plaintext message is read from the Gmail compose window, encrypted locally, and replaced with the resulting encrypted Clavimit message.
* **Secure compose** - the plaintext message is written inside Clavimit and encrypted locally before being inserted into Gmail. If necessary, Clavimit opens a Gmail compose window and inserts only the encrypted message.

For decryption, the encrypted message is read from Gmail and decrypted locally using the private key supplied by the user.

Clavimit does not intentionally transmit email content to the developer or to a Clavimit-operated server.

## Local processing

Encryption and decryption are performed locally using cryptographic functionality provided by the browser.

Clavimit does not require a Clavimit account or backend service to encrypt or decrypt messages.

Clavimit does not currently use email content or cryptographic keys for:

* analytics
* advertising
* user profiling
* marketing
* machine-learning training
* unrelated product functionality

## Data storage and retention

Clavimit does not intentionally persist email content or private keys after they are used for the requested operation.

Clavimit does not maintain a remote database of user messages or cryptographic keys.

Users remain responsible for any copies of their keys stored on their own devices.

## Data sharing

Clavimit does not sell user data.

Clavimit does not share email content or cryptographic keys with advertisers, data brokers, or other third parties.

Clavimit does not make users' email content or cryptographic keys available for human review by the developer.

## Chrome permissions

Clavimit uses Chrome extension permissions only to provide its Gmail encryption and decryption functionality.

### Gmail access

Clavimit requires access to Gmail pages in order to read message content selected for encryption or decryption and to insert encrypted content into Gmail.

### `activeTab`

This permission allows Clavimit to interact with the currently active browser tab when required for a user-requested operation.

### `scripting`

This permission allows Clavimit to execute the code required to read from and write to the Gmail interface.

### `sidePanel`

This permission is used to display the Clavimit user interface in Chrome's side panel.

Clavimit does not use these permissions for advertising, tracking, or monitoring unrelated browsing activity.

## Gmail and plaintext drafts

When using **Gmail compose**, Clavimit encrypts a message after the plaintext has already been entered into Gmail's compose window.

Gmail may automatically save that plaintext message as a draft before Clavimit applies encryption. As a result, Gmail compose mode does not prevent Gmail from processing or storing plaintext that has already been entered into Gmail.

When using **Secure compose**, the plaintext message is written inside Clavimit instead of Gmail. Clavimit encrypts the message locally and inserts only the resulting encrypted message into Gmail. This reduces the risk of Gmail creating a plaintext draft before encryption.

Clavimit does not control Gmail's storage or processing of email data. Google's handling of Gmail data is governed by Google's own terms and privacy policies.

## Limited Use

Clavimit uses information obtained through Chrome and Gmail access only to provide or improve its disclosed user-facing purpose: encrypting and decrypting Gmail messages.

Clavimit does not use or transfer user data for personalized advertising, retargeting, user profiling, creditworthiness, or purposes unrelated to the extension's functionality.

Clavimit does not permit humans to read users' private email content or cryptographic keys.

Clavimit's use of data obtained through Chrome extension permissions is intended to comply with the Chrome Web Store User Data Policy, including its Limited Use requirements.

## Third-party services

Clavimit does not currently use a developer-operated backend service for encryption or decryption.

The extension operates within Gmail and Chrome. Use of those services remains subject to the respective privacy policies and terms of Google and Chrome.

## Changes to this policy

This privacy policy may be updated if Clavimit's functionality or data-handling practices change.

Any material change to how Clavimit handles user data will be reflected in this policy and, where required, disclosed to users.

The latest version of this policy will be available in the Clavimit GitHub repository.

## Contact

For questions about this privacy policy or Clavimit's handling of data, please contact the developer through the Clavimit GitHub repository.
