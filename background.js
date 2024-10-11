// Add a listener to handle messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'fetchGasPrices') {
    // Retrieve gas prices from storage
    chrome.storage.local.get('gasPrices', (data) => {
      if (chrome.runtime.lastError || !data.gasPrices) {
        console.error('Failed to retrieve gas prices from storage:', chrome.runtime.lastError);
        sendResponse({ error: 'Failed to retrieve gas prices' });
      } else {
        console.log('Sending gas prices to popup:', data.gasPrices);
        // Send the gas prices back to the popup
        sendResponse({ gasPrices: data.gasPrices });
      }
    });
    return true; // Keeps the message channel open for async response
  }
});

// Example of how to store the gas prices periodically (replace with your actual fetch logic)
const fetchGasPricesFromAPI = async () => {
  try {
    const response = await fetch('https://api.scrollscan.com/api?module=proxy&action=eth_gasPrice&apikey=E493GGR9DINXQHJ2CG8BTUARJASZ8P3VM8');
    const data = await response.json();
    const gasPriceInWei = parseInt(data.result, 16); // Convert hex to decimal
    const gasPriceInGwei = gasPriceInWei / 1e9; // Convert Wei to Gwei
    const gasPrices = { standard: gasPriceInGwei }; // Store the gas price

    chrome.storage.local.set({ gasPrices }, () => {
      console.log('Gas prices saved:', gasPrices);
    });
  } catch (error) {
    console.error('Failed to fetch gas prices:', error);
  }
};

// Fetch gas prices initially and periodically
fetchGasPricesFromAPI();
setInterval(fetchGasPricesFromAPI, 60000); // Refresh every 60 seconds
