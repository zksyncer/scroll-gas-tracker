const SCROLL_RPC_URL = 'https://rpc.scroll.io'; // updated RPC URL

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
    const gasPrice = parseInt(data.result, 16);  // Convert hex to decimal
    const gasPriceGwei = (gasPrice / 1e9).toFixed(2);  // Convert wei to gwei, limit to 2 decimal places
    
    // Store the gas price in local storage
    const timestamp = new Date().toISOString();
    const priceData = { timestamp, price: gasPriceGwei };
    
    chrome.storage.local.get(['gasPrices'], function(result) {
      let gasPrices = result.gasPrices || [];
      gasPrices.push(priceData);
      if (gasPrices.length > 24) {
        gasPrices = gasPrices.slice(-24);
      }
      chrome.storage.local.set({ gasPrices });
    });

    // Update the badge text on the extension icon
    chrome.action.setBadgeText({ text: gasPriceGwei });
    chrome.action.setBadgeBackgroundColor({ color: '#0000FF' });  // Optional: Set badge color

  } catch (error) {
    console.error('Error fetching gas price:', error);
  }
}

// Create an alarm to fetch gas price every 5 minutes
chrome.alarms.create('fetchGasPrice', { periodInMinutes: 5 });

// Set up the listener to call fetchGasPrice whenever the alarm triggers
chrome.alarms.onAlarm.addListener(fetchGasPrice);

// Fetch gas price immediately when the extension is loaded
fetchGasPrice();
