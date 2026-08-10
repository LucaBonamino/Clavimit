import { encryptMessage , composeMessage} from "./cryptography.js";

async function getText() {
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },

        func: () => {
            const editors = document.querySelectorAll(
                '[g_editable="true"][contenteditable="true"][role="textbox"]'
            );

            const editor = [...editors].find(el => {
                const rect = el.getBoundingClientRect();

                return rect.width > 0 && rect.height > 0;
            });

            if (!editor) {
                console.log("No Gmail editor found");
                return null;
            }

            return editor.innerText;
        }
    });

    return results[0]?.result;
}


async function setText(text) {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });
  await chrome.scripting.executeScript({
    target: {tabId: tab.id},
    args: [text],
    func: (text) => {
      const editor = [...document.querySelectorAll(
        '[g_editable="true"][contenteditable="true"][role="textbox"]'
      )].find(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
      if (editor){
        editor.innerText = text;
      }
    }
  })
}



const button = document.getElementById("enc");
const publicKeyInput = document.getElementById("publicKey");

button.addEventListener("click", async () => {
    try {
        const publicKey = publicKeyInput.value;
        const text = await getText();
        const enc = await encryptMessage(
            text,
            publicKey
        );
        const message = composeMessage(enc);

        await setText(message);

    } catch (error) {
        console.error("ERROR:", error);
    }
});