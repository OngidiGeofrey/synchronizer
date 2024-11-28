document.getElementById('setMaster').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.storage.local.set({ masterTabId: tab.id });
      alert('Set as master tab!');
    });
  });
  
  document.getElementById('setSlave').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.storage.local.set({ slaveTabId: tab.id });
      alert('Set as slave tab!');
    });
  });
  chrome.storage.local.get(["masterTabId"], (result) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const currentTab = tabs[0];
        const isMasterTab = currentTab.id === result.masterTabId;
        if (isMasterTab) {
          setupMasterTabListeners();
        }
      } else {
        console.error("No active tab found.");
      }
    });
  });
  