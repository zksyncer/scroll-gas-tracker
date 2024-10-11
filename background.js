importScripts('ethers.min.js');
const API_ENDPOINT = 'https://api.scrollscan.com/api';
const API_KEY = 'E493GGR9DINXQHJ2CG8BTUARJASZ8P3VM8';
const RPC_URL = 'https://rpc.scroll.io/';
const L1_GAS_PRICE_ORACLE = '0x5300000000000000000000000000000000000002';
const UPDATE_INTERVAL = 15000; // 15 seconds

let provider;
let l1GasPriceOracle;

async function initializeEthers() {
  provider = new ethers.JsonRpcProvider(RPC_URL);
  l1GasPriceOracle = new ethers.Contract(
    L1_GAS_PRICE_ORACLE,
    ['function getL1Fee(bytes memory _data) public view returns (uint256)'],
    provider
  );
}

async function fetchGasPrices() {
  try {
    if (!provider || !l1GasPriceOracle) {
      await initializeEthers();
    }

    // Fetch base gas price from your API
    const response = await fetch(`${API_ENDPOINT}?module=proxy&action=eth_gasPrice&apikey=${API_KEY}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    const l2GasPriceWei = parseInt(data.result, 16);
    const l2GasPriceGwei = l2GasPriceWei / 1e9;

    // Get L1 fee estimation
    const sampleTxData = '0x1234567890abcdef';
    const l1Fee = await l1GasPriceOracle.getL1Fee(sampleTxData);
    const l1FeeGwei = parseFloat(ethers.formatUnits(l1Fee, 'gwei'));

    const totalFeeGwei = l2GasPriceGwei + l1FeeGwei;

    const gasPrices = {
      standard: totalFeeGwei,
      fast: totalFeeGwei * 1.1,
      rapid: totalFeeGwei * 1.2,
      l2Fee: l2GasPriceGwei,
      l1Fee: l1FeeGwei,
      baseFee: l2GasPriceGwei
    };

    await chrome.storage.local.set({ gasPrices });
    updateBadge(gasPrices.standard);

    console.log('Gas prices updated:', gasPrices);
  } catch (error) {
    console.error('Error fetching gas prices:', error);
    handleError();
  }
}

function updateBadge(price) {
  chrome.action.setBadgeText({ text: price.toFixed(2) });
  chrome.action.setBadgeBackgroundColor({ color: '#4688F1' });
}

function handleError() {
  chrome.storage.local.get('gasPrices', (result) => {
    if (result.gasPrices) {
      console.log('Using last known good prices:', result.gasPrices);
      updateBadge(result.gasPrices.standard);
    } else {
      const defaultGasPrice = 0.1;
      chrome.action.setBadgeText({ text: 'ERR' });
      chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
    }
  });
}

chrome.runtime.onInstalled.addListener(() => {
  fetchGasPrices();
  setInterval(fetchGasPrices, UPDATE_INTERVAL);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchGasPrice') {
    fetchGasPrices().then(() => sendResponse({success: true})).catch(() => sendResponse({success: false}));
    return true;
  }
});
