# SVKO TradingView Tab Titles

Platform group: TradingView

Script: `SVKO TradingView Tab Titles.user.js`

## Purpose

This Violentmonkey userscript replaces TradingView chart tab titles with a configurable template. A title may be stored globally for all TradingView chart tabs or overridden for one browser tab.

## Supported pages

```text
https://www.tradingview.com/chart/*
```

## Title storage

- The global template is stored in `localStorage` under `svko-tab-title-global`.
- A per-tab template is stored in `sessionStorage` under `svko-tab-title`.
- The per-tab template takes precedence over the global template.
- Clearing the per-tab value restores the global template.
- Clearing both values restores TradingView's own title.

## Template placeholders

The script supports values read from TradingView's title:

```text
<title:p1> through <title:p5>
<title:arrow> or <title:arrow:v1> through <title:arrow:v8>
```

For a TradingView title such as:

```text
GOOG.EX 371.59 ▲ +3.46% TN Stocks
```

the five parts are the symbol, price, direction arrow, percentage change, and remaining market label.

It also supports values read from the page only when requested by the active template:

```text
<layout>
<symbol>
```

The default example is:

```text
<title:p5> <title:arrow:v2> <title:p4> <title:p1>
```

## Userscript menu

- `Set This Tab Title` creates or clears the current tab override.
- `Set Global Tab Title` creates or clears the global template.

## Installation

Repository version `0.6.3` adds the official TradingView favicon in userscript metadata. The executable body, title observer, and stored settings are unchanged. The existing Tampermonkey entry was updated and saved through the connected vscode.dev editor in Edge on 2026-09-14. A full source readback matched the repository file.

Install `SVKO TradingView Tab Titles.user.js` through Violentmonkey in Firefox or Chrome, then reload an open TradingView chart.

## Agent instructions

- Keep this document synchronized with the userscript metadata, behavior, placeholders, storage keys, menu commands, permissions, and supported pages.
- Keep exactly one `MutationObserver` instance, created once and registered once.
- Observe only the document `<title>` element.
- Never observe layout, symbol, toolbar, `body`, `documentElement`, or the whole DOM.
- Read layout and symbol DOM values only while the title observer is running and only when the active template contains the matching `<layout>` or `<symbol>` placeholder.
- Do not add another observer, timer, polling loop, or scheduling mechanism unless the user explicitly changes this rule.
- Preserve TradingView's latest native title so clearing custom templates restores it correctly.

## Licence

Open source + commercial licence. The current source is supplied under the [SVKO Personal Use and Commercial Licence 1.0](https://trading.cvladan.com/licensing/). Individuals may download, run, study and modify it free of charge for personal use, including trading real money for their own profit. Company use or use for an employer or client requires a separate paid commercial agreement, including internal use, integration, hosting, bundling and free distribution to customers.

Source code is public; business use is restricted, so this is not an OSI open-source licence. Third-party material retains its own licence. This update changes licensing notices only; the executable code and installed-version history are unchanged.
