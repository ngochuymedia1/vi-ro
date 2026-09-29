# AI handoff — Ví Rõ 1.0

## Purpose / current delivery

A dependency-free Vietnamese personal finance static web app for GitHub Pages. User-facing instructions are in README.md and HUONG_DAN_GITHUB.md. No backend, bank access, API key, authentication, remote database, analytics, auto sync, or service worker. Source was prepared for user upload; no GitHub repository was created or deployed by the assistant.

## Ownership / architecture

| File | Responsibility |
|---|---|
| index.html | App shell, navigation, accessible dialog, script order and CSP |
| styles.css | Responsive dashboard, mobile layout, form and modal styling |
| core.js | UMD pure ledger, validation, import/export schema, reporting; CommonJS-compatible for tests |
| app.js | DOM UI, local persistence, dialogs, filters, exports, optional WebMCP read tool |
| tests/core.test.cjs | Node built-in test suite covering financial invariants and import validation |
| README.md | User guide, formulas, privacy, limits, local development |
| HUONG_DAN_GITHUB.md | GitHub web upload and Pages setup without npm |

Script order: core.js then app.js, both defer. The app is an IIFE with state private to the closure. No runtime third-party dependencies or build. All assets relative so a Pages repository subpath works. All user strings must pass `esc` before HTML interpolation. IDs validated before use. CSP blocks connections, plugins and arbitrary inline scripts; inline CSS allowed for computed progress widths. CSV cells neutralize formula-leading characters and quote content.

## Model schema 1

State: `{schema:1,currency:'VND',revision,updatedAt,initialized,opening,settings,transactions}`.

Opening: integer `{spend,save,borrow,debt}`. Borrow must not exceed debt initially. These balances exist before all recorded transactions; no opening date.

Settings: integer budget, goal, dueAmount; goalName string ≤80; dueDate empty or ISO date. Budget is one default for every month, not a historical month-specific plan. Due date is a manually maintained next-payment reminder, not a schedule engine.

Transaction: `{id,date,type,amount,interest,account,to,category,note}`. Date is local calendar ISO day, not future; same-day order is original array order. Amount positive integer; interest nonnegative and only permitted on repayment. Accounts spend/save/borrow; types income/expense/transfer/loan/repay. Note ≤200, category ≤60. Maximum 10,000 transactions, 1e12 per amount / account balance, safe-integer cumulative volume.

Loan received adds borrowed cash and debt. Borrowed expenditure reduces cash and net value, never the liability. Transfer only spend↔save. Repayment checks source funds BEFORE any release of restricted cash, then subtracts principal+interest and reduces debt by principal. If remaining borrowed cash exceeds remaining debt, the excess becomes spend cash. This prevents paid-off cash remaining incorrectly classified as borrowed. Explain this rule when changing the model. Interest-only payments currently use expense; repayment requires positive principal.

Replay transactions chronologically to derive balances. Reject any historical negative account, excess principal repayment, bad date or integer. Removing/editing an old record revalidates the full ledger. Reports distinguish income, expense+interest, principal and loan. Net in this app covers only tracked cash minus principal liability.

## Storage / concurrency / backup

localStorage key = `viro:v1:` + location pathname, normalizing a final index.html. Previous valid snapshot stored under `:previous`, last export-request timestamp under `:last-export`. Last export only means download initiated, not disk-write verification.

`commit` validates, compares the persisted string to loaded baseRaw, uses Web Locks when available, writes previous snapshot then new state, and only updates in-memory state after success. Without Web Locks the compare detects common stale writes, but is not an atomic cross-process guarantee. The storage event prompts reload; stale tab cannot overwrite observed changed data. localStorage synchronous storage and full replay are suitable for a small personal ledger, not unlimited records.

On corrupt initial state, do not silently overwrite. Expose raw rescue export and previous snapshot recovery / validated import. Import wrapper `{app:'ViRo',version:1,exportedAt,data}` max 8 MB, validate before confirmation, whitelist known fields. Import replaces, never merges; current valid state becomes recovery snapshot. Reset preserves a recovery copy and requires acknowledgement. No encryption; same-origin scripts can access storage. User backups must never be committed publicly.

## UX / accessibility

Current balances are all-time; month selector controls period reporting. Expenses red, additions green, loan receipts amber, transfers cyan. Caution requires checked acknowledgement before consuming borrowed cash or savings. Overspending a plan remains recordable; overspending an actual fund is rejected. Budget includes interest and excludes principal / transfers.

HTML dialog provides native modal semantics, Escape handling and focus trap in compatible browsers; opener focus restored where still connected. Forms have labels and error announcements. Mobile CSS stacks cards / forms. No visual imagery or external fonts. Optional `document.modelContext` read-only tool is feature detected; reads the same current ledger and selected month stats, accepts only an empty object. It is not required to use the app.

## Validation completed / remaining

`node --test tests/core.test.cjs`: 17 passing financial / schema / replay tests at delivery. `node --check core.js` and `node --check app.js` pass. Static HTML and asset references checked. Browser visual / interaction QA and actual WebMCP runtime validation were unavailable in the execution environment; do not describe these as browser-tested. GitHub Pages publish and user data entry remain user-side steps.

Before changes inspect actual sources; preserve schema or implement migrations. Never silently reset state on load errors or parse invalid money as zero. For new changes run focused regression tests and update this handoff. Avoid adding cloud storage or tokens merely to automate backup unless explicitly authorized. Do not remove the warning checks or include borrowing in income.
