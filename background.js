chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('fetchGasPrice', { periodInMinutes: 1/60 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'fetchGasPrice') {
    fetchGasPrice();
  }
});

function updateBadge(price) {
  chrome.action.setBadgeText({text: price.toFixed(2)});
  chrome.action.setBadgeBackgroundColor({color: '#4688F1'});
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

    // Estimate other prices based on base fee
    const standardGwei = baseFeeGwei * 1.1;
    const fastGwei = baseFeeGwei * 1.2;
    const rapidGwei = baseFeeGwei * 1.3;

    const gasPrices = {
      baseFee: baseFeeGwei,
      standard: standardGwei,
      fast: fastGwei,
      rapid: rapidGwei,
      blockNumber: 'Latest',
      nextUpdate: Date.now() + 60000 // 1 minute from now
    };

    chrome.storage.local.set({ gasPrices: gasPrices });
    updateBadge(gasPrices.baseFee);

    // Fetch the latest block number separately
    fetchLatestBlockNumber();
  } catch (error) {
    console.error('Error fetching gas price:', error);
    chrome.action.setBadgeText({text: 'ERR'});
    chrome.action.setBadgeBackgroundColor({color: '#FF0000'});
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

    const blockNumber = parseInt(data.result, 16);
    chrome.storage.local.get('gasPrices', (result) => {
      if (result.gasPrices) {
        result.gasPrices.blockNumber = blockNumber;
        chrome.storage.local.set({ gasPrices: result.gasPrices });
      }
    });
  } catch (error) {
    console.error('Error fetching latest block number:', error);
  }
}

// Initial fetch
fetchGasPrice();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchGasPrice') {
    fetchGasPrice();
  }
});
