# Component Library

This document defines reusable UI components for Intentionally.

Every component should feel authentic, calm, safe, premium, and intentional. The system should learn from Apple polish, Hinge intentionality, and Headspace calm without copying any of them directly.

## Navigation

### Top Navigation

- Purpose: Provide orientation, account actions, and access to core app areas.
- When to use: At the top of protected app surfaces and admin/founder surfaces.
- Visual style: Cream surface, subtle border, warm brown text, restrained shadow.
- Behaviour: Stays predictable; desktop may be sticky, mobile should not crowd content.
- Accessibility requirements: Use semantic `nav` where appropriate, clear labels, visible focus states.
- Animation: Minimal; no distracting transitions.
- Emotional goal: Help users feel grounded and oriented.
- Do's: Keep labels clear and stable.
- Don'ts: Add promotional content or competing CTAs.

### Bottom Navigation

- Purpose: Provide thumb-friendly access to primary mobile destinations.
- When to use: Mobile protected app shell.
- Visual style: Cream floating bar, sage active state, rounded but restrained.
- Behaviour: Fixed to bottom with safe-area padding.
- Accessibility requirements: Use `aria-current` for active item and readable labels.
- Animation: Subtle active-state transition only.
- Emotional goal: Make movement through the app feel calm and predictable.
- Do's: Keep item count low.
- Don'ts: Cover primary actions or modal sheets.

### Progress Indicator

- Purpose: Show where a user is in a guided flow.
- When to use: Onboarding, scheduling, Vibe Check preparation, multi-step safety flows.
- Visual style: Sage progress over soft neutral track.
- Behaviour: Reflects real progress, not pressure.
- Accessibility requirements: Provide text equivalent for screen readers.
- Animation: Smooth but quick progress changes.
- Emotional goal: Reduce uncertainty.
- Do's: Show meaningful milestones.
- Don'ts: Use urgency, streaks, or shame.

### Back Button

- Purpose: Let users safely return to the previous step.
- When to use: Detail pages, modal flows, multi-step forms, scheduling.
- Visual style: Minimal icon/text button with warm brown or muted text.
- Behaviour: Returns without data loss where possible.
- Accessibility requirements: Clear accessible label.
- Animation: None or simple page transition.
- Emotional goal: Preserve user control.
- Do's: Make escape routes obvious.
- Don'ts: Trap users in sensitive flows.

## Buttons

### Primary

- Purpose: Represent the main meaningful next step.
- When to use: Submit, continue, send invite, join Vibe Check, confirm plan.
- Visual style: Sage or warm dark primary, high contrast, large tap target.
- Behaviour: One primary action per decision area.
- Accessibility requirements: Descriptive label, visible focus, disabled state when unavailable.
- Animation: Subtle press or hover feedback.
- Emotional goal: Create confidence without pressure.
- Do's: Use for real progress.
- Don'ts: Use for manipulative urgency.

### Secondary

- Purpose: Offer a safe alternative action.
- When to use: Maybe later, preview demo, edit, suggest another time.
- Visual style: Cream/card surface, warm border, calm text.
- Behaviour: Lower emphasis than primary.
- Accessibility requirements: Clear label and focus state.
- Animation: Subtle hover/press feedback.
- Emotional goal: Preserve choice.
- Do's: Make alternatives easy to find.
- Don'ts: Compete visually with the primary action.

### Ghost

- Purpose: Provide low-emphasis utility actions.
- When to use: Close, dismiss, continue browsing, minor navigation.
- Visual style: Transparent or very soft surface, warm text.
- Behaviour: Should not change critical state without confirmation.
- Accessibility requirements: Icon-only ghost buttons need accessible labels.
- Animation: Soft hover background.
- Emotional goal: Keep the interface quiet.
- Do's: Use for reversible actions.
- Don'ts: Hide important actions as ghost buttons.

### Destructive

- Purpose: Signal removal, rejection, report, block, or irreversible action.
- When to use: Safety actions, deletes, private pass decisions.
- Visual style: Muted destructive tone, not alarmist.
- Behaviour: Confirm when consequences are significant.
- Accessibility requirements: Clear consequence language.
- Animation: None beyond basic feedback.
- Emotional goal: Make serious actions clear and safe.
- Do's: Explain what happens.
- Don'ts: Use fear or shame.

### Loading

- Purpose: Show an action is being processed.
- When to use: Submitting forms, confirming schedule, sending invite.
- Visual style: Same button footprint with loading text or spinner.
- Behaviour: Prevent duplicate submission.
- Accessibility requirements: Announce loading state where relevant.
- Animation: Small, calm spinner or text change.
- Emotional goal: Reassure users that the app is responding.
- Do's: Keep layout stable.
- Don'ts: Leave users uncertain.

### Disabled

- Purpose: Show an action is currently unavailable.
- When to use: Missing required fields, unavailable slots, incomplete conditions.
- Visual style: Reduced opacity with readable text.
- Behaviour: Should be paired with explanation when not obvious.
- Accessibility requirements: Do not rely on colour alone.
- Animation: None.
- Emotional goal: Avoid confusion or blame.
- Do's: Explain how to become eligible.
- Don'ts: Disable without context in complex flows.

## Cards

### Discover Card

- Purpose: Present a potential match with enough context for intentional choice.
- When to use: Discover feed.
- Visual style: Photo-led, premium framing, clear prompt and readiness signals.
- Behaviour: Supports like/pass without blurring profile cards.
- Accessibility requirements: Meaningful text alternatives where images communicate identity.
- Animation: Minimal; no addictive swiping loops.
- Emotional goal: Encourage thoughtful judgment.
- Do's: Highlight intention and context.
- Don'ts: Turn discovery into a game.

### Match Card

- Purpose: Confirm mutual interest and explain the next step.
- When to use: Match modal, Vibe Check entry points.
- Visual style: Warm card, clear identity, sage action.
- Behaviour: Leads toward guided invite or Vibe Check flow.
- Accessibility requirements: Dialog semantics when overlayed.
- Animation: Gentle reveal only.
- Emotional goal: Make a match feel meaningful and safe.
- Do's: Explain chat unlock conditions.
- Don'ts: Pressure immediate response.

### Profile Card

- Purpose: Summarise a user's own or another user's profile details.
- When to use: Profile, review, discover side panels.
- Visual style: Cream surface, subtle border, clear hierarchy.
- Behaviour: Supports scanning and editing.
- Accessibility requirements: Structured headings and readable labels.
- Animation: None unless state changes require clarity.
- Emotional goal: Help users feel represented accurately.
- Do's: Keep information honest and legible.
- Don'ts: Encourage performative optimisation.

### Chat Preview

- Purpose: Show context before entering or continuing chat.
- When to use: Chat list, chat unlock, post-Vibe Check surfaces.
- Visual style: Calm card with message context and relationship status.
- Behaviour: Opens chat only when permitted.
- Accessibility requirements: Include sender/context labels.
- Animation: Subtle unread/state change.
- Emotional goal: Keep conversation intentional.
- Do's: Surface relevant Vibe Check context.
- Don'ts: Create urgency or unread anxiety.

### Date Plan

- Purpose: Help users create or review a thoughtful date plan.
- When to use: Date planning flow.
- Visual style: Warm, practical, reassuring.
- Behaviour: Supports selection, sharing, and confirmation.
- Accessibility requirements: Clear selected states and labels.
- Animation: Gentle success feedback.
- Emotional goal: Make planning feel easy and respectful.
- Do's: Clarify next steps.
- Don'ts: Overload with too many options.

### Notification

- Purpose: Surface timely product updates or safety-relevant information.
- When to use: Vibe Check reminders, invite status, safety updates.
- Visual style: Small, calm, brand-coloured.
- Behaviour: Actionable only when useful.
- Accessibility requirements: Announce important notifications appropriately.
- Animation: Minimal entrance and exit.
- Emotional goal: Inform without startling.
- Do's: Be specific.
- Don'ts: Use fake urgency.

## Inputs

### Text Input

- Purpose: Capture written user information.
- When to use: Login, onboarding, profile, chat, feedback.
- Visual style: Cream/card surface, warm border, clear focus ring.
- Behaviour: Validate calmly and preserve user input.
- Accessibility requirements: Labels, errors, autocomplete where appropriate.
- Animation: None beyond focus state.
- Emotional goal: Make expression feel safe.
- Do's: Use helpful microcopy.
- Don'ts: Shame users for errors.

### Search

- Purpose: Help users find or filter information.
- When to use: Admin, future discovery/filter contexts.
- Visual style: Simple text field with clear placeholder.
- Behaviour: Should not hide important defaults.
- Accessibility requirements: Label and clear control when needed.
- Animation: Minimal.
- Emotional goal: Give users control.
- Do's: Keep results understandable.
- Don'ts: Over-filter human compatibility.

### Date Picker

- Purpose: Capture a date accurately.
- When to use: Date of birth, scheduling, date planning.
- Visual style: Native-friendly, explicit light theme, clear labels.
- Behaviour: Prevent invalid or unsafe choices.
- Accessibility requirements: Keyboard and screen-reader usable.
- Animation: Native or minimal.
- Emotional goal: Reduce friction.
- Do's: Explain constraints.
- Don'ts: Rely on ambiguous formats.

### Time Picker

- Purpose: Capture or choose time slots.
- When to use: Vibe Check scheduling, date planning.
- Visual style: Clear slot cards or native control with sage selected state.
- Behaviour: Show time zone and availability clearly.
- Accessibility requirements: Selected state should not rely on colour alone.
- Animation: Subtle selection feedback.
- Emotional goal: Make planning feel low pressure.
- Do's: Show few high-quality options.
- Don'ts: Force rushed choices.

### Voice Input

- Purpose: Capture spoken input when it improves expression.
- When to use: Future prompts, reflection, accessibility support.
- Visual style: Calm recording state, clear consent boundary.
- Behaviour: Requires explicit start/stop and clear processing state.
- Accessibility requirements: Text alternative and manual input fallback.
- Animation: Gentle recording indicator.
- Emotional goal: Make expression more natural.
- Do's: Make privacy obvious.
- Don'ts: Record without clear consent.

### Video Controls

- Purpose: Control video participation and privacy.
- When to use: Vibe Check rooms and previews.
- Visual style: Familiar icons, clear labels, calm contrast.
- Behaviour: Always reflect current camera/mic state.
- Accessibility requirements: Accessible labels and keyboard operation.
- Animation: Clear state changes only.
- Emotional goal: Help users feel safe and in control.
- Do's: Make mute/camera states unmistakable.
- Don'ts: Hide privacy controls.

## Feedback

### Loading

- Purpose: Communicate progress during waiting states.
- When to use: Data fetches, submissions, route transitions.
- Visual style: Soft skeletons or concise text.
- Behaviour: Avoid layout shift.
- Accessibility requirements: Announce longer loading where relevant.
- Animation: Subtle, reduced-motion friendly.
- Emotional goal: Prevent uncertainty.
- Do's: Keep users oriented.
- Don'ts: Use distracting loaders.

### Empty State

- Purpose: Explain absence of content and suggest next step.
- When to use: No matches, no plans, no messages.
- Visual style: Calm card or panel with one clear action.
- Behaviour: Should not imply user failure.
- Accessibility requirements: Clear heading and description.
- Animation: None or very subtle.
- Emotional goal: Reassure and guide.
- Do's: Be honest.
- Don'ts: Shame or pressure users.

### Error State

- Purpose: Explain what went wrong and how to recover.
- When to use: Failed requests, validation, unavailable flows.
- Visual style: Warm destructive tone, not alarming.
- Behaviour: Offer retry or next safe action.
- Accessibility requirements: Errors linked to affected fields where possible.
- Animation: None.
- Emotional goal: Restore confidence.
- Do's: Use plain language.
- Don'ts: Expose technical noise to users.

### Success State

- Purpose: Confirm meaningful completion.
- When to use: Invite sent, Vibe Check completed, plan created.
- Visual style: Sage, warm, memorable.
- Behaviour: Explain what happens next.
- Accessibility requirements: Announce success state.
- Animation: Gentle entrance or glow.
- Emotional goal: Make progress feel safe and earned.
- Do's: Celebrate mutual effort.
- Don'ts: Exaggerate or gamify.

### Celebration State

- Purpose: Add delight to meaningful relationship progress.
- When to use: Mutual continue, completed Vibe Check, confirmed plan.
- Visual style: Soft glow, warm copy, restrained motion.
- Behaviour: Short-lived and non-blocking.
- Accessibility requirements: Respect reduced motion.
- Animation: Subtle, never casino-like.
- Emotional goal: Create healthy dopamine.
- Do's: Make it emotionally safe.
- Don'ts: Use streaks, confetti overload, or popularity signals.

## Overlays

### Modal

- Purpose: Focus attention on a contained decision or message.
- When to use: Match confirmation, important status, focused forms.
- Visual style: Cream surface, warm border, soft backdrop.
- Behaviour: Trap focus while open; close safely where appropriate.
- Accessibility requirements: `role="dialog"`, labelled heading, close control, Escape support.
- Animation: Gentle fade/scale.
- Emotional goal: Create clarity without panic.
- Do's: Keep content concise.
- Don'ts: Use modals for routine navigation.

### Bottom Sheet

- Purpose: Present focused mobile actions without leaving context.
- When to use: Mobile prompts, invite actions, contextual options.
- Visual style: Rounded top sheet, safe-area aware, cream surface.
- Behaviour: Sits above bottom navigation and avoids covering primary controls badly.
- Accessibility requirements: Dialog semantics and focus management.
- Animation: Smooth slide up/down.
- Emotional goal: Feel native, calm, and manageable.
- Do's: Keep actions limited.
- Don'ts: Create stacked sheets.

### Confirmation Dialog

- Purpose: Confirm meaningful or irreversible choices.
- When to use: Cancel, delete, pass, report, block, reveal-sensitive actions.
- Visual style: Clear title, consequence copy, primary/secondary balance.
- Behaviour: Requires explicit choice.
- Accessibility requirements: Focus management and clear button labels.
- Animation: Minimal.
- Emotional goal: Prevent regret.
- Do's: Explain consequences.
- Don'ts: Use ambiguous labels like "OK" for serious actions.

### Safety Dialog

- Purpose: Support safety decisions and escalation.
- When to use: Reporting, blocking, privacy warnings, consent boundaries.
- Visual style: Calm, serious, supportive, not sensational.
- Behaviour: Gives clear choices and preserves user autonomy.
- Accessibility requirements: Plain language, keyboard accessible, screen-reader clear.
- Animation: None or very subtle.
- Emotional goal: Help users feel protected and believed.
- Do's: Provide clear next steps.
- Don'ts: Minimise harm or make safety feel secondary.
