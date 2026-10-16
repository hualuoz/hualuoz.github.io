(()=>{
  /* ---- BGM：默认开启（首次交互后播放），可关闭，跨页面续播 ---- */
  const btns=[...document.querySelectorAll('[data-bgm]')];
  const SRC='/assets/audio/pixel-dreams.mp3',VOL=.18;
  let au=null,on=false,fadeT=null;
  const wantOn=()=>localStorage.getItem('bgm')!=='off';
  const ui=v=>{on=v;btns.forEach(b=>{b.classList.toggle('is-on',v);b.setAttribute('aria-pressed',v);const t=b.querySelector('.bgm__s');if(t)t.textContent=v?'开':'关';b.title=v?'关闭背景音乐':'开启背景音乐'})};
  const fade=(to,ms,done)=>{clearInterval(fadeT);const from=au.volume,st=Date.now();fadeT=setInterval(()=>{const k=Math.min(1,(Date.now()-st)/ms);au.volume=from+(to-from)*k;if(k>=1){clearInterval(fadeT);done&&done()}},40)};
  const make=()=>{if(au)return au;au=new Audio(SRC);au.loop=true;au.preload='auto';au.volume=0;
    const t=parseFloat(sessionStorage.getItem('bgm-t')||'0');if(t>0)au.addEventListener('loadedmetadata',()=>{try{au.currentTime=t%(au.duration||t+1)}catch(e){}},{once:true});return au};
  const play=async()=>{make();try{await au.play();ui(true);fade(VOL,900);return true}catch(e){ui(false);return false}};
  const stop=()=>{if(!au){ui(false);return}ui(false);fade(0,300,()=>au.pause())};
  btns.forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();if(on){localStorage.setItem('bgm','off');stop()}else{localStorage.removeItem('bgm');play()}}));
  const kick=e=>{if(e&&e.target&&e.target.closest&&e.target.closest('[data-bgm]'))return;if(wantOn()&&!on)play();['pointerdown','keydown','touchstart'].forEach(n=>removeEventListener(n,kick,true))};
  if(btns.length){
    ui(false);
    if(wantOn()){
      if(sessionStorage.getItem('bgm-p')==='1')play();
      ['pointerdown','keydown','touchstart'].forEach(n=>addEventListener(n,kick,{capture:true,passive:true}));
    }
    addEventListener('pagehide',()=>{if(au){sessionStorage.setItem('bgm-t',String(au.currentTime||0))}sessionStorage.setItem('bgm-p',on?'1':'0')});
    document.addEventListener('visibilitychange',()=>{if(!au)return;if(document.hidden){if(on)au.pause()}else if(on)au.play().catch(()=>{})});
  }

  /* ---- 章节地图 ---- */
  const chl=[...document.querySelectorAll('[data-chl]')];
  if(chl.length&&'IntersectionObserver' in window){
    const co=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)chl.forEach(a=>a.classList.toggle('is-on',a.dataset.chl===e.target.id))}),{rootMargin:'-40% 0px -55% 0px'});
    chl.forEach(a=>{const t=document.getElementById(a.dataset.chl);t&&co.observe(t)});
  }

  const rv=document.querySelectorAll('.rv');
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});
    rv.forEach(el=>io.observe(el));
    const vo=new IntersectionObserver(es=>es.forEach(e=>{const v=e.target;e.isIntersecting?v.play().catch(()=>{}):v.pause()}),{threshold:.2});
    document.querySelectorAll('video[data-autoplay]').forEach(v=>vo.observe(v));
  } else rv.forEach(el=>el.classList.add('in'));

  document.querySelectorAll('[data-copy]').forEach(b=>b.addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(b.dataset.copy)}catch(e){const t=document.createElement('textarea');t.value=b.dataset.copy;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove()}
    const o=b.textContent;b.textContent='已复制';b.classList.add('is-done');setTimeout(()=>{b.textContent=o;b.classList.remove('is-done')},1600);
  }));

  document.querySelectorAll('[data-tabs]').forEach(t=>{
    const tabs=[...t.querySelectorAll('[role=tab]')];
    const sel=b=>{tabs.forEach(x=>{const on=x===b;x.setAttribute('aria-selected',on);x.tabIndex=on?0:-1;document.getElementById(x.getAttribute('aria-controls')).hidden=!on})};
    tabs.forEach((b,n)=>{b.addEventListener('click',()=>sel(b));b.addEventListener('keydown',e=>{const d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(d){const nb=tabs[(n+d+tabs.length)%tabs.length];nb.focus();sel(nb)}})});
  });

  const all=[...document.querySelectorAll('[data-lb]')];let items=all;
  if(all.length){
    const lb=document.createElement('div');lb.className='lb';lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');lb.setAttribute('aria-label','图片查看');
    lb.innerHTML='<img alt=""><div class="lb__cap"></div><button class="lb__btn lb__close" aria-label="关闭">✕</button><button class="lb__btn lb__prev" aria-label="上一张">←</button><button class="lb__btn lb__next" aria-label="下一张">→</button>';
    document.body.appendChild(lb);
    const img=lb.querySelector('img'),cap=lb.querySelector('.lb__cap');let i=0,last=null;
    const show=n=>{i=(n+items.length)%items.length;const it=items[i];img.src=it.dataset.lb;img.alt=it.dataset.cap||'';cap.textContent=(it.dataset.cap||'')+'  ·  '+(i+1)+' / '+items.length};
    const open=n=>{last=document.activeElement;show(n);lb.classList.add('is-open');document.body.style.overflow='hidden';lb.querySelector('.lb__close').focus()};
    const close=()=>{lb.classList.remove('is-open');document.body.style.overflow='';last&&last.focus()};
    all.forEach(it=>it.addEventListener('click',e=>{e.preventDefault();const g=it.closest('[data-lbg]');items=g?[...g.querySelectorAll('[data-lb]')]:all.filter(x=>!x.closest('[data-lbg]'));open(items.indexOf(it))}));
    lb.querySelector('.lb__close').onclick=close;lb.querySelector('.lb__prev').onclick=()=>show(i-1);lb.querySelector('.lb__next').onclick=()=>show(i+1);
    lb.addEventListener('click',e=>{if(e.target===lb)close()});
    addEventListener('keydown',e=>{if(!lb.classList.contains('is-open'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(i-1);if(e.key==='ArrowRight')show(i+1)});
  }
})();
