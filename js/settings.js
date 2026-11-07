import { shell, AREAS, esc, whenReady, myProfile, resetProfile, universities, patchItemFields, loginHref, toast, logout, setPick } from "/js/app.js";

shell("me");
const app = document.getElementById("app");
let prof = null;
let me = null;
let unis = [];
const TINTS = ["pink", "lav", "mint", "blue", "yellow", "peach"];

function render() {
  let uo = '<option value="">Chọn trường</option>';
  AREAS.forEach((a) => {
    const l = unis.filter((u) => u.area === a);
    if (l.length) uo += '<optgroup label="' + esc(a) + '">' + l.map((u) => '<option value="' + esc(u.code) + '"' + (u.code === prof.university ? " selected" : "") + ">" + esc(u.name) + "</option>").join("") + "</optgroup>";
  });
  const tog = (id, label, on) => '<label class="cb"><input type="checkbox" id="' + id + '"' + (on ? " checked" : "") + "> " + label + "</label>";
  app.innerHTML = '<div class="form"><div class="crumb"><a href="/me.html">Tôi</a> / Xác thực và cài đặt</div><div class="page-h"><h1>Xác thực và cài đặt</h1></div>'
    + '<section class="panel form"><h2>Xác thực tài khoản</h2><div class="list">'
    + '<div class="li"><div class="body"><b>Email</b><span class="small muted">' + esc(me.loginEmail || "") + '</span></div><span class="chip ok">Đã xác thực</span></div>'
    + '<div class="li"><div class="body"><b>Số điện thoại</b><span class="small muted">' + esc(prof.phone || "Chưa thêm") + '</span></div><span class="chip ' + (prof.verified ? "ok" : "warn") + '">' + (prof.verified ? "Đã xác thực" : "Đang chờ duyệt") + "</span></div>"
    + '<div class="li"><div class="body"><b>Thẻ sinh viên</b><span class="small muted">Tùy chọn, giúp tin của bạn được tin tưởng hơn</span></div><span class="chip muted">Chưa xác thực</span></div></div></section>'
    + '<form class="panel form" id="fProf" novalidate><h2>Thông tin cá nhân</h2>'
    + '<div class="field"><label for="pName">Tên hiển thị</label><input class="input" id="pName" value="' + esc(prof.displayName) + '" required></div>'
    + '<div class="grid2"><div class="field"><label for="pPhone">Số điện thoại</label><input class="input" id="pPhone" type="tel" value="' + esc(prof.phone || "") + '"></div>'
    + '<div class="field"><label for="pUni">Trường theo học</label><select class="input" id="pUni">' + uo + "</select></div></div>"
    + '<div class="field"><label for="pBio">Giới thiệu ngắn</label><textarea class="input" id="pBio" placeholder="VD: Năm 3 Kinh tế, hay pass giáo trình theo kỳ">' + esc(prof.bio || "") + "</textarea></div>"
    + '<div class="field"><span class="lbl">Màu ảnh đại diện</span><div class="row" id="tints">' + TINTS.map((t) => '<button type="button" class="av t-' + t + '" data-tint="' + t + '" aria-pressed="' + (prof.avatarTint === t) + '" aria-label="Màu ' + t + '" style="border:' + (prof.avatarTint === t ? "3px solid var(--muc)" : "0") + '"></button>').join("") + "</div></div>"
    + '<h2>Thông báo và quyền riêng tư</h2>' + tog("nEmail", "Nhận email khi tin được duyệt hoặc có người giữ hàng", prof.notifyEmail !== false) + tog("nMatch", 'Báo khi có món khớp tin "Tìm đồ" của tôi', prof.notifyMatch !== false) + tog("nPhone", "Hiện số điện thoại trên trang người bán", !!prof.showPhone)
    + '<p class="err" id="err"></p><button class="btn primary" type="submit">Lưu thay đổi</button></form>'
    + '<section class="panel form"><h2>Credit đăng tin</h2><p>Bạn đang có <b>' + (Number(prof.credits) || 0) + " credit</b>. Mỗi tin trừ 1 credit thay vì chuyển 1.500đ.</p>"
    + '<div class="notice lav"><b>Gói 10 credit · 15.000đ</b>Chuyển khoản với nội dung <b>CREDIT ' + esc(String(prof._id || "").slice(-6).toUpperCase()) + "</b>. Admin cộng credit sau khi nhận tiền (bản demo chưa nhận tiền thật).</div></section>"
    + '<section class="panel form"><h2>Tài khoản</h2><div class="row"><button class="btn ghost" id="out" type="button">Đăng xuất</button></div></section></div>';
}

app.addEventListener("click", (e) => {
  const t = e.target.closest("[data-tint]");
  if (t) { prof.avatarTint = t.dataset.tint; render(); return; }
  if (e.target.closest("#out")) logout("/index.html").catch(() => {});
});
app.addEventListener("submit", async (e) => {
  e.preventDefault();
  const g = (id) => document.getElementById(id);
  const name = g("pName").value.trim();
  if (!name) { g("err").textContent = "Tên hiển thị không được để trống."; return; }
  const uni = g("pUni").value;
  const u = unis.find((x) => x.code === uni);
  const b = e.target.querySelector("button[type=submit]");
  b.disabled = true;
  try {
    prof = await patchItemFields("Profiles", prof._id, { displayName: name, phone: g("pPhone").value.trim(), university: uni, area: u ? u.area : "", bio: g("pBio").value.trim(), avatarTint: prof.avatarTint || "pink", notifyEmail: g("nEmail").checked, notifyMatch: g("nMatch").checked, showPhone: g("nPhone").checked });
    resetProfile();
    if (uni) setPick({ uni: uni, area: "" });
    toast("Đã lưu thay đổi");
    render();
  } catch (x) { g("err").textContent = "Chưa lưu được. Thử lại sau ít phút."; }
  b.disabled = false;
});

(async () => {
  const s = await whenReady();
  if (!s.loggedIn) { app.innerHTML = '<div class="empty"><b>Đăng nhập để mở cài đặt</b><div class="center"><a class="btn primary" href="' + loginHref() + '">Đăng nhập</a></div></div>'; return; }
  me = s.member;
  [prof, unis] = await Promise.all([myProfile(me), universities()]);
  render();
})();