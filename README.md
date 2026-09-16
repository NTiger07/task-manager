# Stride — Task Management Application

A full-stack task management application built with Next.js 16, Supabase, and Tailwind CSS as part of a Software Engineering assessment.

---

## 1. Project & Deployment Links

- **Live Deployment**: [https://vgstride.vercel.app](https://vgstride.vercel.app)
- **Git Repository**: [https://github.com/NTiger07/task-manager.git](https://github.com/NTiger07/task-manager.git)
- **Default Branch**: `main`

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router with Turbopack) |
| **Language** | TypeScript (Strict mode) |
| **Database & Auth** | Supabase (PostgreSQL with Row Level Security & Auth) |
| **Drag & Drop** | `@dnd-kit/core`, `@dnd-kit/sortable` |
| **Styling** | Tailwind CSS v4 |
| **Backend API** | Next.js Route Handlers (RESTful embedded endpoints) |

---

## 3. Features

- **Authentication**: Sign up and sign in with email/password via Supabase Auth.
- **Kanban Board**: Drag-and-drop tasks across three lifecycle columns: **To Do → In Progress → Done**.
- **Quick Status Actions**: One-click action buttons on task cards and detail panel (*Mark as in progress*, *Mark as done*).
- **Task Lifecycle Enforcement**: Newly created tasks start strictly in **To Do**.
- **Task Detail View**: Dedicated page (`/tasks/[id]`) for in-depth inspection and inline editing.
- **Search & Filtering**: Real-time task title filter with matching counters.
- **Due Date Tracking**: Color-coded badges indicating overdue, due today, or upcoming deadlines.
- **Data Security**: Multi-tenant data isolation enforced at the PostgreSQL layer via Row Level Security (RLS).

---

## 4. Environment & Configuration Instructions

### Prerequisites
- **Node.js**: v18.18 or higher (v20+ recommended)
- **npm**: v9 or higher
- A free **[Supabase](https://supabase.com)** account

### Step 1: Create Supabase Project
1. Log in to [supabase.com](https://supabase.com) and create a new project.
2. In your Supabase project dashboard, navigate to **Project Settings → API**.
3. Copy the following credentials:
   - **Project URL**
   - **anon / public key**

### Step 2: Run Database Migration
1. In the Supabase dashboard, navigate to **SQL Editor → New query**.
2. Copy and paste the entire content of [`supabase/migrations/001_tasks.sql`](./supabase/migrations/001_tasks.sql).
3. Click **Run** to create the `tasks` table, automated `updated_at` trigger, and Row Level Security (RLS) policies.

### Step 3: Configure Authentication (Evaluation Mode)
> **Tip for Reviewers:** Supabase enables email confirmation by default. To test registration and sign-in immediately without needing to verify email addresses:
> 1. In your Supabase dashboard, go to **Authentication → Providers → Email**.
> 2. Toggle **OFF** "Confirm email" (or uncheck "Enable email confirmations").
> 3. Click **Save**.

### Step 4: Configure Local Environment Variables
In the root of the cloned repository, create a `.env.local` file from the example:

```bash
cp .env.local.example .env.local
```

Open `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 5. Instructions for Running the Application

### 1. Clone the repository
```bash
git clone https://github.com/NTiger07/task-manager.git
cd task-manager
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. If not authenticated, you will be redirected to the sign-in / sign-up page.

### 4. Build for production (Optional validation)
To verify a production build:
```bash
npm run build
npm run start
```

### 5. Run linting
```bash
npm run lint
```

---

## 6. Project Structure

```
task-manager/
├── app/
│   ├── (dashboard)/             # Protected root dashboard layout & board view
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/tasks/               # REST API route handlers
│   │   ├── route.ts             # GET (list tasks), POST (create task in 'todo')
│   │   ├── [id]/route.ts        # GET, PATCH (update), DELETE
│   │   └── reorder/route.ts     # PATCH (bulk position updates for drag-and-drop)
│   ├── login/page.tsx           # Authentication sign-in page
│   ├── signup/page.tsx          # Authentication sign-up page
│   ├── tasks/[id]/              # Task detail view page & 404 handler
│   │   ├── page.tsx
│   │   └── not-found.tsx
│   ├── layout.tsx               # Root application shell & font provider
│   └── globals.css              # Styling rules & design tokens
├── components/
│   ├── auth/AuthForm.tsx        # Supabase authentication form handler
│   ├── header/                  # Global navbar, Stride logo, and user dropdown
│   ├── kanban/                  # KanbanBoard, KanbanColumn, TaskCard, ColumnHeader
│   ├── task-detail/             # TaskDetailPanel with inline status transitions
│   ├── task-modal/              # TaskModal, TaskForm, and FormField
│   ├── ConfirmDialog.tsx        # Reusable modal confirmation dialog
│   ├── DueDateIndicator.tsx     # Color-coded deadline chips
│   ├── StatusBadge.tsx          # Status tag badges
│   └── Toast.tsx                # Toast notification system
├── lib/
│   ├── supabase/                # Supabase SSR client utilities (server & browser)
│   └── types.ts                 # TypeScript interfaces and status types
├── supabase/migrations/         # PostgreSQL schema and RLS security migrations
└── proxy.ts                     # Next.js route proxy / middleware
```

---

## 7. Assumptions & Notable Decisions

### 1. Task Creation Constraint (Strict Lifecycle)
- **Decision:** Newly created tasks must strictly start in the **To Do** status. Direct creation of tasks in **In Progress** or **Done** is intentionally prohibited at both the UI layer (form dropdown restricted) and the API layer (`POST /api/tasks` always assigns `status: 'todo'`).
- **Rationale:** In real-world project workflows, work items must first be captured and defined in the backlog before being started or completed. Permitting direct creation in "Done" bypasses normal workflow integrity. Once created, users can advance tasks forward via drag-and-drop or explicit action buttons (*Mark as in progress*, *Mark as done*).

### 2. Full-Stack Architecture via Next.js App Router & Supabase RLS
- **Decision:** Implemented an embedded full-stack architecture using Next.js 16 App Router Route Handlers (`/api/tasks`) paired with Supabase PostgreSQL and Row Level Security (RLS), rather than maintaining a separate detached backend server.
- **Rationale:** 
  - Keeps the codebase unified, type-safe, and straightforward to run with a single `npm run dev` command.
  - Supabase PostgreSQL provides production-ready relational data persistence, and Row Level Security (RLS) ensures that task records are isolated strictly to their creator at the database engine level (`auth.uid() = user_id`), preventing cross-tenant data leaks regardless of API layer behavior.
