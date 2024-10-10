document.addEventListener('DOMContentLoaded', function() {
    // Function to update the background color based on the gas price
    function updateBackgroundColor(gasPrice) {
        const baseBox = document.getElementById('base-box');
        if (gasPrice < 10) {
            baseBox.style.backgroundColor = '#ff69b4';  // Pink for lower gas prices
        } else if (gasPrice >= 10 && gasPrice < 20) {
            baseBox.style.backgroundColor = '#ffa500';  // Orange for medium gas prices
        } else {
            baseBox.style.backgroundColor = '#ff4500';  // Red for higher gas prices
        }
    }

    // Fetch and display the most recent price when the popup opens
    chrome.storage.local.get(['gasPrices'], function(result) {
        const gasPrices = result.gasPrices || [];
        if (gasPrices.length > 0) {
            const latestPrice = gasPrices[gasPrices.length - 1];
            // Show gas price to 6 decimal places inside the popup
            document.getElementById('base-fee').textContent = latestPrice.price.toFixed(6);  // 6 decimal places
            document.getElementById('recommended-fee').textContent = (latestPrice.price * 1.2).toFixed(6);  // Recommended fee with 6 decimals
            updateBackgroundColor(latestPrice.price);  // Dynamically update background color
        }
    });

    // Listen for storage changes in real-time and update the UI
    chrome.storage.onChanged.addListener(function(changes, area) {
        if (area === 'local' && changes.gasPrices) {
            const gasPrices = changes.gasPrices.newValue || [];
            if (gasPrices.length > 0) {
                const latestPrice = gasPrices[gasPrices.length - 1];
                document.getElementById('base-fee').textContent = latestPrice.price.toFixed(6);
                document.getElementById('recommended-fee').textContent = (latestPrice.price * 1.2).toFixed(6);
                updateBackgroundColor(latestPrice.price);
            }
        }
    });
});
