# Ví Rõ — sổ tiền cá nhân

Ứng dụng tiếng Việt để quản lý tiền chi tiêu, tiết kiệm và tiền vay. Chạy trên GitHub Pages, không cần máy chủ riêng, tài khoản trong app, API key hay cài thư viện.

## Đưa lên GitHub

Đọc **HUONG_DAN_GITHUB.md** trong thư mục này. Các tệp `index.html`, `styles.css`, `core.js`, `app.js` phải nằm cùng cấp ở gốc repository. Không tải tệp ZIP thay cho các tệp đã giải nén.

## Tính năng

- Ba quỹ: tiền riêng để chi tiêu, tiết kiệm, tiền vay còn lại. Theo dõi riêng tổng dư nợ gốc.
- Thêm tiền, chi tiêu, chuyển quỹ, nhận khoản vay, trả gốc kèm lãi / phí.
- Cảnh báo bắt buộc xác nhận khi tiêu tiền vay hoặc dùng tiết kiệm.
- Lịch sử có sửa, xóa, lọc tháng, loại, quỹ và tìm kiếm ghi chú / danh mục.
- Tổng quan thu chi, phân bổ chi tiêu theo danh mục, tài sản ròng trong sổ.
- Ngân sách tháng, mục tiêu tiết kiệm, nhắc kỳ trả nợ khi mở ứng dụng.
- Tự lưu, giữ bản trước lần lưu gần nhất, xuất / nhập JSON, xuất CSV theo bộ lọc.
- Kiểm tra lịch sử theo ngày để chặn số dư âm hoặc trả gốc vượt dư nợ.
- Giao diện thích ứng màn hình nhỏ, điều hướng bàn phím, hộp thoại chuẩn HTML.

## Bắt đầu

1. Chọn **Nhập số dư ban đầu**. Không nhập trùng tiền giữa các quỹ.
2. Ví dụ bạn có 5 triệu riêng, 2 triệu tiết kiệm, đã vay 20 triệu nhưng chỉ còn 15 triệu: nhập lần lượt 5, 2, 15 và 20 triệu. Tổng tiền giữ 22 triệu; tài sản ròng trong sổ 2 triệu.
3. Chọn **Thêm giao dịch** để ghi các khoản phát sinh sau thời điểm số dư ban đầu.
4. Trong **Kế hoạch**, đặt ngân sách, mục tiêu và lịch nhắc trả nợ nếu cần.
5. Trong **Dữ liệu & sao lưu**, tải JSON sau các lần cập nhật quan trọng. CSV chỉ dùng để đọc / phân tích trong Excel, không dùng để phục hồi.

## Quy tắc tính toán

| Thao tác | Tiền đang giữ | Dư nợ | Thu / chi tháng |
|---|---|---|---|
| Thêm tiền riêng | Tăng quỹ chi tiêu hoặc tiết kiệm | Không đổi | Tính là tiền thêm vào |
| Chi tiêu | Giảm quỹ được chọn | Không đổi, kể cả tiêu tiền vay | Tính chi tiêu |
| Chuyển chi tiêu ↔ tiết kiệm | Tổng tiền không đổi | Không đổi | Không tính thu / chi |
| Nhận tiền vay | Tăng quỹ tiền vay | Tăng tương ứng | Không tính thu nhập |
| Trả nợ | Giảm quỹ nguồn theo gốc + lãi / phí | Giảm phần gốc | Chỉ lãi / phí tính chi tiêu |

Tiền vay không được chuyển thẳng vào tiền riêng hoặc tiết kiệm. Khi trả gốc bằng tiền riêng / tiết kiệm mà tiền vay còn giữ lớn hơn dư nợ còn lại, phần chênh lệch chuyển sang tiền riêng có thể chi. Ví dụ: giữ 10 triệu tiền vay và trả hết 10 triệu nợ bằng tiền tiết kiệm thì 10 triệu tiền vay còn giữ không còn gắn với khoản nợ này. App giữ tổng tiền và tài sản ròng nhất quán.

**Tổng tiền giữ = tiền chi tiêu + tiết kiệm + tiền vay còn lại.**

**Tài sản ròng trong sổ = tổng tiền giữ − dư nợ gốc.** Chỉ tính các khoản bạn đã nhập, không bao gồm bất động sản hoặc tài sản khác ngoài sổ.

Số dư quỹ luôn là số hiện tại toàn bộ lịch sử. Bộ lọc tháng chỉ thay đổi báo cáo và danh sách giao dịch. Giao dịch cùng ngày tính theo thứ tự tạo ban đầu. Sửa giữ vị trí đó; xóa rồi thêm lại sẽ có thứ tự mới. Bạn có thể sửa / xóa nhưng không thể tạo lịch sử có số dư âm.

## Dữ liệu và giới hạn

- Lưu cục bộ bằng localStorage theo địa chỉ app và hồ sơ trình duyệt. GitHub chỉ cung cấp các tệp giao diện và chương trình; app không gửi giao dịch lên GitHub.
- Không tự đồng bộ giữa thiết bị, không đăng nhập, không có khóa ứng dụng hoặc mã hóa JSON. Người dùng chung hồ sơ trình duyệt có thể xem dữ liệu. Tránh chế độ ẩn danh.
- Đổi tên repository / tên miền, dùng trình duyệt khác, xóa dữ liệu trang web hoặc chuyển máy: xuất JSON từ địa chỉ cũ rồi nhập vào địa chỉ mới.
- Các website cùng origin có thể tiếp cận vùng lưu trữ của nhau. Chỉ đặt app cùng các website đáng tin trên tên miền GitHub Pages của bạn.
- Nhập JSON **thay thế** sổ, không gộp để tránh giao dịch trùng. Có xem số dư trước khi xác nhận. Bản trước lần lưu gần nhất hỗ trợ khôi phục; đây không phải bản sao lưu độc lập.
- Nếu không lưu được do hạn mức hoặc trình duyệt chặn, app báo lỗi và không coi giao dịch đó là đã lưu.
- Tối đa 10.000 giao dịch, 1.000 tỷ đồng cho từng số tiền / số dư, tệp nhập tối đa 8 MB. Tiền tính bằng số nguyên VNĐ, không có số lẻ.
- Một ngân sách chung cho mỗi tháng, một mục tiêu tiết kiệm và một lịch nhắc trả nợ. Theo dõi nợ tổng; chưa chia theo từng chủ nợ. Không tự tính lãi, tự trừ tiền, nhắc khi đóng app hoặc kết nối ngân hàng.
- Chưa có cơ chế cài PWA / bảo đảm tải lại khi ngoại tuyến. Trang đang mở vẫn cho ghi chép nếu mất mạng, nhưng để mở lại app cần truy cập được các tệp website.
- Với khoản chỉ trả lãi, ghi **Chi tiêu**, ghi chú “Lãi vay”, chọn quỹ nguồn phù hợp; giao dịch **Trả nợ** yêu cầu gốc lớn hơn 0.

## Phát triển và kiểm tra

Ứng dụng không có bước build. Nếu đã có Python: chạy `python -m http.server 8080` trong thư mục này rồi mở `http://localhost:8080`. Nên dùng HTTP / HTTPS; mở `index.html` trực tiếp có hành vi lưu trữ khác nhau tùy trình duyệt và không được khuyến nghị cho dữ liệu thật.

Nếu đã cài Node.js, chạy kiểm tra logic:

```sh
node --test tests/core.test.cjs
node --check app.js
```

Xem `AI_HANDOFF.md` khi cần nhờ AI sửa tính năng. Không commit dữ liệu JSON / CSV cá nhân. `.gitignore` bảo vệ khi dùng Git trên máy; tải tệp thủ công qua website GitHub vẫn cần tự kiểm tra.
