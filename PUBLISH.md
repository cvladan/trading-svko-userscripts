# Finished script publication: agent runbook

Read this file and the target script's sibling Markdown guide before publishing. Follow [AGENTS.md](AGENTS.md). This runbook describes installation into the user's existing Tampermonkey profile, not publication to a public website.

## Default route: Tampermonkey through vscode.dev

The user explicitly selected this workflow on 2026-09-14. Use the existing Edge or Chrome profile containing the installed scripts. Start from the target's Tampermonkey editor and launch its VS Code web editor integration, then work in the resulting `https://vscode.dev/?connectTo=tampermonkey` tab. Reuse an already connected tab. The exact launch control in the Tampermonkey editor has not been inspected by the agent, so identify it from the actual UI rather than inventing its label. The [Tampermonkey Editors listing](https://chromewebstore.google.com/detail/tampermonkey-editors/lieodnapokbjkkdkhdljlllmgkmdokcm) also documents launching vscode.dev from its toolbar icon.

The user opened the connected web editor on 2026-09-14. Editing existing installed scripts and saving through this tab worked in Edge. The workspace groups scripts by namespace, for example `Tampermonkey/cvladan.com/SVKO TradingView AI/script.user.js`. These are installed scripts supplied by the browser integration, not the repository files on disk.

Do not use the Tampermonkey MCP connector, generate connection codes, or switch to the desktop TampermonkeyFS connection workflow. The user explicitly rejected that route. Desktop VS Code is not required. Do not start a server, watcher, custom bridge, or separate browser profile, and do not alter browser databases or use undocumented extension messages.

## Why the previous instructions did not work

The previous version of this runbook prescribed direct transfer into the Tampermonkey browser editor and explicitly discouraged vscode.dev. Its final paragraph admitted that this default had never been verified end to end in this profile. That made it an unsuitable default.

On 2026-09-14 the browser tool rejected navigation to Tampermonkey's `chrome-extension://` editor URL under its URL security policy. This established a restriction in the tool's access to that address. It did not establish that Tampermonkey itself could no longer save scripts or that a browser setting was missing. The permitted vscode.dev editor subsequently accepted saves.

Earlier successful publications were different: the 2026-09-09 Edge installation used desktop VS Code copy followed by a Tampermonkey editor save, and on 2026-09-12 the user saved the production source manually. Neither proves that the newly prescribed direct browser route ever worked. There has been no controlled Chrome versus Edge comparison, so do not attribute the restriction to Edge. Earlier success also occurred in Edge.

A security rejection is different from a missing UI control. Do not bypass it with native app control, raw CDP, another profile, internal storage access, or another interface to the blocked page. Ask the user to perform the blocked launch or creation step. Once a legitimate connected vscode.dev tab is available, use its ordinary editor UI for the authorized source edits.

## Publication sequence for existing entries

1. Read the complete approved production source from `/Users/cvladan/dev.trading/userscripts`. If `SVKO Dev.user.js` is nonempty, identify its active target and finish that source transfer first. Never replace production with an empty development file. Run the target's appropriate existing checks. Do not increment a version merely to reinstall unchanged code.
2. Open the existing connected vscode.dev tab, or launch it from Tampermonkey as described above. Locate the actual namespace and script name in Explorer. Open that script's `script.user.js`. Preserve the installed identity and settings. Do not edit `storage.json`, required libraries, unrelated scripts, or the installed `SVKO Dev` loader.
3. Transfer the complete source, including its production metadata. With the browser clipboard API, place the exact approved text on the clipboard, focus the visible code area, select all, and paste once. A metadata only release may be prepared from the full installed source, but its complete resulting content must match the approved disk file before saving. Do not reconstruct executable code from memory.
4. Confirm the correct editor has focus. In the tested Monaco editor, clicking the accessibility editor node did not reliably focus the code, and the DOM textbox had zero width. Clicking inside the visible code area worked. Locate that area from the current UI or screenshot, not fixed coordinates. On macOS use Command+A, Command+V and Command+S. Inspect the header and editor state after replacement.
5. Read back the complete buffer with Select All and Copy through the browser clipboard API and compare it with the disk source, preferably by SHA-256. Visible lines in a virtualized editor are not a complete readback. Save and check that the unsaved marker disappears and no error appears. Reopen the file or reload the editor workspace and repeat the complete comparison when confirming persistence.
6. Confirm the expected name, version and enabled state where accessible, then perform the finish procedure below. A saved buffer or source comparison alone does not prove that the installed script is enabled or running.

Batch predictable actions with a focused UI observation. If focus or paste fails, inspect the result before retrying. Do not blindly repeat paste or save. The 2026-09-09 native paste attempt inserted stale clipboard content, so always verify the resulting source. `Invalid Userscript!` means the save failed.

## New script entries

The [official Tampermonkey Editors listing](https://chromewebstore.google.com/detail/tampermonkey-editors/lieodnapokbjkkdkhdljlllmgkmdokcm), checked on 2026-09-14, lists creating and deleting scripts and showing scripts newly created in the background as unsupported. The web editor can update existing entries, but do not promise it can create a production entry by adding a folder or file.

First check whether the intended production entry already exists, including an approved predecessor name. Reuse it when appropriate. If it is absent, create and save the entry through Tampermonkey's own UI when that UI is permitted. If it is blocked, ask the user to create one harmless placeholder with the intended production name and namespace, then reopen the web editor connection so the entry appears. Replace its complete source using the sequence above. Do not repurpose the universal `SVKO Dev` entry or an unrelated installed script.

The user deleted `SVKO TradingView Improve Watchlist` before publication. The connected workspace initially had no production `SVKO TradingView Watchlist` entry on 2026-09-14. The user created and saved it manually. After the workspace reloaded, the entry appeared and its complete source matched the approved repository file.

## Development loader and finish procedure

The permanent universal loader is documented in [SVKO Dev.md](SVKO%20Dev.md#permanent-universal-loader). Keep its HTTP/HTTPS matches, explicit grants, `@connect *`, pinned uPlot resources and sole local `@require`. Never copy production metadata over the installed loader or map production to the development file.

1. Confirm that the complete production source is saved in both the repository and the installed production entry. Verify its identity and enabled state when accessible.
2. Only then empty `SVKO Dev.user.js` on disk. Keep the single installed `SVKO Dev` entry enabled. Its empty required file must execute no code.
3. Reload the target page to remove the old development implementation and verify production behavior. One targeted check is normally sufficient after the relevant local checks pass. For AI, open the symbol dialog and close it without sending a prompt. For Watchlist, verify the white hover price, transparent background, correct behavior for regular and extended sessions, and absence of duplicate badges.
4. Preserve storage. Development and production have separate identities and settings, and publication does not authorize migrating or resetting them.
5. Update the target guide, `SVKO Dev.md`, and this runbook with what actually completed. Distinguish a source save, a full source comparison, enabled state, and live production validation. Report any remaining user step clearly.

## Current publication: 2026-10-21

Version `0.2.1` was installed on 2026-10-21 through the existing connected vscode.dev editor. Its complete source was copied back after reloading the editor and matched the repository, SHA-256 `5f147c4806368955fe313ee060c96f195c4130ea87c56dd4d6e958d1cb2cc7c4`. All 15 regression scenarios and the syntax check passed, including arbitrary TradingView paths, absent watchlists, late appearance, removal and reopening. Live development checks passed on `/markets/`, which `/symbols/` currently redirects to, and `/symbols/NASDAQ-AAPL/`. Closing and reopening the sidebar retained working badges. White regular prices matched the native Last value on hover and disappeared on exit, with a transparent background. Extended session calculations remain covered by the regression tests; no new live extended session check was performed during the regular session.

After the development file was emptied and production re-enabled, fresh pages showed 38 badges on the symbol page and 44 on the chart, one badge per rendered row and exactly one stylesheet on each page. The production symbol page also passed the white hover price check. The universal development loader remains enabled and unchanged, and `SVKO Dev.user.js` is zero bytes. Website content and screenshots are deferred to a separate task.

## Historical publication: 2026-10-02

Squawkbox 0.1.1 is installed and enabled. After the user saved the entry, Codex opened it through a fresh vscode.dev connection and copied its complete saved source. Only trailing whitespace differed from disk. The repository was aligned with the saved entry, SHA-256 `a00716cd2fb1e89a5f404a1c65b81364af14d6f5038f972173f5cafbf3bc6a12`. Syntax and all 20 scenarios pass. Only after the full comparison was `SVKO Dev.user.js` emptied to zero bytes. Reloading TradingView showed no automatic panel, the enabled production Squawkbox command and the enabled development loader without a Squawkbox command. Manual opening and minimize/restore were verified in production. Development storage and the universal loader were not changed. Production followed IG:NASDAQ and counted more than 20 sounds while minimized, with direction indicators updating. The panel was closed after the check, stopping playback. Hidden tab operation remains unverified.

The quick file search did not initially find the new Squawkbox source even though it existed. Scrolling the Explorer revealed its folder. Open the actual `script.user.js` child from the visible tree rather than treating an empty quick search as proof of absence.

Speech 0.2.1 fixes automatic speech activation so only `[say]` or `[say:language]` alerts are queued, and removes `[sound:name]` from spoken text. Syntax, 15 detection tests and 22 speech tests pass, including silence without tags or with only a sound tag, and no cached playback after removing the speech tag. The existing production source was saved through vscode.dev and read back after reloading the editor, matching SHA-256 `b293501228d05ee41b1931ceb45fbecc4cf8bcf2b80a091d62428970e38ce10e`. The user explicitly reserved SVKO Dev for another task, so neither its files nor its installed entry was changed. Settings and recordings were preserved. The live chart belonged to another browser session and was not reloaded. Version 0.2.1 takes effect on the next chart load; live verification remains pending.

SVKO TradingView Alerts Custom Sounds 0.1.0 is installed and enabled. After the user confirmed saving, Codex opened its production source in a fresh connected vscode.dev session and copied the complete buffer. The only difference from disk was four spaces on one blank line. Removing those spaces from the repository source produced an exact match: SHA-256 `f982e572ad20cdfa539ed8089bbd5333b786e5ec3c2450f60c12971424161324`. The executable code was unchanged.

Only after this comparison was SVKO Dev emptied to zero bytes. A TradingView reload showed exactly one Custom sound selector. The production library started empty; importing the synthetic `soft-bell` WAV and previewing it completed with “Preview finished.” The unsaved alert draft was closed. The Tampermonkey menu showed the production Manage custom sounds command and the enabled SVKO Dev loader with no sound command. No development storage was migrated or cleared. Syntax and 34 synthetic scenarios had passed, and real-toast playback had been verified during development. Background and multiple-tab playback remain unverified live.

SVKO TradingView Alert Speech 0.2.0 is installed. Syntax, 15 detection scenarios and 20 speech scenarios passed. The browser policy blocked direct access to the new Tampermonkey editor, so the user saved its complete source and confirmed the save. No blocked editor workaround was used.

Opening `https://vscode.dev/?connectTo=tampermonkey` in the existing Edge profile connected to the installed scripts. The new `cvladan.com/SVKO TradingView Alert Speech/script.user.js` appeared in Explorer. Codex opened it, selected and copied the complete source through the editor UI, and verified SHA-256 `65c75a9eea605e3f619c6ea77dd94e251325c18e2a7c1938875b6a03f2e65f25`, matching the repository file and the development source. This was a fresh read of the user saved entry, not an unsaved source buffer.

Only after that comparison was `SVKO Dev.user.js` emptied to 0 bytes. Reloading TradingView produced exactly one listening panel and the separate production Speech settings command. The settings dialog opened with the expected section defaults. The Tampermonkey menu showed the universal SVKO Dev loader still enabled without a speech command. The slot is free, and no loader metadata was changed.

Production settings are initially empty and require the user's API key. The development key and recordings remain unchanged in SVKO Dev storage; no migration or storage editing occurred. Live production startup and settings UI were verified, but no production TTS request was made without a key. English and Serbian generation and persistent reuse had already passed in development.

## Historical publication: 2026-09-14

Through the user opened vscode.dev tab in Edge, the complete existing sources were updated and saved as `SVKO TradingView AI` 0.2.6, `SVKO TradingView Links` 0.6.3, and `SVKO TradingView Tab Titles` 0.6.3. Full clipboard readback matched the repository source for each, the editor showed no unsaved marker, and reopening the sources after the workspace reloaded confirmed the same hashes. Their executable bodies and settings were unchanged. Each update only adds the official TradingView icon and increments its version.

| Script | Repository and saved editor SHA-256 |
| --- | --- |
| AI 0.2.6 | `1b3f2042d11ba41bc6d4ee2a2c79d59580f9d4cf36877748fad979825f9deffb` |
| Links 0.6.3 | `caebe0e60e833939594c647b48446e12627a5630810a70fee5c6ea3346c5808b` |
| Tab Titles 0.6.3 | `d5f4b656816bafa620924898d6958e73dee85d82c319c7018bc9e8cbd7600557` |

The user created and saved Watchlist 0.2.0 in Tampermonkey. The agent reopened its source through vscode.dev and confirmed the complete SHA-256 `dbce4a42f83011d9ee2dd91b46c1a9a81513675c3be5f680aad39d3d62fa93d2`, matching the repository file. Only then was `SVKO Dev.user.js` emptied to zero bytes. The installed development loader was left unchanged.

After an explicit TradingView reload with the empty development file, production created 32 badges, with no duplicate badges in any rendered row and exactly one Watchlist stylesheet. The VTI extended percentage became a white calculated price on hover and returned to its percentage on exit. BRN1! showed its white native Last price only during row hover, then hid it. Both backgrounds were transparent. This verifies that production runs independently of the development source.

## Historical publication: 2026-09-12

On 2026-09-12, the user saved the complete `SVKO Trading Statistics` 0.4.4 production source in the existing Tampermonkey profile. The editor remained blocked to the browser tool, so this was a user-assisted installation. After the user confirmed saving, the matching development file was emptied. The production panel then opened with its separate empty storage, confirming that the installed script ran without the development body.

A validated JSON backup restored both accounts, all 4,261 records and saved preferences. Fresh production pulls matched 3,434 CFD and 827 Spread records against all 12 exported fields with zero differing references. A standalone dashboard reload retained the saved filters and month; calendar keyboard navigation worked. The single SVKO Dev entry was left untouched with its empty required file. The migration backup remains in Downloads, outside the repository.

## Historical publication: 2026-09-09

On 2026-09-09, installed `SVKO TradingView AI` version `0.2.5` in the existing Edge profile. The complete production and development files matched before cleanup. Syntax and existing behavior checks passed. TampermonkeyFS connected successfully, but its virtual list did not show the newly created AI entry after an attempted refresh. The actual installation used VS Code copy and Tampermonkey's browser editor save. No local file mapping was established.

The dashboard showed the enabled production entry with version `0.2.5` and size 9 KB. After emptying the development file and leaving its loader enabled, the reloaded TradingView page displayed the AI dialog for `C`, with one initial question and ChatGPT selected. No AI service prompt was sent.

## Future publication destinations

A hosted raw `.user.js` release URL could allow installation through Tampermonkey's normal install screen. This is a future option, not a tested route for these local files. See the [installation FAQ](https://www.tampermonkey.net/faq.php?q=Q102). No website or public repository release process has been agreed, so do not upload source or create hosting as part of local installation.

The earlier runbook also referenced [Tampermonkey issue 2837](https://github.com/Tampermonkey/tampermonkey/issues/2837) about external API creation. It does not authorize an API bridge or replace the user's chosen web editor workflow. The local development `@require` workflow remains documented in [FAQ Q402](https://www.tampermonkey.net/faq.php?q=Q402).
