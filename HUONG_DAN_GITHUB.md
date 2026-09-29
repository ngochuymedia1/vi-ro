# Đưa Ví Rõ lên GitHub Pages — từng bước

Bạn chỉ cần trình duyệt và tài khoản GitHub. Không cần cài Node.js, npm hoặc dùng dòng lệnh.

## 1. Giải nén ứng dụng

1. Tải `ViRo_GitHub_Pages_v1.zip` về máy Windows.
2. Nhấp chuột phải → **Extract All… / Giải nén tất cả** → **Extract**.
3. Mở thư mục `ViRo`. Bạn sẽ thấy `index.html`, `styles.css`, `core.js`, `app.js`, các tệp hướng dẫn và thư mục `tests`.

## 2. Tạo nơi chứa mã trên GitHub

1. Truy cập https://github.com và đăng nhập; nếu chưa có, chọn **Sign up** để tạo tài khoản, xác minh email.
2. Mở https://github.com/new.
3. **Repository name:** nhập `vi-ro`.
4. **Description:** có thể nhập `Sổ tiền cá nhân Ví Rõ`.
5. Chọn **Public** để dùng GitHub Pages với tài khoản GitHub Free.
6. Có thể bật **Add a README file** để có nhánh `main` ngay. Tệp README này sẽ được thay bằng tệp trong gói.
7. Nhấn **Create repository**.

Public nghĩa là mọi người có thể xem mã ứng dụng. Các khoản thu chi bạn nhập trong app được lưu trên trình duyệt, không nằm trong repository. Tuyệt đối không tải bản sao lưu tài chính JSON / CSV lên repository.

## 3. Tải các tệp ứng dụng lên

1. Trong repository vừa tạo, mở tab **Code**.
2. Chọn **Add file → Upload files**. Nếu repository trống, có thể bấm liên kết **uploading an existing file**.
3. Kéo **nội dung bên trong thư mục ViRo** đã giải nén vào vùng tải lên. Không kéo tệp ZIP và không kéo cả thư mục ngoài khiến `index.html` bị lồng một cấp.
4. Ít nhất phải có đủ bốn tệp cùng cấp: `index.html`, `styles.css`, `core.js`, `app.js`. Các hướng dẫn và tests có thể tải cùng. `.nojekyll` đi kèm nếu hiện trong cửa sổ chọn tệp; app này không phụ thuộc vào việc nhìn thấy tệp ẩn đó.
5. Ở phần **Commit changes**, nhập `Add Vi Ro app` rồi nhấn **Commit changes**.
6. Kiểm tra trên tab Code: bạn phải nhìn thấy `index.html` ngay, không cần mở thêm thư mục con.

## 4. Bật website

1. Trong repository, chọn **Settings** ở thanh phía trên.
2. Trong cột bên trái, chọn **Pages**.
3. Tại **Build and deployment → Source**, chọn **Deploy from a branch**.
4. Tại **Branch**, chọn **main** và thư mục **/ (root)**.
5. Nhấn **Save**.
6. Chờ quá trình xuất bản hoàn tất; bạn có thể theo dõi trong tab **Actions**. Sau đó quay về Settings → Pages để lấy liên kết **Visit site**.

Địa chỉ thường có dạng `https://TEN-TAI-KHOAN.github.io/vi-ro/`. Dùng địa chỉ Pages này để nhập dữ liệu; trang `github.com/...` chỉ là nơi chứa mã.

## 5. Thiết lập sổ lần đầu

1. Mở website vừa xuất bản trên trình duyệt bạn định dùng thường xuyên.
2. Chọn **Nhập số dư ban đầu**.
3. Nhập riêng tiền chi tiêu, tiết kiệm, tiền vay còn trong tay và tổng dư nợ gốc.
4. Chọn **Lưu số dư** rồi bắt đầu ghi giao dịch.
5. Vào **Kế hoạch** nếu muốn đặt ngân sách hoặc lịch nhắc.
6. Vào **Dữ liệu & sao lưu → Tải bản sao lưu JSON** để giữ bản đầu tiên. Kiểm tra tệp xuất hiện trong Downloads.
7. Có thể đánh dấu trang bằng `Ctrl+D` để mở nhanh. Không cần chạy `npm run dev`.

## 6. Chuyển sang máy / trình duyệt khác

1. Trên máy cũ, chọn **Tải bản sao lưu JSON** sau lần ghi chép cuối cùng.
2. Chuyển tệp riêng tư đó sang máy mới bằng phương thức bạn tin cậy.
3. Trên máy mới, mở website → **Dữ liệu & sao lưu** → chọn tệp tại **Nhập lại dữ liệu**.
4. Kiểm tra số giao dịch và các số dư trong hộp thoại → **Thay thế dữ liệu**.

Hai máy không tự đồng bộ. Nên chỉ dùng một bản sổ chính tại một thời điểm; nhập JSON sẽ thay thế dữ liệu, không cộng gộp.

## 7. Cập nhật ứng dụng sau này

1. Xuất JSON trước để giữ dữ liệu của bạn.
2. Tải các tệp mã mới lên đúng repository, thay thế đúng các tệp cũ.
3. Commit changes rồi đợi Pages xuất bản lại.
4. Mở đúng địa chỉ website cũ. Nếu giao diện vẫn cũ, nhấn `Ctrl+Shift+R`.
5. Thông thường dữ liệu vẫn còn vì địa chỉ lưu không đổi. Nếu phiên bản sau thay đổi định dạng dữ liệu, đọc hướng dẫn chuyển đổi đi kèm trước khi cập nhật.

## Xử lý nhanh khi gặp lỗi

| Hiện tượng | Việc cần kiểm tra |
|---|---|
| Trang báo 404 | Pages đã xuất bản xong chưa; Source, nhánh main và / (root) có đúng không; index.html có ở gốc không |
| Trang chỉ hiện chữ, thiếu giao diện | styles.css có cùng cấp và viết đúng chữ thường không |
| Nhấn nút không có phản hồi | core.js và app.js có đủ ở cùng cấp không; JavaScript có bị tắt hoặc chặn không |
| Không thấy số liệu trên máy khác | Dữ liệu nằm trên máy đã nhập; xuất / nhập JSON để chuyển |
| Tab khác đã thay đổi dữ liệu | Chọn tab có dữ liệu mới nhất; tải lại tab cũ trước khi nhập tiếp |
| Giao dịch bị báo không đủ tiền | Kiểm tra đúng quỹ, ngày giao dịch, gốc + lãi và số dư tại thời điểm đó |
| GitHub không cho bật Pages | Kiểm tra repository Public, quyền của bạn và email GitHub đã xác minh |

Hướng dẫn xuất bản được đối chiếu tài liệu chính thức GitHub ngày 29/09/2026:

- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

Giao diện GitHub có thể đổi vị trí một số nút theo thời gian.
