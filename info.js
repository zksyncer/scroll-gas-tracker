document.addEventListener('DOMContentLoaded', function() {
  const closeButton = document.getElementById('close-button');

  if (closeButton) {
    closeButton.addEventListener('click', function() {
      // Optional fade-out effect before closing
      document.body.style.opacity = '0';
      setTimeout(() => {
        window.close();
      }, 300); // Adjust time for the fade-out duration
    });
  } else {
    console.error('Close button not found.');
  }
});
