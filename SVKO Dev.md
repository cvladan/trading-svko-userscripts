# SVKO Dev

The development slot is empty and available. The installed SVKO Dev loader remains enabled and unchanged.

Last completed target: **SVKO TradingView Watchlist** (0.2.1). Guide: [SVKO TradingView Watchlist.md](SVKO%20TradingView%20Watchlist.md). On 2026-10-21, the complete production source was saved through vscode.dev and verified after reloading the editor. All 15 regression scenarios passed. Production was checked on the symbol and chart pages after emptying `SVKO Dev.user.js` to zero bytes. No duplicate badges were found. The website update is deferred.

Previously completed target: **SVKO TradingView Squawkbox** (0.1.1). Guide: [SVKO TradingView Squawkbox.md](SVKO%20TradingView%20Squawkbox.md). On 2026-10-02, the user saved the separate production entry. Its complete saved source was read through a fresh vscode.dev connection. Only trailing whitespace differed; the repository was aligned with the saved source, SHA-256 `a00716cd2fb1e89a5f404a1c65b81364af14d6f5038f972173f5cafbf3bc6a12`. Only after this comparison was `SVKO Dev.user.js` emptied to zero bytes. The reloaded TradingView tab showed the production Squawkbox menu command and the enabled development loader without a Squawkbox command. Manual opening and minimize/restore work in production. Development settings remain untouched and separate from production. Syntax and 20 automated scenarios passed. Production followed IG:NASDAQ and counted more than 20 sounds while minimized, with direction indicators updating. The panel was closed after the check, stopping playback. Hidden tab operation remains unverified. See [PUBLISH.md](PUBLISH.md).

Previously completed target: **SVKO TradingView Alerts Custom Sounds** (0.1.0). Guide: [SVKO TradingView Alerts Custom Sounds.md](SVKO%20TradingView%20Alerts%20Custom%20Sounds.md). On 2026-10-02, a fresh read of the user-saved production source through vscode.dev matched repository SHA-256 `f982e572ad20cdfa539ed8089bbd5333b786e5ec3c2450f60c12971424161324`. The only initial difference was four spaces on a blank line, removed from the repository source. Only after the complete comparison was the development file emptied. Reloading TradingView showed exactly one custom selector; importing and previewing a synthetic WAV in the separate production library completed successfully. The production menu has Manage custom sounds; the enabled development loader has no sound command. Development recordings remain untouched. Syntax and 34 synthetic scenarios passed before publication, and one real toast completed playback during development. See [PUBLISH.md](PUBLISH.md).

Previously completed target: `SVKO TradingView Alert Speech.user.js` (0.2.0). Guide: [SVKO TradingView Alert Speech.md](SVKO%20TradingView%20Alert%20Speech.md). On 2026-10-02 the user saved the production entry. Its complete source was read through the connected vscode.dev editor and matched the repository SHA-256 `65c75a9eea605e3f619c6ea77dd94e251325c18e2a7c1938875b6a03f2e65f25`. Only then was the development file emptied. Reloading TradingView showed exactly one production panel, automatic listening and the production Speech settings command. The menu showed the empty SVKO Dev loader still enabled with no development speech command.

All 15 detection and 20 speech scenarios passed before publication. Development also passed live English and Serbian speech and recording reuse after reload. The production identity has separate empty settings; the user must enter their key there. Production settings and section defaults were checked, but production speech was not sent without a key. Development credentials and recordings remain in SVKO Dev storage, untouched and not migrated. See [PUBLISH.md](PUBLISH.md) for publication evidence.

Deferred target: `TradingView Custom Sound.user.js` (sample 3.0.0), saved as `TradingView Custom Sound ( Not Finished )`. Guide: [TradingView Custom Sound.md](TradingView%20Custom%20Sound.md).

On 2026-09-14 the user ended the basic Custom Sound trial and deferred further work. The complete local development source was copied to its own repository file with the requested name suffix. Syntax and full saved content verification passed before `SVKO Dev.user.js` was emptied. The slot is free. This was a user requested deferral, not a finished production publication. No installed script, universal loader or storage was changed. Already loaded pages retain the previous trial code until reloaded.

The Watchlist session completed on 2026-09-14. The user created and saved the production entry in Tampermonkey. Codex reopened its complete source through vscode.dev and verified that it matched the repository source. Only after that comparison was `SVKO Dev.user.js` emptied to zero bytes. The single installed universal loader was left unchanged and enabled for reuse.

Validation passed all 14 regression scenarios and the syntax check. After reloading TradingView with the empty development file, production showed white hover prices with transparent backgrounds for both regular and extended session instruments. Regular prices were hidden outside row hover, extended badges restored their colored percentages on exit, and no row had duplicate badges. There was exactly one Watchlist stylesheet.

The AI `0.2.6`, Links `0.6.3`, and Tab Titles `0.6.3` icon updates were saved in their existing entries through vscode.dev in Edge. Reopening all three sources after the workspace reloaded confirmed complete source hashes matching the repository. Their executable bodies and stored settings were unchanged.

Completed script guide: [SVKO TradingView Watchlist.md](SVKO%20TradingView%20Watchlist.md). Read [PUBLISH.md](PUBLISH.md) for the verified publication workflow and [AGENTS.md](AGENTS.md) before starting the next target. The slot is empty and free after the Watchlist update described above. Do not overwrite its installed universal metadata with production metadata.

## Permanent universal loader

The user requested this permanent configuration on 2026-09-11. Reuse the single installed `SVKO Dev` entry and preserve its existing namespace when updating it. The namespace below is the repository default for a new entry. This block is the canonical loader source; do not create an additional loader file or a second development entry.

```js
// ==UserScript==
// @name         SVKO Dev
// @namespace    cvladan.com
// @version      1.0.0
// @description  Reusable local development slot for SVKO userscripts.
// @match        https://*/*
// @match        http://*/*
// @noframes
// @run-at       document-idle
// @connect      *
// @grant        unsafeWindow
// @grant        window.close
// @grant        window.focus
// @grant        window.onurlchange
// @grant        GM_addElement
// @grant        GM_addStyle
// @grant        GM_download
// @grant        GM_getResourceText
// @grant        GM_info
// @grant        GM_log
// @grant        GM_notification
// @grant        GM_openInTab
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_setClipboard
// @grant        GM_getTab
// @grant        GM_saveTab
// @grant        GM_getTabs
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_setValues
// @grant        GM_getValues
// @grant        GM_deleteValues
// @grant        GM_addValueChangeListener
// @grant        GM_removeValueChangeListener
// @grant        GM_webRequest
// @grant        GM_cookie
// @grant        GM_audio
// @grant        GM_getResourceURL
// @grant        GM_xmlhttpRequest
// @grant        GM.addElement
// @grant        GM.addStyle
// @grant        GM.download
// @grant        GM.getResourceText
// @grant        GM.info
// @grant        GM.log
// @grant        GM.notification
// @grant        GM.openInTab
// @grant        GM.registerMenuCommand
// @grant        GM.unregisterMenuCommand
// @grant        GM.setClipboard
// @grant        GM.getTab
// @grant        GM.saveTab
// @grant        GM.getTabs
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.deleteValue
// @grant        GM.listValues
// @grant        GM.setValues
// @grant        GM.getValues
// @grant        GM.deleteValues
// @grant        GM.addValueChangeListener
// @grant        GM.removeValueChangeListener
// @grant        GM.webRequest
// @grant        GM.cookie
// @grant        GM.audio
// @grant        GM.getResourceUrl
// @grant        GM.xmlHttpRequest
// @resource     uPlotJS https://cdn.jsdelivr.net/npm/uplot@1.6.32/dist/uPlot.iife.min.js
// @resource     uPlotCSS https://cdn.jsdelivr.net/npm/uplot@1.6.32/dist/uPlot.min.css
// @require      file:///Users/cvladan/dev.trading/userscripts/SVKO%20Dev.user.js
// ==/UserScript==
```

Keep all HTTP/HTTPS matches, the explicit GM grants, `@connect *`, the pinned uPlot resources and the absolute local `@require` across development sessions. Do not replace them with the current target's narrower metadata. Ordinary changes require only saving `SVKO Dev.user.js` and reloading the target page.

Tampermonkey requires named grants; do not substitute `@grant *` or `@grant none`. Both legacy and modern API names are listed, including the differently capitalised resource URL and HTTP request APIs. Availability still depends on the installed Tampermonkey/browser version; a grant cannot provide an unsupported API. See the [official grant documentation](https://www.tampermonkey.net/documentation.php?locale=en&q=grant) and [API reference](https://www.tampermonkey.net/documentation.php).

The loader defaults to the top frame at `document-idle`. Only a target that actually needs a different run timing, frame policy, execution context or a new named resource warrants changing those settings. Resource declarations make uPlot available without executing it; the local source loads it only when charts are requested. Keep the local file as the sole `@require`.

Universal matching covers ordinary websites, not browser-internal or extension pages. Each target source must return before doing work on an unrelated host/path or frame. Trading Statistics may register its menu command on ordinary pages, as requested. Broad grants do not themselves read data, send requests or create listeners.

Keep production metadata scoped to actual requirements. The complete source in the disk development file retains its production identity and metadata; its header does not configure this loader. The development and production entries have separate storage.

## Installation status

On 2026-09-11 the user confirmed saving the universal loader. Live checks verified that it loads the local Trading Statistics source, its chart resources and GM storage on both Trade Nation and an unrelated HTTPS page. Editing the local file and reloading is sufficient for this session.

Trading Statistics 0.4.4 development completed on 2026-09-12. The user confirmed saving the complete production source in Tampermonkey. After confirming that both repository sources matched and preserving the archive, `SVKO Dev.user.js` was emptied. The production panel loaded successfully after reload with an initially separate, empty archive. The single SVKO Dev entry was left untouched and its required file now executes no code.

The final development backup is `/Users/cvladan/Downloads/Trading Statistics 2026-09-12.json`. Its format and complete archive were validated before importing into production: two accounts, 4,261 records and saved preferences. Subsequent production pulls matched all 12 exported fields for 3,434 CFD records and 827 Spread records, with zero differing references on either account. The independent dashboard retained All accounts, All stored data and April 2026 after reload; calendar keyboard navigation was checked on the installed production version.

Watchlist subsequently used this slot and completed on 2026-09-14 as recorded above. Custom Sound was subsequently deferred and saved to its own file; the development slot is empty again. Read the next target guide before using the slot. Keep the permanent universal loader unchanged. The old development identity's GM archive has not been deleted; the verified JSON backup remains outside the repository.
