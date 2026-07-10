# Centered Milestone Highlight Design

## Goal

Update the milestone carousel so the active event is centered in the viewport and reads as the clear focal point. The interaction should match the supplied reference while preserving the existing Hino visual system, content, controls, drag behavior, and autoplay.

## Interaction

- Center the active milestone in the viewport on desktop and mobile.
- Keep part of the adjacent milestones visible so the horizontal sequence remains apparent.
- Previous, next, marker selection, drag scrolling, and autoplay continue to move one milestone at a time.
- The first and last milestones must also be able to reach the centered position.
- During manual scrolling, the milestone closest to the viewport center becomes active.

## Visual Treatment

- Apply a subtle centered-lift effect to the active milestone: `translateY(-20px) scale(1.08)` above 700px and `translateY(-12px) scale(1.04)` at 700px and below.
- Give the active image card a deeper but restrained shadow and full opacity.
- Reduce the opacity and visual emphasis of non-active milestones while keeping them legible.
- Change the active timeline dot, year, and event text to Hino red.
- Keep the card rectangular and avoid strong `rotateY` or coverflow distortion.
- Preserve the existing image cropping rules, anniversary treatment, typography, and page background.

## Implementation Boundaries

- Update the timeline positioning calculation so targets are based on the viewport center rather than the leading edge.
- Add balanced leading and trailing space so edge milestones can center.
- Reuse the existing `is-active` and `is-current` state classes; do not introduce a new carousel dependency.
- Keep the current semantic markup, keyboard-focusable viewport, labeled controls, and `aria-current` behavior.
- Under `prefers-reduced-motion`, center milestones without animated scale or lift transitions.

## Responsive Behavior

- Desktop: show the active card centered with neighboring cards visible on both sides.
- Mobile: retain the current card width near `84vw`, center the active card, and expose narrow previews of the previous and next cards.
- The effect must not create vertical or horizontal clipping at 320px, 768px, 1024px, or 1440px viewport widths.

## Verification

- Confirm the initial, intermediate, and final milestones can each be centered.
- Confirm arrow navigation, marker buttons, drag scrolling, autoplay, and language switching still work.
- Confirm the active dot, year, event text, image opacity, lift, scale, and shadow update together.
- Confirm there are no console errors and the existing test suite and production build pass.
- Visually inspect the milestone section at desktop and mobile widths before handing off the localhost URL.
