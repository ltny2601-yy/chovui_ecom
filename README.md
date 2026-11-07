# Chợ Vui

Chợ mua bán đồ cũ cho sinh viên Hà Nội. Mọi tin đăng đều được admin duyệt trước khi hiển thị; người mua kiểm hàng rồi mới trả tiền.

- **Trang web:** https://headless-xnekxvsrftm-ltny2601-1408.wix-site-host.com
- **Wix Dashboard (quản lý dữ liệu):** https://manage.wix.com/dashboard/06341b18-244f-4c81-a121-3f78c866da31

Site chạy trên **Wix Headless**: các file HTML/CSS/JS trong repo này được đưa lên Wix hosting, còn dữ liệu (tin đăng, thành viên, tin nhắn, ảnh) nằm trong **Wix CMS** và hệ thống thành viên của Wix. Không có bước build, không cần cài đặt gì để chạy.

---

## Cấu trúc thư mục

```
├── index.html          Trang chủ
├── search.html         Tìm kiếm / danh mục (lọc theo trường, khu vực, giá, tình trạng, mã môn)
├── item.html           Chi tiết tin, giữ hàng 24h, báo cáo
├── seller.html         Trang người bán công khai
├── post.html           Đăng tin (ảnh thật, kê khai tình trạng) và tin "Tìm đồ"
├── messages.html       Tin nhắn giữa người mua và người bán
├── me.html             Trang "Tôi": tin đăng, đơn mua, tìm đồ, đồ gửi tại Kệ
├── settings.html       Xác thực và cài đặt cá nhân
├── login.html          Đăng nhập, đăng ký (bắt buộc đủ mục), quên mật khẩu
├── admin.html          Trang quản trị (chỉ tài khoản admin vào được)
├── ke.html             Giới thiệu Kệ Chợ Vui
├── safe.html           Quy định giao dịch an toàn
├── timdo.html          Danh sách tin "Tìm đồ"
├── favicon.svg
├── css/
│   ├── app.css         Màu, font, nút, thẻ tin (theo brand board)
│   ├── pages.css       Tìm kiếm, chi tiết tin
│   └── more.css        Đăng tin, tin nhắn, trang Tôi, admin
├── js/
│   ├── app.js          Phần dùng chung: header, danh mục, thẻ tin, hồ sơ, quyền admin
│   ├── uniselect.js    Ô chọn trường dạng react-select (gõ để tìm, không cần dấu)
│   ├── recovery.js     Gửi email đặt lại mật khẩu
│   ├── home.js  search.js  item.js  post.js  me.js  settings.js
│   ├── messages.js  seller.js  login.js  admin.js
│   └── wix/            Module kết nối Wix (CMS, đăng nhập) – do Wix tạo, KHÔNG sửa tay
└── data/
    ├── schema.md       Mô tả các bảng dữ liệu và quyền đọc/ghi
    └── seed/           Script tạo dữ liệu mẫu (20 trường, 10 người bán, 50 tin…)
```

Mỗi trang HTML chỉ có khung; nội dung được vẽ bằng file JS cùng tên trong `js/`. Muốn sửa giao diện chung (màu, nút, thẻ tin) thì sửa `css/app.css`; muốn sửa header, danh mục hay thẻ tin thì sửa `js/app.js`.

## Chạy thử trên máy

Vì trang dùng ES module nên phải mở qua một web server nhỏ, không mở thẳng file:

```bash
# cách 1: Python (có sẵn trên macOS/Linux)
python3 -m http.server 8080
# cách 2: Node
npx serve .
```

Rồi mở http://localhost:8080. Trang vẫn đọc dữ liệu thật từ Wix. **Đăng nhập chỉ chạy trên địa chỉ Wix** (hoặc tên miền đã khai báo trong Headless Settings của Wix), nên muốn thử đăng nhập, đăng tin, admin thì thử trên link trang web ở trên.

## Đưa thay đổi lên trang web

Trang web **không tự cập nhật khi push lên GitHub**. Sau khi sửa và gộp code, cần đưa các file đã đổi lên Wix:

- **Cách đang dùng:** nhờ Claude (đã kết nối Wix connector với tài khoản chủ site) đưa lên, ví dụ: *"Đưa các file js/post.js, css/app.css trong repo lên site Chợ Vui"*.
- Mỗi lần đưa lên, **file mới thay hẳn file cũ cùng tên**. Luôn đưa lên bản mới nhất đã gộp trên nhánh `main`, đừng đưa bản trên máy cá nhân chưa gộp.

## Quy ước làm việc nhóm

1. `main` luôn là bản đang chạy trên site. Không commit thẳng vào `main`.
2. Mỗi việc một nhánh: `git checkout -b ten-viec` (ví dụ `sua-trang-dang-tin`).
3. Xong thì push nhánh và mở **Pull Request**, ít nhất 1 bạn khác xem rồi mới gộp.
4. Chỉ **1 người phụ trách** đưa code từ `main` lên Wix.
5. File dùng chung (`js/app.js`, `css/app.css`) dễ đụng nhau nhất: báo nhóm trước khi sửa.
6. Không sửa thư mục `js/wix/`. Nếu Wix cập nhật module, nhờ Claude cài lại.

## Dữ liệu và quản trị

- Dữ liệu xem và sửa ở **Wix Dashboard → CMS**. Danh sách bảng và quyền: [`data/schema.md`](data/schema.md).
- **Thêm/gỡ admin:** bảng **Quản trị viên** (`Admins`) trên Wix. Cột `role` = `owner` (Admin chính) hoặc `moderator` (Kiểm duyệt viên). Mã thành viên lấy ở trang admin → tab Người dùng → "Sao chép mã thành viên".
- Repo **không chứa mật khẩu hay khóa bí mật**. `js/wix/config.js` chỉ có mã ứng dụng công khai của Wix (vốn hiện trong trang web).

## Giới hạn của bản hiện tại

- Phí 1.500đ dùng mã VietQR mẫu, admin xác nhận đã nhận phí khi duyệt.
- Ảnh tin đăng được nén và lưu trong CMS (bảng `ListingPhotos`), phù hợp quy mô demo.
- Quên mật khẩu qua số điện thoại: yêu cầu gửi tới admin, admin gọi xác minh rồi gửi link qua email (Wix không gửi SMS).
- Quyền admin, duyệt tin, ẩn tab cho Kiểm duyệt viên được kiểm tra ở giao diện; muốn chặt chẽ ở tầng dữ liệu cần thêm phần xử lý phía máy chủ.
