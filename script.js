
// Lightweight analytics
(function(){
  const KEY='safolio_metrics';
  function load(){ try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}} }
  function save(d){ localStorage.setItem(KEY, JSON.stringify(d)); }
  window.SA={track:(ev,data)=>{const m=load();m.events=m.events||{};m.events[ev]=(m.events[ev]||0)+1;m.log=m.log||[];m.log.unshift({t:Date.now(),ev,data});m.log=m.log.slice(0,100);save(m);},get:()=>load(),reset:()=>localStorage.removeItem(KEY)};
  SA.track('pageview',{path:location.pathname});
})();

// Watermark config
window.WM={alpha:0.25,scale:0.035,pos:'br'};

function loadCanvasWithWatermark(src,text,enabled){
  var canvas=document.getElementById('wmCanvas'); if(!canvas) return;
  var ctx=canvas.getContext('2d'); var img=new Image();
  img.onload=function(){
    var maxW=canvas.clientWidth||900, ratio=img.height/img.width, w=maxW, h=Math.round(w*ratio);
    canvas.width=w; canvas.height=h; ctx.clearRect(0,0,w,h); ctx.drawImage(img,0,0,w,h);
    if(enabled){
      ctx.globalAlpha=WM.alpha; ctx.font=Math.floor(w*WM.scale)+'px sans-serif'; ctx.fillStyle='#2B4B7C';
      ctx.textAlign=(WM.pos.slice(-1)=='r'?'right':'left'); ctx.textBaseline=(WM.pos.charAt(0)=='t'?'top':'bottom');
      var pad=Math.floor(w*0.02); var x=(WM.pos.slice(-1)=='r')?(w-pad):pad; var y=(WM.pos.charAt(0)=='t')?pad:(h-pad);
      ctx.fillText(text||'© Do Not Train | Safolio', x, y); ctx.globalAlpha=1;
    }
  };
  img.src=src;
}
function generateShareLinkForWork(workId,hours){
  hours = hours||24;
  var exp=Date.now()+hours*60*60*1000; var payload={exp:exp,v:2,workId:workId};
  var b64=btoa(JSON.stringify(payload)); var base=location.origin+location.pathname.replace(/\/portfolio\.html$/, '/');
  return base+'protected.html?t='+encodeURIComponent(b64);
}

document.addEventListener('DOMContentLoaded', function(){
  var modal=document.getElementById('modal'); if(!modal) return;
  var body=modal.querySelector('.body');
  // ensure canvas
  var canvas=document.createElement('canvas'); canvas.id='wmCanvas'; canvas.style.cssText='width:100%;border-radius:8px;border:1px solid #eee;max-height:70vh';
  body.insertBefore(canvas, body.firstChild);
  // controls
  var controls=document.createElement('div'); controls.setAttribute('data-controls','wm'); controls.style.cssText='display:flex;gap:10px;flex-wrap:wrap;margin:8px 0';
  controls.innerHTML='\
    <button class="btn" id="wmToggle" type="button">透かしON<\/button>\
    <a class="btn" id="detailBtn" href="#">詳細ページへ<\/a>\
    <a class="btn" id="shareBtn" href="#">限定公開リンクを生成<\/a>\
    <a class="btn" id="inquiryBtn" href="#">依頼する<\/a>\
    <a class="btn" id="reportBtn" href="#">不正利用を報告<\/a>\
    <select id="expirySel" style="padding:8px;border-radius:10px;border:1px solid #e5e7eb">\
      <option value="1">有効期限: 1h<\/option><option value="24" selected>有効期限: 24h<\/option><option value="168">有効期限: 7d<\/option>\
    <\/select>\
    <select id="wmPos" style="padding:8px;border-radius:10px;border:1px solid #e5e7eb">\
      <option value="br" selected>位置: 右下<\/option><option value="bl">左下<\/option><option value="tr">右上<\/option><option value="tl">左上<\/option>\
    <\/select>\
    <span class="small">濃さ<\/span><input type="range" id="wmAlpha" min="0.05" max="0.6" step="0.05" value="0.25" style="width:160px">\
    <span class="small">サイズ<\/span><input type="range" id="wmScale" min="0.02" max="0.08" step="0.005" value="0.035" style="width:160px">';
  body.insertBefore(controls, body.children[1] || null);

  var currentWorkId=1, wmOn=false;

  document.querySelectorAll('.gallery img, .tile img').forEach(function(img){
    img.addEventListener('click', function(e){
      var tile=e.target.closest('[data-id]')||e.target; var altId=(e.target.getAttribute('alt')||'').replace(/^w/,'');
      currentWorkId=parseInt(tile.getAttribute('data-id')||altId||'1',10); wmOn=false;
      loadCanvasWithWatermark('assets/work_'+currentWorkId+'.png', undefined, wmOn);
      modal.style.display='flex'; SA.track('modal_open',{id:currentWorkId});
    });
  });
  document.getElementById('wmToggle').addEventListener('click', function(){ wmOn=!wmOn; this.textContent=wmOn?'透かしOFF':'透かしON'; loadCanvasWithWatermark('assets/work_'+currentWorkId+'.png', undefined, wmOn); });
  document.getElementById('detailBtn').addEventListener('click', function(e){ e.preventDefault(); location.href='work.html?id='+currentWorkId; });
  document.getElementById('shareBtn').addEventListener('click', function(e){
    e.preventDefault(); var hours=parseInt(document.getElementById('expirySel').value,10)||24;
    var url=generateShareLinkForWork(currentWorkId,hours); navigator.clipboard&&navigator.clipboard.writeText(url);
    alert('限定公開リンクをコピーしました\n有効期限：'+hours+'時間\n'+url); SA.track('share_generate',{id:currentWorkId,hours:hours});
  });
  document.getElementById('inquiryBtn').addEventListener('click', function(e){ e.preventDefault(); location.href='inquiry.html?id='+currentWorkId; });
  document.getElementById('reportBtn').addEventListener('click', function(e){
    e.preventDefault(); var mail='mailto:ckonsaru@gmail.com'+encodeURIComponent('[Safolio 不正利用報告] 作品ID:'+currentWorkId)+'&body='+encodeURIComponent('作品ID:'+currentWorkId+'\nURL:'+location.href);
    SA.track('report_open',{id:currentWorkId}); location.href=mail;
  });
  document.getElementById('wmPos').addEventListener('change', function(e){ WM.pos=this.value; loadCanvasWithWatermark('assets/work_'+currentWorkId+'.png', undefined, wmOn); SA.track('wm_pos',{pos:WM.pos}); });
  document.getElementById('wmAlpha').addEventListener('input', function(e){ WM.alpha=parseFloat(this.value); loadCanvasWithWatermark('assets/work_'+currentWorkId+'.png', undefined, wmOn); SA.track('wm_alpha',{a:WM.alpha}); });
  document.getElementById('wmScale').addEventListener('input', function(e){ WM.scale=parseFloat(this.value); loadCanvasWithWatermark('assets/work_'+currentWorkId+'.png', undefined, wmOn); SA.track('wm_scale',{s:WM.scale}); });
});
