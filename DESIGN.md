---
name: Fire Within University
description: Cinematic warmth for a ministry site, light breaking into darkness
colors:
  threshold-dark: "#1a0f05"
  inner-room: "#2a1a0e"
  deep-walnut: "#3D1F0A"
  hearthwood: "#4A2A12"
  lit-timber: "#6B3A1F"
  warm-parchment: "#FDF6EC"
  aged-parchment: "#F5EBDA"
  lampstand-gold: "#E8A020"
  first-light: "#F0BD58"
  old-brass: "#C48A18"
  ember-orange: "#A34D14"
  deep-ember: "#8B4012"
  live-coal: "#C45E1A"
  rising-flame: "#D97A3E"
typography:
  display:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "clamp(2.75rem, 7vw, 5.5rem)"
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "clamp(1.875rem, 4vw, 3.25rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "1.0625rem"
    fontWeight: 700
    lineHeight: 1.35
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 700
    letterSpacing: "0.3em"
rounded:
  lg: "0.5rem"
  xl: "0.75rem"
  2xl: "1rem"
  pill: "9999px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "48px"
  section: "112px"
components:
  button-primary:
    backgroundColor: "{colors.ember-orange}"
    textColor: "{colors.warm-parchment}"
    rounded: "{rounded.pill}"
    padding: "16px 40px"
  button-primary-hover:
    backgroundColor: "{colors.deep-ember}"
  button-give:
    backgroundColor: "{colors.lampstand-gold}"
    textColor: "{colors.deep-walnut}"
    rounded: "{rounded.pill}"
    padding: "16px 56px"
  button-give-hover:
    backgroundColor: "{colors.old-brass}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.warm-parchment}"
    rounded: "{rounded.pill}"
    padding: "16px 40px"
  card:
    backgroundColor: "{colors.hearthwood}"
    textColor: "{colors.warm-parchment}"
    rounded: "{rounded.2xl}"
    padding: "24px"
  input:
    backgroundColor: "{colors.threshold-dark}"
    textColor: "{colors.warm-parchment}"
    rounded: "{rounded.xl}"
    padding: "12px 16px"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.lampstand-gold}"
    rounded: "{rounded.pill}"
    padding: "6px 16px"
---

# Design System: Fire Within University

## 1. Overview

**Creative North Star: "Light Through the Doorway"**

The homepage hero, light breaking through a stone doorway into darkness, is not a picture on this site; it is the doctrine the whole system obeys. Every page is a threshold. The ground is always warm darkness (Threshold Dark, #1a0f05), and meaning arrives as light: a gold glow behind a title, a candle-warm card edge, a verse set apart in its own pool of warmth. Glow always has a source and a direction. Nothing on this site is lit evenly, because nothing in a candlelit room is.

The personality is reverent, warm, alive. Cinematic darkness without gloom: this must never read as moody luxury branding, and it must never read as its one named enemy, the dated church website (clip-art doves, rainbow gradients, 2010 template energy). It also must never feel like a tech product. Density is low, pacing is unhurried, and interactive elements are **kindled**: touching them breathes light into them, like breath on embers.

**Key Characteristics:**
- Warm darkness as the canvas; light as the information
- One serif voice (Lora) for everything sacred and headline; one sans (Inter) for everything that serves
- Gold is scarce and always means light; orange means action
- Motion rises and glows, slow and exponential, never bouncy
- Scripture is set apart and honored on every page it appears

## 2. Colors

A drenched strategy: the warm darkness IS the brand surface, with gold as scarce light and orange as the only call to action.

### Primary
- **Lampstand Gold** (#E8A020): the light itself. Eyebrow labels, scripture references, active states, hairline dividers, glow shadows, the flame mark. Where gold appears, light is falling.
- **First Light** (#F0BD58): gold's hover/brightened state; gradients within flame artwork.
- **Old Brass** (#C48A18): pressed/darkened gold; the hover state of the giving button.

### Secondary
- **Ember Orange** (#A34D14): the action color. Primary buttons (Read Sermons, Subscribe, Give in the navbar). It is the only saturated fill used for ordinary actions.
- **Deep Ember** (#8B4012): orange's hover state.
- **Live Coal** (#C45E1A): brighter accent for links within prose and the focus outline.
- **Rising Flame** (#D97A3E): lighter flame tones inside artwork and gradients.

### Neutral
- **Threshold Dark** (#1a0f05): the page ground. The darkness the light breaks into.
- **Inner Room** (#2a1a0e): modal and toast surfaces.
- **Deep Walnut** (#3D1F0A): the brand brown; text-on-light in the admin; dark text on gold buttons.
- **Hearthwood** (#4A2A12): card surfaces, usually at 40 to 80 percent opacity over the ground.
- **Lit Timber** (#6B3A1F): borders and secondary text on light surfaces.
- **Warm Parchment** (#FDF6EC): all primary text on dark ground; never pure white.
- **Aged Parchment** (#F5EBDA): secondary light surface tints.

### Named Rules
**The One Flame Rule.** At most one gold-filled element per screen: the giving CTA. Everywhere else, gold is light, not paint: text, hairlines, glow. If two gold fills appear at once, one of them is wrong.

**The Falling Light Rule.** Gold never appears as an even coat. Every gold glow, hairline, or radial has an implied source above or behind the content, consistent with a doorway you cannot quite see.

## 3. Typography

**Display Font:** Lora (with Georgia, serif)
**Body Font:** Inter (with system-ui, sans-serif)

**Character:** Lora carries gravity and warmth, a preacher's voice in print; Inter serves quietly underneath it. The pairing is sacred-over-functional: if a string of text matters spiritually (titles, scripture, names of courses), it is Lora; if it explains, navigates, or labels, it is Inter.

### Hierarchy
- **Display** (700, clamp(2.75rem, 7vw, 5.5rem), 0.92 line-height, -0.02em): the hero statement only. One per site, effectively.
- **Headline** (700, ~1.875 to 3.25rem, 1.05): page titles (via PageHeader) and section headings.
- **Title** (700, 1.0625 to 1.25rem, snug): card titles, lesson names. Always Lora.
- **Body** (400, 1rem, 1.7): articles and descriptions, Inter, capped at 65 to 75ch (the prose-ministry class enforces this).
- **Label** (600 to 700, 0.625 to 0.8125rem, 0.25 to 0.3em tracking, uppercase): eyebrow labels in gold, category chips, metadata.

### Named Rules
**The Scripture Setting Rule.** Scripture is always set in Lora italic at comfortable size, visually set apart (its own card or pool of space), with an attributed reference in gold that links to the passage. Scripture never appears inline as decoration.

## 4. Elevation

Depth on this site is conveyed by light, not by shadow. The dark public pages use gold-tinted glows (`shadow-glow`: 0 0 24px 4px rgba(232,160,32,0.18); `shadow-glow-lg`: 0 0 48px 8px rgba(232,160,32,0.22)) and warm radial gradients to lift elements, because a black drop shadow is invisible on near-black ground. Surfaces separate through tonal layering: Hearthwood cards at partial opacity over Threshold Dark, with 1px borders of white at 6 percent.

The light-themed admin portal is the one place conventional shadows live (`shadow-card`, and `shadow-card-hover`: 0 20px 40px -12px rgba(61,31,10,0.4)), and even those are brown-tinted, never gray.

### Shadow Vocabulary
- **Glow** (`0 0 24px 4px rgba(232,160,32,0.18)`): resting radiance on the giving CTA and kindled hover states.
- **Glow large** (`0 0 48px 8px rgba(232,160,32,0.22)`): hover amplification of the above.
- **Card hover** (`0 20px 40px -12px rgba(61,31,10,0.4)`): lift on light surfaces and content cards.

### Named Rules
**The Light-Not-Shadow Rule.** On dark ground, elevation is always expressed as glow or tonal lightening, never as a dark drop shadow. If you reach for black box-shadow on a public page, you have the wrong tool.

## 5. Components

Interactive elements are **kindled**: hover breathes light into them (a gold border waking up, a glow rising, a 1 to 4px lift) over 200 to 300ms with exponential ease-out. Reveal-on-scroll rises 20 to 32px and fades in over ~700ms (cubic-bezier(0.16, 1, 0.3, 1)), once, via the shared IntersectionObserver.

### Buttons
- **Shape:** full pill (9999px), generous padding (16px 40px; the giving button wider at 16px 56px).
- **Primary:** Ember Orange fill, Warm Parchment text, soft orange-tinted shadow; hover deepens to Deep Ember, lifts 2px, shadow warms.
- **Give:** Lampstand Gold fill with Deep Walnut text and a resting glow; the only gold-filled element on screen (One Flame Rule). Hover: Old Brass, glow-lg.
- **Ghost:** transparent with a 30 percent parchment border; hover brightens border and adds a 6 percent parchment wash.
- **Arrow affordance:** inline arrows translate 4px right on group hover.

### Chips
- **Style:** pill outline, 1px border, uppercase Label type. Inactive: 20 percent parchment border with 50 percent parchment text. Active: gold border, gold text, 8 percent gold wash.

### Cards / Containers
- **Corner Style:** 1rem (rounded-2xl).
- **Background:** Hearthwood at 40 to 80 percent over the ground; border white at 6 percent.
- **Kindled hover:** border warms toward gold at 15 to 20 percent, card lifts 4px, gold edge-glow appears; cover images scale to 1.04 over 400ms.
- **Internal Padding:** 20 to 24px.

### Inputs / Fields
- **Style:** dark fill (Threshold Dark or black at 25 percent), 1px border at 10 to 15 percent parchment, pill or 0.75rem radius.
- **Focus:** border turns gold, 2px gold ring at 25 to 40 percent. Placeholder at 50 to 60 percent parchment (contrast-verified).
- **Error:** soft red-400 text below, announced via role=alert.

### Navigation
- Fixed, transparent over the hero; past 20px of scroll it gains a 95 percent Threshold Dark fill and hairline border (color transition only, no blur). Links are small Inter with a gold underline that scales in from the left on hover/active. Mobile: hamburger to a slide-down panel, focus-trapped.

### PageHeader (signature)
- Every inner page opens with it: centered flame mark, gold eyebrow label, Lora headline, optional subtitle, all over a warm radial gold glow (6 percent, 130px blur) with a gold hairline at the very top. This is the ember each page carries from the homepage fire.

## 6. Do's and Don'ts

### Do:
- **Do** keep the ground warm: every dark surface is a brown (#1a0f05 family), never gray or pure black; every light text is parchment (#FDF6EC), never #fff.
- **Do** give every glow a direction and source (The Falling Light Rule); radials sit behind titles or above sections, not centered ambiently on everything.
- **Do** reserve gold fills for the single giving CTA per screen (The One Flame Rule).
- **Do** set scripture apart in Lora italic with a gold attributed reference (The Scripture Setting Rule).
- **Do** ease out exponentially (cubic-bezier(0.16, 1, 0.3, 1)) at 200 to 700ms; respect prefers-reduced-motion everywhere, including the hero video.
- **Do** keep touch targets at 44px and text contrast at 4.5:1 or better.

### Don't:
- **Don't** build anything that could pass for a "dated church website": no clip-art doves, no rainbow gradients, no 2010 template energy. This is PRODUCT.md's named enemy, verbatim.
- **Don't** drift into tech-product territory: no pastel SaaS gradients, no floating glass cards, no hero-metric blocks.
- **Don't** use black drop shadows on dark pages (The Light-Not-Shadow Rule), gradient text, side-stripe borders, or decorative glassmorphism (backdrop-blur was deliberately removed for scroll performance; do not reintroduce it).
- **Don't** animate layout properties, and never bounce or overshoot; motion is breath, not spring.
- **Don't** let the site go cold: a page with no gold anywhere has lost the doorway. The audit test: if a screenshot could pass for a whiskey brand or a generic dashboard, add the light back.
