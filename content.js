let isMasterTab = false;


  chrome.runtime.sendMessage({ type: "getActiveTab" }, (response) => {
    if (response && response.masterTabId) {
        console.log(response)
        setupMasterTabListeners();
      const isMasterTab = response.masterTabId == response.currentTabId;
    //   if (isMasterTab) {
    //     console.log("yes here")
       
    //   }
    }
  });
  
  chrome.storage.local.get(["masterTabId"], (result) => {
    console.log("Stored Master Tab ID:", result.masterTabId);
  });
function setupMasterTabListeners() {
  
// Listen for click events
document.addEventListener('click', (event) => {
  const message = {
    type: 'click',
    x: event.clientX, // X-coordinate of the click relative to the viewport
    y: event.clientY, // Y-coordinate of the click relative to the viewport
    target: event.target.tagName // The tag name of the clicked element
  };
  broadcastToSlave(message);
});

  // Listen for scroll events
  document.addEventListener('scroll', (event) => {
    const message = {
      type: 'scroll',
      scrollX: window.scrollX,
      scrollY: window.scrollY
    };
    broadcastToSlave(message);
  });

  // Listen for input changes
  document.addEventListener('input', (event) => {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      const message = {
        type: 'input',
        value: event.target.value,
        target: {
          tagName: event.target.tagName,
          className: event.target.className,
          id: event.target.id
        }
      };
      broadcastToSlave(message);
    }
  });
}

function broadcastToSlave(message) {
    console.log(message)
  chrome.runtime.sendMessage({
    action: 'syncToSlave',
    data: message
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'replicateAction') {
    const data = message.data;
    console.log(data)
    switch (data.type) {
      case 'click':
        simulateClick(data);
        break;
      case 'scroll':
        window.scrollTo(data.scrollX, data.scrollY);
        break;
      case 'input':
        updateInput(data);
        break;
      case 'zoom':
        applyZoom(data.zoomLevel);
        break;
    }
  }
});

function simulateClick(data) {
  console.log("data target:", data.target);

  // Find the matching element in the slave tab
  const targetElement = findMatchingElement(data.target);

  if (targetElement) {
    // Check if a click simulation is already in progress or handled
    if (!targetElement.dataset.simulated) {
      // Mark this element to avoid repeated simulation
      targetElement.dataset.simulated = "true";

      // Simulate the click event
      const event = new MouseEvent('click', {
        bubbles: true, // Allow the event to bubble up
        cancelable: true, // Allow the event to be canceled
        view: window, // Associate with the current window
        clientX: data.x, // Simulate the X-coordinate
        clientY: data.y  // Simulate the Y-coordinate
      });

      targetElement.dispatchEvent(event); // Dispatch the click event
      console.log('Click simulated on target element:', targetElement);

      // Clean up the simulated flag after a short delay
      setTimeout(() => {
        delete targetElement.dataset.simulated;
      }, 100);
    } else {
      console.log('Click already simulated for this element.');
    }
  } else {
    console.error('No matching element found to simulate click.');
  }
}

function applyZoom(zoomLevel) {
  if (typeof zoomLevel === 'number' && zoomLevel > 0) {
    // Set the zoom level using CSS
    document.body.style.zoom = zoomLevel;

    console.log(`Zoom level set to: ${zoomLevel}`);
  } else {
    console.error('Invalid zoom level provided:', zoomLevel);
  }
}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'syncToSlave') {
      // Perform the action (e.g., simulate a click)
      console.log('Message received:', message.data);
      replicateAction(message.data);
    }
  });
  function replicateAction(data) {
    console.log("message "+data)
    if (data.type === 'click') {
      const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: data.x,
        clientY: data.y,
      });
  
      // Assuming data.target contains a query selector or an element reference
      const targetElement = document.querySelector(data.target.selector);
      if (targetElement) {
        targetElement.dispatchEvent(event);
      } else {
        console.error('Target element not found:', data.target);
      }
    }
  }
  
function updateInput(data) {
  let targetElement = findMatchingElement(data.target);
  if (targetElement) {
    targetElement.value = data.value;
    // Trigger input event
    const event = new Event('input', { bubbles: true });
    targetElement.dispatchEvent(event);
  }
}
function findMatchingElement(target) {
  if (typeof target === 'string') {
    // If target is just a tag name, query by tag
    return document.querySelector(target.toLowerCase());
  }

  if (typeof target === 'object') {
    // Try to find the element by ID
    if (target.id) {
      return document.getElementById(target.id);
    }

    // Try by class and tag combination
    if (target.className) {
      return document.querySelector(`${target.tagName.toLowerCase()}.${target.className}`);
    }

    // Finally, try just by tag name
    if (target.tagName) {
      return document.querySelector(target.tagName.toLowerCase());
    }
  }

  return null; // Return null if no match is found
}