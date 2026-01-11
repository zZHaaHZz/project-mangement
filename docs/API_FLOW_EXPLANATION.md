# Giải thích luồng gọi API User - Vừa làm vừa học

## 📚 Tổng quan

Khi bạn làm việc với API trong ứng dụng React, có 3 lớp chính:

```
Component (UI) 
    ↓
API Client (Trung gian)
    ↓
Backend Server (json-server)
```

---

## 1️⃣ **API Client** - `src/lib/api.ts`

Đây là lớp trung gian, xử lý tất cả các request HTTP.

### Cấu trúc:

```typescript
class ApiClient {
  private baseURL: string;  // http://localhost:3001
  private token: string | null;  // JWT token để authenticate

  // Method chung để gọi API
  private async request<T>(endpoint: string, options: RequestInit): Promise<T> {
    // 1. Tạo URL đầy đủ
    const url = `${this.baseURL}${endpoint}`;
    
    // 2. Thêm headers (Content-Type, Authorization)
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`  // Nếu có token
    };
    
    // 3. Gọi fetch API
    const response = await fetch(url, { ...options, headers });
    
    // 4. Xử lý response và error
    if (!response.ok) throw new Error(...);
    
    // 5. Parse JSON và return
    return await response.json();
  }
}
```

### Các method cho User:

```typescript
// GET /users - Lấy danh sách tất cả users
async getUsers() {
  return this.request<any[]>('/users');
}

// GET /users/:id - Lấy 1 user theo ID
async getUser(id: number) {
  return this.request<any>(`/users/${id}`);
}

// POST /users - Tạo user mới
async createUser(userData: any) {
  return this.request<any>('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

// PATCH /users/:id - Cập nhật user
async updateUser(id: number, userData: any) {
  return this.request<any>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(userData),
  });
}

// DELETE /users/:id - Xóa user
async deleteUser(id: number) {
  return this.request<void>(`/users/${id}`, {
    method: 'DELETE',
  });
}
```

### Export instance:

```typescript
export const apiClient = new ApiClient(API_BASE_URL);
```

---

## 2️⃣ **Component sử dụng API** - `src/pages/UserPage.tsx`

### A. Lấy danh sách users (GET):

```typescript
const [users, setUsers] = useState<User[]>([]);
const [loading, setLoading] = useState(false);

// Function để fetch users
const fetchUsers = async () => {
  try {
    setLoading(true);  // Bật loading
    const data = await apiClient.getUsers();  // 👈 GỌI API Ở ĐÂY
    setUsers(data);  // Lưu vào state
  } catch (error: any) {
    message.error('Lỗi: ' + error.message);  // Hiển thị lỗi
  } finally {
    setLoading(false);  // Tắt loading
  }
};

// Gọi khi component mount
useEffect(() => {
  fetchUsers();  // 👈 TỰ ĐỘNG GỌI KHI TRANG LOAD
}, []);
```

**Luồng:**
1. Component mount → `useEffect` chạy
2. Gọi `fetchUsers()`
3. `apiClient.getUsers()` → gửi GET request đến `http://localhost:3001/users`
4. Nhận response → lưu vào `users` state
5. Table tự động re-render với data mới

---

### B. Xóa user (DELETE):

```typescript
const handleDelete = async (userId: number) => {
  try {
    await apiClient.deleteUser(userId);  // 👈 GỌI API Ở ĐÂY
    message.success('Xóa user thành công');
    fetchUsers();  // Refresh lại danh sách
  } catch (error: any) {
    message.error('Lỗi: ' + error.message);
  }
};
```

**Luồng:**
1. User click nút "Xóa"
2. Gọi `handleDelete(userId)`
3. `apiClient.deleteUser(userId)` → gửi DELETE request đến `http://localhost:3001/users/1`
4. Nếu thành công → hiển thị message → refresh danh sách

---

## 3️⃣ **Component Modal** - `src/components/users/UserModal.tsx`

### C. Tạo user mới (POST):

```typescript
const handleSubmit = async (values: any) => {
  try {
    if (editingUser) {
      // Update
      await apiClient.updateUser(editingUser.id, values);  // 👈 PATCH API
    } else {
      // Create
      await apiClient.createUser(values);  // 👈 POST API Ở ĐÂY
    }
    message.success('Thành công');
    onSuccess();  // Callback để refresh danh sách
  } catch (error: any) {
    message.error('Lỗi: ' + error.message);
  }
};
```

**Luồng:**
1. User điền form và submit
2. `handleSubmit(values)` được gọi với data từ form
3. `apiClient.createUser(values)` → gửi POST request đến `http://localhost:3001/users`
   - Body: `{ name: "...", email: "...", password: "...", role: "staff" }`
4. Server tạo user mới → trả về user đã tạo
5. Gọi `onSuccess()` → refresh danh sách

---

## 🔄 **Luồng hoàn chỉnh khi tạo user mới:**

```
1. UserPage.tsx
   └─> User click "Thêm nhân viên"
       └─> Mở UserModal

2. UserModal.tsx
   └─> User điền form và click "Tạo mới"
       └─> handleSubmit(values)
           └─> apiClient.createUser(values)
               └─> ApiClient.request('/users', { method: 'POST', body: ... })
                   └─> fetch('http://localhost:3001/users', ...)
                       └─> json-server nhận request
                           └─> Tạo user mới trong db.json
                               └─> Trả về user đã tạo
                                   └─> onSuccess() callback
                                       └─> UserPage.fetchUsers() (refresh)
                                           └─> Table hiển thị user mới
```

---

## 📝 **Các điểm quan trọng:**

### 1. **Error Handling:**
```typescript
try {
  const data = await apiClient.getUsers();
  // Xử lý thành công
} catch (error: any) {
  // Xử lý lỗi - hiển thị message cho user
  message.error('Lỗi: ' + error.message);
}
```

### 2. **Loading State:**
```typescript
const [loading, setLoading] = useState(false);

// Bật loading trước khi gọi API
setLoading(true);
const data = await apiClient.getUsers();
// Tắt loading sau khi xong (dù thành công hay lỗi)
setLoading(false);
```

### 3. **State Management:**
```typescript
// Lưu data vào state
const [users, setUsers] = useState<User[]>([]);

// Sau khi fetch thành công
setUsers(data);  // React tự động re-render component
```

### 4. **Refresh sau khi thay đổi:**
```typescript
// Sau khi create/update/delete
fetchUsers();  // Gọi lại để lấy data mới nhất
```

---

## 🎯 **Tóm tắt:**

| Hành động | Method | Endpoint | Component gọi |
|-----------|--------|----------|---------------|
| Lấy danh sách | GET | `/users` | `UserPage.fetchUsers()` |
| Tạo mới | POST | `/users` | `UserModal.handleSubmit()` |
| Cập nhật | PATCH | `/users/:id` | `UserModal.handleSubmit()` |
| Xóa | DELETE | `/users/:id` | `UserPage.handleDelete()` |

---

## 💡 **Best Practices:**

1. ✅ Luôn dùng try-catch để xử lý lỗi
2. ✅ Hiển thị loading state khi đang fetch
3. ✅ Refresh data sau khi create/update/delete
4. ✅ Hiển thị message thành công/lỗi cho user
5. ✅ Tách API logic vào một class riêng (ApiClient)
6. ✅ Sử dụng TypeScript để type-safe

---

## 🔍 **Debug tips:**

1. Mở **DevTools → Network tab** để xem request/response
2. Kiểm tra **Console** để xem error messages
3. Đảm bảo **json-server đang chạy** trên port 3001
4. Kiểm tra **Authorization header** nếu cần authenticate

