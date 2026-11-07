import { shell, LIVE, esc, card, initials, getItemById, queryItems, universities, uniName, qs, icon, ago } from "/js/app.js";

shell("search");
const app = document.getElementById("app");
(async () => {
  const unis = await universities();
  const p = await getItemById("Profiles", qs("id")).catch(() => null);
  if (!p) { app.innerHTML = '<div class="empty"><b>Không tìm thấy người bán</b><a href="/search.html">Quay lại chợ</a></div>'; return; }
  document.title = p.displayName + " – Chợ Vui";
  const [ls, rv, sold] = await Promise.all([
    queryItems("Listings", { filters: [LIVE, { field: "sellerId", op: "eq", value: p._id }], sort: [{ field: "postedAt", direction: "desc" }], limit: 40 }),
    queryItems("Reviews", { filters: [{ field: "toSellerId", op: "eq", value: p._id }], limit: 30 }),
    queryItems("Listings", { filters: [{ field: "status", op: "eq", value: "sold" }, { field: "sellerId", op: "eq", value: p._id }], limit: 50 })
  ]);
  const year = p.joinedAt ? new Date(p.joinedAt).getFullYear() : "";
  app.innerHTML = '<div class="me-head"><span class="av lg t-' + esc(p.avatarTint || "pink") + '">' + esc(initials(p.displayName)) + '</span><div><h1>' + esc(p.displayName) + '</h1><div class="muted">' + esc(uniName(p.university, unis)) + (p.area ? " · " + esc(p.area) : "") + '</div><div class="row" style="margin-top:6px">' + (p.verified ? '<span class="chip ok">✓ Đã xác thực</span>' : "") + (p.showPhone && p.phone ? '<span class="chip">' + esc(p.phone) + "</span>" : "") + "</div>" + (p.bio ? '<p style="margin:8px 0 0">' + esc(p.bio) + "</p>" : "") + "</div></div>"
    + '<div class="info-cards sec"><div class="panel"><b class="big-price" style="color:var(--muc)">' + (ls.items.length + sold.items.length) + '</b><div class="muted">Đã đăng</div></div><div class="panel"><b class="big-price" style="color:var(--muc)">' + (Number(p.rating) || 0).toFixed(1) + '★</b><div class="muted">' + (p.ratingCount || 0) + ' đánh giá</div></div><div class="panel"><b class="big-price" style="color:var(--muc)">' + (year ? "T" + (new Date(p.joinedAt).getMonth() + 1) + "/" + year : "–") + '</b><div class="muted">Tham gia</div></div></div>'
    + '<section class="sec"><div class="sec-h"><h2>Đang bán (' + ls.items.length + ')</h2></div><div class="grid">' + (ls.items.map((l) => card(l, unis)).join("") || '<div class="empty">Người bán chưa có tin nào đang bán.</div>') + "</div></section>"
    + '<section class="sec"><div class="sec-h"><h2>Đánh giá (' + rv.items.length + ')</h2></div><div class="list">' + (rv.items.map((r) => '<div class="li"><span class="av">' + esc(initials(r.fromName)) + '</span><div class="body"><b>' + esc(r.fromName) + " · " + "★".repeat(r.stars || 0) + '</b><span class="small">' + esc(r.text || "Không để lại nhận xét") + "</span></div></div>").join("") || '<div class="empty">Chưa có đánh giá.</div>') + "</div></section>";
})();