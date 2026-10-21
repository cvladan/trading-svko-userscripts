# SVKO TradingView Squawkbox

Version `0.1.1` turns changes in one TradingView chart's last quoted price into short procedural sounds. It follows the chart selected when **Start** is clicked, even when another chart becomes active or the Details panel is hidden. This is quote sonification, not individual trade or order flow analysis.

## Use

Open the panel manually from Tampermonkey → SVKO TradingView Squawkbox → Squawkbox. New tabs and reloads do not open a panel or start audio. The panel opens centered and stopped. Select the intended chart and click **Start**. The panel identifies the full symbol and chart ID. Rising prices produce a higher rising sound; falling prices produce a lower falling sound. Unchanged prices remain silent. Larger moves increase the difference in pitch, within a bounded range.

**Detect move (ticks)** sets the minimum accumulated net movement from the last sounded price, using the chart's price step. The default is five ticks. For IG:NASDAQ with a 0.1 price step, five ticks means 0.5 points. Subthreshold moves accumulate; oscillation around the reference does not count as cumulative distance. At most one market sound is emitted per 120 ms. A larger jump produces one sound, not a backlog. Movements during this gate remain part of the net comparison at the next changed last price. This cannot preserve every intermediate direction in a fast sequence.

**Sound volume** defaults to 15%. **Test up** and **Test down** preview the two sounds. **Stop** detaches the chart and closes the audio context. Closing the panel also stops playback. Reopen it with the Tampermonkey **Squawkbox** menu command. Drag the title bar to move the panel. The minimize button hides the settings while keeping the same chart and audio running. In both views, the indicator sits immediately beside the symbol and shows the direction of the latest sound: a green upward triangle or a red downward triangle. Stop resets the indicator to gray. Restore brings back the settings, and Close stops playback in either view. Reopening starts with the full panel centered again. Position and minimized state are not saved. A separate iframe keeps keyboard input in the panel away from TradingView shortcuts.

The chart and full symbol are locked for the current listening session. Selecting another chart does not change them. Changing the locked chart's quote source or clearing its series data stops listening; this includes some interval changes and reloads. Click Start to explicitly bind again. A page reload starts stopped. The script does not prevent editing TradingView charts, save or rename layouts, automatically pick another symbol, or start other tabs. Each tab is independently enabled by its own Start button. A dedicated tab is recommended.

Settings use the single Tampermonkey key `svko-squawkbox:settings:v1`. Only volume and movement threshold are saved. Chart selection, prices and listening state are not persisted. Development settings belong to SVKO Dev and are separate from a production entry.

## Data and audio

The script reads the selected chart through `unsafeWindow.TradingViewApi._activeChartWidgetWV.value()`. It retains that chart and its `chartModel().mainSeries().quotesProvider()`. Quote updates are delivered through `quotesUpdate()` and the last quoted price comes from `quotes().value().last_price`. This does not read the crosshair OHLC value, chart canvas, title, watchlist or Details panel. Bid/ask changes without a new last price do not produce sounds. Missing prices are silent; nonfinite prices and backward quote timestamps cannot trigger sound.

These are private TradingView interfaces, verified on 2026-10-02. If unavailable, Start reports a visible error. There is no DOM or network fallback. Delayed market data remains delayed. Replay is rejected. The quote price is used even if the visual chart uses synthetic candles.

Only the tiks toggle generators, noise helpers and soft theme are bundled, from upstream commit `806cab3e06143d44545b6e8c49dfd94391277100` (the repository's 0.3.0 source). Their complete original MIT notice is preserved alongside the generated bundle. An explicit Start or Test click creates one Web Audio context. The userscript manages that context directly rather than loading tiks' UI event bindings, so macOS Reduce Motion does not mute this explicitly enabled audio. No sound files, network calls or paid services are used.

The source bundle can be reproduced with esbuild 0.25.10 using an entry exporting `toggleOn` and `toggleOff` from `src/generators/toggle.ts` and `SOFT_THEME` from `src/themes.ts`, with `--bundle --format=iife --global-name=TiksSounds --legal-comments=inline`. Preserve the complete upstream MIT notice alongside the output. Pin the source commit, not the moving main branch.

## Resource limits and agent instructions

- Read AGENTS.md, SVKO Dev.md and PUBLISH.md before development or publication.
- Use only the one SVKO Dev slot. Keep its universal loader unchanged.
- Guard HTTPS, the exact TradingView host, chart path and top frame before library initialization, storage or UI work.
- While the panel is open, use pointer capture on its header for dragging and one resize listener to keep it inside the viewport. Remove that listener when closing. Minimize must not change subscriptions or audio.
- No MutationObservers, polling, recurring timers, background services, external market subscriptions or WebSocket interception.
- While listening, subscribe only to the selected provider's quote and symbol events and the selected series' data-cleared event. Unsubscribe on Stop, source change, failure and pagehide.
- Check chart identity and source identity before sounding a quote. Never silently switch symbols. Drop stale work after an asynchronous Start is canceled.
- Keep one audio context with a master gain. Sound duration and rate are bounded; never enqueue historical beeps or add periodic audio to prevent browser sleep.
- Preserve existing comments, third-party notices, other scripts, loader metadata and unrelated SVKO Dev storage. Documentation and code comments are English; communicate with the user in Serbian.

## Validation and status

Version 0.1.1 is installed and enabled as a separate production entry. Its complete saved source was read through vscode.dev and matches the repository, SHA-256 `a00716cd2fb1e89a5f404a1c65b81364af14d6f5038f972173f5cafbf3bc6a12`. The only save differences were trailing whitespace. SVKO Dev is empty and its permanent loader remains enabled. A production reload confirmed no automatic panel, the separate menu command, manual opening and minimize/restore. On 2026-10-02, syntax validation and all 20 automated scenarios passed. Version 0.1.1 also passed live checks for no panel after reload, manual opening from the Tampermonkey menu, centered placement, dragging, restoration, and continued quotes and direction indications while minimized. Live checks confirmed one panel loaded through the unchanged development loader, quote-driven tiks oscillator creation, Stop, and a binding that continued following IG:NASDAQ while BATS:QQQ became the active chart. The panel remains stopped after development checks. Use its menu command to open it for audition. The complete production source is saved in `SVKO TradingView Squawkbox.user.js`. Development settings were not migrated. See PUBLISH.md for publication evidence.

Production followed IG:NASDAQ and counted more than 20 sounds while minimized, with direction indicators updating. The panel was closed after the check, stopping playback. Actual hidden-tab operation remains unverified: attempts to switch away did not produce a hidden document in the controlled tab. Background quote updates and background audio must be checked separately; a browser may freeze or discard a hidden tab. The script cannot run while the computer sleeps.

Run `node --check 'SVKO TradingView Squawkbox.user.js'` and the Squawkbox regression tests against the production source. During development, pass `SVKO Dev.user.js` as the test source. Use jsdom from `/tmp/svko-alert-validation/node_modules`, outside this repository. Cover locking, source changes, accumulation, direction, the rate gate, invalid/stale quotes, repeated Start/Stop, canceled audio startup, cleanup, iframe inputs, unrelated pages and reduced-motion independence. Live checks must confirm the development loader, matching symbol, quote-driven sound nodes, tests, mute/stop, inactive charts and background behavior.

## Licence

Original SVKO material is supplied under the [SVKO Personal Use and Commercial Licence 1.0](https://trading.cvladan.com/licences/SVKO-1.0.txt). Bundled tiks material is MIT licensed, copyright 2026 Rexa, and retains its separate licence.
