/* Urban Attire — edit mode.
   Turn on: add ?edit=1 to any store URL (stays on for this browser tab). Turn off: Exit button or ?edit=0.
   Double-click anything to open the exact place it is changed. Every admin link still requires Shopify staff login. */
(function(){
  var C=window.UA_EDIT||{},d=document;
  if(!C.domain)return;
  var on=false,design=!!C.design;
  try{var p=new URL(location.href).searchParams.get('edit');if(p==='1')sessionStorage.setItem('ua-edit','1');if(p==='0')sessionStorage.removeItem('ua-edit');on=sessionStorage.getItem('ua-edit')==='1'}catch(e){}
  if(!on&&!design)return;

  var A='https://'+C.domain+'/admin',T=String(C.theme||'');
  var NAMES={hero:'Hero banner',offer:'Offer banner',trust:'Trust strip',split:'Feature tiles',tiles:'Collection tiles','new':'Product row',cards:'Offer cards',edit:'Image with text',story:'Story',news:'Newsletter','ua-announcement':'Announcement bar',main:'Page layout'};
  function q(s){return d.querySelector(s)}
  function qa(s){return Array.prototype.slice.call(d.querySelectorAll(s))}
  function set(el,type,id,label){if(!el||el.hasAttribute('data-edit'))return;el.setAttribute('data-edit',type);if(id)el.setAttribute('data-edit-id',id);el.setAttribute('data-edit-label',label)}

  // Page-level regions that map to admin, not the theme editor
  if(C.product)set(q('.pdp'),'product',C.product.id,'Product: '+C.product.title+' (title, price, sizes, photos, description)');
  if(C.collection)set(q('.chero'),'collection',C.collection.id,'Collection: '+C.collection.title+' (name, description, which products)');
  set(q('.ua-hd .s.l'),'menu','','Main menu links');
  set(q('.ua-ft .row'),'menu','','Footer menu links');
  qa('.ua-logo').forEach(function(el){set(el,'theme','','Logo (theme code)')});
  qa('.o-code').forEach(function(el){set(el,'discounts','','Discount codes')});

  function find(el){if(!el||!el.closest)return null;return el.closest('[data-edit]')||el.closest('.shopify-section')}
  function info(t){
    var type=t.getAttribute('data-edit');
    if(!type){
      var key=(t.id||'').replace('shopify-section-','').split('__').pop();
      var nm=NAMES[key]||(key.charAt(0).toUpperCase()+key.slice(1)).split('-').join(' ');
      return {url:A+'/themes/'+T+'/editor?previewPath='+encodeURIComponent(C.path||'/'),label:'Section: '+nm+' (text, images, buttons, show/hide)'};
    }
    var id=t.getAttribute('data-edit-id');
    var map={product:A+'/products/'+id,collection:A+'/collections/'+id,menu:A+'/menus',discounts:A+'/discounts',theme:A+'/themes/'+T};
    return {url:map[type],label:t.getAttribute('data-edit-label')};
  }

  // Let a double-click win over a link click: links still open, 0.3s later, on a single click
  var nav=null;
  d.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href]');
    if(!a||a.hasAttribute('data-open-cart')||e.metaKey||e.ctrlKey||e.shiftKey||e.button!==0||!find(a))return;
    e.preventDefault();clearTimeout(nav);var h=a.href;nav=setTimeout(function(){location.href=h},320);
  },true);
  d.addEventListener('dblclick',function(e){
    var t=find(e.target);if(!t)return;
    if(design&&!t.hasAttribute('data-edit'))return; // inside Shopify's editor, one click already opens section settings
    clearTimeout(nav);e.preventDefault();
    try{window.getSelection().removeAllRanges()}catch(x){}
    var i=info(t);if(i.url)window.open(i.url,'_blank','noopener');
  });

  if(design)return;

  // Visible edit mode UI on the storefront
  var st=d.createElement('style');
  st.textContent=`[data-ua-hover]{outline:2px dashed #2f6fed!important;outline-offset:-2px}#ua-tip{position:fixed;z-index:2147483646;pointer-events:none;background:#111;color:#fff;font:12px/1.4 system-ui,sans-serif;padding:6px 10px;border-radius:4px;white-space:nowrap;display:none;max-width:90vw;overflow:hidden;text-overflow:ellipsis}#ua-pill{position:fixed;left:16px;bottom:16px;z-index:2147483647;display:flex;gap:14px;align-items:center;background:#111;color:#fff;font:12px/1.4 system-ui,sans-serif;padding:10px 16px;border-radius:999px;box-shadow:0 8px 28px rgba(0,0,0,.28)}#ua-pill button{all:unset;cursor:pointer;text-decoration:underline;text-underline-offset:3px}`;
  d.head.appendChild(st);
  var tip=d.createElement('div');tip.id='ua-tip';d.body.appendChild(tip);
  var pill=d.createElement('div');pill.id='ua-pill';pill.setAttribute('role','status');
  pill.innerHTML=`<span>Edit mode — double-click anything to change it</span><button type='button'>Exit</button>`;
  d.body.appendChild(pill);
  pill.querySelector('button').addEventListener('click',function(){try{sessionStorage.removeItem('ua-edit')}catch(x){}var u=new URL(location.href);u.searchParams.delete('edit');location.href=u.toString()});

  var cur=null;
  d.addEventListener('mouseover',function(e){
    var t=find(e.target);if(t===cur)return;
    if(cur)cur.removeAttribute('data-ua-hover');cur=t;
    if(t){t.setAttribute('data-ua-hover','');tip.textContent='Double-click to edit · '+info(t).label;tip.style.display='block'}else{tip.style.display='none'}
  });
  d.addEventListener('mousemove',function(e){tip.style.left=Math.max(8,Math.min(e.clientX+14,innerWidth-tip.offsetWidth-8))+'px';tip.style.top=Math.min(e.clientY+18,innerHeight-40)+'px'});
  d.documentElement.addEventListener('mouseleave',function(){tip.style.display='none'});
})();
