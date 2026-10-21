# SVKO TradingView Alerts Custom Sounds

Version 0.1.0 provides a local custom sound library and TradingView alert editor integration. Follow AGENTS.md, SVKO Dev.md and PUBLISH.md. Use the single development slot only after the previous target has released it.

## Behaviour and constraints

Use `[sound:soft-bell]` in an alert message to select a locally stored recording. Names match `^[a-z]+(?:-[a-z]+)*$` and are unique. Observe only TradingView alert toasts, automatically in each chart tab. Existing toasts are the startup baseline. Multiple tabs can play the same event independently.

The Notifications editor offers Custom sound, None, Add sound and Manage sounds. A custom selection enables toast notifications and disables native Play sound in the notification draft. Applying Notifications commits the tag through TradingView's message editor, without submitting the final alert. Cancel discards the notification draft. None removes the tag without enabling native sound. Enabling native sound selects None. Opening an alert does not change it.

Store recordings under `svko-tv-sounds:v1:sound:` keys in this script's GM storage. Add, Preview, Replace audio and Delete are supported. Names are permanent references. Replacement preserves the name. Imports persist even if the alert draft is cancelled. Limit individual files to 5 MiB and total original audio bytes to 50 MiB. Validate audio in the browser before saving. Never read the original disk path during playback, send audio over the network or migrate other scripts' storage.

One MutationObserver instance serves the dedicated alert log, direct portal children and transient popup branches. Popup shells mount before their editor contents, so their branches must also be watched. The chart toast branch is excluded from popup observation; only the alert log is observed inside it. Do not observe the entire chart. A temporary startup observer may last at most ten seconds. No polling, intervals, permanent diagnostic panel, audio prototype patching or constructor replacement. Native audio is disabled only through the alert's own draft controls. Error notices appear only when needed.

Use stable observed data attributes for the TradingView editor, not internal React objects. Preserve message text and placeholders. Missing recordings, invalid tags, multiple tags and playback failures must be reported without guessing a replacement. Playback is once per event, with overlap allowed. No TTS or queue is part of this script.

## Publication and validation status

Version 0.1.0 is installed and enabled in Edge as of 2026-10-02. The user saved the production entry. A fresh complete source read through the connected vscode.dev editor matched the repository after removing four spaces from one blank line in the repository source. SHA-256: `f982e572ad20cdfa539ed8089bbd5333b786e5ec3c2450f60c12971424161324`. Only then was SVKO Dev emptied to zero bytes; its universal loader remains enabled and unchanged.

After reloading TradingView, exactly one Custom sound selector appeared. The separate production library started empty. Importing the synthetic `soft-bell` WAV and previewing it reached “Preview finished.” The temporary alert draft was closed without saving. The production menu exposes Manage custom sounds; SVKO Dev exposes no custom sound command. Development storage was neither migrated nor cleared.

During the earlier development loading check, the exact existing loader source was re-saved without metadata changes. Initial reloads did not execute the required source; a later reload did. The precise cause was not established. Do not treat that observation as proof of a file URL permission problem.

On 2026-10-02, JavaScript syntax and all 34 synthetic scenarios passed. Live Edge checks confirmed custom controls in Notifications, importing WAV audio, persistence after reload, Preview reaching the ended event, automatic toast enablement and native sound disablement, writing the tag into TradingView's controlled message field, and changing the sound on a named alert without changing its other text. Named alert summaries contain both a name and a message; the tooltip markup is read in an inert template to separate them.

A real once-only alert named `SVKO custom sound test`, on IG:NASDAQ greater than 1, was created with toast enabled and app, email, webhook and native audio disabled. At 18:58:07 local time its toast contained `Custom sound test [sound:soft-bell]`. A temporary debugger breakpoint verified the custom data URI audio reached `ended: true`, with duration and currentTime both 0.25 seconds. The breakpoint was removed and the debugger disabled. The once-only test alert remains in TradingView; it was not deleted. A subsequent message change was cancelled. Two 0.25-second synthetic WAV recordings, `soft-bell` and `price-alert`, remain in the development library for the user's trial. A fresh import of the same `soft-bell` test file is also available in the production library.

Speech was left untouched. The installed Speech script also reacted to the real test toast, demonstrating that the two scripts operate independently. Speech 0.2.0 retained the sound marker in speech text; Speech 0.2.1 removes it and requires its own `[say]` tag. Background and multiple-tab audio have not been verified live. Audio replacement, deletion, storage failures and cancellation races were covered synthetically; do not describe them as live-tested.

## Validation

Run:

```sh
node --check 'SVKO TradingView Alerts Custom Sounds.user.js'
NODE_PATH=/tmp/svko-alert-validation/node_modules node 'SVKO TradingView Alerts Custom Sounds.test.cjs'
```

The tests use the existing jsdom 26.1.0 installation in `/tmp/svko-alert-validation`, synthetic GM storage and synthetic audio. Pass `SVKO Dev.user.js` as the final argument to test the development copy. They cover tag validation, repeated and delayed toasts, startup baselines, source guards, storage replacement, autoplay failure, imports, file and library limits, duplicate names, write errors, cancelled asynchronous imports, deletion confirmation, popup shell timing, native controlled draft updates, Cancel and named alert summaries.

## Use

Open an alert's Notifications screen and use Custom sound. Add sound imports a local recording and selects it. Apply updates the notification draft and then the message through TradingView's own message editor. Finally choose Create or Save in TradingView to save the alert. None removes the tag on Apply. Opening and cancelling the Notifications screen does not change the saved alert.

Manage sounds opens the library; the same library is available through the single Manage custom sounds Tampermonkey command. Preview reports completion. Replace audio retains the permanent name. Delete requests confirmation and leaves existing alert messages unchanged. Missing recordings produce a visible error when referenced.

Sounds play once and may overlap. Existing toasts are not replayed on startup. There is no coordination between chart tabs. Audio validation and initial DOM discovery have bounded ten-second timeouts; committing a custom selection has a five-second failure timeout. There are no recurring timers.

## Compatibility

Development and production have separate storage. Disabling or removing this script leaves native Play sound disabled on alerts configured for custom audio until the user enables it again. Browser autoplay restrictions still apply. DOM detection is not a unique TradingView event ID: recreation of an old toast may count again, and identical updates within a reused node and displayed time cannot be distinguished.

Speech 0.2.1 requires `[say]` or `[say:language]` and removes `[sound:name]` before speaking. A sound tag alone triggers only custom audio, a speech tag alone triggers only speech, and both tags trigger both scripts independently. With neither tag, neither script plays audio. TradingView native audio follows its own alert setting. This script does not rewrite toast text or modify Speech.

## Licence

Original SVKO source uses the SVKO Personal Use and Commercial Licence 1.0, https://trading.cvladan.com/licences/SVKO-1.0.txt. The deferred third party sample remains separate with its original attribution.
