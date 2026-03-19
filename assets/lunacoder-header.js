/**
 * LunaCoder Header — Premium editorial header interactions
 * Handles: scroll behavior, mobile menu, inline search, mega menu, collection thumbs
 */
(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return (ctx || document).querySelectorAll(sel); };

  function throttle(fn, limit) {
    var t = false;
    return function () {
      if (!t) {
        fn.apply(this, arguments);
        t = true;
        setTimeout(function () { t = false; }, limit);
      }
    };
  }

  /* === HEADER SCROLL === */
  var header = $('.lh-site-header');
  if (!header) return;

  /* Hide header + announcement whenever cart drawer/GoKwik cart is open */
  function hideHeaderForCart() {
    header.style.display = 'none';
    if (announcementSection) announcementSection.style.display = 'none';
    document.body.style.paddingTop = '0';
  }
  function restoreHeaderForCart() {
    header.style.display = '';
    if (announcementSection) announcementSection.style.display = '';
    setHeaderHeight();
  }

  /* Watch for Dawn cart-drawer getting 'active' class (fires on localhost too) */
  var cartDrawerEl = document.querySelector('cart-drawer');
  if (cartDrawerEl) {
    new MutationObserver(function () {
      if (cartDrawerEl.classList.contains('active')) {
        hideHeaderForCart();
      } else {
        restoreHeaderForCart();
      }
    }).observe(cartDrawerEl, { attributes: true, attributeFilter: ['class'] });
  }

  /* Watch for GoKwik iframe injection (live only) */
  new MutationObserver(function () {
    if (document.getElementById('gokwik-iframe')) {
      hideHeaderForCart();
    }
  }).observe(document.body, { childList: true, subtree: false });

  /* ?openCart=true param (localhost testing shortcut) */
  if (new URLSearchParams(window.location.search).get('openCart') === 'true') {
    hideHeaderForCart();
  }

  var announcementSection = $('.announcement-bar-section');

  function setHeaderHeight() {
    var hh = header ? Math.round(header.getBoundingClientRect().bottom) : 72;
    document.documentElement.style.setProperty('--header-height', hh + 'px');
    /* Set body padding to match total header height (already includes announcement) */
    document.body.style.paddingTop = hh + 'px';
  }
  setHeaderHeight();
  window.addEventListener('resize', setHeaderHeight);

  var headerTicking = false;

  function handleHeaderScroll() {
    var cs = window.pageYOffset || document.documentElement.scrollTop;
    if (header) {
      header.classList.toggle('scrolled', cs > 50);
    }
    /* Announcement bar: hide on scroll > 150px, show otherwise */
    if (announcementSection) {
      if (cs > 150) {
        announcementSection.classList.add('announcement-hidden');
        header.classList.remove('has-announcement');
      } else {
        announcementSection.classList.remove('announcement-hidden');
        header.classList.add('has-announcement');
      }
    }
    setHeaderHeight();
    headerTicking = false;
  }
  window.addEventListener('scroll', function () {
    if (!headerTicking) {
      headerTicking = true;
      requestAnimationFrame(handleHeaderScroll);
    }
  }, { passive: true });

  /* === MOBILE MENU — Open original Dawn header-drawer === */
  var menuToggle = $('.lh-menu-toggle');
  var drawerDetails = $('#Details-menu-drawer-container');
  var drawerSummary = drawerDetails ? drawerDetails.querySelector('summary') : null;
  var headerInner = $('.lh-site-header__inner');

  function updateDrawerPosition() {
    if (headerInner) {
      var bottom = headerInner.getBoundingClientRect().bottom;
      document.documentElement.style.setProperty('--lh-drawer-top', bottom + 'px');
    }
  }

  if (menuToggle && drawerSummary) {
    menuToggle.addEventListener('click', function () {
      updateDrawerPosition();
      drawerSummary.click();
      // Override again after Dawn's async class toggle
      requestAnimationFrame(updateDrawerPosition);
    });
    window.addEventListener('resize', function () {
      if (drawerDetails && drawerDetails.hasAttribute('open')) {
        updateDrawerPosition();
      }
    });
  }

  /* === HEADER INLINE SEARCH === */
  var headerSearch = $('[data-lh-header-search]');
  var searchTriggers = $$('[data-lh-search-trigger]');
  var headerSearchInput = headerSearch ? headerSearch.querySelector('.lh-header-search__input') : null;
  var headerSearchReset = headerSearch ? headerSearch.querySelector('.lh-header-search__reset') : null;
  var predictiveWrap = headerSearch ? headerSearch.querySelector('predictive-search') : null;

  function syncHeaderSearchResetState() {
    if (!headerSearchInput || !headerSearchReset) return;
    headerSearchReset.classList.toggle('hidden', !headerSearchInput.value.trim());
  }

  function closeMenuDrawer() {
    if (drawerDetails && drawerDetails.hasAttribute('open')) {
      // Prefer Dawn's own close handler so focus and body lock cleanup stay in sync.
      if (drawerSummary) {
        drawerSummary.click();
      }

      // Fallback cleanup in case the summary click path is interrupted.
      if (drawerDetails.hasAttribute('open')) {
        drawerDetails.removeAttribute('open');
      }
      ['overflow-hidden', 'overflow-hidden-mobile', 'overflow-hidden-tablet', 'overflow-hidden-desktop']
        .forEach(function (cls) {
          document.body.classList.remove(cls);
        });
    }
  }

  function openSearch() {
    if (headerSearch) {
      closeMenuDrawer();
      headerSearch.classList.add('open');
      setTimeout(function () {
        if (headerSearchInput) headerSearchInput.focus();
      }, 300);
    }
  }

  function closeSearch() {
    if (headerSearch) {
      headerSearch.classList.remove('open');
      if (headerSearchInput) headerSearchInput.value = '';
      syncHeaderSearchResetState();
      /* Close predictive search dropdown if open */
      if (predictiveWrap && predictiveWrap.close) {
        predictiveWrap.close(true);
      }
    }
  }

  searchTriggers.forEach(function (t) {
    t.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (headerSearch && headerSearch.classList.contains('open')) {
        closeSearch();
      } else {
        openSearch();
      }
    });
  });
  if (headerSearchInput) {
    headerSearchInput.addEventListener('input', syncHeaderSearchResetState);
  }
  if (headerSearchReset) {
    headerSearchReset.addEventListener('click', function () {
      setTimeout(function () {
        syncHeaderSearchResetState();
        if (headerSearchInput) headerSearchInput.focus();
      }, 0);
    });
  }
  document.addEventListener('click', function (e) {
    if (headerSearch && headerSearch.classList.contains('open') &&
      !headerSearch.contains(e.target) &&
      !e.target.closest('[data-lh-search-trigger]')) {
      closeSearch();
    }
  });

  /* === ESC KEY === */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeSearch();
    }
  });

  /* === NAV COLLECTION THUMBNAILS (mobile) === */
  (function () {
    var container = document.getElementById('lh-nav-collections');
    var navLinks = $$('[data-lh-nav-collection-handle]');
    var handles = [];

    // Collect handles from data attributes on nav links
    navLinks.forEach(function (link) {
      var handle = link.getAttribute('data-lh-nav-collection-handle');
      var url = link.getAttribute('href');
      var title = link.querySelector('.lh-nav-link__text');
      if (handle) {
        handles.push({
          url: url,
          title: title ? title.textContent : '',
          handle: handle
        });
      }
    });

    if (!handles.length || !container) return;

    var scrollHtml = '<div class="lh-nav-collections__scroll">';
    var loaded = 0;
    var total = handles.length;

    function renderScroll() {
      scrollHtml += '</div>';
      if (container) container.innerHTML = scrollHtml;
    }

    handles.forEach(function (item) {
      if (!item.handle) { loaded++; if (loaded >= total) renderScroll(); return; }
      fetch('/collections/' + encodeURIComponent(item.handle) + '.json')
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (data) {
          var col = data.collection;
          var img = col.image ? col.image.src : null;
          if (!img && col.products && col.products.length) {
            for (var i = 0; i < col.products.length; i++) {
              if (col.products[i].images && col.products[i].images.length) {
                img = col.products[i].images[0].src;
                break;
              }
            }
          }
          if (img) {
            /* Inject into nav link thumb */
            var navLink = document.querySelector('[data-lh-nav-collection-handle="' + item.handle + '"]');
            if (navLink) {
              var thumb = navLink.querySelector('.lh-nav-link__thumb');
              if (thumb) {
                thumb.innerHTML = '<img src="' + img + '" alt="" width="40" height="40">';
                thumb.style.display = '';
              }
            }
            /* Add to bottom scroll */
            scrollHtml += '<a href="' + item.url + '" class="lh-nav-collections__item">'
              + '<div class="lh-nav-collections__img-wrap">'
              + '<img src="' + img + '" alt="' + col.title + '" loading="lazy" width="140" height="180">'
              + '</div>'
              + '<span class="lh-nav-collections__label">' + col.title + '</span></a>';
          }
        })
        .catch(function () { })
        .finally(function () { loaded++; if (loaded >= total) renderScroll(); });
    });
  })();

})();
