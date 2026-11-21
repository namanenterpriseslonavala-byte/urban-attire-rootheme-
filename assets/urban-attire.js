(function(){
  var d=document,b=d.body,R=(window.Shopify&&Shopify.routes&&Shopify.routes.root)||'/';
  function q(s,c){return (c||d).querySelector(s)}
  function qa(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s))}
  function lock(on){b.classList.toggle('ua-lock',on)}

  // Menu overlay
  var menu=q('[data-ua-menu]');
  function setMenu(on){if(!menu)return;menu.classList.toggle('on',on);menu.setAttribute('aria-hidden',on?'false':'true');lock(on);if(on){var f=q('a,button',menu);f&&f.focus()}}
  qa('[data-open-menu]').forEach(function(x){x.addEventListener('click',function(){setMenu(true)})});
  qa('[data-close-menu]').forEach(function(x){x.addEventListener('click',function(){setMenu(false)})});

  // Transparent header over the home hero
  var hd=q('.ua-hd'),hero=q('.hero');
  if(b.classList.contains('template-index')&&hd&&hero){var f=function(){hd.classList.toggle('solid',window.scrollY>hero.offsetHeight-80)};window.addEventListener('scroll',f,{passive:true});f()}

  // Cart drawer
  var drawer=q('[data-ua-drawer]'),scrim=q('[data-ua-scrim]');
  var FREE=parseInt((drawer&&drawer.getAttribute('data-free'))||'249900',10);
  function openCart(){if(!drawer)return;drawer.classList.add('on');scrim.classList.add('on');drawer.setAttribute('aria-hidden','false');lock(true);var x=q('[data-close-cart]',drawer);x&&x.focus()}
  function closeCart(){if(!drawer)return;drawer.classList.remove('on');scrim.classList.remove('on');drawer.setAttribute('aria-hidden','true');lock(false)}
  qa('[data-close-cart]').forEach(function(x){x.addEventListener('click',closeCart)});
  scrim&&scrim.addEventListener('click',closeCart);
  d.addEventListener('keydown',function(e){if(e.key==='Escape'){closeCart();setMenu(false)}});

  function money(c){return '₹'+(c/100).toLocaleString('en-IN',{maximumFractionDigits:2})}
  function text(s){var t=d.createElement('span');t.textContent=s==null?'':String(s);return t.innerHTML}
  function img(u){return u?(u+(u.indexOf('?')>-1?'&':'?')+'width=240'):''}

  function render(cart){
    qa('[data-cart-count]').forEach(function(x){x.textContent=cart.item_count});
    if(!drawer)return;
    var list=q('[data-cart-items]',drawer),sub=q('[data-cart-subtotal]',drawer),prog=q('[data-cart-progress]',drawer),bar=q('[data-cart-bar]',drawer),go=q('[data-cart-go]',drawer);
    if(!cart.item_count){list.innerHTML=`<p class='dempty'>Your bag is empty.</p>`;go&&(go.hidden=true)}else{go&&(go.hidden=false);
      list.innerHTML=cart.items.map(function(it,i){
        var v=it.variant_title?`<div class='meta'>${text(it.variant_title)}</div>`:'';
        var pic=it.image?`<img src='${img(it.image)}' alt=''>`:'';
        return `<div class='li'><a class='im' href='${it.url}'>${pic}</a><div><div class='nm'>${text(it.product_title)}</div>${v}<div class='qp'><span class='qty'><button type='button' data-line='${i+1}' data-q='${it.quantity-1}' aria-label='Decrease quantity'>–</button><b class='tnum'>${it.quantity}</b><button type='button' data-line='${i+1}' data-q='${it.quantity+1}' aria-label='Increase quantity'>+</button></span><span class='tnum'>${money(it.final_line_price)}</span></div></div></div>`;
      }).join('');}
    sub.textContent=money(cart.total_price);
    var left=FREE-cart.total_price;
    prog.textContent=left>0?('You are '+money(left)+' away from free shipping.'):'You have unlocked free shipping.';
    bar.style.width=Math.min(100,cart.total_price/FREE*100)+'%';
  }
  function getCart(){return fetch(R+'cart.js',{headers:{Accept:'application/json'}}).then(function(r){return r.json()})}
  drawer&&drawer.addEventListener('click',function(e){var t=e.target.closest('[data-line]');if(!t)return;t.disabled=true;
    fetch(R+'cart/change.js',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({line:+t.getAttribute('data-line'),quantity:Math.max(0,+t.getAttribute('data-q'))})}).then(function(r){return r.json()}).then(render)});
  qa('[data-open-cart]').forEach(function(x){if(!drawer||b.classList.contains('template-cart'))return;x.addEventListener('click',function(e){e.preventDefault();getCart().then(function(c){render(c);openCart()})})});

  // Add to bag without leaving the page (falls back to /cart if JS fails)
  qa(`form[action*='/cart/add']`).forEach(function(f){f.addEventListener('submit',function(e){
    if(!drawer)return;e.preventDefault();var btn=q('[type=submit]',f),err=q('[data-add-error]',f);if(err)err.textContent='';btn&&(btn.disabled=true);
    fetch(R+'cart/add.js',{method:'POST',headers:{Accept:'application/json'},body:new FormData(f)})
      .then(function(r){return r.json().then(function(j){if(!r.ok)throw j;return j})})
      .then(getCart).then(function(c){render(c);openCart()})
      .catch(function(j){if(err)err.textContent=(j&&(j.description||j.message))||'Could not add to bag. Please try again.'})
      .then(function(){btn&&(btn.disabled=false)});
  })});

  // Quantity steppers
  qa('[data-step]').forEach(function(btn){btn.addEventListener('click',function(){var i=btn.parentNode.querySelector('input');var min=parseInt(i.getAttribute('min')||'0',10);i.value=Math.max(min,(parseInt(i.value,10)||0)+parseInt(btn.getAttribute('data-step'),10));if(btn.hasAttribute('data-autosubmit'))btn.form.submit()})});

  // Product gallery thumbnails
  var main=q('[data-main-img]');
  qa('[data-thumb]').forEach(function(t){t.addEventListener('click',function(){if(!main)return;main.src=t.getAttribute('data-full');main.alt=t.getAttribute('data-alt')||'';qa('[data-thumb]').forEach(function(o){o.setAttribute('aria-current','false')});t.setAttribute('aria-current','true')})});

  // Collection sort
  qa('[data-sort]').forEach(function(s){s.addEventListener('change',function(){var u=new URL(location.href);u.searchParams.set('sort_by',s.value);u.searchParams.delete('page');location.href=u.toString()})});
})();
