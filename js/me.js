import { shell, STATUS, catOf, esc, vnd, ago, icon, initials, whenReady, myProfile, isAdmin, queryItems, insertItem, patchItemFields, removeItem, universities, uniName, loginHref, toast, logout, resetProfile } from "/js/app.js";

shell("me");
const app = document.getElementById("app");
let me = null;
let prof = null;
let admin = false;
let unis = [];
const SECTIONS = [
  ["listings", "Tin đăng của tôi", "bag"], ["orders", "Đơn mua của tôi", "box"], ["want", 'Tin đang "Tìm đồ"', "search"],
  ["shelf", "Đồ gửi tại Kệ", "box"]
];
let subtab = "approved";

function sq(l) { return '<span class="sq t-' + esc(l.tint || "lav") + '">' + icon(catOf(l.category).icon) + "</span>"; }

function frame(sec, inner) {
  const side = SECTIONS.map((s) => '<a href="#' + s[0] + '"' + (s[0] === sec ? ' aria-current="page"' : "") + ">" + icon(s[2]) + esc(s[1]) + "</a>").join("")
    + '<a href="/settings.html">' + icon("gear") + "Xác thực và cài đặt</a><a href=\"/ke.html\">" + icon("box") + "Kệ Chợ Vui</a><a href=\"/safe.html\">" + icon("shield") + "Hướng dẫn giao dịch an toàn</a>"
    + (admin ? '<a href="/admin.html">' + icon("admin") + "Trang quản trị</a>" : "")
    + '<a href="#" data-logout>' + icon("out") + "Đăng xuất</a>";
  app.innerHTML = '<div class="me-head"><span class="av lg t-' + esc(prof.avatarTint || "pink") + '">' + esc(initials(prof.displayName)) + '</span><div><h1>' + esc(prof.displayName) + '</h1><div class="muted">' + esc(uniName(prof.university, unis) || "Chưa chọn trường") + (me.loginEmail ? " · " + esc(me.loginEmail) : "") + '</div><div class="row" style="margin-top:6px">' + (prof.verified ? '<span class="chip ok">✓ Đã xác thực</span>' : '<a class="chip warn" href="/settings.html">Chưa xác thực</a>') + (admin ? '<span class="chip pink">Admin</span>' : "") + "</div></div></div>"
    + '<div class="layout sec"><nav class="side" aria-label="Mục cá nhân">' + side + '</nav><section id="pane">' + inner + "</section></div>";
}

async function listings(onlyShelf) {
  const r = await queryItems("Listings", { filters: [{ field: "sellerMemberId", op: "eq", value: me.id }], sort: [{ field: "postedAt", direction: "desc" }], limit: 100 });
  let items = r.items;
  if (onlyShelf) items = items.filter((l) => l.onShelf);
  const tabs = [["approved", "Đang bán"], ["held", "Đang giữ"], ["sold", "Đã bán"], ["pending", "Chờ duyệt"], ["rejected", "Bị từ chối"]];
  const cnt = (k) => items.filter((l) => l.status === k).length;
  const shown = onlyShelf ? items : items.filter((l) => l.status === subtab);
  let h = '<div class="sec-h"><h2>' + (onlyShelf ? "Đồ gửi tại Kệ" : "Tin đăng của tôi") + '</h2><a href="/post.html">+ Đăng tin</a></div>';
  if (!onlyShelf) h += '<div class="tabs" role="tablist">' + tabs.map((t) => '<button data-sub="' + t[0] + '" aria-selected="' + (subtab === t[0]) + '">' + t[1] + " (" + cnt(t[0]) + ")</button>").join("") + "</div>";
  h += '<div class="list">' + (shown.length ? shown.map((l) => {
    const st = STATUS[l.status] || ["", ""];
    let act = "";
    if (l.status === "approved") act = '<button class="btn soft sm" data-act="sold" data-id="' + l._id + '">Đánh dấu đã bán</button><button class="btn ghost sm" data-act="del" data-id="' + l._id + '">Gỡ tin</button>';
    if (l.status === "held") act = '<span class="small">Người giữ: <b>' + esc(l.buyerName || "") + '</b></span><input class="input sm code-in" placeholder="Mã 4 số" inputmode="numeric" maxlength="4" id="code-' + l._id + '"><button class="btn primary sm" data-act="code" data-id="' + l._id + '">Xác nhận bàn giao</button>';
    if (l.status === "rejected") act = '<span class="small">' + esc(l.rejectReason) + "</span>" + ((l.rejectCount || 0) >= 2 ? '<span class="small muted">Đã hoàn 1 credit. Muốn đăng lại, bạn tạo tin mới.</span>' : '<button class="btn soft sm" data-act="resubmit" data-id="' + l._id + '">Gửi duyệt lại (miễn phí)</button>');
    if (l.status === "pending") act = '<span class="small muted">' + (l.feePaid ? "Đã thanh toán phí" : "Chờ admin xác nhận phí 1.500đ") + "</span>";
    return '<div class="li">' + sq(l) + '<div class="body"><a href="/item.html?slug=' + encodeURIComponent(l.slug) + '"><b>' + esc(l.title) + '</b></a><span class="price">' + vnd(l.price) + '</span> <span class="chip ' + st[1] + '">' + st[0] + '</span><div class="act">' + act + "</div></div></div>";
  }).join("") : '<div class="empty"><b>Chưa có tin nào ở mục này</b><a href="/post.html">Đăng tin đầu tiên</a></div>') + "</div>";
  return h;
}

async function orders() {
  const r = await queryItems("Orders", { filters: [{ field: "buyerMemberId", op: "eq", value: me.id }], sort: [{ field: "_createdDate", direction: "desc" }], limit: 100 });
  const steps = ["held", "met", "done"];
  let h = '<div class="sec-h"><h2>Đơn mua của tôi</h2></div><div class="list">';
  h += r.items.length ? r.items.map((o) => {
    const idx = o.status === "done" ? 2 : o.status === "cancelled" ? -1 : 0;
    let act = "";
    if (o.status === "held") act = '<span class="small">Mã bàn giao: <span class="code">' + esc(o.handoverCode) + '</span></span><a class="btn soft sm" href="/messages.html?listing=' + encodeURIComponent(o.listingId) + '">Nhắn người bán</a><button class="btn ghost sm" data-act="cancel" data-id="' + o._id + '" data-l="' + esc(o.listingId) + '">Hủy giữ</button>';
    if (o.status === "done" && !o.rated) act = '<span class="small">Đánh giá người bán:</span>' + [5, 4, 3, 2, 1].map((n) => '<button class="btn ghost sm" data-act="rate" data-n="' + n + '" data-id="' + o._id + '" data-s="' + esc(o.sellerId) + '">' + n + "★</button>").join("");
    if (o.status === "done" && o.rated) act = '<span class="chip ok">Đã đánh giá</span>';
    if (o.status === "cancelled") act = '<span class="chip muted">Đã hủy</span>';
    return '<div class="li"><span class="sq t-' + esc(o.tint || "lav") + '">' + icon("bag") + '</span><div class="body"><b>' + esc(o.listingTitle) + '</b><span class="price">' + vnd(o.price) + '</span> <span class="small muted">· ' + esc(o.sellerName) + " · " + esc(o.meetPoint) + "</span>"
      + (idx >= 0 ? '<div class="flow"><b>Giữ hàng</b><i class="' + (idx >= 0 ? "on" : "") + '"></i><b>Hẹn gặp</b><i class="' + (idx >= 2 ? "on" : "") + '"></i><b>Hoàn tất</b></div>' : "")
      + '<div class="act">' + act + "</div></div></div>";
  }).join("") : '<div class="empty"><b>Bạn chưa giữ món nào</b><a href="/search.html">Đi dạo chợ</a></div>';
  return h + "</div>";
}

async function wants() {
  const r = await queryItems("WantAds", { filters: [{ field: "memberId", op: "eq", value: me.id }], limit: 50 });
  let h = '<div class="sec-h"><h2>Tin đang "Tìm đồ"</h2><a href="/post.html?mode=want">+ Đăng tin tìm đồ</a></div><div class="list">';
  if (!r.items.length) return h + '<div class="empty"><b>Bạn chưa đăng tin tìm đồ nào</b>Đăng nhu cầu, có món khớp bạn sẽ thấy ở đây.</div></div>';
  for (const w of r.items) {
    const m = await queryItems("Listings", { filters: [{ field: "status", op: "eq", value: "approved" }, { field: "category", op: "eq", value: w.category }].concat(w.budget ? [{ field: "price", op: "le", value: w.budget }] : []), limit: 3 });
    h += '<div class="li"><span class="sq t-yellow">' + icon("search") + '</span><div class="body"><b>' + esc(w.title) + '</b><span class="small muted">Ngân sách ' + (w.budget ? vnd(w.budget) : "linh hoạt") + " · " + esc(uniName(w.university, unis)) + '</span><div class="act">'
      + (m.items.length ? m.items.map((l) => '<a class="chip mint" href="/item.html?slug=' + encodeURIComponent(l.slug) + '">' + esc(l.title) + " · " + vnd(l.price) + "</a>").join("") : '<span class="small muted">Chưa có món khớp</span>') + "</div></div></div>";
  }
  return h + "</div>";
}

async function show() {
  const sec = (location.hash || "#listings").slice(1);
  frame(sec, '<div class="skel" style="aspect-ratio:3"></div>');
  let inner = "";
  try {
    if (sec === "orders") inner = await orders();
    else if (sec === "want") inner = await wants();
    else if (sec === "shelf") inner = await listings(true);
    else inner = await listings(false);
  } catch (e) { inner = '<div class="empty"><b>Chưa tải được dữ liệu</b>Tải lại trang sau ít phút.</div>'; }
  document.getElementById("pane").innerHTML = inner;
}

app.addEventListener("click", async (e) => {
  if (e.target.closest("[data-logout]")) { e.preventDefault(); logout("/index.html").catch(() => {}); return; }
  const sb = e.target.closest("[data-sub]");
  if (sb) { subtab = sb.dataset.sub; show(); return; }
  const b = e.target.closest("[data-act]");
  if (!b) return;
  const id = b.dataset.id;
  b.disabled = true;
  try {
    if (b.dataset.act === "sold") { await patchItemFields("Listings", id, { status: "sold" }); toast("Đã đánh dấu đã bán"); }
    if (b.dataset.act === "del") { await removeItem("Listings", id); toast("Đã gỡ tin"); }
    if (b.dataset.act === "resubmit") { await patchItemFields("Listings", id, { status: "pending", rejectReason: "" }); toast("Đã gửi duyệt lại"); }
    if (b.dataset.act === "code") {
      const v = document.getElementById("code-" + id).value.trim();
      const o = (await queryItems("Orders", { filters: [{ field: "listingId", op: "eq", value: id }, { field: "status", op: "eq", value: "held" }], limit: 1 })).items[0];
      if (!o || o.handoverCode !== v) { toast("Mã chưa đúng. Hỏi lại người mua mã 4 số."); b.disabled = false; return; }
      await patchItemFields("Orders", o._id, { status: "done" });
      await patchItemFields("Listings", id, { status: "sold" });
      toast("Hoàn tất giao dịch");
    }
    if (b.dataset.act === "cancel") { await patchItemFields("Orders", id, { status: "cancelled" }); await patchItemFields("Listings", b.dataset.l, { status: "approved", buyerMemberId: "", buyerName: "" }); toast("Đã hủy giữ hàng"); }
    if (b.dataset.act === "rate") {
      await insertItem("Reviews", { fromName: prof.displayName, toSellerId: b.dataset.s, stars: Number(b.dataset.n), text: "", memberId: me.id, orderId: id });
      await patchItemFields("Orders", id, { rated: true });
      toast("Cảm ơn bạn đã đánh giá");
    }
    show();
  } catch (err) { b.disabled = false; toast("Chưa thực hiện được. Thử lại sau."); }
});
window.addEventListener("hashchange", show);

(async () => {
  const s = await whenReady();
  if (!s.loggedIn) {
    app.innerHTML = '<div class="empty"><b>Đăng nhập để xem trang cá nhân</b>Quản lý tin đăng, đơn mua và cài đặt của bạn.<div class="center"><a class="btn primary" href="' + loginHref() + '">Đăng nhập / Đăng ký</a></div></div>';
    return;
  }
  me = s.member;
  if (!me) { app.innerHTML = '<div class="empty">Chưa tải được hồ sơ. Tải lại trang sau ít phút.</div>'; return; }
  [prof, admin, unis] = await Promise.all([myProfile(me), isAdmin(me), universities()]);
  try {
    const due = await queryItems("Listings", { filters: [{ field: "sellerMemberId", op: "eq", value: me.id }, { field: "refundDue", op: "eq", value: true }], limit: 50 });
    if (due.items.length) {
      prof = await patchItemFields("Profiles", prof._id, { credits: (Number(prof.credits) || 0) + due.items.length });
      resetProfile();
      for (const l of due.items) await patchItemFields("Listings", l._id, { refundDue: false });
      toast("Đã hoàn " + due.items.length + " credit vào ví của bạn");
    }
  } catch (e) {}
  show();
})();