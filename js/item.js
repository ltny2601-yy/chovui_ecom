import { shell, getItemBy, getItemById, queryItems, insertItem, patchItemFields, LIVE, STATUS, catOf, card, thumb, esc, vnd, ago, icon, initials, universities, uniName, whenReady, myProfile, isAdmin, loginHref, toast, qs } from "/js/app.js";

shell("search");
const app = document.getElementById("app");
let L = null;
let unis = [];

function stars(r) { return '<span class="stars">' + icon("star", "st") + " " + (Number(r) || 0).toFixed(1) + "</span>"; }

async function load() {
  unis = await universities();
  try { L = await getItemBy("Listings", "slug", qs("slug")); } catch (e) { L = null; }
  if (!L) {
    app.innerHTML = '<div class="empty"><b>Không tìm thấy tin đăng này</b>Tin có thể đã bị gỡ. <a href="/search.html">Xem các tin khác</a></div>';
    return;
  }
  const s = await whenReady();
  const me = s.member;
  const mine = me && L._owner === me.id;
  const admin = await isAdmin(me);
  if ((L.status === "pending" || L.status === "rejected") && !mine && !admin) {
    app.innerHTML = '<div class="empty"><b>Tin này đang chờ admin duyệt</b>Tin chỉ hiển thị sau khi đạt chuẩn. <a href="/search.html">Xem các tin khác</a></div>';
    return;
  }
  document.title = L.title + " – Chợ Vui";
  const c = catOf(L.category);
  const ck = String(L.checklist || "").split("\n").filter(Boolean);
  const st = STATUS[L.status] || ["", ""];
  const canHold = L.status === "approved" && !mine;
  app.innerHTML = '<div class="crumb"><a href="/index.html">Trang chủ</a> / <a href="/search.html?cat=' + c.id + '">' + esc(c.name) + "</a> / " + esc(L.title) + "</div>"
    + '<div class="detail"><div class="gallery">' + thumb(L, true)
    + '<div class="thumbs" id="thumbs"></div></div>'
    + '<div class="info"><b class="big-price">' + vnd(L.price) + "</b><h1>" + esc(L.title) + "</h1>"
    + '<div class="row">' + (L.status !== "approved" ? '<span class="chip ' + st[1] + '">' + st[0] + "</span>" : "")
    + '<span class="chip mint">' + esc(L.condition || "") + '</span><span class="chip">' + esc(uniName(L.university, unis)) + "</span>"
    + (L.courseCode ? '<span class="chip yellow">Mã môn ' + esc(L.courseCode) + "</span>" : "")
    + (L.onShelf ? '<span class="chip peach">Có sẵn tại Kệ</span>' : '<span class="chip peach">Gặp trực tiếp</span>') + "</div>"
    + (L.status === "rejected" && L.rejectReason ? '<div class="notice pink"><b>Admin từ chối tin này</b>' + esc(L.rejectReason) + "</div>" : "")
    + (L.status === "pending" ? '<div class="notice warn"><b>Đang chờ duyệt</b>Admin sẽ kiểm tra trong vòng 12 giờ.</div>' : "")
    + '<div class="kv"><span>' + icon("pin") + "Có thể gặp</span><b>" + esc(L.meetPoint || "Tự hẹn qua chat") + "</b>"
    + "<span>" + icon("clock") + "Đăng</span><b>" + esc(ago(L.postedAt)) + "</b>"
    + "<span>" + icon("eye") + "Lượt xem</span><b>" + (Number(L.views) || 0) + "</b></div>"
    + (ck.length ? '<div class="box"><b>Checklist tình trạng</b><ul class="ck">' + ck.map((x) => "<li>" + icon("check") + esc(x) + "</li>").join("") + "</ul></div>" : "")
    + (L.description ? '<div class="box"><b>Mô tả</b><p>' + esc(L.description) + "</p></div>" : "")
    + '<a class="seller" id="seller" href="/seller.html?id=' + encodeURIComponent(L.sellerId || "") + '"><span class="av">' + esc(initials(L.sellerName)) + "</span><span><b>" + esc(L.sellerName || "Người bán") + '</b><small class="muted" id="sellerMeta">Đang tải…</small></span>' + icon("next") + "</a>"
    + '<div class="notice"><b>' + icon("shield") + " Giao dịch an toàn qua Kệ Chợ Vui</b>Hẹn ở nơi đông người hoặc nhận tại Kệ, kiểm tra trước khi trả tiền. Không chuyển khoản trước.</div>"
    + '<div class="actions">' + (admin && !mine ? '<a class="btn soft" href="/admin.html">Về trang duyệt tin</a>' : mine
      ? '<a class="btn soft" href="/me.html#listings">Quản lý tin của tôi</a>'
      : '<a class="btn line" href="/messages.html?listing=' + encodeURIComponent(L._id) + '">' + icon("chat") + "Chat</a>"
        + '<button class="btn primary" id="hold"' + (canHold ? "" : " disabled") + ">" + (L.status === "held" ? "Đang có người giữ" : L.status === "sold" ? "Đã bán" : "Mua / Giữ hàng 24h") + "</button>")
    + "</div>"
    + (mine || admin ? "" : '<button class="link report" id="rep">' + icon("flag") + "Báo cáo tin đăng</button>")
    + '<form class="box" id="repForm" hidden><label class="lbl" for="repReason">Lý do báo cáo</label><select class="input" id="repReason"><option>Ảnh không phải ảnh thật</option><option>Giá hoặc mô tả sai</option><option>Hàng cấm, hàng giả</option><option>Người bán có dấu hiệu lừa đảo</option><option>Khác</option></select><div class="row"><button class="btn primary sm" type="submit">Gửi báo cáo</button><button class="btn ghost sm" type="button" id="repCancel">Hủy</button></div></form>'
    + '<div class="box" id="holdBox" hidden></div>'
    + "</div></div>"
    + '<section class="sec"><div class="sec-h"><h2>Tin tương tự</h2><a href="/search.html?cat=' + c.id + '">Xem thêm →</a></div><div class="grid" id="sim"></div></section>';

  queryItems("ListingPhotos", { filters: [{ field: "listingId", op: "eq", value: L._id }], sort: [{ field: "idx", direction: "asc" }], limit: 6 }).then((r) => {
    if (!r.items.length) return;
    const g = document.querySelector(".gallery .thumb");
    const show = (src) => { let im = g.querySelector("img.cover"); if (!im) { im = document.createElement("img"); im.className = "cover"; im.alt = L.title; g.appendChild(im); } const o = g.querySelector(".obj"); if (o) o.remove(); const n = g.querySelector(".note"); if (n) n.remove(); im.src = src; };
    show(r.items[0].data);
    const th = document.getElementById("thumbs");
    th.innerHTML = r.items.map((p, i) => '<button type="button" class="tb" data-src="' + i + '"><img src="' + p.data + '" alt="Ảnh ' + (i + 1) + '"></button>').join("");
    th.onclick = (e) => { const b = e.target.closest("[data-src]"); if (b) show(r.items[Number(b.dataset.src)].data); };
  }).catch(() => {});
  if (L.sellerId) {
    getItemById("Profiles", L.sellerId).then((p) => {
      if (!p) return;
      document.getElementById("sellerMeta").innerHTML = (p.verified ? "✓ Đã xác thực · " : "") + stars(p.rating) + " · " + (p.ratingCount || 0) + " đánh giá" + (p.responseMins ? " · Phản hồi ~" + (p.responseMins < 60 ? p.responseMins + " phút" : Math.round(p.responseMins / 60) + " giờ") : "");
    }).catch(() => {});
  }
  queryItems("Listings", { filters: [LIVE, { field: "category", op: "eq", value: L.category }, { field: "_id", op: "ne", value: L._id }], sort: [{ field: "postedAt", direction: "desc" }], limit: 5 })
    .then((r) => { document.getElementById("sim").innerHTML = r.items.map((x) => card(x, unis)).join("") || '<div class="empty">Chưa có tin tương tự.</div>'; })
    .catch(() => {});
}

app.addEventListener("click", async (e) => {
  if (e.target.closest("#rep")) { document.getElementById("repForm").hidden = false; return; }
  if (e.target.closest("#repCancel")) { document.getElementById("repForm").hidden = true; return; }
  const h = e.target.closest("#hold");
  if (!h) return;
  const s = await whenReady();
  if (!s.loggedIn) { location.assign(loginHref()); return; }
  h.disabled = true;
  try {
    const prof = await myProfile(s.member);
    const code = String(Math.floor(1000 + Math.random() * 9000));
    const until = new Date(Date.now() + 24 * 3600e3);
    await insertItem("Orders", {
      listingId: L._id, listingTitle: L.title, price: L.price, tint: L.tint, buyerMemberId: s.member.id, buyerName: prof.displayName,
      sellerId: L.sellerId, sellerMemberId: L.sellerMemberId || "", sellerName: L.sellerName, status: "held", handoverCode: code,
      meetPoint: L.meetPoint || "", meetTime: "", holdUntil: until, rated: false
    });
    await patchItemFields("Listings", L._id, { status: "held", holdUntil: until, buyerMemberId: s.member.id, buyerName: prof.displayName });
    const box = document.getElementById("holdBox");
    box.hidden = false;
    box.innerHTML = '<b>Bạn đã giữ món này đến ' + until.toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }) + '</b><p>Mã bàn giao của bạn: <span class="code">' + code + '</span>. Chỉ đưa mã này cho người bán sau khi đã kiểm hàng.</p><div class="row"><a class="btn primary sm" href="/messages.html?listing=' + encodeURIComponent(L._id) + '">Nhắn hẹn giờ gặp</a><a class="btn ghost sm" href="/me.html#orders">Xem đơn mua</a></div>';
    h.textContent = "Bạn đang giữ món này";
    toast("Đã giữ hàng 24 giờ");
  } catch (err) {
    h.disabled = false;
    toast("Chưa giữ được hàng. Thử lại sau ít phút.");
  }
});
app.addEventListener("submit", async (e) => {
  if (e.target.id !== "repForm") return;
  e.preventDefault();
  const s = await whenReady();
  if (!s.loggedIn) { location.assign(loginHref()); return; }
  try {
    await insertItem("Reports", { listingId: L._id, listingTitle: L.title, reason: document.getElementById("repReason").value, reporterMemberId: s.member.id, status: "open" });
    e.target.hidden = true;
    toast("Đã gửi báo cáo cho admin");
  } catch (err) { toast("Chưa gửi được báo cáo. Thử lại sau."); }
});
load();