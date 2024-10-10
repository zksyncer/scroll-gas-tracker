chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('fetchGasPrice', { periodInMinutes: 1/6 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'fetchGasPrice') {
    fetchGasPrice();
  }
});

function updateIconBadge(price) {
  const badgeText = price.toFixed(4);  // Display the price with 4 decimals on the badge
  chrome.action.setBadgeText({ text: badgeText });
  chrome.action.setBadgeBackgroundColor({ color: '#000000' });
  chrome.action.setBadgeTextColor({ color: '#FFFFFF' });
  
  // Set a smaller font size for the badge text
  chrome.action.setTitle({ title: `Scroll Gas Price: ${badgeText} Gwei` });
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
      const baseFeeWei = BigInt(data.result);
      const baseFeeGwei = Number(baseFeeWei) / 1e9; // Convert wei to Gwei
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
