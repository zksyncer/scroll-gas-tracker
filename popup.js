document.addEventListener('DOMContentLoaded', function() {
  const baseFeeElement = document.getElementById('base-fee');
  const blockNumberElement = document.getElementById('block-number');
  const nextUpdateElement = document.getElementById('next-update');
  const standardPriceElement = document.getElementById('standard-price');
  const fastPriceElement = document.getElementById('fast-price');
  const rapidPriceElement = document.getElementById('rapid-price');
  const toggleThemeBtn = document.getElementById('toggleTheme');
  const settingsBtn = document.getElementById('settingsBtn');

  function updateUI(data) {
    baseFeeElement.textContent = data.baseFee.toFixed(4) + ' Gwei';
    blockNumberElement.textContent = data.blockNumber;
    document.getElementById('block-number-info').textContent = data.blockNumber;
    document.getElementById('base-fee-info').textContent = data.baseFee.toFixed(4) + ' Gwei';
    standardPriceElement.textContent = data.standard.toFixed(2) + ' Gwei';
    fastPriceElement.textContent = data.fast.toFixed(2) + ' Gwei';
    rapidPriceElement.textContent = data.rapid.toFixed(2) + ' Gwei';
    
    const lastUpdated = new Date();
    document.getElementById('last-updated').textContent = lastUpdated.toLocaleTimeString();
    
    const nextUpdate = new Date(data.nextUpdate);
    nextUpdateElement.textContent = nextUpdate.toLocaleTimeString();
  }

  function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    chrome.storage.local.set({darkMode: document.body.classList.contains('dark-mode')});
  }

  toggleThemeBtn.addEventListener('click', toggleTheme);
  settingsBtn.addEventListener('click', () => {
    chrome.tabs.create({url: 'info.html'});
  });

  chrome.storage.local.get(['gasPrices', 'darkMode'], function(result) {
    if (result.gasPrices) {
      updateUI(result.gasPrices);
    }
    if (result.darkMode) {
      document.body.classList.add('dark-mode');
    }
  });

  chrome.storage.onChanged.addListener(function(changes, area) {
    if (area === 'local' && changes.gasPrices) {
      updateUI(changes.gasPrices.newValue);
    }
  });

  // Request an update when the popup is opened
  chrome.runtime.sendMessage({action: 'fetchGasPrice'});
});
