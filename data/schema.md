# Dữ liệu Chợ Vui (Wix CMS)

Tất cả bảng nằm trong Wix Dashboard → CMS. Tên bảng (ID) phải giữ nguyên vì code đọc theo đúng tên này.

Quyền: `ANYONE` = ai cũng được, `SITE_MEMBER` = thành viên đã đăng nhập, `SITE_MEMBER_AUTHOR` = chỉ người tạo dòng đó, `ADMIN` = chỉ chủ site (trong Wix Dashboard).

| Bảng (ID) | Tên hiển thị | Đọc | Thêm | Sửa | Xóa |
|---|---|---|---|---|---|
| `Universities` | Trường đại học | ANYONE | ADMIN | ADMIN | ADMIN |
| `MeetPoints` | Điểm giao dịch (dùng cho trang Kệ) | ANYONE | ADMIN | ADMIN | ADMIN |
| `Profiles` | Hồ sơ | ANYONE | SITE_MEMBER | SITE_MEMBER_AUTHOR | ADMIN |
| `Listings` | Tin đăng | ANYONE | SITE_MEMBER | SITE_MEMBER | SITE_MEMBER_AUTHOR |
| `ListingPhotos` | Ảnh tin đăng | ANYONE | SITE_MEMBER | SITE_MEMBER_AUTHOR | SITE_MEMBER_AUTHOR |
| `Orders` | Đơn giữ hàng | SITE_MEMBER | SITE_MEMBER | SITE_MEMBER | ADMIN |
| `Messages` | Tin nhắn | SITE_MEMBER | SITE_MEMBER | SITE_MEMBER_AUTHOR | SITE_MEMBER_AUTHOR |
| `WantAds` | Tin tìm đồ | ANYONE | SITE_MEMBER | SITE_MEMBER_AUTHOR | SITE_MEMBER_AUTHOR |
| `Reviews` | Đánh giá | ANYONE | SITE_MEMBER | ADMIN | ADMIN |
| `Reports` | Báo cáo | SITE_MEMBER | SITE_MEMBER | SITE_MEMBER | ADMIN |
| `ResetRequests` | Yêu cầu cấp lại mật khẩu | SITE_MEMBER | ANYONE | SITE_MEMBER | ADMIN |
| `Admins` | Quản trị viên | ANYONE | ADMIN | ADMIN | ADMIN |

## Các trường chính

**Universities**: `code` (VD `HUST`), `name`, `area` (khu vực: Hai Bà Trưng, Đống Đa, Cầu Giấy, Thanh Xuân, Nam Từ Liêm, Bắc Từ Liêm, Hà Đông, Gia Lâm).

**Profiles**: `memberId` (mã thành viên Wix, trống với hồ sơ mẫu), `displayName`, `university`, `area`, `bio`, `phone`, `avatarTint`, `rating`, `ratingCount`, `responseMins`, `verified`, `isSample`, `joinedAt`, `notifyEmail`, `notifyMatch`, `showPhone`, `credits`.

**Listings**: `title`, `slug`, `category` (`dt` Laptop & Điện tử, `gt` Giáo trình, `ktx` Đồ KTX, `tt` Dụng cụ khác), `courseCode`, `price`, `condition`, `checklist` (mỗi dòng "Mục: nội dung"), `description`, `university`, `area`, `meetPoint`, `status` (`pending` chờ duyệt, `approved` đang bán, `held` đang giữ, `sold` đã bán, `rejected` bị từ chối), `rejectReason`, `rejectCount`, `refundDue`, `payMethod` (`credit`/`qr`), `feePaid`, `sellerId` (→ Profiles), `sellerName`, `sellerMemberId`, `tint`, `onShelf`, `views`, `postedAt`, `holdUntil`, `buyerMemberId`, `buyerName`, `cover` (ảnh bìa đã nén).

**ListingPhotos**: `listingId`, `idx` (0 = ảnh bìa), `data` (ảnh JPEG đã nén).

**Orders**: `listingId`, `listingTitle`, `price`, `buyerMemberId`, `buyerName`, `sellerId`, `sellerMemberId`, `sellerName`, `status` (`held`/`done`/`cancelled`), `handoverCode` (mã bàn giao 4 số), `meetPoint`, `holdUntil`, `rated`.

**Messages**: `threadId` (`<listingId>:<buyerMemberId>`, hoặc `sys-<memberId>` cho tin nhắn từ admin), `listingId`, `listingTitle`, `fromMemberId`, `fromName`, `toMemberId`, `toName`, `toSellerId`, `text`.

**Admins**: `memberId`, `email`, `role` (`owner` Admin chính, `moderator` Kiểm duyệt viên), `note`.

## Dữ liệu mẫu

`data/seed/gen-plan.mjs` tạo `data/seed/plan.json`: 20 trường ở Hà Nội, 8 điểm giao dịch, 10 người bán mẫu, 50 tin đăng (đủ 4 danh mục), 4 tin tìm đồ, 8 đánh giá. Dữ liệu này đã được nạp vào site; file chỉ để tham khảo hoặc dựng lại site khác.

```bash
node data/seed/gen-plan.mjs
```
