// Synthetic quotes and Web Audio nodes only; no market subscriptions or real orders.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const source = fs.readFileSync(process.argv[2] || 'SVKO TradingView Squawkbox.user.js', 'utf8');

function delegate() {
  const listeners = new Map();
  return {
    subscribe(owner, fn) { if (!listeners.has(owner)) listeners.set(owner, new Set()); listeners.get(owner).add(fn); },
    unsubscribe(owner, fn) { listeners.get(owner)?.delete(fn); if (!listeners.get(owner)?.size) listeners.delete(owner); },
    fire() { for (const set of [...listeners.values()]) for (const fn of [...set]) fn(); },
    size() { return [...listeners.values()].reduce((sum, set) => sum + set.size, 0); },
  };
}

function harness({ open = true, url = 'https://www.tradingview.com/chart/test/', replay = false, blocked = false, settings = {} } = {}) {
  const dom = new JSDOM('<!doctype html><body></body>', { url, runScripts: 'outside-only' });
  const w = dom.window;
  let now = 1000, active, storageReads = 0, nextResume;
  const contexts = [], oscillators = [], menus = new Map(), writes = [];
  const param = () => ({ value: 0, values: [], setValueAtTime(v) { this.values.push(v); }, linearRampToValueAtTime() {}, exponentialRampToValueAtTime(v) { this.values.push(v); } });
  class AudioContext {
    constructor() { this.state = blocked ? 'suspended' : 'running'; this.sampleRate = 8000; this.currentTime = 1; this.destination = {}; contexts.push(this); }
    resume() { return new Promise(resolve => { nextResume = () => { this.state = 'running'; resolve(); }; }); }
    close() { this.state = 'closed'; return Promise.resolve(); }
    createGain() { return { gain: param(), connect() {} }; }
    createBuffer(channels, length) { const data = new Float32Array(length); return { getChannelData() { return data; } }; }
    createBufferSource() { return { connect() {}, start() {}, stop() {} }; }
    createOscillator() { const n = { frequency: param(), connect() {}, start() { oscillators.push(n); }, stop(t) { n.end = t; } }; return n; }
  }
  function chart(id, symbol, price) {
    const updates = delegate(), changed = delegate(), cleared = delegate();
    let quote = { last_price: price, lp_time: 100, pro_name: symbol }, currentSymbol = symbol, identity = symbol;
    const provider = { quotes: () => ({ value: () => quote }), symbol: () => identity, quotesUpdate: () => updates, quoteSymbolChanged: () => changed };
    const series = { quotesProvider: () => provider, priceStep: () => 0.1, dataEvents: () => ({ cleared: () => cleared }) };
    return { id: () => id, symbol: () => currentSymbol, getSeries: () => ({ isInReplay: () => ({ value: () => replay }) }), chartModel: () => ({ mainSeries: () => series }),
      emit(value, fields = {}) { quote = { ...quote, last_price: value, ...fields }; updates.fire(); },
      switchSymbol(value) { currentSymbol = identity = value; changed.fire(); },
      clear() { cleared.fire(); }, subscriptions: () => updates.size() + changed.size() + cleared.size() };
  }
  const first = chart('1', 'IG:NASDAQ', 100), second = chart('2', 'BATS:QQQ', 200);
  active = first;
  w.AudioContext = AudioContext;
  w.unsafeWindow = { TradingViewApi: { _activeChartWidgetWV: { value: () => active } } };
  w.GM_getValue = () => { storageReads++; return settings; };
  w.GM_setValue = (key, value) => writes.push({ key, value });
  w.GM_registerMenuCommand = (name, fn) => menus.set(name, fn);
  w.setInterval = w.setTimeout = () => { throw new Error('No polling or timers allowed'); };
  w.MutationObserver = class { constructor() { throw new Error('No observer allowed'); } };
  w.matchMedia = () => ({ matches: true });
  w.performance.now = () => now;
  w.eval(source);
  if (open) menus.get('Squawkbox')?.();
  const root = () => w.document.querySelector('iframe')?.contentDocument;
  const el = id => root()?.getElementById(id);
  return { w, first, second, contexts, oscillators, menus, writes, el, reads: () => storageReads,
    async click(id) { const handler = el(id).onclick; if (handler) await handler(); },
    async begin() { await this.click('start'); },
    advance(ms = 150) { now += ms; }, selectSecond() { active = second; }, resolveAudio() { nextResume(); },
    close() { w.dispatchEvent(new w.Event('pagehide')); dom.window.close(); },
  };
}

let passed = 0;
async function test(name, fn) { await fn(); passed++; console.log(`ok ${passed} - ${name}`); }
(async () => {
  await test('starts silent and allocates no audio or quote subscriptions', async () => {
    const h = harness({ open: false }); assert.equal(h.el('start'), undefined); assert.equal(h.contexts.length, 0); assert.equal(h.first.subscriptions(), 0); assert.ok(h.menus.has('Squawkbox')); h.close();
  });
  await test('subthreshold moves accumulate and unchanged quotes are silent', async () => {
    const h = harness(); await h.begin(); h.first.emit(100.2); h.first.emit(100.4); assert.equal(h.oscillators.length, 0);
    h.first.emit(100.5); assert.equal(h.oscillators.length, 1); h.advance(); h.first.emit(100.5); assert.equal(h.oscillators.length, 1); h.close();
  });
  await test('up and down tones differ and use tiks frequency sweeps', async () => {
    const h = harness(); await h.begin(); h.first.emit(100.5); h.advance(); h.first.emit(100);
    const [up, down] = h.oscillators.map(n => n.frequency.values); assert.ok(up[1] > up[0]); assert.ok(down[1] < down[0]); assert.ok(up[0] > down[0]); h.close();
  });
  await test('rate gate drops immediate sound but retains net movement', async () => {
    const h = harness(); await h.begin(); h.first.emit(100.5); h.first.emit(101); assert.equal(h.oscillators.length, 1);
    h.advance(); h.first.emit(101.1); assert.equal(h.oscillators.length, 2); h.close();
  });
  await test('large jumps generate one bounded short sound', async () => {
    const h = harness(); await h.begin(); h.first.emit(1100); assert.equal(h.oscillators.length, 1); assert.ok(h.oscillators[0].end < 1.1); assert.ok(h.oscillators[0].frequency.values[1] < 1100); h.close();
  });
  await test('selection changes do not change the locked chart', async () => {
    const h = harness(); await h.begin(); h.selectSecond(); h.second.emit(201); assert.equal(h.oscillators.length, 0);
    h.first.emit(100.5); assert.equal(h.oscillators.length, 1); assert.match(h.el('symbol').textContent, /IG:NASDAQ/); h.close();
  });
  await test('changing the locked symbol stops and removes all subscriptions', async () => {
    const h = harness(); await h.begin(); assert.equal(h.first.subscriptions(), 3); h.first.switchSymbol('IG:DOW');
    assert.equal(h.first.subscriptions(), 0); assert.equal(h.contexts[0].state, 'closed'); h.first.emit(9999); assert.equal(h.oscillators.length, 0); h.close();
  });
  await test('clearing chart data stops instead of sounding a new baseline', async () => {
    const h = harness(); await h.begin(); h.first.clear(); assert.equal(h.first.subscriptions(), 0); assert.match(h.el('status').textContent, /changed/); h.close();
  });
  await test('invalid and backward-timestamp quotes cannot produce sound', async () => {
    const h = harness(); await h.begin(); for (const v of [null, NaN, Infinity, '110']) h.first.emit(v);
    h.first.emit(110, { lp_time: 99 }); assert.equal(h.oscillators.length, 0); h.first.emit(100.5, { lp_time: 101 }); assert.equal(h.oscillators.length, 1); h.close();
  });
  await test('mismatched quote identity is rejected', async () => {
    const h = harness(); await h.begin(); h.first.emit(9999, { pro_name: 'IG:DOW' }); assert.equal(h.oscillators.length, 0); h.close();
  });
  await test('repeated start replaces subscriptions and closes the old context', async () => {
    const h = harness(); await h.begin(); await h.begin(); assert.equal(h.first.subscriptions(), 3); assert.equal(h.contexts[0].state, 'closed');
    h.first.emit(100.5); assert.equal(h.oscillators.length, 1); await h.click('stop'); assert.equal(h.first.subscriptions(), 0); h.close();
  });
  await test('canceling pending audio startup does not later subscribe', async () => {
    const h = harness({ blocked: true }); const pending = h.begin(); await h.click('stop'); h.resolveAudio(); await pending;
    assert.equal(h.first.subscriptions(), 0); assert.equal(h.oscillators.length, 0); h.close();
  });
  await test('browser suspension stops rather than queueing old sounds', async () => {
    const h = harness(); await h.begin(); h.contexts[0].state = 'suspended'; h.contexts[0].onstatechange();
    assert.equal(h.first.subscriptions(), 0); assert.match(h.el('status').textContent, /browser/); h.close();
  });
  await test('pagehide and panel close clean up, menu reopens stopped', async () => {
    const h = harness(); await h.begin(); await h.click('close'); assert.equal(h.first.subscriptions(), 0); assert.equal(h.el('start'), undefined);
    h.menus.get('Squawkbox')(); await h.begin(); h.w.dispatchEvent(new h.w.Event('pagehide')); assert.equal(h.first.subscriptions(), 0); h.close();
  });
  await test('tests work with reduced motion and do not subscribe to a chart', async () => {
    const h = harness(); await h.click('up'); await h.click('down'); assert.equal(h.oscillators.length, 2); assert.equal(h.first.subscriptions(), 0); h.close();
  });
  await test('volume zero mutes output and settings use only their own key', async () => {
    const h = harness(); h.el('volume').value = '0'; h.el('volume').oninput(); h.el('volume').onchange();
    h.el('ticks').value = '10'; h.el('ticks').onchange(); assert.equal(h.writes.at(-1).key, 'svko-squawkbox:settings:v1');
    assert.deepEqual(JSON.parse(JSON.stringify(h.writes.at(-1).value)), { volume: 0, ticks: 10 }); h.close();
  });
  await test('replay is rejected without starting audio', async () => {
    const h = harness({ replay: true }); await h.begin(); assert.match(h.el('status').textContent, /Replay/); assert.equal(h.contexts.length, 0); h.close();
  });
  await test('unrelated pages do no storage, UI or audio work', async () => {
    for (const url of ['https://example.com/', 'http://www.tradingview.com/chart/test/', 'https://www.tradingview.com/screener/']) {
      const h = harness({ url }); assert.equal(h.reads(), 0); assert.equal(h.menus.size, 0); assert.equal(h.el('start'), undefined); h.close();
    }
  });
  await test('minimizing and restoring preserve audio, binding and direction indication', async () => {
    const h = harness(); await h.begin(); const context = h.contexts[0]; await h.click('minimize');
    assert.equal(h.el('minimize').getAttribute('aria-expanded'), 'false');
    assert.equal(h.el('heading').textContent, 'IG:NASDAQ');
    h.first.emit(100.5); assert.equal(h.el('indicator').dataset.direction, 'up');
    h.advance(); h.first.emit(100); assert.equal(h.el('indicator').dataset.direction, 'down');
    assert.equal(h.oscillators.length, 2); assert.equal(h.first.subscriptions(), 3);
    await h.click('minimize'); assert.equal(h.contexts[0], context); assert.equal(context.state, 'running');
    await h.click('stop'); assert.equal(h.el('indicator').dataset.direction, ''); h.close();
  });
  await test('manual opening is idempotent and closing a minimized panel cleans up', async () => {
    const h = harness({ open: false }); h.menus.get('Squawkbox')(); h.menus.get('Squawkbox')();
    assert.equal(h.w.document.querySelectorAll('iframe').length, 1);
    await h.begin(); await h.click('minimize'); await h.click('close');
    assert.equal(h.first.subscriptions(), 0); assert.equal(h.contexts[0].state, 'closed');
    h.w.dispatchEvent(new h.w.Event('resize'));
    h.menus.get('Squawkbox')(); assert.equal(h.el('minimize').getAttribute('aria-expanded'), 'true');
    assert.equal(h.el('stop').disabled, true); h.close();
  });
  console.log(`${passed} Squawkbox scenarios passed.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
