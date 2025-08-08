
// === JSON loader & renderer ===
(async function(){
  async function loadJSON(){
    try{
      const res = await fetch('works.json', { cache: 'no-store' });
      return await res.json();
    }catch(e){
      console.error('works.json を読み込めませんでした', e);
      return { works: [] };
    }
  }
  const data = await loadJSON();
  const list = data.works||[];

  // PORTFOLIO PAGE
  const gallery = document.getElementById('gallery');
  if (gallery){
    // build tag set
    const tagSet = new Set();
    list.forEach(w => (w.tags||[]).forEach(t => tagSet.add(t)));
    const filterBar = document.getElementById('filterBar');
    // add dynamic tag buttons
    tagSet.forEach(t => {
      const b = document.createElement('button');
      b.className='btn'; b.type='button'; b.dataset.filter=t; b.textContent=t;
      b.addEventListener('click', ()=>applyFilter(t));
      filterBar.insertBefore(b, document.getElementById('searchBox'));
    });

    // render tiles
    function render(items){
      gallery.innerHTML = items.map(w => `
        <div class="tile" data-id="${w.id}" data-tag="${(w.tags||[]).join(',')}">
          <img src="${w.src}" alt="${w.alt||('w'+w.id)}">
          <div class="shield">学習防止</div>
          <div class="small" style="padding:6px 2px">${(w.tags||[]).join(' / ')}</div>
        </div>`).join('');
      // bind clicks so modal opens (script.js expects .tile img)
      document.querySelectorAll('.tile img').forEach(img=>{
        img.addEventListener('click', ()=>{
          const tile = img.closest('.tile');
          const id = parseInt(tile.getAttribute('data-id'),10);
          window.__currentFromJSON = list.find(x=>x.id===id) || null;
          // populate title
          const mt = document.getElementById('modalTitle');
          if (mt && window.__currentFromJSON) mt.textContent = window.__currentFromJSON.title || '作品詳細';
          // open modal (script.js handles canvas drawing & buttons)
          const modal = document.getElementById('modal');
          if (modal){
            // set globals for watermark renderer
            window.currentWorkId = id;
            window.currentImgURL = (window.__currentFromJSON && window.__currentFromJSON.src) || `assets/work_${id}.png`;
            // initial draw
            if (typeof loadCanvasWithWatermark === 'function'){
              loadCanvasWithWatermark(window.currentImgURL, undefined, false);
            }
            modal.style.display='flex';
          }
        });
      });
    }
    render(list);

    // search
    const searchBox = document.getElementById('searchBox');
    searchBox.addEventListener('input', ()=>{
      const q = searchBox.value.trim();
      const items = list.filter(w => {
        const hay = (w.title||'') + ' ' + (w.description||'') + ' ' + (w.tags||[]).join(' ');
        return hay.toLowerCase().includes(q.toLowerCase());
      });
      render(items);
    });

    // filter function adapted to multi tag
    window.applyFilter = function(tag){
      if (tag==='all'){ render(list); return; }
      render(list.filter(w => (w.tags||[]).includes(tag)));
    };
  }

  // WORK PAGE
  if (location.pathname.endsWith('/work.html') || location.pathname.endsWith('work.html')){
    const p = new URLSearchParams(location.search);
    const id = parseInt(p.get('id')||'1',10);
    const w = list.find(x => x.id === id) || list[0];
    if (w){
      const title = document.getElementById('workTitle');
      if (title) title.textContent = w.title || ('作品 '+id);
      // draw
      window.currentWorkId = id;
      window.currentImgURL = w.src;
      if (typeof loadCanvasWithWatermark === 'function'){
        loadCanvasWithWatermark(w.src, undefined, false);
      }
      // inquiry/report buttons keep working (already bound in inline script or script.js)
      const inq = document.getElementById('inquiryBtn');
      if(inq){ inq.href = 'inquiry.html?id=' + id; }
      const share = document.getElementById('shareBtn');
      if(share){ share.addEventListener('click', ()=> (window.SA && SA.track('share_generate', { id })) ); }
    }
  }
})();
