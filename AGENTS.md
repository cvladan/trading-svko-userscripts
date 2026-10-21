# Userscript repository instructions

## Language

- Communicate with the user in Serbian.
- Write all repository documentation and all code comments in English.
- Keep existing English documentation and comments in English when updating them.

## Repository structure

The userscripts cover these platforms and tools:

- TradingView:
  - `SVKO TradingView AI.user.js`
  - `SVKO TradingView Alert Speech.user.js`
  - `SVKO TradingView Links.user.js`
  - `SVKO TradingView Squawkbox.user.js`
  - `SVKO TradingView Tab Titles.user.js`
  - `SVKO TradingView Watchlist.user.js`
- Trade Nation / TradeDirect365:
  - `SVKO Trade Nation Hotkeys.user.js`
- Cross-site analytics with Trade Nation CFD and Spread importers:
  - `SVKO Trading Statistics.user.js`

Every `*.user.js` file must have a sibling Markdown file with the same base name. The Markdown file is both the user-facing description and the script-specific agent guide. Before changing a userscript, read its matching Markdown file and follow its instructions. Keep that file synchronized whenever behavior, configuration, installation, permissions, or platform support changes.

## General userscript instructions

- Keep every userscript change as small and resource-efficient as possible. Do not add observers, timers, polling, DOM elements, event handlers, state, or abstractions unless the user explicitly requests them and they are necessary.
- Preserve existing comments. Do not delete them without explicit user approval; edit a comment only when necessary to keep it accurate after an approved code change.

## Local development workflow

Use the user's existing Chrome session through the Chrome CDP extension connection when available to configure Tampermonkey, edit and save installed scripts, and verify results. If that connection is unavailable, use the available Chrome browser controls and report any access limitation. Do not use a separate browser profile without the user's installed Tampermonkey scripts. Codex should perform browser steps directly whenever tools permit.

Use exactly one reusable development slot named `SVKO Dev` in Tampermonkey, backed by `SVKO Dev.user.js` in this repository. Never create separate development loaders for individual scripts. Create this file and its sibling `SVKO Dev.md` only when starting a development session. The sibling document must identify the target script and its script-specific guide. Regular scripts continue to use the existing VS Code and Tampermonkey Editors workflow.

### Start development

1. Identify the target script and read its matching Markdown guide. Copy its complete current source, including its original metadata, to `SVKO Dev.user.js`. Keep the original identity in this disk file so the finished source can be copied back without renaming the production script.
2. Create or reuse the single Tampermonkey entry `SVKO Dev`, preserving its installed development identity and storage. Use the permanent universal loader in [SVKO Dev.md](SVKO%20Dev.md): match all HTTP/HTTPS sites, retain the full explicit set of documented GM grants and `@connect *`, retain the pinned uPlot resources, and always require `file:///Users/cvladan/dev.trading/userscripts/SVKO%20Dev.user.js`. Do not narrow the loader to the current target or create another loader. It contains metadata only, with no duplicate executable body.
3. In Chrome, open `chrome://extensions`, find Tampermonkey, open **Details**, and enable **Allow access to file URLs**. Disable the installed target script on the development computer before enabling `SVKO Dev`, then reload the target page so only one implementation runs. Leave unrelated scripts alone.

### During development

- Edit `SVKO Dev.user.js` directly. Reload the target page to run the changed code; no VS Code Save or Tampermonkey Editors publication is needed for each code edit.
- Metadata inside a required file does not configure the Tampermonkey loader. Keep its universal matches, broad grants, resource names and local `@require` stable across targets; ordinary code changes require only editing the disk file and reloading the page. Do not ask the user to open the dashboard for these edits. Only genuinely new resources or an explicit change to run timing, frame support or execution context require a loader update.
- Because the development loader matches every HTTP/HTTPS site, the required source must check its intended host/path and frame before target-specific DOM work, storage access or network calls. This guard belongs in the target source so development and production behave consistently. For Trading Statistics, ordinary-page startup may register its requested menu command. Broad grants enable APIs; they do not authorise unrelated operations.
- Keep production metadata limited to the target's actual requirements. The universal development grants are a user-requested development convenience, not a production template.
- Apply all target-specific agent instructions to the development file, including observer and resource limits. Keep the target's documentation synchronized with approved behavior changes.
- Work on one target at a time. Finish or explicitly abandon the current session before reusing the slot for another target. Do not overwrite unfinished work.
- A separate development identity has separate Tampermonkey storage. Do not assume the production script's saved settings are available in `SVKO Dev`.

### Finish development

1. Validate the completed changes, copy the complete development source back to the target's original repository file, and update its matching Markdown guide.
2. Replace the original Tampermonkey script's source with that complete source, including its production metadata, and save it through the existing editor workflow or available browser controls. Do not leave a local development `@require` in the production entry. Codex should perform the transfer when the available tools allow it, and must report any remaining manual step instead of claiming publication succeeded.
3. After the complete source is saved in the production repository file and installed entry, empty `SVKO Dev.user.js` on disk. Keep the `SVKO Dev` Tampermonkey entry enabled. Re-enable the original script, reload the target page, and verify the installed production version. The empty development file must execute no code.
4. Keep the single development slot enabled with its empty disk file for reuse. Do not create additional development slots or automatically start a server or file watcher.

For finished script publication, read [PUBLISH.md](PUBLISH.md). It is the agent runbook for transferring complete source through the existing browser's connected vscode.dev editor. The user selected this route on 2026-09-14. Launch it from Tampermonkey or reuse the connected tab. Do not use the Tampermonkey MCP connector or connection code workflow. New production entries must first exist in Tampermonkey because the web integration cannot create them.

Tampermonkey's documented direct local-file workflow uses `@require`: https://www.tampermonkey.net/faq.php?q=Q402.

## SVKO TradingView Tab Titles

- Keep exactly one `MutationObserver` instance, created once and registered once.
- The observer must watch only the document `<title>` element.
- Never observe layout, symbol, toolbar, `body`, `documentElement`, or the whole DOM.
- Read layout and symbol DOM values only when the title observer runs and only when the current template contains the corresponding `<layout>` or `<symbol>` placeholder.
- Do not add another observer, timer, polling loop, or scheduling mechanism unless the user explicitly changes this rule.
