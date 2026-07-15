# Milestone Gesture-First Autoplay UX Design

**Date:** 2026-07-15  
**Status:** Approved for implementation planning

## Context

The milestone section already presents a centered horizontal timeline with an enlarged active card, clickable year markers, drag support, scroll snapping, and autoplay. The visible arrow controls were removed in the previous client revision.

The current experience has two related problems:

1. Autoplay advances on a fixed interval without enough coordination with smooth scrolling or user input, so it can feel abrupt or compete with the user.
2. Without arrow buttons, the section does not clearly communicate that it can be dragged or swiped. The progress bar is passive and should remain passive.

This revision improves interaction clarity and motion quality without changing the timeline's content layout.

## Goals

- Make drag and swipe interaction immediately discoverable without restoring visible navigation arrows.
- Keep autoplay continuous, calm, and predictable.
- Resume autoplay three seconds after a completed user interaction.
- Preserve the current centered-card layout, year rail, imagery, typography, and Hino visual language.
- Add restrained motion inspired by ReactBits without making the timeline look like an effects demo.
- Support mouse, touch, trackpad, keyboard, and reduced-motion users.

## Non-Goals

- Do not replace the timeline with a new carousel component.
- Do not add Previous, Next, Play, or Pause buttons.
- Do not make the progress bar clickable or draggable.
- Do not hijack vertical mouse-wheel scrolling to force horizontal movement.
- Do not add cursor spotlight, card tilt, magnetic motion, liquid effects, or looping text animation.
- Do not restructure the section or change milestone content.

## Chosen Direction

Use a gesture-first timeline with continuous autoplay:

- Users navigate by dragging, swiping, clicking a year marker, using a horizontal trackpad gesture, or pressing keyboard navigation keys.
- A short instruction and edge fades make the horizontal interaction discoverable.
- Autoplay advances after a readable dwell period and yields cleanly whenever the user interacts.
- The existing progress bar continues to show position within the full timeline. It is not an input control.

## Interaction Specification

### Autoplay

- Initial milestone remains `1996`.
- Normal autoplay dwell: approximately `4.5 seconds` per milestone.
- Smooth movement duration: approximately `650ms`, using a calm ease-out curve.
- Autoplay advances one milestone at a time from left to right and loops from the final milestone back to the first milestone.
- Autoplay runs only when:
  - the page is visible;
  - the milestone section intersects the viewport;
  - no pointer drag or touch gesture is active;
  - no keyboard-driven interaction is in progress.
- Autoplay must never create overlapping timers or start a second smooth scroll before the current movement has settled.

### User Interaction And Resume

The following interactions move the timeline manually and reset autoplay:

- mouse drag;
- touch swipe;
- click on a year marker;
- `ArrowLeft` and `ArrowRight`;
- `Home` and `End`.

After an interaction completes, the next autoplay movement is scheduled for `3 seconds` later.

Pointer interactions pause autoplay from pointer down until pointer up, pointer cancel, or lost pointer capture. Keyboard interaction resets the three-second resume timer on every supported key press.

Keyboard focus must not cause autoplay to move while the user is actively navigating. Pointer clicks on year markers must still resume after three seconds even though the clicked button retains DOM focus. Use focus-visible or input-modality tracking rather than pausing indefinitely for all `focus-within` states.

### Discoverability

Add a small bilingual hint near the progress area:

- Vietnamese: `Kéo hoặc vuốt để khám phá`
- English: `Drag or swipe to explore`

The hint:

- uses existing secondary typography and muted color;
- includes a subtle horizontal gesture cue, not a navigation button;
- fades out after the first successful drag, swipe, year click, or keyboard navigation during the current page mount;
- remains visible for users who have not interacted;
- is hidden when the timeline has no horizontal overflow.

Add soft left and right edge fades to the timeline viewport. Each fade is visible only when more content exists in that direction. The fades must not block pointer input and must disappear at the corresponding boundary.

### Progress Indicator

- The existing progress fill continues to represent the current horizontal position from the beginning to the end of the timeline.
- It remains non-interactive and is not exposed as a slider.
- A short decorative red glint may travel along the filled portion when autoplay advances.
- The glint pauses during manual interaction and is removed under reduced motion.

## Motion Specification

### Active Reveal

Use a restrained direction-aware reveal inspired by ReactBits `AnimatedContent`:

- when moving forward, the incoming active copy and card begin about `10-12px` to the right;
- when moving backward, they begin about `10-12px` to the left;
- they settle to zero offset while opacity increases;
- the animation lasts roughly `420-520ms` and does not affect layout measurements.

### Color Focus

- Non-current milestone images use slightly reduced saturation and contrast while remaining legible.
- The current image returns to full color with the existing active emphasis.
- The transition is a smooth crossfade; avoid blur filters that can make historical photographs look soft.

### Rail Feedback

- The newly active year dot performs one restrained pulse when the active milestone changes.
- The pulse is event-driven, not an infinite animation.
- The year and copy color transitions remain aligned with the active-card movement.

### Reduced Motion

Under `prefers-reduced-motion: reduce`:

- disable directional translation, dot pulse, decorative glint, and animated color crossfades;
- retain immediate centering, manual navigation, the interaction hint, edge-state updates, and active styling;
- avoid autoplay if the existing reduced-motion policy disables it.

## ReactBits Evaluation

The project has the `@react-bits` registry configured. Relevant MCP items were reviewed:

- `Carousel`: rejected because it would replace the current timeline structure and interaction model.
- `AnimatedContent`: use its short distance, opacity, and ease-out principles as motion inspiration.
- `SpotlightCard`: rejected after review; no pointer-follow spotlight will be added.
- `ScrollFloat`, `Magnet`, and heavier shader effects: rejected as unrelated or visually excessive for this section.

No ReactBits component needs to be installed. The selected behavior can be implemented inside the existing timeline controller and CSS, avoiding a second carousel state system.

## Implementation Boundaries

### Rendering

`src/render.js` may add only:

- the bilingual gesture hint;
- semantic ids or data attributes needed to associate the hint and timeline viewport.

The milestone DOM order, year markers, copy, cards, images, and progress structure remain intact.

### Timeline Controller

`src/timeline.js` remains the single owner of timeline behavior. It should manage:

- current index and centered position;
- autoplay scheduling and cancellation;
- the three-second interaction resume;
- pointer drag state;
- keyboard navigation;
- movement direction;
- hint dismissal;
- left/right edge availability;
- progress and ARIA state.

Prefer a single reschedulable timeout over a fixed interval. Every navigation path must go through one movement function so autoplay, drag settling, year clicks, and keyboard controls cannot disagree about the active milestone.

### Styling

`src/styles.css` owns:

- gesture hint appearance and dismissal;
- edge fades;
- grab/grabbing feedback;
- direction-aware active reveal;
- image color focus;
- one-shot dot pulse;
- progress glint;
- reduced-motion overrides.

No new layout grid, card shell, or navigation row is introduced.

## Accessibility

- Keep the timeline viewport keyboard focusable with a clear focus-visible treatment.
- Support `ArrowLeft`, `ArrowRight`, `Home`, and `End` without affecting unrelated page shortcuts.
- Keep clickable year markers as native buttons.
- Continue updating `aria-current="step"` for the centered milestone and marker.
- Associate the viewport with the gesture hint through `aria-describedby` while the hint is present.
- Do not announce every autoplay change through an `aria-live` region; repeated automatic announcements would be disruptive.
- Edge fades and progress glint are decorative and hidden from assistive technology.

## Failure Handling

- If the timeline has no overflow or fewer than two usable milestones, disable autoplay, hide the hint, hide edge fades, and set progress to its completed state.
- Recalculate centered positions and edge state on resize without resetting the user's current milestone.
- Cancel all timers, animation frames, observers, and listeners during cleanup or language rerender.
- Ignore unsupported key presses and non-primary mouse buttons.
- Clamp all programmatic targets so the first and final milestones remain reachable.

## Testing Strategy

### Automated Tests

- Autoplay advances exactly one milestone per cycle.
- Only one autoplay timer can exist.
- Pointer down prevents autoplay advancement.
- Pointer release schedules the next move three seconds later.
- Year click and supported keyboard keys reset the three-second timer.
- `Home` and `End` reach the first and final milestones.
- Active milestone remains the item closest to the viewport center during manual scrolling.
- Hint dismissal occurs after the first successful interaction.
- Edge-state classes update at the first, middle, and final positions.
- Reduced motion removes decorative animations and retains navigation.

### Browser QA

Verify at `390px`, `768px`, `1024px`, and `1440px`:

- initial `1996` state;
- autoplay cadence and smooth settling;
- three-second resume after interaction;
- mouse drag and touch swipe;
- year-marker navigation;
- keyboard navigation and focus visibility;
- edge fades at both boundaries;
- hint visibility and dismissal;
- no horizontal page overflow;
- no active-card clipping;
- no timer-driven jump while dragging;
- Vietnamese and English copy;
- reduced-motion behavior.

## Acceptance Criteria

- The user can understand how to explore the timeline without arrow buttons.
- Autoplay never competes with an active gesture and resumes three seconds after interaction.
- The current milestone always matches the item nearest the viewport center.
- The layout remains visually unchanged apart from the small hint and edge fades.
- Motion feels more alive but stays within the Hino visual system.
- The progress bar remains passive.
- No spotlight effect or new carousel dependency is added.
- Automated tests, production build, and responsive browser QA pass.
