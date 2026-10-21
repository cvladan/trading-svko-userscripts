# SVKO TradingView Watchlist

Platform group: TradingView

Script: `SVKO TradingView Watchlist.user.js`

## Purpose and behavior

Show a small colored badge next to watchlist symbols with an available premarket or postmarket percentage. Positive percentages are green, negative percentages are red, and zero percentages are amber. All added percentages and white hover prices have a transparent background. Instruments without extended session data have no added visible content until their row is hovered. The native watchlist columns remain unchanged; regular daily percentages are not duplicated.

Hover directly over an extended session badge to show its calculated price in white, regardless of the change direction. Leaving the badge restores the colored percentage through CSS. For instruments without extended session data, hovering anywhere over the row shows its native Last value in white next to the symbol; leaving the row hides it completely. Every pointer entry immediately reads the current values from that row. While the pointer stays over the relevant target, the regular refresh also updates the price.

The calculation uses the regular session Last value and the extended session absolute change, when a separate change field exists inside the extended session cell. Otherwise it uses `Last * (1 + extendedPercent / 100)`. The ordinary daily Change and Chg% columns are never used as extended session changes. The result follows the displayed Last precision. A rounded source percentage can produce an approximate price. The tooltip identifies calculated prices and this limitation.

Both inputs come from the same watchlist row, including native cells hidden by the user's column settings. The script never reads the Details panel, selects a symbol, or requests market data. Missing or invalid extended percentages switch the row to the regular price behavior, which does not require a daily percentage. If an extended percentage is valid but the price is unavailable, that percentage stays visible on hover. If a regular price is unavailable, nothing is added visibly. A change between regular and extended session data clears the previous session's cached hover price.

The script detects the native watchlist widget on any supported page, including symbol and market pages. If no watchlist is present, the existing refresh waits for it to appear. Rows outside the watchlist are ignored.

## Refresh and resource limits

One initial pass and one interval of 1,500 milliseconds update the rendered watchlist rows. Hidden browser tabs skip the entire pass. The script reacquires the watchlist widget only when its cached container is missing or detached. Replacing lists, adding rows, and reusing rows are handled by reading the current DOM on each pass. Data can remain unchanged until the next interval after returning to a hidden tab; hover always reads immediately.

There is one delegated `pointerover` listener and no observers, extra timers, per-row listeners, or persistent storage. Each badge is one element with CSS generated text. The DOM is written only when displayed values change. A grid reserves space for both the percentage and the last calculated price to avoid shrinking the hover target when switching text.

## Installation

Version `0.2.1` runs in the top frame of every page under `https://www.tradingview.com/*`, at `document-idle`, with `@grant none`. It includes the official TradingView favicon. The current source uses the SVKO Personal Use and Commercial Licence 1.0, like the other published SVKO userscripts.

The user confirmed deleting the predecessor, `SVKO TradingView Improve Watchlist`, on 2026-09-14. Create one production Watchlist entry if none exists when publishing. Do not run a second implementation alongside the development source. Follow [PUBLISH.md](PUBLISH.md) for publication and [AGENTS.md](AGENTS.md) for the single development slot.

Version `0.2.0` was installed on 2026-09-14 after the user created and saved its new Tampermonkey entry. Codex reopened the full source through the connected vscode.dev editor and confirmed it matched the repository file. The development disk file was then emptied to zero bytes, and the installed universal loader was left unchanged. Production behavior was verified after reloading TradingView.

Version `0.2.1` was installed on 2026-10-21 through the existing connected vscode.dev editor. Its complete source was copied back after reloading the editor and matched the repository, SHA-256 `5f147c4806368955fe313ee060c96f195c4130ea87c56dd4d6e958d1cb2cc7c4`. All 15 regression scenarios and the syntax check passed, including arbitrary TradingView paths, absent watchlists, late appearance, removal and reopening. Live development checks passed on `/markets/`, which `/symbols/` currently redirects to, and `/symbols/NASDAQ-AAPL/`. Closing and reopening the sidebar retained working badges. White regular prices matched the native Last value on hover and disappeared on exit, with a transparent background. Extended session calculations remain covered by the regression tests; no new live extended session check was performed during the regular session.

After the development file was emptied and production re-enabled, fresh pages showed 38 badges on the symbol page and 44 on the chart, one badge per rendered row and exactly one stylesheet on each page. The production symbol page also passed the white hover price check. The universal development loader remains enabled and unchanged, and `SVKO Dev.user.js` is zero bytes. Website content and screenshots are deferred to a separate task.

## Inspiration and licence

Another author's TradingView watchlist script inspired the idea. The SVKO implementation was written independently and uses the SVKO Personal Use and Commercial Licence 1.0.

## Agent instructions

- Keep exactly one 1,500 millisecond interval and one delegated `pointerover` listener. Do not add observers, more timers, scheduling mechanisms, or per-row handlers.
- Check host, protocol, and frame before accessing the page, registering handlers, or scheduling work. Do not restrict startup to chart paths. Detect the watchlist widget from the page DOM. This also applies under the universal development loader.
- Scope row queries to the watchlist widget. Do not read the Details panel or mix data between rows or market sessions.
- Keep hover synchronous: read the row and calculate before returning from the pointer handler.
- Preserve the native watchlist nodes and their values. Use text and attribute setters for badge content.
- Keep this guide synchronized with behavior, metadata, permissions, validation, and installation status.

## Validation

Run `node --check 'SVKO TradingView Watchlist.user.js'`. The DOM regression tests use jsdom 26.1.0 as a test dependency only. To keep dependencies outside the repository, install it with `npm install --prefix /tmp/svko-watchlist-validation --cache /tmp/svko-watchlist-validation/npm-cache --no-audit --no-fund --ignore-scripts jsdom@26.1.0`, then run `NODE_PATH=/tmp/svko-watchlist-validation/node_modules node 'SVKO TradingView Watchlist.test.cjs'`.

Tests must cover signed and zero changes, localized numbers, absolute extended changes, immediate hover reads, stationary hover refresh, missing values, reused rows, detached widgets, hidden tabs, unrelated pages, frames, and unchanged renders. Browser checks must separately verify the CSS hover and the installed production version.

On 2026-09-14, all 14 regression scenarios and the syntax check passed. Live development checks in the existing Edge profile verified that a regular instrument shows no added content at rest, displays its native Last price in white on row hover, and hides it on exit. An extended session badge displayed a white calculated price on badge hover and restored its colored percentage on exit. The full installed production source was later verified against the repository. After emptying development and reloading TradingView, production checks confirmed both hover behaviors, transparent backgrounds, 32 badges with no duplicate badges in any rendered row, and exactly one Watchlist stylesheet.

## Licence

Open source + commercial licence. The current source is supplied under the [SVKO Personal Use and Commercial Licence 1.0](https://trading.cvladan.com/licensing/). Individuals may download, run, study and modify it free of charge for personal use, including trading real money for their own profit. Company use or use for an employer or client requires a separate paid commercial agreement, including internal use, integration, hosting, bundling and free distribution to customers.

Source code is public; business use is restricted, so this is not an OSI open-source licence. Third-party material retains its own licence. This update changes licensing notices only; the executable code and installed-version history are unchanged.
