let books = [], shown = 24;
const PER = 24;
const grid = document.getElementById('booksGrid');
const moreBtn = document.getElementById('moreBtn');

function filtered() {
  const q = norm(document.getElementById('searchInput').value);
  const lv = document.getElementById('levelFilter').value;
  const st = document.getElementById('stockFilter').value;
  return books.filter(b =>
    (!q || norm(b.title).includes(q) || norm(b.author).includes(q) || norm(b.series).includes(q)) &&
    (lv === 'all' || b.level === lv) &&
    (st === 'all' || (st === 'in') === !!b.inStock));
}

function render() {
  const list = filtered();
  grid.innerHTML = '';
  if (!list.length) {
    grid.appendChild(el('p', 'empty-msg', 'لم يتم العثور على كتب مطابقة.'));
    moreBtn.hidden = true;
    return;
  }
  list.slice(0, shown).forEach(b => grid.appendChild(makeCard(b)));
  moreBtn.hidden = list.length <= shown;
}

function reset() { shown = PER; render(); }
moreBtn.onclick = () => { shown += PER; render(); };
['searchInput', 'levelFilter', 'stockFilter'].forEach(id =>
  document.getElementById(id).addEventListener(id === 'searchInput' ? 'input' : 'change', reset));

updateFavCount();
grid.textContent = 'جارٍ التحميل...';
db.doc('catalog/main').get()
  .then(s => { books = s.exists ? (s.data().books || []) : []; render(); })
  .catch(() => { grid.textContent = 'تعذّر تحميل الكتب، حاول لاحقاً.'; });
