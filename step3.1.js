(async function recruitmentPhase3_1() {
  'use strict';
  console.log('🚀 [PHASE 3.1] Starting brief setup automation (DYNAMIC JO_ID)...');

  // ⚙️ CONFIG
  // ⚠️ Ganti dengan URL domain kamu
  const JO_IDS_URL       = 'https://adek-cantik.esaage.com/index.php?action=jo_ids';
  const BRIEFING_DATE_URL = 'https://adek-cantik.esaage.com/index.php?action=briefing_date';

  // Progress key untuk sessionStorage (resume jika reload)
  const INDEX_KEY = '__rec31_jo_idx__';
  const DONE_KEY  = '__rec31_done__';

  // ─── DELAY ───────────────────────────────────────────
  const DELAYS = {
    AFTER_SUBMIT:  1000,
    AFTER_LOC:      400,
    AFTER_DATE:     400,
    AFTER_OPEN:     600,
    AFTER_TYPE:     300,
    SEARCH_TIMEOUT: 8000,
    SEARCH_POLL:    300,
    AFTER_SELECT:   400,
    AFTER_TIME:    1000,
    AFTER_SAVE:    1500,   // beri waktu server proses sebelum lanjut JO ID berikutnya
    BETWEEN_JO:    1200,
  };

  // 🛠️ UTILS
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const click = (selector) => {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`❌ Element not found: ${selector}`);
    el.click();
    return el;
  };

  const setNativeValue = (el, value) => {
    el.value = value;
    el.dispatchEvent(new Event('input',  { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };

  // ─── FETCH BRIEFING DATE FOR A JO_ID ─────────────────
  const fetchBriefingDate = async (JO_ID) => {
    const url = `${BRIEFING_DATE_URL}&jo_id=${encodeURIComponent(JO_ID)}`;
    console.log(`📡 Fetching briefing date for ${JO_ID}:`, url);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching briefing_date`);
    const dateStr = (await res.text()).trim(); // format: YYYY-MM-DD from MySQL
    if (!dateStr) throw new Error(`⚠️ Tanggal briefing kosong untuk JO ID: ${JO_ID}`);
    return dateStr; // "YYYY-MM-DD"
  };

  // ─── FETCH LIST JO_IDs DARI PHP API ──────────────────
  const fetchJoIds = async () => {
    console.log('📡 Fetching JO IDs from:', JO_IDS_URL);
    const res = await fetch(JO_IDS_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const text = await res.text();
    const ids = text
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('#'));
    if (ids.length === 0) throw new Error('⚠️ Tidak ada JO ID dari API. Pastikan sudah ada data di database.');
    console.log(`✅ Loaded ${ids.length} JO ID(s):`, ids);
    return ids;
  };

  // ─── PROSES 1 JO_ID ──────────────────────────────────
  const processOneJoId = async (JO_ID, briefingDateISO) => {
    console.log(`\n🏷️ Processing JO ID: ${JO_ID}`);

    // ── Step 1: Klik tombol Submit/Save ──
    console.log('  1️⃣ Clicking submit button...');
    click('body > div > div > section.content > div:nth-child(1) > div.col-sm-5 > div > div.box-footer > button.btn.btn-success.pull-right');
    await wait(DELAYS.AFTER_SUBMIT);

    // ── Step 2 & 3: Pilih #loc_cd option ke-6 ──
    console.log('  2️⃣ Selecting #loc_cd option 6...');
    const locSelect = document.querySelector('#loc_cd');
    if (!locSelect) throw new Error('❌ #loc_cd not found');
    const opt6 = locSelect.querySelector('option:nth-child(6)');
    if (!opt6) throw new Error('❌ Option ke-6 tidak ditemukan di #loc_cd');
    setNativeValue(locSelect, opt6.value);
    console.log(`     ✅ Selected: ${opt6.value} - ${opt6.text}`);
    await wait(DELAYS.AFTER_LOC);

    // ── Step 4: Set tanggal briefing dari database ──
    console.log(`  4️⃣ Setting briefing date to: ${briefingDateISO}...`);
    const dateInput = document.querySelector(
      '#modal-setbrief > div > div > div.modal-body > div:nth-child(2) > div > input'
    );
    if (!dateInput) throw new Error('❌ Date input not found');

    // briefingDateISO is "YYYY-MM-DD" from DB
    const [yyyy, mm, dd] = briefingDateISO.split('-');
    const dateStr = dateInput.type === 'date'
      ? `${yyyy}-${mm}-${dd}`
      : `${dd}/${mm}/${yyyy}`;
    setNativeValue(dateInput, dateStr);
    console.log(`     ✅ Date set: ${dateStr}`);
    await wait(DELAYS.AFTER_DATE);

    // ── Step 5: Buka Select2 dropdown jo_id ──
    console.log('  5️⃣ Opening Select2 dropdown for jo_id...');
    const joSelect = document.querySelector('#jo_id');
    if (!joSelect) throw new Error('❌ #jo_id select not found');

    if (window.jQuery && typeof window.jQuery.fn.select2 !== 'undefined') {
      window.jQuery('#jo_id').select2('open');
      console.log('     ✅ Opened via jQuery Select2 API');
    } else {
      const s2Container = joSelect.nextElementSibling;
      const selection = s2Container && s2Container.querySelector('.select2-selection');
      if (!selection) throw new Error('❌ Select2 selection element not found');
      selection.click();
      console.log('     ✅ Opened via .click()');
    }
    await wait(DELAYS.AFTER_OPEN);

    // ── Step 6: Ketik JO ID di search box ──
    console.log(`  6️⃣ Typing JO ID: ${JO_ID}...`);
    const searchInput =
      document.querySelector('.select2-dropdown .select2-search__field') ||
      document.querySelector('.select2-search--dropdown input');
    if (!searchInput) throw new Error('❌ Select2 search input not found');
    searchInput.focus();
    setNativeValue(searchInput, JO_ID);
    searchInput.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    await wait(DELAYS.AFTER_TYPE);

    // ── Step 7: Tunggu hasil muncul lalu klik ──
    console.log('  7️⃣ Waiting for search results...');
    const firstResult = await (async () => {
      const deadline = Date.now() + DELAYS.SEARCH_TIMEOUT;
      while (Date.now() < deadline) {
        const el =
          document.querySelector('.select2-results__option:not(.select2-results__message)') ||
          document.querySelector('.select2-results > ul > li');
        if (el && el.textContent.trim() && !el.textContent.includes('Searching')) return el;
        await wait(DELAYS.SEARCH_POLL);
      }
      return null;
    })();
    if (!firstResult) throw new Error(`❌ No results found for JO ID: ${JO_ID}`);

    firstResult.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    firstResult.dispatchEvent(new MouseEvent('mouseup',   { bubbles: true, cancelable: true }));
    firstResult.dispatchEvent(new MouseEvent('click',     { bubbles: true, cancelable: true }));
    console.log('     ✅ Result selected: ' + firstResult.textContent.trim());
    await wait(DELAYS.AFTER_SELECT);

    // ── Step 8: Isi waktu 08.00 ──
    console.log('  8️⃣ Setting time to 08.00...');
    const timeInput = document.querySelector(
      '#modal-setbrief > div > div > div.modal-body > div:nth-child(4) > div > input'
    );
    if (!timeInput) throw new Error('❌ Time input not found');
    setNativeValue(timeInput, '8:00');
    console.log('     ✅ Time set: 8:00');
    await wait(DELAYS.AFTER_TIME);

    // ── Step 9: Klik Save ──
    console.log('  9️⃣ Clicking Save...');
    const saveBtn = document.querySelector('#modal-setbrief > div > div > div.modal-footer > button.btn.btn-primary');
    if (!saveBtn) throw new Error('❌ Save button not found');
    saveBtn.click();
    console.log('     ✅ Save clicked');
    await wait(DELAYS.AFTER_SAVE);

    console.log(`  🎉 JO ID ${JO_ID} selesai diproses!`);
  };

  // ─── MAIN ────────────────────────────────────────────
  try {
    const joIds = await fetchJoIds();

    // Resume dari sessionStorage jika ada
    let currentIndex = parseInt(sessionStorage.getItem(INDEX_KEY) || '0', 10);
    let doneCount    = parseInt(sessionStorage.getItem(DONE_KEY)  || '0', 10);

    console.log(`📋 Total JO IDs : ${joIds.length}`);
    console.log(`📍 Start index  : ${currentIndex}`);
    console.log(`✅ Done so far  : ${doneCount}`);
    console.log('-'.repeat(50));

    while (currentIndex < joIds.length) {
      const joId = joIds[currentIndex];
      console.log(`\n[${currentIndex + 1}/${joIds.length}] Processing JO ID: ${joId}`);

      try {
        const briefingDate = await fetchBriefingDate(joId);
        await processOneJoId(joId, briefingDate);
        doneCount++;
      } catch (err) {
        console.warn(`   ⚠️ Skip "${joId}": ${err.message}`);
      }

      currentIndex++;
      sessionStorage.setItem(INDEX_KEY, String(currentIndex));
      sessionStorage.setItem(DONE_KEY,  String(doneCount));

      await wait(DELAYS.BETWEEN_JO);
    }

    // ── ALL DONE ──
    console.log('\n' + '='.repeat(50));
    console.log('✨ [PHASE 3.1] SEMUA JO ID SELESAI!');
    console.log(`📊 Total diproses : ${doneCount} / ${joIds.length}`);
    console.log('='.repeat(50));

    sessionStorage.removeItem(INDEX_KEY);
    sessionStorage.removeItem(DONE_KEY);

    alert(
      `✅ Phase 3.1 Selesai!\n\n` +
      `🏷️ ${doneCount} JO ID berhasil diproses\n` +
      `⚪ ${joIds.length - doneCount} JO ID di-skip (error)\n\n` +
      `🌸 Semua brief sudah di-set!`
    );

  } catch (err) {
    console.error('❌ [PHASE 3.1] Failed:', err.message);
    console.error('🔍 Stack:', err.stack);
    alert(`❌ Error Phase 3.1:\n\n${err.message}`);
  }
})();
