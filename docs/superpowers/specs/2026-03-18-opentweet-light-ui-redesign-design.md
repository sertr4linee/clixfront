# Opentweet-Inspired Light UI Redesign for clix

## Problem

The current frontend shell still feels like a dark X clone, while the desired direction is a light, premium, Opentweet-inspired product UI. The redesign should preserve the existing MCP-backed functionality but refresh the visual system across the main application surfaces.

The user specifically wants:

- light mode by default
- a grouped sidebar inspired by `image.png` and `image copy.png`
- `Home` kept in navigation, but with its current content replaced
- a broad redesign across the primary pages, not only the sidebar

## Goals

- Make the app feel closer to Opentweet visually: grouped navigation, white cards, soft blue accents, subtle borders, more product-like hierarchy
- Keep the existing information architecture and working MCP integrations
- Unify the shell so all major pages feel part of the same system
- Preserve the automation canvas behavior while updating its surrounding chrome

## Non-Goals

- No backend or MCP contract changes
- No feature redesign of automations, analytics calculations, or feed/search logic
- No dark-mode-first treatment for this pass
- No unrelated refactors outside the shell and page presentation layer

## Recommended Approach

Adopt the most faithful Opentweet-inspired direction:

- light mode default at the document shell level
- sidebar with grouped sections, gentle spacing, and a pale-blue active item treatment
- global page surfaces rebuilt around white cards on a soft neutral background
- page-by-page visual alignment using a shared shell language instead of one-off styling

This approach gives the user the closest result to the provided references while minimizing behavioral risk.

## Considered Alternatives

### 1. Very close to Opentweet

This is the selected direction.

Pros:

- best match with the provided screenshots
- strongest perceived upgrade in polish
- creates a consistent product identity quickly

Cons:

- requires touching most main pages to avoid a mismatched shell

### 2. Opentweet-inspired but more X-native

Pros:

- safer migration from current UI
- less page-level restyling required

Cons:

- less aligned with the user’s explicit visual request

### 3. Generic neutral light mode

Pros:

- fastest visual refresh
- easiest to maintain

Cons:

- too far from the reference direction
- lower design payoff

## Design

### 1. Shell and Theme

The app should render in light mode by default by removing the forced dark root class in the layout. The global theme tokens in `globals.css` should shift to a soft product palette:

- near-white app background
- white cards and panels
- light gray borders
- dark neutral text
- pale blue accent for selected and emphasized elements

The outer shell should feel layered rather than flat: app background, card surfaces, subtle borders, and restrained shadow. This keeps the app clean without becoming sterile.

### 2. Sidebar

The sidebar should be rebuilt to feel like the screenshots:

- brand area at top
- grouped navigation sections instead of a single undifferentiated list
- lighter spacing and softer active states
- `Home` retained as the first navigation item
- account block preserved in the footer

The nav grouping should emphasize product sections such as primary navigation, content tools, and utility destinations. The goal is to make the sidebar feel curated instead of mechanically generated.

### 3. Home Page

For this redesign, the sidebar item labeled `Home` will continue to route to the existing `/feed` page. No new `/home` route will be introduced in this pass.

The current `/feed` page content should no longer be a simple timeline-first dark X clone. It should become a light overview page that still supports the feed use case.

Expected structure:

- clean page header
- compact summary or quick-action strip near the top
- compose entry point integrated into the shell
- lighter timeline presentation below

This keeps Home useful as an entry point while aligning it with the more premium product style.

The existing timeline behavior remains part of `/feed`, but it should be visually reframed as part of a broader overview/home experience instead of occupying the entire identity of the page.

The existing `web/app/dashboard/page.tsx` route is not the primary target of this redesign and should not become the new Home. It may be left untouched or cleaned up later in a separate pass if it becomes obsolete.

### 4. Primary Page Family

The main pages should share one visual language:

- `Analytics`: cards, large highlight surfaces, cleaner spacing around heatmaps/charts
- `Search`: softer search field, lighter tabs, consistent results list styling
- `Scheduled`, `Bookmarks`, `Lists`, `DMs`: consistent cards, empty states, and headers
- `Automations`: keep React Flow behavior, but wrap it in the same light shell treatment

Each page does not need a unique design system. Instead, each page should be restyled as a variant of the same product shell.

### 5. Right Panel Behavior

The right panel should remain contextual rather than global. It should continue to be hidden on routes where it fights the core experience, such as automations, and remain available on pages where trends or supporting content still add value.

### 6. Interaction Language

Buttons, tabs, search fields, and cards should move from hard dark contrast to softer hierarchy:

- active tabs use blue emphasis instead of harsh underlines on black
- cards use border and fill rather than only contrast
- hover states become soft tint/background transitions
- empty states stay minimal and product-like

The result should feel calm and premium rather than loud.

## Implementation Plan Shape

The work should be executed in this order:

1. update the shell and theme tokens
2. rebuild the sidebar structure and styling
3. replace Home content
4. align the main pages to the shared light visual system
5. verify build and visually test the key routes

## Error Handling and Safety

- Do not change MCP hooks, API routes, or server behavior
- Keep route structure intact
- Preserve conditional panels and current navigation logic
- Avoid style-only changes that accidentally remove loading, empty, or interactive states

## Validation

Required validation:

- `npx next build`
- visual verification of `Home`, `Analytics`, `Search`, `Scheduled`, and `Automations`
- confirm sidebar grouping, active states, and layout integrity across the updated shell

## Files Likely Affected

- `web/app/layout.tsx`
- `web/app/globals.css`
- `web/components/app-sidebar.tsx`
- `web/components/layout/right-panel.tsx`
- `web/app/feed/page.tsx`
- `web/app/analytics/page.tsx`
- `web/app/search/page.tsx`
- `web/app/scheduled/page.tsx`
- additional primary page files that need shell alignment

## Open Questions

No blocking open questions remain for the first implementation pass. The visual direction, shell approach, and navigation treatment have been approved.
