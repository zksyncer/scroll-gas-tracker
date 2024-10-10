const SCROLL_RPC_URL = 'https://rpc.scroll.io';

async function fetchGasPrices() {
  try {
    const response = await fetch(SCROLL_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_gasPrice',
        params: [],
        id: 1
      }),
    });

    const data = await response.json();
    const gasPrice = parseInt(data.result, 16) / 1e9;  // Convert from wei to gwei
    const recommendedGasPrice = gasPrice * 2;  // Example calculation for recommended fee

    // Update the popup with dynamic gas prices
    document.getElementById('baseFee').textContent = gasPrice.toFixed(1);
    document.getElementById('recommendedFee').textContent = recommendedGasPrice.toFixed(1);
  } catch (error) {
    console.error('Error fetching gas price:', error);
  }
}

// Fetch the gas prices when the popup is opened
fetchGasPrices();
