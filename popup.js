document.addEventListener('DOMContentLoaded', function() {
  const gasPriceElement = document.getElementById('gas-price');
  const learnMoreLink = document.getElementById('learn-more');
  const iconElement = document.getElementById('icon');

  function updateUI(gasPrice) {
    if (gasPrice) {
      gasPriceElement.textContent = gasPrice.toFixed(4);
    } else {
      gasPriceElement.textContent = 'Error loading price';
    }
  }

  // Check if the icon loaded correctly
  iconElement.onerror = function() {
    console.error('Failed to load icon');
    this.style.display = 'none';
  };

  // Fetch and display the most recent price when the popup opens
  chrome.storage.local.get(['gasPrices'], function(result) {
    console.log('Storage data:', result);
    const gasPrices = result.gasPrices || [];
    if (gasPrices.length > 0) {
      updateUI(gasPrices[gasPrices.length - 1].price);
    } else {
      console.error('No gas prices found in storage');
      gasPriceElement.textContent = 'No data available';
    }
  });

  // Add click event listener for the "Learn more" link
  learnMoreLink.addEventListener('click', function(e) {
    e.preventDefault();
    console.log('Learn more link clicked');
    // Your code to show more information
  });

  // Force a new fetch of gas price
  chrome.runtime.sendMessage({action: "fetchGasPrice"}, function(response) {
    console.log('Fetch gas price response:', response);
  });
});
