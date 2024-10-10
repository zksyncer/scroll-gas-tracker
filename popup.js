document.addEventListener('DOMContentLoaded', function() {
  function updateUI(baseFee) {
    document.getElementById('base-fee').textContent = baseFee.toFixed(2);
    const recommendedFee = baseFee * 1.2;
    document.getElementById('recommended-fee').textContent = recommendedFee.toFixed(2);
  }

  // Fetch and display the most recent price when the popup opens
  chrome.storage.local.get(['gasPrices'], function(result) {
    const gasPrices = result.gasPrices || [];
    if (gasPrices.length > 0) {
      updateUI(gasPrices[gasPrices.length - 1].price);
    }
  });

  // Listen for storage changes in real-time and update the UI
  chrome.storage.onChanged.addListener(function(changes, area) {
    if (area === 'local' && changes.gasPrices) {
      const gasPrices = changes.gasPrices.newValue || [];
      if (gasPrices.length > 0) {
        updateUI(gasPrices[gasPrices.length - 1].price);
      }
    }
  });
});
