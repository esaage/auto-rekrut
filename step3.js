/**
 * 🤖 RECRUITMENT AUTO - PHASE 1 (BATCH OPEN)
 * 📍 Upload ke GitHub sebagai: step1.js
 * 🔗 Load via bookmarklet atau direct eval
 * 
 * 📋 Workflow:
 * 1. Fetch emails.txt dari GitHub Raw
 * 2. Loop setiap email: input → search
 * 3. Jika "No data" → skip → next email
 * 4. Jika data ditemukan → buka link di TAB BARU
 * 5. Lanjut ke email berikutnya otomatis
 */
/**
 * 🤖 RECRUITMENT AUTO - PHASE 1 (BATCH OPEN)
 * 📍 Upload ke GitHub sebagai: step1.js
 * 🔗 Load via bookmarklet atau direct eval
 * 
 * 📋 Workflow:
 * 1. Fetch emails.txt dari GitHub Raw
 * 2. Loop setiap email: input → search
 * 3. Jika "No data" → skip → next email
 * 4. Jika data ditemukan → buka link di TAB BARU
 * 5. Lanjut ke email berikutnya otomatis
 */

(async function recruitmentPhase1_Batch() {
  'use strict';
  console.log('🚀 [PHASE 1 BATCH] Starting dynamic email processor...');

  // ⚙️ CONFIGURATION - EDIT SESUAI KEBUTUHAN
  const CONFIG = {
    // ⚠️ GANTI DENGAN URL RAW emails.txt KAMU
    EMAILS_URL: 'https://raw.githubusercontent.com/esaage/auto-rekrut/main/emails.txt',
    
    // Keys untuk sessionStorage (jangan diubah kecuali konflik)
    INDEX_KEY: '__rec_batch_idx__',
    OPENED_KEY: '__rec_opened_tabs__',
    
    // Delay antar buka tab (ms) - hindari popup blocker
    TAB_DELAY: 700,
    
    // Delay setelah search (ms) - tunggu response server
    SEARCH_DELAY: 1500
  };

  // 🛠️ UTILITY FUNCTIONS
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  const click = (selector) => {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`❌ Element not found: ${selector}`);
    el.click();
    return el;
  };

  const input = (selector, value) => {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`❌ Input not found: ${selector}`);
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return el;
  };

  // 📥 FETCH EMAIL LIST DARI GITHUB RAW
  const fetchEmails = async () => {
    try {
      console.log('📡 Fetching emails from:', CONFIG.EMAILS_URL);
      const response = await fetch(CONFIG.EMAILS_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      
      const text = await response.text();
      const emails = text
        .split('\n')
        .map(e => e.trim())
        .filter(e => e.includes('@') && e.length > 5 && !e.startsWith('#'));
      
      console.log(`✅ Loaded ${emails.length} valid emails`);
      return emails;
      
    } catch (err) {
      throw new Error(
        `❌ Gagal load emails.txt: ${err.message}\n\n` +
        `Pastikan:\n` +
        `• Repo GitHub PUBLIC\n` +
        `• URL raw benar: https://raw.githubusercontent.com/esaage/auto-rekrut/main/emails.txt\n` +
        `• File emails.txt ada & bisa diakses`
      );
    }
  };

  // 🔗 OPEN LINK IN NEW TAB (Bypass popup blocker friendly)
  const openInNewTab = (url) => {
    // Method 1: window.open (lebih clean)
    const newTab = window.open(url, '_blank', 'noopener,noreferrer');
    if (newTab) {
      return true;
    }
    
    // Method 2: Fallback dengan anchor element
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    return true;
  };

  // 🎯 MAIN EXECUTION
  try {
    // 1. Load email list
    const emails = await fetchEmails();
    if (emails.length === 0) {
      throw new Error('⚠️ emails.txt kosong atau tidak ada email valid');
    }

    // 2. Load progress dari sessionStorage
    let currentIndex = parseInt(sessionStorage.getItem(CONFIG.INDEX_KEY) || '0', 10);
    let openedCount = parseInt(sessionStorage.getItem(CONFIG.OPENED_KEY) || '0', 10);

    console.log(`📋 Queue: ${emails.length} emails`);
    console.log(`📍 Start from index: ${currentIndex}`);
    console.log(`🗂️ Tabs opened so far: ${openedCount}`);
    console.log('─'.repeat(50));

    // 3. Loop through emails
    while (currentIndex < emails.length) {
      const email = emails[currentIndex];
      console.log(`\n📧 [${currentIndex + 1}/${emails.length}] Processing: ${email}`);

      // ── Step A: Input email & search ──
      input('#email', email);
      await wait(300);
      
      click('#btnSearch');
      await wait(CONFIG.SEARCH_DELAY);

      // ── Step B: Check "No data" ──
      const noDataCell = document.querySelector('#datatable > tbody > tr > td');
      const noDataText = noDataCell?.textContent?.trim();
      
      if (noDataText && noDataText.includes('No data available in table')) {
        console.log(`   ⚪ Skip: No data found`);
        currentIndex++;
        sessionStorage.setItem(CONFIG.INDEX_KEY, String(currentIndex));
        continue; // Lanjut ke email berikutnya
      }

      // ── Step C: Data found! Open in new tab ──
      console.log(`   ✅ Data found! Opening new tab...`);
      
      // Klik action button untuk buka dropdown
      click('#datatable > tbody > tr > td.text-center > div > button');
      await wait(400);

      // Ambil link navigasi
      const navLink = document.querySelector(
        '#datatable > tbody > tr > td.text-center > div > ul > li:nth-child(1) > a'
      );
    //   navLink.click()
      if (!navLink) {
        throw new Error('❌ Navigation link not found - cek selector HTML');
      }

      const rawUrl = navLink.href || navLink.getAttribute('href');
      console.log(`   🔗 Original URL: ${rawUrl}`);

      // 🔄 TRANSFORM URL: /mst/candidate/sched/{id} → /tlnt/{id}
      const schedId = rawUrl.split('/').pop();
      const targetUrl = `https://karir.mitracomm.com/tlnt/${schedId}`;
      console.log(`   🔗 Modified URL: ${targetUrl}`);

      // 🗂️ BUKA TAB BARU (biarkan website handle behavior default)
      openInNewTab(targetUrl);
      openedCount++;
      
      console.log(`   🎉 Tab #${openedCount} opened successfully`);

      // ── Step D: Save progress & delay ──
      currentIndex++;
      sessionStorage.setItem(CONFIG.INDEX_KEY, String(currentIndex));
      sessionStorage.setItem(CONFIG.OPENED_KEY, String(openedCount));

      // Delay singkat agar tidak kena popup blocker browser
      await wait(CONFIG.TAB_DELAY);
    }

    // ── 🎉 ALL DONE ──
    console.log(`\n${'='.repeat(50)}`);
    console.log(`✨ [PHASE 1 BATCH] COMPLETED!`);
    console.log(`📊 Summary:`);
    console.log(`   • Total emails processed: ${emails.length}`);
    console.log(`   • Tabs opened: ${openedCount}`);
    console.log(`   • Skipped (no data): ${emails.length - openedCount}`);
    console.log(`\n💡 Next step: Klik Phase 2 bookmark di tiap tab yang terbuka`);
    console.log(`${'='.repeat(50)}`);

    // Reset progress untuk sesi berikutnya
    sessionStorage.removeItem(CONFIG.INDEX_KEY);
    sessionStorage.removeItem(CONFIG.OPENED_KEY);

    alert(
      `🎉 Phase 1 Selesai!\n\n` +
      `✅ ${openedCount} tab kandidat berhasil dibuka\n` +
      `⚪ ${emails.length - openedCount} email di-skip (no data)\n\n` +
      `👉 Sekarang buka tiap tab, lalu klik bookmark Phase 2 untuk proses.`
    );

  } catch (err) {
    console.error('❌ [PHASE 1] Failed:', err.message);
    console.error('🔍 Stack:', err.stack);
    alert(`❌ Error Phase 1:\n\n${err.message}`);
  }
})();