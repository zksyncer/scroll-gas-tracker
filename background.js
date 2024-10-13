const API_ENDPOINT = 'https://api.scrollscan.com/api';
const API_KEY = 'E493GGR9DINXQHJ2CG8BTUARJASZ8P3VM8';
const UPDATE_INTERVAL = 60000; // 60 seconds

async function fetchGasPrices() {
  try {
    const response = await fetch(`${API_ENDPOINT}?module=proxy&action=eth_gasPrice&apikey=${API_KEY}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.status !== '1' || !data.result) {
      throw new Error('Invalid API response');
    }
    
    const gasPriceWei = BigInt(data.result);
    const gasPriceGwei = Number(gasPriceWei) / 1e9;
    
    const gasPrices = {
      standard: gasPriceGwei,
      fast: gasPriceGwei * 1.1,
      rapid: gasPriceGwei * 1.2,
    };
    
    await chrome.storage.local.set({ gasPrices });
    updateBadge(gasPrices.standard);
    console.log('Gas prices updated:', gasPrices);
  } catch (error) {
    console.error('Error fetching gas prices:', error);
    handleError();
  }
}

function updateBadge(price) {
  const displayPrice = price < 100 ? price.toFixed(1) : Math.round(price);
  chrome.action.setBadgeText({ text: displayPrice.toString() });
  chrome.action.setBadgeBackgroundColor({ color: '#4688F1' });
}

function handleError() {
  chrome.action.setBadgeText({ text: 'ERR' });
  chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
}

chrome.runtime.onInstalled.addListener(() => {
  fetchGasPrices();
  setInterval(fetchGasPrices, UPDATE_INTERVAL);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchGasPrice') {
    fetchGasPrices().then(() => sendResponse({success: true})).catch(() => sendResponse({success: false}));
    return true;
  }
});
