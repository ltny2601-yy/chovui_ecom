import { shell, CATS, CONDITIONS, CHECKLIST, AREAS, esc, vnd, qs, whenReady, myProfile, universities, insertItem, patchItemFields, loginHref, toast, resetProfile, isAdmin } from "/js/app.js";

shell("post");
const app = document.getElementById("app");
let mode = qs("mode") === "want" ? "want" : "sell";
let prof = null;
let unis = [];
let photos = [];
const MAX_PHOTOS = 5;

function qrSvg(seed) {
  let s = 0;
  for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  let cells = "";
  for (let y = 0; y < 25; y++) for (let x = 0; x < 25; x++) {
    const fx = x > 17 ? x - 18 : x, fy = y > 17 ? y - 18 : y;
    const corner = (x < 7 && y < 7) || (x > 17 && y < 7) || (x < 7 && y > 17);
    s = (s * 1103515245 + 12345) >>> 0;
    const on = corner ? (fx === 0 || fy === 0 || fx === 6 || fy === 6 || (fx > 1 && fx < 5 && fy > 1 && fy < 5)) : (s >> 16) % 2 === 0;
    if (on) cells += '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>';
  }
  return '<svg viewBox="0 0 25 25" fill="#3F3A5E" role="img" aria-label="Mã QR mẫu">' + cells + "</svg>";
}

function uniOptions(sel) {
  let h = '<option value="">Chọn trường</option>';
  AREAS.forEach((a) => {
    const l = unis.filter((u) => u.area === a);
    if (l.length) h += '<optgroup label="' + esc(a) + '">' + l.map((u) => '<option value="' + esc(u.code) + '"' + (u.code === sel ? " selected" : "") + ">" + esc(u.name) + "</option>").join("") + "</optgroup>";
  });
  return h;
}

// resize an image file into a JPEG data URL no longer than maxSide, under maxBytes
function shrink(file, maxSide, maxBytes) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, maxSide / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      let q = 0.78, out = c.toDataURL("image/jpeg", q);
      while (out.length > maxBytes && q > 0.35) { q -= 0.08; out = c.toDataURL("image/jpeg", q); }
      resolve(out);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("bad image")); };
    img.src = url;
  });
}

function renderPhotos() {
  const box = document.getElementById("photoBox");
  if (!box) return;
  box.innerHTML = photos.map((p, i) => '<div class="ph"><img src="' + p.full + '" alt="Ảnh ' + (i + 1) + '">' + (i === 0 ? '<span class="chip">Ảnh bìa</span>' : "") + '<button type="button" class="ph-x" data-rm="' + i + '" aria-label="Xóa ảnh ' + (i + 1) + '">×</button></div>').join("")
    + (photos.length < MAX_PHOTOS ? '<label class="ph add" for="sPhotos"><span>+ Thêm ảnh</span><small>' + photos.length + "/" + MAX_PHOTOS + "</small></label>" : "");
}

function render() {
  const seg = '<div class="seg" role="tablist"><button type="button" data-mode="sell" aria-selected="' + (mode === "sell") + '">Bán / Cho đi</button><button type="button" data-mode="want" aria-selected="' + (mode === "want") + '">Tìm đồ</button></div>';
  if (mode === "want") {
    app.innerHTML = '<div class="form"><div class="page-h"><h1>Đăng tin tìm đồ</h1></div>' + seg
      + '<form class="panel form" id="fWant" novalidate><div class="field"><label for="wTitle">Bạn đang cần gì?</label><input class="input" id="wTitle" placeholder="VD: Cần giáo trình Kinh tế lượng ECO2003"></div>'
      + '<div class="grid2"><div class="field"><label for="wCat">Danh mục</label><select class="input" id="wCat">' + CATS.map((c) => '<option value="' + c.id + '">' + esc(c.name) + "</option>").join("") + "</select></div>"
      + '<div class="field"><label for="wBudget">Ngân sách tối đa (đồng)</label><input class="input" id="wBudget" inputmode="numeric" placeholder="200000"></div></div>'
      + '<div class="field"><label for="wUni">Trường</label><select class="input" id="wUni">' + uniOptions(prof.university) + "</select></div>"
      + '<p class="err" id="err"></p><button class="btn primary block" type="submit">Đăng tin tìm đồ (miễn phí)</button></form></div>';
    return;
  }
  app.innerHTML = '<div class="form"><div class="page-h"><h1>Đăng tin</h1></div>' + seg
    + '<form class="panel form" id="fSell" novalidate>'
    + '<div class="field"><span class="lbl">Ảnh thật của món đồ <span class="req">*</span></span><div class="photos" id="photoBox"></div><input type="file" id="sPhotos" accept="image/*" multiple hidden><small class="muted">Tối đa ' + MAX_PHOTOS + ' ảnh, ảnh đầu tiên là ảnh bìa. Chụp rõ món đồ, không lấy ảnh trên mạng.</small><small class="ferr" id="e-photos"></small></div>'
    + '<div class="grid2"><div class="field"><label for="sCat">Danh mục <span class="req">*</span></label><select class="input" id="sCat">' + CATS.map((c) => '<option value="' + c.id + '">' + esc(c.name) + "</option>").join("") + "</select></div>"
    + '<div class="field" id="codeBox" hidden><label for="sCode">Mã môn học <span class="req">*</span></label><input class="input" id="sCode" placeholder="VD: MI1111"></div></div>'
    + '<div class="field"><label for="sTitle">Tiêu đề tin <span class="req">*</span></label><input class="input" id="sTitle" maxlength="80" placeholder="VD: Casio fx-580VN X còn mới 95%"></div>'
    + '<div class="grid2"><div class="field"><label for="sBrand">Thương hiệu, model</label><input class="input" id="sBrand" placeholder="VD: Dell Latitude 7490"></div>'
    + '<div class="field"><label for="sUsed">Đã dùng bao lâu <span class="req">*</span></label><input class="input" id="sUsed" placeholder="VD: 1 năm, mua 09/2025"></div></div>'
    + '<div class="field"><label for="sPrice">Giá (đồng) <span class="req">*</span></label><input class="input" id="sPrice" inputmode="numeric" placeholder="350000"><small class="muted" id="pricePrev"></small></div>'
    + '<div class="field"><span class="lbl">Tình trạng chung <span class="req">*</span></span><div class="row" id="conds">' + CONDITIONS.map((c, i) => '<button type="button" class="chip" data-cond="' + esc(c) + '" aria-pressed="' + (i === 2) + '">' + esc(c) + "</button>").join("") + "</div></div>"
    + '<div class="field"><span class="lbl">Kê khai tình trạng <span class="req">*</span></span><small class="muted">Ghi rõ để admin duyệt nhanh và người mua yên tâm.</small><div id="ck" class="ckf"></div></div>'
    + '<div class="field"><label for="sDesc">Mô tả thêm <span class="req">*</span></label><textarea class="input" id="sDesc" placeholder="Lý do bán, lỗi nhỏ nếu có, có thương lượng không..."></textarea></div>'
    + '<div class="grid2"><div class="field"><label for="sUni">Trường <span class="req">*</span></label><select class="input" id="sUni">' + uniOptions(prof.university) + "</select></div>"
    + '<div class="field"><label for="sMeet">Nơi và giờ có thể gặp <span class="req">*</span></label><input class="input" id="sMeet" placeholder="VD: Sảnh thư viện, tối thứ 3–5"><small class="muted">Hai bên tự hẹn chi tiết qua chat.</small></div></div>'
    + '<label class="cb"><input type="checkbox" id="sShelf"> Gửi đồ tại Kệ Chợ Vui (người mua tới Kệ lấy, bạn không cần hẹn)</label>'
    + '<div class="notice lav"><b>Gửi tin cho admin duyệt · phí 1.500đ</b>Admin xem ảnh và thông tin rồi duyệt hoặc từ chối kèm lý do, thường trong 12 giờ. Bị từ chối được sửa và gửi lại miễn phí 1 lần. Bạn đang có ' + (Number(prof.credits) || 0) + " credit.</div>"
    + '<p class="err" id="err"></p><button class="btn primary block" type="submit">Gửi tin cho admin duyệt · 1.500đ</button></form></div>';
  renderPhotos();
  syncCat();
}

function syncCat() {
  const cat = document.getElementById("sCat").value;
  document.getElementById("codeBox").hidden = cat !== "gt";
  document.getElementById("ck").innerHTML = CHECKLIST[cat].map((x, i) => '<div class="field"><label for="ck' + i + '">' + esc(x[0]) + '</label><input class="input" data-ck="' + esc(x[0]) + '" id="ck' + i + '" placeholder="' + esc(x[1]) + '"></div>').join("");
}

function slugify(s) { return s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60); }

app.addEventListener("click", (e) => {
  const m = e.target.closest("[data-mode]");
  if (m) { mode = m.dataset.mode; history.replaceState(null, "", "/post.html" + (mode === "want" ? "?mode=want" : "")); render(); return; }
  const c = e.target.closest("[data-cond]");
  if (c) { document.querySelectorAll("[data-cond]").forEach((b) => b.setAttribute("aria-pressed", b === c)); return; }
  const rm = e.target.closest("[data-rm]");
  if (rm) { photos.splice(Number(rm.dataset.rm), 1); renderPhotos(); }
});
app.addEventListener("change", async (e) => {
  if (e.target.id === "sCat") syncCat();
  if (e.target.id === "sPhotos") {
    const files = [...e.target.files].filter((f) => /^image\//.test(f.type)).slice(0, MAX_PHOTOS - photos.length);
    e.target.value = "";
    const errEl = document.getElementById("e-photos");
    errEl.textContent = files.length ? "Đang xử lý ảnh…" : "";
    for (const f of files) {
      try { photos.push({ full: await shrink(f, 1100, 160000), cover: null }); } catch (x) { toast("Không đọc được một ảnh, thử ảnh khác nhé"); }
    }
    errEl.textContent = "";
    renderPhotos();
  }
});
app.addEventListener("input", (e) => {
  if (e.target.id === "sPrice") { const n = Number(e.target.value.replace(/\D/g, "")); document.getElementById("pricePrev").textContent = n ? vnd(n) : ""; }
});

async function coverOf(dataUrl) {
  const blob = await (await fetch(dataUrl)).blob();
  return shrink(new File([blob], "cover.jpg", { type: "image/jpeg" }), 420, 30000);
}

app.addEventListener("submit", async (e) => {
  e.preventDefault();
  const err = document.getElementById("err");
  const btn = e.target.querySelector("button[type=submit]");
  const g = (id) => document.getElementById(id);
  err.textContent = "";
  if (e.target.id === "fWant") {
    const title = g("wTitle").value.trim();
    if (!title) { err.textContent = "Bạn ghi món đang cần giúp mình nhé."; return; }
    if (!g("wUni").value) { err.textContent = "Chọn trường để người bán gần bạn thấy tin."; return; }
    btn.disabled = true;
    try {
      await insertItem("WantAds", { title, category: g("wCat").value, budget: Number(g("wBudget").value.replace(/\D/g, "")) || 0, university: g("wUni").value, posterName: prof.displayName, status: "open", memberId: prof.memberId });
      toast("Đã đăng tin tìm đồ");
      location.assign("/me.html#want");
    } catch (x) { err.textContent = "Chưa đăng được. Thử lại sau ít phút."; btn.disabled = false; }
    return;
  }
  const title = g("sTitle").value.trim();
  const price = Number(g("sPrice").value.replace(/\D/g, ""));
  const cat = g("sCat").value;
  const uni = g("sUni").value;
  const ckInputs = [...document.querySelectorAll("[data-ck]")];
  const problems = [];
  if (!photos.length) problems.push("thêm ít nhất 1 ảnh thật");
  if (!title) problems.push("nhập tiêu đề");
  if (cat === "gt" && !g("sCode").value.trim()) problems.push("nhập mã môn học");
  if (!g("sUsed").value.trim()) problems.push("ghi đã dùng bao lâu");
  if (!price) problems.push("nhập giá bằng số (muốn cho đi thì nhập 1000)");
  if (ckInputs.some((x) => !x.value.trim())) problems.push("kê khai đủ các mục tình trạng");
  if (!g("sDesc").value.trim()) problems.push("viết mô tả thêm");
  if (!uni) problems.push("chọn trường");
  if (!g("sShelf").checked && !g("sMeet").value.trim()) problems.push("ghi nơi và giờ có thể gặp");
  g("e-photos").textContent = photos.length ? "" : "Cần ít nhất 1 ảnh thật của món đồ.";
  ckInputs.forEach((x) => x.setAttribute("aria-invalid", x.value.trim() ? "false" : "true"));
  if (problems.length) { err.textContent = "Bạn cần " + problems.join(", ") + "."; return; }
  const u = unis.find((x) => x.code === uni);
  const cond = (document.querySelector('[data-cond][aria-pressed="true"]') || {}).dataset;
  const lines = [];
  if (g("sBrand").value.trim()) lines.push("Thương hiệu, model: " + g("sBrand").value.trim());
  lines.push("Đã dùng: " + g("sUsed").value.trim());
  ckInputs.forEach((x) => lines.push(x.dataset.ck + ": " + x.value.trim()));
  btn.disabled = true;
  btn.textContent = "Đang gửi tin và ảnh…";
  try {
    const useCredit = (Number(prof.credits) || 0) > 0;
    const cover = await coverOf(photos[0].full);
    const item = await insertItem("Listings", {
      title, slug: slugify(title) + "-" + Date.now().toString(36), category: cat, courseCode: cat === "gt" ? g("sCode").value.trim().toUpperCase() : "",
      price, condition: cond ? cond.cond : "Đã dùng", checklist: lines.join("\n"), description: g("sDesc").value.trim(),
      university: uni, area: u ? u.area : "", meetPoint: g("sShelf").checked ? "Kệ Chợ Vui – Tòa C1, KTX B" : g("sMeet").value.trim(),
      status: "pending", rejectReason: "", sellerId: prof._id, sellerName: prof.displayName, sellerMemberId: prof.memberId,
      tint: ["pink", "lav", "mint", "blue", "yellow", "peach"][Math.floor(Math.random() * 6)], onShelf: g("sShelf").checked, feePaid: useCredit, views: 0, postedAt: new Date(), cover, payMethod: useCredit ? "credit" : "qr", rejectCount: 0
    });
    let failed = 0;
    for (let i = 0; i < photos.length; i++) {
      try { await insertItem("ListingPhotos", { listingId: item._id, idx: i, data: photos[i].full }); } catch (x) { failed++; }
    }
    if (useCredit) { await patchItemFields("Profiles", prof._id, { credits: Number(prof.credits) - 1 }); resetProfile(); }
    photos = [];
    const ref = "CV" + String(item._id || "").slice(-6).toUpperCase();
    app.innerHTML = '<div class="form"><div class="panel form"><h1>Đã gửi tin cho admin duyệt</h1>'
      + (failed ? '<div class="notice warn"><b>' + failed + " ảnh chưa tải lên được</b>Admin vẫn duyệt được tin, bạn có thể gửi lại ảnh sau.</div>" : "")
      + (useCredit ? "<p>Đã trừ 1 credit cho tin này. Admin sẽ xem ảnh, thông tin và duyệt trong vòng 12 giờ.</p>"
        : '<p>Chuyển <b>1.500đ</b> để hoàn tất. Admin xác nhận đã nhận phí khi duyệt tin.</p><div class="qr">' + qrSvg(ref) + '<div class="kv"><span>Số tiền</span><b>1.500đ</b><span>Nội dung</span><b>' + ref + '</b><span>Lưu ý</span><b>Mã QR mẫu của bản demo, chưa nhận tiền thật</b></div></div>')
      + '<div class="row"><a class="btn primary" href="/me.html#listings">Xem tin của tôi</a><a class="btn ghost" href="/post.html">Đăng tin khác</a></div></div></div>';
  } catch (x) {
    err.textContent = "Chưa gửi được tin. Ảnh có thể quá nặng, thử bớt ảnh rồi gửi lại.";
    btn.disabled = false;
    btn.textContent = "Gửi tin cho admin duyệt · 1.500đ";
  }
});

(async () => {
  const s = await whenReady();
  if (!s.loggedIn) {
    app.innerHTML = '<div class="empty"><b>Đăng nhập để đăng tin</b>Mỗi tài khoản đều vừa mua vừa bán được.<div class="center"><a class="btn primary" href="' + loginHref() + '">Đăng nhập / Đăng ký</a></div></div>';
    return;
  }
  if (await isAdmin(s.member)) {
    app.innerHTML = '<div class="empty"><b>Tài khoản admin không đăng tin</b>Dùng một tài khoản sinh viên để đăng tin.<div class="center"><a class="btn primary" href="/admin.html">Về trang duyệt tin</a></div></div>';
    return;
  }
  [prof, unis] = await Promise.all([myProfile(s.member), universities()]);
  render();
})();