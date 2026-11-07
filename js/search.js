import { shell, CATS, CONDITIONS, AREAS, LIVE, queryItems, card, esc, universities, getPick, setPick, skeletons, qs, catOf, icon } from "/js/app.js";

shell("search");
const app = document.getElementById("app");
const pick = getPick();
const st = { q: qs("q"), cat: qs("cat"), code: qs("code"), cond: "", min: "", max: "", uni: pick.uni, area: pick.area, sort: "new" };
let unis = [];
let items = [];
let skip = 0;
let total = null;
let hasNext = false;
let busy = false;
const LIMIT = 20;
const SORTS = { new: [{ field: "postedAt", direction: "desc" }], asc: [{ field: "price", direction: "asc" }], desc: [{ field: "price", direction: "desc" }] };

function filters() {
  const f = [LIVE];
  const q = st.q.trim();
  if (q) {
    if (/^[A-Za-z]{2,4}\d{3,4}$/.test(q)) f.push({ field: "courseCode", op: "eq", value: q.toUpperCase() });
    else f.push({ field: "title", op: "contains", value: q });
  }
  if (st.cat) f.push({ field: "category", op: "eq", value: st.cat });
  if (st.cat === "gt" && st.code.trim()) f.push({ field: "courseCode", op: "startsWith", value: st.code.trim().toUpperCase() });
  if (st.cond) f.push({ field: "condition", op: "eq", value: st.cond });
  if (Number(st.min) > 0) f.push({ field: "price", op: "ge", value: Number(st.min) });
  if (Number(st.max) > 0) f.push({ field: "price", op: "le", value: Number(st.max) });
  if (st.uni) f.push({ field: "university", op: "eq", value: st.uni });
  else if (st.area) f.push({ field: "area", op: "eq", value: st.area });
  return f;
}

function layout() {
  const title = st.cat ? catOf(st.cat).name : st.q ? 'Kết quả cho "' + st.q + '"' : "Tất cả tin đăng";
  document.title = title + " – Chợ Vui";
  let uniOpts = '<option value="">Tất cả trường</option>';
  AREAS.forEach((a) => {
    const l = unis.filter((u) => u.area === a);
    if (!l.length) return;
    uniOpts += '<optgroup label="' + esc(a) + '">' + l.map((u) => '<option value="' + esc(u.code) + '">' + esc(u.name) + "</option>").join("") + "</optgroup>";
  });
  app.innerHTML = '<div class="crumb"><a href="/index.html">Trang chủ</a> / ' + esc(st.cat ? catOf(st.cat).name : "Tìm kiếm") + "</div>"
    + '<div class="page-h"><h1 id="ttl">' + esc(title) + '</h1></div>'
    + '<div class="chips-row" id="catChips"><button class="chip" data-cat="" aria-pressed="' + !st.cat + '">Tất cả</button>'
    + CATS.map((c) => '<button class="chip" data-cat="' + c.id + '" aria-pressed="' + (st.cat === c.id) + '">' + esc(c.name) + "</button>").join("") + "</div>"
    + '<div class="split"><aside class="filters panel" id="filt"><div class="row between"><b>Bộ lọc</b><button class="link" id="reset" type="button">Xóa lọc</button></div>'
    + '<div class="field" id="codeBox"' + (st.cat === "gt" ? "" : " hidden") + '><label for="fCode">Mã môn</label><input class="input" id="fCode" placeholder="VD: MI1111" value="' + esc(st.code) + '"></div>'
    + '<div class="field"><span class="lbl">Khoảng giá (đồng)</span><div class="grid2 tight"><input class="input" id="fMin" inputmode="numeric" placeholder="Từ" value="' + esc(st.min) + '"><input class="input" id="fMax" inputmode="numeric" placeholder="Đến" value="' + esc(st.max) + '"></div></div>'
    + '<div class="field"><span class="lbl">Tình trạng</span><div class="row" id="condChips"><button class="chip" data-cond="" aria-pressed="' + !st.cond + '">Tất cả</button>'
    + CONDITIONS.map((c) => '<button class="chip" data-cond="' + esc(c) + '" aria-pressed="' + (st.cond === c) + '">' + esc(c) + "</button>").join("") + "</div></div>"
    + '<div class="field"><label for="fArea">Khu vực</label><select class="input" id="fArea"><option value="">Tất cả khu vực</option>' + AREAS.map((a) => '<option>' + esc(a) + "</option>").join("") + "</select></div>"
    + '<div class="field"><label for="fUni">Trường</label><select class="input" id="fUni">' + uniOpts + "</select></div>"
    + '<button class="btn primary block" id="apply" type="button">Áp dụng</button></aside>'
    + '<section class="results"><div class="row between bar2"><span class="muted" id="count">Đang tìm…</span><div class="row"><button class="btn ghost sm only-phone" id="openF" type="button">' + icon("search") + 'Bộ lọc</button><select class="input sm" id="fSort" aria-label="Sắp xếp"><option value="new">Mới nhất</option><option value="asc">Giá thấp đến cao</option><option value="desc">Giá cao đến thấp</option></select></div></div>'
    + '<div class="grid g4" id="grid"></div><div class="center"><button class="btn soft" id="more" hidden>Xem thêm</button></div></section></div>';
  document.getElementById("fArea").value = st.area;
  document.getElementById("fUni").value = st.uni;
  document.getElementById("fSort").value = st.sort;
}

function readForm() {
  const g = (id) => document.getElementById(id);
  st.code = g("fCode").value;
  st.min = g("fMin").value.replace(/\D/g, "");
  st.max = g("fMax").value.replace(/\D/g, "");
  st.area = g("fArea").value;
  st.uni = g("fUni").value;
}

async function run(reset) {
  if (busy) return;
  busy = true;
  const grid = document.getElementById("grid");
  const more = document.getElementById("more");
  if (reset) { skip = 0; items = []; grid.innerHTML = skeletons(8); }
  more.disabled = true;
  try {
    const r = await queryItems("Listings", { filters: filters(), sort: SORTS[st.sort], limit: LIMIT, skip: skip, withTotal: true });
    items = items.concat(r.items);
    hasNext = r.hasNext;
    total = r.total;
    skip += r.items.length;
    grid.innerHTML = items.length ? items.map((l) => card(l, unis)).join("")
      : '<div class="empty"><b>Chưa có món nào khớp</b>Thử bỏ bớt bộ lọc, hoặc <a href="/post.html?mode=want">đăng tin tìm đồ</a> để người bán tìm đến bạn.</div>';
    document.getElementById("count").textContent = (total != null ? total : items.length) + " kết quả";
  } catch (e) {
    grid.innerHTML = '<div class="empty"><b>Chưa tải được kết quả</b>Kiểm tra kết nối mạng rồi thử lại.</div>';
  }
  more.hidden = !hasNext;
  more.disabled = false;
  busy = false;
}

function syncUrl() {
  const p = new URLSearchParams();
  if (st.q) p.set("q", st.q);
  if (st.cat) p.set("cat", st.cat);
  if (st.code) p.set("code", st.code);
  history.replaceState(null, "", "/search.html" + (p.toString() ? "?" + p : ""));
}

app.addEventListener("click", (e) => {
  const c = e.target.closest("[data-cat]");
  if (c) { st.cat = c.dataset.cat; if (st.cat !== "gt") st.code = ""; readFormSafe(); layout(); syncUrl(); run(true); return; }
  const d = e.target.closest("[data-cond]");
  if (d) { st.cond = d.dataset.cond; document.querySelectorAll("[data-cond]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.cond === st.cond)); return; }
  if (e.target.closest("#apply")) { readForm(); syncUrl(); document.getElementById("filt").classList.remove("open"); run(true); return; }
  if (e.target.closest("#reset")) { Object.assign(st, { code: "", cond: "", min: "", max: "", uni: "", area: "" }); layout(); run(true); return; }
  if (e.target.closest("#more")) { run(false); return; }
  if (e.target.closest("#openF")) { document.getElementById("filt").classList.toggle("open"); }
});
app.addEventListener("change", (e) => { if (e.target.id === "fSort") { st.sort = e.target.value; run(true); } });
function readFormSafe() { if (document.getElementById("fMin")) readForm(); }
window.addEventListener("cv-pick", (e) => { st.uni = e.detail.uni || ""; st.area = e.detail.area || ""; layout(); run(true); });

universities().then((u) => { unis = u; layout(); run(true); });