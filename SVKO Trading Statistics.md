# SVKO Trading Statistics

Script: [SVKO Trading Statistics.user.js](SVKO%20Trading%20Statistics.user.js), version `0.4.4`.

## Open statistics

The compact header places “Your trading archive stored in Userscript” on the right beside the close controls, using the original 12 px text size.

Choose **Open trading statistics** in Tampermonkey on an ordinary website. Alternatively, bookmark an HTTPS page with `#svko-trading-statistics` appended to its address and load that bookmark. The panel opens over that page. No particular dashboard site, server or additional extension is required.

Ordinary-page startup registers only the menu command and checks for the explicit bookmark fragment. It does not load the archive, initialise charts, access broker data or add UI until requested. The script runs in the top frame only. Browser-internal pages and extension pages are outside its scope.

The archive belongs to this userscript's Tampermonkey storage and is shared across its matching websites in the same browser profile. It does not use IndexedDB or site localStorage. A Trade Nation tab is needed to collect new transactions, but not to view saved statistics.

Charts and JSON imports require an HTTPS page for the browser's cryptographic and locking APIs. HTTP pages still offer the menu and stored tables. A page's content security policy may prevent chart execution; the panel reports the error. Opening the same archive on another HTTPS page is supported.

## Collect history

On either signed-in Trade Nation platform, CFD at `platform-cfd.tradenation.com/Advanced.aspx` or Spread at `platform.tradenation.com/Advanced.aspx`, the script automatically pulls once after the matching USD account label is identified. The host and CFD/Spread label must agree. Other base currencies remain unsupported. There is no periodic background pull. If the broker populates its account label asynchronously, one temporary observer watches only `#divAccountFlag` and disconnects when ready or after 30 seconds. After that, **Refresh view** can reveal the manual pull controls if the account took longer to initialise.

**Data → Pull data** offers recent records, 7/30/90 days, a custom positive number of days, or all available history. The default first pull collects all available records. Later incremental pulls start from the last successful pull with at least three days of overlap. Explicit day limits are respected even on the first pull. **Stop import** stops between requests and retains records already saved.

All original API fields are stored, including fields not currently used by the charts. Records are keyed by source, account and broker reference. CFD retains the existing `trade-nation-cfd` source and Spread uses `trade-nation-spread`, so even equal account IDs or references cannot collide. Select an account to view it separately; All accounts combines their USD results. Data offers links to the relevant CFD or Spread platform when opened elsewhere. Manual pull and verification controls are shown only when the selected account matches the signed-in account, or All accounts is selected. Automatic pulls always belong to the identified signed-in account. Unchanged records are not rewritten. More recently retrieved corrections replace the same record; identity conflicts are preserved separately and stop that pull. Every pull checks all available history against a separate broker export, including records outside the incremental overlap. A full API pull is needed to refresh all original fields of older records. The broker may no longer provide older records, so keep the local archive and backups.

The CFD importer initialises `GetTransactionHistoryByCurrency` with page `0`, `transType: 1`, the selected `days`, and an empty `currencyCode`. Spread uses `GetTransactionHistory` with the same pagination parameters and no currency argument, matching its native platform. Both preserve all 17 API fields. The response's first page is `1`; continuation requests use `2` through `totalPages`. Requests run sequentially and validate page numbers, total pages, duplicate references and the signed-in account. Opening other broker history queries while importing may replace the server's cached result; avoid overlapping queries. Those checks detect inconsistent responses but cannot establish a server-side snapshot.

Only a pull with a matching broker export check marks its interval complete. Disconnected intervals are not presented as continuous coverage. A GM lease coordinates imports across websites, while native Web Locks prevent concurrent imports on the same origin. The cross-origin lease is best-effort because GM storage has no atomic compare-and-set. Run one import at a time. An abandoned lease expires after ten minutes.

## Views and filters

Account, instrument and date filters apply to the analytics views. Data use only the account filter and always compare the whole available export. The initial period is the last 30 calendar days. The selected Account and Period are saved automatically in Tampermonkey preferences and restored after page refresh or reopening the panel. Custom dates retain their exact range. Calendar has its own saved `calendarMonth`, separate from the shared `period` and custom dates used by the other views. In Calendar, a native Month picker replaces Period, From and To. Month arrows, keyboard navigation and the picker update only the calendar selection. Switching tabs or refreshing restores each selection independently. Account and instrument remain shared. Until a calendar month is explicitly selected, Calendar opens on the current month in the reporting time zone. Relative presets are recalculated against the current date. Invalid or unfinished date edits do not replace the last valid selection. Account, the shared period and the calendar month are included in JSON backups. If the saved account is absent from the archive, the panel falls back to All accounts. Other presets include today, yesterday, 7/90 days, this year, all stored data and custom dates. Dates are grouped in the browser's time zone unless overridden in Settings.

- **Overview:** total return, closed-position P/L, adjustments, cumulative return, daily return, trade counts, long/short counts, winners/losers/flat, win rate, average profit/loss, profit/loss ratio and profit factor.
- **Calendar:** Monthly grid starting on Sunday by default (Monday is available in Settings) with six rows of fixed 119 px cells with 16 px rounded corners, including empty days. Trading cells show the amount, then trade count, then the formula with a short, subtle divider centred vertically in the gap between the trade count and formula. Days with closed trades use the original reference green (`#16a654`) or muted red, with a stronger shade above the configured thresholds. Text on green and red cells is white, except the main amount of the best day, which is bright yellow (`#ffeb00`). All main daily amounts use the same 16 px size; days without trades retain normal font weight. Exactly one populated day in the displayed month is highlighted: the highest net result (P/L plus adjustments), with the earliest date winning a tie. Empty months have no highlight. Fixed daily net thresholds in Settings determine the vivid shade: gains above USD 60 and losses greater than USD 40 in magnitude by default. Exactly at the threshold uses the normal colour. The same result has the same colour across months; there is no monthly scaling. Days without closed trades use the original light grey background (`#f4f6f8`) and show only a normal weight amount, without a breakdown or trade count. The footer says “Empty cells mean no stored activity.” Trading days retain the compact equation, for example `P/L -$5.72 − $7.24 = -12.96`. The month heading shows `Month P&L: closed P/L ± adjustments = net · count closed trades`, including adjustments on days without trades. The entire monthly summary line is green for a positive net result and red for a negative result. A zero result always retains the normal text colour, regardless of trade count. Select a day to inspect source postings. The dialog reserves scrollbar space so changing months does not shift the calendar horizontally. A compact 11 px coverage notice sits immediately below the month name. Coverage notices for missing historical data read “DATA DOES NOT COVER THE FULL SELECTED PERIOD. SHOWING AVAILABLE RECORDS.” in all capitals. For the current calendar month, coverage is checked only through today, so future days do not cause a warning. When coverage through today is complete, the same line shows neutral grey “CURRENT MONTH”. A future month shows grey “FUTURE MONTH”. Missing earlier data, stale coverage and incomplete pulls still cause the warning. Only this small text line retains its space when the notice is absent, preventing vertical movement without a separate warning banner above the calendar. Icon buttons and Left/Right arrow keys move between months; arrow keys leave filter editing alone and focus the month heading without a blue outline. Tab navigation and button activation retain the normal visible focus indicator. Calendar always displays its independently selected whole month; navigation leaves the other views’ saved dates unchanged.
- **Transactions:** source records in pages of 100, with original currency amounts, USD attribution and broker references. Select a reference to see every original field. Rows use compact vertical spacing and retain their newest first order; column sorting is not offered.
- **Costs:** a combined summary above the instrument table gives Net funding the main emphasis. Funding paid, funding received and the remaining adjustment categories use smaller amounts, followed by a compact Total adjustments line. The instrument table below covers funding postings. Select a column heading to sort ascending; select it again to reverse the order. Monetary columns sort by the signed amount and postings sort numerically. The selected order remains while the panel is open. Rows use compact vertical spacing. Select an instrument to inspect postings.
- **Transfers:** deposits, withdrawals and net deposited, followed by a compact cash-movement table. Internal movements are grey and excluded from these totals. Account and period filters apply; the instrument filter is disabled here. See the matching rules below.
- **Data:** pull controls, import progress, archive count, last successful pull, refresh, latest broker comparison, exact field differences, original-currency control totals and saved change warnings.
- **Settings:** first calendar weekday (Sunday or Monday), reporting time zone, the number of days before the pull reminder appears, separate calendar gain/loss thresholds, USD symbol (`$` by default or `US$`), JSON backup and restore, account coverage, and preserved conflicts.

The first weekday affects only calendar column order and grid alignment, not dates, filters, grouping or calculations. The preference is saved across reloads and included in JSON backups; older settings default to Sunday.

Use **Save preferences** in Settings to persist the first calendar weekday, time zone, pull reminder interval, calendar colour thresholds and USD symbol. The reminder defaults to 3 days and appears next to Close if any selected account has never completed a pull or its last completed pull is older than the interval. Select it to open Data. Failed checks or unreviewed changes also show a Data reminder. It updates when the panel opens, refreshes or renders, without background polling. The previous grey threshold preference is no longer used. The symbol applies throughout the panel, including chart tooltips; other currencies retain their existing labels.

The two uPlot charts have hover dates and amounts, with a subtle vertical cursor snapping to the nearest daily data point. The cumulative chart also shows a small blue hover dot on the line; the daily bar chart has no hover dot. Both use uPlot’s native cursor movement callback. Tooltip position stays anchored to the snapped cursor and moves between positions with a 250 ms CSS transition. Values, the vertical cursor and the cumulative hover dot update immediately. Reduced motion preferences disable the transition. The daily tooltip also shows closed P/L, adjustments and trade counts. There is no range slider or drag-to-select interaction. Charts resize with the panel and are destroyed on view changes or close.

## Deposits, withdrawals and internal transfers

**Transfers** reads recognised `Online Transfer Cash In/Out` postings and their `ProfitLoss` money amounts. Subscription payments, trading results and currency-conversion legs are not deposits or withdrawals. Totals use integer cents and are shown separately for each original currency. Net deposited is deposits minus withdrawals, not the current balance or trading return.

Automatic internal matching uses all saved accounts and dates before applying the display filters. A pair must have opposite amounts in the same currency, different account keys, and timestamps no more than one second apart. Each entry must have exactly one eligible counterpart, and the match must be unique in both directions. Ambiguous matches, zero amounts and invalid or ambiguous dates are never automatically paired. The table shows the other account and reference. This is an inference from the postings, not a broker-provided shared transfer ID. The user approved automatic matching on 2026-09-12 after inspection found 21 unique CFD/Spread pairs with equal amounts and zero- or one-second timestamp differences.

An unmatched valid movement counts as a deposit or withdrawal. Missing history on another account can therefore affect the split; the coverage warning and matching explanation remain visible. A selected account still excludes its internal entries even when the counterpart is outside the selected account or period. All accounts shows both grey legs but excludes both from external totals.

Each row offers automatic, manually internal and manually external classification. A manual external entry blocks automatic pairing with its counterpart. Mark both legs when manually identifying a transfer without an automatic match. Manual choices are saved under validated `settings.transferOverrides`, keyed by the complete source/account/reference key, and included in schema 2 JSON backups. They never modify broker records or trading P/L. Each choice retains a fingerprint of the complete original record; a broker correction invalidates the choice and displays a review notice rather than silently applying an old exclusion to changed data. Returning to automatic removes the override. Invalid cash directions or amounts are shown for review and excluded from totals.

## Automatic broker comparison

After every broker pull, the script requests the broker's complete available transaction export through `GetTransactionHistoryCSVFile.aspx`, using `days=-1` and `transType=1`. CFD includes its empty currency filter; Spread omits that parameter as its native export does. Both exports use the same 12 fields. This is an additional read-only request, independent of the paginated history request. The file is decoded and compared in memory; it is not saved as a download.

The check compares every reference in both directions and every shared field: transaction date, reference, action, description, quantity, opening date, opening price, closing price, P/L, deposit/withdrawal status, balance and currency. Date formatting and insignificant decimal zeros are normalised. For cash entries, the API's blank prices equal the export's zero prices. Control totals include all postings and conversion legs in each original currency. A matching total alone is insufficient: offsetting errors in two records still fail the field comparison.

The five API-only fields (`MarketID`, `TransactionType`, `Symbol`, `Status` and `Message`) cannot be independently checked through this export. Changes in any original API field are recorded when that reference is fetched again. Export `Status` corresponds to API `DepWithStatus`, not API `Status`.

**Data** shows `matched`, `different`, `failed`, `checking` or `pending`, with the time of the latest finished check. It identifies missing references and changed fields, showing the reference, broker date, instrument, previous value and incoming value. **Check broker now** repeats the comparison while signed in to the matching account. It does not update raw transactions or advance import coverage; use **Pull data** to collect corrections.

A detected source change is saved with both complete versions and its field differences before the importer applies an accepted correction. Identity conflicts retain the stored record and stop the import. Export differences never delete or replace records automatically. For a change outside the chosen pull window, pull all available history to retrieve the corrected full API record. Records that disappear from the broker export remain in the archive and are flagged.

Source changes and failed or differing export checks create a persistent warning history and a Tampermonkey notification. The notification contains a summary; selecting it opens Data. The header retains a Data reminder and the Data tab retains warning details even if browser or operating-system notification settings suppress the notification. **Mark saved warnings as reviewed** acknowledges the selected account's warnings without deleting them. A later matching check does not erase earlier changes.

If the request, parsing or import fails, the account is not labelled as freshly verified and its coverage remains incomplete. If a first import intentionally covers only recent days, the complete export will flag older records missing locally; choose all available history to establish the full baseline. A restored JSON archive requires a fresh check: on the matching broker page it runs automatically after restoration; elsewhere the account remains pending until checked on the broker page.

A match means that all 12 exported fields agreed at the recorded check time. It is not proof of the broker's internal database or a server-side snapshot: separate requests can straddle a newly booked transaction, and the broker may stop returning older history. Repeat the pull if activity during collection caused a difference.

## Calculation rules

**Total return = closed-position P/L + booked adjustments.** This is a USD cash result, not a percentage investment return or account equity. Deposits and withdrawals are excluded. Funding and dividends are included when booked, including those related to positions still open.

Recognised adjustments are funding charges, funding refunds, dividends, subscriptions and explicit commissions. Other actions remain unclassified until their meaning is established. A zero for a recognised category means no classified amount was found, not proof that the broker never charges it. There is no invented IG-style attribution for stock borrowing, guaranteed stops or corrections without matching broker data.

Amounts use integer cents and reject totals outside exact integer precision. `ProfitLoss` supplies the money amount; `Amount` is position quantity. Original currency values and all broker conversion legs remain available.

A non-USD economic posting is attributed through matching broker conversion entries at the same source timestamp and currency, within its account. The foreign entries must cancel, the USD sign must agree, and the economic entries must share one category and instrument. The USD group total is counted once. When several postings share a conversion group, the UI labels its amount **Group**; that is not an amount to add again for each row. It is not arbitrarily divided between postings. Unsupported or incomplete conversions are flagged and excluded from USD totals. No current exchange rate is substituted.

A trade count is the count of closed trade P/L postings, including partial closures if the broker posts them separately. Winners and losers use the sign of each original P/L; flat postings count in the win-rate denominator. Win rate is winners divided by all closed postings. Profit/loss ratio is average winning P/L divided by the absolute average losing P/L; profit factor is gross gains divided by gross losses. Monetary trade ratios are unavailable when individual trade USD amounts cannot be established. Price points are unweighted directional price differences and are shown only for one selected instrument.

Raw timestamps have no offset. They are interpreted as London local time and retained verbatim. Ambiguous autumn DST timestamps are flagged; the earlier matching instant is used for grouping. Funding records identify an instrument but provide no reliable position ID, so a specific open-position funding breakdown is not claimed.

Days with no stored activity appear as zero on the charts and empty calendar cells. Coverage warnings and incomplete-posting markers distinguish missing or unresolved data from established results. A full-history filter may warn at the first partial day of available history.

## Storage and backup

Tampermonkey keys use the `svko-stats:` prefix, with one value per account/reference, account coverage metadata, settings, preserved conflicts, a persistent audit journal and a temporary import lease. Aggregation runs in memory when opening or refreshing the panel and when filters change. There is no SQL engine or separate aggregate database.

**Export JSON archive** includes all accounts and raw records, coverage, settings, conflicts and the audit journal in schema version `2`. Schema version `1` backups remain accepted. If the browser asks what to do with the download, choose **Save**. The file contains financial data; keep a copy outside the browser. There is no CSV export.

**Import JSON archive** validates the format before writing and merges by reference. Older backups do not overwrite newer records. Failed imports leave account coverage incomplete; retrying the same backup resumes safely. Unknown schema versions and conflicting references within a file are rejected. A successful import restores the saved display preferences. Older backups without the new preferences use a 3 day pull reminder and `$`. Other open panels use **Refresh view** to read updated storage.

Removing the userscript or browser profile may remove its archive. Development and production have separate GM storage. Export the development archive before switching to production, then import that JSON from the production panel.

## Dependencies and permissions

The only chart dependency is [uPlot](https://github.com/leeoniya/uPlot), MIT licensed, pinned to `1.6.32`. Its JavaScript and CSS are cached as named Tampermonkey resources. JavaScript is SHA-256 checked against the pinned release and executed only when charts open. No framework or runtime package installation is used.

Production grants cover GM storage reads/writes, reading the named chart resource, registering the menu, opening the broker tab and showing change/check notifications. Broker collection uses same-origin authenticated `fetch`; credentials are not copied into the archive. JSON export uses the browser's native file download and import reads the selected file locally. Archive data is not sent to a dashboard server.

## Spread account support

The USD Spread platform uses the same monetary fields, action names and London timestamp format as CFD. `ProfitLoss` remains the booked monetary amount, while `Amount` represents the signed stake per point. Statistics use broker P/L directly, without recalculating it from prices or treating the stake as money. Transfers remain excluded from trading return. Funding refunds, funding charges, dividends and subscriptions use the existing classifications. Spread support was added after inspecting native history requests, API samples and the complete broker CSV export. No existing CFD records need migration.

## Agent instructions

- Follow `AGENTS.md` and `PUBLISH.md`. Use only the existing `SVKO Dev` slot and its permanent universal loader in `SVKO Dev.md`. Do not narrow its grants or matches, or change its fixed local `@require` for ordinary edits. Production grants remain limited to this script's actual needs.
- Register only the menu and check the explicit launch fragment on unrelated websites. No archive reads, DOM insertion, chart execution, broker requests, timers or observers before activation.
- Broker requests must remain read-only and sequential. Never invoke trading methods. Retain the narrow, temporary account-label observer; do not observe the body or whole document or add periodic polling.
- Preserve every raw field, separate accounts and retain conflicts. Never hide unknown categories, fabricate exchange rates or distribute rounded group conversions as exact individual amounts.
- Run the complete broker export comparison after every broker pull and after a matching-account JSON restore. Never inherit a fresh verification claim from a backup, treat a failed check as matched, delete missing references or compare only totals. Preserve both raw versions of detected changes and retain reviewed warnings.
- Keep integer-cent arithmetic and original quantity fields distinct. Do not expose private source data through HTML interpolation. Keep the panel in a closed shadow root and render imported strings as text.
- Maintain the single runnable Node check below using synthetic data. Do not add live account data, credentials or financial exports to this repository.
- Use the existing browser profile for live checks. Browser URL policy blocks on extension pages must not be bypassed. If publication is blocked, retain the working development source and report the remaining manual production installation step.

## Validation and publication status

Run:

```sh
node --check 'SVKO Trading Statistics.user.js'
node 'SVKO Trading Statistics.test.cjs'
```

The check covers exact accounting, FX groups, transfers, incomplete data, London DST, filters, archive validation, deduplication and corrections, pagination, dormant startup, actual importer flow, interrupted storage, coverage gaps and JSON round trips. It also exercises UTF-16 broker exports, quoted CSV fields, formatting normalisation, offsetting discrepancies, missing records, older changes outside the incremental window, notifications, failed verification, audit backup validation and all five Funding sort columns in both directions, and the calendar colour thresholds for gains, losses and zero. Pass a filename argument to check the development source instead.

On 2026-09-11, the universal loader was updated by the user and successfully loaded this script in the existing Edge profile. Live checks collected 3,365 unique records across 337 pages, reconciled the archive total against the broker's independent export, and verified an incremental pull with zero new or changed records. The panel, chart hover, calendar, date filtering, funding breakdown, JSON download and re-import were exercised. The archive was also viewed from an unrelated HTTPS page. The plain HTTP test site failed to load; it did not validate HTTP chart support.

Version `0.2.0` was also checked live against 3,366 local and exported records, with zero differing references across all 12 shared fields. Synthetic tests verified correction warnings and failures without changing live financial records.

Version `0.2.1` was checked in the existing Edge dashboard: Funding headings reverse the row order correctly, Transactions headers remain static, and both tables have reduced row spacing.

Version `0.2.2` adds three colour levels per calendar sign. Threshold checks passed and the September calendar was visually checked in the existing Edge dashboard.

Version `0.2.3` was visually checked in the existing Edge calendar: days without closed trades use grey, and each populated cell shows its P/L equation. Synthetic checks cover both signs at and above the USD 5 threshold.

Version `0.2.4` was checked in Edge for preference saving across reloads, both USD symbols and the shortened calendar equation. The live settings were left at the defaults of USD 5 and `$`. Synthetic tests cover custom thresholds, invalid preferences, formatting and preference backup restoration.

Version `0.3.0` was checked in Edge for white days without trades, normal and dark trading colours, the monthly P/L equation, and Left/Right keyboard month navigation with retained focus. Data contains the archive status, refresh and broker comparison; Overview and Calendar omit those controls. Settings shows the 3 day reminder default. Synthetic tests cover reminder expiry, missing pull dates, mixed account ages and the two colour thresholds.

Version `0.3.6` was checked in Edge for fixed gain/loss preferences, subtly more vivid colours and equal calendar cell heights. Synthetic tests cover each threshold boundary, custom limits, days without trades, preference validation and backup restoration.

Version `0.4.0` was checked live on the USD Spread platform: 827 API records across 83 pages matched all 12 shared fields in the full broker export with zero differing references. A repeat incremental pull retained 827 Spread records and the separate CFD archive retained 3,434 records. All seven observed action types were recognised. Synthetic checks cover host/account-label mismatches, unsupported currencies, separate archives even when IDs and references match, correct endpoint payloads, unchanged-record handling and combined JSON backup validation.

Version `0.4.1` was checked in the existing Edge dashboard: 51 cash movements produced 21 unique internal pairs, displayed as 42 grey entries excluded from external totals. Selecting Spread retained 21 excluded entries and zero external deposits/withdrawals. A temporary manual external override survived reload, changed both sides of the totals as expected, and was returned to automatic. Synthetic checks cover one-second and date-boundary pairing, ambiguous and same-account matches, separate currencies, invalid directions, manual overrides, source changes, JSON round trips and unchanged trading P/L.

Version `0.4.2` was checked in Edge: navigating Calendar to July left the shared custom August range unchanged, and both survived reload independently. The Month picker returned Calendar to September with a grey CURRENT MONTH notice. Synthetic checks cover month lengths and leap years, preference independence, JSON restoration, current-day coverage, missing earlier data, stale pulls and future months.

Production version `0.4.4` was installed by the user and verified on 2026-09-12. The development file was emptied after its full source matched the production repository file. The validated development JSON backup was imported into the separate production storage, restoring two accounts, 4,261 records and preferences. Fresh production pulls matched all 12 exported fields for 3,434 CFD records at 02:21:28 and 827 Spread records at 02:21:39 Europe/Belgrade, with zero differing references. The standalone dashboard retained the restored account, period and calendar month after reload; keyboard month navigation also worked. The single SVKO Dev loader remains available with an empty source file.

The migration backup is `/Users/cvladan/Downloads/Trading Statistics 2026-09-12.json`. The development identity's original GM archive has been retained. No further installation or migration step is pending.

## Licence

Open source + commercial licence. The current source is supplied under the [SVKO Personal Use and Commercial Licence 1.0](https://trading.cvladan.com/licensing/). Individuals may download, run, study and modify it free of charge for personal use, including trading real money for their own profit. Company use or use for an employer or client requires a separate paid commercial agreement, including internal use, integration, hosting, bundling and free distribution to customers.

Source code is public; business use is restricted, so this is not an OSI open-source licence. Third-party material retains its own licence. This update changes licensing notices only; the executable code and installed-version history are unchanged.
