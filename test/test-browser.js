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

          loadPreset('auto');
          assert(isAutoMode === true, 'Auto preset enabled');

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

          selectStageShake(0, 'glitch');
          assert(stages[0].shake === 'glitch', 'Shake glitch set');

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

          // Animation selection
          selectAnimation('glitch');
          assert(currentAnimation === 'glitch', 'Animation glitch selected');
          assert(document.getElementById('code-markdown').innerText.includes('anim=glitch'), 'Markdown includes anim=glitch');

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

          // Defeated banner update
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

          copyCLI();
          await new Promise(r => setTimeout(r, 100));
          assert(document.getElementById('toast-text').innerText.includes('Copied'), 'Copy CLI triggered');

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
