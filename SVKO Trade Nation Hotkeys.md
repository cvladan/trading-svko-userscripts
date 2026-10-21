# SVKO Trade Nation Hotkeys

Platform group: Trade Nation / TradeDirect365

Script: `SVKO Trade Nation Hotkeys.user.js`

## Purpose

This standalone Violentmonkey userscript adds keyboard shortcuts for manual trading on Trade Nation and TradeDirect365 chart pages. It also provides a read-only chart overlay for entry, stop-loss, and take-profit levels when the Trade From Chart extension is not present.

The userscript is not a Chrome extension and does not depend on extension files. Knowledge from the Trade From Chart extension was used only to understand the internal objects exposed by the platform, including `TradingPlatform.WSUTS`, `TradeTicket`, `ConnectionProxy`, and `PriceFeedMultiplexer`.

If Trade From Chart is loaded, the userscript does not overwrite it or patch its methods. It disables only its own duplicate chart overlay; all hotkeys remain active.

## Features

- Market Buy
- Market Sell
- Move the selected position's stop loss to break-even
- Place take profit near the current closing price for the selected position
- Close the selected position
- Close all open single positions on the current chart market
- Display read-only entry, stop-loss, and take-profit lines for open positions

## Default configuration

- Stake: `0.5`
- Initial stop loss: `10` points multiplied by the market's `BetPer` value
- Break-even offset: `1` point better than the opening price
- Take-profit touch offset: `1` point better than the current closing price
- Initial take profit on a new market order: disabled
- Position/SL/TP overlay: enabled when Trade From Chart is not loaded
- Demo-only protection: disabled
- Close All scope: current chart market only

## Installation

1. Install Violentmonkey in Firefox or Chrome.
2. Open the Violentmonkey dashboard and create a new userscript.
3. Paste the complete contents of `SVKO Trade Nation Hotkeys.user.js`.
4. Save the script.
5. Open a demo chart before testing any action.

Supported pages:

```text
https://demochart.tradenation.com/*
https://chart.tradenation.com/*
https://chart-cfd.tradenation.com/*
https://demochart.tradedirect365.com/*
https://chart.tradedirect365.com/*
https://demochart.tradedirect365.com.au/*
https://chart.tradedirect365.com.au/*
```

## Live-reload development

Violentmonkey blocks `@require file://`, so serve the repository through a small local server.

From the `userscripts` directory, run either:

```bash
python3 -m http.server 8080
```

or:

```bash
npx http-server -p 8080
```

Then open:

```text
http://localhost:8080/SVKO%20Trade%20Nation%20Hotkeys.user.js
```

Choose `Track external edits`, install the script, keep the source tab open, and enable `Reload tab`. If Violentmonkey later reports `Error loading script data`, reopen the same URL and enable tracking again.

## Hotkeys

```text
Ctrl + Alt + B = Market Buy
Ctrl + Alt + S = Market Sell
Ctrl + Alt + E = Move the selected position to break-even
Ctrl + Alt + T = Place take profit near the current closing price
Ctrl + Alt + X = Close the selected position
Ctrl + Alt + A = Close all positions on the current market
```

The script ignores hotkeys while the user is typing in an input, textarea, select, or contenteditable element. It also ignores repeated `keydown` events so holding a key does not submit repeated orders.

## Safety and demo-only protection

The configuration begins with:

```js
DEMO_ONLY: false,
```

The script therefore runs on both demo and live chart pages by default. To restrict it to demo pages, change the value to `true`.

Always validate behavior on a demo account first. The script relies on internal browser objects rather than a formal public Trade Nation API.

## Main configuration

The current configuration is defined near the top of the userscript:

```js
const CONFIG = {
  DEMO_ONLY: false,
  STAKE: "0.5",
  STOP_DISTANCE_POINTS: 10,
  BREAKEVEN_OFFSET_POINTS: 1,
  TAKE_PROFIT_TOUCH_OFFSET_POINTS: 1,
  LIMIT_DISTANCE_POINTS: 0,
  COOLDOWN_MS: 750,
  RUNTIME_WAIT_MS: 3500,
  BOOTSTRAP_POLL_MS: 500,
  MAINTENANCE_REFRESH_MS: 2500,
  SHOW_TRADE_OVERLAY: true,
  DEBUG_TRADE_OVERLAY: false,
  TRADE_OVERLAY_CURRENT_MARKET_ONLY: true,
  TRADE_OVERLAY_FALLBACK_TO_ALL_POSITIONS: true,
  TRADE_OVERLAY_REFRESH_MS: 350,
  TRADE_OVERLAY_ACCOUNT_REFRESH_MS: 1000,
  TRADE_OVERLAY_STATUS_BADGE: true,
  CLOSE_ALL_CURRENT_MARKET_ONLY: true,
  BUY_HOTKEY: { ctrlKey: true, altKey: true, shiftKey: false, code: "KeyB" },
  SELL_HOTKEY: { ctrlKey: true, altKey: true, shiftKey: false, code: "KeyS" },
  BREAKEVEN_HOTKEY: { ctrlKey: true, altKey: true, shiftKey: false, code: "KeyE" },
  TAKE_PROFIT_HOTKEY: { ctrlKey: true, altKey: true, shiftKey: false, code: "KeyT" },
  CLOSE_HOTKEY: { ctrlKey: true, altKey: true, shiftKey: false, code: "KeyX" },
  CLOSE_ALL_HOTKEY: { ctrlKey: true, altKey: true, shiftKey: false, code: "KeyA" },
};
```

## Chart overlay

The read-only overlay displays:

```text
BUY/SELL stake @ entry price
SL or BE stop price
TP take-profit price
```

Its primary position source is:

```text
ConnectionProxy.lastAccountPositions.Records
```

If that snapshot is not populated, the script defensively checks internal `TradeTicket` and `ConnectionProxy` position collections. It also passively listens to the platform's account-position callbacks so it can receive data without the Chrome extension.

Each line's vertical position is calculated through the ChartIQ runtime:

```text
stxx.pixelFromPrice(...)
```

Lines refresh on the configured timer and the ChartIQ `draw` hook so they follow chart movement and zoom. They are not draggable. SL and TP changes are submitted only through the hotkeys and Trade Nation's internal trading objects.

The Trade From Chart presence check runs once during userscript startup. When detected, only the userscript overlay is disabled. Buy, Sell, Break-even, Take-profit touch, Close, and Close All remain active.

To display positions from all markets, set:

```js
TRADE_OVERLAY_CURRENT_MARKET_ONLY: false,
```

This is generally unsuitable for daily use because lines from other markets may be outside the current chart scale or misleadingly close to the current price.

If the current-market filter finds no positions, the default fallback allows all drawable open-position records:

```js
TRADE_OVERLAY_FALLBACK_TO_ALL_POSITIONS: true,
```

This compensates for cases where the chart `FID` and position `MarketID` use formats that do not match exactly.

For a one-time diagnostic snapshot, run this in the browser console:

```js
TNHotkeysTradeOverlayDebug()
```

For continuous diagnostic logs, set:

```js
DEBUG_TRADE_OVERLAY: true,
```

## Stake and stop loss

`STAKE` is sent as the size of each Market Buy or Market Sell order.

For a Buy position, the initial stop is:

```text
entry price - (STOP_DISTANCE_POINTS * BetPer)
```

For a Sell position, the initial stop is:

```text
entry price + (STOP_DISTANCE_POINTS * BetPer)
```

`BetPer` and the price precision come from the market-details object already used by the platform.

## Break-even offset

```js
BREAKEVEN_OFFSET_POINTS: 1
```

The value controls the stop position relative to the opening price:

```text
0  = exactly at entry
1  = one point better than entry
-1 = one point worse than entry
```

For Buy:

```text
stop = OpeningPrice + (BREAKEVEN_OFFSET_POINTS * BetPer)
```

For Sell:

```text
stop = OpeningPrice - (BREAKEVEN_OFFSET_POINTS * BetPer)
```

The platform may reject a `+1` stop when the market has not moved far enough in the position's favor. In that case, use `0` or wait for more favorable movement.

## Take-profit touch offset

```js
TAKE_PROFIT_TOUCH_OFFSET_POINTS: 1
```

The value controls take profit relative to the current closing price:

```text
0  = at the current closing price
1  = one point better than the current closing price
-1 = one point worse than the current closing price
```

For Buy positions, the current closing side is Bid:

```text
TP = Bid + (TAKE_PROFIT_TOUCH_OFFSET_POINTS * BetPer)
```

For Sell positions, the current closing side is Ask:

```text
TP = Ask - (TAKE_PROFIT_TOUCH_OFFSET_POINTS * BetPer)
```

The existing stop loss is preserved. Only the take-profit part of the close/protection order changes.

## Initial take profit

```js
LIMIT_DISTANCE_POINTS: 0
```

`0` disables an initial take profit. A positive value submits an if-done take-profit order with a new market order: above entry for Buy and below entry for Sell.

## Cooldown

```js
COOLDOWN_MS: 750
```

This prevents accidental duplicate Buy or Sell actions within a very short interval.

## Position selection

Break-even, Take-profit touch, and Close select a position in this order:

1. The most recent position opened by the userscript, if it still exists.
2. The newest open single position with a usable opening time.
3. The open position nearest to the mouse's current vertical chart position.
4. The first open single position on the current market when chart mapping is unavailable.

Moving the mouse near a position line before using a position-specific hotkey helps select the intended position.

## Internal trading flows

### Market Buy and Sell

The script:

1. Reads `FID` and `QID` from the chart URL or page helper functions.
2. Reads the live quote from `PriceFeedMultiplexer._quotes[QID + "-Candle1Min"]`, falling back to `TradeTicket._quote`.
3. Reads market details from `marketdetails` or `TradingPlatform.WSUTS.GetMarketDetails`.
4. Uses Ask for Buy entry and Bid for Sell entry.
5. Calculates the initial stop loss.
6. Calls `TradingPlatform.WSUTS._staticInstance.RequestTrade(...)`.

### Break-even

The script selects a position, calculates the target stop from `OpeningPrice`, and preserves any existing take profit. It calls `InsertCloseOrder(...)` when no protection order exists and `AmendCloseOrder(...)` when one already exists.

Break-even is therefore implemented by creating or amending a protection order, not through a separate public API endpoint.

### Take-profit touch

The script selects a position, reads the current Bid or Ask, calculates the target take profit, and preserves any existing stop loss. It uses the same `InsertCloseOrder(...)` or `AmendCloseOrder(...)` flow.

### Close

The script selects a position, uses Bid to close Buy or Ask to close Sell, then calls `InsertClosePosition(...)` or, for CFD trade types, `InsertClosePositionCFD(...)`.

### Close All

By default, Close All finds every open single position on the current chart market, applies the normal Close flow to each one, and inserts a short delay between requests. It does not close positions on other markets while `CLOSE_ALL_CURRENT_MARKET_ONLY` is `true`.

## Status and logs

The script displays a small status box in the lower-right corner and logs messages to the browser console with this prefix:

```text
[TN hotkeys]
```

## Limitations

- The script depends on internal Trade Nation page objects.
- A platform frontend, function-name, or position-schema change can break it.
- Repository checks validate JavaScript syntax only.
- Real behavior must be tested on the demo platform.
- The script is not a trading bot; it acts only when a hotkey is pressed.
- It does not guarantee order fills.
- It does not change or bypass the platform's risk controls.
- Close All is limited to the current chart market by default.

## Recommended demo test

1. Open a demo chart and confirm that the loaded status appears.
2. Press `Ctrl + Alt + B` and confirm that a Buy position opens with a stop loss.
3. Press `Ctrl + Alt + E` and confirm that the stop moves to the configured break-even offset.
4. Press `Ctrl + Alt + T` and confirm that take profit is placed near the current closing price.
5. Press `Ctrl + Alt + X` and confirm that the selected position closes.
6. Open two small demo positions on the same market.
7. Press `Ctrl + Alt + A` and confirm that positions on the current market close.

## Agent instructions

- Keep this document synchronized with userscript metadata, supported hosts, configuration defaults, hotkeys, behavior, permissions, and internal platform dependencies.
- Treat all order-submission changes as high risk and keep them tightly scoped to the user's request.
- Preserve demo-first testing guidance and do not claim that syntax validation proves live trading behavior.
- Preserve the one-time Trade From Chart startup check and the rule that only the duplicate userscript overlay is disabled when the extension is detected.
- Do not patch or overwrite Trade From Chart extension methods.
- Do not broaden Close All beyond the configured scope without explicit user approval.
- Do not add timers, polling, observers, interface elements, event handlers, state, or abstractions unless explicitly requested and necessary.

## Licence

Open source + commercial licence. The current source is supplied under the [SVKO Personal Use and Commercial Licence 1.0](https://trading.cvladan.com/licensing/). Individuals may download, run, study and modify it free of charge for personal use, including trading real money for their own profit. Company use or use for an employer or client requires a separate paid commercial agreement, including internal use, integration, hosting, bundling and free distribution to customers.

Source code is public; business use is restricted, so this is not an OSI open-source licence. Third-party material retains its own licence. This update changes licensing notices only; the executable code and installed-version history are unchanged.
