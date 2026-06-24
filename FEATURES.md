# QuickQuid MVP — Full Feature Listing
> Compiled from build session · June 2026  
> Live: https://quickquid-mvp.vercel.app  
> Repo: https://github.com/sabari-nath17/quickquid-mvp

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@quickquid.com | admin123! |
| Worker — Jane Smith (PRO) | jane@dev.com | worker123! |
| Worker — Arjun Nair (ELITE) | arjun@design.com | worker123! |
| Worker — Priya Menon (PRO) | priya@write.com | worker123! |
| Worker — Kiran Dev (BASIC) | kiran@mobile.com | worker123! |
| Client — Acme Corp | acme@company.com | client123! |

> **To activate demo data:** Sign in as Admin → Oversight → click **Load Demo Data**

---

## ✅ Features Built & Working

### Authentication
- Email + password sign-up with role selection (Worker or Client)
- Email + password sign-in
- Role-based redirect on login (Worker → dashboard, Client → dashboard, Admin → dashboard)
- Cookie-based session (`qq_session`, 7-day, HttpOnly)
- Sign out
- Account suspension by admin (takes effect instantly, suspended = logged out everywhere)
- Referral code captured on sign-up via `?ref=<code>` URL param

---

### Navigation
- Sticky top navbar with role-aware links
- **Worker top nav:** Dashboard · Find Jobs · My Services · Network
- **Worker profile dropdown:** My Profile · Portfolio · Credentials · Sandbox · Applications · Refer & Earn · Sign out
- **Client top nav:** Dashboard · Catalog · Orders · Merit Board · Browse Talent · Post a Job
- **Admin top nav:** Dashboard · Oversight · Triage · Matchmaking · Applications · Squads · Standby · Jobs
- Profile avatar photo shown in navbar button and dropdown header
- Admin badge displayed in navbar when signed in as Admin
- QuickQuid logo (Blue.png) in navbar, sign-in, and sign-up pages

---

### Public Pages
- Landing page (`/`) with split Worker / Client paths, trust ticker, earnings calculator, how-it-works, CTA buttons
- Service package detail page (`/catalog/[packageId]`) — visible to anyone; clients can order, guests see sign-in CTA
- Public job detail page (`/jobs/[jobId]`)
- Public worker profile page (`/worker/profile/[workerId]`) — full profile visible to clients

---

### Worker — Dashboard (`/worker/dashboard`)
- Stats grid: Sandbox Score, Fill Rate, Introductions, Hours Logged, Client Rating
- Application status card with verification badges (KYC Verified, Skill Verified, Squad Vouched)
- Tier Ladder display (BASIC → PRO → ELITE)
- Earnings Tracker — Total Approved, Commission Due (8%), Take-Home (92%)
- Recent Job Applications with status badges
- Active Introductions with milestones summary and contract links
- Promo banner to create service packages

---

### Worker — Find Jobs (`/worker/jobs`)
- Job board with keyword search
- Collar-type filter: All / White (Digital) / Grey (Field-Tech) / Blue (On-Site)
- Advanced filters: experience level, payment type, sort by budget
- Skill match percentage displayed per job
- Already-applied indicator
- Apply modal: cover letter, proposed rate, estimated days, attach portfolio
- Verification gate — unverified workers can browse but cannot apply

---

### Worker — My Services (`/worker/services`)
- List own service packages with active/hidden status, price range, order count
- Incoming Orders section (pending orders from clients) with tier selection, fast-track fee, requirements
- Toggle package visibility (live / hidden)
- Link to create new package

### Worker — Create Service Package (`/worker/services/new`)
- Package creation form: title, description, category, skills
- Up to 3 tiers (Basic / Standard / Premium) each with price, delivery days, revisions, description, features list
- Draft allowed when unverified; publishes after admin verification

---

### Worker — Portfolio (profile dropdown → `/worker/portfolio`)
- Add portfolio projects: title, role, description, skills, project URL
- Portfolio grid view
- Delete projects
- Portfolio projects attachable to job applications

---

### Worker — Credentials (profile dropdown → `/worker/credentials`)
- Employment History: company, title, dates, current-role flag, description
- Education: institution, degree, field of study, years
- Certifications: name, provider, year, credential URL
- Languages: name + proficiency level (Native, Fluent, Conversational, Basic)
- Full CRUD (add / view / delete) for all four sections
- Link to public profile view

---

### Worker — Applications (profile dropdown → `/worker/applications`)
- All job applications listed with status: PENDING, SHORTLISTED, REJECTED, HIRED
- Direct link to contract page when hired

---

### Worker — Profile / Onboarding (profile dropdown → `/worker/onboarding`)
- Create and update worker profile
- Core fields: LinkedIn URL, portfolio URLs, skills, bio, experience text
- Extended fields: title, hourly rate, location, timezone, availability status, weekly availability, open to contract-hire, response time
- Avatar upload (requires Supabase `avatars` bucket)
- Shows current application status and admin notes

---

### Worker — Sandbox (profile dropdown → `/worker/sandbox`)
- Browse skill challenges by category
- Take a challenge (MCQ + open text questions)
- Retake previously attempted challenges
- Best score displayed (/100)
- Skill Verified badge awarded automatically at score ≥ 70
- Challenges cover: React Component Architecture, UI/UX Design Principles, Content Strategy & SEO

---

### Worker — Refer & Earn (profile dropdown → `/worker/referrals`)
- Unique referral link with copy-to-clipboard
- Stats: total people referred, freelancers joined
- Referral list with user names, roles, join dates

---

### Worker — Network (top nav → `/worker/network`)
- Browse public sub-jobs posted by lead freelancers on active contracts
- Sub-job cards: title, description, skills, budget, applicant count, skill match badge
- Apply to sub-jobs
- Already-applied indicator
- Cannot self-apply to own sub-job

---

### Worker — Contract (`/worker/contract/[connectionId]`)
- Contract overview: job title, connection status, start date, total value
- Milestone tracker with all milestones and their statuses
- Submit work (preview or final) with file URL and description
- Post sub-jobs for sub-contracting work
- Sub-job applicant list with hire/reject per applicant
- Earnings breakdown (92% take-home after 8% platform fee)
- Link to contract chat

---

### Worker — Public Profile (`/worker/profile/[workerId]`)
- Header: avatar photo, name, verified badge, tier, availability status
- Lifetime stats: total earned, contracts completed, hours logged
- About section: bio + experience text
- Employment History with company, title, dates, descriptions
- Portfolio projects grid with images and external links
- Education & Certifications side-by-side
- Client Reviews with star ratings and comments
- Work Preferences sidebar: weekly availability, contract-to-hire flag, response time
- Verifications sidebar: ID, Phone, Admin Review
- Languages sidebar with proficiency levels
- Rating Breakdown sidebar (quality, communication, professionalism, reliability, flexibility)
- Skills as pills, external links (portfolio URLs, LinkedIn)
- Member since date, sandbox score trophy

---

### Worker — Squads (`/worker/squads`)
- View my squads (lead and member roles)
- Invite verified workers by email (lead-only)
- Discover squads (shown to workers not yet in one)
- Squad cards with member info and reputation score

---

### Worker — Perks (`/worker/perks`)
- Browse partner merchant offers
- Offer cards: merchant name, discount %, category, description, address
- QR code redemption page per offer
- Redemption tracked idempotently (once per worker per offer)
- Unverified users see a warning but can still browse

---

### Client — Dashboard (`/client/dashboard`)
- Welcome header with name
- Stats: Jobs Posted, Introductions
- Active Contracts with chat and contract links
- Recent Introductions — worker cards with skills and intro date
- Project Continuity / Standby Bench per active contract (pre-verified backup workers)
- Book Briefing CTA
- Post a Job button

---

### Client — Catalog (`/client/catalog`)
- Browse all active service packages
- Keyword search + category filter
- Price range, delivery days, worker tier (BASIC / PRO / ELITE) filters
- Sort: by rating, price ascending/descending, fastest delivery
- Package cards: cover image, category, title, worker avatar, star rating, tier badge, price
- Lightning bolt badge for packages with ≤1 day delivery
- Link to full package detail page

### Client — Package Detail (`/catalog/[packageId]`)
- Title, category, description, skill pills
- Worker profile link with verified badge, star rating, review count
- Tier comparison table (Basic / Standard / Premium): price, delivery, revisions, features
- Recent reviews with ratings and comments
- Order panel (right sidebar): choose tier, add fast-track, add requirements, place order

---

### Client — Orders (`/client/orders`)
- All placed service orders
- Status tracking: PENDING → ACCEPTED → IN_PROGRESS → DELIVERED → COMPLETED / DECLINED / CANCELLED
- Tier name, worker name, order date, price (including fast-track fee)
- Link to contract when connection exists

---

### Client — Merit Board (`/client/board`)
- **Blind Evaluation section:** anonymous candidate cards ranked by sandbox score — no names or identifiable info shown
- Candidate cards: candidate code, sandbox score, skills, fill rate, hours trained, verification badges
- **Introduced Talent section:** workers revealed by admin, full details unlocked
- Ranked by sandbox score then creation date

---

### Client — Browse Talent (`/client/talent`)
- All workers introduced to this client, grouped by job
- Contact details unlocked for introduced workers (name, bio, skills, LinkedIn, portfolio URLs)
- Match count per job

---

### Client — Post a Job (`/client/post-job`)
- Job form: title, description, required skills, nice-to-have skills, category, collar type, payment type, experience level, project type, duration, weekly hours, freelancers needed, preferred qualifications, budget range, timeline
- Previous jobs listed with intro count badge and skill tags

### Client — Applicants (`/client/jobs/[jobId]/applicants`)
- Applicant cards: avatar, name, status badge, verification indicator
- Worker title, skill tags, skill match % highlighted
- Proposed rate, estimated days, availability hours
- Cover letter excerpt
- Attached portfolio projects grid
- SHORTLIST / REJECT / HIRE actions per applicant

---

### Client — Contract (`/client/contract/[connectionId]`)
- Contract overview with worker name, job title, intro date, total value
- Approve work submissions (file URL hidden until client approves)
- Milestone tracker
- Fee Transparency widget: gross amount, platform fee (8%), net to worker
- Leave a review: star rating, sub-ratings (quality, communication, professionalism, reliability, flexibility), comment
- Chat link

---

### Admin — Dashboard (`/admin/dashboard`)
- Key metrics: Pending Review, Verified Workers, Active Jobs, Total Matches, Introductions
- Quick-action cards to Triage and Matchmaking with live counts

---

### Admin — Oversight (`/admin/oversight`)
- 11-metric platform stats grid: Users, Workers, Jobs, Applications, Orders, Packages, Messages, Submissions, Sub-jobs, Reviews, Introductions
- **Users:** suspend / unsuspend (takes effect instantly)
- **Service Packages:** toggle visibility live / hidden
- **Service Orders:** status tracking, cancel non-completed orders
- **Messages:** read all platform conversations (read-only)
- **Reviews:** remove abusive or fraudulent reviews
- **Work Submissions:** view preview and approval status
- **Sub-Jobs:** view with applicant counts
- **Load Demo Data** button — seeds all workers, client, jobs, packages, connections, milestones, messages, portfolio, credentials, sandbox submissions, applications, review, commission ledger, sub-job, standby assignments, merchant offers, squad
- **Clear Demo Data** button — removes all demo records cleanly

---

### Admin — Triage (`/admin/triage`)
- Queue of pending worker applications with tabs: PENDING / VERIFIED / REJECTED
- Worker row: avatar, name, email, status, skills, LinkedIn, portfolio links
- Bio and experience text
- Verification notes
- Applied date
- APPROVE / REJECT actions (with optional notes)
- Pending count badge

---

### Admin — Matchmaking (`/admin/matchmaking`)
- Create match: select verified worker + job requirement
- Introduce worker to client (reveals identity, sets `introducedAt` timestamp)
- Awaiting Introduction queue
- All Introductions Made list with date and admin name
- Link to monitor messages per connection

---

### Admin — Applications (`/admin/applications`)
- All job applications across platform
- Stats: Total Applications, Messages Sent, Work Submissions
- Update application status: SHORTLIST / REJECT / HIRE

---

### Admin — Squads (`/admin/squads`)
- All squads sorted by reputation score
- Squad member breakdown per squad

---

### Admin — Standby Bench (`/admin/standby`)
- Standby bench per active job
- Add available verified workers to standby
- Worker standby status display: AVAILABLE / BUSY / OFFLINE with fill rate
- Trigger replacement button (< 2-hour emergency replacement)

---

### Admin — Jobs (`/admin/jobs`)
- All posted jobs (ingestion stream)
- Filter by geofence ring: ALL / CORE / TRANSIT / CLOUD
- Job cards: title, geofence badge, match count, client, budget, timeline, skills
- Match Worker button → routes to Matchmaking

---

### Messaging (`/messages/[connectionId]`)
- Worker ↔ Client messaging per contract connection
- Message bubbles (sent = primary colour, received = muted)
- Sender name + timestamp on every message
- Message input + send
- Admin can read all conversations (read-only; cannot send)

---

### Demo Data (seeded by Load Demo Data)
- 4 demo workers (Jane PRO, Arjun ELITE, Priya PRO, Kiran BASIC) with avatar photos
- 1 demo client (Acme Corp) with avatar photo
- 3 service packages (React Dashboard, Brand Identity, SEO Content) with 3 tiers each
- 2 jobs (React Dashboard, Café Brand Identity)
- 1 active contract (Jane ↔ Acme, job 1)
- 1 blind candidate connection (Arjun ↔ job 2, for Merit Board)
- 3 milestones (APPROVED / DELIVERED / PENDING) with commission ledger for approved milestone
- 6 chat messages in the Jane–Acme thread
- 1 work submission (wireframe preview, approved)
- 1 review (5★ from Acme for Jane)
- 5 portfolio projects (Jane ×2, Arjun ×2, Priya ×1)
- 5 employment history records
- 3 education records
- 3 certification records
- Languages for all 3 main workers
- 3 sandbox submissions for Jane (scores 96, 88, 72)
- 3 job applications (Jane hired on job1, Arjun pending on job2, Kiran pending on job1)
- 1 sub-job posted by Jane (Frontend Testing & QA)
- 2 standby assignments (Arjun on job1, Priya on job2)
- 1 squad (Kochi Creatives — Jane lead, Arjun member, Priya contributor)
- 3 sandbox challenges (React, UI/UX, Content & SEO)
- 3 merchant offers (Café Arabica 15%, Print Zone 20%, FitSpace Gym free month)
- Kiran's referral linked to Jane

---

## 🚫 Features Excluded / Not Built

| Feature | Status |
|---------|--------|
| Real-time messaging (WebSocket / polling) | Not built — page-level only, manual refresh required |
| Push notifications / email notifications | Not built |
| Password reset / forgot password | Not built |
| OAuth / social login (Google, GitHub etc.) | Not built |
| Email verification on sign-up | Not built |
| Two-factor authentication | Not built |
| Automatic tier advancement (BASIC → PRO → ELITE) | Not built — admin sets tier manually |
| KYC / ID document upload | Not built — admin manually ticks `idVerified` |
| Geolocation-based job matching | Not built — geofence ring is display-only |
| Admin CMS for sandbox challenges | Not built — challenges seeded via code only |
| AI / auto-grading of text answers in sandbox | Not built — text stored but not graded |
| Admin CMS for merchant offers | Not built — offers seeded via code only |
| Commission reconciliation UI for admin | Not built — ledger exists in DB but no admin page |
| Sub-job payment / milestone tracking | Not built — budget field shown, no financial flow |
| Referral reward payout | Not built — referrals tracked, rewards not implemented |
| Contract-to-hire conversion workflow | Not built — `openToContractHire` field exists only |
| Client self-cancel order | Not built — admin-only cancel |
| Unread message count in navbar | Not built |
| Invoice / receipt generation | Not built |
| Automated payment integration (Razorpay / Stripe) | Not built — honour system (manual UPI) |
| Squad creation form (`/worker/squads/new`) | Partial — route exists, form not fully wired |
| Credential verification by admin (individual items) | Not built — admin verifies worker overall, not per credential |
| Search / filter in Browse Talent | Not built — read-only list |
| Admin squad management (create / edit from admin) | Not built — squad management is worker-side only |

---

## ⚙️ Partially Built

| Feature | What Works | What's Missing |
|---------|-----------|---------------|
| File uploads (avatar, portfolio, package cover) | ImageUpload component present | Supabase Storage buckets (`avatars`, `portfolios`, `packages`) must be created manually |
| Compliance tracker (client contract) | Component rendered | Full compliance logic partial |
| Standby trigger replacement | Button present | Backend replacement action needs refinement |
| Geofence matching | Ring displayed on jobs and filter exists | Not enforced by actual location |
| Squad creation | View squads, invite members | `/worker/squads/new` form not fully wired |

---

## Supabase Storage — Manual Setup Required

Three public buckets must be created in Supabase Dashboard → Storage → New Bucket:

| Bucket Name | Used For |
|-------------|----------|
| `avatars` | Worker and user avatar photos |
| `portfolios` | Portfolio project images |
| `packages` | Service package cover images |

All three should be set to **Public**.

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.9 (App Router, Turbopack) |
| UI Runtime | React 19.2.4 |
| Styling | Tailwind v4 · OKLCH colour tokens |
| Components | shadcn/ui 4.11.0 · Base UI 1.6.0 |
| Forms | React Hook Form 7.80.0 + Zod v4 |
| ORM | Prisma v7.8.0 with `@prisma/adapter-pg` |
| Database | Supabase PostgreSQL (Mumbai, AWS) |
| File Storage | Supabase Storage |
| Auth | Custom cookie session (HttpOnly, 7-day) |
| Hosting | Vercel |
| Language | TypeScript 5 (strict mode) |
| Icons | Lucide React |
| Toasts | Sonner |
| Fonts | Lexend (headings) · Source Sans 3 (body) |
