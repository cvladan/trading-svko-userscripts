# SVKO TradingView AI

Platform group: TradingView

Script: `SVKO TradingView AI.user.js`

## Purpose and behavior

Right click the symbol search button in the main chart toolbar to open AI questions for the current symbol. The script reads `button#header-toolbar-symbol-search span[class^="value-"]` only when opening the dialog. It does not read symbols from the chart title, watchlist, or canvas.

New installations start with one question:

> Why has TICKER stock moved right now? Is there a catalyst? Short answer with a source.

This is also the template for newly added rows. Existing saved questions are preserved. The + button below the question list appends a copy of the initial question and immediately opens its editor. Each row has a Delete question button. All rows can be deleted; an empty list remains empty until Add question is used. Additions and deletions are saved immediately.

Each question is a Go button without a leading icon. It has a button appearance and pointer cursor. A CSS `Run` label stays visible at the right edge while hovered or keyboard focused. It is hidden during editing. No tooltip timers or extra event handlers are used. Clicking it replaces every `TICKER` placeholder with the captured toolbar symbol and opens one background tab for each checked service: ChatGPT, Perplexity, Google AI Mode, or Grok. The symbol is displayed above the questions. The dialog closes after launching.

The dialog is 30% wider than the original layout, limited by the viewport. Revert uses ↺. Row action symbols and the add symbol are 20px, with the existing button dimensions preserved; the close symbol is 24px inside its existing 30px button. Question buttons show one line, truncate long text with an ellipsis, and do not scroll. Horizontal scrolling is available only in the single line editor. Edit switches a row to a single line text field. Existing line breaks are displayed as spaces and become spaces in storage only if that question is saved again. Save or Enter saves it, and Escape dismisses the dialog, discarding unsaved edits. Revert restores that row's original question. Empty questions cannot be saved. At least one service must be selected before launching.

The last saved question texts and service choices persist across reloads using `GM_getValue` and `GM_setValue`. Revert changes only its own question. The default selection is ChatGPT. The Open in label and its checkboxes share one horizontal row. The top right × button, Escape, or a click outside the dialog dismisses it without launching anything.

The script uses the URL formats supplied by the user. Provider behavior, sign in requirements, and AI Mode availability depend on each service. No API key is required. Grok uses `https://grok.com/?q=` with the encoded prompt. Only for Grok, the outgoing prompt is prefixed with `Search the web for current information and cite sources with links.` followed by two newlines. Saved questions are unchanged. This requests web search in natural language; it does not force a search mode through an undocumented URL flag. Verified in Edge on 2026-09-08: Grok accepts the URL prompt and displays a "Send this message?" confirmation with a Send button. The script does not bypass this confirmation. Search execution was not tested.

## Persistent settings

The script uses Tampermonkey's per-script value storage through `GM_setValue` and `GM_getValue`. It does not use TradingView's `window.localStorage`, `sessionStorage`, or cookies. These settings therefore do not appear in the TradingView page's Local Storage panel in browser developer tools.

Service selections are stored individually. The ordered question list is stored under one key:

| Key | Type | Value when no saved setting exists | Written when |
| --- | --- | --- | --- |
| `service:ChatGPT` | Boolean | `true` | Its checkbox changes |
| `service:Perplexity` | Boolean | `false` | Its checkbox changes |
| `service:Google AI` | Boolean | `false` | Its checkbox changes |
| `service:Grok` | Boolean | `false` | Its checkbox changes |
| `questions` | Array of objects with `text` and `original` strings | One initial question | Initial migration, Add, Delete, Save, or Revert |

For example, selecting Perplexity calls `GM_setValue('service:Perplexity', true)`. Saving the list calls `GM_setValue('questions', questions)`. Each item's `text` is the current saved template and `original` is the text restored by Revert. New rows use the initial question for both values and open for editing. Question text is trimmed before saving, and empty text is rejected. Revert changes only that row. An empty array is valid and does not restore the initial question on reopening.

On the first opening after upgrading, if `questions` does not exist, nonempty saved strings under the old `question:0` through `question:3` keys are migrated in order, preserving each row's original Revert text. Unmodified old defaults that were never saved are omitted. If there are no saved questions, the list starts with the first predefined question. The migrated list is immediately saved under `questions`. Old keys are retained but ignored once the new list exists.

Settings are shared by tabs running the same installed script in the same browser profile and are read again each time the dialog opens. They survive page reloads and browser restarts. An already open dialog does not receive live updates from another tab.

During development, storage belongs to the installed **SVKO Dev** loader. The `@name SVKO TradingView AI` metadata inside the required local file does not give that code separate storage. The installed production **SVKO TradingView AI** script uses its production entry's own storage. Development settings are not automatically copied to production.

The current ticker, generated URLs, open dialog, and unsaved edits are not persisted. The ticker is captured when the dialog opens and replaces `TICKER` only when launching a question; the saved template keeps its placeholder. Checkbox changes are saved immediately, so closing with ×, Escape, or an outside click does not undo them. Those close actions discard any unsaved question edits and do not open tabs.

## Installation

Repository version `0.2.6` adds the official TradingView favicon in userscript metadata. The executable body and stored settings are unchanged. The existing Tampermonkey entry was updated and saved through the connected vscode.dev editor in Edge on 2026-09-14. A full source readback matched the repository file.

Install the complete `SVKO TradingView AI.user.js` source in Tampermonkey and reload `https://www.tradingview.com/chart/*`. This is a separate script and can run alongside Links and Tab Titles.

Grants: `GM_getValue`, `GM_setValue`, and `GM_openInTab`. Saved settings belong to this userscript identity and are separate from the development slot.

Version `0.2.5` was installed in the existing Edge profile on 2026-09-09. The production dialog was verified after reload. The development disk file was emptied and its Tampermonkey loader remains enabled. Agents must read [PUBLISH.md](PUBLISH.md) for subsequent publication.

## Agent instructions

- Keep this guide synchronized with behavior, metadata, configuration, and permissions.
- Follow the single development slot procedure in [AGENTS.md](AGENTS.md).
- Keep one delegated `contextmenu` listener. Do not add observers, timers, polling, or canvas interception.
- Create the dialog only when requested and remove it when closed.
- Leave right clicks outside the toolbar symbol button untouched.
- Use text properties for user content and encode the complete substituted question with `encodeURIComponent`.
- Preserve the toolbar symbol exactly, including exchange prefixes or suffixes.
- Run `node 'SVKO TradingView AI.test.cjs'` after logic changes.

## Licence

Open source + commercial licence. The current source is supplied under the [SVKO Personal Use and Commercial Licence 1.0](https://trading.cvladan.com/licensing/). Individuals may download, run, study and modify it free of charge for personal use, including trading real money for their own profit. Company use or use for an employer or client requires a separate paid commercial agreement, including internal use, integration, hosting, bundling and free distribution to customers.

Source code is public; business use is restricted, so this is not an OSI open-source licence. Third-party material retains its own licence. This update changes licensing notices only; the executable code and installed-version history are unchanged.
