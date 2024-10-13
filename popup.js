function updatePopup() {
  chrome.storage.local.get('gasPrices', (result) => {
    if (result.gasPrices) {
      document.getElementById('standard').textContent = result.gasPrices.standard.toFixed(2);
      document.getElementById('fast').textContent = result.gasPrices.fast.toFixed(2);
      document.getElementById('rapid').textContent = result.gasPrices.rapid.toFixed(2);
      document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString();
    } else {
      document.getElementById('standard').textContent = 'N/A';
      document.getElementById('fast').textContent = 'N/A';
      document.getElementById('rapid').textContent = 'N/A';
      document.getElementById('lastUpdated').textContent = 'Never';
    }
  });
}

document.addEventListener('DOMContentLoaded', updatePopup);
chrome.storage.onChanged.addListener(updatePopup);
