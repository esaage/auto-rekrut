(async function recruitmentPhase3_1() {
  'use strict';
  console.log('🚀 [PHASE 3.1] Starting brief setup automation...');

  // ⚙️ CONFIG
  const JO_ID_URL = 'https://raw.githubusercontent.com/esaage/auto-rekrut/main/jo_id.txt';

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
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };

  try {
    // 📡 Fetch JO ID dari GitHub
    console.log('📡 Fetching JO ID from GitHub...');
    const res = await fetch(JO_ID_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const JO_ID = (await res.text()).trim();
    console.log(`✅ JO ID: ${JO_ID}`);

    // ── Step 1: Klik tombol Submit/Save ──
    console.log('1️⃣ Clicking submit button...');
    click('body > div > div > section.content > div:nth-child(1) > div.col-sm-5 > div > div.box-footer > button.btn.btn-success.pull-right');
    await wait(1000);

    // ── Step 2 & 3: Pilih #loc_cd option ke-6 ──
    console.log('2️⃣ Selecting #loc_cd option 6...');
    const locSelect = document.querySelector('#loc_cd');
    if (!locSelect) throw new Error('❌ #loc_cd not found');
    const opt6 = locSelect.querySelector('option:nth-child(6)');
    if (!opt6) throw new Error('❌ Option ke-6 tidak ditemukan di #loc_cd');
    setNativeValue(locSelect, opt6.value);
    console.log(`   ✅ Selected: ${opt6.value} - ${opt6.text}`);
    await wait(400);

    // ── Step 4: Set tanggal besok ──
    console.log('4️⃣ Setting tomorrow\'s date...');
    const dateInput = document.querySelector(
      '#modal-setbrief > div > div > div.modal-body > div:nth-child(2) > div > input'
    );
    if (!dateInput) throw new Error('❌ Date input not found');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dd   = String(tomorrow.getDate()).padStart(2, '0');
    const mm   = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const yyyy = tomorrow.getFullYear();

    // Coba format yyyy-mm-dd (native date input), fallback ke dd/mm/yyyy (datepicker)
    const dateStr = dateInput.type === 'date'
      ? `${yyyy}-${mm}-${dd}`
      : `${dd}/${mm}/${yyyy}`;

    setNativeValue(dateInput, dateStr);
    console.log(`   ✅ Date set: ${dateStr}`);
    await wait(400);

    // ── Step 5: Buka Select2 dropdown jo_id ──
    console.log('5️⃣ Opening Select2 dropdown for jo_id...');
    const joSelect = document.querySelector('#jo_id');
    if (!joSelect) throw new Error('❌ #jo_id select not found');

    if (window.jQuery && typeof window.jQuery.fn.select2 !== 'undefined') {
      // Gunakan jQuery Select2 API (paling reliable)
      window.jQuery('#jo_id').select2('open');
      console.log('   ✅ Opened via jQuery Select2 API');
    } else {
      // Fallback: klik .select2-selection di container sibling
      const s2Container = joSelect.nextElementSibling; // span.select2-container
      const selection = s2Container && s2Container.querySelector('.select2-selection');
      if (!selection) throw new Error('❌ Select2 selection element not found');
      selection.click();
      console.log('   ✅ Opened via .click()');
    }
    await wait(600);

    // ── Step 6: Ketik JO ID di search box ──
    console.log(`6️⃣ Typing JO ID: ${JO_ID}...`);
    const searchInput =
      document.querySelector('.select2-dropdown .select2-search__field') ||
      document.querySelector('.select2-search--dropdown input');
    if (!searchInput) throw new Error('❌ Select2 search input not found');
    searchInput.focus();
    setNativeValue(searchInput, JO_ID);
    searchInput.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    await wait(300);

    // ── Step 7: Tunggu hasil muncul lalu klik ──
    console.log('7️⃣ Waiting for search results...');
    const firstResult = await (async () => {
      const deadline = Date.now() + 8000; // max 8 detik
      while (Date.now() < deadline) {
        const el =
          document.querySelector('.select2-results__option:not(.select2-results__message)') ||
          document.querySelector('.select2-results > ul > li');
        if (el && el.textContent.trim() && !el.textContent.includes('Searching')) return el;
        await wait(300);
      }
      return null;
    })();
    if (!firstResult) throw new Error('❌ No results found for JO ID: ' + JO_ID);

    // Select2 merespons mousedown+mouseup, bukan click biasa
    firstResult.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    firstResult.dispatchEvent(new MouseEvent('mouseup',   { bubbles: true, cancelable: true }));
    firstResult.dispatchEvent(new MouseEvent('click',     { bubbles: true, cancelable: true }));
    console.log('   ✅ Result selected: ' + firstResult.textContent.trim());
    await wait(400);

    // ── Step 8: Isi waktu 08.00 ──
    console.log('8️⃣ Setting time to 08.00...');
    const timeInput = document.querySelector(
      '#modal-setbrief > div > div > div.modal-body > div:nth-child(4) > div > input'
    );
    if (!timeInput) throw new Error('❌ Time input not found');
    setNativeValue(timeInput, '8:00');
    console.log('   ✅ Time set: 8:00');
    await wait(1000);

    // ── Step 9: Klik Save ──
    console.log('9️⃣ Clicking Save...');
    const saveBtn = document.querySelector('#modal-setbrief > div > div > div.modal-footer > button.btn.btn-primary');
    if (!saveBtn) throw new Error('❌ Save button not found');
    saveBtn.click();
    console.log('   ✅ Save clicked');
    await wait(1000);

    console.log('\n✅ [PHASE 3.1] Brief setup selesai!');

  } catch (err) {
    console.error('❌ [PHASE 3.1] Failed:', err.message);
    alert(`❌ Error Phase 3.1:\n\n${err.message}`);
  }
})();
