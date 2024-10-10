chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('fetchGasPrice', { periodInMinutes: 1/6 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'fetchGasPrice') {
    fetchGasPrice();
  }
});

function updateIconBadge(price) {
  const badgeText = price.toFixed(4);  // Display the price with 4 decimals on the badge
  chrome.action.setBadgeText({ text: badgeText });
  chrome.action.setBadgeBackgroundColor({ color: '#000000' });
  chrome.action.setBadgeTextColor({ color: '#FFFFFF' });
  
  // Set a smaller font size for the badge text
  chrome.action.setTitle({ title: `Scroll Gas Price: ${badgeText} Gwei` });

  // Create a canvas to draw the badge text with a smaller font
  const canvas = new OffscreenCanvas(19, 19);
  const ctx = canvas.getContext('2d');
  ctx.font = '10.2px Arial';  // Adjust this value to make the font smaller
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText, 9.5, 9.5);

  // Convert the canvas to an ImageData object
  const imageData = ctx.getImageData(0, 0, 19, 19);

  // Set the badge icon with the custom-drawn text
  chrome.action.setIcon({ imageData: imageData });
}

// ... rest of the fetchGasPrice function remains the same
