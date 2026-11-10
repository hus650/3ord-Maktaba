const ref = db.doc('catalog/main');
const PER = 50, LVR = { 'مبتدئ': 'beginner', 'متوسط': 'intermediate', 'متقدم': 'advanced' };
let books = [], page = 1, editId = null;
const $ = id => document.getElementById(id);

auth.onAuthStateChanged(u => { $('loginBox').hidden = !!u; $('app').hidden = !u; if (u) load(); });
$('loginBtn').onclick = () => auth.signInWithEmailAndPassword($('email').value.trim(), $('password').value)
  .catch(() => $('loginMsg').textContent = 'البريد أو كلمة المرور غير صحيحة');
$('logoutBtn').onclick = () => auth.signOut();

document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => {
  ['listTab', 'addTab', 'importTab'].forEach(t => $(t).hidden = t !== b.dataset.tab);
  document.querySelectorAll('[data-tab]').forEach(x => x.classList.toggle('ghost', x !== b));
});

async function load() { const s = await ref.get(); books = s.exists ? (s.data().books || []) : []; render(); }
async function save(msgEl) {
  try { await ref.set({ books }); return true; }
  catch (e) { (msgEl || $('formMsg')).textContent = 'فشل الحفظ، تأكد من اتصالك بالإنترنت وصلاحيات الدخول'; return false; }
}

function mk(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }

function render() {
  const q = norm($('q').value), f = $('f').value;
  const list = books.filter(b => (!q || norm(b.title).includes(q) || norm(b.author).includes(q)) && (f === 'all' || (f === 'in') === !!b.inStock));
  const inC = books.filter(b => b.inStock).length;
  $('sTotal').textContent = 'الإجمالي: ' + books.length;
  $('sIn').textContent = 'متوفر: ' + inC;
  $('sOut').textContent = 'نافد: ' + (books.length - inC);
  const pages = Math.max(1, Math.ceil(list.length / PER));
  if (page > pages) page = pages;
  $('pg').textContent = page + ' / ' + pages;
  const rows = $('rows'); rows.innerHTML = '';
  list.slice((page - 1) * PER, page * PER).forEach(b => {
    const r = mk('div', 'row'), info = mk('div', 'info'), acts = mk('div', 'acts');
    info.append(mk('b', '', b.title), mk('span', '', (b.author || '') + ' · ' + (b.series || 'مستقل')));
    const st = mk('button', 'btn sm ' + (b.inStock ? '' : 'ghost'), b.inStock ? 'متوفر ✓' : 'نفذت الكمية');
    st.onclick = async () => { b.inStock = !b.inStock; render(); await save(); };
    const ed = mk('button', 'btn ghost sm', 'تعديل'); ed.onclick = () => startEdit(b);
    const del = mk('button', 'btn danger sm', 'حذف');
    del.onclick = async () => { if (confirm('حذف "' + b.title + '" نهائياً؟')) { books = books.filter(x => x.id !== b.id); render(); await save(); } };
    acts.append(st, ed, del); r.append(info, acts); rows.appendChild(r);
  });
}
$('q').oninput = () => { page = 1; render(); };
$('f').onchange = () => { page = 1; render(); };
$('prev').onclick = () => { if (page > 1) { page--; render(); } };
$('next').onclick = () => { page++; render(); };

function startEdit(b) {
  editId = b.id; $('formTitle').textContent = 'تعديل الكتاب';
  $('fTitle').value = b.title; $('fAuthor').value = b.author || ''; $('fSeries').value = b.series === 'مستقل' ? '' : (b.series || '');
  $('fLevel').value = b.level; $('fStock').value = b.inStock ? '1' : '0'; $('cancelEdit').hidden = false;
  document.querySelector('[data-tab="addTab"]').click(); window.scrollTo(0, 0);
}
function resetForm() {
  editId = null; $('formTitle').textContent = 'إضافة كتاب جديد';
  ['fTitle', 'fAuthor', 'fSeries'].forEach(i => $(i).value = ''); $('fStock').value = '1'; $('cancelEdit').hidden = true;
}
$('cancelEdit').onclick = resetForm;
$('saveBook').onclick = async () => {
  const title = $('fTitle').value.trim();
  if (!title) { $('formMsg').textContent = 'الرجاء كتابة عنوان الكتاب'; return; }
  const data = { title, author: $('fAuthor').value.trim(), series: $('fSeries').value.trim() || 'مستقل', level: $('fLevel').value, inStock: $('fStock').value === '1' };
  if (editId) Object.assign(books.find(b => b.id === editId), data);
  else books.unshift({ id: Date.now(), ...data });
  if (await save()) { $('formMsg').textContent = 'تم الحفظ ✓'; resetForm(); render(); }
};

$('importBtn').onclick = async () => {
  const lines = $('importText').value.split('\n').map(l => l.trim()).filter(Boolean);
  const seen = new Set(books.map(b => norm(b.title) + '|' + norm(b.author)));
  let added = 0, skipped = 0, t = Date.now();
  lines.forEach(line => {
    const c = line.split(line.includes('\t') ? '\t' : ',').map(x => x.trim());
    if (!c[0] || c[0] === 'العنوان') return;
    const key = norm(c[0]) + '|' + norm(c[1]);
    if (seen.has(key)) { skipped++; return; }
    seen.add(key);
    books.push({ id: t++, title: c[0], author: c[1] || '', series: c[2] || 'مستقل', level: LVR[c[3]] || 'beginner', inStock: true });
    added++;
  });
  if (!added) { $('importMsg').textContent = 'لم تتم إضافة أي كتاب (المكرر: ' + skipped + ')'; return; }
  if (await save($('importMsg'))) { $('importMsg').textContent = 'تمت إضافة ' + added + ' كتاب، وتم تجاهل ' + skipped + ' مكرر ✓'; $('importText').value = ''; render(); }
};
