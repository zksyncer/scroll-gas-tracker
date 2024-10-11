async function fetchGasPrices() {
  try {
    const response = await fetch('http://localhost:3000/gasprices');
    const text = await response.text();

    // Extract gas prices using regex
    const standardPrice = extractPrice(text, "Standard");
    const fastPrice = extractPrice(text, "Fast");
    const rapidPrice = extractPrice(text, "Rapid");

    // Update your storage or UI with the gas prices
    const gasPrices = {
      standard: standardPrice,
      fast: fastPrice,
      rapid: rapidPrice,
      baseFee: standardPrice // Use standard price as base fee
    };

    // Save the prices to local storage
    await chrome.storage.local.set({ gasPrices });
    updateBadge(gasPrices.baseFee); // Update the badge with the base fee

    console.log('Gas prices updated:', gasPrices);
  } catch (error) {
    console.error('Error fetching gas prices:', error);
    chrome.action.setBadgeText({ text: 'ERR' });
    chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
  }
}
