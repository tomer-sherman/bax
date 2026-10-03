# Popup design: "The Highlighter"

Read this before you touch the popup's styling.

- Styles: `src/popup/index.css` (the only file you style in)
- Markup: `src/popup/index.tsx` (read only, see Rules)

## Rules

These are standing rules for any agent working on the popup design.

1. **CSS only.** Edit only the popup's existing CSS file (`src/popup/index.css`). Do not modify, rename, or create any `.ts` or `.tsx` file.
2. **Extend, don't overhaul.** Keep every existing rule, token, and visual decision. Reuse the existing custom properties (colors, spacing, radii, type sizes). Add a new token only when nothing existing fits, and define it next to the existing ones in the same style.
3. **Ask before markup changes.** If the design needs a markup change (for example, a className or an extra wrapper element), stop BEFORE writing any CSS and ask the user. List each change with the file, the exact line to add or change, and why it's needed. Wait for the answer. If the answer is no, build the best version possible with the existing markup.

## Theme

### Concept

Bax reads a noisy page and marks the one thing you needed. The popup is a sheet of cool paper with blue-black ink and graphite. There is one accent with one meaning: **Bax blue is Bax's mark.** At full strength it marks things: the bar in the margin beside an answer, the sweep while Bax reads, and the rose icon. The pale tint (`--mark-soft`) only ever sits behind text (the wordmark swipe, `<strong>`, selection), so text stays readable. The interface uses a sans; Bax's answers use a reading serif.

In the chat, your words sit on the same white sheet as the field you typed them into, on the right. Bax's answers keep the marker in the margin, on the left. Never color the user's messages blue: blue means Bax.

### Color

| Token | Hex | Used for |
|---|---|---|
| `--paper` | `#f8fafd` | Popup background |
| `--sheet` | `#ffffff` | Input field, user's chat messages |
| `--ink` | `#121722` | Text, send key, focus rings |
| `--graphite` | `#566070` | Secondary text (captions, hint, list markers) |
| `--pencil` | `#6e7787` | Placeholder, disabled key glyph |
| `--noise` | `#e3e8f0` | The "page lines" illustration, disabled key, `pre` border |
| `--rule` | `#d6dce6` | Field and user-message border |
| `--rule-strong` | `#aeb7c6` | Hovered field border, scrollbar thumb |
| `--mark` | `#2b5bf5` | **Bax blue**: answer margin bar, reading sweep, rose, link underline |
| `--mark-soft` | `#cadbff` | Tint behind text only: wordmark swipe, `strong`, selection |
| `--wash` | `#eff3f9` | Disabled field, inline `code`, `pre` |
| `--alarm` | `#c0271c` | Validation error text and border |
| `--alarm-wash` | `#fdeeec` | Validation error background |

### Type

| Token | Value |
|---|---|
| `--font-ui` | Segoe UI Variable Text / Segoe UI / system-ui… (sans) |
| `--font-read` | Charter / Sitka Text / Iowan Old Style / Cambria / Georgia (serif, for answers) |
| `--font-code` | ui-monospace / Cascadia Mono / SF Mono / Consolas… |
| `--text-xs` | 12.5px (error) |
| `--text-sm` | 13.5px (captions, hint) |
| `--text-ui` | 15px (interface, field, user messages) |
| `--text-read` | 16px (Bax's answers) |
| `--text-brand` | 16px (wordmark, weight 650) |
| `--leading-ui` | 1.4 |
| `--leading-read` | 1.62 |

### Space

`--s1` 4px · `--s2` 8px · `--s3` 12px · `--s4` 16px · `--s5` 20px · `--s6` 28px

### Shape (each radius belongs to one kind of thing)

| Token | Value | Belongs to |
|---|---|---|
| `--r-field` | 14px | The field and things on its sheet (user messages) |
| `--r-key` | 9px | The send key (field radius minus its 5px inset, so the corners are concentric) |
| `--r-chip` | 4px | Inline code |
| `--r-block` | 8px | Blocks: error, `pre` |
| `--r-swipe` | `3px 7px 4px 8px / 7px 3px 8px 4px` | The hand-drawn marker swipe behind "Ask Bax" |
| `--mark-w` | 4px | Width of the answer's margin bar |

### Size

`--popup-w` 520px (wider makes answer lines too long to read) · `--popup-h` 600px (Chrome's popup ceiling) · `--field-h` 50px · `--key` 38px · `--icon` 26px · `--icon-gap` 10px

The page illustration ("four lines of noise", used by the empty state and the loading state) is built from `--line-h` 6px, `--line-gap` 13px, `--page-lines`, `--page-sizes`, `--page-pos` and `--page-h`.

### Motion

| Token | Value |
|---|---|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `--t-fast` | 120ms (hover, press) |
| `--t-mid` | 220ms (focus glow, settle) |
| `--t-draw` | 520ms (marker drawing down the margin) |
| `--t-read` | 2.6s (one loop of the reading sweep) |

| Keyframes | What it does |
|---|---|
| `bax-mark` | The answer's margin bar draws from top to bottom |
| `bax-settle` | Fade in plus a 4px rise. Used by answers, user messages, and the chat's loading block |
| `bax-read` | The marker sweeps the four page lines, one stroke per line |

Under `prefers-reduced-motion: reduce`, every animation and transition inside `.IndexPopup` is switched off. The reading marker rests on one line, and the chat scrolls instantly instead of smoothly.

## Markup map

```tsx
<div className="IndexPopup">
  <form>
    <label><span className="brand-icon"><img/></span>Ask Bax</label>
    <input type="text"/>
    <button aria-label="Ask"/>
    {error && <span role="alert">…</span>}
  </form>
  <p></p>                                        {/* always empty: the first-open hint */}
  <div className="chat" role="log" ref={chatRef}>  {/* empty until the first question */}
    {chat.map(m => <div key={m.id}>
      <p className="humanMessage">…</p>  or  <p className="baxResponse">…</p>
    </div>)}
    {loading && <span>Loading...</span>}
  </div>
</div>
```

Behavior that lives in the TSX rather than the CSS: a `useEffect` calls `chatRef.current.lastElementChild.scrollIntoView({ block: "nearest" })` whenever `chat` or `loading` changes. Long answers open at their first line, and short ones scroll fully into view. Smoothness comes from the CSS (`scroll-behavior` on `.chat`), so reduced motion is respected there. `role="log"` makes screen readers announce new messages.

## Components

### Popup states

| State | Trigger | Layout |
|---|---|---|
| First open | `.chat` is `:empty` | Flex column: form (wordmark + field) on top, empty-state hint centred below |
| Chat | `.IndexPopup:has(> .chat:not(:empty))` | Grid with areas `brand / chat / field / error`. The form becomes `display: contents`, so its children land in the popup's grid. The wordmark stays top-left, the log fills the middle, and the field is pinned at the bottom |

### Parts

| Part | Selector | Purpose |
|---|---|---|
| Root | `.IndexPopup` | Fixed 520×600 sheet of paper, never scrolls (`overflow: hidden`) |
| Ask form | `.IndexPopup form` | Grid (`brand / field / error`). `display: contents` in chat mode |
| Wordmark | `.IndexPopup label`, `label::before` | Rose plus "Ask Bax", with the `--mark-soft` hand-drawn swipe behind the text |
| Rose | `.IndexPopup .brand-icon`, `.brand-icon img` | A green PNG re-inked to Bax blue through blend modes (grayscale, screen over blue, multiply onto paper) |
| Field | `.IndexPopup input` | White sheet with `--r-field`. Hover: `--rule-strong`. Focus: ink edge plus a blue glow. Disabled: dashed and washed |
| Send key | `.IndexPopup button`, `button::before` | Ink key set inside the field. The arrow is a CSS mask. Hover turns it blue and nudges the arrow, press scales it down |
| Validation error | `.IndexPopup form > span`, `[role="alert"]` | `--alarm` on `--alarm-wash`, under the field. Also turns the field border red |
| Answer typography | `.IndexPopup > p`, `.IndexPopup .baxResponse` | Reading serif, `--text-read` / `--leading-read`, `pre-wrap`, wraps long words and URLs, blue margin bar (`background … local`) |
| Answer entrance | `.IndexPopup > p:not(:empty)`, `.IndexPopup .baxResponse` | `bax-mark` + `bax-settle` |
| Rich text in answers | `… :is(ul, ol)`, `li`, `strong`, `a`, `code`, `pre` | Ready for markdown if it's ever rendered as HTML. Today answers are plain text |
| Empty state | `.IndexPopup > p:empty`, `::before`, `::after` | First-open illustration (page lines with one line marked) and the hint text |
| Loading | `.IndexPopup > span`, `.IndexPopup .chat > span` (+ `::before`, `::after`) | Four noise lines with the blue marker sweeping them, captioned "Reading the page". The span's own text stays for assistive tech |
| **Chat log** | `.IndexPopup .chat` | Scrolls inside its own area. Edges fade into the paper (`mask-image`), the scrollbar gutter is held (`stable`), `scroll-padding` keeps scrolled-to messages clear of the fade, and it scrolls smoothly |
| Chat focus | `.IndexPopup .chat:focus-visible` | Ink ring; the fade lifts so the ring shows |
| **Chat rhythm** | `.chat > * + *` and the two `:has()` sibling rules | Same speaker again: `--s2`. Answer (or loading) under its question: `--s4`. A new question after an answer: `--s6` |
| **User message** | `.IndexPopup .humanMessage` | Right-aligned, `fit-content` up to 85% wide. White `--sheet` with a `--rule` border, `--r-field`, and the field's 1px shadow. UI sans at `--text-ui`, ink. Enters with `bax-settle` |
| **Bax message** | `.IndexPopup .chat .baxResponse` | The answer typography above, flowing in the log. `margin: 0` and `overflow: visible`, so it is not a nested scroller (one would swallow the scroll wheel) |
| **Chat loading** | `.IndexPopup .chat > span` | Indented to the answer's text column (`--mark-w + --s4`) so the answer lands in its place. Enters with `bax-settle` |

### Legacy rules (kept per Rule 2)

Some rules were written for the earlier single-answer markup, where the answer filled `.IndexPopup > p` and the loading span was a direct child of `.IndexPopup`. These don't match the current markup but are kept: `.IndexPopup:has(> span) …` (hide hint, dim previous answer, add air), `.IndexPopup > span`'s `order: -1` and `margin-top`, and the non-empty `.IndexPopup > p` scrolling behavior.

### Gotchas

- Chat mode depends on `.chat` being truly `:empty` when there are no messages. Don't add whitespace text or always-rendered children inside it.
- The empty `<p></p>` must stay a direct child of `.IndexPopup`. It is the first-open hint.
- Anything inside `.chat` that sets `overflow` creates a nested scroller. Keep message elements at `overflow: visible`.
- `--mark` is only for Bax. User-side elements use `--sheet`, `--rule` and `--ink`.

## Full CSS

The CSS file in the codebase (`src/popup/index.css`) is the source of truth. If this copy and the file ever differ, the file wins.

```css
/*
  Bax popup — "The Highlighter".
  Bax reads a noisy page and marks the one thing you needed.
  One accent, one meaning: Bax blue is Bax's mark. Full-strength it marks
  (the margin beside the answer, the sweep while Bax reads, the rose);
  the pale tint only ever sits behind text, so text stays readable.
  Everything else is cool paper, blue-black ink and graphite.
  Sans for the interface, a reading serif for the answer.
  In the chat, your words sit on the white sheet you typed them on (right);
  Bax's answers keep the marker in the margin (left).
*/

:root {
  /* color */
  --paper: #f8fafd;
  --sheet: #ffffff;
  --ink: #121722;
  --graphite: #566070;
  --pencil: #6e7787;
  --noise: #e3e8f0;
  --rule: #d6dce6;
  --rule-strong: #aeb7c6;
  --mark: #2b5bf5; /* Bax blue */
  --mark-soft: #cadbff;
  --wash: #eff3f9;
  --alarm: #c0271c;
  --alarm-wash: #fdeeec;

  /* type */
  --font-ui: "Segoe UI Variable Text", "Segoe UI", system-ui, -apple-system,
    BlinkMacSystemFont, "SF Pro Text", Roboto, "Helvetica Neue", sans-serif;
  --font-read: Charter, "Bitstream Charter", "Sitka Text", "Iowan Old Style",
    Cambria, Georgia, serif;
  --font-code: ui-monospace, "Cascadia Mono", "SF Mono", Consolas, Menlo,
    monospace;
  --text-xs: 12.5px;
  --text-sm: 13.5px;
  --text-ui: 15px;
  --text-read: 16px;
  --text-brand: 16px;
  --leading-ui: 1.4;
  --leading-read: 1.62;

  /* space */
  --s1: 4px;
  --s2: 8px;
  --s3: 12px;
  --s4: 16px;
  --s5: 20px;
  --s6: 28px;

  /* shape — each radius belongs to one kind of thing */
  --r-field: 14px;
  --r-key: 9px; /* field radius minus the 5px inset: concentric */
  --r-chip: 4px;
  --r-block: 8px;
  --r-swipe: 3px 7px 4px 8px / 7px 3px 8px 4px; /* hand-drawn marker */
  --mark-w: 4px;

  /* size */
  --popup-w: 520px; /* wider makes the answer's lines too long to read */
  --popup-h: 600px; /* Chrome's popup ceiling */
  --field-h: 50px;
  --key: 38px;
  --icon: 26px;
  --icon-gap: 10px;

  /* the "page" Bax reads: four lines of noise */
  --line-h: 6px;
  --line-gap: 13px;
  --page-lines: linear-gradient(var(--noise), var(--noise)),
    linear-gradient(var(--noise), var(--noise)),
    linear-gradient(var(--noise), var(--noise)),
    linear-gradient(var(--noise), var(--noise));
  --page-sizes: 100% var(--line-h), 84% var(--line-h), 93% var(--line-h),
    52% var(--line-h);
  --page-pos: 0 0, 0 calc(var(--line-gap) * 1), 0 calc(var(--line-gap) * 2),
    0 calc(var(--line-gap) * 3);
  --page-h: calc(var(--line-gap) * 3 + var(--line-h));

  /* motion */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --t-fast: 120ms;
  --t-mid: 220ms;
  --t-draw: 520ms;
  --t-read: 2.6s;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  background: var(--paper);
  overflow-x: hidden;
}

/* ---------- root ---------- */

.IndexPopup {
  display: flex;
  flex-direction: column;
  width: var(--popup-w);
  height: var(--popup-h);
  padding: var(--s5) var(--s5) var(--s6);
  overflow: hidden;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-ui);
  font-size: var(--text-ui);
  line-height: var(--leading-ui);
  -webkit-font-smoothing: antialiased;
}

/* ---------- ask ---------- */

.IndexPopup form {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas:
    "brand"
    "field"
    "error";
  flex: none;
}

/* the wordmark: the rose, then "Ask Bax" highlighted the way you'd mark a page */
.IndexPopup label {
  grid-area: brand;
  justify-self: start;
  position: relative;
  isolation: isolate;
  display: inline-flex;
  align-items: center;
  gap: var(--icon-gap);
  margin: 0 0 var(--s3);
  padding: 0 2px 0 0;
  /* a solid backdrop so the rose's white tile can multiply away into it */
  background: var(--paper);
  color: var(--ink);
  font-size: var(--text-brand);
  font-weight: 650;
  letter-spacing: -0.012em;
  line-height: 1.3;
}

.IndexPopup label::before {
  content: "";
  position: absolute;
  z-index: -1;
  inset: 0.5em -5px 0.02em calc(var(--icon) + var(--icon-gap) - 4px);
  border-radius: var(--r-swipe);
  background: var(--mark-soft);
  transform: rotate(-1.4deg) skewX(-10deg);
}

/* the icon is a green rose on an opaque white tile; re-ink it in Bax blue:
   the image goes black-on-white and screens over blue (blue rose on white),
   then the tile multiplies onto the paper (the white disappears) */
.IndexPopup .brand-icon {
  flex: none;
  display: block;
  width: var(--icon);
  height: var(--icon);
  background: var(--mark);
  mix-blend-mode: multiply;
}

.IndexPopup .brand-icon img {
  display: block;
  width: 100%;
  height: 100%;
  filter: grayscale(1) contrast(12);
  mix-blend-mode: screen;
}

/* the field: one white sheet, the send key set inside it */
.IndexPopup input {
  grid-area: field;
  width: 100%;
  min-width: 0;
  height: var(--field-h);
  margin: 0;
  padding: 0 calc(var(--key) + var(--s4)) 0 var(--s4);
  border: 1px solid var(--rule);
  border-radius: var(--r-field);
  background: var(--sheet);
  box-shadow: 0 1px 0 rgb(18 23 34 / 0.05);
  color: var(--ink);
  font: inherit;
  font-size: var(--text-ui);
  caret-color: var(--ink);
  outline: none;
  transition: border-color var(--t-fast) ease, box-shadow var(--t-mid) var(--ease-out);
}

.IndexPopup input::placeholder {
  color: var(--pencil);
}

.IndexPopup input:hover:not(:disabled) {
  border-color: var(--rule-strong);
}

/* focus: the edge goes to ink (the visible indicator), Bax's yellow wraps it */
.IndexPopup input:focus,
.IndexPopup input:focus-visible {
  border-color: var(--ink);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--mark) 22%, transparent);
}

.IndexPopup input:disabled {
  border-style: dashed;
  background: var(--wash);
  color: var(--graphite);
  cursor: not-allowed;
}

.IndexPopup input::selection {
  background: var(--mark-soft);
  color: var(--ink);
}

/* send: an ink key inside the field; the arrow is drawn here */
.IndexPopup button {
  grid-area: field;
  justify-self: end;
  align-self: center;
  position: relative;
  width: var(--key);
  height: var(--key);
  margin: 0 6px 0 0;
  padding: 0;
  border: 0;
  border-radius: var(--r-key);
  background: var(--ink);
  color: var(--paper);
  cursor: pointer;
  transition: background-color var(--t-fast) ease, color var(--t-fast) ease,
    transform var(--t-fast) var(--ease-out);
}

.IndexPopup button::before {
  content: "";
  position: absolute;
  inset: 0;
  margin: auto;
  width: 16px;
  height: 16px;
  background: currentColor;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 8h10M9 4l4 4-4 4'/%3E%3C/svg%3E")
    center / contain no-repeat;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 8h10M9 4l4 4-4 4'/%3E%3C/svg%3E")
    center / contain no-repeat;
  transition: transform var(--t-mid) var(--ease-out);
}

.IndexPopup button:hover:not(:disabled) {
  background: var(--mark);
  color: var(--sheet);
}

.IndexPopup button:hover:not(:disabled)::before {
  transform: translateX(2px);
}

.IndexPopup button:active:not(:disabled) {
  transform: scale(0.92);
}

.IndexPopup button:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 2px;
}

.IndexPopup button:disabled {
  background: var(--noise);
  color: var(--pencil);
  cursor: not-allowed;
}

/* validation error: rendered as <span role="alert"> inside the form */
.IndexPopup form > span,
.IndexPopup [role="alert"] {
  grid-area: error;
  display: block;
  margin-top: var(--s2);
  padding: var(--s2) var(--s4);
  border-radius: var(--r-block);
  background: var(--alarm-wash);
  color: var(--alarm);
  font-size: var(--text-xs);
  font-weight: 500;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.IndexPopup form:has(> span) input,
.IndexPopup form:has([role="alert"]) input,
.IndexPopup input[aria-invalid="true"] {
  border-color: var(--alarm);
}

.IndexPopup form:has(> span) input:focus,
.IndexPopup form:has([role="alert"]) input:focus,
.IndexPopup input[aria-invalid="true"]:focus {
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--alarm) 16%, transparent);
}

/* ---------- answer: the hero ---------- */

/* Bax's chat messages (.baxResponse) share the answer's look; the chat
   section below only changes how they sit in the log */
.IndexPopup > p,
.IndexPopup .baxResponse {
  flex: 0 1 auto; /* as tall as the answer, scrolls once it hits the bottom */
  min-height: 0;
  margin: var(--s6) 0 0;
  padding: 0 6px 0 calc(var(--mark-w) + var(--s4));
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  /* the marker in the margin: spans the whole answer and scrolls with it */
  background: linear-gradient(var(--mark), var(--mark)) left top / var(--mark-w) 100% no-repeat local;
  color: var(--ink);
  font-family: var(--font-read);
  font-size: var(--text-read);
  font-optical-sizing: auto;
  font-kerning: normal;
  line-height: var(--leading-read);
  text-wrap: pretty;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  scrollbar-width: thin;
  scrollbar-color: var(--rule-strong) transparent;
}

.IndexPopup > p::selection,
.IndexPopup > p *::selection,
.IndexPopup .chat ::selection {
  background: var(--mark-soft);
  color: var(--ink);
}

/* the answer lands: the marker draws down the margin, the text settles */
.IndexPopup > p:not(:empty),
.IndexPopup .baxResponse {
  animation: bax-mark var(--t-draw) var(--ease-out) both,
    bax-settle var(--t-mid) var(--ease-out) 80ms both;
}

/* rich answers, if markdown is ever rendered inside */
.IndexPopup > p :is(ul, ol),
.IndexPopup .baxResponse :is(ul, ol) {
  margin: var(--s2) 0;
  padding-left: 1.25em;
  white-space: normal;
}

.IndexPopup > p li + li,
.IndexPopup .baxResponse li + li {
  margin-top: var(--s1);
}

.IndexPopup > p li::marker,
.IndexPopup .baxResponse li::marker {
  color: var(--graphite);
}

.IndexPopup > p strong,
.IndexPopup .baxResponse strong {
  font-weight: 700;
  background: linear-gradient(transparent 58%, color-mix(in srgb, var(--mark-soft) 90%, transparent) 58%);
}

.IndexPopup > p a,
.IndexPopup .baxResponse a {
  color: var(--ink);
  text-decoration: underline;
  text-decoration-color: var(--mark);
  text-decoration-thickness: 2px;
  text-underline-offset: 2px;
  overflow-wrap: anywhere;
}

.IndexPopup > p a:hover,
.IndexPopup .baxResponse a:hover {
  background: color-mix(in srgb, var(--mark-soft) 70%, transparent);
}

.IndexPopup > p a:focus-visible,
.IndexPopup .baxResponse a:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 2px;
  border-radius: 2px;
}

.IndexPopup > p code,
.IndexPopup .baxResponse code {
  padding: 0.1em 0.35em;
  border-radius: var(--r-chip);
  background: var(--wash);
  font-family: var(--font-code);
  font-size: 0.84em;
  overflow-wrap: anywhere;
}

.IndexPopup > p pre,
.IndexPopup .baxResponse pre {
  margin: var(--s3) 0;
  padding: var(--s3) var(--s4);
  border: 1px solid var(--noise);
  border-radius: var(--r-block);
  background: var(--wash);
  overflow-x: auto;
  white-space: pre;
  font-size: 13px;
  line-height: 1.5;
}

.IndexPopup > p pre code,
.IndexPopup .baxResponse pre code {
  padding: 0;
  background: none;
  font-size: inherit;
}

/* ---------- first open ---------- */

/* a page of noise with one line marked: what Bax does, before you ask */
/* centred in the open space, sitting a little above true centre */
.IndexPopup > p:empty {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 0 var(--s6);
  background: none;
  font-family: var(--font-ui);
  text-align: center;
}

.IndexPopup > p:empty::before {
  content: "";
  display: block;
  width: 200px;
  height: var(--page-h);
  margin-bottom: var(--s5);
  background-image: linear-gradient(var(--mark), var(--mark)), var(--page-lines);
  background-size: 66% calc(var(--line-h) + 4px), var(--page-sizes);
  background-position: 0 calc(var(--line-gap) - 2px), var(--page-pos);
  background-repeat: no-repeat;
  background-blend-mode: multiply;
}

.IndexPopup > p:empty::after {
  content: "Ask about anything on this page.\A Bax reads it and marks the part that matters.";
  display: block;
  color: var(--graphite);
  font-size: var(--text-sm);
  line-height: 1.55;
  white-space: pre-line;
}

/* while Bax reads: hide the first-open hint, dim the previous answer */
.IndexPopup:has(> span) > p:empty {
  display: none;
}

.IndexPopup:has(> span) > p:not(:empty) {
  opacity: 0.32;
  animation: none;
  transition: opacity var(--t-mid) ease;
}

/* ---------- loading: Bax reading the page ---------- */

/* the span's own text ("Loading...") stays for assistive tech; the
   visible caption is drawn in ::after. In the chat the span lives inside
   .chat; the chat section places it there */
.IndexPopup > span,
.IndexPopup .chat > span {
  position: relative;
  display: block;
  flex: none;
  order: -1; /* sits directly under the field, above any previous answer */
  margin-top: var(--s6);
  padding-top: calc(var(--page-h) + var(--s4));
  color: transparent;
  font-size: 0;
  background-image: var(--page-lines);
  background-size: var(--page-sizes);
  background-position: var(--page-pos);
  background-repeat: no-repeat;
}

.IndexPopup form {
  order: -2;
}

/* the marker reads line by line, each stroke the length of its line */
.IndexPopup > span::before,
.IndexPopup .chat > span::before {
  content: "";
  position: absolute;
  top: -2px;
  left: 0;
  width: 100%;
  height: calc(var(--line-h) + 4px);
  border-radius: 2px;
  background: var(--mark);
  mix-blend-mode: multiply;
  transform-origin: left center;
  transform: scaleX(0);
  animation: bax-read var(--t-read) cubic-bezier(0.45, 0, 0.25, 1) infinite;
}

.IndexPopup > span::after,
.IndexPopup .chat > span::after {
  content: "Reading the page" / "";
  display: block;
  color: var(--graphite);
  font-size: var(--text-sm);
  line-height: 1.4;
}

/* with a previous answer below, give the reader some air */
.IndexPopup:has(> span) > p {
  margin-top: var(--s5);
}

/* ---------- chat ---------- */

/* once you ask, the popup becomes a conversation: the wordmark stays where
   it was, the log fills the middle and scrolls on its own, and the field
   drops to the bottom. The form steps aside (display: contents) so its
   brand / field / error areas join the popup's own grid */
.IndexPopup:has(> .chat:not(:empty)) {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr) auto auto;
  grid-template-areas:
    "brand"
    "chat"
    "field"
    "error";
}

.IndexPopup:has(> .chat:not(:empty)) form {
  display: contents;
}

/* the first-open page gives way to the conversation */
.IndexPopup:has(> .chat:not(:empty)) > p:empty,
.IndexPopup .chat:empty {
  display: none;
}

/* the log: its edges fade into the paper, so a line is never cut hard
   against the wordmark or the field; the gutter is held so messages
   don't shift when the scrollbar arrives */
.IndexPopup .chat {
  grid-area: chat;
  min-height: 0;
  margin-bottom: var(--s3);
  padding: var(--s3) 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  scroll-behavior: smooth;
  scroll-padding-block: var(--s3);
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: var(--rule-strong) transparent;
  -webkit-mask-image: linear-gradient(transparent, #000 var(--s3), #000 calc(100% - var(--s3)), transparent);
  mask-image: linear-gradient(transparent, #000 var(--s3), #000 calc(100% - var(--s3)), transparent);
}

/* the log is keyboard-scrollable; on focus the fade lifts so the ring shows */
.IndexPopup .chat:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 2px;
  -webkit-mask-image: none;
  mask-image: none;
}

/* rhythm: the same voice again stays close, an answer sits under its
   question, a new question opens a new exchange */
.IndexPopup .chat > * + * {
  margin-top: var(--s2);
}

.IndexPopup .chat > div:has(> .humanMessage) + :is(div:has(> .baxResponse), span) {
  margin-top: var(--s4);
}

.IndexPopup .chat > div:has(> .baxResponse) + div:has(> .humanMessage) {
  margin-top: var(--s6);
}

/* your words: on the right, on the same white sheet as the field you
   typed them into. Ink, never blue: blue is Bax's */
.IndexPopup .humanMessage {
  width: fit-content;
  max-width: 85%;
  margin: 0 0 0 auto;
  padding: var(--s2) var(--s4);
  border: 1px solid var(--rule);
  border-radius: var(--r-field);
  background: var(--sheet);
  box-shadow: 0 1px 0 rgb(18 23 34 / 0.05);
  color: var(--ink);
  font-size: var(--text-ui);
  line-height: var(--leading-ui);
  text-wrap: pretty;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  animation: bax-settle var(--t-mid) var(--ease-out) both;
}

/* Bax's words: the hero answer, flowing in the log instead of scrolling
   on its own (a nested scroller would swallow the wheel) */
.IndexPopup .chat .baxResponse {
  margin: 0;
  overflow: visible;
  overscroll-behavior: auto;
}

/* Bax reading, in the slot its answer will take: indented to the
   answer's text column, so the answer lands in place */
.IndexPopup .chat > span {
  margin-left: calc(var(--mark-w) + var(--s4));
  animation: bax-settle var(--t-mid) var(--ease-out) both;
}

/* ---------- motion ---------- */

@keyframes bax-mark {
  from {
    background-size: var(--mark-w) 0;
  }
  to {
    background-size: var(--mark-w) 100%;
  }
}

@keyframes bax-settle {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* four lines, four strokes; between strokes the marker lifts off the page */
@keyframes bax-read {
  0% {
    transform: translateY(0) scaleX(0);
  }
  19% {
    transform: translateY(0) scaleX(1);
  }
  23% {
    transform: translateY(0) scaleX(1);
    opacity: 1;
  }
  24.9% {
    opacity: 0;
  }
  25% {
    transform: translateY(var(--line-gap)) scaleX(0);
    opacity: 1;
  }
  44% {
    transform: translateY(var(--line-gap)) scaleX(0.84);
  }
  48% {
    transform: translateY(var(--line-gap)) scaleX(0.84);
    opacity: 1;
  }
  49.9% {
    opacity: 0;
  }
  50% {
    transform: translateY(calc(var(--line-gap) * 2)) scaleX(0);
    opacity: 1;
  }
  69% {
    transform: translateY(calc(var(--line-gap) * 2)) scaleX(0.93);
  }
  73% {
    transform: translateY(calc(var(--line-gap) * 2)) scaleX(0.93);
    opacity: 1;
  }
  74.9% {
    opacity: 0;
  }
  75% {
    transform: translateY(calc(var(--line-gap) * 3)) scaleX(0);
    opacity: 1;
  }
  92% {
    transform: translateY(calc(var(--line-gap) * 3)) scaleX(0.52);
    opacity: 1;
  }
  100% {
    transform: translateY(calc(var(--line-gap) * 3)) scaleX(0.52);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .IndexPopup *,
  .IndexPopup *::before,
  .IndexPopup *::after {
    transition: none !important;
    animation: none !important;
  }

  /* reading without movement: one line marked, the caption says the rest */
  .IndexPopup > span::before,
  .IndexPopup .chat > span::before {
    transform: translateY(var(--line-gap)) scaleX(0.6);
  }

  /* new messages jump into view instead of gliding */
  .IndexPopup .chat {
    scroll-behavior: auto;
  }
}
```
