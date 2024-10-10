function updateGasPrice() {
  chrome.storage.local.get(['gasPrice'], function(result) {
    const gasPrice = result.gasPrice;
    if (gasPrice) {
      document.getElementById('gasPrice').textContent = `${gasPrice.toFixed(2)} Gwei`;
    } else {
      document.getElementById('gasPrice').textContent = 'Not available';
    }
  });
}

updateGasPrice();
setInterval(updateGasPrice, 5000);
