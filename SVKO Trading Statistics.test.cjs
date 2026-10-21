// Run with: node 'SVKO Trading Statistics.test.cjs'
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const filename = process.argv[2] || 'SVKO Trading Statistics.user.js';
const moduleStub = { exports: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, filename), 'utf8'), { module: moduleStub, Intl, Date, console });
const { minor, brokerClock, dayAt, classify, analyse, summarise, validateArchive, mergeBatch, historyPage, recordKey, parseBrokerExport, reconcile, rawDifferences } = moduleStub.exports;
assert.equal(moduleStub.exports.calendarShade(0, 0, 0, 1), '');
for (const [amount, expected] of [[1, ' gain-1'], [6000, ' gain-1'], [6001, ' gain-2'], [-1, ' loss-1'], [-4000, ' loss-1'], [-4001, ' loss-2']]) assert.equal(moduleStub.exports.calendarShade(amount, 6000, 4000, 1), expected);
for (const amount of [0, 500, -500, 100000, -100000]) assert.equal(moduleStub.exports.calendarShade(amount, 6000, 4000, 0), '');
assert.equal(moduleStub.exports.calendarShade(7000, 8000, 4000, 1), ' gain-1');
assert.equal(moduleStub.exports.calendarShade(-4500, 6000, 5000, 1), ' loss-1');
const snap = moduleStub.exports.snapChartCursor;
const chart = { data: [[0, 1, 2]], posToIdx: x => Math.max(0, Math.min(2, Math.round(x / 100))), valToPos: x => x * 100 };
for (const [left, expected] of [[0, 0], [49, 0], [51, 100], [149, 100], [151, 200], [200, 200]]) assert.deepEqual(Array.from(snap(chart, left, 75)), [expected, 75]);
assert.deepEqual(Array.from(snap(chart, -10, -10)), [-10, -10]);
assert.deepEqual(Array.from(snap({ data: [[]] }, 10, 10)), [10, 10]);
assert.deepEqual(Array.from(snap({ ...chart, data: [[0]], posToIdx: () => 0 }, 10, 25)), [0, 25]);
const bestDay = moduleStub.exports.bestCalendarDay;
assert.equal(bestDay([]), undefined);
assert.equal(bestDay([{ day: '2026-09-02', pl: 500, adjustments: -100 }, { day: '2026-09-01', pl: 600, adjustments: -200 }, { day: '2026-09-03', pl: 700, adjustments: -400 }]), '2026-09-01');
assert.equal(bestDay([{ day: '2026-09-01', pl: -500, adjustments: 0 }, { day: '2026-09-02', pl: -100, adjustments: -100 }]), '2026-09-02');
assert.equal(moduleStub.exports.preferences().weekStart, 0);
assert.equal(moduleStub.exports.preferences({ weekStart: 1 }).weekStart, 1);
for (const weekStart of [-1, 2, '0', 0.5]) assert.throws(() => moduleStub.exports.preferences({ weekStart }));
for (const [first, sunday, monday] of [['2026-09-01', '2026-08-30', '2026-08-31'], ['2026-11-01', '2026-11-01', '2026-10-26'], ['2026-06-01', '2026-05-31', '2026-06-01']]) {
  assert.equal(moduleStub.exports.calendarStart(first, 0), sunday);
  assert.equal(moduleStub.exports.calendarStart(first, 1), monday);
}
assert.equal(moduleStub.exports.preferences().gainThreshold, 60);
assert.equal(moduleStub.exports.preferences().lossThreshold, 40);
for (const field of ['gainThreshold', 'lossThreshold']) for (const value of [-1, 1.001, NaN, Infinity, '60']) assert.throws(() => moduleStub.exports.preferences({ [field]: value }));
assert.equal(moduleStub.exports.preferences({ gainThreshold: 0 }).gainThreshold, 0);
assert.equal(moduleStub.exports.preferences().usdSymbol, '$');
assert.equal(moduleStub.exports.preferences().reminderDays, 3);
for (const reminderDays of [0, -1, 1.5, 366, NaN, Infinity, '5']) assert.throws(() => moduleStub.exports.preferences({ reminderDays }));
assert.throws(() => moduleStub.exports.preferences({ usdSymbol: 'USD' }));
assert.equal(moduleStub.exports.preferences().calendarMonth, '');
const savedViews = moduleStub.exports.preferences({ period: 'custom', customFrom: '2026-04-03', customTo: '2026-05-16', calendarMonth: '2026-09' });
const movedCalendar = moduleStub.exports.preferences({ ...savedViews, calendarMonth: '2026-08' });
assert.equal(movedCalendar.period, 'custom');
assert.equal(movedCalendar.customFrom, '2026-04-03');
assert.equal(movedCalendar.customTo, '2026-05-16');
assert.equal(moduleStub.exports.preferences({ ...movedCalendar, period: '7' }).calendarMonth, '2026-08');
assert.equal(moduleStub.exports.preferences({ ...movedCalendar, account: 'trade-nation-spread:100' }).customTo, '2026-05-16');
for (const calendarMonth of [null, '2026-00', '2026-13', '2026-9', '2026-09-01', 202609]) {
  if (calendarMonth !== null) assert.throws(() => moduleStub.exports.preferences({ calendarMonth }), /calendar month/);
}
for (const [month, last] of [['2026-09', '2026-09-30'], ['2026-02', '2026-02-28'], ['2028-02', '2028-02-29'], ['2026-12', '2026-12-31']]) {
  assert.equal(moduleStub.exports.monthRange(month).from, month + '-01');
  assert.equal(moduleStub.exports.monthRange(month).to, last);
}
const coveredAccount = { coverageFrom: '2026-09-01T00:00:00Z', completedAt: '2026-09-12T01:00:00Z', incomplete: false };
const covered = moduleStub.exports.periodIsCovered;
assert.equal(covered([coveredAccount], '2026-09-01', '2026-09-12', 'UTC'), true);
assert.equal(covered([coveredAccount], '2026-09-01', '2026-09-30', 'UTC'), false);
assert.equal(covered([coveredAccount], '2026-08-01', '2026-09-12', 'UTC'), false);
assert.equal(covered([{ ...coveredAccount, completedAt: '2026-09-11T23:00:00Z' }], '2026-09-01', '2026-09-12', 'UTC'), false);
assert.equal(covered([{ ...coveredAccount, incomplete: true }], '2026-09-01', '2026-09-12', 'UTC'), false);
assert.equal(covered([], '2026-09-01', '2026-09-12', 'UTC'), false);
assert.equal(covered([], '2026-10-01', '2026-09-12', 'UTC'), true);
assert.equal(moduleStub.exports.preferences().period, '30');
assert.equal(moduleStub.exports.preferences().account, '');
assert.equal(moduleStub.exports.preferences({ account: 'trade-nation-cfd:100' }).account, 'trade-nation-cfd:100');
assert.throws(() => moduleStub.exports.preferences({ account: 100 }));
assert.equal(moduleStub.exports.preferences({ period: 'all' }).period, 'all');
const savedPeriod = { period: 'custom', customFrom: '2026-04-01', customTo: '2026-04-30' };
assert.equal(moduleStub.exports.preferences(savedPeriod).customTo, '2026-04-30');
for (const value of [{ period: 'unknown' }, { period: 'custom' }, { ...savedPeriod, customFrom: '2026-02-30' }, { ...savedPeriod, customTo: '2026-03-01' }]) assert.throws(() => moduleStub.exports.preferences(value));
const reminderNow = Date.parse('2026-09-11T12:00:00Z');
assert.equal(moduleStub.exports.pullIsDue([], 3, reminderNow), true);
assert.equal(moduleStub.exports.pullIsDue([{}], 3, reminderNow), true);
assert.equal(moduleStub.exports.pullIsDue([{ completedAt: 'invalid' }], 3, reminderNow), true);
assert.equal(moduleStub.exports.pullIsDue([{ completedAt: '2026-09-08T12:00:00Z' }], 3, reminderNow), false);
assert.equal(moduleStub.exports.pullIsDue([{ completedAt: '2026-09-08T11:59:59Z' }], 3, reminderNow), true);
assert.equal(moduleStub.exports.pullIsDue([{ completedAt: '2026-09-11T11:00:00Z' }, { completedAt: '2026-09-01T12:00:00Z' }], 3, reminderNow), true);
assert.equal(moduleStub.exports.formatMoney(-572), '-$5.72');
assert.equal(moduleStub.exports.formatMoney(-572, 'USD', 'US$'), '-US$5.72');
assert.equal(moduleStub.exports.formatMoney(572, 'EUR', '$'), moduleStub.exports.formatMoney(572, 'EUR', 'US$'));
assert.equal(moduleStub.exports.calendarEquation(-572, -724, '$'), 'P/L -$5.72 − $7.24 = -12.96');
assert.equal(moduleStub.exports.calendarEquation(572, 724, 'US$'), 'P/L US$5.72 + US$7.24 = 12.96');
const fundingRows = [['Zulu', { paid: -900, received: 30, count: 2 }], ['Alpha', { paid: -1000, received: 200, count: 12 }], ['Beta', { paid: 0, received: 100, count: 3 }]];
for (const [column, expected] of [[0, 'Alpha,Beta,Zulu'], [1, 'Alpha,Zulu,Beta'], [2, 'Zulu,Beta,Alpha'], [3, 'Zulu,Alpha,Beta'], [4, 'Zulu,Beta,Alpha']]) {
  const ordered = [...fundingRows].sort((a,b) => moduleStub.exports.compareFunding(a, b, column));
  assert.equal(ordered.map(r => r[0]).join(','), expected);
  assert.equal([...fundingRows].sort((a,b) => -moduleStub.exports.compareFunding(a, b, column)).map(r => r[0]).join(','), ordered.reverse().map(r => r[0]).join(','));
}
const key = 'trade-nation-cfd:100';
const account = { key, source: 'trade-nation-cfd', id: '100', name: 'Synthetic account', baseCurrency: 'USD' };
let reference = 0;
const raw = (Action, ProfitLoss, Currency = 'USD', Description = 'Example shares', extra = {}) => ({
  RefID: String(++reference), Action, ProfitLoss, Currency, Description, TransactionDate: '10/09/26 22:01:36',
  OpenPeriod: '08/09/26 15:00:00', Amount: '1', OpenPrice: '100', ClosePrice: '110', Balance: '1000.00',
  TransactionType: '2', MarketID: null, Message: null, Status: 1, ...extra,
});
const entry = raw => ({ accountKey: key, fetchedAt: '2026-09-11T18:00:00Z', raw });
const fixtures = [
  raw('Trade Receivable', '30.10'), raw('Trade Payable', '-10.10', 'USD', 'Example shares', { Amount: '-1' }),
  raw('Trade Receivable', '0.00'), raw('Funding Charges', '-2.17'), raw('Funding Refund', '0.17'),
  raw('Trading Adjustment(Div)', '5.00'), raw('Fund payable', '-3.00', 'USD', 'Subscription Payment'),
  raw('Fund receivable', '1000.00', 'USD', 'Online Transfer Cash In'), raw('Fund payable', '-500.00', 'USD', 'Online Transfer Cash Out'),
  raw('Funding Charges', '-0.49', 'DKK', 'Danish shares'),
  raw('Fund receivable', '0.49', 'DKK', 'Currency conversion to DKK-C from USD-C @ 6.416651'),
  raw('Fund payable', '-0.08', 'USD', 'Currency conversion from USD-C to DKK-C @ 6.416651'),
];
const filter = { account: '', market: '', from: '2026-09-01', to: '2026-09-30' };
const data = analyse(fixtures.map(entry), 'Europe/Belgrade');
const summary = summarise(data, filter);
const cashSummary = moduleStub.exports.transferSummary;
const cashIn = entry(raw('Fund receivable', '100.00', 'USD', 'Online Transfer Cash In'));
const cashOut = { ...entry(raw('Fund payable', '-100.00', 'USD', 'Online Transfer Cash Out', { TransactionDate: '10/09/26 22:01:37' })), accountKey: 'trade-nation-spread:100' };
const cashData = analyse([...fixtures.map(entry), cashIn, cashOut], 'Europe/Belgrade');
const cashResult = cashSummary(cashData, filter);
assert.equal(cashResult.rows.filter(r => r.internal).length, 2);
assert.equal(cashResult.totals.get('USD').deposits, 100000);
assert.equal(cashResult.totals.get('USD').withdrawals, 50000);
assert.equal(cashResult.totals.get('USD').net, 50000);
assert.equal(cashSummary(cashData, { ...filter, account: key, market: 'Not a cash instrument' }).rows.find(r => r.raw.RefID === cashIn.raw.RefID).internal, true);
const outsideDay = analyse([cashIn, { ...cashOut, raw: { ...cashOut.raw, TransactionDate: '10/09/26 22:01:38' } }], 'UTC');
assert.equal(cashSummary(outsideDay, filter).rows.filter(r => r.internal).length, 0);
const midnight = analyse([{ ...cashIn, raw: { ...cashIn.raw, TransactionDate: '10/09/26 23:59:59' } }, { ...cashOut, raw: { ...cashOut.raw, TransactionDate: '11/09/26 00:00:00' } }], 'Europe/London');
assert.equal(cashSummary(midnight, { ...filter, from: '2026-09-11', to: '2026-09-11' }).rows[0].internal, true);
const duplicate = { ...cashOut, raw: { ...cashOut.raw, RefID: 'ambiguous' } };
assert.equal(cashSummary(analyse([cashIn, cashOut, duplicate], 'UTC'), filter).rows.filter(r => r.internal).length, 0);
const sameAccount = { ...cashOut, accountKey: key };
assert.equal(cashSummary(analyse([cashIn, sameAccount], 'UTC'), filter).rows.filter(r => r.internal).length, 0);
const foreignCash = { ...cashOut, raw: { ...cashOut.raw, Currency: 'EUR' } };
const separateCurrencies = cashSummary(analyse([cashIn, foreignCash], 'UTC'), filter);
assert.equal(separateCurrencies.rows.filter(r => r.internal).length, 0);
assert.equal(separateCurrencies.totals.get('EUR').withdrawals, 10000);
assert.equal(separateCurrencies.totals.get('USD').deposits, 10000);
const cashRow = cashResult.rows.find(r => r.raw.RefID === cashIn.raw.RefID);
const manual = { [cashRow.key]: { mode: 'external', fingerprint: cashRow.fingerprint } };
assert.equal(cashSummary(cashData, filter, manual).rows.filter(r => r.internal).length, 0);
manual[cashRow.key].mode = 'internal';
assert.equal(cashSummary(analyse([cashIn], 'UTC'), filter, manual).totals.get('USD').deposits, 0);
const revisedCash = { ...cashIn, raw: { ...cashIn.raw, ProfitLoss: '150.00' } };
const changedCash = cashSummary(analyse([revisedCash], 'UTC'), filter, manual);
assert.equal(changedCash.rows[0].stale, true);
assert.equal(changedCash.rows[0].internal, false);
assert.equal(changedCash.totals.get('USD').deposits, 15000);
const invalidCash = cashSummary(analyse([{ ...cashIn, raw: { ...cashIn.raw, ProfitLoss: '-100.00' } }], 'UTC'), filter);
assert.equal(invalidCash.rows[0].valid, false);
assert.equal(invalidCash.totals.get('USD').net, 0);
assert.equal(cashSummary(analyse([], 'UTC'), filter).totals.get('USD').net, 0);
assert.equal(moduleStub.exports.preferences({ transferOverrides: manual }).transferOverrides[cashRow.key].mode, 'internal');
for (const transferOverrides of [[], { wrong: manual[cashRow.key] }, { [cashRow.key]: { mode: 'bad', fingerprint: '' } }, { [cashRow.key]: { mode: 'internal', fingerprint: 123 } }]) assert.throws(() => moduleStub.exports.preferences({ transferOverrides }), /classification/);
assert.equal(summarise(cashData, filter).total, summary.total);
console.log('PASS: transfer pairing across accounts and date filters, ambiguous pairs, one-second limit, currency separation, manual overrides, stale classifications and unchanged trading P/L.');
assert.equal(summary.total, 1992);
assert.equal(summary.pl, 2000);
assert.equal(summary.adjustments, -8);
assert.equal(summary.categories['Funding charges'], -225);
assert.equal(summary.categories['Funding received'], 17);
assert.equal(summary.trades, 3);
assert.equal(summary.winners, 1); assert.equal(summary.losers, 1); assert.equal(summary.flat, 1);
assert.equal(summary.long, 2); assert.equal(summary.short, 1);
assert.equal(data.issues.length, 0);
assert.equal(summary.daily.get('2026-09-10').pl + summary.daily.get('2026-09-10').adjustments, summary.total);
assert.equal(summarise(data, { ...filter, market: 'Danish shares' }).total, -8);
assert.equal(summarise(data, { ...filter, from: '2026-09-11' }).total, 0);
assert.equal(minor('0.29'), 29); assert.equal(minor('-0.08'), -8); assert.equal(minor('1.2'), 120);
assert.equal(minor('1.234'), null); assert.equal(minor('oops'), null); assert.equal(minor(''), null);
assert.equal(minor('9007199254740992'), null);
assert.equal(classify(raw('Fund payable', '-9', 'USD', 'Unrecognised transfer')), 'Unknown');

const clock = brokerClock();
assert.equal(new Date(clock('10/09/26 22:01:36').ms).toISOString(), '2026-09-10T21:01:36.000Z');
assert.equal(new Date(clock('10/01/26 22:01:36').ms).toISOString(), '2026-01-10T22:01:36.000Z');
assert.equal(dayAt(clock('10/09/26 23:30:00').ms, 'Europe/Belgrade'), '2026-09-11');
assert.equal(clock('29/03/26 01:30:00'), null);
assert.equal(clock('25/10/26 01:30:00').ambiguous, true);
assert.equal(clock('31/02/26 10:00:00'), null);
assert.equal(clock('bad'), null);

// Repeated equal-valued funding postings are separate records, not duplicates.
const sameFunding = [raw('Funding Charges', '-0.49', 'DKK', 'Danish shares'), raw('Funding Charges', '-0.49', 'DKK', 'Danish shares')];
const grouped = analyse([...sameFunding,
  raw('Fund receivable', '0.98', 'DKK', 'Currency conversion to DKK-C from USD-C @ 6.4'),
  raw('Fund payable', '-0.15', 'USD', 'Currency conversion from USD-C to DKK-C @ 6.4'),
].map(entry), 'UTC');
assert.equal(summarise(grouped, filter).total, -15);
assert.equal(grouped.rows[0].usd, null);
assert.equal(grouped.rows[0].convertedGroup.cents, -15);
assert.equal(grouped.issues.length, 0);
const unmatched = analyse([entry(raw('Funding Charges', '-5', 'EUR'))], 'UTC');
assert.equal(unmatched.issues.length, 1);
assert.equal(summarise(unmatched, filter).total, 0);
const mixedMarkets = analyse([entry(raw('Funding Charges', '-0.49', 'DKK', 'A')),
  entry(raw('Funding Charges', '-0.49', 'DKK', 'B')),
  entry(raw('Fund receivable', '0.98', 'DKK', 'Currency conversion to DKK-C from USD-C @ 6.4')),
  entry(raw('Fund payable', '-0.15', 'USD', 'Currency conversion from USD-C to DKK-C @ 6.4'))], 'UTC');
assert.equal(mixedMarkets.events.length, 0);
assert.equal(mixedMarkets.issues.length, 4);
const foreignTrade = analyse([
  entry(raw('Trade Receivable', '64.00', 'DKK')),
  entry(raw('Fund payable', '-64.00', 'DKK', 'Currency conversion from DKK-C to USD-C @ 0.15625')),
  entry(raw('Fund receivable', '10.00', 'USD', 'Currency conversion to USD-C from DKK-C @ 0.15625')),
], 'UTC');
assert.equal(summarise(foreignTrade, filter).pl, 1000);
assert.equal(summarise(foreignTrade, filter).trades, 1);

const one = entry(fixtures[0]);
const initial = mergeBatch({}, [one]);
assert.equal(Object.keys(initial.writes).length, 1);
assert.equal(Object.keys(mergeBatch(initial.writes, [one]).writes).length, 0);
const correction = { ...one, fetchedAt: '2026-09-12T18:00:00Z', raw: { ...one.raw, ProfitLoss: '31.10' } };
const corrected = mergeBatch(initial.writes, [correction]);
assert.equal(Object.values(corrected.writes)[0].raw.ProfitLoss, '31.10');
assert.equal(Object.keys(mergeBatch(corrected.writes, [one]).writes).length, 0);
const collision = { ...correction, raw: { ...correction.raw, Currency: 'EUR' } };
assert.equal(mergeBatch(initial.writes, [collision]).conflicts.length, 1);
assert.equal(Object.keys(mergeBatch(initial.writes, [{ ...one, accountKey: 'trade-nation-cfd:200' }]).writes).length, 1);
assert.ok(recordKey(key, one.raw).includes(key));

const archive = { format: 'svko-trading-statistics', schemaVersion: 1, accounts: [account], records: fixtures.map(entry), settings: { weekStart: 1, zone: 'Europe/Belgrade', reminderDays: 10, usdSymbol: 'US$', gainThreshold: 75, lossThreshold: 45, account: key, ...savedPeriod }, conflicts: [] };
assert.equal(validateArchive(JSON.parse(JSON.stringify(archive))).records.length, fixtures.length);
assert.throws(() => validateArchive({ ...archive, schemaVersion: 99 }), /format/);
assert.throws(() => validateArchive({ ...archive, records: [{ ...one, accountKey: 'wrong' }] }), /account/);
assert.throws(() => validateArchive({ ...archive, settings: { zone: 'Invalid/Zone' } }));
assert.throws(() => validateArchive({ ...archive, records: [one, correction] }), /Conflicting/);
assert.throws(() => validateArchive({ ...archive, records: [entry({ ...fixtures[0], RefID: '' })] }), /reference/);

assert.equal(historyPage({ d: { d: { records: [fixtures[0]], currentPage: 1, totalPages: 3 } } }, 0).totalPages, 3);
assert.equal(historyPage({ d: { d: { records: [fixtures[0]], currentPage: 2, totalPages: 3 } } }, 2, 3).currentPage, 2);
assert.throws(() => historyPage({ d: { d: { records: [], currentPage: 2, totalPages: 4 } } }, 2, 3), /pagination/);
assert.throws(() => historyPage({ d: { d: { records: [fixtures[0]], currentPage: 1, totalPages: 3 } } }, 2, 3), /pagination/);
assert.throws(() => historyPage({ d: { error: 'session expired' } }, 0), /response/);
assert.equal(historyPage({ d: { d: { records: [], currentPage: 0, totalPages: 0 } } }, 0).records.length, 0);

// The normal-page boot must register only a menu, without touching storage, DOM or network.
let registrations = 0;
vm.runInNewContext(fs.readFileSync(path.join(__dirname, filename), 'utf8'), {
  location: { origin: 'https://example.com', pathname: '/' },
  GM: { registerMenuCommand(name, callback) { assert.equal(name, 'Open trading statistics'); assert.equal(typeof callback, 'function'); registrations++; } },
});
assert.equal(registrations, 1);
console.log('PASS: exact accounting, funding and FX groups, transfers, incomplete values, London DST, filters, archive validation, deduplication, corrections, pagination and dormant normal-page startup.');

const exportHeaders = ['Transaction Date','Serial','Action','Description','Amount','Open date','Opening','Closing','P/L','Status','Balance','Currency'];
function exportCSV(rows) {
  const quote = value => '"' + String(value ?? '').replace(/"/g, '""') + '"';
  return [exportHeaders.join(','), ...rows.map(r => [r.TransactionDate, r.RefID, r.Action, r.Description, r.Amount, r.OpenPeriod,
    r.OpenPrice || '0.000000', r.ClosePrice || '0.000000', r.ProfitLoss, r.DepWithStatus || '', r.Balance, r.Currency].map(quote).join(','))].join('\r\n');
}
const parsedExport = parseBrokerExport('\uFEFF' + exportCSV(fixtures));
assert.equal(parsedExport.length, fixtures.length);
assert.equal(reconcile(fixtures.map(entry), parsedExport, key).status, 'matched');
const cash = raw('Funding Charges','-0.08','USD','Quoted "name", with\na newline',{OpenPrice:'',ClosePrice:''});
assert.equal(parseBrokerExport(exportCSV([cash]))[0].Description, cash.Description);
assert.equal(reconcile([entry(cash)], parseBrokerExport(exportCSV([cash])), key).status, 'matched');
const formatting = { ...parsedExport[0], TransactionDate:'10/09/2026 22:01:36', OpenPrice:'100.000000', Amount:'1.0000' };
assert.equal(reconcile([entry(fixtures[0])],[formatting],key).status,'matched');
const changedExport = parsedExport.map(r=>({...r}));
changedExport[0].ProfitLoss = '31.10'; changedExport[1].ProfitLoss = '-11.10';
const offsetting = reconcile(fixtures.map(entry),changedExport,key);
assert.equal(offsetting.status,'different'); assert.equal(offsetting.differingRecords,2);
assert.equal(offsetting.totals.find(t=>t.currency==='USD').difference,0);
assert.equal(offsetting.details[0].field,'ProfitLoss');
assert.equal(offsetting.details[0].before,'"30.10"'); assert.equal(offsetting.details[0].after,'"31.10"');
assert.ok(reconcile(fixtures.map(entry), parsedExport.slice(1), key).details.some(d=>d.kind==='Not in broker export'));
assert.ok(reconcile(fixtures.slice(1).map(entry), parsedExport, key).details.some(d=>d.kind==='Missing locally'));
assert.throws(()=>parseBrokerExport(exportCSV([cash,cash])),/Duplicate/);
assert.throws(()=>parseBrokerExport('<html>Login</html>'),/columns/);
assert.throws(()=>parseBrokerExport(exportCSV([cash]).slice(0,-1)),/Truncated/);
assert.throws(()=>parseBrokerExport(exportCSV([cash]).replace('Serial','Unexpected')),/columns/);
assert.equal(rawDifferences({Message:null},{Message:'Revised'})[0].before,'null');
assert.equal(mergeBatch(initial.writes,[correction]).revisions[0].details[0].field,'ProfitLoss');
console.log('PASS: complete export comparison by reference and field, offsetting monetary errors, missing records, numeric/date formatting, multiline CSV and malformed exports.');

// Exercise the actual importer against in-memory GM storage and a paginated broker.
async function checkImports() {
  const source = fs.readFileSync(path.join(__dirname, filename), 'utf8');
  const store = {}, requests = [];
  let recordWrites = 0, failRecordWrite = Infinity, failPage = -1, exportRows = fixtures.slice(0,3), exportFailure = false, exportRequests = 0;
  const notifications = [];
  const prefix = 'svko-stats:', accountKey = prefix + 'account:' + key;
  const gm = {
    async notification(details) { notifications.push(details.text); },
    async getValue(k, fallback) { return store[k] ?? fallback; },
    async setValue(k, v) { store[k] = structuredClone(v); },
    async listValues() { return Object.keys(store); },
    async getValues(keys) { return Object.fromEntries(keys.filter(k => k in store).map(k => [k, structuredClone(store[k])])); },
    async setValues(values) {
      if (Object.keys(values).some(k => k.startsWith(prefix + 'record:'))) {
        if (++recordWrites === failRecordWrite) throw Error('Synthetic storage failure');
      }
      Object.assign(store, structuredClone(values));
    },
  };
  const testModule = { exports: {} };
  let accountLabel = 'Account ID 100 CFD USD';
  const testLocation = { origin: 'https://platform-cfd.tradenation.com', pathname: '/Advanced.aspx' };
  vm.runInNewContext(source, {
    module: testModule, GM: gm, Intl, Date, console, TextDecoder, Uint8Array, crypto: require('node:crypto').webcrypto, AbortSignal,
    location: testLocation,
    document: { getElementById: () => ({ textContent: accountLabel }) },
    navigator: { locks: { request: async (_, __, callback) => callback({}) } },
    fetch: async (url, options) => {
      if (url.startsWith('/GetTransactionHistoryCSVFile.aspx?')) {
        exportRequests++;
        assert.ok(url.includes('days=-1&transType=1'));
        assert.equal(url.includes('&currency='), testLocation.origin.includes('platform-cfd'));
        if (exportFailure) return { ok: false, status: 502 };
        const buffer = Buffer.from('\uFEFF' + exportCSV(exportRows), 'utf16le');
        return { ok: true, arrayBuffer: async () => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) };
      }
      assert.equal(url, '/UTSAPI.asmx/' + (testLocation.origin.includes('platform-cfd') ? 'GetTransactionHistoryByCurrency' : 'GetTransactionHistory'));
      assert.equal(options.method, 'POST');
      const query = JSON.parse(options.body); requests.push(query);
      if (query.page === failPage) return { ok: false, status: 503 };
      const page = query.page || 1;
      return { ok: true, json: async () => ({ d: { d: { records: [fixtures[page - 1]], currentPage: page, totalPages: 3 } } }) };
    },
  });
  const api = testModule.exports;
  assert.throws(() => api.addMoney(Number.MAX_SAFE_INTEGER, 1), /precision/);
  await api.pullData('7');
  assert.deepEqual(requests.map(r => r.page), [0, 2, 3]);
  assert.ok(requests.every(r => r.days === 7 && r.transType === 1 && r.currencyCode === ''));
  assert.equal(store[accountKey].incomplete, false);
  assert.equal(store[accountKey].fullHistory, false);
  const writesAfterFirst = recordWrites;
  await api.pullData('incremental');
  assert.equal(recordWrites, writesAfterFirst);
  assert.equal(exportRequests,2);
  assert.equal(store[accountKey].verification.status,'matched');
  const historic = entry(raw('Funding Charges','-1.00','USD','Older shares',{TransactionDate:'01/03/26 22:00:00'}));
  const historicKey = api.recordKey(key,historic.raw);
  store[historicKey] = structuredClone(historic);
  exportRows = [...fixtures.slice(0,3),{...historic.raw,ProfitLoss:'-1.25'}];
  const mismatch = await api.pullData('7');
  assert.equal(mismatch.verification.status,'different');
  assert.equal(mismatch.verification.details[0].ref,historic.raw.RefID);
  assert.equal(store[historicKey].raw.ProfitLoss,'-1.00');
  assert.ok((await api.readArchive()).audit.some(a=>a.kind==='reconciliation'));
  assert.ok(notifications.some(n=>n.includes('differ')));
  delete store[historicKey]; exportRows=fixtures.slice(0,3);
  const completedAt = store[accountKey].completedAt;
  exportFailure=true;
  const failedCheck=await api.pullData('7');
  assert.equal(failedCheck.verification.status,'failed');
  assert.equal(store[accountKey].incomplete,true);
  assert.equal(store[accountKey].completedAt,completedAt);
  exportFailure=false;
  failPage = 2;
  await assert.rejects(api.pullData('all'), /503/);
  assert.equal(store[accountKey].incomplete, true);
  assert.equal(store[accountKey].completedAt, completedAt);
  assert.equal(store[prefix + 'job'], null);
  failPage = -1;
  await api.pullData('all');
  assert.equal(store[accountKey].fullHistory, true);
  store[accountKey].completedAt = '2026-06-01T00:00:00Z';
  store[accountKey].coverageFrom = '2026-03-01T00:00:00Z';
  await api.pullData('1');
  assert.equal(store[accountKey].fullHistory, false);
  assert.ok(store[accountKey].coverageFrom > '2026-06-01');

  for (const k of Object.keys(store)) delete store[k];
  recordWrites = 0; failRecordWrite = 2;
  const bigArchive = { ...archive, accounts: [{ ...account, completedAt: '2026-09-11T18:00:00Z', coverageFrom: '2026-09-01T00:00:00Z', incomplete: false }],
    records: Array.from({ length: 101 }, () => entry(raw('Funding Charges', '-0.01'))) };
  await assert.rejects(api.importArchive(bigArchive), /storage failure/);
  assert.equal(store[accountKey].incomplete, true);
  assert.equal((await api.readArchive()).records.length, 100);
  failRecordWrite = Infinity; exportRows = bigArchive.records.map(r=>r.raw);
  await api.importArchive(bigArchive);
  assert.equal(store[accountKey].incomplete, false);
  assert.equal((await api.readArchive()).records.length, 101);
  const saved = await api.readArchive();
  assert.equal(saved.settings.weekStart, 1); assert.equal(saved.settings.reminderDays, 10); assert.equal(saved.settings.usdSymbol, 'US$');
  assert.equal(saved.settings.gainThreshold, 75); assert.equal(saved.settings.lossThreshold, 45);
  assert.equal(saved.settings.account, key); assert.equal(saved.settings.period, 'custom'); assert.equal(saved.settings.customFrom, '2026-04-01'); assert.equal(saved.settings.customTo, '2026-04-30');
  await api.importArchive(JSON.parse(JSON.stringify(saved)));
  assert.equal((await api.readArchive()).records.length, 101);
  assert.throws(() => api.validateArchive({ ...archive, accounts: [{ ...account, completedAt: 'not a date' }] }), /coverage/);
  assert.throws(() => api.validateArchive({ ...archive, accounts: [account, account] }), /Duplicate/);
  assert.equal(store[accountKey].verification.status,'matched');
  const revised = structuredClone(bigArchive); revised.records[0].raw.Message='Broker revision'; revised.records[0].fetchedAt='2026-09-12T18:00:00Z';
  await api.importArchive(revised);
  const changedAudit = (await api.readArchive()).audit.find(a=>a.kind==='change');
  assert.ok(changedAudit.details.some(d=>d.field==='Message' && d.after==='"Broker revision"'));
  assert.equal(changedAudit.previous.raw.Message,null);
  assert.ok(notifications.some(n=>n.includes('Previously saved')));
  const auditBackup = await api.readArchive();
  store['svko-stats:settings'].transferOverrides = structuredClone(manual);
  store['svko-stats:settings'].calendarMonth = '2026-08';
  const cashBackup = await api.readArchive();
  api.validateArchive(cashBackup);
  await api.importArchive(JSON.parse(JSON.stringify(cashBackup)));
  assert.equal(store['svko-stats:settings'].transferOverrides[cashRow.key].fingerprint, cashRow.fingerprint);
  assert.equal(store['svko-stats:settings'].calendarMonth, '2026-08');
  api.validateArchive(auditBackup);
  assert.equal(auditBackup.schemaVersion,2);
  assert.throws(()=>api.validateArchive({...auditBackup,audit:undefined}),/audit/);
  testLocation.origin='https://example.com';
  const offline=await api.importArchive(auditBackup);
  assert.equal(offline.verification,null);
  assert.equal(store[accountKey].verification.status,'pending');
  assert.equal((await api.readArchive()).audit.length,auditBackup.audit.length);
  assert.ok(notifications.some(n=>n.includes('need a broker check')));
  const cfdBeforeSpread = JSON.stringify(Object.fromEntries(Object.entries(store).filter(([k]) => k.includes('trade-nation-cfd:'))));
  testLocation.origin = 'https://platform.tradenation.com';
  assert.equal(api.brokerAccount(), null);
  accountLabel = 'Account ID\u00a0100 SPREAD\u00a0USD';
  const spreadKey = 'trade-nation-spread:100';
  assert.equal(api.brokerAccount().key, spreadKey);
  assert.equal(api.brokerAccount().name, 'Trade Nation Spread 100');
  for (const label of ['Account ID 100 SPREAD GBP', 'Account ID 100 SPREAD EUR', 'SPREAD USD']) {
    accountLabel = label;
    await assert.rejects(api.pullData(), /signed-in/);
  }
  accountLabel = 'Account ID 100 SPREAD USD';
  testLocation.pathname = '/'; assert.equal(api.brokerAccount(), null);
  testLocation.pathname = '/Advanced.aspx';
  testLocation.origin = 'https://platform-cfd.tradenation.com'; assert.equal(api.brokerAccount(), null);
  testLocation.origin = 'https://platform.tradenation.com';
  exportRows = fixtures.slice(0,3); requests.length = 0;
  const spreadPull = await api.pullData('all');
  assert.equal(spreadPull.count, 3); assert.equal(spreadPull.verification.status, 'matched');
  assert.deepEqual(requests.map(r => r.page), [0,2,3]);
  assert.ok(requests.every(r => r.days === -1 && !('currencyCode' in r)));
  assert.equal(store[prefix + 'account:' + spreadKey].source, 'trade-nation-spread');
  assert.equal(store[api.recordKey(spreadKey, fixtures[0])].accountKey, spreadKey);
  assert.equal(JSON.stringify(Object.fromEntries(Object.entries(store).filter(([k]) => k.includes('trade-nation-cfd:')))), cfdBeforeSpread);
  const writesBeforeRepeat = recordWrites;
  assert.equal((await api.pullData('incremental')).changed, 0);
  assert.equal(recordWrites, writesBeforeRepeat);
  const combinedBackup = await api.readArchive();
  assert.equal(combinedBackup.accounts.length, 2);
  api.validateArchive(JSON.parse(JSON.stringify(combinedBackup)));
  const spreadBackup = { ...combinedBackup, accounts: combinedBackup.accounts.filter(a=>a.key===spreadKey), records: combinedBackup.records.filter(r=>r.accountKey===spreadKey), audit: [] };
  testLocation.origin='https://example.com';
  const restoredSpread = await api.importArchive(JSON.parse(JSON.stringify(spreadBackup)));
  assert.equal(restoredSpread.verification, null);
  assert.equal(store[prefix+'account:'+spreadKey].verification.status,'pending');
  assert.throws(() => api.validateArchive({ ...spreadBackup, accounts: [{ ...spreadBackup.accounts[0], source: 'trade-nation-cfd' }] }), /account/);
  assert.throws(() => api.validateArchive({ ...spreadBackup, accounts: [{ ...spreadBackup.accounts[0], baseCurrency: 'GBP' }] }), /USD/);
  console.log('PASS: Spread endpoint and payload, USD identity guards, separate CFD and Spread archives with equal account IDs and references, incremental deduplication and combined backup validation.');
  console.log('PASS: automatic whole-export checks, historical differences, failed-check status, persistent changes and notifications.');
  console.log('PASS: real import flow, explicit first-pull period, no redundant record writes, partial failures, coverage gaps, resumable JSON import and round-trip backup.');
}
checkImports().catch(error => { console.error(error); process.exitCode = 1; });
