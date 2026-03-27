(function(){
var $=document.querySelector.bind(document),$$=document.querySelectorAll.bind(document);
function throttle(fn,lim){let t;return function(){if(!t){fn.apply(this,arguments);t=true;setTimeout(()=>t=false,lim)}}}
function debounce(fn,w){let t;return function(){clearTimeout(t);t=setTimeout(()=>fn.apply(this,arguments),w)}}

/* === PAGE LOADER === */
window.addEventListener('load',function(){
var lo=document.getElementById('page-loader');
if(lo){requestAnimationFrame(function(){lo.classList.add('loaded')})}
setHeaderHeight();
requestAnimationFrame(function(){document.body.classList.add('page-loaded');
requestAnimationFrame(function(){initScrollAnimations();initSmoothReveal();initParallax();initMagneticButtons();initSplitText();initCustomCursor();initCounterAnimations();initImageReveals()})});
});

/* === SCROLL PROGRESS === */
(function(){
const b=$('.scroll-progress');if(!b)return;
var progTicking=false;
window.addEventListener('scroll',function(){if(!progTicking){progTicking=true;requestAnimationFrame(function(){const s=document.documentElement.scrollTop;const h=document.documentElement.scrollHeight-document.documentElement.clientHeight;b.style.width=h>0?(s/h)*100+'%':'0%';progTicking=false})}},{passive:true});
})();

/* === HEADER SCROLL === */
const header=$('.site-header');
const announcementBar=$('.announcement-bar');
function syncAnnouncementContentOffsetVar(){
  var h=announcementBar?Math.round(announcementBar.getBoundingClientRect().height):0;
  document.documentElement.style.setProperty('--announcement-content-offset',h+'px');
}
function syncAnnouncementHeightVar(){
  var h=0;
  if(announcementBar&&header&&header.classList.contains('has-announcement')&&!announcementBar.classList.contains('announcement-hidden')){
    h=Math.round(announcementBar.getBoundingClientRect().height);
  }
  document.documentElement.style.setProperty('--announcement-height',h+'px');
}
function setHeaderHeight(){
if(header){
if(!announcementBar)header.classList.remove('has-announcement');
}
if(header&&announcementBar){
var csTop=window.pageYOffset||document.documentElement.scrollTop;
if(csTop<=5){
announcementBar.classList.remove('announcement-hidden');
header.classList.add('has-announcement');
}else if(announcementBar.classList.contains('announcement-hidden')){
header.classList.remove('has-announcement');
}
}
var hh=header?Math.round(header.offsetHeight):72;
var cs=$('.category-strip');var sh=cs?cs.offsetHeight:0;
document.documentElement.style.setProperty('--header-height',hh+'px');
document.documentElement.style.setProperty('--strip-height',sh+'px');
syncAnnouncementContentOffsetVar();
syncAnnouncementHeightVar();
}
setHeaderHeight();
window.addEventListener('load',function(){requestAnimationFrame(setHeaderHeight)});
window.addEventListener('resize',setHeaderHeight);
let lastScroll=0;
var headerTicking=false;
function handleHeaderScroll(){
const cs=window.pageYOffset||document.documentElement.scrollTop;
const scrollingDown=cs>lastScroll+2;
if(header){
header.classList.toggle('scrolled',cs>40);
if(announcementBar){
if(cs<=5){
announcementBar.classList.remove('announcement-hidden');
header.classList.add('has-announcement');
syncAnnouncementHeightVar();
}else if(scrollingDown){
announcementBar.classList.add('announcement-hidden');
header.classList.remove('has-announcement');
syncAnnouncementHeightVar();
}
}
}
lastScroll=cs<=0?0:cs;
syncAnnouncementHeightVar();
headerTicking=false;
}
window.addEventListener('scroll',function(){if(!headerTicking){headerTicking=true;requestAnimationFrame(handleHeaderScroll)}},{passive:true});

/* === CATEGORY STRIP SCROLL OVERFLOW === */
(function(){
var catStrip=$('.category-strip');
var catTrack=catStrip?catStrip.querySelector('.category-strip__track'):null;
function updateCatOverflow(){
if(!catStrip||!catTrack)return;
var overflowRight=catTrack.scrollLeft+catTrack.clientWidth<catTrack.scrollWidth-4;
var overflowLeft=catTrack.scrollLeft>4;
catStrip.classList.toggle('category-strip--overflow-right',overflowRight);
catStrip.classList.toggle('category-strip--overflow-left',overflowLeft);
}
if(catTrack){
catTrack.addEventListener('scroll',updateCatOverflow,{passive:true});
window.addEventListener('resize',debounce(updateCatOverflow,80),{passive:true});
updateCatOverflow();
setTimeout(updateCatOverflow,400);
}
})();

/* === MOBILE MENU === */
const menuToggle=$('.menu-toggle');
const mobileNav=$('.site-header__nav');
const navOverlay=$('[data-nav-overlay]');
const navClose=$('[data-nav-close]');
function openMobileNav(){if(menuToggle&&mobileNav){menuToggle.classList.add('active');mobileNav.classList.add('open');if(navOverlay)navOverlay.classList.add('open');document.body.classList.add('overflow-hidden');menuToggle.setAttribute('aria-expanded','true')}}
function closeMobileNav(){if(menuToggle&&mobileNav){menuToggle.classList.remove('active');mobileNav.classList.remove('open');if(navOverlay)navOverlay.classList.remove('open');document.body.classList.remove('overflow-hidden');menuToggle.setAttribute('aria-expanded','false')}}
if(menuToggle&&mobileNav){menuToggle.addEventListener('click',function(){mobileNav.classList.contains('open')?closeMobileNav():openMobileNav()})}
if(navClose)navClose.addEventListener('click',closeMobileNav);
if(navOverlay)navOverlay.addEventListener('click',closeMobileNav);

function closeOtherNavDropdowns(currentItem){
$$('.nav-item').forEach(function(other){
if(other===currentItem)return;
var otherMega=other.querySelector('.mega-menu');
var otherLink=other.querySelector('.site-header__nav-link[data-nav-parent="true"]');
if(otherMega)otherMega.classList.remove('open');
other.classList.remove('is-open');
if(otherLink)otherLink.setAttribute('aria-expanded','false');
var otherArrow=other.querySelector('.nav-arrow');
if(otherArrow)otherArrow.style.transform='';
});
}

/* Parent links with children should open dropdown on click, not redirect */
document.addEventListener('click',function(e){
var link=e.target.closest('.site-header__nav-link[data-nav-parent="true"]');
if(!link)return;

var navItem=link.closest('.nav-item');
if(!navItem)return;
var mega=navItem.querySelector('.mega-menu');
if(!mega)return;

e.preventDefault();
e.stopPropagation();

var isOpen=mega.classList.contains('open')||navItem.classList.contains('is-open');
closeOtherNavDropdowns(navItem);

if(!isOpen){
mega.classList.add('open');
navItem.classList.add('is-open');
link.setAttribute('aria-expanded','true');
var arrow=link.querySelector('.nav-arrow');
if(arrow)arrow.style.transform='rotate(180deg)';
}else{
mega.classList.remove('open');
navItem.classList.remove('is-open');
link.setAttribute('aria-expanded','false');
var closeArrow=link.querySelector('.nav-arrow');
if(closeArrow)closeArrow.style.transform='';
}
});

document.addEventListener('click',function(e){
if(e.target.closest('.nav-item'))return;
closeOtherNavDropdowns(null);
});
/* === CART DRAWER === */
const cartDrawer=$('.cart-drawer');
const cartOverlay=$('.cart-drawer-overlay');
const cartTriggers=$$('[data-cart-trigger]');
const cartClose=$('.cart-drawer__close');
function openCartDrawer(){if(cartDrawer&&cartOverlay){cartDrawer.classList.add('open');cartOverlay.classList.add('open');document.body.classList.add('overflow-hidden');if(cartClose)cartClose.focus();triggerCartCelebration()}}
function closeCartDrawer(){if(cartDrawer&&cartOverlay){cartDrawer.classList.remove('open');cartOverlay.classList.remove('open');document.body.classList.remove('overflow-hidden')}}
cartTriggers.forEach(t=>t.addEventListener('click',e=>{e.preventDefault();openCartDrawer()}));
if(cartClose)cartClose.addEventListener('click',closeCartDrawer);
if(cartOverlay)cartOverlay.addEventListener('click',closeCartDrawer);

function resolveCheckoutUrl(){
if(window.theme&&window.theme.routes&&window.theme.routes.checkout_url)return window.theme.routes.checkout_url;
return '/checkout';
}

function triggerShopflowCheckout(source,trigger){
var checkoutUrl=resolveCheckoutUrl();
var detail={source:source||'unknown',checkoutUrl:checkoutUrl,trigger:trigger||null};
var checkoutEvent=null;
try{
checkoutEvent=new CustomEvent('shopflow:checkout',{cancelable:true,detail:detail});
document.dispatchEvent(checkoutEvent);
window.dispatchEvent(new CustomEvent('shopflow:checkout',{cancelable:true,detail:detail}));
}catch(e){}
if(checkoutEvent&&checkoutEvent.defaultPrevented)return;

/* Fallback to native checkout */
window.location.href=checkoutUrl;
}

function fallbackHandleFloCheckoutBtn(trigger){
return triggerShopflowCheckout('cart',trigger||null);
}

function triggerShopflowBuyNow(trigger){
var btn=trigger||document.activeElement||null;
var productForm=btn&&btn.closest?btn.closest('[data-product-form]'):null;
if(!productForm)productForm=document.querySelector('[data-product-form]');
if(!productForm)return;
var variantInput=productForm.querySelector('input[name="id"]');
var qtyInput=productForm.querySelector('input[name="quantity"]');
if(!variantInput)return;
if(btn&&btn.classList&&btn.classList.contains('is-loading'))return;
window.__buyNowInProgress=true;
setBuyNowState('loading');
fetch(window.theme.routes.cart_add_url+'.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:[{id:parseInt(variantInput.value,10),quantity:parseInt(qtyInput?qtyInput.value:1,10)||1}]})}).then(function(r){if(!r.ok)throw new Error('Add failed');return r.json()}).then(function(){
setBuyNowState('redirecting');
triggerShopflowCheckout('cart',btn);
setTimeout(function(){setBuyNowState('reset');window.__buyNowInProgress=false},1500);
}).catch(function(){setBuyNowState('error');window.__buyNowInProgress=false;setTimeout(function(){setBuyNowState('reset')},1500)});
}

function fallbackHandleFloBuyNowBtn(event){
var trigger=event&&event.currentTarget?event.currentTarget:(event&&event.target?event.target:null);
if(event&&typeof event.preventDefault==='function')event.preventDefault();
if(event&&typeof event.stopPropagation==='function')event.stopPropagation();
return triggerShopflowBuyNow(trigger);
}

if(typeof window.handleFloCheckoutBtn!=='function')window.handleFloCheckoutBtn=fallbackHandleFloCheckoutBtn;
// Always override buy-now to ensure add-to-cart + full cart checkout flow
window.handleFloBuyNowBtn=fallbackHandleFloBuyNowBtn;

// pdpBuyNow: called directly from Buy Now button onclick — immune to Shopflo override
// Adds product to cart first, then opens checkout with the full cart
window.pdpBuyNow=function(event){
if(event&&typeof event.preventDefault==='function')event.preventDefault();
if(event&&typeof event.stopPropagation==='function')event.stopPropagation();
var btn=event&&event.currentTarget?event.currentTarget:(event&&event.target?event.target.closest('[data-buy-now]'):null);
if(btn&&btn.classList&&btn.classList.contains('is-loading'))return;
var productForm=btn&&btn.closest?btn.closest('[data-product-form]'):null;
if(!productForm)productForm=document.querySelector('[data-product-form]');
if(!productForm){window.location.href='/checkout';return;}
var variantInput=productForm.querySelector('input[name="id"]');
var qtyInput=productForm.querySelector('input[name="quantity"]');
if(!variantInput){window.location.href='/checkout';return;}
setBuyNowState('loading');
fetch('/cart/add.js',{method:'POST',headers:{'Content-Type':'application/json','X-Requested-With':'XMLHttpRequest'},body:JSON.stringify({items:[{id:parseInt(variantInput.value,10),quantity:parseInt(qtyInput?qtyInput.value:1,10)||1}]})})
.then(function(r){if(!r.ok)throw new Error('add failed');return r.json();})
.then(function(){
setBuyNowState('redirecting');
triggerShopflowCheckout('cart',btn);
setTimeout(function(){setBuyNowState('reset');},1500);
})
.catch(function(){setBuyNowState('error');setTimeout(function(){setBuyNowState('reset');},1500);});
};

document.addEventListener('submit',function(e){
var form=e.target.closest('form[data-shopflow-checkout-form]');
if(!form)return;
e.preventDefault();
triggerShopflowCheckout(form.getAttribute('data-shopflow-source')||'cart',form);
});

document.addEventListener('click',function(e){
var btn=e.target.closest('[data-shopflow-checkout-button]');
if(!btn)return;
e.preventDefault();
var source='cart';
var form=btn.form||btn.closest('form[data-shopflow-checkout-form]');
if(form&&form.getAttribute('data-shopflow-source'))source=form.getAttribute('data-shopflow-source');
triggerShopflowCheckout(source,btn);
});

/* Refresh cart drawer HTML + count */
function refreshCart(callback){
var done=0,total=2,cartData=null;
if(cartDrawer)cartDrawer._sectionUpdated=false;
function check(){
done++;
if(done>=total){
/* If section rendering failed but we have cart data, rebuild drawer client-side */
if(cartData&&cartDrawer&&!cartDrawer._sectionUpdated){
rebuildCartDrawer(cartData);
}
if(typeof callback==='function')callback();
}
}
fetch('/?sections=cart-drawer',{cache:'no-store'}).then(r=>r.json()).then(data=>{
var html=data['cart-drawer'];
if(html){
var tmp=document.createElement('div');tmp.innerHTML=html;
var newDrawer=tmp.querySelector('.cart-drawer');
if(newDrawer&&cartDrawer){
cartDrawer.innerHTML=newDrawer.innerHTML;
cartDrawer._sectionUpdated=true;
/* re-bind close */
var nc=cartDrawer.querySelector('.cart-drawer__close');
if(nc)nc.addEventListener('click',closeCartDrawer);
/* re-bind qty buttons */
initCartQty();
initCartRemoveButtons();
}
}
check();
}).catch(function(){check()});
fetch('/cart.js',{cache:'no-store'}).then(r=>r.json()).then(c=>{
cartData=c;
$$('.cart-count').forEach(el=>{el.textContent=c.item_count;el.classList.add('elastic-scale');setTimeout(()=>el.classList.remove('elastic-scale'),600)});
$$('.cart-drawer__title').forEach(el=>{el.textContent='Your Cart ('+c.item_count+')'});
check();
}).catch(function(){check()});
}
/* Fallback: rebuild cart drawer entirely from /cart.js data */
function rebuildCartDrawer(cart){
if(!cartDrawer)return;
var fmt=window.theme&&window.theme.moneyFormat?window.theme.moneyFormat:'{{amount}}';
function money(cents){return fmt.replace(/\{\{[^}]*\}\}/,(cents/100).toFixed(2))}
function esc(s){var d=document.createElement('div');d.textContent=s||'';return d.innerHTML}
function escAttr(s){return(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
var h='<div class="cart-drawer__header"><span class="cart-drawer__title">Your Cart ('+cart.item_count+')</span>';
h+='<button class="cart-drawer__close" aria-label="Close cart"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>';
if(cart.items&&cart.items.length>0){
h+='<div class="cart-drawer__items">';
for(var i=0;i<cart.items.length;i++){
var it=cart.items[i];
h+='<div class="cart-drawer__item" data-line="'+(i+1)+'" data-key="'+escAttr(it.key)+'">';
h+='<div class="cart-drawer__item-image">';
if(it.image){h+='<img src="'+escAttr(it.image)+'" alt="'+escAttr(it.title)+'" loading="lazy" width="200">';}
h+='</div><div class="cart-drawer__item-info">';
h+='<a href="'+escAttr(it.url)+'" class="cart-drawer__item-title">'+esc(it.product_title)+'</a>';
if(it.variant_title&&it.variant_title!=='Default Title'){h+='<div class="cart-drawer__item-variant">'+esc(it.variant_title)+'</div>';}
h+='<div class="cart-drawer__item-price">'+money(it.final_line_price)+'</div>';
h+='<div class="cart-drawer__item-actions">';
h+='<div class="cart-drawer__qty"><button data-qty-minus aria-label="Decrease quantity">&#8722;</button>';
h+='<span>'+it.quantity+'</span>';
h+='<button data-qty-plus aria-label="Increase quantity">+</button></div>';
h+='<button class="cart-drawer__item-remove" data-qty-remove aria-label="Remove item"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg></button>';
h+='</div>';
h+='</div></div>';
}
h+='</div>';
h+='<div class="cart-drawer__footer"><div class="cart-drawer__subtotal"><span>Subtotal</span>';
h+='<span class="cart-drawer__subtotal-price">'+money(cart.total_price)+'</span></div>';
h+='<div class="gokwik-checkout"><button type="button" class="btn btn--primary btn--full disabled" disabled onclick="onCheckoutClick(this)"><span class="btn-text"><span>Checkout</span></span></button></div>';
h+='<div class="payment-icons payment-icons--drawer"><div class="payment-icons__list">';
h+='<span class="payment-icon" title="Visa"><svg viewBox="0 0 38 24" width="38" height="24"><rect width="38" height="24" rx="3" fill="#1A1F71"/><path d="M15.6 16.4l1.7-10.3h2.7l-1.7 10.3h-2.7zm11.3-10c-.5-.2-1.4-.4-2.4-.4-2.7 0-4.6 1.4-4.6 3.4 0 1.5 1.4 2.3 2.4 2.8 1 .5 1.4.8 1.4 1.3 0 .7-.8 1-1.6 1-1.1 0-1.6-.2-2.5-.5l-.3-.2-.4 2.1c.6.3 1.8.5 3 .5 2.9 0 4.7-1.4 4.7-3.5 0-1.2-.7-2.1-2.3-2.8-.9-.5-1.5-.8-1.5-1.3 0-.4.5-.9 1.5-.9.9 0 1.5.2 2 .4l.2.1.4-2zm7 0h-2.1c-.7 0-1.2.2-1.4.8l-4.1 9.6h2.9l.6-1.6h3.5l.3 1.6h2.5l-2.2-10.3zm-3.4 6.6l1.5-3.9.4 3.9h-1.9zM14.2 6.1l-2.6 7-.3-1.4c-.5-1.6-2-3.4-3.7-4.3l2.5 9h2.9l4.3-10.3h-3.1z" fill="#fff"/><path d="M8.4 6.1H4.2l-.1.3c3.4.9 5.7 2.9 6.6 5.4l-1-4.9c-.2-.6-.6-.8-1.3-.8z" fill="#F9A533"/></svg></span>';
h+='<span class="payment-icon" title="Mastercard"><svg viewBox="0 0 38 24" width="38" height="24"><rect width="38" height="24" rx="3" fill="#252525"/><circle cx="15" cy="12" r="7" fill="#EB001B"/><circle cx="23" cy="12" r="7" fill="#F79E1B"/><path d="M19 7.3a7 7 0 0 1 2.6 4.7A7 7 0 0 1 19 16.7a7 7 0 0 1-2.6-4.7A7 7 0 0 1 19 7.3z" fill="#FF5F00"/></svg></span>';
h+='<span class="payment-icon" title="PayPal"><svg viewBox="0 0 38 24" width="38" height="24"><rect width="38" height="24" rx="3" fill="#fff" stroke="#e8e8e8"/><path d="M25.2 7.8c-.4 2.6-2.4 2.6-4.3 2.6h-1.1l.8-4.8h.6c1.3 0 2.5 0 3.2.4.4.3.6.7.8 1.8z" fill="#003087"/><path d="M13.5 7.8c-.4 2.6-2.4 2.6-4.3 2.6H8.1l.8-4.8h.6c1.3 0 2.5 0 3.2.4.4.3.6.7.8 1.8z" fill="#002F86"/></svg></span>';
h+='<span class="payment-icon" title="Apple Pay"><svg viewBox="0 0 38 24" width="38" height="24"><rect width="38" height="24" rx="3" fill="#000"/><text x="19" y="15" text-anchor="middle" fill="#fff" font-size="8" font-family="sans-serif" font-weight="600">Pay</text></svg></span>';
h+='<span class="payment-icon" title="Shop Pay"><svg viewBox="0 0 38 24" width="38" height="24"><rect width="38" height="24" rx="3" fill="#5A31F4"/><text x="19" y="15" text-anchor="middle" fill="#fff" font-size="8" font-family="sans-serif" font-weight="600">Shop</text></svg></span>';
h+='</div></div>';
h+='<p class="cart-drawer__note">Shipping &amp; taxes calculated at checkout &middot; Coupon codes can be applied at checkout</p></div>';
}else{
h+='<div class="cart-drawer__empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';
h+='<p>Your cart is empty</p><a href="/collections/all" class="btn btn--primary">Start Shopping</a></div>';
}
cartDrawer.innerHTML=h;
var nc=cartDrawer.querySelector('.cart-drawer__close');
if(nc)nc.addEventListener('click',closeCartDrawer);
initCartQty();
initCartRemoveButtons();
}

function initCartQty(){
if(!cartDrawer)return;
cartDrawer.querySelectorAll('.cart-drawer__qty').forEach(wrap=>{
var line=wrap.closest('[data-line]');if(!line)return;
var key=line.getAttribute('data-key')||line.getAttribute('data-line');
var minusBtn=wrap.querySelector('[data-qty-minus]');
var plusBtn=wrap.querySelector('[data-qty-plus]');
var qtySpan=wrap.querySelector('span');
if(!qtySpan)return;
if(minusBtn){
var newMinus=minusBtn.cloneNode(true);
minusBtn.parentNode.replaceChild(newMinus,minusBtn);
newMinus.addEventListener('click',function(e){
e.preventDefault();e.stopPropagation();
var cur=parseInt(qtySpan.textContent)||1;
newMinus.disabled=true;
wrap.classList.add('is-loading');
changeCartLine(key,Math.max(0,cur-1));
});
}
if(plusBtn){
var newPlus=plusBtn.cloneNode(true);
plusBtn.parentNode.replaceChild(newPlus,plusBtn);
newPlus.addEventListener('click',function(e){
e.preventDefault();e.stopPropagation();
var cur=parseInt(qtySpan.textContent)||1;
newPlus.disabled=true;
wrap.classList.add('is-loading');
changeCartLine(key,cur+1);
});
}
});
}
function initCartRemoveButtons(){
if(!cartDrawer)return;
cartDrawer.querySelectorAll('[data-qty-remove]').forEach(function(btn){
var line=btn.closest('[data-line]');if(!line)return;
var key=line.getAttribute('data-key')||line.getAttribute('data-line');
var newBtn=btn.cloneNode(true);
btn.parentNode.replaceChild(newBtn,btn);
newBtn.addEventListener('click',function(e){
e.preventDefault();e.stopPropagation();
line.style.transition='opacity 0.3s,transform 0.3s';
line.style.opacity='0';line.style.transform='translateX(20px)';
changeCartLine(key,0);
});
});
}
function changeCartLine(key,qty){
fetch(window.theme.routes.cart_change_url+'.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:key,quantity:qty})}).then(r=>{if(!r.ok)throw new Error(r.status);return r.json()}).then(()=>refreshCart()).catch(()=>refreshCart());
}
if(cartDrawer){initCartQty();initCartRemoveButtons()}


/* === HEADER INLINE SEARCH === */
const headerSearch=$('[data-header-search]');
const searchTriggers=$$('[data-search-trigger]');
const headerSearchClose=$('[data-header-search-close]');
const headerSearchInput=headerSearch?headerSearch.querySelector('.header-search__input'):null;
function openSearch(){if(headerSearch){headerSearch.classList.add('open');setTimeout(()=>{if(headerSearchInput)headerSearchInput.focus()},300)}}
function closeSearch(){if(headerSearch){headerSearch.classList.remove('open');if(headerSearchInput)headerSearchInput.value=''}}
searchTriggers.forEach(t=>t.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(headerSearch&&headerSearch.classList.contains('open')){closeSearch()}else{openSearch()}}));
if(headerSearchClose)headerSearchClose.addEventListener('click',closeSearch);
document.addEventListener('click',function(e){if(headerSearch&&headerSearch.classList.contains('open')&&!headerSearch.contains(e.target)&&!e.target.closest('[data-search-trigger]')){closeSearch()}});

/* === WISHLIST (localStorage-based) === */
var wishlistDrawer=$('.wishlist-drawer');
var wishlistOverlay=$('.wishlist-drawer-overlay');
var wishlistClose=wishlistDrawer?wishlistDrawer.querySelector('.wishlist-drawer__close'):null;
var WISHLIST_KEY='luxe_wishlist';

function getWishlist(){try{return JSON.parse(localStorage.getItem(WISHLIST_KEY))||[]}catch(e){return[]}}
function saveWishlist(list){localStorage.setItem(WISHLIST_KEY,JSON.stringify(list))}

function isInWishlist(handle){return getWishlist().some(function(item){return item.handle===handle})}

function addToWishlist(data){
var list=getWishlist();
if(list.some(function(item){return item.handle===data.handle}))return;
list.push({handle:data.handle,title:data.title,url:data.url,price:data.price,image:data.image,addedAt:Date.now()});
saveWishlist(list);
renderWishlistDrawer();
updateWishlistBadges();
updateWishlistButtons();
}

function removeFromWishlist(handle){
var list=getWishlist().filter(function(item){return item.handle!==handle});
saveWishlist(list);
renderWishlistDrawer();
updateWishlistBadges();
updateWishlistButtons();
}

function toggleWishlist(data){
if(isInWishlist(data.handle)){removeFromWishlist(data.handle)}else{addToWishlist(data)}
}

function openWishlistDrawer(){
if(wishlistDrawer&&wishlistOverlay){
renderWishlistDrawer();
wishlistDrawer.classList.add('open');
wishlistOverlay.classList.add('open');
document.body.classList.add('overflow-hidden');
}
}
function closeWishlistDrawer(){
if(wishlistDrawer&&wishlistOverlay){
wishlistDrawer.classList.remove('open');
wishlistOverlay.classList.remove('open');
document.body.classList.remove('overflow-hidden');
}
}

function renderWishlistDrawer(){
if(!wishlistDrawer)return;
var list=getWishlist();
var itemsContainer=wishlistDrawer.querySelector('.wishlist-drawer__items');
var emptyState=wishlistDrawer.querySelector('.wishlist-drawer__empty');
var footer=wishlistDrawer.querySelector('.wishlist-drawer__footer');
function esc(s){var d=document.createElement('div');d.textContent=s||'';return d.innerHTML}
function escAttr(s){return(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

if(list.length===0){
itemsContainer.innerHTML='';
itemsContainer.style.display='none';
emptyState.style.display='flex';
if(footer)footer.style.display='none';
}else{
emptyState.style.display='none';
itemsContainer.style.display='block';
if(footer)footer.style.display='block';
var html='';
for(var i=0;i<list.length;i++){
var item=list[i];
html+='<div class="wishlist-drawer__item" data-wishlist-handle="'+escAttr(item.handle)+'">';
html+='<div class="wishlist-drawer__item-image">';
if(item.image){html+='<a href="'+escAttr(item.url)+'"><img src="'+escAttr(item.image)+'" alt="'+escAttr(item.title)+'" loading="lazy" width="200"></a>'}
html+='</div>';
html+='<div class="wishlist-drawer__item-info">';
html+='<a href="'+escAttr(item.url)+'" class="wishlist-drawer__item-title">'+esc(item.title)+'</a>';
html+='<div class="wishlist-drawer__item-price">'+esc(item.price)+'</div>';
html+='<div class="wishlist-drawer__item-actions">';
html+='<a href="'+escAttr(item.url)+'" class="btn btn--small btn--primary">View Product</a>';
html+='<button class="wishlist-drawer__remove" data-wishlist-remove="'+escAttr(item.handle)+'" aria-label="Remove from wishlist">';
html+='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>';
html+='</button>';
html+='</div>';
html+='</div>';
html+='</div>';
}
itemsContainer.innerHTML=html;
/* Bind remove buttons */
itemsContainer.querySelectorAll('[data-wishlist-remove]').forEach(function(btn){
btn.addEventListener('click',function(e){
e.preventDefault();
var handle=this.getAttribute('data-wishlist-remove');
var itemEl=this.closest('.wishlist-drawer__item');
if(itemEl){itemEl.style.transition='opacity 0.3s,transform 0.3s';itemEl.style.opacity='0';itemEl.style.transform='translateX(20px)';
setTimeout(function(){removeFromWishlist(handle)},300);
}else{removeFromWishlist(handle)}
});
});
}
}

function updateWishlistBadges(){
var count=getWishlist().length;
$$('.wishlist-count').forEach(function(el){el.textContent=count});
$$('.wishlist-count-badge').forEach(function(el){
if(count>0){el.textContent=count;el.style.display='flex'}else{el.style.display='none'}
});
}

function updateWishlistButtons(){
$$('[data-wishlist-toggle]').forEach(function(btn){
var handle=btn.getAttribute('data-product-handle');
var textEl=btn.querySelector('.pdp-wishlist__text');
if(handle&&isInWishlist(handle)){
btn.classList.add('wishlisted');
btn.setAttribute('aria-label','Remove from wishlist');
if(textEl)textEl.textContent='Wishlisted';
}else{
btn.classList.remove('wishlisted');
btn.setAttribute('aria-label','Add to wishlist');
if(textEl)textEl.textContent='Add to Wishlist';
}
});
}

/* Wishlist trigger — header icon */
$$('[data-wishlist-trigger]').forEach(function(t){t.addEventListener('click',function(e){e.preventDefault();openWishlistDrawer()})});
if(wishlistClose)wishlistClose.addEventListener('click',closeWishlistDrawer);
if(wishlistOverlay)wishlistOverlay.addEventListener('click',closeWishlistDrawer);

/* Wishlist toggle — product card heart buttons (event delegation) */
document.addEventListener('click',function(e){
var btn=e.target.closest('[data-wishlist-toggle]');
if(!btn)return;
e.preventDefault();
e.stopPropagation();
var data={
handle:btn.getAttribute('data-product-handle'),
title:btn.getAttribute('data-product-title'),
url:btn.getAttribute('data-product-url'),
price:btn.getAttribute('data-product-price'),
image:btn.getAttribute('data-product-image')
};
if(!data.handle)return;
toggleWishlist(data);
/* Animate the heart */
btn.style.transform='scale(1.3)';
setTimeout(function(){btn.style.transform=''},300);
});

/* Init on load */
updateWishlistBadges();
updateWishlistButtons();

/* === NEWSLETTER POPUP === */
var closeNewsletterPopup=function(){};
function initNewsletterPopup(){
var p=$('.newsletter-popup-overlay');if(!p)return;
var cb=p.querySelector('.newsletter-popup__close');
var closed=sessionStorage.getItem('luxe_newsletter_closed');
closeNewsletterPopup=function(){p.classList.remove('open');document.body.classList.remove('overflow-hidden');sessionStorage.setItem('luxe_newsletter_closed','true')};
if(!closed){var idleCb=window.requestIdleCallback||function(fn){setTimeout(fn,5000)};idleCb(function(){setTimeout(function(){p.classList.add('open');document.body.classList.add('overflow-hidden')},3000)})}
if(cb)cb.addEventListener('click',closeNewsletterPopup);
p.addEventListener('click',function(e){if(e.target===p)closeNewsletterPopup()});
window.closeNewsletterPopup=closeNewsletterPopup;
}
initNewsletterPopup();

/* === ESC KEY === */
document.addEventListener('keydown',function(e){
if(e.key==='Escape'){closeSearch();closeCartDrawer();closeWishlistDrawer();if(typeof closeNewsletterPopup==='function')closeNewsletterPopup();
if(menuToggle&&menuToggle.classList.contains('active')){menuToggle.classList.remove('active');if(mobileNav)mobileNav.classList.remove('open');document.body.classList.remove('overflow-hidden')}}
});

/* === SCROLL ANIMATIONS — All elements visible immediately === */
function initScrollAnimations(){
$$('[data-animate]:not(.animated)').forEach(function(el){el.classList.add('animated')});
}
function initSmoothReveal(){
$$('.shopify-section:not(.revealed)').forEach(function(s){s.classList.add('revealed')});
}
function initSectionReveals(){
$$('[data-stagger-reveal]').forEach(function(g){
Array.from(g.children).forEach(function(it){it.style.opacity='1';it.style.transform='none'});
});
}

/* === BACK TO TOP === */
const backToTop=document.getElementById('back-to-top');
if(backToTop){
window.addEventListener('scroll',throttle(function(){backToTop.classList.toggle('visible',window.pageYOffset>500)},100),{passive:true});
backToTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
}

/* === HERO SLIDER (dots + arrows + autoplay) === */
function initHeroSlideshow(){
$$('[data-hero-slideshow]').forEach(h=>{
const slides=h.querySelectorAll('.hero-slide');
if(slides.length<=1)return;
let cur=0;const speed=parseInt(h.dataset.heroSpeed)||6000;let timer=null;
const progressBar=h.querySelector('[data-hero-progress]');
function resetProgress(){
if(!progressBar)return;
progressBar.style.animation='none';
progressBar.offsetHeight;/* reflow */
progressBar.style.animation='heroProgress '+speed+'ms linear forwards';
}
function goTo(i){
if(i<0)i=slides.length-1;if(i>=slides.length)i=0;
cur=i;slides.forEach((s,idx)=>s.classList.toggle('hero-slide--active',idx===cur));
h.querySelectorAll('.hero-slider__dot').forEach((d,idx)=>d.classList.toggle('active',idx===cur));
resetProgress();
}
function next(){goTo(cur+1)}
function prev(){goTo(cur-1)}
function startAP(){stopAP();timer=setInterval(next,speed);resetProgress()}
function stopAP(){if(timer){clearInterval(timer);timer=null}}
/* Dots */
h.querySelectorAll('.hero-slider__dot').forEach(d=>{d.addEventListener('click',function(){goTo(parseInt(this.getAttribute('data-slide-index')));stopAP();startAP()})});
/* Arrows */
var prevBtn=h.querySelector('.hero-slider__arrow--prev');
var nextBtn=h.querySelector('.hero-slider__arrow--next');
if(prevBtn)prevBtn.addEventListener('click',function(){prev();stopAP();startAP()});
if(nextBtn)nextBtn.addEventListener('click',function(){next();stopAP();startAP()});
/* Touch swipe */
var touchStartX=0;
h.addEventListener('touchstart',function(e){touchStartX=e.touches[0].clientX},{passive:true});
h.addEventListener('touchend',function(e){var diff=touchStartX-e.changedTouches[0].clientX;if(Math.abs(diff)>50){if(diff>0)next();else prev();stopAP();startAP()}},{passive:true});
/* Pause on hover */
h.addEventListener('mouseenter',stopAP);h.addEventListener('mouseleave',startAP);
goTo(0);startAP();
});
}
initHeroSlideshow();

/* === QUICK ADD TO CART (product card overlay) === */
function initQuickAdd(){
var cardSheetOverlay=$('#card-size-sheet-overlay');
var cardSheet=$('#card-size-sheet');
var cardSheetSizes=$('#card-size-sheet-sizes');
var cardSheetAdd=$('#card-size-sheet-add');
var cardSheetCloseBtn=cardSheet?cardSheet.querySelector('.size-sheet__close'):null;
var cardSheetState={activeBtn:null,selectedVariantId:null};

function setButtonState(btn,label,disabled){
if(!btn)return;
btn.innerHTML='<span>'+label+'</span>';
btn.disabled=!!disabled;
}

function addVariantToCart(variantId){
return fetch(window.theme.routes.cart_add_url+'.js',{
method:'POST',
headers:{'Content-Type':'application/json'},
body:JSON.stringify({items:[{id:parseInt(variantId,10),quantity:1}]})
}).then(function(r){if(!r.ok)throw new Error('Add failed');return r.json()});
}

function closeCardSizeSheet(){
if(!cardSheetOverlay||!cardSheet)return;
cardSheetOverlay.classList.remove('open');
cardSheet.classList.remove('open');
cardSheet.setAttribute('aria-hidden','true');
document.body.classList.remove('overflow-hidden');
cardSheetState.selectedVariantId=null;
if(cardSheetSizes)cardSheetSizes.innerHTML='';
if(cardSheetAdd){cardSheetAdd.disabled=true;cardSheetAdd.textContent='Select a size';}
}

function getSizeOptionIndex(productData){
if(!productData||!productData.options||!productData.options.length)return -1;
for(var i=0;i<productData.options.length;i++){
var name=(productData.options[i]||'').toLowerCase();
if(name==='size'||name==='sizes')return i;
}
return -1;
}

function getInlineQuickAddProduct(btn){
if(!btn)return null;
if(btn._quickAddProduct)return btn._quickAddProduct;
var optionsRaw=btn.getAttribute('data-quick-add-options');
var variantsRaw=btn.getAttribute('data-quick-add-variants');
if(!optionsRaw||!variantsRaw)return null;
try{
var payload={options:JSON.parse(optionsRaw),variants:JSON.parse(variantsRaw)};
btn._quickAddProduct=payload;
return payload;
}catch(e){
return null;
}
}

function openCardSizeSheet(productData){
if(!cardSheetOverlay||!cardSheet||!cardSheetSizes||!cardSheetAdd)return false;
var sizeIndex=getSizeOptionIndex(productData);
if(sizeIndex<0)return false;

var uniqueSizes=[];
var sizeAvailability={};
for(var i=0;i<productData.variants.length;i++){
var v=productData.variants[i];
var options=v.options||[];
var sizeVal=options[sizeIndex];
if(!sizeVal)continue;
if(uniqueSizes.indexOf(sizeVal)===-1)uniqueSizes.push(sizeVal);
if(v.available)sizeAvailability[sizeVal]=true;
}

cardSheetSizes.innerHTML='';
for(var j=0;j<uniqueSizes.length;j++){
var value=uniqueSizes[j];
var sizeBtn=document.createElement('button');
sizeBtn.type='button';
sizeBtn.className='size-sheet__size';
sizeBtn.textContent=value;
sizeBtn.setAttribute('data-value',value);
if(!sizeAvailability[value])sizeBtn.classList.add('unavailable');
cardSheetSizes.appendChild(sizeBtn);
}

cardSheetAdd.disabled=true;
cardSheetAdd.textContent='Select a size';
cardSheetState.selectedVariantId=null;
cardSheetOverlay.classList.add('open');
cardSheet.classList.add('open');
cardSheet.setAttribute('aria-hidden','false');
document.body.classList.add('overflow-hidden');
return true;
}

if(cardSheetOverlay)cardSheetOverlay.addEventListener('click',closeCardSizeSheet);
if(cardSheetCloseBtn)cardSheetCloseBtn.addEventListener('click',closeCardSizeSheet);

if(cardSheetSizes)cardSheetSizes.addEventListener('click',function(e){
var btn=e.target.closest('.size-sheet__size');
if(!btn||btn.classList.contains('unavailable'))return;
if(!cardSheetState.activeBtn)return;

cardSheetSizes.querySelectorAll('.size-sheet__size').forEach(function(b){b.classList.remove('selected')});
btn.classList.add('selected');

var productData=cardSheetState.activeBtn._quickAddProduct;
if(!productData)return;
var sizeValue=btn.getAttribute('data-value');
var sizeIndex=getSizeOptionIndex(productData);
var selectedVariant=null;
for(var i=0;i<productData.variants.length;i++){
var variant=productData.variants[i];
if((variant.options||[])[sizeIndex]===sizeValue&&variant.available){selectedVariant=variant;break}
}

cardSheetState.selectedVariantId=selectedVariant?selectedVariant.id:null;
cardSheetAdd.disabled=!cardSheetState.selectedVariantId;
cardSheetAdd.textContent=cardSheetState.selectedVariantId?'Add to Cart':'Unavailable';
});

if(cardSheetAdd)cardSheetAdd.addEventListener('click',function(){
if(!cardSheetState.selectedVariantId||!cardSheetState.activeBtn)return;
var triggerBtn=cardSheetState.activeBtn;
var original=triggerBtn._quickAddOrigHtml||triggerBtn.innerHTML;
setButtonState(triggerBtn,'Adding...',true);
this.disabled=true;
addVariantToCart(cardSheetState.selectedVariantId).then(function(){
closeCardSizeSheet();
setButtonState(triggerBtn,'Added!',true);
refreshCart(function(){
setTimeout(function(){triggerBtn.innerHTML=original;triggerBtn.disabled=false},500);
});
}).catch(function(){
setButtonState(triggerBtn,'Error',true);
setTimeout(function(){triggerBtn.innerHTML=original;triggerBtn.disabled=false},1500);
});
});

document.addEventListener('click',function(e){
/* Quick-view: navigate to product page */
var qv=e.target.closest('[data-quick-view]');
if(qv){e.preventDefault();var url=qv.getAttribute('data-quick-view');if(url)window.location.href=url;return}
/* Quick-add with size selection (product cards with multiple variants) */
var sizeQuickBtn=e.target.closest('[data-quick-add-handle]');
if(sizeQuickBtn){
e.preventDefault();
if(sizeQuickBtn.disabled)return;
var fallbackUrl=sizeQuickBtn.getAttribute('data-quick-add-url');
var productData=getInlineQuickAddProduct(sizeQuickBtn);
if(!productData){if(fallbackUrl)window.location.href=fallbackUrl;return;}
var sizeIndex=getSizeOptionIndex(productData);
if(sizeIndex<0){if(fallbackUrl)window.location.href=fallbackUrl;return;}
cardSheetState.activeBtn=sizeQuickBtn;
if(!openCardSizeSheet(productData)&&fallbackUrl)window.location.href=fallbackUrl;
return;
}
/* Quick-add to cart */
var btn=e.target.closest('[data-quick-add]');
if(!btn)return;
e.preventDefault();
var variantId=btn.getAttribute('data-quick-add');
if(!variantId)return;
var orig=btn.innerHTML;btn.disabled=true;btn.innerHTML='<span>Adding...</span>';
addVariantToCart(variantId).then(()=>{
btn.innerHTML='<span>Added!</span>';
refreshCart(function(){
openCartDrawer();
setTimeout(function(){btn.innerHTML=orig;btn.disabled=false},400);
});
}).catch(()=>{btn.innerHTML='<span>Error</span>';setTimeout(()=>{btn.innerHTML=orig;btn.disabled=false},1500)});
});
}
initQuickAdd();

/* === ADD TO CART FORM (product page) === */
var ATC_ICON='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>';
var ATC_CHECK='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
function resetATCBtn(btn){
if(!btn)return;btn.disabled=false;btn.classList.remove('is-loading','is-added');
var isMobile=btn.closest('.product-info__cta-group');
if(isMobile){btn.innerHTML='Add to Cart'}else{btn.innerHTML=ATC_ICON+' Add to Cart'}
}
function setATCBtnsState(form,state){
var btns=form.querySelectorAll('[type="submit"]');
btns.forEach(function(btn){
if(state==='loading'){btn.disabled=true;btn.classList.add('is-loading');btn.innerHTML='<span class="btn-spinner"></span> Adding...';}
else if(state==='added'){btn.classList.remove('is-loading');btn.classList.add('is-added');btn.innerHTML=ATC_CHECK+' Added!';}
else if(state==='error'){btn.classList.remove('is-loading');btn.innerHTML='Error \u2014 Try Again';}
});
}
function initAddToCart(){
$$('[data-add-to-cart],[data-product-form]').forEach(f=>{f.addEventListener('submit',function(e){e.preventDefault();if(window.__buyNowInProgress)return;var btns=this.querySelectorAll('[type="submit"]');if(!btns.length)return;if(btns[0].classList.contains('is-loading'))return;
var form=this;
/* If size not yet selected, hand off to size sheet and abort */
if(form._isSizeSelected&&!form._isSizeSelected()){if(form._openSizeSheet)form._openSizeSheet('cart');return;}
var hiddenInput=form.querySelector('input[name="id"]');
var qtyInput=form.querySelector('input[name="quantity"]');
var variantId=hiddenInput?parseInt(hiddenInput.value,10):0;
if(!variantId){setATCBtnsState(form,'error');setTimeout(()=>{form.querySelectorAll('[type="submit"]').forEach(resetATCBtn)},1500);return;}
setATCBtnsState(form,'loading');
fetch(window.theme.routes.cart_add_url+'.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:[{id:variantId,quantity:parseInt(qtyInput&&qtyInput.value||1,10)||1}]})}).then(r=>{if(!r.ok)throw new Error('Add failed');return r.json()}).then(()=>{
setATCBtnsState(form,'added');
refreshCart(function(){openCartDrawer();setTimeout(function(){form.querySelectorAll('[type="submit"]').forEach(resetATCBtn)},500)});
}).catch(()=>{setATCBtnsState(form,'error');setTimeout(()=>{form.querySelectorAll('[type="submit"]').forEach(resetATCBtn)},1500)})})});
}
initAddToCart();

/* === FOOTER MOBILE TOGGLE === */
function initFooterToggle(){
$$('.site-footer__toggle').forEach(btn=>{
btn.addEventListener('click',function(){
this.closest('.site-footer__menu-col').classList.toggle('open');
});
});
}
initFooterToggle();

/* === PRODUCT GALLERY SLIDER === */
function initProductGallery(){
/* Slider gallery */
$$('.product-gallery--slider').forEach(function(gallery){
var track=gallery.querySelector('.product-gallery__track');
var slides=gallery.querySelectorAll('.product-gallery__slide');
var dots=gallery.querySelectorAll('.product-gallery__dot');
var counterCurrent=gallery.querySelector('[data-gallery-current]');
if(!track||slides.length<2)return;
var current=0,dragging=false,startX=0,currentTranslate=0,prevTranslate=0;
var DRAG_THRESHOLD=10,isDragged=false;
gallery._isDragged=false;

function goTo(idx,smooth){
if(idx<0)idx=0;
if(idx>=slides.length)idx=slides.length-1;
current=idx;
currentTranslate=-(current*100);
prevTranslate=currentTranslate;
track.style.transition=smooth!==false?'transform 0.45s cubic-bezier(.25,.46,.45,.94)':'none';
track.style.transform='translate3d('+currentTranslate+'%,0,0)';
dots.forEach(function(d,i){d.classList.toggle('active',i===current)});
if(counterCurrent)counterCurrent.textContent=current+1;
}

/* Dot clicks */
dots.forEach(function(dot){
dot.addEventListener('click',function(){goTo(parseInt(this.getAttribute('data-slide')))});
});

/* Touch swipe */
var startY=0,isHorizontal=null;
track.addEventListener('touchstart',function(e){
dragging=true;isDragged=false;isHorizontal=null;
startX=e.touches[0].clientX;
startY=e.touches[0].clientY;
track.style.transition='none';
},{passive:true});
track.addEventListener('touchmove',function(e){
if(!dragging)return;
var dx=e.touches[0].clientX-startX;
var dy=e.touches[0].clientY-startY;
if(isHorizontal===null&&(Math.abs(dx)>5||Math.abs(dy)>5)){
isHorizontal=Math.abs(dx)>Math.abs(dy);
}
if(isHorizontal===false)return;
if(Math.abs(dx)>DRAG_THRESHOLD){isDragged=true;gallery._isDragged=true}
if(isDragged){
e.preventDefault();
var pct=prevTranslate+(dx/track.parentElement.offsetWidth)*100;
track.style.transform='translate3d('+pct+'%,0,0)';
}
},{passive:false});
track.addEventListener('touchend',function(e){
if(!dragging)return;
dragging=false;
if(!isDragged){gallery._isDragged=false;return}
var dx=e.changedTouches[0].clientX-startX;
var threshold=track.parentElement.offsetWidth*0.2;
if(dx<-threshold)goTo(current+1);
else if(dx>threshold)goTo(current-1);
else goTo(current);
isDragged=false;
setTimeout(function(){gallery._isDragged=false},80);
});

/* Mouse drag */
track.addEventListener('mousedown',function(e){
dragging=true;isDragged=false;
startX=e.clientX;
track.style.transition='none';
track.style.cursor='grabbing';
e.preventDefault();
});
document.addEventListener('mousemove',function(e){
if(!dragging)return;
var dx=e.clientX-startX;
if(Math.abs(dx)>DRAG_THRESHOLD){isDragged=true;gallery._isDragged=true}
if(isDragged){
var pct=prevTranslate+(dx/track.parentElement.offsetWidth)*100;
track.style.transform='translate3d('+pct+'%,0,0)';
}
});
document.addEventListener('mouseup',function(){
if(!dragging)return;
dragging=false;
track.style.cursor='';
if(!isDragged){gallery._isDragged=false;return}
/* snap to nearest */
var rect=track.getBoundingClientRect();
var slideW=track.parentElement.offsetWidth;
var currentOffset=rect.left-track.parentElement.getBoundingClientRect().left;
var idx=Math.round(-currentOffset/slideW);
goTo(Math.max(0,Math.min(idx,slides.length-1)));
isDragged=false;
setTimeout(function(){gallery._isDragged=false},80);
});

/* Prevent click after drag */
track.addEventListener('click',function(e){
if(gallery._isDragged){e.preventDefault();e.stopPropagation()}
},true);

/* Zoom on hover (desktop) */
slides.forEach(function(slide){
var img=slide.querySelector('img');if(!img)return;
slide.addEventListener('mousemove',function(e){
if(window.innerWidth<769)return;
var r=slide.getBoundingClientRect();
img.style.transformOrigin=(e.clientX-r.left)/r.width*100+'% '+(e.clientY-r.top)/r.height*100+'%';
img.style.transform='scale(1.5)';
});
slide.addEventListener('mouseleave',function(){img.style.transform='scale(1)'});
});

/* Arrow navigation */
var prevArr=gallery.querySelector('.product-gallery__arrow--prev');
var nextArr=gallery.querySelector('.product-gallery__arrow--next');
if(prevArr)prevArr.addEventListener('click',function(e){e.stopPropagation();goTo(current-1)});
if(nextArr)nextArr.addEventListener('click',function(e){e.stopPropagation();goTo(current+1)});

goTo(0,false);
});

/* Legacy thumb gallery */
var mi=$('.product-gallery__main img'),ths=$$('.product-gallery__thumb');
if(mi&&ths.length){
ths.forEach(function(th){th.addEventListener('click',function(){var ns=this.dataset.fullImage||this.querySelector('img').src;mi.style.opacity='0';mi.style.transform='scale(0.95)';setTimeout(function(){mi.src=ns;mi.removeAttribute('srcset');mi.style.opacity='1';mi.style.transform='scale(1)'},300);ths.forEach(function(t){t.classList.remove('active')});this.classList.add('active')})});
if(mi){var ct=mi.parentElement;ct.addEventListener('mousemove',function(e){if(window.innerWidth<769)return;var r=ct.getBoundingClientRect();mi.style.transformOrigin=(e.clientX-r.left)/r.width*100+'% '+(e.clientY-r.top)/r.height*100+'%';mi.style.transform='scale(1.5)'});ct.addEventListener('mouseleave',function(){mi.style.transform='scale(1)'})}
}
}
initProductGallery();

/* === PRODUCT OPTIONS === */
function fmtPrice(n){var s=n.toFixed(2).replace(/\.00$/,'');var p=s.split('.');p[0]=p[0].replace(/\B(?=(\d{2})+(\d)(?!\d))/g,',');return p.join('.')}
function initProductOptions(){
var form=$('[data-product-form]');if(!form)return;
var variantJson=form.querySelector('[data-product-variants]');
var variants=variantJson?JSON.parse(variantJson.textContent):[];
var hiddenInput=form.querySelector('input[name="id"]');
var addBtn=form.querySelector('[type="submit"]');
$$('.product-option__value').forEach(function(v){
v.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();this.click()}});
v.addEventListener('click',function(){
this.closest('.product-option__values').querySelectorAll('.product-option__value').forEach(function(x){x.classList.remove('selected');x.setAttribute('aria-pressed','false')});
this.classList.add('selected');
this.setAttribute('aria-pressed','true');
/* Build selected options array */
var selected=[];
form.querySelectorAll('.product-option').forEach(function(opt){
var active=opt.querySelector('.product-option__value.selected');
if(active)selected.push(active.getAttribute('data-value'));
});
/* Find matching variant */
var match=null;
for(var i=0;i<variants.length;i++){
var v=variants[i];var opts=v.options||[];var isMatch=true;
for(var j=0;j<selected.length;j++){if(opts[j]!==selected[j]){isMatch=false;break}}
if(isMatch){match=v;break}
}
if(match&&hiddenInput){
hiddenInput.value=match.id;
/* Update price display */
var pdpWrap=form.closest('.product-info,.product-page');
var priceWrap=pdpWrap?pdpWrap.querySelector('.product-info__price-wrap'):null;
if(priceWrap&&match.price){
var amt=match.price/100;
var tagMrp=parseInt(priceWrap.getAttribute('data-tag-mrp'),10)||0;
var cmp=match.compare_at_price?(match.compare_at_price/100):0;
var mrpVal=(cmp>amt)?cmp:((tagMrp>amt)?tagMrp:0);
var priceEl=priceWrap.querySelector('.product-info__price');
var compareEl=priceWrap.querySelector('.product-info__compare-price');
var badgeEl=priceWrap.querySelector('.product-info__save-badge');
var savingsEl=priceWrap.querySelector('.product-info__savings');
var priceRow=priceWrap.querySelector('.product-info__price-row');
if(mrpVal>0){
var pctOff=Math.round((mrpVal-amt)*100/mrpVal);
var saveAmt=mrpVal-amt;
/* Ensure row structure exists */
if(!priceRow){
priceRow=document.createElement('div');priceRow.className='product-info__price-row';
if(priceEl){priceWrap.insertBefore(priceRow,priceEl);priceRow.appendChild(priceEl)}
if(!compareEl){compareEl=document.createElement('span');compareEl.className='product-info__compare-price';priceRow.appendChild(compareEl)}
if(!badgeEl){badgeEl=document.createElement('span');badgeEl.className='product-info__save-badge';priceRow.appendChild(badgeEl)}
if(!savingsEl){savingsEl=document.createElement('p');savingsEl.className='product-info__savings';priceWrap.insertBefore(savingsEl,priceRow.nextSibling)}
}else{
if(!compareEl){compareEl=document.createElement('span');compareEl.className='product-info__compare-price';priceRow.appendChild(compareEl)}
if(!badgeEl){badgeEl=document.createElement('span');badgeEl.className='product-info__save-badge';priceRow.appendChild(badgeEl)}
if(!savingsEl){savingsEl=document.createElement('p');savingsEl.className='product-info__savings';priceWrap.insertBefore(savingsEl,priceRow.nextSibling)}
}
if(priceEl){priceEl.textContent='\u20b9'+fmtPrice(amt);priceEl.classList.add('product-info__price--on-sale')}
compareEl.innerHTML='<s>\u20b9'+fmtPrice(mrpVal)+'</s>';compareEl.style.display='';
badgeEl.textContent=pctOff+'% OFF';badgeEl.style.display='';
savingsEl.textContent='You save \u20b9'+fmtPrice(saveAmt)+' on this product';savingsEl.style.display='';
}else{
if(priceEl){priceEl.textContent='\u20b9'+fmtPrice(amt);priceEl.classList.remove('product-info__price--on-sale')}
if(compareEl)compareEl.style.display='none';
if(badgeEl)badgeEl.style.display='none';
if(savingsEl)savingsEl.style.display='none';
}
}
/* Update availability */
if(addBtn){
if(match.available){addBtn.disabled=false;addBtn.textContent='Add to Cart'}
else{addBtn.disabled=true;addBtn.textContent='Sold Out'}
}
}else if(!match&&addBtn){
addBtn.disabled=true;addBtn.textContent='Unavailable';
}
});
});
}
initProductOptions();

/* === SIZE PICKER BOTTOM SHEET === */
function initSizeSheet(){
var form=$('[data-product-form]');if(!form)return;
var overlay=$('#size-sheet-overlay'),sheet=$('#size-sheet'),sizesWrap=$('#size-sheet-sizes'),sheetAddBtn=$('#size-sheet-add');
if(!overlay||!sheet||!sizesWrap||!sheetAddBtn)return;
var variantJson=form.querySelector('[data-product-variants]');
var variants=variantJson?JSON.parse(variantJson.textContent):[];
var hiddenInput=form.querySelector('input[name="id"]');
var pendingAction=null;/* 'cart' or 'buy' */
var pendingVariantId=null;

/* Find the size option element */
function getSizeOption(){
var opts=form.querySelectorAll('.product-option');
for(var i=0;i<opts.length;i++){
var name=(opts[i].getAttribute('data-option-name')||'').toLowerCase();
if(name==='size'||name==='sizes')return opts[i];
}
return null;
}

function isSizeSelected(){
var sizeOpt=getSizeOption();
if(!sizeOpt)return true;/* no size option = no need to select */
return !!sizeOpt.querySelector('.product-option__value.selected');
}

/* Populate sheet with sizes from the size option */
function populateSheet(){
sizesWrap.innerHTML='';
var sizeOpt=getSizeOption();if(!sizeOpt)return;
var idx=parseInt(sizeOpt.getAttribute('data-option-index'));
sizeOpt.querySelectorAll('.product-option__value').forEach(function(v){
var val=v.getAttribute('data-value');
var btn=document.createElement('button');
btn.type='button';
btn.className='size-sheet__size';
btn.textContent=val;
btn.setAttribute('data-value',val);
/* Check availability: see if ANY variant with this size value is available */
var available=false;
for(var i=0;i<variants.length;i++){
if(variants[i].options&&variants[i].options[idx]===val&&variants[i].available){available=true;break}
}
if(!available)btn.classList.add('unavailable');
sizesWrap.appendChild(btn);
});
sheetAddBtn.disabled=true;
sheetAddBtn.textContent='Select a size';
}

function openSheet(action){
pendingAction=action;
pendingVariantId=null;
populateSheet();
overlay.classList.add('open');
sheet.classList.add('open');
sheet.setAttribute('aria-hidden','false');
document.body.classList.add('overflow-hidden');
}

function closeSheet(){
overlay.classList.remove('open');
sheet.classList.remove('open');
sheet.setAttribute('aria-hidden','true');
document.body.classList.remove('overflow-hidden');
pendingAction=null;
pendingVariantId=null;
}

overlay.addEventListener('click',closeSheet);
var sheetCloseBtn=sheet.querySelector('.size-sheet__close');if(sheetCloseBtn)sheetCloseBtn.addEventListener('click',closeSheet);
/* Expose size helpers so initAddToCart can call them */
form._isSizeSelected=isSizeSelected;
form._openSizeSheet=openSheet;

/* Size selection inside sheet */
sizesWrap.addEventListener('click',function(e){
var btn=e.target.closest('.size-sheet__size');
if(!btn||btn.classList.contains('unavailable'))return;
sizesWrap.querySelectorAll('.size-sheet__size').forEach(function(b){b.classList.remove('selected')});
btn.classList.add('selected');
var sizeValue=btn.getAttribute('data-value');
var sizeOpt=getSizeOption();
var sizeIdx=sizeOpt?parseInt(sizeOpt.getAttribute('data-option-index')):0;
/* Build full options array for direct variant lookup */
var currentOpts=[];
form.querySelectorAll('.product-option').forEach(function(opt){
var i=parseInt(opt.getAttribute('data-option-index'));
if(i===sizeIdx){currentOpts[i]=sizeValue;}
else{var a=opt.querySelector('.product-option__value.selected');if(a)currentOpts[i]=a.getAttribute('data-value');}
});
/* Find matching available variant directly from variants JSON — no hidden-input dependency */
pendingVariantId=null;
for(var vi=0;vi<variants.length;vi++){
var vv=variants[vi];var vopts=vv.options||[];var vMatch=true;
for(var vj=0;vj<currentOpts.length;vj++){if(currentOpts[vj]!==undefined&&vopts[vj]!==currentOpts[vj]){vMatch=false;break}}
if(vMatch&&vv.available){pendingVariantId=vv.id;break}
}
sheetAddBtn.disabled=!pendingVariantId;
sheetAddBtn.textContent=pendingVariantId?(pendingAction==='buy'?'Buy Now':'Add to Cart'):'Unavailable';
/* Also update main form UI (price, availability) via initProductOptions */
if(sizeOpt){
var mainBtn=sizeOpt.querySelector('.product-option__value[data-value="'+sizeValue+'"]');
if(mainBtn)mainBtn.click();
}
});

/* Sheet add button */
sheetAddBtn.addEventListener('click',function(){
if(this.disabled||!pendingVariantId)return;
var action=pendingAction;
if(action==='buy'){
closeSheet();
window.__buyNowInProgress=true;
var buyBtn=document.querySelector('[data-buy-now]');
if(buyBtn)buyBtn.click();
return;
}
var addBtn=sheetAddBtn;
addBtn.disabled=true;
addBtn.textContent='Adding...';
fetch(window.theme.routes.cart_add_url+'.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:[{id:pendingVariantId,quantity:1}]})}).then(function(r){if(!r.ok)throw new Error('Add failed');return r.json()}).then(function(){
closeSheet();
var submitBtns=form.querySelectorAll('[type="submit"]');
submitBtns.forEach(function(b){b.classList.add('is-added');b.innerHTML=ATC_CHECK+' Added!'});
refreshCart(function(){openCartDrawer();setTimeout(function(){submitBtns.forEach(resetATCBtn)},700)});
}).catch(function(){addBtn.disabled=false;addBtn.textContent='Add to Cart';});
});

/* Size intercept is handled inside initAddToCart via form._isSizeSelected / form._openSizeSheet */

/* Intercept Buy Now */
document.addEventListener('click',function(e){
var btn=e.target.closest('[data-buy-now]');
if(!btn)return;
if(!isSizeSelected()){
e.preventDefault();
e.stopImmediatePropagation();
openSheet('buy');
}
},true);/* capture phase */
}
initSizeSheet();

/* === SIZE CHART TABS + SELECTED SIZE HIGHLIGHT === */
function initSizeChartTabs(){
var tabs=$$('.size-chart-tab');
var panels=$$('.size-chart-panel');
if(!tabs.length)return;
tabs.forEach(function(tab){
tab.addEventListener('click',function(){
var target=this.getAttribute('data-sc-tab');
tabs.forEach(function(t){t.classList.remove('active')});
panels.forEach(function(p){p.classList.remove('active')});
this.classList.add('active');
var panel=document.querySelector('[data-sc-panel="'+target+'"]');
if(panel)panel.classList.add('active');
});
});
/* Highlight selected size row in chart */
function highlightSizeRow(){
var table=document.querySelector('[data-size-chart]');
if(!table)return;
var rows=table.querySelectorAll('tbody tr[data-size]');
var sizeOpt=document.querySelector('.product-option[data-option-name="Size"]')||document.querySelector('.product-option[data-option-name="Sizes"]');
var selectedVal='';
if(sizeOpt){
var sel=sizeOpt.querySelector('.product-option__value.selected');
if(sel)selectedVal=sel.getAttribute('data-value');
}
rows.forEach(function(row){
row.classList.toggle('size-active',row.getAttribute('data-size')===selectedVal);
});
}
/* Listen for size selection changes */
$$('.product-option__value').forEach(function(v){
v.addEventListener('click',function(){setTimeout(highlightSizeRow,50)});
});
highlightSizeRow();
/* Close size chart on overlay click */
var overlay=document.getElementById('size-chart-modal');
if(overlay){
overlay.addEventListener('click',function(e){
if(e.target===overlay)overlay.classList.remove('open');
});
}
}
initSizeChartTabs();

/* === SIZE CHART SCROLL LOCK === */
(function(){
var overlay=document.getElementById('size-chart-modal');
if(!overlay)return;
/* Lock body scroll when size chart is open */
var obs=new MutationObserver(function(){
if(overlay.classList.contains('open')){
document.body.classList.add('overflow-hidden');
}else{
document.body.classList.remove('overflow-hidden');
}
});
obs.observe(overlay,{attributes:true,attributeFilter:['class']});
/* Prevent touch scroll on overlay from propagating */
overlay.addEventListener('touchmove',function(e){
var body=overlay.querySelector('.size-chart-modal__body');
if(body&&body.contains(e.target))return;/* allow scroll inside body */
e.preventDefault();
},{passive:false});
})();

/* === QUANTITY SELECTOR === */
function initQuantitySelector(){$$('.quantity-selector').forEach(s=>{if(s.closest('.cart-item[data-line]'))return;const m=s.querySelector('[data-qty-minus]'),p=s.querySelector('[data-qty-plus]'),i=s.querySelector('input');if(m&&p&&i){m.addEventListener('click',()=>{const v=parseInt(i.value)-1;if(v>=1)i.value=v});p.addEventListener('click',()=>{i.value=parseInt(i.value)+1})}})}
initQuantitySelector();

/* === CART PAGE QUANTITY === */
function initCartPageQty(){
$$('.cart-item[data-line] .quantity-selector').forEach(function(s){
var item=s.closest('.cart-item[data-line]');
if(!item)return;
var key=item.getAttribute('data-key')||item.getAttribute('data-line');
var m=s.querySelector('[data-qty-minus]'),p=s.querySelector('[data-qty-plus]'),i=s.querySelector('input');
if(!m||!p||!i)return;
/* Clone to remove stale listeners */
var newM=m.cloneNode(true);m.parentNode.replaceChild(newM,m);m=newM;
var newP=p.cloneNode(true);p.parentNode.replaceChild(newP,p);p=newP;
function setLoading(state){i.disabled=state;m.disabled=state;p.disabled=state;var qs=s;if(state){item.style.opacity='0.5';qs.classList.add('is-loading')}else{item.removeAttribute('style');qs.classList.remove('is-loading');m.blur();p.blur()}}
function updateCartLine(qty){
setLoading(true);
fetch(window.theme.routes.cart_change_url+'.js',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:key,quantity:qty})})
.then(function(r){if(!r.ok)throw new Error(r.status);return r.json()})
.then(function(cart){
if(qty===0){item.style.transition='opacity 0.3s,max-height 0.3s';item.style.opacity='0';item.style.maxHeight='0';item.style.overflow='hidden';item.style.padding='0';setTimeout(function(){window.location.reload()},350);
}else{i.value=qty;setLoading(false);
/* Update line total */
var totalEl=item.querySelector('.cart-item__total');
if(totalEl&&cart.items){
var cartItem=null;
for(var ci=0;ci<cart.items.length;ci++){if(cart.items[ci].key===key){cartItem=cart.items[ci];break}}
if(cartItem){totalEl.textContent=window.theme.moneyFormat.replace(/\{\{[^}]*\}\}/,(cartItem.final_line_price/100).toFixed(2))}
}
/* Update subtotal */
var subtotalEl=document.querySelector('.cart-summary__row--total');
if(subtotalEl&&cart.total_price!==undefined){var spans=subtotalEl.querySelectorAll('span');if(spans.length>1)spans[1].textContent=window.theme.moneyFormat.replace(/\{\{[^}]*\}\}/,(cart.total_price/100).toFixed(2))}
/* Update header cart count */
$$('.cart-count').forEach(function(el){el.textContent=cart.item_count});
}
}).catch(function(){setLoading(false)})
}
m.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();var cur=parseInt(i.value)||1;updateCartLine(Math.max(0,cur-1))});
p.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();var cur=parseInt(i.value)||1;updateCartLine(cur+1)});
i.addEventListener('change',function(){var val=parseInt(this.value);if(!isNaN(val)&&val>=0)updateCartLine(val)});
});
}
initCartPageQty();

/* === ACCORDIONS === */
function initAccordions(){$$('.accordion-trigger').forEach(tr=>{var ai=tr.closest('.accordion-item');if(!ai)return;tr.setAttribute('aria-expanded',ai.classList.contains('open'));tr.addEventListener('click',function(){const it=this.closest('.accordion-item');if(!it)return;const co=it.querySelector('.accordion-content');if(!co)return;const inn=co.querySelector('.accordion-content__inner');if(it.classList.contains('open')){co.style.maxHeight='0';it.classList.remove('open');this.setAttribute('aria-expanded','false')}else{const pa=it.closest('.product-accordion');if(pa)pa.querySelectorAll('.accordion-item.open').forEach(o=>{o.classList.remove('open');o.querySelector('.accordion-content').style.maxHeight='0';var otr=o.querySelector('.accordion-trigger');if(otr)otr.setAttribute('aria-expanded','false')});it.classList.add('open');this.setAttribute('aria-expanded','true');co.style.maxHeight=(inn?inn.scrollHeight:co.scrollHeight)+'px'}})})}
initAccordions();

/* === LAZY LOAD === */
function initLazyLoad(){
const imgs=$$('img[data-src]');
if('IntersectionObserver' in window){const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){const i=e.target;i.src=i.dataset.src;if(i.dataset.srcset)i.srcset=i.dataset.srcset;i.classList.add('loaded');obs.unobserve(i)}})},{rootMargin:'100px 0px'});imgs.forEach(i=>obs.observe(i))}
}
initLazyLoad();

/* === CAROUSELS === */
function initCarousels(){
$$('[data-carousel]').forEach(carousel=>{
const track=carousel.querySelector('[data-carousel-track]');
const slides=carousel.querySelectorAll('[data-carousel-slide]');
const sec=carousel.closest('.section,section,[data-section-id]')||carousel.parentElement;
const prevBtn=carousel.querySelector('[data-carousel-prev]')||sec.querySelector('[data-carousel-prev]');
const nextBtn=carousel.querySelector('[data-carousel-next]')||sec.querySelector('[data-carousel-next]');
const dotsC=carousel.querySelector('[data-carousel-dots]');
const autoplay=carousel.dataset.carouselAutoplay==='true';
const autoSpeed=parseInt(carousel.dataset.carouselSpeed)||5000;
const loop=carousel.dataset.carouselLoop!=='false';
const perView=parseInt(carousel.dataset.carouselPerView)||1;
if(!track||!slides.length)return;
const vp=carousel.querySelector('.carousel__viewport')||carousel;
let idx=0,timer=null,dragging=false,isDragged=false,justDragged=false,startX=0,curTr=0,prevTr=0;
var DRAG_THRESHOLD=12;
function gpv(){if(window.innerWidth<=480)return Math.min(perView,1);if(window.innerWidth<=768)return Math.min(perView,2);if(window.innerWidth<=1024)return Math.min(perView,3);return perView}
function gsw(){return vp.offsetWidth/gpv()}
function ssw(){const w=gsw();slides.forEach(s=>{s.style.width=w+'px';s.style.flexShrink='0'})}
function gmi(){return Math.max(0,slides.length-gpv())}
function mkDots(){if(!dotsC)return;dotsC.innerHTML='';const mx=gmi();for(let i=0;i<=mx;i++){const d=document.createElement('button');d.classList.add('carousel__dot');if(i===0)d.classList.add('active');d.setAttribute('aria-label','Go to slide '+(i+1));(function(x){d.addEventListener('click',()=>go(x))})(i);dotsC.appendChild(d)}}
function upDots(){if(!dotsC)return;dotsC.querySelectorAll('.carousel__dot').forEach((d,i)=>d.classList.toggle('active',i===idx))}
function upBtns(){if(!loop){if(prevBtn)prevBtn.disabled=idx<=0;if(nextBtn)nextBtn.disabled=idx>=gmi()}}
function go(i,sm){if(sm===undefined)sm=true;const mx=gmi();idx=loop?(i<0?mx:i>mx?0:i):Math.max(0,Math.min(i,mx));const tx=-(idx*gsw());track.style.transition=sm?'transform 0.6s cubic-bezier(.25,.46,.45,.94)':'none';track.style.transform='translate3d('+tx+'px,0,0)';prevTr=tx;upDots();upBtns()}
function next(){go(idx+1)}function prev(){go(idx-1)}
function startAP(){if(!autoplay)return;stopAP();timer=setInterval(next,autoSpeed)}
function stopAP(){if(timer){clearInterval(timer);timer=null}}
function dStart(e){dragging=true;isDragged=false;startX=e.type.includes('mouse')?e.pageX:e.touches[0].clientX;track.style.transition='none';stopAP()}
function dMove(e){if(!dragging)return;var cx=e.type.includes('mouse')?e.pageX:e.touches[0].clientX;if(!isDragged&&Math.abs(cx-startX)>DRAG_THRESHOLD){isDragged=true;track.style.cursor='grabbing'}if(isDragged){if(e.cancelable)e.preventDefault();curTr=prevTr+(cx-startX);track.style.transform='translate3d('+curTr+'px,0,0)'}}
function dEnd(){if(!dragging)return;dragging=false;track.style.cursor='';if(isDragged){justDragged=true;setTimeout(function(){justDragged=false},300);var mv=curTr-prevTr;if(Math.abs(mv)>gsw()/4){if(mv<0)next();else prev()}else go(idx)}isDragged=false;startAP()}
track.addEventListener('click',function(e){if(justDragged){e.preventDefault();e.stopPropagation();justDragged=false}},true);
if(prevBtn)prevBtn.addEventListener('click',()=>{prev();stopAP();startAP()});
if(nextBtn)nextBtn.addEventListener('click',()=>{next();stopAP();startAP()});
track.addEventListener('touchstart',dStart,{passive:true});track.addEventListener('touchmove',dMove,{passive:false});track.addEventListener('touchend',dEnd);
track.addEventListener('mousedown',dStart);track.addEventListener('mousemove',dMove);track.addEventListener('mouseup',dEnd);track.addEventListener('mouseleave',()=>{if(dragging)dEnd()});
carousel.addEventListener('mouseenter',stopAP);carousel.addEventListener('mouseleave',startAP);
carousel.setAttribute('tabindex','0');carousel.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){prev();stopAP()}if(e.key==='ArrowRight'){next();stopAP()}});
let rTimer;window.addEventListener('resize',()=>{clearTimeout(rTimer);rTimer=setTimeout(()=>{ssw();mkDots();go(Math.min(idx,gmi()),false)},250)});
ssw();mkDots();upBtns();go(0,false);startAP();
});
}
initCarousels();

/* === VIDEO AUTOPLAY === */
function initVideoAutoplay(){
const vids=$$('video[data-autoplay-scroll]');if(!vids.length)return;
const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.play().catch(()=>{});else e.target.pause()})},{threshold:0.3});
vids.forEach(v=>obs.observe(v));
}
initVideoAutoplay();

/* === SMOOTH SCROLL ANCHORS === */
$$('a[href^="#"]').forEach(a=>{a.addEventListener('click',function(e){const id=this.getAttribute('href');if(id==='#')return;const t=$(id);if(t){e.preventDefault();const off=header?header.offsetHeight:0;window.scrollTo({top:t.getBoundingClientRect().top+window.pageYOffset-off,behavior:'smooth'})}})});

/* === UTILITY INITS === */
function initAddressToggle(){$$('[data-toggle-address]').forEach(function(b){b.addEventListener('click',function(){var id=this.getAttribute('data-toggle-address');var el=document.getElementById(id);if(el)el.style.display=el.style.display==='none'?'block':'none'})});
$$('[data-delete-address]').forEach(function(b){b.addEventListener('click',function(){if(!confirm('Are you sure you want to delete this address?'))return;var url=this.getAttribute('data-delete-url');if(url)Shopify.postLink(url,{parameters:{_method:'delete'}})})})}
function initCollectionSort(){var sel=$('[data-sort-collection]');if(sel)sel.addEventListener('change',function(){window.location.href=this.value})}

/* === PRODUCT SHARE === */
function initProductShare(){
var btn=document.querySelector('[data-share-copy]');
if(!btn)return;
btn.addEventListener('click',function(){
var url=window.location.href;
if(navigator.clipboard&&window.isSecureContext){
navigator.clipboard.writeText(url).then(function(){btn.classList.add('copied');setTimeout(function(){btn.classList.remove('copied')},2000)});
}else{
var ta=document.createElement('textarea');ta.value=url;ta.style.cssText='position:fixed;opacity:0;pointer-events:none';document.body.appendChild(ta);ta.focus();ta.select();try{document.execCommand('copy')}catch(e){}document.body.removeChild(ta);
btn.classList.add('copied');setTimeout(function(){btn.classList.remove('copied')},2000);
}
});
}
initProductShare();

/* === PROMO CODE COPY === */
document.addEventListener('click',function(e){
var btn=e.target.closest('[data-copy-code]');
if(!btn)return;
var code=btn.getAttribute('data-copy-code');
if(!code)return;
function onCopied(){btn.classList.add('copied');btn.setAttribute('data-tip','Copied!');setTimeout(function(){btn.classList.remove('copied');btn.setAttribute('data-tip','Click to copy')},1500)}
if(navigator.clipboard&&window.isSecureContext){
navigator.clipboard.writeText(code).then(onCopied);
}else{
var ta=document.createElement('textarea');ta.value=code;ta.style.cssText='position:fixed;opacity:0;pointer-events:none';document.body.appendChild(ta);ta.focus();ta.select();try{document.execCommand('copy')}catch(e){}document.body.removeChild(ta);onCopied();
}
});

/* === SHOPIFY SECTION EVENTS === */
document.addEventListener('shopify:section:load',function(){initScrollAnimations();initSmoothReveal();initSectionReveals();initProductGallery();initProductOptions();initQuantitySelector();initCartPageQty();initAccordions();initLazyLoad();initCarousels();initHeroSlideshow();initVideoAutoplay();initFooterToggle();initAddToCart();initAddressToggle();initCollectionSort();initParallax();initMagneticButtons();initSplitText();initCounterAnimations();initImageReveals();initBuyNow();initProductLightbox();initSizeChartTabs();initProductShare();});

/* === PARALLAX SCROLLING === */
function initParallax(){
var els=$$('[data-parallax]');if(!els.length)return;
if(window.innerWidth<769)return; /* disable on mobile for perf */
var ticking=false;
function updateParallax(){
var st=window.pageYOffset;
els.forEach(function(el){
var rect=el.getBoundingClientRect();
var speed=parseFloat(el.getAttribute('data-parallax'))||0.06;
if(rect.bottom>0&&rect.top<window.innerHeight){
var yPos=-(st-el.offsetTop+window.innerHeight)*speed;
el.style.transform='translate3d(0,'+yPos+'px,0)';
}
});
ticking=false;
}
window.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(updateParallax)}},{passive:true});
updateParallax();
}

/* === MAGNETIC BUTTONS === */
function initMagneticButtons(){
if(window.innerWidth<1025||'ontouchstart' in window)return;
$$('.btn--magnetic').forEach(function(btn){
btn.addEventListener('mousemove',function(e){
var rect=this.getBoundingClientRect();
var x=(e.clientX-rect.left-rect.width/2)*0.3;
var y=(e.clientY-rect.top-rect.height/2)*0.3;
this.style.transform='translate3d('+x+'px,'+y+'px,0)';
});
btn.addEventListener('mouseleave',function(){
this.style.transform='translate3d(0,0,0)';
});
});
}

/* === TEXT SPLIT ANIMATIONS === */
function initSplitText(){
$$('.split-words:not(.split-done)').forEach(function(el){
var text=el.textContent.trim();
var words=text.split(/\s+/);
el.innerHTML='';
words.forEach(function(word,i){
var span=document.createElement('span');
span.className='word';
var inner=document.createElement('span');
inner.className='word-inner';
inner.textContent=word;
span.appendChild(inner);
el.appendChild(span);
if(i<words.length-1){el.appendChild(document.createTextNode(' '))}
});
el.classList.add('split-done');
});

$$('.split-chars:not(.split-done)').forEach(function(el){
var text=el.textContent.trim();
el.innerHTML='';
for(var i=0;i<text.length;i++){
if(text[i]===' '){
el.appendChild(document.createTextNode(' '));
}else{
var span=document.createElement('span');
span.className='char';
span.textContent=text[i];
span.style.transitionDelay=(i*30)+'ms';
el.appendChild(span);
}
}
el.classList.add('split-done');
});
}

/* === CUSTOM CURSOR === */
function initCustomCursor(){
var cursor=$('.cursor-follower');
var dot=$('.cursor-follower-dot');
if(!cursor||!dot||window.innerWidth<1025||'ontouchstart' in window)return;

var cx=0,cy=0,dx=0,dy=0;
document.addEventListener('mousemove',function(e){cx=e.clientX;cy=e.clientY;
if(!cursor.classList.contains('visible')){cursor.classList.add('visible');dot.classList.add('visible')}
},{passive:true});

function animate(){
dx+=(cx-dx)*0.15;dy+=(cy-dy)*0.15;
cursor.style.transform='translate3d('+(dx-18)+'px,'+(dy-18)+'px,0)';
dot.style.transform='translate3d('+(cx-2.5)+'px,'+(cy-2.5)+'px,0)';
requestAnimationFrame(animate);
}
animate();

/* Hover detection for interactive elements */
var hoverTargets='a,button,.btn,.product-card,.carousel__btn,.hero-slider__arrow,input,textarea,select';
document.addEventListener('mouseover',function(e){
if(e.target.closest(hoverTargets)){cursor.classList.add('hovering')}
},{passive:true});
document.addEventListener('mouseout',function(e){
if(e.target.closest(hoverTargets)){cursor.classList.remove('hovering')}
},{passive:true});
}

/* === COUNTER ANIMATIONS === */
function initCounterAnimations(){
var counters=$$('[data-count-to]');if(!counters.length)return;
if(!('IntersectionObserver' in window)){
counters.forEach(function(el){el.textContent=el.getAttribute('data-count-to')});
return;
}
var obs=new IntersectionObserver(function(entries){
entries.forEach(function(entry){
if(entry.isIntersecting){
var el=entry.target;
var target=parseInt(el.getAttribute('data-count-to'))||0;
var duration=parseInt(el.getAttribute('data-count-duration'))||2000;
var start=0;var startTime=null;
function step(timestamp){
if(!startTime)startTime=timestamp;
var progress=Math.min((timestamp-startTime)/duration,1);
/* easeOutQuart */
var eased=1-Math.pow(1-progress,4);
el.textContent=Math.floor(eased*target);
if(progress<1)requestAnimationFrame(step);
else el.textContent=target;
}
requestAnimationFrame(step);
obs.unobserve(el);
}
});
},{threshold:0.3});
counters.forEach(function(el){obs.observe(el)});
}

/* === IMAGE REVEAL ON SCROLL === */
function initImageReveals(){
var reveals=$$('.image-reveal:not(.animated)');if(!reveals.length)return;
if(!('IntersectionObserver' in window)){
reveals.forEach(function(el){el.classList.add('animated')});
return;
}
var obs=new IntersectionObserver(function(entries){
entries.forEach(function(entry){
if(entry.isIntersecting){
entry.target.classList.add('animated');
obs.unobserve(entry.target);
}
});
},{threshold:0.2,rootMargin:'0px 0px -50px 0px'});
reveals.forEach(function(el){obs.observe(el)});
}

/* === CART CELEBRATION — Confetti burst === */
function triggerCartCelebration(){
var container=document.getElementById('cart-celebration');
if(!container)return;
/* Only trigger once per drawer open cycle */
if(container._celebrating)return;
container._celebrating=true;
var colors=['#d4a853','#c1272d','#0c0c0c','#e5e0d8','#8a8278','#f6f4f0'];
var frag=document.createDocumentFragment();
for(var i=0;i<40;i++){
var p=document.createElement('div');
p.className='confetti-piece';
p.style.left=Math.random()*100+'%';
p.style.top='-10px';
p.style.background=colors[Math.floor(Math.random()*colors.length)];
p.style.animationDelay=(Math.random()*0.6)+'s';
p.style.animationDuration=(1.2+Math.random()*1)+'s';
var size=4+Math.random()*8;
p.style.width=size+'px';
p.style.height=size+'px';
frag.appendChild(p);
}
container.appendChild(frag);
setTimeout(function(){container.innerHTML='';container._celebrating=false},2500);
}

/* === PRODUCT LIGHTBOX === */
function initProductLightbox(){
var gallery=document.querySelector('.product-gallery--slider')||document.querySelector('.product-gallery');
if(!gallery)return;
var images=[];
function escAttr(s){return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
gallery.querySelectorAll('.product-gallery__slide img, .product-gallery__main img').forEach(function(img){
var src=img.getAttribute('src');
if(img.srcset){
var parts=img.srcset.split(',').map(function(s){return s.trim()});
var last=parts[parts.length-1].split(' ')[0];
if(last)src=last;
}
images.push({src:src,alt:img.alt||''});
});
if(!images.length)return;
/* Build lightbox DOM */
var lb=document.createElement('div');
lb.className='product-lightbox';
lb.setAttribute('role','dialog');
lb.setAttribute('aria-label','Product image gallery');
var h='<div class="product-lightbox__toolbar">';
h+='<span class="product-lightbox__counter"><span data-lb-cur>1</span> / '+images.length+'</span>';
h+='<button class="product-lightbox__close" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
h+='</div>';
h+='<div class="product-lightbox__main">';
h+='<button class="product-lightbox__arrow product-lightbox__arrow--prev" aria-label="Previous"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg></button>';
h+='<img class="product-lightbox__image" src="" alt="" draggable="false">';
h+='<button class="product-lightbox__arrow product-lightbox__arrow--next" aria-label="Next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 6 15 12 9 18"/></svg></button>';
h+='</div>';
h+='<div class="product-lightbox__thumbs">';
for(var i=0;i<images.length;i++){
h+='<div class="product-lightbox__thumb'+(i===0?' active':'')+'" data-lb-index="'+i+'">';
h+='<img src="'+images[i].src.replace(/width:\d+/,'width:150')+'" alt="'+escAttr(images[i].alt)+'" loading="lazy">';
h+='</div>';
}
h+='</div>';
lb.innerHTML=h;
document.body.appendChild(lb);
var mainImg=lb.querySelector('.product-lightbox__image');
var thumbs=lb.querySelectorAll('.product-lightbox__thumb');
var counter=lb.querySelector('[data-lb-cur]');
var cur=0;
function show(idx){
if(idx<0)idx=images.length-1;
if(idx>=images.length)idx=0;
cur=idx;
mainImg.style.opacity='0';
mainImg.style.transform='scale(0.96)';
setTimeout(function(){
mainImg.src=images[cur].src;
mainImg.alt=images[cur].alt;
mainImg.style.opacity='1';
mainImg.style.transform='scale(1)';
},150);
thumbs.forEach(function(t,ti){t.classList.toggle('active',ti===cur)});
counter.textContent=cur+1;
var activeThumb=thumbs[cur];
if(activeThumb)activeThumb.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
}
function open(idx){
show(idx||0);
lb.classList.add('open');
document.body.classList.add('overflow-hidden');
}
function close(){
lb.classList.remove('open');
document.body.classList.remove('overflow-hidden');
}
/* Open on gallery image click */
gallery.querySelectorAll('.product-gallery__slide, .product-gallery__main').forEach(function(el,i){
el.addEventListener('click',function(e){
if(e.target.closest('.product-gallery__dot'))return;
if(gallery._isDragged)return;
var slideIdx=0;
var slide=e.target.closest('.product-gallery__slide');
if(slide){
var allSlides=gallery.querySelectorAll('.product-gallery__slide');
for(var s=0;s<allSlides.length;s++){if(allSlides[s]===slide){slideIdx=s;break}}
}
open(slideIdx);
});
});
/* Close */
lb.querySelector('.product-lightbox__close').addEventListener('click',close);
lb.querySelector('.product-lightbox__main').addEventListener('click',function(e){
if(e.target===this)close();
});
/* Arrows */
lb.querySelector('.product-lightbox__arrow--prev').addEventListener('click',function(e){e.stopPropagation();show(cur-1)});
lb.querySelector('.product-lightbox__arrow--next').addEventListener('click',function(e){e.stopPropagation();show(cur+1)});
/* Thumb clicks */
thumbs.forEach(function(t){
t.addEventListener('click',function(){show(parseInt(this.getAttribute('data-lb-index')))});
});
/* Keyboard */
document.addEventListener('keydown',function(e){
if(!lb.classList.contains('open'))return;
if(e.key==='Escape')close();
if(e.key==='ArrowLeft')show(cur-1);
if(e.key==='ArrowRight')show(cur+1);
});
/* Touch swipe on lightbox main image */
var lbStartX=0,lbStartY=0,lbIsH=null;
lb.querySelector('.product-lightbox__main').addEventListener('touchstart',function(e){
lbStartX=e.touches[0].clientX;
lbStartY=e.touches[0].clientY;
lbIsH=null;
},{passive:true});
lb.querySelector('.product-lightbox__main').addEventListener('touchend',function(e){
var dx=e.changedTouches[0].clientX-lbStartX;
var dy=e.changedTouches[0].clientY-lbStartY;
if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>50){
if(dx<0)show(cur+1);else show(cur-1);
}else if(Math.abs(dy)>80&&dy>0){
close();
}
});
}
initProductLightbox();

var BUYNOW_ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>';
function setBuyNowState(state,origMap){
document.querySelectorAll('[data-buy-now]').forEach(function(b){
if(state==='loading'){b.disabled=true;b.classList.add('is-loading');b.innerHTML='<span class="btn-spinner"></span> Processing...';}
else if(state==='redirecting'){b.innerHTML='<span class="btn-spinner"></span> Redirecting...';}
else if(state==='error'){b.classList.remove('is-loading');b.innerHTML='Error \u2014 Try Again';}
else if(state==='reset'){b.disabled=false;b.classList.remove('is-loading');b.innerHTML=BUYNOW_ICON+' Buy Now';}
});
}
function initBuyNow(){
if(initBuyNow._bound)return;
initBuyNow._bound=true;
document.addEventListener('click',function(e){
var btn=e.target.closest('[data-buy-now]');
if(!btn)return;
if(btn.hasAttribute('data-inline-buy-now'))return;
e.preventDefault();
e.stopPropagation();
var productForm=btn.closest('[data-product-form]')||document.querySelector('[data-product-form]');
if(!productForm)return;
var variantInput=productForm.querySelector('input[name="id"]');
var qtyInput=productForm.querySelector('input[name="quantity"]');
if(!variantInput)return;
if(btn.classList.contains('is-loading'))return;
triggerShopflowBuyNow(btn);
});
}
initBuyNow();

/* Reset CTA buttons when page is restored from bfcache (back/forward navigation) */
window.addEventListener('pageshow',function(e){
if(e.persisted){
/* Reset all Buy Now buttons */
window.__buyNowInProgress=false;
setBuyNowState('reset');
/* Reset all Add to Cart submit buttons */
document.querySelectorAll('[data-add-to-cart] [type="submit"],[data-product-form] [type="submit"]').forEach(function(btn){resetATCBtn(btn)});
/* Re-trigger hero animations on bfcache restore */
document.querySelectorAll('.hero-slide--active .hero-slide__subtitle, .hero-slide--active .hero-slide__title, .hero-slide--active .hero-slide__btn').forEach(function(el){
el.style.opacity='1';
el.style.transform='none';
el.style.animation='none';
});
}
});

/* === SMOOTH PAGE TRANSITIONS === */
(function(){
if(!document.startViewTransition)return; /* only for browsers that support View Transitions */
document.addEventListener('click',function(e){
var link=e.target.closest('a[href]');
if(!link)return;
var href=link.getAttribute('href');
if(!href||href.startsWith('#')||href.startsWith('javascript:')||link.target==='_blank'||e.ctrlKey||e.metaKey||e.shiftKey)return;
/* Only internal same-origin links */
try{var url=new URL(href,window.location.origin);if(url.origin!==window.location.origin)return}catch(err){return}
e.preventDefault();
document.startViewTransition(function(){window.location.href=href});
});
})();

/* === ANNOUNCEMENT COUNTDOWN TIMER === */
function initAnnouncementTimer(){
  var el=document.getElementById('ann-countdown');
  if(!el)return;
  var endStr=el.getAttribute('data-end');
  if(!endStr)return;
  var end=new Date(endStr).getTime();
  if(isNaN(end))return;
  var hEl=document.getElementById('ann-hours');
  var mEl=document.getElementById('ann-mins');
  var sEl=document.getElementById('ann-secs');
  if(!hEl||!mEl||!sEl)return;
  function pad(n){return String(n).padStart(2,'0')}
  function tick(){
    var diff=end-Date.now();
    if(diff<=0){
      hEl.textContent=mEl.textContent=sEl.textContent='00';
      return;
    }
    hEl.textContent=pad(Math.floor(diff/3600000));
    mEl.textContent=pad(Math.floor((diff%3600000)/60000));
    sEl.textContent=pad(Math.floor((diff%60000)/1000));
  }
  tick();
  setInterval(tick,1000);
}

/* === DOM READY === */
document.addEventListener('DOMContentLoaded',function(){
/* Priority inits */
initAnnouncementTimer();
initScrollAnimations();initSmoothReveal();initParallax();initMagneticButtons();initSplitText();initCustomCursor();initCounterAnimations();initImageReveals();
/* Defer non-critical inits to idle time */
var idle=window.requestIdleCallback||function(fn){setTimeout(fn,200)};
idle(function(){
initSectionReveals();initAddressToggle();initCollectionSort();initFooterToggle();
setTimeout(function(){var hasOpen=document.querySelector('.cart-drawer.open')||document.querySelector('.header-search.open')||document.querySelector('.newsletter-popup-overlay.open')||document.querySelector('.site-header__nav.open');if(!hasOpen)document.body.classList.remove('overflow-hidden')},800);
});
});
})();
