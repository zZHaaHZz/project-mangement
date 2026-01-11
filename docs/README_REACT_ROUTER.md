# Project Management - React với React Router

Dự án đã được chuyển đổi từ Next.js sang React thuần với React Router.

## Cấu trúc thư mục mới

```
src/
├── main.tsx              # Entry point
├── App.tsx               # App component với routing
├── pages/                # Các page components
│   ├── LoginPage.tsx
│   └── DashboardPage.tsx
├── components/           # Reusable components
│   ├── auth/            # Authentication components
│   ├── layout/          # Layout components
│   │   ├── Head.tsx
│   │   ├── Siderbar.tsx
│   │   ├── MainLayout.tsx
│   │   └── sidebar/     # Sidebar hooks
│   ├── projects/        # Project components
│   └── routes/          # Route components
│       └── ProtectedRoute.tsx
├── contexts/            # React Contexts
│   └── AuthContext.tsx
├── lib/                 # Utilities và hooks
│   ├── api.ts
│   ├── hooks/
│   └── utils/
├── models/              # TypeScript types/interfaces
└── styles/              # Global styles
    └── global.css
```

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Chạy development server:
```bash
npm run dev
```

3. Chạy json-server (API mock):
```bash
npm run json-server
```

4. Chạy cả hai cùng lúc:
```bash
npm run dev:all
```

## Routing

- `/login` - Trang đăng nhập/đăng ký
- `/dashboard` - Dashboard (protected)
- `/projects` - Quản lý dự án (protected)
- `/tasks` - Quản lý nhiệm vụ (protected)
- `/logworks` - Quản lý tài nguyên (protected)
- `/kanban` - Kanban board (protected)
- `/users` - Quản lý nhân viên (protected, chỉ Leader)

## Thay đổi chính

1. **Next.js → React Router**: 
   - `next/navigation` → `react-router-dom`
   - `useRouter()` → `useNavigate()`
   - `usePathname()` → `useLocation()`

2. **Loại bỏ 'use client'**: Không cần thiết trong React thuần

3. **Cấu trúc routing**: Sử dụng `BrowserRouter`, `Routes`, `Route` từ React Router

4. **Protected Routes**: Sử dụng component `ProtectedRoute` để bảo vệ routes

5. **Build tool**: Chuyển từ Next.js sang Vite

## Lưu ý

- Tất cả routes được bảo vệ (trừ `/login`) sẽ redirect về `/login` nếu chưa đăng nhập
- Đã đăng nhập sẽ tự động redirect về `/dashboard` khi truy cập `/login`
