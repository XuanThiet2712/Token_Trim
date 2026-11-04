# TokenTrim

Công cụ đếm, nén và cắt token trước khi gửi cho AI. Không cần cài đặt: mở `index.html` bằng trình duyệt.

## Cấu trúc
```
token-trim/
├── index.html        Khung trang và tab Hướng dẫn
├── css/style.css     Giao diện (đơn sắc, tự theo chế độ sáng/tối)
└── js/
    ├── store.js      Lưu cài đặt (an toàn khi bị chặn storage)
    ├── tokenizer.js  Ước lượng token, tách từ, cắt theo ngân sách
    ├── rules.js      Các quy tắc nén (hàm thuần, dễ thêm mới)
    ├── pipeline.js   Chạy quy tắc và đo số token mỗi quy tắc cắt được
    ├── tools.js      Tiện ích: JSON thành bảng
    └── main.js       Nối module với giao diện
```

## Tính năng
- Nén prompt với 9 quy tắc bật/tắt, hiện số token mỗi quy tắc tiết kiệm.
- Giới hạn cứng: tự lược phần giữa để vừa ngân sách token.
- JSON thành bảng: bỏ lặp tên khóa.
- Soi token: thấy từ nào tốn nhiều token.
- Ước lượng phần trăm cửa sổ ngữ cảnh và chi phí đầu vào mỗi lượt.

## Thêm quy tắc
Trong `js/rules.js`, thêm vào mảng `TT.Rules`:
`{ id: "ten", on: false, label: "Tên", hint: "Mô tả", run: t => t.replace(...) }`

## Lưu ý
Số token là ước lượng, lệch khoảng 10–20% so với bộ đếm chính thức của từng mô hình.
# Token_Trim
