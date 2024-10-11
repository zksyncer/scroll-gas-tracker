const API_ENDPOINT = 'https://api.scrollscan.com/api';
const API_KEY = 'E493GGR9DINXQHJ2CG8BTUARJASZ8P3VM8';
const UPDATE_INTERVAL = 3000; // 3 seconds update interval

let lastUpdateTime = 0;

chrome.runtime.onInstalled.addListener(() => {
  fetchGasPrices();
  setInterval(fetchGasPrices, UPDATE_INTERVAL);
});

async function fetchGasPrices() {
  const now = Date.now();
  if (now - lastUpdateTime < UPDATE_INTERVAL) {
    return; // Prevent exceeding rate limit
  }
  lastUpdateTime = now;

  try {
    const response = await fetch(`${API_ENDPOINT}?module=proxy&action=eth_gasPrice&apikey=${API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Full API Response:', JSON.stringify(data, null, 2));

    if (!data.result) {
      throw new Error('API response missing result');
    }

    const gasPriceWei = parseInt(data.result, 16);
    if (isNaN(gasPriceWei)) {
      throw new Error(`Invalid gas price format: ${data.result}`);
    }

    const gasPriceGwei = gasPriceWei / 1e9; // Convert Wei to Gwei

    // Estimate prices for different speeds
    const gasPrices = {
      standard: gasPriceGwei,
      fast: Math.max(gasPriceGwei * 2, 0.11), // Ensure it's at least 0.11 Gwei
      rapid: Math.max(gasPriceGwei * 5, 0.61), // Ensure it's at least 0.61 Gwei
      baseFee: gasPriceGwei
    };

    await chrome.storage.local.set({ gasPrices });
    updateBadge(gasPrices.standard);

    console.log('Gas prices updated:', gasPrices);

    // Estimate gas for a sample transaction
    await estimateGas(gasPrices.standard);
  } catch (error) {
    console.error('Error fetching gas prices:', error);
    console.error('Error details:', error.message);
    
    // Attempt to retrieve last known good prices
    try {
      const { gasPrices: lastGoodPrices } = await chrome.storage.local.get('gasPrices');
      if (lastGoodPrices) {
        console.log('Using last known good prices:', lastGoodPrices);
        updateBadge(lastGoodPrices.standard);
        return;
      }
    } catch (storageError) {
      console.error('Error retrieving last known prices:', storageError);
    }

    // Fallback to a default gas price if no last known good prices
    const defaultGasPrice = 0.11; // 0.11 Gwei as a fallback
    const gasPrices = {
      standard: defaultGasPrice,
      fast: defaultGasPrice,
      rapid: defaultGasPrice * 5,
      baseFee: defaultGasPrice
    };
    await chrome.storage.local.set({ gasPrices });
    updateBadge(defaultGasPrice);
    chrome.action.setBadgeText({ text: 'ERR' });
    chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
  }
}

async function estimateGas(gasPrice) {
  try {
    const response = await fetch(`${API_ENDPOINT}?module=proxy&action=eth_estimateGas&to=0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df&value=0xff22&gasPrice=${Math.floor(gasPrice * 1e9).toString(16)}&apikey=${API_KEY}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Gas Estimate Response:', JSON.stringify(data, null, 2));

    if (data.result) {
      const estimatedGas = parseInt(data.result, 16);
      console.log('Estimated gas:', estimatedGas);
    }
  } catch (error) {
    console.error('Error estimating gas:', error);
  }
}

function updateBadge(price) {
  chrome.action.setBadgeText({ text: price.toFixed(2) });
  chrome.action.setBadgeBackgroundColor({ color: '#4688F1' });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchGasPrice') {
    fetchGasPrices().then(() => sendResponse({success: true})).catch(() => sendResponse({success: false}));
    return true; // Indicates we will send a response asynchronously
  }
});
