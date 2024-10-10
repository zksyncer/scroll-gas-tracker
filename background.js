function updateIconBadge(price) {
    chrome.action.setBadgeText({
        text: price.toFixed(3)  // Display the price with 3 decimals on the badge
    });
    chrome.action.setBadgeBackgroundColor({ color: '#000000' });  // Black background with white text
}

// Continuously fetch gas price every 10 seconds
function fetchGasPrice() {
    fetch('https://rpc.scroll.io')  // Use the correct Scroll RPC URL
        .then(response => response.json())
        .then(data => {
            const baseFee = parseFloat(data.result); // Assuming this contains the base fee
            chrome.storage.local.set({ gasPrices: [{ price: baseFee }] });

            // Update the badge with 3 decimal places
            updateIconBadge(baseFee);
        })
        .catch(error => console.error('Error fetching gas price:', error));
}

// Set an interval to fetch gas price every 10 seconds
setInterval(fetchGasPrice, 10000);
