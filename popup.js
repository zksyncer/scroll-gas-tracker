document.addEventListener('DOMContentLoaded', function() {
  const baseFeeElement = document.getElementById('base-fee');
  const learnMoreLink = document.getElementById('learn-more');
  const infoPage = document.getElementById('info-page');
  const backButton = document.getElementById('back-button');

  function updateUI(baseFee) {
    baseFeeElement.textContent = baseFee.toFixed(2);
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

  learnMoreLink.addEventListener('click', function(e) {
    e.preventDefault();
    fetch('info.html')
      .then(response => response.text())
      .then(html => {
        infoPage.querySelector('div').innerHTML = html;
        infoPage.classList.remove('hidden');
      });
  });

  backButton.addEventListener('click', function() {
    infoPage.classList.add('hidden');
  });
});
