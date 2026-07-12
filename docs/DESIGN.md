---
name: Mr.Wam Onboarding Platform
description: Dynamic form management for financial services — KYC, loans, investments
colors:
  ink: "#0D1117"
  ink-50: "#F4F5F7"
  ink-100: "#E8EAED"
  ink-200: "#C9CDD4"
  ink-300: "#9CA3AF"
  ink-600: "#374151"
  ink-700: "#1F2937"
  ink-900: "#0D1117"
  gold: "#C9A84C"
  gold-light: "#E8D49A"
  gold-dark: "#8B6914"
  surface: "#FAFAF8"
  surface-raised: "#FFFFFF"
  surface-sunken: "#F0EFE9"
  info: "#3B82F6"
  status-submitted: "#1D4ED8"
  status-reviewed: "#B45309"
  status-approved: "#15803D"
  status-rejected: "#B91C1C"
  surface-dark: "#0A0A0A"
  surface-dark-raised: "#141414"
  gold-inverse: "#C9A84C"
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontWeight: 300
    letterSpacing: "-0.02em"
  body:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  mono:
    fontFamily: "DM Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
rounded:
  sm: "4px"
  md: "8px"
  full: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  "2xl": "3rem"
components:
  button-primary:
    backgroundColor: "{colors.ink-900}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    padding: "0.75rem 1.5rem"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink-700}"
    rounded: "{rounded.sm}"
    padding: "0.75rem 1.5rem"
  button-gold:
    backgroundColor: "{colors.gold}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    padding: "0.75rem 1.5rem"
  input:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink-900}"
    rounded: "{rounded.sm}"
    padding: "0.75rem 1rem"
---

# Design System: Mr.Wam Onboarding Platform

## 1. Overview

**Creative North Star: "The Clear Ledger"**

The design system embodies the clarity of a well-kept financial record — organized, transparent, and trustworthy. Every element serves a purpose; nothing is decorative for decoration's sake. The palette is restrained: deep ink tones carry authority, warm gold accents signal action and importance, and neutral surfaces provide breathing room. This is a system that says "we take your data seriously" without saying "we're a bank."

The aesthetic rejects two extremes: the generic SaaS dashboard (gradient buttons, card-heavy layouts, rainbow status badges) and the old-school banking site (dense tables, tiny text, corporate blue overload). Instead, it finds the middle ground — professional enough for financial compliance, approachable enough for daily use. Key Characteristics: restrained palette with purposeful accents, clear typographic hierarchy, flat depth with tonal layering, tactile interactive states, accessible by default.

## 2. Colors

The palette is built on deep ink neutrals with warm gold as the sole accent — used sparingly to draw attention where it matters.

### Primary
- **Deep Ink** (#0D1117): The dominant neutral. Used for primary buttons, headings, and high-emphasis text. Conveys authority and seriousness.
- **Warm Gold** (#C9A84C): The accent. Used for focus rings, badges, and select interactive highlights. Rarity is the point — it appears on ≤10% of any screen.

### Neutral
- **Paper White** (#FAFAF8): The default surface. Warm-tinted, not pure white — reduces eye strain during extended use.
- **Raised White** (#FFFFFF): Cards, inputs, and elevated surfaces. Subtle lift through brightness.
- **Sunken Gray** (#F0EFE9): Recessed areas, disabled states, and background depth.
- **Ink Scale** (#0D1117 → #F4F5F7): A 7-step neutral scale from deepest ink to lightest gray, used for text hierarchy, borders, and dividers.

### Status
- **Submitted Blue** (#1D4ED8): Pending review state. Calm, waiting.
- **Reviewed Amber** (#B45309): In-progress state. Active, attention needed.
- **Approved Green** (#15803D): Success state. Completed, positive.
- **Rejected Red** (#B91C1C): Error/denial state. Requires attention.

### Named Rules

**The Gold Accent Rule.** Warm gold appears on ≤10% of any given screen. Its rarity is the point — when gold shows up, the user knows it matters.

**The Surface Temperature Rule.** All surfaces are warm-tinted (not pure white or pure gray). The warmth signals approachability; the restraint signals professionalism.

## 3. Typography

**Display Font:** Cormorant Garamond (with Georgia, serif fallback)
**Body Font:** DM Sans (with system-ui, sans-serif fallback)
**Label/Mono Font:** DM Mono (with ui-monospace, monospace fallback)

**Character:** The serif display font brings editorial weight to headings — serious but not stern. The sans-serif body font is clean and highly readable at small sizes. The pairing creates hierarchy through structure contrast (serif + sans) rather than weight alone.

### Hierarchy (8-step type ramp)
- **Display** (300 weight, clamp(2.5rem, 7vw, 4.5rem), line-height 1): Hero headlines only. The light weight lets the serif character breathe.
- **H1** (400 weight, 2.5rem, line-height 1.15): Page-level headings. Clear but not shouting.
- **H2** (400 weight, 1.75rem, line-height 1.2): Section headings. Clear hierarchy above content.
- **H3** (500 weight, 1.25rem, line-height 1.3): Subsection headings, card titles. Distinct from body.
- **H4** (500 weight, 1.125rem, line-height 1.35): Inline headings, small card titles.
- **Body** (400 weight, 0.875rem, line-height 1.5): All body text, form labels, descriptions. Max width 65ch for readability.
- **Small** (400 weight, 0.75rem, line-height 1.5): Secondary text, captions, help text. Clear but subordinate.
- **Caption** (500 weight, 0.625rem, letter-spacing 0.05em, uppercase): Navigation items, badges, metadata, timestamps. Small but legible.

### Named Rules

**The Display Restraint Rule.** Cormorant Garamond appears only in page-level headings (h1, h2). It never appears in buttons, form labels, stat cards, or navigation. Product UI text always uses DM Sans.

**The Mono Accent Rule.** DM Mono appears only for metadata, timestamps, and technical labels. It never carries primary content.

## 4. Elevation

This system is flat by default. Depth is conveyed entirely through tonal layering — surface colors shift from sunken to raised to dark, creating visual hierarchy without shadows. The three surface levels (sunken → default → raised) establish spatial relationships through color temperature, not lift.

When interactive states need emphasis, the system uses border shifts and outline rings rather than shadow elevation. Focus states use the gold accent ring; hover states use border color transitions. The only exception is the loading spinner, which uses a subtle border animation.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. No box-shadow appears on cards, buttons, or inputs in their default state. Depth comes from surface color, not shadow.

**The Focus Ring Rule.** All interactive elements receive a 2px gold outline ring on focus-visible. The ring is the accessibility contract — if it's interactive, it gets a ring.

## 5. Components

### Buttons
- **Shape:** Gently curved edges (4px radius)
- **Primary:** Deep ink background (#0D1117), white text, 0.75rem 1.5rem padding. The workhorse — used for primary actions.
- **Hover / Focus:** Background shifts to ink-700 (#1F2937). Focus-visible adds 2px gold outline ring.
- **Secondary:** Transparent background, ink-700 text, 1px ink-200 border. For less prominent actions.
- **Gold:** Warm gold background (#C9A84C), white text. Reserved for hero CTAs and high-emphasis actions.

### Inputs
- **Style:** White background, 1px ink-200 border, 4px radius. Clean and unadorned.
- **Focus:** Border shifts to ink-900, 2px gold outline ring appears. Clear visual feedback.
- **Error:** Border shifts to status-red, error message appears below in red text.
- **Disabled:** Background shifts to sunken gray, text dims.

### Cards / Containers
- **Corner Style:** 4px radius (consistent with buttons and inputs)
- **Background:** White (#FFFFFF) on default surface (#FAFAF8)
- **Shadow Strategy:** None — flat by default. Depth through surface color only.
- **Border:** 1px ink-100 for subtle separation when needed.
- **Internal Padding:** 1.5rem (24px) standard.

### Status Badges
- **Style:** Colored background tint + matching text color + 1px colored border
- **States:** Submitted (blue), Reviewed (amber), Approved (green), Rejected (red)
- **Typography:** 0.75rem DM Mono, letter-spacing 0.05em, uppercase

### Navigation
- **Style:** Top bar with raised white background, ink-900 brand name, ink-400 links
- **Default:** Ink-400 text, no underline
- **Hover:** Ink-900 text, bottom border appears
- **Active:** Ink-900 text, gold underline
- **Mobile:** Hamburger menu with full-width drawer

### Form Layout
- **Split Layout:** Left panel (dark ink background, brand + trust signals) | Right panel (white form area)
- **Form Area:** Max-width 400px, centered, generous whitespace
- **Section Headers:** Cormorant Garamond h2, ink-900, clear hierarchy above form fields

## 6. Do's and Don'ts

### Do:
- **Do** use the gold accent sparingly — focus rings, badges, hero CTAs. ≤10% of any screen.
- **Do** maintain warm-tinted surfaces (#FAFAF8, not pure #FFFFFF or #F5F5F5).
- **Do** use tonal layering for depth — sunken → raised → dark, not shadows.
- **Do** pair Cormorant Garamond headings with DM Sans body text for structure contrast.
- **Do** include 2px gold focus-visible rings on every interactive element.
- **Do** use DM Mono only for metadata and timestamps, never for primary content.
- **Do** keep body text at 0.875rem minimum with 1.5 line-height.
- **Do** use status badge colors consistently: blue=submitted, amber=reviewed, green=approved, red=rejected.

### Don't:
- **Don't** use generic SaaS dashboard patterns — gradient buttons, card-heavy layouts, rainbow status badges.
- **Don't** use old-school banking patterns — dense tables, tiny text, corporate blue overload, walls of legal text.
- **Don't** put Cormorant Garamond in buttons, form labels, stat cards, or navigation — display font is headings only.
- **Don't** add box-shadow to cards, buttons, or inputs in their default state — flat by default.
- **Don't** use pure white (#FFFFFF) or pure gray (#F5F5F5) for surfaces — always warm-tinted.
- **Don't** vary terminology for variety — pick one term (Sign in, not Log in / Enter) and stick with it.
- **Don't** use placeholder text as the only label — labels persist, placeholders disappear.
- **Don't** disable browser zoom (`user-scalable=no`) — fix the layout instead.
