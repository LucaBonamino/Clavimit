console.log("Extension loaded into Gmail!");
const testVar = "12";


const observer = new MutationObserver(() => {
  const dialogs = document.querySelectorAll('div[role="dialog"]');

  dialogs.forEach(dialog => {
    if (!dialog.dataset.testBound) {
      dialog.dataset.testBound = "true";
      console.log("Compose window detected!");
      console.dir(dialog);
      bindText(dialog);
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});


observer.observe(document.body, {
  childList: true,
  subtree: true
});


function bindText(dialog){
    console.log(dialog)
    const sendButton = dialog.querySelector('div[role="button"][data-tooltip^="Send"]');

    if (!sendButton) {
        console.log("Returning nothing");
    }

    console.log(sendButton);
}

function getMessageBody(dialog) {
    const m = dialog.querySelector('[arial-label="Message Body"]');
    return m;
}