# Changelog

All notable changes to @ghxstship/ui will be documented in this file.

## [2.0.0] - 2025-10-07

### 🎉 Major Release - Complete Rebuild

Complete architectural rebuild of the UI package following Apple HIG 2030 standards.

### ✨ Added

**Core System:**
- Complete design token system (6 categories)
- Multi-tier theme engine (4 brand tiers)
- Theme provider with auto-detection
- WCAG 2.2 AA+ color system

**Layout System:**
- AppShell orchestration component
- Header, Sidebar, Drawer, Footer
- Breadcrumb navigation
- Command Palette (Cmd+K)
- Workspace Switcher

**Data Views:**
- GridView (spreadsheet)
- KanbanView (boards)
- ListView (lists)
- CalendarView (events)
- CardView (gallery)
- GanttView (timeline)
- DashboardView (KPIs)
- DetailView (records)
- FormView (forms)
- AssetView (media)
- MapView (geospatial)
- WorkloadView (resources)

**Atomic Components:**
- 18 Atoms: Button, Input, Badge, Avatar, Checkbox, Radio, Switch, Select, Textarea, Label, Skeleton, Spinner, Progress, Separator, Tag, Link, Kbd, Code
- 12 Molecules: Card, Alert, Dialog, Tooltip, Tabs, Accordion, Dropdown, Pagination, Toast, Popover, EmptyState, Modal
- 12 Organisms: DataTable, Form, Navigation, Timeline, SearchBar, FileManager, TreeView, Stepper, NotificationCenter, CodeBlock, ImageGallery, Stats

**Infrastructure:**
- Templates: ErrorPage, LoadingPage
- Utilities: format, validation, cn
- Hooks: useLocalStorage, useMediaQuery, useDebounce, useCopyToClipboard, useToggle, useClickOutside, useIntersectionObserver, useAsync, useWindowSize, usePrevious

### 🔄 Changed

- Complete redesign following Apple HIG 2030
- Migrated from legacy architecture to atomic design
- Updated all components with accessibility improvements
- Improved TypeScript types throughout
- Enhanced theme system with multi-tier support

### 🗑️ Removed

- 390 legacy files and components
- Outdated design patterns
- Legacy theme system

### 📚 Documentation

- Comprehensive README.md
- Complete TypeScript type definitions
- Inline component documentation

---

## [1.x.x] - Legacy

Previous versions (deprecated).

---

**Legend:**
- ✨ Added - New features
- 🔄 Changed - Changes in existing functionality
- 🗑️ Removed - Removed features
- 🐛 Fixed - Bug fixes
- 📚 Documentation - Documentation updates
- 🔒 Security - Security updates
