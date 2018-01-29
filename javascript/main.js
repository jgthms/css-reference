document.addEventListener('DOMContentLoaded', function() {
  var $root = document.documentElement;
  var template = $root.dataset.template;

  // Load iframes
  var $footerIframes = document.querySelectorAll('.footer-iframe');

  Array.prototype.forEach.call($footerIframes, function($iframe) {
    var src = $iframe.dataset.src;
    $iframe.src = src;
  });

  // Menu: Search
  var $searchInput = document.getElementById('menu-search-input');
  var $menuList = document.getElementById('menu-list');
  var $menuItems = document.querySelectorAll('.menu-item');
  var isFocused = false;
  var isSearching = false;
  var isModaling = false;
  var currentMatch = -1;
  var matches = initializeMatches($menuItems);

  if ($searchInput) {
    $searchInput.addEventListener('focus', function(event) {
      isFocused = true;
      isSearching = true;
    });

    $searchInput.addEventListener('blur', function(event) {
      isFocused = false;
      if (this.value === '') {
        globalReset();
      }
    });

    $searchInput.addEventListener('keyup', function(event) {
      var query = this.value.toLowerCase();
      isFocused = (this === document.activeElement);

      if (isFocused) {
        isSearching = true;

        if (query.length > 0) {
          matches = [];
          currentMatch = -1;
          $menuList.classList.add('is-searching');
          Array.prototype.forEach.call($menuItems, function($el, index) {
            var propertyName = $el.dataset.propertyName;
            var isMatch = highlightQuery($el, propertyName, query);

            if (isMatch) {
              matches.push({
                DOMIndex: index,
                propertyName: propertyName,
              });
            }
          });
        } else {
          $menuList.classList.remove('is-searching');
          Array.prototype.forEach.call($menuItems, function($el) {
            var $elName = $el.querySelector('.item-name');
            $elName.innerHTML = $el.dataset.propertyName;
          });
        }
      }
    });

    window.addEventListener('click', function(event) {
      if (!isFocused) {
        isSearching = false;
        cleanMenu($menuItems, false, true);
      }
    });

    window.addEventListener('keydown', function(event) {
      var key = event.code || event.key || false;

      switch (key) {
      case 'Enter':
        if (isSearching && currentMatch > -1) {
          event.preventDefault();
          var propertyName = matches[currentMatch].propertyName;
          var $target = document.getElementById(propertyName);

          if ($target) {
            $target.scrollIntoView();
          } else {
            window.location = window.location.origin + '/property/' + propertyName;
          }
        }
        break;
      case 'Escape':
        if (isModaling) {
          closeModal();
        } else {
          isSearching = false;
          globalReset();
        }
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        if (isSearching) {
          event.preventDefault();
          if (isFocused) {
            $searchInput.blur();
          }
          var increment = (key === 'ArrowDown');
          currentMatch = navigateMenu($menuItems, matches, currentMatch, increment);

          if (currentMatch === -1) {
            $searchInput.focus();
          }
          break;
        }
      }
    });

    function globalReset() {
      isFocused = false;
      $searchInput.value = '';
      $searchInput.blur();
      currentMatch = -1;
      matches = initializeMatches($menuItems);
      $menuList.classList.remove('is-searching');
      cleanMenu($menuItems, true, true);
    }
  }

  // Menu: Shadows
  var $menuUl = document.getElementById('menu-list-ul');
  var $menuShadowTop = document.getElementById('menu-shadow-top');
  var $menuShadowBottom = document.getElementById('menu-shadow-bottom');
  var menuThrottle = null;

  if ($menuUl) {
    $menuUl.addEventListener('scroll', function(event) {
      clearTimeout(menuThrottle);
      throttle = setTimeout(setMenuShadows(), 100);
    });

    function setMenuShadows() {
      var scrollTop = $menuUl.scrollTop;
      var height = $menuUl.offsetHeight;
      var fullHeight = $menuUl.scrollHeight;
      var maxScroll = fullHeight - height;
      var threshold = 200;
      var topFactor = 0;
      var bottomFactor = 1;

      if (scrollTop > threshold) {
        topFactor = 1;
      } else {
        topFactor = scrollTop / threshold;
      }

      if (scrollTop < maxScroll - threshold) {
        bottomFactor = 1;
      } else {
        var fromBottom = maxScroll - scrollTop;
        bottomFactor = fromBottom / threshold;
      }

      $menuShadowTop.style.opacity = topFactor;
      $menuShadowTop.style.transform = 'scaleY(' + topFactor + ')';
      $menuShadowBottom.style.opacity = bottomFactor;
      $menuShadowBottom.style.transform = 'scaleY(' + bottomFactor + ')';
    }
    setMenuShadows();
  }

  // Menu: Mobile
  var $menuNav = document.getElementById('menu-nav');
  var $menuNavOpen = document.getElementById('menu-nav-open');
  var $menuNavClose = document.getElementById('menu-nav-close');

  if ($menuNav) {
    $menuNavOpen.addEventListener('click', function(event) {
      $menuNav.classList.add('is-active');
    });

    $menuNavClose.addEventListener('click', function(event) {
      $menuNav.classList.remove('is-active');
    });

    Array.prototype.forEach.call($menuItems, function($menuItem, index) {
      $menuItem.addEventListener('click', function(event) {
        if (window.innerWidth < 800) {
          $menuNav.classList.remove('is-active');
        }
      });
    });
  }

  // Property: Copy to clipboard
  var clipboard = new Clipboard('.example-value');

  Array.prototype.forEach.call(document.querySelectorAll('.example-value'), function($el) {
    $el.addEventListener('mouseenter', function(e) {
      e.target.classList.remove('is-copied');
    });
  });

  clipboard.on('success', function(e) {
    e.clearSelection();
    e.trigger.classList.add('is-copied');
  });

  // Property: Share modal
  var $propertyShares = document.querySelectorAll('.property-share');
  var $modalInput = document.getElementById('modal-input');
  var baseURL = '' + window.location.origin + window.location.pathname;
  baseURL = 'https://cssreference.io/';
  var facebookURL = 'https://www.facebook.com/sharer.php?u=http%3A%2F%2Fcssreference.io';
  var twitterURL = 'https://twitter.com/intent/tweet?url=http%3A%2F%2Fcssreference.io&text=CSS%20Reference%3A%20a%20visual%20guide%20to%20the%20most%20popular%20%23CSS%20properties';

  Array.prototype.forEach.call($propertyShares, function($el, index) {
    $el.addEventListener('click', function(e) {
      var propertyName = $el.dataset.propertyName;
      var shareURL = baseURL + 'property/' + propertyName;
      $modalInput.value = shareURL;
      encodedURL = encodeURIComponent(shareURL);
      facebookURL = 'https://www.facebook.com/sharer.php?u=' + encodedURL;
      twitterURL = buildTwitterURL(encodedURL, propertyName);
      openModal();
    });
  });

  var $modalTwitter = document.getElementById('modal-twitter');
  var $modalFacebook = document.getElementById('modal-facebook');

  $modalTwitter.addEventListener('click', function(event) {
    event.preventDefault();
    window.open(twitterURL);
  });

  $modalFacebook.addEventListener('click', function(event) {
    event.preventDefault();
    window.open(facebookURL);
  });

  // Modal
  var $modalShare = document.getElementById('modal-share');
  var $modalClose = document.getElementById('modal-close');

  $modalShare.addEventListener('click', function(event) {
    event.preventDefault();
    if (event.target === $modalShare) {
      closeModal();
    } else {
      return true;
    }
  });

  $modalClose.addEventListener('click', function(event) {
    event.preventDefault();
    closeModal();
  });

  function openModal() {
    isModaling = true;
    $modalShare.classList.add('is-active');
  }

  function closeModal() {
    isModaling = false;
    $modalShare.classList.remove('is-active');
    facebookURL = 'https://www.facebook.com/sharer.php?u=http%3A%2F%2Fcssreference.io';
    twitterURL = 'https://twitter.com/intent/tweet?url=http%3A%2F%2Fcssreference.io&text=CSS%20Reference%3A%20a%20visual%20guide%20to%20the%20most%20popular%20%23CSS%20properties';
  }

  var modalClipboard = new Clipboard('#modal-copy');

  modalClipboard.on('success', function(e) {
    e.clearSelection();
    e.trigger.innerHTML = 'Copied';
    setTimeout(function() { e.trigger.innerHTML = 'Copy'; }, 500);
  });

  // Property: Launch animations
  var $launchButtons = document.querySelectorAll('.property-animation-toggle');

  Array.prototype.forEach.call($launchButtons, function($launchButton, index) {
    var propertyName = $launchButton.dataset.propertyName;
    var $targets = document.querySelectorAll('#' + propertyName + ' .example-output-div');

    $launchButton.addEventListener('click', function(event) {
      this.classList.toggle('is-playing');

      Array.prototype.forEach.call($targets, function($elbis, index) {
        $elbis.classList.toggle('is-animated');
      });
    });
  });

  // Property: Enable fixed
  var $fixedButtons = document.querySelectorAll('.example-fixed-toggle');

  Array.prototype.forEach.call($fixedButtons, function($fixedButton, index) {
    var slug = $fixedButton.dataset.slug;
    var $target = document.getElementById(slug);

    $fixedButton.addEventListener('click', function(event) {
      this.classList.toggle('is-enabled');
      $target.classList.toggle('is-fixed');
    });
  });

  // Hashes
  var $hashes = document.querySelectorAll('.hash, .menu-list-ul li a');

  Array.prototype.forEach.call($hashes, function($el) {
    $el.addEventListener('click', function(event) {
      event.preventDefault();
      var propertyName = $el.dataset.propertyName;
      var $target = document.getElementById($el.dataset.propertyName);

      if ($target) {
        $target.scrollIntoView();
      } else {
        window.location = window.location.origin + '/property/' + propertyName;
      }
    });
  });
});

// Pure functions
function initializeMatches($menuItems) {
  var matches = [];

  Array.prototype.forEach.call($menuItems, function($el, index) {
    var propertyName = $el.dataset.propertyName;
    matches.push({
      DOMIndex: index,
      propertyName: propertyName,
    });
  });

  return matches;
}

function cleanMenu($menuItems, highlight, selection) {
  Array.prototype.forEach.call($menuItems, function($el, index) {
    var $elName = $el.querySelector('.item-name');
    if (highlight) {
      $elName.innerHTML = $el.dataset.propertyName;
      $el.classList.remove('is-highlighted');
    }
    if (selection) {
      $el.classList.remove('is-selected');
    }
  });
}

function navigateMenu($menuItems, matches, currentIndex, increment = true) {
  Array.prototype.forEach.call($menuItems, function($el, index) {
    $el.classList.remove('is-selected');
  });

  if (matches.length < 1) {
    return -1;
  }

  var desiredIndex = increment ? currentIndex + 1 : currentIndex - 1;
  var actualIndex = limitNumber(desiredIndex, -1, matches.length - 1);

  if (actualIndex > -1) {
    var DOMIndex = matches[actualIndex].DOMIndex;
    $menuItems[DOMIndex].classList.add('is-selected');
  }

  return actualIndex;
}

function highlightQuery($el, propertyName, query) {
  var queryIndex = propertyName.indexOf(query);
  var $elName = $el.querySelector('.item-name');

  if (queryIndex >= 0) {
    var before = propertyName.substring(0, queryIndex);
    var highlight = '<span class="highlight">' + propertyName.substring(queryIndex, queryIndex + query.length) + '</span>';
    var after = propertyName.substring(queryIndex + query.length);
    $elName.innerHTML = before + highlight + after;
    $el.classList.add('is-highlighted');
    return true;
  } else {
    $elName.innerHTML = propertyName;
    $el.classList.remove('is-highlighted');
    return false;
  }
}

function limitNumber(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function buildTwitterURL(encodedURL, propertyName) {
  var text = 'Here\'s how ' + propertyName + ' works in #CSS';
  var encodedText = encodeURIComponent(text);
  return 'https://twitter.com/intent/tweet?url=' + encodedURL + '&text=' + encodedText;
}
