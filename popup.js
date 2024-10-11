// Request updated gas prices when the popup is opened
chrome.runtime.sendMessage({ action: 'fetchGasPrices' }, (response) => {
  if (chrome.runtime.lastError) {
    console.error('Error sending fetchGasPrice message:', chrome.runtime.lastError);
  } else if (response && response.gasPrices) {
    console.log('Gas prices received in popup:', response.gasPrices);

    // Update the gas prices in the popup
    document.getElementById('base-fee').textContent = `${response.gasPrices.baseFee.toFixed(4)} Gwei`;
    document.getElementById('standard-price').textContent = `${response.gasPrices.standard.toFixed(2)} Gwei`;
    document.getElementById('fast-price').textContent = `${response.gasPrices.fast.toFixed(2)} Gwei`;
    document.getElementById('rapid-price').textContent = `${response.gasPrices.rapid.toFixed(2)} Gwei`;

    // Additional info (e.g., block number and last updated time) can be handled here
    document.getElementById('block-number').textContent = response.blockNumber || '-';
    document.getElementById('block-number-info').textContent = response.blockNumber || '-';
    document.getElementById('base-fee-info').textContent = `${response.gasPrices.baseFee.toFixed(4)} Gwei`;
    document.getElementById('last-updated').textContent = new Date().toLocaleTimeString();
  } else {
    console.error('No gasPrices in response', response);
    document.getElementById('base-fee').textContent = 'Error';
  }
});
