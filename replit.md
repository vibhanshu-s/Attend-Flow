# TuitionTrack - Attendance Management System

## Overview

TuitionTrack is a web-based tuition attendance management system designed for educational institutions. It provides session-based attendance tracking with visual analytics (heatmaps and percentages), supporting three distinct user roles: Admin (system owner who manages teachers, batches, and students), Teacher (marks and manages attendance for assigned batches), and Guardian (views their children's attendance records). The application is built as a mobile-first, responsive web app compatible with both mobile devices and desktop computers.

## Recent Changes (January 2026)
- Complete implementation of all three user role dashboards
- Session-based attendance with PRESENT/ABSENT toggle buttons
- **Teacher login simplified**: No password required, uses dropdown selection with Name + Teacher ID
- **12-hour edit window**: Sessions can be edited for 12 hours after publishing, then auto-lock
- **Heatmap updated**: 50 blocks in 5 rows x 10 columns layout
- **Leaderboard**: Shows results immediately with no minimum session requirement
- Fixed authentication flow with localStorage persistence and protected routes
- All CRUD operations functional via in-memory storage with explicit data filtering

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, React Context for auth and theme
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens for colors, spacing, and typography
- **Design System**: Hybrid approach combining Material Design principles with modern SaaS aesthetics (Linear, Notion style)

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript throughout
- **API Pattern**: RESTful JSON APIs under `/api` prefix
- **Build System**: esbuild for server bundling, Vite for client

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Defined in `shared/schema.ts` with Zod validation via drizzle-zod
- **Migrations**: Managed via drizzle-kit with `db:push` command

### Authentication Pattern
- Role-based access control with three roles: admin, teacher, guardian
- Client-side auth state stored in localStorage via AuthContext
- Protected routes redirect unauthenticated users to login pages
- Separate login flows for each role type

### Project Structure
```
client/           # React frontend application
  src/
    components/   # Reusable UI components
    pages/        # Route-specific page components
    lib/          # Utilities, contexts, query client
    hooks/        # Custom React hooks
server/           # Express backend
  index.ts        # Server entry point
  routes.ts       # API route definitions
  storage.ts      # Data access layer interface
shared/           # Shared code between client/server
  schema.ts       # Database schema and types
```

### Key Data Models
- **Admins**: System owners who manage all entities
- **Teachers**: Assigned to multiple batches, can create sessions and mark attendance
- **Batches**: Groups of students assigned to a teacher
- **Students**: Belong to one batch, linked to guardian via mobile number
- **Sessions**: Individual class sessions with status (DRAFT/FINALIZED/LOCKED)
- **Attendance**: Per-student attendance records (PRESENT/ABSENT/NOT_MARKED)

## External Dependencies

### Database
- PostgreSQL (configured via `DATABASE_URL` environment variable)
- Drizzle ORM for database operations
- connect-pg-simple for session storage

### UI Libraries
- Radix UI primitives (dialogs, dropdowns, forms, etc.)
- Tailwind CSS for styling
- Lucide React for icons
- date-fns for date manipulation
- embla-carousel-react for carousels
- recharts for chart components
- react-day-picker for calendar widgets

### Build Tools
- Vite with React plugin
- esbuild for server bundling
- TypeScript for type checking

### Fonts
- Inter (primary font via Google Fonts)
- JetBrains Mono (monospace for IDs and numbers)