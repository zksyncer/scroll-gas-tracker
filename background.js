const SCROLL_RPC_URL = 'https://alpha-rpc.scroll.io/l2';

async function fetchGasPrice() {
  try {
    const response = await fetch(SCROLL_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_gasPrice',
        params: [],
        id: 1
      }),
    });
    const data = await response.json();
    const gasPrice = parseInt(data.result, 16) / 1e9;
    chrome.storage.local.set({ gasPrice });
  } catch (error) {
    console.error('Error fetching gas price:', error);
  }
}

chrome.alarms.create('fetchGasPrice', { periodInMinutes: 5 });
chrome.alarms.onAlarm.addListener(fetchGasPrice);
fetchGasPrice();

chrome.alarms.create('fetchGasPrice', { periodInMinutes: 5 });
chrome.alarms.onAlarm.addListener(fetchGasPrice);
fetchGasPrice();
