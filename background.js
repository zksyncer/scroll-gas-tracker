const API_ENDPOINT = 'https://api.scrollscan.com/api';
const API_KEY = 'E493GGR9DINXQHJ2CG8BTUARJASZ8P3VM8';
const UPDATE_INTERVAL = 3000; // Update every 3 seconds

chrome.runtime.onInstalled.addListener(() => {
  fetchGasPrices();
  setInterval(fetchGasPrices, UPDATE_INTERVAL);
});

async function fetchGasPrices() {
  try {
    const response = await fetch(`${API_ENDPOINT}?module=proxy&action=eth_gasPrice&apikey=${API_KEY}`);
    const data = await response.json();
    
    const gasPriceWei = parseInt(data.result, 16);
    const gasPriceGwei = gasPriceWei / 1e9;

    // Store the gas prices in local storage
    const gasPrices = {
      baseFee: gasPriceGwei,
      standard: gasPriceGwei,
      fast: Math.max(gasPriceGwei * 1.25, 0.11), // Ensure minimum for fast
      rapid: Math.max(gasPriceGwei * 1.5, 0.61), // Ensure minimum for rapid
    };

    // Simulate block number (for demo, replace with real logic if needed)
    const blockNumber = Math.floor(Math.random() * 10000000);

    await chrome.storage.local.set({ gasPrices, blockNumber });
    console.log('Gas prices and block number saved:', gasPrices, blockNumber);
  } catch (error) {
    console.error('Error fetching gas prices:', error);
  }
}

// Message listener for popup script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'fetchGasPrices') {
    chrome.storage.local.get(['gasPrices', 'blockNumber'], (data) => {
      if (chrome.runtime.lastError || !data.gasPrices) {
        console.error('Failed to retrieve gas prices from storage:', chrome.runtime.lastError);
        sendResponse({ error: 'Failed to retrieve gas prices' });
      } else {
        sendResponse({ gasPrices: data.gasPrices, blockNumber: data.blockNumber });
      }
    });
    return true; // Keeps the message channel open for async response
  }
});
