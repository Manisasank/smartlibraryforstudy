# Smart Library: Design System Rules & Tokens Specification

> Document standard conforming to Figma MCP Design System Rules, Code Connect, and Component Translation Guidelines.

---

## 1. Token Definitions

### 1.1 Color Palette & Semantics

| Token | CSS Variable | Hex / RGBA | Role / Usage |
| :--- | :--- | :--- | :--- |
| **Canvas Base** | `--bg-base` | `#070D18` | Global window background (Deep Obsidian Midnight) |
| **Surface Default** | `--bg-surface` | `rgba(13, 27, 42, 0.78)` | Main panels, section cards, glass containers |
| **Surface Elevated** | `--bg-surface-elevated` | `rgba(20, 35, 60, 0.88)` | Hover states, active dropdowns, dialogs |
| **Card Surface** | `--bg-card` | `rgba(15, 23, 42, 0.70)` | Grid cards, book items, HUD containers |
| **Card Hover** | `--bg-card-hover` | `rgba(24, 43, 73, 0.92)` | Card hover elevation with cyan rim-light |
| **Subtle Border** | `--border-subtle` | `rgba(56, 189, 248, 0.16)` | Card dividers, table lines, pill outlines |
| **Focus Border** | `--border-focus` | `rgba(56, 189, 248, 0.75)` | Input focus rings, selected cards |
| **Primary Accent** | `--accent-primary` | `#2563EB` | Flagship CTA, Primary action buttons |
| **Primary Gradient** | `--accent-gradient` | `linear-gradient(135deg, #2563EB 0%, #38BDF8 100%)` | Active pills, primary badges, headers |
| **Emerald Accent** | `--accent-emerald` | `#00C49F` | "Available" status badge, operational dots |
| **Sky Cyan Accent** | `--accent-cyan` | `#38BDF8` | Telemetry stats, ISBN codes, shelf radar text |
| **Amber Warning** | `--accent-amber` | `#F59E0B` | "Overdue" status badge, caution alerts |
| **Rose Error** | `--accent-rose` | `#EF4444` | Close buttons, fine alerts, error toast |
| **Text Primary** | `--text-main` | `#F8FAFC` | Primary headings, titles, active labels |
| **Text Secondary** | `--text-secondary`| `#E2E8F0` | Body copy, descriptions, table rows |
| **Text Muted** | `--text-muted` | `#94A3B8` | Metadata, subtitles, helper hints, labels |
| **Text Inverse** | `--text-inverse` | `#070D18` | Text on primary bright buttons |

### 1.2 Typography
- **Heading Font**: `Plus Jakarta Sans`, sans-serif (Weights: 600, 700, 800)
- **Body Font**: `Inter`, -apple-system, BlinkMacSystemFont, sans-serif (Weights: 400, 500, 600)
- **Code / Monospace**: `JetBrains Mono`, monospace (Weights: 500, 700) - Used for shelf coordinates (`FL-1 / AISLE-5 / RACK-D4`) and ISBNs.

### 1.3 Spacing, Radii & Shadows
- **Base Grid**: 4px base increment (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`)
- **Border Radii**:
  - Small: `6px` (`--radius-sm`)
  - Medium: `12px` (`--radius-md`)
  - Large: `18px` (`--radius-lg`)
  - Full / Pill: `9999px` (`--radius-full`)
- **Shadows**:
  - Soft: `0 4px 14px rgba(0, 0, 0, 0.35)`
  - Glass: `0 12px 36px -4px rgba(0, 0, 0, 0.55)`
  - Glow: `0 0 24px rgba(56, 189, 248, 0.30)`

---

## 2. Component Library

### 2.1 Buttons & Controls
- **Universal Reset**: ALL button tags MUST reset `background: none; color: inherit; border: none; font: inherit; outline: none;`. No browser default white backgrounds (`buttonface`) are ever allowed.
- **Primary CTA (`.btn-primary`)**:
  - Background: `linear-gradient(135deg, #2563EB 0%, #38BDF8 100%)`
  - Color: `#FFFFFF` (Font weight 700)
  - Hover: subtle upward translation `translateY(-2px)`, shadow glow `0 6px 20px rgba(37, 99, 235, 0.45)`
- **Glass Secondary (`.btn-glass`)**:
  - Background: `rgba(13, 27, 42, 0.70)`
  - Border: `1px solid rgba(56, 189, 248, 0.22)`
  - Color: `#F8FAFC`
- **Filter & View Pills (`.filter-pill`, `.mode-toggle-btn`)**:
  - Inactive: dark glass with subtle border, `#94A3B8`
  - Active: electric sapphire gradient with white bold text and cyan rim glow

### 2.2 Cards & Containers
- **Glass Surface**: `background: rgba(13, 27, 42, 0.78); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);`
- **Border**: `1px solid rgba(56, 189, 248, 0.16)`
- **Border Radius**: `18px`
- **Hover Motion**: Smooth elevation `translateY(-4px)` with box-shadow transition.

### 2.3 Status Badges
- **Available (`.badge-available`)**: Background `rgba(0, 196, 159, 0.15)`, text `#00C49F`, border `1px solid rgba(0, 196, 159, 0.3)`
- **Issued / Overdue (`.badge-issued`)**: Background `rgba(245, 158, 11, 0.15)`, text `#F59E0B`, border `1px solid rgba(245, 158, 11, 0.3)`

### 2.4 Shelf Coordinate Radar (`.shelf-locator-box`)
- Background: `rgba(15, 23, 42, 0.85)`
- Border: `1px dashed rgba(56, 189, 248, 0.35)`
- Font: `JetBrains Mono`, 0.8rem, `#38BDF8`
- Format: `FL-[Floor] / AISLE-[Aisle] / RACK-[Rack]`

---

## 3. Frameworks & Stacks
- **Frontend Core**: Vanilla ES6+ JavaScript, CSS3 custom properties, HTML5 Semantic Markup
- **3D Graphics Engine**: Three.js (r128), OrbitControls, GLTFLoader (Offline-first vendor cache)
- **Backend**: Python 3.12, Flask, SQLite3 / PostgreSQL compatible schema
- **Zero Heavy Runtime Bloat**: 0 external runtime node dependencies in browser execution.

---

## 4. Asset Management & Icon System
- **Icons**: Inline SVG vectors with `stroke="currentColor"` and `stroke-width="2"`, scaled via standard 16px, 20px, 24px bounding boxes.
- **Images & Covers**: High-density WebP / SVG fallback assets, responsive aspect ratios `1:1.45` for books.
- **3D Assets**: Local vendor caching in `static/vendor/` to allow 100% offline development.

---

## 5. Styling Approach
- Mobile-first responsive grid system (`1fr` on mobile, `repeat(2, 1fr)` on tablet, `repeat(3, 1fr)` or `repeat(4, 1fr)` on desktop).
- No CSS preprocessor dependencies (Pure native CSS variables for instant live reloading).
- High-contrast WCAG 2.1 AA compliant contrast ratios across all text and backgrounds.

---

## 6. Project Structure
```
smartlibraryforstudy/
├── DESIGN_REFERENCE.png       # Master UI blueprint (1536x1024)
├── DESIGN_SYSTEM_RULES.md     # This specification document
├── index.html                 # Complete Single Page Portal matching DESIGN_REFERENCE.png
├── app.css                    # Unified Dark Sapphire Design System Stylesheet
├── app.js                     # Interactive application logic & AI chat engine
├── library_3d.js              # Production 3D Virtual Campus & Bookshelf Pull-out Engine
├── test_student_library.cjs   # Automated 84-point regression suite
├── verify_3d_engine.cjs       # 32-point 3D engine physics & telemetry verification
├── static/
│   ├── css/                   # Flask server traditional styles
│   ├── images/                # Static social preview, icons, favicons
│   └── vendor/                # three.min.js, OrbitControls.js, GLTFLoader.js
└── templates/                 # Flask Jinja2 server-rendered templates
```
