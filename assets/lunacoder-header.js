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

  var announcementSection = $('.announcement-bar-section');

  function setHeaderHeight() {
    var hh = header ? Math.round(header.getBoundingClientRect().bottom) : 72;
    document.documentElement.style.setProperty('--header-height', hh + 'px');
    // Set body padding to match total header height
    if (announcementSection && !announcementSection.classList.contains('announcement-hidden')) {
      var announcementHeight = announcementSection.getBoundingClientRect().height;
      document.body.style.paddingTop = (hh + announcementHeight) + 'px';
    } else {
      document.body.style.paddingTop = hh + 'px';
    }
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

  /* === MOBILE MENU === */
  var menuToggle = $('.lh-menu-toggle');
  var mobileNav = $('.lh-site-header__nav');
  var navOverlay = $('[data-lh-nav-overlay]');
  var navClose = $('[data-lh-nav-close]');

  function openMobileNav() {
    if (menuToggle && mobileNav) {
      menuToggle.classList.add('active');
      mobileNav.classList.add('open');
      if (navOverlay) navOverlay.classList.add('open');
      document.body.classList.add('lh-overflow-hidden');
      menuToggle.setAttribute('aria-expanded', 'true');
    }
  }

  function closeMobileNav() {
    if (menuToggle && mobileNav) {
      menuToggle.classList.remove('active');
      mobileNav.classList.remove('open');
      if (navOverlay) navOverlay.classList.remove('open');
      document.body.classList.remove('lh-overflow-hidden');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  }

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.contains('open') ? closeMobileNav() : openMobileNav();
    });
  }
  if (navClose) navClose.addEventListener('click', closeMobileNav);
  if (navOverlay) navOverlay.addEventListener('click', closeMobileNav);

  /* Mobile: toggle mega-menu on tap */
  if (window.innerWidth <= 1024) {
    $$('.lh-nav-item').forEach(function (ni) {
      var link = ni.querySelector('.lh-site-header__nav-link');
      var mega = ni.querySelector('.lh-mega-menu');
      if (link && mega) {
        link.addEventListener('click', function (e) {
          e.preventDefault();
          mega.classList.toggle('open');
          var arrow = link.querySelector('.lh-nav-arrow');
          if (arrow) {
            arrow.style.transform = mega.classList.contains('open') ? 'rotate(180deg)' : '';
          }
        });
      }
    });
  }

  /* === HEADER INLINE SEARCH === */
  var headerSearch = $('[data-lh-header-search]');
  var searchTriggers = $$('[data-lh-search-trigger]');
  var headerSearchClose = $('[data-lh-header-search-close]');
  var headerSearchInput = headerSearch ? headerSearch.querySelector('.lh-header-search__input') : null;

  function openSearch() {
    if (headerSearch) {
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
  if (headerSearchClose) headerSearchClose.addEventListener('click', closeSearch);
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
      if (menuToggle && menuToggle.classList.contains('active')) {
        closeMobileNav();
      }
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
