document.addEventListener('DOMContentLoaded', function() {
  var $root = document.documentElement;
  var toTravel = $root.scrollHeight - window.innerHeight;
  var $bsaShadow = document.getElementById('bsaShadow');
  var menuThrottle = null;

  if ($bsaShadow) {
    document.addEventListener('scroll', function(event) {
      clearTimeout(menuThrottle);
      throttle = setTimeout(setBsaShadows(), 100);
    });

    function setBsaShadows() {
      var scrollTop = window.scrollY;
      var distance = toTravel - scrollTop;
      var topFactor = 1 - (distance / toTravel);
      $bsaShadow.style.opacity = topFactor;
      $bsaShadow.style.transform = 'scaleY(' + topFactor + ')';
    }

    setBsaShadows();
  }
});
