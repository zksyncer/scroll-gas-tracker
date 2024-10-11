document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get('gasPrices', function(data) {
    if (data.gasPrices) {
      document.getElementById('base-fee').textContent = data.gasPrices.standard.toFixed(4) + ' Gwei';
      document.getElementById('standard-price').textContent = data.gasPrices.standard.toFixed(4) + ' Gwei';
      document.getElementById('fast-price').textContent = data.gasPrices.fast.toFixed(4) + ' Gwei';
      document.getElementById('rapid-price').textContent = data.gasPrices.rapid.toFixed(4) + ' Gwei';
      document.getElementById('l2-fee').textContent = data.gasPrices.l2Fee.toFixed(4) + ' Gwei';
      document.getElementById('l1-fee').textContent = data.gasPrices.l1Fee.toFixed(4) + ' Gwei';
    }
  });

  chrome.runtime.sendMessage({action: 'fetchGasPrice'});
});
