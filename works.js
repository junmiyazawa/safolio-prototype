// 作品データ（JSON管理）
const works = [
  {
    id: 1,
    title: "Work 1",
    tags: ["キャラ", "水彩風", "かわいい"],
    img: "https://placehold.co/800x600/png?text=Work+1",
    detail: "この作品は○○をテーマに制作しました。依頼制作可能です。",
    link: "work.html?id=1"
  },
  {
    id: 2,
    title: "Work 2",
    tags: ["背景", "ファンタジー", "光"],
    img: "https://placehold.co/800x600/png?text=Work+2",
    detail: "光を活かしたファンタジー背景です。",
    link: "work.html?id=2"
  },
  {
    id: 3,
    title: "Work 3",
    tags: ["動物", "猫", "かわいい"],
    img: "https://placehold.co/800x600/png?text=Work+3",
    detail: "猫をテーマにしたかわいい作品。",
    link: "work.html?id=3"
  }
];

// ポートフォリオページでの描画処理
document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.getElementById('gallery');
  if (gallery) {
    // タグボタン作成
    const allTags = [...new Set(works.flatMap(w => w.tags))];
    const filterBar = document.getElementById('filterBar');
    allTags.forEach(tag => {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = tag;
      btn.dataset.filter = tag;
      filterBar.insertBefore(btn, filterBar.querySelector('span.small'));
    });

    // ギャラリー描画
    function renderGallery(filter = 'all', keyword = '') {
      gallery.innerHTML = '';
      works
        .filter(w => 
          (filter === 'all' || w.tags.includes(filter)) &&
          (keyword === '' || w.title.includes(keyword) || w.tags.some(t => t.includes(keyword)))
        )
        .forEach(w => {
          const img = document.createElement('img');
          img.src = w.img;
          img.alt = w.title;
          img.addEventListener('click', () => {
            location.href = w.link;
          });
          gallery.appendChild(img);
        });
    }

    // 初期描画
    renderGallery();

    // タグクリック
    filterBar.addEventListener('click', e => {
      if (e.target.tagName === 'BUTTON') {
        renderGallery(e.target.dataset.filter, document.getElementById('searchBox').value);
      }
    });

    // 検索
    document.getElementById('searchBox').addEventListener('input', e => {
      const activeTag = 'all'; // 簡易版では常にall
      renderGallery(activeTag, e.target.value);
    });
  }
});
