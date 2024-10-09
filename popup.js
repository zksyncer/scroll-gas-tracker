document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get(['gasPrices'], function(result) {
    const gasPrices = result.gasPrices || [];
    if (gasPrices.length > 0) {
      const currentPrice = gasPrices[gasPrices.length - 1].price;
      document.getElementById('currentPrice').textContent = 
        `Current: ${currentPrice.toFixed(2)} Gwei`;
    }
  });
});
