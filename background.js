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
  chrome.action.setBadgeTextColor({ color: '#FFFFFF' });
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
      if (data.error) {
        throw new Error(`RPC error: ${data.error.message}`);
      }
      if (!data.result) {
        throw new Error('No result in RPC response');
      }
      const baseFeeWei = parseInt(data.result, 16);
      if (isNaN(baseFeeWei)) {
        throw new Error('Invalid gas price returned');
      }
      const baseFeeGwei = baseFeeWei / 1e9; // Convert wei to Gwei
      chrome.storage.local.set({ gasPrices: [{ price: baseFeeGwei }] });
      updateIconBadge(baseFeeGwei);
    })
    .catch(error => {
      console.error('Error fetching gas price:', error);
      chrome.action.setBadgeText({ text: 'ERR' });
      chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
    });
}

// Initial fetch
fetchGasPrice();
