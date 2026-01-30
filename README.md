# AD Club Website

A premium, modern, interactive college Ad Club website built with **Next.js 16**, **Tailwind CSS**, **Framer Motion**, and **Supabase**. Dark-first UI with optional light mode, social blog, events countdown, student value hub, gamification, and project showcase.

---

## Folder Structure

```
ad-club-website/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (ThemeProvider, Toaster, GlobalSearch)
│   ├── page.tsx            # Home page (all sections)
│   ├── about/              # About page
│   ├── blog/               # Public blog (feed + [id] post)
│   ├── events/             # Events page
│   ├── projects/           # Projects page
│   ├── team/               # Team page
│   ├── contact/            # Contact page
│   ├── admin/              # Admin dashboard (blog, events, analytics, etc.)
│   └── auth/               # Auth callback (Supabase)
├── components/
│   ├── home/               # Home page sections
│   │   ├── hero-section.tsx      # Hero with gradient, glow orbs, CTAs
│   │   ├── story-highlights.tsx  # Horizontal scroll highlights + modal
│   │   ├── about-preview.tsx     # About snippet
│   │   ├── blog-preview.tsx      # Latest 3 blog posts (server)
│   │   ├── events-countdown.tsx  # Next event countdown + timeline (server)
│   │   ├── countdown-display.tsx # Live countdown (client)
│   │   ├── what-we-do.tsx        # Services cards
│   │   ├── student-value-hub.tsx # Interview, roadmaps, tech bites, challenges
│   │   ├── gamification.tsx      # Badges (Writer, Designer, Mentor, Creator)
│   │   ├── project-showcase.tsx  # Project grid (server)
│   │   ├── project-showcase-grid.tsx # Project cards (client)
│   │   ├── highlights.tsx        # Stats (events, projects, members)
│   │   └── fab.tsx               # Scroll-to-top button
│   ├── navigation.tsx      # Sticky nav + theme toggle + search trigger
│   ├── footer.tsx          # Footer
│   ├── theme-provider.tsx  # next-themes wrapper
│   ├── theme-toggle.tsx    # Sun/Moon toggle
│   ├── global-search.tsx  # Cmd+K command palette
│   ├── admin/              # Admin UI components
│   └── ui/                 # Shadcn-style UI primitives
├── lib/
│   ├── supabase/           # Supabase client (browser, server, middleware)
│   ├── admin-context.tsx   # Admin state (auth, events, projects, etc.)
│   └── utils.ts
├── scripts/                # Supabase SQL (tables, RLS, storage)
└── public/                 # Static assets
```

---

## How to Customize Content

### Hero (headline, tagline, CTAs)

Edit **`components/home/hero-section.tsx`**:

- Change the headline text and gradient spans (`Creativity`, `Tech`).
- Update the tagline in the `<p>` below.
- Change CTA links: `Join the Club` → `/contact`, `Explore Our Work` → `/projects`.

### Story Highlights (Events, Wins, Workshops, Achievements)

Edit **`components/home/story-highlights.tsx`**:

- Update the `highlights` array: `id`, `title`, `caption`, `icon`, `date`.
- Add/remove items. Icons come from `lucide-react`.

### Student Value Hub (Interview, Placements, Tech Bites, etc.)

Edit **`components/home/student-value-hub.tsx`**:

- Update the `hubs` array: `title`, `description`, `href`, `cta`, `icon`.

### Gamification (badges)

Edit **`components/home/gamification.tsx`**:

- Change `badges` array: `label`, `icon`, `color` (Tailwind gradient classes).
- Replace “Leaderboard coming soon” with real data when you have a backend.

### Events & Projects

- **Events** come from Supabase table `events`. Manage in **Admin → Events** or edit SQL in `scripts/`.
- **Projects** come from Supabase table `projects`. Manage in **Admin → Projects**.

### Blog

- Blog posts are in Supabase `blog_posts`. Create/edit in **Admin → Blog**.
- Home shows latest 3 in **`components/home/blog-preview.tsx`** (server fetch).

### Theme (dark/light)

- Default theme is **dark** (set in `app/layout.tsx` via `ThemeProvider defaultTheme="dark"`).
- Toggle in the nav (Sun/Moon). User preference is stored by `next-themes`.

---

## How to Add New Sections

1. **Create a component** in `components/home/`, e.g. `my-section.tsx`.
2. **Export a named component** (server or client as needed).
3. **Import and render** in `app/page.tsx` in the order you want:

```tsx
import { MySection } from "@/components/home/my-section"

export default function HomePage() {
  return (
    <div>
      <Navigation />
      <main>
        <HeroSection />
        <MySection />  {/* add here */}
        …
      </main>
      <Footer />
      <FAB />
    </div>
  )
}
```

- Use **Framer Motion** (`motion.div`, `whileInView`, `viewport={{ once: true }}`) for scroll-in animations.
- Use **Tailwind** for layout and dark theme: `bg-card`, `border-border`, `text-foreground`, `text-muted-foreground`, `shadow-glow`.

---

## Running the Project

```bash
pnpm install
pnpm dev
```

Set **`.env.local`** with:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Run Supabase SQL scripts in order (see **SETUP_GUIDE.md**).

---

## Tech Stack

- **Next.js 16** (App Router)
- **Tailwind CSS 4**
- **Framer Motion** (animations)
- **Supabase** (auth, database, storage)
- **next-themes** (dark/light)
- **cmdk** (global search palette)
- **Radix UI** (dialogs, dropdowns, etc.)

---

## Design Notes

- **Dark-first**: Default is dark; light mode via toggle.
- **Micro-interactions**: Card hover lift (`hover:-translate-y-1`), `shadow-glow`, button focus rings.
- **Smooth transitions**: 200–300ms on buttons and cards.
- **Accessible**: Focus states, aria-labels, semantic HTML.
- **Mobile-first**: Responsive layout and touch targets.
