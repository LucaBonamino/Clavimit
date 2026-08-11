# Clavimit
Chrome extension for encrypting Gmail emails.

Write a new email, open the extension, insert the recipient's RSA public key, and click *Encrypt*.

The extension uses **RSA-OAEP** and **AES-256** in GCM mode. A new AES key is generated for each message and used to encrypt the email content. The AES key is then encrypted with the recipient's RSA public key.

The encrypted AES key, initialization vector (IV), and encrypted message are included in the email so that the recipient can decrypt it using their RSA private key.

Encryption is applied before the email is sent. However, Gmail may still store the plaintext message as a draft before Clavimit encrypts it.

Decryption will be implemented in future commits.
