# SVKO TradingView Links

Platform group: TradingView

Script: `SVKO TradingView Links.user.js`

## Purpose

This Violentmonkey userscript turns supported ticker symbols drawn inside TradingView canvases into clickable chart links. It recognizes the built-in exchange prefixes plus optional prefixes configured through the userscript menu.

## Supported pages

The script runs on TradingView and its subdomains:

```text
https://www.tradingview.com/*
https://*.tradingview.com/*
```

## Behavior

- Intercepts canvas `fillText` and `strokeText` calls to locate supported ticker text.
- Stores the on-screen hit area for each ticker drawn in the current animation frame.
- Shows a small outline and a pointer cursor when the mouse is over a detected ticker.
- Opens the selected symbol in the active chart when TradingView's internal chart API is available.
- Falls back to a TradingView chart URL when the internal API is unavailable.
- Supports opening in a new tab through Shift-click, Ctrl-click, Command-click, or the saved menu preference.
- Clears stale hit areas after scrolling or resizing.

The built-in prefixes are:

```text
NASDAQ, NYSE, AMEX, XETR, FWB, LSE, EURONEXT, MIL, BME, SIX, OMXSTO, OMXCOP, OMXHEX
```

The default additional prefixes are:

```text
TRADENATION, IG
```

## Userscript menu

- `Set extra prefixes` saves a comma-separated list through `GM_setValue` and reloads the page so the recognition pattern is rebuilt.
- `Set link opening` saves whether a normal click should open the chart in the same tab or a new tab.

## Installation

Repository version `0.6.3` adds the official TradingView favicon in userscript metadata. The executable body and stored settings are unchanged. The existing Tampermonkey entry was updated and saved through the connected vscode.dev editor in Edge on 2026-09-14. A full source readback matched the repository file.

Install `SVKO TradingView Links.user.js` through Violentmonkey in Firefox or Chrome. After installation, reload TradingView.

## Agent instructions

- Keep this document synchronized with the userscript metadata, behavior, menu options, permissions, and supported pages.
- Keep the canvas patch limited to `fillText` and `strokeText` unless the user explicitly requests wider coverage.
- Preserve the original canvas methods and always delegate to them after collecting ticker geometry.
- Keep hit testing passive: do not interfere with clicks that are outside a detected ticker.
- Do not add polling, observers, or extra interface elements unless the requested behavior requires them.
- Preserve the existing `GM_getValue`, `GM_setValue`, `GM_registerMenuCommand`, and `unsafeWindow` grants unless an approved behavior change makes a grant unnecessary or requires another one.

## Licence

Open source + commercial licence. The current source is supplied under the [SVKO Personal Use and Commercial Licence 1.0](https://trading.cvladan.com/licensing/). Individuals may download, run, study and modify it free of charge for personal use, including trading real money for their own profit. Company use or use for an employer or client requires a separate paid commercial agreement, including internal use, integration, hosting, bundling and free distribution to customers.

Source code is public; business use is restricted, so this is not an OSI open-source licence. Third-party material retains its own licence. This update changes licensing notices only; the executable code and installed-version history are unchanged.
