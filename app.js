'use strict';

// \u2500\u2500 SEED PROFILES \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const FEE_DEFAULTS = { cgtPct: 6, dstPct: 1.5, transferTaxPct: 0.75, regFeePct: 0.35, notarialPct: 1, bankFeesPct: 1.5, renovationCost: 0, cgtBasis: 'higher', dstBasis: 'higher', transferTaxBasis: 'higher', regFeeBasis: 'higher', notarialBasis: 'higher', bankFeesBasis: 'loan' };

const SEED_PROFILES = [
  {
    id: 'pine-crest', name: 'Pine Crest',
    purchasePrice: 4615000, unitSize: 59.93, birValuePerSqm: 138000,
    loanAmount: 4000000, condoDues: 6800, interestRate: 4, loanTerm: 25,
    monthlyIncome: 60000, salaryGrowth: 5, monthlyRent: 25000, emergencyFund: '', condoInflation: 5,
    ...FEE_DEFAULTS
  },
  {
    id: 'smdc-wind', name: 'SMDC Wind Residences',
    purchasePrice: 3800000, unitSize: 45.50, birValuePerSqm: 125000,
    loanAmount: 3200000, condoDues: 5500, interestRate: 4, loanTerm: 25,
    monthlyIncome: 60000, salaryGrowth: 5, monthlyRent: 20000, emergencyFund: '', condoInflation: 5,
    ...FEE_DEFAULTS
  },
  {
    id: 'alveo-flexi', name: 'Alveo Flexi Series',
    purchasePrice: 7200000, unitSize: 75.00, birValuePerSqm: 155000,
    loanAmount: 6000000, condoDues: 9500, interestRate: 4, loanTerm: 25,
    monthlyIncome: 90000, salaryGrowth: 5, monthlyRent: 32000, emergencyFund: '', condoInflation: 5,
    ...FEE_DEFAULTS
  }
];

const DEFAULTS = SEED_PROFILES[0];

// \u2500\u2500 PROFILE MANAGER \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const STORAGE_KEY = 'condoAnalyzerProfiles_v1';
const ACTIVE_KEY  = 'condoAnalyzerActive_v1';

function loadProfiles() {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : JSON.parse(JSON.stringify(SEED_PROFILES)); }
  catch { return JSON.parse(JSON.stringify(SEED_PROFILES)); }
}
function saveProfiles(p) { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); }
function getActiveId()   { return localStorage.getItem(ACTIVE_KEY) || SEED_PROFILES[0].id; }
function setActiveId(id) { localStorage.setItem(ACTIVE_KEY, id); }
function uid()           { return 'p-' + Date.now().toString(36); }

let profiles = loadProfiles();
let activeId = getActiveId();

function ensureActiveId() {
  if (!profiles.find(p => p.id === activeId)) { activeId = profiles[0].id; setActiveId(activeId); }
}
function getActiveProfile() { ensureActiveId(); return profiles.find(p => p.id === activeId); }

function renderProfileTabs() {
  const container = document.getElementById('profileTabs');
  container.innerHTML = profiles.map(p =>
    `<button class="profile-tab ${p.id === activeId ? 'active' : ''}" data-pid="${p.id}">${p.name}</button>`
  ).join('');
  container.querySelectorAll('.profile-tab').forEach(btn =>
    btn.addEventListener('click', () => switchProfile(btn.dataset.pid))
  );
  const active = getActiveProfile();
  if (active) {
    document.getElementById('profileName').value = active.name;
    document.getElementById('headerSubtitle').textContent = 'Philippines \u00b7 ' + active.name;
  }
}

function switchProfile(id) {
  saveCurrentToProfile();
  activeId = id; setActiveId(id);
  loadProfileIntoInputs(getActiveProfile());
  renderProfileTabs(); runAnalysis();
  showToast('Switched to ' + getActiveProfile().name);
}

function saveCurrentToProfile() {
  const inp = getInputs();
  const name = document.getElementById('profileName').value.trim() || 'Untitled';
  const idx = profiles.findIndex(p => p.id === activeId);
  if (idx !== -1) { profiles[idx] = { ...profiles[idx], ...inp, name }; saveProfiles(profiles); }
}

function loadProfileIntoInputs(profile) {
  const fields = ['purchasePrice','unitSize','birValuePerSqm','loanAmount','condoDues',
    'interestRate','loanTerm','monthlyIncome','salaryGrowth','monthlyRent','emergencyFund','condoInflation',
    'cgtPct','dstPct','transferTaxPct','regFeePct','notarialPct','bankFeesPct','renovationCost',
    'cgtBasis','dstBasis','transferTaxBasis','regFeeBasis','notarialBasis','bankFeesBasis'];
  fields.forEach(k => { const el = document.getElementById(k); if (el) el.value = (profile[k] !== undefined ? profile[k] : ''); });
  ['interestRate','salaryGrowth','condoInflation'].forEach(k => {
    const sl = document.getElementById(k + 'Slider'); if (sl) sl.value = profile[k] || 0;
  });
  // Fill missing fee defaults for older saved profiles
  Object.keys(FEE_DEFAULTS).forEach(k => {
    const el = document.getElementById(k);
    if (el && (profile[k] === undefined || profile[k] === '')) el.value = FEE_DEFAULTS[k];
  });
  document.getElementById('profileName').value = profile.name;
  document.getElementById('headerSubtitle').textContent = 'Philippines \u00b7 ' + profile.name;
}

function createProfile(name, data) {
  const newP = { ...data, id: uid(), name: name || 'New Profile' };
  profiles.push(newP); saveProfiles(profiles);
  activeId = newP.id; setActiveId(activeId);
  loadProfileIntoInputs(newP); renderProfileTabs(); runAnalysis();
  showToast('\u2795 Created: ' + newP.name);
}

function deleteActiveProfile() {
  if (profiles.length <= 1) { showToast('\u26a0\ufe0f Cannot delete the only profile'); return; }
  const name = getActiveProfile().name;
  profiles = profiles.filter(p => p.id !== activeId);
  saveProfiles(profiles); activeId = profiles[0].id; setActiveId(activeId);
  loadProfileIntoInputs(getActiveProfile()); renderProfileTabs(); runAnalysis();
  showToast('\ud83d\uddd1 Deleted: ' + name);
}


// ── SHARE / URL IMPORT ────────────────────────────────────
const SHARE_FIELDS = [
  'name','purchasePrice','unitSize','birValuePerSqm','loanAmount','condoDues',
  'interestRate','loanTerm','monthlyIncome','salaryGrowth','monthlyRent',
  'emergencyFund','condoInflation','cgtPct','dstPct','transferTaxPct',
  'regFeePct','notarialPct','bankFeesPct','renovationCost',
  'cgtBasis','dstBasis','transferTaxBasis','regFeeBasis','notarialBasis','bankFeesBasis'
];

function encodeProfiles(profilesArr, active) {
  const slimProfiles = profilesArr.map(profile => {
    const slim = { id: profile.id };
    SHARE_FIELDS.forEach(k => { if (profile[k] !== undefined) slim[k] = profile[k]; });
    return slim;
  });
  const data = { profiles: slimProfiles, activeId: active };
  return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}

function decodeData(str) {
  try { return JSON.parse(decodeURIComponent(escape(atob(str)))); }
  catch { return null; }
}

function shareAllProfiles() {
  saveCurrentToProfile();
  const encoded = encodeProfiles(profiles, activeId);
  const url = location.origin + location.pathname + '?d=' + encoded;

  const doCopy = () => {
    navigator.clipboard.writeText(url)
      .then(() => showToast('🔗 All profiles link copied!'))
      .catch(() => {
        const ta = document.createElement('textarea');
        ta.value = url;
        Object.assign(ta.style, { position:'fixed', top:'-9999px', opacity:'0' });
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('🔗 All profiles link copied!');
      });
  };
  doCopy();
}

function loadFromUrl() {
  const params = new URLSearchParams(location.search);
  const d = params.get('d');
  const p = params.get('p'); // legacy

  if (!d && !p) return false;

  if (d) {
    const data = decodeData(d);
    if (!data || !Array.isArray(data.profiles)) { showToast('⚠️ Invalid share link'); return false; }

    data.profiles.forEach(imported => {
      const existing = profiles.find(pr => pr.id === imported.id || pr.name === imported.name);
      if (existing) {
        const idx = profiles.indexOf(existing);
        profiles[idx] = { ...existing, ...imported };
      } else {
        profiles.push({ ...FEE_DEFAULTS, ...imported, id: imported.id || uid() });
      }
    });
    if (data.activeId && profiles.find(pr => pr.id === data.activeId)) {
      activeId = data.activeId;
    } else if (data.profiles.length > 0) {
      activeId = profiles.find(pr => pr.id === data.profiles[0].id)?.id || activeId;
    }
    saveProfiles(profiles);
    setActiveId(activeId);
    loadProfileIntoInputs(getActiveProfile());
    history.replaceState(null, '', location.pathname); // clean URL
    showToast(`📥 Loaded ${data.profiles.length} shared profiles`);
    return true;
  }

  // Legacy single profile import
  if (p) {
    const data = decodeData(p);
    if (!data) { showToast('⚠️ Invalid share link'); return false; }
    const existing = profiles.find(pr => pr.name === data.name);
    if (existing) {
      const idx = profiles.indexOf(existing);
      profiles[idx] = { ...existing, ...data };
      saveProfiles(profiles);
      activeId = existing.id;
    } else {
      const newP = { ...FEE_DEFAULTS, ...data, id: uid() };
      profiles.push(newP);
      saveProfiles(profiles);
      activeId = newP.id;
    }
    setActiveId(activeId);
    loadProfileIntoInputs(getActiveProfile());
    history.replaceState(null, '', location.pathname); // clean URL
    showToast('📥 Loaded shared profile: ' + (data.name || 'Profile'));
    return true;
  }
}

// ── CHARTS (singleton refs) ────────────────────────────────
let incomeExpChart, pieChart, buyvrentChart;

// ── HELPERS ───────────────────────────────────────────────
const peso = v => '₱' + Number(v).toLocaleString('en-PH', { maximumFractionDigits: 0 });
const pct  = v => v.toFixed(1) + '%';

function pmt(rate, nper, pv) {
  if (rate === 0) return pv / nper;
  const r = rate / 12 / 100;
  return pv * r * Math.pow(1 + r, nper) / (Math.pow(1 + r, nper) - 1);
}

function getInputs() {
  const g = id => parseFloat(document.getElementById(id).value) || 0;
  return {
    purchasePrice:  g('purchasePrice'),
    unitSize:       g('unitSize'),
    birValuePerSqm: g('birValuePerSqm'),
    loanAmount:     g('loanAmount'),
    condoDues:      g('condoDues'),
    interestRate:   g('interestRate'),
    loanTerm:       g('loanTerm'),
    monthlyIncome:  g('monthlyIncome'),
    salaryGrowth:   g('salaryGrowth'),
    monthlyRent:    g('monthlyRent'),
    emergencyFund:  g('emergencyFund'),
    condoInflation: g('condoInflation'),
    // Parameterized fees
    cgtPct:         g('cgtPct')         || 6,
    dstPct:         g('dstPct')         || 1.5,
    transferTaxPct: g('transferTaxPct') || 0.75,
    regFeePct:      g('regFeePct')      || 0.35,
    notarialPct:    g('notarialPct')    || 1,
    bankFeesPct:    g('bankFeesPct')    || 1.5,
    renovationCost: g('renovationCost'),
    cgtBasis:         document.getElementById('cgtBasis')?.value || 'higher',
    dstBasis:         document.getElementById('dstBasis')?.value || 'higher',
    transferTaxBasis: document.getElementById('transferTaxBasis')?.value || 'higher',
    regFeeBasis:      document.getElementById('regFeeBasis')?.value || 'higher',
    notarialBasis:    document.getElementById('notarialBasis')?.value || 'higher',
    bankFeesBasis:    document.getElementById('bankFeesBasis')?.value || 'loan'
  };
}

// ── MAIN CALCULATION ──────────────────────────────────────
function calculate(inp) {
  const months = inp.loanTerm * 12;
  const monthlyAmt = pmt(inp.interestRate, months, inp.loanAmount);
  const totalLoanCost = monthlyAmt * months;
  const totalInterest = totalLoanCost - inp.loanAmount;
  const totalMonthly = monthlyAmt + inp.condoDues;
  const remaining = inp.monthlyIncome - totalMonthly;
  const dti = (totalMonthly / inp.monthlyIncome) * 100;

  // Upfront — parameterized fees
  const downPayment   = Math.max(0, inp.purchasePrice - inp.loanAmount);
  const birValue      = inp.birValuePerSqm * inp.unitSize;
  const higherValue   = Math.max(inp.purchasePrice, birValue);
  
  const getBase = (basis) => {
    if (basis === 'higher') return higherValue;
    if (basis === 'bir') return birValue;
    if (basis === 'loan') return inp.loanAmount;
    return inp.purchasePrice;
  };

  const cgtTotal      = (inp.cgtPct / 100) * getBase(inp.cgtBasis);
  const sellerCGT     = (inp.cgtPct / 100) * inp.purchasePrice;
  const cgtShortfall  = Math.max(0, cgtTotal - sellerCGT);
  const dst           = (inp.dstPct / 100) * getBase(inp.dstBasis);
  const transferTax   = (inp.transferTaxPct / 100) * getBase(inp.transferTaxBasis);
  const regFee        = (inp.regFeePct / 100) * getBase(inp.regFeeBasis);
  const notarial      = (inp.notarialPct / 100) * getBase(inp.notarialBasis);
  const bankFees      = (inp.bankFeesPct / 100) * getBase(inp.bankFeesBasis);
  const renovation    = inp.renovationCost || 0;
  const totalUpfront  = cgtShortfall + dst + transferTax + regFee + notarial + bankFees;
  const grandTotal    = downPayment + totalUpfront + renovation;

  // 25-yr buy vs rent
  const termYrs = inp.loanTerm;
  let totalBuy = 0, totalRent = 0;
  let rentMonth = inp.monthlyRent;
  let duesMonth = inp.condoDues;
  for (let y = 0; y < termYrs; y++) {
    totalBuy  += (monthlyAmt + duesMonth) * 12;
    totalRent += rentMonth * 12;
    duesMonth *= (1 + inp.condoInflation / 100);
    rentMonth *= 1.05;
  }
  const buyvrentDiff = totalBuy - totalRent;

  // Stress
  const stressScenarios = [4, 7, 9].map(r => {
    const m = pmt(r, months, inp.loanAmount);
    const tc = m + inp.condoDues;
    const d = (tc / inp.monthlyIncome) * 100;
    const sc = scoreEngine({ ...inp, interestRate: r }, m, d, totalUpfront);
    return { rate: r, monthly: m, total: tc, dti: d, score: sc };
  });

  // Risk score
  const score = scoreEngine(inp, monthlyAmt, dti, totalUpfront);

  return {
    monthlyAmt, totalLoanCost, totalInterest, totalMonthly,
    remaining, dti, downPayment, birValue, sellerCGT, cgtShortfall,
    dst, transferTax, regFee, notarial, bankFees, renovation, totalUpfront, grandTotal,
    totalBuy, totalRent, buyvrentDiff, stressScenarios, score
  };
}

// ── RISK SCORING ──────────────────────────────────────────
function scoreEngine(inp, monthlyAmt, dti, totalUpfront) {
  const items = [];

  // 1. DTI (max 3)
  let dtiScore = dti < 30 ? 3 : dti < 40 ? 2 : dti < 50 ? 1 : 0;
  items.push({ label: 'Debt-to-Income Ratio (' + pct(dti) + ')', score: dtiScore, max: 3, note: dti < 30 ? 'Comfortable' : dti < 40 ? 'Manageable' : dti < 50 ? 'High pressure' : 'Critical' });

  // 2. Upfront burden (max 2)
  const upfrontRatio = totalUpfront / (inp.monthlyIncome * 12);
  const upfrontScore = upfrontRatio < 0.5 ? 2 : upfrontRatio < 1 ? 1 : 0;
  items.push({ label: 'Upfront Cash Burden (' + peso(totalUpfront) + ')', score: upfrontScore, max: 2, note: upfrontScore === 2 ? 'Low' : upfrontScore === 1 ? 'Moderate' : 'Heavy' });

  // 3. Interest sensitivity (max 2)
  const mHigh = pmt(9, inp.loanTerm * 12, inp.loanAmount);
  const dtiHigh = ((mHigh + inp.condoDues) / inp.monthlyIncome) * 100;
  const intScore = dtiHigh < 50 ? 2 : dtiHigh < 65 ? 1 : 0;
  items.push({ label: 'Interest Rate Shock (@ 9%)', score: intScore, max: 2, note: 'DTI @ 9%: ' + pct(dtiHigh) });

  // 4. Condo inflation risk (max 2)
  const inflScore = inp.condoInflation <= 3 ? 2 : inp.condoInflation <= 6 ? 1 : 0;
  items.push({ label: 'Condo Dues Inflation (' + pct(inp.condoInflation) + '/yr)', score: inflScore, max: 2, note: inflScore === 2 ? 'Low risk' : inflScore === 1 ? 'Moderate' : 'High risk' });

  // 5. Cash buffer (max 3)
  const ef = inp.emergencyFund || 0;
  const efMonths = ef / inp.monthlyIncome;
  const bufScore = efMonths >= 6 ? 3 : efMonths >= 3 ? 2 : efMonths >= 1 ? 1 : 0;
  items.push({ label: 'Emergency Fund Buffer', score: bufScore, max: 3, note: ef === 0 ? 'Not provided' : efMonths.toFixed(1) + ' months of income' });

  const total = items.reduce((s, i) => s + i.score, 0);
  return { total, max: 12, items };
}

function verdictFromScore(score) {
  if (score >= 10) return { text: '🟢 SAFE BUY', cls: 'green', badge: 'Safe Buy' };
  if (score >= 7)  return { text: '🟡 CAUTION BUY', cls: 'yellow', badge: 'Caution' };
  return { text: '🔴 HIGH RISK / AVOID', cls: 'red', badge: 'High Risk' };
}

// ── RENDER ────────────────────────────────────────────────
function render(inp, r) {
  const v = verdictFromScore(r.score.total);

  // Header badge
  const badge = document.getElementById('riskBadge');
  badge.querySelector('.badge-dot').className = 'badge-dot ' + v.cls;
  badge.querySelector('.badge-text').textContent = v.badge + ' · ' + r.score.total + '/12';

  // Gauge
  drawGauge(r.score.total);
  document.getElementById('gaugeScore').textContent = r.score.total;
  const gl = document.getElementById('gaugeLabel');
  gl.textContent = v.badge;
  gl.className = 'gauge-label ' + v.cls;

  // Verdict
  const dv = document.getElementById('decisionVerdict');
  dv.textContent = v.text;
  dv.className = 'decision-verdict ' + v.cls;
  document.getElementById('decisionSub').textContent =
    'Risk Score: ' + r.score.total + '/12  ·  DTI: ' + pct(r.dti) + '  ·  Monthly Cost: ' + peso(r.totalMonthly);

  // Metric cards
  document.getElementById('metMonthlyAmt').textContent = peso(r.monthlyAmt);
  const tm = document.getElementById('metTotalMonthly');
  tm.textContent = peso(r.totalMonthly);
  tm.className = 'metric-value ' + (r.dti > 50 ? 'danger' : r.dti > 35 ? '' : 'safe');
  const rem = document.getElementById('metRemaining');
  rem.textContent = peso(r.remaining);
  rem.className = 'metric-value ' + (r.remaining < 10000 ? 'danger' : r.remaining < 20000 ? '' : 'safe');
  document.getElementById('metDTI').textContent = pct(r.dti);
  const dtiBar = document.getElementById('dtiBar');
  dtiBar.style.width = Math.min(r.dti, 100) + '%';
  dtiBar.className = 'dti-bar ' + (r.dti > 50 ? 'danger' : r.dti > 35 ? 'warn' : '');

  // Upfront grid
  const getBasisLabel = (basis) => {
    if (basis === 'higher') return inp.purchasePrice >= r.birValue ? 'price (higher)' : 'BIR value (higher)';
    if (basis === 'bir') return 'BIR value';
    if (basis === 'loan') return 'loan amount';
    return 'price';
  };

  const upfrontItems = [
    { label: '⬇️ Down Payment', value: peso(r.downPayment), note: 'Purchase price − Loan amount', cls: 'upfront-down' },
    { label: 'BIR / Taxable Value', value: peso(r.birValue), note: inp.birValuePerSqm.toLocaleString() + ' × ' + inp.unitSize + ' sqm' },
    { label: `Seller's CGT (${inp.cgtPct}%)`, value: peso(r.sellerCGT), note: inp.cgtPct + '% of purchase price' },
    { label: 'CGT Shortfall (Buyer)', value: peso(r.cgtShortfall), note: 'Total CGT minus seller CGT' },
    { label: `DST (${inp.dstPct}%)`, value: peso(r.dst), note: inp.dstPct + '% of ' + getBasisLabel(inp.dstBasis) },
    { label: `Transfer Tax (${inp.transferTaxPct}%)`, value: peso(r.transferTax), note: inp.transferTaxPct + '% of ' + getBasisLabel(inp.transferTaxBasis) },
    { label: `Registration (${inp.regFeePct}%)`, value: peso(r.regFee), note: inp.regFeePct + '% of ' + getBasisLabel(inp.regFeeBasis) },
    { label: `Notarial (${inp.notarialPct}%)`, value: peso(r.notarial), note: inp.notarialPct + '% of ' + getBasisLabel(inp.notarialBasis) },
    { label: `Bank Fees & Ins. (${inp.bankFeesPct}%)`, value: peso(r.bankFees), note: inp.bankFeesPct + '% of ' + getBasisLabel(inp.bankFeesBasis) },
    { label: '🔨 Renovation Budget', value: peso(r.renovation), note: r.renovation > 0 ? 'Fit-out / improvements' : 'Not set', cls: r.renovation > 0 ? 'upfront-reno' : 'upfront-dim' },
    { label: '💸 Closing Fees Subtotal', value: peso(r.totalUpfront), note: 'CGT shortfall + taxes + fees', cls: 'upfront-total' },
    { label: '🏦 Grand Total Cash Needed', value: peso(r.grandTotal), note: 'Down pmt + closing fees + renovation', cls: 'upfront-grand' }
  ];
  document.getElementById('upfrontGrid').innerHTML = upfrontItems.map(i =>
    `<div class="upfront-item ${i.cls||''}">
      <div class="upfront-item-label">${i.label}</div>
      <div class="upfront-item-value">${i.value}</div>
      <div class="upfront-item-note">${i.note}</div>
    </div>`).join('');

  // Loan summary
  document.getElementById('loanGrid').innerHTML = [
    { label: 'Loan Amount', value: peso(inp.loanAmount) },
    { label: 'Interest Rate', value: pct(inp.interestRate) },
    { label: 'Loan Term', value: inp.loanTerm + ' years' },
    { label: 'Monthly Amortization', value: peso(r.monthlyAmt) },
    { label: 'Total Loan Cost', value: peso(r.totalLoanCost) },
    { label: 'Total Interest Paid', value: peso(r.totalInterest) },
    { label: 'Price per sqm', value: peso(inp.purchasePrice / inp.unitSize) },
    { label: 'BIR Value (total)', value: peso(r.birValue) }
  ].map(i => `<div class="loan-item"><div class="loan-item-label">${i.label}</div><div class="loan-item-value">${i.value}</div></div>`).join('');

  // Buy vs Rent summary
  const diff = r.buyvrentDiff;
  document.getElementById('buyvrentSummary').innerHTML = [
    { label: inp.loanTerm + '-Yr Rent Total', value: peso(r.totalRent), color: '#22c55e' },
    { label: inp.loanTerm + '-Yr Buy Total', value: peso(r.totalBuy), color: '#f43f5e' },
    { label: diff > 0 ? 'Extra Cost of Buying' : 'Savings from Buying', value: peso(Math.abs(diff)), color: diff > 0 ? '#f43f5e' : '#22c55e' }
  ].map(i => `<div class="bvr-stat"><div class="bvr-stat-label">${i.label}</div><div class="bvr-stat-value" style="color:${i.color}">${i.value}</div></div>`).join('');

  // Stress table
  document.getElementById('stressBody').innerHTML = r.stressScenarios.map((s, i) => {
    const sv = verdictFromScore(s.score.total);
    return `<tr class="${i === 0 ? 'base-row' : ''}">
      <td>${i === 0 ? '✅ Base Case' : i === 1 ? '⚠️ Rate Shock' : '🔴 Severe Shock'}</td>
      <td>${pct(s.rate)}</td>
      <td>${peso(s.total)}</td>
      <td>${pct(s.dti)}</td>
      <td><strong>${s.score.total}/12</strong></td>
      <td><span class="verdict-pill ${sv.cls}">${sv.badge}</span></td>
    </tr>`;
  }).join('');

  // Risk breakdown
  document.getElementById('riskBreakdown').innerHTML = r.score.items.map(it => {
    const color = it.score === it.max ? '#22c55e' : it.score > 0 ? '#facc15' : '#f43f5e';
    const w = (it.score / it.max * 100) + '%';
    return `<div class="risk-item">
      <div class="risk-item-label">${it.label}<br><small style="color:var(--text-dim)">${it.note}</small></div>
      <div class="risk-bar-outer"><div class="risk-bar-inner" style="width:${w};background:${color}"></div></div>
      <div class="risk-item-score" style="color:${color}">${it.score}/${it.max}</div>
    </div>`;
  }).join('');

  renderCharts(inp, r);
}

// ── CHARTS ────────────────────────────────────────────────
const CHART_OPTS = {
  responsive: true,
  plugins: { legend: { labels: { color: '#94a3b8', font: { family: 'Inter' } } } }
};

function mkChart(id, cfg) {
  const canvas = document.getElementById(id);
  return new Chart(canvas.getContext('2d'), cfg);
}

function renderCharts(inp, r) {
  // Income vs Expenses bar
  if (incomeExpChart) incomeExpChart.destroy();
  incomeExpChart = mkChart('incomeExpChart', {
    type: 'bar',
    data: {
      labels: ['Monthly Net Income', 'Loan Payment', 'Condo Dues', 'Total Housing', 'Remaining'],
      datasets: [{
        data: [inp.monthlyIncome, r.monthlyAmt, inp.condoDues, r.totalMonthly, r.remaining],
        backgroundColor: ['#6c63ff','#f43f5e','#fb923c','#facc15','#22c55e'],
        borderRadius: 6
      }]
    },
    options: {
      ...CHART_OPTS,
      plugins: { ...CHART_OPTS.plugins, legend: { display: false } },
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#94a3b8', callback: v => '₱' + (v/1000).toFixed(0) + 'k' }, grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    }
  });

  // Pie chart
  if (pieChart) pieChart.destroy();
  pieChart = mkChart('pieChart', {
    type: 'doughnut',
    data: {
      labels: ['Loan Amortization', 'Condo Dues', 'Remaining Income'],
      datasets: [{
        data: [r.monthlyAmt, inp.condoDues, Math.max(0, r.remaining)],
        backgroundColor: ['#6c63ff','#fb923c','#22c55e'],
        borderWidth: 2, borderColor: '#131627'
      }]
    },
    options: { ...CHART_OPTS, cutout: '65%' }
  });

  // Buy vs Rent line
  if (buyvrentChart) buyvrentChart.destroy();
  const years = Array.from({ length: inp.loanTerm + 1 }, (_, i) => 'Yr ' + i);
  let cumBuy = 0, cumRent = 0, buyArr = [0], rentArr = [0];
  let rentM = inp.monthlyRent, duesM = inp.condoDues;
  for (let y = 0; y < inp.loanTerm; y++) {
    cumBuy  += (r.monthlyAmt + duesM) * 12;
    cumRent += rentM * 12;
    buyArr.push(cumBuy); rentArr.push(cumRent);
    duesM *= (1 + inp.condoInflation / 100);
    rentM *= 1.05;
  }
  buyvrentChart = mkChart('buyvrentChart', {
    type: 'line',
    data: {
      labels: years,
      datasets: [
        { label: 'Buying', data: buyArr, borderColor: '#f43f5e', backgroundColor: 'rgba(244,63,94,0.1)', fill: true, tension: 0.4, pointRadius: 0 },
        { label: 'Renting', data: rentArr, borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)', fill: true, tension: 0.4, pointRadius: 0 }
      ]
    },
    options: {
      ...CHART_OPTS,
      scales: {
        x: { ticks: { color: '#94a3b8', maxTicksLimit: 10 }, grid: { color: 'rgba(255,255,255,0.04)' } },
        y: { ticks: { color: '#94a3b8', callback: v => '₱' + (v/1e6).toFixed(1) + 'M' }, grid: { color: 'rgba(255,255,255,0.04)' } }
      }
    }
  });
}

// ── GAUGE CANVAS ──────────────────────────────────────────
function drawGauge(score) {
  const canvas = document.getElementById('gaugeCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const cx = W / 2, cy = H - 20, r = Math.min(W, H * 1.8) / 2 - 10;
  const startA = Math.PI, endA = 2 * Math.PI;
  // track
  ctx.beginPath(); ctx.arc(cx, cy, r, startA, endA);
  ctx.lineWidth = 18; ctx.strokeStyle = '#1a1e35'; ctx.stroke();
  // zones
  const zones = [
    { from: 0, to: 6/12, color: '#f43f5e' },
    { from: 6/12, to: 9/12, color: '#facc15' },
    { from: 9/12, to: 1, color: '#22c55e' }
  ];
  zones.forEach(z => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, startA + z.from * Math.PI, startA + z.to * Math.PI);
    ctx.lineWidth = 18; ctx.strokeStyle = z.color; ctx.stroke();
  });
  // needle
  const ang = startA + (score / 12) * Math.PI;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + (r - 22) * Math.cos(ang), cy + (r - 22) * Math.sin(ang));
  ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.lineCap = 'round'; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#fff'; ctx.fill();
}

// ── AI EXPLAIN ────────────────────────────────────────────
function buildExplain(inp, r) {
  const v = verdictFromScore(r.score.total);
  const safe = r.score.total >= 10, caution = r.score.total >= 7;
  return `
    <h3>🏢 Property Overview</h3>
    <p>You are analyzing <span class="highlight">Pine Crest by Vista Residences</span> at <span class="highlight">${peso(inp.purchasePrice)}</span> (${inp.unitSize} sqm @ ₱${Math.round(inp.purchasePrice/inp.unitSize).toLocaleString()}/sqm).</p>
    <h3>📊 Financial Snapshot</h3>
    <p>With a <span class="highlight">${pct(inp.interestRate)}</span> fixed rate over <span class="highlight">${inp.loanTerm} years</span>, your monthly loan payment is <span class="highlight">${peso(r.monthlyAmt)}</span>. Adding condo dues, total housing cost is <span class="highlight">${peso(r.totalMonthly)}</span> — <span class="${r.dti > 50 ? 'danger-text' : r.dti > 35 ? 'warn-text' : 'safe-text'}">${pct(r.dti)} of your ₱${inp.monthlyIncome.toLocaleString()} income</span>.</p>
    <h3>💸 Upfront Cash</h3>
    <p>Beyond the down payment, you will need approximately <span class="highlight">${peso(r.totalUpfront)}</span> to cover CGT shortfall, DST, transfer taxes, registration, notarial, and bank fees. The BIR-assessed value of <span class="highlight">${peso(r.birValue)}</span> is significantly higher than the purchase price — a key driver of the CGT shortfall.</p>
    <h3>🏠 Buy vs. Rent Over ${inp.loanTerm} Years</h3>
    <p>Total buying cost: <span class="highlight danger-text">${peso(r.totalBuy)}</span>. Total renting cost: <span class="highlight safe-text">${peso(r.totalRent)}</span>. ${r.buyvrentDiff > 0 ? `Buying costs <span class="danger-text">${peso(r.buyvrentDiff)} more</span> over ${inp.loanTerm} years, but you gain equity and property appreciation.` : `Buying saves you <span class="safe-text">${peso(Math.abs(r.buyvrentDiff))}</span> over ${inp.loanTerm} years.`}</p>
    <h3>⚡ Rate Shock Risk</h3>
    <p>If interest rates rise to <span class="warn-text">9%</span>, your monthly amortization jumps to <span class="warn-text">${peso(pmt(9, inp.loanTerm*12, inp.loanAmount))}</span>, pushing DTI to <span class="warn-text">${pct(((pmt(9, inp.loanTerm*12, inp.loanAmount)+inp.condoDues)/inp.monthlyIncome)*100)}</span>.</p>
    <h3>🎯 Verdict: ${v.text}</h3>
    <p>Risk score of <strong>${r.score.total}/12</strong>. ${safe ? '<span class="safe-text">Your financial profile can comfortably support this purchase.</span>' : caution ? '<span class="warn-text">Proceed with caution. Build emergency fund, negotiate lower rate, or consider a higher down payment.</span>' : '<span class="danger-text">This purchase poses significant financial risk. Consider renting, saving more, or waiting for a lower rate environment.</span>'}</p>
    <p style="margin-top:16px;font-size:0.75rem;color:var(--text-dim)">⚠️ This is a financial model for educational purposes. Consult a licensed financial advisor before making real estate decisions.</p>`;
}

// ── EVENT WIRING ──────────────────────────────────────────
function syncSlider(sliderId, inputId) {
  const slider = document.getElementById(sliderId);
  const input  = document.getElementById(inputId);
  slider.addEventListener('input', () => { input.value = slider.value; runAnalysis(); });
  input.addEventListener('input',  () => { slider.value = input.value; runAnalysis(); });
}

function runAnalysis() {
  const inp = getInputs();
  const r = calculate(inp);
  render(inp, r);
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function resetDefaults() {
  const active = getActiveProfile();
  const seed = SEED_PROFILES.find(s => s.id === active.id) || SEED_PROFILES[0];
  loadProfileIntoInputs(seed);
  showToast('↺ Reset to ' + seed.name + ' defaults');
  runAnalysis();
}

document.addEventListener('DOMContentLoaded', () => {
  // Init profiles — load from share URL first, then normal flow
  ensureActiveId();
  const loadedFromUrl = loadFromUrl();
  if (!loadedFromUrl) loadProfileIntoInputs(getActiveProfile());
  renderProfileTabs();

  syncSlider('interestRateSlider', 'interestRate');
  syncSlider('salaryGrowthSlider', 'salaryGrowth');
  syncSlider('condoInflationSlider', 'condoInflation');

  // live update all non-slider inputs and selects
  document.querySelectorAll('input, select').forEach(el => {
    if (!el.classList.contains('slider') && el.id !== 'interestRate' && el.id !== 'salaryGrowth' && el.id !== 'condoInflation') {
      el.addEventListener('input', runAnalysis);
      if (el.tagName === 'SELECT') {
        el.addEventListener('change', runAnalysis);
      }
    }
  });

  // Profile name inline edit
  document.getElementById('profileName').addEventListener('input', e => {
    const idx = profiles.findIndex(p => p.id === activeId);
    if (idx !== -1) {
      profiles[idx].name = e.target.value;
      saveProfiles(profiles);
      renderProfileTabs();
      document.getElementById('headerSubtitle').textContent = 'Philippines · ' + (e.target.value || 'Untitled');
    }
  });

  // Share button
  document.getElementById('shareProfileBtn').addEventListener('click', shareAllProfiles);

  // Save button
  document.getElementById('saveProfileBtn').addEventListener('click', () => {
    saveCurrentToProfile();
    renderProfileTabs();
    showToast('💾 Profile saved!');
  });

  // Delete button
  document.getElementById('deleteProfileBtn').addEventListener('click', deleteActiveProfile);

  // New profile button → open modal
  document.getElementById('newProfileBtn').addEventListener('click', () => {
    document.getElementById('newProfileName').value = '';
    document.getElementById('newProfileModal').classList.add('open');
  });
  document.getElementById('newProfileClose').addEventListener('click', () => document.getElementById('newProfileModal').classList.remove('open'));
  document.getElementById('newProfileModal').addEventListener('click', e => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
  });

  // New blank profile
  document.getElementById('newBlankBtn').addEventListener('click', () => {
    const name = document.getElementById('newProfileName').value.trim() || 'New Profile';
    document.getElementById('newProfileModal').classList.remove('open');
    const blank = { purchasePrice:0,unitSize:0,birValuePerSqm:138000,loanAmount:0,condoDues:0,
      interestRate:4,loanTerm:25,monthlyIncome:60000,salaryGrowth:5,monthlyRent:0,emergencyFund:'',condoInflation:5 };
    createProfile(name, blank);
  });

  // Copy current profile
  document.getElementById('newCopyBtn').addEventListener('click', () => {
    const name = document.getElementById('newProfileName').value.trim() ||
      (getActiveProfile().name + ' (Copy)');
    document.getElementById('newProfileModal').classList.remove('open');
    saveCurrentToProfile();
    createProfile(name, { ...getActiveProfile() });
  });

  // Rate presets
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const rate = parseFloat(btn.dataset.rate);
      document.getElementById('interestRate').value = rate;
      document.getElementById('interestRateSlider').value = rate;
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      runAnalysis();
    });
  });
  document.getElementById('preset4').classList.add('active');

  document.getElementById('resetBtn').addEventListener('click', resetDefaults);
  document.getElementById('analyzeBtn').addEventListener('click', () => { runAnalysis(); showToast('Analysis updated!'); });

  // Explain modal
  document.getElementById('explainBtn').addEventListener('click', () => {
    const inp = getInputs(), r = calculate(inp);
    document.getElementById('modalBody').innerHTML = buildExplain(inp, r);
    document.getElementById('explainModal').classList.add('open');
  });
  document.getElementById('modalClose').addEventListener('click', () => document.getElementById('explainModal').classList.remove('open'));
  document.getElementById('explainModal').addEventListener('click', e => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
  });

  runAnalysis();
});
