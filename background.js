chrome.runtime.onInstalled.addListener(() => {
  fetchGasPrices(); // Initial fetch on startup
  setInterval(fetchGasPrices, 60000); // Fetch every 60 seconds for real-time updates
});

async function fetchGasPrices() {
  try {
    // Using a CORS proxy
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const targetUrl = 'https://scrollscan.com/gastracker';

    const response = await fetch(proxyUrl + targetUrl);

    // Check if the response is ok (status in the range 200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const text = await response.text();

    // Extract gas prices using regex
    const standardPrice = extractPrice(text, "Standard");
    const fastPrice = extractPrice(text, "Fast");
    const rapidPrice = extractPrice(text, "Rapid");

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

// Function to extract price from the HTML text
function extractPrice(html, label) {
  const regex = new RegExp(`${label}\\s*<span.*?>(.*?)</span>`, 'i');
  const match = html.match(regex);
  return match ? parseFloat(match[1]) || 0 : 0; // Default to 0 if not found
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
