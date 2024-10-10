document.addEventListener('DOMContentLoaded', function() {
  const baseFeeElement = document.getElementById('base-fee');
  const learnMoreLink = document.getElementById('learn-more');

  function updateUI(baseFee) {
    baseFeeElement.textContent = baseFee.toFixed(4);
  }

  chrome.storage.local.get(['gasPrices'], function(result) {
    const gasPrices = result.gasPrices || [];
    if (gasPrices.length > 0) {
      updateUI(gasPrices[gasPrices.length - 1].price);
    }
  });

  chrome.storage.onChanged.addListener(function(changes, area) {
    if (area === 'local' && changes.gasPrices) {
      const gasPrices = changes.gasPrices.newValue || [];
      if (gasPrices.length > 0) {
        updateUI(gasPrices[gasPrices.length - 1].price);
      }
    }
  });

  learnMoreLink.addEventListener('click', function(e) {
    e.preventDefault();
    chrome.tabs.create({url: 'info.html'});
  });
});
