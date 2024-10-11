const API_ENDPOINT = 'https://api.scrollscan.com/api';
const API_KEY = 'E493GGR9DINXQHJ2CG8BTUARJASZ8P3VM8';

chrome.runtime.onInstalled.addListener(() => {
  fetchGasPrices(); // Initial fetch on startup
  chrome.alarms.create('updateGasPrices', { periodInMinutes: 0.25 }); // Every 15 seconds
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'updateGasPrices') {
    fetchGasPrices();
  }
});

async function fetchGasPrices() {
  try {
    const response = await fetch(`${API_ENDPOINT}?module=proxy&action=eth_gasPrice&apikey=${API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== '1' && data.message !== 'OK') {
      throw new Error('API returned an error');
    }

    const gasPriceWei = parseInt(data.result, 16);
    const gasPriceGwei = gasPriceWei / 1e9;

    const gasPrices = {
      standard: gasPriceGwei,
      fast: gasPriceGwei * 1.1,
      rapid: gasPriceGwei * 1.2,
      baseFee: gasPriceGwei
    };

    await chrome.storage.local.set({ gasPrices });
    updateBadge(gasPrices.baseFee);

    console.log('Gas prices updated:', gasPrices);
  } catch (error) {
    console.error('Error fetching gas prices:', error);
    chrome.action.setBadgeText({ text: 'ERR' });
    chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
  }
}

function updateBadge(price) {
  chrome.action.setBadgeText({ text: price.toFixed(0) });
  chrome.action.setBadgeBackgroundColor({ color: '#4688F1' });
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'fetchGasPrice') {
    fetchGasPrices();
  }
});
