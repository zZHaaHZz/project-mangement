# 📚 Tài Liệu Chi Tiết: Hệ Thống Authentication & Login

## 📋 Mục Lục
1. [Tổng Quan](#tổng-quan)
2. [Kiến Trúc Hệ Thống](#kiến-trúc-hệ-thống)
3. [Luồng Đăng Nhập Chi Tiết](#luồng-đăng-nhập-chi-tiết)
4. [Các Component Liên Quan](#các-component-liên-quan)
5. [API Layer](#api-layer)
6. [Kiểm Tra Quyền (Approved)](#kiểm-tra-quyền-approved)
7. [Xử Lý Lỗi](#xử-lý-lỗi)
8. [Best Practices](#best-practices)

---

## 🎯 Tổng Quan

Hệ thống authentication sử dụng:
- **JWT Token** để quản lý session
- **localStorage** để lưu token và user info
- **Context API** (React) để quản lý state toàn cục
- **json-server-auth** làm backend mock

### Các Tính Năng Chính:
- ✅ Đăng nhập (Login)
- ✅ Đăng ký (Register) - yêu cầu Leader duyệt
- ✅ Đăng xuất (Logout)
- ✅ Kiểm tra quyền truy cập (Role-based)
- ✅ Kiểm tra trạng thái duyệt (Approved status)

---

## 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────────┐
│                    UI Layer (Components)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  LoginPage   │  │   Login.tsx  │  │ Register.tsx │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│              Context Layer (State Management)                │
│                    ┌──────────────┐                         │
│                    │ AuthContext  │                         │
│                    │  - user      │                         │
│                    │  - login()   │                         │
│                    │  - logout()  │                         │
│                    └──────┬───────┘                         │
└───────────────────────────┼──────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  AuthApi     │  │ BaseApiClient│  │ apiClient    │      │
│  │  - login()   │  │  - request()│  │ (legacy)     │      │
│  │  - register()│  │  - get()     │  │              │      │
│  │  - logout()  │  │  - post()    │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (json-server-auth)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   /login     │  │  /register   │  │   /users     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Luồng Đăng Nhập Chi Tiết

### Bước 1: User Nhập Thông Tin

**File:** `src/components/auth/Login.tsx`

```typescript
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);

const { login } = useAuth(); // Lấy hàm login từ AuthContext
```

**Giải thích:**
- Component quản lý state local cho form (email, password)
- Sử dụng `useAuth()` hook để lấy hàm `login` từ Context

---

### Bước 2: Submit Form

**File:** `src/components/auth/Login.tsx` (dòng 21-34)

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault(); // Ngăn form submit mặc định
  setError(''); // Reset error
  setLoading(true); // Hiển thị loading state

  try {
    await login({ email, password });
    // Login thành công, AuthContext sẽ tự động update state
    // User sẽ được redirect về dashboard (xử lý ở LoginPage)
  } catch (err: any) {
    setError(err?.message || 'Login failed');
  } finally {
    setLoading(false);
  }
};
```

**Giải thích:**
- `e.preventDefault()`: Ngăn browser reload page
- Gọi `login()` từ AuthContext với email và password
- Xử lý lỗi và hiển thị thông báo

---

### Bước 3: AuthContext Xử Lý Login

**File:** `src/contexts/AuthContext.tsx` (dòng 45-53)

```typescript
const login = async (credentials: LoginCredentials) => {
  try {
    // Gọi API login
    const response = await apiClient.login(credentials.email, credentials.password);
    
    // ⚠️ QUAN TRỌNG: Kiểm tra user đã được duyệt chưa
    if (response.user && response.user.approved === false) {
      // User chưa được duyệt, không cho login
      apiClient.logout(); // Xóa token và user khỏi localStorage
      throw new Error('Tài khoản của bạn chưa được Leader duyệt. Vui lòng đợi Leader phê duyệt.');
    }
    
    // Nếu đã được duyệt, set user vào state
    setUser(response.user);
  } catch (error) {
    console.error('Login error:', error);
    throw error; // Throw lại để component có thể catch
  }
};
```

**Giải thích:**
- Gọi `apiClient.login()` để gửi request đến backend
- **Kiểm tra `approved`**: Nếu `false` → không cho login
- Nếu thành công → set user vào state (toàn app có thể access)

---

### Bước 4: API Client Gửi Request

**File:** `src/lib/api/auth.ts` (dòng 6-14)

```typescript
async login(email: string, password: string): Promise<AuthResponse> {
  // Gửi POST request đến /login endpoint
  const response = await this.post<AuthResponse>('/login', { email, password });
  
  // Lưu token vào localStorage và set vào headers
  this.setToken(response.accessToken);
  
  // Lưu user info vào localStorage
  if (response.user) {
    this.saveUserToStorage(response.user);
  }
  
  return response;
}
```

**Giải thích:**
- `this.post()` gọi đến `/login` endpoint
- Lưu `accessToken` vào localStorage
- Lưu `user` object vào localStorage
- Return response về cho AuthContext

---

### Bước 5: BaseApiClient Xử Lý HTTP Request

**File:** `src/lib/api/base.ts` (dòng 28-114)

```typescript
protected async request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${this.baseURL}${endpoint}`; // http://localhost:3001/login
  
  // Tạo headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Thêm Authorization header nếu có token
  if (this.token) {
    headers['Authorization'] = `Bearer ${this.token}`;
  }

  // Gửi request
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Xử lý lỗi
  if (!response.ok) {
    // Parse error message từ response
    // ...
    throw new Error(errorMessage);
  }

  // Parse JSON response
  const data = await response.json();
  return data;
}
```

**Giải thích:**
- Tạo URL đầy đủ từ `baseURL` + `endpoint`
- Thêm headers (Content-Type, Authorization)
- Gửi request bằng `fetch()`
- Xử lý lỗi và parse response

---

### Bước 6: Backend Xử Lý (json-server-auth)

**Backend tự động:**
1. Nhận POST request đến `/login`
2. Tìm user trong `db.json` theo email
3. So sánh password (đã hash bằng bcrypt)
4. Nếu đúng → tạo JWT token và trả về:
   ```json
   {
     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": 1,
       "email": "leader@gmail.com",
       "name": "Leader",
       "role": "leader",
       "approved": true
     }
   }
   ```
5. Nếu sai → trả về error 400

---

### Bước 7: Redirect Sau Khi Login Thành Công

**File:** `src/pages/LoginPage.tsx` (dòng 6-23)

```typescript
const LoginPage: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  // Hiển thị loading khi đang check authentication
  if (loading) {
    return <div>Loading...</div>;
  }

  // Nếu đã đăng nhập, redirect về dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Nếu chưa đăng nhập, hiển thị form login
  return <AuthTabs />;
};
```

**Giải thích:**
- Kiểm tra `isAuthenticated` từ AuthContext
- Nếu `true` → redirect về `/dashboard`
- Nếu `false` → hiển thị form login/register

---

## 📦 Các Component Liên Quan

### 1. LoginPage (`src/pages/LoginPage.tsx`)

**Chức năng:**
- Route guard: Kiểm tra user đã login chưa
- Redirect nếu đã login
- Hiển thị AuthTabs nếu chưa login

**Code:**
```typescript
const LoginPage: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  
  return <AuthTabs />;
};
```

---

### 2. Login Component (`src/components/auth/Login.tsx`)

**Chức năng:**
- Form đăng nhập với email và password
- Xử lý submit và hiển thị lỗi
- Tích hợp với AuthContext

**State Management:**
```typescript
const [email, setEmail] = useState('');        // Email input
const [password, setPassword] = useState('');  // Password input
const [error, setError] = useState('');        // Error message
const [loading, setLoading] = useState(false);  // Loading state
```

**Form Submit:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  
  try {
    await login({ email, password });
  } catch (err: any) {
    setError(err?.message || 'Login failed');
  } finally {
    setLoading(false);
  }
};
```

---

### 3. AuthContext (`src/contexts/AuthContext.tsx`)

**Chức năng:**
- Quản lý authentication state toàn cục
- Cung cấp `login()`, `register()`, `logout()`
- Load user từ localStorage khi app khởi động

**State:**
```typescript
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState(true);
```

**Methods:**
```typescript
login(credentials)      // Đăng nhập
register(userData)      // Đăng ký
logout()                // Đăng xuất
```

**Computed Values:**
```typescript
isAuthenticated: !!user           // true nếu có user
isLeader: user?.role === 'leader'  // true nếu là leader
isStaff: user?.role === 'staff'    // true nếu là staff
```

**Load User từ localStorage:**
```typescript
useEffect(() => {
  const loadUserFromStorage = () => {
    const token = localStorage.getItem('token');
    if (token) {
      apiClient.setToken(token);
      const savedUser = apiClient.getCurrentUserFromStorage();
      if (savedUser) {
        setUser(savedUser);
      } else {
        localStorage.removeItem('token');
        apiClient.setToken(null);
      }
    }
    setLoading(false);
  };
  loadUserFromStorage();
}, []);
```

---

## 🔌 API Layer

### 1. AuthApi (`src/lib/api/auth.ts`)

**Class:** `AuthApi extends BaseApiClient`

**Methods:**

#### `login(email, password)`
```typescript
async login(email: string, password: string): Promise<AuthResponse> {
  const response = await this.post<AuthResponse>('/login', { email, password });
  this.setToken(response.accessToken);
  if (response.user) {
    this.saveUserToStorage(response.user);
  }
  return response;
}
```

#### `register(userData)`
```typescript
async register(userData: { email: string; password: string; name: string; role?: string }): Promise<AuthResponse> {
  const response = await this.post<AuthResponse>('/register', userData);
  this.setToken(response.accessToken);
  if (response.user) {
    this.saveUserToStorage(response.user);
  }
  return response;
}
```

#### `logout()`
```typescript
async logout(): Promise<void> {
  this.setToken(null);
  this.removeUserFromStorage();
}
```

#### `getCurrentUserFromStorage()`
```typescript
getCurrentUserFromStorage(): any | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
  }
  return null;
}
```

---

### 2. BaseApiClient (`src/lib/api/base.ts`)

**Class:** `BaseApiClient`

**Chức năng:**
- Base class cho tất cả API clients
- Xử lý HTTP requests (GET, POST, PATCH, DELETE)
- Quản lý token và headers
- Xử lý lỗi

**Properties:**
```typescript
protected baseURL: string;        // http://localhost:3001
protected token: string | null;    // JWT token
```

**Methods:**

#### `request<T>(endpoint, options)`
- Gửi HTTP request
- Thêm Authorization header nếu có token
- Xử lý lỗi và parse response

#### `setToken(token)`
- Lưu token vào localStorage
- Set token vào instance

#### `get<T>(endpoint)`
- Gửi GET request

#### `post<T>(endpoint, data)`
- Gửi POST request với body

#### `patch<T>(endpoint, data)`
- Gửi PATCH request với body

#### `delete<T>(endpoint)`
- Gửi DELETE request

---

## ✅ Kiểm Tra Quyền (Approved)

### Luồng Kiểm Tra Approved

```
User Đăng Nhập
    │
    ▼
AuthContext.login()
    │
    ▼
apiClient.login() → Nhận response với user.approved
    │
    ▼
Kiểm tra: user.approved === false?
    │
    ├─ YES → Throw error "Chưa được duyệt"
    │         → Xóa token
    │         → Không set user vào state
    │
    └─ NO → Set user vào state
            → User có thể truy cập app
```

### Code Kiểm Tra

**File:** `src/contexts/AuthContext.tsx`

```typescript
const login = async (credentials: LoginCredentials) => {
  try {
    const response = await apiClient.login(credentials.email, credentials.password);
    
    // ⚠️ QUAN TRỌNG: Kiểm tra user đã được duyệt chưa
    if (response.user && response.user.approved === false) {
      // User chưa được duyệt, không cho login
      apiClient.logout(); // Xóa token và user khỏi localStorage
      throw new Error('Tài khoản của bạn chưa được Leader duyệt. Vui lòng đợi Leader phê duyệt.');
    }
    
    // Nếu đã được duyệt, set user vào state
    setUser(response.user);
  } catch (error) {
    throw error;
  }
};
```

### User Model

**File:** `src/models/index.ts`

```typescript
export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole; // 'leader' | 'staff'
  password?: string; // Only for creation
  approved?: boolean; // Trạng thái duyệt (mặc định false)
}
```

### db.json Structure

```json
{
  "users": [
    {
      "id": 1,
      "email": "leader@gmail.com",
      "password": "$2a$10$...",
      "name": "Leader",
      "role": "leader",
      "approved": true,  // ← Trạng thái duyệt
      "createdAt": "2025-12-30T00:00:00.000Z"
    },
    {
      "id": 2,
      "email": "staff1@gmail.com",
      "password": "$2a$10$...",
      "name": "Staff 1",
      "role": "staff",
      "approved": false, // ← Chờ duyệt
      "createdAt": "2025-12-28T00:00:00.000Z"
    }
  ]
}
```

---

## 🚨 Xử Lý Lỗi

### Các Loại Lỗi

#### 1. Network Error
```typescript
catch (error) {
  throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra json-server đã chạy chưa.');
}
```

#### 2. Authentication Error (400)
```typescript
if (response.status === 400) {
  errorMessage = 'Email hoặc mật khẩu không đúng';
}
```

#### 3. Not Found Error (404)
```typescript
if (response.status === 404) {
  errorMessage = 'Không tìm thấy tài khoản';
}
```

#### 4. Server Error (500)
```typescript
if (response.status === 0 || response.status === 500) {
  errorMessage = 'Lỗi server. Vui lòng kiểm tra json-server đã chạy chưa.';
}
```

#### 5. Not Approved Error
```typescript
if (response.user && response.user.approved === false) {
  throw new Error('Tài khoản của bạn chưa được Leader duyệt. Vui lòng đợi Leader phê duyệt.');
}
```

### Hiển Thị Lỗi trong UI

**File:** `src/components/auth/Login.tsx`

```typescript
{error && (
  <Alert
    message={error}
    type="error"
    showIcon
    className="mb-4"
  />
)}
```

---

## 💡 Best Practices

### 1. Luôn Kiểm Tra Loading State

```typescript
if (loading) {
  return <div>Loading...</div>;
}
```

### 2. Xử Lý Lỗi Đầy Đủ

```typescript
try {
  await login({ email, password });
} catch (err: any) {
  setError(err?.message || 'Login failed'); // Luôn có fallback message
} finally {
  setLoading(false); // Luôn reset loading
}
```

### 3. Validate Input

```typescript
<Input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required  // ← HTML5 validation
  disabled={loading}
/>
```

### 4. Bảo Mật Token

- ✅ Lưu token trong localStorage (client-side)
- ✅ Thêm token vào Authorization header
- ✅ Xóa token khi logout
- ✅ Xóa token khi user chưa được duyệt

### 5. State Management

- ✅ Sử dụng Context API cho global state
- ✅ Local state cho form inputs
- ✅ Loading states để UX tốt hơn

### 6. Error Messages Thân Thiện

```typescript
// ❌ Bad
throw new Error('Error 400');

// ✅ Good
throw new Error('Email hoặc mật khẩu không đúng');
```

---

## 📝 Tóm Tắt

### Luồng Hoàn Chỉnh

1. **User nhập email/password** → `Login.tsx`
2. **Submit form** → `handleSubmit()`
3. **Gọi AuthContext.login()** → `AuthContext.tsx`
4. **Gọi apiClient.login()** → `auth.ts`
5. **Gửi POST /login** → `BaseApiClient.request()`
6. **Backend xử lý** → json-server-auth
7. **Nhận response** → `AuthResponse { accessToken, user }`
8. **Kiểm tra approved** → Nếu false → throw error
9. **Lưu token & user** → localStorage
10. **Set user vào state** → `setUser(response.user)`
11. **Redirect** → `/dashboard` (tự động bởi LoginPage)

### Các File Quan Trọng

| File | Chức Năng |
|------|-----------|
| `src/pages/LoginPage.tsx` | Route guard, redirect |
| `src/components/auth/Login.tsx` | Form đăng nhập |
| `src/contexts/AuthContext.tsx` | Quản lý auth state |
| `src/lib/api/auth.ts` | API methods |
| `src/lib/api/base.ts` | HTTP client base |
| `src/models/index.ts` | Type definitions |

---

## 🎓 Bài Tập Thực Hành

### 1. Thêm "Remember Me" Feature
- Lưu token với expiration
- Tự động login khi quay lại

### 2. Thêm "Forgot Password"
- Gửi email reset password
- Tạo reset password page

### 3. Thêm Session Timeout
- Tự động logout sau X phút không hoạt động
- Hiển thị warning trước khi logout

### 4. Thêm Refresh Token
- Tự động refresh token khi hết hạn
- Xử lý refresh token rotation

---

**Tài liệu này được tạo để hỗ trợ học tập. Nếu có câu hỏi, vui lòng tham khảo code trong các file đã liệt kê.**

