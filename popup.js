document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get(['gasPrices'], function(result) {
    const gasPrices = result.gasPrices || [];
    const priceList = document.getElementById('price-list');

    // Clear the list
    priceList.innerHTML = '';

    // Add each gas price entry to the list
    gasPrices.forEach(priceData => {
      const listItem = document.createElement('li');
      listItem.textContent = `${priceData.timestamp}: ${priceData.price} Gwei`;
      priceList.appendChild(listItem);
    });
  });
});
