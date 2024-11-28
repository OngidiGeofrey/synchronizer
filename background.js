// background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'syncToSlave') {
      chrome.storage.local.get(['slaveTabId'], (result) => {
        if (result.slaveTabId) {
          chrome.tabs.sendMessage(result.slaveTabId, {
            action: 'replicateAction',
            data: message.data
          });
        }
      });
    }
  });
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "getActiveTab") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          const currentTab = tabs[0];
          chrome.storage.local.get(["masterTabId"], (result) => {
            sendResponse({
              masterTabId: result.masterTabId,
              currentTabId: currentTab.id,
            });
          });
        } else {
          sendResponse({ error: "No active tab found." });
        }
      });
      // Ensure the response is sent asynchronously
      return true;
    }
  });
  