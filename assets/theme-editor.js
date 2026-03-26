(function() {
'use strict';
document.addEventListener('shopify:section:load', function(event) {
const section = event.target;
const animateEls = section.querySelectorAll('[data-animate]');
animateEls.forEach(el => el.classList.add('animated'));
});
document.addEventListener('shopify:section:unload', function(event) {
});
document.addEventListener('shopify:section:select', function(event) {
event.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
document.addEventListener('shopify:block:select', function(event) {
event.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
})();