chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('fetchGasPrice', { periodInMinutes: 1/60 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'fetchGasPrice') {
    fetchGasPrice();
  }
});

function updateTooltip(price) {
  const tooltipText = `Scroll Gas Price: ${price.toFixed(4)} Gwei`;
  chrome.action.setTitle({ title: tooltipText });
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
    updateTooltip(baseFeeGwei);
  })
  .catch(error => {
    console.error('Error fetching gas price:', error);
    chrome.action.setTitle({ title: 'Error fetching gas price' });
  });
}

// Initial fetch
fetchGasPrice();
