document.addEventListener('DOMContentLoaded', function() {
  const closeButton = document.getElementById('close-button');

  closeButton.addEventListener('click', function() {
    window.close();
  });
});
