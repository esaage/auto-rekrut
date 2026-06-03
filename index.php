<?php

/**
 * 🌸 ADEK CANTIK BOT - Data Input Portal
 * Stores JO_ID, name, email to MySQL database
 * API endpoints for step1.js, step2.js, step3.js
 */

// Prevent mysqli from throwing fatal exceptions — handle errors manually
mysqli_report(MYSQLI_REPORT_OFF);

// ─────────────────────────────────────────
// DATABASE CONFIG — Edit sesuai server kamu
// ─────────────────────────────────────────
define('DB_HOST', 'localhost');
define('DB_USER', 'esaageco_esa');       // ganti dengan username MySQL
define('DB_PASS', '58V3cBJ');           // ganti dengan password MySQL
define('DB_NAME', 'esaageco_adek_cantik_bot');

// ─────────────────────────────────────────
// CORS & JSON HEADER (for API endpoints)
// ─────────────────────────────────────────
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ─────────────────────────────────────────
// DB CONNECTION
// ─────────────────────────────────────────
function getDB()
{
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) {
        // Try to create database if not exists
        $conn2 = new mysqli(DB_HOST, DB_USER, DB_PASS);
        if ($conn2->connect_error) {
            die(json_encode(['error' => 'DB connection failed: ' . $conn2->connect_error]));
        }
        $conn2->query("CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        $conn2->close();
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        if ($conn->connect_error) {
            die(json_encode(['error' => 'DB connection failed: ' . $conn->connect_error]));
        }
    }
    $conn->set_charset('utf8mb4');

    // Create table if not exists
    $conn->query("CREATE TABLE IF NOT EXISTS `users` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `jo_id` VARCHAR(100) NOT NULL,
        `name` VARCHAR(500) NOT NULL,
        `email` VARCHAR(500) NOT NULL,
        `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX `idx_jo_id` (`jo_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    return $conn;
}

// ─────────────────────────────────────────
// ROUTE: API ENDPOINTS
// ─────────────────────────────────────────
$action = $_GET['action'] ?? '';

// ─── DEBUG ENDPOINT (hapus setelah berhasil!) ───────
// Buka: https://adek-cantik.esaage.com/index.php?action=debug
if ($action === 'debug') {
    header('Content-Type: text/plain; charset=utf-8');
    echo "=== ADEK CANTIK BOT - DEBUG ===\n\n";
    echo "PHP Version: " . PHP_VERSION . "\n";
    echo "DB_HOST: " . DB_HOST . "\n";
    echo "DB_USER: " . DB_USER . "\n";
    echo "DB_NAME: " . DB_NAME . "\n\n";

    // Test connection WITHOUT db name
    $c1 = new mysqli(DB_HOST, DB_USER, DB_PASS);
    if ($c1->connect_error) {
        echo "❌ Connection FAILED (no db): " . $c1->connect_error . "\n";
        echo "\n💡 Kemungkinan username/password salah.\n";
        echo "   Di cPanel, username DB biasanya: cpanel_username + _ + db_username\n";
        echo "   Contoh: esaage_esaage\n";
    } else {
        echo "✅ Connection OK (no db)\n";
        $c1->close();

        // Test connection WITH db name
        $c2 = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        if ($c2->connect_error) {
            echo "❌ Database '" . DB_NAME . "' NOT FOUND: " . $c2->connect_error . "\n";
            echo "\n💡 Pastikan nama database benar.\n";
            echo "   Di cPanel, nama DB biasanya: cpanel_username + _ + db_name\n";
            echo "   Contoh: esaage_adek_cantik_bot\n";
        } else {
            echo "✅ Database connection OK!\n";
            $res = $c2->query("SHOW TABLES");
            echo "\nTables in database:\n";
            while ($row = $res->fetch_array()) {
                echo "  - " . $row[0] . "\n";
            }
            $c2->close();
        }
    }
    exit();
}

// API: GET unique JO IDs list (plain text) — for step3.1.js
if ($action === 'jo_ids') {
    header('Content-Type: text/plain; charset=utf-8');
    $db = getDB();
    $result = $db->query("SELECT DISTINCT jo_id FROM users ORDER BY id ASC");
    $ids = [];
    while ($row = $result->fetch_assoc()) {
        $ids[] = trim($row['jo_id']);
    }
    echo implode("\n", array_filter($ids));
    $db->close();
    exit();
}

// API: GET emails (plain text, one per line) — for step1.js & step3.js
if ($action === 'emails') {
    header('Content-Type: text/plain; charset=utf-8');
    $jo_id = trim($_GET['jo_id'] ?? '');
    $db = getDB();
    if ($jo_id !== '') {
        $stmt = $db->prepare("SELECT email FROM users WHERE jo_id = ? ORDER BY id ASC");
        $stmt->bind_param('s', $jo_id);
        $stmt->execute();
        $result = $stmt->get_result();
    } else {
        $result = $db->query("SELECT email FROM users ORDER BY id ASC");
    }
    $emails = [];
    while ($row = $result->fetch_assoc()) {
        // each email field may contain multiple lines
        $lines = array_filter(array_map('trim', explode("\n", $row['email'])));
        foreach ($lines as $line) {
            if (filter_var($line, FILTER_VALIDATE_EMAIL)) {
                $emails[] = $line;
            }
        }
    }
    echo implode("\n", array_unique($emails));
    $db->close();
    exit();
}

// API: GET names (plain text, one per line) — for step2.js
if ($action === 'names') {
    header('Content-Type: text/plain; charset=utf-8');
    $jo_id = trim($_GET['jo_id'] ?? '');
    $db = getDB();
    if ($jo_id !== '') {
        $stmt = $db->prepare("SELECT name FROM users WHERE jo_id = ? ORDER BY id ASC");
        $stmt->bind_param('s', $jo_id);
        $stmt->execute();
        $result = $stmt->get_result();
    } else {
        $result = $db->query("SELECT name FROM users ORDER BY id ASC");
    }
    $names = [];
    while ($row = $result->fetch_assoc()) {
        $lines = array_filter(array_map('trim', explode("\n", $row['name'])));
        foreach ($lines as $line) {
            if ($line !== '') $names[] = $line;
        }
    }
    echo implode("\n", $names);
    $db->close();
    exit();
}

// API: GET all data as JSON
if ($action === 'data') {
    header('Content-Type: application/json; charset=utf-8');
    $db = getDB();
    $result = $db->query("SELECT jo_id, name, email, created_at FROM users ORDER BY created_at DESC, id DESC");
    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
    echo json_encode(['success' => true, 'data' => $rows]);
    $db->close();
    exit();
}

// ─────────────────────────────────────────
// HANDLE FORM SAVE (POST)
// ─────────────────────────────────────────
$saveMessage = '';
$saveStatus  = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['save'])) {
    $db = getDB();

    // TRUNCATE all old data (replace all!)
    $db->query("TRUNCATE TABLE users");

    $sections = $_POST['sections'] ?? [];
    $inserted = 0;
    $errors   = [];

    foreach ($sections as $i => $section) {
        $jo_id = trim($section['jo_id'] ?? '');
        $names  = trim($section['name']  ?? '');
        $emails = trim($section['email'] ?? '');

        if ($jo_id === '' && $names === '' && $emails === '') continue;
        if ($jo_id === '') {
            $errors[] = "Section " . ($i + 1) . ": JO ID tidak boleh kosong.";
            continue;
        }

        $stmt = $db->prepare("INSERT INTO users (jo_id, name, email) VALUES (?, ?, ?)");
        $stmt->bind_param('sss', $jo_id, $names, $emails);
        if ($stmt->execute()) {
            $inserted++;
        } else {
            $errors[] = "Section " . ($i + 1) . ": Gagal menyimpan. " . $stmt->error;
        }
        $stmt->close();
    }

    $db->close();

    if (empty($errors)) {
        $saveStatus  = 'success';
        $saveMessage = "✨ Data berhasil disimpan! $inserted section tersimpan ke database.";
    } else {
        $saveStatus  = 'error';
        $saveMessage = implode('<br>', $errors);
        if ($inserted > 0) $saveMessage .= "<br>($inserted section berhasil, " . count($errors) . " gagal)";
    }
}

// ─────────────────────────────────────────
// FETCH EXISTING DATA (for pre-fill)
// ─────────────────────────────────────────
$existingData = [];
try {
    $db = getDB();
    $result = $db->query("SELECT jo_id, name, email FROM users ORDER BY id ASC");
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $existingData[] = $row;
        }
    }
    $db->close();
} catch (Exception $e) {
    // silent — first run DB might not exist yet
}

?>
<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ADEK CANTIK BOT 🌸</title>
    <meta name="description" content="Portal input data rekrutmen JO ID, nama, dan email untuk bot otomatis">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

    <style>
        /* ─── DESIGN TOKENS ─────────────────────── */
        :root {
            --pink-50: #FFF5F7;
            --pink-100: #FFE4EC;
            --pink-200: #FFC9D8;
            --pink-300: #FFA3BE;
            --pink-400: #FF7AA2;
            --pink-500: #F45B82;
            --pink-600: #E03A65;

            --peach-100: #FFF0E6;
            --peach-200: #FFD9C0;
            --peach-300: #FFBC96;
            --peach-400: #FF9C6E;
            --peach-500: #F07848;

            --rose-soft: #FDE8EF;
            --rose-mid: #FAB8CB;
            --rose-deep: #C9517A;

            --text-dark: #2D1B28;
            --text-mid: #6B3A52;
            --text-soft: #A06880;
            --text-light: #C4A0B2;

            --bg-main: #FFF8FA;
            --bg-card: #FFFFFF;
            --bg-glass: rgba(255, 255, 255, 0.72);

            --shadow-sm: 0 2px 8px rgba(200, 80, 120, 0.10);
            --shadow-md: 0 6px 24px rgba(200, 80, 120, 0.14);
            --shadow-lg: 0 16px 48px rgba(200, 80, 120, 0.18);

            --radius-sm: 10px;
            --radius-md: 16px;
            --radius-lg: 24px;
            --radius-xl: 32px;

            --transition: 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* ─── RESET & BASE ──────────────────────── */
        *,
        *::before,
        *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        html {
            scroll-behavior: smooth;
        }

        body {
            font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
            background: var(--bg-main);
            background-image:
                radial-gradient(ellipse 80% 50% at 20% -10%, rgba(255, 160, 190, 0.25) 0%, transparent 60%),
                radial-gradient(ellipse 60% 40% at 80% 110%, rgba(255, 188, 150, 0.18) 0%, transparent 60%);
            min-height: 100vh;
            color: var(--text-dark);
            padding: 0 0 60px;
        }

        /* ─── HEADER ────────────────────────────── */
        .header {
            position: relative;
            text-align: center;
            padding: 48px 24px 36px;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(255, 186, 215, 0.35) 0%, rgba(255, 208, 176, 0.20) 100%);
            z-index: 0;
        }

        .header-inner {
            position: relative;
            z-index: 1;
        }

        .header-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: var(--rose-soft);
            color: var(--rose-deep);
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            padding: 5px 14px;
            border-radius: 100px;
            margin-bottom: 16px;
            border: 1px solid var(--rose-mid);
        }

        .header h1 {
            font-size: clamp(26px, 5vw, 44px);
            font-weight: 800;
            background: linear-gradient(135deg, var(--pink-600) 0%, var(--peach-500) 60%, var(--pink-400) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: -0.02em;
            line-height: 1.15;
            margin-bottom: 10px;
        }

        .header-sub {
            color: var(--text-soft);
            font-size: 14px;
            font-weight: 400;
        }

        /* Floating petals */
        .petal {
            position: absolute;
            border-radius: 50% 0 50% 0;
            opacity: 0.18;
            animation: float 6s ease-in-out infinite;
        }

        .petal-1 {
            width: 60px;
            height: 60px;
            background: var(--pink-400);
            top: 20px;
            left: 8%;
            animation-delay: 0s;
        }

        .petal-2 {
            width: 36px;
            height: 36px;
            background: var(--peach-400);
            top: 60px;
            right: 12%;
            animation-delay: 1.2s;
        }

        .petal-3 {
            width: 48px;
            height: 48px;
            background: var(--pink-300);
            top: 10px;
            right: 30%;
            animation-delay: 0.6s;
        }

        .petal-4 {
            width: 28px;
            height: 28px;
            background: var(--peach-300);
            top: 80px;
            left: 25%;
            animation-delay: 2s;
        }

        @keyframes float {

            0%,
            100% {
                transform: translateY(0) rotate(0deg);
            }

            50% {
                transform: translateY(-12px) rotate(8deg);
            }
        }

        /* ─── MAIN CONTAINER ────────────────────── */
        .container {
            max-width: 680px;
            margin: 0 auto;
            padding: 0 20px;
        }

        /* ─── ALERT / TOAST ─────────────────────── */
        .alert {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 16px 20px;
            border-radius: var(--radius-md);
            margin-bottom: 24px;
            font-size: 14px;
            font-weight: 500;
            animation: slideDown 0.4s ease;
        }

        .alert.success {
            background: linear-gradient(135deg, #E8F8F0, #D4F5E4);
            color: #1A6B3C;
            border: 1px solid #A8E6C0;
        }

        .alert.error {
            background: linear-gradient(135deg, #FFF0F0, #FFE0E0);
            color: #8B2020;
            border: 1px solid #FFBBBB;
        }

        .alert-icon {
            font-size: 20px;
            flex-shrink: 0;
        }

        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-12px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* ─── SECTION CARD ──────────────────────── */
        #sections-wrapper {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .section-card {
            background: var(--bg-card);
            border: 1.5px solid var(--pink-100);
            border-radius: var(--radius-lg);
            padding: 28px 28px 20px;
            box-shadow: var(--shadow-sm);
            position: relative;
            animation: cardIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
            transition: box-shadow var(--transition), border-color var(--transition);
        }

        .section-card:hover {
            box-shadow: var(--shadow-md);
            border-color: var(--pink-200);
        }

        @keyframes cardIn {
            from {
                opacity: 0;
                transform: scale(0.96) translateY(12px);
            }

            to {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }

        /* Section number badge */
        .section-num {
            position: absolute;
            top: -12px;
            left: 24px;
            background: linear-gradient(135deg, var(--pink-500), var(--peach-400));
            color: white;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            padding: 4px 12px;
            border-radius: 100px;
            box-shadow: 0 2px 8px rgba(244, 91, 130, 0.35);
        }

        /* Remove button */
        .btn-remove {
            position: absolute;
            top: 16px;
            right: 20px;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 1.5px solid var(--pink-200);
            background: var(--pink-50);
            color: var(--pink-400);
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all var(--transition);
            line-height: 1;
        }

        .btn-remove:hover {
            background: var(--pink-400);
            color: white;
            border-color: var(--pink-400);
            transform: scale(1.1);
        }

        /* ─── FIELD GROUPS ──────────────────────── */
        .field-group {
            margin-bottom: 18px;
        }

        .field-label {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.07em;
            text-transform: uppercase;
            color: var(--text-mid);
            margin-bottom: 8px;
        }

        .field-label .label-icon {
            font-size: 14px;
        }

        /* JO_ID input */
        .input-jo {
            width: 100%;
            padding: 12px 16px;
            border: 1.5px solid var(--pink-100);
            border-radius: var(--radius-sm);
            background: var(--pink-50);
            font-family: inherit;
            font-size: 15px;
            font-weight: 600;
            color: var(--text-dark);
            letter-spacing: 0.04em;
            transition: all var(--transition);
            outline: none;
        }

        .input-jo::placeholder {
            color: var(--text-light);
            font-weight: 400;
            letter-spacing: 0;
        }

        .input-jo:focus {
            border-color: var(--pink-400);
            background: #FFFFFF;
            box-shadow: 0 0 0 4px rgba(255, 122, 162, 0.12);
        }

        /* Textarea */
        .textarea-field {
            width: 100%;
            padding: 12px 16px;
            border: 1.5px solid var(--pink-100);
            border-radius: var(--radius-sm);
            background: #FAFAFA;
            font-family: inherit;
            font-size: 14px;
            color: var(--text-dark);
            resize: vertical;
            min-height: 100px;
            line-height: 1.6;
            transition: all var(--transition);
            outline: none;
        }

        .textarea-field::placeholder {
            color: var(--text-light);
        }

        .textarea-field:focus {
            border-color: var(--pink-400);
            background: #FFFFFF;
            box-shadow: 0 0 0 4px rgba(255, 122, 162, 0.10);
        }

        .field-hint {
            margin-top: 5px;
            font-size: 11px;
            color: var(--text-light);
            font-style: italic;
        }

        /* ─── PLUS BUTTON ROW ───────────────────── */
        .plus-row {
            display: flex;
            justify-content: flex-end;
            margin-top: 4px;
        }

        .btn-plus {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 9px 18px;
            border: 1.5px dashed var(--pink-300);
            border-radius: 100px;
            background: transparent;
            color: var(--pink-500);
            font-family: inherit;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all var(--transition);
        }

        .btn-plus:hover {
            background: var(--pink-100);
            border-color: var(--pink-400);
            color: var(--pink-600);
            transform: translateY(-1px);
            box-shadow: var(--shadow-sm);
        }

        .btn-plus .plus-icon {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--pink-500), var(--peach-400));
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: 300;
            line-height: 1;
            flex-shrink: 0;
            box-shadow: 0 2px 6px rgba(244, 91, 130, 0.4);
            transition: transform var(--transition);
        }

        .btn-plus:hover .plus-icon {
            transform: rotate(90deg) scale(1.1);
        }

        /* ─── SAVE BUTTON ───────────────────────── */
        .save-section {
            margin-top: 32px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
        }

        .btn-save {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            width: 100%;
            max-width: 320px;
            padding: 17px 32px;
            border: none;
            border-radius: var(--radius-xl);
            background: linear-gradient(135deg, var(--pink-500) 0%, var(--peach-400) 100%);
            color: white;
            font-family: inherit;
            font-size: 16px;
            font-weight: 700;
            letter-spacing: 0.01em;
            cursor: pointer;
            box-shadow: 0 6px 24px rgba(244, 91, 130, 0.38);
            transition: all var(--transition);
            position: relative;
            overflow: hidden;
        }

        .btn-save::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, transparent 60%);
            pointer-events: none;
        }

        .btn-save:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 32px rgba(244, 91, 130, 0.48);
            filter: brightness(1.06);
        }

        .btn-save:active {
            transform: translateY(0);
            box-shadow: 0 4px 16px rgba(244, 91, 130, 0.35);
        }

        .btn-save .save-icon {
            font-size: 20px;
        }

        .save-warning {
            font-size: 11px;
            color: var(--text-soft);
            text-align: center;
        }

        .save-warning strong {
            color: var(--pink-600);
        }

        /* ─── API INFO CARD ─────────────────────── */
        .api-card {
            margin-top: 40px;
            background: linear-gradient(135deg, rgba(255, 229, 238, 0.6), rgba(255, 220, 200, 0.4));
            border: 1px solid var(--pink-200);
            border-radius: var(--radius-lg);
            padding: 24px 28px;
            backdrop-filter: blur(8px);
        }

        .api-card h3 {
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--rose-deep);
            margin-bottom: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .api-endpoint {
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(255, 255, 255, 0.7);
            border: 1px solid var(--pink-100);
            border-radius: var(--radius-sm);
            padding: 9px 14px;
            margin-bottom: 8px;
            font-size: 12px;
            transition: all var(--transition);
            cursor: pointer;
        }

        .api-endpoint:hover {
            background: white;
            box-shadow: var(--shadow-sm);
        }

        .api-method {
            background: var(--pink-500);
            color: white;
            font-size: 10px;
            font-weight: 700;
            padding: 2px 7px;
            border-radius: 4px;
            flex-shrink: 0;
        }

        .api-url {
            font-family: 'Courier New', monospace;
            color: var(--text-mid);
            font-size: 12px;
            word-break: break-all;
        }

        .api-desc {
            margin-left: auto;
            font-size: 11px;
            color: var(--text-soft);
            white-space: nowrap;
            padding-left: 8px;
        }

        /* ─── FOOTER ────────────────────────────── */
        .footer {
            text-align: center;
            margin-top: 48px;
            padding: 20px;
            color: var(--text-light);
            font-size: 12px;
        }

        .footer span {
            color: var(--pink-400);
        }

        /* ─── LOADING OVERLAY ───────────────────── */
        .loading-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(255, 245, 250, 0.88);
            backdrop-filter: blur(6px);
            z-index: 9999;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
        }

        .loading-overlay.show {
            display: flex;
        }

        .spinner {
            width: 48px;
            height: 48px;
            border: 4px solid var(--pink-100);
            border-top-color: var(--pink-500);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }

        .loading-text {
            color: var(--text-mid);
            font-weight: 600;
            font-size: 15px;
        }

        /* ─── RESPONSIVE ────────────────────────── */
        @media (max-width: 480px) {
            .section-card {
                padding: 24px 18px 18px;
            }

            .api-card {
                padding: 20px 18px;
            }

            .api-desc {
                display: none;
            }
        }
    </style>
</head>

<body>

    <!-- Loading Overlay -->
    <div class="loading-overlay" id="loadingOverlay">
        <div class="spinner"></div>
        <div class="loading-text">Menyimpan data... 🌸</div>
    </div>

    <!-- ═══ HEADER ═══════════════════════════════════════ -->
    <header class="header">
        <div class="petal petal-1"></div>
        <div class="petal petal-2"></div>
        <div class="petal petal-3"></div>
        <div class="petal petal-4"></div>
        <div class="header-inner">
            <div class="header-badge">🌸 Recruitment Portal</div>
            <h1>ADEK CANTIK BOT</h1>
            <p class="header-sub">Input data JO ID, nama & email untuk bot rekrutmen otomatis ✨</p>
        </div>
    </header>

    <!-- ═══ MAIN CONTENT ══════════════════════════════════ -->
    <main class="container">

        <!-- Alert Message -->
        <?php if ($saveMessage): ?>
            <div class="alert <?= $saveStatus ?>" id="alertMsg">
                <span class="alert-icon"><?= $saveStatus === 'success' ? '✅' : '⚠️' ?></span>
                <span><?= $saveMessage ?></span>
            </div>
        <?php endif; ?>

        <!-- ═══ FORM ══════════════════════════════════════ -->
        <form id="mainForm" method="POST" action="" style="margin-top: 30px">

            <!-- Sections Container -->
            <div id="sections-wrapper">
                <?php
                // Pre-fill with existing data or show 1 empty section
                $renderSections = !empty($existingData) ? $existingData : [['jo_id' => '', 'name' => '', 'email' => '']];
                foreach ($renderSections as $i => $sec):
                    $jo   = htmlspecialchars($sec['jo_id'] ?? '');
                    $name = htmlspecialchars($sec['name']  ?? '');
                    $mail = htmlspecialchars($sec['email'] ?? '');
                ?>
                    <div class="section-card" id="section-<?= $i ?>">
                        <div class="section-num">Bagian <?= $i + 1 ?></div>
                        <?php if ($i > 0): ?>
                            <button type="button" class="btn-remove" onclick="removeSection(this)" title="Hapus bagian ini">×</button>
                        <?php endif; ?>

                        <!-- JO_ID -->
                        <div class="field-group">
                            <label class="field-label">
                                <span class="label-icon">🏷️</span> JO ID
                            </label>
                            <input
                                type="text"
                                class="input-jo"
                                name="sections[<?= $i ?>][jo_id]"
                                placeholder="Masukkan JO ID (contoh: JO-2024-001)"
                                value="<?= $jo ?>"
                                id="jo_id_<?= $i ?>">
                        </div>

                        <!-- NAME -->
                        <div class="field-group">
                            <label class="field-label">
                                <span class="label-icon">👤</span> Nama
                            </label>
                            <textarea
                                class="textarea-field"
                                name="sections[<?= $i ?>][name]"
                                placeholder="Masukkan nama kandidat&#10;(satu nama per baris)"
                                id="name_<?= $i ?>"
                                rows="4"><?= $name ?></textarea>
                            <p class="field-hint">💡 Satu nama per baris, akan disimpan & digunakan step2.js</p>
                        </div>

                        <!-- EMAIL -->
                        <div class="field-group" style="margin-bottom: 8px;">
                            <label class="field-label">
                                <span class="label-icon">✉️</span> Email
                            </label>
                            <textarea
                                class="textarea-field"
                                name="sections[<?= $i ?>][email]"
                                placeholder="Masukkan email kandidat&#10;(satu email per baris)&#10;contoh@email.com"
                                id="email_<?= $i ?>"
                                rows="4"><?= $mail ?></textarea>
                            <p class="field-hint">💡 Satu email per baris, akan digunakan step1.js & step3.js</p>
                        </div>

                        <!-- Plus Button -->
                        <div class="plus-row">
                            <button type="button" class="btn-plus" onclick="addSection(<?= $i ?>)">
                                <span class="plus-icon">+</span>
                                Tambah Bagian Baru
                            </button>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>

            <!-- Save Button -->
            <div class="save-section">
                <button type="submit" name="save" class="btn-save" id="saveBtn" onclick="showLoading()">
                    <span class="save-icon">💾</span>
                    Simpan ke Database
                </button>
                <p class="save-warning">
                    ⚠️ <strong>Perhatian:</strong> Menyimpan akan <strong>menghapus semua data lama</strong> dan menggantinya dengan data baru.
                </p>
            </div>

        </form>

    </main>

    <!-- ═══ FOOTER ════════════════════════════════════════ -->
    <footer class="footer">
        Made with <span>♥</span> by Amaz for Adek Cantik 🌸 &nbsp;|&nbsp; Auto Set Brief System
    </footer>

    <script>
        let sectionCount = <?= count($renderSections) ?>;

        // ── ADD SECTION ──────────────────────────────────
        function addSection(afterIndex) {
            const wrapper = document.getElementById('sections-wrapper');
            const idx = sectionCount++;

            const card = document.createElement('div');
            card.className = 'section-card';
            card.id = 'section-' + idx;
            card.innerHTML = `
            <div class="section-num">Bagian ${idx + 1}</div>
            <button type="button" class="btn-remove" onclick="removeSection(this)" title="Hapus bagian ini">×</button>

            <div class="field-group">
                <label class="field-label"><span class="label-icon">🏷️</span> JO ID</label>
                <input type="text" class="input-jo" name="sections[${idx}][jo_id]"
                    placeholder="Masukkan JO ID (contoh: JO2605002123)" id="jo_id_${idx}">
            </div>

            <div class="field-group">
                <label class="field-label"><span class="label-icon">👤</span> Nama</label>
                <textarea class="textarea-field" name="sections[${idx}][name]"
                    placeholder="Masukkan nama kandidat&#10;(satu nama per baris)"
                    id="name_${idx}" rows="4"></textarea>
                <p class="field-hint">💡 Satu nama per baris, akan disimpan & digunakan step2.js</p>
            </div>

            <div class="field-group" style="margin-bottom:8px;">
                <label class="field-label"><span class="label-icon">✉️</span> Email</label>
                <textarea class="textarea-field" name="sections[${idx}][email]"
                    placeholder="Masukkan email kandidat&#10;(satu email per baris)&#10;contoh@email.com"
                    id="email_${idx}" rows="4"></textarea>
                <p class="field-hint">💡 Satu email per baris, akan digunakan step1.js & step3.js</p>
            </div>

            <div class="plus-row">
                <button type="button" class="btn-plus" onclick="addSection(${idx})">
                    <span class="plus-icon">+</span>
                    Tambah Bagian Baru
                </button>
            </div>
        `;

            // Insert after the "afterIndex" card
            const afterCard = document.getElementById('section-' + afterIndex);
            if (afterCard && afterCard.nextSibling) {
                wrapper.insertBefore(card, afterCard.nextSibling);
            } else {
                wrapper.appendChild(card);
            }

            // Scroll to new section
            setTimeout(() => card.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            }), 100);

            // Focus JO ID input
            setTimeout(() => card.querySelector('.input-jo')?.focus(), 350);

            updateSectionNumbers();
        }

        // ── REMOVE SECTION ───────────────────────────────
        function removeSection(btn) {
            const card = btn.closest('.section-card');
            card.style.transform = 'scale(0.95)';
            card.style.opacity = '0';
            card.style.transition = 'all 0.25s ease';
            setTimeout(() => {
                card.remove();
                updateSectionNumbers();
            }, 250);
        }

        // ── UPDATE NUMBERS ───────────────────────────────
        function updateSectionNumbers() {
            const cards = document.querySelectorAll('.section-card');
            cards.forEach((card, i) => {
                const badge = card.querySelector('.section-num');
                if (badge) badge.textContent = 'Bagian ' + (i + 1);
            });
        }

        // ── SHOW LOADING ─────────────────────────────────
        function showLoading() {
            const overlay = document.getElementById('loadingOverlay');
            // Brief timeout to let browser update before showing overlay
            setTimeout(() => overlay.classList.add('show'), 50);
        }

        // ── COPY URL ─────────────────────────────────────
        function copyUrl(path) {
            const fullUrl = window.location.href.split('?')[0] + path;
            navigator.clipboard.writeText(fullUrl).then(() => {
                showToast('URL disalin! ✨');
            }).catch(() => {
                prompt('Salin URL ini:', fullUrl);
            });
        }

        function showToast(msg) {
            const toast = document.createElement('div');
            toast.textContent = msg;
            toast.style.cssText = `
            position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
            background:linear-gradient(135deg,#F45B82,#FF9C6E); color:white;
            padding:10px 22px; border-radius:100px; font-size:13px; font-weight:600;
            box-shadow:0 6px 20px rgba(244,91,130,0.4); z-index:9999;
            animation:fadeInUp 0.3s ease;
        `;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2500);
        }

        // ── AUTO-HIDE ALERT ──────────────────────────────
        const alertEl = document.getElementById('alertMsg');
        if (alertEl) {
            setTimeout(() => {
                alertEl.style.transition = 'opacity 0.5s ease';
                alertEl.style.opacity = '0';
                setTimeout(() => alertEl.remove(), 500);
            }, 5000);
        }

        // Add keyframe for toast
        const style = document.createElement('style');
        style.textContent = `@keyframes fadeInUp { from{opacity:0;transform:translate(-50%,12px)} to{opacity:1;transform:translate(-50%,0)} }`;
        document.head.appendChild(style);
    </script>

</body>

</html>