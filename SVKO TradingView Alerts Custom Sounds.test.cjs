const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const source = fs.readFileSync(process.argv[2] || 'SVKO TradingView Alerts Custom Sounds.user.js', 'utf8');
const PREFIX = 'svko-tv-sounds:v1:sound:';
const sample = name => ({ schemaVersion: 1, name, byteLength: 8, dataUri: 'data:audio/wav;base64,UklGRg==', updatedAt: 1 });
const flush = async () => { for (let i = 0; i < 8; i++) await new Promise(r => setImmediate(r)); };
const tests = [];
function test(name, run) { tests.push({ name, run }); }
function setup({ url = 'https://www.tradingview.com/chart/test/', initial = '' } = {}) {
  const dom = new JSDOM(`<div id="overlap-manager-root"><div data-id="chart-toasts-container"><button data-name="toast-group-expand-button-alerts" aria-controls="alerts"></button><div role="log"><ul id="alerts">${initial}</ul></div><div role="log"><ul id="orders"></ul></div></div></div>`, { url, runScripts: 'outside-only' });
  const w = dom.window;
  const data = new Map([[PREFIX + 'soft-bell', sample('soft-bell')], [PREFIX + 'price-alert', sample('price-alert')], ['unrelated', 'keep']]);
  const played = [], observers = [], commands = new Map();
  const media = { reject: false, invalid: false, defer: false, revoked: [] };
  w.URL.createObjectURL = () => 'blob:fixture';
  w.URL.revokeObjectURL = url => media.revoked.push(url);
  const NativeObserver = w.MutationObserver;
  w.MutationObserver = class extends NativeObserver { constructor(fn) { super(fn); observers.push(this); } };
  w.GM_getValue = (key, fallback) => data.has(key) ? data.get(key) : fallback;
  w.GM_listValues = () => [...data.keys()];
  w.GM_setValue = (key, value) => data.set(key, value);
  w.GM_deleteValue = key => data.delete(key);
  w.GM_registerMenuCommand = (name, fn) => commands.set(name, fn);
  w.Audio = class {
    constructor(src) { this.src = src; }
    play() { played.push(this.src); return media.reject ? Promise.reject(new w.DOMException('Blocked', 'NotAllowedError')) : Promise.resolve(); }
    pause() {}
    load() { if (this.src === 'blob:fixture' && !media.defer) queueMicrotask(() => media.invalid ? this.onerror?.() : this.onloadeddata?.()); }
    removeAttribute() {}
  };
  w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  w.HTMLDialogElement.prototype.close = function () { this.open = false; };
  w.eval(source);
  return { w, data, played, observers, commands, media, close: () => dom.window.close(),
    add(message = 'Price [sound:soft-bell]', time = '12:00:01', list = 'alerts') {
      const li = w.document.createElement('li');
      const description = w.document.createElement('div'); description.className = 'description-test'; description.textContent = message;
      const clock = w.document.createElement('div'); clock.className = 'time-test'; clock.textContent = time;
      li.append(description, clock); w.document.getElementById(list).append(li); return li;
    }
  };
}
function mockEditor(t, initial = 'Price {{close}}', delayShell = false, title = '') {
  const d = t.w.document;
  const shell = d.createElement('div'); shell.dataset.id = 'editor';
  let message = initial, toast = true, native = true, commits = 0;
  function main() {
    shell.innerHTML = `<div data-qa-id="alerts-create-edit-dialog"><button data-qa-id="alert-message-button"></button><button data-qa-id="alert-notifications-button">Notifications</button><button data-qa-id="submit">Create</button></div>`;
    const summary = shell.querySelector('[data-qa-id="alert-message-button"]');
    summary.textContent = title ? `${title}. ${message}` : message;
    const escape = text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    summary.setAttribute('data-overflow-tooltip-html', `${title ? '<b>' + escape(title) + '</b><br>' : ''}${escape(message)}`);
    shell.querySelector('[data-qa-id="alert-message-button"]').onclick = editMessage;
    shell.querySelector('[data-qa-id="alert-notifications-button"]').onclick = notifications;
    shell.querySelector('[data-qa-id="submit"]').onclick = () => commits++;
  }
  function editMessage() {
    shell.innerHTML = `<div data-qa-id="alerts-message-edit-dialog"><textarea id="alert-message"></textarea><button data-qa-id="submit">Apply</button></div>`;
    const input = shell.querySelector('textarea'); input.value = message;
    let controlled = message;
    input.addEventListener('input', () => { controlled = input.value; });
    shell.querySelector('button').onclick = () => { message = controlled; main(); };
  }
  function notifications() {
    shell.innerHTML = `<div data-qa-id="alerts-notifications-edit-dialog"><label data-qa-id="show-popup"><input type="checkbox"></label><label data-qa-id="play-sound"><input type="checkbox"></label><div><div><button data-qa-id="sound-title-select">Bell</button></div></div><button data-qa-id="submit">Apply</button><button data-qa-id="cancel">Cancel</button></div>`;
    const checks = shell.querySelectorAll('input'); checks[0].checked = toast; checks[1].checked = native;
    shell.querySelector('[data-qa-id="submit"]').onclick = () => { toast = checks[0].checked; native = checks[1].checked; main(); };
    shell.querySelector('[data-qa-id="cancel"]').onclick = main;
  }
  if (!delayShell) main();
  d.getElementById('overlap-manager-root').append(shell);
  return { shell, main, notifications, state: () => ({ message, toast, native, commits }) };
}
async function choose(t, value) {
  const s = t.w.document.querySelector('#svko-sounds-choice'); assert.ok(s, 'custom selector exists');
  s.value = value; s.dispatchEvent(new t.w.Event('change', { bubbles: true })); await flush();
}
for (const [title, message, expected] of [
  ['valid tag', 'Up [sound:soft-bell]', 1], ['no tag', 'Up', 0],
  ['uppercase rejected', '[sound:Soft-bell]', 0], ['digit rejected', '[sound:bell-1]', 0],
  ['double hyphen rejected', '[sound:soft--bell]', 0], ['duplicate rejected', '[sound:soft-bell] [sound:soft-bell]', 0],
  ['missing recording rejected', '[sound:missing]', 0], ['other tags preserved', '[say:en] Up [sound:soft-bell]', 1]
]) test(title, async t => { t.add(message); await flush(); assert.equal(t.played.length, expected); });
test('identical message in new nodes is a new event', async t => { t.add(); t.add(); await flush(); assert.equal(t.played.length, 2); });
test('unchanged rerender ignored; reused text update detected', async t => {
  const li = t.add(); await flush(); li.firstChild.textContent = 'Price [sound:soft-bell]'; await flush(); assert.equal(t.played.length, 1);
  li.firstChild.textContent = 'Other [sound:price-alert]'; await flush(); assert.equal(t.played.length, 2);
});
test('incomplete new toast waits for time', async t => { const li = t.add(undefined, ''); await flush(); assert.equal(t.played.length, 0); li.lastChild.textContent = '12:00:02'; await flush(); assert.equal(t.played.length, 1); });
test('unrelated notification ignored', async t => { t.add(undefined, undefined, 'orders'); await flush(); assert.equal(t.played.length, 0); });
test('replacement is read at the next event', async t => { t.add(); await flush(); const value = { ...sample('soft-bell'), dataUri: 'data:audio/wav;base64,UkVQTA==' }; t.data.set(PREFIX + 'soft-bell', value); t.add(); await flush(); assert.equal(t.played[1], value.dataUri); });
test('opening editor changes nothing; applying updates message and settings', async t => {
  const e = mockEditor(t); await flush(); e.notifications(); await flush();
  assert.equal(t.w.document.querySelectorAll('#svko-sounds-choice').length, 1);
  await choose(t, 'soft-bell'); assert.equal(e.state().message, 'Price {{close}}');
  e.shell.querySelector('[data-qa-id="submit"]').click(); await flush();
  assert.deepEqual(e.state(), { message: 'Price {{close}} [sound:soft-bell]', native: false, toast: true, commits: 0 });
});
test('cancel preserves original message and native setting', async t => {
  const e = mockEditor(t); await flush(); e.notifications(); await flush(); await choose(t, 'soft-bell');
  e.shell.querySelector('[data-qa-id="cancel"]').click(); await flush(); assert.equal(e.state().message, 'Price {{close}}'); assert.equal(e.state().native, true);
});
test('native sound removes tag without changing other text', async t => {
  const e = mockEditor(t, 'Before\n[sound:soft-bell] {{close}}'); await flush(); e.notifications(); await flush();
  const box = e.shell.querySelector('[data-qa-id="play-sound"] input'); box.checked = false; box.click();
  e.shell.querySelector('[data-qa-id="submit"]').click(); await flush(); assert.equal(e.state().message, 'Before\n {{close}}');
});
test('popup shell can mount its contents later', async t => {
  const e = mockEditor(t, 'Example', true); await flush(); e.main(); await flush(); e.notifications(); await flush();
  assert.ok(t.w.document.querySelector('#svko-sounds-choice'));
});
test('reopening notifications does not duplicate controls', async t => {
  const e = mockEditor(t); await flush(); e.notifications(); await flush(); e.main(); await flush(); e.notifications(); await flush();
  assert.equal(t.w.document.querySelectorAll('#svko-sounds-choice').length, 1); assert.equal(t.observers.length, 1);
});
test('library leaves unrelated GM values intact', async t => {
  t.commands.get('Manage custom sounds')(); await flush(); assert.ok(t.w.document.querySelector('#svko-sounds-library')); assert.equal(t.data.get('unrelated'), 'keep');
});

function clickText(t, text) {
  const button = [...t.w.document.querySelectorAll('#svko-sounds-library button')].find(b => b.textContent === text);
  assert.ok(button, `button ${text} exists`); button.click();
}
function upload(t, name = 'new-bell', size = 8) {
  const input = t.w.document.querySelector('input[type="file"]');
  const file = new t.w.File(['RIFFtest'], 'New Bell.wav', { type: 'audio/wav' });
  Object.defineProperty(file, 'size', { value: size });
  Object.defineProperty(input, 'files', { value: [file] });
  input.dispatchEvent(new t.w.Event('change'));
  t.w.document.querySelector('[aria-label="Sound name"]').value = name;
}
test('autoplay failure is visible without replaying old events', async t => {
  t.media.reject = true; t.add(); await flush();
  assert.match(t.w.document.querySelector('#svko-sounds-notice').textContent, /Audio was blocked/);
  t.media.reject = false; await flush(); assert.equal(t.played.length, 1);
});
test('invalid stored data reports an error instead of guessing', async t => {
  t.data.set(PREFIX + 'soft-bell', { name: 'soft-bell' }); t.add(); await flush();
  assert.equal(t.played.length, 0); assert.match(t.w.document.body.textContent, /Invalid recording/);
});
test('missing closing tag is visible', async t => {
  t.add('[sound:soft-bell'); await flush(); assert.match(t.w.document.body.textContent, /Incomplete sound tag/);
});
test('import stores a separate complete recording', async t => {
  t.commands.get('Manage custom sounds')(); clickText(t, 'Add sound…'); upload(t);
  clickText(t, 'Save'); await flush(); assert.equal(t.data.get(PREFIX + 'new-bell').name, 'new-bell');
  assert.match(t.data.get(PREFIX + 'new-bell').dataUri, /^data:audio\/wav;base64,/); assert.equal(t.data.get('unrelated'), 'keep');
  assert.deepEqual(t.media.revoked, ['blob:fixture']);
});
test('invalid import does not overwrite the original recording', async t => {
  const old = t.data.get(PREFIX + 'price-alert'); t.commands.get('Manage custom sounds')(); clickText(t, 'Replace audio…');
  t.media.invalid = true; upload(t, 'price-alert'); clickText(t, 'Save'); await flush(); assert.equal(t.data.get(PREFIX + 'price-alert'), old);
  assert.match(t.w.document.body.textContent, /cannot be decoded/);
});
test('large and empty imports are rejected before saving', async t => {
  t.commands.get('Manage custom sounds')(); clickText(t, 'Add sound…'); upload(t, 'huge', 6 * 1024 * 1024); clickText(t, 'Save'); await flush();
  assert.equal(t.data.has(PREFIX + 'huge'), false); assert.match(t.w.document.body.textContent, /at most 5 MiB/);
});
test('duplicate names are rejected', async t => {
  t.commands.get('Manage custom sounds')(); clickText(t, 'Add sound…'); upload(t, 'soft-bell'); clickText(t, 'Save'); await flush();
  assert.match(t.w.document.body.textContent, /already exists/);
});
test('library total limit preserves existing recordings', async t => {
  t.data.set(PREFIX + 'soft-bell', { ...sample('soft-bell'), byteLength: 50 * 1024 * 1024 });
  t.commands.get('Manage custom sounds')(); clickText(t, 'Add sound…'); upload(t); clickText(t, 'Save'); await flush();
  assert.equal(t.data.has(PREFIX + 'new-bell'), false); assert.match(t.w.document.body.textContent, /limit is 50 MiB/);
});
test('storage failure is shown', async t => {
  t.w.GM_setValue = () => { throw new Error('Fixture write failure'); };
  t.commands.get('Manage custom sounds')(); clickText(t, 'Add sound…'); upload(t); clickText(t, 'Save'); await flush();
  assert.equal(t.data.has(PREFIX + 'new-bell'), false); assert.match(t.w.document.body.textContent, /Fixture write failure/);
});
test('cancel during validation prevents delayed writes', async t => {
  t.commands.get('Manage custom sounds')(); clickText(t, 'Add sound…'); upload(t); clickText(t, 'Save'); clickText(t, 'Cancel');
  clickText(t, 'Add sound…'); await flush(); assert.equal(t.data.has(PREFIX + 'new-bell'), false);
});
test('deletion requires its own confirmation', async t => {
  t.commands.get('Manage custom sounds')(); clickText(t, 'Delete'); assert.equal(t.data.has(PREFIX + 'price-alert'), true);
  clickText(t, 'Delete recording'); assert.equal(t.data.has(PREFIX + 'price-alert'), false); assert.equal(t.data.get('unrelated'), 'keep');
});
test('changing an existing tag preserves whitespace and placeholders', async t => {
  const e = mockEditor(t, 'Before\n[sound:soft-bell] {{close}}\nAfter'); await flush(); e.notifications(); await flush();
  await choose(t, 'price-alert'); e.shell.querySelector('[data-qa-id="submit"]').click(); await flush();
  assert.equal(e.state().message, 'Before\n[sound:price-alert] {{close}}\nAfter');
});

test('named alert reads only its message and verifies the saved tag', async t => {
  const e = mockEditor(t, 'Before [sound:soft-bell] {{close}}', false, 'Custom alert [sound:ignored]');
  await flush(); e.notifications(); await flush();
  assert.equal(t.w.document.querySelector('#svko-sounds-choice').value, 'soft-bell');
  await choose(t, 'price-alert'); e.shell.querySelector('[data-qa-id="submit"]').click(); await flush();
  assert.equal(e.state().message, 'Before [sound:price-alert] {{close}}');
  assert.equal(t.w.document.querySelector('#svko-sounds-notice'), null);
});
(async () => {
  let count = 0;
  for (const test of tests) { const t = setup(); try { await test.run(t); console.log('PASS', test.name); count++; } finally { t.close(); } }
  const t = setup({ initial: '<li><div class="description-x">[sound:soft-bell]</div><div class="time-x">12:00</div></li><li><div class="description-x">[sound:soft-bell]</div><div class="time-x"></div></li>' });
  t.w.document.querySelector('li:last-child .time-x').textContent = '12:01'; await flush(); assert.equal(t.played.length, 0); t.close(); count++;
  const g = setup({ url: 'https://example.com/chart/test/' }); assert.equal(g.commands.size, 0); assert.equal(g.observers.length, 0); g.close(); count++;
  console.log(`${count} scenarios passed.`);
})().catch(e => { console.error(e); process.exitCode = 1; });
