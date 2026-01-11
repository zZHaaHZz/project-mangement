# Hướng dẫn Đăng nhập

## Về mật khẩu trong db.json

**Quan trọng:** Với `json-server-auth`, mật khẩu trong `db.json` phải được **hash bằng bcrypt**. Không thể dùng mật khẩu plain text.

## Cách tạo tài khoản mới (Khuyến nghị)

1. **Chạy json-server:**
```bash
npm run json-server
```

2. **Mở trình duyệt, vào trang Register**
   - Nhập thông tin: Name, Email, Password
   - Click Register
   - json-server-auth sẽ tự động hash password và lưu vào `db.json`

3. **Sau khi đăng ký thành công, bạn có thể Login với email/password vừa tạo**

## Cách test nhanh

1. **Tạo user qua API trực tiếp (nếu muốn):**

```bash
# Chạy json-server trước
npm run json-server

# Trong terminal khác, chạy:
curl -X POST http://localhost:3001/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456",
    "name": "Test User"
  }'
```

2. **Sau đó login với:**
   - Email: `test@example.com`
   - Password: `123456`

## Lưu ý

- ✅ **Nên dùng Register form** - json-server-auth sẽ tự động hash password
- ❌ **Không nên thêm user trực tiếp vào db.json** - phải hash password trước (phức tạp)
- 🔄 **db.json sẽ tự động cập nhật** khi bạn tạo user mới qua API

## Ví dụ user đã tạo

Sau khi register, `db.json` sẽ có dạng:

```json
{
  "users": [
    {
      "id": 1,
      "email": "test@example.com",
      "password": "$2a$10$xyz...",  // Đã được hash tự động
      "name": "Test User"
    }
  ]
}
```

Password đã được hash, bạn không thể biết password gốc là gì từ hash này.

