// Run with jsdom 26.1.0 available on NODE_PATH; see the sibling Markdown guide.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');

const source = fs.readFileSync(path.join(__dirname, process.env.SVKO_TEST_SOURCE || 'SVKO TradingView Watchlist.user.js'), 'utf8');
const badgeSelector = '.svko-tv-watchlist-badge';
const widgetSelector = '[data-test-id-widget-type="watchlist"]';
const rowSelector = '[data-symbol-full][data-symbol-short]';
const rowHTML = (symbol = 'NASDAQ:TEST') => `
  <div data-symbol-full="${symbol}" data-symbol-short="TEST">
    <div><span class="symbolNameText-current">TEST</span></div>
    <span class="cell-current last-current hidden-current">100.00</span>
    <span class="cell-current change-current hidden-current">87.00</span>
    <span class="cell-current changeInPercents-current">99.00%</span>
    <span class="cell-current prePostMarketNoPrice-current hidden-current">
      <span data-value="2.00%"><span class="plus-current">2.00%</span></span>
    </span>
  </div>`;

function setup({ url = 'https://www.tradingview.com/chart/test/', lang = 'en', hidden = false, frame = false, widget = true } = {}) {
  const dom = new JSDOM(`<html lang="${lang}"><head></head><body>${widget ? `<div ${widgetSelector.slice(1, -1)}>${rowHTML()}</div>` : ''}</body></html>`, {
    url, runScripts: 'outside-only', pretendToBeVisual: true,
  });
  const { window } = dom;
  const { document } = window;
  const intervals = [];
  const handlers = [];
  const hovered = new Set();
  let isHidden = hidden;
  Object.defineProperty(document, 'hidden', { get: () => isHidden });
  if (frame) dom.reconfigure({ windowTop: {} });
  window.setInterval = (fn, delay) => { intervals.push({ fn, delay }); return intervals.length; };
  window.setTimeout = () => { throw new Error('Unexpected timeout'); };
  window.MutationObserver = class { constructor() { throw new Error('Unexpected observer'); } };
  const add = document.addEventListener.bind(document);
  document.addEventListener = (type, fn, ...args) => { handlers.push(type); return add(type, fn, ...args); };
  const matches = window.Element.prototype.matches;
  window.Element.prototype.matches = function (selector) {
    return selector === ':hover' ? hovered.has(this) : matches.call(this, selector);
  };
  vm.runInContext(source, dom.getInternalVMContext());
  return {
    dom, document, intervals, handlers, hovered,
    row: () => document.querySelector(rowSelector),
    badge: () => document.querySelector(badgeSelector),
    tick: () => intervals[0].fn(),
    hide: value => { isHidden = value; },
    enter(node = document.querySelector(badgeSelector), relatedTarget = null) {
      hovered.add(node);
      hovered.add(node.closest(rowSelector));
      node.dispatchEvent(new window.MouseEvent('pointerover', { bubbles: true, relatedTarget }));
    },
  };
}

function setValues(row, last, percent) {
  row.querySelector('.last-current').textContent = last;
  const node = row.querySelector('[data-value]');
  node.setAttribute('data-value', percent);
  node.textContent = percent;
}

let cases = 0;
function test(name, fn) {
  fn();
  cases++;
  console.log(`OK ${name}`);
}

test('one interval, one pointer handler, percent first, native cells preserved', () => {
  const app = setup();
  assert.deepEqual(app.intervals.map(item => item.delay), [1500]);
  assert.equal(app.handlers.filter(type => type === 'pointerover').length, 1);
  assert.equal(app.badge().dataset.percent, '2.00%');
  assert.equal(app.badge().dataset.price, undefined);
  assert.equal(app.row().querySelector('.change-current').textContent, '87.00');
  app.enter();
  assert.equal(app.badge().dataset.price, '102.00');
  assert.match(app.badge().title, /Approximate/);
  app.dom.window.close();
});

test('hover reads changed inputs immediately, without waiting for the interval', () => {
  const app = setup();
  setValues(app.row(), '200.00', '3.00%');
  app.enter();
  assert.equal(app.badge().dataset.percent, '3.00%');
  assert.equal(app.badge().dataset.price, '206.00');
  setValues(app.row(), '300.00', '4.00%');
  app.tick();
  assert.equal(app.badge().dataset.price, '312.00');
  app.hovered.clear();
  setValues(app.row(), '400.00', '4.00%');
  app.enter();
  assert.equal(app.badge().dataset.price, '416.00');
  app.dom.window.close();
});

test('only the hovered badge calculates a price, including unselected symbols', () => {
  const app = setup();
  const widget = app.document.querySelector(widgetSelector);
  widget.insertAdjacentHTML('beforeend', rowHTML('NYSE:TEST'));
  app.tick();
  const rows = widget.querySelectorAll(rowSelector);
  setValues(rows[1], '50.00', '10%');
  app.enter(rows[1].querySelector(badgeSelector));
  assert.equal(rows[0].querySelector(badgeSelector).dataset.price, undefined);
  assert.equal(rows[1].querySelector(badgeSelector).dataset.price, '55.00');
  app.dom.window.close();
});

test('signed, zero, localized and split text prices', () => {
  for (const [lang, last, percent, expected, direction] of [
    ['en', '100.00', '−2.00%', '98.00', '-1'],
    ['en', '100.00', '0.00%', '100.00', '0'],
    ['en', '100.00', '+2.00%', '102.00', '1'],
    ['en', '1,234.50', '+1.00%', '1246.85', '1'],
    ['de', '1.234,50', '−1,00%', '1222,15', '-1'],
    ['de', '1.234', '1,00%', '1246', '1'],
    ['en', '1,234', '1.00%', '1246', '1'],
    ['fr', '\u202a1\u202f234,50\u202c', '1,00 %', '1246,85', '1'],
    ['en', '0.1234', '10%', '0.1357', '1'],
  ]) {
    const app = setup({ lang });
    setValues(app.row(), last, percent);
    app.enter();
    assert.equal(app.badge().dataset.price, expected, `${lang}: ${last} ${percent}`);
    assert.equal(app.badge().dataset.direction, direction);
    app.dom.window.close();
  }
  const app = setup();
  app.row().querySelector('.last-current').innerHTML = '12<span>3.45</span>';
  app.enter();
  assert.equal(app.badge().dataset.price, '125.92');
  app.dom.window.close();
});

test('prefer a separately identified extended absolute change, never daily change', () => {
  const app = setup();
  app.row().querySelector('.prePostMarketNoPrice-current').insertAdjacentHTML('afterbegin', '<span class="change-current" data-value="-1.50">−1.50</span>');
  app.enter();
  assert.equal(app.badge().dataset.price, '98.50');
  assert.doesNotMatch(app.badge().title, /Approximate/);
  app.row().querySelector('.prePostMarketNoPrice-current .change-current').textContent = '0.00';
  app.enter();
  assert.equal(app.badge().dataset.price, '100.00');
  app.dom.window.close();
});

test('missing extended percentages switch to hidden regular content; invalid extended price retains percent', () => {
  for (const percent of ['', '—', 'NaN%', '2.3.4%', '2% extra']) {
    const app = setup();
    setValues(app.row(), '100.00', percent);
    app.row().querySelector('.changeInPercents-current').textContent = percent;
    app.tick();
    assert.equal(app.badge().dataset.session, 'regular', percent);
    assert.equal(app.badge().dataset.percent, '');
    assert.equal(app.badge().dataset.price, undefined);
    app.dom.window.close();
  }
  for (const price of ['', '—', 'NaN', '1,23,4.00', '0.00']) {
    const app = setup();
    app.enter();
    setValues(app.row(), price, '2%');
    app.enter();
    assert.equal(app.badge().dataset.price, undefined, price);
    assert.equal(app.badge().dataset.percent, '2%');
    app.dom.window.close();
  }
});

test('regular instruments add no percentage and read the exact Last value on row hover', () => {
  const app = setup();
  setValues(app.row(), '28,934.6', '');
  app.row().querySelector('.changeInPercents-current').textContent = '−1.45%';
  app.tick();
  assert.equal(app.badge().dataset.percent, '');
  assert.equal(app.badge().dataset.price, undefined);
  assert.equal(app.badge().dataset.session, 'regular');
  app.enter(app.row());
  assert.equal(app.badge().dataset.price, '28,934.6');
  assert.match(app.badge().title, /^Last price/);
  app.row().querySelector('.last-current').textContent = '28,935.0';
  app.tick();
  assert.equal(app.badge().dataset.price, '28,935.0');
  assert.match(app.document.querySelector('style').textContent, /::after\s*\{[^}]*color:\s*#fff;/);
  assert.match(app.document.querySelector('style').textContent, /\[data-session="regular"\]\s*\{\s*display:\s*none/);
  app.dom.window.close();
});

test('switching between regular and extended sessions invalidates the old price', () => {
  const app = setup();
  app.enter();
  app.hovered.clear();
  setValues(app.row(), '100.00', '');
  app.row().querySelector('.changeInPercents-current').textContent = '2.00%';
  app.tick();
  assert.equal(app.badge().dataset.price, undefined);
  app.enter();
  assert.equal(app.badge().dataset.price, '100.00');
  app.hovered.clear();
  setValues(app.row(), '100.00', '2.00%');
  app.tick();
  assert.equal(app.badge().dataset.price, undefined);
  app.enter();
  assert.equal(app.badge().dataset.price, '102.00');
  app.dom.window.close();
});

test('regular row hover works without any percentage and hides unavailable prices', () => {
  const app = setup();
  setValues(app.row(), '12.30', '');
  app.row().querySelector('.changeInPercents-current').textContent = '';
  app.enter(app.row());
  assert.equal(app.badge().dataset.price, '12.30');
  setValues(app.row(), '—', '');
  app.tick();
  assert.equal(app.badge().dataset.price, undefined);
  app.dom.window.close();
});

test('fallback to native percentage text and missing name cleanup', () => {
  const app = setup();
  app.row().querySelector('[data-value]').removeAttribute('data-value');
  app.enter();
  assert.equal(app.badge().dataset.price, '102.00');
  app.row().querySelector('.symbolNameText-current').remove();
  app.tick();
  assert.equal(app.badge(), null);
  app.dom.window.close();
});

test('reused row resets the previous symbol price and preserves one badge', () => {
  const app = setup();
  app.enter();
  app.hovered.clear();
  app.row().setAttribute('data-symbol-full', 'NYSE:OTHER');
  setValues(app.row(), '200.00', '2.00%');
  app.tick();
  assert.equal(app.badge().dataset.price, undefined);
  app.enter();
  assert.equal(app.badge().dataset.price, '204.00');
  app.tick();
  assert.equal(app.row().querySelectorAll(badgeSelector).length, 1);
  app.row().querySelector('.symbolNameText-current').insertAdjacentHTML('afterend', '<span>R</span>');
  app.tick();
  assert.equal(app.badge().previousElementSibling.className, 'symbolNameText-current');
  app.dom.window.close();
});

test('late widget, replaced widget, hidden tab and non-watchlist rows', () => {
  const app = setup({ widget: false });
  app.document.body.innerHTML = rowHTML() + `<div ${widgetSelector.slice(1, -1)}>${rowHTML()}</div>`;
  app.tick();
  assert.equal(app.document.querySelectorAll(badgeSelector).length, 1);
  app.document.querySelector(widgetSelector).outerHTML = `<div ${widgetSelector.slice(1, -1)}>${rowHTML('NYSE:NEW')}</div>`;
  app.hide(true);
  app.tick();
  assert.equal(app.badge(), null);
  app.hide(false);
  app.tick();
  assert.equal(app.badge().dataset.symbol, 'NYSE:NEW');
  app.dom.window.close();
});

test('watchlists work on every TradingView path, including lists opened later', () => {
  for (const pathname of ['/symbols/', '/symbols/NASDAQ-AAPL/', '/markets/', '/news/', '/']) {
    const app = setup({ url: `https://www.tradingview.com${pathname}`, widget: false });
    app.document.body.innerHTML = rowHTML();
    app.tick();
    assert.equal(app.badge(), null);
    app.document.body.insertAdjacentHTML('beforeend', `<div ${widgetSelector.slice(1, -1)}>${rowHTML()}</div>`);
    app.tick();
    const row = app.document.querySelector(widgetSelector).querySelector(rowSelector);
    const badge = row.querySelector(badgeSelector);
    assert.equal(badge.dataset.percent, '2.00%');
    app.enter(badge);
    assert.equal(badge.dataset.price, '102.00');
    app.document.querySelector(widgetSelector).remove();
    app.tick();
    assert.equal(app.badge(), null);
    app.document.body.insertAdjacentHTML('beforeend', `<div ${widgetSelector.slice(1, -1)}>${rowHTML('NYSE:REOPENED')}</div>`);
    app.tick();
    assert.equal(app.badge().dataset.symbol, 'NYSE:REOPENED');
    assert.equal(app.intervals.length, 1);
    app.dom.window.close();
  }
});

test('unchanged interval renders make no badge attribute writes', () => {
  const app = setup();
  const badge = app.badge();
  const original = badge.setAttribute.bind(badge);
  let writes = 0;
  badge.setAttribute = (...args) => { writes++; original(...args); };
  app.tick();
  assert.equal(writes, 0);
  app.enter();
  writes = 0;
  app.tick();
  assert.equal(writes, 0);
  app.dom.window.close();
});

test('host, protocol and frame guards stop all startup work', () => {
  for (const options of [
    { url: 'https://example.com/chart/test/' },
    { url: 'http://www.tradingview.com/chart/test/' },
    { frame: true },
  ]) {
    const app = setup(options);
    assert.equal(app.intervals.length, 0);
    assert.equal(app.handlers.includes('pointerover'), false);
    assert.equal(app.document.querySelector('style'), null);
    app.dom.window.close();
  }
});

console.log(`${cases} Watchlist regression scenarios passed.`);
