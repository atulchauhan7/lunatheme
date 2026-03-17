/* ================================================================
   LUNATIC THEME — PRODUCT PAGE JS
   Gallery slider, options, quantity, accordion, cart, lightbox
   ================================================================ */
(function () {
  'use strict';

  /* ----- helpers ------------------------------------------------ */
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.from((c || document).querySelectorAll(s)); };

  /* gallery goTo exposed so variant switch can jump slides */
  var galleryGoTo = null;

  /* theme routes for cart AJAX */
  window.theme = window.theme || {};
  window.theme.routes = window.theme.routes || {
    cart_add_url: '/cart/add.js',
    cart_change_url: '/cart/change.js',
    checkout_url: '/checkout'
  };

  /* ================================================================
     PRODUCT GALLERY — Slider
     ================================================================ */
  function initProductGallery() {
    var gallery = $('.product-gallery--slider');
    if (!gallery) return;

    var track = $('.product-gallery__track', gallery);
    var slides = $$('.product-gallery__slide', gallery);
    var dots = $$('.product-gallery__dot', gallery);
    var counter = $('.product-gallery__counter', gallery);
    var prevBtn = $('.product-gallery__arrow--prev', gallery);
    var nextBtn = $('.product-gallery__arrow--next', gallery);

    if (!track || slides.length === 0) return;

    var idx = 0;
    var total = slides.length;
    var startX = 0;
    var startY = 0;
    var dx = 0;
    var isDragging = false;
    var isHorizontal = null;

    function goTo(n) {
      idx = Math.max(0, Math.min(n, total - 1));
      track.style.transform = 'translateX(-' + (idx * 100) + '%)';
      dots.forEach(function (d, i) { d.classList.toggle('active', i === idx); });
      if (counter) counter.textContent = (idx + 1) + ' / ' + total;
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(idx - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(idx + 1); });
    dots.forEach(function (d, i) { d.addEventListener('click', function () { goTo(i); }); });

    /* Touch / drag */
    var viewport = $('.product-gallery__viewport', gallery);
    if (viewport) {
      viewport.addEventListener('touchstart', onStart, { passive: true });
      viewport.addEventListener('touchmove', onMove, { passive: false });
      viewport.addEventListener('touchend', onEnd, { passive: true });
      viewport.addEventListener('mousedown', onStart);
      viewport.addEventListener('mousemove', onMove);
      viewport.addEventListener('mouseup', onEnd);
      viewport.addEventListener('mouseleave', onEnd);
    }

    function onStart(e) {
      isDragging = true;
      isHorizontal = null;
      var point = e.touches ? e.touches[0] : e;
      startX = point.clientX;
      startY = point.clientY;
      dx = 0;
      track.style.transition = 'none';
    }

    function onMove(e) {
      if (!isDragging) return;
      var point = e.touches ? e.touches[0] : e;
      dx = point.clientX - startX;
      var dy = point.clientY - startY;

      if (isHorizontal === null) {
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
          isHorizontal = Math.abs(dx) > Math.abs(dy);
        } else {
          return;
        }
      }

      if (!isHorizontal) return;
      if (e.cancelable) e.preventDefault();

      var offset = -(idx * 100) + (dx / viewport.offsetWidth) * 100;
      track.style.transform = 'translateX(' + offset + '%)';
    }

    function onEnd() {
      if (!isDragging) return;
      isDragging = false;
      track.style.transition = '';
      var threshold = viewport.offsetWidth * 0.15;
      if (dx < -threshold) goTo(idx + 1);
      else if (dx > threshold) goTo(idx - 1);
      else goTo(idx);
    }

    /* Click to open lightbox */
    slides.forEach(function (slide) {
      slide.addEventListener('click', function () {
        openLightbox(idx);
      });
    });

    galleryGoTo = goTo;
    goTo(0);
  }

  /* ================================================================
     PRODUCT GALLERY — Legacy Thumbnails
     ================================================================ */
  function initLegacyGallery() {
    var gallery = $('.product-gallery');
    if (!gallery || gallery.classList.contains('product-gallery--slider')) return;

    var mainImg = $('img', $('.product-gallery__main', gallery));
    var thumbs = $$('.product-gallery__thumb', gallery);

    if (!mainImg || thumbs.length === 0) return;

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var img = $('img', thumb);
        if (!img) return;
        mainImg.src = img.src.replace(/\d+x\d+/, '800x1000');
        mainImg.srcset = '';
        thumbs.forEach(function (t) { t.classList.remove('active'); });
        thumb.classList.add('active');
      });
    });
  }

  /* ================================================================
     PRODUCT OPTIONS — Variant matching
     ================================================================ */
  function initProductOptions() {
    var form = $('[data-product-form]');
    if (!form) return;

    var variantInput = $('input[name="id"]', form);
    if (!variantInput) return;

    var jsonEl = $('[data-product-variants]');
    var variants = [];
    if (jsonEl) {
      try { variants = JSON.parse(jsonEl.textContent); } catch (e) { /* empty */ }
    }
    if (!variants.length) return;

    var optionGroups = $$('.product-option', form);
    var priceEl = $('.product-info__price');
    var compareEl = $('.product-info__compare-price');
    var saveBadge = $('.product-info__save-badge');
    var savingsEl = $('.product-info__savings');
    var addBtn = form.querySelector('button.btn--add-to-cart');
    var buyBtn = form.querySelector('.btn--buy-now');
    var mobileAddBtn = $('.product-info__cta-group .btn--add-to-cart');
    var mobileBuyBtn = $('.product-info__cta-group .btn--buy-now');

    optionGroups.forEach(function (group) {
      var values = $$('.product-option__value', group);
      values.forEach(function (val) {
        val.addEventListener('click', function () {
          values.forEach(function (v) { v.classList.remove('selected'); });
          val.classList.add('selected');
          matchVariant();
        });
      });
    });

    function getSelectedOptions() {
      return optionGroups.map(function (group) {
        var sel = $('.product-option__value.selected', group);
        return sel ? sel.getAttribute('data-value') : null;
      });
    }

    function matchVariant() {
      var selected = getSelectedOptions();
      var match = variants.find(function (v) {
        return v.options.every(function (opt, i) {
          return !selected[i] || opt === selected[i];
        });
      });

      if (match) {
        variantInput.value = match.id;
        updatePrice(match);
        updateAvailability(match);
        updateURL(match);
        updateGalleryImage(match);
      }
    }

    function updatePrice(v) {
      if (!priceEl) return;
      var price = formatMoney(v.price);
      priceEl.textContent = price;

      if (v.compare_at_price && v.compare_at_price > v.price) {
        priceEl.classList.add('product-info__price--on-sale');
        if (compareEl) {
          compareEl.style.display = '';
          compareEl.innerHTML = 'MRP <s>' + formatMoney(v.compare_at_price) + '</s>';
        }
        var pct = Math.round((1 - v.price / v.compare_at_price) * 100);
        if (saveBadge) { saveBadge.style.display = ''; saveBadge.textContent = pct + '% OFF'; }
        var saved = v.compare_at_price - v.price;
        if (savingsEl) { savingsEl.style.display = ''; savingsEl.textContent = 'You save ' + formatMoney(saved); }
      } else {
        priceEl.classList.remove('product-info__price--on-sale');
        if (compareEl) compareEl.style.display = 'none';
        if (saveBadge) saveBadge.style.display = 'none';
        if (savingsEl) savingsEl.style.display = 'none';
      }
    }

    function updateAvailability(v) {
      var btns = [addBtn, buyBtn, mobileAddBtn, mobileBuyBtn];
      btns.forEach(function (btn) {
        if (!btn) return;
        btn.disabled = !v.available;
        if (!v.available) {
          btn.classList.add('is-sold-out');
          if (btn.querySelector('.btn-text')) btn.querySelector('.btn-text').textContent = 'Sold Out';
        } else {
          btn.classList.remove('is-sold-out');
          if (btn.querySelector('.btn-text')) {
            var orig = btn.getAttribute('data-text') || (btn.classList.contains('btn--buy-now') ? 'Buy Now' : 'Add to Cart');
            btn.querySelector('.btn-text').textContent = orig;
          }
        }
      });
    }

    function updateURL(v) {
      if (!v || !history.replaceState) return;
      var url = new URL(window.location.href);
      url.searchParams.set('variant', v.id);
      history.replaceState({}, '', url.toString());
    }

    function updateGalleryImage(v) {
      if (!galleryGoTo || !v.featured_image) return;
      var mediaId = String(v.featured_image.id);
      var slides = $$('.product-gallery__slide[data-media-id]');
      var targetIdx = slides.findIndex(function (s) {
        return s.getAttribute('data-media-id') === mediaId;
      });
      if (targetIdx >= 0) galleryGoTo(targetIdx);
    }

    function formatMoney(cents) {
      var amt = (cents / 100).toFixed(2);
      var currency = window.Shopify && window.Shopify.currency && window.Shopify.currency.active
        ? window.Shopify.currency.active
        : 'INR';
      if (currency === 'INR') return '\u20B9' + amt.replace(/\.00$/, '');
      return '$' + amt;
    }

    /* Pre-select from URL */
    var urlVariant = new URLSearchParams(window.location.search).get('variant');
    if (urlVariant) {
      var target = variants.find(function (v) { return String(v.id) === urlVariant; });
      if (target) {
        target.options.forEach(function (opt, i) {
          if (optionGroups[i]) {
            var match = $$('.product-option__value', optionGroups[i]).find(function (el) {
              return el.getAttribute('data-value') === opt;
            });
            if (match) {
              $$('.product-option__value', optionGroups[i]).forEach(function (v) { v.classList.remove('selected'); });
              match.classList.add('selected');
            }
          }
        });
        variantInput.value = target.id;
        updatePrice(target);
        updateAvailability(target);
        updateGalleryImage(target);
      }
    }
  }

  /* ================================================================
     QUANTITY SELECTOR
     ================================================================ */
  function initQuantitySelector() {
    $$('.quantity-selector').forEach(function (qs) {
      var input = $('input', qs);
      var minus = $('[data-qty-minus]', qs);
      var plus = $('[data-qty-plus]', qs);
      if (!input) return;
      if (minus) minus.addEventListener('click', function () {
        var val = parseInt(input.value, 10) || 1;
        input.value = Math.max(1, val - 1);
      });
      if (plus) plus.addEventListener('click', function () {
        var val = parseInt(input.value, 10) || 1;
        input.value = val + 1;
      });
    });
  }

  /* ================================================================
     ACCORDION
     ================================================================ */
  function initAccordions() {
    $$('.accordion-trigger').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var item = trigger.closest('.accordion-item');
        if (!item) return;
        var content = $('.accordion-content', item);
        if (!content) return;
        var inner = $('.accordion-content__inner', content);
        var isOpen = item.classList.contains('open');

        /* close all siblings */
        $$('.accordion-item').forEach(function (a) {
          a.classList.remove('open');
          var c = $('.accordion-content', a);
          if (c) c.style.maxHeight = '0';
        });

        if (!isOpen) {
          item.classList.add('open');
          content.style.maxHeight = (inner ? inner.scrollHeight : content.scrollHeight) + 'px';
        }
      });
    });

    /* auto-open first */
    var first = $('.accordion-item');
    if (first) {
      first.classList.add('open');
      var fc = $('.accordion-content', first);
      var fi = $('.accordion-content__inner', fc);
      if (fc) fc.style.maxHeight = (fi ? fi.scrollHeight : fc.scrollHeight) + 'px';
    }
  }

  function getProductForm() {
    return $('[data-product-form]');
  }

  function getMissingOptionGroup(form) {
    var groups = $$('.product-option', form);
    return groups.find(function (group) {
      return !$('.product-option__value.selected', group);
    }) || null;
  }

  function getSizeOptionGroup(form) {
    var groups = $$('.product-option', form);
    return groups.find(function (group) {
      var name = (group.getAttribute('data-option-name') || '').toLowerCase();
      return name === 'size' || name === 'sizes';
    }) || null;
  }

  function hasSelectedSize(form) {
    var sizeGroup = getSizeOptionGroup(form);
    if (!sizeGroup) return true;
    return !!$('.product-option__value.selected', sizeGroup);
  }

  function highlightMissingGroup(group) {
    if (!group) return;
    group.classList.add('is-missing-selection');
    group.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(function () {
      group.classList.remove('is-missing-selection');
    }, 1200);
  }

  function ensureRequiredOptionsSelected(form, actionType) {
    if (!form) return false;

    /* Check size is selected */
    if (!hasSelectedSize(form)) {
      if (window.LunaticSizeSheet && typeof window.LunaticSizeSheet.open === 'function') {
        window.LunaticSizeSheet.open(actionType || null, getSizeOptionGroup(form));
      } else {
        highlightMissingGroup(getSizeOptionGroup(form));
      }
      return false;
    }

    /* Check all other required options (color, material, etc.) */
    var missing = getMissingOptionGroup(form);
    if (missing) {
      if (window.LunaticSizeSheet && typeof window.LunaticSizeSheet.open === 'function') {
        window.LunaticSizeSheet.open(actionType || null, missing);
      } else {
        highlightMissingGroup(missing);
      }
      return false;
    }

    return true;
  }

  /* ================================================================
     ADD TO CART — AJAX
     ================================================================ */
  function initAddToCart() {
    var form = getProductForm();
    if (!form) return;

    /* Desktop form submit */
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!ensureRequiredOptionsSelected(form, 'add')) return;
      submitCart(form);
    });

    /* Mobile add button */
    var mobileAdd = $('.product-info__cta-group .btn--add-to-cart');
    if (mobileAdd) {
      mobileAdd.addEventListener('click', function (e) {
        e.preventDefault();
        if (!ensureRequiredOptionsSelected(form, 'add')) return;
        submitCart(form);
      });
    }
  }

  function submitCart(form) {
    var btn = form.querySelector('.btn--add-to-cart');
    var mobileBtn = $('.product-info__cta-group .btn--add-to-cart');
    var btns = [btn, mobileBtn].filter(Boolean);

    btns.forEach(function (b) { b.classList.add('is-loading'); });

    var formData = new FormData(form);
    var body = {};
    formData.forEach(function (val, key) { body[key] = val; });

    fetch(window.theme.routes.cart_add_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ items: [{ id: body.id, quantity: parseInt(body.quantity, 10) || 1 }] })
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      btns.forEach(function (b) {
        b.classList.remove('is-loading');
        b.classList.add('is-added');
        var txt = b.querySelector('.btn-text');
        if (txt) txt.textContent = 'Added!';
        setTimeout(function () {
          b.classList.remove('is-added');
          if (txt) txt.textContent = b.getAttribute('data-text') || 'Add to Cart';
        }, 2000);
      });

      /* Update cart count bubble directly */
      updateCartCount();

      /* Dispatch event for cart drawer */
      document.dispatchEvent(new CustomEvent('cart:refresh'));

      /* Try opening cart drawer if it exists */
      var cartDrawer = document.querySelector('cart-drawer');
      if (cartDrawer && typeof cartDrawer.open === 'function') {
        cartDrawer.open();
      } else {
        var cartNotification = document.querySelector('cart-notification');
        if (cartNotification && typeof cartNotification.open === 'function') {
          cartNotification.open();
        }
      }
    })
    .catch(function () {
      btns.forEach(function (b) {
        b.classList.remove('is-loading');
        var txt = b.querySelector('.btn-text');
        if (txt) txt.textContent = 'Error';
        setTimeout(function () {
          if (txt) txt.textContent = b.getAttribute('data-text') || 'Add to Cart';
        }, 2000);
      });
    });
  }

  function runBuyNowFlow(form) {
    if (!form) return;

    /* Prefer GoKwik's native flow when available. */
    var gokwikBuyNow = document.getElementById('gokwik-buy-now');
    if (gokwikBuyNow && typeof window.onBuyNowClick === 'function') {
      window.onBuyNowClick(gokwikBuyNow);
      return;
    }

    var gokwikCheckoutBtn = document.querySelector('.gokwik-checkout button:not([disabled])');
    if (gokwikCheckoutBtn) {
      gokwikCheckoutBtn.click();
      return;
    }

    /* Fallback to legacy checkout redirect when GoKwik is unavailable. */
    var variantId = $('input[name="id"]', form);
    var qty = $('input[name="quantity"]', form);
    if (!variantId) return;
    var id = variantId.value;
    var q = qty ? qty.value : 1;
    window.location.href = '/cart/' + id + ':' + q + '?checkout';
  }

  function updateCartCount() {
    fetch('/cart.js', { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        var badges = $$('.cart-count');
        badges.forEach(function (badge) {
          badge.textContent = cart.item_count;
          badge.style.display = cart.item_count > 0 ? '' : 'none';
        });
        /* Also update any [data-cart-count] elements */
        $$('[data-cart-count]').forEach(function (el) {
          el.textContent = cart.item_count;
        });
      })
      .catch(function () { /* silent */ });
  }

  /* ================================================================
     BUY NOW
     ================================================================ */
  function initBuyNow() {
    $$('.btn--buy-now').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var form = getProductForm();
        if (!form) return;
        if (!ensureRequiredOptionsSelected(form, 'buy')) return;
        runBuyNowFlow(form);
      });
    });
  }

  /* ================================================================
     SIZE SHEET (Bottom Sheet for mobile)
     ================================================================ */
  function initSizeSheet() {
    var overlay = $('.size-sheet-overlay');
    var sheet = $('.size-sheet');
    if (!overlay || !sheet) return;

    var form = getProductForm();
    if (!form) return;

    var sizeGroup = getSizeOptionGroup(form);
    var optionGroups = $$('.product-option', form);
    if (!sizeGroup && optionGroups.length === 0) return;

    var closeBtn = $('.size-sheet__close', sheet);
    var sizesWrap = $('#size-sheet-sizes', sheet) || $('.size-sheet__sizes', sheet);
    var addBtn = $('.size-sheet__add', sheet);
    var titleEl = $('#size-sheet-title', sheet) || $('.size-sheet__title', sheet);
    var pendingAction = null;
    var activeOptionGroup = sizeGroup || optionGroups[0] || null;

    function getGroupValues(group) {
      if (!group) return [];
      return $$('.product-option__value', group);
    }

    function getSelectedGroupValue(group) {
      if (!group) return null;
      var selected = $('.product-option__value.selected', group);
      return selected ? selected.getAttribute('data-value') : null;
    }

    function getActiveOptionLabel() {
      if (!activeOptionGroup) return 'Option';
      return activeOptionGroup.getAttribute('data-option-name') || 'Option';
    }

    function updateAddButtonState() {
      if (!addBtn) return;
      var selected = getSelectedGroupValue(activeOptionGroup);
      var label = getActiveOptionLabel();
      addBtn.disabled = !selected;
      addBtn.textContent = selected ? ('Continue with ' + selected) : ('Select ' + label);
      addBtn.classList.toggle('is-selected', !!selected);
    }

    function renderSizes() {
      if (!sizesWrap) return;
      if (!activeOptionGroup) return;

      if (titleEl) titleEl.textContent = 'Select ' + getActiveOptionLabel();

      var selected = getSelectedGroupValue(activeOptionGroup);
      var html = getGroupValues(activeOptionGroup).map(function (opt) {
        var value = opt.getAttribute('data-value') || '';
        var cls = ['size-sheet__size'];
        if (opt.classList.contains('selected')) cls.push('selected');
        if (opt.classList.contains('unavailable') || opt.classList.contains('disabled') || opt.getAttribute('aria-disabled') === 'true') {
          cls.push('unavailable');
        }
        return '<button type="button" class="' + cls.join(' ') + '" data-value="' + value.replace(/"/g, '&quot;') + '"' + (selected === value ? ' aria-pressed="true"' : ' aria-pressed="false"') + '>' + value + '</button>';
      }).join('');
      sizesWrap.innerHTML = html;

      /* Smart scroll for selected size: only scroll the sizes container, not the entire sheet */
      var selectedBtn = $('.size-sheet__size.selected', sizesWrap);
      if (selectedBtn) {
        setTimeout(function () {
          /* Get the position of selected button relative to sizes container */
          var btnRect = selectedBtn.getBoundingClientRect();
          var containerRect = sizesWrap.getBoundingClientRect();
          
          /* Calculate scroll amount needed to center the button horizontally in viewport */
          var btnCenterX = btnRect.left + btnRect.width / 2;
          var containerCenterX = containerRect.left + containerRect.width / 2;
          var scrollAmount = btnCenterX - containerCenterX;
          
          /* Smooth scroll only the sizes container, not the entire sheet */
          var currentScroll = sizesWrap.scrollLeft || 0;
          var targetScroll = currentScroll + scrollAmount;
          
          /* Limit scroll to valid range */
          targetScroll = Math.max(0, Math.min(targetScroll, sizesWrap.scrollWidth - sizesWrap.clientWidth));
          
          sizesWrap.scrollLeft = targetScroll;
        }, 50);
      }

      $$('.size-sheet__size', sizesWrap).forEach(function (s) {
        s.addEventListener('click', function () {
          if (s.classList.contains('unavailable')) return;
          var val = s.getAttribute('data-value');
          getGroupValues(activeOptionGroup).forEach(function (o) {
            if (o.getAttribute('data-value') === val) o.click();
          });
          renderSizes();
          updateAddButtonState();
        });
      });
    }

    function openSheet(actionType, targetGroup) {
      pendingAction = actionType || null;

      activeOptionGroup = targetGroup || (actionType ? getMissingOptionGroup(form) : (sizeGroup || optionGroups[0] || null));
      if (!activeOptionGroup) return;

      renderSizes();
      updateAddButtonState();
      overlay.classList.add('open');
      sheet.classList.add('open');
      document.body.classList.add('overflow-hidden');
    }

    function closeSheet() {
      overlay.classList.remove('open');
      sheet.classList.remove('open');
      document.body.classList.remove('overflow-hidden');
      pendingAction = null;
    }

    /* Open from mobile CTA */
    $$('[data-open-size-sheet]').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        openSheet(null, sizeGroup || optionGroups[0] || null);
      });
    });

    window.LunaticSizeSheet = {
      open: openSheet,
      close: closeSheet,
      render: renderSizes
    };

    if (closeBtn) closeBtn.addEventListener('click', closeSheet);
    overlay.addEventListener('click', closeSheet);

    if (addBtn) {
      addBtn.addEventListener('click', function () {
        if (!hasSelectedSize(form)) {
          activeOptionGroup = getSizeOptionGroup(form);
          renderSizes();
          updateAddButtonState();
          return;
        }

        var missing = getMissingOptionGroup(form);
        if (missing) {
          activeOptionGroup = missing;
          renderSizes();
          updateAddButtonState();
          return;
        }

        var actionToRun = pendingAction;
        closeSheet();

        if (actionToRun === 'add') {
          submitCart(form);
        } else if (actionToRun === 'buy') {
          runBuyNowFlow(form);
        }
      });
    }

    optionGroups.forEach(function (group) {
      getGroupValues(group).forEach(function (opt) {
        opt.addEventListener('click', function () {
          if (!activeOptionGroup) activeOptionGroup = group;
          renderSizes();
          updateAddButtonState();
        });
      });
    });

    if (sizeGroup || optionGroups[0]) {
      activeOptionGroup = sizeGroup || optionGroups[0];
      renderSizes();
      updateAddButtonState();
    }
  }

  /* ================================================================
     SIZE CHART MODAL
     ================================================================ */
  function initSizeChartTabs() {
    var overlay = document.getElementById('size-chart-modal') || $('.size-chart-overlay');
    if (!overlay) return;

    /* Move overlay to body to avoid parent overflow clipping */
    if (overlay.parentNode && overlay.parentNode !== document.body) {
      document.body.appendChild(overlay);
    }

    var modal = $('.size-chart-modal', overlay);
    var closeBtn = $('.size-chart-modal__close', overlay);
    var tabs = $$('.size-chart-tab', overlay);
    var panels = $$('.size-chart-panel', overlay);

    function isKiwiLoaded() {
      return !!document.querySelector(
        '.ks-modal-header, .ks-modal-content, .ks-chart-tab-container, .ks-powered-by'
      );
    }

    function openSizeChart() {
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('overflow-hidden');
    }

    function closeSizeChart() {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('overflow-hidden');
    }

    /* Open triggers */
    $$('.size-chart-trigger').forEach(function (trigger) {
      trigger.removeAttribute('onclick');
      trigger.addEventListener('click', function (e) {
        /* If Kiwi Sizing is loaded, let it handle the click natively.
           Don't stopPropagation so Kiwi's delegated listener can fire. */
        if (isKiwiLoaded()) {
          /* Also try clicking Kiwi's own trigger in case it has one */
          var kiwiTrigger = document.querySelector(
            '.ks-chart-modal-link, .ks-chart-link, [data-kiwi-open], #ks-chart-open'
          );
          if (kiwiTrigger && kiwiTrigger !== trigger) {
            e.preventDefault();
            kiwiTrigger.click();
          }
          return;
        }
        /* Kiwi not present — use our custom modal */
        e.preventDefault();
        e.stopPropagation();
        openSizeChart();
      });
    });

    if (closeBtn) {
      closeBtn.removeAttribute('onclick');
      closeBtn.addEventListener('click', closeSizeChart);
    }
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeSizeChart();
    });

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        panels.forEach(function (p) { p.classList.remove('active'); });
        tab.classList.add('active');
        if (panels[i]) panels[i].classList.add('active');
      });
    });

    /* ESC key close */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeSizeChart();
    });
  }

  /* ================================================================
     PRODUCT LIGHTBOX — Fullscreen image viewer
     ================================================================ */
  var lightbox = null;

  function openLightbox(startIdx) {
    if (!lightbox) createLightbox();
    if (!lightbox) return;

    lightbox.currentIndex = startIdx || 0;
    lightbox.el.classList.add('open');
    document.body.classList.add('overflow-hidden');
    renderLightboxSlide();
  }

  function createLightbox() {
    var slides = $$('.product-gallery__slide img, .product-gallery__main img');
    if (!slides.length) return;

    var images = slides.map(function (img) {
      var src = img.getAttribute('data-full') || img.src;
      return src.replace(/(\d+x\d+)/, '1200x1500');
    });

    var el = document.createElement('div');
    el.className = 'product-lightbox';

    var thumbsHtml = images.map(function (src, i) {
      return '<button class="product-lightbox__thumb' + (i === 0 ? ' active' : '') + '" data-index="' + i + '"><img src="' + src.replace(/1200x1500/, '100x130') + '" alt="" width="58" height="74" loading="lazy"></button>';
    }).join('');

    el.innerHTML =
      '<div class="product-lightbox__toolbar">' +
        '<span class="product-lightbox__counter">1 / ' + images.length + '</span>' +
        '<button class="product-lightbox__close" aria-label="Close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' +
      '</div>' +
      '<div class="product-lightbox__main">' +
        '<button class="product-lightbox__arrow product-lightbox__arrow--prev" aria-label="Previous"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg></button>' +
        '<img class="product-lightbox__image" src="" alt="" />' +
        '<button class="product-lightbox__arrow product-lightbox__arrow--next" aria-label="Next"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></button>' +
      '</div>' +
      '<div class="product-lightbox__thumbs">' + thumbsHtml + '</div>';

    document.body.appendChild(el);

    lightbox = {
      el: el,
      images: images,
      currentIndex: 0,
      mainImg: $('.product-lightbox__image', el),
      counter: $('.product-lightbox__counter', el),
      thumbs: $$('.product-lightbox__thumb', el)
    };

    /* Events */
    $('.product-lightbox__close', el).addEventListener('click', closeLightbox);
    $('.product-lightbox__arrow--prev', el).addEventListener('click', function () {
      lightbox.currentIndex = (lightbox.currentIndex - 1 + images.length) % images.length;
      renderLightboxSlide();
    });
    $('.product-lightbox__arrow--next', el).addEventListener('click', function () {
      lightbox.currentIndex = (lightbox.currentIndex + 1) % images.length;
      renderLightboxSlide();
    });
    lightbox.thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        lightbox.currentIndex = parseInt(thumb.getAttribute('data-index'), 10);
        renderLightboxSlide();
      });
    });

    /* Swipe support for lightbox */
    var lbStartX = 0;
    var lbDx = 0;
    var lbDragging = false;
    var lbMain = $('.product-lightbox__main', el);

    lbMain.addEventListener('touchstart', function (e) {
      lbDragging = true;
      lbStartX = e.touches[0].clientX;
      lbDx = 0;
    }, { passive: true });
    lbMain.addEventListener('touchmove', function (e) {
      if (!lbDragging) return;
      lbDx = e.touches[0].clientX - lbStartX;
    }, { passive: true });
    lbMain.addEventListener('touchend', function () {
      if (!lbDragging) return;
      lbDragging = false;
      if (lbDx < -40) {
        lightbox.currentIndex = (lightbox.currentIndex + 1) % images.length;
        renderLightboxSlide();
      } else if (lbDx > 40) {
        lightbox.currentIndex = (lightbox.currentIndex - 1 + images.length) % images.length;
        renderLightboxSlide();
      }
    }, { passive: true });

    /* ESC key */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lightbox && lightbox.el.classList.contains('open')) {
        closeLightbox();
      }
      if (e.key === 'ArrowRight' && lightbox && lightbox.el.classList.contains('open')) {
        lightbox.currentIndex = (lightbox.currentIndex + 1) % images.length;
        renderLightboxSlide();
      }
      if (e.key === 'ArrowLeft' && lightbox && lightbox.el.classList.contains('open')) {
        lightbox.currentIndex = (lightbox.currentIndex - 1 + images.length) % images.length;
        renderLightboxSlide();
      }
    });
  }

  function renderLightboxSlide() {
    if (!lightbox) return;
    lightbox.mainImg.style.opacity = '0';
    lightbox.mainImg.style.transform = 'scale(0.97)';
    setTimeout(function () {
      lightbox.mainImg.src = lightbox.images[lightbox.currentIndex];
      lightbox.mainImg.onload = function () {
        lightbox.mainImg.style.opacity = '1';
        lightbox.mainImg.style.transform = 'scale(1)';
      };
    }, 150);
    lightbox.counter.textContent = (lightbox.currentIndex + 1) + ' / ' + lightbox.images.length;
    lightbox.thumbs.forEach(function (t, i) {
      t.classList.toggle('active', i === lightbox.currentIndex);
    });
  }

  function closeLightbox() {
    if (lightbox) {
      lightbox.el.classList.remove('open');
      document.body.classList.remove('overflow-hidden');
    }
  }

  /* ================================================================
     PRODUCT SHARE
     ================================================================ */
  function initProductShare() {
    $$('.product-share__btn--copy').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var url = window.location.href;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function () {
            btn.classList.add('copied');
            setTimeout(function () { btn.classList.remove('copied'); }, 2000);
          });
        }
      });
    });
  }

  /* ================================================================
     PROMO CODE COPY
     ================================================================ */
  function initPromoCopy() {
    $$('.pdp-ticket__code').forEach(function (el) {
      el.addEventListener('click', function () {
        var code = el.getAttribute('data-copy-code');
        if (!code) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(code).then(function () {
            el.classList.add('copied');
            el.setAttribute('data-tip', 'Copied!');
            setTimeout(function () {
              el.classList.remove('copied');
              el.setAttribute('data-tip', 'Click to copy');
            }, 2000);
          });
        }
      });
    });
  }

  /* ================================================================
     SCROLL ANIMATIONS
     ================================================================ */
  function initScrollAnimations() {
    var items = $$('[data-animate]');
    if (!items.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  /* ================================================================
     INIT ALL
     ================================================================ */
  /* ================================================================
     NUKE APP-INJECTED RATINGS & REVIEWS
     Only .product-info__rating and .pdp-reviews are ours.
     Everything else on a product page gets removed.
     ================================================================ */
  function nukeAppReviews() {
    if (!document.body.classList.contains('template-product')) return;
    function isAppioNode(el) {
      if (!el || !el.closest) return false;
      return !!(el.closest('[class*="appio"]') || el.closest('[id*="appio"]'));
    }
    /* Selectors for elements to REMOVE — anything rating/review that is NOT ours */
    var dominated = [
      '.rating-wrapper', '.rating:not(.product-info__rating)',
      '.rating-star', '.rating-text', '.rating-count',
      '.product__info-wrapper', '.product__info-container',
      '.spr-badge', '.spr-badge-container', '.spr-badge-starrating',
      '.spr-starrating', '.spr-container', '.spr-summary',
      '.spr-header', '.spr-form', '.spr-content', '.spr-reviews',
      '.spr-summary-actions', '.spr-summary-actions-newreview',
      '.spr-button', '.spr-button-primary', '.spr-icon',
      '.spr-form-title', '.spr-form-contact', '.spr-form-review', '.spr-form-actions',
      '#shopify-product-reviews',
      '.jdgm-badge', '.jdgm-prev-badge', '.jdgm-widget', '.jdgm-rev-widg',
      '.stamped-badge', '.stamped-product-reviews-badge', '.stamped-main-widget',
      '.loox-rating', '.loox-reviews-default',
      '.okeReviews-starRating', '.okeReviews-widget',
      '.yotpo-main-widget', '[class*="yotpo"]',
      '[class*="rivyo"]', '[class*="ryviu"]', '[class*="ali-review"]',
      '[id*="shopify-product-reviews"]', '[id*="judgeme"]', '[class*="judgeme"]'
    ];
    dominated.forEach(function (sel) {
      try {
        $$(sel).forEach(function (el) {
          /* Only protect our custom rating badge and reviews section */
          if (el.closest('.product-info__rating') || el.closest('.pdp-reviews')) return;
          if (el.closest('.card-information') || el.closest('.card__information')) return;
          if (isAppioNode(el)) return;
          el.remove();
        });
      } catch (e) { /* selector may not apply */ }
    });
  }

  /* MutationObserver — catches async injections from review apps */
  function watchAndNuke() {
    if (!document.body.classList.contains('template-product')) return;
    if (typeof MutationObserver === 'undefined') return;
    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var nodes = mutations[i].addedNodes;
        for (var j = 0; j < nodes.length; j++) {
          var n = nodes[j];
          if (n.nodeType !== 1) continue;
          /* Only protect our custom rating badge and reviews section */
          if (n.closest && (n.closest('.product-info__rating') || n.closest('.pdp-reviews') || n.closest('.review-modal-overlay') || n.closest('.review-modal'))) continue;
          if (n.closest && (n.closest('.card-information') || n.closest('.card__information'))) continue;
          if (n.closest && (n.closest('[class*="appio"]') || n.closest('[id*="appio"]'))) continue;
          /* Check if injected node is a rating/review widget */
          var cls = (n.className || '') + ' ' + (n.id || '');
          if (/rating-wrapper|rating-star|rating-text|rating-count|\bspr[-_]|spr-icon|jdgm|judge|stamped|loox|yotpo|okendo|rivyo|ryviu|shopify-product-review/i.test(cls)) {
            n.remove();
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  /* ================================================================
     WRITE A REVIEW MODAL
     ================================================================ */
  function initReviewModal() {
    var overlay = $('#review-modal-overlay');
    var trigger = $('#write-review-trigger');
    var closeBtn = $('#review-modal-close');
    var cancelBtn = $('#review-modal-cancel');
    var submitBtn = $('#review-modal-submit');
    var starsWrap = $('#review-modal-stars');
    if (!overlay || !trigger) return;

    var selectedRating = 0;
    var stars = starsWrap ? $$('.review-modal__star', starsWrap) : [];

    function getScrollbarWidth() {
      return window.innerWidth - document.documentElement.clientWidth;
    }
    function openModal() {
      var sbw = getScrollbarWidth();
      document.body.style.overflow = 'hidden';
      if (sbw > 0) document.body.style.paddingRight = sbw + 'px';
      overlay.classList.add('open');
    }
    function closeModal() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    function resetForm() {
      selectedRating = 0;
      stars.forEach(function (s) { s.classList.remove('active', 'hover-fill'); });
      var nameI = $('#review-name');
      var emailI = $('#review-email');
      var titleI = $('#review-title-input');
      var bodyI = $('#review-body-input');
      if (nameI) nameI.value = '';
      if (emailI) emailI.value = '';
      if (titleI) titleI.value = '';
      if (bodyI) bodyI.value = '';
      /* Reset success state */
      var bodyEl = overlay.querySelector('.review-modal__body');
      var footerEl = overlay.querySelector('.review-modal__footer');
      var successEl = overlay.querySelector('.review-modal__success');
      if (bodyEl) bodyEl.style.display = '';
      if (footerEl) footerEl.style.display = '';
      if (successEl) successEl.classList.remove('show');
    }

    trigger.addEventListener('click', function () {
      resetForm();
      openModal();
    });
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
    });

    /* Star rating interaction */
    stars.forEach(function (star, idx) {
      star.addEventListener('click', function () {
        selectedRating = idx + 1;
        stars.forEach(function (s, i) {
          s.classList.toggle('active', i < selectedRating);
          s.classList.remove('hover-fill');
        });
      });
      star.addEventListener('mouseenter', function () {
        stars.forEach(function (s, i) {
          s.classList.toggle('hover-fill', i <= idx);
        });
      });
      star.addEventListener('mouseleave', function () {
        stars.forEach(function (s) { s.classList.remove('hover-fill'); });
      });
    });

    /* Submit */
    if (submitBtn) {
      submitBtn.addEventListener('click', function () {
        if (selectedRating === 0) {
          starsWrap.style.animation = 'headShake 0.5s';
          setTimeout(function () { starsWrap.style.animation = ''; }, 600);
          return;
        }
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        /* Show success after short delay (visual feedback) */
        setTimeout(function () {
          var bodyEl = overlay.querySelector('.review-modal__body');
          var footerEl = overlay.querySelector('.review-modal__footer');
          if (bodyEl) bodyEl.style.display = 'none';
          if (footerEl) footerEl.style.display = 'none';
          /* Show success message */
          var successEl = overlay.querySelector('.review-modal__success');
          if (!successEl) {
            successEl = document.createElement('div');
            successEl.className = 'review-modal__success show';
            successEl.innerHTML = '<div class="review-modal__success-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div><h4 class="review-modal__success-title">Thank You!</h4><p class="review-modal__success-text">Your review has been submitted and is pending approval.</p>';
            overlay.querySelector('.review-modal').appendChild(successEl);
          } else {
            successEl.classList.add('show');
          }
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Review';
          setTimeout(closeModal, 2200);
        }, 800);
      });
    }
  }

  function initReviewBars() {
    $$('.pdp-reviews__bar-row').forEach(function (row) {
      var fill = $('.pdp-reviews__bar-fill', row);
      var pctEl = $('.pdp-reviews__bar-pct', row);
      if (!fill || !pctEl) return;

      var txt = (pctEl.textContent || '').replace('%', '').trim();
      var pct = parseInt(txt, 10);
      if (isNaN(pct)) pct = 0;
      pct = Math.max(0, Math.min(100, pct));

      /* Re-apply width from visible percentage text to avoid empty bars from stale inline styles. */
      fill.style.width = pct + '%';
      fill.setAttribute('aria-hidden', 'true');
    });
  }

  function initAll() {
    nukeAppReviews();
    watchAndNuke();
    initProductGallery();
    initLegacyGallery();
    initProductOptions();
    initQuantitySelector();
    initAccordions();
    initAddToCart();
    initBuyNow();
    initSizeSheet();
    initSizeChartTabs();
    initProductShare();
    initPromoCopy();
    initScrollAnimations();
    initReviewModal();
    initReviewBars();
  }

  /* Run on DOM ready & Shopify section reload */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  document.addEventListener('shopify:section:load', function (e) {
    if (e.target.querySelector('.product-page')) {
      lightbox = null;
      initAll();
    }
  });
})();
