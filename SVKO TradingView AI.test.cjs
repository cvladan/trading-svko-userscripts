// Run with: node 'SVKO TradingView AI.test.cjs'
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

// Minimal DOM stand-in exercises the actual script without opening external tabs.
class Element {
  constructor(tag) { this.tag = tag; this.children = []; this.nodes = {}; this.hidden = false; }
  set innerHTML(html) {
    for (const selector of (this.tag === 'dialog'
      ? ['h2', '[role=status]', 'fieldset', '.questions', '.close', '.add']
      : ['.question', '.editor', '.edit', '.revert', '.delete'])) this.nodes[selector] = new Element(selector);
    if (this.nodes['.editor']) this.nodes['.editor'].hidden = true;
  }
  querySelector(selector) { return this.nodes[selector]; }
  setAttribute() {}
  append(...nodes) { this.children.push(...nodes); for (const node of nodes) if (typeof node === "object") node.parent = this; }
  getBoundingClientRect() { return { left: 100, right: 700, top: 100, bottom: 500 }; }
  focus() {}
  click() { this.onclick(); }
  showModal() { this.open = true; }
  close() { this.open = false; this.onclose(); }
  remove() { this.parent.children = this.parent.children.filter(child => child !== this); }
}
const storage = new Map();
const opened = [];
let listener;
let symbol = 'NASDAQ:BRK.B';
const document = {
  body: new Element('body'),
  createElement: tag => new Element(tag),
  getElementById: id => document.body.children.find(child => child.id === id),
  querySelector: () => symbol ? { textContent: symbol } : null,
  addEventListener: (type, callback) => { assert.equal(type, 'contextmenu'); listener = callback; },
};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'SVKO TradingView AI.user.js'), 'utf8'), {
  document,
  GM_getValue: (key, fallback) => storage.has(key) ? storage.get(key) : fallback,
  GM_setValue: (key, value) => storage.set(key, value),
  GM_openInTab: (url, options) => { assert.equal(options.active, false); opened.push(url); },
});
function open(target = true) {
  let prevented = false;
  listener({ target: { closest: () => target }, preventDefault() { prevented = true; }, stopImmediatePropagation() {} });
  return { prevented, dialog: document.getElementById('svko-ai') };
}
assert.equal(open(false).prevented, false);
symbol = '';
assert.equal(open().prevented, false);
symbol = 'NASDAQ:BRK.B';
let { dialog } = open();
assert.equal(open().dialog, dialog);
assert.equal(document.body.children.length, 1);
const rows = dialog.querySelector('.questions').children;
assert.equal(rows.length, 1);
const row = rows[0];
const go = row.querySelector('.question');
const edit = row.querySelector('.edit');
const input = row.querySelector('.editor');
const original = go.textContent;
edit.click();
input.value = '  ';
edit.click();
assert.equal(input.hidden, false);
input.value = 'Why TICKER? Compare TICKER & 日本 + 5% #today';
edit.click();
assert.equal(input.hidden, true);
assert.equal(storage.get('questions')[0].text, input.value);
const checkboxes = dialog.querySelector('fieldset').children.map(label => label.children[0]);
checkboxes[0].checked = false;
go.click();
assert.equal(opened.length, 0);
assert.match(dialog.querySelector('[role=status]').textContent, /Select/);
for (const checkbox of checkboxes) { checkbox.checked = true; checkbox.onchange(); }
symbol = 'CHANGED';
go.click();
assert.equal(opened.length, 4);
for (const [index, url] of opened.entries()) {
  const parsed = new URL(url);
  assert.equal(parsed.searchParams.get(index === 0 ? 'prompt' : 'q'), (index === 3 ? 'Search the web for current information and cite sources with links.\n\n' : '') + 'Why NASDAQ:BRK.B? Compare NASDAQ:BRK.B & 日本 + 5% #today');
}
assert.equal(new URL(opened[3]).origin, 'https://grok.com');
assert.equal(storage.get('service:Grok'), true);
assert.equal(new URL(opened[0]).searchParams.get('hints'), 'search');
assert.equal(new URL(opened[2]).searchParams.get('udm'), '50');
assert.equal(document.body.children.length, 0);
dialog = open().dialog;
const savedRow = dialog.querySelector('.questions').children[0];
assert.match(savedRow.querySelector('.question').textContent, /日本/);
assert.ok(dialog.querySelector('fieldset').children.every(label => label.children[0].checked));
savedRow.querySelector('.revert').click();
assert.equal(savedRow.querySelector('.question').textContent, original);
savedRow.querySelector('.edit').click();
savedRow.querySelector('.editor').value = 'Unsaved';
savedRow.querySelector('.editor').onkeydown({ key: 'Escape', preventDefault() {}, stopPropagation() {} });
assert.equal(savedRow.querySelector('.question').textContent, original);
dialog.onclick({ target: dialog, clientX: 120, clientY: 120 });
assert.equal(document.body.children.length, 1);
dialog.onclick({ target: savedRow, clientX: 0, clientY: 0 });
assert.equal(document.body.children.length, 1);
dialog.onclick({ target: dialog, clientX: 80, clientY: 120 });
assert.equal(document.body.children.length, 0);
dialog = open().dialog;
dialog.querySelector('.close').click();
assert.equal(document.body.children.length, 0);
console.log('PASS: context targeting, missing ticker, dialog lifecycle, edit/save/revert/cancel, persistent settings, service selection, ticker capture and encoded URLs.');

dialog = open().dialog;
dialog.querySelector('.add').click();
let added = dialog.querySelector('.questions').children[1];
assert.equal(added.querySelector('.editor').hidden, false);
added.querySelector('.editor').value = 'Added TICKER question';
added.querySelector('.edit').click();
assert.equal(storage.get('questions')[1].text, 'Added TICKER question');
dialog.querySelector('.questions').children[0].querySelector('.delete').click();
assert.equal(storage.get('questions').length, 1);
added.querySelector('.edit').click();
added.querySelector('.editor').value = 'Edited after deletion';
added.querySelector('.edit').click();
assert.equal(storage.get('questions')[0].text, 'Edited after deletion');
added.querySelector('.delete').click();
dialog.close();
dialog = open().dialog;
assert.equal(dialog.querySelector('.questions').children.length, 0);
dialog.querySelector('.add').click();
assert.equal(dialog.querySelector('.questions').children.length, 1);
dialog.close();
storage.delete('questions');
storage.set('question:2', 'Legacy custom TICKER');
dialog = open().dialog;
assert.equal(dialog.querySelector('.questions').children.length, 1);
assert.equal(storage.get('questions')[0].text, 'Legacy custom TICKER');
dialog.close();
console.log('PASS: one initial question, add/edit/delete, empty list persistence, correct row after deletion and legacy migration.');
