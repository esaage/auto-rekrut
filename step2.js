/**
 * 🤖 RECRUITMENT AUTO - PHASE 2 (DATA ENTRY BY NAME)
 * 📍 Upload ke GitHub sebagai: step2.js
 * 🔗 Load via bookmarklet atau direct eval
 *
 * 📋 Workflow (per nama dari nama.txt):
 * 1. Type nama dari nama.txt ke #full_nm
 * 2. Click #loc_cd (dropdown lokasi)
 * 3. Click #loc_cd > option:nth-child(7) (pilih opsi ke-7)
 * 4. Click #btnSearch
 * 5. Click #datatable > tbody > tr > td:nth-child(11) > div > button
 * 6. Click #datatable > tbody > tr > td:nth-child(11) > div > ul > li:nth-child(2) > a
 * 7. Click #myModal > div > div > div.modal-footer > a
 * 8. Ulangi untuk nama berikutnya
 */

(async function recruitmentPhase2_ByName() {
  'use strict';
  console.log('🚀 [PHASE 2] Starting name-based data entry processor...');

  // ⚙️ CONFIGURATION - EDIT SESUAI KEBUTUHAN
  const CONFIG = {
    // ⚠️ GANTI DENGAN URL DOMAIN KAMU (tempat index.php di-deploy)
    // Contoh: 'https://yourdomain.com/index.php?action=names'
    // Atau tambahkan ?jo_id=JO-001 untuk filter per JO ID
    NAMES_URL: 'https://adek-cantik.esaage.com/index.php?action=names',

    // Keys untuk sessionStorage (progress resume jika reload)
    INDEX_KEY: '__rec2_name_idx__',
    DONE_KEY:  '__rec2_done_cnt__',

    // Delay (ms)
    AFTER_INPUT:   400,   // setelah ketik nama
    AFTER_SELECT:  400,   // setelah pilih lokasi
    AFTER_SEARCH: 2000,   // tunggu hasil datatable muncul
    AFTER_CLICK:   600,   // setelah klik action button (buka dropdown)
    AFTER_ACTION: 1000,   // setelah klik menu item (tunggu proses server)
    BETWEEN_LOOP: 1000,   // jeda antar nama
  };

  // ─────────────────────────────────────────────
  // 🛠️ UTILITY FUNCTIONS
  // ─────────────────────────────────────────────

  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  /** Klik elemen berdasarkan CSS selector */
  const click = (selector) => {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`❌ Element not found: ${selector}`);
    el.click();
    return el;
  };

  /** Set value input & trigger events agar framework JS mendeteksi perubahan */
  const typeValue = (selector, value) => {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`❌ Input not found: ${selector}`);
    el.focus();
    el.value = value;
    el.dispatchEvent(new Event('input',  { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    return el;
  };

  /**
   * Pilih opsi di <select> berdasarkan child selector,
   * lalu dispatch change & input agar framework JS mendeteksi
   * @param {string} sel    - CSS selector dari <select>
   * @param {string} optSel - CSS selector dari <option> di dalam <select>
   */
  const selectOption = (sel, optSel) => {
    const s = document.querySelector(sel);
    if (!s) throw new Error(`❌ Select not found: ${sel}`);
    const o = s.querySelector(optSel);
    if (!o) throw new Error(`❌ Option not found: ${optSel}`);
    s.value = o.value;
    s.dispatchEvent(new Event('change', { bubbles: true }));
    s.dispatchEvent(new Event('input',  { bubbles: true }));
    return s;
  };

  // ─────────────────────────────────────────────
  // 📥 FETCH NAMA LIST DARI GITHUB RAW
  // ─────────────────────────────────────────────

  const fetchNames = async () => {
    try {
      console.log('📡 Fetching names from:', CONFIG.NAMES_URL);
      const response = await fetch(CONFIG.NAMES_URL);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const text = await response.text();
      const names = text
        .split('\n')
        .map(n => n.trim())
        .filter(n => n.length > 0 && !n.startsWith('#'));

      console.log(`✅ Loaded ${names.length} valid names`);
      return names;

    } catch (err) {
      throw new Error(
        `❌ Gagal load nama.txt: ${err.message}\n\n` +
        `Pastikan:\n` +
        `• Repo GitHub PUBLIC\n` +
        `• URL raw benar: ${CONFIG.NAMES_URL}\n` +
        `• File nama.txt ada & bisa diakses`
      );
    }
  };

  // ─────────────────────────────────────────────
  // 🎯 MAIN EXECUTION
  // ─────────────────────────────────────────────

  try {
    // 1. Load daftar nama
    const names = await fetchNames();
    if (names.length === 0) {
      throw new Error('⚠️ nama.txt kosong atau tidak ada nama valid');
    }

    // 2. Load progress dari sessionStorage (resume support)
    let currentIndex = parseInt(sessionStorage.getItem(CONFIG.INDEX_KEY) || '0', 10);
    let doneCount    = parseInt(sessionStorage.getItem(CONFIG.DONE_KEY)  || '0', 10);
    const skippedNames = [];  // Track nama yang di-skip

    console.log(`📋 Total names   : ${names.length}`);
    console.log(`📍 Start index   : ${currentIndex}`);
    console.log(`✅ Done so far   : ${doneCount}`);
    console.log('─'.repeat(50));

    // 3. Loop setiap nama
    while (currentIndex < names.length) {
      const name = names[currentIndex];
      console.log(`\n👤 [${currentIndex + 1}/${names.length}] Processing: "${name}"`);

      // ── Step 1: Ketik nama ke #full_nm ──
      console.log('   ✏️  Step 1: Typing name into #full_nm...');
      typeValue('#full_nm', name);
      await wait(CONFIG.AFTER_INPUT);

      // ── Step 2 & 3: Pilih lokasi option ke-7 di #loc_cd ──
      console.log('   📍 Step 2-3: Selecting #loc_cd option:nth-child(7)...');
      selectOption('#loc_cd', '#loc_cd > option:nth-child(7)');
      await wait(CONFIG.AFTER_SELECT);

      // ── Step 4: Klik tombol Search ──
      console.log('   🔍 Step 4: Clicking #btnSearch...');
      click('#btnSearch');
      await wait(CONFIG.AFTER_SEARCH);

      // ── Cek apakah ada data ──
      const noDataCell = document.querySelector('#datatable > tbody > tr > td');
      const noDataText = noDataCell?.textContent?.trim() ?? '';

      if (noDataText.includes('No data available in table')) {
        console.log(`   ⚪ No data found for "${name}" → Skipping`);
        skippedNames.push(name);  // Catat nama yang di-skip
        currentIndex++;
        sessionStorage.setItem(CONFIG.INDEX_KEY, String(currentIndex));
        await wait(CONFIG.BETWEEN_LOOP);
        continue;
      }

      // ── Step 5: Klik action button (buka dropdown) ──
      console.log('   🔘 Step 5: Clicking action button...');
      click('#datatable > tbody > tr > td:nth-child(11) > div > button');
      await wait(CONFIG.AFTER_CLICK);

      // ── Step 6: Klik tombol Attend ──
      console.log('   🖱️  Step 6: Clicking Attend button...');
      click('#datatable > tbody > tr > td:nth-child(11) > div > ul > li:nth-child(2) > a');
      await wait(CONFIG.AFTER_ACTION);

      // ── Step 7: Klik konfirmasi modal ──
      console.log('   🖱️  Step 7: Clicking modal confirmation button...');
      click('#myModal > div > div > div.modal-footer > a');
      await wait(CONFIG.AFTER_ACTION);

      doneCount++;
      console.log(`   🎉 Done! (${doneCount} processed)`);

      // ── Save progress ──
      currentIndex++;
      sessionStorage.setItem(CONFIG.INDEX_KEY, String(currentIndex));
      sessionStorage.setItem(CONFIG.DONE_KEY,  String(doneCount));

      await wait(CONFIG.BETWEEN_LOOP);
    }

    // ── 🎉 ALL DONE ──
    console.log(`\n${'='.repeat(50)}`);
    console.log('✨ [PHASE 2] COMPLETED!');
    console.log('📊 Summary:');
    console.log(`   • Total names processed : ${names.length}`);
    console.log(`   • Berhasil diproses     : ${doneCount}`);
    console.log(`   • Skipped (no data)     : ${names.length - doneCount}`);
    console.log(`${'='.repeat(50)}`);

    // Reset progress untuk sesi berikutnya
    sessionStorage.removeItem(CONFIG.INDEX_KEY);
    sessionStorage.removeItem(CONFIG.DONE_KEY);

    const skippedSummary = skippedNames.length > 0
      ? `\n\nNama di-skip (${skippedNames.length}):\n` + skippedNames.map((n, i) => `${i + 1}. ${n}`).join('\n')
      : '';

    alert(
      ` Phase 2 Selesai!\n\n` +
      `${doneCount} nama berhasil diproses\n` +
      `${skippedNames.length} nama di-skip (no data)` +
      skippedSummary +
      `\n\n Proses selesai!`
    );

  } catch (err) {
    console.error('[PHASE 2] Failed:', err.message);
    console.error('Stack:', err.stack);
    alert(`Error Phase 2:\n\n${err.message}`);
  }
})();
