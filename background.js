chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('fetchGasPrice', { periodInMinutes: 1/60 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'fetchGasPrice') {
    fetchGasPrice();
  }
});

function updateBadge(price) {
  chrome.action.setBadgeText({text: price.toFixed(0)});
  chrome.action.setBadgeBackgroundColor({color: '#4688F1'});
}

function checkAlerts(price) {
  chrome.storage.local.get('settings', function(result) {
    if (result.settings && result.settings.alertsEnabled) {
      const threshold = result.settings.alertThreshold;
      const condition = result.settings.alertCondition;
      
      if ((condition === 'above' && price > threshold) || (condition === 'below' && price < threshold)) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icon128.png',
          title: 'Gas Price Alert',
          message: `Gas price is ${price.toFixed(2)} Gwei (${condition} ${threshold} Gwei)`
        });
      }
    }
  });
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
      
      const lowPrice = baseFeeGwei * 0.9;
      const highPrice = baseFeeGwei * 1.1;
      
      const gasPrices = {
        baseFee: baseFeeGwei,
        lowPrice: lowPrice,
        avgPrice: baseFeeGwei,
        highPrice: highPrice,
        blockNumber: 'Latest', // You might want to fetch the actual block number
        nextUpdate: Date.now() + 60000 // 1 minute from now
      };
      
      chrome.storage.local.set({ gasPrices: gasPrices });
      updateBadge(baseFeeGwei);
      checkAlerts(baseFeeGwei);
    })
    .catch(error => {
      console.error('Error fetching gas price:', error);
      chrome.action.setBadgeText({text: 'ERR'});
      chrome.action.setBadgeBackgroundColor({color: '#FF0000'});
    });
}

// Initial fetch
fetchGasPrice();
