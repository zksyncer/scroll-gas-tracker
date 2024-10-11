const RPC_ENDPOINT = 'https://rpc.scroll.io';

chrome.runtime.onInstalled.addListener(() => {
  fetchGasPrices();
  chrome.alarms.create('updateGasPrices', { periodInMinutes: 0.05 }); // Every 3 seconds
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'updateGasPrices') {
    fetchGasPrices();
  }
});

async function fetchGasPrices() {
  try {
    const response = await fetch(RPC_ENDPOINT, {
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

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', data);

    if (data.error) {
      throw new Error(`API Error: ${data.error.message}`);
    }

    const gasPriceWei = parseInt(data.result, 16);
    if (isNaN(gasPriceWei)) {
      throw new Error('Invalid gas price format');
    }

    const gasPriceGwei = gasPriceWei / 1e9;

    const gasPrices = {
      standard: gasPriceGwei,
      fast: gasPriceGwei * 1.25, // Adjusted multiplier
      rapid: gasPriceGwei * 1.5, // Adjusted multiplier
      baseFee: gasPriceGwei
    };

    await chrome.storage.local.set({ gasPrices });
    updateBadge(gasPrices.baseFee);

    console.log('Gas prices updated:', gasPrices);
  } catch (error) {
    console.error('Error fetching gas prices:', error);
    // Fallback to a default gas price
    const defaultGasPrice = 0.1; // 0.1 Gwei as a fallback
    const gasPrices = {
      standard: defaultGasPrice,
      fast: defaultGasPrice * 1.25,
      rapid: defaultGasPrice * 1.5,
      baseFee: defaultGasPrice
    };
    await chrome.storage.local.set({ gasPrices });
    updateBadge(defaultGasPrice);
    chrome.action.setBadgeText({ text: 'ERR' });
    chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
  }
}

function updateBadge(price) {
  chrome.action.setBadgeText({ text: price.toFixed(2) });
  chrome.action.setBadgeBackgroundColor({ color: '#4688F1' });
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'fetchGasPrice') {
    fetchGasPrices();
  }
});
