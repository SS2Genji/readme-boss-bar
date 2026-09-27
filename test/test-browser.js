const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

async function runBrowserTests() {
  console.log("=== Testing Visual Web Studio (Chromium Headless) ===");

  // Check if chromium is available
  try {
    const { execSync } = require('child_process');
    execSync('which chromium || which google-chrome', { stdio: 'ignore' });
  } catch (e) {
    console.log("[WARN] Chromium/Chrome not found; skipping headless browser tests.");
    return;
  }

  const server = http.createServer((req, res) => {
    let p = req.url === '/' ? '/index.html' : req.url;
    let file = path.join(__dirname, '..', p.split('?')[0]);
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      if (file.endsWith('.js')) res.setHeader('Content-Type', 'application/javascript');
      else if (file.endsWith('.html')) res.setHeader('Content-Type', 'text/html');
      res.writeHead(200);
      res.end(fs.readFileSync(file));
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  await new Promise((resolve) => server.listen(9890, resolve));

  const chrome = spawn('chromium', [
    '--headless=new',
    '--disable-gpu',
    '--disable-extensions',
    '--remote-debugging-port=9470'
  ]);
  await new Promise(r => setTimeout(r, 600));

  try {
    const listRes = await fetch('http://127.0.0.1:9470/json/list');
    const pages = await listRes.json();
    const targetPage = pages.find(p => p.type === 'page') || pages[0];

    const ws = new WebSocket(targetPage.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    function send(method, params = {}) {
      return new Promise((resolve) => {
        const msgId = id++;
        const h = (e) => {
          const d = JSON.parse(e.data);
          if (d.id === msgId) {
            ws.removeEventListener('message', h);
            resolve(d.result);
          }
        };
        ws.addEventListener('message', h);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    await send('Page.enable');
    await send('Page.navigate', { url: 'http://127.0.0.1:9890/' });

    for (let i = 0; i < 30; i++) {
      const state = await send('Runtime.evaluate', {
        expression: '({ hasVp: !!document.getElementById("studio-viewport")?.innerHTML.includes("RADAHN") })',
        returnByValue: true
      });
      if (state.result?.value?.hasVp) break;
      await new Promise(r => setTimeout(r, 100));
    }

    const testRes = await send('Runtime.evaluate', {
      expression: `
        (async () => {
          const checks = [];
          function assert(cond, msg) {
            if (!cond) throw new Error(msg);
            checks.push(msg);
          }

          // --- 1. Initial Gateway Screen, Single Execution & HUD Cleanup Assertions ---
          const gatewayEl = document.getElementById('view-gateway');
          const studioEl = document.getElementById('view-studio');
          assert(gatewayEl, 'Gateway hero section exists');
          assert(window.getComputedStyle(gatewayEl).display !== 'none', 'Initial state: #view-gateway is visible');
          assert(window.getComputedStyle(studioEl).display === 'none', 'Initial state: #view-studio is hidden');
          assert(hasExecuted === false, 'Initial state: hasExecuted is false');
          assert(currentView === 'hub', 'Initial state: currentView is hub');

          // Verify Vector cyber-sigil crest emblem rendered
          const sigil = document.querySelector('.sigil-crest-wrap');
          assert(sigil, 'Vector cyber-sigil crest emblem rendered');

          const executeBtn = document.querySelector('.btn-execute-system');
          assert(executeBtn, 'Tactical execute system button exists');

          // Verify removed gateway hub elements and manifesto quote are absent
          assert(!document.querySelector('.hub-grid'), 'Hub grid removed from DOM');
          assert(document.querySelectorAll('.hub-card').length === 0, 'No hub cards in DOM');
          assert(!document.querySelector('.hub-btn'), 'Hub buttons removed from DOM');
          assert(!document.querySelector('.gateway-telemetry-badge'), 'Telemetry badge removed from DOM');
          assert(!document.querySelector('.gateway-manifesto-sub'), 'Manifesto subtitle quote removed from DOM');

          // Verify removed navigation tabs, deck & manifesto elements are completely absent
          assert(!document.querySelector('.hud-nav'), '.hud-nav removed from DOM');
          assert(!document.querySelector('.view-switcher-deck'), '.view-switcher-deck removed from DOM');
          assert(!document.getElementById('modal-manifesto'), '#modal-manifesto removed from DOM');
          assert(!document.getElementById('tab-hub-nav'), '#tab-hub-nav removed from DOM');
          assert(!document.getElementById('tab-studio-nav'), '#tab-studio-nav removed from DOM');
          assert(!document.getElementById('tab-hub'), '#tab-hub removed from DOM');
          assert(!document.getElementById('tab-studio'), '#tab-studio removed from DOM');
          assert(typeof openManifesto === 'undefined', 'openManifesto function removed');
          assert(typeof closeManifesto === 'undefined', 'closeManifesto function removed');
          assert(!Array.from(document.querySelectorAll('.hud-actions button')).some(b => b.textContent.includes('MANIFESTO')), 'Manifesto button removed from HUD');

          // Verify Top Left Telemetry contains ONLY "BOSS BAR"
          const sysNameEl = document.querySelector('.hud-telemetry .sys-name');
          assert(sysNameEl && sysNameEl.textContent.trim() === 'BOSS BAR', 'sys-name contains strictly BOSS BAR');
          assert(!document.querySelector('.hud-telemetry .tag-pill'), 'tag-pill spans removed from hud-telemetry');
          assert(!document.querySelector('.hud-telemetry').textContent.includes('AVANT-GARDE'), 'AVANT-GARDE studio removed from telemetry');
          assert(!document.querySelector('.hud-telemetry').textContent.includes('ENGINE:'), 'ENGINE: v0.2.0 removed from telemetry');
          assert(!document.querySelector('.hud-telemetry').textContent.includes('SEC:'), 'SEC: PURE-SVG 100% removed from telemetry');

          // Test: Right click (button 2) must NOT execute system
          window.dispatchEvent(new MouseEvent('click', { button: 2, bubbles: true }));
          assert(hasExecuted === false, 'Right click on gateway did NOT execute system');
          assert(currentView === 'hub', 'currentView remains hub after right click');

          // Test: Clicking inside HUD bar must NOT execute system
          document.querySelector('.hud-bar').dispatchEvent(new MouseEvent('click', { button: 0, bubbles: true }));
          assert(hasExecuted === false, 'Clicking inside .hud-bar did NOT execute system');
          assert(currentView === 'hub', 'currentView remains hub after clicking .hud-bar');

          // Test Entry via Enter key (One-Way Gateway Entry)
          window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', key: 'Enter' }));
          assert(hasExecuted === true, 'hasExecuted flag flipped to true on entry');
          assert(currentView === 'studio', 'Enter key set currentView to studio');
          assert(window.getComputedStyle(gatewayEl).display === 'none', 'Enter key hid #view-gateway');
          assert(window.getComputedStyle(studioEl).display !== 'none', 'Enter key revealed #view-studio');
          assert(glitchIntensity > 0.5, 'executeSystem triggered initial shader glitch burst');

          // Reset glitch and sentinel toast to test single execution idempotency
          glitchIntensity = 0;
          document.getElementById('toast-text').innerText = 'SENTINEL_UNCHANGED';

          // Test: Space key in studio must NEVER re-open hub or re-trigger sound/glitch/toast
          window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ' }));
          assert(currentView === 'studio', 'Space key in studio did NOT re-open hub');
          assert(window.getComputedStyle(gatewayEl).display === 'none', 'Gateway remains hidden on Space');
          assert(glitchIntensity === 0, 'Space key did not re-trigger glitch intensity');
          assert(document.getElementById('toast-text').innerText === 'SENTINEL_UNCHANGED', 'Space key did not re-trigger toast');

          // Test: Enter key in studio must NEVER re-trigger
          window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', key: 'Enter' }));
          assert(currentView === 'studio', 'Enter key in studio did NOT re-open hub');
          assert(glitchIntensity === 0, 'Enter key did not re-trigger glitch intensity');
          assert(document.getElementById('toast-text').innerText === 'SENTINEL_UNCHANGED', 'Enter key did not re-trigger toast');

          // Test: NumpadEnter key in studio must NEVER re-trigger
          window.dispatchEvent(new KeyboardEvent('keydown', { code: 'NumpadEnter', key: 'Enter' }));
          assert(currentView === 'studio', 'NumpadEnter key in studio did NOT re-open hub');
          assert(glitchIntensity === 0, 'NumpadEnter key did not re-trigger glitch intensity');
          assert(document.getElementById('toast-text').innerText === 'SENTINEL_UNCHANGED', 'NumpadEnter key did not re-trigger toast');

          // Test: Escape key in studio must NEVER re-open hub
          window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', key: 'Escape' }));
          assert(currentView === 'studio', 'Escape key in studio did NOT re-open hub');
          assert(window.getComputedStyle(gatewayEl).display === 'none', 'Gateway remains hidden on Escape');

          // Test: Document left click in studio must NEVER re-trigger execution
          document.body.dispatchEvent(new MouseEvent('click', { button: 0, bubbles: true }));
          assert(currentView === 'studio', 'Body click did not switch view');
          assert(glitchIntensity === 0, 'Body click did not re-trigger glitch intensity');
          assert(document.getElementById('toast-text').innerText === 'SENTINEL_UNCHANGED', 'Body click did not re-trigger toast');

          // Test: Document right click in studio must NEVER re-trigger execution
          document.body.dispatchEvent(new MouseEvent('click', { button: 2, bubbles: true }));
          assert(currentView === 'studio', 'Right click in studio did not switch view');
          assert(glitchIntensity === 0, 'Right click in studio did not re-trigger glitch intensity');
          assert(document.getElementById('toast-text').innerText === 'SENTINEL_UNCHANGED', 'Right click in studio did not re-trigger toast');

          // Test: Direct executeSystem() call is idempotent
          executeSystem();
          assert(currentView === 'studio', 'Subsequent executeSystem() stays in studio');
          assert(glitchIntensity === 0, 'Subsequent executeSystem() does not re-glitch');
          assert(document.getElementById('toast-text').innerText === 'SENTINEL_UNCHANGED', 'Subsequent executeSystem() does not re-toast');

          // Test: switchView('hub') is strictly blocked once executed
          switchView('hub');
          assert(currentView === 'studio', 'switchView(hub) strictly blocked once executed');
          assert(window.getComputedStyle(gatewayEl).display === 'none', 'Gateway remains hidden after switchView(hub)');
          assert(window.getComputedStyle(studioEl).display !== 'none', 'Studio remains displayed after switchView(hub)');

          // --- 2. Purge ALL Emojis Assertions ---
          const forbiddenChars = ['⚔', '⚡', '⌖', '†', '▣', '◇', '▲', '◈', '♫', '✕', '↗', '✔', '🔄', '◐', '🌙', '❌', '🛡', '⌁'];
          const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

          function assertNoEmoji(el, label) {
            if (!el) return;
            const txt = el.textContent || '';
            assert(!emojiRegex.test(txt), 'No emoji in ' + label + ': ' + txt.trim());
            for (const ch of forbiddenChars) {
              assert(!txt.includes(ch), 'Forbidden char ' + ch + ' not in ' + label + ': ' + txt.trim());
            }
          }

          assertNoEmoji(document.body, 'Entire document body');
          document.querySelectorAll('.btn-preset').forEach((btn, idx) => {
            assertNoEmoji(btn, 'preset button ' + idx);
          });
          document.querySelectorAll('h1, h2, h3, .card-title, .stages-header-line, .subcard-title').forEach((h, idx) => {
            assertNoEmoji(h, 'header ' + idx);
          });
          document.querySelectorAll('button, .btn-tab, .btn-hud, .btn-action-sm, .btn-execute-system').forEach((b, idx) => {
            assertNoEmoji(b, 'button ' + idx);
          });
          assertNoEmoji(document.querySelector('.preset-section'), 'Encounter Presets section');
          assertNoEmoji(document.querySelector('.hud-bar'), 'HUD bar');
          assertNoEmoji(document.querySelector('.section-gateway'), 'Gateway section');

          // --- 3. Studio Engine & Controls Assertions ---
          const vp = document.getElementById('studio-viewport');
          assert(vp && vp.innerHTML.includes('STARCOURGE RADAHN'), 'Initial Radahn SVG rendered');
          assert(vp.innerHTML.includes('DEMIGOD FELLED'), 'Preset 1 victory banner rendered');
          assert(document.getElementById('code-markdown').innerText.includes('STARCOURGE%20RADAHN'), 'Markdown embed rendered');

          // Presets
          loadPreset('school42');
          assert(vp.innerHTML.includes('CIRCLE 00 (LIBFT)'), '42 preset loaded');
          assert(stages.length === 3, '42 preset 3 stages');

          loadPreset('eldenRing');
          assert(vp.innerHTML.includes('MALENIA'), 'Elden Ring preset loaded');

          // Back to single preset
          loadPreset('single');

          // Add / remove stage
          addStage();
          assert(stages.length === 2, 'Stage added');
          removeStage(1);
          assert(stages.length === 1, 'Stage removed');

          // Hex input focus retention & URL safety
          const hexInput = document.querySelector('#swatches-0 input');
          hexInput.focus();
          hexInput.value = '#38bdf8';
          hexInput.dispatchEvent(new Event('input', { bubbles: true }));
          assert(document.activeElement === hexInput, 'Focus retained on hex input');
          assert(stages[0].barColor === '#38bdf8', 'Stage color updated');
          assert(document.getElementById('code-markdown').innerText.includes('theme=38bdf8'), 'Safe theme in URL');

          // Shake buttons
          selectStageShake(0, 'heavy');
          assert(stages[0].shake === 'heavy', 'Shake heavy set');

          selectStageShake(0, 'subtle');
          assert(stages[0].shake === 'subtle', 'Shake subtle set');

          // Aesthetic switching
          selectAesthetic('cyberpunk');
          assert(currentAesthetic === 'cyberpunk', 'Current aesthetic set to cyberpunk');
          assert(vp.innerHTML.includes('Orbitron'), 'Cyberpunk font rendered in preview');
          assert(vp.innerHTML.includes('skewX(-20)'), 'Cyberpunk chamfered angle rendered');
          assert(document.getElementById('code-markdown').innerText.includes('style=cyberpunk'), 'Markdown includes style=cyberpunk');

          selectAesthetic('bloodborne');
          assert(currentAesthetic === 'bloodborne', 'Current aesthetic set to bloodborne');
          assert(vp.innerHTML.includes('IM Fell English'), 'Bloodborne font rendered');
          assert(document.getElementById('code-markdown').innerText.includes('style=bloodborne'), 'Markdown includes style=bloodborne');

          selectAesthetic('pixel');
          assert(currentAesthetic === 'pixel', 'Current aesthetic set to pixel');
          assert(vp.innerHTML.includes('Press Start 2P'), 'Pixel font rendered');
          assert(document.getElementById('code-markdown').innerText.includes('style=pixel'), 'Markdown includes style=pixel');

          selectAesthetic('minimal');
          assert(currentAesthetic === 'minimal', 'Current aesthetic set to minimal');
          assert(vp.innerHTML.includes('rx="4"'), 'Minimal pill bars rendered');
          assert(document.getElementById('code-markdown').innerText.includes('style=minimal'), 'Markdown includes style=minimal');

          selectAesthetic('souls');
          assert(currentAesthetic === 'souls', 'Current aesthetic set to souls');
          assert(vp.innerHTML.includes('Cinzel'), 'Souls font rendered');

          // Defeated Banner Color & Damage Pop-up Color customization
          const felledColorInput = document.getElementById('glob-felled-color');
          felledColorInput.value = '#10B981';
          felledColorInput.dispatchEvent(new Event('input', { bubbles: true }));
          assert(vp.innerHTML.includes('#10B981') || vp.innerHTML.includes('#10b981'), 'Defeated banner color applied to SVG');
          assert(document.getElementById('code-markdown').innerText.includes('felledColor=10B981'), 'Markdown includes felledColor');

          const dmgPopColorInput = document.getElementById('glob-dmgpop-color');
          dmgPopColorInput.value = '#38BDF8';
          dmgPopColorInput.dispatchEvent(new Event('input', { bubbles: true }));
          assert(vp.innerHTML.includes('#38BDF8') || vp.innerHTML.includes('#38bdf8'), 'Damage pop-up color applied to SVG');
          assert(document.getElementById('code-markdown').innerText.includes('dmgPopColor=38BDF8'), 'Markdown includes dmgPopColor');

          // New aesthetic presets
          loadPreset('cyberpunk');
          assert(vp.innerHTML.includes('TITAN MECH'), 'Cyberpunk preset loaded');
          assert(vp.innerHTML.includes('TARGET DESTROYED'), 'Cyberpunk preset defeat banner rendered');

          loadPreset('bloodborne');
          assert(vp.innerHTML.includes('CLERIC BEAST'), 'Bloodborne preset loaded');
          assert(vp.innerHTML.includes('PREY SLAUGHTERED'), 'Bloodborne preset defeat banner rendered');

          loadPreset('pixel');
          assert(vp.innerHTML.includes('CASTLE OVERLORD'), 'Pixel preset loaded');
          assert(vp.innerHTML.includes('STAGE CLEAR'), 'Pixel preset defeat banner rendered');

          loadPreset('minimal');
          assert(vp.innerHTML.includes('SYSTEM INTEGRITY'), 'Minimal preset loaded');
          assert(vp.innerHTML.includes('STATUS: DEFEATED'), 'Minimal preset defeat banner rendered');

          // Reset to single preset for final title and toast checks
          loadPreset('single');

          // Custom Tag Text & Tag Color customization
          const liveTagInput = document.querySelector('#stage-card-0 input[placeholder="Default: [CURRENT FOE]"]');
          assert(liveTagInput, 'Live tag input exists');
          liveTagInput.value = '[TARGET ACQUIRED]';
          liveTagInput.dispatchEvent(new Event('input', { bubbles: true }));
          assert(vp.innerHTML.includes('[TARGET ACQUIRED]'), 'Live tag text reflected in SVG');
          assert(document.getElementById('code-markdown').innerText.includes('tag=%5BTARGET%20ACQUIRED%5D'), 'Live tag reflected in markdown URL');

          const felledTagInput = document.querySelector('#stage-card-0 input[placeholder="Default: [FELLED]"]');
          assert(felledTagInput, 'Felled tag input exists');
          felledTagInput.value = '[ANNIHILATED]';
          felledTagInput.dispatchEvent(new Event('input', { bubbles: true }));
          assert(vp.innerHTML.includes('[ANNIHILATED]'), 'Felled tag text reflected in SVG');
          assert(document.getElementById('code-markdown').innerText.includes('felledTag=%5BANNIHILATED%5D'), 'Felled tag reflected in markdown URL');

          const liveTagColorInput = document.getElementById('stage-tag-color-0');
          assert(liveTagColorInput, 'Live tag color input exists');
          liveTagColorInput.value = '#10B981';
          liveTagColorInput.dispatchEvent(new Event('input', { bubbles: true }));
          assert(vp.innerHTML.includes('fill="#10B981"') || vp.innerHTML.includes('fill="#10b981"'), 'Live tag color reflected in SVG');

          const felledTagColorInput = document.getElementById('stage-tag-felled-color-0');
          assert(felledTagColorInput, 'Felled tag color input exists');
          felledTagColorInput.value = '#F43F5E';
          felledTagColorInput.dispatchEvent(new Event('input', { bubbles: true }));
          assert(vp.innerHTML.includes('fill="#F43F5E"') || vp.innerHTML.includes('fill="#f43f5e"'), 'Felled tag color reflected in SVG');

          // Global tag color overrides
          const globTagColor = document.getElementById('glob-tag-color');
          globTagColor.value = '#06B6D4';
          globTagColor.dispatchEvent(new Event('input', { bubbles: true }));
          assert(document.getElementById('code-markdown').innerText.includes('tagColor=06B6D4'), 'Global tag color reflected in URL');

          // Reset to defaults button
          const resetBtn = document.getElementById('btn-reset-defaults');
          assert(resetBtn, 'Reset to defaults button exists');
          resetBtn.click();
          assert(stages[0].name === 'STARCOURGE RADAHN', 'Reset restored Radahn preset');
          assert(document.getElementById('glob-dmgpop').value === '-{N} BARS', 'Reset restored damage pop-up');
          assert(document.getElementById('toast-text').innerText.includes('Reset'), 'Reset toast shown');
          assert(vp.innerHTML.includes('STARCOURGE RADAHN'), 'SVG viewport restored after reset');

          // Boss name update
          const nameInput = document.querySelector('#stage-card-0 input[type="text"]');
          nameInput.value = 'MOGH, LORD OF BLOOD';
          nameInput.dispatchEvent(new Event('input', { bubbles: true }));
          assert(document.getElementById('stage-title-0').innerText === 'MOGH, LORD OF BLOOD', 'Stage title live update');

          // Verify typing space inside input field is not prevented and retains studio view
          const spaceInInputEvt = new KeyboardEvent('keydown', { code: 'Space', key: ' ', bubbles: true, cancelable: true });
          nameInput.dispatchEvent(spaceInInputEvt);
          assert(!spaceInInputEvt.defaultPrevented, 'Space key in input field is not prevented');
          assert(currentView === 'studio', 'Typing space in input maintains studio view');

          // Download and copy toasts
          downloadSVG();
          assert(document.getElementById('toast-text').innerText.includes('Downloaded'), 'Download triggered');

          copyMarkdown();
          await new Promise(r => setTimeout(r, 100));
          assert(document.getElementById('toast-text').innerText.includes('Copied'), 'Copy Markdown triggered');

          // Toggle Viewport BG
          toggleViewportBg();
          assert(isLightBg === true, 'Light background toggled');
          assert(vp.style.background.includes('255') || vp.style.background.includes('fff'), 'Viewport background is light');
          toggleViewportBg();
          assert(isLightBg === false, 'Dark background restored');

          // Replay animation
          replayAnimation();
          assert(document.getElementById('toast-text').innerText.includes('restarted'), 'Replay toast shown');

          // Multi-stage accumulation then reset
          addStage();
          addStage();
          assert(stages.length === 3, 'Accumulated 3 stages');
          resetBtn.click();
          assert(stages.length === 1, 'Reset pruned extra stages down to 1');
          assert(stages[0].name === 'STARCOURGE RADAHN', 'Reset restored single stage Radahn');
          assert(currentAesthetic === 'souls', 'Reset restored souls aesthetic');
          assert(isLightBg === false, 'Reset kept dark background');

          // Verify all 8 presets load cleanly
          ['single', 'cyberpunk', 'bloodborne', 'pixel', 'minimal', 'school42', 'eldenRing', 'demigod'].forEach(p => {
            loadPreset(p);
            assert(stages.length >= 1, 'Loaded preset ' + p);
            assert(vp.innerHTML.includes('<svg'), 'Preset ' + p + ' renders valid SVG');
          });
          resetBtn.click();
          assert(stages[0].name === 'STARCOURGE RADAHN', 'Final reset back to pristine single Radahn');

          // Verify selectAesthetic deactivates activePreset
          loadPreset('single');
          assert(activePreset === 'single', 'Active preset set to single');
          selectAesthetic('cyberpunk');
          assert(activePreset === null, 'selectAesthetic deactivated active preset');
          assert(!document.querySelector('.btn-preset.active'), 'No preset button has active class');

          // Dynamic slider synchronization and hit clamping
          loadPreset('single');
          const barsInput = document.querySelector('#stage-card-0 input[type="range"]');
          barsInput.value = '4';
          barsInput.dispatchEvent(new Event('input', { bubbles: true }));
          assert(stages[0].totalBars === 4, 'Total bars set to 4');
          const hitsSlider = document.getElementById('slider-hits-0');
          assert(hitsSlider && parseInt(hitsSlider.max, 10) === 2, 'Hits slider max clamped to 2 for 4 bars / 3 dmg');
          assert(stages[0].hits === 2, 'Stage hits clamped to 2');
          assert(document.getElementById('val-hits-0').innerText.includes('2 hits'), 'Hits label displays 2 hits');

          // Defeated banner fallback on empty string
          const felledInput = document.querySelector('#stage-card-0 input[placeholder="Default: based on aesthetic"]');
          assert(felledInput, 'Defeated banner input exists');
          felledInput.value = '';
          felledInput.dispatchEvent(new Event('input', { bubbles: true }));
          assert(stages[0].felledText === undefined, 'Empty defeated banner falls back to aesthetic default');

          // Re-reset before ending
          resetBtn.click();
          assert(stages[0].name === 'STARCOURGE RADAHN', 'Clean final reset');

          // Verify Web Audio Synthesizer & Audio Toggle
          assert(sound && typeof sound.playClick === 'function', 'Audio synthesizer loaded');
          assert(sound.enabled === true, 'Audio enabled by default');
          toggleAudio();
          assert(sound.enabled === false, 'Audio toggled to muted');
          assert(document.getElementById('audio-label').innerText === 'AUDIO: MUTED', 'Audio label shows MUTED');
          toggleAudio();
          assert(sound.enabled === true, 'Audio toggled back to ON');
          assert(document.getElementById('audio-label').innerText === 'AUDIO: ON', 'Audio label shows ON');

          // Verify Design Manifesto Modal and trigger button are completely absent
          assert(!document.getElementById('modal-manifesto'), 'Manifesto modal absent from DOM');
          assert(!document.querySelector('.modal-backdrop'), 'No modal backdrop in DOM');

          // Verify Canvas Background
          const bgCanvas = document.getElementById('bg-canvas');
          assert(bgCanvas && bgCanvas.width > 0 && bgCanvas.height > 0, 'Procedural background canvas dimensions valid');

          return { success: true, count: checks.length };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });

    if (testRes.exceptionDetails) {
      throw new Error("Browser test assertion failed: " + JSON.stringify(testRes.exceptionDetails));
    }

    // Helper to navigate and wait until fresh page is fully ready with hasExecuted === false
    async function navigateAndReady(url) {
      await send('Page.navigate', { url });
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 100));
        const res = await send('Runtime.evaluate', {
          expression: '({ hasExecuted: typeof hasExecuted !== "undefined" ? hasExecuted : null, currentView: typeof currentView !== "undefined" ? currentView : null })',
          returnByValue: true
        });
        if (res.result?.value?.hasExecuted === false && res.result?.value?.currentView === 'hub') {
          return true;
        }
      }
      return false;
    }

    // Additional Verification: Fresh page entry via [Space] key
    if (!await navigateAndReady('http://127.0.0.1:9890/')) {
      throw new Error("Failed to load fresh page for Space key test");
    }
    const spaceEntryRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          if (hasExecuted !== false || currentView !== 'hub') return false;
          window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ' }));
          return hasExecuted === true && currentView === 'studio' && document.getElementById('view-gateway').style.display === 'none';
        })()
      `,
      returnByValue: true
    });
    if (!spaceEntryRes.result?.value) {
      throw new Error("Fresh page gateway entry via [Space] key failed!");
    }

    // Additional Verification: Fresh page entry via Left-Click on [EXECUTE SYSTEM]
    if (!await navigateAndReady('http://127.0.0.1:9890/')) {
      throw new Error("Failed to load fresh page for Left-Click test");
    }
    const clickEntryRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          if (hasExecuted !== false || currentView !== 'hub') return false;
          document.getElementById('btn-execute-system').click();
          return hasExecuted === true && currentView === 'studio' && document.getElementById('view-gateway').style.display === 'none';
        })()
      `,
      returnByValue: true
    });
    if (!clickEntryRes.result?.value) {
      throw new Error("Fresh page gateway entry via Left-Click failed!");
    }

    // Additional Verification: Fresh page entry via [NumpadEnter]
    if (!await navigateAndReady('http://127.0.0.1:9890/')) {
      throw new Error("Failed to load fresh page for NumpadEnter test");
    }
    const numpadEntryRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          if (hasExecuted !== false || currentView !== 'hub') return false;
          window.dispatchEvent(new KeyboardEvent('keydown', { code: 'NumpadEnter', key: 'Enter' }));
          return hasExecuted === true && currentView === 'studio' && document.getElementById('view-gateway').style.display === 'none';
        })()
      `,
      returnByValue: true
    });
    if (!numpadEntryRes.result?.value) {
      throw new Error("Fresh page gateway entry via [NumpadEnter] key failed!");
    }

    ws.close();
    chrome.kill();
    server.close();

    console.log(`[PASS] ALL ${testRes.result.value.count + 3} BROWSER STUDIO ASSERTIONS PASSED CLEANLY!`);
  } catch (err) {
    chrome.kill();
    server.close();
    throw err;
  }
}

runBrowserTests().catch(err => {
  console.error("Browser test error:", err);
  process.exit(1);
});
