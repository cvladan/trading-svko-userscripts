# TradingView Custom Sound

## Current scope and status

The user wants to try the supplied version 3.0.0 before deciding on improvements. The complete sample is saved in `TradingView Custom Sound.user.js`, with the requested installed name `TradingView Custom Sound ( Not Finished )`. Its original comments and remaining metadata are preserved. The only executable addition is an HTTPS, TradingView hostname and top frame guard before storage access or audio interception. No TTS, API requests, extra observers, timers, polling, menus or background services have been added.

The user postponed this work on 2026-09-14 after disliking the initial presentation. The code and plan are retained for a future explicit request. No production entry was installed. After verifying the saved source, the local development file was emptied to end the trial and free the slot. This is a deferred unfinished script, not a completed release. Already loaded pages retain their previous implementation until reloaded. The original sample remains in the user attachment.

Read [AGENTS.md](AGENTS.md), [SVKO Dev.md](SVKO%20Dev.md), [README.md](README.md), and [PUBLISH.md](PUBLISH.md). This file is the guide for the saved unfinished source. The trial procedure and development plan below apply only when the user resumes work. Rules specific to other scripts do not authorize adding their observers, timers or UI to this script.

## Baseline behavior

- Intercept the page's `Audio` constructor and `HTMLAudioElement.prototype.play`.
- Upload one Trade and one Alert audio file through the existing Tampermonkey menu. Store each as a data URI in GM storage.
- Learn the next intercepted source as Trade or Alert using the existing tagging commands. A normal URL is its own key. An embedded data URI uses characters 100 through 299 of its payload.
- Replace a recognized source with the corresponding uploaded audio. Skip replacement of the currently configured custom sources.
- Preserve the sample's fallback behavior for this trial: one uploaded sound replaces unknown sources; with both sounds uploaded, unknown sources fall back to Trade.
- Keep the sample's test, clear, toggle, reset and status commands unchanged.
- Preserve the sample's storage keys and comments. Development storage belongs to SVKO Dev and is separate from any future production entry. Do not reset unrelated values in the reusable slot.

## Efficiency constraints

The baseline has no observers, timers, polling or DOM scans. Its file input and change handler are created only when the user selects Upload. Audio is processed when construction or playback occurs. It still logs intercepted calls as in the original sample. No actual CPU or memory measurements have been made.

Keep future changes small. Add state, event handlers, DOM elements or abstractions only when required by a user approved behavior. Do not add persistent instrumentation to measure performance. Preserve existing comments and keep all documentation and comments in English; communicate with the user in Serbian.

## Trial procedure

1. Use the existing enabled universal SVKO Dev loader and this local source. Do not create another loader, repurpose its installed identity, or start a server or watcher.
2. Keep any separately installed copy of TradingView Custom Sound disabled during the trial. Its presence and enabled state have not been verified in this turn.
3. Reload the intended TradingView tab to load the new local file. This reload has not been performed by the agent.
4. Open the SVKO Dev menu on TradingView and use Show Status to check startup.
5. Upload a short audio file using Upload Trade Sound, then use Test Trade Sound to verify playback. Optionally repeat for Alert with a distinct short sound.
6. Test a harmless TradingView sound preview before testing actual events. Use Tag Next only when the next intended sound is controlled. Do not place or modify a real order solely to test audio.
7. Record which original sound was triggered, whether replacement occurred, whether tagging was correct, and what happened on repeat playback.
8. Reload and check that uploaded sounds and learned mappings remain available. Settings in other already open tabs may remain stale until reloaded.

The current canonical loader uses `document-idle`; the sample requests `document-start`. Metadata inside the required local file does not alter the installed loader timing. For this first trial, the loader has been left unchanged at the user's request to only save the local source. Sounds or saved native method references created before interception may be missed. If the trial demonstrates a timing problem, change only the necessary timing field through the existing connected editor, preserve every other universal loader field, and verify the result. Do not claim that the current trial starts at document-start.

## Detailed development plan

### Phase 1: Establish the baseline

Save the supplied sample to the free development slot with its complete original identity and the mandatory guard. Synchronize this guide and SVKO Dev.md. Check JavaScript syntax. Leave routing, logging, upload behavior and user controls as supplied so the user's first trial is comparable to the example. Success means the local baseline is ready for a trial; live playback must be reported separately.

### Phase 2: Observe the first trial

Follow the trial procedure above using the user's existing Edge profile and debugger connection. Prefer the existing browser session; do not launch a separate profile. Determine whether TradingView uses the intercepted HTML audio route for the sounds the user actually wants. A working uploaded sound test alone does not prove interception of real TradingView sounds. Record constructor timing, reused objects, unknown sounds, reload behavior and multiple tabs. Use only temporary debugger observations when needed.

### Phase 3: Select improvements from evidence

Review the observations with the user before expanding the baseline. Candidate improvements, not implemented in this trial:

1. Replace only recognized sources instead of using the sample's unknown sound fallback.
2. Learn at playback rather than construction, and provide a way to cancel pending tagging if needed.
3. Preserve original audio identity so disabling, clearing or changing a custom sound works on reused objects.
4. Remove routine console traffic from the playback path or make diagnostics explicitly opt in.
5. Improve fingerprint reliability only if real source behavior warrants it.
6. Add reasonable audio upload limits and validation if required by the chosen files.
7. Adjust loader timing only if necessary. Consider unsupported playback paths only after observing them; do not add speculative Web Audio interception or DOM observers.

Choose the smallest coherent set of fixes, document changed behavior, and test actual regressions rather than duplicating implementation details. Do not add a framework or a generalized audio subsystem for two replacement sounds.

### Phase 4: Optional TTS after the basic version is understood

TTS is planned only and must not be added during the baseline trial. The user's settled decision is: on a cache miss, wait for generation and then play the speech. Do not substitute the original sound while waiting.

1. Agree on the event to phrase mapping, voice, model and output format. The baseline only knows audio identities; it cannot infer order details from an audio source alone.
2. Verify the current OpenRouter speech API before implementing it. Keep credentials in the script's settings rather than repository source. Add only the actual production request grants and destination required.
3. Build a deterministic cache key from the text and every generation option affecting the audio, including model, voice, speed, format and optional instructions.
4. Look in a bounded in memory cache for the current tab, then persistent storage, then generate through OpenRouter only on a miss. IndexedDB Blob storage is a candidate for this TradingView scoped script; document origin scope and eviction behavior before committing to it.
5. Save successful generated audio and reuse it for subsequent playback. Share an in flight request for identical keys within a tab if repeated simultaneous events occur. Decide multi tab coordination from actual needs rather than adding polling.
6. During a miss, suppress the original sound and resolve playback consistently after generation. Handle API or playback failure visibly without silently switching to the original sound. Decide overlap versus queued speech before implementation.
7. Bound retained audio and release object URLs when no longer used. Perform cleanup on relevant operations, not periodic timers. A persistent cache is browser managed storage, not a guarantee against user deletion or eviction.
8. Verify first generation, cached replay, reload reuse, changed settings, simultaneous requests, errors and browser playback restrictions. Report measured latency separately for cache hits and misses.

### Phase 5: Finish and publish when the trial is complete

Validate the selected basic improvements first. Copy the complete development source into the intended production file and synchronize its sibling guide. Follow PUBLISH.md using the existing Tampermonkey connected vscode.dev editor for source transfer. A new production entry must exist in Tampermonkey before the web editor can update it. Keep production metadata limited to actual requirements and retain the complete executable source without a local development require.

Read back the complete saved source and compare it with disk. Verify persistence, enabled state and actual target behavior separately. Only after repository and installed production source are confirmed may the local SVKO Dev.user.js be emptied. Keep the single universal loader enabled and preserve its storage. Update status with exactly what was verified and identify any manual step still needed.

## Verification record

2026-09-14: The development slot was verified empty before writing. The sample was saved with only the required host/protocol/frame guard. JavaScript syntax passed. No production entry, loader change, audio upload, TTS request or live playback verification was performed. The user requested saving the simple local development source without further editor setup.

2026-09-14 deferral: Copied the complete development source into `TradingView Custom Sound.user.js`, changing only the name to append `( Not Finished )`. Syntax and full saved content verification passed before emptying `SVKO Dev.user.js`. No browser actions or installed script changes were performed during deferral.
