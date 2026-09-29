# AI handoff — Ví Rõ 2.0

## Scope and source

Static Vietnamese personal finance app for GitHub Pages: `ngochuymedia1/vi-ro`, branch main. This revision started from inspected GitHub commit `2df66216451e7c5eeebf99e89c03ed730060ed59`; local original sources matched it. No backend, authentication, analytics, currency API, bank connection, cloud sync or service worker. User asked for compact modern UI, USD support and customizable funds.

## File ownership

| File | Responsibility |
|---|---|
| index.html | Shell, CSP, navigation, currency switch, dialog, ordered scripts |
| styles.css | Original styling plus v2 compact overrides; responsive layouts and bundled font faces |
| assets/fonts/* | Be Vietnam Pro regular, medium, semibold; unmodified TTFs and SIL OFL |
| legacy-v1.js | Frozen v1 engine under ViRoV1; CommonJS export for migration / regression tests |
| core.js | v2 pure engine: validation, chronological replay, funds, FX, migration, import / export |
| storage.js | Optimistic concurrency, persistent snapshots, v1 preservation, failure handling |
| app.js | Forms, dashboard, fund management, filters, warnings, exports, optional WebMCP read tool |
| tests/core.test.cjs | 17 retained v1 regression tests |
| tests/v2.test.cjs | 26 v2 ledger / FX / migration / storage tests |
| tests/ui.test.cjs | 6 jsdom DOM integration flows; no native browser / layout assertions |
| package.json | Optional development-only jsdom; no runtime dependency or build |
| README.md | Current user guide, formulas, limits, FX semantics |
| HUONG_DAN_GITHUB.md | GitHub Pages upload and v2 update guidance |

Runtime order: legacy-v1.js → core.js → storage.js → app.js, all deferred. All assets relative for repository subpaths. Fonts are bundled, no third-party runtime requests. Public code is safe to host; never include user backup data in the repository.

## Schema 2

State: `{schema:2,currency:'VND',revision,updatedAt,initialized,openingDebt,funds,settings,transactions}`.

Fund: `{id,name,kind,opening,budget,goal,archived}`. Kind spend/save/borrow. IDs spend/save/borrow are permanent default funds with matching kind; exactly one borrow fund exists. Default funds cannot archive. New custom funds start at opening 0; allocation happens with transfers, not fabricated income. Names unique ignoring case and surrounding spaces, max 80 characters in engine (UI new/edit field currently 60). Max 100 funds including archived. No hard delete; archive only at zero current balance. Changing fund kind through saveFund is forbidden; rename / limits / goal are editable.

Settings: integer budget, integer fxRate (0 unset or 1..1,000,000 VND per USD), display VND/USD, dueDate, dueAmount. USD display requires nonzero fxRate. Budget is one shared monthly limit, not historical per-month records. Per-fund budget is independent advisory limit, not additional money. Savings targets are per fund; old global goal migrates to default save fund.

Transaction: `{id,date,type,amount,interest,account,to,category,note,fx}`. Types income/expense/transfer/loan/repay. Account and to reference fund IDs. Integer amount / interest in VND; normally amount >0, but repayment allows amount=0 when interest>0. Interest only on repayment; to only for transfer. ISO local calendar date, no future entry; note <=200 and category <=60. Maximum 10,000 transactions, 1e12 per monetary field / account balance; cumulative transaction volume must remain a safe integer. IDs exclude prototype-sensitive values and reserved debt input key.

FX is null for VND or `{currency:'USD',units,interestUnits,rate}`. USD units are integer cents. Convert with BigInt `(cents*rate+50)/100`, then validate VND bound. Principal and interest round separately. Validator requires exact agreement with stored VND amounts. Rate and original USD are frozen per transaction. Changing settings.fxRate only changes approximate USD presentation; no revaluation entries or real USD accounts. Last USD transaction rate becomes current display rate. Changing currency in form clears amount / interest to avoid interpreting old units as new ones. Manual rate only; no market-rate freshness claim.

## Ledger invariants

Replay by date, then original array index for same-day order. Validate referenced funds before replay. A debit may draw only from its chosen fund; no automatic spillover. Revalidate full history on edit/delete and opening adjustments. Archived funds may retain historical entries but must replay to zero; new/edit transactions require unarchived funds.

Income adds to a non-borrow fund. Expense reduces selected cash without reducing debt. Transfer only between non-borrow funds; total cash / net / income / expense remain unchanged. Loan adds to borrow cash and debt. Repayment checks source cash BEFORE any released cash, reduces principal liability, charges interest to expense. If borrowed cash exceeds remaining liability, release excess into default spend fund. This intentionally preserves v1 semantics and balances. Borrow fund cannot transfer into private funds, preventing debt money from losing its warning classification.

Aggregate spend/save totals include every fund of that kind. Total = spend+save+borrow. Net = total-debt. Reports separate principal and loan from income/expense. Per-fund stats also show transferIn/transferOut. Current balances all-time; month limits reports. No automatic interest accrual, bank import, multiple individual creditor accounting, notifications while closed or repeat-payment engine.

## Migration and persistence

Storage key remains `viro:v1:` + normalized pathname (final index.html removed), preventing loss from a namespace change. Store.load validates and migrates in memory; does NOT immediately overwrite source. Migration validates v1 with original engine, maps default funds / goal and inserts fx:null. It compares spend/save/borrow/debt/total/net before returning. Same-day ordering preserved. Names that would collide are kept at safe defaults; long old names accepted up to 80.

First save over valid schema1 preserves exact original once under `:before-v2` before new state write. This immutable pre-upgrade copy survives subsequent writes; UI can export a real v1 backup. `:previous` remains last successful pre-write valid state. `:last-export` tracks initiation of download, not disk verification. Imported v1 JSON also migrates. v2 JSON cannot be read by old app; user needs old backup for rollback.

Store.save captures expected raw string at invocation, then compares persisted AND in-memory base inside optional navigator.locks callback. This handles other tabs and queued stale same-tab snapshots. Without Web Locks, read/compare is not an atomic multi-process guarantee. In-memory state changes only after successful write. Failed quota writes leave current ledger unchanged (previous snapshot may already have been refreshed). Corrupt source blocks normal writes; explicit validated import/recovery can replace it. Never silently reset on load failure. Whole-state replay / JSON is intentional for a small bounded ledger, not an unlimited database.

Backup wrapper `{app:'ViRo',version:2,exportedAt,data}`. Accept versions1/2, max8MB; require schema matching version, validate and whitelist fields. Import replaces after preview, never merges. Raw rescue export is not normal import format. Reset requires acknowledgement and retains previous valid snapshot. JSON unencrypted, browser-local, same-origin scripts can read it. No user finance data is transmitted by application code.

## UI rules

New compact neutral/cyan design with actual Vietnamese font. Keep names and notes escaped. IDs validated. Borrowed expense / savings debit / advisory budget overspend generate explicit acknowledgement; changing amount/date/rate/source invalidates previous acknowledgement. Overspending a plan remains recordable with confirmation, actual cash shortage is rejected. UI shows USD originals with original rate plus VND book values. Upper VND/USD switch changes display only.

Use native dialog, labeled controls, Escape support and opener focus recovery. Forms retain values on validation failure; successful writes render updated views. Fund history uses same transaction list filter. CSV preserves VND and FX columns, quotes cells and prefixes dangerous formula-leading strings. Optional document.modelContext summary is read-only and shares same state.

## Verification and remaining limits

49 tests passed: 17 v1 +26 v2/store +6 jsdom UI flows. UI flows exercise setup, every view, create fund, allocation, USD conversion/edit/display, warnings, invalid input, v1 migration and plan saves. Syntax checks pass. DOM tests execute actual application scripts with only native dialog/download stubs. They do not validate pixels or native dialog behavior.

Native browser visual QA unavailable: local preview connection refused and headless browser installation failed. No claim of desktop/mobile screenshot verification. Optional WebMCP registration not exercised in supported native browser. Read back remote commit and check Pages status after publication; record any deployment failure separately from application validation.

## Maintenance

Inspect current GitHub/source first. Preserve existing unrelated files and compare branch head before publishing; use atomic commit rather than uploading mixed schema files separately. Never serve new core with old app or omit legacy-v1.js/storage.js/fonts. Add targeted tests for ledger/FX/migration changes and keep this file current. No npm/build required for end users; npm only for optional test dependency. Do not auto-fetch exchange rates or add cloud storage/API credentials without a scoped request.
