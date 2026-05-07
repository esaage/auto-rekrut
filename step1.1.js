/**
 * 🤖 RECRUITMENT AUTO - PHASE 1.1 (SCHEDULE DATE PICKER)
 * 📍 Upload ke GitHub sebagai: step1.1.js
 * 🔗 Load via bookmarklet atau direct eval di console browser
 *
 * 📋 Workflow:
 * 1. Tunggu elemen #loc_cd siap
 * 2. Klik tombol filter/reset
 * 3. Pilih lokasi option:nth-child(7) di #loc_cd
 * 4. Trigger datepicker dari label di #myModal
 * 5. Klik tanggal hari ini (timezone Jakarta)
 * 6. Submit baris pertama di #tblSched & auto-confirm dialog
 */

(async function () {
  'use strict';
  console.log('🚀 [PHASE 1.1] Starting...');

  // ─────────────────────────────────────────────
  // 🛠️ UTILITY FUNCTIONS
  // ─────────────────────────────────────────────

  /** Tunggu sejumlah milidetik */
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  /**
   * Scroll ke elemen, fokus, lalu klik
   * @param {string} sel - CSS selector
   */
  const click = async (sel) => {
    const el = document.querySelector(sel);
    if (!el) throw new Error('❌ Not found: ' + sel);
    el.scrollIntoView({ behavior: 'auto', block: 'center' });
    await wait(100);
    el.focus();
    el.click();
    return el;
  };

  /**
   * Pilih opsi di <select> berdasarkan child selector,
   * lalu dispatch event change & input agar framework JS mendeteksi
   * @param {string} sel    - CSS selector dari <select>
   * @param {string} optSel - CSS selector dari <option> di dalam <select>
   */
  const selectOption = async (sel, optSel) => {
    const s = document.querySelector(sel);
    if (!s) throw new Error('❌ Select not found: ' + sel);
    s.scrollIntoView({ behavior: 'auto', block: 'center' });

    const o = s.querySelector(optSel);
    if (!o) throw new Error('❌ Option not found: ' + optSel);

    s.value = o.value;
    s.dispatchEvent(new Event('change', { bubbles: true }));
    s.dispatchEvent(new Event('input',  { bubbles: true }));
  };

  /**
   * Polling hingga elemen ditemukan di DOM atau timeout
   * @param {string} sel       - CSS selector yang ditunggu
   * @param {number} timeout   - Batas waktu tunggu (ms), default 10000
   * @param {number} poll      - Interval polling (ms), default 200
   */
  const waitForElement = (sel, timeout = 10000, poll = 200) => {
    const start = Date.now();
    return new Promise((res, rej) => {
      const check = () => {
        if (document.querySelector(sel)) return res();
        if (Date.now() - start > timeout) {
          return rej(new Error('⏱️ Timeout: ' + sel));
        }
        setTimeout(check, poll);
      };
      check();
    });
  };

  /**
   * Ambil tanggal hari ini dalam timezone Asia/Jakarta
   * @returns {{ day: number, formatted: string }}
   */
  const getJakartaToday = () => {
    const jkt = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
    );
    return {
      day: jkt.getDate(),
      formatted:
        jkt.getFullYear() +
        '-' +
        String(jkt.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(jkt.getDate()).padStart(2, '0'),
    };
  };

  /**
   * Trigger Bootstrap datepicker melalui label di dalam #myModal
   * Mendukung jQuery datepicker jika tersedia
   */
  const triggerDatepicker = async () => {
    const label = document.querySelector(
      '#myModal > div > div > div.modal-body > div.row > div > div > label'
    );
    if (!label) throw new Error('❌ Label not found');

    console.log('🔓 Triggering datepicker...');
    label.scrollIntoView({ behavior: 'auto', block: 'center' });
    label.click();
    label.focus();
    await wait(400);

    // Klik input yang direferensikan oleh label[for]
    const inputId = label.getAttribute('for');
    if (inputId) {
      const input = document.getElementById(inputId);
      if (input) {
        input.focus();
        input.click();
        input.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await wait(300);
      }

      // Fallback: panggil jQuery datepicker('show') jika ada
      if (typeof jQuery !== 'undefined') {
        const $input = jQuery('#' + inputId);
        if ($input.data('datepicker')) {
          $input.datepicker('show');
          await wait(400);
        }
      }
    }
  };

  /**
   * Jalankan triggerAction(), lalu pantau modal/dialog konfirmasi
   * dan auto-klik tombol OK/Confirm/Ya yang muncul
   * @param {Function} triggerAction - Fungsi yang memicu dialog
   * @param {number}   timeout       - Berapa lama dipantau (ms)
   */
  const autoHandleConfirmation = async (triggerAction, timeout = 5000) => {
    // Override alert & confirm agar tidak memblokir eksekusi
    const origAlert   = window.alert;
    const origConfirm = window.confirm;
    window.alert   = () => true;
    window.confirm = () => true;

    let clicked = false;

    const checkModal = () => {
      if (clicked) return;

      const containers = document.querySelectorAll(
        '.modal.show, .swal-modal, .swal2-popup, [role="dialog"], .sweet-alert, .ui-dialog'
      );

      for (const container of containers) {
        // Skip elemen yang tidak terlihat
        if (container.offsetParent === null) continue;

        const btns = container.querySelectorAll('button, [role="button"], a.btn');

        for (const btn of btns) {
          const txt = btn.textContent?.trim().toLowerCase();
          const isPrimary =
            btn.classList.contains('btn-primary') ||
            btn.classList.contains('swal-button--confirm') ||
            btn.classList.contains('swal2-confirm');

          if (
            isPrimary ||
            txt === 'ok' ||
            txt === 'confirm' ||
            txt === 'ya' ||
            txt === 'setuju' ||
            txt === 'submit'
          ) {
            clicked = true;
            btn.click();
            console.log('✅ Auto-clicked confirmation');
            return;
          }
        }
      }
    };

    const interval = setInterval(checkModal, 200);

    try {
      await Promise.resolve(triggerAction());
    } catch (e) {
      // Abaikan error dari triggerAction — dialog mungkin sudah muncul
    }

    // Tunggu hingga timeout selesai
    await new Promise((r) => setTimeout(r, timeout));
    clearInterval(interval);

    // Kembalikan alert & confirm ke semula
    window.alert   = origAlert;
    window.confirm = origConfirm;
  };

  // ─────────────────────────────────────────────
  // 🎯 MAIN EXECUTION
  // ─────────────────────────────────────────────

  try {
    await wait(500);

    // ── Step 1: Tunggu halaman siap ──
    console.log('⏳ Waiting for #loc_cd...');
    await waitForElement('#loc_cd', 12000);
    await wait(300);

    // ── Step 2: Klik tombol filter/reset ──
    console.log('🖱️  Step 2: Clicking filter button...');
    await click(
      'body > div > div > section.content > div > div:nth-child(2) > button'
    );
    await wait(800);

    // ── Step 3: Pilih lokasi option ke-7 ──
    console.log('📍 Step 3: Selecting location option:nth-child(7)...');
    await selectOption('#loc_cd', '#loc_cd > option:nth-child(7)');
    await wait(500);

    // ── Step 4: Buka datepicker ──
    console.log('📅 Step 4: Triggering datepicker...');
    await triggerDatepicker();

    const pickerBase = 'div.datepicker.datepicker-dropdown.dropdown-menu';
    console.log('⏳ Waiting for datepicker to appear...');
    await waitForElement(pickerBase, 12000);
    await wait(500);

    // ── Step 5: Klik tanggal hari ini ──
    const tbody = document.querySelector(
      pickerBase + ' > div.datepicker-days > table > tbody'
    );
    if (!tbody) throw new Error('❌ Calendar tbody not found');

    const { day, formatted } = getJakartaToday();
    console.log('🎯 Jakarta today:', formatted, '| Looking for day:', day);

    const cells = tbody.querySelectorAll('tr > td.day');
    let target = null;

    // Prioritas: hari yang tidak disabled/old/new
    for (const td of cells) {
      if (
        td.textContent.trim() === String(day) &&
        !td.classList.contains('disabled') &&
        !td.classList.contains('old') &&
        !td.classList.contains('new')
      ) {
        target = td;
        break;
      }
    }

    // Fallback: cari hari mana pun yang cocok & tidak disabled
    if (!target) {
      target = Array.from(cells).find(
        (td) =>
          td.textContent.trim() === String(day) &&
          !td.classList.contains('disabled')
      );
    }

    if (!target) throw new Error('❌ Date ' + day + ' not found in calendar');

    console.log('✅ Clicking today\'s date...');
    target.scrollIntoView({ behavior: 'auto', block: 'center' });
    await wait(150);
    target.click();
    await wait(800);

    // Tutup datepicker jika masih terbuka
    const picker = document.querySelector(pickerBase);
    if (picker?.classList.contains('in')) {
      document.body.click();
      await wait(300);
    }

    // ── Step 6: Submit baris pertama & auto-confirm ──
    console.log('✅ Step 6: Submit row #1 & auto-confirm...');
    await autoHandleConfirmation(() => {
      click(
        '#tblSched > table > tbody > tr:nth-child(1) > td:nth-child(9) > button'
      );
    }, 4000);

    console.log('✨ COMPLETED!');
    alert('✅ Proses selesai!');

  } catch (err) {
    console.error('❌ Failed:', err.message);
    alert('Error: ' + err.message);
  }
})();