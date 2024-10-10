document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get(['gasPrices'], function(result) {
    const gasPrices = result.gasPrices || [];
    const gasPriceDisplay = document.getElementById('gasPriceDisplay');
    
    if (gasPrices.length === 0) {
      gasPriceDisplay.textContent = 'No gas price data available.';
    } else {
      const latestPrice = gasPrices[gasPrices.length - 1];
      gasPriceDisplay.textContent = `Latest Gas Price: ${latestPrice.price} Gwei\nFetched at: ${new Date(latestPrice.timestamp).toLocaleTimeString()}`;
    }
  });
});
