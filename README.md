# SVKO userscripts

The script-specific Markdown files describe each userscript and its configuration. See [AGENTS.md](AGENTS.md) for the complete development procedure.

## TradingView watchlist

[SVKO TradingView Watchlist](SVKO%20TradingView%20Watchlist.md) shows extended session percentages that turn into white prices on hover. Other instruments show only their white Last price while the row is hovered, with nothing added visibly otherwise. It detects the native watchlist on any page under `www.tradingview.com`, including lists opened later. It uses one 1,500 millisecond refresh interval and no observers. Version 0.2.1 is installed and verified in Tampermonkey. See its guide for the current status.

## TradingView alert speech

[SVKO TradingView Alert Speech](SVKO%20TradingView%20Alert%20Speech.md) reads new alert toasts through OpenRouter, saves recordings locally and reuses them. It supports language tags, editable request JSON and a speech test. Version 0.2.1 is installed with its complete saved source verified. Automatic speech requires `[say]` or `[say:language]`; sound tags are omitted from spoken text. Reload the chart to activate the fix. Enter the API key in the production script's Speech settings; development storage is separate.

## TradingView custom alert sounds

[SVKO TradingView Alerts Custom Sounds](SVKO%20TradingView%20Alerts%20Custom%20Sounds.md) adds a custom sound selector to the native alert Notifications editor. Recordings stay in Tampermonkey storage and are selected by `[sound:name]` tags. Version 0.1.0 is installed and enabled. Complete installed source, production editor integration and audio preview are verified; playback from a real alert was verified during development.

## TradingView Squawkbox

[SVKO TradingView Squawkbox](SVKO%20TradingView%20Squawkbox.md) turns price changes from one explicitly selected chart into procedural sounds. Open it manually from its Tampermonkey menu, drag the centered panel, or minimize it to a symbol and direction indicator. Version 0.1.1 passed syntax validation, 20 automated scenarios and live development checks. The separate production entry is installed and enabled, with its complete saved source verified. The reusable SVKO Dev slot is empty and free. See [PUBLISH.md](PUBLISH.md).

## Trading statistics

[SVKO Trading Statistics](SVKO%20Trading%20Statistics.md) archives Trade Nation CFD and Spread USD transactions in Tampermonkey storage and opens an on-demand panel with uPlot charts, a calendar, funding details, deposit/withdrawal totals with internal transfers excluded, automatic broker comparisons, change warnings and JSON backup. The panel is available independently of the broker tab. See its guide for opening, data definitions and the current installation status.

## Local development with Tampermonkey

In Chrome, open `chrome://extensions`, find **Tampermonkey**, open **Details**, and enable **Allow access to file URLs**. This permission lets the development script load its local source through `@require`.

Use the [permanent universal loader in SVKO Dev.md](SVKO%20Dev.md#permanent-universal-loader) in the single existing `SVKO Dev` entry. It matches all HTTP/HTTPS sites, includes the documented GM grants and `@connect *`, retains uPlot resources, and always requires the same local `SVKO Dev.user.js` file. The full loader is maintained in one place.

The local file contains the complete target source with its production metadata. Its code must guard target-specific behaviour because the development loader runs on every ordinary website. Metadata in the required file is not inherited by the loader.

Codex uses the existing Edge or Chrome profile containing Tampermonkey. Finished sources are saved through its connected vscode.dev editor as documented in [PUBLISH.md](PUBLISH.md). New entries must first be created in Tampermonkey.

1. Reuse exactly one Tampermonkey development entry named `SVKO Dev`, linked to the local `SVKO Dev.user.js` file. Keep its universal header and permanent absolute `file:///` URL in `@require` across targets.
2. Disable the original target script while the development entry is enabled. Codex edits the local development file; reload the target page to run each change without saving through VS Code. Do not reopen the dashboard for ordinary code edits or narrow the development grants to the target. Only a new named resource or a necessary timing, frame or execution-context change requires updating the loader.
3. When development is complete, copy the complete source back to the original repository file and original Tampermonkey entry, then save the installed script. The production entry contains the complete code without the local development `@require`.
4. Empty `SVKO Dev.user.js` after saving the complete production source. Keep `SVKO Dev` enabled, enable the original script, and reload the page to verify the result. See [PUBLISH.md](PUBLISH.md) for the agent publication procedure.

Other scripts continue to use VS Code and Tampermonkey Editors as before.
