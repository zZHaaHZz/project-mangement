# Project Management System

Frontend project using Next.js with json-server and json-server-auth for fake API.

## Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **json-server** - Fake REST API
- **json-server-auth** - Authentication middleware for json-server
- **Tailwind CSS** - Styling

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── auth/        # Authentication pages
│   ├── features/    # Feature pages
│   └── page.tsx     # Home page
├── components/       # Shared UI components
│   ├── auth/        # Auth components
│   └── layout/      # Layout components
├── features/         # Feature modules (optional)
├── lib/             # Utilities & API client
│   └── api.ts       # API client for json-server
├── models/          # TypeScript types/interfaces
│   └── index.ts     # All type definitions
└── contexts/        # React contexts
    └── AuthContext.tsx  # Authentication context
```

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Start json-server (port 3001):**
```bash
npm run json-server
```

3. **Start Next.js dev server (port 8080):**
```bash
npm run dev
```

4. **Or run both together:**
```bash
npm run dev:all
```

## API Endpoints

json-server runs on `http://localhost:3001`

### Authentication
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /users` - Get all users (requires auth)
- `GET /users/:id` - Get user by ID

### Resources
- `GET /projects` - Get all projects
- `POST /projects` - Create project
- `GET /projects/:id` - Get project by ID
- `PATCH /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

- `GET /tasks` - Get all tasks
- `POST /tasks` - Create task
- `GET /tasks/:id` - Get task by ID
- `PATCH /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

- `GET /logworks` - Get all logworks
- `POST /logworks` - Create logwork
- `GET /logworks/:id` - Get logwork by ID
- `PATCH /logworks/:id` - Update logwork
- `DELETE /logworks/:id` - Delete logwork

## Usage

### Using API Client

```typescript
import { apiClient } from '@/lib/api';

// Login
await apiClient.login('user@example.com', 'password');

// Get projects
const projects = await apiClient.getProjects();

// Create task
const newTask = await apiClient.createTask({
  title: 'New Task',
  description: 'Task description',
  status: 'todo',
  projectId: 1,
  userId: 1
});
```

### Using Auth Context

```typescript
'use client';
import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  // Use auth state and methods
}
```

## Database

The `db.json` file contains the initial data for json-server. It will be automatically updated when you create/update/delete resources.

## Notes

- json-server-auth automatically hashes passwords
- Token is stored in localStorage
- API client automatically includes Authorization header when token exists
- All API calls are typed with TypeScript interfaces in `src/models/`
