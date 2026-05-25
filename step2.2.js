/**
 * 🤖 RECRUITMENT AUTO - PHASE 2.2 (INTERVIEW FORM SUBMISSION)
 * 📍 Upload ke GitHub sebagai: step2.2.js
 * 🔗 Load via bookmarklet atau direct eval
 *
 * 📋 Workflow (dijalankan di halaman detail kandidat):
 * 1. Click #btnItvw
 * 2. Select #vacancy_src_cd → option:nth-child(11)
 * 3. Click #q1 > ... > div:nth-child(2) > div > label:nth-child(2)
 * 4. Click #q1 > ... > div:nth-child(3) > div > label:nth-child(1)
 * 5. Click #q1 > ... > div:nth-child(4) > div > label:nth-child(1) > div
 * 6. Click #q1 > ... > div.box-footer > button (Submit q1)
 * 7. Type "ok" on #notes
 * 8. Click #q2 > ... > span.selection > span  (buka select2 dropdown)
 * 9. Click #select2-proc_result_cd-result-1y8c-P (pilih opsi P)
 * 10. Click #q2 > ... > button.btn.btn-primary.pull-right (Submit q2)
 */

(async function recruitmentPhase22_InterviewForm() {
    'use strict';
    console.log('🚀 [PHASE 2.2] Starting interview form submission...');

    // ⚙️ CONFIGURATION
    const CONFIG = {
        AFTER_CLICK:  600,   // setelah klik tombol
        AFTER_SELECT: 600,   // setelah pilih dropdown
        AFTER_OPEN:  1500,   // tunggu form/modal terbuka
        AFTER_SUBMIT: 1500,  // tunggu setelah submit / transisi ke q2
        AFTER_TYPE:   400,   // setelah ketik teks
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
//
    /**
     * Pilih opsi di <select> berdasarkan child selector,
     * lalu dispatch change & input agar framework JS mendeteksi
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
    // 🎯 MAIN EXECUTION
    // ─────────────────────────────────────────────

    try {
        // ── Step 1: Klik tombol Interview ──
        console.log('   🔘 Step 1: Clicking #btnItvw...');
        click('#btnItvw');
        await wait(CONFIG.AFTER_OPEN);

        // ── Step 2: Pilih opsi ke-11 di #vacancy_src_cd ──
        console.log('   📋 Step 2: Selecting #vacancy_src_cd option:nth-child(11)...');
        selectOption('#vacancy_src_cd', '#vacancy_src_cd > option:nth-child(11)');
        await wait(CONFIG.AFTER_SELECT);

        // ── Step 3: Klik label:nth-child(2) di pertanyaan ke-2 ──
        console.log('   🖱️  Step 3: Clicking answer for question 2...');
        click('#q1 > div > div.box-body > div:nth-child(2) > div > label:nth-child(2)');
        await wait(CONFIG.AFTER_CLICK);

        // ── Step 4: Klik label:nth-child(1) di pertanyaan ke-3 ──
        console.log('   🖱️  Step 4: Clicking answer for question 3...');
        click('#q1 > div > div.box-body > div:nth-child(3) > div > label:nth-child(1)');
        await wait(CONFIG.AFTER_CLICK);

        // ── Step 5: Klik label:nth-child(1) > div di pertanyaan ke-4 ──
        console.log('   🖱️  Step 5: Clicking answer for question 4...');
        click('#q1 > div > div.box-body > div:nth-child(4) > div > label:nth-child(1) > div');
        await wait(CONFIG.AFTER_CLICK);

        // ── Step 6: Submit form q1 ──
        console.log('   ✅ Step 6: Clicking submit q1 button...');
        click('#q1 > div > div.box-footer > button');
        await wait(CONFIG.AFTER_SUBMIT);

        // ── Step 7: Ketik "ok" di #notes ──
        console.log('   ✏️  Step 7: Typing "ok" into #notes...');
        const notesEl = document.querySelector('#notes');
        if (!notesEl) throw new Error('❌ Element not found: #notes');
        notesEl.focus();
        notesEl.value = 'ok';
        notesEl.dispatchEvent(new Event('input',  { bubbles: true }));
        notesEl.dispatchEvent(new Event('change', { bubbles: true }));
        await wait(CONFIG.AFTER_TYPE);

        // ── Step 8 & 9: Pilih "Passed" di select2 proc_result_cd ──
        console.log('   🖱️  Step 8-9: Setting proc_result_cd = P (Passed)...');
        const procSelect = document.querySelector('#proc_result_cd');
        if (!procSelect) throw new Error('❌ #proc_result_cd not found');

        if (window.jQuery && typeof window.jQuery.fn.select2 !== 'undefined') {
          // Gunakan jQuery Select2 API — paling reliable, tidak perlu buka dropdown
          window.jQuery('#proc_result_cd').val('P').trigger('change');
          console.log('   ✅ Set via jQuery Select2 API');
        } else {
          // Fallback: open dropdown lalu klik opsi "P"
          const s2Container = procSelect.nextElementSibling;
          const selection = s2Container && s2Container.querySelector('.select2-selection');
          if (!selection) throw new Error('❌ Select2 selection not found');
          selection.click();
          await wait(CONFIG.AFTER_CLICK);

          // Klik li option yang mengandung "Passed" atau value P
          const optionP =
            document.querySelector('li[id*="proc_result_cd"][id$="-P"]') ||
            Array.from(document.querySelectorAll('.select2-results__option'))
              .find(el => el.textContent.trim() === 'Passed');
          if (!optionP) throw new Error('❌ Option "Passed" not found in dropdown');
          optionP.click();
          console.log('   ✅ Clicked option Passed via DOM');
        }
        await wait(CONFIG.AFTER_SELECT);

        // ── Step 10: Submit form q2 ──
        console.log('   ✅ Step 10: Clicking submit q2 button...');
        click('#q2 > div > div.box-footer > div > button.btn.btn-primary.pull-right');
        await wait(CONFIG.AFTER_SUBMIT);

        console.log('🎉 [PHASE 2.2] All steps completed successfully!');

    } catch (err) {
        console.error('❌ [PHASE 2.2] Failed:', err.message);
        console.error('🔍 Stack:', err.stack);
        alert(`❌ Error Phase 2.2:\n\n${err.message}`);
    }
})();
