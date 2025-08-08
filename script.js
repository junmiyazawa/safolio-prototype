
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
