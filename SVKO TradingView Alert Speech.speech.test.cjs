// Synthetic speech tests use fake credentials, responses and audio, never a live API.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { webcrypto } = require('node:crypto');
const { JSDOM } = require('jsdom');
const source = fs.readFileSync(path.resolve(__dirname, process.argv[2] || 'SVKO TradingView Alert Speech.user.js'), 'utf8');
const SETTINGS = 'svko-alert-speech:settings';
const config = { apiKey: 'synthetic-test-key', voice: 'Kore', language: 'en' };
const wait = () => new Promise(resolve => setTimeout(resolve, 2));
async function until(check) { for (let i = 0; i < 150; i++) { if (check()) return; await wait(); } assert.fail('Timed out waiting for test state'); }

function environment(storage = new Map([[SETTINGS, config]]), options = {}) {
  const dom = new JSDOM('<button data-name="toast-group-expand-button-alerts" aria-controls="alerts"></button><div role="log"><ul id="alerts"></ul></div>', { url: 'https://www.tradingview.com/chart/test/', runScripts: 'outside-only' });
  const w = dom.window, d = w.document, menus = new Map(), requests = [], players = [], contexts = [], roots = [], reads = [];
  Object.defineProperty(w, 'crypto', { value: webcrypto });
  w.TextEncoder = TextEncoder; w.TextDecoder = TextDecoder;
  w.GM_registerMenuCommand = (label, callback) => menus.set(label, callback);
  w.GM = {
    getValue: async (key, fallback) => { reads.push(key); return JSON.parse(JSON.stringify(storage.has(key) ? storage.get(key) : fallback)); },
    setValue: async (key, value) => { if (options.failSave) throw Error('Synthetic write failure'); storage.set(key, JSON.parse(JSON.stringify(value))); },
  };
  w.GM_xmlhttpRequest = details => {
    const request = { details, aborted: false, reply(status = 200, mime = JSON.parse(details.data).response_format === 'pcm' ? 'audio/pcm' : 'audio/mpeg', bytes = [73, 68, 51, 1]) {
      details.onload({ status, responseHeaders: 'Content-Type: ' + mime, response: Uint8Array.from(bytes).buffer });
    } };
    requests.push(request);
    if (!options.manualResponse) queueMicrotask(() => request.reply(options.httpStatus || 200));
    return { abort() { request.aborted = true; details.onabort(); } };
  };
  w.AudioContext = class {
    constructor() { this.state = 'suspended'; this.destination = {}; contexts.push(this); }
    async resume() { if (options.failResume) throw Error('Synthetic resume failure'); if (!options.blockAudio) this.state = 'running'; }
    async close() { this.state = 'closed'; }
    async decodeAudioData(bytes) { if (options.failDecode || !bytes.byteLength) throw new w.Error('Audio decoding failed'); return { length: bytes.byteLength }; }
    createBuffer(channels, length, rate) { if (options.failDecode) throw new w.Error('Audio decoding failed'); const samples = new Float32Array(length); return { length, sampleRate: rate, getChannelData: () => samples }; }
    createBufferSource() {
      const player = { connect() {}, disconnect() {}, stop() { this.stopped = true; }, start() {
        if (options.failPlay) throw new w.Error('Synthetic playback failure');
        players.push(this);
      }, end() { this.onended?.(); } };
      return player;
    }
  };
  w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  const attach = w.Element.prototype.attachShadow;
  w.Element.prototype.attachShadow = function (init) { const root = attach.call(this, init); roots.push(root); return root; };
  // Expose lifecycle functions only inside the test instance.
  w.eval(source.replace(/\}\)\(\);\s*$/, 'window.__test = { start, stop };})();'));
  const status = () => d.getElementById('svko-alert-speech-status')?.textContent || '';
  function alert(text, time = '12:00:00') {
    const item = d.createElement('li');
    const message = d.createElement('span'); message.className = 'description-test'; message.textContent = text;
    const clock = d.createElement('span'); clock.className = 'time-test'; clock.textContent = time;
    item.append(message, clock); d.getElementById('alerts').append(item);
  }
  const start = () => w.__test.start();
  const stop = () => w.__test.stop();
  const enable = () => { options.blockAudio = false; d.querySelector('#svko-alert-speech-status button').click(); };
  async function ready() { await until(() => status().includes('Speech enabled.')); }
  return { w, d, storage, requests, players, contexts, roots, reads, menus, status, alert, start, stop, enable, ready, close() { stop(); dom.window.close(); } };
}

let passed = 0;
function pass(name) { passed++; console.log('PASS ' + name); }
(async () => {
  const silent = environment(); await silent.ready();
  for (const message of ['No markers', '[sound:soft-bell] Sound only', '[sound] Bare sound', '[sayings] Other word', '[say:en Missing bracket']) silent.alert(message);
  await until(() => silent.status().includes('Detected: 5'));
  assert.equal(silent.requests.length, 0); assert.equal(silent.players.length, 0); assert.equal(silent.contexts.length, 0);
  assert.deepEqual(silent.reads, [SETTINGS]); silent.close();
  pass('Alerts without a speech tag never access recordings, initialise audio or request speech');
  const mixed = environment(); await mixed.ready();
  mixed.alert('[sound:soft-bell] Price [say] crossed.'); await until(() => mixed.players.length === 1);
  assert.equal(JSON.parse(mixed.requests[0].details.data).input, 'Price crossed.'); mixed.players[0].end();
  const mixedStorage = mixed.storage; mixed.close();
  const removed = environment(mixedStorage); await removed.ready();
  removed.alert('Price crossed.'); removed.alert('[sound:soft-bell] Price crossed.');
  await until(() => removed.status().includes('Detected: 2'));
  assert.equal(removed.requests.length, 0); assert.equal(removed.players.length, 0); assert.equal(removed.contexts.length, 0);
  assert.deepEqual(removed.reads, [SETTINGS]);
  removed.alert('[say] Price crossed.'); await until(() => removed.players.length === 1);
  assert.equal(removed.requests.length, 0); removed.close();
  pass('Both tags speak only the message, and removing say suppresses even an existing recording');
  const e = environment(undefined, { blockAudio: true });
  await e.ready();
  e.alert('Price [say:sr] crossed the level.'); await wait(); assert.equal(e.requests.length, 0);
  e.enable(); await until(() => e.players.length === 1);
  const body = JSON.parse(e.requests[0].details.data);
  assert.equal(body.input, 'Price crossed the level.');
  assert.deepEqual(body.provider.options['google-ai-studio'].speechConfig, { voiceConfig: { voice: 'Kore' }, languageCode: 'sr-RS' });
  assert.deepEqual(body.provider.only, ['google-ai-studio']);
  assert.equal(body.model, 'google/gemini-3.8-flash-tts'); assert.equal(body.response_format, 'pcm');
  assert.ok([...e.storage.keys()].some(key => key.includes('audio:v1:')));
  pass('Blocked autoplay waits for a gesture, anywhere tag removed and recording saved before playback');
  e.alert('[say:sr] Price crossed the level.', '12:00:01');
  e.alert('Price crossed the level. [say:sr]', '12:00:02'); await wait();
  assert.equal(e.players.length, 1); e.players[0].end(); await until(() => e.players.length === 2);
  e.players[1].end(); await until(() => e.players.length === 3);
  assert.equal(e.requests.length, 1); e.players[2].end();
  pass('Sequential playback reuses the same recording across tag positions and event times');
  const savedStorage = e.storage; e.close();
  const reload = environment(savedStorage); await reload.ready();
  reload.alert('Price [SAY:sr] crossed the level.'); await until(() => reload.players.length === 1);
  assert.equal(reload.requests.length, 0); reload.players[0].end();
  pass('Saved audio survives a new page session without an API call');
  reload.alert('[say] A new English message'); await until(() => reload.players.length === 2);
  assert.equal(JSON.parse(reload.requests[0].details.data).provider.options['google-ai-studio'].speechConfig.languageCode, 'en-US');
  reload.players[1].end(); reload.close();
  pass('English is the default language');
  savedStorage.set(SETTINGS, { ...config, voice: 'Puck' });
  const changed = environment(savedStorage); await changed.ready();
  changed.alert('[say:sr] Price crossed the level.'); await until(() => changed.players.length === 1);
  assert.equal(changed.requests.length, 1); assert.equal(JSON.parse(changed.requests[0].details.data).voice, 'Puck'); changed.close();
  pass('A changed voice has a separate recording identity');
  for (const message of ['One [say:sr] two [say:en]', 'Empty [say:]', 'Wrong [say:not_a_language]', '[say:sr]']) {
    const invalid = environment(); await invalid.ready(); invalid.alert(message);
    await until(() => invalid.status().includes('Speech paused')); assert.equal(invalid.requests.length, 0); invalid.close();
  }
  pass('Conflicting, empty and invalid tags and empty speech are rejected before network access');
  const pending = environment(undefined, { manualResponse: true }); await pending.ready(); pending.alert('[say] Cancelled request');
  await until(() => pending.requests.length === 1); pending.stop();
  assert.equal(pending.requests[0].aborted, true); pending.requests[0].reply(); await wait();
  assert.equal(pending.players.length, 0); assert.equal(pending.status(), ''); assert.equal(pending.storage.size, 1); pending.close();
  pass('Stop aborts generation and late responses cannot restart playback');
  const playing = environment(); await playing.ready(); playing.alert('[say] First'); playing.alert('[say] Second');
  await until(() => playing.players.length === 1); playing.stop(); await wait();
  assert.equal(playing.players[0].stopped, true); assert.equal(playing.requests.length, 1); assert.equal(playing.contexts[0].state, 'closed'); playing.close();
  pass('Stop ends current playback, clears the queue and closes audio');
  for (const options of [{ httpStatus: 401 }, { failSave: true }, { failDecode: true }, { failPlay: true }]) {
    const failed = environment(undefined, options); await failed.ready(); failed.alert('[say] Failure');
    await until(() => failed.status().includes('Speech paused')); failed.alert('[say] Another failure'); await wait();
    assert.equal(failed.requests.length, 1); assert.doesNotMatch(failed.status(), /synthetic-test-key/);
    if (!options.failPlay) assert.equal(failed.players.length, 0);
    failed.close();
  }
  pass('HTTP, storage, decode and playback failures pause speech without automatic retries');
  const corruptStorage = new Map(savedStorage);
  for (const [key, value] of corruptStorage) if (key.includes('audio:v1:')) corruptStorage.set(key, { ...value, audio: '!' });
  const corrupt = environment(corruptStorage); await corrupt.ready(); corrupt.alert('[say:sr] Price crossed the level.');
  await until(() => corrupt.status().includes('Speech paused')); assert.equal(corrupt.requests.length, 0); corrupt.close();
  pass('Corrupt saved audio does not cause silent paid regeneration');
  for (const [mime, bytes] of [['application/json', [123]], ['audio/mpeg', []]]) {
    const wrong = environment(undefined, { manualResponse: true }); await wrong.ready(); wrong.alert('[say] Bad response');
    await until(() => wrong.requests.length === 1); wrong.requests[0].reply(200, mime, bytes);
    await until(() => wrong.status().includes('Speech paused')); assert.equal(wrong.storage.size, 1); wrong.close();
  }
  pass('Non audio and empty responses are never stored');
  const settings = environment(); settings.menus.get('Speech settings')();
  await until(() => settings.d.querySelector('iframe')?.contentDocument.querySelector('#feedback').textContent.includes('saved'));
  const form = settings.d.querySelector('iframe').contentDocument.querySelector('form');
  assert.equal(form.elements.model.value, 'google/gemini-3.8-flash-tts');
  form.elements.model.value = 'google/gemini-3.8-flash-lite-tts';
  assert.equal(form.elements.key.value, config.apiKey);
  assert.equal(form.elements.key.type, 'password');
  const toggle = form.ownerDocument.querySelector('#toggle-key');
  toggle.click(); assert.equal(form.elements.key.type, 'text'); assert.equal(form.elements.key.value, config.apiKey);
  toggle.click(); assert.equal(form.elements.key.type, 'password'); assert.equal(form.elements.key.value, config.apiKey);
  form.elements.key.value = ''; form.elements.language.value = 'sr';
  const editedParameters = JSON.parse(form.elements.parameters.value);
  editedParameters.voice = 'Charon'; editedParameters.provider.options['google-ai-studio'].speechConfig.voiceConfig.voice = 'Charon';
  form.elements.parameters.value = JSON.stringify(editedParameters);
  form.dispatchEvent(new settings.w.Event('submit', { cancelable: true }));
  await until(() => !settings.d.querySelector('dialog'));
  assert.deepEqual(settings.storage.get(SETTINGS), { apiKey: config.apiKey, model: 'google/gemini-3.8-flash-lite-tts', language: 'sr', requestParameters: editedParameters });
  assert.equal(settings.d.querySelector('dialog'), null); settings.close();
  pass('Settings load the saved key, toggle visibility, preserve it when blank and save model, language and voice');
  const custom = environment(new Map([[SETTINGS, { ...config, model: 'openai/gpt-4o-mini-tts', voice: 'alloy' }]]));
  await custom.ready(); custom.alert('[say] A custom model'); await until(() => custom.players.length === 1);
  const customBody = JSON.parse(custom.requests[0].details.data);
  assert.equal(customBody.model, 'openai/gpt-4o-mini-tts'); assert.equal(customBody.voice, 'alloy'); assert.equal(customBody.provider, undefined);
  custom.close(); pass('Custom model and voice are sent without Google options for other providers');
  const pcm = environment(undefined, { manualResponse: true }); await pcm.ready(); pcm.alert('[say] PCM samples');
  await until(() => pcm.requests.length === 1); pcm.requests[0].reply(200, 'audio/pcm', [0, 128, 255, 127, 0, 0]);
  await until(() => pcm.players.length === 1);
  assert.equal(pcm.players[0].buffer.sampleRate, 24000);
  assert.deepEqual(Array.from(pcm.players[0].buffer.getChannelData(0)), [-1, 32767 / 32768, 0]);
  pcm.close(); pass('PCM converts signed little endian samples to mono audio at 24 kHz');
  const rejection = environment(undefined, { manualResponse: true }); await rejection.ready(); rejection.alert('[say] Rejected');
  await until(() => rejection.requests.length === 1);
  rejection.requests[0].reply(400, 'application/json', new TextEncoder().encode(JSON.stringify({ error: { message: 'Provider returned 400', metadata: { raw: 'Invalid speech config synthetic-test-key' } } })));
  await until(() => rejection.status().includes('Speech paused'));
  assert.match(rejection.status(), /Invalid speech config/); assert.match(rejection.status(), /metadata/); assert.doesNotMatch(rejection.status(), /synthetic-test-key/);
  rejection.close(); pass('The complete API rejection is visible with credentials redacted');
  const preview = environment(); await preview.ready(); preview.menus.get('Speech settings')();
  await until(() => preview.d.querySelector('iframe')?.contentDocument.querySelector('#feedback').textContent.includes('saved'));
  const testForm = preview.d.querySelector('iframe').contentDocument.querySelector('form');
  testForm.elements.parameters.value = JSON.stringify({ voice: 'Charon', response_format: 'mp3' });
  const testButton = testForm.querySelector('#test-speech'); testButton.click();
  await until(() => preview.players.length === 1);
  assert.equal(testButton.disabled, true);
  assert.equal(JSON.parse(preview.requests[0].details.data).response_format, 'mp3');
  assert.equal(JSON.parse(preview.requests[0].details.data).voice, 'Charon');
  assert.deepEqual(preview.storage.get(SETTINGS), config);
  preview.players[0].end(); await until(() => !testButton.disabled);
  assert.match(testForm.querySelector('#feedback').textContent, /Generated and saved/);
  testButton.click(); await until(() => preview.players.length === 2);
  assert.equal(preview.requests.length, 1); preview.players[1].end(); await until(() => !testButton.disabled);
  assert.match(testForm.querySelector('#feedback').textContent, /Used a saved recording/);
  preview.alert('[say] Saved preferences'); await until(() => preview.players.length === 3);
  assert.equal(JSON.parse(preview.requests[1].details.data).voice, 'Kore');
  assert.equal(JSON.parse(preview.requests[1].details.data).response_format, 'pcm');
  preview.close(); pass('Test uses unsaved fields and chosen format, reuses audio and restores saved preferences');
  const manualParameters = { response_format: 'wav', voice: 'custom-voice', speed: 1.1, provider: { options: { other: { language: '{{language}}', locale: '{{locale}}', instructions: 'Speak in {{locale}}.', nested: [true, 4, null] } } } };
  const manual = environment(new Map([[SETTINGS, { ...config, model: 'other/speech', requestParameters: manualParameters }]]), { manualResponse: true });
  await manual.ready(); manual.alert('[say:sr] A "quote" and \\ path');
  await until(() => manual.requests.length === 1);
  const sent = JSON.parse(manual.requests[0].details.data);
  assert.equal(sent.input, 'A "quote" and \\ path'); assert.equal(sent.model, 'other/speech'); assert.equal(sent.response_format, 'wav');
  assert.deepEqual(sent.provider.options.other, { language: 'sr', locale: 'sr-RS', instructions: 'Speak in sr-RS.', nested: [true, 4, null] });
  assert.equal(sent.provider.only, undefined); assert.equal(sent.provider.options['google-ai-studio'], undefined);
  manual.requests[0].reply(200, 'audio/wav'); await until(() => manual.players.length === 1); manual.close();
  pass('Manual JSON preserves arbitrary options, safely resolves language strings and uses the UI model and message');
  for (const requestParameters of [null, [], 'invalid', { model: 'override' }, { input: 'override' }]) {
    const invalid = environment(new Map([[SETTINGS, { ...config, requestParameters }]])); await invalid.ready(); invalid.alert('[say] Blocked');
    await until(() => invalid.status().includes('Speech paused')); assert.equal(invalid.requests.length, 0); invalid.close();
  }
  pass('Invalid parameter objects and attempts to override model or input fail before requests');
  const editor = environment(); await editor.ready(); editor.menus.get('Speech settings')();
  await until(() => editor.d.querySelector('iframe')?.contentDocument.querySelector('#feedback').textContent.includes('saved'));
  const editorDoc = editor.d.querySelector('iframe').contentDocument, editorForm = editorDoc.querySelector('form');
  const template = editorForm.elements.parameters.value;
  assert.equal(JSON.parse(template).provider.options['google-ai-studio'].speechConfig.languageCode, '{{locale}}');
  editorForm.elements.model.value = 'other/speech'; editorForm.elements.testMessage.value = '[say:sr] Test "quoted"';
  editorForm.dispatchEvent(new editor.w.Event('input', { bubbles: true }));
  const visibleRequest = JSON.parse(editorDoc.querySelector('#request-preview').textContent);
  assert.equal(visibleRequest.model, 'other/speech'); assert.equal(visibleRequest.input, 'Test "quoted"');
  assert.equal(editorForm.elements.parameters.value, template);
  editorDoc.querySelector('#defaults').click();
  assert.deepEqual(JSON.parse(editorForm.elements.parameters.value), { response_format: 'mp3' });
  editorForm.elements.parameters.value = '{broken'; editorForm.querySelector('#test-speech').click(); await wait();
  assert.match(editorDoc.querySelector('#feedback').textContent, /Invalid request JSON/); assert.equal(editor.requests.length, 0);
  assert.deepEqual(editor.storage.get(SETTINGS), config); editor.close();
  pass('Editor previews the exact request, keeps JSON on model changes, loads defaults explicitly and rejects malformed JSON');
  const bare = environment(new Map([[SETTINGS, { ...config, language: 'sr' }]])); await bare.ready();
  bare.alert('Ovo je [say] proba.'); await until(() => bare.players.length === 1);
  const bareBody = JSON.parse(bare.requests[0].details.data);
  assert.equal(bareBody.input, 'Ovo je proba.');
  assert.equal(bareBody.provider.options['google-ai-studio'].speechConfig.languageCode, 'sr-RS');
  bare.players[0].end(); bare.alert('[SAY:sr] Ovo je proba.'); await until(() => bare.players.length === 2);
  assert.equal(bare.requests.length, 1); bare.close();
  pass('Bare say uses the saved default language, removes the tag and reuses explicit-language recordings');
  console.log(`${passed} speech scenarios passed.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
