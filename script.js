
document.addEventListener('DOMContentLoaded', () => {
  const drop = document.querySelector('.uploader');
  if (drop){
    ['dragenter','dragover'].forEach(ev=>drop.addEventListener(ev, e=>{e.preventDefault();drop.classList.add('drag')}));
    ['dragleave','drop'].forEach(ev=>drop.addEventListener(ev, e=>{e.preventDefault();drop.classList.remove('drag')}));
  }
  const range = document.getElementById('strength');
  const preview = document.getElementById('preview');
  function updatePreview(){
    if (!range || !preview) return;
    const v = parseInt(range.value,10);
    let src = 'assets/preview_processed_weak.png';
    if (v<34) src = 'assets/preview_processed_weak.png';
    else if (v<67) src = 'assets/preview_processed_medium.png';
    else src = 'assets/preview_processed_strong.png';
    preview.src = src;
    document.getElementById('strengthVal').textContent = v;
  }
  if (range){
    range.addEventListener('input', updatePreview);
    updatePreview();
  }
  const modal = document.getElementById('modal');
  if (modal){
    document.querySelectorAll('.tile img').forEach(img=>{
      img.addEventListener('click', ()=>{
        modal.querySelector('img').src = img.src;
        modal.style.display='flex';
      });
    });
    modal.querySelector('.close').addEventListener('click', ()=> modal.style.display='none');
    modal.addEventListener('click', (e)=>{ if(e.target===modal) modal.style.display='none'; });
  }
});

// --- Limited-access link generation ---
function generateShareLink(hours=6){
  const exp = Date.now() + hours*60*60*1000;
  const payload = { exp, v: 1 };
  const b64 = btoa(JSON.stringify(payload));
  const url = location.origin + location.pathname.replace(/\/portfolio\.html$/, '/') + 'protected.html?t=' + encodeURIComponent(b64);
  return url;
}
document.addEventListener('DOMContentLoaded', ()=>{
  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn){
    shareBtn.addEventListener('click', (e)=>{
      e.preventDefault();
      const url = generateShareLink(6);
      navigator.clipboard?.writeText(url);
      alert('限定公開リンクをコピーしました\n有効期限：6時間\n' + url);
    });
  }
});

// --- Tag filtering ---
function applyFilter(tag){
  document.querySelectorAll('#gallery .tile').forEach(el=>{
    const t = el.getAttribute('data-tag');
    el.style.display = (tag==='all' || t===tag) ? '' : 'none';
  });
}
document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelectorAll('button[data-filter]').forEach(btn=>{
    btn.addEventListener('click', ()=> applyFilter(btn.getAttribute('data-filter')));
  });
});

// ===== Portfolio modal: per-image context, watermark, and share =====
let currentWorkId = 1;
let currentImgURL = '';
function loadCanvasWithWatermark(src, text='© Do Not Train | Safolio', enabled=false){
  const canvas = document.getElementById('wmCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    // scale canvas to image aspect (fit width)
    const maxW = canvas.clientWidth || 900;
    const ratio = img.height / img.width;
    const w = maxW;
    const h = Math.round(w * ratio);
    canvas.width = w; canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);
    if(enabled){
      ctx.globalAlpha = 0.25;
      ctx.font = Math.floor(w*0.035) + 'px sans-serif';
      ctx.fillStyle = '#2B4B7C';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      const pad = Math.floor(w*0.02);
      ctx.fillText(text, w - pad, h - pad);
      ctx.globalAlpha = 1.0;
    }
  };
  img.src = src;
}
document.addEventListener('DOMContentLoaded', ()=>{
  const modal = document.getElementById('modal');
  if(!modal) return;
  const wmBtn = document.getElementById('wmToggle');
  const detailBtn = document.getElementById('detailBtn');
  let wmOn = false;

  // When clicking a tile, open modal with that work id
  document.querySelectorAll('.tile img').forEach(img=>{
    img.addEventListener('click', (e)=>{
      const tile = e.target.closest('.tile');
      currentWorkId = parseInt(tile.getAttribute('data-id'),10) || 1;
      currentImgURL = 'assets/work_' + currentWorkId + '.png';
      wmOn = false;
      if(wmBtn) wmBtn.textContent = '透かしON';
      loadCanvasWithWatermark(currentImgURL, undefined, wmOn);
      if(detailBtn) detailBtn.href = 'work.html?id=' + currentWorkId;
      modal.style.display='flex';
    });
  });
  if(wmBtn){
    wmBtn.addEventListener('click', ()=>{
      wmOn = !wmOn;
      wmBtn.textContent = wmOn ? '透かしOFF' : '透かしON';
      loadCanvasWithWatermark(currentImgURL, undefined, wmOn);
    });
  }
  const shareBtn = document.getElementById('shareBtn');
  if(shareBtn){
    shareBtn.addEventListener('click', (e)=>{
      e.preventDefault();
      const url = generateShareLinkForWork(currentWorkId, 6);
      navigator.clipboard?.writeText(url);
      alert('限定公開リンクをコピーしました\n有効期限：6時間\n' + url);
    });
  }
});
function generateShareLinkForWork(workId=1, hours=6){
  const exp = Date.now() + hours*60*60*1000;
  const payload = { exp, v: 2, workId };
  const b64 = btoa(JSON.stringify(payload));
  const base = location.origin + location.pathname.replace(/\/portfolio\.html$/, '/');
  return base + 'protected.html?t=' + encodeURIComponent(b64);
}
