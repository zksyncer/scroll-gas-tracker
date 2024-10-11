// Request an update when the popup is opened
chrome.runtime.sendMessage({ action: 'fetchGasPrices' }, (response) => {
  if (chrome.runtime.lastError) {
    console.error('Error sending fetchGasPrice message:', chrome.runtime.lastError);
  } else if (response && response.gasPrices) {
    console.log('Gas prices received in popup:', response.gasPrices);
    // Display the gas prices in the popup
    document.getElementById('gasPriceDisplay').textContent = `Standard: ${response.gasPrices.standard.toFixed(2)} Gwei`;
  } else {
    console.error('No gasPrices in response', response);
    document.getElementById('gasPriceDisplay').textContent = 'Error retrieving gas prices.';
  }
});
