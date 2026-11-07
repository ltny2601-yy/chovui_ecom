import { shell, universities, AREAS, esc, insertItem } from "/js/app.js";
import { subscribeMember, getMemberState, login, register, verifyEmail } from "/js/wix/member-store.js";
import { sendRecovery, EMAIL_RE, PHONE_RE, normPhone } from "/js/recovery.js";

shell("me");
const ret = new URLSearchParams(location.search).get("returnTo") || "/me.html";
const safe = ret.charAt(0) === "/" && ret.charAt(1) !== "/" ? ret : "/me.html";
const $ = (id) => document.getElementById(id);
const fIn = $("fIn"), fUp = $("fUp"), fCode = $("fCode"), forgot = $("forgot"), approval = $("approval");
const all = [fIn, fUp, fCode, forgot, approval];
let unis = [];
function only(el) { all.forEach((x) => { x.hidden = x !== el; }); $("mainSeg").hidden = el === forgot; }
if (new URLSearchParams(location.search).get("reset") === "done") $("resetDone").hidden = false;

$("mainSeg").addEventListener("click", (e) => {
  const b = e.target.closest("[data-tab]");
  if (!b) return;
  document.querySelectorAll("[data-tab]").forEach((x) => x.setAttribute("aria-selected", x === b));
  only(b.dataset.tab === "in" ? fIn : fUp);
});
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-forgot]")) { const v = $("inEmail").value.trim(); $("fgEmail").value = EMAIL_RE.test(v) ? v : ""; only(forgot); return; }
  if (e.target.closest("[data-back]")) { only(fIn); return; }
  const g = e.target.closest("[data-fg]");
  if (g) {
    document.querySelectorAll("[data-fg]").forEach((x) => x.setAttribute("aria-selected", x === g));
    $("fFgEmail").hidden = g.dataset.fg !== "email";
    $("fFgPhone").hidden = g.dataset.fg !== "phone";
    $("fgDone").hidden = true;
  }
});

function fillUnis() {
  const area = $("upArea").value;
  const list = unis.filter((u) => !area || u.area === area);
  const cur = $("upUni").value;
  $("upUni").innerHTML = '<option value="">Chọn trường</option>' + list.map((u) => '<option value="' + esc(u.code) + '">' + esc(u.name) + "</option>").join("");
  if (list.some((u) => u.code === cur)) $("upUni").value = cur;
}
universities().then((u) => {
  unis = u;
  $("upArea").innerHTML = '<option value="">Chọn khu vực</option>' + AREAS.map((a) => "<option>" + esc(a) + "</option>").join("");
  fillUnis();
});
$("upArea").addEventListener("change", fillUnis);
$("upUni").addEventListener("change", () => { const u = unis.find((x) => x.code === $("upUni").value); if (u && $("upArea").value !== u.area) { $("upArea").value = u.area; fillUnis(); $("upUni").value = u.code; } });

const MSG = {
  invalidPassword: "Mật khẩu chưa đúng. Bấm \"Quên mật khẩu?\" nếu bạn không nhớ.",
  invalidEmail: "Không tìm thấy tài khoản với email này.",
  emailAlreadyExists: "Email này đã có tài khoản. Bạn chuyển sang Đăng nhập nhé.",
  resetPassword: "Tài khoản cần đặt lại mật khẩu. Bấm \"Quên mật khẩu?\" để nhận link."
};
function show(r, form) {
  if (r.state === "SUCCESS") { location.assign(safe); return; }
  if (r.state === "EMAIL_VERIFICATION_REQUIRED") { only(fCode); return; }
  if (r.state === "OWNER_APPROVAL_REQUIRED") { only(approval); return; }
  form.querySelector("[data-err]").textContent = MSG[r.errorCode] || r.error || "Chưa thành công. Kiểm tra thông tin rồi thử lại.";
}
function run(form, action) {
  const b = form.querySelector("button[type=submit]");
  b.disabled = true;
  return action().then((r) => show(r, form))
    .catch((e) => show({ state: "FAILURE", error: e && e.message ? e.message : String(e) }, form))
    .then(() => { b.disabled = false; });
}

fIn.addEventListener("submit", (e) => {
  e.preventDefault();
  const err = fIn.querySelector("[data-err]");
  const email = $("inEmail").value.trim();
  if (!EMAIL_RE.test(email) || !$("inPass").value) { err.textContent = "Nhập email và mật khẩu để đăng nhập."; return; }
  err.textContent = "";
  run(fIn, () => login(email, $("inPass").value));
});

function validateUp() {
  const errs = {};
  const name = $("upName").value.trim().replace(/\s+/g, " ");
  const phone = normPhone($("upPhone").value);
  const email = $("upEmail").value.trim();
  const pass = $("upPass").value;
  if (!name) errs.upName = "Bạn chưa nhập họ và tên.";
  else if (name.split(" ").length < 2 || /\d/.test(name)) errs.upName = "Nhập đầy đủ họ và tên, không có chữ số.";
  if (!phone) errs.upPhone = "Bạn chưa nhập số điện thoại.";
  else if (!PHONE_RE.test(phone)) errs.upPhone = "Số điện thoại di động gồm 10 số, bắt đầu bằng 03, 05, 07, 08 hoặc 09.";
  if (!$("upArea").value) errs.upArea = "Chọn khu vực bạn học.";
  if (!$("upUni").value) errs.upUni = "Chọn trường bạn đang học.";
  if (!email) errs.upEmail = "Bạn chưa nhập email.";
  else if (!EMAIL_RE.test(email)) errs.upEmail = "Email chưa đúng định dạng, ví dụ ban@gmail.com.";
  if (!pass) errs.upPass = "Bạn chưa đặt mật khẩu.";
  else if (pass.length < 8 || !/[A-Za-z]/.test(pass) || !/\d/.test(pass)) errs.upPass = "Mật khẩu cần ít nhất 8 ký tự, có cả chữ và số.";
  if (!$("upPass2").value) errs.upPass2 = "Nhập lại mật khẩu để xác nhận.";
  else if ($("upPass2").value !== pass) errs.upPass2 = "Hai mật khẩu chưa khớp.";
  if (!$("upAgree").checked) errs.upAgree = "Bạn cần đồng ý với quy định giao dịch.";
  ["upName", "upPhone", "upArea", "upUni", "upEmail", "upPass", "upPass2", "upAgree"].forEach((k) => {
    $("e-" + k).textContent = errs[k] || "";
    $(k).setAttribute("aria-invalid", errs[k] ? "true" : "false");
  });
  return { ok: !Object.keys(errs).length, first: Object.keys(errs)[0], name, phone, email, pass };
}
fUp.addEventListener("submit", (e) => {
  e.preventDefault();
  const v = validateUp();
  const err = fUp.querySelector("[data-err]");
  if (!v.ok) { err.textContent = "Còn mục chưa điền đúng, bạn xem các dòng màu đỏ nhé."; $(v.first).focus(); return; }
  err.textContent = "";
  const parts = v.name.split(" ");
  try { localStorage.setItem("cv-pending-profile", JSON.stringify({ displayName: v.name, phone: v.phone, university: $("upUni").value })); } catch (x) {}
  run(fUp, () => register(v.email, v.pass, { firstName: v.name, lastName: "" }));
});
fUp.addEventListener("input", (e) => { const t = e.target; if (t.id && $("e-" + t.id) && $("e-" + t.id).textContent) { $("e-" + t.id).textContent = ""; t.setAttribute("aria-invalid", "false"); } });
fCode.addEventListener("submit", (e) => { e.preventDefault(); run(fCode, () => verifyEmail($("code").value.trim())); });

$("fFgEmail").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target, err = f.querySelector("[data-err]"), b = f.querySelector("button");
  const email = $("fgEmail").value.trim();
  if (!EMAIL_RE.test(email)) { err.textContent = "Nhập email bạn đã dùng để đăng ký."; return; }
  err.textContent = "";
  b.disabled = true;
  try {
    await sendRecovery(email);
    f.hidden = true;
    $("fgDone").hidden = false;
    $("fgDone").innerHTML = "<b>Đã gửi link đặt lại mật khẩu</b>Wix đã gửi link tới " + esc(email) + ". Bạn mở email (xem cả mục Spam), đặt mật khẩu mới rồi quay lại đăng nhập.";
  } catch (x) {
    err.textContent = x && x.status === 404
      ? "Không tìm thấy tài khoản với email này. Kiểm tra lại chính tả, hoặc chọn lấy lại qua số điện thoại."
      : "Chưa gửi được email. Thử lại sau ít phút, hoặc chọn lấy lại qua số điện thoại.";
  }
  b.disabled = false;
});
$("fFgPhone").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target, err = f.querySelector("[data-err]"), b = f.querySelector("button");
  const name = $("fgName").value.trim();
  const phone = normPhone($("fgPhone").value);
  if (!name) { err.textContent = "Nhập họ và tên để admin xác minh."; return; }
  if (!PHONE_RE.test(phone)) { err.textContent = "Số điện thoại gồm 10 số, bắt đầu bằng 03, 05, 07, 08 hoặc 09."; return; }
  err.textContent = "";
  b.disabled = true;
  try {
    await insertItem("ResetRequests", { phone, fullName: name, university: "", status: "open", note: "" });
    f.hidden = true;
    $("fgDone").hidden = false;
    $("fgDone").innerHTML = "<b>Đã gửi yêu cầu cho admin</b>Admin sẽ gọi tới " + esc(phone) + " để xác minh, thường trong vòng 12 giờ, rồi gửi link đặt lại mật khẩu vào email bạn đã đăng ký.";
  } catch (x) { err.textContent = "Chưa gửi được yêu cầu. Thử lại sau ít phút."; }
  b.disabled = false;
});

subscribeMember((s) => { if (!s.loading && s.loggedIn) location.replace(safe); });
if (!getMemberState().loading && getMemberState().loggedIn) location.replace(safe);