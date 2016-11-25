document.body.classList.add('has-js');
document.addEventListener('DOMContentLoaded', function() {

  // dynamically show examples
  var $exampleOutputs = [].slice.call(document.querySelectorAll('.example-output'));
  var $exampleBrowsers = [].slice.call(document.querySelectorAll('.example-browser'));
  var $exampleWrappers = [].slice.call(document.querySelectorAll('.example'));

  var propPositions = $exampleBrowsers.map(function($exampleBrowser, ix) {
    var offsetProps = getOffset($exampleBrowser);
    var $wrapper = $exampleWrappers[ix];
    return {
      displayed: false,
      $exampleBrowser: $exampleBrowser,
      $exampleOutput: $exampleOutputs[ix],
      offsetTop: offsetProps.top,
      $wrapper: $wrapper,
      originalWrapperHeight: getHeight($wrapper)
    };
  });

  startWatching();

  // Logo
  var $logo = document.getElementById('logo');

  $logo.addEventListener('click', function(event) {
    event.preventDefault();
    history.replaceState('', document.title, ' ');
    window.scrollTo(0,0);
  });

  // Hashes
  var $hashes = document.querySelectorAll('.hash, .menu-list-ul li a');

  Array.prototype.forEach.call($hashes, function($el) {
    $el.addEventListener('click', function(event) {
      event.preventDefault();
      var propertyName = $el.dataset.propertyName;
      var $target = document.getElementById($el.dataset.propertyName);
      history.replaceState('', document.title, '#' + propertyName);

      if ($target) {
        $target.scrollIntoView();
      }
    });
  });

  // Helpers

  function startWatching() {
    var doc = document.documentElement;
    var prevTop = 0;
    var prevWindowHeight = 0;
    var scrollMargin = 200;
    window.requestAnimationFrame(function loop() {
      var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
      var windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      // if we've scrolled, clicked on an anchor, or made the window bigger
      if (top !== prevTop || windowHeight > prevWindowHeight) {
        prevWindowHeight = windowHeight;
        prevTop = top;
        var aboveTheWindow = top - scrollMargin;
        var belowTheWindow = top + windowHeight + scrollMargin;
        showExamples(propPositions, aboveTheWindow, belowTheWindow);
      }
      setTimeout(window.requestAnimationFrame.bind(window, loop), 100);
    });
  }

  function showExamples(propPositions, aboveTheWindow, belowTheWindow) {
    var i = 0;
    while (++i < propPositions.length) {
      // if we've already show this example, or we're before the viewing window
      if (
        propPositions[i].displayed ||
        propPositions[i].offsetTop < aboveTheWindow
      ) {
        continue;
      }
      // PERF: because the elements are effectively sorted by offsetTop ASC
      // we know that once we are higher than the bottom range
      // we no longer need to check the remainder
      if (propPositions[i].offsetTop > belowTheWindow) {
        return;
      }
      // we now know we're in the loading window
      propPositions[i].displayed = true;
      propPositions[i].$exampleOutput.style.display = 'block';
      var newWrapperHeight = getHeight(propPositions[i].$wrapper);
      addHeightToRest(propPositions, newWrapperHeight - propPositions[i].originalWrapperHeight, i);
    }
  }

  function addHeightToRest(positions, height, ix) {
    for (var i = ix + 1; i < positions.length; i++) {
      positions[i].offsetTop += height;
    }
  }

  function isWindow(obj) {
    return obj != null && obj === obj.window;
  }

  function getWindow($element) {
    return isWindow($element) ? $element : $element.nodeType === 9 && $element.defaultView;
  }

  function getOffset($element) {
    var win;
    var box = { top: 0, left: 0 };
    var doc = $element && $element.ownerDocument;
    var docElem = doc.documentElement;

    if (typeof $element.getBoundingClientRect !== typeof undefined) {
      box = $element.getBoundingClientRect();
    }
    win = getWindow(doc);
    return {
      top: box.top + win.pageYOffset - docElem.clientTop,
      left: box.left + win.pageXOffset - docElem.clientLeft
    };
  };

  function getHeight($element) {
    var style = window.getComputedStyle($element, null);
    return parseInt(style.getPropertyValue('height'), 10);
  }
});

