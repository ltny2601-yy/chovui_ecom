import { shell, esc, ago, initials, whenReady, myProfile, queryItems, insertItem, getItemById, loginHref, qs, toast } from "/js/app.js";

shell("messages");
const app = document.getElementById("app");
let me = null;
let prof = null;
let threads = {};
let current = null;
let timer = null;

async function loadAll() {
  const [a, b] = await Promise.all([
    queryItems("Messages", { filters: [{ field: "fromMemberId", op: "eq", value: me.id }], sort: [{ field: "_createdDate", direction: "asc" }], limit: 200 }),
    queryItems("Messages", { filters: [{ field: "toMemberId", op: "eq", value: me.id }], sort: [{ field: "_createdDate", direction: "asc" }], limit: 200 })
  ]);
  const t = {};
  a.items.concat(b.items).sort((x, y) => String(x._createdDate).localeCompare(String(y._createdDate))).forEach((m) => {
    const mine = m.fromMemberId === me.id;
    const k = m.threadId;
    t[k] = t[k] || { id: k, listingId: m.listingId, title: m.listingTitle, other: mine ? m.toName : m.fromName, otherId: mine ? m.toMemberId : m.fromMemberId, sellerId: m.toSellerId, msgs: [] };
    t[k].msgs.push(m);
  });
  Object.keys(threads).forEach((k) => { if (!t[k] && threads[k].draft) t[k] = threads[k]; });
  threads = t;
}

function render() {
  const list = Object.values(threads).sort((x, y) => String((y.msgs[y.msgs.length - 1] || {})._createdDate || "z").localeCompare(String((x.msgs[x.msgs.length - 1] || {})._createdDate || "z")));
  const left = list.length ? list.map((t) => {
    const last = t.msgs[t.msgs.length - 1];
    return '<a class="li" href="#' + encodeURIComponent(t.id) + '" style="' + (current && current.id === t.id ? "border-color:var(--keo)" : "") + '"><span class="av">' + esc(initials(t.other)) + '</span><span class="body"><b>' + esc(t.other) + '</b><span class="small muted">' + esc(t.title) + "</span><br><span class=\"small\">" + esc(last ? last.text : "Bắt đầu trò chuyện") + "</span></span></a>";
  }).join("") : '<div class="empty"><b>Chưa có cuộc trò chuyện nào</b>Bấm Chat trên một tin đăng để hỏi người bán.</div>';
  let right = '<div class="thread"><div class="msgs"><div class="empty">Chọn một cuộc trò chuyện</div></div></div>';
  if (current) {
    const t = threads[current.id] || current;
    right = '<div class="thread"><div class="top"><b>' + esc(t.other) + '</b><div class="small muted"><a href="/item.html?id=' + encodeURIComponent(t.listingId) + '" data-goto="' + esc(t.listingId) + '">' + esc(t.title) + "</a></div></div>"
      + '<div class="msgs" id="msgs">' + (t.msgs.length ? t.msgs.map((m) => '<div class="bub' + (m.fromMemberId === me.id ? " me" : "") + '">' + esc(m.text) + '<div class="small muted">' + esc(ago(m._createdDate)) + "</div></div>").join("") : '<div class="muted small">Chào hỏi và hẹn giờ gặp ở điểm giao dịch nhé.</div>') + "</div>"
      + (t.otherId ? "" : '<div class="notice warn" style="margin:0 10px"><b>Người bán mẫu</b>Đây là hồ sơ dữ liệu mẫu nên sẽ không trả lời.</div>')
      + '<div class="notice" style="margin:10px">Mọi giao dịch tại Kệ đều được kiểm tra hàng. Không chuyển khoản trước cho người lạ.</div>'
      + '<form class="compose" id="send"><input class="input" id="txt" placeholder="Nhập tin nhắn..." autocomplete="off" aria-label="Tin nhắn"><button class="btn primary sm" type="submit">Gửi</button></form></div>';
  }
  app.innerHTML = '<div class="page-h"><h1>Tin nhắn</h1></div><div class="chat"><div class="threads">' + left + "</div>" + right + "</div>";
  const box = document.getElementById("msgs");
  if (box) box.scrollTop = box.scrollHeight;
}

function openHash() {
  const k = decodeURIComponent(location.hash.slice(1));
  current = threads[k] || null;
  render();
}

app.addEventListener("click", async (e) => {
  const g = e.target.closest("[data-goto]");
  if (!g) return;
  e.preventDefault();
  const l = await getItemById("Listings", g.dataset.goto).catch(() => null);
  if (l) location.assign("/item.html?slug=" + encodeURIComponent(l.slug));
});
app.addEventListener("submit", async (e) => {
  if (e.target.id !== "send") return;
  e.preventDefault();
  const inp = document.getElementById("txt");
  const text = inp.value.trim();
  if (!text || !current) return;
  inp.value = "";
  try {
    const t = threads[current.id] || current;
    await insertItem("Messages", { threadId: t.id, listingId: t.listingId, listingTitle: t.title, fromMemberId: me.id, fromName: prof.displayName, toMemberId: t.otherId || "", toName: t.other, toSellerId: t.sellerId || "", text });
    t.draft = false;
    await loadAll();
    current = threads[t.id] || t;
    render();
  } catch (x) { toast("Chưa gửi được tin nhắn"); inp.value = text; }
});
window.addEventListener("hashchange", openHash);

(async () => {
  const s = await whenReady();
  if (!s.loggedIn) { app.innerHTML = '<div class="empty"><b>Đăng nhập để nhắn tin</b><div class="center"><a class="btn primary" href="' + loginHref() + '">Đăng nhập</a></div></div>'; return; }
  me = s.member;
  prof = await myProfile(me);
  await loadAll();
  const lid = qs("listing");
  if (lid) {
    const l = await getItemById("Listings", lid).catch(() => null);
    if (l) {
      const mine = l.sellerMemberId === me.id;
      const id = l._id + ":" + me.id;
      if (!mine && !threads[id]) threads[id] = { id, listingId: l._id, title: l.title, other: l.sellerName, otherId: l.sellerMemberId || "", sellerId: l.sellerId, msgs: [], draft: true };
      if (!mine) { history.replaceState(null, "", "/messages.html#" + encodeURIComponent(id)); }
    }
  }
  openHash();
  timer = setInterval(async () => { if (document.hidden) return; const before = JSON.stringify(Object.keys(threads).map((k) => threads[k].msgs.length)); await loadAll().catch(() => {}); if (JSON.stringify(Object.keys(threads).map((k) => threads[k].msgs.length)) !== before) { current = current ? threads[current.id] || current : null; render(); } }, 8000);
})();