document.addEventListener('DOMContentLoaded', function() {
  // Hashes
  var $hashes = document.querySelectorAll('.hash, .menu-list-ul li a');

  Array.prototype.forEach.call($hashes, function($el) {
    $el.addEventListener('click', function(event) {
      event.preventDefault();
      var $target = document.getElementById($el.dataset.propertyName);

      if ($target) {
        $target.scrollIntoView();
      }
    });
  });
});
