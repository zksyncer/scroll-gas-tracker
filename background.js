chrome.runtime.onInstalled.addListener(() => {
  fetchGasPrices(); // Initial fetch on startup
  setInterval(fetchGasPrices, 60000); // Fetch every 60 seconds for real-time updates
});

async function fetchGasPrices() {
  try {
    const response = await fetch('https://scrollscan.com/gastracker');
    const text = await response.text();

    // Parse the response text to extract the gas prices
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    // Extract gas prices; adjust these selectors as necessary
    const standardPrice = parseFloat(doc.querySelector('h3:contains("Standard") + span').textContent);
    const fastPrice = parseFloat(doc.querySelector('h3:contains("Fast") + span').textContent);
    const rapidPrice = parseFloat(doc.querySelector('h3:contains("Rapid") + span').textContent);

    // Update your storage or UI with the gas prices
    const gasPrices = {
      standard: standardPrice,
      fast: fastPrice,
      rapid: rapidPrice,
      baseFee: standardPrice // Use standard price as base fee
    };

    // Save the prices to local storage
    await chrome.storage.local.set({ gasPrices });
    updateBadge(gasPrices.baseFee); // Update the badge with the base fee

    console.log('Gas prices updated:', gasPrices);
  } catch (error) {
    console.error('Error fetching gas prices:', error);
    chrome.action.setBadgeText({ text: 'ERR' });
    chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
  }
}

function updateBadge(price) {
  chrome.action.setBadgeText({ text: price.toFixed(2) });
  chrome.action.setBadgeBackgroundColor({ color: '#4688F1' });
}

// Request an update when the popup is opened
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'fetchGasPrice') {
    fetchGasPrices();
  }
});
