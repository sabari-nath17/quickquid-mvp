---
name: QuickQuid
description: Human-verified talent introductions for vetted freelancers and business clients
colors:
  authority-blue: "oklch(0.45 0.18 250)"
  canvas-white: "oklch(0.99 0.002 220)"
  ink-navy: "oklch(0.13 0.04 240)"
  surface-white: "oklch(1 0 0)"
  silver-mist: "oklch(0.96 0.005 220)"
  cool-border: "oklch(0.9 0.01 220)"
  muted-ink: "oklch(0.5 0.04 240)"
  secondary-slate: "oklch(0.95 0.01 220)"
  destructive-red: "oklch(0.577 0.245 27.325)"
typography:
  display:
    fontFamily: "Lexend, system-ui, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Lexend, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Lexend, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Source Sans 3, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.04em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  2xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.authority-blue}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.md}"
    padding: "10px 24px"
  button-primary-hover:
    backgroundColor: "oklch(0.38 0.18 250)"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.md}"
    padding: "10px 24px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.authority-blue}"
    rounded: "{rounded.md}"
    padding: "10px 24px"
  button-ghost-hover:
    backgroundColor: "{colors.secondary-slate}"
    textColor: "{colors.authority-blue}"
    rounded: "{rounded.md}"
    padding: "10px 24px"
  card:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.lg}"
    padding: "24px"
  verified-badge:
    backgroundColor: "oklch(0.95 0.06 240)"
    textColor: "oklch(0.35 0.12 240)"
    rounded: "{rounded.full}"
    padding: "2px 8px"
---

# Design System: QuickQuid

## 1. Overview

**Creative North Star: "The Trusted Introducer"**

QuickQuid's visual system is built around the moment of introduction — a deliberate, human act that carries real weight. The interface should feel premium but personal, like a discreet referral from someone whose judgment you trust — not a self-serve marketplace, never a gig economy feed. Every surface communicates care and curation. If a screen feels like it could exist on Fiverr or a generic SaaS dashboard, it has failed.

The palette is cool blue-on-white with an almost monastic restraint: one authoritative blue, a clean canvas background, and a deep ink for text. Typography is precise and unhurried. Cards lift very gently off the page. The "Introduce" action — the product's most critical moment — gets ceremony: an amber warning, plain language, and no accidental trigger path.

This system explicitly rejects: the startup-bro aesthetic (no purple gradients, no bold "disrupting X" copy, no crypto-adjacent visual flourishes); the LinkedIn clone energy (no connection-count badges, no resume walls, no algorithm-feed noise); and the government/legacy dashboard look (no gray data tables, no 10px dense labels, no clunky modal flows).

**Key Characteristics:**
- Blue-and-white, calm authority — never loud or busy
- Whitespace as a trust signal: what isn't there matters as much as what is
- Verified states and admin decisions are visually distinct and given appropriate weight
- Role-appropriate context: each user sees only what's theirs
- One primary action per screen, never competing with secondary noise

## 2. Colors: The Authority Palette

A single trusted blue against a clean white canvas. Color is rationed, not scattered — the primary accent is reserved for actions that matter.

### Primary
- **Authority Blue** (`oklch(0.45 0.18 250)`): The product's voice. Used for primary buttons, active nav states, links, the verified badge border, the logo mark, and focus rings. At 45% lightness and medium chroma, it reads as confident and credible without shouting.

### Neutral
- **Canvas White** (`oklch(0.99 0.002 220)`): The page background. A hair cooler than pure white — reduces eye strain on dense admin views without looking "tinted".
- **Surface White** (`oklch(1 0 0)`): Cards, dialogs, and popover surfaces. Slightly brighter than the canvas, giving cards a clean lift without needing a shadow at rest.
- **Ink Navy** (`oklch(0.13 0.04 240)`): Primary body text. Deep enough for 4.5:1 contrast against canvas white everywhere it appears.
- **Muted Ink** (`oklch(0.5 0.04 240)`): Secondary text, captions, metadata. Still reads clearly; never gray-on-gray.
- **Silver Mist** (`oklch(0.96 0.005 220)`): Input backgrounds, muted sections, code blocks. Barely distinguishable from canvas — serves to group, not to decorate.
- **Secondary Slate** (`oklch(0.95 0.01 220)`): Ghost button hover backgrounds, secondary chips, tag surfaces.
- **Cool Border** (`oklch(0.9 0.01 220)`): Dividers, input strokes, card borders (when used). Always one step above the surface it borders.
- **Destructive Red** (`oklch(0.577 0.245 27.325)`): Error states, reject actions, permanent-deletion confirmations. Never used decoratively.

### Named Rules
**The One Blue Rule.** Authority Blue appears on ≤15% of any given screen. Its scarcity is the point — when it shows up, the user knows it matters. Do not tint backgrounds, section headers, or card fills with it.

**The Amber Exception.** The "Introduce" confirmation dialog is the only place an amber/warning color enters the system. This surface carries the irreversibility warning. Amber here is earned by context — never use it for generic callouts.

## 3. Typography

**Display Font:** Lexend (geometric humanist sans, weights 300–700)
**Body Font:** Source Sans 3 (humanist sans, weights 300–700)

**Character:** Lexend's wide letterforms and open apertures signal clarity and competence; Source Sans 3's warmth in the body text keeps the product feeling human rather than corporate. Together they span the full register from bold admin dashboard headings to readable multi-paragraph worker bios without visual conflict.

### Hierarchy
- **Display** (700, `clamp(2rem, 5vw, 3.5rem)`, lh 1.1, ls −0.02em): Hero headings on the landing page only. Cap at 3.5rem.
- **Headline** (600, 1.5rem / 24px, lh 1.25, ls −0.01em): Page titles, dialog headings, section headers in dashboards.
- **Title** (600, 1.125rem / 18px, lh 1.4): Card headings, widget titles, table section labels.
- **Body** (400, 1rem / 16px, lh 1.6): All prose content. Worker bios, job descriptions, admin notes. Max line length 65–75ch.
- **Label** (500, 0.75rem / 12px, lh 1.2, ls +0.04em): Status badges, metadata chips, table column headers, navigation link labels. All-caps sparingly for table headers only.

### Named Rules
**The Lexend-for-Structure Rule.** Lexend appears only in headings (`h1`–`h6`), the logo mark, nav labels, and the `.font-heading` utility. Source Sans 3 handles all body, form labels, helper text, and button labels. Do not swap them.

**The Minimum 16px Body Rule.** Body font size is never below 16px in any breakpoint. Muted/caption text floor is 12px with a minimum muted-ink color — never gray-on-gray.

## 4. Elevation

Cards and surfaces use a subtle ambient lift at rest, deepening slightly on hover. No layered or theatrical shadow vocabulary — this is not a card-stacking interface.

### Shadow Vocabulary
- **At rest** (`0 1px 3px rgba(0, 0, 0, 0.07), 0 1px 2px rgba(0, 0, 0, 0.04)`): Applied to all interactive cards (worker cards, job cards, stat widgets). Barely perceptible — differentiates card from canvas without visual weight.
- **On hover** (`0 4px 12px rgba(0, 0, 0, 0.10), 0 2px 4px rgba(0, 0, 0, 0.06)`): Applied to cards with the `.card-hover` utility on pointer entry. Communicates interactive response. Paired with `translateY(-2px)`.
- **Modal / Dialog** (`0 20px 60px rgba(0, 0, 0, 0.15)`): Backdrop plus shadow for dialogs and alert dialogs. The backdrop blur signals modal context.
- **Popover / Dropdown** (`0 8px 24px rgba(0, 0, 0, 0.12)`): Dropdown menus, tooltips, popovers.

### Named Rules
**The Flat-By-Default Rule.** Non-interactive surfaces — page backgrounds, section dividers, admin layout panels, navigation — are completely flat. Shadows appear only in response to state (interactive card, modal, focused popover). Never apply a shadow just to add visual "interest".

## 5. Components

### Buttons
The primary action is unambiguous. Secondary and ghost variants step back without disappearing.

- **Shape:** Gently rounded (10px / `rounded-md`). Never pill-shaped for primary actions; full-radius only for badges and status chips.
- **Primary:** Authority Blue background (`oklch(0.45 0.18 250)`), white text, 10px/24px padding. On hover: darkens to `oklch(0.38 0.18 250)`, 200ms ease-out transition.
- **Ghost:** Transparent background, Authority Blue text. On hover: Secondary Slate fill. Used for secondary-priority actions alongside a primary button.
- **Destructive:** Destructive Red background, white text. Same shape. Used only for reject/delete paths. Never adjacent to a primary blue button without a visual separator.
- **Disabled:** 40% opacity, `cursor-not-allowed`. No hover state. Includes semantic `disabled` attribute.
- **Loading:** Button text replaced by a spinner (16px) during async operations. Width is preserved via explicit sizing to prevent layout shift.

### Verified Badge
The trust signal. Appears on verified worker cards and in the admin triage view.

- Light blue background (`oklch(0.95 0.06 240)`), darker blue text (`oklch(0.35 0.12 240)`), thin blue border
- Full-radius pill, 2px/8px padding, 12px label-weight text
- Paired with a `ShieldCheck` icon (14px). Never text-only.

### Cards / Containers
- **Corner Style:** 14px radius (`rounded-lg`). Consistent across all cards.
- **Background:** Surface White — one step above Canvas White.
- **Shadow:** At-rest ambient shadow; `.card-hover` deepens it on pointer-enter.
- **Border:** Optional `1px solid Cool Border` on cards that need visual separation from a white page section. Skip on cards that already have shadow.
- **Internal Padding:** 24px (`spacing.lg`) uniform. Admin-dense views may compress to 16px per card row.

### Inputs / Fields
- **Style:** Silver Mist background, Cool Border stroke (1px), 10px radius. Avoids the "white box on white page" invisibility problem.
- **Focus:** Authority Blue ring (`box-shadow: 0 0 0 2px oklch(0.45 0.18 250 / 0.25)`). 150ms ease-out. Border brightens to Authority Blue on focus.
- **Error:** Destructive Red border, red helper text below the field. Never an icon inside the field — the message is clearest below.
- **Disabled:** 50% opacity, Silver Mist background, `cursor-not-allowed`.
- **Labels:** Always visible above the field. Never placeholder-only labels.

### Navigation
- **Desktop:** Sticky top bar, `bg-white/95 backdrop-blur`, bottom border in Cool Border. Logo left, nav links center (hidden <768px), user dropdown right.
- **Link states:** Default `muted-ink`, hover `ink-navy` with a `secondary-slate` background pill. Active is implied by destination — no underline decoration.
- **Role badges:** Admin role shows a `ShieldCheck` + "Admin" outlined badge in Authority Blue. Worker and Client roles have no badge.
- **Mobile:** Nav links collapse into the user dropdown menu. No hamburger — the dropdown carries both account and navigation links.

### The Introduce Action (Signature Component)
The product's most critical surface. Gets ceremonial treatment that no other action receives.

- Triggered by a small "Introduce" button with a `Zap` icon (never a plain text link).
- Opens an `AlertDialog` (not a `Dialog`) with an amber `AlertTriangle` icon at the top.
- Title: "This action is irreversible" in headline weight.
- Body: Three bullet points naming what unlocks, that it cannot be revoked, and that it is logged.
- An amber-highlighted callout: "Only proceed if you have confirmed this match is appropriate."
- Two-button footer: "Cancel — go back" (ghost, left) and "Yes, make this introduction" (primary blue, right).
- The primary confirm button is never red or amber — it is calm authority blue. The warning is in the content, not the button color. Panic color on the confirm button teaches users to hesitate and mis-click on other primary actions.

## 6. Do's and Don'ts

### Do:
- **Do** use Authority Blue for a single primary action per screen. Its scarcity is the trust signal.
- **Do** show the verified badge (`ShieldCheck` + "Verified") on every worker card where `isVerified = true`. This is not optional decoration — it is the product's core value prop.
- **Do** give the Introduce confirmation dialog an amber warning header and irreversibility language. The ceremony matches the weight of the action.
- **Do** use Lexend for all headings and Source Sans 3 for all body, labels, and form text. Never swap them.
- **Do** maintain `muted-ink` (`oklch(0.5 0.04 240)`) as the floor for secondary text. It meets 4.5:1 contrast on Canvas White.
- **Do** use `text-wrap: balance` on page titles and card headings for even line breaks.
- **Do** pair every destructive action (Reject, Delete) with a confirmation dialog before executing.
- **Do** show role-specific context only: Workers see their own journey, Clients see their matches, Admins see the full picture.

### Don't:
- **Don't** use purple gradients, neon accents, bold "disrupting X" hero copy, or glassmorphism. This is the startup-bro aesthetic — it is explicitly prohibited.
- **Don't** show connection counts, profile view tallies, or any social-proof-by-volume signal. This is the LinkedIn clone pattern — QuickQuid's value is scarcity and curation, not network size.
- **Don't** use gray data tables, dense 10px labels, or clunky inline form-in-a-table edit patterns. This is the government/enterprise legacy look — prohibited.
- **Don't** place body text below 16px or muted text below 12px. Never use the `canvas-white` background color as text against any surface.
- **Don't** apply Authority Blue to backgrounds, section fills, or card borders except in the verified badge. The One Blue Rule.
- **Don't** use the destructive red for caution or warning states. Amber/yellow is the warning register. Red is reserved for reject, delete, and error — states with permanent consequences.
- **Don't** rely on hover-only affordances for any interactive element. Every interactive element must have a visible default state that communicates clickability (color, underline, or button shape).
- **Don't** place two primary (blue) buttons on the same screen. Secondary actions get ghost or outline treatment.
- **Don't** render the Introduce action as a plain text link or a small icon button without a label. It must be a named button with the `Zap` icon so it is never mis-triggered.
- **Don't** use placeholder text as the only label for form inputs. Always use a visible label above the field.
