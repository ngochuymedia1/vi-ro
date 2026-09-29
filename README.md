# Ví Rõ 2.0

Sổ tiền cá nhân tiếng Việt, giao diện gọn với font Be Vietnam Pro được đóng kèm. Chạy trực tiếp trên GitHub Pages, không cần build, npm, API key hoặc máy chủ riêng để sử dụng.

## Điểm mới

- Giao diện trắng / xám với điểm nhấn cyan, bố cục gọn hơn và font tiếng Việt riêng.
- Nhập giao dịch bằng **USD hoặc VNĐ**. USD tự quy đổi sang VNĐ theo tỷ giá bạn nhập; lịch sử giữ số đô và tỷ giá của từng giao dịch.
- Nút **VND / USD** phía trên đổi cách xem số dư. USD hiển thị là ước tính theo tỷ giá đang chọn, không thay đổi số tiền đã ghi.
- Tạo nhiều **quỹ chi tiêu / tiết kiệm**, đặt tên, ngân sách tháng và mục tiêu số dư cho từng quỹ.
- Chuyển quỹ, xem lịch sử theo quỹ, lưu trữ / khôi phục quỹ đã hết tiền.
- Giữ nguyên các tính năng cũ: thu chi, khoản vay, trả gốc + lãi, nhắc lịch trả nợ, lọc / sửa / xóa giao dịch, JSON và CSV.
- Hỗ trợ trả riêng lãi: chọn Trả nợ, nhập gốc = 0 và lãi / phí > 0.
- Tự đọc sổ / bản sao lưu phiên bản 1 và kiểm tra số dư không đổi. Giữ bản trước nâng cấp riêng trên trình duyệt.

## Dùng quỹ sao cho đúng

1. Nhập số dư hiện có **một lần**, không trùng giữa quỹ.
2. Tạo quỹ như Ăn uống, Công việc, Thiết bị. Quỹ mới có **0 đồng**.
3. Chọn **Chuyển quỹ** để phân bổ tiền từ Chi tiêu chung sang quỹ mới. Không dùng Thêm tiền nếu chỉ chia số tiền đã có.
4. Ghi chi tiêu vào đúng quỹ. App chỉ trừ quỹ được chọn; thiếu tiền thì chuyển bổ sung trước, không tự lấy từ quỹ khác.
5. Quỹ tiết kiệm luôn cảnh báo trước khi chi, trả nợ hoặc chuyển ra. Quỹ chi tiêu có thể dùng bình thường.
6. Có thể sửa tên, ngân sách và mục tiêu. Loại quỹ không đổi sau khi tạo để tránh thay đổi ý nghĩa lịch sử.
7. Khi không dùng nữa, chuyển hết tiền ra rồi **Lưu trữ** quỹ. Lịch sử không bị xóa. Ba quỹ mặc định luôn được giữ.

**Tổng tiền = tổng số dư của các quỹ.** Ngân sách / mục tiêu chỉ là giới hạn / đích đến, không cộng thêm tiền. Chuyển quỹ không được tính thành thu nhập hoặc chi tiêu. Tổng tiền chi tiêu / tiết kiệm trên Tổng quan cộng tất cả quỹ cùng loại.

## USD và tỷ giá

- Trong Ghi giao dịch, chọn USD, nhập như `100` hoặc `100.50`, sau đó nhập tỷ giá cho **1 USD** (VNĐ nguyên).
- App cho xem VNĐ trước khi lưu. Ví dụ minh họa: 100 USD × tỷ giá bạn nhập 25.000 = 2.500.000 VNĐ. Đây chỉ là ví dụ, không phải tỷ giá thị trường.
- Tỷ giá là **tỷ giá bạn chọn**, không tự cập nhật từ ngân hàng. Dùng tỷ giá thực tế khi giao dịch / ngân hàng quy đổi nếu bạn muốn đối chiếu chính xác.
- USD tối đa hai chữ số thập phân, không dùng dấu phân cách hàng nghìn. VNĐ là số nguyên, có thể dùng dấu chấm hàng nghìn, ví dụ `150.000`.
- VNĐ quy đổi được làm tròn đến đồng, bằng số nguyên để tránh sai số nhị phân. Gốc và lãi được làm tròn riêng rồi cộng.
- Đổi VND / USD trong biểu mẫu sẽ xóa số tiền đang nhập để tránh hiểu nhầm giá trị cũ là đơn vị mới.
- Tỷ giá vừa ghi bằng USD được dùng làm tỷ giá hiển thị gần nhất. Các giao dịch trước đó giữ nguyên tỷ giá và giá trị VNĐ đã lưu.
- Nút USD ở thanh trên chỉ hiển thị giá trị quy đổi tham khảo. App không phải ví đa ngoại tệ thực giữ USD, không tự tính chênh lệch tỷ giá / lãi lỗ ngoại hối.
- Số dư ban đầu, ngân sách và mục tiêu nhập bằng VNĐ; chức năng nhập USD áp dụng cho thu, chi, chuyển quỹ, nhận vay và trả nợ.

## Quy tắc nợ

| Thao tác | Tiền đang giữ | Dư nợ | Báo cáo thu / chi |
|---|---|---|---|
| Thêm tiền | Tăng quỹ tiền riêng | Không đổi | Thu nhập |
| Chi tiêu | Giảm quỹ nguồn | Không đổi | Chi tiêu |
| Chuyển quỹ | Tổng không đổi | Không đổi | Không tính thu / chi |
| Nhận tiền vay | Tăng quỹ Tiền vay | Tăng tương ứng | Không tính thu nhập |
| Trả nợ | Giảm nguồn theo gốc + lãi | Giảm phần gốc | Chỉ lãi / phí tính chi tiêu |

Tiền vay nằm riêng trong một quỹ tổng, không được chuyển sang quỹ tiền riêng để tránh làm mất cảnh báo. Có thể chi hoặc trả nợ từ quỹ này. Tiêu tiền vay **không làm giảm nợ**.

Khi trả gốc từ tiền riêng / tiết kiệm khiến tiền vay còn giữ lớn hơn dư nợ còn lại, phần chênh lệch được chuyển vào quỹ mặc định Chi tiêu chung: phần đó không còn bị ràng buộc bởi khoản nợ đã trả. Quy tắc này giữ giống phiên bản 1.

**Tài sản ròng trong sổ = tổng tiền đang giữ − dư nợ gốc.** Chỉ tính tiền / nợ bạn đã ghi, không tính tài sản khác. Lịch nhắc do bạn tự nhập và tự cập nhật sau khi trả; không tự tính lãi hoặc tự trừ tiền.

## Lưu dữ liệu và nâng cấp

- Dữ liệu nằm trong localStorage tại địa chỉ website và hồ sơ trình duyệt này. App không gửi giao dịch lên GitHub hoặc bên thứ ba.
- Xuất **JSON** định kỳ để giữ mọi quỹ / giao dịch / tỷ giá. Nhập JSON thay thế sổ, không gộp hai sổ. Có xem số dư trước xác nhận.
- **CSV** xuất giao dịch theo bộ lọc để xem trong Excel; kèm cột USD gốc và tỷ giá. CSV không dùng để phục hồi.
- App giữ bản trước lần lưu gần nhất, và một bản phiên bản 1 riêng trước lần nâng cấp đầu tiên. Tải tại Dữ liệu & sao lưu → Bản trước nâng cấp.
- Sổ cũ được chuyển trong bộ nhớ, kiểm tra số dư tương đương; lần ghi thành công đầu tiên lưu định dạng mới. Tệp JSON v2 không mở được bằng app v1. Muốn quay lại v1, dùng bản sao lưu v1 phù hợp.
- Không tự đồng bộ giữa máy, không đăng nhập, không mã hóa sổ hoặc tệp JSON. Không dùng chế độ ẩn danh cho dữ liệu cần giữ lâu.
- Xóa dữ liệu trình duyệt, đổi tên repository / đường dẫn hoặc đổi máy: xuất JSON trước, nhập vào địa chỉ mới. Người dùng chung hồ sơ hoặc mã cùng origin có thể truy cập sổ.
- Khi tab khác đã thay đổi sổ, app yêu cầu tải lại để tránh ghi đè. Hết dung lượng / bị chặn lưu trữ sẽ báo lỗi; không coi giao dịch đó đã lưu.
- Tối đa 100 quỹ (gồm quỹ đã lưu trữ), 10.000 giao dịch, 1.000 tỷ VNĐ cho từng số tiền / số dư quỹ, JSON nhập tối đa 8 MB.
- Số dư quỹ luôn là số hiện tại toàn bộ sổ; bộ lọc tháng áp dụng cho báo cáo. Giao dịch cùng ngày tính theo thứ tự tạo; sửa giữ nguyên thứ tự, xóa rồi thêm lại tạo thứ tự mới.
- Không có PWA hoặc cơ chế bảo đảm mở lại khi ngoại tuyến.

## Đưa lên GitHub / chạy trên máy

Đọc `HUONG_DAN_GITHUB.md`. Tải **toàn bộ** mã và thư mục `assets`, không chỉ riêng index.html. Không đưa JSON / CSV tài chính lên GitHub Public. Nếu mã đã được cập nhật tự động, chờ Pages xuất bản rồi nhấn Ctrl+Shift+R tại địa chỉ cũ.

Không cần cài npm để dùng. Để phát triển trên máy có Python: `python -m http.server 8080`, mở http://localhost:8080. Không khuyến nghị mở file:// cho dữ liệu thật.

Kiểm tra logic bằng Node.js:

```sh
node --test tests/core.test.cjs tests/v2.test.cjs
```

Kiểm tra tương tác biểu mẫu trong DOM mô phỏng (cần cài dev dependency):

```sh
npm install
npm test
```

Các kiểm tra DOM không thay cho kiểm tra bố cục trên trình duyệt thật. Xem `AI_HANDOFF.md` để sửa ứng dụng. Font Be Vietnam Pro được phân phối kèm giấy phép SIL OFL trong `assets/fonts/OFL.txt`.
