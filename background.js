chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed. Setting up alarm.');
  chrome.alarms.create('fetchGasPrice', { periodInMinutes: 1/6 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  console.log('Alarm triggered:', alarm.name);
  if (alarm.name === 'fetchGasPrice') {
    fetchGasPrice();
  }
});

function updateIconBadge(price) {
  console.log('Updating icon badge with price:', price);
  const badgeText = price.toFixed(2);  // Display the price with 2 decimals
  chrome.action.setBadgeText({ text: badgeText });
  chrome.action.setBadgeBackgroundColor({ color: '#000000' });  // Black background
  chrome.action.setBadgeTextColor({ color: '#FFFFFF' });  // White text
  
  // Set a title for hover text
  chrome.action.setTitle({ title: `Scroll Gas Price: ${price.toFixed(4)} Gwei` });

  // Create a canvas to draw the badge text with the specified font size
  const canvas = new OffscreenCanvas(19, 19);
  const ctx = canvas.getContext('2d');
  ctx.font = '10.5px Arial';  // Set font size to 10.5px
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillRect(0, 0, 19, 19);  // Fill black background
  ctx.fillStyle = 'white';
  ctx.fillText(badgeText, 9.5, 9.5);

  // Convert the canvas to an ImageData object
  const imageData = ctx.getImageData(0, 0, 19, 19);

  // Set the badge icon with the custom-drawn text
  chrome.action.setIcon({ imageData: imageData }, () => {
    if (chrome.runtime.lastError) {
      console.error('Error setting icon:', chrome.runtime.lastError);
    } else {
      console.log('Icon set successfully');
    }
  });
}

function fetchGasPrice() {
  console.log('Fetching gas price...');
  fetch('https://rpc.scroll.io', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_gasPrice',
      params: [],
      id: 1
    }),
  })
    .then(response => response.json())
    .then(data => {
      console.log('Received data:', data);
      if (data.error) {
        throw new Error(`RPC error: ${data.error.message}`);
      }
      if (!data.result) {
        throw new Error('No result in RPC response');
      }
      const baseFeeWei = BigInt(data.result);
      const baseFeeGwei = Number(baseFeeWei) / 1e9; // Convert wei to Gwei
      console.log('Calculated gas price:', baseFeeGwei, 'Gwei');
      chrome.storage.local.set({ gasPrices: [{ price: baseFeeGwei }] }, () => {
        console.log('Gas price stored in local storage');
      });
      updateIconBadge(baseFeeGwei);
    })
    .catch(error => {
      console.error('Error fetching gas price:', error);
      chrome.action.setBadgeText({ text: 'ERR' });
      chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
    });
}

// Initial fetch
console.log('Performing initial gas price fetch');
fetchGasPrice();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request);
  if (request.action === "fetchGasPrice") {
    console.log('Manual fetch requested from popup');
    fetchGasPrice();
    sendResponse({status: "Fetching gas price"});
  }
  return true; // Indicates that the response will be sent asynchronously
});

// For debugging: log when the background script is loaded
console.log('Background script loaded');
