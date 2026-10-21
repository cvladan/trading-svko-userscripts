// Run with jsdom 26.1.0 on NODE_PATH. An optional argument selects the development source.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');

const source = fs.readFileSync(path.resolve(__dirname, process.argv[2] || 'SVKO TradingView Alert Speech.user.js'), 'utf8');
const dom = new JSDOM('<body><button data-name="toast-group-expand-button-alerts" aria-controls="test-alerts"></button><div role="log"><ul id="test-alerts"></ul></div><div id="other-notifications"></div></body>', {
  url: 'https://www.tradingview.com/chart/test/', runScripts: 'outside-only',
});
const window = dom.window;
const document = window.document;
const menus = new Map();
const targets = [];
let instances = 0;
let callbacks = 0;
const NativeObserver = window.MutationObserver;
window.MutationObserver = class extends NativeObserver {
  constructor(callback) { super((...args) => { callbacks++; callback(...args); }); instances++; }
  observe(target, options) { targets.push(target); super.observe(target, options); }
};
window.GM_registerMenuCommand = (label, callback) => menus.set(label, callback);
window.GM = { getValue: async () => ({}), setValue: async () => { throw Error('Unexpected storage write during detection'); } };
// Expose lifecycle functions only inside the test instance.
window.eval(source.replace(/\}\)\(\);\s*$/, 'window.__test = { start, stop };})();'));
const { start, stop } = window.__test;
const list = document.getElementById('test-alerts');
const panel = () => document.getElementById('svko-alert-speech-status');
const flush = async () => { await Promise.resolve(); await Promise.resolve(); };
const checkCount = count => assert.match(panel().textContent, new RegExp('Detected: ' + count + '(?:\\n|$)'));

function toast(message, time) {
  const item = document.createElement('li');
  for (const [prefix, text] of [['description', message], ['time', time]]) {
    const span = document.createElement('span');
    span.className = 'extra ' + prefix + '-synthetic';
    span.textContent = text;
    item.append(span);
  }
  const button = document.createElement('button');
  button.textContent = 'Edit alert';
  item.append(button);
  return item;
}

let passed = 0;
function pass(name) { passed++; console.log('PASS ' + name); }

(async () => {
  assert.equal(instances, 1); assert.ok(panel()); assert.deepEqual([...menus.keys()], ['Speech settings']);
  stop();
  pass('Automatic startup with settings as the only menu command');
  list.append(toast('Existing alert', '12:00:00'));
  const baseline = toast('', ''); list.append(baseline);
  start(); checkCount(0); assert.equal(instances, 1); assert.equal(targets[0], list.parentElement);
  pass('Existing alerts ignored and observation scoped');
  baseline.children[0].textContent = 'Old delayed message'; baseline.children[1].textContent = '12:00:00';
  await flush(); checkCount(0);
  pass('Incomplete baseline ignored when completed');
  const first = toast('Test alert', '12:00:01'); list.append(first);
  await flush(); checkCount(1); assert.match(panel().textContent, /Test alert/); assert.doesNotMatch(panel().textContent, /Edit alert/);
  pass('New alert message and time extracted');
  first.children[0].textContent = 'Test alert'; first.children[2].textContent = 'Close';
  await flush(); checkCount(1);
  pass('Unchanged content and controls do not duplicate');
  list.append(toast('Test alert', '12:00:01')); await flush(); checkCount(2);
  pass('New identical toast counts independently');
  const delayed = toast('', ''); list.append(delayed); await flush(); checkCount(2);
  delayed.children[0].textContent = 'Delayed text'; await flush(); checkCount(2);
  delayed.children[1].textContent = '12:00:02'; await flush(); checkCount(3);
  pass('New incomplete toast waits for message and time');
  delayed.children[1].firstChild.data = '12:00:03'; await flush(); checkCount(4);
  delayed.children[0].firstChild.data = 'Changed message'; await flush(); checkCount(5);
  pass('Reused node and character data updates');
  const before = callbacks;
  document.getElementById('other-notifications').append(toast('Other notification', '12:00:04'));
  await flush(); checkCount(5); assert.equal(callbacks, before);
  pass('Unrelated notifications never reach observer');
  start(); checkCount(5); assert.equal(instances, 1); assert.equal(targets.length, 2);
  pass('Repeated start is idempotent');
  stop(); assert.equal(panel(), null);
  const stopped = callbacks; list.append(toast('Stopped', '12:00:05')); await flush();
  assert.equal(callbacks, stopped); assert.equal(panel(), null);
  pass('Stop disconnects and removes panel');
  start(); checkCount(0); assert.equal(instances, 1);
  list.append(toast('<img src=x onerror=alert(1)>', '12:00:06')); await flush(); checkCount(1);
  assert.equal(panel().querySelector('img'), null);
  pass('Restart reuses observer and renders untrusted text literally');
  stop(); list.parentElement.remove(); start(); checkCount(0); assert.equal(targets.at(-1), document.body);
  const replacement = document.createElement('div'); replacement.setAttribute('role', 'log');
  const replacementList = document.createElement('ul'); replacementList.id = 'test-alerts';
  replacement.append(replacementList); document.body.append(replacement);
  await flush(); checkCount(0); assert.equal(targets.at(-1), replacement);
  assert.equal(instances, 1);
  pass('Asynchronous startup narrows the same observer to the alert container');
  replacement.remove(); const next = replacement.cloneNode(true); document.body.append(next);
  start(); checkCount(0); assert.equal(targets.at(-1), next); assert.equal(instances, 1); stop();
  pass('Manual recovery after log replacement');
  for (const [url, frame] of [
    ['http://www.tradingview.com/chart/test/', false], ['https://example.com/chart/test/', false],
    ['https://www.tradingview.com/watchlists/', false], ['https://www.tradingview.com/chart/test/', true],
  ]) {
    const self = {};
    vm.runInNewContext(source, {
      window: { self, top: frame ? {} : self }, location: new URL(url),
      GM_registerMenuCommand() { throw Error('Registered outside scope'); },
      document: new Proxy({}, { get() { throw Error('Read DOM outside scope'); } }),
    });
  }
  pass('Protocol host path and frame guards');
  dom.window.close();
  console.log(`${passed} scenarios passed.`);
})().catch(error => { dom.window.close(); console.error(error); process.exitCode = 1; });
