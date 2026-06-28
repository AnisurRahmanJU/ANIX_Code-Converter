
  /* ── LANGUAGE CONFIG ─────────────────────── */
  const LANG_COLORS = {
    python:'#3572A5', javascript:'#f1e05a', typescript:'#3178c6', java:'#b07219',
    c:'#555555', cpp:'#f34b7d', csharp:'#178600', go:'#00ADD8', rust:'#DEA584',
    kotlin:'#A97BFF', swift:'#F05138', php:'#4F5D95', ruby:'#701516', scala:'#c22d40',
    r:'#198CE7', matlab:'#e16737', bash:'#89e051', powershell:'#012456', sql:'#e38c00',
    html:'#e34c26', css:'#563d7c', dart:'#00B4AB', lua:'#000080', haskell:'#5e5086', elixir:'#6e4a7e',
  };

  const LANG_EXTENSIONS = {
    python:'py', javascript:'js', typescript:'ts', java:'java', c:'c', cpp:'cpp',
    csharp:'cs', go:'go', rust:'rs', kotlin:'kt', swift:'swift', php:'php', ruby:'rb',
    scala:'scala', r:'r', matlab:'m', bash:'sh', powershell:'ps1', sql:'sql',
    html:'html', css:'css', dart:'dart', lua:'lua', haskell:'hs', elixir:'ex',
  };

  // Map our lang keys to Highlight.js language aliases
  const HLJS_LANG = {
    python:'python', javascript:'javascript', typescript:'typescript', java:'java',
    c:'c', cpp:'cpp', csharp:'csharp', go:'go', rust:'rust', kotlin:'kotlin',
    swift:'swift', php:'php', ruby:'ruby', scala:'scala', r:'r', matlab:'matlab',
    bash:'bash', powershell:'powershell', sql:'sql', html:'xml', css:'css',
    dart:'dart', lua:'lua', haskell:'haskell', elixir:'elixir',
  };

  const SAMPLES = {
    python: `def fibonacci(n):
    """Return the nth Fibonacci number."""
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

def is_prime(num):
    """Check if a number is prime."""
    if num < 2:
        return False
    for i in range(2, int(num ** 0.5) + 1):
        if num % i == 0:
            return False
    return True

for i in range(10):
    fib = fibonacci(i)
    prime = "prime" if is_prime(fib) else "not prime"
    print(f"fibonacci({i}) = {fib} ({prime})")`,
    javascript: `function fibonacci(n) {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}

function isPrime(num) {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}

for (let i = 0; i < 10; i++) {
  const fib = fibonacci(i);
  console.log(\`fibonacci(\${i}) = \${fib} (\${isPrime(fib) ? 'prime' : 'not prime'})\`);
}`,
    java: `public class Main {
    public static int fibonacci(int n) {
        if (n <= 0) return 0;
        if (n == 1) return 1;
        int a = 0, b = 1;
        for (int i = 2; i <= n; i++) {
            int temp = b; b = a + b; a = temp;
        }
        return b;
    }
    public static boolean isPrime(int num) {
        if (num < 2) return false;
        for (int i = 2; i <= Math.sqrt(num); i++) {
            if (num % i == 0) return false;
        }
        return true;
    }
    public static void main(String[] args) {
        for (int i = 0; i < 10; i++) {
            int fib = fibonacci(i);
            System.out.printf("fibonacci(%d) = %d (%s)%n", i, fib, isPrime(fib) ? "prime" : "not prime");
        }
    }
}`,
  };

  /* ── STATE ────────────────────────────────── */
  let settings = { theme:'dark', fontSize:13, tabSize:2, showNotes:true };
  let conversionHistory = [];
  let isConverting = false;
  let conversionCount = parseInt(localStorage.getItem('cxc_count') || '0');

  /* ── SYNTAX HIGHLIGHTING ─────────────────── */
  function highlightCode(code, langKey, codeElId) {
    const el = document.getElementById(codeElId);
    if (!el) return;
    const alias = HLJS_LANG[langKey] || 'plaintext';
    try {
      const result = hljs.highlight(code, { language: alias, ignoreIllegals: true });
      el.innerHTML = result.value;
    } catch(e) {
      el.textContent = code;
    }
  }

  function syncScrollHL(textareaId, layerId) {
    const ta = document.getElementById(textareaId);
    const layer = document.getElementById(layerId);
    if (!ta || !layer) return;
    ta.addEventListener('scroll', () => {
      layer.scrollTop = ta.scrollTop;
      layer.scrollLeft = ta.scrollLeft;
    });
  }

  /* ── THEME ────────────────────────────────── */
  function setTheme(t) {
    const isDark = t === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : t === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    // Switch hljs stylesheet
    document.getElementById('hlThemeDark').disabled = !isDark;
    document.getElementById('hlThemeLight').disabled = isDark;
    settings.theme = t;
    saveSettings();
    ['themeDark','themeLight','themeSystem'].forEach(id => document.getElementById(id)?.classList.remove('active'));
    document.getElementById({dark:'themeDark',light:'themeLight',system:'themeSystem'}[t])?.classList.add('active');
    document.getElementById('themeIconSun').style.display = isDark ? 'block' : 'none';
    document.getElementById('themeIconMoon').style.display = isDark ? 'none' : 'block';
    // Re-highlight with new theme colors
    const srcCode = document.getElementById('sourceCode').value;
    const outCode = document.getElementById('outputCode').value;
    if (srcCode) highlightCode(srcCode, document.getElementById('sourceLang').value, 'srcHlCode');
    if (outCode) highlightCode(outCode, document.getElementById('targetLang').value, 'outHlCode');
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  }

  /* ── SETTINGS ─────────────────────────────── */
  function saveSettings() { try { localStorage.setItem('cxc_settings', JSON.stringify(settings)); } catch(e) {} }

  function loadSettings() {
    try { const s = localStorage.getItem('cxc_settings'); if (s) Object.assign(settings, JSON.parse(s)); } catch(e) {}
    setTheme(settings.theme);
    applyFontSize(settings.fontSize);
    document.getElementById('fontSizeRange').value = settings.fontSize;
    document.getElementById('fontSizeVal').textContent = settings.fontSize;
    document.getElementById('tabSizeSelect').value = settings.tabSize;
    if (!settings.showNotes) {
      document.getElementById('notesOn')?.classList.remove('active');
      document.getElementById('notesOff')?.classList.add('active');
    }
  }

  function applyFontSize(size) {
    const lh = (size * 1.7) + 'px';
    document.querySelectorAll('.code-textarea, .hl-layer, .hl-layer pre, .hl-layer code').forEach(el => {
      el.style.fontSize = size + 'px';
      el.style.lineHeight = lh;
    });
    document.querySelectorAll('.line-numbers').forEach(el => {
      el.style.fontSize = size + 'px';
      el.style.lineHeight = lh;
    });
  }

  function setNotesVisible(v) {
    settings.showNotes = v;
    saveSettings();
    document.getElementById('notesOn')?.classList.toggle('active', v);
    document.getElementById('notesOff')?.classList.toggle('active', !v);
    if (!v) document.getElementById('notesCard').classList.remove('visible');
  }

  /* ── LANG BADGE SYNC ─────────────────────── */
  function syncLangBadges() {
    const src = document.getElementById('sourceLang').value;
    const tgt = document.getElementById('targetLang').value;
    document.getElementById('sourceLangLabel').textContent = capitalize(src);
    document.getElementById('targetLangLabel').textContent = capitalize(tgt);
    document.getElementById('sourceDot').style.background = LANG_COLORS[src] || '#888';
    document.getElementById('targetDot').style.background = LANG_COLORS[tgt] || '#888';
  }

  function capitalize(s) {
    const special = { javascript:'JavaScript', typescript:'TypeScript', csharp:'C#', cpp:'C++', powershell:'PowerShell', matlab:'MATLAB' };
    return special[s] || s.charAt(0).toUpperCase() + s.slice(1);
  }

  /* ── LINE NUMBERS ────────────────────────── */
  function updateLineNumbers(textareaId, lineNumId) {
    const ta = document.getElementById(textareaId);
    const ln = document.getElementById(lineNumId);
    if (!ta || !ln) return;
    const lines = (ta.value.match(/\n/g) || []).length + 1;
    let html = '';
    for (let i = 1; i <= lines; i++) html += `<span>${i}</span>`;
    ln.innerHTML = html;
  }

  /* ── TOKEN COUNTER ───────────────────────── */
  function updateTokenCounts() {
    const src = document.getElementById('sourceCode').value;
    const out = document.getElementById('outputCode').value;
    document.getElementById('srcLines').textContent = src ? src.split('\n').length : 0;
    document.getElementById('srcChars').textContent = src.length;
    document.getElementById('outLines').textContent = out ? out.split('\n').length : 0;
    document.getElementById('outChars').textContent = out.length;
  }

  /* ── STAT COUNTER ────────────────────────── */
  function updateStatCounter() { animateNumber('statConversions', 0, conversionCount, 800); }
  function animateNumber(id, from, to, duration) {
    const el = document.getElementById(id);
    if (!el) return;
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ── PROGRESS BAR ────────────────────────── */
  let progressInterval;
  function startProgress() {
    const bar = document.getElementById('progressBar');
    let w = 0; clearInterval(progressInterval); bar.style.width = '0%';
    progressInterval = setInterval(() => { w = Math.min(w + Math.random() * 8, 85); bar.style.width = w + '%'; }, 200);
  }
  function completeProgress() {
    clearInterval(progressInterval);
    const bar = document.getElementById('progressBar');
    bar.style.width = '100%';
    setTimeout(() => { bar.style.width = '0%'; }, 500);
  }

  /* ── TOAST ───────────────────────────────── */
  function toast(msg, type = 'info') {
    const icons = {
      success:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
      error:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
      info:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
    };
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `<div class="toast-icon">${icons[type]}</div><div class="toast-msg">${msg}</div>`;
    document.getElementById('toastContainer').appendChild(el);
    setTimeout(() => { el.classList.add('removing'); setTimeout(() => el.remove(), 200); }, 3200);
  }

  /* ── HISTORY ─────────────────────────────── */
  function loadHistory() { try { conversionHistory = JSON.parse(localStorage.getItem('cxc_history') || '[]'); } catch(e) { conversionHistory = []; } }
  function saveHistory() { try { if (conversionHistory.length > 20) conversionHistory = conversionHistory.slice(-20); localStorage.setItem('cxc_history', JSON.stringify(conversionHistory)); } catch(e) {} }
  function addToHistory(src, out, from, to, notes) {
    conversionHistory.push({ id: Date.now(), from, to, src: src.slice(0,500), out: out.slice(0,500), notes, time: new Date().toISOString() });
    saveHistory(); renderHistory();
  }
  function renderHistory() {
    const grid = document.getElementById('historyGrid');
    if (!grid) return;
    if (conversionHistory.length === 0) {
      grid.innerHTML = '<div class="history-empty">No conversions yet. Make your first conversion above!</div>'; return;
    }
    grid.innerHTML = [...conversionHistory].reverse().slice(0,12).map(item => `
      <div class="history-item" onclick="loadHistoryItem(${item.id})">
        <div class="history-item-header">
          <div class="history-langs">
            <span class="history-lang" style="background:${LANG_COLORS[item.from]||'#555'}22;color:${LANG_COLORS[item.from]||'#888'}">${capitalize(item.from)}</span>
            <span class="history-arrow">→</span>
            <span class="history-lang" style="background:${LANG_COLORS[item.to]||'#555'}22;color:${LANG_COLORS[item.to]||'#888'}">${capitalize(item.to)}</span>
          </div>
          <span class="history-time">${timeAgo(item.time)}</span>
        </div>
        <div class="history-preview">${escapeHtml(item.src.slice(0,120))}</div>
      </div>`).join('');
  }
  function loadHistoryItem(id) {
    const item = conversionHistory.find(h => h.id === id);
    if (!item) return;
    document.getElementById('sourceCode').value = item.src;
    document.getElementById('outputCode').value = item.out;
    document.getElementById('sourceLang').value = item.from;
    document.getElementById('targetLang').value = item.to;
    syncLangBadges();
    updateLineNumbers('sourceCode','srcLineNums');
    updateLineNumbers('outputCode','outLineNums');
    updateTokenCounts();
    highlightCode(item.src, item.from, 'srcHlCode');
    highlightCode(item.out, item.to, 'outHlCode');
    document.getElementById('outputOverlay').classList.add('hidden');
    document.getElementById('copyResultBtn').disabled = false;
    document.getElementById('downloadBtn').disabled = false;
    if (item.notes && settings.showNotes) {
      document.getElementById('notesCard').classList.add('visible');
      document.getElementById('notesContent').innerHTML = item.notes;
    }
    document.getElementById('converter').scrollIntoView({ behavior:'smooth' });
    toast('Loaded from history','info');
  }
  function timeAgo(iso) {
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return 'just now';
    const m = Math.floor(s/60); if (m < 60) return `${m}m ago`;
    const h = Math.floor(m/60); if (h < 24) return `${h}h ago`;
    return `${Math.floor(h/24)}d ago`;
  }
  function escapeHtml(str) { return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  /* ── CONVERT ─────────────────────────────── */
  async function convert() {
    if (isConverting) return;
    const source = document.getElementById('sourceCode').value.trim();
    const from   = document.getElementById('sourceLang').value;
    const to     = document.getElementById('targetLang').value;
    if (!source) { toast('Please enter some source code first.','error'); return; }
    if (from === to) { toast('Source and target languages are the same.','error'); return; }

    isConverting = true;
    const btn = document.getElementById('convertBtn');
    btn.disabled = true;
    document.getElementById('convertIcon').style.display = 'none';
    document.getElementById('convertSpinner').style.display = 'block';
    document.getElementById('convertLabel').textContent = 'Converting…';
    hideError(); startProgress();
    document.getElementById('outputCode').value = '';
    document.getElementById('outHlCode').innerHTML = '';
    document.getElementById('outputOverlay').classList.remove('hidden');
    document.getElementById('notesCard').classList.remove('visible');
    document.getElementById('copyResultBtn').disabled = true;
    document.getElementById('downloadBtn').disabled = true;
    updateLineNumbers('outputCode','outLineNums');
    updateTokenCounts();

    try {
      const response = await callClaude(buildPrompt(source, from, to));
      const { code, notes } = parseResponse(response);

      document.getElementById('outputCode').value = code;
      document.getElementById('outputOverlay').classList.add('hidden');
      highlightCode(code, to, 'outHlCode');
      updateLineNumbers('outputCode','outLineNums');
      updateTokenCounts();

      if (notes && settings.showNotes) {
        document.getElementById('notesCard').classList.add('visible','slide-up');
        document.getElementById('notesContent').innerHTML = notes;
      }
      document.getElementById('copyResultBtn').disabled = false;
      document.getElementById('downloadBtn').disabled = false;
      addToHistory(source, code, from, to, notes);
      conversionCount++;
      localStorage.setItem('cxc_count', conversionCount);
      animateNumber('statConversions', conversionCount - 1, conversionCount, 400);
      toast(`Converted ${capitalize(from)} → ${capitalize(to)} successfully!`, 'success');
    } catch(err) {
      showError(err.message || 'Conversion failed. Please try again.');
      toast('Conversion failed. Check the error message below.', 'error');
    } finally {
      isConverting = false;
      btn.disabled = false;
      document.getElementById('convertIcon').style.display = 'block';
      document.getElementById('convertSpinner').style.display = 'none';
      document.getElementById('convertLabel').textContent = 'Convert';
      completeProgress();
    }
  }

  function buildPrompt(source, from, to) {
    return `You are an expert polyglot programmer. Convert the following ${capitalize(from)} code to ${capitalize(to)}.

INSTRUCTIONS:
1. Produce idiomatic ${capitalize(to)} code — not a literal line-by-line translation.
2. Preserve all logic, variable names (adapted to target conventions), and comments.
3. Use standard library equivalents where applicable.
4. After the code, add a section of conversion notes.

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:
<CODE>
[converted code here — no markdown fences]
</CODE>
<NOTES>
[2-5 bullet points about key changes, library equivalents, potential gotchas. Use plain HTML like <code>snippets</code>, <strong>emphasis</strong>, and bullet points with •]
</NOTES>

SOURCE ${capitalize(from).toUpperCase()} CODE:
\`\`\`${from}
${source}
\`\`\`

Convert to ${capitalize(to)}:`;
  }

  async function callClaude(prompt) {
    const response = await fetch('api/server.js', {
      method: 'POST',
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `API error ${response.status}`);
    }
    const data = await response.json();
    const text = data.content?.map(b => b.text || '').join('') || '';
    if (!text) throw new Error('Empty response from Claude.');
    return text;
  }

  function parseResponse(text) {
    const codeMatch  = text.match(/<CODE>([\s\S]*?)<\/CODE>/i);
    const notesMatch = text.match(/<NOTES>([\s\S]*?)<\/NOTES>/i);
    let code  = codeMatch  ? codeMatch[1].trim()  : text.replace(/```[\w]*\n?/g,'').replace(/```/g,'').trim();
    let notes = notesMatch ? notesMatch[1].trim() : '';
    if (notes && !notes.includes('<')) {
      const bullets = notes.split(/\n•|\n-|\n\*/).filter(Boolean);
      if (bullets.length > 1) {
        notes = '<ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:6px">' +
          bullets.map(b => `<li style="display:flex;gap:8px"><span style="color:var(--accent-a);flex-shrink:0">•</span><span>${b.trim()}</span></li>`).join('') + '</ul>';
      }
    }
    return { code, notes };
  }

  function showError(msg) {
    const card = document.getElementById('errorCard');
    document.getElementById('errorText').textContent = msg;
    card.classList.add('visible','slide-up');
  }
  function hideError() { document.getElementById('errorCard').classList.remove('visible'); }

  /* ── CLIPBOARD ───────────────────────────── */
  async function copyText(text, label) {
    try { await navigator.clipboard.writeText(text); toast(`${label} copied to clipboard!`,'success'); }
    catch(e) {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
      toast(`${label} copied!`,'success');
    }
  }

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      document.getElementById('sourceCode').value = text;
      highlightCode(text, document.getElementById('sourceLang').value, 'srcHlCode');
      updateLineNumbers('sourceCode','srcLineNums');
      updateTokenCounts();
      toast('Pasted from clipboard','success');
    } catch(e) { toast('Clipboard access denied. Please paste manually.','error'); }
  }

  /* ── DOWNLOAD ────────────────────────────── */
  function downloadOutput() {
    const code = document.getElementById('outputCode').value;
    if (!code) return;
    const lang = document.getElementById('targetLang').value;
    const ext  = LANG_EXTENSIONS[lang] || 'txt';
    const blob = new Blob([code], { type:'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `converted.${ext}`; a.click();
    URL.revokeObjectURL(a.href);
    toast(`Downloaded as converted.${ext}`,'success');
  }

  /* ── SWAP ────────────────────────────────── */
  function swapLangs() {
    const srcSel  = document.getElementById('sourceLang');
    const tgtSel  = document.getElementById('targetLang');
    const srcCode = document.getElementById('sourceCode').value;
    const outCode = document.getElementById('outputCode').value;
    const tmp = srcSel.value; srcSel.value = tgtSel.value; tgtSel.value = tmp;
    document.getElementById('sourceCode').value = outCode;
    document.getElementById('outputCode').value = srcCode;
    syncLangBadges();
    highlightCode(outCode, srcSel.value, 'srcHlCode');
    highlightCode(srcCode, tgtSel.value, 'outHlCode');
    updateLineNumbers('sourceCode','srcLineNums');
    updateLineNumbers('outputCode','outLineNums');
    updateTokenCounts();
    if (!outCode) document.getElementById('outputOverlay').classList.remove('hidden');
    else document.getElementById('outputOverlay').classList.add('hidden');
    toast('Languages swapped!','info');
  }

  /* ── LOAD SAMPLE ─────────────────────────── */
  function loadSample() {
    const lang   = document.getElementById('sourceLang').value;
    const sample = SAMPLES[lang] || SAMPLES.javascript;
    document.getElementById('sourceCode').value = sample;
    highlightCode(sample, lang, 'srcHlCode');
    updateLineNumbers('sourceCode','srcLineNums');
    updateTokenCounts(); hideError();
    toast(`Loaded ${capitalize(lang)} sample`,'info');
  }

  /* ── CLEAR ───────────────────────────────── */
  function clearAll() {
    document.getElementById('sourceCode').value = '';
    document.getElementById('outputCode').value = '';
    document.getElementById('srcHlCode').innerHTML = '';
    document.getElementById('outHlCode').innerHTML = '';
    document.getElementById('outputOverlay').classList.remove('hidden');
    document.getElementById('notesCard').classList.remove('visible');
    document.getElementById('copyResultBtn').disabled = true;
    document.getElementById('downloadBtn').disabled = true;
    hideError();
    updateLineNumbers('sourceCode','srcLineNums');
    updateLineNumbers('outputCode','outLineNums');
    updateTokenCounts();
  }

  /* ── SETTINGS MODAL ──────────────────────── */
  function openSettings() { document.getElementById('settingsModal').classList.add('open'); }
  function closeSettings() { document.getElementById('settingsModal').classList.remove('open'); }

  /* ── MOBILE MENU ─────────────────────────── */
  let mobileOpen = false;
  function toggleMobileMenu() {
    mobileOpen = !mobileOpen;
    document.getElementById('mobileMenu').classList.toggle('open', mobileOpen);
  }
  function closeMobileMenu() { mobileOpen = false; document.getElementById('mobileMenu').classList.remove('open'); }

  /* ── CLEAR HISTORY ───────────────────────── */
  function clearHistory() {
    if (!confirm('Clear all conversion history?')) return;
    conversionHistory = []; saveHistory(); renderHistory();
    toast('History cleared','info');
  }

  /* ── EVENTS ──────────────────────────────── */
  function attachEvents() {
    document.getElementById('convertBtn').addEventListener('click', convert);
    document.addEventListener('keydown', e => { if ((e.ctrlKey||e.metaKey) && e.key==='Enter') { e.preventDefault(); convert(); } });
    document.getElementById('swapBtn').addEventListener('click', swapLangs);

    document.getElementById('sourceLang').addEventListener('change', () => {
      syncLangBadges(); hideError();
      highlightCode(document.getElementById('sourceCode').value, document.getElementById('sourceLang').value, 'srcHlCode');
    });
    document.getElementById('targetLang').addEventListener('change', () => {
      syncLangBadges(); hideError();
      highlightCode(document.getElementById('outputCode').value, document.getElementById('targetLang').value, 'outHlCode');
    });

    // Real-time highlighting as user types
    document.getElementById('sourceCode').addEventListener('input', () => {
      const code = document.getElementById('sourceCode').value;
      const lang = document.getElementById('sourceLang').value;
      highlightCode(code, lang, 'srcHlCode');
      updateLineNumbers('sourceCode','srcLineNums');
      updateTokenCounts(); hideError();
    });

    // Tab key
    document.querySelectorAll('.code-textarea').forEach(ta => {
      ta.addEventListener('keydown', e => {
        if (e.key === 'Tab') {
          e.preventDefault();
          const spaces = ' '.repeat(settings.tabSize);
          const s = ta.selectionStart, end = ta.selectionEnd;
          ta.value = ta.value.slice(0,s) + spaces + ta.value.slice(end);
          ta.selectionStart = ta.selectionEnd = s + spaces.length;
          if (ta.id === 'sourceCode') {
            highlightCode(ta.value, document.getElementById('sourceLang').value, 'srcHlCode');
            updateLineNumbers('sourceCode','srcLineNums');
          }
        }
      });
    });

    // Sync hl-layer scroll with textarea scroll
    syncScrollHL('sourceCode', 'srcHlLayer');
    syncScrollHL('outputCode', 'outHlLayer');

    document.getElementById('loadSampleBtn').addEventListener('click', loadSample);
    document.getElementById('clearBtn').addEventListener('click', clearAll);
    document.getElementById('copyResultBtn').addEventListener('click', () => copyText(document.getElementById('outputCode').value,'Output code'));
    document.getElementById('downloadBtn').addEventListener('click', downloadOutput);
    document.getElementById('copyOutBtn').addEventListener('click', () => copyText(document.getElementById('outputCode').value,'Output code'));
    document.getElementById('copySrcBtn').addEventListener('click', () => copyText(document.getElementById('sourceCode').value,'Source code'));
    document.getElementById('pasteSrcBtn').addEventListener('click', pasteFromClipboard);
    document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('settingsBtn').addEventListener('click', openSettings);
    document.getElementById('closeSettings').addEventListener('click', closeSettings);
    document.getElementById('settingsModal').addEventListener('click', e => { if (e.target===document.getElementById('settingsModal')) closeSettings(); });

    document.getElementById('fontSizeRange').addEventListener('input', e => {
      const val = parseInt(e.target.value);
      settings.fontSize = val;
      document.getElementById('fontSizeVal').textContent = val;
      applyFontSize(val); saveSettings();
    });
    document.getElementById('tabSizeSelect').addEventListener('change', e => {
      settings.tabSize = parseInt(e.target.value); saveSettings();
    });
    document.getElementById('hamburger').addEventListener('click', toggleMobileMenu);

    // Scroll spy
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
          document.querySelector(`.nav-link[href="#${entry.target.id}"]`)?.classList.add('active');
        }
      });
    }, { threshold: 0.3 });
    ['converter','features','history'].forEach(id => { const el = document.getElementById(id); if(el) observer.observe(el); });
  }

  /* ── BOOT ────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadHistory();
    renderHistory();
    updateStatCounter();
    attachEvents();
    updateLineNumbers('sourceCode','srcLineNums');
    updateLineNumbers('outputCode','outLineNums');
    updateTokenCounts();
    syncLangBadges();
    setTimeout(() => document.querySelector('.hero')?.classList.add('slide-up'), 100);
  });
