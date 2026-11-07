// Admin: duyệt tin đăng, theo thiết kế gốc của Chợ Vui (KPI, hàng chờ, checklist duyệt, từ chối kèm lý do).
import { shell, catOf, esc, vnd, ago, icon, initials, whenReady, isAdmin, myProfile, queryItems, insertItem, patchItemFields, countItems, universities, uniName, loginHref, toast } from "/js/app.js";
import { sendRecovery, EMAIL_RE } from "/js/recovery.js";

shell("admin");
const app = document.getElementById("app");
const FEE = 1500;
const CHECKS = ["Ảnh thật, không phải ảnh mạng", "Mô tả tình trạng đầy đủ", "Giá hợp lý", "Đúng danh mục", "Không phải hàng cấm"];
const REJECT_REASONS = ["Ảnh lấy từ trên mạng, không phải ảnh thật", "Thiếu thông tin tình trạng trong checklist", "Giá không hợp lý so với tình trạng", "Sai danh mục", "Hàng cấm hoặc không được phép bán", "Tin trùng lặp"];
let tab = (location.hash || "#queue").slice(1);
let me = null;
let adminName = "Admin Chợ Vui";
let role = "moderator";
const OWNER_TABS = ["users", "resets"];
const DASH_ADMINS = "https://manage.wix.com/dashboard/06341b18-244f-4c81-a121-3f78c866da31/wix-cms/data/Admins";
let unis = [];
let data = { pend: [], rej: [], users: [], reports: [], resets: [], admins: [] };
let kpi = { pend: 0, approved: 0, rejected: 0, reports: 0, resets: 0, users: 0, admins: 0 };
let profById = {};

async function fetchAll(collection, filters, sort) {
  let all = [];
  let skip = 0;
  for (let i = 0; i < 10; i++) {
    const r = await queryItems(collection, { filters: filters || [], sort: sort || [], limit: 100, skip });
    all = all.concat(r.items);
    if (!r.hasNext) break;
    skip += r.items.length;
  }
  return all;
}

function parseChecklist(text) {
  return String(text || "").split("\n").filter(Boolean).map((line) => {
    const i = line.indexOf(":");
    return i > 0 ? [line.slice(0, i).trim(), line.slice(i + 1).trim()] : ["", line.trim()];
  });
}
function payLabel(l) {
  if ((l.rejectCount || 0) > 0) return "gửi lại miễn phí";
  if (l.payMethod === "credit") return "credit";
  return "VietQR" + (l.feePaid ? "" : " (chờ xác nhận phí)");
}
function photo(l) {
  const c = catOf(l.category);
  return '<span class="qph t-' + esc(l.tint || c.tint) + '">'
    + (l.cover ? '<img src="' + esc(l.cover) + '" alt="">' : icon(c.icon)) + "</span>";
}

async function loadCounts() {
  const st = (v) => countItems("Listings", [{ field: "status", op: "in", value: v }]).catch(() => 0);
  const [pend, approved, rejected, reports, resets, users, admins] = await Promise.all([
    st(["pending"]), st(["approved", "held", "sold"]), st(["rejected"]),
    countItems("Reports", [{ field: "status", op: "eq", value: "open" }]).catch(() => 0),
    countItems("ResetRequests", [{ field: "status", op: "eq", value: "open" }]).catch(() => 0),
    countItems("Profiles", []).catch(() => 0),
    countItems("Admins", []).catch(() => 0)
  ]);
  kpi = { pend, approved, rejected, reports, resets, users, admins };
}

async function loadTab() {
  if (tab === "queue") {
    data.pend = await fetchAll("Listings", [{ field: "status", op: "eq", value: "pending" }], [{ field: "postedAt", direction: "asc" }]);
    const ids = [...new Set(data.pend.map((l) => l.sellerId).filter(Boolean))];
    if (ids.length) (await queryItems("Profiles", { filters: [{ field: "_id", op: "in", value: ids }], limit: 100 })).items.forEach((p) => { profById[p._id] = p; });
  } else if (tab === "rejected") {
    data.rej = await fetchAll("Listings", [{ field: "status", op: "eq", value: "rejected" }], [{ field: "postedAt", direction: "desc" }]);
  } else if (tab === "users") {
    const [profiles, listings, orders] = await Promise.all([fetchAll("Profiles"), fetchAll("Listings"), fetchAll("Orders")]);
    data.users = profiles.map((p) => ({
      p,
      listings: listings.filter((l) => l.sellerId === p._id).length,
      orders: p.memberId ? orders.filter((o) => o.buyerMemberId === p.memberId).length : 0
    }));
  } else if (tab === "admins") {
    data.admins = await fetchAll("Admins");
    const mids = data.admins.map((x) => x.memberId).filter(Boolean);
    const profs = mids.length ? (await queryItems("Profiles", { filters: [{ field: "memberId", op: "in", value: mids }], limit: 100 })).items : [];
    data.admins.forEach((x) => { x.profile = profs.find((p) => p.memberId === x.memberId) || null; });
  } else if (tab === "reports") {
    data.reports = await fetchAll("Reports", [{ field: "status", op: "eq", value: "open" }]);
  } else if (tab === "resets") {
    data.resets = await fetchAll("ResetRequests", [{ field: "status", op: "eq", value: "open" }], [{ field: "_createdDate", direction: "desc" }]);
    await Promise.all(data.resets.map((r) => queryItems("Profiles", { filters: [{ field: "phone", op: "eq", value: r.phone }], limit: 1 }).then((x) => { r.match = x.items[0] || null; }).catch(() => {})));
  }
}

function queueHtml() {
  if (!data.pend.length) return '<div class="empty"><b>Hết tin chờ duyệt</b>Tin mới đăng sẽ hiện ở đây theo thứ tự gửi trước, duyệt trước.</div>';
  return '<div class="queue">' + data.pend.map((l) => {
    const s = profById[l.sellerId] || {};
    const ck = parseChecklist(l.checklist);
    return '<div class="qitem" id="q-' + l._id + '">' + photo(l)
      + '<div class="qbody"><h3>' + esc(l.title) + '</h3><div class="price">' + vnd(l.price) + "</div>"
      + '<div class="small muted">' + esc(catOf(l.category).name) + " · " + esc(l.condition || "") + " · " + esc(uniName(l.university, unis)) + (l.courseCode ? " · Mã môn " + esc(l.courseCode) : "")
      + " · Người bán: " + esc(l.sellerName || s.displayName || "") + (s.verified ? " ✓" : " (chưa xác thực)") + " · Thanh toán: " + payLabel(l) + ((l.rejectCount || 0) > 0 ? " · <b>Gửi lại lần " + (l.rejectCount + 1) + "</b>" : "") + " · Gửi " + esc(ago(l.postedAt)) + "</div>"
      + '<div class="qphotos" data-photos="' + l._id + '"></div>'
      + (ck.length ? '<dl class="kv2">' + ck.map((x) => "<dt>" + esc(x[0]) + "</dt><dd>" + esc(x[1]) + "</dd>").join("") + "</dl>" : '<div class="alert">Người bán chưa kê khai tình trạng.</div>')
      + (l.meetPoint ? '<div class="small"><b>Có thể gặp:</b> ' + esc(l.meetPoint) + (l.onShelf ? " (gửi tại Kệ)" : "") + "</div>" : "")
      + (l.description ? '<p class="small" style="margin:6px 0 0">' + esc(l.description) + "</p>" : "") + "</div>"
      + '<div class="checks"><b class="small">Checklist duyệt</b>' + CHECKS.map((c) => '<label><input type="checkbox" data-ck="' + l._id + '"> ' + esc(c) + "</label>").join("")
      + '<div class="acts"><button class="btn ok sm" data-ok="' + l._id + '">✓ Duyệt</button><button class="btn line sm" data-no="' + l._id + '">Từ chối</button></div></div></div>';
  }).join("") + "</div>";
}
function rejectedHtml() {
  if (!data.rej.length) return '<div class="empty">Không có tin bị từ chối.</div>';
  return '<div class="mlist">' + data.rej.map((l) => '<div class="mitem">' + photo(l) + '<div><h4>' + esc(l.title) + '</h4><div class="tiny muted">' + esc(l.sellerName || "") + " · lần từ chối: " + (l.rejectCount || 1) + '</div><div class="alert red">' + esc(l.rejectReason || "Không ghi lý do") + "</div></div></div>").join("") + "</div>";
}
function usersHtml() {
  const rows = data.users.filter((x) => !x.p.isAdmin);
  return '<div class="box scroll"><table class="tbl"><thead><tr><th>Người dùng</th><th>Trường</th><th>Tin đăng</th><th>Đơn mua</th><th>Đánh giá</th><th>Xác thực</th><th>Cấp quyền admin</th></tr></thead><tbody>'
    + rows.map((x) => '<tr><td><b>' + esc(x.p.displayName) + "</b>" + (x.p.isSample ? ' <span class="chip muted">mẫu</span>' : "") + "</td><td>" + esc(uniName(x.p.university, unis)) + "</td><td>" + x.listings + "</td><td>" + x.orders + "</td><td>" + (Number(x.p.rating) || 0).toFixed(1) + " (" + (x.p.ratingCount || 0) + ")</td><td>" + (x.p.verified ? "✓" : "—") + "</td><td>" + (x.p.memberId ? '<button class="btn ghost sm" data-copy="' + esc(x.p.memberId) + '">Sao chép mã thành viên</button>' : '<span class="tiny muted">hồ sơ mẫu</span>') + "</td></tr>").join("")
    + "</tbody></table></div>";
}
function reportsHtml() {
  if (!data.reports.length) return '<div class="empty">Không có báo cáo nào đang mở.</div>';
  return '<div class="box scroll"><table class="tbl"><thead><tr><th>Tin đăng</th><th>Lý do</th><th></th></tr></thead><tbody>' + data.reports.map((r) => "<tr><td>" + esc(r.listingTitle) + "</td><td>" + esc(r.reason) + '</td><td class="row"><button class="btn bad sm" data-hide="' + esc(r.listingId) + '" data-rep="' + r._id + '">Ẩn tin</button><button class="btn ghost sm" data-close="' + r._id + '">Bỏ qua</button></td></tr>').join("") + "</tbody></table></div>";
}
function resetsHtml() {
  if (!data.resets.length) return '<div class="empty">Không có yêu cầu cấp lại mật khẩu.</div>';
  return '<div class="alert">Gọi vào số điện thoại để xác minh đúng chủ tài khoản, hỏi email đã đăng ký (hoặc tra trong Wix Dashboard → Contacts), nhập email rồi bấm gửi. Wix sẽ gửi link đặt lại mật khẩu tới email đó.</div><div class="list" style="margin-top:12px">'
    + data.resets.map((r) => '<div class="li"><span class="av">' + esc(initials(r.fullName)) + '</span><div class="body"><b>' + esc(r.fullName) + " · " + esc(r.phone) + '</b><span class="small muted">Gửi ' + esc(ago(r._createdDate)) + " · " + (r.match ? "Khớp hồ sơ: " + esc(r.match.displayName) + " (" + esc(uniName(r.match.university, unis)) + ")" : "Không thấy hồ sơ có số này") + '</span><div class="act"><input class="input sm" type="email" placeholder="Email đã đăng ký" id="em-' + r._id + '" style="width:220px"><button class="btn primary sm" data-sendreset="' + r._id + '">Gửi link đặt lại</button><button class="btn ghost sm" data-resetdone="' + r._id + '">Đóng yêu cầu</button></div></div></div>').join("") + "</div>";
}

function adminsHtml() {
  const chip = (r) => r === "owner" ? '<span class="chip pink">Admin chính</span>' : '<span class="chip">Kiểm duyệt viên</span>';
  let h = '<div class="list">' + data.admins.map((x) => { const nm = x.profile ? x.profile.displayName : (x.email || "Quản trị viên"); return '<div class="li"><span class="av">' + esc(initials(nm)) + '</span><div class="body"><b>' + esc(nm) + (x.memberId === me.id ? " (bạn)" : "") + '</b><span class="small muted">' + esc(x.email || "") + (x._createdDate ? " · cấp quyền " + esc(ago(x._createdDate)) : "") + "</span></div>" + chip(x.role) + "</div>"; }).join("") + "</div>";
  h += '<div class="box" style="margin-top:14px"><b>Vai trò</b><p class="small" style="margin:0"><b>Admin chính</b>: toàn quyền, xem danh sách người dùng, xử lý cấp lại mật khẩu, quản lý quản trị viên. <b>Kiểm duyệt viên</b>: duyệt tin, xem tin bị từ chối và xử lý báo cáo.</p></div>';
  if (role === "owner") h += '<div class="box" style="margin-top:12px"><b>Thêm, gỡ hoặc chuyển quyền admin</b><ol class="small" style="margin:0;padding-left:18px;display:grid;gap:4px"><li>Người được cấp quyền đăng ký tài khoản Chợ Vui trước.</li><li>Vào tab <b>Người dùng</b>, bấm "Sao chép mã thành viên" ở dòng của họ.</li><li>Mở bảng Quản trị viên trên Wix, thêm một dòng: dán mã vào cột <b>memberId</b>, ghi email, cột <b>role</b> ghi <b>owner</b> (Admin chính) hoặc <b>moderator</b> (Kiểm duyệt viên).</li><li>Gỡ quyền: xóa dòng của người đó. Chuyển quyền admin chính: đổi role của hai người cho nhau.</li></ol><div class="row" style="margin-top:8px"><a class="btn primary sm" href="' + DASH_ADMINS + '" target="_blank" rel="noopener">Mở bảng Quản trị viên trên Wix</a></div><p class="tiny muted" style="margin:6px 0 0">Chỉ chủ site đăng nhập Wix mới sửa được bảng này, nên không ai tự cấp quyền cho mình được.</p></div>';
  return h;
}

function render() {
  const rate = Math.round(kpi.approved / Math.max(1, kpi.approved + kpi.rejected) * 100);
  const tabs = [["queue", "Hàng chờ", kpi.pend], ["rejected", "Đã từ chối", kpi.rejected], ["users", "Người dùng", kpi.users], ["reports", "Báo cáo", kpi.reports], ["resets", "Cấp lại mật khẩu", kpi.resets], ["admins", "Quản trị viên", kpi.admins]].filter((t) => role === "owner" || OWNER_TABS.indexOf(t[0]) < 0);
  const body = tab === "admins" ? adminsHtml() : tab === "rejected" ? rejectedHtml() : tab === "users" ? usersHtml() : tab === "reports" ? reportsHtml() : tab === "resets" ? resetsHtml() : queueHtml();
  app.innerHTML = '<div class="panel adm2"><div class="row between"><h1 style="margin:0;font-size:24px">Duyệt tin đăng</h1><span class="small muted">Đăng nhập: ' + esc(adminName) + " · " + (role === "owner" ? "Admin chính" : "Kiểm duyệt viên") + "</span></div>"
    + '<div class="kpis"><div class="kpi t-lav"><b>' + kpi.pend + '</b><span>Tin chờ duyệt</span></div><div class="kpi t-mint"><b>' + kpi.approved + '</b><span>Tin đã duyệt</span></div><div class="kpi t-yellow"><b>' + rate + '%</b><span>Tỉ lệ duyệt (mục tiêu ≥ 80%)</span></div><div class="kpi t-pink"><b>' + vnd(kpi.approved * FEE) + "</b><span>Doanh thu phí đăng tin</span></div></div>"
    + '<div class="tabs2" role="tablist">' + tabs.map((t) => '<button role="tab" data-at="' + t[0] + '" aria-selected="' + (tab === t[0]) + '">' + t[1] + " (" + t[2] + ")</button>").join("") + "</div>"
    + body + "</div>";
  if (tab === "queue") loadPhotos();
}

function loadPhotos() {
  document.querySelectorAll("[data-photos]").forEach((el) => {
    queryItems("ListingPhotos", { filters: [{ field: "listingId", op: "eq", value: el.dataset.photos }], sort: [{ field: "idx", direction: "asc" }], limit: 6 }).then((r) => {
      el.innerHTML = r.items.length ? r.items.map((p, i) => '<button type="button" class="qp" data-zoom="' + i + '"><img src="' + p.data + '" alt="Ảnh ' + (i + 1) + '"></button>').join("") : '<span class="small muted">Chưa có ảnh thật đính kèm.</span>';
      el._photos = r.items;
    }).catch(() => {});
  });
}

async function refresh() {
  if (role !== "owner" && OWNER_TABS.indexOf(tab) > -1) tab = "queue";
  app.querySelector(".panel") && app.querySelector(".panel").classList.add("dim");
  await Promise.all([loadCounts(), loadTab()]);
  render();
}

async function notifySeller(l, text) {
  if (!l.sellerMemberId) return;
  try {
    await insertItem("Messages", { threadId: "sys-" + l.sellerMemberId, listingId: l._id, listingTitle: l.title, fromMemberId: me.id, fromName: "Admin Chợ Vui", toMemberId: l.sellerMemberId, toName: l.sellerName || "", toSellerId: l.sellerId || "", text });
  } catch (e) { /* the decision is saved even if the message fails */ }
}

function modal(html) {
  closeModal();
  const m = document.createElement("div");
  m.className = "overlay2";
  m.innerHTML = '<div class="modal2" role="dialog" aria-modal="true">' + html + "</div>";
  m.addEventListener("click", (e) => { if (e.target === m || e.target.closest("[data-close]")) closeModal(); });
  document.body.appendChild(m);
  const f = m.querySelector("input,textarea,button");
  if (f) f.focus();
  return m;
}
function closeModal() { const m = document.querySelector(".overlay2"); if (m) m.remove(); }
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

function rejectDialog(l) {
  const m = modal("<h3>Từ chối tin</h3><p class=\"small muted\">" + esc(l.title) + "</p>"
    + REJECT_REASONS.map((x, i) => '<label class="radio"><input type="radio" name="rr" value="' + esc(x) + '"' + (i ? "" : " checked") + "> " + esc(x) + "</label>").join("")
    + '<textarea class="input" id="rNote" placeholder="Hướng dẫn người bán sửa (không bắt buộc)" style="margin-top:8px"></textarea>'
    + ((l.rejectCount || 0) >= 1 ? '<div class="alert">Đây là lần từ chối thứ 2: người bán sẽ được hoàn 1 credit.</div>' : "")
    + '<div class="row" style="margin-top:12px"><button class="btn primary" id="rjOk">Từ chối và báo người bán</button><button class="btn ghost" data-close>Hủy</button></div>');
  m.querySelector("#rjOk").addEventListener("click", async (e) => {
    const b = e.currentTarget;
    b.disabled = true;
    const note = m.querySelector("#rNote").value.trim();
    const reason = m.querySelector('input[name="rr"]:checked').value + (note ? ". " + note : "");
    const count = (l.rejectCount || 0) + 1;
    try {
      await patchItemFields("Listings", l._id, { status: "rejected", rejectReason: reason, rejectCount: count, refundDue: count >= 2 });
      await notifySeller(l, 'Tin "' + l.title + '" bị từ chối: ' + reason + (count >= 2 ? " Đã hoàn 1 credit vào ví." : " Bạn được sửa và gửi lại miễn phí 1 lần."));
      closeModal();
      toast("Đã từ chối và thông báo người bán");
      refresh();
    } catch (x) { b.disabled = false; toast("Chưa từ chối được. Thử lại sau."); }
  });
}

app.addEventListener("click", async (e) => {
  const t = e.target.closest("[data-at]");
  if (t) { tab = t.dataset.at; history.replaceState(null, "", "#" + tab); refresh(); return; }
  const cp = e.target.closest("[data-copy]");
  if (cp) {
    const v = cp.dataset.copy;
    try { await navigator.clipboard.writeText(v); toast("Đã sao chép mã thành viên"); }
    catch (x) { modal('<h3>Mã thành viên</h3><input class="input" id="cpv" readonly value="' + esc(v) + '"><div class="row" style="margin-top:10px"><button class="btn ghost" data-close>Đóng</button></div>'); document.getElementById("cpv").select(); }
    return;
  }
  const z = e.target.closest("[data-zoom]");
  if (z) { const list = z.parentElement._photos || []; modal('<img class="zoom" src="' + list[Number(z.dataset.zoom)].data + '" alt="Ảnh tin đăng"><div class="row" style="margin-top:10px"><button class="btn ghost" data-close>Đóng</button></div>'); return; }
  const ok = e.target.closest("[data-ok]");
  if (ok) {
    const id = ok.dataset.ok;
    const unchecked = [...document.querySelectorAll('[data-ck="' + id + '"]')].filter((c) => !c.checked).length;
    if (unchecked) { toast("Tick đủ 5 mục checklist trước khi duyệt"); return; }
    const l = data.pend.find((x) => x._id === id);
    ok.disabled = true;
    try {
      await patchItemFields("Listings", id, { status: "approved", feePaid: true, rejectReason: "", postedAt: new Date() });
      await notifySeller(l, 'Tin "' + l.title + '" đã được duyệt và đang hiển thị.');
      toast("Đã duyệt");
      refresh();
    } catch (x) { ok.disabled = false; toast("Chưa duyệt được. Thử lại sau."); }
    return;
  }
  const no = e.target.closest("[data-no]");
  if (no) { rejectDialog(data.pend.find((x) => x._id === no.dataset.no)); return; }
  const b = e.target.closest("button");
  if (!b) return;
  try {
    if (b.dataset.hide) {
      b.disabled = true;
      await patchItemFields("Listings", b.dataset.hide, { status: "rejected", rejectReason: "Tin bị báo cáo và đã bị ẩn" });
      await patchItemFields("Reports", b.dataset.rep, { status: "closed" });
      toast("Đã ẩn tin");
      refresh();
    } else if (b.dataset.close) {
      b.disabled = true;
      await patchItemFields("Reports", b.dataset.close, { status: "closed" });
      refresh();
    } else if (b.dataset.sendreset) {
      const id = b.dataset.sendreset;
      const email = document.getElementById("em-" + id).value.trim();
      if (!EMAIL_RE.test(email)) { toast("Nhập email đã đăng ký của bạn ấy"); return; }
      b.disabled = true;
      await sendRecovery(email);
      await patchItemFields("ResetRequests", id, { status: "done", note: "Đã gửi link tới " + email });
      toast("Đã gửi link đặt lại mật khẩu");
      refresh();
    } else if (b.dataset.resetdone) {
      b.disabled = true;
      await patchItemFields("ResetRequests", b.dataset.resetdone, { status: "closed" });
      refresh();
    }
  } catch (x) {
    b.disabled = false;
    toast(x && x.status === 404 ? "Email này chưa có tài khoản Chợ Vui" : "Chưa thực hiện được. Thử lại sau.");
  }
});

(async () => {
  const s = await whenReady();
  if (!s.loggedIn) { app.innerHTML = '<div class="empty"><b>Khu vực dành cho admin</b>Đăng nhập bằng tài khoản admin để duyệt tin.<div class="center"><a class="btn primary" href="' + loginHref() + '">Đăng nhập</a></div></div>'; return; }
  if (!(await isAdmin(s.member))) { app.innerHTML = '<div class="empty"><b>Khu vực dành cho admin</b>Tài khoản của bạn chưa có quyền quản trị.</div>'; return; }
  me = s.member;
  try { const p = await myProfile(me); adminName = (p && p.displayName) || adminName; } catch (e) {}
  try { const ad = await queryItems("Admins", { filters: [{ field: "memberId", op: "eq", value: me.id }], limit: 1 }); role = (ad.items[0] && ad.items[0].role) === "owner" ? "owner" : "moderator"; } catch (e) {}
  app.innerHTML = '<div class="skel" style="aspect-ratio:3"></div>';
  unis = await universities();
  await refresh();
})();