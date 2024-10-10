const SCROLL_RPC_URL = 'https://rpc.scroll.io';

// Fetch gas price function
async function fetchGasPrice() {
  try {
    const response = await fetch(SCROLL_RPC_URL, {
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
    });

    const data = await response.json();
    const gasPrice = parseInt(data.result, 16);
    const gasPriceGwei = gasPrice / 1e9;
    
    const timestamp = new Date().toISOString();
    const priceData = { timestamp, price: gasPriceGwei };
    
    // Store the gas price in Chrome storage
    chrome.storage.local.get(['gasPrices'], function(result) {
      let gasPrices = result.gasPrices || [];
      gasPrices.push(priceData);
      if (gasPrices.length > 24) {
        gasPrices = gasPrices.slice(-24);
      }
      chrome.storage.local.set({ gasPrices });
    });

  } catch (error) {
    console.error('Error fetching gas price:', error);
  }
}

// Set up an alarm to fetch gas price every 5 minutes
chrome.alarms.create('fetchGasPrice', { periodInMinutes: 5 });

// Handle alarm trigger
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'fetchGasPrice') {
    fetchGasPrice();
  }
});

// Fetch gas price immediately when service worker is registered
fetchGasPrice();
