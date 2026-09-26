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
    console.log("⚠ Chromium/Chrome not found; skipping headless browser tests.");
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

          return { success: true, count: checks.length };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });

    ws.close();
    chrome.kill();
    server.close();

    if (testRes.exceptionDetails) {
      throw new Error("Browser test assertion failed: " + JSON.stringify(testRes.exceptionDetails));
    }
    console.log(`✔ ALL ${testRes.result.value.count} BROWSER STUDIO ASSERTIONS PASSED CLEANLY!`);
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
