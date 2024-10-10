document.addEventListener('DOMContentLoaded', function() {
  const baseFeeElement = document.getElementById('base-fee');
  const blockNumberElement = document.getElementById('block-number');
  const nextUpdateElement = document.getElementById('next-update');
  const lowPriceElement = document.getElementById('low-price');
  const avgPriceElement = document.getElementById('avg-price');
  const highPriceElement = document.getElementById('high-price');
  const toggleThemeBtn = document.getElementById('toggleTheme');
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsPanel = document.getElementById('settings');
  const closeSettingsBtn = document.getElementById('closeSettings');
  const alertsEnabledCheckbox = document.getElementById('alertsEnabled');
  const alertSettings = document.getElementById('alertSettings');
  const alertThreshold = document.getElementById('alertThreshold');
  const alertCondition = document.getElementById('alertCondition');

  function updateUI(data) {
    baseFeeElement.textContent = data.baseFee.toFixed(4);
    blockNumberElement.textContent = data.blockNumber;
    lowPriceElement.textContent = data.lowPrice.toFixed(4);
    avgPriceElement.textContent = data.avgPrice.toFixed(4);
    highPriceElement.textContent = data.highPrice.toFixed(4);
    
    const nextUpdate = new Date(data.nextUpdate);
    nextUpdateElement.textContent = nextUpdate.toLocaleTimeString();
  }

  function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    chrome.storage.local.set({darkMode: document.body.classList.contains('dark-mode')});
  }

  function toggleSettings() {
    settingsPanel.classList.toggle('hidden');
  }

  function saveSettings() {
    const settings = {
      alertsEnabled: alertsEnabledCheckbox.checked,
      alertThreshold: parseFloat(alertThreshold.value),
      alertCondition: alertCondition.value
    };
    chrome.storage.local.set({settings: settings});
  }

  toggleThemeBtn.addEventListener('click', toggleTheme);
  settingsBtn.addEventListener('click', toggleSettings);
  closeSettingsBtn.addEventListener('click', toggleSettings);
  alertsEnabledCheckbox.addEventListener('change', function() {
    alertSettings.classList.toggle('hidden', !this.checked);
    saveSettings();
  });
  alertThreshold.addEventListener('change', saveSettings);
  alertCondition.addEventListener('change', saveSettings);

  chrome.storage.local.get(['gasPrices', 'darkMode', 'settings'], function(result) {
    if (result.gasPrices) {
      updateUI(result.gasPrices);
    }
    if (result.darkMode) {
      document.body.classList.add('dark-mode');
    }
    if (result.settings) {
      alertsEnabledCheckbox.checked = result.settings.alertsEnabled;
      alertThreshold.value = result.settings.alertThreshold;
      alertCondition.value = result.settings.alertCondition;
      alertSettings.classList.toggle('hidden', !result.settings.alertsEnabled);
    }
  });

  chrome.storage.onChanged.addListener(function(changes, area) {
    if (area === 'local' && changes.gasPrices) {
      updateUI(changes.gasPrices.newValue);
    }
  });
});
