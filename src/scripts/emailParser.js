// Gmail DOM integration layer.
// Reads and writes text in the active Gmail tab (compose window and
// received messages) via chrome.scripting.executeScript, and detects
// whether a compose or message view is currently open. Used by
// content.js and sidebar.js to locate email content without touching
// cryptography or message formatting directly.

import { MESSAGE_BEGIN } from "./config.js";
import { ClavimitError } from "./exeptions.js";

export async function getInputEmailText() {
    try {
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });
        if (!tab?.id) {
            throw new ClavimitError(
                "GMAIL_INTEGRATION_ERROR",
                "Clavimit could not access the current Gmail tab.",
            );
        }

        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },

            func: () => {
                const editors = document.querySelectorAll(
                    '[g_editable="true"][contenteditable="true"][role="textbox"]',
                );

                const editor = [...editors].find((el) => {
                    const rect = el.getBoundingClientRect();

                    return rect.width > 0 && rect.height > 0;
                });

                if (!editor) {
                    console.log("No Gmail editor found");
                    return null;
                }

                return editor.innerText;
            },
        });

        return results[0]?.result ?? null;
    } catch (error) {
        if (error instanceof ClavimitError) {
            throw error;
        }

        console.error("Gmail integration error:", error);

        throw new ClavimitError(
            "GMAIL_INTEGRATION_ERROR",
            "Clavimit could not read the Gmail compose window.",
        );
    }
}

export async function setEmailText(text) {
    try {
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });

        if (!tab?.id) {
            throw new ClavimitError(
                "GMAIL_INTEGRATION_ERROR",
                "Clavimit could not access the current Gmail tab.",
            );
        }

        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            args: [text],

            func: (text) => {
                const editor = [
                    ...document.querySelectorAll(
                        '[g_editable="true"][contenteditable="true"][role="textbox"]',
                    ),
                ].find((el) => {
                    const rect = el.getBoundingClientRect();

                    return rect.width > 0 && rect.height > 0;
                });

                if (!editor) {
                    return {
                        success: false,
                        reason: "EDITOR_NOT_FOUND",
                    };
                }

                editor.innerText = text;

                return {
                    success: true,
                };
            },
        });

        const result = results[0]?.result;

        if (!result?.success) {
            throw new ClavimitError(
                "GMAIL_INTEGRATION_ERROR",
                "Clavimit could not update the Gmail compose window.",
            );
        }
    } catch (error) {
        if (error instanceof ClavimitError) {
            throw error;
        }

        console.error("Failed to update Gmail editor:", error);

        throw new ClavimitError(
            "GMAIL_INTEGRATION_ERROR",
            "Clavimit could not update the Gmail compose window.",
        );
    }
}

export async function getReceivedEmailText() {
    try {
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });

        if (!tab?.id) {
            throw new ClavimitError(
                "GMAIL_INTEGRATION_ERROR",
                "Could not access the current Gmail tab.",
            );
        }

        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            args: [MESSAGE_BEGIN],

            func: (messageBegin) => {
                const messages = [...document.querySelectorAll(".a3s")];
                if (messages.length === 0) {
                    return { status: "gmail_structure_not_found" };
                }
                const visibleMessage = messages.find((message) => {
                    const rect = message.getBoundingClientRect();
                    return (
                        rect.width > 0 &&
                        rect.height > 0 &&
                        message.innerText.includes(messageBegin)
                    );
                });

                if (!visibleMessage) {
                    return { status: "message_not_found" };
                }

                return {
                    status: "success",
                    text: visibleMessage.innerText,
                };
            },
        });

        const result = results[0]?.result;

        if (!result) {
            throw new ClavimitError(
                "GMAIL_INTEGRATION_ERROR",
                "Could not read the Gmail page.",
            );
        }

        if (result.status === "gmail_structure_not_found") {
            throw new ClavimitError(
                "GMAIL_INTEGRATION_ERROR",
                "Clavimit could not read the Gmail page.",
            );
        }

        if (result.status === "message_not_found") {
            return null;
        }

        return result.text;
    } catch (error) {
        if (error instanceof ClavimitError) {
            throw error;
        }

        console.error("Gmail integration error:", error);

        throw new ClavimitError(
            "GMAIL_INTEGRATION_ERROR",
            "Clavimit could not access Gmail.",
        );
    }
}

export async function isComposeOpen() {
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
    });

    const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },

        func: () => {
            const editors = [
                ...document.querySelectorAll(
                    '[g_editable="true"][contenteditable="true"][role="textbox"]',
                ),
            ];

            return editors.some((editor) => {
                const rect = editor.getBoundingClientRect();

                return rect.width > 0 && rect.height > 0;
            });
        },
    });

    return results[0]?.result ?? false;
}

export async function isMessageOpen() {
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
    });

    const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },

        func: () => {
            const messages = [...document.querySelectorAll(".a3s")];

            return messages.some((message) => {
                const rect = message.getBoundingClientRect();

                return rect.width > 0 && rect.height > 0;
            });
        },
    });

    return results[0]?.result ?? false;
}

export async function openComposeWindow() {
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
    });

    const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },

        func: async () => {
            function findEditor() {
                return [
                    ...document.querySelectorAll(
                        '[g_editable="true"][contenteditable="true"][role="textbox"]',
                    ),
                ].find((el) => {
                    const rect = el.getBoundingClientRect();
                    return rect.width > 0 && rect.height > 0;
                });
            }

            // The compositor is already opened
            if (findEditor()) {
                return true;
            }

            // The compositor is not already opened, open it
            const composeButton = document.querySelector('[gh="cm"]');
            if (!composeButton) {
                return false;
            }

            composeButton.click();
            // Wait until Gmail creates the compose editor
            for (let i = 0; i < 20; i++) {
                await new Promise((resolve) => setTimeout(resolve, 100));
                if (findEditor()) {
                    return true;
                }
            }
            return false;
        },
    });

    return results[0]?.result;
}
