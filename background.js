chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('fetchGasPrice', { periodInMinutes: 5 }); // 5 min interval
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'fetchGasPrice') {
    fetchGasPrice();
  }
});

function updateBadge(price) {
  chrome.action.setBadgeText({ text: price.toFixed(2) });
  chrome.action.setBadgeBackgroundColor({ color: '#4688F1' });
}

async function fetchGasPrice() {
  try {
    const response = await fetch('https://rpc.scroll.io', {
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

    if (data.error) {
      throw new Error(`RPC error: ${data.error.message}`);
    }

    const baseFeeWei = BigInt(data.result);
    const baseFeeGwei = Number(baseFeeWei) / 1e9; // Convert wei to Gwei

    // Estimate other gas price tiers
    const gasPrices = {
      baseFee: baseFeeGwei,
      standard: baseFeeGwei * 1.1,
      fast: baseFeeGwei * 1.2,
      rapid: baseFeeGwei * 1.3,
      blockNumber: 'Latest', // Will be updated after fetching block number
      nextUpdate: Date.now() + 300000 // 5 minutes from now
    };

    await chrome.storage.local.set({ gasPrices });
    updateBadge(gasPrices.baseFee);

    // Fetch the latest block number
    fetchLatestBlockNumber();
  } catch (error) {
    console.error('Error fetching gas price:', error);
    chrome.action.setBadgeText({ text: 'ERR' });
    chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
  }
}

async function fetchLatestBlockNumber() {
  try {
    const response = await fetch('https://rpc.scroll.io', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`RPC error: ${data.error.message}`);
    }

    const blockNumber = parseInt(data.result, 16); // Convert hex to decimal

    const { gasPrices } = await chrome.storage.local.get('gasPrices');
    if (gasPrices) {
      gasPrices.blockNumber = blockNumber;
      await chrome.storage.local.set({ gasPrices });
    }
  } catch (error) {
    console.error('Error fetching latest block number:', error);
  }
}

// Initial fetch on startup
fetchGasPrice();

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'fetchGasPrice') {
    fetchGasPrice();
  }
});
