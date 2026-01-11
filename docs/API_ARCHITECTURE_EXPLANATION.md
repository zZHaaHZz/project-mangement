# Giải thích chi tiết luồng hoạt động API - Vừa làm vừa học

## 📁 Cấu trúc thư mục API

```
src/lib/api/
├── base.ts          # Lớp cơ sở - Xử lý HTTP requests (fetch)
├── auth.ts          # API cho Authentication (login, register, logout)
├── users.ts         # API cho Users (CRUD operations)
├── projects.ts      # API cho Projects (CRUD operations)
├── tasks.ts         # API cho Tasks (CRUD operations)
├── logworks.ts      # API cho Logworks (CRUD operations)
├── legacy.ts        # Wrapper tương thích ngược (apiClient cũ)
└── index.ts         # Export tất cả - Entry point
```

---

## 🔄 Luồng hoạt động tổng quan

```
┌─────────────────┐
│   Component     │  (UserPage.tsx, UserModal.tsx)
│   (UI Layer)    │
└────────┬────────┘
         │ Gọi method
         ↓
┌─────────────────┐
│  API Module     │  (usersApi.getUsers())
│  (users.ts)     │
└────────┬────────┘
         │ Delegate
         ↓
┌─────────────────┐
│  Base Client    │  (BaseApiClient.request())
│  (base.ts)      │
└────────┬────────┘
         │ HTTP Request
         ↓
┌─────────────────┐
│  json-server    │  (Backend - Port 3001)
│  (db.json)      │
└────────┬────────┘
         │ Response
         ↓
┌─────────────────┐
│  Component      │  (Update state, re-render)
│  (UI Layer)     │
└─────────────────┘
```

---

## 📚 Chi tiết từng lớp

### 1️⃣ **Lớp Base (base.ts)** - Nền tảng

Đây là lớp cơ sở, xử lý tất cả HTTP requests.

```typescript
class BaseApiClient {
  protected baseURL: string;  // http://localhost:3001
  protected token: string | null;  // JWT token

  // Method chung để gọi API
  protected async request<T>(endpoint: string, options: RequestInit): Promise<T> {
    // 1. Tạo URL đầy đủ
    const url = `${this.baseURL}${endpoint}`;
    
    // 2. Chuẩn bị headers
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`  // Nếu có token
    };
    
    // 3. Gửi HTTP request
    const response = await fetch(url, { ...options, headers });
    
    // 4. Xử lý response
    if (!response.ok) throw new Error(...);
    
    // 5. Parse JSON và return
    return await response.json();
  }

  // Helper methods cho các HTTP verbs
  protected async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  protected async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  protected async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  protected async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}
```

**Trách nhiệm:**
- ✅ Xử lý HTTP requests (GET, POST, PATCH, DELETE)
- ✅ Thêm headers (Content-Type, Authorization)
- ✅ Xử lý errors
- ✅ Parse JSON response
- ✅ Quản lý token

**Có thể thay đổi:**
- 🔄 Có thể thay `fetch` → `axios` chỉ cần sửa method `request()` này

---

### 2️⃣ **Lớp API Modules** (users.ts, projects.ts, ...) - Domain-specific

Mỗi module quản lý một resource cụ thể.

**Ví dụ: `users.ts`**

```typescript
export class UsersApi extends BaseApiClient {
  // GET /users - Lấy danh sách tất cả users
  async getUsers(): Promise<User[]> {
    return this.get<User[]>('/users');
    // ↓ Gọi BaseApiClient.get()
    // ↓ Gọi BaseApiClient.request('/users', { method: 'GET' })
    // ↓ Gọi fetch('http://localhost:3001/users', ...)
  }

  // GET /users/:id - Lấy 1 user theo ID
  async getUser(id: number): Promise<User> {
    return this.get<User>(`/users/${id}`);
  }

  // POST /users - Tạo user mới
  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    return this.post<User>('/users', userData);
    // ↓ Gọi BaseApiClient.post('/users', userData)
    // ↓ Gọi BaseApiClient.request('/users', { method: 'POST', body: JSON.stringify(userData) })
    // ↓ Gọi fetch('http://localhost:3001/users', { method: 'POST', body: '{"name":"...","email":"..."}' })
  }

  // PATCH /users/:id - Cập nhật user
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    return this.patch<User>(`/users/${id}`, userData);
  }

  // DELETE /users/:id - Xóa user
  async deleteUser(id: number): Promise<void> {
    return this.delete<void>(`/users/${id}`);
  }
}
```

**Trách nhiệm:**
- ✅ Định nghĩa các endpoints cho resource
- ✅ Type-safe với TypeScript
- ✅ Sử dụng methods từ BaseApiClient

**Lợi ích:**
- 🎯 Tách biệt theo domain (users, projects, tasks)
- 🔧 Dễ maintain và mở rộng
- 📝 Type-safe với TypeScript

---

### 3️⃣ **Lớp Index (index.ts)** - Entry Point

Tạo instances và export ra ngoài.

```typescript
const API_BASE_URL = 'http://localhost:3001';

// Tạo instances cho từng API module
export const authApi = new AuthApi(API_BASE_URL);
export const usersApi = new UsersApi(API_BASE_URL);
export const projectsApi = new ProjectsApi(API_BASE_URL);
export const tasksApi = new TasksApi(API_BASE_URL);
export const logworksApi = new LogworksApi(API_BASE_URL);

// Legacy wrapper (tương thích ngược)
export const apiClient = createLegacyApiClient(API_BASE_URL);
```

**Trách nhiệm:**
- ✅ Tạo instances của các API modules
- ✅ Export để components sử dụng
- ✅ Quản lý base URL chung

---

### 4️⃣ **Lớp Component** - Sử dụng API

Components gọi API để lấy/update data.

**Ví dụ: `UserPage.tsx`**

```typescript
import { apiClient } from '../lib/api';  // Hoặc: import { usersApi } from '../lib/api';

const UserPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  
  // Fetch users khi component mount
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // 👇 GỌI API Ở ĐÂY
      const data = await apiClient.getUsers();
      // Hoặc: const data = await usersApi.getUsers();
      
      setUsers(data);  // Lưu vào state
    } catch (error) {
      message.error('Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();  // Tự động gọi khi component mount
  }, []);

  return <UserTable users={users} />;
};
```

---

## 🔍 Luồng chi tiết: Lấy danh sách users

### Bước 1: Component gọi API

```typescript
// UserPage.tsx
const data = await apiClient.getUsers();
```

### Bước 2: Legacy wrapper (nếu dùng apiClient)

```typescript
// legacy.ts → index.ts
async getUsers() {
  return this.usersApi.getUsers();  // Delegate to usersApi
}
```

### Bước 3: API Module xử lý

```typescript
// users.ts
async getUsers(): Promise<User[]> {
  return this.get<User[]>('/users');  // Gọi BaseApiClient.get()
}
```

### Bước 4: Base Client gửi HTTP request

```typescript
// base.ts
protected async get<T>(endpoint: string): Promise<T> {
  return this.request<T>(endpoint, { method: 'GET' });
}

protected async request<T>(endpoint: string, options: RequestInit): Promise<T> {
  const url = `${this.baseURL}${endpoint}`;  // http://localhost:3001/users
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.token}`  // Nếu có
  };
  
  // 👇 GỬI HTTP REQUEST
  const response = await fetch(url, {
    method: 'GET',
    headers,
  });
  
  if (!response.ok) throw new Error(...);
  
  return await response.json();  // Parse JSON
}
```

### Bước 5: json-server xử lý

```
GET http://localhost:3001/users
Headers: {
  Content-Type: application/json,
  Authorization: Bearer <token>
}
```

json-server:
1. Đọc `db.json`
2. Lấy mảng `users`
3. Trả về JSON response

### Bước 6: Response về component

```typescript
// Response từ server
[
  { id: 1, name: "John", email: "john@example.com", role: "leader" },
  { id: 2, name: "Jane", email: "jane@example.com", role: "staff" }
]

// Component nhận được
const data = await apiClient.getUsers();
setUsers(data);  // Lưu vào state

// React tự động re-render
<UserTable users={users} />  // Hiển thị danh sách
```

---

## 🔄 Luồng chi tiết: Tạo user mới

### Bước 1: User submit form

```typescript
// UserModal.tsx
const handleSubmit = async (values: { name, email, password, role }) => {
  await apiClient.createUser(values);
};
```

### Bước 2-3: Delegate đến usersApi

```typescript
// legacy.ts
async createUser(userData: any) {
  return this.usersApi.createUser(userData);
}

// users.ts
async createUser(userData: Omit<User, 'id'>): Promise<User> {
  return this.post<User>('/users', userData);
}
```

### Bước 4: Base Client gửi POST request

```typescript
// base.ts
protected async post<T>(endpoint: string, data?: any): Promise<T> {
  return this.request<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),  // Convert object → JSON string
  });
}

// request() method
const response = await fetch('http://localhost:3001/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: "John",
    email: "john@example.com",
    password: "123456",
    role: "staff"
  })
});
```

### Bước 5: json-server xử lý

```
POST http://localhost:3001/users
Body: {
  "name": "John",
  "email": "john@example.com",
  "password": "hashed_password",
  "role": "staff"
}
```

json-server:
1. Validate data
2. Hash password (nếu dùng json-server-auth)
3. Tạo ID mới
4. Thêm vào `db.json`
5. Trả về user đã tạo

### Bước 6: Response và update UI

```typescript
// Response từ server
{
  id: 3,
  name: "John",
  email: "john@example.com",
  role: "staff"
}

// Component nhận được
const newUser = await apiClient.createUser(values);
message.success('Tạo user thành công');

// Refresh danh sách
fetchUsers();  // Gọi lại để lấy danh sách mới
```

---

## 🔐 Token Management

### Cách token được quản lý:

```typescript
// 1. Login → Nhận token
const response = await authApi.login(email, password);
// Response: { accessToken: "abc123...", user: {...} }

// 2. Lưu token
authApi.setToken(response.accessToken);
// → Lưu vào localStorage
// → Lưu vào BaseApiClient.token

// 3. Các request sau tự động thêm token
// BaseApiClient.request() tự động thêm:
headers['Authorization'] = `Bearer ${this.token}`;

// 4. Logout → Xóa token
authApi.logout();
// → Xóa khỏi localStorage
// → Xóa khỏi BaseApiClient.token
```

---

## 🎯 So sánh: Cách cũ vs Cách mới

### Cách cũ (Legacy):

```typescript
import { apiClient } from '../lib/api';

// Tất cả trong 1 object
await apiClient.getUsers();
await apiClient.createUser(data);
await apiClient.getProjects();
await apiClient.createTask(data);
```

**Nhược điểm:**
- ❌ Tất cả trong 1 file lớn (301 dòng)
- ❌ Khó maintain
- ❌ Khó thay đổi implementation (fetch → axios)

### Cách mới (Modular):

```typescript
import { usersApi, projectsApi, tasksApi } from '../lib/api';

// Tách biệt theo domain
await usersApi.getUsers();
await usersApi.createUser(data);
await projectsApi.getProjects();
await tasksApi.createTask(data);
```

**Ưu điểm:**
- ✅ Tách biệt rõ ràng theo domain
- ✅ Dễ maintain và mở rộng
- ✅ Dễ thay đổi implementation (chỉ sửa base.ts)
- ✅ Type-safe với TypeScript

---

## 🔧 Cách thay đổi từ fetch sang axios

### Hiện tại (fetch):

```typescript
// base.ts
protected async request<T>(endpoint: string, options: RequestInit): Promise<T> {
  const response = await fetch(url, { ...options, headers });
  return await response.json();
}
```

### Sau khi thêm axios:

```typescript
// 1. Cài đặt
npm install axios

// 2. Sửa base.ts
import axios from 'axios';

protected async request<T>(endpoint: string, options: RequestInit): Promise<T> {
  const response = await axios({
    url: `${this.baseURL}${endpoint}`,
    method: options.method || 'GET',
    data: options.body ? JSON.parse(options.body as string) : undefined,
    headers: {
      ...headers,
      Authorization: `Bearer ${this.token}`
    }
  });
  
  return response.data;
}
```

**Lợi ích:**
- ✅ Chỉ cần sửa 1 file (`base.ts`)
- ✅ Tất cả API modules tự động dùng axios
- ✅ Không cần sửa code ở components

---

## 📊 Tóm tắt luồng

```
┌─────────────────────────────────────────────────────────┐
│ 1. Component (UserPage.tsx)                            │
│    const data = await apiClient.getUsers();            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Legacy Wrapper (legacy.ts)                          │
│    async getUsers() {                                   │
│      return this.usersApi.getUsers();                   │
│    }                                                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 3. API Module (users.ts)                                │
│    async getUsers() {                                   │
│      return this.get<User[]>('/users');                 │
│    }                                                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Base Client (base.ts)                                │
│    protected async get<T>(endpoint) {                  │
│      return this.request(endpoint, { method: 'GET' }); │
│    }                                                    │
│                                                         │
│    protected async request<T>(endpoint, options) {      │
│      const response = await fetch(url, {               │
│        method: options.method,                          │
│        headers: { Authorization: `Bearer ${token}` }    │
│      });                                                │
│      return await response.json();                      │
│    }                                                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓ HTTP Request
┌─────────────────────────────────────────────────────────┐
│ 5. json-server (Backend)                                │
│    GET http://localhost:3001/users                      │
│    → Đọc db.json                                        │
│    → Trả về JSON array                                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓ JSON Response
┌─────────────────────────────────────────────────────────┐
│ 6. Component nhận data                                  │
│    setUsers(data);  // Update state                     │
│    → React re-render                                    │
│    → UI hiển thị danh sách users                        │
└─────────────────────────────────────────────────────────┘
```

---

## 💡 Best Practices

1. **Sử dụng TypeScript types:**
   ```typescript
   async getUsers(): Promise<User[]>  // Rõ ràng return type
   ```

2. **Error handling:**
   ```typescript
   try {
     const data = await usersApi.getUsers();
   } catch (error) {
     // Xử lý lỗi
   }
   ```

3. **Loading states:**
   ```typescript
   setLoading(true);
   const data = await usersApi.getUsers();
   setLoading(false);
   ```

4. **Refresh sau khi thay đổi:**
   ```typescript
   await usersApi.createUser(data);
   fetchUsers();  // Refresh danh sách
   ```

---

## 🎓 Kết luận

**Kiến trúc API hiện tại:**
- ✅ **Modular**: Tách biệt theo domain
- ✅ **Maintainable**: Dễ bảo trì và mở rộng
- ✅ **Flexible**: Dễ thay đổi implementation
- ✅ **Type-safe**: TypeScript đảm bảo type safety
- ✅ **Backward compatible**: Vẫn hỗ trợ code cũ

**Luồng hoạt động:**
1. Component gọi API method
2. API module delegate đến Base client
3. Base client gửi HTTP request
4. Server xử lý và trả về response
5. Component nhận data và update UI

