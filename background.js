chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('fetchGasPrice', { periodInMinutes: 1/6 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'fetchGasPrice') {
    fetchGasPrice();
  }
});

function updateIconBadge(price) {
  const badgeText = price.toFixed(1);  // Display the price with 1 decimal on the badge
  chrome.action.setBadgeText({ text: badgeText });
  chrome.action.setBadgeBackgroundColor({ color: '#000000' });
  
  // Set a smaller font size for the badge text
  chrome.action.setBadgeTextColor({ color: '#FFFFFF' });
  chrome.action.setBadgeFont({ size: 9 });  // Adjust this value as needed
}

function fetchGasPrice() {
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
      const baseFee = parseInt(data.result, 16) / 1e9; // Convert wei to Gwei
      chrome.storage.local.set({ gasPrices: [{ price: baseFee }] });
      updateIconBadge(baseFee);
    })
    .catch(error => console.error('Error fetching gas price:', error));
}

// Initial fetch
fetchGasPrice();
