// Tạo data/seed/plan.json: dữ liệu mẫu của Chợ Vui (chạy: node data/seed/gen-plan.mjs)
import { writeFileSync } from "node:fs";

const unis = [
  ["HUST","ĐH Bách khoa Hà Nội","Hai Bà Trưng"],
  ["NEU","ĐH Kinh tế Quốc dân","Hai Bà Trưng"],
  ["HUCE","ĐH Xây dựng Hà Nội","Hai Bà Trưng"],
  ["FTU","ĐH Ngoại thương","Đống Đa"],
  ["BA","Học viện Ngân hàng","Đống Đa"],
  ["TLU","ĐH Thủy lợi","Đống Đa"],
  ["UTC","ĐH Giao thông Vận tải","Đống Đa"],
  ["HLU","ĐH Luật Hà Nội","Đống Đa"],
  ["UET","ĐH Công nghệ – ĐHQGHN","Cầu Giấy"],
  ["HNUE","ĐH Sư phạm Hà Nội","Cầu Giấy"],
  ["AJC","Học viện Báo chí và Tuyên truyền","Cầu Giấy"],
  ["TMU","ĐH Thương mại","Cầu Giấy"],
  ["HUS","ĐH Khoa học Tự nhiên – ĐHQGHN","Thanh Xuân"],
  ["USSH","ĐH KHXH&NV – ĐHQGHN","Thanh Xuân"],
  ["HAU","ĐH Kiến trúc Hà Nội","Thanh Xuân"],
  ["HANU","ĐH Hà Nội","Nam Từ Liêm"],
  ["HUMG","ĐH Mỏ – Địa chất","Bắc Từ Liêm"],
  ["HaUI","ĐH Công nghiệp Hà Nội","Bắc Từ Liêm"],
  ["PTIT","Học viện Công nghệ Bưu chính Viễn thông","Hà Đông"],
  ["VNUA","Học viện Nông nghiệp Việt Nam","Gia Lâm"],
];
const uniMap = Object.fromEntries(unis.map(u => [u[0], u]));

const meet = [
  ["HUST","Sảnh thư viện Tạ Quang Bửu","Thứ 2 – Thứ 7, 8:00 – 20:00"],
  ["HUST","Kệ Chợ Vui – Tòa C1, KTX B","Thứ 2 – Thứ 6, 18:00 – 20:00 · Thứ 7, 9:00 – 11:00"],
  ["NEU","Sảnh tòa A1","Thứ 2 – Thứ 7, 7:30 – 19:00"],
  ["FTU","Căng tin nhà A","Thứ 2 – Thứ 6, 10:00 – 14:00"],
  ["UET","Sảnh nhà E3","Thứ 2 – Thứ 7, 8:00 – 18:00"],
  ["HANU","Cổng thư viện","Thứ 2 – Thứ 6, 8:00 – 17:00"],
  ["PTIT","Sảnh nhà A2","Thứ 2 – Thứ 7, 8:00 – 18:00"],
  ["HNUE","Cổng KTX","Hằng ngày, 17:00 – 21:00"],
];

const sellers = [
  ["Minh Anh","HUST","Năm 4, Điện tử viễn thông. Dọn phòng trước khi ra trường.",4.9,23,15],
  ["Hoàng Nam","NEU","Năm 3, Kinh tế. Pass giáo trình theo kỳ.",4.8,17,30],
  ["Thu Hà","FTU","Năm 2, thích đồ handmade, hay đổi sách.",4.7,11,45],
  ["Quốc Bảo","UET","Năm 4 CNTT, có laptop và đồ công nghệ.",5.0,9,20],
  ["Lan Chi","HANU","Năm 3 Ngôn ngữ Anh, pass sách IELTS.",4.6,14,60],
  ["Đức Anh","PTIT","Năm 2, chơi guitar và cầu lông.",4.8,6,25],
  ["Ngọc Mai","HNUE","Năm 4 Sư phạm Toán, chuyển trọ cuối năm.",4.9,19,35],
  ["Tuấn Kiệt","HUCE","Năm 5 Kiến trúc – Xây dựng, dư dụng cụ vẽ.",4.5,8,90],
  ["Phương Linh","TMU","Năm 3 Marketing, bán đồ KTX gọn gàng.",4.7,12,40],
  ["Gia Huy","BA","Năm 1, mới lên Hà Nội, vừa mua vừa bán.",4.4,3,120],
];

// [title, cat, courseCode, price, condition, sellerIdx, status, tint, extra]
const L = [
  ["MacBook Air M1 2020 – 8GB/256GB","dt","",14500000,"Như mới",0,"held","blue",{ck:["Pin 91%","Màn không điểm chết","Bàn phím tốt","Chưa sửa chữa"]}],
  ["Dell Latitude 7490 i5 – 16GB RAM","dt","",6200000,"Đã dùng",3,"approved","blue",{ck:["Pin 78%","Màn có 1 vết xước nhỏ","Bàn phím tốt","Thay SSD 512GB"]}],
  ["ThinkPad T480 i7 – 512GB SSD","dt","",7800000,"Đã dùng",3,"approved","lav",{ck:["Pin 82%","Màn tốt","Phím hơi mòn","Chưa sửa"]}],
  ["ASUS Vivobook 15 Ryzen 5","dt","",5900000,"Như mới",9,"pending","blue",{ck:["Pin 95%","Màn tốt","Bàn phím tốt","Còn bảo hành 4 tháng"]}],
  ["HP Pavilion 14 i5 Gen 11","dt","",6900000,"Đã dùng",6,"approved","pink",{ck:["Pin 80%","Màn tốt","Bàn phím tốt","Đã thay quạt"]}],
  ["Màn hình Dell 24 inch P2419H","dt","",2100000,"Đã dùng",0,"approved","pink",{}],
  ["Tai nghe Sony WH-CH520","dt","",650000,"Như mới",0,"approved","blue",{}],
  ["Loa Bluetooth JBL Go 3","dt","",420000,"Đã dùng",1,"approved","yellow",{}],
  ["Chuột Logitech MX Anywhere 3","dt","",750000,"Như mới",3,"approved","mint",{}],
  ["Bàn phím cơ Keychron K2 – switch nâu","dt","",950000,"Đã dùng",5,"approved","lav",{}],
  ["iPad Gen 9 64GB Wi-Fi","dt","",4300000,"Như mới",4,"held","blue",{ck:["Pin 89%","Màn không xước","Có ốp kèm"]}],
  ["Ổ cứng di động Samsung T7 500GB","dt","",1200000,"Như mới",3,"sold","peach",{}],
  ["Kindle Paperwhite Gen 10","dt","",1500000,"Đã dùng",4,"approved","mint",{}],
  ["Webcam Logitech C270 học online","dt","",250000,"Đã dùng",9,"approved","yellow",{}],

  ["Giải tích 1 – Nguyễn Đình Trí","gt","MI1111",45000,"Còn mới 90%",0,"approved","yellow",{ck:["Đúng tái bản 2023","Không ghi chú","Không rách"]}],
  ["Vật lý đại cương 1","gt","PH1110",30000,"Đã dùng",0,"approved","blue",{ck:["Có highlight vài trang","Không rách"]}],
  ["Đại số tuyến tính – có lời giải","gt","MI1141",40000,"Còn mới 90%",6,"approved","yellow",{}],
  ["Tin học đại cương + slide in sẵn","gt","IT1110",25000,"Đã dùng",3,"approved","lav",{onShelf:true}],
  ["Cấu trúc dữ liệu và giải thuật","gt","IT3011",55000,"Còn mới 90%",3,"approved","mint",{}],
  ["Xác suất thống kê – bài tập","gt","MI2020",35000,"Đã dùng",6,"approved","peach",{}],
  ["Triết học Mác – Lênin","gt","SSH1111",20000,"Đã dùng",7,"approved","pink",{onShelf:true}],
  ["Kinh tế vi mô","gt","KTE201",38000,"Còn mới 90%",2,"approved","yellow",{}],
  ["Giáo trình Kinh tế vĩ mô","gt","KTE203",38000,"Đã dùng",2,"held","pink",{}],
  ["Kinh tế lượng – NEU","gt","ECO2003",42000,"Còn mới 90%",1,"approved","blue",{}],
  ["Nguyên lý kế toán","gt","ACT1101",36000,"Đã dùng",1,"approved","mint",{}],
  ["Marketing căn bản","gt","MKT1101",40000,"Còn mới 90%",8,"pending","peach",{}],
  ["Pháp luật đại cương","gt","LAW1101",25000,"Đã dùng",9,"approved","lav",{onShelf:true}],
  ["Cambridge IELTS 18 – kèm audio","gt","ENG2001",60000,"Như mới",4,"approved","yellow",{}],

  ["Nồi cơm điện Sharp 1.8L","ktx","",250000,"Đã dùng",6,"approved","mint",{}],
  ["Quạt đứng Senko 3 cánh","ktx","",180000,"Đã dùng",0,"approved","blue",{}],
  ["Đèn bàn LED chống cận","ktx","",90000,"Như mới",0,"held","yellow",{}],
  ["Gương đứng toàn thân","ktx","",100000,"Đã dùng",8,"approved","pink",{}],
  ["Bàn gấp học tập có ngăn kéo","ktx","",150000,"Đã dùng",8,"approved","peach",{}],
  ["Ấm siêu tốc Lock&Lock 1.7L","ktx","",120000,"Như mới",8,"approved","mint",{}],
  ["Kệ sách 4 tầng lắp ghép","ktx","",130000,"Đã dùng",6,"sold","lav",{}],
  ["Tủ vải 3 buồng","ktx","",170000,"Đã dùng",9,"approved","pink",{}],
  ["Nệm topper 1m2 x 2m","ktx","",220000,"Đã dùng",2,"pending","blue",{}],
  ["Ổ cắm kéo dài 6 lỗ Điện Quang","ktx","",60000,"Như mới",1,"approved","yellow",{}],
  ["Máy sấy tóc Panasonic","ktx","",140000,"Đã dùng",4,"approved","peach",{}],
  ["Rèm cửa chống nắng 1m5","ktx","",80000,"Đã dùng",2,"approved","mint",{}],

  ["Máy tính Casio fx-580VN X","tt","",350000,"Như mới",6,"approved","pink",{onShelf:true}],
  ["Bộ thước vẽ kỹ thuật + compa","tt","",120000,"Đã dùng",7,"approved","blue",{}],
  ["Bảng vẽ A2 + bút kim Rotring","tt","",280000,"Đã dùng",7,"approved","lav",{}],
  ["Bộ màu nước Winsor & Newton 24 màu","tt","",320000,"Như mới",7,"rejected","yellow",{reason:"Ảnh chưa rõ số màu còn lại, vui lòng chụp thêm ảnh hộp màu mở nắp."}],
  ["Guitar Yamaha F310","tt","",1200000,"Đã dùng",5,"approved","peach",{}],
  ["Ukulele concert gỗ mahogany","tt","",450000,"Như mới",5,"approved","mint",{}],
  ["Vợt cầu lông Yonex Nanoflare 001","tt","",280000,"Đã dùng",5,"approved","blue",{}],
  ["Bóng rổ Molten GG7X","tt","",300000,"Đã dùng",1,"approved","peach",{}],
  ["Thảm yoga TPE 6mm","tt","",150000,"Như mới",8,"approved","pink",{}],
  ["Đàn organ Casio CT-S300","tt","",1900000,"Đã dùng",9,"pending","lav",{}],
];

const descByCat = {
  dt: "Máy dùng cá nhân, còn hoạt động tốt. Kiểm tra trực tiếp tại điểm giao dịch, hài lòng mới trả tiền.",
  gt: "Sách dùng một kỳ, giữ cẩn thận. Đúng giáo trình môn học, có thể xem trước khi lấy.",
  ktx: "Đồ dùng trong phòng KTX, sạch sẽ. Dọn phòng nên pass lại giá sinh viên.",
  tt: "Dụng cụ còn tốt, dùng ít. Có thể thử trực tiếp khi gặp.",
};

const slugify = s => s.normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/đ/gi,"d").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const now = new Date("2026-11-07T14:00:00Z").getTime();

const profiles = sellers.map((s, i) => ({
  displayName: s[0], university: s[1], area: uniMap[s[1]][2], bio: s[2],
  rating: s[3], ratingCount: s[4], responseMins: s[5], verified: i !== 9,
  phone: "09" + String(10000000 + i * 1234567).slice(0, 8).replace(/^(\d{2})\d{4}/, "$1****"),
  isSample: true, joinedAt: new Date(now - (60 + i * 37) * 864e5).toISOString(),
  avatarTint: ["pink","lav","mint","blue","yellow","peach"][i % 6],
}));

const meetFor = code => (meet.find(m => m[0] === code) || [code, "Cổng chính trường", ""])[1];

const listings = L.map((x, i) => {
  const [title, cat, cc, price, cond, si, status, tint, ex] = x;
  const s = sellers[si];
  return {
    title, slug: slugify(title) + "-" + (i + 1), category: cat, courseCode: cc, price, condition: cond,
    checklist: (ex.ck || []).join("\n"), description: descByCat[cat],
    university: s[1], area: uniMap[s[1]][2], meetPoint: ex.onShelf ? "Kệ Chợ Vui – Tòa C1, KTX B" : meetFor(s[1]),
    status, rejectReason: ex.reason || "", sellerIndex: si, sellerName: s[0], sellerMemberId: "",
    tint, onShelf: !!ex.onShelf, feePaid: true, views: 12 + ((i * 37) % 140),
    postedAt: new Date(now - (i * 6.5 + 2) * 36e5).toISOString(),
  };
});

const wants = [
  ["Cần mua laptop học IT dưới 6 triệu", "dt", 6000000, 9],
  ["Tìm GT Vật lý 1 (PH1110)", "gt", 40000, 9],
  ["Cần thuê đàn guitar 1 tuần", "tt", 150000, 2],
  ["Tìm nồi cơm điện nhỏ cho phòng 2 người", "ktx", 200000, 4],
].map(w => ({ title: w[0], category: w[1], budget: w[2], university: sellers[w[3]][1], posterName: sellers[w[3]][0], status: "open", memberId: "" }));

const reviews = [
  [9,0,5,"Máy đúng mô tả, bạn bán nhiệt tình."],[2,1,5,"Sách sạch, giao đúng giờ."],[4,3,5,"Chuột như mới, giá tốt."],
  [1,6,5,"Nồi cơm còn tốt, bạn dễ thương."],[0,5,4,"Vợt ổn, hơi trầy tay cầm."],[8,7,4,"Thước đủ bộ."],[3,2,5,"Giao dịch nhanh gọn."],[6,4,5,"Sách IELTS đầy đủ audio."],
].map(r => ({ fromName: sellers[r[0]][0], toIndex: r[1], stars: r[2], text: r[3], memberId: "" }));

const P = (read, insert, update, remove) => ({ read, insert, update, remove });
const T = (k, type = "TEXT") => ({ key: k, type });

const plan = { collections: [
  { id: "Universities", displayName: "Trường đại học", permissions: P("ANYONE","ADMIN","ADMIN","ADMIN"),
    fields: [T("code"), T("name"), T("area")],
    items: unis.map(u => ({ code: u[0], name: u[1], area: u[2] })) },
  { id: "MeetPoints", displayName: "Điểm giao dịch", permissions: P("ANYONE","ADMIN","ADMIN","ADMIN"),
    fields: [T("university"), T("name"), T("hours")],
    items: meet.map(m => ({ university: m[0], name: m[1], hours: m[2] })) },
  { id: "Profiles", displayName: "Hồ sơ", permissions: P("ANYONE","SITE_MEMBER","SITE_MEMBER_AUTHOR","ADMIN"),
    fields: [T("memberId"), T("displayName"), T("university"), T("area"), T("bio"), T("phone"), T("avatarTint"),
      T("rating","NUMBER"), T("ratingCount","NUMBER"), T("responseMins","NUMBER"), T("verified","BOOLEAN"), T("isSample","BOOLEAN"),
      T("joinedAt","DATETIME"), T("notifyEmail","BOOLEAN"), T("notifyMatch","BOOLEAN"), T("showPhone","BOOLEAN"), T("credits","NUMBER")],
    items: profiles },
  { id: "Listings", displayName: "Tin đăng", permissions: P("ANYONE","SITE_MEMBER","SITE_MEMBER","SITE_MEMBER_AUTHOR"),
    fields: [T("title"), T("slug"), T("category"), T("courseCode"), T("price","NUMBER"), T("condition"), T("checklist"), T("description"),
      T("university"), T("area"), T("meetPoint"), T("status"), T("rejectReason"), T("sellerId"), T("sellerName"), T("sellerMemberId"),
      T("tint"), T("onShelf","BOOLEAN"), T("feePaid","BOOLEAN"), T("views","NUMBER"), T("postedAt","DATETIME"),
      T("holdUntil","DATETIME"), T("buyerMemberId"), T("buyerName")],
    items: listings },
  { id: "Orders", displayName: "Đơn giữ hàng", permissions: P("SITE_MEMBER","SITE_MEMBER","SITE_MEMBER","ADMIN"),
    fields: [T("listingId"), T("listingTitle"), T("price","NUMBER"), T("tint"), T("buyerMemberId"), T("buyerName"), T("sellerId"), T("sellerMemberId"), T("sellerName"),
      T("status"), T("handoverCode"), T("meetPoint"), T("meetTime"), T("holdUntil","DATETIME"), T("rated","BOOLEAN")], items: [] },
  { id: "Messages", displayName: "Tin nhắn", permissions: P("SITE_MEMBER","SITE_MEMBER","SITE_MEMBER_AUTHOR","SITE_MEMBER_AUTHOR"),
    fields: [T("threadId"), T("listingId"), T("listingTitle"), T("fromMemberId"), T("fromName"), T("toMemberId"), T("toName"), T("toSellerId"), T("text")], items: [] },
  { id: "WantAds", displayName: "Tin tìm đồ", permissions: P("ANYONE","SITE_MEMBER","SITE_MEMBER_AUTHOR","SITE_MEMBER_AUTHOR"),
    fields: [T("title"), T("category"), T("budget","NUMBER"), T("university"), T("posterName"), T("status"), T("memberId")], items: wants },
  { id: "Reviews", displayName: "Đánh giá", permissions: P("ANYONE","SITE_MEMBER","ADMIN","ADMIN"),
    fields: [T("fromName"), T("toSellerId"), T("stars","NUMBER"), T("text"), T("memberId"), T("orderId")], items: reviews },
  { id: "Reports", displayName: "Báo cáo", permissions: P("SITE_MEMBER","SITE_MEMBER","SITE_MEMBER","ADMIN"),
    fields: [T("listingId"), T("listingTitle"), T("reason"), T("reporterMemberId"), T("status")], items: [] },
  { id: "Admins", displayName: "Quản trị viên", permissions: P("ANYONE","ADMIN","ADMIN","ADMIN"),
    fields: [T("memberId"), T("email"), T("note")], items: [] },
]};
writeFileSync(new URL("./plan.json", import.meta.url), JSON.stringify(plan));
console.log(plan.collections.map(c => c.id + ":" + c.items.length).join(" "), JSON.stringify(plan).length);
const cats = {}; listings.forEach(l => cats[l.category] = (cats[l.category]||0)+1);
const st = {}; listings.forEach(l => st[l.status] = (st[l.status]||0)+1);
console.log(cats, st);
