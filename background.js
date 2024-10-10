chrome.runtime.onInstalled.addListener(() => {
  // Set up alarm to fetch gas price every 10 seconds
  chrome.alarms.create('fetchGasPrice', { periodInMinutes: 1/6 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'fetchGasPrice') {
    fetchGasPrice();
  }
});

function updateIconBadge(price) {
  chrome.action.setBadgeText({
    text: price.toFixed(2)  // Display the price with 2 decimals on the badge
  });
  chrome.action.setBadgeBackgroundColor({ color: '#000000' });
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
