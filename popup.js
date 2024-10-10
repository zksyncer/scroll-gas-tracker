document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get(['gasPrices'], function(result) {
        const gasPrices = result.gasPrices || [];
        if (gasPrices.length > 0) {
            const latestPrice = gasPrices[gasPrices.length - 1];
            document.getElementById('base-fee').textContent = latestPrice.price.toFixed(1);
            document.getElementById('recommended-fee').textContent = (latestPrice.price * 1.2).toFixed(1); // Example for recommended fee
        }
    });
});
