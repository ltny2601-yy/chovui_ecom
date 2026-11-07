// Shared layer for every Chợ Vui page: session, header, bottom nav, cards, helpers.
import { subscribeMember, getMemberState, logout } from "/js/wix/member-store.js";
import { queryItems, insertItem, patchItemFields, getItemById, getItemBy, countItems, removeItem } from "/js/wix/items.js";
export { subscribeMember, getMemberState, logout, queryItems, insertItem, patchItemFields, getItemById, getItemBy, countItems, removeItem };

export const CATS = [
  { id: "dt", name: "Laptop & Điện tử", icon: "laptop", tint: "blue" },
  { id: "gt", name: "Giáo trình", icon: "book", tint: "yellow" },
  { id: "ktx", name: "Đồ KTX", icon: "lamp", tint: "mint" },
  { id: "tt", name: "Dụng cụ khác", icon: "racket", tint: "pink" }
];
export const catOf = (id) => CATS.find((c) => c.id === id) || CATS[0];
export const STATUS = {
  pending: ["Chờ duyệt", "warn"], approved: ["Đang bán", "ok"], held: ["Đang có người giữ", "hold"],
  sold: ["Đã bán", "muted"], rejected: ["Bị từ chối", "bad"]
};
export const CONDITIONS = ["Như mới", "Còn mới 90%", "Đã dùng", "Cũ"];
export const CHECKLIST = {
  dt: [["Pin", "VD: còn 85%, dùng được khoảng 4 tiếng"], ["Màn hình", "VD: không điểm chết, có 1 vết xước nhỏ"], ["Bàn phím, cổng kết nối", "VD: đủ phím, các cổng USB đều nhận"], ["Lịch sử sửa chữa", "VD: chưa sửa / đã thay pin 2025"], ["Phụ kiện kèm theo", "VD: sạc zin, hộp"]],
  gt: [["Phiên bản, tái bản", "VD: tái bản 2023"], ["Ghi chú, highlight", "VD: có highlight chương 1–3"], ["Tình trạng trang, bìa", "VD: đủ trang, bìa hơi cong"]],
  ktx: [["Tình trạng hoạt động", "VD: chạy êm, không kêu"], ["Độ mới, vệ sinh", "VD: đã lau sạch, có vết ố nhỏ"], ["Phụ kiện kèm theo", "VD: đủ dây, có điều khiển"]],
  tt: [["Tình trạng bên ngoài", "VD: trầy nhẹ ở tay cầm"], ["Đủ bộ chưa", "VD: kèm bao đàn, capo"], ["Đã thử, hoạt động", "VD: dây mới thay, âm chuẩn"]]
};
export const AREAS = ["Hai Bà Trưng", "Đống Đa", "Cầu Giấy", "Thanh Xuân", "Nam Từ Liêm", "Bắc Từ Liêm", "Hà Đông", "Gia Lâm"];
export const LIVE = { field: "status", op: "in", value: ["approved", "held"] };

export const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
export const vnd = (n) => (Number(n) || 0).toLocaleString("vi-VN") + "đ";
export const qs = (k) => new URLSearchParams(location.search).get(k) || "";
export function ago(iso) {
  if (!iso) return "";
  const m = (Date.now() - new Date(iso).getTime()) / 6e4;
  if (m < 1) return "vừa xong";
  if (m < 60) return Math.floor(m) + " phút trước";
  if (m < 1440) return Math.floor(m / 60) + " giờ trước";
  if (m < 43200) return Math.floor(m / 1440) + " ngày trước";
  return new Date(iso).toLocaleDateString("vi-VN");
}
export function initials(name) {
  const w = String(name || "?").trim().split(/\s+/);
  return (w.length > 1 ? w[w.length - 2][0] + w[w.length - 1][0] : w[0].slice(0, 2)).toUpperCase();
}

const P = {
  laptop: '<rect x="5" y="5" width="14" height="10" rx="1.5"/><path d="M2 18h20l-1.5 2h-17z"/>',
  book: '<path d="M3 5c3-1 6-1 9 1v14c-3-2-6-2-9-1z"/><path d="M12 6c3-2 6-2 9-1v14c-3-1-6-1-9 1z"/>',
  lamp: '<circle cx="12" cy="10" r="6"/><circle cx="12" cy="10" r="1.6" fill="currentColor"/><path d="M12 16v5M8.5 21h7"/>',
  racket: '<circle cx="9" cy="15" r="5"/><circle cx="9" cy="15" r="1.5"/><path d="M12.5 11.5L20 4M18 3l3 3"/>',
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  pin: '<path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  box: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 12h18M9 8h6M9 16h6"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  next: '<path d="M9 5l7 7-7 7"/>',
  flag: '<path d="M5 21V4h11l-2 4 2 4H5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  send: '<path d="M4 12l16-8-6 16-3-7z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
  bag: '<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  admin: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M12 8v5M12 16v.5"/>',
  out: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>'
};
export function icon(n, cls) {
  return '<svg class="ic ' + (cls || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[n] || "") + "</svg>";
}
export const LOGO = '<svg viewBox="0 0 48 48" aria-hidden="true"><g transform="rotate(-8 24 24)"><rect x="5" y="5" width="38" height="38" rx="12" fill="#FF9EB5"/><circle cx="17.5" cy="22" r="2.6" fill="#3F3A5E"/><circle cx="30.5" cy="22" r="2.6" fill="#3F3A5E"/><path d="M15 28.5c4.5 5 13.5 5 18 0" stroke="#3F3A5E" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="37" cy="11" r="3.2" fill="#fff"/></g></svg>';

// universities and the global school / area pick
let uniP = null;
export function universities() {
  if (!uniP) uniP = queryItems("Universities", { limit: 50, sort: [{ field: "name", direction: "asc" }] }).then((r) => r.items).catch(() => []);
  return uniP;
}
export function uniName(code, list) {
  const u = (list || []).find((x) => x.code === code);
  return u ? u.name : code || "";
}
export function getPick() {
  try { return { uni: localStorage.getItem("cv-uni") || "", area: localStorage.getItem("cv-area") || "" }; } catch (e) { return { uni: "", area: "" }; }
}
export function setPick(p) {
  try { localStorage.setItem("cv-uni", p.uni || ""); localStorage.setItem("cv-area", p.area || ""); } catch (e) {}
  window.dispatchEvent(new CustomEvent("cv-pick", { detail: p }));
}
export function pickFilters() {
  const p = getPick();
  if (p.uni) return [{ field: "university", op: "eq", value: p.uni }];
  if (p.area) return [{ field: "area", op: "eq", value: p.area }];
  return [];
}
export function pickLabel(unis) {
  const p = getPick();
  if (p.uni) return uniName(p.uni, unis);
  if (p.area) return "Khu vực " + p.area;
  return "tất cả trường";
}

// member helpers
export function onMember(fn) { subscribeMember(fn); fn(getMemberState()); }
export function whenReady() {
  return new Promise((res) => {
    const s = getMemberState();
    if (!s.loading) return res(s);
    subscribeMember((st) => { if (!st.loading) res(st); });
  });
}
export function loginHref() { return "/login.html?returnTo=" + encodeURIComponent(location.pathname + location.search); }
let profP = null;
export function myProfile(member) {
  if (!member) return Promise.resolve(null);
  if (profP) return profP;
  profP = (async () => {
    const r = await queryItems("Profiles", { filters: [{ field: "memberId", op: "eq", value: member.id }], limit: 1 });
    if (r.items[0]) return r.items[0];
    let pend = {};
    try { pend = JSON.parse(localStorage.getItem("cv-pending-profile") || "{}"); } catch (e) {}
    const code = pend.university || getPick().uni || "";
    const u = (await universities()).find((x) => x.code === code);
    const p = await insertItem("Profiles", {
      memberId: member.id, displayName: pend.displayName || member.displayName || "Bạn mới", phone: pend.phone || "",
      university: code, area: u ? u.area : "", bio: "", avatarTint: "pink", rating: 0, ratingCount: 0, responseMins: 0,
      verified: false, isSample: false, joinedAt: new Date(), notifyEmail: true, notifyMatch: true, showPhone: false, credits: 0
    });
    try { localStorage.removeItem("cv-pending-profile"); } catch (e) {}
    return p;
  })().catch((e) => { profP = null; throw e; });
  return profP;
}
export function resetProfile() { profP = null; }
let adminP = null;
export function isAdmin(member) {
  if (!member) return Promise.resolve(false);
  if (!adminP) adminP = queryItems("Admins", { filters: [{ field: "memberId", op: "eq", value: member.id }], limit: 1 }).then((r) => r.items.length > 0).catch(() => false);
  return adminP;
}

// cards
export function thumb(l, big) {
  const c = catOf(l.category);
  let h = '<div class="thumb t-' + esc(l.tint || c.tint) + '">';
  if (l.status === "approved" || l.status === "held") h += '<span class="badge chip ok">✓ ĐÃ DUYỆT</span>';
  if (l.onShelf) h += '<span class="shelf chip">Có tại Kệ</span>';
  h += l.cover ? '<img class="cover" src="' + esc(l.cover) + '" alt="">' : icon(c.icon, "obj");
  if (l.status === "held") h += '<span class="holdtag">Đang có người giữ</span>';
  if (l.status === "sold") h += '<span class="holdtag">Đã bán</span>';
  h += (l.cover ? "" : '<span class="note">' + (big ? "Ảnh thật sẽ được cập nhật sau khi admin kiểm" : "Ảnh thật sẽ cập nhật") + "</span>") + "</div>";
  return h;
}
export function card(l, unis) {
  return '<a class="card" href="/item.html?slug=' + encodeURIComponent(l.slug) + '">' + thumb(l)
    + "<h3>" + esc(l.title) + '</h3><b class="price">' + vnd(l.price) + '</b><div class="meta"><span>'
    + esc(uniName(l.university, unis)) + "</span><span>" + esc(ago(l.postedAt)) + "</span></div></a>";
}
export function skeletons(n) { let h = ""; for (let i = 0; i < n; i++) h += '<div class="skel"></div>'; return h; }

let tt;
export function toast(msg) {
  let t = document.querySelector(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
  t.textContent = msg; t.hidden = false;
  clearTimeout(tt); tt = setTimeout(() => { t.hidden = true; }, 2600);
}

// header + bottom nav + footer
export function shell(active) {
  const hdr = document.getElementById("hdr");
  const cur = (k) => (k === active ? ' aria-current="page"' : "");
  hdr.className = "hdr";
  hdr.innerHTML = '<div class="wrap bar"><a class="logo" href="/index.html" aria-label="Chợ Vui, về trang chủ">' + LOGO + "<span>Chợ <em>Vui</em></span></a>"
    + '<form class="search" action="/search.html" role="search"><input name="q" type="search" placeholder="Tìm laptop, giáo trình, đồ KTX, mã môn..." aria-label="Tìm món đồ" value="' + esc(qs("q")) + '"><button type="submit">Tìm</button></form>'
    + '<select class="pick" id="pick" aria-label="Chọn trường hoặc khu vực"><option value="">Tất cả trường</option></select>'
    + '<nav class="links" aria-label="Điều hướng chính"><a href="/search.html"' + cur("search") + '>Danh mục</a><a href="/ke.html"' + cur("ke") + '>Kệ Chợ Vui</a><a href="/messages.html"' + cur("messages") + ">Tin nhắn</a></nav>"
    + '<a class="btn primary sm post-btn" href="/post.html">+ Đăng tin</a><span class="sess" id="sess"><span class="av ph"></span></span></div>';
  let bn = document.getElementById("bnav");
  if (bn) {
    bn.className = "bnav";
    bn.setAttribute("aria-label", "Điều hướng");
    bn.innerHTML = '<a href="/index.html"' + cur("home") + ">" + icon("home") + "Trang chủ</a>"
      + '<a href="/search.html"' + cur("search") + ">" + icon("grid") + "Danh mục</a>"
      + '<a class="fab" href="/post.html" aria-label="Đăng tin"><span>' + icon("plus") + "</span>Đăng tin</a>"
      + '<a href="/messages.html"' + cur("messages") + ">" + icon("chat") + "Tin nhắn</a>"
      + '<a href="/me.html"' + cur("me") + ">" + icon("user") + "Tôi</a>";
  }
  const foot = document.getElementById("foot");
  if (foot) {
    foot.className = "wrap foot";
    foot.innerHTML = "<span>© 2026 Chợ Vui · Mua vui · Bán vui · An tâm</span><span class=\"row\"><a href=\"/safe.html\">Giao dịch an toàn</a><a href=\"/ke.html\">Kệ Chợ Vui</a><a href=\"/timdo.html\">Tin tìm đồ</a></span>";
  }
  const sel = document.getElementById("pick");
  universities().then((unis) => {
    const p = getPick();
    let h = '<option value="">Tất cả trường</option><optgroup label="Theo khu vực">';
    AREAS.forEach((a) => { h += '<option value="area:' + esc(a) + '">Khu vực ' + esc(a) + "</option>"; });
    h += "</optgroup>";
    AREAS.forEach((a) => {
      const list = unis.filter((u) => u.area === a);
      if (!list.length) return;
      h += '<optgroup label="' + esc(a) + '">';
      list.forEach((u) => { h += '<option value="uni:' + esc(u.code) + '">' + esc(u.name) + "</option>"; });
      h += "</optgroup>";
    });
    sel.innerHTML = h;
    sel.value = p.uni ? "uni:" + p.uni : p.area ? "area:" + p.area : "";
  });
  sel.addEventListener("change", () => {
    const v = sel.value;
    setPick({ uni: v.indexOf("uni:") === 0 ? v.slice(4) : "", area: v.indexOf("area:") === 0 ? v.slice(5) : "" });
  });
  const sess = document.getElementById("sess");
  onMember((s) => {
    if (s.loading) { sess.innerHTML = '<span class="av ph"></span>'; return; }
    if (!s.loggedIn) { sess.innerHTML = '<a class="btn ghost sm" href="' + loginHref() + '">Đăng nhập</a>'; return; }
    const m = s.member || {};
    sess.innerHTML = '<a class="av" href="/me.html" title="Tài khoản của bạn">' + esc(initials(m.displayName || m.firstName || "Bạn")) + "</a>";
    isAdmin(s.member).then((ok) => {
      if (!ok) return;
      if (active !== "admin") { location.replace("/admin.html"); return; }
      hdr.innerHTML = '<div class="wrap bar"><a class="logo" href="/admin.html" aria-label="Trang quản trị Chợ Vui">' + LOGO + '<span>Chợ <em>Vui</em></span></a><span class="chip pink">Trang quản trị</span><span style="flex:1"></span><span class="small muted">' + esc(m.displayName || "Admin") + '</span><button class="btn ghost sm" type="button" data-admout>Đăng xuất</button></div>';
      hdr.querySelector("[data-admout]").addEventListener("click", () => { logout("/login.html").catch(() => {}); });
      if (bn) bn.hidden = true;
      if (foot) foot.hidden = true;
    });
  });
}
import("/js/uniselect.js").catch(() => {});
