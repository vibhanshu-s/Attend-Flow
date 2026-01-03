# Design Guidelines: Tuition Attendance System

## Design Approach
**Selected Framework**: Hybrid approach combining Material Design principles with modern productivity tool aesthetics (Linear, Notion, Vercel Dashboard)

**Rationale**: This is a data-intensive, multi-role management system requiring clarity, efficiency, and mobile-first design. Material Design provides robust component patterns while modern SaaS dashboards offer clean, scannable layouts perfect for educational administration.

## Typography System

**Font Family**: 
- Primary: Inter (via Google Fonts CDN)
- Monospace: JetBrains Mono (for IDs, numbers)

**Hierarchy**:
- Page titles: text-3xl font-bold
- Section headers: text-xl font-semibold
- Card titles: text-lg font-medium
- Body text: text-base font-normal
- Captions/metadata: text-sm font-normal
- Micro labels: text-xs font-medium uppercase tracking-wide

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 8, 12, 16** (e.g., p-4, gap-8, mt-12)

**Container Strategy**:
- Dashboard containers: max-w-7xl mx-auto
- Form containers: max-w-2xl mx-auto
- Card grids: gap-4 on mobile, gap-6 on desktop
- Section padding: py-8 on mobile, py-12 on desktop

**Grid Patterns**:
- Stats cards: grid-cols-1 md:grid-cols-3 lg:grid-cols-4
- Student lists: grid-cols-1 (tables on desktop)
- Batch cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

## Role-Specific Layouts

### Admin Dashboard
**Layout**: Sidebar navigation (collapsible on mobile) + main content area
- Sidebar: w-64 on desktop, drawer on mobile
- Navigation items: py-2 px-4 with icon + label
- Main area: p-4 md:p-8

**Key Sections**:
- Stats overview (4-column grid): Total teachers, batches, students, sessions
- Quick actions (prominent cards): Create Teacher, Create Batch, Create Student
- Recent activity feed
- System overview table

### Teacher Dashboard
**Layout**: Top navigation with batch selector + content area
- Batch selector: Prominent dropdown/tabs at top
- Context bar showing selected batch details
- Action buttons: Floating action button (mobile) / top-right buttons (desktop)

**Key Sections**:
- Session management: Calendar-style grid or list view
- Attendance marking: Student list with Present/Absent toggles
- Analytics dashboard: Cards showing % metrics + leaderboard table
- Heatmap visualization (reusable component)

### Guardian View
**Layout**: Single-column, mobile-optimized
- Student selector (if multiple): Segmented control at top
- Attendance percentage: Large prominent card with circular progress indicator
- Heatmap: Full-width scrollable grid

## Core Components

### Heatmap Component (Critical)
**Structure**:
- Grid layout: grid-cols-10 gap-1 (10 sessions per row)
- Each box: aspect-square rounded
- Size: w-8 h-8 on mobile, w-10 h-10 on desktop
- States: Present (filled), Absent (filled), Not marked (outline only)
- Interaction: Tooltip on hover/tap showing date, time, status
- Icons: Include small checkmark/x icons inside boxes for accessibility
- Legend: Always visible showing color meanings

### Attendance Marking Interface
**Design**: 
- List of students with large tap targets
- Each row: Student name + Present/Absent toggle switches
- Status indicator showing session state (DRAFT/FINALIZED/LOCKED)
- Bulk actions: "Mark All Present" / "Mark All Absent" buttons at top

### Form Components
**Consistent styling**:
- Input fields: p-3 rounded-lg border
- Labels: text-sm font-medium mb-2
- Field spacing: space-y-4
- Submit buttons: Prominent, full-width on mobile
- Multi-step forms: Progress indicator at top

### Cards & Containers
**Pattern**:
- All cards: rounded-xl p-6 shadow-sm border
- Card headers: Flex justify-between items-center mb-4
- Metric cards: Large number (text-4xl font-bold) + small label
- Action cards: Icon + title + description + button

### Tables (Desktop)
**Structure**:
- Sticky header row
- Alternating row pattern for readability
- Cell padding: px-4 py-3
- Sortable columns with icon indicators
- Action column: Right-aligned with icon buttons
- Mobile: Transform to card list

### Navigation
**Admin/Teacher**: 
- Desktop: Fixed sidebar with icons + labels
- Mobile: Bottom tab bar (4-5 items max) or hamburger menu

**Guardian**: 
- Minimal top bar with student selector
- No complex navigation needed

## Icons
**Library**: Heroicons (via CDN) - solid for filled states, outline for default

**Usage**:
- Navigation: 24px icons
- Action buttons: 20px icons
- Status indicators: 16px icons
- Use consistently across all role dashboards

## Interactive States
**Buttons**: 
- Primary actions: Large (py-3 px-6), rounded-lg
- Secondary: Outlined style
- Icon buttons: p-2 rounded-md
- Disabled: Reduced opacity (opacity-50)

**Form Controls**:
- Toggle switches for Present/Absent
- Radio buttons for student selection
- Dropdowns for batch selection
- Date pickers for session creation

## Mobile Optimization
**Critical patterns**:
- Bottom sheet modals for actions
- Swipe gestures for navigation
- Large touch targets (min 44px)
- Sticky headers/footers where needed
- Pull-to-refresh on list views
- Fixed action buttons (floating or bottom bar)

## Data Visualization
**Analytics Display**:
- Percentage: Circular progress (via SVG or library)
- Leaderboard: Ordered list with ranking badges
- Average stats: Large numbers in metric cards
- Session count: Simple numeric display with context

**Status Indicators**:
- DRAFT: Badge style
- FINALIZED: Badge style
- LOCKED: Badge with lock icon
- Use icons + text for clarity

## Responsive Breakpoints
- Mobile: < 768px (single column, stacked layouts)
- Tablet: 768px - 1024px (2-column grids)
- Desktop: > 1024px (full layouts with sidebars)

## Images
This application does not require hero images or decorative imagery. Focus is on functional UI with data visualization and clean information architecture.