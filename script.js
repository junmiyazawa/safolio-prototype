
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
