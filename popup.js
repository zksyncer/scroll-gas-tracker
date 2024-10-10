document.addEventListener('DOMContentLoaded', function() {
    // Fetch and display the most recent price when the popup opens
    chrome.storage.local.get(['gasPrices'], function(result) {
        const gasPrices = result.gasPrices || [];
        if (gasPrices.length > 0) {
            const latestPrice = gasPrices[gasPrices.length - 1];
            document.getElementById('base-fee').textContent = latestPrice.price.toFixed(1);
            document.getElementById('recommended-fee').textContent = (latestPrice.price * 1.2).toFixed(1); // Recommended fee
        }
    });

    // Listen for storage changes in real-time and update the UI
    chrome.storage.onChanged.addListener(function(changes, area) {
        if (area === 'local' && changes.gasPrices) {
            const gasPrices = changes.gasPrices.newValue || [];
            if (gasPrices.length > 0) {
                const latestPrice = gasPrices[gasPrices.length - 1];
                document.getElementById('base-fee').textContent = latestPrice.price.toFixed(1);
                document.getElementById('recommended-fee').textContent = (latestPrice.price * 1.2).toFixed(1);
            }
        }
    });
});
