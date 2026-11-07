import { shell, CATS, LIVE, queryItems, countItems, card, icon, esc, universities, pickFilters, pickLabel, skeletons } from "/js/app.js";

shell("home");
const catsEl = document.getElementById("cats");
const newGrid = document.getElementById("newGrid");
const shelfGrid = document.getElementById("shelfGrid");
const newTitle = document.getElementById("newTitle");

function setStat(k, v) { const el = document.querySelector('[data-s="' + k + '"]'); if (el) el.textContent = v.toLocaleString("vi-VN"); }
countItems("Listings", [LIVE]).then((n) => setStat("live", n)).catch(() => {});
countItems("Profiles", []).then((n) => setStat("users", n)).catch(() => {});
countItems("Listings", [{ field: "status", op: "eq", value: "sold" }]).then((n) => setStat("sold", n)).catch(() => {});

async function load() {
  const unis = await universities();
  const pf = pickFilters();
  newTitle.textContent = pf.length ? "Tin mới tại " + pickLabel(unis) : "Tin mới đăng";
  catsEl.innerHTML = CATS.map((c) => '<a class="cat t-' + c.tint + '" href="/search.html?cat=' + c.id + '"><span class="ico">' + icon(c.icon) + "</span><span>" + esc(c.name) + '<small data-c="' + c.id + '">&nbsp;</small></span></a>').join("");
  CATS.forEach((c) => {
    countItems("Listings", [LIVE, { field: "category", op: "eq", value: c.id }].concat(pf)).then((n) => {
      const el = catsEl.querySelector('[data-c="' + c.id + '"]'); if (el) el.textContent = n + " tin";
    }).catch(() => {});
  });
  newGrid.innerHTML = skeletons(10);
  shelfGrid.innerHTML = skeletons(5);
  try {
    const r = await queryItems("Listings", { filters: [LIVE].concat(pf), sort: [{ field: "postedAt", direction: "desc" }], limit: 10 });
    newGrid.innerHTML = r.items.length ? r.items.map((l) => card(l, unis)).join("")
      : '<div class="empty"><b>Chưa có tin nào ở ' + esc(pickLabel(unis)) + '</b>Thử chọn "Tất cả trường" hoặc là người đầu tiên đăng tin.</div>';
  } catch (e) {
    newGrid.innerHTML = '<div class="empty"><b>Chưa tải được tin đăng</b>Kiểm tra kết nối mạng rồi tải lại trang.</div>';
  }
  try {
    const s = await queryItems("Listings", { filters: [LIVE, { field: "onShelf", op: "eq", value: true }], sort: [{ field: "postedAt", direction: "desc" }], limit: 5 });
    shelfGrid.innerHTML = s.items.length ? s.items.map((l) => card(l, unis)).join("") : '<div class="empty"><b>Kệ đang trống</b>Đồ gửi tại Kệ sẽ hiện ở đây.</div>';
  } catch (e) { shelfGrid.innerHTML = ""; }
}
load();
window.addEventListener("cv-pick", load);