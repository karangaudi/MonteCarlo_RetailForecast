/* app.js: Monte Carlo simulation and UI wiring */
(function () {
  const avgSlider = document.getElementById('avgSlider');
  const sdSlider = document.getElementById('sdSlider');
  const targetInput = document.getElementById('targetInput');
  const runBtn = document.getElementById('runBtn');

  const avgValue = document.getElementById('avgValue');
  const sdValue = document.getElementById('sdValue');

  const probText = document.getElementById('probText');
  const ci90 = document.getElementById('ci90');
  const ci50 = document.getElementById('ci50');
  const riskBadge = document.getElementById('riskBadge');
  const summaryText = document.getElementById('summaryText');
  const recoText = document.getElementById('recoText');

  const histDiv = document.getElementById('hist');

  const fmtGBP0 = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });

  function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }

  // Box-Muller transform for standard normal
  function randn() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  function normalSample(mean, sd) {
    return mean + sd * randn();
  }

  function percentile(sortedArray, p) {
    if (sortedArray.length === 0) return 0;
    const idx = (sortedArray.length - 1) * p;
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    if (lo === hi) return sortedArray[lo];
    return sortedArray[lo] + (sortedArray[hi] - sortedArray[lo]) * (idx - lo);
  }

  function simulateQuarter(runs, monthlyMean, monthlySd) {
    const results = new Array(runs);
    for (let i = 0; i < runs; i++) {
      const m1 = Math.max(0, normalSample(monthlyMean, monthlySd));
      const m2 = Math.max(0, normalSample(monthlyMean, monthlySd));
      const m3 = Math.max(0, normalSample(monthlyMean, monthlySd));
      results[i] = m1 + m2 + m3;
    }
    return results;
  }

  function computeMetrics(samples, target) {
    const sorted = [...samples].sort((a, b) => a - b);
    const n = sorted.length;
    const pExceed = (samples.filter(v => v >= target).length / n) * 100;

    const p5 = percentile(sorted, 0.05);
    const p25 = percentile(sorted, 0.25);
    const p50 = percentile(sorted, 0.50);
    const p75 = percentile(sorted, 0.75);
    const p95 = percentile(sorted, 0.95);

    const risk = pExceed >= 70 ? 'Low' : pExceed >= 40 ? 'Medium' : 'High';

    return { pExceed, p5, p25, p50, p75, p95, risk };
  }

  function riskBadgeClass(level) {
    if (level === 'Low') return 'bg-emerald-100 text-emerald-700';
    if (level === 'Medium') return 'bg-amber-100 text-amber-800';
    return 'bg-rose-100 text-rose-700';
  }

  function renderPlot(samples, target, ci) {
    const trace = {
      type: 'histogram',
      x: samples,
      marker: { color: '#6366f1' },
      opacity: 0.75,
      nbinsx: 40,
      hovertemplate: '£%{x:.0f}<extra></extra>'
    };

    const shapes = [
      { type: 'line', x0: target, x1: target, y0: 0, y1: 1, xref: 'x', yref: 'paper', line: { color: '#0f172a', width: 2, dash: 'dot' } },
      { type: 'line', x0: ci.p5, x1: ci.p5, y0: 0, y1: 1, xref: 'x', yref: 'paper', line: { color: '#059669', width: 2 } },
      { type: 'line', x0: ci.p95, x1: ci.p95, y0: 0, y1: 1, xref: 'x', yref: 'paper', line: { color: '#059669', width: 2 } },
      { type: 'line', x0: ci.p25, x1: ci.p25, y0: 0, y1: 1, xref: 'x', yref: 'paper', line: { color: '#f59e0b', width: 2 } },
      { type: 'line', x0: ci.p75, x1: ci.p75, y0: 0, y1: 1, xref: 'x', yref: 'paper', line: { color: '#f59e0b', width: 2 } },
    ];

    const layout = {
      margin: { l: 40, r: 10, t: 10, b: 40 },
      paper_bgcolor: 'white',
      plot_bgcolor: 'white',
      xaxis: { gridcolor: '#e2e8f0', title: 'Quarterly revenue (GBP)' },
      yaxis: { gridcolor: '#e2e8f0', title: 'Frequency' },
      shapes,
      showlegend: false,
      responsive: true
    };

    Plotly.newPlot(histDiv, [trace], layout, { displayModeBar: false, responsive: true });
  }

  function updateUI(runs = 20000) {
    const monthlyMean = Number(avgSlider.value);
    const monthlySd = Number(sdSlider.value);
    const target = Number(targetInput.value);

    avgValue.textContent = fmtGBP0.format(monthlyMean);
    sdValue.textContent = fmtGBP0.format(monthlySd);

    const samples = simulateQuarter(runs, monthlyMean, monthlySd);
    const m = computeMetrics(samples, target);

    probText.textContent = `${m.pExceed.toFixed(1)}%`;
    ci90.textContent = `${fmtGBP0.format(m.p5)} – ${fmtGBP0.format(m.p95)}`;
    ci50.textContent = `${fmtGBP0.format(m.p25)} – ${fmtGBP0.format(m.p75)}`;

    riskBadge.textContent = m.risk;
    riskBadge.className = `inline-flex mt-1 items-center px-2.5 py-1 rounded-full text-sm font-medium ${riskBadgeClass(m.risk)}`;

    summaryText.textContent = `There is a ${m.pExceed.toFixed(1)}% chance of exceeding ${fmtGBP0.format(target)}.`;

    const recoLo = m.p25;
    const recoHi = m.p75;
    recoText.textContent = `Stock for ${fmtGBP0.format(recoLo)} – ${fmtGBP0.format(recoHi)} range.`;

    renderPlot(samples, target, m);
  }

  // Event wiring
  avgSlider.addEventListener('input', () => {
    avgValue.textContent = fmtGBP0.format(Number(avgSlider.value));
  });
  sdSlider.addEventListener('input', () => {
    sdValue.textContent = fmtGBP0.format(Number(sdSlider.value));
  });
  [avgSlider, sdSlider].forEach(el => el.addEventListener('change', () => updateUI(20000)));
  runBtn.addEventListener('click', () => updateUI(40000));

  // Initial run
  updateUI(20000);
})();
