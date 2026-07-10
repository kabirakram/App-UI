---
name: Executive Flow
colors:
  surface: '#f7fafc'
  surface-dim: '#d7dadc'
  surface-bright: '#f7fafc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4f6'
  surface-container: '#ebeef0'
  surface-container-high: '#e5e9eb'
  surface-container-highest: '#e0e3e5'
  on-surface: '#181c1e'
  on-surface-variant: '#43474e'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eef1f3'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#455f88'
  primary: '#002045'
  on-primary: '#ffffff'
  primary-container: '#1a365d'
  on-primary-container: '#86a0cd'
  inverse-primary: '#adc7f7'
  secondary: '#545f72'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f7'
  on-secondary-container: '#586377'
  tertiary: '#002626'
  on-tertiary: '#ffffff'
  tertiary-container: '#003d3d'
  on-tertiary-container: '#55acac'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#adc7f7'
  on-primary-fixed: '#001b3c'
  on-primary-fixed-variant: '#2d476f'
  secondary-fixed: '#d8e3fa'
  secondary-fixed-dim: '#bcc7dd'
  on-secondary-fixed: '#111c2c'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#9bf1f1'
  tertiary-fixed-dim: '#7ed5d4'
  on-tertiary-fixed: '#002020'
  on-tertiary-fixed-variant: '#004f50'
  background: '#f7fafc'
  on-background: '#181c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 20px
  gutter: 16px
---

## Brand & Style

This design system is engineered for high-stakes team coordination, balancing professional authority with modern efficiency. The brand personality is grounded, reliable, and "unflappable"—designed to reduce cognitive load during a busy workday. 

The aesthetic follows a **Corporate / Modern** direction with a heavy emphasis on **Minimalism**. It utilizes expansive white space to separate complex data sets and relies on a structured hierarchy to guide the user through tasks and schedules without visual friction. The emotional response should be one of "calm control," where the UI feels like a silent partner in the user's productivity.

## Colors

The palette is anchored by a deep **Navy Blue (#1A365D)** to establish trust and professional rigor. The **Slate Gray (#4A5568)** serves as the functional secondary color, used primarily for secondary actions and meta-data to keep the interface grounded. 

**Vibrant Teal (#2D8A8A)** is reserved strictly for high-priority interactions, active states, and primary call-to-action buttons, ensuring these elements "pop" against the **Soft White (#F7FAFC)** background. Subtle light gray borders (#E2E8F0) are used to define boundaries without adding visual weight.

## Typography

The design system utilizes **Inter** exclusively to leverage its exceptional legibility and systematic weight distribution. 

The hierarchy is built to emphasize scanning. **Task Titles** use `headline-md` for immediate recognition, while **Meeting Times** and **Meta-information** use `label-md` with a slight letter-spacing increase to ensure clarity even at small sizes. For mobile, display sizes are capped at 24px to prevent text wrapping from disrupting the layout of dense schedule views.

## Layout & Spacing

This design system employs a **Fluid Grid** with a strict 4px baseline rhythm. 

- **Desktop:** A 12-column grid with 24px gutters. Sidebars are fixed at 280px to maintain consistent navigation, while the main content area expands.
- **Mobile:** A 4-column grid with 16px gutters and 20px side margins. 
- **Spacing Logic:** Use `md` (16px) for internal padding of cards and `lg` (24px) for vertical spacing between distinct content sections. This generous spacing prevents the "data-heavy" app from feeling cluttered.

## Elevation & Depth

Visual hierarchy is achieved through a combination of **Tonal Layers** and **Ambient Shadows**. 

The background surface is #F7FAFC. Cards and primary containers are elevated using a pure white (#FFFFFF) background with a subtle, highly-diffused shadow (0px 4px 12px rgba(26, 54, 93, 0.05)). This blue-tinted shadow ensures the elevation feels integrated with the primary brand color rather than appearing as a generic gray smudge. Borders should be used sparingly, primarily on input fields and secondary list items, using a 1px solid stroke of #E2E8F0.

## Shapes

The shape language is consistently **Rounded**, providing a modern and approachable feel that softens the "corporate" edge of the navy blue.

- **Buttons & Chips:** 8px (rounded) for a compact, efficient look.
- **Cards & Modals:** 12px (rounded-lg) to clearly define large content blocks.
- **Avatars:** Strictly circular to contrast against the geometric grid of the cards.

## Components

### Buttons & Actions
Primary buttons use the Teal accent (#2D8A8A) with white text and 8px rounded corners. Secondary buttons use a Slate Gray outline or a ghost style with Navy text to maintain hierarchy.

### Task Cards
Cards use a white background and a 1px border. Include a **Status Indicator**—a vertical 4px bar on the left edge (Teal for active, Gray for pending). Task titles are bold Navy; subtext is Slate Gray.

### Meeting List Items
Horizontal layout. Left-aligned time (Label-md, Navy), followed by a vertical divider, then the meeting title. Attendee avatars are grouped in the right-most section using a "stack" pattern (overlapping circles).

### Inputs & Selection
Checkboxes use the Teal accent for the checked state. Text inputs use a Soft White fill and a Slate Gray border that darkens to Navy on focus.

### Mobile Navigation
A fixed bottom bar with four slots: Home, Meetings, Tasks, and Activity. Icons use 24px stroke-based glyphs. The active state is indicated by a Navy icon and a small 4px Teal dot centered underneath.