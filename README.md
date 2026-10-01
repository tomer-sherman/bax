# Bax

**B**rowser **A**rtificial intelligence e**X**tension — a Chrome extension that reads the page you're on and answers questions about it.

Built with Plasmo · TypeScript · Cheerio · LangChain · OpenAI

> **Status: work in progress.** The full background pipeline works end to end — the agent reads the live page and answers from it. Right now it's triggered from the service worker console; the chat UI (side panel) is next.

---

## How it works

1. The user asks a question.
2. Background asks the content script on the active tab for the page's HTML.
3. My scraper strips the junk (scripts, nav, ads, cookie banners, hidden elements) and turns what's left into **numbered, markdown-style lines** — headings keep their level, lists, tables and quotes keep their shape.
4. An AI agent gets the question plus two tools, and decides on its own what to read.
5. The agent answers from the page content only.

## The two tools

Instead of dumping a whole page into the prompt, the agent works the way a person scans an article:

| Tool | What it does |
|------|-------------|
| `skim_page` | Returns every line, numbered and cut short — a cheap table of contents. |
| `read_lines` | Returns full lines from `from` to `to`. |

The agent skims first, spots which section answers the question, and reads only those lines. Long pages stay cheap, and the answer stays focused. Markdown-style lines were a deliberate choice — it's the format LLMs read best, and the line numbers give the agent an exact way to ask for a range.

---

## Architecture

A Chrome extension isn't a normal front / back / database split, so I mapped it onto the REST structure I already know:

| Extension part | Plays the role of |
|----------------|-------------------|
| Popup / side panel | The frontend |
| Background service worker | The backend — agent, tools, scraper, API key |
| Chrome messages | The HTTP calls / routes between them |
| Content script | An external API I write myself — the only part that can touch the page |

**Why scraping happens in background, not in the content script:** the content script is injected into every page the user opens, so it stays tiny — it only replies with the HTML when asked. Cheerio, the scraper and the agent all live in background, right where the lines are used.

### Project structure

```
src/
├── contents/
│   └── page-reader.ts      Listens for "get-html" and replies with the page HTML.
└── background/
    ├── index.ts            Entry point (currently exposes a test trigger).
    ├── agent/
    │   ├── bax.ts          The agent: model + tools + a manual tool-calling loop.
    │   ├── skim-tool.ts
    │   └── read-lines-tool.ts
    ├── service/
    │   └── page-service.ts Finds the active tab, gets its HTML, returns page lines.
    └── utils/
        ├── scraper.ts      Cheerio-based cleaning and line building.
        └── app-config.ts
```

### The agent loop

I wrote the agent loop myself instead of using LangChain's `createAgent` (see bundler notes below). It's small:

1. Send the messages to the model.
2. If it asks for tools, run them and add the results as tool messages.
3. Repeat until it answers without calling a tool — capped at 8 steps as a safety net.

---

## Tech stack

| Tool | Role |
|------|------|
| **Plasmo** | Extension framework (hot reload, file-based entries and messaging). |
| **TypeScript** | Everything. |
| **Cheerio** | Parses and cleans the page HTML in background. |
| **LangChain** (`@langchain/core`, `@langchain/openai`) | Tool definitions and the chat model. |
| **zod** | Tool input schemas. |
| **OpenAI `gpt-4o-mini`** | The model, for now. |
| **pnpm** | Package manager. |

---

## Running it locally

```bash
pnpm install
```

Create a `.env` file in the project root:

```
PLASMO_PUBLIC_OPENAI_API_KEY=your-key-here
```

```bash
pnpm dev
```

Then in Chrome:

1. Go to `chrome://extensions` and turn on **Developer mode**.
2. **Load unpacked** → select `build/chrome-mv3-dev`.
3. Open any normal website.
4. Click Bax's **service worker** link to open the background console, and run:

```js
await testAgent("what is this page about?")
```

> **On that key:** Plasmo inlines any `PLASMO_PUBLIC_` variable into the extension bundle at build time, so this setup is for local testing only. The plan is for users to bring their own key, stored in `chrome.storage`.

---

## Bundler notes (lessons learned)

Plasmo runs on Parcel 2.9, which is older than what many modern packages expect. Things that broke and how I fixed them:

- **Import from `@langchain/core`, not `langchain`.** The full `langchain` package pulls in Node-only code (`node:worker_threads`), which fails the build.
- **zod is pinned to `3.24.4`.** From 3.25 on, zod changed its package layout, and Parcel hands you a half-built `z` (`z.number is not a function`).
- **After any dependency change, delete `.plasmo` and `build`** before testing — otherwise you may be testing a cached bundle.
- **`dotenv` doesn't work in an extension.** It reads `.env` from disk at runtime, and Chrome has no disk access. Plasmo injects `PLASMO_PUBLIC_` variables at build time instead.

---

## What's next

- **`ask` message route** so the UI can talk to background.
- **Side panel chat UI** — stays open next to the page, unlike a popup — with markdown rendering for answers.
- **User-owned API keys** stored in `chrome.storage`, plus a settings screen.
- **One page snapshot per question**, so `skim_page` and `read_lines` always see the same line numbers on pages that change while the agent works.
- **Provider-agnostic models** — swap OpenAI for any LangChain chat model.
- **Multi-turn chat** — right now each question is a fresh, single-message run.