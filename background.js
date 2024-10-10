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
    const response = await fetch('https://scrollscan.com/api/gastracker');
    const data = await response.json();
    
    const gasPrices = {
      baseFee: parseFloat(data.BaseFee),
      standard: parseFloat(data.SafeGasPrice),
      fast: parseFloat(data.ProposeGasPrice),
      rapid: parseFloat(data.FastGasPrice),
      blockNumber: data.LastBlock,
      pendingTxs: data.PendingTxs,
      avgBlockSize: data.AvgBlockSize,
      utilization: data.Utilization,
      nextUpdate: Date.now() + 60000 // 1 minute from now
    };

    chrome.storage.local.set({ gasPrices: gasPrices });
    updateBadge(gasPrices.baseFee);
  } catch (error) {
    console.error('Error fetching gas price:', error);
    chrome.action.setBadgeText({text: 'ERR'});
    chrome.action.setBadgeBackgroundColor({color: '#FF0000'});
  }
}

// Initial fetch
fetchGasPrice();
