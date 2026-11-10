// البحث: يتجاهل التشكيل والفرق بين أ/إ/آ/ا وغيرها
function norm(s) {
  return (s || '').toString().toLowerCase()
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').trim();
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

// ===== المفضلة (تُحفظ في جهاز الزائر) =====
const FAV_KEY = 'maktaba_favs';
function getFavs() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch (e) { return []; }
}
function setFavs(arr) {
  try { localStorage.setItem(FAV_KEY, JSON.stringify(arr)); } catch (e) {}
}
function isFav(id) { return getFavs().includes(id); }
function toggleFav(id) {
  const f = getFavs(), i = f.indexOf(id);
  if (i >= 0) f.splice(i, 1); else f.push(id);
  setFavs(f);
  updateFavCount();
}
function updateFavCount() {
  const s = document.getElementById('favCount');
  if (s) s.textContent = getFavs().length;
}

// بطاقة كتاب
function makeCard(b, onChange) {
  const card = el('div', 'book-card' + (b.inStock ? '' : ' is-out'));
  const top = el('div');
  top.append(
    el('span', 'book-badge', b.series || 'مستقل'),
    el('span', 'badge-stock ' + (b.inStock ? 'in' : 'out'), b.inStock ? 'متوفر' : 'نفذت الكمية'),
    el('h3', '', b.title),
    el('p', '', b.author || '')
  );
  const btn = el('button', 'btn-add');
  const paint = () => {
    const on = isFav(b.id);
    btn.textContent = on ? 'في المفضلة ♥' : 'إضافة للمفضلة ♡';
    btn.classList.toggle('active', on);
  };
  btn.onclick = () => { toggleFav(b.id); paint(); if (onChange) onChange(); };
  paint();
  card.append(top, btn);
  return card;
}
