# Stride — Task Management Application

A full-stack task management app built as part of a SWE internship assessment.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth + Auth UI |
| Drag & Drop | @dnd-kit/core, @dnd-kit/sortable |
| Styling | Tailwind CSS |
| Backend | Next.js Route Handlers (embedded API) |

## Features

- ✅ Create, view, edit, and delete tasks (full CRUD)
- ✅ Kanban board with three columns: **To Do → In Progress → Done**
- ✅ Drag-and-drop to move and reorder tasks between columns
- ✅ Per-user authentication — tasks are private via Supabase Row Level Security
- ✅ Due date tracking with colour-coded urgency indicators
- ✅ Input validation on both client and server
- ✅ Task detail page with inline editing

---

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd task-manager
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to **Settings → API** and note:
   - **Project URL**
   - **anon / public key**

### 3. Run the database migration

In your Supabase dashboard, go to **SQL Editor → New query**, paste the contents of [`supabase/migrations/001_tasks.sql`](./supabase/migrations/001_tasks.sql), and click **Run**.

> **Note on email confirmation:** Supabase enables email confirmation by default. For local development and assessment review, disable it under **Authentication → Settings → Email Auth → uncheck "Enable email confirmations"**. Re-enable it for production.

### 4. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to sign up.

---

## Project Structure

```
app/
├── (dashboard)/         ← Protected dashboard (Kanban board)
│   ├── layout.tsx       ← Auth guard + Header
│   └── page.tsx         ← Server-renders tasks, passes to KanbanBoard
├── tasks/[id]/          ← Task detail page
├── login/               ← Sign-in page
├── signup/              ← Sign-up page
└── api/tasks/           ← REST API route handlers
    ├── route.ts         ← GET (list), POST (create)
    ├── [id]/route.ts    ← GET, PATCH, DELETE
    └── reorder/route.ts ← PATCH bulk positions after drag-and-drop

components/
├── header/              ← Header, Logo, UserMenu
├── kanban/              ← KanbanBoard, KanbanColumn, ColumnHeader, TaskCard
├── task-modal/          ← TaskModal, TaskForm, FormField
├── task-detail/         ← TaskDetailPanel
├── StatusBadge.tsx
├── DueDateIndicator.tsx
├── Toast.tsx
└── ConfirmDialog.tsx

lib/
├── supabase/client.ts   ← Browser client
├── supabase/server.ts   ← Server client (reads cookies)
└── types.ts             ← Task interface + API payload types
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks` | List all tasks for the authenticated user |
| `POST` | `/api/tasks` | Create a new task |
| `GET` | `/api/tasks/:id` | Get a single task |
| `PATCH` | `/api/tasks/:id` | Update a task |
| `DELETE` | `/api/tasks/:id` | Delete a task |
| `PATCH` | `/api/tasks/reorder` | Bulk update positions after drag-and-drop |

All endpoints require a valid Supabase session cookie. Unauthenticated requests return `401`. Task ownership is enforced at both the API layer and via Supabase Row Level Security.

---

## Assumptions & Design Decisions

1. **Kanban as the "list" view** — The assessment asks for a task list and individual task view. I implemented a Kanban board as the list view as it provides more value and better demonstrates the status model. The individual task view is accessible by clicking any task title.

2. **Embedded backend via Route Handlers** — Rather than a separate API server, I used Next.js Route Handlers (App Router). This keeps the codebase unified and is straightforward to explain and deploy.

3. **Supabase Auth UI** — The pre-built `@supabase/auth-ui-react` component is used for the sign-in/sign-up forms to avoid reimplementing auth boilerplate within the assessment time limit.

4. **Optimistic drag-and-drop** — The board updates immediately on drag; the position/status is persisted to the API in the background. If the API call fails, a toast notification is shown.

5. **Row Level Security** — All task access is restricted to the owning user at the database level, regardless of what the API layer does. This is the correct security model for multi-user applications.

6. **No email confirmation in dev** — See setup step 3. This is intentional for ease of review.
