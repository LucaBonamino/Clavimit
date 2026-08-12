import { MESSAGE_BEGIN } from "./config.js";

export async function getInputEmailText() {
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

export async function setEmailText(text) {
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

export async function getReceivedEmailText() {
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        args: [MESSAGE_BEGIN],

        func: (messageBegin) => {
            const messages = [...document.querySelectorAll(".a3s")];

            const visibleMessage = messages.find(message => {
                const rect = message.getBoundingClientRect();
                return rect.width > 0 && rect.height > 0 && message.innerText.includes(messageBegin);
            })

            if (!visibleMessage){
                return null;
            }

            return visibleMessage.innerText; 
        }
    });

    return results[0]?.result;
}


export async function isComposeOpen() {
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },

        func: () => {
            const editors = [
                ...document.querySelectorAll(
                    '[g_editable="true"][contenteditable="true"][role="textbox"]'
                )
            ];

            return editors.some(editor => {
                const rect = editor.getBoundingClientRect();

                return rect.width > 0 && rect.height > 0;
            });
        }
    });

    return results[0]?.result ?? false;
}


export async function isMessageOpen() {
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },

        func: () => {
            const messages = [
                ...document.querySelectorAll(".a3s")
            ];

            return messages.some(message => {
                const rect = message.getBoundingClientRect();

                return rect.width > 0 && rect.height > 0;
            });
        }
    });

    return results[0]?.result ?? false;
}