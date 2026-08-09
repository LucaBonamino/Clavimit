// =============================
// CONFIG
// =============================
const ENCRYPTION_MARKER = "-----BEGIN ENCRYPTED MESSAGE-----";

// =============================
// 1. Observe Gmail for compose windows
// =============================
const observer = new MutationObserver(() => {
  const dialogs = document.querySelectorAll('div[role="dialog"]');
  console.log(dialogs);

  dialogs.forEach(dialog => {
    if (!dialog.dataset.encryptBound) {
      const body = getMessageBody(dialog);
      if (body) {
        dialog.dataset.encryptBound = "true";
        bindEncryption(dialog);
      }
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// =============================
// 2. Find message body element
// =============================
function getMessageBody(dialog) {
  return dialog.querySelector('[aria-label="Message Body"]');
}

// =============================
// 3. Bind send interception
// =============================
function bindEncryption(dialog) {
  const sendButton = dialog.querySelector('div[role="button"][data-tooltip^="Send"]');

  if (!sendButton) return;

  // Intercept button click (capture phase)
  sendButton.addEventListener('click', async (e) => {
    e.stopImmediatePropagation();
    e.preventDefault();

    await encryptCompose(dialog);

    sendButton.click(); // trigger normal send
  }, true);

  // Intercept Ctrl+Enter / Cmd+Enter
  dialog.addEventListener('keydown', async (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      await encryptCompose(dialog);
      sendButton.click();
    }
  });
}

// =============================
// 4. Encrypt compose body
// =============================
async function encryptCompose(dialog) {
  const bodyEl = getMessageBody(dialog);
  if (!bodyEl) return;

  const text = bodyEl.innerText;

  // Prevent double encryption
  if (text.includes(ENCRYPTION_MARKER)) {
    return;
  }

  const encrypted = await encryptText(text);

  bodyEl.innerText =
`${ENCRYPTION_MARKER}
${encrypted}
-----END ENCRYPTED MESSAGE-----`;
}

// =============================
// 5. Encryption (AES-GCM demo)
// =============================
async function encryptText(plainText) {

  // Generate temporary AES key
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encoded = new TextEncoder().encode(plainText);

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  const exportedKey = await crypto.subtle.exportKey("raw", key);

  return JSON.stringify({
    iv: bufferToBase64(iv),
    key: bufferToBase64(exportedKey),
    data: bufferToBase64(cipherBuffer)
  });
}

// =============================
// Helpers
// =============================
function bufferToBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}
