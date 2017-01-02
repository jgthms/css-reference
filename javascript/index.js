document.addEventListener('DOMContentLoaded', function() {
  // Logo
  var $logo = document.getElementById('logo');

  $logo.addEventListener('click', function(event) {
    event.preventDefault();
    history.replaceState('', document.title, ' ');
    window.scrollTo(0,0);
  });
});
