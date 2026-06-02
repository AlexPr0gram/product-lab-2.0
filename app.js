/* ============================================================
   Product Lab — interactions
   ============================================================ */
(function(){
  'use strict';

  /* ---- smooth scroll (Lenis) ---- */
  if(window.Lenis){
    var lenis = new window.Lenis({lerp:0.08, smoothWheel:true});
    function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }

  /* ---- header shadow + hide on scroll ---- */
  var header = document.querySelector('.header');
  var lastY = 0;
  function onScroll(){
    var y = window.scrollY;
    header.classList.toggle('scrolled', y > 8);
    header.classList.toggle('hidden', y > lastY && y > 80);
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  /* ---- smooth anchor scroll (offset for fixed header) ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var id = a.getAttribute('href');
      if(id.length < 2) return;
      var el = document.querySelector(id);
      if(!el) return;
      e.preventDefault();
      var top = el.getBoundingClientRect().top + window.pageYOffset - 24;
      window.scrollTo({top: top, behavior:'smooth'});
    });
  });

  /* ---- reveal on scroll ---- */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, {threshold:.12, rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });

  /* ---- cookie consent ---- */
  var cookieBar = document.getElementById('cookie-bar');
  var cookieOk  = document.getElementById('cookie-ok');
  if(cookieBar){
    if(localStorage.getItem('cookie_ok')){
      cookieBar.classList.add('hidden');
    }
    cookieOk.addEventListener('click', function(){
      localStorage.setItem('cookie_ok','1');
      cookieBar.classList.add('hidden');
    });
  }

  /* ---- modal ---- */
  var modal = document.getElementById('modal');
  var form  = document.getElementById('form');
  var modalBody = document.getElementById('modal-body');
  var modalSuccess = document.getElementById('modal-success');
  var lastFocus = null;
  function resetModal(){
    if(modalBody) modalBody.hidden = false;
    if(modalSuccess) modalSuccess.hidden = true;
    if(form) form.reset();
  }
  function openM(){
    lastFocus = document.activeElement;
    resetModal();
    modal.classList.add('open');
    document.body.classList.add('modal-open');
    setTimeout(function(){ var n=document.getElementById('name'); if(n) n.focus(); }, 90);
  }
  function closeM(){
    modal.classList.remove('open');
    document.body.classList.remove('modal-open');
    if(lastFocus) lastFocus.focus();
  }
  document.querySelectorAll('[data-open]').forEach(function(b){ b.addEventListener('click', openM); });
  document.querySelectorAll('[data-close]').forEach(function(b){ b.addEventListener('click', closeM); });
  modal.addEventListener('click', function(e){ if(e.target === modal) closeM(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && modal.classList.contains('open')) closeM(); });

  /* ---- phone mask ---- */
  var phone = document.getElementById('phone');
  function digits(s){ return (s.match(/\d/g) || []).join(''); }
  if(phone){
    phone.addEventListener('input', function(){
      var v = digits(phone.value);
      if(v[0] === '8') v = '7' + v.slice(1);
      if(v && v[0] !== '7') v = '7' + v;
      v = v.slice(0, 11);
      var tpl = '+_ (___) ___-__-__', i = 0, res = '';
      for(var k=0;k<tpl.length;k++){
        var ch = tpl[k];
        if(ch === '_'){ if(i < v.length) res += v[i++]; else break; }
        else if(i < v.length || k===0) res += ch;
      }
      phone.value = res.replace(/[\s\-()]+$/,'');
    });
  }
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      if(modalBody) modalBody.hidden = true;
      if(modalSuccess) modalSuccess.hidden = false;
    });
  }

  /* ============================================================
     Hero analytics — ProConcept (auto-animating cash-flow chart)
     ============================================================ */
  var chart = document.getElementById('ch-line');
  if(chart){
    var area   = document.getElementById('ch-area');
    var marker = document.getElementById('ch-marker');
    var zero   = document.getElementById('ch-zero');
    var kNpv   = document.getElementById('kpi-npv');
    var kIrr   = document.getElementById('kpi-irr');
    var kPay   = document.getElementById('kpi-pay');
    var tabs   = [].slice.call(document.querySelectorAll('.sc'));

    // cumulative cash flow by year (0..8), млрд ₽
    var SC = [
      { v:[-55,-64,-48,-22,2,14,24,31,36],  npv:36, irr:18, pay:'4.0' },  // Базовый
      { v:[-50,-56,-34,-6,22,40,54,64,71],  npv:71, irr:27, pay:'3.2' },  // Оптимистичный
      { v:[-58,-70,-60,-42,-28,-16,-8,-2,4],npv:4,  irr:9,  pay:'6.5' }   // Консервативный
    ];

    // geometry
    var W=340, plotL=12, plotR=328, plotT=16, plotB=132;
    var lo=-78, hi=80, n=9;
    function X(i){ return plotL + (plotR-plotL)*i/(n-1); }
    function Y(val){ return plotB - (val-lo)/(hi-lo)*(plotB-plotT); }
    zero.setAttribute('y1', Y(0)); zero.setAttribute('y2', Y(0));

    function smooth(pts){
      var d='M'+pts[0][0].toFixed(1)+','+pts[0][1].toFixed(1);
      for(var i=0;i<pts.length-1;i++){
        var p0=pts[i-1]||pts[i], p1=pts[i], p2=pts[i+1], p3=pts[i+2]||p2;
        var c1x=p1[0]+(p2[0]-p0[0])/6, c1y=p1[1]+(p2[1]-p0[1])/6;
        var c2x=p2[0]-(p3[0]-p1[0])/6, c2y=p2[1]-(p3[1]-p1[1])/6;
        d+=' C'+c1x.toFixed(1)+','+c1y.toFixed(1)+' '+c2x.toFixed(1)+','+c2y.toFixed(1)+' '+p2[0].toFixed(1)+','+p2[1].toFixed(1);
      }
      return d;
    }
    function draw(vals){
      var pts=vals.map(function(v,i){ return [X(i), Y(v)]; });
      var line=smooth(pts);
      chart.setAttribute('d', line);
      area.setAttribute('d', line+' L'+X(n-1).toFixed(1)+','+Y(0).toFixed(1)+' L'+X(0).toFixed(1)+','+Y(0).toFixed(1)+' Z');
      marker.setAttribute('cx', pts[n-1][0]); marker.setAttribute('cy', pts[n-1][1]);
    }

    var cur = SC[0].v.slice(), active=0;

    function morph(target){
      var from=cur.slice(), start=null, dur=720;
      function step(t){
        if(!start) start=t;
        var p=Math.min(1,(t-start)/dur), e=1-Math.pow(1-p,3);
        var now=from.map(function(f,i){ return f+(target[i]-f)*e; });
        draw(now);
        if(p<1) requestAnimationFrame(step); else cur=target.slice();
      }
      requestAnimationFrame(step);
    }
    function animNum(el, to, dur, fmt){
      var from=parseFloat(el.firstChild.nodeValue)||0, start=null;
      function step(t){
        if(!start) start=t;
        var p=Math.min(1,(t-start)/dur), e=1-Math.pow(1-p,3);
        el.firstChild.nodeValue=fmt(from+(to-from)*e);
        if(p<1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    function select(i, animate){
      active=i;
      var s=SC[i];
      tabs.forEach(function(t,k){ t.classList.toggle('active', k===i); });
      if(animate){
        morph(s.v);
        animNum(kNpv, s.npv, 700, function(v){ return (v>=0?'+':'')+Math.round(v)+' '; });
        animNum(kIrr, s.irr, 700, function(v){ return Math.round(v)+''; });
      } else {
        draw(s.v); cur=s.v.slice();
        kNpv.firstChild.nodeValue=(s.npv>=0?'+':'')+s.npv+' ';
        kIrr.firstChild.nodeValue=s.irr+'';
      }
      kPay.firstChild.nodeValue=s.pay+' ';
    }

    select(0,false);
    marker.classList.add('pulse');

    // auto-cycle through scenarios; pause on hover/interaction
    var timer, paused=false;
    function cycle(){ if(!paused){ select((active+1)%SC.length, true); } }
    function startTimer(){ clearInterval(timer); timer=setInterval(cycle, 4200); }
    startTimer();

    tabs.forEach(function(t){
      t.addEventListener('click', function(){ select(+t.dataset.sc, true); startTimer(); });
    });
    var simEl=document.querySelector('.sim');
    simEl.addEventListener('mouseenter', function(){ paused=true; });
    simEl.addEventListener('mouseleave', function(){ paused=false; });
  }
})();
