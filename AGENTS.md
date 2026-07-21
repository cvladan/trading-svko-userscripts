# Userscript instructions

- Keep every userscript change as small and resource-efficient as possible. Do not add observers, timers, polling, DOM elements, event handlers, state, or abstractions unless the user explicitly requests them and they are necessary.
- Preserve existing comments. Do not delete them without explicit user approval; edit a comment only when necessary to keep it accurate after an approved code change.

## SVKO TradingView Tab Titles

- Keep exactly one `MutationObserver` instance, created once and registered once.
- The observer must watch only the document `<title>` element.
- Never observe layout, symbol, toolbar, `body`, `documentElement`, or the whole DOM.
- Read layout and symbol DOM values only when the title observer runs and only when the current template contains the corresponding `<layout>` or `<symbol>` placeholder.
- Do not add another observer, timer, polling loop, or scheduling mechanism unless the user explicitly changes this rule.
